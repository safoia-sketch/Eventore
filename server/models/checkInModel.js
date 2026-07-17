import pool from "../config/database.js";

function createCheckInError(
    message,
    status,
    resultCode
) {
    const error = new Error(message);

    error.status = status;
    error.resultCode = resultCode;

    return error;
}

/*
|--------------------------------------------------------------------------
| Events available for staff check-in
|--------------------------------------------------------------------------
*/

export const getCheckInEvents = async () => {
    const result = await pool.query(
        `
            SELECT
                event_id,
                event_name,
                event_date,
                start_time,
                end_time,
                venue_name,
                city,
                status

            FROM events

            WHERE status IN (
                'published',
                'sold_out'
            )
              AND event_date >= CURRENT_DATE

            ORDER BY
                event_date ASC,
                start_time ASC
        `
    );

    return result.rows;
};

/*
|--------------------------------------------------------------------------
| Validate and check in one ticket
|--------------------------------------------------------------------------
*/

export const validateAndCheckInTicket = async ({
    ticketCode,
    eventId,
    staffId
}) => {
    const normalizedTicketCode =
        String(ticketCode || "").trim();

    const normalizedEventId = Number(eventId);
    const normalizedStaffId = Number(staffId);

    if (!normalizedTicketCode) {
        throw createCheckInError(
            "Enter a ticket code.",
            400,
            "invalid"
        );
    }

    if (normalizedTicketCode.length > 150) {
        throw createCheckInError(
            "The ticket code is invalid.",
            400,
            "invalid"
        );
    }

    if (
        !Number.isInteger(normalizedEventId)
        || normalizedEventId <= 0
    ) {
        throw createCheckInError(
            "Select the event where check-in is taking place.",
            400,
            "invalid_event"
        );
    }

    if (
        !Number.isInteger(normalizedStaffId)
        || normalizedStaffId <= 0
    ) {
        throw createCheckInError(
            "The staff account is invalid.",
            401,
            "invalid_staff"
        );
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const staffResult = await client.query(
            `
                SELECT user_id
                FROM users
                WHERE user_id = $1
                  AND role = 'staff'
                  AND account_status = 'active'
                LIMIT 1
            `,
            [normalizedStaffId]
        );

        if (staffResult.rowCount === 0) {
            throw createCheckInError(
                "Only an active staff account can check in tickets.",
                403,
                "invalid_staff"
            );
        }

        /*
         * Lock the ticket so two staff requests cannot
         * successfully use the same ticket simultaneously.
         */
        const ticketResult = await client.query(
            `
                SELECT
                    t.ticket_id,
                    t.ticket_code,
                    t.ticket_status,

                    tt.ticket_name,

                    b.booking_id,
                    b.booking_reference,
                    b.status AS booking_status,

                    e.event_id,
                    e.event_name,
                    e.event_date,
                    e.start_time,
                    e.end_time,
                    e.venue_name,
                    e.city,
                    e.status AS event_status,

                    u.full_name AS attendee_name,
                    u.email AS attendee_email

                FROM tickets t

                INNER JOIN booking_items bi
                    ON bi.booking_item_id =
                       t.booking_item_id

                INNER JOIN ticket_types tt
                    ON tt.ticket_type_id =
                       bi.ticket_type_id

                INNER JOIN bookings b
                    ON b.booking_id =
                       bi.booking_id

                INNER JOIN events e
                    ON e.event_id = b.event_id

                INNER JOIN users u
                    ON u.user_id = t.attendee_id

                WHERE t.ticket_code = $1

                FOR UPDATE OF t
            `,
            [normalizedTicketCode]
        );

        if (ticketResult.rowCount === 0) {
            throw createCheckInError(
                "Ticket code not found.",
                404,
                "invalid"
            );
        }

        const ticket = ticketResult.rows[0];

        if (
            Number(ticket.event_id)
            !== normalizedEventId
        ) {
            throw createCheckInError(
                `This ticket belongs to ${ticket.event_name}, not the selected event.`,
                409,
                "wrong_event"
            );
        }

        if (ticket.event_status === "cancelled") {
            throw createCheckInError(
                "This event has been cancelled.",
                409,
                "cancelled"
            );
        }

        if (ticket.booking_status !== "confirmed") {
            throw createCheckInError(
                "The booking connected to this ticket is not confirmed.",
                409,
                "invalid_booking"
            );
        }

        if (ticket.ticket_status === "cancelled") {
            throw createCheckInError(
                "This ticket has been cancelled.",
                409,
                "cancelled"
            );
        }

        if (ticket.ticket_status === "used") {
            throw createCheckInError(
                "This ticket has already been checked in.",
                409,
                "already_used"
            );
        }

        if (ticket.ticket_status !== "active") {
            throw createCheckInError(
                "This ticket is not active.",
                409,
                "invalid"
            );
        }

        const checkInResult = await client.query(
            `
                INSERT INTO check_ins (
                    ticket_id,
                    event_id,
                    staff_id
                )
                VALUES ($1, $2, $3)
                RETURNING
                    check_in_id,
                    ticket_id,
                    event_id,
                    staff_id,
                    checked_in_at
            `,
            [
                ticket.ticket_id,
                normalizedEventId,
                normalizedStaffId
            ]
        );

        await client.query(
            `
                UPDATE tickets
                SET ticket_status = 'used'
                WHERE ticket_id = $1
            `,
            [ticket.ticket_id]
        );

        await client.query("COMMIT");

        return {
            result_code: "valid",
            message: "Ticket checked in successfully.",
            ticket: {
                ...ticket,
                ticket_status: "used"
            },
            check_in: checkInResult.rows[0]
        };
    } catch (error) {
        await client.query("ROLLBACK");

        if (error.code === "23505") {
            throw createCheckInError(
                "This ticket has already been checked in.",
                409,
                "already_used"
            );
        }

        throw error;
    } finally {
        client.release();
    }
};