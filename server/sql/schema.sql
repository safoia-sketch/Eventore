-- =============================================
-- EVENTORE DATABASE SCHEMA
-- =============================================

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,

    role VARCHAR(20) NOT NULL DEFAULT 'attendee'
        CHECK (
            role IN (
                'attendee',
                'organiser',
                'staff',
                'administrator'
            )
        ),

    account_status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (
            account_status IN (
                'active',
                'suspended'
            )
        ),

    organiser_approved BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- 2. Event categories
CREATE TABLE IF NOT EXISTS event_categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,

    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (
            status IN (
                'active',
                'inactive'
            )
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- 3. Events
CREATE TABLE IF NOT EXISTS events (
    event_id SERIAL PRIMARY KEY,

    organiser_id INTEGER NOT NULL
        REFERENCES users(user_id),

    category_id INTEGER NOT NULL
        REFERENCES event_categories(category_id),

    event_name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,

    venue_name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(120) NOT NULL,

    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    capacity INTEGER NOT NULL
        CHECK (capacity > 0),

    refund_deadline TIMESTAMPTZ,
    refund_policy TEXT,
    contact_email VARCHAR(255) NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (
            status IN (
                'draft',
                'pending',
                'published',
                'sold_out',
                'cancelled',
                'completed'
            )
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (end_time > start_time)
);


-- 4. Ticket types
CREATE TABLE IF NOT EXISTS ticket_types (
    ticket_type_id SERIAL PRIMARY KEY,

    event_id INTEGER NOT NULL
        REFERENCES events(event_id),

    ticket_name VARCHAR(120) NOT NULL,
    description TEXT,

    price NUMERIC(12, 2) NOT NULL DEFAULT 0
        CHECK (price >= 0),

    quantity_total INTEGER NOT NULL
        CHECK (quantity_total > 0),

    quantity_remaining INTEGER NOT NULL
        CHECK (quantity_remaining >= 0),

    maximum_per_customer INTEGER NOT NULL DEFAULT 10
        CHECK (maximum_per_customer > 0),

    sale_start TIMESTAMPTZ,
    sale_end TIMESTAMPTZ,

    refund_eligible BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (quantity_remaining <= quantity_total),
    CHECK (
        sale_end IS NULL
        OR sale_start IS NULL
        OR sale_end > sale_start
    ),

    UNIQUE (event_id, ticket_name)
);


-- 5. Bookings
CREATE TABLE IF NOT EXISTS bookings (
    booking_id SERIAL PRIMARY KEY,

    attendee_id INTEGER NOT NULL
        REFERENCES users(user_id),

    event_id INTEGER NOT NULL
        REFERENCES events(event_id),

    booking_reference VARCHAR(100) NOT NULL UNIQUE,

    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'confirmed',
                'failed',
                'cancelled'
            )
        ),

    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0
        CHECK (total_amount >= 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ
);


-- 6. Booking items
CREATE TABLE IF NOT EXISTS booking_items (
    booking_item_id SERIAL PRIMARY KEY,

    booking_id INTEGER NOT NULL
        REFERENCES bookings(booking_id),

    ticket_type_id INTEGER NOT NULL
        REFERENCES ticket_types(ticket_type_id),

    quantity INTEGER NOT NULL
        CHECK (quantity > 0),

    unit_price NUMERIC(12, 2) NOT NULL
        CHECK (unit_price >= 0),

    subtotal NUMERIC(12, 2) NOT NULL
        CHECK (subtotal >= 0),

    UNIQUE (booking_id, ticket_type_id)
);


-- 7. Payments
CREATE TABLE IF NOT EXISTS payments (
    payment_id SERIAL PRIMARY KEY,

    booking_id INTEGER NOT NULL
        REFERENCES bookings(booking_id),

    payment_method VARCHAR(30) NOT NULL
        CHECK (
            payment_method IN (
                'free',
                'test_payment',
                'pay_later'
            )
        ),

    amount NUMERIC(12, 2) NOT NULL DEFAULT 0
        CHECK (amount >= 0),

    payment_status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (
            payment_status IN (
                'pending',
                'successful',
                'failed',
                'simulated_refund'
            )
        ),

    transaction_reference VARCHAR(120) UNIQUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- 8. Digital tickets
CREATE TABLE IF NOT EXISTS tickets (
    ticket_id SERIAL PRIMARY KEY,

    booking_item_id INTEGER NOT NULL
        REFERENCES booking_items(booking_item_id),

    attendee_id INTEGER NOT NULL
        REFERENCES users(user_id),

    ticket_code VARCHAR(150) NOT NULL UNIQUE,
    qr_data TEXT NOT NULL,

    ticket_status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (
            ticket_status IN (
                'active',
                'used',
                'cancelled'
            )
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- 9. Check-ins
CREATE TABLE IF NOT EXISTS check_ins (
    check_in_id SERIAL PRIMARY KEY,

    ticket_id INTEGER NOT NULL UNIQUE
        REFERENCES tickets(ticket_id),

    event_id INTEGER NOT NULL
        REFERENCES events(event_id),

    staff_id INTEGER NOT NULL
        REFERENCES users(user_id),

    checked_in_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- 10. Cancellations
CREATE TABLE IF NOT EXISTS cancellations (
    cancellation_id SERIAL PRIMARY KEY,

    booking_id INTEGER NOT NULL UNIQUE
        REFERENCES bookings(booking_id),

    reason TEXT,

    refund_status VARCHAR(30) NOT NULL DEFAULT 'not_required'
        CHECK (
            refund_status IN (
                'not_required',
                'pending',
                'simulated',
                'not_eligible'
            )
        ),

    cancelled_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_users_email
    ON users(email);

CREATE INDEX IF NOT EXISTS idx_events_organiser
    ON events(organiser_id);

CREATE INDEX IF NOT EXISTS idx_events_category
    ON events(category_id);

CREATE INDEX IF NOT EXISTS idx_events_status_date
    ON events(status, event_date);

CREATE INDEX IF NOT EXISTS idx_events_city
    ON events(city);

CREATE INDEX IF NOT EXISTS idx_ticket_types_event
    ON ticket_types(event_id);

CREATE INDEX IF NOT EXISTS idx_bookings_attendee
    ON bookings(attendee_id);

CREATE INDEX IF NOT EXISTS idx_bookings_event
    ON bookings(event_id);

CREATE INDEX IF NOT EXISTS idx_booking_items_booking
    ON booking_items(booking_id);

CREATE INDEX IF NOT EXISTS idx_tickets_attendee
    ON tickets(attendee_id);