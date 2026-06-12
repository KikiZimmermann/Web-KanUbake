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
                    this.createSummaryItem("Occasion", cakeRequest.occasion, questionnaireOptions.occasions),
                    this.createSummaryItem("Cake Type", cakeRequest.cakeType, questionnaireOptions.cakeTypes),
                    this.createSummaryItem("Serving Size", cakeRequest.servingSize, questionnaireOptions.servingSizes),
                    this.createSummaryItem("Shape", cakeRequest.shape, questionnaireOptions.shapes),
                    this.createSummaryItem("Tiers", cakeRequest.tiers, questionnaireOptions.tiers),
                    this.createSummaryItem("Size Information", cakeRequest.sizeMode, questionnaireOptions.sizeModes),
                    this.createPlainSummaryItem("Known Servings", cakeRequest.knownServings),
                    this.createPlainSummaryItem("Known Size", cakeRequest.knownSize),
                    this.createMultiSummaryItem("Restrictions", cakeRequest.restrictions, questionnaireOptions.restrictions),
                    this.createPlainSummaryItem("Restriction Notes", cakeRequest.restrictionNotes)
                ]
            },
            {
                title: "Flavor & Filling",
                items: [
                    this.createSummaryItem("Tier Flavor Mode", cakeRequest.tierFlavorMode, questionnaireOptions.tierFlavorModes),
                    this.createTierFlavorSummaryItem(cakeRequest.tierFlavors)
                ]
            },
            {
                title: "Design & Decoration",
                items: [
                    this.createSummaryItem("Covering", cakeRequest.covering, questionnaireOptions.coverings),
                    this.createSummaryItem("Fondant Layer", cakeRequest.fondantLayer, questionnaireOptions.fondantLayers),
                    this.createSummaryItem("Design Style", cakeRequest.designStyle, questionnaireOptions.designStyles),
                    this.createPlainSummaryItem("Theme Description", cakeRequest.themeDescription),
                    this.createSummaryItem("Color Mode", cakeRequest.colorMode, questionnaireOptions.colorModes),
                    this.createColorSummaryItem(cakeRequest.colors, cakeRequest.paletteBaseColor, cakeRequest.paletteSchemeMode, cakeRequest.paletteColors, cakeRequest.colorMode),
                    this.createMultiSummaryItem("Decorations", cakeRequest.decorations, questionnaireOptions.decorations),
                    this.createObjectSummaryItem("Text Details", cakeRequest.textDetails),
                    this.createObjectSummaryItem("Number / Age Details", cakeRequest.numberAgeDetails),
                    this.createSummaryItem("Chocolate Glaze Preserve", cakeRequest.chocolateGlazePreserveFlavor, questionnaireOptions.fruitPreserves
                    ),
                ]
            },
            {
                title: "References & Budget",
                items: [
                    this.createReferenceSummaryItem(cakeRequest.referenceItems),
                    this.createSummaryItem("Budget Mode", cakeRequest.budgetMode, questionnaireOptions.budgetModes),
                    this.createSummaryItem("Budget Range", cakeRequest.budgetRange, questionnaireOptions.budgetRanges),
                    this.createPlainSummaryItem("Custom Budget", cakeRequest.customBudget),
                    this.createPlainSummaryItem("Additional Notes", cakeRequest.additionalNotes)
                ]
            }
        ];
    }

    createColorSummaryItem(
        colors,
        paletteBaseColor,
        paletteSchemeMode,
        paletteColors,
        colorMode
    ) {
        if (colorMode === "choose_colors") {
            if (!Array.isArray(colors) || colors.length === 0) {
                return {
                    label: "Colors",
                    value: "Not specified"
                };
            }

            return {
                label: "Colors",
                value: colors
                    .filter(Boolean)
                    .map((color) => `${color.name} (${color.hex})`)
                    .join(", ")
            };
        }

        if (colorMode === "suggest_palette") {
            if (!paletteBaseColor) {
                return {
                    label: "Color Palette",
                    value: "Not specified"
                };
            }

            const paletteText =
                Array.isArray(paletteColors) &&
                    paletteColors.length > 0
                    ? paletteColors
                        .map(
                            (color) =>
                                `${color.name} (${color.hex})`
                        )
                        .join(", ")
                    : "No palette generated";

            return {
                label: "Color Palette",
                value:
                    `Starting color: ${paletteBaseColor.name} ` +
                    `(${paletteBaseColor.hex}); ` +
                    `Scheme: ${paletteSchemeMode}; ` +
                    `Colors: ${paletteText}`
            };
        }

        return {
            label: "Colors",
            value: "Not specified"
        };
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
            value: tierSummaries.join(" | ")
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
}