/*
  Questionnaire Validator

  This class validates the user's input before moving to the next chapter
  or submitting the request.

  It checks required fields, inconsistent combinations, missing selections,
  file upload rules, and special warnings such as fondant compatibility.
*/

const ERROR_MESSAGES = {
    selection: "Please make a selection.",
    option: "Please select at least one option.",
    link: "Please enter a valid link beginning with http:// or https://.",
    number: "Please enter a number greater than 0.",
    description: "Please add a description.",
    size: "Please select a size."
};

export class QuestionnaireValidator {
    constructor(state) {
        this.state = state;
    }

    validateCurrentChapter() {
        const currentChapter = this.state.getCurrentChapter();

        switch (currentChapter.id) {
            case "basic":
                return this.validateBasicChapter();

            case "flavor":
                return this.validateFlavorChapter();

            case "design":
                return this.validateDesignChapter();

            case "references":
                return this.validateReferencesChapter();

            default:
                return {
                    isValid: true,
                    messages: [],
                    fields: []
                };
        }
    }

    validateBasicChapter() {
        const request = this.state.getCakeRequest();
        const messages = [];
        const fields = [];

        if (!request.cakeType) {
            messages.push(ERROR_MESSAGES.selection);
            fields.push("cakeType");
        }

        if (!request.servingSize) {
            messages.push(ERROR_MESSAGES.selection);
            fields.push("servingSize");
        }

        if (!request.shape) {
            messages.push(ERROR_MESSAGES.selection);
            fields.push("shape");
        }

        if (request.shape !== "sculpted_3d" && !request.tiers) {
            messages.push(ERROR_MESSAGES.selection);
            fields.push("tiers");
        }

        if (!request.sizeMode) {
            messages.push(ERROR_MESSAGES.selection);
            fields.push("sizeMode");
        }

        if (request.sizeMode === "known_servings") {
            const servings = Number(request.knownServings);

            if (!Number.isFinite(servings) || servings <= 0) {
                messages.push(ERROR_MESSAGES.number);
                fields.push("knownServings");
            }
        }

        if (request.sizeMode === "known_size" && !request.knownSize) {
            messages.push(ERROR_MESSAGES.selection);
            fields.push("knownSize");
        }

        return {
            isValid: messages.length === 0,
            messages,
            fields
        };
    }

    validateFlavorChapter() {
        const request = this.state.getCakeRequest();
        const messages = [];
        const fields = [];

        if (Number(request.tiers) > 1 && !request.tierFlavorMode) {
            messages.push(ERROR_MESSAGES.selection);
            fields.push("tierFlavorMode");
        }

        if (!Array.isArray(request.tierFlavors) || request.tierFlavors.length === 0) {
            messages.push(ERROR_MESSAGES.selection);
            fields.push("cakeFlavor-0");

            messages.push(ERROR_MESSAGES.selection);
            fields.push("filling-0");

            return {
                isValid: false,
                messages,
                fields
            };
        }

        request.tierFlavors.forEach((tierFlavor, index) => {
            if (!tierFlavor.cakeFlavor) {
                messages.push(ERROR_MESSAGES.selection);
                fields.push(`cakeFlavor-${index}`);
            }

            if (tierFlavor.cakeFlavor === "other" && !tierFlavor.otherCakeFlavor?.trim()) {
                messages.push(ERROR_MESSAGES.description);
                fields.push(`otherCakeFlavor-${index}`);
            }

            if (tierFlavor.cakeFlavor === "nut" && !tierFlavor.cakeNutType) {
                messages.push(ERROR_MESSAGES.selection);
                fields.push(`cakeNutType-${index}`);
            }

            if (tierFlavor.cakeNutType === "other" && !tierFlavor.otherCakeNut?.trim()) {
                messages.push(ERROR_MESSAGES.description);
                fields.push(`otherCakeNut-${index}`);
            }

            if (!tierFlavor.filling) {
                messages.push(ERROR_MESSAGES.selection);
                fields.push(`filling-${index}`);
            }

            if (tierFlavor.filling === "other" && !tierFlavor.otherFilling?.trim()) {
                messages.push(ERROR_MESSAGES.description);
                fields.push(`otherFilling-${index}`);
            }

            if (tierFlavor.filling === "fruit_filling" && !tierFlavor.fruitFilling) {
                messages.push(ERROR_MESSAGES.selection);
                fields.push(`fruitFilling-${index}`);
            }

            if (tierFlavor.fruitFilling === "other" && !tierFlavor.otherFruitFilling?.trim()) {
                messages.push(ERROR_MESSAGES.description);
                fields.push(`otherFruitFilling-${index}`);
            }

            if (tierFlavor.filling === "buttercream_filling" && !tierFlavor.buttercreamType) {
                messages.push(ERROR_MESSAGES.selection);
                fields.push(`buttercreamType-${index}`);
            }

            if (tierFlavor.filling === "ganache" && !tierFlavor.ganacheChocolateType) {
                messages.push(ERROR_MESSAGES.selection);
                fields.push(`ganacheChocolateType-${index}`);
            }

            if (tierFlavor.filling === "nut_cream" && !tierFlavor.fillingNutType) {
                messages.push(ERROR_MESSAGES.selection);
                fields.push(`fillingNutType-${index}`);
            }

            if (tierFlavor.fillingNutType === "other" && !tierFlavor.otherFillingNut?.trim()) {
                messages.push(ERROR_MESSAGES.description);
                fields.push(`otherFillingNut-${index}`);
            }

            if (tierFlavor.filling === "jam" && !tierFlavor.jamFlavor) {
                messages.push(ERROR_MESSAGES.selection);
                fields.push(`jamFlavor-${index}`);
            }

            if (tierFlavor.jamFlavor === "other" && !tierFlavor.otherJamFlavor?.trim()) {
                messages.push(ERROR_MESSAGES.description);
                fields.push(`otherJamFlavor-${index}`);
            }
        });

        return {
            isValid: messages.length === 0,
            messages,
            fields
        };
    }

    validateDesignChapter() {
        const request = this.state.getCakeRequest();
        const messages = [];
        const fields = [];

        if (!request.covering) {
            messages.push(ERROR_MESSAGES.selection);
            fields.push("covering");
        }

        if (request.covering === "other" && !request.coveringOther?.trim()) {
            messages.push(ERROR_MESSAGES.description);
            fields.push("coveringOther");
        }

        if (request.covering === "buttercream" && !request.coveringButtercreamType) {
            messages.push(ERROR_MESSAGES.selection);
            fields.push("coveringButtercreamType");
        }

        if (request.covering === "ganache" && !request.coveringGanacheChocolateType) {
            messages.push(ERROR_MESSAGES.selection);
            fields.push("coveringGanacheChocolateType");
        }

        if (request.covering === "fondant") {
            this.validateFondantDetails(request, messages, fields);
        }

        if (request.covering === "chocolate_glaze" && !request.chocolateGlazePreserveChoice) {
            messages.push(ERROR_MESSAGES.selection);
            fields.push("chocolateGlazePreserveChoice");
        }

        if (
            request.covering === "chocolate_glaze" &&
            request.chocolateGlazePreserveChoice === "yes" &&
            !request.chocolateGlazePreserveFlavor
        ) {
            messages.push(ERROR_MESSAGES.selection);
            fields.push("chocolateGlazePreserveFlavor");
        }

        if (
            request.covering === "chocolate_glaze" &&
            request.chocolateGlazePreserveChoice === "yes" &&
            request.chocolateGlazePreserveFlavor === "other" &&
            !request.chocolateGlazeOtherPreserveFlavor?.trim()
        ) {
            messages.push(ERROR_MESSAGES.description);
            fields.push("chocolateGlazeOtherPreserveFlavor");
        }

        if (!request.designStyle) {
            messages.push(ERROR_MESSAGES.selection);
            fields.push("designStyle");
        }

        if (request.designStyle === "themed" && !request.themeDescription?.trim()) {
            messages.push(ERROR_MESSAGES.description);
            fields.push("themeDescription");
        }

        if (!request.colorMode) {
            messages.push(ERROR_MESSAGES.selection);
            fields.push("colorMode");
        }

        if (request.colorMode === "choose_colors" && !request.colors?.[0]) {
            messages.push(ERROR_MESSAGES.selection);
            fields.push("mainColor");
        }

        if (request.colorMode === "suggest_palette" && !request.paletteBaseColor) {
            messages.push(ERROR_MESSAGES.selection);
            fields.push("paletteBaseColor");
        }

        if (request.colorMode === "choose_color_theme" && !request.colorTheme) {
            messages.push(ERROR_MESSAGES.selection);
            fields.push("colorTheme");
        }

        this.validateDecorationDetails(request, messages, fields);

        return {
            isValid: messages.length === 0,
            messages,
            fields
        };
    }

    validateFondantDetails(request, messages, fields) {
        if (this.usesIndividualFondantLayers(request)) {
            request.fondantLayerDetails.forEach((layer, index) => {
                if (!layer.layerType) {
                    messages.push(ERROR_MESSAGES.selection);
                    fields.push(`fondantLayer-${index}`);
                }

                if (layer.layerType === "buttercream" && !layer.buttercreamType) {
                    messages.push(ERROR_MESSAGES.selection);
                    fields.push(`fondantButtercreamType-${index}`);
                }

                if (layer.layerType === "ganache" && !layer.ganacheChocolateType) {
                    messages.push(ERROR_MESSAGES.selection);
                    fields.push(`fondantGanacheChocolateType-${index}`);
                }

                if (layer.layerType === "marmalade" && !layer.marmaladeFlavor) {
                    messages.push(ERROR_MESSAGES.selection);
                    fields.push(`fondantMarmaladeFlavor-${index}`);
                }

                if (
                    layer.layerType === "marmalade" &&
                    layer.marmaladeFlavor === "other" &&
                    !layer.otherMarmaladeFlavor?.trim()
                ) {
                    messages.push(ERROR_MESSAGES.description);
                    fields.push(`fondantOtherMarmaladeFlavor-${index}`);
                }
            });

            return;
        }

        if (!request.fondantLayer) {
            messages.push(ERROR_MESSAGES.selection);
            fields.push("fondantLayer");
        }

        if (request.fondantLayer === "buttercream" && !request.fondantButtercreamType) {
            messages.push(ERROR_MESSAGES.selection);
            fields.push("fondantButtercreamType");
        }

        if (request.fondantLayer === "ganache" && !request.fondantGanacheChocolateType) {
            messages.push(ERROR_MESSAGES.selection);
            fields.push("fondantGanacheChocolateType");
        }

        if (request.fondantLayer === "marmalade" && !request.fondantMarmaladeFlavor) {
            messages.push(ERROR_MESSAGES.selection);
            fields.push("fondantMarmaladeFlavor");
        }

        if (
            request.fondantLayer === "marmalade" &&
            request.fondantMarmaladeFlavor === "other" &&
            !request.fondantOtherMarmaladeFlavor?.trim()
        ) {
            messages.push(ERROR_MESSAGES.description);
            fields.push("fondantOtherMarmaladeFlavor");
        }
    }

    validateDecorationDetails(request, messages, fields) {
        if (!Array.isArray(request.decorations)) {
            return;
        }

        if (request.decorations.includes("text_lettering")) {
            if (!request.textDetails?.text?.trim()) {
                messages.push(ERROR_MESSAGES.description);
                fields.push("cakeText");
            }

            if (!request.textDetails?.letteringStyle) {
                messages.push(ERROR_MESSAGES.selection);
                fields.push("letteringStyle");
            }
        }

        if (request.decorations.includes("number_age")) {
            if (!request.numberAgeDetails?.numberOrAge?.trim()) {
                messages.push(ERROR_MESSAGES.description);
                fields.push("numberOrAge");
            }

            if (!request.numberAgeDetails?.displayType) {
                messages.push(ERROR_MESSAGES.selection);
                fields.push("numberDisplayType");
            }
        }

        if (request.decorations.includes("candles")) {
            const quantity = Number(request.candleDetails?.quantity);

            if (!Number.isInteger(quantity) || quantity <= 0) {
                messages.push(ERROR_MESSAGES.number);
                fields.push("candleQuantity");
            }
        }

        if (request.decorations.includes("cake_topper")) {
            this.validateSizedDecoration(
                request.cakeTopperDetails,
                "cakeTopper",
                messages,
                fields
            );
        }

        if (request.decorations.includes("figurines")) {
            this.validateSizedDecoration(
                request.figurineDetails,
                "figurine",
                messages,
                fields
            );
        }

        if (
            request.decorations.includes("edible_print") &&
            !request.ediblePrintDescription?.trim()
        ) {
            messages.push(ERROR_MESSAGES.description);
            fields.push("ediblePrintDescription");
        }

        if (
            request.decorations.includes("other") &&
            !request.otherDecorationDescription?.trim()
        ) {
            messages.push(ERROR_MESSAGES.description);
            fields.push("otherDecorationDescription");
        }
    }

    validateSizedDecoration(details, fieldPrefix, messages, fields) {
        if (!details?.quantity) {
            messages.push(ERROR_MESSAGES.selection);
            fields.push(`${fieldPrefix}Quantity`);
            return;
        }

        if (details.quantity === "4_plus") {
            if (!details.description?.trim()) {
                messages.push(ERROR_MESSAGES.description);
                fields.push(`${fieldPrefix}GeneralDescription`);
            }

            return;
        }

        const quantity = Number(details.quantity);

        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 3) {
            messages.push(ERROR_MESSAGES.selection);
            fields.push(`${fieldPrefix}Quantity`);
            return;
        }

        if (!Array.isArray(details.items) || details.items.length !== quantity) {
            messages.push(ERROR_MESSAGES.selection);
            fields.push(`${fieldPrefix}Quantity`);
            return;
        }

        details.items.forEach((item, index) => {
            if (!item.description?.trim()) {
                messages.push(ERROR_MESSAGES.description);
                fields.push(`${fieldPrefix}Description-${index}`);
            }

            if (!["small", "medium", "large"].includes(item.size)) {
                messages.push(ERROR_MESSAGES.size);
                fields.push(`${fieldPrefix}Size-${index}`);
            }
        });
    }

    validateReferencesChapter() {
        const request = this.state.getCakeRequest();
        const messages = [];
        const fields = [];

        if (!request.referenceMode) {
            messages.push(ERROR_MESSAGES.selection);
            fields.push("referenceMode");
        }

        if (
            request.referenceMode === "add_references" &&
            (!Array.isArray(request.referenceItems) || request.referenceItems.length === 0)
        ) {
            messages.push(ERROR_MESSAGES.option);
            fields.push("referenceImage");
        }

        if (Array.isArray(request.referenceItems)) {
            request.referenceItems.forEach((item) => {
                if (item.type === "link" && !this.isValidReferenceUrl(item.url)) {
                    messages.push(ERROR_MESSAGES.link);
                    fields.push("referenceUrl");
                }
            });
        }

        if (!request.budgetMode) {
            messages.push(ERROR_MESSAGES.selection);
            fields.push("budgetMode");
        }

        if (request.budgetMode === "enter_budget" && !request.budgetRange) {
            messages.push(ERROR_MESSAGES.selection);
            fields.push("budgetRange");
        }

        if (
            request.budgetMode === "enter_budget" &&
            request.budgetRange === "custom_budget"
        ) {
            const customBudget = Number(request.customBudget);

            if (!Number.isFinite(customBudget) || customBudget <= 0) {
                messages.push(ERROR_MESSAGES.number);
                fields.push("customBudget");
            }
        }

        return {
            isValid: messages.length === 0,
            messages,
            fields
        };
    }

    isValidReferenceUrl(value) {
        if (typeof value !== "string" || !value.trim()) {
            return false;
        }

        try {
            const url = new URL(value.trim());
            return url.protocol === "http:" || url.protocol === "https:";
        } catch {
            return false;
        }
    }

    isRequestComplete() {
        const basic = this.validateBasicChapter();
        const flavor = this.validateFlavorChapter();
        const design = this.validateDesignChapter();
        const references = this.validateReferencesChapter();

        return basic.isValid && flavor.isValid && design.isValid && references.isValid;
    }

    usesIndividualFondantLayers(request) {
        return (
            request.covering === "fondant" &&
            Number(request.tiers) > 1 &&
            request.tierFlavorMode === "individual_per_tier"
        );
    }
}