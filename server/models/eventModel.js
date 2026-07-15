import pool from "../config/database.js";

/*
|--------------------------------------------------------------------------
| Create a new draft event
|--------------------------------------------------------------------------
| organiserId comes from the authenticated session, not from the browser.
*/

export const createEvent = async (organiserId, eventData) => {
    const {
        category_id,
        event_name,
        description,
        image_url,
        venue_name,
        address,
        city,
        event_date,
        start_time,
        end_time,
        capacity,
        refund_deadline,
        refund_policy,
        contact_email
    } = eventData;

    const result = await pool.query(
        `
        INSERT INTO events (
            organiser_id,
            category_id,
            event_name,
            description,
            image_url,
            venue_name,
            address,
            city,
            event_date,
            start_time,
            end_time,
            capacity,
            refund_deadline,
            refund_policy,
            contact_email,
            status
        )
        VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15,
            'draft'
        )
        RETURNING *
        `,
        [
            organiserId,
            category_id,
            event_name,
            description,
            image_url || null,
            venue_name,
            address,
            city,
            event_date,
            start_time,
            end_time,
            capacity,
            refund_deadline || null,
            refund_policy || null,
            contact_email
        ]
    );

    return result.rows[0];
};


/*
|--------------------------------------------------------------------------
| Get events belonging to the logged-in organiser
|--------------------------------------------------------------------------
*/

export const getEventsByOrganiser = async (organiserId) => {
    const result = await pool.query(
        `
        SELECT
            e.*,
            ec.category_name,
            COUNT(tt.ticket_type_id)::INTEGER AS ticket_type_count,
            COALESCE(SUM(tt.quantity_total), 0)::INTEGER
                AS total_ticket_quantity,
            COALESCE(SUM(tt.quantity_remaining), 0)::INTEGER
                AS remaining_ticket_quantity
        FROM events e
        JOIN event_categories ec
            ON ec.category_id = e.category_id
        LEFT JOIN ticket_types tt
            ON tt.event_id = e.event_id
        WHERE e.organiser_id = $1
        GROUP BY
            e.event_id,
            ec.category_id,
            ec.category_name
        ORDER BY e.created_at DESC
        `,
        [organiserId]
    );

    return result.rows;
};


/*
|--------------------------------------------------------------------------
| Get one event owned by an organiser
|--------------------------------------------------------------------------
| Checking organiser_id prevents one organiser from opening another
| organiser's private event.
*/

export const getOwnedEventById = async (eventId, organiserId) => {
    const result = await pool.query(
        `
        SELECT
            e.*,
            ec.category_name
        FROM events e
        JOIN event_categories ec
            ON ec.category_id = e.category_id
        WHERE e.event_id = $1
          AND e.organiser_id = $2
        LIMIT 1
        `,
        [eventId, organiserId]
    );

    return result.rows[0] || null;
};


/*
|--------------------------------------------------------------------------
| Update an owned draft event
|--------------------------------------------------------------------------
| Only draft events may be edited.
*/

export const updateOwnedDraftEvent = async (
    eventId,
    organiserId,
    eventData
) => {
    const {
        category_id,
        event_name,
        description,
        image_url,
        venue_name,
        address,
        city,
        event_date,
        start_time,
        end_time,
        capacity,
        refund_deadline,
        refund_policy,
        contact_email
    } = eventData;

    const result = await pool.query(
        `
        UPDATE events
        SET
            category_id = $3,
            event_name = $4,
            description = $5,
            image_url = $6,
            venue_name = $7,
            address = $8,
            city = $9,
            event_date = $10,
            start_time = $11,
            end_time = $12,
            capacity = $13,
            refund_deadline = $14,
            refund_policy = $15,
            contact_email = $16,
            rejection_reason = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE event_id = $1
          AND organiser_id = $2
          AND status = 'draft'
        RETURNING *
        `,
        [
            eventId,
            organiserId,
            category_id,
            event_name,
            description,
            image_url || null,
            venue_name,
            address,
            city,
            event_date,
            start_time,
            end_time,
            capacity,
            refund_deadline || null,
            refund_policy || null,
            contact_email
        ]
    );

    return result.rows[0] || null;
};


/*
|--------------------------------------------------------------------------
| Delete an owned draft event
|--------------------------------------------------------------------------
| Ticket types are deleted first because they reference the event.
| The transaction ensures that both operations succeed or both fail.
*/

export const deleteOwnedDraftEvent = async (
    eventId,
    organiserId
) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const eventResult = await client.query(
            `
            SELECT event_id
            FROM events
            WHERE event_id = $1
              AND organiser_id = $2
              AND status = 'draft'
            FOR UPDATE
            `,
            [eventId, organiserId]
        );

        if (eventResult.rowCount === 0) {
            await client.query("ROLLBACK");
            return null;
        }

        await client.query(
            `
            DELETE FROM ticket_types
            WHERE event_id = $1
            `,
            [eventId]
        );

        const deleteResult = await client.query(
            `
            DELETE FROM events
            WHERE event_id = $1
              AND organiser_id = $2
              AND status = 'draft'
            RETURNING event_id
            `,
            [eventId, organiserId]
        );

        await client.query("COMMIT");

        return deleteResult.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};


/*
|--------------------------------------------------------------------------
| Get active event categories
|--------------------------------------------------------------------------
| This will populate the category dropdown in the React event form.
*/

export const getActiveCategories = async () => {
    const result = await pool.query(
        `
        SELECT
            category_id,
            category_name
        FROM event_categories
        WHERE status = 'active'
        ORDER BY category_name ASC
        `
    );

    return result.rows;
};


export const submitOwnedEventForApproval = async (
    eventId,
    organiserId
) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const eventResult = await client.query(
            `
            SELECT
                event_id,
                event_name,
                event_date,
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
            const error = new Error("Event not found.");
            error.code = "EVENT_NOT_FOUND";
            throw error;
        }

        const eventRecord = eventResult.rows[0];

        if (eventRecord.status !== "draft") {
            const error = new Error(
                "Only draft events can be submitted."
            );

            error.code = "INVALID_EVENT_STATUS";
            throw error;
        }

        const dateResult = await client.query(
            `
            SELECT $1::DATE < CURRENT_DATE AS is_past
            `,
            [eventRecord.event_date]
        );

        if (dateResult.rows[0].is_past) {
            const error = new Error(
                "An event in the past cannot be submitted."
            );

            error.code = "PAST_EVENT";
            throw error;
        }

        const ticketResult = await client.query(
            `
            SELECT
                COUNT(*)::INTEGER AS ticket_type_count,
                COALESCE(
                    SUM(quantity_total),
                    0
                )::INTEGER AS configured_quantity
            FROM ticket_types
            WHERE event_id = $1
            `,
            [eventId]
        );

        const ticketSummary = ticketResult.rows[0];

        if (ticketSummary.ticket_type_count === 0) {
            const error = new Error(
                "Add at least one ticket type before submitting the event."
            );

            error.code = "NO_TICKET_TYPES";
            throw error;
        }

        if (
            ticketSummary.configured_quantity
            > eventRecord.capacity
        ) {
            const error = new Error(
                "Ticket quantities exceed the event capacity."
            );

            error.code = "CAPACITY_EXCEEDED";
            throw error;
        }

        const updateResult = await client.query(
            `
            UPDATE events
            SET
                status = 'pending',
                rejection_reason = NULL,
                updated_at = CURRENT_TIMESTAMP
            WHERE event_id = $1
              AND organiser_id = $2
              AND status = 'draft'
            RETURNING *
            `,
            [eventId, organiserId]
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