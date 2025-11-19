const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const diagnoseSymptoms = async (text, options = {}) => {
    const payload = { text };
    if (typeof options.topK === "number" && options.topK > 0) {
        payload.top_k = options.topK;
    }

    try {
        const response = await fetch(`${API_URL}/diagnose`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: response.statusText }));
            throw new Error(errorData.detail || "Failed to get diagnosis");
        }

        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};
