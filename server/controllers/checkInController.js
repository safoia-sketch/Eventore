import {
    getCheckInEvents,
    validateAndCheckInTicket
} from "../models/checkInModel.js";

/*
|--------------------------------------------------------------------------
| Get events available for check-in
|--------------------------------------------------------------------------
*/

export const getAvailableCheckInEvents = async (
    req,
    res
) => {
    try {
        const events = await getCheckInEvents();

        return res.status(200).json({
            success: true,
            count: events.length,
            events
        });
    } catch (error) {
        console.error(
            "Get check-in events error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to load events for check-in."
        });
    }
};

/*
|--------------------------------------------------------------------------
| Validate and check in ticket
|--------------------------------------------------------------------------
*/

export const checkInTicket = async (
    req,
    res
) => {
    try {
        const staffId =
            req.session.user.user_id;

        const {
            ticket_code: ticketCode,
            event_id: eventId
        } = req.body;

        const result =
            await validateAndCheckInTicket({
                ticketCode,
                eventId,
                staffId
            });

        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error(
            "Ticket check-in error:",
            error
        );

        return res
            .status(error.status || 500)
            .json({
                success: false,
                result_code:
                    error.resultCode || "error",

                message:
                    error.status
                        ? error.message
                        : "Unable to validate the ticket."
            });
    }
};