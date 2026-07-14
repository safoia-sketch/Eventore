const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

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
        error.errors = data.errors || [];

        throw error;
    }

    return data;
};
export const checkApiHealth = () => {
    return apiRequest("/health", {
        method: "GET"
    });
};

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