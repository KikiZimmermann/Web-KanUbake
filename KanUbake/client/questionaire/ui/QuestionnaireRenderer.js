/*
  Questionnaire Renderer

  This class is responsible for displaying the correct questionnaire content
  on the page. It renders chapters, form fields, conditional questions,
  warnings, reference image sections, and the final summary.

  It should only handle what is shown to the user, not the business logic itself.
*/

import { questionnaireOptions } from "../data/questionnaireOptions.js";
import { SummaryBuilder } from "../services/SummaryBuilder.js";
import { SummaryRenderer } from "../ui/SummaryRenderer.js";
import { TierFlavor } from "../models/TierFlavor.js";
import { ReferenceItem } from "../models/ReferenceItem.js";
import { CakeSizeApiService } from "../services/api/CakeSizeApiService.js";
import { ColorSelector } from "./ColorSelector.js";
import { CakeRequestApiService } from "../services/api/CakeRequestApiService.js";

export class QuestionnaireRenderer {
  constructor(state) {
    this.state = state;
    this.summaryBuilder = new SummaryBuilder();
    this.cakeSizeApiService = new CakeSizeApiService();
    this.colorSelector = new ColorSelector(this.state);

    this.chapterIntroElement = document.getElementById("chapterIntro");
    this.chapterContainerElement = document.getElementById("chapterContainer");
    this.progressStepElements = document.querySelectorAll(".progress-step");

    this.backButton = document.getElementById("backButton");
    this.nextButton = document.getElementById("nextButton");
    this.saveButton = document.getElementById("saveButton");
    this.cancelButton = document.getElementById("cancelButton");

    this.summaryRenderer = new SummaryRenderer(this.chapterContainerElement);
    this.attachSaveButtonEvent();
  }

  //Save Button
  attachSaveButtonEvent() {
    if (!this.saveButton) {
      return;
    }

    this.saveButton.addEventListener("click", async () => {
      const cakeRequest =
        this.state.getCakeRequest();

      cakeRequest.markIncompleteDraft();

      try {
        const savedRequest =
          await CakeRequestApiService.saveCakeRequest(cakeRequest);

        console.log(
          "Cake request saved:",
          savedRequest
        );
      } catch (error) {
        console.error(
          "Cake request could not be saved:",
          error
        );
      }
    });
  }

  render() {
    this.renderProgress();
    this.renderChapterIntro();
    this.renderChapterContent();
    this.renderNavigationButtons();
  }

  renderProgress() {
    const currentIndex = this.state.getCurrentChapterIndex();

    this.progressStepElements.forEach((button, index) => {
      button.classList.toggle("active", index === currentIndex);
    });
  }

  renderChapterIntro() {
    const currentChapter = this.state.getCurrentChapter();

    this.chapterIntroElement.innerHTML = `
      <h2>${currentChapter.title}</h2>
      <p>${currentChapter.intro}</p>
    `;
  }

  renderChapterContent() {
    const currentChapter = this.state.getCurrentChapter();

    switch (currentChapter.id) {
      case "basic":
        this.renderBasicChapter();
        break;

      case "flavor":
        this.renderFlavorChapter();
        break;

      case "design":
        this.renderDesignChapter();
        break;

      case "references":
        this.renderReferencesChapter();
        break;

      case "summary":
        this.renderSummary();
        break;

      default:
        this.renderPlaceholderChapter();
    }
  }

  renderBasicChapter() {
    const request = this.state.getCakeRequest();

    this.chapterContainerElement.innerHTML = `
    <div class="chapter-content">

      <div class="form-field">
        <label for="displayName">
          Project name
        </label>

        <input
          type="text"
          id="displayName"
          data-field="displayName"
          maxlength="150"
          value="${request.displayName}"
          placeholder="For example: Emma's Birthday Cake"
        >
      </div>

      ${this.createSelectField(
      "occasion",
      "What is the occasion for the cake?",
      questionnaireOptions.occasions,
      request.occasion
    )}

      ${this.createSelectField(
      "cakeType",
      "What type of cake would you like?",
      questionnaireOptions.cakeTypes,
      request.cakeType
    )}

      ${this.createSelectField(
      "servingSize",
      "What serving size would you like?",
      questionnaireOptions.servingSizes,
      request.servingSize
    )}

      ${this.createSelectField(
      "shape",
      "What shape should the cake have?",
      questionnaireOptions.shapes,
      request.shape
    )}

      ${this.createSelectField(
      "tiers",
      "How many tiers should the cake have?",
      questionnaireOptions.tiers,
      request.tiers
    )}

      ${this.createSelectField(
      "sizeMode",
      "What do you already know about the size?",
      questionnaireOptions.sizeModes,
      request.sizeMode
    )}

      ${this.createSizeDetailsField(request)}

      ${this.createSizeEstimateBox(request)}

      ${this.createCheckboxGroup(
      "restrictions",
      "Are there any allergies or dietary requirements?",
      questionnaireOptions.restrictions,
      request.restrictions,
      "If you do not select anything, this will be treated as no restrictions. Multiple selections are possible. Complete absence of traces can only be guaranteed if confirmed by the bakery."
    )}

      <div class="form-field">
        <label for="restrictionNotes">
          Additional notes about allergies, intolerances, dietary needs or personal preferences
        </label>
        <textarea
          id="restrictionNotes"
          data-field="restrictionNotes"
          rows="4"
          placeholder="For example: no gelatin, no raisins, traces are okay, but no whole nuts."
        >${request.restrictionNotes}</textarea>
      </div>

    </div>
  `;

    this.attachBasicChapterEvents();
  }

  renderFlavorChapter() {
    const request = this.state.getCakeRequest();
    const tierCount = Number(request.tiers);

    let flavorModeHtml = "";

    if (tierCount > 1) {
      flavorModeHtml = this.createSelectField(
        "tierFlavorMode",
        "Should all tiers have the same cake flavor and filling?",
        questionnaireOptions.tierFlavorModes,
        request.tierFlavorMode
      );
    }

    this.prepareTierFlavors();

    this.chapterContainerElement.innerHTML = `
      <div class="chapter-content">
        ${flavorModeHtml}

        <div class="tier-flavor-wrapper">
          ${this.createTierFlavorFields()}
        </div>
      </div>
    `;

    this.attachFlavorChapterEvents();
  }

  renderDesignChapter() {
    const request = this.state.getCakeRequest();

    this.prepareFondantLayerDetails();

    this.chapterContainerElement.innerHTML = `
      <div class="chapter-content">

        ${this.createSelectField(
      "covering",
      "What covering or outer frosting would you like?",
      questionnaireOptions.coverings,
      request.covering
    )}

        ${this.createCoveringDetailsField(request)}

        ${this.createFondantLayerField(request)}

        ${this.createSelectField(
      "designStyle",
      "What design style do you like?",
      questionnaireOptions.designStyles,
      request.designStyle
    )}

        ${this.createThemeDescriptionField(request)}

        ${this.createSelectField(
      "colorMode",
      "What colors would you like for the cake?",
      questionnaireOptions.colorModes,
      request.colorMode
    )}

        ${this.createColorDetailsField(request)}

        ${this.createCheckboxGroup(
      "decorations",
      "Which extras or decorations would you like?",
      questionnaireOptions.decorations,
      request.decorations,
      "If you do not select anything, no extras will be added. Multiple selections are possible."
    )}

        ${this.createTextDetailsField(request)}

        ${this.createNumberAgeDetailsField(request)}

      </div>
    `;

    this.attachDesignChapterEvents();

    const colorSelectorContainer =
      document.getElementById("colorSelectorContainer");

    this.colorSelector.mount(
      colorSelectorContainer,
      request.colorMode
    );
  }

  renderReferencesChapter() {
    const request = this.state.getCakeRequest();

    this.chapterContainerElement.innerHTML = `
      <div class="chapter-content">

        ${this.createSelectField(
      "referenceMode",
      "Would you like to add reference or inspiration images?",
      questionnaireOptions.referenceTypes,
      request.referenceMode || ""
    )}

        ${this.createReferenceDetailsSection(request)}

        ${this.createSelectField(
      "budgetMode",
      "Would you like to enter a budget or see a rough price estimate?",
      questionnaireOptions.budgetModes,
      request.budgetMode
    )}

        ${this.createBudgetDetailsField(request)}

        <div class="form-field">
          <label for="additionalNotes">
            Would you like to add anything else?
          </label>
          <textarea
            id="additionalNotes"
            data-field="additionalNotes"
            rows="5"
            placeholder="For example: Please keep the design rather simple, or no blueberries in the mixed berry filling."
          >${request.additionalNotes}</textarea>
        </div>

      </div>
    `;

    this.attachReferencesChapterEvents();
  }

  prepareTierFlavors() {
    const request = this.state.getCakeRequest();
    const tierCount = Number(request.tiers);

    let neededFlavorEntries = 1;

    if (tierCount > 1 && request.tierFlavorMode === "individual_per_tier") {
      neededFlavorEntries = tierCount;
    }

    if (!Array.isArray(request.tierFlavors)) {
      request.tierFlavors = [];
    }

    if (request.tierFlavors.length !== neededFlavorEntries) {
      request.tierFlavors = [];

      for (let index = 0; index < neededFlavorEntries; index++) {
        request.tierFlavors.push(new TierFlavor(index + 1));
      }

      request.markUpdated();
    }
  }

  prepareFondantLayerDetails() {
    const request = this.state.getCakeRequest();

    if (!this.usesIndividualFondantLayers(request)) {
      request.fondantLayerDetails = [];
      return;
    }

    const tierCount = Number(request.tiers);

    if (!Array.isArray(request.fondantLayerDetails)) {
      request.fondantLayerDetails = [];
    }

    if (request.fondantLayerDetails.length !== tierCount) {
      request.fondantLayerDetails = [];

      for (let index = 0; index < tierCount; index++) {
        request.fondantLayerDetails.push({
          tierNumber: index + 1,
          layerType: "",
          buttercreamType: "",
          buttercreamColor: "",
          buttercreamFlavor: "",
          ganacheChocolateType: "",
          ganacheColor: "",
          marmaladeFlavor: "",
          otherMarmaladeFlavor: ""
        });
      }

      request.markUpdated();
    }
  }

  usesIndividualFondantLayers(request) {
    return (
      request.covering === "fondant" &&
      Number(request.tiers) > 1 &&
      request.tierFlavorMode === "individual_per_tier"
    );
  }

  createTierFlavorFields() {
    const request = this.state.getCakeRequest();

    return request.tierFlavors
      .map((tierFlavor, index) => {
        const title =
          request.tierFlavors.length === 1
            ? "Cake Flavor & Filling"
            : `Tier ${tierFlavor.tierNumber}`;

        return `
          <section class="tier-flavor-card">
            <h3>${title}</h3>

            ${this.createSelectField(
          `cakeFlavor-${index}`,
          "What cake flavor would you like?",
          questionnaireOptions.cakeFlavors,
          tierFlavor.cakeFlavor
        )}

            ${this.createOtherTextField(
          `otherCakeFlavor-${index}`,
          "Other cake flavor",
          tierFlavor.otherCakeFlavor,
          tierFlavor.cakeFlavor === "other"
        )}

        ${tierFlavor.cakeFlavor === "nut"
            ? this.createSelectField(
              `cakeNutType-${index}`,
              "Which nut would you like for the cake?",
              questionnaireOptions.nutTypes,
              tierFlavor.cakeNutType
            )
            : ""
          }

${this.createOtherTextField(
            `otherCakeNut-${index}`,
            "Which other nut would you like?",
            tierFlavor.otherCakeNut,
            tierFlavor.cakeNutType === "other"
          )}

            <div class="form-field">
              <label for="cakeColor-${index}">
                Cake color <span class="optional-note">(optional)</span>
              </label>
              <input
                type="text"
                id="cakeColor-${index}"
                data-field="cakeColor-${index}"
                value="${tierFlavor.cakeColor}"
                placeholder="For example: pink, blue, dark red"
              >
            </div>

            <p class="field-hint">
              For very dark cakes or cakes with a strong natural color, some colors
              may not be possible or only darker colors may work. This must be confirmed
              with the confectionist.
            </p>

            ${this.createSelectField(
            `filling-${index}`,
            "What filling would you like?",
            questionnaireOptions.fillings,
            tierFlavor.filling
          )}

            ${this.createOtherTextField(
            `otherFilling-${index}`,
            "Other filling",
            tierFlavor.otherFilling,
            tierFlavor.filling === "other"
          )}

            ${tierFlavor.filling === "fruit_filling"
            ? this.createSelectField(
              `fruitFilling-${index}`,
              "Which fruit filling would you like?",
              questionnaireOptions.fruitFillings,
              tierFlavor.fruitFilling
            )
            : ""
          }

            ${this.createOtherTextField(
            `otherFruitFilling-${index}`,
            "Other fruit filling",
            tierFlavor.otherFruitFilling,
            tierFlavor.fruitFilling === "other"
          )}

          ${tierFlavor.filling === "nut_cream"
            ? this.createSelectField(
              `fillingNutType-${index}`,
              "Which nut cream would you like?",
              questionnaireOptions.nutTypes,
              tierFlavor.fillingNutType
            )
            : ""
          }

${this.createOtherTextField(
            `otherFillingNut-${index}`,
            "Which other nut would you like?",
            tierFlavor.otherFillingNut,
            tierFlavor.fillingNutType === "other"
          )}

          ${tierFlavor.filling === "jam"
            ? this.createSelectField(
              `jamFlavor-${index}`,
              "Which fruit preserve would you like?",
              questionnaireOptions.fruitPreserves,
              tierFlavor.jamFlavor
            )
            : ""
          }

${this.createOtherTextField(
            `otherJamFlavor-${index}`,
            "Which other fruit preserve would you like?",
            tierFlavor.otherJamFlavor,
            tierFlavor.jamFlavor === "other"
          )}

            ${this.createButtercreamDetailsForTier(tierFlavor, index)}

            ${this.createGanacheDetailsForTier(tierFlavor, index)}
          </section>
        `;
      })
      .join("");
  }

  createButtercreamDetailsForTier(tierFlavor, index) {
    if (tierFlavor.filling !== "buttercream_filling") {
      return "";
    }

    return `
      <div class="conditional-section">
        ${this.createSelectField(
      `buttercreamType-${index}`,
      "Which buttercream type would you like?",
      questionnaireOptions.buttercreamTypes,
      tierFlavor.buttercreamType
    )}

        ${this.createButtercreamExplanation()}

        <div class="form-field">
          <label for="buttercreamColor-${index}">
            Buttercream color <span class="optional-note">(optional)</span>
          </label>
          <input
            type="text"
            id="buttercreamColor-${index}"
            data-field="buttercreamColor-${index}"
            value="${tierFlavor.buttercreamColor}"
            placeholder="For example: pastel pink"
          >
        </div>

        <div class="form-field">
          <label for="buttercreamFlavor-${index}">
            Buttercream flavor <span class="optional-note">(optional)</span>
          </label>
          <input
            type="text"
            id="buttercreamFlavor-${index}"
            data-field="buttercreamFlavor-${index}"
            value="${tierFlavor.buttercreamFlavor}"
            placeholder="For example: vanilla, lemon, raspberry"
          >
        </div>
      </div>
    `;
  }

  createGanacheDetailsForTier(tierFlavor, index) {
    if (tierFlavor.filling !== "ganache") {
      return "";
    }

    return `
      <div class="conditional-section">
        ${this.createSelectField(
      `ganacheChocolateType-${index}`,
      "Which ganache chocolate type would you like?",
      questionnaireOptions.ganacheChocolateTypes,
      tierFlavor.ganacheChocolateType
    )}

        <div class="form-field">
          <label for="ganacheColor-${index}">
            Ganache color <span class="optional-note">(optional)</span>
          </label>
          <input
            type="text"
            id="ganacheColor-${index}"
            data-field="ganacheColor-${index}"
            value="${tierFlavor.ganacheColor}"
            placeholder="For example: ivory, pink, light blue"
          >
        </div>

        <p class="field-hint">
          Coloring ganache is usually only possible with white ganache.
        </p>
      </div>
    `;
  }

  createButtercreamExplanation() {
    return `
      <p class="field-hint">
        Swiss meringue buttercream is smooth, silky and less sweet.
        Italian meringue buttercream is very stable and often used professionally.
        American buttercream is sweeter, firmer and good for strong decorations.
      </p>
    `;
  }

  createCoveringDetailsField(request) {
    if (request.covering === "buttercream") {
      return `
        <div class="conditional-section">
          ${this.createSelectField(
        "coveringButtercreamType",
        "Which buttercream type would you like?",
        questionnaireOptions.buttercreamTypes,
        request.coveringButtercreamType
      )}

          ${this.createButtercreamExplanation()}

          <div class="form-field">
            <label for="coveringButtercreamColor">
              Buttercream color <span class="optional-note">(optional)</span>
            </label>
            <input
              type="text"
              id="coveringButtercreamColor"
              data-field="coveringButtercreamColor"
              value="${request.coveringButtercreamColor}"
              placeholder="For example: pastel pink"
            >
          </div>

          <div class="form-field">
            <label for="coveringButtercreamFlavor">
              Buttercream flavor <span class="optional-note">(optional)</span>
            </label>
            <input
              type="text"
              id="coveringButtercreamFlavor"
              data-field="coveringButtercreamFlavor"
              value="${request.coveringButtercreamFlavor}"
              placeholder="For example: vanilla, lemon, raspberry"
            >
          </div>
        </div>
      `;
    }

    if (request.covering === "ganache") {
      return `
        <div class="conditional-section">
          ${this.createSelectField(
        "coveringGanacheChocolateType",
        "Which ganache chocolate type would you like?",
        questionnaireOptions.ganacheChocolateTypes,
        request.coveringGanacheChocolateType
      )}

          <div class="form-field">
            <label for="coveringGanacheColor">
              Ganache color <span class="optional-note">(optional)</span>
            </label>
            <input
              type="text"
              id="coveringGanacheColor"
              data-field="coveringGanacheColor"
              value="${request.coveringGanacheColor}"
              placeholder="For example: ivory, pink, light blue"
            >
          </div>

          <p class="field-hint">
            Coloring ganache is usually only possible with white ganache.
          </p>
        </div>
      `;
    }

    if (request.covering === "chocolate_glaze") {
      return `
        <div class="conditional-section">
            ${this.createSelectField(
        "chocolateGlazePreserveChoice",
        "Would you like jam / fruit preserve underneath the chocolate glaze?",
        questionnaireOptions.yesNoUnsure,
        request.chocolateGlazePreserveChoice
      )}

            ${request.chocolateGlazePreserveChoice === "yes"
          ? this.createSelectField(
            "chocolateGlazePreserveFlavor",
            "Which fruit preserve would you like?",
            questionnaireOptions.fruitPreserves,
            request.chocolateGlazePreserveFlavor
          )
          : ""
        }

            ${this.createOtherTextField(
          "chocolateGlazeOtherPreserveFlavor",
          "Which other fruit preserve would you like?",
          request.chocolateGlazeOtherPreserveFlavor,
          request.chocolateGlazePreserveFlavor === "other"
        )}
        </div>
    `;
    }

    if (request.covering === "other") {
      return `
        <div class="form-field">
          <label for="coveringOther">Other covering option</label>
          <input
            type="text"
            id="coveringOther"
            data-field="coveringOther"
            value="${request.coveringOther}"
            placeholder="Please describe the covering you would like."
          >
        </div>
      `;
    }

    return "";
  }

  createFondantLayerField(request) {
    if (request.covering !== "fondant") {
      return "";
    }

    if (this.usesIndividualFondantLayers(request)) {
      return this.createIndividualFondantLayerFields(request);
    }

    return `
      <div class="conditional-section">
        ${this.createSelectField(
      "fondantLayer",
      "Which layer should be used underneath the fondant?",
      questionnaireOptions.fondantLayers,
      request.fondantLayer
    )}

        <p class="field-hint">
          Fondant usually requires a stable layer such as ganache, buttercream or another suitable layer underneath
          so it can stick properly and create a smooth surface.
        </p>

        ${this.createSingleFondantLayerDetails(request)}
      </div>
    `;
  }

  createIndividualFondantLayerFields(request) {
    return `
      <div class="conditional-section">
        <h3>Fondant Layers Per Tier</h3>

        <p class="field-hint">
          Because you selected individual flavors for multiple tiers, you can choose the layer underneath
          the fondant separately for each tier.
        </p>

        ${request.fondantLayerDetails
        .map((layer, index) => {
          return `
              <section class="tier-flavor-card">
                <h3>Tier ${layer.tierNumber}</h3>

                ${this.createSelectField(
            `fondantLayer-${index}`,
            `Which layer should be used underneath the fondant for tier ${layer.tierNumber}?`,
            questionnaireOptions.fondantLayers,
            layer.layerType
          )}

                ${this.createFondantLayerDetailsForLayer(layer, index)}
              </section>
            `;
        })
        .join("")}
      </div>
    `;
  }

  createSingleFondantLayerDetails(request) {
    const layer = {
      layerType: request.fondantLayer,
      buttercreamType: request.fondantButtercreamType,
      buttercreamColor: request.fondantButtercreamColor,
      buttercreamFlavor: request.fondantButtercreamFlavor,
      ganacheChocolateType: request.fondantGanacheChocolateType,
      ganacheColor: request.fondantGanacheColor,
      marmaladeFlavor: request.fondantMarmaladeFlavor,
      otherMarmaladeFlavor: request.fondantOtherMarmaladeFlavor
    };

    return this.createFondantLayerDetailsForLayer(layer, null);
  }

  createFondantLayerDetailsForLayer(layer, index) {
    const suffix = index === null ? "" : `-${index}`;

    if (layer.layerType === "buttercream") {
      return `
        ${this.createSelectField(
        `fondantButtercreamType${suffix}`,
        "Which buttercream type would you like?",
        questionnaireOptions.buttercreamTypes,
        layer.buttercreamType
      )}

        ${this.createButtercreamExplanation()}

        <div class="form-field">
          <label for="fondantButtercreamColor${suffix}">
            Buttercream color <span class="optional-note">(optional)</span>
          </label>
          <input
            type="text"
            id="fondantButtercreamColor${suffix}"
            data-field="fondantButtercreamColor${suffix}"
            value="${layer.buttercreamColor}"
            placeholder="For example: ivory, pink, blue"
          >
        </div>

        <div class="form-field">
          <label for="fondantButtercreamFlavor${suffix}">
            Buttercream flavor <span class="optional-note">(optional)</span>
          </label>
          <input
            type="text"
            id="fondantButtercreamFlavor${suffix}"
            data-field="fondantButtercreamFlavor${suffix}"
            value="${layer.buttercreamFlavor}"
            placeholder="For example: vanilla, lemon, raspberry"
          >
        </div>
      `;
    }

    if (layer.layerType === "ganache") {
      return `
        ${this.createSelectField(
        `fondantGanacheChocolateType${suffix}`,
        "Which ganache chocolate type would you like?",
        questionnaireOptions.ganacheChocolateTypes,
        layer.ganacheChocolateType
      )}

        <div class="form-field">
          <label for="fondantGanacheColor${suffix}">
            Ganache color <span class="optional-note">(optional)</span>
          </label>
          <input
            type="text"
            id="fondantGanacheColor${suffix}"
            data-field="fondantGanacheColor${suffix}"
            value="${layer.ganacheColor}"
            placeholder="For example: ivory, pink, light blue"
          >
        </div>

        <p class="field-hint">
          Coloring ganache is usually only possible with white ganache.
        </p>
      `;
    }

    if (layer.layerType === "marmalade") {
      return `
        ${this.createSelectField(
        `fondantMarmaladeFlavor${suffix}`,
        "Which fruit preserve would you like?",
        questionnaireOptions.fruitPreserves,
        layer.marmaladeFlavor
      )}

        ${this.createOtherTextField(
        `fondantOtherMarmaladeFlavor${suffix}`,
        "Which other fruit preserve would you like?",
        layer.otherMarmaladeFlavor || "",
        layer.marmaladeFlavor === "other"
      )}
    `;
    }

    return "";
  }

  createThemeDescriptionField(request) {
    if (request.designStyle !== "themed") {
      return "";
    }

    return `
      <div class="form-field">
        <label for="themeDescription">
          What theme should the cake have?
        </label>
        <textarea
          id="themeDescription"
          data-field="themeDescription"
          rows="4"
          placeholder="For example: forest theme, video game theme, princess theme..."
        >${request.themeDescription}</textarea>
      </div>
    `;
  }

  createColorDetailsField(request) {
    if (
      request.colorMode === "choose_colors" ||
      request.colorMode === "suggest_palette"
    ) {
      return `
            <div id="colorSelectorContainer"></div>
        `;
    }

    if (request.colorMode === "choose_color_theme") {
      return this.createSelectField(
        "colorTheme",
        "Which color theme would you like?",
        questionnaireOptions.colorThemes,
        request.colorTheme || ""
      );
    }

    return "";
  }

  createTextDetailsField(request) {
    if (!request.decorations.includes("text_lettering")) {
      return "";
    }

    const textDetails = request.textDetails || {
      text: "",
      letteringStyle: ""
    };

    return `
      <div class="conditional-section">
        <h3>Text Details</h3>

        <div class="form-field">
          <label for="cakeText">
            What should the text on the cake say?
          </label>
          <input
            type="text"
            id="cakeText"
            data-field="cakeText"
            value="${textDetails.text}"
            placeholder="For example: Happy Birthday Emma"
          >
        </div>

        ${this.createSelectField(
      "letteringStyle",
      "What lettering style would you like?",
      questionnaireOptions.letteringStyles,
      textDetails.letteringStyle
    )}

        <p class="field-hint">
          Long texts may not fit well on smaller cakes.
        </p>
      </div>
    `;
  }

  createNumberAgeDetailsField(request) {
    if (!request.decorations.includes("number_age")) {
      return "";
    }

    const numberAgeDetails = request.numberAgeDetails || {
      numberOrAge: "",
      displayType: ""
    };

    return `
      <div class="conditional-section">
        <h3>Number / Age Details</h3>

        <div class="form-field">
          <label for="numberOrAge">
            Which number or age should be displayed?
          </label>
          <input
            type="text"
            id="numberOrAge"
            data-field="numberOrAge"
            value="${numberAgeDetails.numberOrAge}"
            placeholder="For example: 30, 1st, 2026"
          >
        </div>

        ${this.createSelectField(
      "numberDisplayType",
      "How should the number be displayed?",
      questionnaireOptions.numberDisplayTypes,
      numberAgeDetails.displayType
    )}
      </div>
    `;
  }

  createReferenceDetailsSection(request) {
    if (
      !request.referenceMode ||
      request.referenceMode === "no" ||
      request.referenceMode === "unsure_advise"
    ) {
      return "";
    }

    return `
      <div class="conditional-section">
        <h3>References</h3>

        <p class="field-hint">
          Reference images are used as inspiration. An exact copy cannot be guaranteed.
          This section is optional.
        </p>

        ${this.createReferenceInputArea(request)}

        <div id="referenceList" class="reference-list">
          ${this.createReferenceList(request)}
        </div>
      </div>
    `;
  }

  createReferenceInputArea(request) {
    const allowsImages =
      request.referenceMode === "upload_images" ||
      request.referenceMode === "upload_images_and_links";

    const allowsLinks =
      request.referenceMode === "add_links" ||
      request.referenceMode === "upload_images_and_links";

    return `
      ${allowsImages
        ? `
            <div class="form-field">
              <label for="referenceImage">
                Upload reference image
              </label>
              <input
                type="file"
                id="referenceImage"
                data-field="referenceImage"
                accept="image/png, image/jpeg, image/webp"
              >
            </div>
          `
        : ""
      }

      ${allowsLinks
        ? `
            <div class="form-field">
              <label for="referenceUrl">
                Add reference link
              </label>
              <input
                type="url"
                id="referenceUrl"
                data-field="referenceUrl"
                placeholder="https://..."
              >
            </div>

            <button id="addLinkReferenceButton" type="button">
              Add link reference
            </button>
          `
        : ""
      }
    `;
  }

  createReferenceList(request) {
    if (!request.referenceItems || request.referenceItems.length === 0) {
      return `
        <p class="field-hint">
          No reference items added yet.
        </p>
      `;
    }

    return request.referenceItems
      .map((referenceItem, index) => {
        return `
          <section class="reference-card">
            <h4>Reference ${index + 1}</h4>

            ${referenceItem.type === "image"
            ? `
                  <img
                    class="reference-preview"
                    src="${referenceItem.filePreviewUrl}"
                    alt="Uploaded reference image"
                  >
                `
            : `<p>URL: ${referenceItem.url}</p>`
          }

            <button
              class="remove-reference-button"
              type="button"
              data-reference-index="${index}"
            >
              Remove reference
            </button>
          </section>
        `;
      })
      .join("");
  }

  createBudgetDetailsField(request) {
    if (
      !request.budgetMode ||
      request.budgetMode === "skip" ||
      request.budgetMode === "unsure_advise"
    ) {
      return "";
    }

    let estimateText = "";

    if (request.budgetMode === "show_estimate" || request.budgetMode === "both") {
      if (request.shape === "sculpted_3d") {
        estimateText = `
          <p class="field-hint">
            For 3D / sculpted cakes, no reliable automatic price estimate can be provided
            because the amount of work, stability requirements, level of detail and
            materials can vary significantly. The price must be discussed and confirmed
            directly with the bakery.
          </p>
        `;
      } else {
        estimateText = `
          <p class="field-hint">
            A rough price estimate can be added later. This is not a final or binding price.
            The final price must be confirmed directly with the bakery.
          </p>
        `;
      }
    }

    const budgetRangeField =
      request.budgetMode === "enter_budget" || request.budgetMode === "both"
        ? this.createSelectField(
          "budgetRange",
          "Do you have an approximate budget?",
          questionnaireOptions.budgetRanges,
          request.budgetRange
        )
        : "";

    const customBudgetField =
      request.budgetRange === "custom_budget"
        ? `
          <div class="form-field">
            <label for="customBudget">
              Desired budget
            </label>
            <input
              type="number"
              id="customBudget"
              data-field="customBudget"
              min="0"
              value="${request.customBudget}"
              placeholder="For example: 150"
            >
          </div>
        `
        : "";

    return `
      <div class="conditional-section">
        ${budgetRangeField}
        ${customBudgetField}
        ${estimateText}
      </div>
    `;
  }

  createSelectField(fieldName, labelText, options, selectedValue) {
    return `
      <div class="form-field">
        <label for="${fieldName}">${labelText}</label>

        <select id="${fieldName}" data-field="${fieldName}">
          <option value="">Please choose...</option>

          ${options
        .map((option) => {
          const selected = option.value === selectedValue ? "selected" : "";

          return `
                <option value="${option.value}" ${selected}>
                  ${option.label}
                </option>
              `;
        })
        .join("")}
        </select>
      </div>
    `;
  }

  createOtherTextField(fieldName, labelText, value, shouldShow) {
    if (!shouldShow) {
      return "";
    }

    return `
      <div class="form-field">
        <label for="${fieldName}">${labelText}</label>
        <input
          type="text"
          id="${fieldName}"
          data-field="${fieldName}"
          value="${value}"
          placeholder="Please describe..."
        >
      </div>
    `;
  }

  createCheckboxGroup(fieldName, labelText, options, selectedValues, hintText = "") {
    return `
      <div class="form-field checkbox-field">
        <p class="field-label">${labelText}</p>

        <div class="checkbox-group" data-field="${fieldName}">
          ${options
        .map((option) => {
          const checked = selectedValues.includes(option.value) ? "checked" : "";

          return `
                <label class="checkbox-option">
                  <input
                    type="checkbox"
                    name="${fieldName}"
                    value="${option.value}"
                    ${checked}
                  >
                  ${option.label}
                </label>
              `;
        })
        .join("")}
        </div>

        ${hintText
        ? `<p class="field-hint">${hintText}</p>`
        : ""
      }
      </div>
    `;
  }

  createSizeDetailsField(request) {
    if (request.sizeMode === "known_servings") {
      return `
      <div class="form-field">
        <label for="knownServings">
          How many guests or servings should the cake cover?
        </label>
        <input
          type="number"
          id="knownServings"
          data-field="knownServings"
          min="1"
          value="${request.knownServings}"
          placeholder="For example: 20"
        >
      </div>
    `;
    }

    if (request.sizeMode === "known_size") {
      return `
      <div class="form-field">
        <label for="knownSize">
          What cake size do you roughly want?
        </label>

        <select id="knownSize" data-field="knownSize">
          <option value="">Please choose...</option>
        </select>
      </div>

      <p class="field-hint">
        The available sizes are loaded from the cake size API based on the selected shape and number of tiers.
      </p>
    `;
    }

    return "";
  }

  attachBasicChapterEvents() {
    const displayNameInput =
      document.getElementById("displayName");

    if (displayNameInput) {
      displayNameInput.addEventListener("input", (event) => {
        this.state.updateField(
          "displayName",
          event.target.value
        );
      });
    }

    this.attachSelectChangeEvent("occasion");
    this.attachSelectChangeEvent("cakeType");

    this.attachCakeSizeRelevantSelectEvent("servingSize");
    this.attachCakeSizeRelevantSelectEvent("shape", true);
    this.attachCakeSizeRelevantSelectEvent("tiers", true);

    const sizeModeSelect = document.getElementById("sizeMode");

    if (sizeModeSelect) {
      sizeModeSelect.addEventListener("change", (event) => {
        this.state.updateMultipleFields({
          sizeMode: event.target.value,
          knownServings: "",
          knownSize: "",
          recommendedSize: "",
          estimatedServings: "",
          sizeEstimateMessage: "",
          plannedServingsWithBuffer: ""
        });

        this.render();
      });
    }

    const knownServingsInput = document.getElementById("knownServings");

    if (knownServingsInput) {
      knownServingsInput.addEventListener("input", (event) => {
        this.state.updateField("knownServings", event.target.value);
      });

      knownServingsInput.addEventListener("blur", () => {
        this.updateCakeSizeEstimate();
      });
    }

    const knownSizeSelect = document.getElementById("knownSize");

    if (knownSizeSelect) {
      this.loadKnownSizeOptions(knownSizeSelect);

      knownSizeSelect.addEventListener("change", (event) => {
        this.state.updateField("knownSize", event.target.value);
        this.updateCakeSizeEstimate();
      });
    }

    const restrictionNotes = document.getElementById("restrictionNotes");

    if (restrictionNotes) {
      restrictionNotes.addEventListener("input", (event) => {
        this.state.updateField("restrictionNotes", event.target.value);
      });
    }

    this.attachCheckboxGroupChange("restrictions", (selectedValues) => {
      this.state.updateField("restrictions", selectedValues);
    });
  }

  attachFlavorChapterEvents() {
    this.attachSelectChangeEvent("tierFlavorMode", true);

    const request = this.state.getCakeRequest();

    request.tierFlavors.forEach((tierFlavor, index) => {
      const cakeFlavorSelect = document.getElementById(`cakeFlavor-${index}`);
      const fillingSelect = document.getElementById(`filling-${index}`);
      const fruitFillingSelect = document.getElementById(`fruitFilling-${index}`);

      const otherCakeFlavorInput = document.getElementById(`otherCakeFlavor-${index}`);
      const otherFillingInput = document.getElementById(`otherFilling-${index}`);
      const otherFruitFillingInput = document.getElementById(`otherFruitFilling-${index}`);

      const cakeColorInput = document.getElementById(`cakeColor-${index}`);
      const buttercreamTypeSelect = document.getElementById(`buttercreamType-${index}`);
      const buttercreamColorInput = document.getElementById(`buttercreamColor-${index}`);
      const buttercreamFlavorInput = document.getElementById(`buttercreamFlavor-${index}`);
      const ganacheChocolateTypeSelect = document.getElementById(`ganacheChocolateType-${index}`);
      const ganacheColorInput = document.getElementById(`ganacheColor-${index}`);

      const cakeNutTypeSelect = document.getElementById(`cakeNutType-${index}`);
      const otherCakeNutInput = document.getElementById(`otherCakeNut-${index}`);

      const fillingNutTypeSelect = document.getElementById(`fillingNutType-${index}`);
      const otherFillingNutInput = document.getElementById(`otherFillingNut-${index}`);

      const jamFlavorSelect = document.getElementById(`jamFlavor-${index}`);
      const otherJamFlavorInput = document.getElementById(`otherJamFlavor-${index}`);

      if (cakeFlavorSelect) {
        cakeFlavorSelect.addEventListener("change", (event) => {
          tierFlavor.updateCakeFlavor(event.target.value);
          request.markUpdated();
          this.render();
        });
      }

      if (cakeNutTypeSelect) {
        cakeNutTypeSelect.addEventListener("change", (event) => {
          tierFlavor.updateCakeNutType(event.target.value);
          request.markUpdated();
          this.render();
        });
      }

      if (otherCakeNutInput) {
        otherCakeNutInput.addEventListener("input", (event) => {
          tierFlavor.otherCakeNut = event.target.value;
          request.markUpdated();
        });
      }

      if (fillingSelect) {
        fillingSelect.addEventListener("change", (event) => {
          tierFlavor.updateFilling(event.target.value);
          request.markUpdated();
          this.render();
        });
      }

      if (fruitFillingSelect) {
        fruitFillingSelect.addEventListener("change", (event) => {
          tierFlavor.updateFruitFilling(event.target.value);
          request.markUpdated();
          this.render();
        });
      }

      if (otherCakeFlavorInput) {
        otherCakeFlavorInput.addEventListener("input", (event) => {
          tierFlavor.otherCakeFlavor = event.target.value;
          request.markUpdated();
        });
      }

      if (otherFillingInput) {
        otherFillingInput.addEventListener("input", (event) => {
          tierFlavor.otherFilling = event.target.value;
          request.markUpdated();
        });
      }

      if (otherFruitFillingInput) {
        otherFruitFillingInput.addEventListener("input", (event) => {
          tierFlavor.otherFruitFilling = event.target.value;
          request.markUpdated();
        });
      }

      if (fillingNutTypeSelect) {
        fillingNutTypeSelect.addEventListener("change", (event) => {
          tierFlavor.updateFillingNutType(event.target.value);
          request.markUpdated();
          this.render();
        });
      }

      if (otherFillingNutInput) {
        otherFillingNutInput.addEventListener("input", (event) => {
          tierFlavor.otherFillingNut = event.target.value;
          request.markUpdated();
        });
      }

      if (jamFlavorSelect) {
        jamFlavorSelect.addEventListener("change", (event) => {
          tierFlavor.updateJamFlavor(event.target.value);
          request.markUpdated();
          this.render();
        });
      }

      if (otherJamFlavorInput) {
        otherJamFlavorInput.addEventListener("input", (event) => {
          tierFlavor.otherJamFlavor = event.target.value;
          request.markUpdated();
        });
      }

      if (cakeColorInput) {
        cakeColorInput.addEventListener("input", (event) => {
          tierFlavor.cakeColor = event.target.value;
          request.markUpdated();
        });
      }

      if (buttercreamTypeSelect) {
        buttercreamTypeSelect.addEventListener("change", (event) => {
          tierFlavor.buttercreamType = event.target.value;
          request.markUpdated();
        });
      }

      if (buttercreamColorInput) {
        buttercreamColorInput.addEventListener("input", (event) => {
          tierFlavor.buttercreamColor = event.target.value;
          request.markUpdated();
        });
      }

      if (buttercreamFlavorInput) {
        buttercreamFlavorInput.addEventListener("input", (event) => {
          tierFlavor.buttercreamFlavor = event.target.value;
          request.markUpdated();
        });
      }

      if (ganacheChocolateTypeSelect) {
        ganacheChocolateTypeSelect.addEventListener("change", (event) => {
          tierFlavor.ganacheChocolateType = event.target.value;
          request.markUpdated();
        });
      }

      if (ganacheColorInput) {
        ganacheColorInput.addEventListener("input", (event) => {
          tierFlavor.ganacheColor = event.target.value;
          request.markUpdated();
        });
      }
    });
  }

  attachDesignChapterEvents() {
    this.attachSelectChangeEvent("covering", true);
    this.attachSelectChangeEvent("designStyle", true);
    this.attachSelectChangeEvent("colorMode", true);

    const request = this.state.getCakeRequest();

    // Normale Textfelder
    const normalTextFields = [
      "coveringOther",
      "coveringButtercreamColor",
      "coveringButtercreamFlavor",
      "coveringGanacheColor",
      "themeDescription",
      "paletteBaseColor",
      "fondantButtercreamColor",
      "fondantButtercreamFlavor",
      "fondantGanacheColor",
      "fondantOtherMarmaladeFlavor"
    ];

    normalTextFields.forEach((fieldName) => {
      const input = document.getElementById(fieldName);

      if (input) {
        input.addEventListener("input", (event) => {
          this.state.updateField(fieldName, event.target.value);
        });
      }
    });

    // Normale Select-Felder
    const normalSelectFields = [
      "coveringButtercreamType",
      "coveringGanacheChocolateType",
      "fondantLayer",
      "fondantButtercreamType",
      "fondantGanacheChocolateType",
      "fondantMarmaladeFlavor",
      "colorTheme"
    ];

    normalSelectFields.forEach((fieldName) => {
      const select = document.getElementById(fieldName);

      if (!select) {
        return;
      }

      select.addEventListener("change", (event) => {
        this.state.updateField(fieldName, event.target.value);

        if (

          fieldName === "fondantLayer" ||
          fieldName === "fondantButtercreamType" ||
          fieldName === "fondantGanacheChocolateType" ||
          fieldName === "fondantMarmaladeFlavor"
        ) {
          if (
            fieldName === "fondantMarmaladeFlavor" &&
            event.target.value !== "other"
          ) {
            this.state.updateField(
              "fondantOtherMarmaladeFlavor",
              ""
            );
          }
          this.render();
        }
      });
    });


    // Chocolate Glaze: Jam yes or no?
    const chocolateGlazePreserveChoice =
      document.getElementById("chocolateGlazePreserveChoice");

    if (chocolateGlazePreserveChoice) {
      chocolateGlazePreserveChoice.addEventListener("change", (event) => {
        const value = event.target.value;

        this.state.updateMultipleFields({
          chocolateGlazePreserveChoice: value,
          chocolateGlazePreserveFlavor:
            value === "yes"
              ? request.chocolateGlazePreserveFlavor
              : "",
          chocolateGlazeOtherPreserveFlavor:
            value === "yes"
              ? request.chocolateGlazeOtherPreserveFlavor
              : ""
        });

        this.render();
      });
    }

    // Chocolate Glaze: Which Jam?
    const chocolateGlazePreserveFlavor =
      document.getElementById("chocolateGlazePreserveFlavor");

    if (chocolateGlazePreserveFlavor) {
      chocolateGlazePreserveFlavor.addEventListener("change", (event) => {
        this.state.updateField(
          "chocolateGlazePreserveFlavor",
          event.target.value
        );

        if (event.target.value !== "other") {
          this.state.updateField(
            "chocolateGlazeOtherPreserveFlavor",
            ""
          );
        }

        this.render();
      });
    }

    // Chocolate Glaze: Other Fruit
    const chocolateGlazeOtherPreserveFlavor =
      document.getElementById("chocolateGlazeOtherPreserveFlavor");

    if (chocolateGlazeOtherPreserveFlavor) {
      chocolateGlazeOtherPreserveFlavor.addEventListener("input", (event) => {
        this.state.updateField(
          "chocolateGlazeOtherPreserveFlavor",
          event.target.value
        );
      }


      );
    }


    // Individual Fondant Layer per Tier
    request.fondantLayerDetails.forEach((layer, index) => {
      this.attachFondantLayerDetailEvents(layer, index);
    });

    // Decorations
    this.attachCheckboxGroupChange("decorations", (selectedValues) => {
      this.state.updateField("decorations", selectedValues);

      if (!selectedValues.includes("text_lettering")) {
        request.textDetails = null;
      }

      if (!selectedValues.includes("number_age")) {
        request.numberAgeDetails = null;
      }

      request.markUpdated();
      this.render();
    });

    const cakeText = document.getElementById("cakeText");
    if (cakeText) {
      cakeText.addEventListener("input", (event) => {
        this.updateTextDetails("text", event.target.value);
      });
    }

    const letteringStyle = document.getElementById("letteringStyle");
    if (letteringStyle) {
      letteringStyle.addEventListener("change", (event) => {
        this.updateTextDetails("letteringStyle", event.target.value);
      });
    }

    const numberOrAge = document.getElementById("numberOrAge");
    if (numberOrAge) {
      numberOrAge.addEventListener("input", (event) => {
        this.updateNumberAgeDetails("numberOrAge", event.target.value);
      });
    }

    const numberDisplayType = document.getElementById("numberDisplayType");
    if (numberDisplayType) {
      numberDisplayType.addEventListener("change", (event) => {
        this.updateNumberAgeDetails("displayType", event.target.value);
      });
    }
  }

  attachFondantLayerDetailEvents(layer, index) {
    const layerTypeSelect = document.getElementById(`fondantLayer-${index}`);

    if (layerTypeSelect) {
      layerTypeSelect.addEventListener("change", (event) => {
        layer.layerType = event.target.value;

        layer.buttercreamType = "";
        layer.buttercreamColor = "";
        layer.buttercreamFlavor = "";
        layer.ganacheChocolateType = "";
        layer.ganacheColor = "";
        layer.marmaladeFlavor = "";
        layer.otherMarmaladeFlavor = "";

        this.state.getCakeRequest().markUpdated();
        this.render();
      });
    }

    const fieldMap = {
      [`fondantButtercreamType-${index}`]: "buttercreamType",
      [`fondantButtercreamColor-${index}`]: "buttercreamColor",
      [`fondantButtercreamFlavor-${index}`]: "buttercreamFlavor",
      [`fondantGanacheChocolateType-${index}`]: "ganacheChocolateType",
      [`fondantGanacheColor-${index}`]: "ganacheColor",
      [`fondantMarmaladeFlavor-${index}`]: "marmaladeFlavor",
      [`fondantOtherMarmaladeFlavor-${index}`]: "otherMarmaladeFlavor"
    };

    Object.entries(fieldMap).forEach(([elementId, propertyName]) => {
      const element = document.getElementById(elementId);

      if (!element) {
        return;
      }

      const eventType = element.tagName.toLowerCase() === "select" ? "change" : "input";

      element.addEventListener(eventType, (event) => {
        layer[propertyName] = event.target.value;

        if (
          propertyName === "marmaladeFlavor" &&
          event.target.value !== "other"
        ) {
          layer.otherMarmaladeFlavor = "";
        }

        this.state.getCakeRequest().markUpdated();

        if (propertyName === "marmaladeFlavor") {
          this.render();
        }
      });
    });
  }

  attachReferencesChapterEvents() {
    this.attachSelectChangeEvent("referenceMode", true);
    this.attachSelectChangeEvent("budgetMode", true);
    this.attachSelectChangeEvent("budgetRange", true);

    const request = this.state.getCakeRequest();

    const customBudget = document.getElementById("customBudget");
    if (customBudget) {
      customBudget.addEventListener("input", (event) => {
        this.state.updateField("customBudget", event.target.value);
      });
    }

    const additionalNotes = document.getElementById("additionalNotes");
    if (additionalNotes) {
      additionalNotes.addEventListener("input", (event) => {
        this.state.updateField("additionalNotes", event.target.value);
      });
    }

    const referenceImageInput = document.getElementById("referenceImage");

    if (referenceImageInput) {
      referenceImageInput.addEventListener("change", () => {
        if (!referenceImageInput.files || referenceImageInput.files.length === 0) {
          return;
        }

        const file = referenceImageInput.files[0];
        const previewUrl = URL.createObjectURL(file);

        const referenceItem = new ReferenceItem("image");
        referenceItem.setImageFile(file, previewUrl);

        request.referenceItems.push(referenceItem);
        request.markUpdated();

        this.render();
      });
    }

    const addLinkReferenceButton = document.getElementById("addLinkReferenceButton");

    if (addLinkReferenceButton) {
      addLinkReferenceButton.addEventListener("click", () => {
        const urlInput = document.getElementById("referenceUrl");

        if (!urlInput || urlInput.value.trim() === "") {
          alert("Please enter a link first.");
          return;
        }

        const referenceItem = new ReferenceItem("link");
        referenceItem.setUrl(urlInput.value.trim());

        request.referenceItems.push(referenceItem);
        request.markUpdated();

        this.render();
      });
    }

    const removeReferenceButtons = document.querySelectorAll(".remove-reference-button");

    removeReferenceButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const referenceIndex = Number(button.dataset.referenceIndex);

        request.referenceItems.splice(referenceIndex, 1);
        request.markUpdated();

        this.render();
      });
    });
  }

  attachSelectChangeEvent(fieldName, shouldRerender = false) {
    const selectElement = document.getElementById(fieldName);

    if (!selectElement) {
      return;
    }

    selectElement.addEventListener("change", (event) => {
      this.state.updateField(fieldName, event.target.value);

      if (shouldRerender) {
        this.render();
      }
    });
  }

  attachCheckboxGroupChange(fieldName, callback) {
    const checkboxes = document.querySelectorAll(`input[name="${fieldName}"]`);

    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const selectedValues = Array.from(checkboxes)
          .filter((currentCheckbox) => currentCheckbox.checked)
          .map((currentCheckbox) => currentCheckbox.value);

        callback(selectedValues);
      });
    });
  }

  updateTextDetails(fieldName, value) {
    const request = this.state.getCakeRequest();

    if (!request.textDetails) {
      request.textDetails = {
        text: "",
        letteringStyle: ""
      };
    }

    request.textDetails[fieldName] = value;
    request.markUpdated();
  }

  updateNumberAgeDetails(fieldName, value) {
    const request = this.state.getCakeRequest();

    if (!request.numberAgeDetails) {
      request.numberAgeDetails = {
        numberOrAge: "",
        displayType: ""
      };
    }

    request.numberAgeDetails[fieldName] = value;
    request.markUpdated();
  }

  renderPlaceholderChapter() {
    const currentChapter = this.state.getCurrentChapter();

    this.chapterContainerElement.innerHTML = `
      <div class="chapter-content">
        <h3>${currentChapter.title}</h3>
        <p class="chapter-placeholder">
          Questions for this chapter will be rendered here next.
        </p>

        <ul class="chapter-section-list">
          ${currentChapter.sections
        .map((section) => `<li>${this.formatSectionName(section)}</li>`)
        .join("")}
        </ul>
      </div>
    `;
  }

  renderSummary() {
    const cakeRequest = this.state.getCakeRequest();

    const summarySections =
      this.summaryBuilder.buildSummary(cakeRequest);

    this.summaryRenderer.render(summarySections);
  }

  renderNavigationButtons() {
    this.backButton.disabled = this.state.isFirstChapter();

    if (this.state.isLastChapter()) {
      this.nextButton.textContent = "Finish";
    } else {
      this.nextButton.textContent = "Next";
    }
  }

  formatSectionName(sectionName) {
    return sectionName
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (firstLetter) => firstLetter.toUpperCase());
  }


  //Cake Size API Integration
  attachCakeSizeRelevantSelectEvent(fieldName, shouldClearKnownSize = false) {
    const selectElement = document.getElementById(fieldName);

    if (!selectElement) {
      return;
    }

    selectElement.addEventListener("change", (event) => {
      this.state.updateField(fieldName, event.target.value);

      if (shouldClearKnownSize) {
        this.state.updateField("knownSize", "");
      }

      this.updateCakeSizeEstimate();
    });
  }

  async updateCakeSizeEstimate() {
    const request = this.state.getCakeRequest();

    request.recommendedSize = "";
    request.estimatedServings = "";
    request.sizeEstimateMessage = "";
    request.plannedServingsWithBuffer = "";

    const shape = request.shape;
    const servingSize = request.servingSize;
    const tiers = request.tiers;

    if (!shape || !servingSize || !tiers || !request.sizeMode) {
      request.markUpdated();
      this.render();
      return;
    }

    try {
      let result = null;

      if (request.sizeMode === "known_servings") {
        if (!request.knownServings) {
          request.markUpdated();
          this.render();
          return;
        }

        result = await this.cakeSizeApiService.estimateSizeByServings({
          servings: request.knownServings,
          shape: shape,
          servingSize: servingSize,
          tiers: tiers
        });
      }

      if (request.sizeMode === "known_size") {
        if (!request.knownSize) {
          request.markUpdated();
          this.render();
          return;
        }

        result = await this.cakeSizeApiService.estimateServingsBySize({
          sizeId: request.knownSize,
          shape: shape,
          servingSize: servingSize,
          tiers: tiers
        });
      }

      if (!result) {
        request.markUpdated();
        this.render();
        return;
      }

      request.recommendedSize = result.recommendedSize || "";
      request.estimatedServings = result.estimatedServings || "";
      request.sizeEstimateMessage = result.message || "";
      request.plannedServingsWithBuffer = result.plannedServingsWithBuffer || "";

      request.markUpdated();
      this.render();
    } catch (error) {
      console.error("Cake size estimate failed:", error);

      request.recommendedSize = "";
      request.estimatedServings = "";
      request.sizeEstimateMessage =
        "The automatic cake size estimate is currently unavailable.";
      request.plannedServingsWithBuffer = "";

      request.markUpdated();
      this.render();
    }
  }

  createSizeEstimateBox(request) {
    if (!request.sizeMode) {
      return "";
    }

    return `
    <div class="conditional-section">
      <h4>Cake Size Estimate</h4>

      ${!request.recommendedSize && !request.estimatedServings
        ? `
            <p>
              Enter servings or choose a cake size to receive an automatic estimate.
            </p>
          `
        : ""
      }

      ${request.recommendedSize
        ? `
            <p>
              <strong>Recommended size:</strong> ${request.recommendedSize}
            </p>
          `
        : ""
      }

      ${request.estimatedServings
        ? `
            <p>
              <strong>Estimated servings:</strong> ${request.estimatedServings}
            </p>
          `
        : ""
      }

      ${request.plannedServingsWithBuffer
        ? `
            <p>
              <strong>Planned with buffer:</strong> ${request.plannedServingsWithBuffer} servings
            </p>
          `
        : ""
      }

      ${request.sizeEstimateMessage
        ? `
            <p class="field-hint">
              ${request.sizeEstimateMessage}
            </p>
          `
        : ""
      }
    </div>
  `;
  }

  async loadKnownSizeOptions(selectElement) {
    const request = this.state.getCakeRequest();

    if (!request.shape || !request.tiers) {
      return;
    }

    try {
      const result = await this.cakeSizeApiService.getAvailableCakeSizes({
        shape: request.shape,
        tiers: request.tiers
      });

      selectElement.innerHTML = `<option value="">Please choose...</option>`;

      result.sizes.forEach((size) => {
        const option = document.createElement("option");

        option.value = size.sizeId;
        option.textContent = `${size.label} (${size.partyServings} party servings / ${size.eventServings} event servings)`;

        if (size.sizeId === request.knownSize) {
          option.selected = true;
        }

        selectElement.appendChild(option);
      });
    } catch (error) {
      console.error("Could not load cake size options:", error);

      selectElement.innerHTML = `
      <option value="">Cake size options could not be loaded</option>
    `;
    }
  }

}
