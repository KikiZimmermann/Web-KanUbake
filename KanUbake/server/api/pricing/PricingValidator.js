/*
  Pricing Validator

  This file checks whether the incoming cake request contains the data
  required for a price estimate.

  It separates invalid requests from requests that can still be estimated
  but require confirmation by the confectionist.
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
                "The selected cake shape requires confirmation by the confectionist."
            );
        }

        if (requestData.designStyle === "luxury") {
            consultationRequired = true;
            messages.push(
                "Luxury designs require confirmation by the confectionist."
            );
        }

        if (requestData.designStyle === "comic_cartoon") {
            consultationRequired = true;
            messages.push(
                "Comic or cartoon designs require confirmation by the confectionist."
            );
        }

        if (requestData.designStyle === "other") {
            consultationRequired = true;
            messages.push(
                "The selected design style requires confirmation by the confectionist."
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
                    "The selected cake flavor requires confirmation by the confectionist."
                );
            }

            if (tierFlavor.filling === "other") {
                markConsultationRequired();
                messages.push(
                    "The selected filling requires confirmation by the confectionist."
                );
            }

            if (tierFlavor.fruitFilling === "other") {
                markConsultationRequired();
                messages.push(
                    "The selected fruit filling requires confirmation by the confectionist."
                );
            }

            if (
                tierFlavor.cakeNutType === "other" ||
                tierFlavor.fillingNutType === "other"
            ) {
                markConsultationRequired();
                messages.push(
                    "The selected nut option requires confirmation by the confectionist."
                );
            }

            if (tierFlavor.jamFlavor === "other") {
                markConsultationRequired();
                messages.push(
                    "The selected fruit preserve requires confirmation by the confectionist."
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
                "Additional allergies or dietary notes require confirmation by the confectionist."
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
            "figurines",
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
                "One or more selected decorations require confirmation by the confectionist."
            );
        }
    }
}

module.exports = {
    PricingValidator
};