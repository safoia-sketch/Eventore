import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import {
    createUser,
    findByEmail
} from "../models/userModel.js";

export const register = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Please correct the highlighted fields.",
                errors: errors.array()
            });
        }

        const {
            fullName,
            email,
            password,
            role = "attendee"
        } = req.body;

        const cleanedName = fullName.trim();
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedRole = role.trim().toLowerCase();

        if (!["attendee", "organiser"].includes(normalizedRole)) {
            return res.status(400).json({
                message:
                    "You can only register as an attendee or organiser."
            });
        }

        const existingUser = await findByEmail(normalizedEmail);

        if (existingUser) {
            return res.status(409).json({
                message:
                    "An account with this email already exists."
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const organiserApproved =
            normalizedRole === "attendee";

        const newUser = await createUser({
            fullName: cleanedName,
            email: normalizedEmail,
            passwordHash,
            role: normalizedRole,
            organiserApproved
        });

        return res.status(201).json({
            message:
                normalizedRole === "organiser"
                    ? "Registration successful. Your organiser account is waiting for administrator approval."
                    : "Registration successful. You can now log in.",
            user: newUser
        });
    } catch (error) {
        console.error("Registration error:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message:
                    "An account with this email already exists."
            });
        }

        return res.status(500).json({
            message:
                "Registration failed. Please try again."
        });
    }
};

export const login = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Please enter a valid email and password.",
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        const normalizedEmail = email.trim().toLowerCase();

        const user = await findByEmail(normalizedEmail);

        // Use the same message for an incorrect email or password.
        // This avoids revealing which email accounts exist.
        if (!user) {
            return res.status(401).json({
                message: "Incorrect email or password."
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Incorrect email or password."
            });
        }

        if (user.account_status === "suspended") {
            return res.status(403).json({
                message:
                    "This account is suspended. Please contact an administrator."
            });
        }

        const safeUser = {
            user_id: user.user_id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            account_status: user.account_status,
            organiser_approved: user.organiser_approved
        };

        // Replace any old session with a fresh session.
        req.session.regenerate((sessionError) => {
            if (sessionError) {
                console.error(
                    "Session regeneration error:",
                    sessionError
                );

                return res.status(500).json({
                    message:
                        "Login failed. Please try again."
                });
            }

            req.session.user = safeUser;

            req.session.save((saveError) => {
                if (saveError) {
                    console.error(
                        "Session save error:",
                        saveError
                    );

                    return res.status(500).json({
                        message:
                            "Login failed. Please try again."
                    });
                }

                return res.status(200).json({
                    message: "Login successful.",
                    user: safeUser
                });
            });
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Login failed. Please try again."
        });
    }
};

export const getCurrentUser = (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            message: "You are not logged in."
        });
    }

    return res.status(200).json({
        user: req.session.user
    });
};

export const logout = (req, res) => {
    if (!req.session) {
        return res.status(200).json({
            message: "Logout successful."
        });
    }

    req.session.destroy((error) => {
        if (error) {
            console.error("Logout error:", error);

            return res.status(500).json({
                message: "Logout failed. Please try again."
            });
        }

        res.clearCookie("eventore.sid", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax"
        });

        return res.status(200).json({
            message: "Logout successful."
        });
    });
};