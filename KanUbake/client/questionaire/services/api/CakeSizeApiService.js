/*
  Cake Size API Service

  This frontend service calls the backend cake size API.
  It is used by the questionnaire form to estimate cake size and servings.
*/

const API_BASE_URL = "http://localhost:3010";

export class CakeSizeApiService {
    async estimateSizeByServings({ servings, shape, servingSize, tiers }) {
        const query = new URLSearchParams({
            servings: servings,
            shape: shape,
            servingSize: servingSize,
            tiers: tiers
        });

        const response = await fetch(`${API_BASE_URL}/api/cake-size?${query}`);

        if (!response.ok) {
            throw new Error("Cake size estimate request failed.");
        }

        return await response.json();
    }

    async estimateServingsBySize({ sizeId, shape, servingSize, tiers }) {
        const query = new URLSearchParams({
            sizeId: sizeId,
            shape: shape,
            servingSize: servingSize,
            tiers: tiers
        });

        const response = await fetch(`${API_BASE_URL}/api/cake-servings?${query}`);

        if (!response.ok) {
            throw new Error("Cake servings estimate request failed.");
        }

        return await response.json();
    }

    async getAvailableCakeSizes({ shape, tiers }) {
        const query = new URLSearchParams({
            shape: shape,
            tiers: tiers
        });

        const response = await fetch(`${API_BASE_URL}/api/cake-sizes?${query}`);

        if (!response.ok) {
            throw new Error("Cake size options request failed.");
        }

        return await response.json();
    }
}