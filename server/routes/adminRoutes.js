import express from "express";

import {
    approveEvent,
    approveOrganiser,
    cancelEvent,
    getPendingEvent,
    getPendingEvents,
    getPendingOrganisers,
    rejectEvent
} from "../controllers/adminController.js";

import {
    requireAuth,
    allowRoles
} from "../middleware/authMiddleware.js";

const router = express.Router();

const administratorProtection = [
    requireAuth,
    allowRoles("administrator")
];


/*
|--------------------------------------------------------------------------
| Protect every administrator route below
|--------------------------------------------------------------------------
*/

router.use(administratorProtection);


/*
|--------------------------------------------------------------------------
| Organiser approval
|--------------------------------------------------------------------------
*/

// GET /api/admin/organisers/pending
router.get(
    "/organisers/pending",
    getPendingOrganisers
);


// PATCH /api/admin/organisers/:userId/approve
router.patch(
    "/organisers/:userId/approve",
    approveOrganiser
);


/*
|--------------------------------------------------------------------------
| Event approval
|--------------------------------------------------------------------------
*/

// GET /api/admin/events/pending
router.get(
    "/events/pending",
    getPendingEvents
);


// GET /api/admin/events/:eventId
router.get(
    "/events/:eventId",
    getPendingEvent
);


// PATCH /api/admin/events/:eventId/approve
router.patch(
    "/events/:eventId/approve",
    approveEvent
);


// PATCH /api/admin/events/:eventId/reject
router.patch(
    "/events/:eventId/reject",
    rejectEvent
);


// PATCH /api/admin/events/:eventId/cancel
router.patch(
    "/events/:eventId/cancel",
    cancelEvent
);

export default router;