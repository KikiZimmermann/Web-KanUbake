/*
  Summary Builder

  This class creates a readable summary from a CakeRequest object.

  The summary can be used for the final summary chapter, PDF generation,
  email content, or dashboard previews.

  This class does not render HTML directly. It only prepares structured
  summary data that can be displayed by the renderer.
*/

import { questionnaireOptions } from "../data/questionnaireOptions.js";

export class SummaryBuilder {
    buildSummary(cakeRequest) {
        return [
            {
                title: "Basic Information & Size",
                items: [
                    this.createOptionalPlainSummaryItem("Project Name", cakeRequest.displayName),
                    this.createSummaryItem("Occasion", cakeRequest.occasion, questionnaireOptions.occasions),
                    this.createSummaryItem("Cake Type", cakeRequest.cakeType, questionnaireOptions.cakeTypes),
                    this.createSummaryItem("Serving Size", cakeRequest.servingSize, questionnaireOptions.servingSizes),
                    this.createSummaryItem("Shape", cakeRequest.shape, questionnaireOptions.shapes),
                    this.createSummaryItem("Tiers", cakeRequest.tiers, questionnaireOptions.tiers),
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
                    this.createTierFlavorSummaryItem(cakeRequest.tierFlavors)
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
    }

    createColorSummaryItem(cakeRequest) {
        if (cakeRequest.colorMode === "choose_colors") {
            const colors = Array.isArray(cakeRequest.colors)
                ? cakeRequest.colors.filter(Boolean)
                : [];

            if (colors.length === 0) {
                return null;
            }

            return {
                label: "Colors",
                value: colors
                    .map((color) => `${color.name} (${color.hex})`)
                    .join(", ")
            };
        }

        if (cakeRequest.colorMode === "suggest_palette") {
            if (!cakeRequest.paletteBaseColor) {
                return null;
            }

            const paletteColors = Array.isArray(cakeRequest.paletteColors)
                ? cakeRequest.paletteColors
                : [];

            const colors = paletteColors
                .map((color) => `${color.name} (${color.hex})`)
                .join(", ");

            return {
                label: "Color Palette",
                value:
                    `Starting color: ${cakeRequest.paletteBaseColor.name} ` +
                    `(${cakeRequest.paletteBaseColor.hex}); ` +
                    `Scheme: ${cakeRequest.paletteSchemeMode}; ` +
                    `Colors: ${colors || "No palette generated"}`
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
        const value = this.getCakeSizeSummaryValue(cakeRequest);

        if (!value) {
            return null;
        }

        return {
            label: cakeRequest.recommendedSize
                ? "Recommended Cake Size"
                : "Cake Size",
            value
        };
    }

    createCoveringDetailItems(cakeRequest) {
        const items = [];

        if (cakeRequest.covering === "buttercream") {
            items.push(
                this.createSummaryItem(
                    "Buttercream Type",
                    cakeRequest.coveringButtercreamType,
                    questionnaireOptions.buttercreamTypes
                )
            );

            items.push(
                this.createOptionalPlainSummaryItem(
                    "Buttercream Color",
                    cakeRequest.coveringButtercreamColor
                )
            );

            items.push(
                this.createOptionalPlainSummaryItem(
                    "Buttercream Flavor",
                    cakeRequest.coveringButtercreamFlavor
                )
            );
        }

        if (cakeRequest.covering === "ganache") {
            items.push(
                this.createSummaryItem(
                    "Ganache Chocolate Type",
                    cakeRequest.coveringGanacheChocolateType,
                    questionnaireOptions.ganacheChocolateTypes
                )
            );

            items.push(
                this.createOptionalPlainSummaryItem(
                    "Ganache Color",
                    cakeRequest.coveringGanacheColor
                )
            );
        }

        if (
            cakeRequest.covering === "chocolate_glaze" &&
            cakeRequest.chocolateGlazePreserveChoice === "yes"
        ) {
            const preserve =
                cakeRequest.chocolateGlazePreserveFlavor === "other"
                    ? cakeRequest.chocolateGlazeOtherPreserveFlavor
                    : this.getOptionLabel(
                        cakeRequest.chocolateGlazePreserveFlavor,
                        questionnaireOptions.fruitPreserves
                    );

            items.push({
                label: "Fruit Preserve Under Chocolate Glaze",
                value: preserve
            });
        }

        if (cakeRequest.covering === "other") {
            items.push(
                this.createOptionalPlainSummaryItem(
                    "Other Covering",
                    cakeRequest.coveringOther
                )
            );
        }

        return items.filter(Boolean);
    }

    createFondantLayerSummaryItems(cakeRequest) {
        if (cakeRequest.covering !== "fondant") {
            return [];
        }

        if (
            Array.isArray(cakeRequest.fondantLayerDetails) &&
            cakeRequest.fondantLayerDetails.length > 0
        ) {
            return cakeRequest.fondantLayerDetails.map((layer) => {
                const details = [
                    this.getOptionLabel(
                        layer.layerType,
                        questionnaireOptions.fondantLayers
                    )
                ];

                if (layer.layerType === "buttercream") {
                    details.push(
                        this.getOptionLabel(
                            layer.buttercreamType,
                            questionnaireOptions.buttercreamTypes
                        )
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
                        this.getOptionLabel(
                            layer.ganacheChocolateType,
                            questionnaireOptions.ganacheChocolateTypes
                        )
                    );

                    if (layer.ganacheColor) {
                        details.push(`Color: ${layer.ganacheColor}`);
                    }
                }

                if (layer.layerType === "marmalade") {
                    const preserve =
                        layer.marmaladeFlavor === "other"
                            ? layer.otherMarmaladeFlavor
                            : this.getOptionLabel(
                                layer.marmaladeFlavor,
                                questionnaireOptions.fruitPreserves
                            );

                    details.push(preserve);
                }

                return {
                    label: `Fondant Layer – Tier ${layer.tierNumber}`,
                    value: details.filter(Boolean).join(", ")
                };
            });
        }

        const details = [
            this.getOptionLabel(
                cakeRequest.fondantLayer,
                questionnaireOptions.fondantLayers
            )
        ];

        if (cakeRequest.fondantLayer === "buttercream") {
            details.push(
                this.getOptionLabel(
                    cakeRequest.fondantButtercreamType,
                    questionnaireOptions.buttercreamTypes
                )
            );

            if (cakeRequest.fondantButtercreamColor) {
                details.push(`Color: ${cakeRequest.fondantButtercreamColor}`);
            }

            if (cakeRequest.fondantButtercreamFlavor) {
                details.push(`Flavor: ${cakeRequest.fondantButtercreamFlavor}`);
            }
        }

        if (cakeRequest.fondantLayer === "ganache") {
            details.push(
                this.getOptionLabel(
                    cakeRequest.fondantGanacheChocolateType,
                    questionnaireOptions.ganacheChocolateTypes
                )
            );

            if (cakeRequest.fondantGanacheColor) {
                details.push(`Color: ${cakeRequest.fondantGanacheColor}`);
            }
        }

        if (cakeRequest.fondantLayer === "marmalade") {
            const preserve =
                cakeRequest.fondantMarmaladeFlavor === "other"
                    ? cakeRequest.fondantOtherMarmaladeFlavor
                    : this.getOptionLabel(
                        cakeRequest.fondantMarmaladeFlavor,
                        questionnaireOptions.fruitPreserves
                    );

            details.push(preserve);
        }

        return [{
            label: "Fondant Layer",
            value: details.filter(Boolean).join(", ")
        }];
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
            value: labels.join(", ")
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
            label: "Text Details",
            value: `${textDetails.text} – ${style}`
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
            value: `${numberAgeDetails.numberOrAge} – ${displayType}`
        };
    }

    createCandleSummaryItem(candleDetails) {
        if (!candleDetails) {
            return null;
        }

        let value = `${candleDetails.quantity} candle(s)`;

        if (candleDetails.colors) {
            value += `; Colors: ${candleDetails.colors}`;
        }

        return {
            label: "Candle Details",
            value
        };
    }

    createSizedDecorationSummaryItem(label, itemLabel, details) {
        if (!details) {
            return null;
        }

        const values = [];

        if (details.description) {
            values.push(`General description: ${details.description}`);
        }

        if (details.quantity === "4_plus") {
            values.push(
                "Quantity: 4 or more (please discuss the details and final price with the bakery)"
            );
        } else {
            values.push(`Quantity: ${details.quantity}`);

            if (Array.isArray(details.items)) {
                details.items.forEach((item, index) => {
                    const size = item.size
                        ? item.size.charAt(0).toUpperCase() + item.size.slice(1)
                        : "Not specified";

                    values.push(
                        `${itemLabel} ${index + 1}: ${item.description}, ${size}`
                    );
                });
            }
        }

        return {
            label,
            value: values.join("\n")
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
            .map(([key, value]) => `${this.formatKey(key)}: ${value}`);

        return {
            label: label,
            value: entries.length > 0 ? entries.join(", ") : "Not specified"
        };
    }

    createTierFlavorSummaryItem(tierFlavors) {
        if (!tierFlavors || tierFlavors.length === 0) {
            return {
                label: "Tier Flavors",
                value: "Not specified"
            };
        }

        const tierSummaries = tierFlavors.map((tierFlavor) => {
            const details = [];

            details.push(
                this.getOptionLabel(
                    tierFlavor.cakeFlavor,
                    questionnaireOptions.cakeFlavors
                )
            );

            if (tierFlavor.cakeFlavor === "other") {
                details.push(tierFlavor.otherCakeFlavor);
            }

            if (tierFlavor.cakeFlavor === "nut") {
                const nut =
                    tierFlavor.cakeNutType === "other"
                        ? tierFlavor.otherCakeNut
                        : this.getOptionLabel(
                            tierFlavor.cakeNutType,
                            questionnaireOptions.nutTypes
                        );

                details.push(`Cake nut: ${nut}`);
            }

            details.push(
                this.getOptionLabel(
                    tierFlavor.filling,
                    questionnaireOptions.fillings
                )
            );

            if (tierFlavor.filling === "other") {
                details.push(tierFlavor.otherFilling);
            }

            if (tierFlavor.filling === "fruit_filling") {
                const fruit =
                    tierFlavor.fruitFilling === "other"
                        ? tierFlavor.otherFruitFilling
                        : this.getOptionLabel(
                            tierFlavor.fruitFilling,
                            questionnaireOptions.fruitFillings
                        );

                details.push(`Fruit: ${fruit}`);
            }

            if (tierFlavor.filling === "nut_cream") {
                const nut =
                    tierFlavor.fillingNutType === "other"
                        ? tierFlavor.otherFillingNut
                        : this.getOptionLabel(
                            tierFlavor.fillingNutType,
                            questionnaireOptions.nutTypes
                        );

                details.push(`Nut cream: ${nut}`);
            }

            if (tierFlavor.filling === "jam") {
                const preserve =
                    tierFlavor.jamFlavor === "other"
                        ? tierFlavor.otherJamFlavor
                        : this.getOptionLabel(
                            tierFlavor.jamFlavor,
                            questionnaireOptions.fruitPreserves
                        );

                details.push(`Fruit preserve: ${preserve}`);
            }

            return `Tier ${tierFlavor.tierNumber}: ${details.join(", ")}`;
        });

        return {
            label: "Tier Flavors",
            value: tierSummaries.join("\n")
        };
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