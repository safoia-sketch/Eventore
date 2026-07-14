import "dotenv/config";

import app from "./app.js";
import pool from "./config/database.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        const result = await pool.query("SELECT NOW() AS current_time");

        console.log(
            "PostgreSQL connected:",
            result.rows[0].current_time
        );

        app.listen(PORT, () => {
            console.log(
                `Eventore server running on http://localhost:${PORT}`
            );
        });
    } catch (error) {
        console.error("Unable to connect to PostgreSQL:", error.message);
        process.exit(1);
    }
}

startServer();