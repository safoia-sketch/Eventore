import pool from "../config/database.js";

const createModelError = (code, message) => {
    const error = new Error(message);
    error.code = code;

    return error;
};


/*
|--------------------------------------------------------------------------
| Get ticket types for an owned event
|--------------------------------------------------------------------------
*/

export const getTicketTypesByOwnedEvent = async (
    eventId,
    organiserId
) => {
    const eventResult = await pool.query(
        `
        SELECT
            event_id,
            event_name,
            capacity,
            status
        FROM events
        WHERE event_id = $1
          AND organiser_id = $2
        LIMIT 1
        `,
        [eventId, organiserId]
    );

    if (eventResult.rowCount === 0) {
        return null;
    }

    const ticketResult = await pool.query(
        `
        SELECT *
        FROM ticket_types
        WHERE event_id = $1
        ORDER BY price ASC, created_at ASC
        `,
        [eventId]
    );

    return {
        event: eventResult.rows[0],
        ticket_types: ticketResult.rows
    };
};


/*
|--------------------------------------------------------------------------
| Create ticket type
|--------------------------------------------------------------------------
| The event is locked while capacity is checked.
|--------------------------------------------------------------------------
*/

export const createTicketType = async (
    eventId,
    organiserId,
    ticketData
) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const eventResult = await client.query(
            `
            SELECT
                event_id,
                capacity,
                status
            FROM events
            WHERE event_id = $1
              AND organiser_id = $2
            FOR UPDATE
            `,
            [eventId, organiserId]
        );

        if (eventResult.rowCount === 0) {
            throw createModelError(
                "EVENT_NOT_FOUND",
                "Event not found."
            );
        }

        const eventRecord = eventResult.rows[0];

        if (eventRecord.status !== "draft") {
            throw createModelError(
                "EVENT_NOT_EDITABLE",
                "Ticket types can only be added to draft events."
            );
        }

        const quantityResult = await client.query(
            `
            SELECT
                COALESCE(
                    SUM(quantity_total),
                    0
                )::INTEGER AS configured_quantity
            FROM ticket_types
            WHERE event_id = $1
            `,
            [eventId]
        );

        const configuredQuantity =
            quantityResult.rows[0].configured_quantity;

        const requestedTotal =
            configuredQuantity
            + Number(ticketData.quantity_total);

        if (requestedTotal > eventRecord.capacity) {
            throw createModelError(
                "CAPACITY_EXCEEDED",
                `Ticket quantities cannot exceed the event capacity of ${eventRecord.capacity}.`
            );
        }

        const result = await client.query(
            `
            INSERT INTO ticket_types (
                event_id,
                ticket_name,
                description,
                price,
                quantity_total,
                quantity_remaining,
                maximum_per_customer,
                sale_start,
                sale_end,
                refund_eligible
            )
            VALUES (
                $1, $2, $3, $4, $5,
                $5, $6, $7, $8, $9
            )
            RETURNING *
            `,
            [
                eventId,
                ticketData.ticket_name,
                ticketData.description || null,
                ticketData.price,
                ticketData.quantity_total,
                ticketData.maximum_per_customer,
                ticketData.sale_start || null,
                ticketData.sale_end || null,
                ticketData.refund_eligible
            ]
        );

        await client.query("COMMIT");

        return result.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};


/*
|--------------------------------------------------------------------------
| Update ticket type
|--------------------------------------------------------------------------
| During the draft stage, no bookings exist, so remaining quantity is reset
| to the updated total.
|--------------------------------------------------------------------------
*/

export const updateOwnedTicketType = async (
    ticketTypeId,
    organiserId,
    ticketData
) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const ticketResult = await client.query(
            `
            SELECT
                tt.ticket_type_id,
                tt.event_id,
                tt.quantity_total,
                e.capacity,
                e.status
            FROM ticket_types tt
            JOIN events e
                ON e.event_id = tt.event_id
            WHERE tt.ticket_type_id = $1
              AND e.organiser_id = $2
            FOR UPDATE OF tt, e
            `,
            [ticketTypeId, organiserId]
        );

        if (ticketResult.rowCount === 0) {
            throw createModelError(
                "TICKET_TYPE_NOT_FOUND",
                "Ticket type not found."
            );
        }

        const existingTicket = ticketResult.rows[0];

        if (existingTicket.status !== "draft") {
            throw createModelError(
                "EVENT_NOT_EDITABLE",
                "Ticket types can only be edited for draft events."
            );
        }

        const quantityResult = await client.query(
            `
            SELECT
                COALESCE(
                    SUM(quantity_total),
                    0
                )::INTEGER AS other_quantity
            FROM ticket_types
            WHERE event_id = $1
              AND ticket_type_id <> $2
            `,
            [
                existingTicket.event_id,
                ticketTypeId
            ]
        );

        const requestedTotal =
            quantityResult.rows[0].other_quantity
            + Number(ticketData.quantity_total);

        if (requestedTotal > existingTicket.capacity) {
            throw createModelError(
                "CAPACITY_EXCEEDED",
                `Ticket quantities cannot exceed the event capacity of ${existingTicket.capacity}.`
            );
        }

        const updateResult = await client.query(
            `
            UPDATE ticket_types
            SET
                ticket_name = $3,
                description = $4,
                price = $5,
                quantity_total = $6,
                quantity_remaining = $6,
                maximum_per_customer = $7,
                sale_start = $8,
                sale_end = $9,
                refund_eligible = $10
            WHERE ticket_type_id = $1
              AND event_id = $2
            RETURNING *
            `,
            [
                ticketTypeId,
                existingTicket.event_id,
                ticketData.ticket_name,
                ticketData.description || null,
                ticketData.price,
                ticketData.quantity_total,
                ticketData.maximum_per_customer,
                ticketData.sale_start || null,
                ticketData.sale_end || null,
                ticketData.refund_eligible
            ]
        );

        await client.query("COMMIT");

        return updateResult.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};


/*
|--------------------------------------------------------------------------
| Delete ticket type
|--------------------------------------------------------------------------
*/

export const deleteOwnedTicketType = async (
    ticketTypeId,
    organiserId
) => {
    const result = await pool.query(
        `
        DELETE FROM ticket_types tt
        USING events e
        WHERE tt.ticket_type_id = $1
          AND e.event_id = tt.event_id
          AND e.organiser_id = $2
          AND e.status = 'draft'
        RETURNING tt.ticket_type_id
        `,
        [ticketTypeId, organiserId]
    );

    return result.rows[0] || null;
};