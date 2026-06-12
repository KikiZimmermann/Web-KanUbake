/*
  Color API Service

  This service communicates with The Color API.
  It does not create or modify HTML elements.
*/

export class ColorApiService {
    constructor() {
        this.baseUrl = "https://www.thecolorapi.com";
    }

    async getColorInformation(hex) {
        const cleanHex = this.cleanHex(hex);

        const url = new URL(`${this.baseUrl}/id`);
        url.searchParams.set("hex", cleanHex);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                `Color information request failed with status ${response.status}.`
            );
        }

        return response.json();
    }

    async getColorScheme(hex, mode = "analogic", count = 5) {
        const cleanHex = this.cleanHex(hex);

        const url = new URL(`${this.baseUrl}/scheme`);

        url.searchParams.set("hex", cleanHex);
        url.searchParams.set("mode", mode);
        url.searchParams.set("count", String(count));

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                `Color scheme request failed with status ${response.status}.`
            );
        }

        return response.json();
    }

    cleanHex(hex) {
        if (typeof hex !== "string") {
            throw new TypeError("The HEX color must be a string.");
        }

        return hex.replace("#", "").trim();
    }
}