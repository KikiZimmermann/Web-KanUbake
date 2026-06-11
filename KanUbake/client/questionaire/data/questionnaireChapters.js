/*
  Questionnaire Chapters

  defines the chapter structure of the questionnaire.
  Each chapter has an id, a title, a short intro text, and a list of form sections
  that belong to that chapter.

  The renderer uses this data to display the current chapter, update the progress
  navigation, and show chapter-specific help text.
*/

export const questionnaireChapters = [
    {
        id: "basic",
        title: "Basic Information & Size",
        intro:
            "Start with the basic details of your cake. The size depends on the serving size, shape, number of tiers and how many people the cake should serve.",
        sections: [
            "occasion",
            "cakeType",
            "servingSize",
            "shape",
            "tiers",
            "sizeAndServings",
            "restrictions"
        ]
    },
    {
        id: "flavor",
        title: "Flavor & Filling",
        intro:
            "Choose the cake flavor and filling. If your cake has multiple tiers, you can use the same flavor and filling for all tiers or choose them individually.",
        sections: [
            "tierFlavorMode",
            "cakeFlavor",
            "filling",
            "fruitFilling"
        ]
    },
    {
        id: "design",
        title: "Design & Decoration",
        intro:
            "Choose the outside look of your cake. Some coverings, such as fondant, may require a stable layer underneath and may not work well with very moist fillings.",
        sections: [
            "covering",
            "fondantLayer",
            "designStyle",
            "colors",
            "decorations",
            "textDetails",
            "numberAgeDetails"
        ]
    },
    {
        id: "references",
        title: "References & Budget",
        intro:
            "Add reference images or links to show the style you like. You can also add a budget or request a rough price estimate.",
        sections: [
            "referenceItems",
            "budgetEstimate",
            "additionalNotes"
        ]
    },
    {
        id: "summary",
        title: "Summary",
        intro:
            "Review your cake request before saving, downloading or sending it. This is not a binding order yet.",
        sections: [
            "summary"
        ]
    }
];