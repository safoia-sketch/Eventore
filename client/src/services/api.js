const API_BASE_URL =
    import.meta.env.VITE_API_URL
    || "http://localhost:5000/api";

export const apiRequest = async (
    endpoint,
    options = {}
) => {
    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,

            // Send the session cookie with every request.
            credentials: "include",

            headers: {
                "Content-Type": "application/json",
                ...options.headers
            }
        }
    );

    let data = {};

    const contentType = response.headers.get(
        "content-type"
    );

    if (contentType?.includes("application/json")) {
        data = await response.json();
    }

    if (!response.ok) {
        const error = new Error(
            data.message || "Something went wrong."
        );

        error.status = response.status;
        error.errors = data.errors || {};

        throw error;
    }

    return data;
};


/*
|--------------------------------------------------------------------------
| Health API
|--------------------------------------------------------------------------
*/

export const checkApiHealth = () => {
    return apiRequest("/health", {
        method: "GET"
    });
};


/*
|--------------------------------------------------------------------------
| Authentication API
|--------------------------------------------------------------------------
*/

export const authApi = {
    register: (formData) =>
        apiRequest("/auth/register", {
            method: "POST",
            body: JSON.stringify(formData)
        }),

    login: (formData) =>
        apiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify(formData)
        }),

    getCurrentUser: () =>
        apiRequest("/auth/me", {
            method: "GET"
        }),

    logout: () =>
        apiRequest("/auth/logout", {
            method: "POST"
        })
};

/*
|--------------------------------------------------------------------------
| Event and ticket-type API
|--------------------------------------------------------------------------
*/

export const eventApi = {
    // Public: get active event categories
    getCategories: () =>
        apiRequest("/events/categories", {
            method: "GET"
        }),

    // Public: get published events with optional filters
    getPublicEvents: (filters = {}) => {
    const parameters = new URLSearchParams();

    if (filters.search) {
        parameters.set("search", filters.search);
    }

    if (filters.category) {
        parameters.set(
            "category",
            filters.category
        );
    }

    if (filters.location) {
        parameters.set(
            "location",
            filters.location
        );
    }

    if (filters.pricing) {
        parameters.set(
            "pricing",
            filters.pricing
        );
    }

    const query = parameters.toString();

    return apiRequest(
        `/events${query ? `?${query}` : ""}`,
        {
            method: "GET"
        }
    );
    },

    // Public: get one published event
    getPublicEventById: (eventId) =>
    apiRequest(`/events/${eventId}`, {
        method: "GET"
    }),
    // Organiser: get all owned events
    getMyEvents: () =>
        apiRequest("/events/mine", {
            method: "GET"
        }),

    // Organiser: get one owned event
    getMyEventById: (eventId) =>
        apiRequest(`/events/mine/${eventId}`, {
            method: "GET"
        }),

    // Organiser: create a draft event
    createEvent: (formData) =>
        apiRequest("/events", {
            method: "POST",
            body: JSON.stringify(formData)
        }),

    // Organiser: update an owned draft
    updateEvent: (eventId, formData) =>
        apiRequest(`/events/${eventId}`, {
            method: "PUT",
            body: JSON.stringify(formData)
        }),
    
    // Organiser: submit a draft for administrator approval
    submitEvent: (eventId) =>
        apiRequest(`/events/${eventId}/submit`, {
            method: "POST"
        }),

    // Organiser: delete an owned draft
    deleteEvent: (eventId) =>
        apiRequest(`/events/${eventId}`, {
            method: "DELETE"
        }),

    // Organiser: get an event's ticket types
    getTicketTypes: (eventId) =>
        apiRequest(
            `/events/${eventId}/ticket-types`,
            {
                method: "GET"
            }
        ),

    // Organiser: create a ticket type
    createTicketType: (eventId, formData) =>
        apiRequest(
            `/events/${eventId}/ticket-types`,
            {
                method: "POST",
                body: JSON.stringify(formData)
            }
        ),

    // Organiser: update a ticket type
    updateTicketType: (
        ticketTypeId,
        formData
    ) =>
        apiRequest(
            `/ticket-types/${ticketTypeId}`,
            {
                method: "PUT",
                body: JSON.stringify(formData)
            }
        ),

    // Organiser: delete a ticket type
    deleteTicketType: (ticketTypeId) =>
        apiRequest(
            `/ticket-types/${ticketTypeId}`,
            {
                method: "DELETE"
            }
        )
};

/*
|--------------------------------------------------------------------------
| Administrator API
|--------------------------------------------------------------------------
*/

export const adminApi = {
    // Get organiser accounts awaiting approval
    getDashboard: () =>
    apiRequest("/admin/dashboard", {
        method: "GET"
    }),
    getPendingOrganisers: () =>
        apiRequest(
            "/admin/organisers/pending",
            {
                method: "GET"
            }
        ),

    // Approve an organiser account
    approveOrganiser: (userId) =>
        apiRequest(
            `/admin/organisers/${userId}/approve`,
            {
                method: "PATCH"
            }
        ),

    // Get events awaiting approval
    getPendingEvents: () =>
        apiRequest(
            "/admin/events/pending",
            {
                method: "GET"
            }
        ),

    // Review one pending event and its tickets
    getPendingEvent: (eventId) =>
        apiRequest(
            `/admin/events/${eventId}`,
            {
                method: "GET"
            }
        ),

    // Approve and publish an event
    approveEvent: (eventId) =>
        apiRequest(
            `/admin/events/${eventId}/approve`,
            {
                method: "PATCH"
            }
        ),

    // Return an event to draft with feedback
    rejectEvent: (eventId, reason) =>
        apiRequest(
            `/admin/events/${eventId}/reject`,
            {
                method: "PATCH",
                body: JSON.stringify({ reason })
            }
        ),
    

    // Cancel a published event
    cancelEvent: (eventId, reason) =>
        apiRequest(
            `/admin/events/${eventId}/cancel`,
            {
                method: "PATCH",
                body: JSON.stringify({ reason })
            }
        )
};


/*
|--------------------------------------------------------------------------
| Booking API
|--------------------------------------------------------------------------
*/

export const bookingApi = {
    createBooking: (bookingData) =>
        apiRequest("/bookings", {
            method: "POST",
            body: JSON.stringify(bookingData)
        }),

    getMyBookings: () =>
        apiRequest("/bookings/me", {
            method: "GET"
        }),

    getBookingById: (bookingId) =>
        apiRequest(`/bookings/${bookingId}`, {
            method: "GET"
        }),

    cancelBooking: (bookingId, reason) =>
        apiRequest(
            `/bookings/${bookingId}/cancel`,
            {
                method: "POST",
                body: JSON.stringify({
                    reason
                })
            }
        )
};
/*
|--------------------------------------------------------------------------
| Digital ticket API
|--------------------------------------------------------------------------
*/

export const ticketApi = {
    getMyTickets: () =>
        apiRequest("/tickets/me", {
            method: "GET"
        }),

    getTicketById: (ticketId) =>
        apiRequest(`/tickets/${ticketId}`, {
            method: "GET"
        })
};
/*
|--------------------------------------------------------------------------
| Staff check-in API
|--------------------------------------------------------------------------
*/

export const checkInApi = {
    getEvents: () =>
        apiRequest("/check-ins/events", {
            method: "GET"
        }),

    validateTicket: (checkInData) =>
        apiRequest("/check-ins/validate", {
            method: "POST",
            body: JSON.stringify(checkInData)
        })
};

/*
|--------------------------------------------------------------------------
| Organiser dashboard API
|--------------------------------------------------------------------------
*/

export const organiserApi = {
    getDashboard: () =>
        apiRequest("/organiser/dashboard", {
            method: "GET"
        })
};