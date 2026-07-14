import express from "express";
import {
    requireAuth,
    allowRoles,
    requireApprovedOrganiser
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Any logged-in user can access this.
router.get("/authenticated", requireAuth, (req, res) => {
    res.status(200).json({
        message: "Authentication check passed.",
        user: req.session.user
    });
});

// Only organisers can access this.
router.get(
    "/organiser",
    requireAuth,
    allowRoles("organiser"),
    (req, res) => {
        res.status(200).json({
            message: "Organiser role check passed."
        });
    }
);

// Only approved organisers can access this.
router.get(
    "/approved-organiser",
    requireAuth,
    requireApprovedOrganiser,
    (req, res) => {
        res.status(200).json({
            message: "Organiser approval check passed."
        });
    }
);

// Only administrators can access this.
router.get(
    "/administrator",
    requireAuth,
    allowRoles("administrator"),
    (req, res) => {
        res.status(200).json({
            message: "Administrator role check passed."
        });
    }
);

export default router;