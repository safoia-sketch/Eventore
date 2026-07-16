import { randomUUID } from "node:crypto";

import pool from "../config/database.js";

function createBookingError(message, status = 400) {
    const error = new Error(message);
    error.status = status;

    return error;
}

function createReference(prefix) {
    return `${prefix}-${randomUUID()}`;
}

function normalizeItems(items) {
    if (!Array.isArray(items) || items.length === 0) {
        throw createBookingError(
            "Select at least one ticket."
        );
    }

    const normalizedItems = items.map((item) => ({
        ticketTypeId: Number(item.ticket_type_id),
        quantity: Number(item.quantity)
    }));

    for (const item of normalizedItems) {
        if (
            !Number.isInteger(item.ticketTypeId)
            || item.ticketTypeId <= 0
        ) {
            throw createBookingError(
                "A selected ticket type is invalid."
            );
        }

        if (
            !Number.isInteger(item.quantity)
            || item.quantity <= 0
        ) {
            throw createBookingError(
                "Ticket quantities must be positive whole numbers."
            );
        }
    }

    const ticketTypeIds = normalizedItems.map(
        (item) => item.ticketTypeId
    );

    if (
        new Set(ticketTypeIds).size
        !== ticketTypeIds.length
    ) {
        throw createBookingError(
            "The same ticket type cannot appear more than once."
        );
    }

    return normalizedItems.sort(
        (firstItem, secondItem) =>
            firstItem.ticketTypeId
            - secondItem.ticketTypeId
    );
}

async function findExistingBooking(
    database,
    attendeeId,
    idempotencyKey
) {
    const result = await database.query(
        `
            SELECT
                booking_id,
                event_id,
                booking_reference,
                status,
                total_amount,
                created_at,
                confirmed_at
            FROM bookings
            WHERE attendee_id = $1
              AND idempotency_key = $2
            LIMIT 1
        `,
        [attendeeId, idempotencyKey]
    );

    return result.rows[0] || null;
}

export const createSafeBooking = async ({
    attendeeId,
    eventId,
    items,
    idempotencyKey,
    simulatedOutcome = "successful"
}) => {
    const normalizedAttendeeId = Number(attendeeId);
    const normalizedEventId = Number(eventId);

    if (
        !Number.isInteger(normalizedAttendeeId)
        || normalizedAttendeeId <= 0
    ) {
        throw createBookingError(
            "The attendee account is invalid.",
            401
        );
    }

    if (
        !Number.isInteger(normalizedEventId)
        || normalizedEventId <= 0
    ) {
        throw createBookingError(
            "The event ID is invalid."
        );
    }

    if (
        typeof idempotencyKey !== "string"
        || idempotencyKey.trim().length < 10
        || idempotencyKey.trim().length > 100
    ) {
        throw createBookingError(
            "A valid checkout request key is required."
        );
    }

    if (
        !["successful", "failed"].includes(
            simulatedOutcome
        )
    ) {
        throw createBookingError(
            "The simulated payment outcome is invalid."
        );
    }

    const normalizedItems = normalizeItems(items);
    const normalizedKey = idempotencyKey.trim();

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const attendeeResult = await client.query(
            `
                SELECT user_id
                FROM users
                WHERE user_id = $1
                  AND role = 'attendee'
                  AND account_status = 'active'
                LIMIT 1
            `,
            [normalizedAttendeeId]
        );

        if (attendeeResult.rowCount === 0) {
            throw createBookingError(
                "Only an active attendee can create a booking.",
                403
            );
        }

        const existingBooking =
            await findExistingBooking(
                client,
                normalizedAttendeeId,
                normalizedKey
            );

        if (existingBooking) {
            await client.query("COMMIT");

            return {
                booking: existingBooking,
                duplicate: true,
                payment_status:
                    existingBooking.status === "confirmed"
                        ? "successful"
                        : "failed"
            };
        }

        const eventResult = await client.query(
            `
                SELECT
                    event_id,
                    event_name,
                    status,
                    event_date,
                    start_time
                FROM events
                WHERE event_id = $1
                FOR SHARE
            `,
            [normalizedEventId]
        );

        if (eventResult.rowCount === 0) {
            throw createBookingError(
                "Event not found.",
                404
            );
        }

        const event = eventResult.rows[0];

        if (event.status !== "published") {
            throw createBookingError(
                "This event is not available for booking."
            );
        }

        const eventStartResult = await client.query(
            `
                SELECT
                    ($1::date + $2::time) > NOW()
                    AS event_is_future
            `,
            [event.event_date, event.start_time]
        );

        if (
            !eventStartResult.rows[0].event_is_future
        ) {
            throw createBookingError(
                "Bookings are closed because this event has started or finished."
            );
        }

        const ticketTypeIds = normalizedItems.map(
            (item) => item.ticketTypeId
        );

        /*
         * Rows are locked in a consistent ID order.
         * A second booking for the same inventory must wait
         * until this transaction commits or rolls back.
         */
        const ticketResult = await client.query(
            `
                SELECT
                    ticket_type_id,
                    event_id,
                    ticket_name,
                    price,
                    quantity_remaining,
                    maximum_per_customer,
                    sale_start,
                    sale_end,
                    (
                        sale_start IS NULL
                        OR sale_start <= NOW()
                    ) AS sale_has_started,
                    (
                        sale_end IS NULL
                        OR sale_end >= NOW()
                    ) AS sale_has_not_ended
                FROM ticket_types
                WHERE event_id = $1
                  AND ticket_type_id = ANY($2::int[])
                ORDER BY ticket_type_id
                FOR UPDATE
            `,
            [normalizedEventId, ticketTypeIds]
        );

        if (
            ticketResult.rowCount
            !== normalizedItems.length
        ) {
            throw createBookingError(
                "One or more selected ticket types do not belong to this event."
            );
        }

        const ticketById = new Map(
            ticketResult.rows.map((ticket) => [
                Number(ticket.ticket_type_id),
                ticket
            ])
        );

        let totalAmount = 0;
        const calculatedItems = [];

        for (const requestedItem of normalizedItems) {
            const ticket = ticketById.get(
                requestedItem.ticketTypeId
            );

            if (
                !ticket.sale_has_started
                || !ticket.sale_has_not_ended
            ) {
                throw createBookingError(
                    `Ticket sales are not open for ${ticket.ticket_name}.`
                );
            }

            if (
                requestedItem.quantity
                > Number(ticket.quantity_remaining)
            ) {
                throw createBookingError(
                    `Only ${ticket.quantity_remaining} ${ticket.ticket_name} ticket(s) remain.`
                );
            }

            /*
             * This checks tickets already confirmed for this
             * attendee, so the customer maximum cannot be
             * bypassed with several bookings.
             */
            const previousQuantityResult =
                await client.query(
                    `
                        SELECT
                            COALESCE(
                                SUM(booking_items.quantity),
                                0
                            )::integer AS purchased_quantity
                        FROM booking_items
                        INNER JOIN bookings
                            ON bookings.booking_id =
                               booking_items.booking_id
                        WHERE bookings.attendee_id = $1
                          AND bookings.event_id = $2
                          AND bookings.status = 'confirmed'
                          AND booking_items.ticket_type_id = $3
                    `,
                    [
                        normalizedAttendeeId,
                        normalizedEventId,
                        ticket.ticket_type_id
                    ]
                );

            const purchasedQuantity = Number(
                previousQuantityResult.rows[0]
                    .purchased_quantity
            );

            if (
                purchasedQuantity
                    + requestedItem.quantity
                > Number(ticket.maximum_per_customer)
            ) {
                const remainingAllowance = Math.max(
                    0,
                    Number(
                        ticket.maximum_per_customer
                    ) - purchasedQuantity
                );

                throw createBookingError(
                    `You may purchase only ${remainingAllowance} more ${ticket.ticket_name} ticket(s).`
                );
            }

            const unitPrice = Number(ticket.price);
            const subtotal =
                unitPrice * requestedItem.quantity;

            totalAmount += subtotal;

            calculatedItems.push({
                ticketTypeId:
                    Number(ticket.ticket_type_id),
                ticketName: ticket.ticket_name,
                quantity: requestedItem.quantity,
                unitPrice: unitPrice.toFixed(2),
                subtotal: subtotal.toFixed(2)
            });
        }

        totalAmount = Number(totalAmount.toFixed(2));

        const bookingReference =
            createReference("EVB");

        /*
         * Free bookings always succeed.
         * Paid bookings use the requested simulated outcome.
         */
        const paymentSuccessful =
            totalAmount === 0
            || simulatedOutcome === "successful";

        const bookingStatus = paymentSuccessful
            ? "confirmed"
            : "failed";

        const bookingResult = await client.query(
            `
                INSERT INTO bookings (
                    attendee_id,
                    event_id,
                    booking_reference,
                    idempotency_key,
                    status,
                    total_amount,
                    confirmed_at
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5::VARCHAR(20),
                    $6,
                    CASE
                        WHEN $5 = 'confirmed'
                        THEN CURRENT_TIMESTAMP
                        ELSE NULL
                    END
                )
                RETURNING
                    booking_id,
                    attendee_id,
                    event_id,
                    booking_reference,
                    status,
                    total_amount,
                    created_at,
                    confirmed_at
            `,
            [
                normalizedAttendeeId,
                normalizedEventId,
                bookingReference,
                normalizedKey,
                bookingStatus,
                totalAmount.toFixed(2)
            ]
        );

        const booking = bookingResult.rows[0];
        const createdItems = [];

        for (const item of calculatedItems) {
            const bookingItemResult =
                await client.query(
                    `
                        INSERT INTO booking_items (
                            booking_id,
                            ticket_type_id,
                            quantity,
                            unit_price,
                            subtotal
                        )
                        VALUES ($1, $2, $3, $4, $5)
                        RETURNING
                            booking_item_id,
                            ticket_type_id,
                            quantity,
                            unit_price,
                            subtotal
                    `,
                    [
                        booking.booking_id,
                        item.ticketTypeId,
                        item.quantity,
                        item.unitPrice,
                        item.subtotal
                    ]
                );

            createdItems.push({
                ...bookingItemResult.rows[0],
                ticket_name: item.ticketName
            });
        }

        const paymentMethod =
            totalAmount === 0
                ? "free"
                : "test_payment";

        const paymentStatus = paymentSuccessful
            ? "successful"
            : "failed";

        const transactionReference =
            createReference("EVP");

        await client.query(
            `
                INSERT INTO payments (
                    booking_id,
                    payment_method,
                    amount,
                    payment_status,
                    transaction_reference
                )
                VALUES ($1, $2, $3, $4, $5)
            `,
            [
                booking.booking_id,
                paymentMethod,
                totalAmount.toFixed(2),
                paymentStatus,
                transactionReference
            ]
        );

        const createdTickets = [];

        if (paymentSuccessful) {
            for (const item of createdItems) {
                const inventoryResult =
                    await client.query(
                        `
                            UPDATE ticket_types
                            SET quantity_remaining =
                                quantity_remaining - $1
                            WHERE ticket_type_id = $2
                              AND quantity_remaining >= $1
                            RETURNING quantity_remaining
                        `,
                        [
                            item.quantity,
                            item.ticket_type_id
                        ]
                    );

                if (inventoryResult.rowCount === 0) {
                    throw createBookingError(
                        "Ticket availability changed. Please try again.",
                        409
                    );
                }

                for (
                    let ticketNumber = 0;
                    ticketNumber < item.quantity;
                    ticketNumber += 1
                ) {
                    const ticketCode =
                        createReference("EVT");

                    /*
                     * QR data contains only an unguessable
                     * ticket reference, not personal details.
                     */
                    const qrData = ticketCode;

                    const digitalTicketResult =
                        await client.query(
                            `
                                INSERT INTO tickets (
                                    booking_item_id,
                                    attendee_id,
                                    ticket_code,
                                    qr_data,
                                    ticket_status
                                )
                                VALUES ($1, $2, $3, $4, 'active')
                                RETURNING
                                    ticket_id,
                                    booking_item_id,
                                    ticket_code,
                                    qr_data,
                                    ticket_status,
                                    created_at
                            `,
                            [
                                item.booking_item_id,
                                normalizedAttendeeId,
                                ticketCode,
                                qrData
                            ]
                        );

                    createdTickets.push(
                        digitalTicketResult.rows[0]
                    );
                }
            }

            /*
             * Mark the event sold out only when every ticket
             * type has zero remaining inventory.
             */
            await client.query(
                `
                    UPDATE events
                    SET
                        status = 'sold_out',
                        updated_at = CURRENT_TIMESTAMP
                    WHERE event_id = $1
                      AND NOT EXISTS (
                          SELECT 1
                          FROM ticket_types
                          WHERE event_id = $1
                            AND quantity_remaining > 0
                      )
                `,
                [normalizedEventId]
            );
        }

        await client.query("COMMIT");

        return {
            booking,
            booking_items: createdItems,
            tickets: createdTickets,
            payment_status: paymentStatus,
            duplicate: false
        };
    } catch (error) {
        await client.query("ROLLBACK");

        /*
         * If two identical requests arrive simultaneously,
         * the unique idempotency index allows only one insert.
         * After rollback, return the booking created by the
         * winning request.
         */
        if (error.code === "23505") {
            const existingBooking =
                await findExistingBooking(
                    pool,
                    normalizedAttendeeId,
                    normalizedKey
                );

            if (existingBooking) {
                return {
                    booking: existingBooking,
                    duplicate: true,
                    payment_status:
                        existingBooking.status ===
                        "confirmed"
                            ? "successful"
                            : "failed"
                };
            }
        }

        throw error;
    } finally {
        client.release();
    }
};
export const getOwnedBookingById = async (
    bookingId,
    attendeeId
) => {
    const normalizedBookingId = Number(bookingId);
    const normalizedAttendeeId = Number(attendeeId);

    if (
        !Number.isInteger(normalizedBookingId)
        || normalizedBookingId <= 0
    ) {
        throw createBookingError(
            "Invalid booking ID."
        );
    }

    const bookingResult = await pool.query(
        `
            SELECT
                b.booking_id,
                b.booking_reference,
                b.status,
                b.total_amount,
                b.created_at,
                b.confirmed_at,

                e.event_id,
                e.event_name,
                e.event_date,
                e.start_time,
                e.end_time,
                e.venue_name,
                e.address,
                e.city,

                u.full_name AS attendee_name,
                u.email AS attendee_email,

                p.payment_method,
                p.payment_status,
                p.transaction_reference

            FROM bookings b

            INNER JOIN events e
                ON e.event_id = b.event_id

            INNER JOIN users u
                ON u.user_id = b.attendee_id

            LEFT JOIN payments p
                ON p.booking_id = b.booking_id

            WHERE b.booking_id = $1
              AND b.attendee_id = $2

            LIMIT 1
        `,
        [
            normalizedBookingId,
            normalizedAttendeeId
        ]
    );

    if (bookingResult.rowCount === 0) {
        return null;
    }

    const itemsResult = await pool.query(
        `
            SELECT
                bi.booking_item_id,
                bi.ticket_type_id,
                tt.ticket_name,
                bi.quantity,
                bi.unit_price,
                bi.subtotal

            FROM booking_items bi

            INNER JOIN ticket_types tt
                ON tt.ticket_type_id =
                   bi.ticket_type_id

            WHERE bi.booking_id = $1

            ORDER BY bi.booking_item_id
        `,
        [normalizedBookingId]
    );

    const ticketsResult = await pool.query(
        `
            SELECT
                t.ticket_id,
                t.booking_item_id,
                tt.ticket_name,
                t.ticket_code,
                t.qr_data,
                t.ticket_status,
                t.created_at

            FROM tickets t

            INNER JOIN booking_items bi
                ON bi.booking_item_id =
                   t.booking_item_id

            INNER JOIN ticket_types tt
                ON tt.ticket_type_id =
                   bi.ticket_type_id

            WHERE bi.booking_id = $1
              AND t.attendee_id = $2

            ORDER BY t.ticket_id
        `,
        [
            normalizedBookingId,
            normalizedAttendeeId
        ]
    );

    return {
        booking: bookingResult.rows[0],
        booking_items: itemsResult.rows,
        tickets: ticketsResult.rows
    };
};
export const getBookingsForAttendee = async (
    attendeeId
) => {
    const normalizedAttendeeId =
        Number(attendeeId);

    if (
        !Number.isInteger(normalizedAttendeeId)
        || normalizedAttendeeId <= 0
    ) {
        throw createBookingError(
            "Invalid attendee account.",
            401
        );
    }

    const result = await pool.query(
        `
            SELECT
                b.booking_id,
                b.booking_reference,
                b.status,
                b.total_amount,
                b.created_at,
                b.confirmed_at,

                e.event_id,
                e.event_name,
                e.event_date,
                e.start_time,
                e.venue_name,
                e.city,
                e.image_url,

                p.payment_method,
                p.payment_status,

                COALESCE(
                    SUM(bi.quantity),
                    0
                )::integer AS ticket_count

            FROM bookings b

            INNER JOIN events e
                ON e.event_id = b.event_id

            LEFT JOIN payments p
                ON p.booking_id = b.booking_id

            LEFT JOIN booking_items bi
                ON bi.booking_id = b.booking_id

            WHERE b.attendee_id = $1

            GROUP BY
                b.booking_id,
                e.event_id,
                p.payment_id

            ORDER BY b.created_at DESC
        `,
        [normalizedAttendeeId]
    );

    return result.rows;
};