import pool from "../config/database.js";


/*
|--------------------------------------------------------------------------
| Get published future events
|--------------------------------------------------------------------------
*/

export const getPublishedEvents = async (
    filters = {}
) => {
    const {
        search,
        category,
        location,
        pricing
    } = filters;

    const conditions = [
        `e.status IN ('published', 'sold_out')`,
        `e.event_date >= CURRENT_DATE`
    ];

    const values = [];

    if (search?.trim()) {
        values.push(`%${search.trim()}%`);

        conditions.push(`
            (
                e.event_name ILIKE $${values.length}
                OR e.description ILIKE $${values.length}
            )
        `);
    }

    if (category) {
        values.push(Number(category));

        conditions.push(
            `e.category_id = $${values.length}`
        );
    }

    if (location?.trim()) {
        values.push(`%${location.trim()}%`);

        conditions.push(`
            (
                e.city ILIKE $${values.length}
                OR e.venue_name ILIKE $${values.length}
                OR e.address ILIKE $${values.length}
            )
        `);
    }

    if (pricing === "free") {
        conditions.push(`
            NOT EXISTS (
                SELECT 1
                FROM ticket_types free_check
                WHERE free_check.event_id = e.event_id
                  AND free_check.price > 0
            )
        `);
    }

    if (pricing === "paid") {
        conditions.push(`
            EXISTS (
                SELECT 1
                FROM ticket_types paid_check
                WHERE paid_check.event_id = e.event_id
                  AND paid_check.price > 0
            )
        `);
    }

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

            TO_CHAR(
                e.event_date,
                'YYYY-MM-DD'
            ) AS event_date,

            e.start_time,
            e.end_time,
            e.capacity,
            e.status,

            ec.category_id,
            ec.category_name,

            u.full_name AS organiser_name,

            COUNT(tt.ticket_type_id)::INTEGER
                AS ticket_type_count,

            COALESCE(
                MIN(tt.price),
                0
            ) AS minimum_price,

            COALESCE(
                SUM(tt.quantity_remaining),
                0
            )::INTEGER AS tickets_remaining

        FROM events e

        JOIN event_categories ec
            ON ec.category_id = e.category_id

        JOIN users u
            ON u.user_id = e.organiser_id

        JOIN ticket_types tt
            ON tt.event_id = e.event_id

        WHERE ${conditions.join(" AND ")}

        GROUP BY
            e.event_id,
            ec.category_id,
            ec.category_name,
            u.user_id,
            u.full_name

        ORDER BY
            e.event_date ASC,
            e.start_time ASC
        `,
        values
    );

    return result.rows;
};


/*
|--------------------------------------------------------------------------
| Get one published event and its ticket types
|--------------------------------------------------------------------------
*/

export const getPublishedEventById = async (
    eventId
) => {
    const eventResult = await pool.query(
        `
        SELECT
            e.event_id,
            e.event_name,
            e.description,
            e.image_url,
            e.venue_name,
            e.address,
            e.city,

            TO_CHAR(
                e.event_date,
                'YYYY-MM-DD'
            ) AS event_date,

            e.start_time,
            e.end_time,
            e.capacity,
            e.refund_deadline,
            e.refund_policy,
            e.contact_email,
            e.status,

            ec.category_id,
            ec.category_name,

            u.full_name AS organiser_name

        FROM events e

        JOIN event_categories ec
            ON ec.category_id = e.category_id

        JOIN users u
            ON u.user_id = e.organiser_id

        WHERE e.event_id = $1
          AND e.status IN (
              'published',
              'sold_out'
          )
          AND e.event_date >= CURRENT_DATE

        LIMIT 1
        `,
        [eventId]
    );

    if (eventResult.rowCount === 0) {
        return null;
    }

    const ticketResult = await pool.query(
        `
        SELECT
            ticket_type_id,
            ticket_name,
            description,
            price,
            quantity_total,
            quantity_remaining,
            maximum_per_customer,
            sale_start,
            sale_end,
            refund_eligible
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