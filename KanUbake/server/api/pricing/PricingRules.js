/*
  Pricing Rules

  This file contains the fixed prices and surcharge rules for the pricing API.
  It does not calculate the final price by itself.

  Keeping all prices in one central file makes it easier to update the pricing
  later without changing the calculation logic.
*/

const pricingRules = {
    currency: "EUR",

    priceRange: {
        defaultMinimumFactor: 0.9,
        defaultMaximumFactor: 1.2,
        consultationMaximumFactor: 1.3
    },

    cakeTypeBasePrices: {
        classic_cream: 7.5,
        fruit_cake: 8.0,
        themed_cake: 8.5,
        naked_cake: 7.5,
        semi_naked_cake: 7.8,
        unsure: 8.0
    },

    tierSurchargesPerServing: {
        "1": 0,
        "2": 0.4,
        "3": 0.8,
        unsure_advise: 0
    },

    fillingSurchargesPerServing: {
        vanilla_cream: 0,
        chocolate_cream: 0,
        buttercream_filling: 0,
        mascarpone_cream: 0.3,
        berry_cream: 0.3,
        fruit_filling: 0.3,
        caramel: 0.3,
        nut_cream: 0.4,
        ganache: 0.5,
        jam: 0,
        unsure_advise: 0,

        /*
          Other fillings are too individual for an automatic fixed price.
        */
        other: null
    },

    coveringSurchargesPerServing: {
        buttercream: 0,
        ganache: 0.5,
        chocolate_glaze: 0.2,
        fondant: 1.0,
        whipped_cream: 0,
        mascarpone_cream: 0.3,
        cream_cheese: 0.3,
        naked_semi_naked: 0,
        fruit_glaze: 0.2,
        fresh_fruit: 0.5,
        unsure_advise: 0,

        /*
          Other covering options need confirmation by the confectionist.
        */
        other: null
    },

    fondantLayerSurchargesPerServing: {
        buttercream: 0,
        ganache: 0.3,
        marmalade: 0,
        unsure_advise: 0
    },

    restrictionSurchargesPerServing: {
        vegetarian: 0,
        vegan: 0.4,
        gluten_free: 0.6,
        lactose_free: 0.3,
        nut_free: 0,
        peanut_free: 0,
        egg_free: 0.4,
        soy_free: 0,

        /*
          Other allergies or notes need individual confirmation.
        */
        other: null
    },

    designStyleSurchargesFixed: {
        minimalist: 0,
        modern_clean: 0,
        elegant: 8,
        playful: 8,
        floral: 12,
        vintage: 12,
        themed: 15,
        unsure_advise: 0,

        /*
          These can vary too much for a reliable automatic estimate.
        */
        luxury: null,
        comic_cartoon: null,
        other: null
    },

    decorationSurchargesFixed: {
        text_lettering: 0,
        number_age: 0,

        /*
        Cake toppers, candles and figurines use their own quantity-
        and size-based pricing rules below.
        */
        cake_topper: 0,
        candles: 0,
        figurines: 0,

        fresh_flowers: null,
        sugar_flowers: null,
        drip: 5,
        fruits: 8,
        macarons: 10,
        sprinkles: 0,
        pearls: 3,
        bow: 7,
        ruffles: null,
        wafer_paper: 8,
        chocolate_decor: 8,
        glitter_metallic: 4,
        gold_silver_details: 6,
        edible_print: 8,
        other: null
    },

    numberDisplayTypeSurchargesFixed: {
        written: 0,
        number_candle: 3,
        sculpted_number: 15,
        number_topper: 8,
        unsure_advise: 0
    },

    candlePricing: {
        baseQuantity: 5,
        basePrice: 1,
        additionalPricePerCandle: 0.1,
        maximumAutomaticPrice: 5
    },

    topperPricing: {
        maximumAutomaticQuantity: 3,

        pricesBySize: {
            small: 5,
            medium: 8,
            large: 12
        }
    },

    figurinePricing: {
        maximumAutomaticQuantity: 3,

        pricesBySize: {
            small: 15,
            medium: 25,
            large: 40
        }
    }
};

module.exports = {
    pricingRules
};