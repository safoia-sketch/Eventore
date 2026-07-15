import express from "express";

import {
    createDraftEvent,
    getMyEvents,
    getMyEventById,
    updateDraftEvent,
    deleteDraftEvent,
    getCategories,
    submitEventForApproval
} from "../controllers/eventController.js";

import {
    requireAuth,
    allowRoles,
    requireApprovedOrganiser
} from "../middleware/authMiddleware.js";

import {
    getPublicEventById,
    getPublicEvents
} from "../controllers/publicEventController.js";

const router = express.Router();

const organiserProtection = [
    requireAuth,
    allowRoles("organiser"),
    requireApprovedOrganiser
];


/*
|--------------------------------------------------------------------------
| Public category route
|--------------------------------------------------------------------------
| GET /api/events/categories
*/

router.get(
    "/categories",
    getCategories
);


// GET /api/events
router.get(
    "/",
    getPublicEvents
);

/*
|--------------------------------------------------------------------------
| Organiser event routes
|--------------------------------------------------------------------------
| These routes require an authenticated and approved organiser.
*/

// GET /api/events/mine
router.get(
    "/mine",
    organiserProtection,
    getMyEvents
);


// GET /api/events/mine/:eventId
router.get(
    "/mine/:eventId",
    organiserProtection,
    getMyEventById
);


// POST /api/events
router.post(
    "/",
    organiserProtection,
    createDraftEvent
);

//
// POST /api/events/:eventId/submit
router.post(
    "/:eventId/submit",
    organiserProtection,
    submitEventForApproval
);


// PUT /api/events/:eventId
router.put(
    "/:eventId",
    organiserProtection,
    updateDraftEvent
);


// DELETE /api/events/:eventId
router.delete(
    "/:eventId",
    organiserProtection,
    deleteDraftEvent
);

// GET /api/events/:eventId
router.get(
    "/:eventId",
    getPublicEventById
);

export default router;