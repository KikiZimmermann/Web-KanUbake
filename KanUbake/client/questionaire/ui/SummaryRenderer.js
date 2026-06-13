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
        value.textContent = item.value;

        row.append(label, value);

        return row;
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

    createEmailSection() {
        const section = document.createElement("div");
        section.classList.add("email-draft-section");

        const heading = document.createElement("h4");
        heading.textContent = "Send draft to your email";

        const row = document.createElement("div");
        row.classList.add("email-draft-row");

        const input = document.createElement("input");
        input.type = "email";
        input.placeholder = "your@email.com";
        input.id = "draftEmailInput";
        input.classList.add("email-draft-input");

        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "Send";
        button.id = "sendDraftEmailButton";
        button.classList.add("email-draft-button");

        const status = document.createElement("p");
        status.id = "emailDraftStatus";
        status.classList.add("email-draft-status");

        row.append(input, button);
        section.append(heading, row, status);

        return section;
    }

    clear() {
        this.containerElement.replaceChildren();
    }
}