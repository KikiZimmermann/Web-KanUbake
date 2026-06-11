/*
  Cake Size Service

  This file contains the calculation logic for the cake size / servings API.
*/

const {
    singleTierCakeSizes,
    tieredCakeSizes,
    estimateMessage,
    customPlanningMessage
} = require("./cakeSizeData");

function estimateSizeByServings({
    servings,
    shape,
    servingSize,
    tiers
}) {
    const requestedServings = Number(servings);
    const tierCount = Number(tiers);

    if (!requestedServings || requestedServings <= 0) {
        return createErrorResult("Please provide a valid number of servings.");
    }

    if (!shape) {
        return createErrorResult("Please provide a cake shape.");
    }

    if (!servingSize) {
        return createErrorResult("Please provide a serving size.");
    }

    if (requiresCustomPlanning(shape)) {
        return createCustomPlanningResult();
    }

    const servingsWithBuffer = addPlanningBuffer(requestedServings);
    const servingKey = getServingKey(servingSize);
    const availableSizes = getAvailableSizes(shape, tierCount);

    if (availableSizes.length === 0) {
        return createErrorResult("No size data available for this combination.");
    }

    const matchingSize = availableSizes.find((cakeSize) => {
        return cakeSize[servingKey] >= servingsWithBuffer;
    });

    if (!matchingSize) {
        return {
            success: true,
            recommendedSize: "Custom planning required",
            estimatedServings: "Custom estimate required",
            requestedServings: requestedServings,
            plannedServingsWithBuffer: servingsWithBuffer,
            message:
                "The requested serving count is higher than the available size table. Please confirm the final size with the confectionist."
        };
    }

    return {
        success: true,
        recommendedSize: matchingSize.label,
        sizeId: matchingSize.sizeId,
        estimatedServings: matchingSize[servingKey],
        requestedServings: requestedServings,
        plannedServingsWithBuffer: servingsWithBuffer,
        message: estimateMessage
    };
}

function estimateServingsBySize({
    sizeId,
    shape,
    servingSize,
    tiers
}) {
    const tierCount = Number(tiers);

    if (!sizeId) {
        return createErrorResult("Please provide a cake size.");
    }

    if (!shape) {
        return createErrorResult("Please provide a cake shape.");
    }

    if (!servingSize) {
        return createErrorResult("Please provide a serving size.");
    }

    if (requiresCustomPlanning(shape)) {
        return createCustomPlanningResult();
    }

    const servingKey = getServingKey(servingSize);
    const availableSizes = getAvailableSizes(shape, tierCount);

    if (availableSizes.length === 0) {
        return createErrorResult("No size data available for this combination.");
    }

    const matchingSize = availableSizes.find((cakeSize) => {
        return cakeSize.sizeId === sizeId;
    });

    if (!matchingSize) {
        return {
            success: false,
            recommendedSize: "",
            estimatedServings: "",
            message: "The selected cake size was not found in the size table."
        };
    }

    return {
        success: true,
        recommendedSize: matchingSize.label,
        sizeId: matchingSize.sizeId,
        estimatedServings: matchingSize[servingKey],
        message: estimateMessage
    };
}

function getAvailableCakeSizes({ shape, tiers }) {
    const tierCount = Number(tiers);

    if (!shape || requiresCustomPlanning(shape)) {
        return [];
    }

    return getAvailableSizes(shape, tierCount).map((cakeSize) => {
        return {
            sizeId: cakeSize.sizeId,
            label: cakeSize.label,
            tiers: cakeSize.tiers || 1,
            partyServings: cakeSize.partyServings,
            eventServings: cakeSize.eventServings
        };
    });
}

function getAvailableSizes(shape, tiers) {
    if (tiers === 2 || tiers === 3) {
        return (tieredCakeSizes[shape] || []).filter((cakeSize) => {
            return cakeSize.tiers === tiers;
        });
    }

    if (tiers === 1) {
        return singleTierCakeSizes[shape] || [];
    }

    return [
        ...(singleTierCakeSizes[shape] || []),
        ...(tieredCakeSizes[shape] || [])
    ].sort((first, second) => {
        return first.partyServings - second.partyServings;
    });
}

function getServingKey(servingSize) {
    if (servingSize === "event_wedding") {
        return "eventServings";
    }

    return "partyServings";
}

function addPlanningBuffer(servings) {
    return Math.ceil(servings * 1.1);
}

function requiresCustomPlanning(shape) {
    return shape === "sculpted_3d" || shape === "geometric";
}

function createCustomPlanningResult() {
    return {
        success: true,
        recommendedSize: "Custom planning required",
        estimatedServings: "Custom estimate required",
        message: customPlanningMessage
    };
}

function createErrorResult(message) {
    return {
        success: false,
        recommendedSize: "",
        estimatedServings: "",
        message: message
    };
}

module.exports = {
    estimateSizeByServings,
    estimateServingsBySize,
    getAvailableCakeSizes
};