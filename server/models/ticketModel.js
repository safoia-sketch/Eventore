import pool from "../config/database.js";

export const getTicketsForAttendee = async (
    attendeeId
) => {
    const normalizedAttendeeId =
        Number(attendeeId);

    if (
        !Number.isInteger(normalizedAttendeeId)
        || normalizedAttendeeId <= 0
    ) {
        const error = new Error(
            "Invalid attendee account."
        );

        error.status = 401;
        throw error;
    }

    const result = await pool.query(
        `
            SELECT
                t.ticket_id,
                t.ticket_code,
                t.qr_data,
                t.ticket_status,
                t.created_at,

                tt.ticket_name,

                b.booking_id,
                b.booking_reference,

                e.event_id,
                e.event_name,
                e.event_date,
                e.start_time,
                e.end_time,
                e.venue_name,
                e.address,
                e.city,
                e.image_url

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

            WHERE t.attendee_id = $1

            ORDER BY
                e.event_date ASC,
                e.start_time ASC,
                t.ticket_id ASC
        `,
        [normalizedAttendeeId]
    );

    return result.rows;
};

export const getOwnedTicketById = async (
    ticketId,
    attendeeId
) => {
    const normalizedTicketId = Number(ticketId);
    const normalizedAttendeeId =
        Number(attendeeId);

    if (
        !Number.isInteger(normalizedTicketId)
        || normalizedTicketId <= 0
    ) {
        const error = new Error(
            "Invalid ticket ID."
        );

        error.status = 400;
        throw error;
    }

    const result = await pool.query(
        `
            SELECT
                t.ticket_id,
                t.ticket_code,
                t.qr_data,
                t.ticket_status,
                t.created_at,

                tt.ticket_name,

                b.booking_id,
                b.booking_reference,

                e.event_id,
                e.event_name,
                e.event_date,
                e.start_time,
                e.end_time,
                e.venue_name,
                e.address,
                e.city,

                ec.category_name,

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

            INNER JOIN event_categories ec
                ON ec.category_id = e.category_id

            INNER JOIN users u
                ON u.user_id = t.attendee_id

            WHERE t.ticket_id = $1
              AND t.attendee_id = $2

            LIMIT 1
        `,
        [
            normalizedTicketId,
            normalizedAttendeeId
        ]
    );

    return result.rows[0] || null;
};