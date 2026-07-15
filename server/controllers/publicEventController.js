import {
    getPublishedEventById,
    getPublishedEvents
} from "../models/publicEventModel.js";


/*
|--------------------------------------------------------------------------
| Get public events
|--------------------------------------------------------------------------
*/

export const getPublicEvents = async (req, res) => {
    try {
        const {
            search = "",
            category = "",
            location = "",
            pricing = ""
        } = req.query;

        if (
            category
            && (
                !Number.isInteger(Number(category))
                || Number(category) <= 0
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid category filter."
            });
        }

        if (
            pricing
            && !["free", "paid"].includes(pricing)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Pricing must be free or paid."
            });
        }

        if (search.length > 200) {
            return res.status(400).json({
                success: false,
                message:
                    "Search text cannot exceed 200 characters."
            });
        }

        if (location.length > 120) {
            return res.status(400).json({
                success: false,
                message:
                    "Location cannot exceed 120 characters."
            });
        }

        const events = await getPublishedEvents({
            search,
            category,
            location,
            pricing
        });

        return res.status(200).json({
            success: true,
            count: events.length,
            filters: {
                search,
                category,
                location,
                pricing
            },
            events
        });
    } catch (error) {
        console.error(
            "Get public events error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to load public events."
        });
    }
};


/*
|--------------------------------------------------------------------------
| Get one public event
|--------------------------------------------------------------------------
*/

export const getPublicEventById = async (
    req,
    res
) => {
    try {
        const eventId = Number(req.params.eventId);

        if (!Number.isInteger(eventId) || eventId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid event ID."
            });
        }

        const result = await getPublishedEventById(
            eventId
        );

        if (!result) {
            return res.status(404).json({
                success: false,
                message:
                    "Published event not found."
            });
        }

        return res.status(200).json({
            success: true,
            event: result.event,
            ticket_types: result.ticket_types
        });
    } catch (error) {
        console.error(
            "Get public event error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to load the event details."
        });
    }
};