const app = express();
app.use(express.json());

const path = require("path");
require("dotenv").config({
    path: path.join(__dirname, "..", ".env")
});

//Analyse logic
function buildIngredientList(cakeRequest) {
    const ingredients = [];

    cakeRequest.tierFlavors.forEach((tier) => {
        switch (tier.cakeFlavor) {
            case "vanilla":
                ingredients.push("100g vanilla sponge cake");
                break;

            case "chocolate":
                ingredients.push("100g chocolate sponge cake");
                break;

            case "nut":
                ingredients.push(`${tier.cakeNutType} sponge cake`);
                break;
        }

        switch (tier.filling) {
            case "fruit_filling":
                ingredients.push(`${tier.fruitFilling} filling`);
                break;

            case "buttercream_filling":
                ingredients.push(`${tier.buttercreamType} buttercream`);
                break;

            case "ganache":
                ingredients.push(`${tier.ganacheChocolateType} ganache`);
                break;
        }
    });

    return ingredients;
}
//alagerne logic
function extractAllergens(cakeRequest) {
    const allergens = new Set();

    cakeRequest.tierFlavors.forEach((tier) => {
        if (tier.cakeFlavor === "nut") {
            allergens.add("nuts");
        }

        if (
            tier.filling === "buttercream_filling" ||
            tier.filling === "ganache"
        ) {
            allergens.add("milk");
        }

        if (
            tier.cakeFlavor === "vanilla" ||
            tier.cakeFlavor === "chocolate"
        ) {
            allergens.add("gluten");
            allergens.add("egg");
        }
    });

    return [...allergens];
}


//allergene
app.post("/allergens", function (req, res) {
    try {
        const cakeRequest = req.body;

        const allergens = extractAllergens(cakeRequest);

        res.json({
            allergens
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
});


//Analysieren
async function analyzeCake(cakeRequest, apiKey) {
    const ingredients = buildIngredientList(cakeRequest);

    const response = await fetch(
        `https://api.spoonacular.com/recipes/analyze?apiKey=${apiKey}`,
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

    return await response.json();
}

app.post("/nutrients", async function (req, res) {
    try {
        const cakeRequest = req.body;
        const apiKey = process.env.SPOONACULAR_API_KEY;

        const analysis = await analyzeCake(cakeRequest, apiKey);

        res.json({
            analysis
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
});