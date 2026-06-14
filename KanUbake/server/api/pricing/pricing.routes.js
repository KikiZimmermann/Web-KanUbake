/*
  Pricing API

  This file registers the HTTP endpoints for the pricing API.
  It receives cake request data from the frontend and forwards it
  to the pricing service.

  The actual price calculation should not be implemented directly
  inside the route.
*/

function registerPricingApi(app) {
    app.post("/api/pricing/estimate", (req, res) => {
        const requestData = req.body.requestData;

        console.log("Pricing request received:", requestData);

        res.status(200).json({
            message: "Pricing API is connected successfully."
        });
    });
}

module.exports = {
    registerPricingApi
};