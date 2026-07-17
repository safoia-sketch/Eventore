import express from "express";

import {
    getOrganiserDashboard
} from "../controllers/organiserDashboardController.js";

import {
    requireApprovedOrganiser
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
    "/dashboard",
    requireApprovedOrganiser,
    getOrganiserDashboard
);

export default router;