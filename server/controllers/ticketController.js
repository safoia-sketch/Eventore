import {
    getOwnedTicketById,
    getTicketsForAttendee
} from "../models/ticketModel.js";

/*
|--------------------------------------------------------------------------
| Get current attendee tickets
|--------------------------------------------------------------------------
*/

export const getMyTickets = async (
    req,
    res
) => {
    try {
        const attendeeId =
            req.session.user.user_id;

        const tickets =
            await getTicketsForAttendee(
                attendeeId
            );

        return res.status(200).json({
            success: true,
            count: tickets.length,
            tickets
        });
    } catch (error) {
        console.error(
            "Get attendee tickets error:",
            error
        );

        return res
            .status(error.status || 500)
            .json({
                success: false,
                message:
                    error.status
                        ? error.message
                        : "Unable to load your tickets."
            });
    }
};

/*
|--------------------------------------------------------------------------
| Get one owned digital ticket
|--------------------------------------------------------------------------
*/

export const getTicketById = async (
    req,
    res
) => {
    try {
        const attendeeId =
            req.session.user.user_id;

        const ticketId =
            Number(req.params.ticketId);

        if (
            !Number.isInteger(ticketId)
            || ticketId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid ticket ID."
            });
        }

        const ticket =
            await getOwnedTicketById(
                ticketId,
                attendeeId
            );

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message:
                    "Ticket not found or you do not have permission to view it."
            });
        }

        return res.status(200).json({
            success: true,
            ticket
        });
    } catch (error) {
        console.error(
            "Get ticket details error:",
            error
        );

        return res
            .status(error.status || 500)
            .json({
                success: false,
                message:
                    error.status
                        ? error.message
                        : "Unable to load the ticket."
            });
    }
};