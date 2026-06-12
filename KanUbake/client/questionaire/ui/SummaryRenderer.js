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

    clear() {
        this.containerElement.replaceChildren();
    }
}