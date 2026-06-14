/*
  Cake Request Mapper

  Converts a CakeRequest object into the payload expected by the backend.

  The mapper does not save data and does not send HTTP requests.
  It only prepares the data structure.
*/

export class CakeRequestMapper {
  static toApiPayload(cakeRequest) {
    if (!cakeRequest) {
      throw new TypeError(
        "CakeRequestMapper requires a valid CakeRequest object.",
      );
    }

    return {
      id: cakeRequest.id,
      displayName: cakeRequest.displayName,
      status: cakeRequest.status,

      occasion: cakeRequest.occasion,
      cakeType: cakeRequest.cakeType,

      requestData: {
        occasion: cakeRequest.occasion,
        cakeType: cakeRequest.cakeType,
        servingSize: cakeRequest.servingSize,
        shape: cakeRequest.shape,
        tiers: cakeRequest.tiers,

        sizeMode: cakeRequest.sizeMode,
        knownServings: cakeRequest.knownServings,
        knownSize: cakeRequest.knownSize,

        recommendedSize: cakeRequest.recommendedSize,
        estimatedServings: cakeRequest.estimatedServings,
        sizeEstimateMessage: cakeRequest.sizeEstimateMessage,
        plannedServingsWithBuffer: cakeRequest.plannedServingsWithBuffer,

        sizeAdvice: cakeRequest.sizeAdvice,
        sizeAdviceLevel: cakeRequest.sizeAdviceLevel,
        consultationRequired: cakeRequest.consultationRequired,

        restrictions: [...cakeRequest.restrictions],
        restrictionNotes: cakeRequest.restrictionNotes,

        tierFlavorMode: cakeRequest.tierFlavorMode,
        tierFlavors: cakeRequest.tierFlavors.map((tierFlavor) => ({
          ...tierFlavor,
        })),

        covering: cakeRequest.covering,
        coveringOther: cakeRequest.coveringOther,

        coveringButtercreamType: cakeRequest.coveringButtercreamType,
        coveringButtercreamColor: cakeRequest.coveringButtercreamColor,
        coveringButtercreamFlavor: cakeRequest.coveringButtercreamFlavor,

        coveringGanacheChocolateType: cakeRequest.coveringGanacheChocolateType,
        coveringGanacheColor: cakeRequest.coveringGanacheColor,

        chocolateGlazePreserveChoice: cakeRequest.chocolateGlazePreserveChoice,
        chocolateGlazePreserveFlavor: cakeRequest.chocolateGlazePreserveFlavor,
        chocolateGlazeOtherPreserveFlavor:
          cakeRequest.chocolateGlazeOtherPreserveFlavor,

        fondantLayer: cakeRequest.fondantLayer,
        fondantLayerDetails: cakeRequest.fondantLayerDetails.map((detail) => ({
          ...detail,
        })),

        fondantButtercreamType: cakeRequest.fondantButtercreamType,
        fondantButtercreamColor: cakeRequest.fondantButtercreamColor,
        fondantButtercreamFlavor: cakeRequest.fondantButtercreamFlavor,

        fondantGanacheChocolateType: cakeRequest.fondantGanacheChocolateType,
        fondantGanacheColor: cakeRequest.fondantGanacheColor,

        fondantMarmaladeFlavor: cakeRequest.fondantMarmaladeFlavor,
        fondantOtherMarmaladeFlavor: cakeRequest.fondantOtherMarmaladeFlavor,

        designStyle: cakeRequest.designStyle,
        themeDescription: cakeRequest.themeDescription,

        colorMode: cakeRequest.colorMode,
        colorTheme: cakeRequest.colorTheme,

        colors: cakeRequest.colors.map((color) => ({ ...color })),

        paletteBaseColor: cakeRequest.paletteBaseColor
          ? { ...cakeRequest.paletteBaseColor }
          : null,

        paletteSchemeMode: cakeRequest.paletteSchemeMode,

        paletteColors: cakeRequest.paletteColors.map((color) => ({ ...color })),

        decorations: [...cakeRequest.decorations],

        textDetails: cakeRequest.textDetails
          ? { ...cakeRequest.textDetails }
          : null,

        numberAgeDetails: cakeRequest.numberAgeDetails
          ? { ...cakeRequest.numberAgeDetails }
          : null,

        candleDetails: cakeRequest.candleDetails
          ? { ...cakeRequest.candleDetails }
          : null,

        cakeTopperDetails: cakeRequest.cakeTopperDetails
          ? {
            ...cakeRequest.cakeTopperDetails,
            items: Array.isArray(cakeRequest.cakeTopperDetails.items)
              ? cakeRequest.cakeTopperDetails.items.map((item) => ({
                ...item,
              }))
              : [],
          }
          : null,

        figurineDetails: cakeRequest.figurineDetails
          ? {
            ...cakeRequest.figurineDetails,
            items: Array.isArray(cakeRequest.figurineDetails.items)
              ? cakeRequest.figurineDetails.items.map((item) => ({ ...item }))
              : [],
          }
          : null,

        ediblePrintDescription: cakeRequest.ediblePrintDescription,
        otherDecorationDescription: cakeRequest.otherDecorationDescription,

        referenceMode: cakeRequest.referenceMode,
        referenceItems: CakeRequestMapper.mapReferenceItems(
          cakeRequest.referenceItems,
        ),

        budgetMode: cakeRequest.budgetMode,
        budgetRange: cakeRequest.budgetRange,
        customBudget: cakeRequest.customBudget,

        additionalNotes: cakeRequest.additionalNotes,
      },
    };
  }

  static mapReferenceItems(referenceItems) {
    if (!Array.isArray(referenceItems)) {
      return [];
    }

    return referenceItems.map((item) => ({
      id: item.id,
      type: item.type,
      fileName: item.fileName ?? null,
      storagePath: item.storagePath ?? null,
      url: item.url ?? null,
      likes: item.likes ?? "",
      dislikes: item.dislikes ?? "",
      tags: Array.isArray(item.tags) ? [...item.tags] : [],
    }));
  }
}
