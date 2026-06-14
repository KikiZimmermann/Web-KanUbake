import { CakeRequestMapper } from "../../mapper/CakeRequestMapper.js";

export class CakeRequestApiService {
    static getAccessToken() {
        return localStorage.getItem("accessToken");
    }

    static async saveCakeRequest(cakeRequest) {
        const payload = CakeRequestMapper.toApiPayload(cakeRequest);

        const response = await fetch("http://localhost:3010/insert/cake", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.getAccessToken()}`
            },
            credentials: "include",
            body: JSON.stringify(payload)
        }
        );

        if (!response.ok) {
            const errorText = await response.text();

            throw new Error(
                `Saving failed with status ${response.status}: ${errorText}`
            );
        }

        return response.json();
    }

    static async loadCakeRequest(cakeRequestId) {
        const response = await fetch(
            "http://localhost:3010/get/cake",
            {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${this.getAccessToken()}`
                },
                credentials: "include"
            }
        );

        if (!response.ok) {
            const errorText = await response.text();

            throw new Error(
                `Loading failed with status ${response.status}: ${errorText}`
            );
        }

        const apiData = await response.json().data.find(cake => cake.id === cakeRequestId);

        return CakeRequestMapper.fromApiPayload(apiData);
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
                `Saving failed with status ${response.status}: ${errorText}`
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
                `Saving failed with status ${response.status}: ${errorText}`
            );
        }

        return response.json();
    }
}