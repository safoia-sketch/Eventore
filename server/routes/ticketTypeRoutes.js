import express from "express";

import {
    createEventTicketType,
    deleteEventTicketType,
    getEventTicketTypes,
    updateEventTicketType
} from "../controllers/ticketTypeController.js";

import {
    requireAuth,
    allowRoles,
    requireApprovedOrganiser
} from "../middleware/authMiddleware.js";

const router = express.Router();

const organiserProtection = [
    requireAuth,
    allowRoles("organiser"),
    requireApprovedOrganiser
];


/*
|--------------------------------------------------------------------------
| Ticket-type routes
|--------------------------------------------------------------------------
*/

// GET /api/events/:eventId/ticket-types
router.get(
    "/events/:eventId/ticket-types",
    organiserProtection,
    getEventTicketTypes
);


// POST /api/events/:eventId/ticket-types
router.post(
    "/events/:eventId/ticket-types",
    organiserProtection,
    createEventTicketType
);


// PUT /api/ticket-types/:ticketTypeId
router.put(
    "/ticket-types/:ticketTypeId",
    organiserProtection,
    updateEventTicketType
);


// DELETE /api/ticket-types/:ticketTypeId
router.delete(
    "/ticket-types/:ticketTypeId",
    organiserProtection,
    deleteEventTicketType
);

export default router;