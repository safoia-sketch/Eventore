import express from "express";

import {
    getMyTickets,
    getTicketById
} from "../controllers/ticketController.js";

import {
    allowRoles,
    requireAuth
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
    "/me",
    requireAuth,
    allowRoles("attendee"),
    getMyTickets
);

router.get(
    "/:ticketId",
    requireAuth,
    allowRoles("attendee"),
    getTicketById
);

export default router;