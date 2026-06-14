/*
  Pricing Validator

  This file checks whether the incoming cake request contains the data
  required for a price estimate.

  It separates invalid requests from requests that can still be estimated
  but require confirmation by the bakery.
*/

class PricingValidator {
    static validate(requestData) {
        const errors = [];
        const messages = [];
        let consultationRequired = false;

        if (!requestData || typeof requestData !== "object") {
            errors.push("Cake request data is missing.");

            return {
                isValid: false,
                errors,
                consultationRequired,
                messages
            };
        }

        const servings = PricingValidator.getServings(requestData);

        if (!Number.isFinite(servings) || servings <= 0) {
            errors.push("A valid number of servings is required.");
        }

        if (!requestData.cakeType) {
            errors.push("Cake type is required.");
        }

        if (!requestData.shape) {
            errors.push("Cake shape is required.");
        }

        if (!Array.isArray(requestData.tierFlavors)) {
            errors.push("Tier flavor data must be an array.");
        }

        if (!Array.isArray(requestData.restrictions)) {
            errors.push("Restrictions must be an array.");
        }

        if (!Array.isArray(requestData.decorations)) {
            errors.push("Decorations must be an array.");
        }

        if (requestData.cakeType === "cupcakes_mini") {
            consultationRequired = true;
            messages.push(
                "Cupcakes and mini cakes require a separate quantity-based estimate."
            );
        }

        if (
            requestData.shape === "sculpted_3d" ||
            requestData.shape === "other"
        ) {
            consultationRequired = true;
            messages.push(
                "The selected cake shape requires confirmation by the bakery."
            );
        }

        if (requestData.designStyle === "luxury") {
            consultationRequired = true;
            messages.push(
                "Luxury designs require confirmation by the bakery."
            );
        }

        if (requestData.designStyle === "comic_cartoon") {
            consultationRequired = true;
            messages.push(
                "Comic or cartoon designs require confirmation by the bakery."
            );
        }

        if (requestData.designStyle === "other") {
            consultationRequired = true;
            messages.push(
                "The selected design style requires confirmation by the bakery."
            );
        }

        PricingValidator.checkTierFlavors(
            requestData.tierFlavors,
            messages,
            () => {
                consultationRequired = true;
            }
        );

        PricingValidator.checkRestrictions(
            requestData.restrictions,
            messages,
            () => {
                consultationRequired = true;
            }
        );

        PricingValidator.checkDecorations(
            requestData.decorations,
            messages,
            () => {
                consultationRequired = true;
            }
        );

        PricingValidator.checkDecorationDetails(requestData, errors, messages, () => {
            consultationRequired = true;
        });

        return {
            isValid: errors.length === 0,
            errors,
            consultationRequired,
            messages
        };
    }

    static getServings(requestData) {
        if (
            requestData.plannedServingsWithBuffer !== "" &&
            requestData.plannedServingsWithBuffer !== null &&
            requestData.plannedServingsWithBuffer !== undefined
        ) {
            return Number(requestData.plannedServingsWithBuffer);
        }

        if (
            requestData.estimatedServings !== "" &&
            requestData.estimatedServings !== null &&
            requestData.estimatedServings !== undefined
        ) {
            return Number(requestData.estimatedServings);
        }

        if (
            requestData.knownServings !== "" &&
            requestData.knownServings !== null &&
            requestData.knownServings !== undefined
        ) {
            return Number(requestData.knownServings);
        }

        return NaN;
    }

    static checkTierFlavors(tierFlavors, messages, markConsultationRequired) {
        if (!Array.isArray(tierFlavors)) {
            return;
        }

        tierFlavors.forEach((tierFlavor) => {
            if (tierFlavor.cakeFlavor === "other") {
                markConsultationRequired();
                messages.push(
                    "The selected cake flavor requires confirmation by the bakery."
                );
            }

            if (tierFlavor.filling === "other") {
                markConsultationRequired();
                messages.push(
                    "The selected filling requires confirmation by the bakery."
                );
            }

            if (tierFlavor.fruitFilling === "other") {
                markConsultationRequired();
                messages.push(
                    "The selected fruit filling requires confirmation by the bakery."
                );
            }

            if (
                tierFlavor.cakeNutType === "other" ||
                tierFlavor.fillingNutType === "other"
            ) {
                markConsultationRequired();
                messages.push(
                    "The selected nut option requires confirmation by the bakery."
                );
            }

            if (tierFlavor.jamFlavor === "other") {
                markConsultationRequired();
                messages.push(
                    "The selected fruit preserve requires confirmation by the bakery."
                );
            }
        });
    }

    static checkRestrictions(restrictions, messages, markConsultationRequired) {
        if (!Array.isArray(restrictions)) {
            return;
        }

        if (restrictions.includes("other")) {
            markConsultationRequired();
            messages.push(
                "Additional allergies or dietary notes require confirmation by the bakery."
            );
        }

        const confirmationRestrictions = [
            "gluten_free",
            "nut_free",
            "peanut_free",
            "egg_free",
            "soy_free"
        ];

        if (
            restrictions.some((restriction) =>
                confirmationRestrictions.includes(restriction)
            )
        ) {
            markConsultationRequired();
            messages.push(
                "Selected allergy-related requirements require confirmation regarding ingredients and cross-contamination."
            );
        }
    }

    static checkDecorations(decorations, messages, markConsultationRequired) {
        if (!Array.isArray(decorations)) {
            return;
        }

        const consultationDecorations = [
            "fresh_flowers",
            "sugar_flowers",
            "ruffles",
            "other"
        ];

        if (
            decorations.some((decoration) =>
                consultationDecorations.includes(decoration)
            )
        ) {
            markConsultationRequired();
            messages.push(
                "One or more selected decorations require confirmation by the bakery."
            );
        }
    }

    static checkDecorationDetails(requestData, errors, messages, markConsultationRequired) {
        const decorations = requestData.decorations;

        if (!Array.isArray(decorations)) {
            return;
        }

        if (decorations.includes("text_lettering")) {
            if (!requestData.textDetails?.text || !requestData.textDetails?.letteringStyle) {
                errors.push("Text and lettering style are required when text lettering is selected.");
            }
        }

        if (decorations.includes("number_age")) {
            if (!requestData.numberAgeDetails?.numberOrAge || !requestData.numberAgeDetails?.displayType) {
                errors.push("Number or age and display type are required when number or age is selected.");
            }
        }

        if (decorations.includes("candles")) {
            const quantity = Number(requestData.candleDetails?.quantity);

            if (!Number.isInteger(quantity) || quantity <= 0) {
                errors.push("A valid candle quantity is required when candles are selected.");
            }
        }

        if (decorations.includes("cake_topper")) {
            PricingValidator.checkSizedDecoration(
                requestData.cakeTopperDetails,
                "cake topper",
                errors,
                messages,
                markConsultationRequired
            );
        }

        if (decorations.includes("figurines")) {
            PricingValidator.checkSizedDecoration(
                requestData.figurineDetails,
                "figurine",
                errors,
                messages,
                markConsultationRequired
            );
        }
    }

    static checkSizedDecoration(details, label, errors, messages, markConsultationRequired) {
        if (!details) {
            errors.push(`${label} details are required.`);
            return;
        }

        if (details.quantity === "4_plus") {
            if (typeof details.description !== "string" || !details.description.trim()) {
                errors.push(`A general description for the ${label}s is required.`);
            }

            markConsultationRequired();
            messages.push(`Four or more ${label}s must be discussed with the bakery.`);
            return;
        }

        const quantity = Number(details.quantity);

        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 3) {
            errors.push(`A valid ${label} quantity between 1 and 3 is required.`);
            return;
        }

        if (!Array.isArray(details.items) || details.items.length !== quantity) {
            errors.push(`Details for every selected ${label} are required.`);
            return;
        }

        details.items.forEach((item, index) => {
            if (typeof item.description !== "string" || !item.description.trim()) {
                errors.push(`Description for ${label} ${index + 1} is required.`);
            }

            if (!["small", "medium", "large"].includes(item.size)) {
                errors.push(`A valid size for ${label} ${index + 1} is required.`);
            }
        });
    }
}

module.exports = {
    PricingValidator
};