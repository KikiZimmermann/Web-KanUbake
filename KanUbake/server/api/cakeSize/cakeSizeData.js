/*
  Cake Size Data

  This file contains the fixed cake size and serving estimate tables.
*/

const singleTierCakeSizes = {
    round: [
        {
            sizeId: "round_15",
            label: "15 cm round cake",
            sizeCm: 15,
            sizeInch: 6,
            partyServings: 10,
            eventServings: 12
        },
        {
            sizeId: "round_20",
            label: "20 cm round cake",
            sizeCm: 20,
            sizeInch: 8,
            partyServings: 20,
            eventServings: 24
        },
        {
            sizeId: "round_23",
            label: "23 cm round cake",
            sizeCm: 23,
            sizeInch: 9,
            partyServings: 26,
            eventServings: 30
        },
        {
            sizeId: "round_25",
            label: "25 cm round cake",
            sizeCm: 25,
            sizeInch: 10,
            partyServings: 32,
            eventServings: 38
        },
        {
            sizeId: "round_30",
            label: "30 cm round cake",
            sizeCm: 30,
            sizeInch: 12,
            partyServings: 48,
            eventServings: 56
        }
    ],

    square: [
        {
            sizeId: "square_20",
            label: "20 × 20 cm square cake",
            partyServings: 24,
            eventServings: 30
        },
        {
            sizeId: "square_23",
            label: "23 × 23 cm square cake",
            partyServings: 34,
            eventServings: 40
        },
        {
            sizeId: "square_25",
            label: "25 × 25 cm square cake",
            partyServings: 40,
            eventServings: 48
        },
        {
            sizeId: "square_30",
            label: "30 × 30 cm square cake",
            partyServings: 60,
            eventServings: 72
        }
    ],

    rectangle: [
        {
            sizeId: "rectangle_18_28",
            label: "18 × 28 cm sheet cake",
            partyServings: 24,
            eventServings: 32
        },
        {
            sizeId: "rectangle_23_33",
            label: "23 × 33 cm rectangular cake",
            partyServings: 36,
            eventServings: 44
        },
        {
            sizeId: "rectangle_33_43",
            label: "33 × 43 cm rectangular cake",
            partyServings: 65,
            eventServings: 80
        },
        {
            sizeId: "rectangle_41_61",
            label: "41 × 61 cm rectangular cake",
            partyServings: 110,
            eventServings: 130
        }
    ],

    heart: [
        {
            sizeId: "heart_15",
            label: "15 cm heart cake",
            partyServings: 8,
            eventServings: 14
        },
        {
            sizeId: "heart_20",
            label: "20 cm heart cake",
            partyServings: 18,
            eventServings: 22
        },
        {
            sizeId: "heart_23",
            label: "23 cm heart cake",
            partyServings: 20,
            eventServings: 28
        },
        {
            sizeId: "heart_25",
            label: "25 cm heart cake",
            partyServings: 24,
            eventServings: 38
        },
        {
            sizeId: "heart_30",
            label: "30 cm heart cake",
            partyServings: 40,
            eventServings: 56
        }
    ]
};

const tieredCakeSizes = {
    round: [
        {
            sizeId: "round_15_20",
            label: "15 + 20 cm round tiered cake",
            tiers: 2,
            partyServings: 30,
            eventServings: 36
        },
        {
            sizeId: "round_20_25",
            label: "20 + 25 cm round tiered cake",
            tiers: 2,
            partyServings: 52,
            eventServings: 62
        },
        {
            sizeId: "round_23_30",
            label: "23 + 30 cm round tiered cake",
            tiers: 2,
            partyServings: 74,
            eventServings: 86
        },
        {
            sizeId: "round_15_20_25",
            label: "15 + 20 + 25 cm round tiered cake",
            tiers: 3,
            partyServings: 62,
            eventServings: 74
        },
        {
            sizeId: "round_20_25_30",
            label: "20 + 25 + 30 cm round tiered cake",
            tiers: 3,
            partyServings: 100,
            eventServings: 118
        }
    ],

    square: [
        {
            sizeId: "square_15_20",
            label: "15 × 15 cm + 20 × 20 cm square tiered cake",
            tiers: 2,
            partyServings: 36,
            eventServings: 44
        },
        {
            sizeId: "square_20_25",
            label: "20 × 20 cm + 25 × 25 cm square tiered cake",
            tiers: 2,
            partyServings: 64,
            eventServings: 78
        },
        {
            sizeId: "square_25_30",
            label: "25 × 25 cm + 30 × 30 cm square tiered cake",
            tiers: 2,
            partyServings: 100,
            eventServings: 120
        },
        {
            sizeId: "square_15_20_25",
            label: "15 × 15 cm + 20 × 20 cm + 25 × 25 cm square tiered cake",
            tiers: 3,
            partyServings: 78,
            eventServings: 92
        },
        {
            sizeId: "square_20_25_30",
            label: "20 × 20 cm + 25 × 25 cm + 30 × 30 cm square tiered cake",
            tiers: 3,
            partyServings: 124,
            eventServings: 150
        }
    ],

    rectangle: [
        {
            sizeId: "rectangle_18_28_23_33",
            label: "18 × 28 cm + 23 × 33 cm tiered sheet cake",
            tiers: 2,
            partyServings: 60,
            eventServings: 82
        },
        {
            sizeId: "rectangle_20_30_30_40",
            label: "20 × 30 cm + 30 × 40 cm tiered sheet cake",
            tiers: 2,
            partyServings: 90,
            eventServings: 105
        },
        {
            sizeId: "rectangle_23_33_28_38",
            label: "23 × 33 cm + 28 × 38 cm tiered sheet cake",
            tiers: 2,
            partyServings: 90,
            eventServings: 124
        },
        {
            sizeId: "rectangle_23_33_33_43",
            label: "23 × 33 cm + 33 × 43 cm tiered sheet cake",
            tiers: 2,
            partyServings: 100,
            eventServings: 124
        },
        {
            sizeId: "rectangle_18_28_23_33_28_38",
            label: "18 × 28 cm + 23 × 33 cm + 28 × 38 cm tiered sheet cake",
            tiers: 3,
            partyServings: 114,
            eventServings: 156
        }
    ],

    heart: [
        {
            sizeId: "heart_15_20",
            label: "15 + 20 cm heart tiered cake",
            tiers: 2,
            partyServings: 26,
            eventServings: 36
        },
        {
            sizeId: "heart_20_25",
            label: "20 + 25 cm heart tiered cake",
            tiers: 2,
            partyServings: 42,
            eventServings: 60
        },
        {
            sizeId: "heart_23_30",
            label: "23 + 30 cm heart tiered cake",
            tiers: 2,
            partyServings: 60,
            eventServings: 84
        },
        {
            sizeId: "heart_15_20_25",
            label: "15 + 20 + 25 cm heart tiered cake",
            tiers: 3,
            partyServings: 50,
            eventServings: 74
        },
        {
            sizeId: "heart_20_25_30",
            label: "20 + 25 + 30 cm heart tiered cake",
            tiers: 3,
            partyServings: 82,
            eventServings: 116
        }
    ]
};

const estimateMessage =
    "The calculated servings are estimates and depend on how the cake is cut.";

module.exports = {
    singleTierCakeSizes,
    tieredCakeSizes,
    estimateMessage,
};