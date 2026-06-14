/*
  Summary Renderer

  This class displays the structured summary created by SummaryBuilder.

  It is responsible only for rendering the summary in the browser.
  It does not build summary data and does not modify the CakeRequest.
*/

export class SummaryRenderer {
    constructor(containerElement) {
        if (!containerElement) {
            throw new Error(
                "SummaryRenderer requires a valid container element."
            );
        }

        this.containerElement = containerElement;
    }

    render(summarySections) {
        if (!Array.isArray(summarySections)) {
            throw new TypeError(
                "SummaryRenderer expected summarySections to be an array."
            );
        }

        this.containerElement.replaceChildren();

        const summaryContent = document.createElement("div");
        summaryContent.classList.add("summary-content");

        summaryContent.append(
            this.createHeading(),
            this.createWarning()
        );

        summarySections.forEach((section) => {
            summaryContent.append(
                this.createSummarySection(section)
            );
        });

        this.containerElement.append(summaryContent);
    }

    createHeading() {
        const heading = document.createElement("h3");
        heading.textContent = "Your Request Summary";

        return heading;
    }

    createWarning() {
        const warning = document.createElement("p");

        warning.classList.add("summary-warning");

        warning.textContent =
            "This is not a binding order yet. All details and prices must be confirmed directly with the bakery.";

        return warning;
    }

    createSummarySection(section) {
        const sectionElement = document.createElement("section");
        sectionElement.classList.add("summary-section");

        const heading = document.createElement("h4");
        heading.textContent = section.title;

        const summaryList = document.createElement("dl");
        summaryList.classList.add("summary-list");

        section.items.forEach((item) => {
            summaryList.append(
                this.createSummaryRow(item)
            );
        });

        sectionElement.append(heading, summaryList);

        return sectionElement;
    }

    createSummaryRow(item) {
        const row = document.createElement("div");
        row.classList.add("summary-row");

        const label = document.createElement("dt");
        label.textContent = item.label;

        const value = document.createElement("dd");

        if (item.type === "color-list") {
            value.append(this.createColorList(item.colors));
        } else if (item.type === "color-palette") {
            value.append(this.createColorPalette(item));
        } else {
            value.textContent = item.value ?? "";
            value.style.whiteSpace = "pre-line";
        }

        row.append(label, value);

        return row;
    }

    createColorPalette(item) {
        const container = document.createElement("div");
        container.classList.add("summary-color-palette");

        if (item.startingColor?.hex) {
            const startingColorGroup = document.createElement("div");
            startingColorGroup.classList.add("summary-color-group");

            const heading = document.createElement("strong");
            heading.textContent = "Starting Color";

            startingColorGroup.append(
                heading,
                this.createColorCard(item.startingColor)
            );

            container.append(startingColorGroup);
        }

        if (item.scheme) {
            const scheme = document.createElement("p");
            scheme.classList.add("summary-color-scheme");

            const schemeLabel = document.createElement("strong");
            schemeLabel.textContent = "Scheme: ";

            scheme.append(
                schemeLabel,
                document.createTextNode(this.formatColorScheme(item.scheme))
            );

            container.append(scheme);
        }

        if (Array.isArray(item.colors) && item.colors.length > 0) {
            const colorsGroup = document.createElement("div");
            colorsGroup.classList.add("summary-color-group");

            const heading = document.createElement("strong");
            heading.textContent = "Palette Colors";

            colorsGroup.append(
                heading,
                this.createColorList(item.colors)
            );

            container.append(colorsGroup);
        }

        return container;
    }

    createColorList(colors) {
        const list = document.createElement("div");
        list.classList.add("summary-color-list");

        if (!Array.isArray(colors) || colors.length === 0) {
            const message = document.createElement("p");
            message.textContent = "No colors available.";
            list.append(message);

            return list;
        }

        colors.forEach((color) => {
            if (color?.hex) {
                list.append(this.createColorCard(color));
            }
        });

        return list;
    }

    createColorCard(color) {
        const card = document.createElement("div");
        card.classList.add("summary-color-card");

        const swatch = document.createElement("span");
        swatch.classList.add("summary-color-swatch");
        swatch.style.backgroundColor = color.hex;

        const information = document.createElement("span");
        information.classList.add("summary-color-information");

        const name = document.createElement("strong");
        name.textContent = color.name || "Unnamed Color";

        const hex = document.createElement("span");
        hex.textContent = color.hex.toUpperCase();

        information.append(name, hex);
        card.append(swatch, information);

        return card;
    }

    formatColorScheme(scheme) {
        const schemeLabels = {
            analogic: "Analogous",
            complement: "Complementary",
            triad: "Triadic",
            quad: "Quadratic",
            monochrome: "Monochromatic"
        };

        return schemeLabels[scheme] || scheme;
    }

    renderAnalysisLoading() {
        const container = this.containerElement.querySelector(".summary-content");
        if (!container) return;

        const el = document.createElement("div");
        el.id = "analysisSection";
        el.classList.add("summary-section");
        el.innerHTML = `<h4>Cake Analysis</h4><p class="summary-warning">Loading allergens and nutrition info...</p>`;
        container.appendChild(el);
    }

    renderAnalysisResults(allergens, analysis) {
        const el = document.getElementById("analysisSection");
        if (!el) return;
        const container = el.parentElement;

        const allergenText = allergens && allergens.length > 0
            ? allergens.join(", ")
            : "None detected";

        let nutrientsHtml = "";
        if (analysis && analysis.nutrition && analysis.nutrition.nutrients) {
            const nutrients = analysis.nutrition.nutrients.slice(0, 5);
            nutrientsHtml = `
                <dl class="summary-list">
                    ${nutrients.map(n => `
                        <div class="summary-row">
                            <dt>${n.name}</dt>
                            <dd>${n.amount} ${n.unit}</dd>
                        </div>`).join("")}
                </dl>`;
        } else {
            nutrientsHtml = `<p>Nutrition data not available.</p>`;
        }

        el.innerHTML = `
            <h4>Cake Analysis</h4>
            <dl class="summary-list">
                <div class="summary-row">
                    <dt>Allergens</dt>
                    <dd>${allergenText}</dd>
                </div>
            </dl>
            <h4 style="margin-top:12px;">Estimated Nutrients (per serving)</h4>
            ${nutrientsHtml}`;

        if (container && !container.querySelector(".email-draft-section")) {
            container.append(this.createEmailSection());
        }
    }

    renderAnalysisError() {
        const el = document.getElementById("analysisSection");
        if (!el) return;
        el.innerHTML = `<h4>Cake Analysis</h4><p class="summary-warning">Could not load analysis data. Please try again later.</p>`;
        const container = el.parentElement;
        if (container && !container.querySelector(".email-draft-section")) {
            container.append(this.createEmailSection());
        }
    }

    renderPricingLoading() {
        const container =
            this.containerElement.querySelector(".summary-content");

        if (!container) {
            return;
        }

        const section = document.createElement("section");
        section.id = "pricingSection";
        section.classList.add("summary-section");

        section.innerHTML = `
        <h4>Estimated Price</h4>
        <p class="summary-warning">
            Calculating estimated price...
        </p>
    `;

        container.append(section);
    }

    renderPricingResult(pricingResult) {
        const section = document.getElementById("pricingSection");

        if (!section) {
            return;
        }

        const minimum = pricingResult.estimatedMinimum;
        const maximum = pricingResult.estimatedMaximum;
        const currencySymbol =
            pricingResult.currency === "EUR" ? "€" : pricingResult.currency;

        const messages = Array.isArray(pricingResult.messages)
            ? pricingResult.messages
            : [];

        const messagesHtml = messages.length > 0
            ? `
            <ul>
                ${messages
                .map((message) => `<li>${message}</li>`)
                .join("")}
            </ul>
        `
            : "";

        section.innerHTML = `
        <h4>Estimated Price</h4>

        <p>
            <strong>
                ${currencySymbol}${minimum}–${currencySymbol}${maximum}
            </strong>
        </p>

        <p class="summary-warning">
            This is a rough and non-binding estimate.
            The final price must be confirmed by the bakery.
        </p>

        ${messagesHtml}
    `;
    }

    renderPricingError() {
        const section = document.getElementById("pricingSection");

        if (!section) {
            return;
        }

        section.innerHTML = `
        <h4>Estimated Price</h4>

        <p class="summary-warning">
            A price estimate could not be calculated.
            Please confirm the price directly with the bakery.
        </p>
    `;
    }

    renderPricingUnavailable() {
        const container = this.containerElement.querySelector(".summary-content");

        if (!container) {
            return;
        }

        const section = document.createElement("section");
        section.id = "pricingSection";
        section.classList.add("summary-section");

        section.innerHTML = `
        <h4>Individual Price Estimate Required</h4>

        <p class="summary-warning">
            3D, sculpted and custom-shaped cakes require an individual estimate.
            Their price depends on the requested design, dimensions, internal structure,
            materials and level of detail.
        </p>

        <p>
            The bakery will use your requested servings, design details and references
            to determine a suitable construction and prepare a personalized price estimate.
        </p>
    `;

        container.append(section);
    }

    createEmailSection() {
        const section = document.createElement("div");
        section.classList.add("email-draft-section");

        const heading = document.createElement("h4");
        heading.textContent = "Send draft to your email";

        const row = document.createElement("div");
        row.classList.add("email-draft-row");

        const inputWrapper = document.createElement("div");
        inputWrapper.classList.add("email-draft-input-wrapper");

        const input = document.createElement("input");
        input.type = "email";
        input.placeholder = "your@email.com";
        input.id = "draftEmailInput";
        input.classList.add("email-draft-input");

        const status = document.createElement("p");
        status.id = "emailDraftStatus";
        status.classList.add("email-draft-status");

        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "Send";
        button.id = "sendDraftEmailButton";
        button.classList.add("email-draft-button");

        inputWrapper.append(input, status);
        row.append(inputWrapper, button);
        section.append(heading, row);

        return section;
    }

    clear() {
        this.containerElement.replaceChildren();
    }
}