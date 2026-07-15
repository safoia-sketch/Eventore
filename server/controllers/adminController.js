import {
    approveOrganiserById,
    approvePendingEventById,
    cancelPublishedEventById,
    getPendingEventById,
    getPendingEvents as findPendingEvents,
    getPendingOrganisers as findPendingOrganisers,
    returnPendingEventToDraft
} from "../models/adminModel.js";


const getValidId = (value) => {
    const id = Number(value);

    if (!Number.isInteger(id) || id <= 0) {
        return null;
    }

    return id;
};


/*
|--------------------------------------------------------------------------
| List pending organiser accounts
|--------------------------------------------------------------------------
*/

export const getPendingOrganisers = async (
    req,
    res
) => {
    try {
        const organisers =
            await findPendingOrganisers();

        return res.status(200).json({
            success: true,
            count: organisers.length,
            organisers
        });
    } catch (error) {
        console.error(
            "Get pending organisers error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to load pending organisers."
        });
    }
};


/*
|--------------------------------------------------------------------------
| Approve organiser account
|--------------------------------------------------------------------------
*/

export const approveOrganiser = async (
    req,
    res
) => {
    try {
        const userId = getValidId(req.params.userId);

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID."
            });
        }

        const organiser =
            await approveOrganiserById(userId);

        if (!organiser) {
            return res.status(404).json({
                success: false,
                message:
                    "Pending organiser account not found."
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Organiser approved successfully.",
            organiser
        });
    } catch (error) {
        console.error(
            "Approve organiser error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to approve the organiser."
        });
    }
};


/*
|--------------------------------------------------------------------------
| List pending events
|--------------------------------------------------------------------------
*/

export const getPendingEvents = async (
    req,
    res
) => {
    try {
        const events = await findPendingEvents();

        return res.status(200).json({
            success: true,
            count: events.length,
            events
        });
    } catch (error) {
        console.error(
            "Get pending events error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to load pending events."
        });
    }
};


/*
|--------------------------------------------------------------------------
| Review one pending event
|--------------------------------------------------------------------------
*/

export const getPendingEvent = async (
    req,
    res
) => {
    try {
        const eventId = getValidId(
            req.params.eventId
        );

        if (!eventId) {
            return res.status(400).json({
                success: false,
                message: "Invalid event ID."
            });
        }

        const result = await getPendingEventById(
            eventId
        );

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Pending event not found."
            });
        }

        return res.status(200).json({
            success: true,
            event: result.event,
            ticket_types: result.ticket_types
        });
    } catch (error) {
        console.error(
            "Get pending event error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to load the pending event."
        });
    }
};


/*
|--------------------------------------------------------------------------
| Approve and publish event
|--------------------------------------------------------------------------
*/

export const approveEvent = async (req, res) => {
    try {
        const eventId = getValidId(
            req.params.eventId
        );

        if (!eventId) {
            return res.status(400).json({
                success: false,
                message: "Invalid event ID."
            });
        }

        const event = await approvePendingEventById(
            eventId
        );

        if (!event) {
            return res.status(409).json({
                success: false,
                message:
                    "The event is not pending, has no ticket types, or its date has passed."
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Event approved and published successfully.",
            event
        });
    } catch (error) {
        console.error("Approve event error:", error);

        return res.status(500).json({
            success: false,
            message:
                "Unable to approve and publish the event."
        });
    }
};


/*
|--------------------------------------------------------------------------
| Return event to draft
|--------------------------------------------------------------------------
*/

export const rejectEvent = async (req, res) => {
    try {
        const eventId = getValidId(
            req.params.eventId
        );

        if (!eventId) {
            return res.status(400).json({
                success: false,
                message: "Invalid event ID."
            });
        }

        const rejectionReason =
            req.body.reason?.trim();

        if (!rejectionReason) {
            return res.status(400).json({
                success: false,
                message:
                    "A reason is required when returning an event to draft.",
                errors: {
                    reason:
                        "Enter the changes required from the organiser."
                }
            });
        }

        if (rejectionReason.length > 1000) {
            return res.status(400).json({
                success: false,
                message:
                    "The rejection reason is too long.",
                errors: {
                    reason:
                        "The reason cannot exceed 1,000 characters."
                }
            });
        }

        const event =
            await returnPendingEventToDraft(
                eventId,
                rejectionReason
            );

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Pending event not found."
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Event returned to draft with feedback.",
            event
        });
    } catch (error) {
        console.error("Reject event error:", error);

        return res.status(500).json({
            success: false,
            message:
                "Unable to return the event to draft."
        });
    }
};


/*
|--------------------------------------------------------------------------
| Cancel published event
|--------------------------------------------------------------------------
*/

export const cancelEvent = async (req, res) => {
    try {
        const eventId = getValidId(
            req.params.eventId
        );

        if (!eventId) {
            return res.status(400).json({
                success: false,
                message: "Invalid event ID."
            });
        }

        const reason =
            req.body.reason?.trim() || null;

        if (reason && reason.length > 1000) {
            return res.status(400).json({
                success: false,
                message:
                    "The cancellation reason cannot exceed 1,000 characters."
            });
        }

        const event =
            await cancelPublishedEventById(
                eventId,
                reason
            );

        if (!event) {
            return res.status(404).json({
                success: false,
                message:
                    "Published event not found."
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Published event cancelled successfully.",
            event
        });
    } catch (error) {
        console.error("Cancel event error:", error);

        return res.status(500).json({
            success: false,
            message:
                "Unable to cancel the event."
        });
    }
};