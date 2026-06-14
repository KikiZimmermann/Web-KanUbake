/*
  Pricing Service

  This file contains the actual price calculation for the pricing API.
  It uses the values from PricingRules and validates the request before
  calculating an estimated price range.

  The internal calculation details are not returned to the frontend.
*/

const { pricingRules } = require("./PricingRules");
const { PricingValidator } = require("./PricingValidator");

class PricingService {
    static estimatePrice(requestData) {
        const validation = PricingValidator.validate(requestData);

        if (!validation.isValid) {
            const error = new Error("The cake request cannot be priced.");
            error.statusCode = 400;
            error.details = validation.errors;
            throw error;
        }

        const servings = PricingValidator.getServings(requestData);

        const basePrice =
            PricingService.calculateBasePrice(requestData, servings);

        const tierSurcharge =
            PricingService.calculateTierSurcharge(requestData, servings);

        const fillingSurcharge =
            PricingService.calculateFillingSurcharge(requestData, servings);

        const coveringSurcharge =
            PricingService.calculateCoveringSurcharge(requestData, servings);

        const fondantLayerSurcharge =
            PricingService.calculateFondantLayerSurcharge(requestData, servings);

        const restrictionSurcharge =
            PricingService.calculateRestrictionSurcharge(requestData, servings);

        const designSurcharge =
            PricingService.calculateDesignSurcharge(requestData);

        const decorationSurcharge =
            PricingService.calculateDecorationSurcharge(requestData);

        const total =
            basePrice +
            tierSurcharge +
            fillingSurcharge +
            coveringSurcharge +
            fondantLayerSurcharge +
            restrictionSurcharge +
            designSurcharge +
            decorationSurcharge;

        const minimumFactor =
            pricingRules.priceRange.defaultMinimumFactor;

        const maximumFactor =
            validation.consultationRequired
                ? pricingRules.priceRange.consultationMaximumFactor
                : pricingRules.priceRange.defaultMaximumFactor;

        return {
            currency: pricingRules.currency,
            estimatedMinimum: Math.round(total * minimumFactor),
            estimatedMaximum: Math.round(total * maximumFactor),
            consultationRequired: validation.consultationRequired,
            messages: validation.messages
        };
    }

    static calculateBasePrice(requestData, servings) {
        const pricePerServing =
            pricingRules.cakeTypeBasePrices[requestData.cakeType];

        if (typeof pricePerServing !== "number") {
            return 0;
        }

        return servings * pricePerServing;
    }

    static calculateTierSurcharge(requestData, servings) {
        const surchargePerServing =
            pricingRules.tierSurchargesPerServing[requestData.tiers] ?? 0;

        return servings * surchargePerServing;
    }

    static calculateFillingSurcharge(requestData, servings) {
        if (
            !Array.isArray(requestData.tierFlavors) ||
            requestData.tierFlavors.length === 0
        ) {
            return 0;
        }

        const surcharges = requestData.tierFlavors.map((tierFlavor) => {
            const surcharge =
                pricingRules.fillingSurchargesPerServing[tierFlavor.filling];

            return typeof surcharge === "number" ? surcharge : 0;
        });

        const highestSurcharge = Math.max(...surcharges, 0);

        return servings * highestSurcharge;
    }

    static calculateCoveringSurcharge(requestData, servings) {
        const surchargePerServing =
            pricingRules.coveringSurchargesPerServing[requestData.covering];

        if (typeof surchargePerServing !== "number") {
            return 0;
        }

        return servings * surchargePerServing;
    }

    static calculateFondantLayerSurcharge(requestData, servings) {
        if (requestData.covering !== "fondant") {
            return 0;
        }

        if (
            Array.isArray(requestData.fondantLayerDetails) &&
            requestData.fondantLayerDetails.length > 0
        ) {
            const surcharges = requestData.fondantLayerDetails.map((layer) => {
                const surcharge =
                    pricingRules.fondantLayerSurchargesPerServing[layer.layerType];

                return typeof surcharge === "number" ? surcharge : 0;
            });

            return servings * Math.max(...surcharges, 0);
        }

        const surchargePerServing =
            pricingRules.fondantLayerSurchargesPerServing[
            requestData.fondantLayer
            ];

        if (typeof surchargePerServing !== "number") {
            return 0;
        }

        return servings * surchargePerServing;
    }

    static calculateRestrictionSurcharge(requestData, servings) {
        if (!Array.isArray(requestData.restrictions)) {
            return 0;
        }

        const restrictions = [...requestData.restrictions];

        if (restrictions.includes("vegan")) {
            const veganPrice =
                pricingRules.restrictionSurchargesPerServing.vegan;

            const glutenFreePrice = restrictions.includes("gluten_free")
                ? pricingRules.restrictionSurchargesPerServing.gluten_free
                : 0;

            return servings * (veganPrice + glutenFreePrice);
        }

        const surchargePerServing = restrictions.reduce(
            (total, restriction) => {
                const surcharge =
                    pricingRules.restrictionSurchargesPerServing[restriction];

                return total + (
                    typeof surcharge === "number"
                        ? surcharge
                        : 0
                );
            },
            0
        );

        return servings * surchargePerServing;
    }

    static calculateDesignSurcharge(requestData) {
        const surcharge =
            pricingRules.designStyleSurchargesFixed[requestData.designStyle];

        return typeof surcharge === "number" ? surcharge : 0;
    }

    static calculateDecorationSurcharge(requestData) {
        if (!Array.isArray(requestData.decorations)) {
            return 0;
        }

        let total = requestData.decorations.reduce(
            (sum, decoration) => {
                const surcharge =
                    pricingRules.decorationSurchargesFixed[decoration];

                return sum + (
                    typeof surcharge === "number"
                        ? surcharge
                        : 0
                );
            },
            0
        );

        if (
            requestData.decorations.includes("number_age") &&
            requestData.numberAgeDetails
        ) {
            const displayType =
                requestData.numberAgeDetails.displayType;

            const surcharge =
                pricingRules.numberDisplayTypeSurchargesFixed[displayType];

            if (typeof surcharge === "number") {
                total += surcharge;
            }
        }

        return total;
    }
}

module.exports = {
    PricingService
};