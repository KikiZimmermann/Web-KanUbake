/*
  Summary Builder

  This class creates a readable summary from a CakeRequest object.

  The summary can be used for the final summary chapter, PDF generation,
  email content, or dashboard previews.

  This class does not render HTML directly. It only prepares structured
  summary data that can be displayed by the renderer.
*/

import { questionnaireOptions } from "../data/questionnaireOptions.js";
import { QuestionnaireCompatibilityService } from "./QuestionnaireCompatibilityService.js";

export class SummaryBuilder {
    buildSummary(cakeRequest, allergenAnalysis = null) {
        const sections = [
            {
                title: "Basic Information & Size",
                items: [
                    this.createOptionalPlainSummaryItem("Project Name", cakeRequest.displayName),
                    cakeRequest.occasion ? this.createSummaryItem("Occasion", cakeRequest.occasion, questionnaireOptions.occasions) : null,
                    this.createSummaryItem("Cake Type", cakeRequest.cakeType, questionnaireOptions.cakeTypes),
                    this.createSummaryItem("Serving Size", cakeRequest.servingSize, questionnaireOptions.servingSizes),
                    this.createSummaryItem("Shape", cakeRequest.shape, questionnaireOptions.shapes),
                    cakeRequest.shape !== "sculpted_3d" ? this.createSummaryItem("Tiers", cakeRequest.tiers, questionnaireOptions.tiers) : null,
                    this.createSummaryItem("Size Information", cakeRequest.sizeMode, questionnaireOptions.sizeModes),
                    this.createServingSummaryItem(cakeRequest),
                    this.createCakeSizeSummaryItem(cakeRequest),
                    this.createMultiSummaryItem("Restrictions", cakeRequest.restrictions, questionnaireOptions.restrictions),
                    this.createOptionalPlainSummaryItem("Restriction Notes", cakeRequest.restrictionNotes)
                ].filter(Boolean)
            },
            {
                title: "Flavor & Filling",
                items: [
                    Number(cakeRequest.tiers) > 1
                        ? this.createSummaryItem(
                            "Tier Flavor Mode",
                            cakeRequest.tierFlavorMode,
                            questionnaireOptions.tierFlavorModes
                        )
                        : null,
                    this.createTierFlavorSummaryItem(cakeRequest)
                ].filter(Boolean)
            },
            {
                title: "Design & Decoration",
                items: [
                    this.createSummaryItem("Covering", cakeRequest.covering, questionnaireOptions.coverings),
                    ...this.createCoveringDetailItems(cakeRequest),
                    ...this.createFondantLayerSummaryItems(cakeRequest),
                    this.createSummaryItem("Design Style", cakeRequest.designStyle, questionnaireOptions.designStyles),
                    cakeRequest.designStyle === "themed"
                        ? this.createOptionalPlainSummaryItem("Theme Description", cakeRequest.themeDescription)
                        : null,
                    this.createSummaryItem("Color Mode", cakeRequest.colorMode, questionnaireOptions.colorModes),
                    this.createColorSummaryItem(cakeRequest),
                    this.createDecorationSummaryItem(cakeRequest.decorations),
                    cakeRequest.decorations?.includes("text_lettering")
                        ? this.createTextDetailsSummaryItem(cakeRequest.textDetails)
                        : null,
                    cakeRequest.decorations?.includes("number_age")
                        ? this.createNumberAgeSummaryItem(cakeRequest.numberAgeDetails)
                        : null,
                    cakeRequest.decorations?.includes("candles")
                        ? this.createCandleSummaryItem(cakeRequest.candleDetails)
                        : null,
                    cakeRequest.decorations?.includes("cake_topper")
                        ? this.createSizedDecorationSummaryItem(
                            "Cake Topper Details",
                            "Topper",
                            cakeRequest.cakeTopperDetails
                        )
                        : null,
                    cakeRequest.decorations?.includes("figurines")
                        ? this.createSizedDecorationSummaryItem(
                            "Figurine Details",
                            "Figurine",
                            cakeRequest.figurineDetails
                        )
                        : null,

                    cakeRequest.decorations?.includes("edible_print")
                        ? this.createOptionalPlainSummaryItem(
                            "Edible Print / Image Details",
                            cakeRequest.ediblePrintDescription
                        )
                        : null,

                    cakeRequest.decorations?.includes("other")
                        ? this.createOptionalPlainSummaryItem(
                            "Other Decoration Details",
                            cakeRequest.otherDecorationDescription
                        )
                        : null
                ].filter(Boolean)
            },
            {
                title: "References & Budget",
                items: [
                    this.createReferenceSummaryItem(cakeRequest.referenceItems),
                    ...this.createBudgetSummaryItems(cakeRequest),
                    this.createOptionalPlainSummaryItem("Additional Notes", cakeRequest.additionalNotes)
                ].filter(Boolean)
            }
        ];

        const compatibilitySection =
            this.createCompatibilitySummarySection(
                cakeRequest,
                allergenAnalysis
            );

        if (compatibilitySection) {
            sections.push(compatibilitySection);
        }

        return sections;
    }

    createCompatibilitySummarySection(cakeRequest, allergenAnalysis) {
        const messages = [];

        const localWarnings =
            QuestionnaireCompatibilityService.getRequestWarnings(
                cakeRequest
            );

        localWarnings.forEach((warning) => {
            if (warning?.message) {
                messages.push(warning.message);
            }
        });

        const apiWarnings =
            Array.isArray(allergenAnalysis?.warnings)
                ? allergenAnalysis.warnings
                : [];

        apiWarnings.forEach((warning) => {
            if (warning?.message) {
                messages.push(warning.message);
            }
        });

        const uniqueMessages = [...new Set(messages)];

        if (uniqueMessages.length === 0) {
            return null;
        }

        return {
            title: "Compatibility & Allergy Notes",
            items: uniqueMessages.map((message) => ({
                label: "Important Note",
                value: message,
                type: "warning"
            }))
        };
    }

    createColorSummaryItem(cakeRequest) {
        if (cakeRequest.colorMode === "choose_colors") {
            const colors = Array.isArray(cakeRequest.colors)
                ? cakeRequest.colors.filter((color) => color?.hex)
                : [];

            if (colors.length === 0) {
                return null;
            }

            return {
                label: "Selected Colors",
                type: "color-list",
                colors
            };
        }

        if (cakeRequest.colorMode === "suggest_palette") {
            if (!cakeRequest.paletteBaseColor) {
                return null;
            }

            const paletteColors = Array.isArray(cakeRequest.paletteColors)
                ? cakeRequest.paletteColors.filter((color) => color?.hex)
                : [];

            return {
                label: "Suggested Color Palette",
                type: "color-palette",
                startingColor: cakeRequest.paletteBaseColor,
                scheme: cakeRequest.paletteSchemeMode,
                colors: paletteColors
            };
        }

        if (cakeRequest.colorMode === "choose_color_theme" && cakeRequest.colorTheme) {
            return this.createSummaryItem(
                "Color Theme",
                cakeRequest.colorTheme,
                questionnaireOptions.colorThemes
            );
        }

        return null;
    }

    createSummaryItem(label, value, options) {
        return {
            label: label,
            value: this.getOptionLabel(value, options)
        };
    }

    createPlainSummaryItem(label, value) {
        return {
            label: label,
            value: this.getDisplayValue(value)
        };
    }

    createOptionalPlainSummaryItem(label, value) {
        if (value === null || value === undefined || value === "") {
            return null;
        }

        return {
            label,
            value
        };
    }

    createServingSummaryItem(cakeRequest) {
        if (cakeRequest.knownServings) {
            return {
                label: "Requested Servings",
                value: cakeRequest.knownServings
            };
        }

        if (cakeRequest.estimatedServings) {
            return {
                label: "Suggested Servings",
                value: cakeRequest.estimatedServings
            };
        }

        return null;
    }

    createCakeSizeSummaryItem(cakeRequest) {
        if (cakeRequest.shape === "sculpted_3d") {
            return {
                label: "3D / Sculpted Cake Size",
                value:
                    "The final dimensions and internal structure depend on the selected design, shape and requested servings.\n" +
                    "The bakery will recommend a suitable size and construction."
            };
        }

        const value = this.getCakeSizeSummaryValue(cakeRequest);

        if (!value) {
            return null;
        }

        return {
            label: cakeRequest.recommendedSize ? "Recommended Cake Size" : "Cake Size",
            value
        };
    }

    createCoveringDetailItems(cakeRequest) {
        const details = [];

        if (cakeRequest.covering === "buttercream") {
            details.push(
                `Buttercream Type: ${this.getOptionLabel(
                    cakeRequest.coveringButtercreamType,
                    questionnaireOptions.buttercreamTypes
                )}`
            );

            if (cakeRequest.coveringButtercreamColor) {
                details.push(`Color: ${cakeRequest.coveringButtercreamColor}`);
            }

            if (cakeRequest.coveringButtercreamFlavor) {
                details.push(`Flavor: ${cakeRequest.coveringButtercreamFlavor}`);
            }
        }

        if (cakeRequest.covering === "ganache") {
            details.push(
                `Chocolate Type: ${this.getOptionLabel(
                    cakeRequest.coveringGanacheChocolateType,
                    questionnaireOptions.ganacheChocolateTypes
                )}`
            );

            if (cakeRequest.coveringGanacheColor) {
                details.push(`Color: ${cakeRequest.coveringGanacheColor}`);
            }
        }

        if (cakeRequest.covering === "chocolate_glaze") {
            const preserveChoice = this.getOptionLabel(
                cakeRequest.chocolateGlazePreserveChoice,
                questionnaireOptions.yesNoUnsure
            );

            details.push(`Fruit Preserve Underneath: ${preserveChoice}`);

            if (cakeRequest.chocolateGlazePreserveChoice === "yes") {
                const preserve = cakeRequest.chocolateGlazePreserveFlavor === "other"
                    ? cakeRequest.chocolateGlazeOtherPreserveFlavor
                    : this.getOptionLabel(
                        cakeRequest.chocolateGlazePreserveFlavor,
                        questionnaireOptions.fruitPreserves
                    );

                details.push(`Fruit Preserve Flavor: ${preserve}`);
            }
        }

        if (cakeRequest.covering === "other" && cakeRequest.coveringOther) {
            details.push(`Description: ${cakeRequest.coveringOther}`);
        }

        if (details.length === 0) {
            return [];
        }

        return [{
            label: "Covering Details",
            value: details.join("\n")
        }];
    }

    createFondantLayerSummaryItems(cakeRequest) {
        if (cakeRequest.covering !== "fondant") {
            return [];
        }

        if (Array.isArray(cakeRequest.fondantLayerDetails) && cakeRequest.fondantLayerDetails.length > 0) {
            return cakeRequest.fondantLayerDetails.map((layer) => ({
                label: `Fondant Layer – Tier ${layer.tierNumber}`,
                value: this.createFondantLayerDetailsValue(layer)
            }));
        }

        const layer = {
            layerType: cakeRequest.fondantLayer,
            buttercreamType: cakeRequest.fondantButtercreamType,
            buttercreamColor: cakeRequest.fondantButtercreamColor,
            buttercreamFlavor: cakeRequest.fondantButtercreamFlavor,
            ganacheChocolateType: cakeRequest.fondantGanacheChocolateType,
            ganacheColor: cakeRequest.fondantGanacheColor,
            marmaladeFlavor: cakeRequest.fondantMarmaladeFlavor,
            otherMarmaladeFlavor: cakeRequest.fondantOtherMarmaladeFlavor
        };

        return [{
            label: "Fondant Layer Details",
            value: this.createFondantLayerDetailsValue(layer)
        }];
    }

    createFondantLayerDetailsValue(layer) {
        const details = [
            `Layer Type: ${this.getOptionLabel(
                layer.layerType,
                questionnaireOptions.fondantLayers
            )}`
        ];

        if (layer.layerType === "buttercream") {
            details.push(
                `Buttercream Type: ${this.getOptionLabel(
                    layer.buttercreamType,
                    questionnaireOptions.buttercreamTypes
                )}`
            );

            if (layer.buttercreamColor) {
                details.push(`Color: ${layer.buttercreamColor}`);
            }

            if (layer.buttercreamFlavor) {
                details.push(`Flavor: ${layer.buttercreamFlavor}`);
            }
        }

        if (layer.layerType === "ganache") {
            details.push(
                `Chocolate Type: ${this.getOptionLabel(
                    layer.ganacheChocolateType,
                    questionnaireOptions.ganacheChocolateTypes
                )}`
            );

            if (layer.ganacheColor) {
                details.push(`Color: ${layer.ganacheColor}`);
            }
        }

        if (layer.layerType === "marmalade") {
            const preserve = layer.marmaladeFlavor === "other"
                ? layer.otherMarmaladeFlavor
                : this.getOptionLabel(
                    layer.marmaladeFlavor,
                    questionnaireOptions.fruitPreserves
                );

            details.push(`Fruit Preserve: ${preserve}`);
        }

        return details.join("\n");
    }

    createDecorationSummaryItem(decorations) {
        if (!Array.isArray(decorations) || decorations.length === 0) {
            return {
                label: "Decorations",
                value: "None"
            };
        }

        const consultationDecorations = [
            "fresh_flowers",
            "sugar_flowers",
            "ruffles",
            "other"
        ];

        const labels = decorations.map((decoration) => {
            const label = this.getOptionLabel(
                decoration,
                questionnaireOptions.decorations
            );

            if (consultationDecorations.includes(decoration)) {
                return `${label} (please discuss the details and final price with the bakery)`;
            }

            return label;
        });

        return {
            label: "Decorations",
            value: labels.join("\n")
        };
    }

    createTextDetailsSummaryItem(textDetails) {
        if (!textDetails) {
            return null;
        }

        const style = this.getOptionLabel(
            textDetails.letteringStyle,
            questionnaireOptions.letteringStyles
        );

        return {
            label: "Text / Lettering Details",
            value:
                `Text: ${textDetails.text}\n` +
                `Lettering style: ${style}`
        };
    }

    createNumberAgeSummaryItem(numberAgeDetails) {
        if (!numberAgeDetails) {
            return null;
        }

        const displayType = this.getOptionLabel(
            numberAgeDetails.displayType,
            questionnaireOptions.numberDisplayTypes
        );

        return {
            label: "Number / Age Details",
            value:
                `Number or age: ${numberAgeDetails.numberOrAge}\n` +
                `Display type: ${displayType}`
        };
    }

    createCandleSummaryItem(candleDetails) {
        if (!candleDetails) {
            return null;
        }

        const details = [`Quantity: ${candleDetails.quantity}`];

        if (candleDetails.colors) {
            details.push(`Colors: ${candleDetails.colors}`);
        }

        return {
            label: "Candle Details",
            value: details.join("\n")
        };
    }

    createSizedDecorationSummaryItem(label, itemLabel, details) {
        if (!details) {
            return null;
        }

        if (details.quantity === "4_plus") {
            return {
                label,
                value:
                    `Quantity: 4 or more\n` +
                    `Description: ${details.description}\n` +
                    `Please discuss the details and final price with the bakery.`
            };
        }

        const values = [`Quantity: ${details.quantity}`];

        if (Array.isArray(details.items)) {
            details.items.forEach((item, index) => {
                const size = item.size
                    ? item.size.charAt(0).toUpperCase() + item.size.slice(1)
                    : "Not specified";

                values.push(
                    `${itemLabel} ${index + 1}\n` +
                    `Description: ${item.description}\n` +
                    `Size: ${size}`
                );
            });
        }

        return {
            label,
            value: values.join("\n\n")
        };
    }

    createBudgetSummaryItems(cakeRequest) {
        if (cakeRequest.budgetMode === "show_estimate") {
            return [
                this.createSummaryItem(
                    "Budget Mode",
                    cakeRequest.budgetMode,
                    questionnaireOptions.budgetModes
                )
            ];
        }

        if (cakeRequest.budgetMode === "enter_budget") {
            if (
                cakeRequest.budgetRange === "custom_budget" &&
                cakeRequest.customBudget
            ) {
                return [{
                    label: "Custom Budget",
                    value: `${cakeRequest.customBudget} EUR`
                }];
            }

            if (cakeRequest.budgetRange) {
                return [
                    this.createSummaryItem(
                        "Budget Range",
                        cakeRequest.budgetRange,
                        questionnaireOptions.budgetRanges
                    )
                ];
            }
        }

        return [];
    }

    createMultiSummaryItem(label, values, options) {
        if (!values || values.length === 0) {
            return {
                label: label,
                value: "None"
            };
        }

        const labels = values.map((value) => this.getOptionLabel(value, options));

        return {
            label: label,
            value: labels.join(", ")
        };
    }

    createMultiPlainSummaryItem(label, values) {
        if (!values || values.length === 0) {
            return {
                label: label,
                value: "Not specified"
            };
        }

        return {
            label: label,
            value: values.join(", ")
        };
    }

    createObjectSummaryItem(label, objectValue) {
        if (!objectValue) {
            return {
                label: label,
                value: "Not specified"
            };
        }

        const entries = Object.entries(objectValue)
            .filter(([, value]) => value !== "" && value !== null && value !== undefined)
            .map(([key, value]) => `${this.formatKey(key)}: ${value} `);

        return {
            label: label,
            value: entries.length > 0 ? entries.join(", ") : "Not specified"
        };
    }

    createTierFlavorSummaryItem(cakeRequest) {
        const tierFlavors = cakeRequest.tierFlavors;

        if (!Array.isArray(tierFlavors) || tierFlavors.length === 0) {
            return {
                label: "Cake Flavor & Filling",
                value: "Not specified"
            };
        }

        const showIndividualTiers =
            Number(cakeRequest.tiers) > 1 &&
            cakeRequest.tierFlavorMode === "individual_per_tier";

        if (!showIndividualTiers) {
            return {
                label: "Cake Flavor & Filling",
                value: this.createTierFlavorDetailsValue(tierFlavors[0])
            };
        }

        const tierSummaries = tierFlavors.map((tierFlavor) => {
            return `Tier ${tierFlavor.tierNumber}\n${this.createTierFlavorDetailsValue(tierFlavor)}`;
        });

        return {
            label: "Cake Flavors & Fillings",
            value: tierSummaries.join("\n\n")
        };
    }

    createTierFlavorDetailsValue(tierFlavor) {
        const cakeFlavor = tierFlavor.cakeFlavor === "other"
            ? tierFlavor.otherCakeFlavor
            : this.getOptionLabel(
                tierFlavor.cakeFlavor,
                questionnaireOptions.cakeFlavors
            );

        const filling = tierFlavor.filling === "other"
            ? tierFlavor.otherFilling
            : this.getOptionLabel(
                tierFlavor.filling,
                questionnaireOptions.fillings
            );

        const details = [
            `Cake Flavor: ${cakeFlavor}`,
            `Filling: ${filling}`
        ];

        if (tierFlavor.cakeFlavor === "nut") {
            const cakeNut = tierFlavor.cakeNutType === "other"
                ? tierFlavor.otherCakeNut
                : this.getOptionLabel(
                    tierFlavor.cakeNutType,
                    questionnaireOptions.nutTypes
                );

            details.push(`Cake Nut: ${cakeNut}`);
        }

        if (tierFlavor.cakeColor) {
            details.push(`Cake Color: ${tierFlavor.cakeColor}`);
        }

        if (tierFlavor.filling === "fruit_filling") {
            const fruit = tierFlavor.fruitFilling === "other"
                ? tierFlavor.otherFruitFilling
                : this.getOptionLabel(
                    tierFlavor.fruitFilling,
                    questionnaireOptions.fruitFillings
                );

            details.push(`Fruit: ${fruit}`);
        }

        if (tierFlavor.filling === "nut_cream") {
            const nutCream = tierFlavor.fillingNutType === "other"
                ? tierFlavor.otherFillingNut
                : this.getOptionLabel(
                    tierFlavor.fillingNutType,
                    questionnaireOptions.nutTypes
                );

            details.push(`Nut Cream: ${nutCream}`);
        }

        if (tierFlavor.filling === "jam") {
            const preserve = tierFlavor.jamFlavor === "other"
                ? tierFlavor.otherJamFlavor
                : this.getOptionLabel(
                    tierFlavor.jamFlavor,
                    questionnaireOptions.fruitPreserves
                );

            details.push(`Fruit Preserve: ${preserve}`);
        }

        if (tierFlavor.filling === "buttercream_filling") {
            details.push(
                `Buttercream Type: ${this.getOptionLabel(
                    tierFlavor.buttercreamType,
                    questionnaireOptions.buttercreamTypes
                )}`
            );

            if (tierFlavor.buttercreamColor) {
                details.push(`Buttercream Color: ${tierFlavor.buttercreamColor}`);
            }

            if (tierFlavor.buttercreamFlavor) {
                details.push(`Buttercream Flavor: ${tierFlavor.buttercreamFlavor}`);
            }
        }

        if (tierFlavor.filling === "ganache") {
            details.push(
                `Ganache Chocolate Type: ${this.getOptionLabel(
                    tierFlavor.ganacheChocolateType,
                    questionnaireOptions.ganacheChocolateTypes
                )}`
            );

            if (tierFlavor.ganacheColor) {
                details.push(`Ganache Color: ${tierFlavor.ganacheColor}`);
            }
        }

        return details.join("\n");
    }

    createReferenceSummaryItem(referenceItems) {
        if (!referenceItems || referenceItems.length === 0) {
            return {
                label: "Reference Images / Links",
                value: "No references added"
            };
        }

        return {
            label: "Reference Images / Links",
            value: `${referenceItems.length} reference item(s) added`
        };
    }

    getOptionLabel(value, options) {
        if (!value) {
            return "Not specified";
        }

        const option = options.find((item) => item.value === value);

        if (!option) {
            return value;
        }

        return option.label;
    }

    getDisplayValue(value) {
        if (value === null || value === undefined || value === "") {
            return "Not specified";
        }

        if (Array.isArray(value)) {
            return value.length > 0 ? value.join(", ") : "Not specified";
        }

        return value;
    }

    formatKey(key) {
        return key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (firstLetter) => firstLetter.toUpperCase());
    }

    getCakeSizeSummaryValue(cakeRequest) {
        if (
            cakeRequest.consultationRequired === true ||
            cakeRequest.sizeAdviceLevel === "consultation"
        ) {
            return "Needs to be discussed with the bakery";
        }

        if (cakeRequest.recommendedSize) {
            return cakeRequest.recommendedSize;
        }

        if (cakeRequest.knownSize) {
            return cakeRequest.knownSize;
        }

        return "";
    }
}