import pool from "../config/database.js";


/*
|--------------------------------------------------------------------------
| Get organisers waiting for approval
|--------------------------------------------------------------------------
*/

export const getPendingOrganisers = async () => {
    const result = await pool.query(
        `
        SELECT
            user_id,
            full_name,
            email,
            role,
            account_status,
            organiser_approved,
            created_at
        FROM users
        WHERE role = 'organiser'
          AND organiser_approved = FALSE
          AND account_status = 'active'
        ORDER BY created_at ASC
        `
    );

    return result.rows;
};


/*
|--------------------------------------------------------------------------
| Approve organiser
|--------------------------------------------------------------------------
*/

export const approveOrganiserById = async (
    userId
) => {
    const result = await pool.query(
        `
        UPDATE users
        SET
            organiser_approved = TRUE,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
          AND role = 'organiser'
          AND organiser_approved = FALSE
          AND account_status = 'active'
        RETURNING
            user_id,
            full_name,
            email,
            role,
            account_status,
            organiser_approved,
            updated_at
        `,
        [userId]
    );

    return result.rows[0] || null;
};


/*
|--------------------------------------------------------------------------
| Get pending events
|--------------------------------------------------------------------------
*/

export const getPendingEvents = async () => {
    const result = await pool.query(
        `
        SELECT
            e.event_id,
            e.event_name,
            e.description,
            e.image_url,
            e.venue_name,
            e.address,
            e.city,
            e.event_date,
            e.start_time,
            e.end_time,
            e.capacity,
            e.refund_deadline,
            e.refund_policy,
            e.contact_email,
            e.status,
            e.created_at,
            e.updated_at,

            ec.category_id,
            ec.category_name,

            u.user_id AS organiser_id,
            u.full_name AS organiser_name,
            u.email AS organiser_email,

            COUNT(tt.ticket_type_id)::INTEGER
                AS ticket_type_count,

            COALESCE(
                SUM(tt.quantity_total),
                0
            )::INTEGER AS configured_ticket_quantity,

            COALESCE(
                MIN(tt.price),
                0
            ) AS minimum_price

        FROM events e

        JOIN users u
            ON u.user_id = e.organiser_id

        JOIN event_categories ec
            ON ec.category_id = e.category_id

        LEFT JOIN ticket_types tt
            ON tt.event_id = e.event_id

        WHERE e.status = 'pending'

        GROUP BY
            e.event_id,
            ec.category_id,
            ec.category_name,
            u.user_id,
            u.full_name,
            u.email

        ORDER BY e.updated_at ASC
        `
    );

    return result.rows;
};


/*
|--------------------------------------------------------------------------
| Get one pending event with ticket types
|--------------------------------------------------------------------------
*/

export const getPendingEventById = async (
    eventId
) => {
    const eventResult = await pool.query(
        `
        SELECT
            e.*,
            ec.category_name,
            u.full_name AS organiser_name,
            u.email AS organiser_email
        FROM events e

        JOIN users u
            ON u.user_id = e.organiser_id

        JOIN event_categories ec
            ON ec.category_id = e.category_id

        WHERE e.event_id = $1
          AND e.status = 'pending'

        LIMIT 1
        `,
        [eventId]
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
| Approve and publish pending event
|--------------------------------------------------------------------------
*/

export const approvePendingEventById = async (
    eventId
) => {
    const result = await pool.query(
        `
        UPDATE events
        SET
            status = 'published',
            rejection_reason = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE event_id = $1
          AND status = 'pending'
          AND event_date >= CURRENT_DATE
          AND EXISTS (
              SELECT 1
              FROM ticket_types
              WHERE ticket_types.event_id =
                    events.event_id
          )
        RETURNING *
        `,
        [eventId]
    );

    return result.rows[0] || null;
};


/*
|--------------------------------------------------------------------------
| Return pending event to draft
|--------------------------------------------------------------------------
*/

export const returnPendingEventToDraft = async (
    eventId,
    rejectionReason
) => {
    const result = await pool.query(
        `
        UPDATE events
        SET
            status = 'draft',
            rejection_reason = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE event_id = $1
          AND status = 'pending'
        RETURNING *
        `,
        [
            eventId,
            rejectionReason
        ]
    );

    return result.rows[0] || null;
};


/*
|--------------------------------------------------------------------------
| Cancel a published event
|--------------------------------------------------------------------------
*/

export const cancelPublishedEventById = async (
    eventId,
    reason
) => {
    const result = await pool.query(
        `
        UPDATE events
        SET
            status = 'cancelled',
            rejection_reason = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE event_id = $1
          AND status = 'published'
        RETURNING *
        `,
        [
            eventId,
            reason || null
        ]
    );

    return result.rows[0] || null;
};