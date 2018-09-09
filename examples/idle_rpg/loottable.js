export default class LootTable {
    constructor(lootArray = []) {
        this.lootArray = lootArray;
        this.totalProbability = this.calculateTotalProbability();
    }

    get length() {
        return this.lootArray.length;
    }

    calculateTotalProbability() {
        return this.lootArray.map(el => el.probability).reduce((pre, cur) => pre + cur);
    }

    item(index) {
        return this.lootArray[index];
    }

    getRandomItem() {
        const ndx = Math.floor(Math.random() * this.totalProbability);
        let i, sum = 0, length = this.length;
        for (i = 0; i < length; i++) {
            sum += this.lootArray[i].probability;
            if (ndx < sum) {
                break;
            }
        }
        return this.lootArray[i];
    }
}