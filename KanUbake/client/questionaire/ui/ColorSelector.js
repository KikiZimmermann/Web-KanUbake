/*
  Color Selector

  This UI component controls the color selection in the questionnaire.

  It supports:
  - selecting individual colors with one shared inline color picker
  - switching between main, accent and additional color
  - removing optional colors
  - selecting a base color for a suggested palette
  - generating and displaying color schemes through The Color API
*/

import { ColorApiService } from "../services/api/ColorApiService.js";

export class ColorSelector {
    constructor(state) {
        this.state = state;
        this.colorApiService = new ColorApiService();

        this.containerElement = null;
        this.sharedPicker = null;
        this.palettePicker = null;

        this.activeColor = {
            id: "mainCakeColor",
            index: 0,
            label: "Main color"
        };
    }

    // =========================================================
    // Main entry point
    // =========================================================

    mount(containerElement, colorMode) {
        if (!containerElement) {
            return;
        }

        this.containerElement = containerElement;
        this.sharedPicker = null;
        this.palettePicker = null;

        if (colorMode === "choose_colors") {
            this.renderIndividualColorSelection();
            this.initializeIndividualColorSelection();
            return;
        }

        if (colorMode === "suggest_palette") {
            this.renderPaletteSelection();
            this.attachPaletteEvents();
            this.initializePalette();
            return;
        }

        this.containerElement.replaceChildren();
    }

    // =========================================================
    // Individual color selection: rendering
    // =========================================================

    renderIndividualColorSelection() {
        const request = this.state.getCakeRequest();

        const mainColor = request.colors?.[0] || {
            hex: "#d9a7c7",
            name: "Choose a color"
        };

        const accentColor = request.colors?.[1] || {
            hex: "#f2d16b",
            name: "Choose a color"
        };

        const additionalColor = request.colors?.[2] || {
            hex: "#a8c5a0",
            name: "Choose a color"
        };

        this.containerElement.innerHTML = `
            <div class="conditional-section color-selector">
                <h3>Choose individual colors</h3>

                <div
                    id="sharedColorPicker"
                    class="shared-color-picker"
                ></div>

                <p class="active-color-label">
                    Current selection:
                    <strong id="activeColorLabel">Main color</strong>
                </p>

                <div class="individual-color-grid">
                    ${this.createColorCard(
            "mainCakeColor",
            "Main color",
            mainColor
        )}

                    ${this.createColorCard(
            "accentCakeColor",
            "Accent color",
            accentColor,
            true
        )}

                    ${this.createColorCard(
            "additionalCakeColor",
            "Additional color",
            additionalColor,
            true
        )}
                </div>

                <p
                    id="individualColorStatus"
                    class="field-hint"
                    aria-live="polite"
                ></p>
            </div>
        `;
    }

    createColorCard(fieldId, label, color, optional = false) {
        const optionalLabel = optional
            ? '<span class="optional-note">(optional)</span>'
            : "";

        const removeButton = optional
            ? `
                <button
                    type="button"
                    class="clear-color-button"
                    data-clear-color="${fieldId}"
                >
                    Remove color
                </button>
            `
            : "";

        return `
            <div class="color-picker-field">
                <div class="color-picker-label">
                    ${label} ${optionalLabel}
                </div>

                <button
                    type="button"
                    class="single-color-card"
                    id="${fieldId}Card"
                    data-color-id="${fieldId}"
                    style="background-color: ${color.hex};"
                    aria-label="Edit ${label.toLowerCase()}"
                    aria-pressed="false"
                >
                    <span id="${fieldId}Name">
                        ${color.name}
                    </span>
                </button>

                <div class="color-action-area">
                    ${removeButton}
                </div>
            </div>
        `;
    }

    // =========================================================
    // Individual color selection: initialization and events
    // =========================================================

    initializeIndividualColorSelection() {
        this.initializeSharedColorPicker();
        this.attachColorCardEvents();
        this.attachClearColorEvents();

        this.selectActiveColor("mainCakeColor");
    }

    initializeSharedColorPicker() {
        const request = this.state.getCakeRequest();

        const initialColor =
            request.colors?.[0]?.hex || "#d9a7c7";

        this.sharedPicker = new iro.ColorPicker(
            "#sharedColorPicker",
            {
                width: 280,
                color: initialColor,
                layout: [
                    {
                        component: iro.ui.Box
                    },
                    {
                        component: iro.ui.Slider,
                        options: {
                            sliderType: "hue"
                        }
                    }
                ]
            }
        );

        /*
          While the user moves inside the picker,
          update the active card immediately.
        */
        this.sharedPicker.on("color:change", (color) => {
            this.updateActiveCardPreview(color.hexString);
        });

        /*
          When the user finishes selecting a color,
          save it and load its readable name.
        */
        this.sharedPicker.on("input:end", async (color) => {
            await this.saveActiveColor(color.hexString);
        });
    }

    initializePaletteColorPicker() {
        const request = this.state.getCakeRequest();

        const initialColor =
            request.paletteBaseColor?.hex || "#3046A3";

        this.palettePicker = new iro.ColorPicker(
            "#paletteBaseColorPicker",
            {
                width: 280,
                color: initialColor,
                layout: [
                    {
                        component: iro.ui.Box
                    },
                    {
                        component: iro.ui.Slider,
                        options: {
                            sliderType: "hue"
                        }
                    }
                ]
            }
        );

        this.palettePicker.on("color:change", (color) => {
            const card = document.getElementById(
                "paletteBaseColorCard"
            );

            if (card) {
                card.style.backgroundColor = color.hexString;
            }
        });

        this.palettePicker.on("input:end", async (color) => {
            await this.updatePaletteBaseColor(
                color.hexString
            );

            await this.generatePalette();
        });
    }

    attachColorCardEvents() {
        const cards =
            this.containerElement.querySelectorAll("[data-color-id]");

        cards.forEach((card) => {
            card.addEventListener("click", () => {
                this.selectActiveColor(card.dataset.colorId);
            });
        });
    }

    attachClearColorEvents() {
        const clearButtons =
            this.containerElement.querySelectorAll(
                "[data-clear-color]"
            );

        clearButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const fieldId = button.dataset.clearColor;

                const removableColors = {
                    accentCakeColor: {
                        index: 1,
                        fallbackHex: "#f2d16b"
                    },
                    additionalCakeColor: {
                        index: 2,
                        fallbackHex: "#a8c5a0"
                    }
                };

                const selectedColor =
                    removableColors[fieldId];

                if (!selectedColor) {
                    return;
                }

                this.clearIndividualColor(
                    selectedColor.index,
                    fieldId,
                    selectedColor.fallbackHex
                );
            });
        });
    }

    // =========================================================
    // Individual color selection: active card
    // =========================================================

    selectActiveColor(fieldId) {
        const request = this.state.getCakeRequest();

        const colorMap = {
            mainCakeColor: {
                index: 0,
                label: "Main color",
                fallbackHex: "#d9a7c7"
            },
            accentCakeColor: {
                index: 1,
                label: "Accent color",
                fallbackHex: "#f2d16b"
            },
            additionalCakeColor: {
                index: 2,
                label: "Additional color",
                fallbackHex: "#a8c5a0"
            }
        };

        const selectedColor = colorMap[fieldId];

        if (!selectedColor) {
            return;
        }

        this.activeColor = {
            id: fieldId,
            index: selectedColor.index,
            label: selectedColor.label
        };

        const activeLabel =
            document.getElementById("activeColorLabel");

        if (activeLabel) {
            activeLabel.textContent =
                selectedColor.label;
        }

        this.markActiveCard(fieldId);

        const selectedHex =
            request.colors?.[selectedColor.index]?.hex ||
            selectedColor.fallbackHex;

        if (this.sharedPicker) {
            this.sharedPicker.color.hexString =
                selectedHex;
        }
    }

    markActiveCard(fieldId) {
        const cards =
            this.containerElement.querySelectorAll(
                "[data-color-id]"
            );

        cards.forEach((card) => {
            const isActive =
                card.dataset.colorId === fieldId;

            card.classList.toggle(
                "active",
                isActive
            );

            card.setAttribute(
                "aria-pressed",
                String(isActive)
            );
        });
    }

    updateActiveCardPreview(hex) {
        const card = document.getElementById(
            `${this.activeColor.id}Card`
        );

        if (card) {
            card.style.backgroundColor = hex;
        }
    }

    // =========================================================
    // Individual color selection: saving and removing
    // =========================================================

    async saveActiveColor(hex) {
        const statusElement =
            document.getElementById(
                "individualColorStatus"
            );

        if (statusElement) {
            statusElement.textContent =
                "Loading color information...";
        }

        try {
            const colorData =
                await this.colorApiService
                    .getColorInformation(hex);

            const selectedColor = {
                hex: colorData.hex.value,
                name: colorData.name.value
            };

            const request =
                this.state.getCakeRequest();

            if (!Array.isArray(request.colors)) {
                request.colors = [];
            }

            /*
              Fixed positions:

              index 0 = main color
              index 1 = accent color
              index 2 = additional color

              Do not filter this array because filtering would
              change the meaning of the remaining indexes.
            */
            request.colors[this.activeColor.index] =
                selectedColor;

            request.markUpdated();

            const card = document.getElementById(
                `${this.activeColor.id}Card`
            );

            const name = document.getElementById(
                `${this.activeColor.id}Name`
            );

            if (card) {
                card.style.backgroundColor =
                    selectedColor.hex;

                card.style.color =
                    colorData.contrast.value;
            }

            if (name) {
                name.textContent =
                    selectedColor.name;
            }

            if (statusElement) {
                statusElement.textContent = "";
            }
        } catch (error) {
            console.error(
                "Color information could not be loaded:",
                error
            );

            if (statusElement) {
                statusElement.textContent =
                    "The color name could not be loaded.";
            }
        }
    }

    clearIndividualColor(index, fieldId, fallbackHex) {
        const request =
            this.state.getCakeRequest();

        if (!Array.isArray(request.colors)) {
            request.colors = [];
        }

        request.colors[index] = null;
        request.markUpdated();

        const card = document.getElementById(
            `${fieldId}Card`
        );

        const name = document.getElementById(
            `${fieldId}Name`
        );

        if (card) {
            card.style.backgroundColor =
                fallbackHex;

            card.style.color = "";
        }

        if (name) {
            name.textContent =
                "Choose a color";
        }

        /*
          When the removed card is currently active,
          reset the shared picker to the fallback color.
        */
        if (
            this.activeColor.id === fieldId &&
            this.sharedPicker
        ) {
            this.sharedPicker.color.hexString =
                fallbackHex;
        }
    }

    // =========================================================
    // Suggested palette: rendering
    // =========================================================

    renderPaletteSelection() {
        const request = this.state.getCakeRequest();

        const baseColor = request.paletteBaseColor || {
            hex: "#3046A3",
            name: "Cobalt"
        };

        const schemeMode =
            request.paletteSchemeMode || "analogic";

        this.containerElement.innerHTML = `
        <div class="conditional-section color-selector">
            <h3>Generate a color palette</h3>

            <div class="palette-top-row">
                <div class="palette-base-card-column">
                    <div class="color-picker-label">
                        Starting color
                    </div>

                    <div
                        id="paletteBaseColorCard"
                        class="single-color-card palette-base-color-card"
                        style="background-color: ${baseColor.hex};"
                    >
                        <span id="paletteBaseColorName">
                            ${baseColor.name}
                        </span>
                    </div>
                </div>

                <div class="palette-picker-column">
                    <div class="color-picker-label">
                        Pick a color
                    </div>

                    <div
                        id="paletteBaseColorPicker"
                        class="shared-color-picker"
                    ></div>
                </div>
            </div>

            <div class="form-field palette-scheme-field">
                <label for="paletteSchemeMode">
                    Color scheme
                </label>

                <select id="paletteSchemeMode">
                    ${this.createSchemeOptions(schemeMode)}
                </select>
            </div>

            <p
                id="paletteStatus"
                class="field-hint"
                aria-live="polite"
            ></p>

            <div
                id="paletteSchemePreview"
                class="palette-scheme-preview"
                aria-label="Generated color palette"
            ></div>
        </div>
    `;
    }

    createSchemeOptions(selectedMode) {
        const modes = [
            {
                value: "monochrome",
                label: "Monochrome"
            },
            {
                value: "monochrome-dark",
                label: "Monochrome dark"
            },
            {
                value: "monochrome-light",
                label: "Monochrome light"
            },
            {
                value: "analogic",
                label: "Analogous colors"
            },
            {
                value: "complement",
                label: "Complementary colors"
            },
            {
                value: "analogic-complement",
                label: "Analogous complementary"
            },
            {
                value: "triad",
                label: "Triad"
            },
            {
                value: "quad",
                label: "Quad"
            }
        ];

        return modes
            .map((mode) => {
                const selected =
                    mode.value === selectedMode
                        ? "selected"
                        : "";

                return `
                    <option
                        value="${mode.value}"
                        ${selected}
                    >
                        ${mode.label}
                    </option>
                `;
            })
            .join("");
    }

    // =========================================================
    // Suggested palette: events and initialization
    // =========================================================

    attachPaletteEvents() {
        const schemeSelect =
            document.getElementById("paletteSchemeMode");

        if (schemeSelect) {
            schemeSelect.addEventListener(
                "change",
                async () => {
                    const request =
                        this.state.getCakeRequest();

                    request.paletteSchemeMode =
                        schemeSelect.value;

                    request.markUpdated();

                    await this.generatePalette();
                }
            );
        }
    }

    async initializePalette() {
        const request = this.state.getCakeRequest();

        if (!request.paletteBaseColor) {
            request.paletteBaseColor = {
                hex: "#3046A3",
                name: "Cobalt"
            };
        }

        if (!request.paletteSchemeMode) {
            request.paletteSchemeMode = "analogic";
        }

        request.markUpdated();

        this.initializePaletteColorPicker();

        await this.generatePalette();
    }

    // =========================================================
    // Suggested palette: API requests
    // =========================================================

    async updatePaletteBaseColor(hex) {
        const statusElement =
            document.getElementById(
                "paletteStatus"
            );

        if (statusElement) {
            statusElement.textContent =
                "Loading color information...";
        }

        try {
            const colorData =
                await this.colorApiService
                    .getColorInformation(hex);

            const request =
                this.state.getCakeRequest();

            request.paletteBaseColor = {
                hex: colorData.hex.value,
                name: colorData.name.value
            };

            request.markUpdated();

            const card =
                document.getElementById(
                    "paletteBaseColorCard"
                );

            const name =
                document.getElementById(
                    "paletteBaseColorName"
                );

            if (card) {
                card.style.backgroundColor =
                    request.paletteBaseColor.hex;

                card.style.color =
                    colorData.contrast.value;
            }

            if (name) {
                name.textContent =
                    request.paletteBaseColor.name;
            }

            if (statusElement) {
                statusElement.textContent = "";
            }
        } catch (error) {
            console.error(
                "Palette base color could not be loaded:",
                error
            );

            if (statusElement) {
                statusElement.textContent =
                    "The starting color could not be loaded.";
            }
        }
    }

    async generatePalette() {
        const request =
            this.state.getCakeRequest();

        const statusElement =
            document.getElementById(
                "paletteStatus"
            );

        if (!request.paletteBaseColor?.hex) {
            return;
        }

        if (statusElement) {
            statusElement.textContent =
                "Generating color palette...";
        }

        try {
            const schemeData =
                await this.colorApiService
                    .getColorScheme(
                        request.paletteBaseColor.hex,
                        request.paletteSchemeMode,
                        5
                    );

            request.paletteColors =
                schemeData.colors.map((color) => ({
                    hex: color.hex.value,
                    name: color.name.value,
                    contrast: color.contrast.value
                }));

            request.markUpdated();

            this.renderPaletteBands(
                request.paletteColors
            );

            if (statusElement) {
                statusElement.textContent = "";
            }
        } catch (error) {
            console.error(
                "Color palette could not be generated:",
                error
            );

            if (statusElement) {
                statusElement.textContent =
                    "The color palette could not be generated.";
            }
        }
    }

    // =========================================================
    // Suggested palette: rendering generated colors
    // =========================================================

    renderPaletteBands(colors) {
        const previewElement =
            document.getElementById(
                "paletteSchemePreview"
            );

        if (!previewElement) {
            return;
        }

        previewElement.replaceChildren();

        colors.forEach((color) => {
            const band =
                document.createElement("div");

            band.classList.add(
                "palette-color-band"
            );

            band.style.backgroundColor =
                color.hex;

            band.style.color =
                color.contrast;

            const name =
                document.createElement("span");

            name.textContent =
                color.name;

            band.append(name);
            previewElement.append(band);
        });
    }
}