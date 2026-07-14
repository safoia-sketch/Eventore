const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

export async function checkApiHealth() {
    const response = await fetch(`${API_URL}/health`, {
        method: "GET",
        credentials: "include"
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Unable to connect to the API"
        );
    }

    return data;
}