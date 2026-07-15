import {
    createEvent,
    getEventsByOrganiser,
    getOwnedEventById,
    updateOwnedDraftEvent,
    deleteOwnedDraftEvent,
    getActiveCategories,
    submitOwnedEventForApproval
} from "../models/eventModel.js";


/*
|--------------------------------------------------------------------------
| Validation helpers
|--------------------------------------------------------------------------
*/

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidUrl = (value) => {
    if (!value) {
        return true;
    }

    try {
        const url = new URL(value);

        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
};

const getCurrentDateString = () => {
    return new Date().toISOString().split("T")[0];
};

const validateEventData = (eventData) => {
    const errors = {};

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
        contact_email
    } = eventData;

    if (!category_id) {
        errors.category_id = "Please select an event category.";
    }

    if (!event_name?.trim()) {
        errors.event_name = "Event name is required.";
    } else if (event_name.trim().length > 200) {
        errors.event_name =
            "Event name cannot contain more than 200 characters.";
    }

    if (!description?.trim()) {
        errors.description = "Event description is required.";
    }

    if (!venue_name?.trim()) {
        errors.venue_name = "Venue name is required.";
    }

    if (!address?.trim()) {
        errors.address = "Address is required.";
    }

    if (!city?.trim()) {
        errors.city = "City is required.";
    }

    if (!event_date) {
        errors.event_date = "Event date is required.";
    } else if (event_date < getCurrentDateString()) {
        errors.event_date = "Event date cannot be in the past.";
    }

    if (!start_time) {
        errors.start_time = "Start time is required.";
    }

    if (!end_time) {
        errors.end_time = "End time is required.";
    }

    if (start_time && end_time && end_time <= start_time) {
        errors.end_time = "End time must be later than start time.";
    }

    const numericCapacity = Number(capacity);

    if (
        capacity === undefined
        || capacity === null
        || capacity === ""
    ) {
        errors.capacity = "Event capacity is required.";
    } else if (
        !Number.isInteger(numericCapacity)
        || numericCapacity <= 0
    ) {
        errors.capacity =
            "Event capacity must be a whole number greater than zero.";
    }

    if (!contact_email?.trim()) {
        errors.contact_email = "Contact email is required.";
    } else if (!emailPattern.test(contact_email.trim())) {
        errors.contact_email = "Enter a valid contact email address.";
    }

    if (image_url && !isValidUrl(image_url)) {
        errors.image_url =
            "Image URL must begin with http:// or https://.";
    }

    if (
        refund_deadline
        && event_date
        && refund_deadline.split("T")[0] > event_date
    ) {
        errors.refund_deadline =
            "Refund deadline cannot be after the event date.";
    }

    return errors;
};


/*
|--------------------------------------------------------------------------
| Create draft event
|--------------------------------------------------------------------------
*/

export const createDraftEvent = async (req, res) => {
    try {
        const organiserId = req.session.user.user_id;
        const errors = validateEventData(req.body);

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: "Please correct the event form.",
                errors
            });
        }

        const event = await createEvent(
            organiserId,
            req.body
        );

        return res.status(201).json({
            success: true,
            message: "Draft event created successfully.",
            event
        });
    } catch (error) {
        console.error("Create event error:", error);

        if (error.code === "23503") {
            return res.status(400).json({
                success: false,
                message: "The selected event category is invalid."
            });
        }

        if (error.code === "23514") {
            return res.status(400).json({
                success: false,
                message: "The event contains invalid information."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to create the event."
        });
    }
};


/*
|--------------------------------------------------------------------------
| Get logged-in organiser's events
|--------------------------------------------------------------------------
*/

export const getMyEvents = async (req, res) => {
    try {
        const organiserId = req.session.user.user_id;

        const events = await getEventsByOrganiser(
            organiserId
        );

        return res.status(200).json({
            success: true,
            count: events.length,
            events
        });
    } catch (error) {
        console.error("Get organiser events error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load your events."
        });
    }
};


/*
|--------------------------------------------------------------------------
| Get one owned event
|--------------------------------------------------------------------------
*/

export const getMyEventById = async (req, res) => {
    try {
        const organiserId = req.session.user.user_id;
        const eventId = Number(req.params.eventId);

        if (!Number.isInteger(eventId) || eventId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid event ID."
            });
        }

        const event = await getOwnedEventById(
            eventId,
            organiserId
        );

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found."
            });
        }

        return res.status(200).json({
            success: true,
            event
        });
    } catch (error) {
        console.error("Get event error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load the event."
        });
    }
};


/*
|--------------------------------------------------------------------------
| Update owned draft event
|--------------------------------------------------------------------------
*/

export const updateDraftEvent = async (req, res) => {
    try {
        const organiserId = req.session.user.user_id;
        const eventId = Number(req.params.eventId);

        if (!Number.isInteger(eventId) || eventId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid event ID."
            });
        }

        const errors = validateEventData(req.body);

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: "Please correct the event form.",
                errors
            });
        }

        const event = await updateOwnedDraftEvent(
            eventId,
            organiserId,
            req.body
        );

        if (!event) {
            return res.status(404).json({
                success: false,
                message:
                    "Draft event not found or the event cannot be edited."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Draft event updated successfully.",
            event
        });
    } catch (error) {
        console.error("Update event error:", error);

        if (error.code === "23503") {
            return res.status(400).json({
                success: false,
                message: "The selected event category is invalid."
            });
        }

        if (error.code === "23514") {
            return res.status(400).json({
                success: false,
                message: "The event contains invalid information."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to update the event."
        });
    }
};


/*
|--------------------------------------------------------------------------
| Delete owned draft event
|--------------------------------------------------------------------------
*/

export const deleteDraftEvent = async (req, res) => {
    try {
        const organiserId = req.session.user.user_id;
        const eventId = Number(req.params.eventId);

        if (!Number.isInteger(eventId) || eventId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid event ID."
            });
        }

        const deletedEvent = await deleteOwnedDraftEvent(
            eventId,
            organiserId
        );

        if (!deletedEvent) {
            return res.status(404).json({
                success: false,
                message:
                    "Draft event not found or the event cannot be deleted."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Draft event deleted successfully."
        });
    } catch (error) {
        console.error("Delete event error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete the event."
        });
    }
};


/*
|--------------------------------------------------------------------------
| Get active categories
|--------------------------------------------------------------------------
*/

export const getCategories = async (req, res) => {
    try {
        const categories = await getActiveCategories();

        return res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });
    } catch (error) {
        console.error("Get categories error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load event categories."
        });
    }
};

export const submitEventForApproval = async (
    req,
    res
) => {
    try {
        const organiserId =
            req.session.user.user_id;

        const eventId = Number(req.params.eventId);

        if (!Number.isInteger(eventId) || eventId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid event ID."
            });
        }

        const event =
            await submitOwnedEventForApproval(
                eventId,
                organiserId
            );

        return res.status(200).json({
            success: true,
            message:
                "Event submitted for administrator approval.",
            event
        });
    } catch (error) {
        console.error("Submit event error:", error);

        if (error.code === "EVENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        if (
            error.code === "INVALID_EVENT_STATUS"
            || error.code === "PAST_EVENT"
            || error.code === "NO_TICKET_TYPES"
            || error.code === "CAPACITY_EXCEEDED"
        ) {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Unable to submit the event for approval."
        });
    }
};