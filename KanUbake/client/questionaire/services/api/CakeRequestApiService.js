import { CakeRequestMapper } from "../../mapper/CakeRequestMapper.js";
const token = localStorage.getItem("accessToken");

export class CakeRequestApiService {
    static async saveCakeRequest(cakeRequest) {
        const payload = CakeRequestMapper.toApiPayload(cakeRequest);

        const response = await fetch("http://localhost:3010/insert/cake", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            credentials: "include",
            body: JSON.stringify(payload)
        }
        );

        if (!response.ok) {
            const errorText = await response.text();

            throw new Error(
                `Saving failed with status ${response.status}.`
            );
        }

        return response.json();
    }

    static async nutrientsCakeRequest(cakeRequest) {
        const payload = CakeRequestMapper.toApiPayload(cakeRequest);

        const response = await fetch("http://localhost:3010/api/cake-analysis/allergens", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload)
        }
        );

        if (!response.ok) {
            const errorText = await response.text();

            throw new Error(
                `Saving failed with status ${response.status}.`
            );
        }

        return response.json();
    }

    static async analyzeCakeRequest(cakeRequest) {
        const payload = CakeRequestMapper.toApiPayload(cakeRequest);

        const response = await fetch("http://localhost:3010/api/cake-analysis/nutrients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload)
        }
        );

        if (!response.ok) {
            const errorText = await response.text();

            throw new Error(
                `Saving failed with status ${response.status}.`
            );
        }

        return response.json();
    }
}