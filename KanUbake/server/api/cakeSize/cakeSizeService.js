/*
  Cake Size Service

  This file contains the calculation logic for the cake size / servings API.
*/

const {
    singleTierCakeSizes,
    tieredCakeSizes,
    estimateMessage,
} = require("./cakeSizeData");

function estimateSizeByServings({
    servings,
    shape,
    servingSize,
    tiers
}) {
    const requestedServings = Number(servings);

    if (!requestedServings || requestedServings <= 0) {
        return createErrorResult("Please provide a valid number of servings.");
    }

    if (!shape) {
        return createErrorResult("Please provide a cake shape.");
    }

    if (!servingSize) {
        return createErrorResult("Please provide a serving size.");
    }

    if (requiresSizeConsultation(shape, tiers)) {
        return createSizeConsultationResult(requestedServings);
    }

    const tierCount = Number(tiers);

    if (![1, 2, 3].includes(tierCount)) {
        return createSizeConsultationResult(requestedServings);
    }

    const servingsWithBuffer = addPlanningBuffer(requestedServings);
    const servingKey = getServingKey(servingSize);
    const availableSizes = getAvailableSizes(shape, tierCount);

    if (availableSizes.length === 0) {
        return createErrorResult("No size data available for this combination.");
    }

    const largestAvailableSize = availableSizes.reduce((largest, current) => {
        return current[servingKey] > largest[servingKey]
            ? current
            : largest;
    });

    const largestCapacity = largestAvailableSize[servingKey];

    const matchingSize = availableSizes.find((cakeSize) => {
        return cakeSize[servingKey] >= servingsWithBuffer;
    });

    if (!matchingSize) {
        let sizeAdvice;

        if (tierCount < 3) {
            sizeAdvice =
                `The largest available ${tierCount}-tier cake for this shape serves ` +
                `approximately ${largestCapacity} people. This may not be enough for ` +
                `the requested ${requestedServings} servings. A larger cake or a cake ` +
                `with more tiers may be more suitable. Please discuss the final size ` +
                `with the confectionist.`;
        } else {
            sizeAdvice =
                `The largest available 3-tier cake for this shape serves approximately ` +
                `${largestCapacity} people. This may not be enough for the requested ` +
                `${requestedServings} servings. Please discuss the required cake size ` +
                `with the confectionist.`;
        }

        return {
            success: true,
            consultationRequired: true,
            recommendedSize: "",
            sizeId: "",
            estimatedServings: largestCapacity,
            requestedServings: requestedServings,
            plannedServingsWithBuffer: servingsWithBuffer,
            message: estimateMessage,
            sizeAdvice: sizeAdvice,
            sizeAdviceLevel: "hard"
        };
    }

    const estimatedServings = matchingSize[servingKey];

    const oversizedThreshold = Math.ceil(
        requestedServings * getOversizedFactor(requestedServings)
    );

    let sizeAdvice = null;
    let sizeAdviceLevel = null;

    const nearCapacityThreshold = Math.floor(
        largestCapacity * NEAR_CAPACITY_THRESHOLD
    );

    const isNearMaximumCapacity =
        servingsWithBuffer >= nearCapacityThreshold;

    if (isNearMaximumCapacity) {
        if (tierCount < 3) {
            sizeAdvice =
                `The requested number of servings is close to the standard capacity ` +
                `limit for a ${tierCount}-tier cake of this shape. A larger cake or ` +
                `a cake with more tiers may be more suitable. Please discuss the final ` +
                `size with the confectionist.`;
        } else {
            sizeAdvice =
                `The requested number of servings is close to the standard capacity ` +
                `limit for a 3-tier cake of this shape. Please discuss the final size ` +
                `with the confectionist.`;
        }

        sizeAdviceLevel = "soft";
    }

    if (!sizeAdvice && estimatedServings >= oversizedThreshold) {
        if (tierCount > 1) {
            sizeAdvice =
                `The smallest available ${tierCount}-tier cake serves approximately ` +
                `${estimatedServings} people, which is (considerably) more than the ` +
                `${requestedServings} requested servings. A cake with fewer tiers may ` +
                `be more suitable. Please discuss the final size with the confectionist.`;
        } else {
            sizeAdvice =
                `The recommended cake serves approximately ${estimatedServings} people, ` +
                `which is (considerably) more than the ${requestedServings} requested servings. ` +
                `A smaller cake may be more suitable. Please discuss the final size with ` +
                `the confectionist.`;
        }
    }

    return {
        success: true,
        recommendedSize: matchingSize.label,
        sizeId: matchingSize.sizeId,
        estimatedServings: matchingSize[servingKey],
        requestedServings: requestedServings,
        plannedServingsWithBuffer: servingsWithBuffer,
        message: estimateMessage,
        sizeAdvice: sizeAdvice,
        sizeAdviceLevel: sizeAdviceLevel
    };
}

function estimateServingsBySize({
    sizeId,
    shape,
    servingSize,
    tiers
}) {
    if (!shape) {
        return createErrorResult("Please provide a cake shape.");
    }

    if (!servingSize) {
        return createErrorResult("Please provide a serving size.");
    }

    if (requiresSizeConsultation(shape, tiers)) {
        return createSizeConsultationResult();
    }

    if (!sizeId) {
        return createErrorResult(
            "Please provide a cake size."
        );
    }

    const tierCount = Number(tiers);

    if (![1, 2, 3].includes(tierCount)) {
        return createSizeConsultationResult();
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
    if (!shape) {
        return [];
    }

    if (requiresSizeConsultation(shape, tiers)) {
        return [];
    }

    const tierCount = Number(tiers);

    if (![1, 2, 3].includes(tierCount)) {
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

function getOversizedFactor(requestedServings) {
    if (requestedServings < 30) {
        return 1.5;
    }

    if (requestedServings < 60) {
        return 1.15;
    }

    if (requestedServings < 120) {
        return 1.1;
    }

    return 1.05;
}

const NEAR_CAPACITY_THRESHOLD = 0.9;

function requiresSizeConsultation(shape, tiers) {
    return (
        shape === "sculpted_3d" ||
        shape === "other" ||
        shape === "unsure_advise" ||
        tiers === "unsure_advise"
    );
}

function createSizeConsultationResult(requestedServings = null) {
    return {
        success: true,
        consultationRequired: true,
        recommendedSize: "",
        sizeId: "",
        estimatedServings: "",
        requestedServings: requestedServings,
        plannedServingsWithBuffer: null,
        message:
            "A standard cake size cannot be calculated for this selection. " +
            "Please discuss the suitable cake size with the confectionist.",
        sizeAdvice: null,
        sizeAdviceLevel: "consultation"
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