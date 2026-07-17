import pool from "../config/database.js";

export const getOrganiserDashboardData = async (
    organiserId
) => {
    const normalizedOrganiserId =
        Number(organiserId);

    if (
        !Number.isInteger(normalizedOrganiserId)
        || normalizedOrganiserId <= 0
    ) {
        const error = new Error(
            "Invalid organiser account."
        );

        error.status = 401;
        throw error;
    }

    const metricsResult = await pool.query(
        `
            SELECT
                (
                    SELECT COUNT(*)::integer
                    FROM events
                    WHERE organiser_id = $1
                ) AS total_events,

                (
                    SELECT COUNT(*)::integer
                    FROM bookings b
                    INNER JOIN events e
                        ON e.event_id = b.event_id
                    WHERE e.organiser_id = $1
                      AND b.status = 'confirmed'
                ) AS confirmed_bookings,

                (
                    SELECT
                        COALESCE(
                            SUM(bi.quantity),
                            0
                        )::integer
                    FROM booking_items bi
                    INNER JOIN bookings b
                        ON b.booking_id =
                           bi.booking_id
                    INNER JOIN events e
                        ON e.event_id = b.event_id
                    WHERE e.organiser_id = $1
                      AND b.status = 'confirmed'
                ) AS tickets_sold,

                (
                    SELECT
                        COALESCE(
                            SUM(tt.quantity_remaining),
                            0
                        )::integer
                    FROM ticket_types tt
                    INNER JOIN events e
                        ON e.event_id = tt.event_id
                    WHERE e.organiser_id = $1
                ) AS tickets_remaining,

                (
                    SELECT
                        COALESCE(
                            SUM(b.total_amount),
                            0
                        )
                    FROM bookings b
                    INNER JOIN events e
                        ON e.event_id = b.event_id
                    WHERE e.organiser_id = $1
                      AND b.status = 'confirmed'
                ) AS gross_revenue,

                (
                    SELECT COUNT(*)::integer
                    FROM bookings b
                    INNER JOIN events e
                        ON e.event_id = b.event_id
                    WHERE e.organiser_id = $1
                      AND b.status = 'cancelled'
                ) AS cancelled_bookings,

                (
                    SELECT COUNT(*)::integer
                    FROM check_ins ci
                    INNER JOIN events e
                        ON e.event_id = ci.event_id
                    WHERE e.organiser_id = $1
                ) AS checked_in
        `,
        [normalizedOrganiserId]
    );

    const salesResult = await pool.query(
        `
            SELECT
                e.event_id,
                e.event_name,

                tt.ticket_type_id,
                tt.ticket_name,
                tt.price,
                tt.quantity_total,
                tt.quantity_remaining,

                COALESCE(
                    SUM(bi.quantity)
                        FILTER (
                            WHERE b.status =
                                'confirmed'
                        ),
                    0
                )::integer AS quantity_sold,

                COALESCE(
                    SUM(bi.subtotal)
                        FILTER (
                            WHERE b.status =
                                'confirmed'
                        ),
                    0
                ) AS confirmed_revenue

            FROM events e

            INNER JOIN ticket_types tt
                ON tt.event_id = e.event_id

            LEFT JOIN booking_items bi
                ON bi.ticket_type_id =
                   tt.ticket_type_id

            LEFT JOIN bookings b
                ON b.booking_id =
                   bi.booking_id

            WHERE e.organiser_id = $1

            GROUP BY
                e.event_id,
                tt.ticket_type_id

            ORDER BY
                e.event_date DESC,
                e.event_name,
                tt.ticket_name
        `,
        [normalizedOrganiserId]
    );

    const metrics = metricsResult.rows[0];

    const ticketsSold =
        Number(metrics.tickets_sold);

    const checkedIn =
        Number(metrics.checked_in);

    const checkInRate =
        ticketsSold > 0
            ? Number(
                  (
                      (checkedIn / ticketsSold)
                      * 100
                  ).toFixed(1)
              )
            : 0;

    return {
        metrics: {
            ...metrics,
            check_in_rate: checkInRate
        },

        sales_by_ticket_type:
            salesResult.rows
    };
};