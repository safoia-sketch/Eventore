import pool from "../config/database.js";

// Find a user by email.
// Used during registration and login.
export const findByEmail = async (email) => {
    const result = await pool.query(
        `
        SELECT
            user_id,
            full_name,
            email,
            password_hash,
            role,
            account_status,
            organiser_approved,
            created_at
        FROM users
        WHERE email = $1
        `,
        [email]
    );

    return result.rows[0];
};

// Create a new attendee or organiser.
export const createUser = async ({
    fullName,
    email,
    passwordHash,
    role,
    organiserApproved
}) => {
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
        RETURNING
            user_id,
            full_name,
            email,
            role,
            account_status,
            organiser_approved,
            created_at
        `,
        [
            fullName,
            email,
            passwordHash,
            role,
            organiserApproved
        ]
    );

    return result.rows[0];
};

// Find a user by their ID.
// The password is deliberately excluded.
export const findById = async (userId) => {
    const result = await pool.query(
        `
        SELECT
            user_id,
            full_name,
            email,
            role,
            account_status,
            organiser_approved,
            created_at
        FROM users
        WHERE user_id = $1
        `,
        [userId]
    );

    return result.rows[0];
};

// Update whether an account is active or suspended.
export const updateStatus = async (userId, accountStatus) => {
    const result = await pool.query(
        `
        UPDATE users
        SET account_status = $1
        WHERE user_id = $2
        RETURNING
            user_id,
            full_name,
            email,
            role,
            account_status,
            organiser_approved
        `,
        [accountStatus, userId]
    );

    return result.rows[0];
};