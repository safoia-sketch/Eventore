import "dotenv/config";
import bcrypt from "bcrypt";

import pool from "../config/database.js";

const developmentUsers = [
    {
        fullName: "Test Staff",
        email: "staff@example.com",
        password: "Test12345",
        role: "staff",
        organiserApproved: false
    },
    {
        fullName: "Test Administrator",
        email: "admin@example.com",
        password: "Test12345",
        role: "administrator",
        organiserApproved: false
    }
];

async function createDevelopmentUsers() {
    try {
        for (const user of developmentUsers) {
            const passwordHash = await bcrypt.hash(
                user.password,
                12
            );

            const result = await pool.query(
                `
                INSERT INTO users (
                    full_name,
                    email,
                    password_hash,
                    role,
                    account_status,
                    organiser_approved
                )
                VALUES ($1, $2, $3, $4, 'active', $5)
                ON CONFLICT (email)
                DO NOTHING
                RETURNING user_id, full_name, email, role
                `,
                [
                    user.fullName,
                    user.email,
                    passwordHash,
                    user.role,
                    user.organiserApproved
                ]
            );

            if (result.rows.length === 0) {
                console.log(
                    `${user.email} already exists.`
                );
            } else {
                console.log(
                    `Created ${user.role}: ${user.email}`
                );
            }
        }
    } catch (error) {
        console.error(
            "Unable to create development users:",
            error
        );

        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

createDevelopmentUsers();