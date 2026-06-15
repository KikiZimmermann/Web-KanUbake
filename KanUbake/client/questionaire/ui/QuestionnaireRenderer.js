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
import { PricingApiService } from "../services/api/PricingApiService.js";
import { ColorSelector } from "./ColorSelector.js";
import { CakeRequestApiService } from "../services/api/CakeRequestApiService.js";
import { QuestionnaireCompatibilityService } from "../services/QuestionnaireCompatibilityService.js";

export class QuestionnaireRenderer {
  constructor(state) {
    this.state = state;
    this.summaryBuilder = new SummaryBuilder();
    this.cakeSizeApiService = new CakeSizeApiService();
    this.colorSelector = new ColorSelector(this.state);
    this.validationRefreshCallback = null;

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

  setValidationRefreshCallback(callback) {
    this.validationRefreshCallback = callback;
  }

  renderAndRefreshValidation() {
    this.render();

    if (typeof this.validationRefreshCallback === "function") {
      this.validationRefreshCallback();
    }
  }

  //Save Button
  attachSaveButtonEvent() {
    if (!this.saveButton) {
      return;
    }

    this.saveButton.addEventListener("click", async () => {
      const cakeRequest = this.state.getCakeRequest();

      cakeRequest.markIncompleteDraft();

      try {
        const savedRequest =
          await CakeRequestApiService.saveCakeRequest(cakeRequest);

        console.log("Cake request saved:", savedRequest);
      } catch (error) {
        console.error("Cake request could not be saved:", error);
      }
    });
  }

  render() {
    this.renderProgress();
    this.renderChapterIntro();
    this.renderChapterContent();
    this.renderNavigationButtons();

    document.dispatchEvent(new CustomEvent("questionnaireRendered"));
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

    const sizeSelectionDisabled =
      request.shape === "sculpted_3d" ||
      request.shape === "other" ||
      request.shape === "unsure_advise" ||
      request.tiers === "unsure_advise";

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
      request.occasion,
    )}

      ${this.createSelectField(
      "cakeType",
      "What type of cake would you like?",
      questionnaireOptions.cakeTypes,
      request.cakeType,
    )}

      ${this.createSelectField(
      "servingSize",
      "What serving size would you like?",
      questionnaireOptions.servingSizes,
      request.servingSize,
    )}

      ${this.createSelectField(
      "shape",
      "What shape should the cake have?",
      questionnaireOptions.shapes,
      request.shape,
    )}

      ${request.shape !== "sculpted_3d"
        ? this.createSelectField(
          "tiers",
          "How many tiers should the cake have?",
          questionnaireOptions.tiers,
          request.tiers,
        )
        : ""
      }

      ${this.createSelectField(
        "sizeMode",
        "What do you already know about the size?",
        questionnaireOptions.sizeModes,
        request.sizeMode,
        {
          disabledValues: sizeSelectionDisabled ? ["known_size"] : [],
        },
      )}

      ${this.createSizeDetailsField(request)}

      ${this.createSizeEstimateBox(request)}

      ${this.createCheckboxGroup(
        "restrictions",
        "Are there any allergies or dietary requirements?",
        questionnaireOptions.restrictions,
        request.restrictions,
        "If you do not select anything, this will be treated as no restrictions. Multiple selections are possible. Complete absence of traces can only be guaranteed if confirmed by the bakery.",
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
        request.tierFlavorMode,
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

  prepareSculptedCakeDesign(request) {
    if (request.shape !== "sculpted_3d") {
      return;
    }

    request.covering = "fondant";

    request.designStyle = "";
    request.themeDescription = "";

    request.colorMode = "";
    request.colorTheme = "";
    request.colors = [];
    request.paletteBaseColor = null;
    request.paletteColors = [];

    request.decorations = [];
    request.textDetails = null;
    request.numberAgeDetails = null;
    request.candleDetails = null;
    request.cakeTopperDetails = null;
    request.figurineDetails = null;
    request.ediblePrintDescription = "";
    request.otherDecorationDescription = "";

    if (request.fondantLayer === "marmalade") {
      request.fondantLayer = "";
      request.fondantMarmaladeFlavor = "";
      request.fondantOtherMarmaladeFlavor = "";
    }
  }

  renderDesignChapter() {
    const request = this.state.getCakeRequest();

    this.prepareSculptedCakeDesign(request);
    this.prepareFondantLayerDetails();

    if (request.shape === "sculpted_3d") {
      this.chapterContainerElement.innerHTML = `
      <div class="chapter-content">

        <div class="conditional-section">
          <h3>Individual 3D / Sculpted Cake Design</h3>

          <p class="field-hint">
            Sculpted and 3D cakes require an individual consultation.
            The final shape, internal structure, covering and decorations
            depend on the requested design.
          </p>

          <p class="field-hint">
            Fondant is used as the outer covering for this cake type.
            Please choose a stable layer underneath the fondant.
          </p>

          ${this.createFondantLayerField(request)}

          <p class="field-hint">
            Please add reference images and describe the requested design
            in the References chapter.
          </p>
        </div>

      </div>
    `;

      this.attachDesignChapterEvents();
      return;
    }

    this.chapterContainerElement.innerHTML = `
    <div class="chapter-content">

      ${this.createSelectField(
      "covering",
      "What covering or outer frosting would you like?",
      questionnaireOptions.coverings,
      request.covering,
    )}

      ${this.createCoveringDetailsField(request)}

      ${this.createFondantLayerField(request)}

      ${this.createSelectField(
      "designStyle",
      "What design style do you like?",
      questionnaireOptions.designStyles,
      request.designStyle,
    )}

      ${this.createThemeDescriptionField(request)}

      ${this.createSelectField(
      "colorMode",
      "What colors would you like for the cake?",
      questionnaireOptions.colorModes,
      request.colorMode,
    )}

      ${this.createColorDetailsField(request)}

      ${this.createCheckboxGroup(
      "decorations",
      "Which extras or decorations would you like?",
      questionnaireOptions.decorations,
      request.decorations,
      "If you do not select anything, no extras will be added. Multiple selections are possible.",
    )}

      ${this.createCompatibilityWarnings(request)}

      ${this.createTextDetailsField(request)}
      ${this.createNumberAgeDetailsField(request)}
      ${this.createCandleDetailsField(request)}
      ${this.createCakeTopperDetailsField(request)}
      ${this.createFigurineDetailsField(request)}
      ${this.createEdiblePrintDetailsField(request)}
      ${this.createOtherDecorationDetailsField(request)}

    </div>
  `;

    this.attachDesignChapterEvents();

    const colorSelectorContainer = document.getElementById(
      "colorSelectorContainer",
    );

    this.colorSelector.mount(
      colorSelectorContainer,
      request.colorMode,
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
      request.referenceMode || "",
    )}

        ${this.createReferenceDetailsSection(request)}

        ${this.createSelectField(
      "budgetMode",
      "Would you like to enter a budget or see a rough price estimate?",
      questionnaireOptions.budgetModes,
      request.budgetMode,
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
          otherMarmaladeFlavor: "",
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
          tierFlavor.cakeFlavor,
        )}

            ${this.createOtherTextField(
          `otherCakeFlavor-${index}`,
          "Other cake flavor",
          tierFlavor.otherCakeFlavor,
          tierFlavor.cakeFlavor === "other",
        )}

        ${tierFlavor.cakeFlavor === "nut"
            ? this.createSelectField(
              `cakeNutType-${index}`,
              "Which nut would you like for the cake?",
              questionnaireOptions.nutTypes,
              tierFlavor.cakeNutType,
            )
            : ""
          }

${this.createOtherTextField(
            `otherCakeNut-${index}`,
            "Which other nut would you like?",
            tierFlavor.otherCakeNut,
            tierFlavor.cakeNutType === "other",
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
              with the bakery.
            </p>

            ${this.createSelectField(
            `filling-${index}`,
            "What filling would you like?",
            questionnaireOptions.fillings,
            tierFlavor.filling,
          )}

            ${this.createOtherTextField(
            `otherFilling-${index}`,
            "Other filling",
            tierFlavor.otherFilling,
            tierFlavor.filling === "other",
          )}

            ${tierFlavor.filling === "fruit_filling"
            ? this.createSelectField(
              `fruitFilling-${index}`,
              "Which fruit filling would you like?",
              questionnaireOptions.fruitFillings,
              tierFlavor.fruitFilling,
            )
            : ""
          }

            ${this.createOtherTextField(
            `otherFruitFilling-${index}`,
            "Other fruit filling",
            tierFlavor.otherFruitFilling,
            tierFlavor.fruitFilling === "other",
          )}

          ${tierFlavor.filling === "nut_cream"
            ? this.createSelectField(
              `fillingNutType-${index}`,
              "Which nut cream would you like?",
              questionnaireOptions.nutTypes,
              tierFlavor.fillingNutType,
            )
            : ""
          }

${this.createOtherTextField(
            `otherFillingNut-${index}`,
            "Which other nut would you like?",
            tierFlavor.otherFillingNut,
            tierFlavor.fillingNutType === "other",
          )}

          ${tierFlavor.filling === "jam"
            ? this.createSelectField(
              `jamFlavor-${index}`,
              "Which fruit preserve would you like?",
              questionnaireOptions.fruitPreserves,
              tierFlavor.jamFlavor,
            )
            : ""
          }

${this.createOtherTextField(
            `otherJamFlavor-${index}`,
            "Which other fruit preserve would you like?",
            tierFlavor.otherJamFlavor,
            tierFlavor.jamFlavor === "other",
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
      tierFlavor.buttercreamType,
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
      tierFlavor.ganacheChocolateType,
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
        request.coveringButtercreamType,
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
        request.coveringGanacheChocolateType,
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
        request.chocolateGlazePreserveChoice,
      )}

            ${request.chocolateGlazePreserveChoice === "yes"
          ? this.createSelectField(
            "chocolateGlazePreserveFlavor",
            "Which fruit preserve would you like?",
            questionnaireOptions.fruitPreserves,
            request.chocolateGlazePreserveFlavor,
          )
          : ""
        }

            ${this.createOtherTextField(
          "chocolateGlazeOtherPreserveFlavor",
          "Which other fruit preserve would you like?",
          request.chocolateGlazeOtherPreserveFlavor,
          request.chocolateGlazePreserveFlavor === "other",
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
      request.fondantLayer,
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
            layer.layerType,
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
      otherMarmaladeFlavor: request.fondantOtherMarmaladeFlavor,
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
        layer.buttercreamType,
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
        layer.ganacheChocolateType,
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
        layer.marmaladeFlavor,
      )}

        ${this.createOtherTextField(
        `fondantOtherMarmaladeFlavor${suffix}`,
        "Which other fruit preserve would you like?",
        layer.otherMarmaladeFlavor || "",
        layer.marmaladeFlavor === "other",
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
        request.colorTheme || "",
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
      letteringStyle: "",
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
      textDetails.letteringStyle,
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
      displayType: "",
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
      numberAgeDetails.displayType,
    )}
      </div>
    `;
  }

  createCandleDetailsField(request) {
    if (!request.decorations.includes("candles")) {
      return "";
    }

    const candleDetails = request.candleDetails || {
      quantity: "",
      colors: "",
    };

    return `
    <div class="conditional-section">
      <h3>Candle Details</h3>

      <div class="form-field">
        <label for="candleQuantity">
          Number of candles
        </label>

        <input
          type="number"
          id="candleQuantity"
          data-field="candleQuantity"
          min="1"
          value="${candleDetails.quantity}"
          placeholder="For example: 10"
        >
      </div>

      <div class="form-field">
        <label for="candleColors">
          Candle colors <span class="optional-note">(optional)</span>
        </label>

        <input
          type="text"
          id="candleColors"
          data-field="candleColors"
          value="${candleDetails.colors}"
          placeholder="For example: pink, white and gold"
        >
      </div>
    </div>
  `;
  }

  createCakeTopperDetailsField(request) {
    if (!request.decorations.includes("cake_topper")) {
      return "";
    }

    return this.createSizedDecorationDetailsField(
      request.cakeTopperDetails,
      "cakeTopper",
      "Cake Topper Details",
      "topper",
      "For example: wooden Happy Birthday topper, gold acrylic name topper",
    );
  }

  createFigurineDetailsField(request) {
    if (!request.decorations.includes("figurines")) {
      return "";
    }

    return this.createSizedDecorationDetailsField(
      request.figurineDetails,
      "figurine",
      "Figurines / Modelling Details",
      "figurine",
      "For example: simple fondant dog, person based on a photo, small teddy bear",
    );
  }

  createEdiblePrintDetailsField(request) {
    if (!request.decorations.includes("edible_print")) {
      return "";
    }

    return `
    <div class="conditional-section">
      <h3>Edible Print / Image Details</h3>

      <div class="form-field">
        <label for="ediblePrintDescription">
          Please describe the image or print you would like
        </label>

        <textarea
          id="ediblePrintDescription"
          data-field="ediblePrintDescription"
          rows="4"
          placeholder="For example: a graduation photo in the center with the text Congratulations Anna underneath."
        >${request.ediblePrintDescription}</textarea>
      </div>

      <p class="field-hint">
        You can also add the actual image or a reference link in the References chapter.
      </p>
    </div>
  `;
  }

  createOtherDecorationDetailsField(request) {
    if (!request.decorations.includes("other")) {
      return "";
    }

    return `
    <div class="conditional-section">
      <h3>Other Decoration Details</h3>

      <div class="form-field">
        <label for="otherDecorationDescription">
          Please describe the decoration you would like
        </label>

        <textarea
          id="otherDecorationDescription"
          data-field="otherDecorationDescription"
          rows="4"
          placeholder="Please describe the decoration, material, placement and any important details."
        >${request.otherDecorationDescription}</textarea>
      </div>

      <p class="field-hint">
        Please discuss feasibility and final pricing with the bakery.
      </p>
    </div>
  `;
  }

  createSizedDecorationDetailsField(
    details,
    fieldPrefix,
    heading,
    itemLabel,
    descriptionPlaceholder,
  ) {
    const currentDetails = details || {
      description: "",
      quantity: "",
      items: [],
    };

    const quantityOptions = [
      { value: "1", label: "1" },
      { value: "2", label: "2" },
      { value: "3", label: "3" },
      { value: "4_plus", label: "4 Or More – Please Discuss With The Bakery" },
    ];

    return `
    <div class="conditional-section">
      <h3>${heading}</h3>

      ${this.createSelectField(
      `${fieldPrefix}Quantity`,
      `How many ${itemLabel}s would you like?`,
      quantityOptions,
      currentDetails.quantity,
    )}

      ${currentDetails.quantity === "4_plus"
        ? `
      <div class="form-field">
        <label for="${fieldPrefix}GeneralDescription">
          Please describe the ${itemLabel}s you would like
        </label>

        <textarea
          id="${fieldPrefix}GeneralDescription"
          data-field="${fieldPrefix}GeneralDescription"
          rows="3"
          placeholder="${descriptionPlaceholder}"
        >${currentDetails.description || ""}</textarea>
      </div>

          <p class="field-hint">
            Four or more ${itemLabel}s must be discussed directly with the bakery.
            The price cannot be calculated automatically.
          </p>
        `
        : this.createSizedDecorationItems(
          currentDetails,
          fieldPrefix,
          itemLabel,
        )
      }
    </div>
  `;
  }

  createSizedDecorationItems(details, fieldPrefix, itemLabel) {
    const quantity = Number(details.quantity);

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 3) {
      return "";
    }

    const sizeOptions = [
      { value: "small", label: "Small" },
      { value: "medium", label: "Medium" },
      { value: "large", label: "Large" },
    ];

    return Array.from({ length: quantity }, (_, index) => {
      const item = details.items?.[index] || {
        description: "",
        size: "",
      };

      return `
      <section class="tier-flavor-card">
        <h4>${itemLabel.charAt(0).toUpperCase() + itemLabel.slice(1)} ${index + 1}</h4>

        <div class="form-field">
          <label for="${fieldPrefix}Description-${index}">
            Description
          </label>

          <input
            type="text"
            id="${fieldPrefix}Description-${index}"
            data-field="${fieldPrefix}Description-${index}"
            value="${item.description || ""}"
            placeholder="Please describe this ${itemLabel}."
          >
        </div>

        ${this.createSelectField(
        `${fieldPrefix}Size-${index}`,
        "Size",
        sizeOptions,
        item.size,
      )}
      </section>
    `;
    }).join("");
  }

  createReferenceDetailsSection(request) {
    if (request.referenceMode !== "add_references") {
      return "";
    }

    return `
      <div class="conditional-section">
        <h3>References</h3>

        <p class="field-hint">
          Add at least one image or link. You may add images, links or both.
          References are used as inspiration and an exact copy cannot be guaranteed.
        </p>

        ${this.createReferenceInputArea()}

        <div id="referenceList" class="reference-list">
          ${this.createReferenceList(request)}
        </div>
      </div>
    `;
  }

  createReferenceInputArea() {
    return `
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

    <div class="form-field">
      <label for="referenceUrl">
        Add reference link
      </label>

      <input
        type="url"
        id="referenceUrl"
        data-field="referenceUrl"
        placeholder="https://example.com/cake-inspiration"
      >

      <p id="referenceUrlError" class="field-error-message"></p>
    </div>

    <button id="addLinkReferenceButton" type="button">
      Add link reference
    </button>
  `;
  }

  createReferenceList(request) {
    if (!Array.isArray(request.referenceItems) || request.referenceItems.length === 0) {
      return `
      <p class="field-hint">
        No reference items added yet.
      </p>
    `;
    }

    return request.referenceItems.map((referenceItem, index) => {
      return `
      <section class="reference-card">
        <h4>Reference ${index + 1}</h4>

        <div class="reference-card-content">
          <div class="reference-visual">
            ${referenceItem.type === "image"
          ? `
                <img
                  class="reference-preview"
                  src="${referenceItem.filePreviewUrl}"
                  alt="Uploaded reference image"
                >
              `
          : `
                <div class="reference-link-box">
                  <strong>Link:</strong>
                  <a
                    href="${referenceItem.url}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="reference-link"
                  >
                    ${referenceItem.url}
                  </a>
                </div>
              `
        }
          </div>

          <div class="reference-details">
            <div class="form-field">
              <label for="referenceLikes-${index}">
                What do you like about this reference?
              </label>

              <textarea
                id="referenceLikes-${index}"
                data-field="referenceLikes-${index}"
                rows="3"
                placeholder="For example: the colors, floral arrangement or overall style."
              >${referenceItem.likes || ""}</textarea>
            </div>

            <div class="form-field">
              <label for="referenceDislikes-${index}">
                What do you dislike or want changed?
              </label>

              <textarea
                id="referenceDislikes-${index}"
                data-field="referenceDislikes-${index}"
                rows="3"
                placeholder="For example: not the gold details, fewer flowers or a lighter color."
              >${referenceItem.dislikes || ""}</textarea>
            </div>

            ${this.createCheckboxGroup(
          `referenceTags-${index}`,
          "Which parts of this reference are relevant?",
          questionnaireOptions.referenceTags,
          Array.isArray(referenceItem.tags) ? referenceItem.tags : []
        )}

            <button
              class="remove-reference-button"
              type="button"
              data-reference-index="${index}"
            >
              Remove reference
            </button>
          </div>
        </div>
      </section>
    `;
    }).join("");
  }

  createBudgetDetailsField(request) {
    const automaticEstimateUnavailable =
      request.shape === "sculpted_3d" || request.shape === "other";

    if (request.budgetMode === "show_estimate" && automaticEstimateUnavailable) {
      return `
            <div class="conditional-section">
                <p class="field-hint">
                    An automatic price estimate is not reliable for 3D, sculpted or custom-shaped cakes.
                    The price depends strongly on the requested shape, internal structure, materials,
                    dimensions and level of detail. Please provide your design and reference information
                    so the bakery can prepare an individual estimate.
                </p>
            </div>
        `;
    }

    if (request.budgetMode !== "enter_budget") {
      return "";
    }

    const budgetRangeField = this.createSelectField(
      "budgetRange",
      "Do you have an approximate budget?",
      questionnaireOptions.budgetRanges,
      request.budgetRange,
    );

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
        </div>
    `;
  }

  getCompatibilityFieldName(fieldName) {
    const fieldMappings = [
      {
        pattern: /^cakeFlavor-\d+$/,
        compatibilityField: "cakeFlavor"
      },
      {
        pattern: /^filling-\d+$/,
        compatibilityField: "filling"
      },
      {
        pattern: /^cakeNutType-\d+$/,
        compatibilityField: "cakeNutType"
      },
      {
        pattern: /^fillingNutType-\d+$/,
        compatibilityField: "fillingNutType"
      },
      {
        pattern: /^buttercreamType-\d+$/,
        compatibilityField: "buttercreamType"
      },
      {
        pattern: /^fondantLayer-\d+$/,
        compatibilityField: "fondantLayer"
      },
      {
        pattern: /^fondantButtercreamType-\d+$/,
        compatibilityField: "fondantButtercreamType"
      }
    ];

    const mapping = fieldMappings.find((entry) =>
      entry.pattern.test(fieldName)
    );

    return mapping
      ? mapping.compatibilityField
      : fieldName;
  }

  getCompatibilityContext(fieldName) {
    const tierSpecificFields = [
      "cakeFlavor",
      "filling",
      "cakeNutType",
      "fillingNutType",
      "buttercreamType",
      "ganacheChocolateType",
      "fondantLayer",
      "fondantButtercreamType",
      "fondantGanacheChocolateType",
      "fondantMarmaladeFlavor"
    ];

    const match = fieldName.match(/-(\d+)$/);

    if (!match) {
      return {};
    }

    const baseFieldName = fieldName.replace(/-\d+$/, "");

    if (!tierSpecificFields.includes(baseFieldName)) {
      return {};
    }

    return {
      tierIndex: Number(match[1])
    };
  }

  getOptionCompatibilityState(fieldName, optionValue) {
    const request = this.state.getCakeRequest();

    const compatibilityField =
      this.getCompatibilityFieldName(fieldName);

    const context =
      this.getCompatibilityContext(fieldName);

    return QuestionnaireCompatibilityService.getOptionState(
      request,
      compatibilityField,
      optionValue,
      context
    );
  }

  escapeHtmlAttribute(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  createCompatibilityWarnings(request) {
    const warnings =
      QuestionnaireCompatibilityService.getRequestWarnings(request);

    if (warnings.length === 0) {
      return "";
    }

    return `
    <div class="compatibility-warning-list">
      ${warnings
        .map(
          (warning) => `
            <p class="compatibility-warning">
              ${warning.message}
            </p>
          `
        )
        .join("")}
    </div>
  `;
  }

  createSelectField(
    fieldName,
    labelText,
    options,
    selectedValue,
    {
      disabled = false,
      disabledValues = [],
      useCompatibility = true
    } = {}
  ) {
    let selectedCompatibilityState = null;

    const optionHtml = options
      .map((option) => {
        const selected =
          option.value === selectedValue
            ? "selected"
            : "";

        const manuallyDisabled =
          disabledValues.includes(option.value);

        const compatibilityState = useCompatibility
          ? this.getOptionCompatibilityState(
            fieldName,
            option.value
          )
          : {
            disabled: false,
            warning: false,
            message: ""
          };

        const optionIsDisabled =
          manuallyDisabled ||
          compatibilityState.disabled;

        if (
          option.value === selectedValue &&
          (
            compatibilityState.disabled ||
            compatibilityState.warning
          )
        ) {
          selectedCompatibilityState =
            compatibilityState;
        }

        const disabledAttribute =
          optionIsDisabled
            ? "disabled"
            : "";

        let optionLabel = option.label;

        if (compatibilityState.disabled) {
          optionLabel += " — Unavailable";
        } else if (compatibilityState.warning) {
          optionLabel += " ⚠";
        }

        return `
        <option
          value="${option.value}"
          ${selected}
          ${disabledAttribute}
          data-compatibility-disabled="${compatibilityState.disabled}"
          data-compatibility-warning="${compatibilityState.warning}"
          data-compatibility-message="${this.escapeHtmlAttribute(
          compatibilityState.message
        )}"
        >
          ${optionLabel}
        </option>
      `;
      })
      .join("");

    const selectedMessage =
      selectedCompatibilityState?.message
        ? `
        <p
          class="${selectedCompatibilityState.disabled
          ? "compatibility-conflict"
          : "compatibility-warning"
        }"
        >
          ${selectedCompatibilityState.message}
        </p>
      `
        : "";

    return `
    <div class="form-field">
      <label for="${fieldName}">
        ${labelText}
      </label>

      <select
        id="${fieldName}"
        data-field="${fieldName}"
        ${disabled ? "disabled" : ""}
      >
        <option value="">
          Please choose...
        </option>

        ${optionHtml}
      </select>

      ${selectedMessage}
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

  createCheckboxGroup(
    fieldName,
    labelText,
    options,
    selectedValues,
    hintText = "",
    {
      useCompatibility = true
    } = {}
  ) {
    const safeSelectedValues =
      Array.isArray(selectedValues)
        ? selectedValues
        : [];

    return `
    <div class="form-field checkbox-field">
      <p class="field-label">
        ${labelText}
      </p>

      <div
        class="checkbox-group"
        data-field="${fieldName}"
      >
        ${options
        .map((option) => {
          const checked =
            safeSelectedValues.includes(option.value);

          const compatibilityState =
            useCompatibility
              ? this.getOptionCompatibilityState(
                fieldName,
                option.value
              )
              : {
                disabled: false,
                warning: false,
                message: ""
              };

          const shouldDisable =
            compatibilityState.disabled &&
            !checked;

          const checkedAttribute =
            checked
              ? "checked"
              : "";

          const disabledAttribute =
            shouldDisable
              ? "disabled"
              : "";

          const compatibilityClass =
            compatibilityState.disabled
              ? "checkbox-option--disabled"
              : compatibilityState.warning
                ? "checkbox-option--warning"
                : "";

          const selectedConflictClass =
            checked && compatibilityState.disabled
              ? "checkbox-option--selected-conflict"
              : "";

          const messageHtml =
            compatibilityState.message
              ? `
                  <span class="compatibility-tooltip">
                    ${compatibilityState.message}
                  </span>
                `
              : "";

          return `
              <label
                class="
                  checkbox-option
                  ${compatibilityClass}
                  ${selectedConflictClass}
                "
              >
                <input
                  type="checkbox"
                  name="${fieldName}"
                  value="${option.value}"
                  ${checkedAttribute}
                  ${disabledAttribute}
                  data-compatibility-disabled="${compatibilityState.disabled}"
                  data-compatibility-warning="${compatibilityState.warning}"
                >

                <span class="checkbox-option-label">
                  ${option.label}
                </span>

                ${compatibilityState.warning
              ? `
                      <span
                        class="compatibility-warning-icon"
                        aria-hidden="true"
                      >
                        ⚠
                      </span>
                    `
              : ""
            }

                ${messageHtml}
              </label>
            `;
        })
        .join("")}
      </div>

      ${hintText
        ? `
            <p class="field-hint">
              ${hintText}
            </p>
          `
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
    const displayNameInput = document.getElementById("displayName");

    if (displayNameInput) {
      displayNameInput.addEventListener("input", (event) => {
        this.state.updateField("displayName", event.target.value);
      });
    }

    this.attachSelectChangeEvent("occasion");
    this.attachSelectChangeEvent("cakeType", true);

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
          plannedServingsWithBuffer: "",
          sizeAdvice: "",
          sizeAdviceLevel: "",
          consultationRequired: false,
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
      this.state.updateField(
        "restrictions",
        selectedValues
      );

      this.render();
    });
  }

  attachFlavorChapterEvents() {
    this.attachSelectChangeEvent("tierFlavorMode", true);

    const request = this.state.getCakeRequest();

    request.tierFlavors.forEach((tierFlavor, index) => {
      const cakeFlavorSelect = document.getElementById(`cakeFlavor-${index}`);
      const fillingSelect = document.getElementById(`filling-${index}`);
      const fruitFillingSelect = document.getElementById(
        `fruitFilling-${index}`,
      );

      const otherCakeFlavorInput = document.getElementById(
        `otherCakeFlavor-${index}`,
      );
      const otherFillingInput = document.getElementById(
        `otherFilling-${index}`,
      );
      const otherFruitFillingInput = document.getElementById(
        `otherFruitFilling-${index}`,
      );

      const cakeColorInput = document.getElementById(`cakeColor-${index}`);
      const buttercreamTypeSelect = document.getElementById(
        `buttercreamType-${index}`,
      );
      const buttercreamColorInput = document.getElementById(
        `buttercreamColor-${index}`,
      );
      const buttercreamFlavorInput = document.getElementById(
        `buttercreamFlavor-${index}`,
      );
      const ganacheChocolateTypeSelect = document.getElementById(
        `ganacheChocolateType-${index}`,
      );
      const ganacheColorInput = document.getElementById(
        `ganacheColor-${index}`,
      );

      const cakeNutTypeSelect = document.getElementById(`cakeNutType-${index}`);
      const otherCakeNutInput = document.getElementById(
        `otherCakeNut-${index}`,
      );

      const fillingNutTypeSelect = document.getElementById(
        `fillingNutType-${index}`,
      );
      const otherFillingNutInput = document.getElementById(
        `otherFillingNut-${index}`,
      );

      const jamFlavorSelect = document.getElementById(`jamFlavor-${index}`);
      const otherJamFlavorInput = document.getElementById(
        `otherJamFlavor-${index}`,
      );

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
      "fondantOtherMarmaladeFlavor",
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
      "colorTheme",
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
            this.state.updateField("fondantOtherMarmaladeFlavor", "");
          }
          this.render();
        }
      });
    });

    // Chocolate Glaze: Jam yes or no?
    const chocolateGlazePreserveChoice = document.getElementById(
      "chocolateGlazePreserveChoice",
    );

    if (chocolateGlazePreserveChoice) {
      chocolateGlazePreserveChoice.addEventListener("change", (event) => {
        const value = event.target.value;

        this.state.updateMultipleFields({
          chocolateGlazePreserveChoice: value,
          chocolateGlazePreserveFlavor:
            value === "yes" ? request.chocolateGlazePreserveFlavor : "",
          chocolateGlazeOtherPreserveFlavor:
            value === "yes" ? request.chocolateGlazeOtherPreserveFlavor : "",
        });

        this.render();
      });
    }

    // Chocolate Glaze: Which Jam?
    const chocolateGlazePreserveFlavor = document.getElementById(
      "chocolateGlazePreserveFlavor",
    );

    if (chocolateGlazePreserveFlavor) {
      chocolateGlazePreserveFlavor.addEventListener("change", (event) => {
        this.state.updateField(
          "chocolateGlazePreserveFlavor",
          event.target.value,
        );

        if (event.target.value !== "other") {
          this.state.updateField("chocolateGlazeOtherPreserveFlavor", "");
        }

        this.render();
      });
    }

    // Chocolate Glaze: Other Fruit
    const chocolateGlazeOtherPreserveFlavor = document.getElementById(
      "chocolateGlazeOtherPreserveFlavor",
    );

    if (chocolateGlazeOtherPreserveFlavor) {
      chocolateGlazeOtherPreserveFlavor.addEventListener("input", (event) => {
        this.state.updateField(
          "chocolateGlazeOtherPreserveFlavor",
          event.target.value,
        );
      });
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

      if (!selectedValues.includes("candles")) {
        request.candleDetails = null;
      }

      if (!selectedValues.includes("cake_topper")) {
        request.cakeTopperDetails = null;
      }

      if (!selectedValues.includes("figurines")) {
        request.figurineDetails = null;
      }

      if (!selectedValues.includes("edible_print")) {
        request.ediblePrintDescription = "";
      }

      if (!selectedValues.includes("other")) {
        request.otherDecorationDescription = "";
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

    const candleQuantity = document.getElementById("candleQuantity");

    if (candleQuantity) {
      candleQuantity.addEventListener("input", (event) => {
        this.updateCandleDetails("quantity", event.target.value);
      });
    }

    const candleColors = document.getElementById("candleColors");

    if (candleColors) {
      candleColors.addEventListener("input", (event) => {
        this.updateCandleDetails("colors", event.target.value);
      });
    }

    const cakeTopperGeneralDescription = document.getElementById(
      "cakeTopperGeneralDescription",
    );

    if (cakeTopperGeneralDescription) {
      cakeTopperGeneralDescription.addEventListener("input", (event) => {
        this.updateSizedDecorationDescription(
          "cakeTopperDetails",
          event.target.value,
        );
      });
    }

    const cakeTopperQuantity = document.getElementById("cakeTopperQuantity");

    if (cakeTopperQuantity) {
      cakeTopperQuantity.addEventListener("change", (event) => {
        this.updateSizedDecorationQuantity(
          "cakeTopperDetails",
          event.target.value,
        );
      });
    }

    const figurineGeneralDescription = document.getElementById(
      "figurineGeneralDescription",
    );

    if (figurineGeneralDescription) {
      figurineGeneralDescription.addEventListener("input", (event) => {
        this.updateSizedDecorationDescription(
          "figurineDetails",
          event.target.value,
        );
      });
    }

    const figurineQuantity = document.getElementById("figurineQuantity");

    if (figurineQuantity) {
      figurineQuantity.addEventListener("change", (event) => {
        this.updateSizedDecorationQuantity(
          "figurineDetails",
          event.target.value,
        );
      });
    }

    const ediblePrintDescription = document.getElementById(
      "ediblePrintDescription",
    );

    if (ediblePrintDescription) {
      ediblePrintDescription.addEventListener("input", (event) => {
        this.state.updateField("ediblePrintDescription", event.target.value);
      });
    }

    const otherDecorationDescription = document.getElementById(
      "otherDecorationDescription",
    );

    if (otherDecorationDescription) {
      otherDecorationDescription.addEventListener("input", (event) => {
        this.state.updateField(
          "otherDecorationDescription",
          event.target.value,
        );
      });
    }

    this.attachSizedDecorationItemEvents("cakeTopper", "cakeTopperDetails");

    this.attachSizedDecorationItemEvents("figurine", "figurineDetails");
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
      [`fondantOtherMarmaladeFlavor-${index}`]: "otherMarmaladeFlavor",
    };

    Object.entries(fieldMap).forEach(([elementId, propertyName]) => {
      const element = document.getElementById(elementId);

      if (!element) {
        return;
      }

      const eventType =
        element.tagName.toLowerCase() === "select" ? "change" : "input";

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
    const request = this.state.getCakeRequest();

    const referenceModeSelect = document.getElementById("referenceMode");

    if (referenceModeSelect) {
      referenceModeSelect.addEventListener("change", (event) => {
        const referenceMode = event.target.value;

        this.state.updateField("referenceMode", referenceMode);

        if (referenceMode === "no") {
          request.referenceItems = [];
          request.markUpdated();
        }

        this.render();
      });
    }

    const budgetModeSelect = document.getElementById("budgetMode");

    if (budgetModeSelect) {
      budgetModeSelect.addEventListener("change", (event) => {
        const budgetMode = event.target.value;

        this.state.updateMultipleFields({
          budgetMode,
          budgetRange: budgetMode === "enter_budget" ? request.budgetRange : "",
          customBudget:
            budgetMode === "enter_budget" ? request.customBudget : "",
        });

        this.render();
      });
    }

    const budgetRangeSelect = document.getElementById("budgetRange");

    if (budgetRangeSelect) {
      budgetRangeSelect.addEventListener("change", (event) => {
        const budgetRange = event.target.value;

        this.state.updateMultipleFields({
          budgetRange,
          customBudget:
            budgetRange === "custom_budget" ? request.customBudget : "",
        });

        this.render();
      });
    }

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
        if (
          !referenceImageInput.files ||
          referenceImageInput.files.length === 0
        ) {
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

    const addLinkReferenceButton = document.getElementById(
      "addLinkReferenceButton",
    );

    if (addLinkReferenceButton) {
      addLinkReferenceButton.addEventListener("click", () => {
        const urlInput = document.getElementById("referenceUrl");
        const errorElement = document.getElementById("referenceUrlError");
        const url = urlInput?.value.trim() || "";

        if (!this.isValidReferenceUrl(url)) {
          if (errorElement) {
            errorElement.textContent =
              "Please enter a valid link beginning with http:// or https://.";
          }

          urlInput?.classList.add("field-error");
          return;
        }

        if (errorElement) {
          errorElement.textContent = "";
        }

        urlInput.classList.remove("field-error");

        const referenceItem = new ReferenceItem("link");
        referenceItem.setUrl(url);

        request.referenceItems.push(referenceItem);
        request.markUpdated();
        this.render();
      });
    }

    request.referenceItems.forEach((referenceItem, index) => {
      const likesInput = document.getElementById(`referenceLikes-${index}`);

      if (likesInput) {
        likesInput.addEventListener("input", (event) => {
          referenceItem.likes = event.target.value;
          request.markUpdated();
        });
      }

      const dislikesInput = document.getElementById(
        `referenceDislikes-${index}`,
      );

      if (dislikesInput) {
        dislikesInput.addEventListener("input", (event) => {
          referenceItem.dislikes = event.target.value;
          request.markUpdated();
        });
      }

      this.attachCheckboxGroupChange(
        `referenceTags-${index}`,
        (selectedValues) => {
          referenceItem.tags = selectedValues;
          request.markUpdated();
        },
      );
    });

    const removeReferenceButtons = document.querySelectorAll(
      ".remove-reference-button",
    );

    removeReferenceButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const referenceIndex = Number(button.dataset.referenceIndex);
        const referenceItem = request.referenceItems[referenceIndex];

        if (referenceItem?.type === "image" && referenceItem.filePreviewUrl) {
          URL.revokeObjectURL(referenceItem.filePreviewUrl);
        }

        request.referenceItems.splice(referenceIndex, 1);
        request.markUpdated();
        this.render();
      });
    });
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
        letteringStyle: "",
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
        displayType: "",
      };
    }

    request.numberAgeDetails[fieldName] = value;
    request.markUpdated();
  }

  updateCandleDetails(fieldName, value) {
    const request = this.state.getCakeRequest();

    if (!request.candleDetails) {
      request.candleDetails = {
        quantity: "",
        colors: "",
      };
    }

    request.candleDetails[fieldName] = value;
    request.markUpdated();
  }

  updateSizedDecorationDescription(detailsField, value) {
    const request = this.state.getCakeRequest();

    if (!request[detailsField]) {
      request[detailsField] = {
        description: "",
        quantity: "",
        items: [],
      };
    }

    request[detailsField].description = value;
    request.markUpdated();
  }

  updateSizedDecorationQuantity(detailsField, value) {
    const request = this.state.getCakeRequest();

    if (!request[detailsField]) {
      request[detailsField] = {
        description: "",
        quantity: "",
        items: [],
      };
    }

    request[detailsField].quantity = value;

    if (value === "4_plus") {
      request[detailsField].items = [];
    } else {
      request[detailsField].description = "";

      const quantity = Number(value);
      const existingItems = request[detailsField].items || [];

      request[detailsField].items = Array.from(
        { length: Number.isInteger(quantity) ? quantity : 0 },
        (_, index) =>
          existingItems[index] || {
            description: "",
            size: "",
          },
      );
    }

    request.markUpdated();
    this.render();
  }

  attachSizedDecorationItemEvents(fieldPrefix, detailsField) {
    const request = this.state.getCakeRequest();
    const details = request[detailsField];

    if (!details || !Array.isArray(details.items)) {
      return;
    }

    details.items.forEach((item, index) => {
      const descriptionInput = document.getElementById(
        `${fieldPrefix}Description-${index}`,
      );

      if (descriptionInput) {
        descriptionInput.addEventListener("input", (event) => {
          item.description = event.target.value;
          request.markUpdated();
        });
      }

      const sizeSelect = document.getElementById(`${fieldPrefix}Size-${index}`);

      if (sizeSelect) {
        sizeSelect.addEventListener("change", (event) => {
          item.size = event.target.value;
          request.markUpdated();
        });
      }
    });
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

  async renderSummary() {
    const cakeRequest = this.state.getCakeRequest();

    const initialSummarySections =
      this.summaryBuilder.buildSummary(cakeRequest);

    this.summaryRenderer.render(initialSummarySections);
    this.summaryRenderer.renderAnalysisLoading();

    try {
      const [allergenAnalysis, nutrientsResult] =
        await Promise.all([
          QuestionnaireCompatibilityService.analyzeAllergens(
            cakeRequest
          ),
          CakeRequestApiService.analyzeCakeRequest(
            cakeRequest
          ),
        ]);

      const updatedSummarySections =
        this.summaryBuilder.buildSummary(
          cakeRequest,
          allergenAnalysis
        );

      /*
        render() replaces the complete summary.
        Therefore, the analysis section is recreated afterwards.
      */
      this.summaryRenderer.render(updatedSummarySections);
      this.summaryRenderer.renderAnalysisLoading();

      this.summaryRenderer.renderAnalysisResults(
        allergenAnalysis.allergens,
        nutrientsResult.analysis
      );
    } catch (error) {
      console.error(
        "Cake analysis failed:",
        error
      );

      this.summaryRenderer.renderAnalysisError();
    }

    const priceEstimateRequested =
      cakeRequest.budgetMode === "show_estimate";

    if (!priceEstimateRequested) {
      return;
    }

    const automaticPricingUnavailable =
      cakeRequest.shape === "sculpted_3d" ||
      cakeRequest.shape === "other";

    if (automaticPricingUnavailable) {
      this.summaryRenderer.renderPricingUnavailable();
      return;
    }

    this.summaryRenderer.renderPricingLoading();

    try {
      const pricingResult =
        await PricingApiService.estimatePrice(cakeRequest);

      this.summaryRenderer.renderPricingResult(
        pricingResult
      );
    } catch (error) {
      console.error(
        "Pricing estimate failed:",
        error
      );

      this.summaryRenderer.renderPricingError();
    }
  }

  renderNavigationButtons() {
    this.backButton.disabled = this.state.isFirstChapter();

    if (this.state.isLastChapter()) {
      this.nextButton.hidden = true;
    } else {
      this.nextButton.hidden = false;
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
      const request = this.state.getCakeRequest();
      const newValue = event.target.value;

      this.state.updateField(fieldName, newValue);

      if (shouldClearKnownSize) {
        this.state.updateField("knownSize", "");
      }

      /*
        A 3D / sculpted cake does not use a normal tier selection.
      */
      if (fieldName === "shape" && newValue === "sculpted_3d") {
        this.state.updateField("tiers", "");
      }

      const sizeSelectionDisabled =
        request.shape === "sculpted_3d" ||
        request.shape === "other" ||
        request.shape === "unsure_advise" ||
        request.tiers === "unsure_advise";

      /*
        If "I know the cake size" was selected before the user
        changed to a consultation-only combination, remove it.
      */
      if (sizeSelectionDisabled && request.sizeMode === "known_size") {
        this.state.updateMultipleFields({
          sizeMode: "",
          knownSize: "",
          recommendedSize: "",
          estimatedServings: "",
          sizeEstimateMessage: "",
          plannedServingsWithBuffer: "",
          sizeAdvice: "",
          sizeAdviceLevel: "",
          consultationRequired: false,
        });
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

    request.sizeAdvice = "";
    request.sizeAdviceLevel = "";
    request.consultationRequired = false;

    const shape = request.shape;
    const servingSize = request.servingSize;
    const tiers = request.tiers;

    if (shape === "sculpted_3d") {
      request.sizeEstimateMessage =
        "The bakery will determine a suitable size and structure based on the design and requested servings.";
      request.consultationRequired = true;
      request.markUpdated();
      this.render();
      return;
    }

    if (!shape || !servingSize || !request.sizeMode || !tiers) {
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
          tiers,
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
          tiers: tiers,
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
      request.plannedServingsWithBuffer =
        result.plannedServingsWithBuffer || "";

      request.sizeAdvice = result.sizeAdvice || "";
      request.sizeAdviceLevel = result.sizeAdviceLevel || "";
      request.consultationRequired = result.consultationRequired === true;

      request.markUpdated();
      this.render();
    } catch (error) {
      console.error("Cake size estimate failed:", error);

      request.recommendedSize = "";
      request.estimatedServings = "";
      request.sizeEstimateMessage =
        "The automatic cake size estimate is currently unavailable.";
      request.plannedServingsWithBuffer = "";

      request.sizeAdvice = "";
      request.sizeAdviceLevel = "";
      request.consultationRequired = false;

      request.markUpdated();
      this.render();
    }
  }

  createSizeEstimateBox(request) {
    if (!request.sizeMode) {
      return "";
    }

    if (request.shape === "sculpted_3d") {
      return `
      <div class="conditional-section">
        <h4>3D / Sculpted Cake Size</h4>

        <p class="field-hint">
          A 3D or sculpted cake does not use standard cake-size or tier calculations.
          The required dimensions and internal structure depend on the chosen design,
          shape, level of detail and number of servings.
        </p>

        ${request.knownServings
          ? `
            <p>
              <strong>Requested servings:</strong> ${request.knownServings}
            </p>
          `
          : ""
        }

        <p class="field-hint">
          The bakery will use the requested servings and design details to recommend
          a suitable size and construction.
        </p>
      </div>
    `;
    }

    const adviceClass = request.sizeAdviceLevel
      ? `size-advice size-advice--${request.sizeAdviceLevel}`
      : "";

    return `
    <div class="conditional-section">
      <h4>Cake Size Estimate</h4>

      ${!request.recommendedSize &&
        !request.estimatedServings &&
        !request.sizeEstimateMessage
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
            <p 
              class="field-hint"> ${request.sizeEstimateMessage}
            </p>
          `
        : ""
      }

      ${request.sizeAdvice
        ? `
              <p 
                class="${adviceClass}"> ${request.sizeAdvice}
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
        tiers: request.tiers,
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
