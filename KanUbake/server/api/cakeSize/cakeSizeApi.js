/*
  Cake Size API

  This file defines the API endpoints for cake size and serving estimates.
*/

const {
    estimateSizeByServings,
    estimateServingsBySize,
    getAvailableCakeSizes
} = require("./cakeSizeService");

function registerCakeSizeApi(app) {
    app.get("/api/cake-size", (request, response) => {
        const result = estimateSizeByServings({
            servings: request.query.servings,
            shape: request.query.shape,
            servingSize: request.query.servingSize,
            tiers: request.query.tiers
        });

        response.json(result);
    });

    app.get("/api/cake-servings", (request, response) => {
        const result = estimateServingsBySize({
            sizeId: request.query.sizeId,
            shape: request.query.shape,
            servingSize: request.query.servingSize,
            tiers: request.query.tiers
        });

        response.json(result);
    });

    app.get("/api/cake-sizes", (request, response) => {
        const result = getAvailableCakeSizes({
            shape: request.query.shape,
            tiers: request.query.tiers
        });

        response.json({
            success: true,
            sizes: result
        });
    });
}

module.exports = {
    registerCakeSizeApi
};