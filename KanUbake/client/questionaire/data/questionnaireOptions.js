/*
  This file contains the selectable options used throughout the questionnaire.
  Examples include occasions, cake types, shapes, restrictions, flavors, fillings,
  coverings, design styles, decorations, and budget options.

  Keeping options in one central file makes the form easier to maintain and update.
*/

export const questionnaireOptions = {
    occasions: [
        { value: "birthday", label: "Birthday" },
        { value: "wedding", label: "Wedding" },
        { value: "baby_shower", label: "Christening / Baby Shower" },
        { value: "anniversary", label: "Anniversary" },
        { value: "corporate", label: "Corporate Event" },
        { value: "graduation", label: "Graduation" },
        { value: "seasonal", label: "Holiday / Seasonal" },
        { value: "other", label: "Other" }
    ],

    cakeTypes: [
        { value: "classic_cream", label: "Standard Decorated Cake" },
        { value: "fruit_cake", label: "Fruit Cake / Fresh Fruit Cake" },
        { value: "themed_cake", label: "Themed Cake" },
        { value: "naked_cake", label: "Naked Cake" },
        { value: "semi_naked_cake", label: "Semi-Naked Cake" },
        { value: "cupcakes_mini", label: "Cupcakes / Mini Cakes" },
        { value: "unsure", label: "Not Sure Yet" }
    ],

    servingSizes: [
        { value: "party", label: "Party Servings – Larger Slices" },
        { value: "event_wedding", label: "Event / Wedding Servings – Smaller Slices" },
        { value: "unsure_advise", label: "I’m Not Sure Yet – Please Advise" }
    ],

    shapes: [
        { value: "round", label: "Round" },
        { value: "square", label: "Square" },
        { value: "rectangle", label: "Sheet" },
        { value: "heart", label: "Heart" },
        { value: "sculpted_3d", label: "3D / Sculpted Cake" },
        { value: "other", label: "Other" },
        { value: "unsure_advise", label: "I’m Not Sure Yet – Please Advise" }
    ],

    tiers: [
        { value: "1", label: "1 Tier" },
        { value: "2", label: "2 Tiers" },
        { value: "3", label: "3 Tiers" },
        { value: "unsure_advise", label: "I’m Not Sure Yet – Please Advise" }
    ],

    tierFlavorModes: [
        { value: "same_for_all", label: "All Tiers The Same" },
        { value: "individual_per_tier", label: "Choose Each Tier Individually" },
        { value: "unsure_advise", label: "I’m Not Sure Yet – Please Advise" }
    ],

    sizeModes: [
        { value: "known_servings", label: "I Know The Number Of Guests / Servings" },
        { value: "known_size", label: "I Know The Cake Size I Want" },
        { value: "unsure_advise", label: "I’m Not Sure Yet – Please Advise" }
    ],

    restrictions: [
        { value: "vegan", label: "Vegan" },
        { value: "vegetarian", label: "Vegetarian" },
        { value: "gluten_free", label: "Gluten-Free" },
        { value: "lactose_free", label: "Lactose-Free" },
        { value: "nut_free", label: "Nut-Free" },
        { value: "peanut_free", label: "Peanut-Free" },
        { value: "egg_free", label: "Egg-Free" },
        { value: "soy_free", label: "Soy-Free" },
        { value: "other", label: "Other Allergies / Notes" }
    ],

    cakeFlavors: [
        { value: "vanilla", label: "Vanilla" },
        { value: "chocolate", label: "Chocolate" },
        { value: "lemon", label: "Lemon" },
        { value: "red_velvet", label: "Red Velvet" },
        { value: "carrot", label: "Carrot Cake" },
        { value: "coconut", label: "Coconut" },
        { value: "marble", label: "Marble Cake" },
        { value: "nut", label: "Nut" },
        { value: "spice", label: "Spice Cake" },
        { value: "unsure_advise", label: "I’m Not Sure Yet – Please Advise" },
        { value: "other", label: "Other Flavor" }
    ],

    fillings: [
        { value: "vanilla_cream", label: "Vanilla Cream" },
        { value: "chocolate_cream", label: "Chocolate Cream" },
        { value: "buttercream_filling", label: "Buttercream Filling" },
        { value: "mascarpone_cream", label: "Mascarpone Cream" },
        { value: "berry_cream", label: "Berry Cream" },
        { value: "fruit_filling", label: "Fruit Filling" },
        { value: "caramel", label: "Caramel" },
        { value: "nut_cream", label: "Nut Cream" },
        { value: "ganache", label: "Ganache" },
        { value: "jam", label: "Jam / Fruit Preserve" },
        { value: "unsure_advise", label: "I’m Not Sure Yet – Please Advise" },
        { value: "other", label: "Other Filling" }
    ],

    fruitFillings: [
        { value: "strawberry", label: "Strawberry" },
        { value: "raspberry", label: "Raspberry" },
        { value: "blueberry", label: "Blueberry" },
        { value: "mixed_berries", label: "Mixed Berries" },
        { value: "cherry", label: "Cherry" },
        { value: "mango", label: "Mango" },
        { value: "passion_fruit", label: "Passion Fruit" },
        { value: "lemon", label: "Lemon" },
        { value: "orange", label: "Orange" },
        { value: "apple_cinnamon", label: "Apple Cinnamon" },
        { value: "peach", label: "Peach" },
        { value: "other", label: "Other Fruit" },
        { value: "unsure_advise", label: "I’m Not Sure Yet – Please Advise" }
    ],

    fruitPreserves: [
        { value: "apricot", label: "Apricot" },
        { value: "strawberry", label: "Strawberry" },
        { value: "raspberry", label: "Raspberry" },
        { value: "cherry", label: "Cherry" },
        { value: "mixed_berries", label: "Mixed Berries" },
        { value: "orange", label: "Orange" },
        { value: "other", label: "Other Fruit" },
        {
            value: "unsure_advise",
            label: "I’m Not Sure Yet – Please Advise"
        }
    ],

    nutTypes: [
        { value: "hazelnut", label: "Hazelnut" },
        { value: "walnut", label: "Walnut" },
        { value: "almond", label: "Almond" },
        { value: "pistachio", label: "Pistachio" },
        { value: "peanut", label: "Peanut" },
        { value: "mixed_nuts", label: "Mixed Nuts" },
        { value: "other", label: "Other Nut" },
        {
            value: "unsure_advise",
            label: "I’m Not Sure Yet – Please Advise"
        }
    ],

    yesNoUnsure: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
        {
            value: "unsure_advise",
            label: "I’m Not Sure Yet – Please Advise"
        }
    ],

    coverings: [
        { value: "buttercream", label: "Buttercream" },
        { value: "ganache", label: "Ganache" },
        { value: "chocolate_glaze", label: "Chocolate Glaze" },
        { value: "fondant", label: "Fondant" },
        { value: "whipped_cream", label: "Whipped Cream" },
        { value: "mascarpone_cream", label: "Mascarpone Cream" },
        { value: "cream_cheese", label: "Cream Cheese Frosting" },
        { value: "naked_semi_naked", label: "Naked / Semi-Naked" },
        { value: "fruit_glaze", label: "Fruit Glaze" },
        { value: "fresh_fruit", label: "Fresh Fruit Topping" },
        { value: "unsure_advise", label: "I’m Not Sure Yet – Please Advise" },
        { value: "other", label: "Other Option" }
    ],

    fondantLayers: [
        { value: "buttercream", label: "Buttercream" },
        { value: "ganache", label: "Ganache" },
        { value: "marmalade", label: "Marmalade / Fruit Preserve" },
        { value: "unsure_advise", label: "I’m Not Sure Yet – Please Advise" }
    ],

    buttercreamTypes: [
        {
            value: "swiss",
            label: "Swiss Meringue Buttercream",
            description: "Smooth, silky, less sweet and often used for a more elegant finish."
        },
        {
            value: "italian",
            label: "Italian Meringue Buttercream",
            description: "Very stable, smooth and less sweet, often used for professional cakes."
        },
        {
            value: "american",
            label: "American Buttercream",
            description: "Sweeter, firmer and simpler, often used for strong decorations and piping."
        },
        {
            value: "unsure_advise",
            label: "I’m Not Sure Yet – Please Advise",
            description: "The confectionist can suggest the best option for your cake."
        }
    ],

    ganacheChocolateTypes: [
        { value: "white", label: "White Chocolate Ganache" },
        { value: "milk", label: "Milk Chocolate Ganache" },
        { value: "dark", label: "Dark Chocolate Ganache" },
        { value: "unsure_advise", label: "I’m Not Sure Yet – Please Advise" }
    ],

    designStyles: [
        { value: "elegant", label: "Elegant" },
        { value: "minimalist", label: "Minimalist" },
        { value: "playful", label: "Playful" },
        { value: "floral", label: "Floral" },
        { value: "vintage", label: "Vintage" },
        { value: "luxury", label: "Luxury" },
        { value: "modern_clean", label: "Modern / Clean" },
        { value: "comic_cartoon", label: "Comic / Cartoon" },
        { value: "themed", label: "Themed" },
        { value: "other", label: "Other Style" },
        { value: "unsure_advise", label: "I’m Not Sure Yet – Please Advise" }
    ],

    colorModes: [
        { value: "no_specific_color", label: "No Specific Color" },
        { value: "choose_colors", label: "I Want To Choose Colors Myself" },
        { value: "suggest_palette", label: "I Want A Suggested Color Palette" },
        { value: "choose_color_theme", label: "I Want To Choose A Color Theme" },
        { value: "unsure_advise", label: "I’m Not Sure Yet – Please Advise" }
    ],

    colorThemes: [
        { value: "pastel", label: "Pastel" },
        { value: "white_gold", label: "White / Gold" },
        { value: "pink", label: "Pink" },
        { value: "blue", label: "Blue" },
        { value: "green_natural", label: "Green / Natural Tones" },
        { value: "dark_elegant", label: "Dark / Elegant" },
        { value: "colorful", label: "Colorful" },
        { value: "neutral_cream", label: "Neutral / Cream" }
    ],

    decorations: [
        { value: "text_lettering", label: "Text / Lettering" },
        { value: "number_age", label: "Number / Age" },
        { value: "cake_topper", label: "Cake Topper" },
        { value: "candles", label: "Candles" },
        { value: "fresh_flowers", label: "Fresh Flowers" },
        { value: "sugar_flowers", label: "Sugar Flowers" },
        { value: "figurines", label: "Figurines / Modelling" },
        { value: "drip", label: "Drip" },
        { value: "fruits", label: "Fruits" },
        { value: "macarons", label: "Macarons" },
        { value: "sprinkles", label: "Sprinkles" },
        { value: "pearls", label: "Pearls" },
        { value: "bow", label: "Bow" },
        { value: "ruffles", label: "Ruffles" },
        { value: "wafer_paper", label: "Wafer Paper / Rice Paper Decoration" },
        { value: "chocolate_decor", label: "Chocolate Decorations" },
        { value: "glitter_metallic", label: "Glitter / Metallic Effect" },
        { value: "gold_silver_details", label: "Gold Or Silver Details" },
        { value: "edible_print", label: "Edible Print / Image" },
        { value: "other", label: "Other Decoration" }
    ],

    letteringStyles: [
        { value: "elegant", label: "Elegant" },
        { value: "playful", label: "Playful" },
        { value: "modern", label: "Modern" },
        { value: "handwritten", label: "Handwritten" },
        { value: "unsure_advise", label: "I’m Not Sure Yet – Please Advise" }
    ],

    numberDisplayTypes: [
        { value: "written", label: "Written On The Cake" },
        { value: "number_candle", label: "Large Number Candle" },
        { value: "sculpted_number", label: "3D / Sculpted Number" },
        { value: "number_topper", label: "Number Cake Topper" },
        { value: "unsure_advise", label: "I’m Not Sure Yet – Please Advise" }
    ],

    referenceTypes: [
        { value: "no", label: "No" },
        { value: "upload_images", label: "Upload Images" },
        { value: "add_links", label: "Add Links" },
        { value: "upload_images_and_links", label: "Upload Images And Add Links" }
    ],

    referenceTags: [
        { value: "colors", label: "Colors" },
        { value: "shape", label: "Shape" },
        { value: "decoration", label: "Decoration" },
        { value: "overall_style", label: "Overall Style" },
        { value: "text_lettering", label: "Text / Lettering" }
    ],

    budgetModes: [
        { value: "skip", label: "No, Skip This" },
        { value: "enter_budget", label: "I Want To Enter A Budget" },
        { value: "show_estimate", label: "I Want To See A Rough Price Estimate" }
    ],

    budgetRanges: [
        { value: "no_specific_budget", label: "No Specific Budget" },
        { value: "under_50", label: "Under €50" },
        { value: "50_100", label: "€50–100" },
        { value: "100_200", label: "€100–200" },
        { value: "200_400", label: "€200–400" },
        { value: "over_400", label: "Over €400" },
        { value: "custom_budget", label: "I Want To Enter My Own Amount" }
    ]
};