/*
  Pricing API

  This file registers the HTTP endpoints for the pricing API.
  It receives cake request data from the frontend and forwards it
  to the pricing service.

  The actual price calculation should not be implemented directly
  inside the route.
*/

const { PricingService } = require("./PricingService");

function registerPricingApi(app) {
    app.post("/api/pricing/estimate", (req, res) => {
        try {
            const requestData = req.body.requestData;

            const result = PricingService.estimatePrice(requestData);

            res.status(200).json(result);
        } catch (error) {
            console.error("Pricing estimate failed:", error);

            res.status(error.statusCode || 500).json({
                message:
                    error.message || "The price estimate could not be calculated.",
                errors:
                    Array.isArray(error.details) ? error.details : []
            });
        }
    });
}

module.exports = {
    registerPricingApi
};