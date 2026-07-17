import express from "express";

import {
    cancelBooking,
    createBooking,
    getBookingById,
    getMyBookings
} from "../controllers/bookingController.js";

import {
    allowRoles,
    requireAuth
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
    "/",
    requireAuth,
    allowRoles("attendee"),
    createBooking
);

router.get(
    "/me",
    requireAuth,
    allowRoles("attendee"),
    getMyBookings
);
router.post(
    "/:bookingId/cancel",
    requireAuth,
    allowRoles("attendee"),
    cancelBooking
);

router.get(
    "/:bookingId",
    requireAuth,
    allowRoles("attendee"),
    getBookingById
);

export default router;