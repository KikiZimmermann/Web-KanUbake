const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

function buildIngredientList(cakeRequest) {
  const ingredients = [];
  const data = cakeRequest.requestData || cakeRequest;

  const gramsPerServing = 100;

data.tierFlavors.forEach((tier) => {
  const servings = tier.servings || 1;
  const amount = gramsPerServing * servings;

  switch (tier.cakeFlavor) {
    case "vanilla":
      ingredients.push(`${amount}g vanilla sponge cake`);
      break;

    case "chocolate":
      ingredients.push(`${amount}g chocolate sponge cake`);
      break;

    case "nut":
      ingredients.push(`${amount}g ${tier.cakeNutType} sponge cake`);
      break;
  }

  switch (tier.filling) {
    case "fruit_filling":
      ingredients.push(`${amount}g ${tier.fruitFilling} filling`);
      break;

    case "buttercream_filling":
      ingredients.push(`${amount}g ${tier.buttercreamType} buttercream`);
      break;

    case "ganache":
      ingredients.push(`${amount}g ${tier.ganacheChocolateType} ganache`);
      break;
  }
});

  return ingredients;
}

function extractAllergens(cakeRequest) {
  const allergens = new Set();
  const data = cakeRequest.requestData || cakeRequest;

  data.tierFlavors.forEach((tier) => {
    if (tier.cakeFlavor === "nut") {
      allergens.add("nuts");
    }

    if (tier.filling === "buttercream_filling" || tier.filling === "ganache") {
      allergens.add("milk");
    }

    if (tier.cakeFlavor === "vanilla" || tier.cakeFlavor === "chocolate") {
      allergens.add("gluten");
      allergens.add("egg");
    }
  });

  return [...allergens];
}

async function analyzeCake(cakeRequest) {
  const ingredients = buildIngredientList(cakeRequest);
  const response = await fetch(
    `https://api.spoonacular.com/recipes/analyze?apiKey=${process.env.SPOONACULAR_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Custom Cake",
        ingredients,
      }),
    }
  );

  return response.json();
}

function registerCakeAnalysisApi(app) {
  app.post("/api/cake-analysis/allergens", (req, res) => {
    try {
      const allergens = extractAllergens(req.body);

      res.json({
        allergens,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: "Something went wrong",
      });
    }
  });

  app.post("/api/cake-analysis/nutrients", async (req, res) => {
    try {
      const analysis = await analyzeCake(req.body);
      console.log("test");
      res.json({
        analysis,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: "Something went wrong",
      });
    }
  });
}

module.exports = {
  registerCakeAnalysisApi,
};
