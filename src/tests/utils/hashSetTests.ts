import {expect} from "chai";
import {Es5HashSet} from "./../../utils";

describe(nameof(Es5HashSet), () => {
    it("should add values to the hash set and say they exist when they do", () => {
        const hashSet = new Es5HashSet<string>();
        expect(hashSet.has("")).to.be.false;
        hashSet.add("");
        expect(hashSet.has("")).to.be.true;
    });
});
