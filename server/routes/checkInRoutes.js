import express from "express";

import {
    checkInTicket,
    getAvailableCheckInEvents
} from "../controllers/checkInController.js";

import {
    allowRoles,
    requireAuth
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
    "/events",
    requireAuth,
    allowRoles("staff"),
    getAvailableCheckInEvents
);

router.post(
    "/validate",
    requireAuth,
    allowRoles("staff"),
    checkInTicket
);

export default router;