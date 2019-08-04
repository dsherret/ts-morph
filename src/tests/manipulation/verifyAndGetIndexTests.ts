import { expect } from "chai";
import { verifyAndGetIndex } from "../../manipulation";

describe(nameof(verifyAndGetIndex), () => {
    it("should get the index when zero and length is zero", () => {
        expect(verifyAndGetIndex(0, 0)).to.equal(0);
    });

    it("should get the index when equal to length", () => {
        expect(verifyAndGetIndex(1, 1)).to.equal(1);
    });

    it("should get the index when equal to length * 1", () => {
        expect(verifyAndGetIndex(-1, 1)).to.equal(0);
    });

    it("should throw the index greater than length", () => {
        expect(() => verifyAndGetIndex(2, 1)).to.throw();
    });

    it("should throw the index greater than length * -1", () => {
        expect(() => verifyAndGetIndex(-2, 1)).to.throw();
    });
});
