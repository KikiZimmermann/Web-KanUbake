/*
  TierFlavor Model

  This class represents the cake flavor and filling for one specific tier.
  It is used when a cake has multiple tiers and each tier may have the same
  or different flavor and filling choices.

  Examples:
  - Tier 1: chocolate cake with raspberry filling
  - Tier 2: vanilla cake with caramel filling
*/

export class TierFlavor {
    constructor(tierNumber) {
        this.tierNumber = tierNumber;

        this.cakeFlavor = "";
        this.filling = "";
        this.fruitFilling = "";

        this.otherCakeFlavor = "";
        this.otherFilling = "";
        this.otherFruitFilling = "";

        this.cakeColor = "";

        this.buttercreamType = "";
        this.buttercreamColor = "";
        this.buttercreamFlavor = "";

        this.ganacheChocolateType = "";
        this.ganacheColor = "";
    }

    updateCakeFlavor(cakeFlavor) {
        this.cakeFlavor = cakeFlavor;

        if (cakeFlavor !== "other") {
            this.otherCakeFlavor = "";
        }
    }

    updateFilling(filling) {
        this.filling = filling;

        if (filling !== "fruit_filling") {
            this.fruitFilling = "";
            this.otherFruitFilling = "";
        }

        if (filling !== "other") {
            this.otherFilling = "";
        }

        if (filling !== "buttercream_filling") {
            this.buttercreamType = "";
            this.buttercreamColor = "";
            this.buttercreamFlavor = "";
        }

        if (filling !== "ganache") {
            this.ganacheChocolateType = "";
            this.ganacheColor = "";
        }
    }

    updateFruitFilling(fruitFilling) {
        this.fruitFilling = fruitFilling;

        if (fruitFilling !== "other") {
            this.otherFruitFilling = "";
        }
    }

    isComplete() {
        if (!this.cakeFlavor || !this.filling) {
            return false;
        }

        if (this.cakeFlavor === "other" && !this.otherCakeFlavor) {
            return false;
        }

        if (this.filling === "other" && !this.otherFilling) {
            return false;
        }

        if (this.filling === "fruit_filling" && !this.fruitFilling) {
            return false;
        }

        if (this.fruitFilling === "other" && !this.otherFruitFilling) {
            return false;
        }

        if (this.filling === "buttercream_filling" && !this.buttercreamType) {
            return false;
        }

        if (this.filling === "ganache" && !this.ganacheChocolateType) {
            return false;
        }

        return true;
    }
}