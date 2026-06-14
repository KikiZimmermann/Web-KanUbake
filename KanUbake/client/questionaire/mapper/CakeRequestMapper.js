/*
  Cake Request Mapper

  Converts a CakeRequest object into the payload expected by the backend.

  The mapper does not save data and does not send HTTP requests.
  It only prepares the data structure.
*/

import { CakeRequest } from "../models/CakeRequest.js";
import { TierFlavor } from "../models/TierFlavor.js";
import { ReferenceItem } from "../models/ReferenceItem.js";

export class CakeRequestMapper {
  // fields in both functions - redundancy
  static simpleFields = [
    "occasion",
    "cakeType",
    "servingSize",
    "shape",
    "tiers",

    "sizeMode",
    "knownServings",
    "knownSize",

    "recommendedSize",
    "estimatedServings",
    "sizeEstimateMessage",
    "plannedServingsWithBuffer",

    "sizeAdvice",
    "sizeAdviceLevel",
    "consultationRequired",

    "restrictionNotes",

    "tierFlavorMode",

    "covering",
    "coveringOther",

    "coveringButtercreamType",
    "coveringButtercreamColor",
    "coveringButtercreamFlavor",

    "coveringGanacheChocolateType",
    "coveringGanacheColor",

    "chocolateGlazePreserveChoice",
    "chocolateGlazePreserveFlavor",
    "chocolateGlazeOtherPreserveFlavor",

    "fondantLayer",

    "fondantButtercreamType",
    "fondantButtercreamColor",
    "fondantButtercreamFlavor",

    "fondantGanacheChocolateType",
    "fondantGanacheColor",

    "fondantMarmaladeFlavor",
    "fondantOtherMarmaladeFlavor",

    "designStyle",
    "themeDescription",

    "colorMode",
    "colorTheme",

    "paletteBaseColor",
    "paletteSchemeMode",

    "ediblePrintDescription",
    "otherDecorationDescription",

    "referenceMode",

    "budgetMode",
    "budgetRange",
    "customBudget",

    "additionalNotes"
  ];

  static copySimpleFields(source, target) {
    this.simpleFields.forEach((fieldName) => {
      if (source[fieldName] !== undefined) {
        target[fieldName] = source[fieldName];
      }
    });
  }

  static detailFields = [
    "textDetails",
    "numberAgeDetails",
    "candleDetails",
    "cakeTopperDetails",
    "figurineDetails"
  ];

  static copyDetailFields(source, target) {
    this.detailFields.forEach((fieldName) => {
      const value = source[fieldName];

      target[fieldName] =
        value === null || value === undefined
          ? null
          : { ...value };
    });
  }

  static arrayFields = [
    "restrictions",
    "fondantLayerDetails",
    "colors",
    "paletteColors",
    "decorations"
  ];

  static copyArrayFields(source, target) {
    this.arrayFields.forEach((fieldName) => {
      target[fieldName] = Array.isArray(source[fieldName])
        ? source[fieldName].map((entry) => {
          if (
            entry !== null &&
            typeof entry === "object"
          ) {
            return { ...entry };
          }

          return entry;
        })
        : [];
    });
  }

  static toApiPayload(cakeRequest) {

    const requestData = {};

    this.copySimpleFields(cakeRequest, requestData);
    this.copyArrayFields(cakeRequest, requestData);
    this.copyDetailFields(cakeRequest, requestData);

    requestData.tierFlavors = cakeRequest.tierFlavors.map((tier) => ({
      ...tier
    }));

    requestData.referenceItems = cakeRequest.referenceItems.map((item) => ({
      ...item
    }));

    return {
      id: cakeRequest.id,
      displayName: cakeRequest.displayName,
      status: cakeRequest.status,
      createdAt: cakeRequest.createdAt,
      updatedAt: cakeRequest.updatedAt,
      requestData
    };
  }

  static fromApiPayload(apiData) {
    const storedData = apiData.requestData ?? apiData;

    const cakeRequest = new CakeRequest();

    this.copySimpleFields(storedData, cakeRequest);
    this.copyArrayFields(storedData, cakeRequest);
    this.copyDetailFields(storedData, cakeRequest);

    cakeRequest.id =
      apiData.id ??
      storedData.id ??
      cakeRequest.id;

    cakeRequest.displayName =
      apiData.displayName ??
      storedData.displayName ??
      cakeRequest.displayName;

    cakeRequest.status =
      apiData.status ??
      storedData.status ??
      "draft_incomplete";

    cakeRequest.createdAt =
      apiData.createdAt ??
      storedData.createdAt ??
      cakeRequest.createdAt;

    cakeRequest.updatedAt =
      apiData.updatedAt ??
      storedData.updatedAt ??
      cakeRequest.updatedAt;

    cakeRequest.tierFlavors = Array.isArray(storedData.tierFlavors)
      ? storedData.tierFlavors.map((tierData, index) => {
        const tierFlavor = new TierFlavor(
          tierData.tierNumber ?? index + 1
        );

        Object.assign(tierFlavor, tierData);

        return tierFlavor;
      })
      : [];

    cakeRequest.referenceItems = Array.isArray(storedData.referenceItems)
      ? storedData.referenceItems.map((itemData) => {
        const referenceItem = new ReferenceItem(
          itemData.type ?? "image"
        );

        Object.assign(referenceItem, itemData);

        return referenceItem;
      })
      : [];

    return cakeRequest;
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
