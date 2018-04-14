import { expect } from "chai";
import { Es5WeakMap } from "../../../utils";

describe(nameof(Es5WeakMap), () => {
    it("should hold a reference to the value on the key", () => {
        const map = new Es5WeakMap<{}, any>();
        expect(map.get({})).to.be.undefined;
        const key = {};
        const value = "string";
        map.set(key, value);
        expect(map.get(key)).to.equal(value);
        expect(map.has(key)).to.be.true;
        map.delete(key);
        expect(map.get(key)).to.be.undefined;
    });
});
