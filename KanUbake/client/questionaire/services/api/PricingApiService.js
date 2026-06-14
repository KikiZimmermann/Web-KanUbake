/*
  Pricing API Service

  This class sends the current cake request to the backend pricing API
  and returns the estimated price result.

  It uses the existing CakeRequestMapper so no separate pricing mapper
  is required.
*/

import { CakeRequestMapper } from "../../mapper/CakeRequestMapper.js";

export class PricingApiService {
    static async estimatePrice(cakeRequest) {
        const payload =
            CakeRequestMapper.toApiPayload(cakeRequest);

        const response = await fetch(
            "http://localhost:3010/api/pricing/estimate",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);

            throw new Error(
                errorData?.message ||
                `Price estimate failed with status ${response.status}.`
            );
        }

        return response.json();
    }
}