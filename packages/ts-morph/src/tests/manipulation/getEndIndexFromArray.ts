import { expect } from "chai";
import { getEndIndexFromArray } from "../../manipulation";

describe(nameof(getEndIndexFromArray), () => {
    it("should return 0 when undefined", () => {
        expect(getEndIndexFromArray(undefined)).to.equal(0);
    });

    it("should get the length when empty", () => {
        expect(getEndIndexFromArray([])).to.equal(0);
    });

    it("should get the length when not empty", () => {
        expect(getEndIndexFromArray([1])).to.equal(1);
    });
});
