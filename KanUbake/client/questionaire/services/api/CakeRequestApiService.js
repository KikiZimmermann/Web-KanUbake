import { CakeRequestMapper } from "../../mapper/CakeRequestMapper.js";

export class CakeRequestApiService {
    static async saveCakeRequest(cakeRequest) {
        const payload = CakeRequestMapper.toApiPayload(cakeRequest);

        const response = await fetch("http://localhost:3010/api/cake-requests", {
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