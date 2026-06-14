/*
  Questionnaire Validator

  This class validates the user's input before moving to the next chapter
  or submitting the request.

  It checks required fields, inconsistent combinations, missing selections,
  file upload rules, and special warnings such as fondant compatibility.
*/

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

            case "summary":
                return {
                    isValid: true,
                    messages: [],
                    fields: []
                };

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

        if (!request.occasion) {
            messages.push("Please choose an occasion.");
            fields.push("occasion");
        }

        if (!request.cakeType) {
            messages.push("Please choose a cake type.");
            fields.push("cakeType");
        }

        if (!request.servingSize) {
            messages.push("Please choose a serving size.");
            fields.push("servingSize");
        }

        if (!request.shape) {
            messages.push("Please choose a cake shape.");
            fields.push("shape");
        }

        if (request.shape !== "sculpted_3d" && !request.tiers) {
            messages.push("Please choose the number of tiers.");
            fields.push("tiers");
        }

        if (!request.sizeMode) {
            messages.push("Please choose what you already know about the size.");
            fields.push("sizeMode");
        }

        if (request.sizeMode === "known_servings" && !request.knownServings) {
            messages.push("Please enter the number of guests or servings.");
            fields.push("knownServings");
        }

        if (request.sizeMode === "known_size" && !request.knownSize) {
            messages.push("Please enter the desired cake size.");
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
            messages.push("Please choose whether all tiers should be the same or individual.");
            fields.push("tierFlavorMode");
        }

        if (!request.tierFlavors || request.tierFlavors.length === 0) {
            messages.push("Please choose a cake flavor.");
            fields.push("cakeFlavor-0");

            messages.push("Please choose a filling.");
            fields.push("filling-0");

            return {
                isValid: false,
                messages,
                fields
            };
        }

        request.tierFlavors.forEach((tierFlavor, index) => {
            if (!tierFlavor.cakeFlavor) {
                messages.push("Please choose a cake flavor.");
                fields.push(`cakeFlavor-${index}`);
            }

            if (tierFlavor.cakeFlavor === "other" && !tierFlavor.otherCakeFlavor) {
                messages.push("Please describe the other cake flavor.");
                fields.push(`otherCakeFlavor-${index}`);
            }

            if (!tierFlavor.filling) {
                messages.push("Please choose a filling.");
                fields.push(`filling-${index}`);
            }

            if (tierFlavor.filling === "other" && !tierFlavor.otherFilling) {
                messages.push("Please describe the other filling.");
                fields.push(`otherFilling-${index}`);
            }

            if (tierFlavor.filling === "fruit_filling" && !tierFlavor.fruitFilling) {
                messages.push("Please choose a fruit filling.");
                fields.push(`fruitFilling-${index}`);
            }

            if (tierFlavor.fruitFilling === "other" && !tierFlavor.otherFruitFilling) {
                messages.push("Please describe the other fruit filling.");
                fields.push(`otherFruitFilling-${index}`);
            }

            if (tierFlavor.filling === "buttercream_filling" && !tierFlavor.buttercreamType) {
                messages.push("Please choose a buttercream type.");
                fields.push(`buttercreamType-${index}`);
            }

            if (tierFlavor.filling === "ganache" && !tierFlavor.ganacheChocolateType) {
                messages.push("Please choose a ganache chocolate type.");
                fields.push(`ganacheChocolateType-${index}`);
            }

            if (tierFlavor.cakeFlavor === "nut" && !tierFlavor.cakeNutType) {
                messages.push("Please choose a nut for the cake.");
                fields.push(`cakeNutType-${index}`);
            }

            if (
                tierFlavor.cakeNutType === "other" &&
                !tierFlavor.otherCakeNut
            ) {
                messages.push("Please enter the other nut.");
                fields.push(`otherCakeNut-${index}`);
            }

            if (
                tierFlavor.filling === "nut_cream" &&
                !tierFlavor.fillingNutType
            ) {
                messages.push("Please choose a nut cream.");
                fields.push(`fillingNutType-${index}`);
            }

            if (
                tierFlavor.fillingNutType === "other" &&
                !tierFlavor.otherFillingNut
            ) {
                messages.push("Please enter the other nut.");
                fields.push(`otherFillingNut-${index}`);
            }

            if (tierFlavor.filling === "jam" && !tierFlavor.jamFlavor) {
                messages.push("Please choose a fruit preserve.");
                fields.push(`jamFlavor-${index}`);
            }

            if (
                tierFlavor.jamFlavor === "other" &&
                !tierFlavor.otherJamFlavor
            ) {
                messages.push("Please enter the other fruit preserve.");
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
            messages.push("Please choose a covering or outer frosting.");
            fields.push("covering");
        }

        if (request.covering === "other" && !request.coveringOther) {
            messages.push("Please describe the other covering option.");
            fields.push("coveringOther");
        }

        if (request.covering === "buttercream" && !request.coveringButtercreamType) {
            messages.push("Please choose a buttercream type.");
            fields.push("coveringButtercreamType");
        }

        if (request.covering === "ganache" && !request.coveringGanacheChocolateType) {
            messages.push("Please choose a ganache chocolate type.");
            fields.push("coveringGanacheChocolateType");
        }

        if (request.covering === "fondant") {
            if (this.usesIndividualFondantLayers(request)) {
                request.fondantLayerDetails.forEach((layer, index) => {
                    if (!layer.layerType) {
                        messages.push(`Please choose a fondant layer for tier ${layer.tierNumber}.`);
                        fields.push(`fondantLayer-${index}`);
                    }

                    if (layer.layerType === "buttercream" && !layer.buttercreamType) {
                        messages.push(`Please choose a buttercream type for tier ${layer.tierNumber}.`);
                        fields.push(`fondantButtercreamType-${index}`);
                    }

                    if (layer.layerType === "ganache" && !layer.ganacheChocolateType) {
                        messages.push(`Please choose a ganache chocolate type for tier ${layer.tierNumber}.`);
                        fields.push(`fondantGanacheChocolateType-${index}`);
                    }

                    if (
                        layer.layerType === "marmalade" && !layer.marmaladeFlavor
                    ) {
                        messages.push(`Please choose a fruit preserve for tier ${layer.tierNumber}.`);
                        fields.push(`fondantMarmaladeFlavor-${index}`);
                    }

                    if (
                        layer.layerType === "marmalade" && layer.marmaladeFlavor === "other" && !layer.otherMarmaladeFlavor
                    ) {
                        messages.push(`Please enter the other fruit preserve for tier ${layer.tierNumber}.`);
                        fields.push(`fondantOtherMarmaladeFlavor-${index}`);
                    }
                });
            } else {
                if (!request.fondantLayer) {
                    messages.push("Please choose a layer underneath the fondant.");
                    fields.push("fondantLayer");
                }

                if (request.fondantLayer === "buttercream" && !request.fondantButtercreamType) {
                    messages.push("Please choose a buttercream type for the fondant layer.");
                    fields.push("fondantButtercreamType");
                }

                if (request.fondantLayer === "ganache" && !request.fondantGanacheChocolateType) {
                    messages.push("Please choose a ganache chocolate type for the fondant layer.");
                    fields.push("fondantGanacheChocolateType");
                }

                if (request.fondantLayer === "marmalade" && !request.fondantMarmaladeFlavor
                ) {
                    messages.push("Please choose a fruit preserve for the fondant layer.");
                    fields.push("fondantMarmaladeFlavor");
                }

                if (request.fondantLayer === "marmalade" && request.fondantMarmaladeFlavor === "other" && !request.fondantOtherMarmaladeFlavor
                ) {
                    messages.push("Please enter the other fruit preserve for the fondant layer.");
                    fields.push("fondantOtherMarmaladeFlavor");
                }
            }
        }

        if (!request.designStyle) {
            messages.push("Please choose a design style.");
            fields.push("designStyle");
        }

        if (!request.colorMode) {
            messages.push("Please choose a color option.");
            fields.push("colorMode");
        }

        if (request.colorMode === "choose_colors" && !request.colors[0]) {
            messages.push("Please enter at least a main color.");
            fields.push("mainColor");
        }

        if (request.colorMode === "suggest_palette" && !request.paletteBaseColor) {
            messages.push("Please enter a starting color for the palette suggestion.");
            fields.push("paletteBaseColor");
        }

        if (request.colorMode === "choose_color_theme" && !request.colorTheme) {
            messages.push("Please choose a color theme.");
            fields.push("colorTheme");
        }

        if (
            request.covering === "chocolate_glaze" &&
            !request.chocolateGlazePreserveChoice
        ) {
            messages.push(
                "Please choose whether you would like fruit preserve underneath the chocolate glaze."
            );
            fields.push("chocolateGlazePreserveChoice");
        }

        if (
            request.covering === "chocolate_glaze" &&
            request.chocolateGlazePreserveChoice === "yes" &&
            !request.chocolateGlazePreserveFlavor
        ) {
            messages.push("Please choose a fruit preserve.");
            fields.push("chocolateGlazePreserveFlavor");
        }

        if (
            request.covering === "chocolate_glaze" &&
            request.chocolateGlazePreserveChoice === "yes" &&
            request.chocolateGlazePreserveFlavor === "other" &&
            !request.chocolateGlazeOtherPreserveFlavor
        ) {
            messages.push("Please enter the other fruit preserve.");
            fields.push("chocolateGlazeOtherPreserveFlavor");
        }

        this.validateDecorationDetails(request, messages, fields);

        return {
            isValid: messages.length === 0,
            messages,
            fields
        };
    }

    validateDecorationDetails(request, messages, fields) {
        if (!Array.isArray(request.decorations)) {
            return;
        }

        if (request.decorations.includes("text_lettering")) {
            if (!request.textDetails?.text?.trim()) {
                messages.push("Please enter the text that should appear on the cake.");
                fields.push("cakeText");
            }

            if (!request.textDetails?.letteringStyle) {
                messages.push("Please choose a lettering style.");
                fields.push("letteringStyle");
            }
        }

        if (request.decorations.includes("number_age")) {
            if (!request.numberAgeDetails?.numberOrAge?.trim()) {
                messages.push("Please enter the number or age that should be displayed.");
                fields.push("numberOrAge");
            }

            if (!request.numberAgeDetails?.displayType) {
                messages.push("Please choose how the number or age should be displayed.");
                fields.push("numberDisplayType");
            }
        }

        if (request.decorations.includes("candles")) {
            const quantity = Number(request.candleDetails?.quantity);

            if (!Number.isInteger(quantity) || quantity <= 0) {
                messages.push("Please enter a valid number of candles.");
                fields.push("candleQuantity");
            }
        }

        if (request.decorations.includes("cake_topper")) {
            this.validateSizedDecoration(
                request.cakeTopperDetails,
                "cake topper",
                "cakeTopper",
                messages,
                fields
            );
        }

        if (request.decorations.includes("figurines")) {
            this.validateSizedDecoration(
                request.figurineDetails,
                "figurine",
                "figurine",
                messages,
                fields
            );
        }
    }

    validateSizedDecoration(details, label, fieldPrefix, messages, fields) {
        if (!details) {
            messages.push(`Please enter the ${label} details.`);
            fields.push(`${fieldPrefix}Quantity`);
            return;
        }

        if (!details.description?.trim()) {
            messages.push(`Please provide a general description for the ${label}s.`);
            fields.push(`${fieldPrefix}GeneralDescription`);
        }

        if (!details.quantity) {
            messages.push(`Please choose how many ${label}s you would like.`);
            fields.push(`${fieldPrefix}Quantity`);
            return;
        }

        if (details.quantity === "4_plus") {
            return;
        }

        const quantity = Number(details.quantity);

        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 3) {
            messages.push(`Please choose a valid number of ${label}s.`);
            fields.push(`${fieldPrefix}Quantity`);
            return;
        }

        if (!Array.isArray(details.items) || details.items.length !== quantity) {
            messages.push(`Please complete the details for every ${label}.`);
            fields.push(`${fieldPrefix}Quantity`);
            return;
        }

        details.items.forEach((item, index) => {
            if (!item.description?.trim()) {
                messages.push(`Please describe ${label} ${index + 1}.`);
                fields.push(`${fieldPrefix}Description-${index}`);
            }

            if (!["small", "medium", "large"].includes(item.size)) {
                messages.push(`Please choose a size for ${label} ${index + 1}.`);
                fields.push(`${fieldPrefix}Size-${index}`);
            }
        });
    }

    validateReferencesChapter() {
        return {
            isValid: true,
            messages: [],
            fields: []
        };
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