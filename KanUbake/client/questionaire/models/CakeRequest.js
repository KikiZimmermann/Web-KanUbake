/*
  This class represents one complete cake design request.
  It stores all information selected or entered by the user throughout the questionnaire.

  A CakeRequest can be saved as an incomplete draft, completed later,
  reviewed in the summary, downloaded, or sent by email.
*/

export class CakeRequest {
    constructor() {
        this.id = crypto.randomUUID();
        this.displayName = "";
        this.status = "draft_incomplete";

        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();

        this.occasion = "";
        this.cakeType = "";
        this.servingSize = "";
        this.shape = "";
        this.tiers = "";

        this.sizeMode = "";
        this.knownServings = "";
        this.knownSize = "";

        this.recommendedSize = "";
        this.estimatedServings = "";
        this.sizeEstimateMessage = "";
        this.plannedServingsWithBuffer = "";

        this.restrictions = [];
        this.restrictionNotes = "";

        this.tierFlavorMode = "";
        this.tierFlavors = [];

        this.covering = "";
        this.coveringOther = "";

        this.coveringButtercreamType = "";
        this.coveringButtercreamColor = "";
        this.coveringButtercreamFlavor = "";

        this.coveringGanacheChocolateType = "";
        this.coveringGanacheColor = "";

        this.chocolateGlazePreserveChoice = "";
        this.chocolateGlazePreserveFlavor = "";
        this.chocolateGlazeOtherPreserveFlavor = "";

        this.fondantLayer = "";
        this.fondantLayerDetails = [];

        this.fondantButtercreamType = "";
        this.fondantButtercreamColor = "";
        this.fondantButtercreamFlavor = "";

        this.fondantGanacheChocolateType = "";
        this.fondantGanacheColor = "";

        this.fondantMarmaladeFlavor = "";
        this.fondantOtherMarmaladeFlavor = "";

        this.designStyle = "";
        this.themeDescription = "";

        this.colorMode = "";
        this.colorTheme = "";

        this.colors = [];

        this.paletteBaseColor = null;
        this.paletteSchemeMode = "analogic";
        this.paletteColors = [];

        this.decorations = [];
        this.textDetails = null;
        this.numberAgeDetails = null;

        this.referenceMode = "";
        this.referenceItems = [];

        this.budgetMode = "";
        this.budgetRange = "";
        this.customBudget = "";

        this.additionalNotes = "";
    }

    markUpdated() {
        this.updatedAt = new Date().toISOString();
    }

    markIncompleteDraft() {
        this.status = "draft_incomplete";
        this.markUpdated();
    }

    markCompleteDraft() {
        this.status = "draft_complete";
        this.markUpdated();
    }

    markCancelled() {
        this.status = "cancelled";
        this.markUpdated();
    }

    markSent() {
        this.status = "sent";
        this.markUpdated();
    }
}