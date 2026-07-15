import {
    createTicketType,
    deleteOwnedTicketType,
    getTicketTypesByOwnedEvent,
    updateOwnedTicketType
} from "../models/ticketTypeModel.js";


/*
|--------------------------------------------------------------------------
| Ticket validation
|--------------------------------------------------------------------------
*/

const validateTicketType = (ticketData) => {
    const errors = {};

    const {
        ticket_name,
        price,
        quantity_total,
        maximum_per_customer,
        sale_start,
        sale_end
    } = ticketData;

    const numericPrice = Number(price);
    const numericQuantity = Number(quantity_total);
    const numericMaximum = Number(maximum_per_customer);

    if (!ticket_name?.trim()) {
        errors.ticket_name = "Ticket name is required.";
    } else if (ticket_name.trim().length > 120) {
        errors.ticket_name =
            "Ticket name cannot exceed 120 characters.";
    }

    if (
        price === undefined
        || price === null
        || price === ""
    ) {
        errors.price = "Ticket price is required.";
    } else if (
        !Number.isFinite(numericPrice)
        || numericPrice < 0
    ) {
        errors.price =
            "Ticket price must be zero or greater.";
    }

    if (
        quantity_total === undefined
        || quantity_total === null
        || quantity_total === ""
    ) {
        errors.quantity_total =
            "Ticket quantity is required.";
    } else if (
        !Number.isInteger(numericQuantity)
        || numericQuantity <= 0
    ) {
        errors.quantity_total =
            "Ticket quantity must be a whole number greater than zero.";
    }

    if (
        maximum_per_customer === undefined
        || maximum_per_customer === null
        || maximum_per_customer === ""
    ) {
        errors.maximum_per_customer =
            "Maximum per customer is required.";
    } else if (
        !Number.isInteger(numericMaximum)
        || numericMaximum <= 0
    ) {
        errors.maximum_per_customer =
            "Maximum per customer must be a whole number greater than zero.";
    } else if (
        Number.isInteger(numericQuantity)
        && numericMaximum > numericQuantity
    ) {
        errors.maximum_per_customer =
            "Maximum per customer cannot exceed the total ticket quantity.";
    }

    if (
        sale_start
        && sale_end
        && new Date(sale_end) <= new Date(sale_start)
    ) {
        errors.sale_end =
            "Sale closing date must be after the sale start date.";
    }

    return errors;
};


const prepareTicketData = (ticketData) => {
    return {
        ticket_name: ticketData.ticket_name.trim(),

        description:
            ticketData.description?.trim() || null,

        price: Number(ticketData.price),

        quantity_total:
            Number(ticketData.quantity_total),

        maximum_per_customer:
            Number(ticketData.maximum_per_customer),

        sale_start: ticketData.sale_start || null,
        sale_end: ticketData.sale_end || null,

        refund_eligible:
            ticketData.refund_eligible === undefined
                ? true
                : Boolean(ticketData.refund_eligible)
    };
};


/*
|--------------------------------------------------------------------------
| Model error responses
|--------------------------------------------------------------------------
*/

const handleTicketModelError = (error, res) => {
    if (error.code === "EVENT_NOT_FOUND") {
        return res.status(404).json({
            success: false,
            message: "Event not found."
        });
    }

    if (error.code === "TICKET_TYPE_NOT_FOUND") {
        return res.status(404).json({
            success: false,
            message: "Ticket type not found."
        });
    }

    if (error.code === "EVENT_NOT_EDITABLE") {
        return res.status(409).json({
            success: false,
            message: error.message
        });
    }

    if (error.code === "CAPACITY_EXCEEDED") {
        return res.status(400).json({
            success: false,
            message: error.message,
            errors: {
                quantity_total: error.message
            }
        });
    }

    if (error.code === "23505") {
        return res.status(409).json({
            success: false,
            message:
                "This event already has a ticket type with that name.",
            errors: {
                ticket_name:
                    "Choose a different ticket name."
            }
        });
    }

    if (
        error.code === "23514"
        || error.code === "22P02"
    ) {
        return res.status(400).json({
            success: false,
            message: "The ticket information is invalid."
        });
    }

    return null;
};


/*
|--------------------------------------------------------------------------
| Get an event's ticket types
|--------------------------------------------------------------------------
*/

export const getEventTicketTypes = async (req, res) => {
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

        const result = await getTicketTypesByOwnedEvent(
            eventId,
            organiserId
        );

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Event not found."
            });
        }

        return res.status(200).json({
            success: true,
            event: result.event,
            ticket_types: result.ticket_types
        });
    } catch (error) {
        console.error("Get ticket types error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load ticket types."
        });
    }
};


/*
|--------------------------------------------------------------------------
| Create a ticket type
|--------------------------------------------------------------------------
*/

export const createEventTicketType = async (
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

        const errors = validateTicketType(req.body);

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Please correct the ticket form.",
                errors
            });
        }

        const ticketData = prepareTicketData(req.body);

        const ticketType = await createTicketType(
            eventId,
            organiserId,
            ticketData
        );

        return res.status(201).json({
            success: true,
            message: "Ticket type created successfully.",
            ticket_type: ticketType
        });
    } catch (error) {
        console.error("Create ticket type error:", error);

        const handledResponse =
            handleTicketModelError(error, res);

        if (handledResponse) {
            return handledResponse;
        }

        return res.status(500).json({
            success: false,
            message: "Unable to create the ticket type."
        });
    }
};


/*
|--------------------------------------------------------------------------
| Update a ticket type
|--------------------------------------------------------------------------
*/

export const updateEventTicketType = async (
    req,
    res
) => {
    try {
        const organiserId =
            req.session.user.user_id;

        const ticketTypeId = Number(
            req.params.ticketTypeId
        );

        if (
            !Number.isInteger(ticketTypeId)
            || ticketTypeId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid ticket-type ID."
            });
        }

        const errors = validateTicketType(req.body);

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Please correct the ticket form.",
                errors
            });
        }

        const ticketData = prepareTicketData(req.body);

        const ticketType = await updateOwnedTicketType(
            ticketTypeId,
            organiserId,
            ticketData
        );

        return res.status(200).json({
            success: true,
            message: "Ticket type updated successfully.",
            ticket_type: ticketType
        });
    } catch (error) {
        console.error("Update ticket type error:", error);

        const handledResponse =
            handleTicketModelError(error, res);

        if (handledResponse) {
            return handledResponse;
        }

        return res.status(500).json({
            success: false,
            message: "Unable to update the ticket type."
        });
    }
};


/*
|--------------------------------------------------------------------------
| Delete a ticket type
|--------------------------------------------------------------------------
*/

export const deleteEventTicketType = async (
    req,
    res
) => {
    try {
        const organiserId =
            req.session.user.user_id;

        const ticketTypeId = Number(
            req.params.ticketTypeId
        );

        if (
            !Number.isInteger(ticketTypeId)
            || ticketTypeId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid ticket-type ID."
            });
        }

        const deletedTicket =
            await deleteOwnedTicketType(
                ticketTypeId,
                organiserId
            );

        if (!deletedTicket) {
            return res.status(404).json({
                success: false,
                message:
                    "Draft ticket type not found or it cannot be deleted."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Ticket type deleted successfully."
        });
    } catch (error) {
        console.error("Delete ticket type error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete the ticket type."
        });
    }
};