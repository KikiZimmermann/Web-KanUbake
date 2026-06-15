/*
  Questionnaire Compatibility Service

  This class checks which questionnaire options are compatible with
  the current cake request.

  It returns whether an option should be allowed, disabled or shown
  with a warning and provides the corresponding explanation.
*/

import { CakeRequestApiService } from "./api/CakeRequestApiService.js";

export class QuestionnaireCompatibilityService {
    static createAllowedState() {
        return {
            disabled: false,
            warning: false,
            message: ""
        };
    }

    static createDisabledState(message) {
        return {
            disabled: true,
            warning: false,
            message
        };
    }

    static createWarningState(message) {
        return {
            disabled: false,
            warning: true,
            message
        };
    }

    static getOptionState(
        cakeRequest,
        fieldName,
        optionValue,
        context = {}
    ) {
        if (!cakeRequest || !fieldName || !optionValue) {
            return this.createAllowedState();
        }

        switch (fieldName) {
            case "covering":
                return this.getCoveringState(cakeRequest, optionValue);

            case "cakeFlavor":
                return this.getCakeFlavorState(cakeRequest, optionValue);

            case "filling":
                return this.getFillingState(cakeRequest, optionValue);

            case "cakeNutType":
            case "fillingNutType":
                return this.getNutTypeState(cakeRequest, optionValue);

            case "buttercreamType":
            case "coveringButtercreamType":
            case "fondantButtercreamType":
                return this.getButtercreamTypeState(
                    cakeRequest,
                    optionValue
                );

            case "fondantLayer":
                return this.getFondantLayerState(
                    cakeRequest,
                    optionValue,
                    context
                );

            case "decorations":
                return this.getDecorationState(
                    cakeRequest,
                    optionValue
                );

            default:
                return this.createAllowedState();
        }
    }

    static getCoveringState(cakeRequest, optionValue) {
        const cakeType = cakeRequest.cakeType;

        const nakedCakeDisabledCoverings = [
            "buttercream",
            "ganache",
            "chocolate_glaze",
            "fondant",
            "whipped_cream",
            "mascarpone_cream",
            "cream_cheese",
            "fruit_glaze"
        ];

        const semiNakedCakeDisabledCoverings = [
            "ganache",
            "chocolate_glaze",
            "fondant",
            "whipped_cream",
            "mascarpone_cream",
            "cream_cheese",
            "fruit_glaze"
        ];

        if (
            cakeType === "naked_cake" &&
            nakedCakeDisabledCoverings.includes(optionValue)
        ) {
            return this.createDisabledState(
                "This covering would hide the exposed cake layers that define a naked cake."
            );
        }

        if (
            cakeType === "semi_naked_cake" &&
            semiNakedCakeDisabledCoverings.includes(optionValue)
        ) {
            return this.createDisabledState(
                "This covering would hide the lightly exposed finish that defines a semi-naked cake."
            );
        }

        if (
            cakeType === "fruit_cake" &&
            optionValue === "fondant"
        ) {
            return this.createDisabledState(
                "Fondant is not suitable for this fresh fruit cake style because moisture from the fruit may soften or damage it."
            );
        }

        return this.createAllowedState();
    }

    static getCakeFlavorState(cakeRequest, optionValue) {
        if (
            this.hasRestriction(cakeRequest, "nut_free") &&
            optionValue === "nut"
        ) {
            return this.createDisabledState(
                "Nut cake is not compatible with a nut-free request."
            );
        }

        return this.createAllowedState();
    }

    static getFillingState(cakeRequest, optionValue) {
        if (
            this.hasRestriction(cakeRequest, "nut_free") &&
            optionValue === "nut_cream"
        ) {
            return this.createDisabledState(
                "Nut cream is not compatible with a nut-free request."
            );
        }

        return this.createAllowedState();
    }

    static getNutTypeState(cakeRequest, optionValue) {
        if (this.hasRestriction(cakeRequest, "nut_free")) {
            return this.createDisabledState(
                "Nut-based ingredients are not compatible with a nut-free request."
            );
        }

        if (
            this.hasRestriction(cakeRequest, "peanut_free") &&
            ["peanut", "mixed_nuts"].includes(optionValue)
        ) {
            return this.createDisabledState(
                "This option may contain peanuts and is not compatible with a peanut-free request."
            );
        }

        return this.createAllowedState();
    }

    static getButtercreamTypeState(cakeRequest, optionValue) {
        const containsEgg = ["swiss", "italian"].includes(optionValue);

        if (
            containsEgg &&
            this.hasRestriction(cakeRequest, "egg_free")
        ) {
            return this.createDisabledState(
                "Swiss and Italian meringue buttercream contain egg whites and are not compatible with an egg-free request."
            );
        }

        if (
            containsEgg &&
            this.hasRestriction(cakeRequest, "vegan")
        ) {
            return this.createDisabledState(
                "Swiss and Italian meringue buttercream traditionally contain egg whites and dairy and are not compatible with a vegan request."
            );
        }

        return this.createAllowedState();
    }

    static getFondantLayerState(
        cakeRequest,
        optionValue,
        context = {}
    ) {
        if (optionValue !== "marmalade") {
            return this.createAllowedState();
        }

        const relevantTierFlavors =
            this.getRelevantTierFlavors(cakeRequest, context);

        const hasMoistWaterBasedFilling =
            relevantTierFlavors.some((tierFlavor) =>
                ["berry_cream", "fruit_filling"].includes(
                    tierFlavor.filling
                )
            );

        if (hasMoistWaterBasedFilling) {
            return this.createDisabledState(
                "This cake already contains a moist, water-based filling. An additional fruit preserve layer may soften or damage the fondant. Please choose buttercream or ganache instead."
            );
        }

        return this.createAllowedState();
    }

    static hasNakedStyle(cakeRequest) {
        return (
            ["naked_cake", "semi_naked_cake"].includes(
                cakeRequest.cakeType
            ) ||
            cakeRequest.covering === "naked_semi_naked"
        );
    }

    static getDecorationState(cakeRequest, optionValue) {
        const cakeType = cakeRequest.cakeType;
        const covering = cakeRequest.covering;

        const hasNakedStyle =
            this.hasNakedStyle(cakeRequest);

        const moistCoverings = [
            "whipped_cream",
            "mascarpone_cream",
            "cream_cheese",
            "fruit_glaze"
        ];

        /*
          Ruffles need a fully covered surface.
        */
        if (
            hasNakedStyle &&
            optionValue === "ruffles"
        ) {
            return this.createDisabledState(
                "Ruffles require a fully covered outer surface and are not compatible with a naked or semi-naked finish."
            );
        }

        /*
          Edible prints need a smooth and relatively dry surface.
        */
        if (
            (
                hasNakedStyle ||
                cakeType === "fruit_cake"
            ) &&
            optionValue === "edible_print"
        ) {
            return this.createDisabledState(
                "An edible print requires a flat, smooth and relatively dry surface, which this cake style does not normally provide."
            );
        }

        /*
          Wafer paper is sensitive to moisture.
        */
        if (
            moistCoverings.includes(covering) &&
            optionValue === "wafer_paper"
        ) {
            return this.createDisabledState(
                "Wafer paper is sensitive to moisture and may soften or lose its shape on this covering."
            );
        }

        /*
          Edible prints are also unsuitable on moist coverings.
        */
        if (
            moistCoverings.includes(covering) &&
            optionValue === "edible_print"
        ) {
            return this.createDisabledState(
                "An edible print requires a relatively dry and smooth surface and may not hold properly on this covering."
            );
        }

        /*
          Some decorations on fresh fruit cakes need suitable placement.
        */
        if (
            cakeType === "fruit_cake" &&
            [
                "figurines",
                "text_lettering",
                "cake_topper",
                "number_age",
                "candles"
            ].includes(optionValue)
        ) {
            return this.createWarningState(
                "This decoration may require a stable, dry and uncovered area. Please discuss suitable placement with the bakery."
            );
        }

        /*
          Fresh fruit may damage fondant through moisture.
        */
        if (
            covering === "fondant" &&
            optionValue === "fruits"
        ) {
            return this.createWarningState(
                "Fresh fruit can release moisture and may stain, soften or damage fondant. Please discuss suitable preparation and placement with the bakery."
            );
        }

        /*
          A bow may work as a topper, but not necessarily on the sides.
        */
        if (
            hasNakedStyle &&
            optionValue === "bow"
        ) {
            return this.createWarningState(
                "A bow used as a topper may be possible, but a bow attached to the sides usually requires a fully covered surface. Please discuss the placement with the bakery."
            );
        }

        return this.createAllowedState();
    }

    static getRequestWarnings(cakeRequest) {
        const warnings = [];

        if (
            cakeRequest.covering === "fondant" &&
            this.hasMoistFilling(cakeRequest)
        ) {
            warnings.push({
                code: "fondant_moisture",
                message:
                    "Moist fillings or toppings can soften or damage fondant and may affect the cake’s stability and appearance. A protective buttercream or ganache layer may be required."
            });
        }

        if (
            cakeRequest.covering === "fondant" &&
            Array.isArray(cakeRequest.decorations) &&
            cakeRequest.decorations.includes("fruits")
        ) {
            warnings.push({
                code: "fondant_fresh_fruit",
                message:
                    "Fresh fruit can release moisture and may stain, soften or damage fondant. Please discuss suitable preparation and placement with the bakery."
            });
        }

        if (
            this.hasSoftCovering(cakeRequest) &&
            this.hasLargeDecoration(
                cakeRequest.figurineDetails
            )
        ) {
            warnings.push({
                code: "large_figurine_soft_covering",
                message:
                    "Larger or heavier figurines may require internal support and a more stable surface."
            });
        }

        if (
            this.hasSoftCovering(cakeRequest) &&
            this.hasLargeDecoration(
                cakeRequest.cakeTopperDetails
            )
        ) {
            warnings.push({
                code: "large_topper_soft_covering",
                message:
                    "A large cake topper may require additional support and may not stand securely on this covering."
            });
        }

        return warnings;
    }

    static hasRestriction(cakeRequest, restriction) {
        return (
            Array.isArray(cakeRequest.restrictions) &&
            cakeRequest.restrictions.includes(restriction)
        );
    }

    static hasMoistFilling(cakeRequest) {
        if (!Array.isArray(cakeRequest.tierFlavors)) {
            return false;
        }

        return cakeRequest.tierFlavors.some((tierFlavor) =>
            [
                "berry_cream",
                "fruit_filling",
                "jam"
            ].includes(tierFlavor.filling)
        );
    }

    static hasSoftCovering(cakeRequest) {
        return [
            "whipped_cream",
            "mascarpone_cream",
            "cream_cheese",
            "naked_semi_naked"
        ].includes(cakeRequest.covering);
    }

    static hasLargeDecoration(details) {
        if (!details || !Array.isArray(details.items)) {
            return false;
        }

        return details.items.some(
            (item) => item.size === "large"
        );
    }

    static getRelevantTierFlavors(
        cakeRequest,
        context = {}
    ) {
        if (!Array.isArray(cakeRequest.tierFlavors)) {
            return [];
        }

        if (
            Number.isInteger(context.tierIndex) &&
            cakeRequest.tierFlavors[context.tierIndex]
        ) {
            return [
                cakeRequest.tierFlavors[context.tierIndex]
            ];
        }

        return cakeRequest.tierFlavors;
    }

    static getApiRestrictionWarnings(cakeRequest, allergens) {
        const warnings = [];

        if (
            this.hasRestriction(cakeRequest, "nut_free") &&
            allergens.includes("nuts")
        ) {
            warnings.push({
                restriction: "nut_free",
                allergen: "nuts",
                message:
                    "The current cake selection may contain nuts and conflicts with the selected nut-free requirement."
            });
        }

        if (
            this.hasRestriction(cakeRequest, "egg_free") &&
            allergens.includes("egg")
        ) {
            warnings.push({
                restriction: "egg_free",
                allergen: "egg",
                message:
                    "The current cake selection may contain egg and conflicts with the selected egg-free requirement."
            });
        }

        if (
            this.hasRestriction(cakeRequest, "gluten_free") &&
            allergens.includes("gluten")
        ) {
            warnings.push({
                restriction: "gluten_free",
                allergen: "gluten",
                message:
                    "The current cake selection may contain gluten. A gluten-free recipe must be confirmed with the bakery."
            });
        }

        if (
            this.hasRestriction(cakeRequest, "lactose_free") &&
            allergens.includes("milk")
        ) {
            warnings.push({
                restriction: "lactose_free",
                allergen: "milk",
                message:
                    "The current cake selection may contain milk. Whether it can be prepared lactose-free must be confirmed with the bakery."
            });
        }

        if (
            this.hasRestriction(cakeRequest, "vegan") &&
            allergens.includes("egg")
        ) {
            warnings.push({
                restriction: "vegan",
                allergen: "egg",
                message:
                    "The current cake selection may contain egg and may not be suitable for a vegan request."
            });
        }

        if (
            this.hasRestriction(cakeRequest, "vegan") &&
            allergens.includes("milk")
        ) {
            warnings.push({
                restriction: "vegan",
                allergen: "milk",
                message:
                    "The current cake selection may contain dairy and may not be suitable for a vegan request."
            });
        }

        return warnings;
    }

    static async analyzeAllergens(cakeRequest) {
        try {
            const result =
                await CakeRequestApiService.nutrientsCakeRequest(
                    cakeRequest
                );

            const allergens = Array.isArray(result.allergens)
                ? result.allergens
                : [];

            return {
                allergens,
                warnings: this.getApiRestrictionWarnings(
                    cakeRequest,
                    allergens
                ),
                error: false
            };
        } catch (error) {
            console.error(
                "The cake request allergens could not be analyzed:",
                error
            );

            return {
                allergens: [],
                warnings: [],
                error: true
            };
        }
    }
}