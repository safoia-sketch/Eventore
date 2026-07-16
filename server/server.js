import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";

import authRoutes from "./routes/authRoutes.js";

import eventRoutes from "./routes/eventRoutes.js";

import ticketTypeRoutes from "./routes/ticketTypeRoutes.js";

import adminRoutes from "./routes/adminRoutes.js";

import bookingRoutes from "./routes/bookingRoutes.js";

import ticketRoutes from "./routes/ticketRoutes.js";

const app = express();

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN =
    process.env.CLIENT_ORIGIN || "http://localhost:5173";

const isProduction = process.env.NODE_ENV === "production";

if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET is missing from the .env file.");
}

// Required for secure cookies when deployed behind a proxy.
if (isProduction) {
    app.set("trust proxy", 1);
}

app.use(
    cors({
        origin: CLIENT_ORIGIN,
        credentials: true
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        name: "eventore.sid",
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 1000 * 60 * 60 * 24
        }
    })
);

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Eventore API is running."
    });
});
//authantacation route 
app.use("/api/auth", authRoutes);
// event route
app.use("/api/events", eventRoutes);
//
app.use("/api", ticketTypeRoutes);
//admin api
app.use("/api/admin", adminRoutes);
//booking api
app.use("/api/bookings", bookingRoutes);
//
app.use("/api/tickets", ticketRoutes);



app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found."
    });
});

app.use((error, req, res, next) => {
    console.error("Server error:", error);

    res.status(error.status || 500).json({
        success: false,
        message:
            error.message ||
            "An unexpected server error occurred."
    });
});

app.listen(PORT, () => {
    console.log(`Eventore server is running on port ${PORT}`);
    console.log(`API address: http://localhost:${PORT}/api`);
});