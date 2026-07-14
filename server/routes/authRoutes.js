import express from "express";
import { body } from "express-validator";
import {
    register,
    login,
    logout,
    getCurrentUser
} from "../controllers/authController.js";

const router = express.Router();

const registrationValidation = [
    body("fullName")
        .trim()
        .notEmpty()
        .withMessage("Full name is required.")
        .isLength({ min: 2, max: 100 })
        .withMessage(
            "Full name must be between 2 and 100 characters."
        ),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required.")
        .isEmail()
        .withMessage("Please provide a valid email address.")
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage("Password is required.")
        .isLength({ min: 8, max: 72 })
        .withMessage(
            "Password must be between 8 and 72 characters."
        )
        .matches(/[a-z]/)
        .withMessage(
            "Password must contain a lowercase letter."
        )
        .matches(/[A-Z]/)
        .withMessage(
            "Password must contain an uppercase letter."
        )
        .matches(/[0-9]/)
        .withMessage("Password must contain a number."),

    body("role")
        .optional()
        .trim()
        .toLowerCase()
        .isIn(["attendee", "organiser"])
        .withMessage("Role must be attendee or organiser.")
];

const loginValidation = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required.")
        .isEmail()
        .withMessage("Please provide a valid email address.")
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage("Password is required.")
];

router.post("/register", registrationValidation, register);
router.post("/login", loginValidation, login);
router.get("/me", getCurrentUser);
router.post("/logout", logout);

export default router;