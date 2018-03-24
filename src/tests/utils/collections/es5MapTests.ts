import {expect} from "chai";
import {Es5Map, ArrayUtils} from "../../../utils";

describe(nameof(Es5Map), () => {
    // todo: organize these tests...
    function doTest<T>(map: Es5Map<T, string>, key: T) {
        expect(map.get(key)).to.be.undefined;
        expect(map.has(key)).to.be.false;
        map.set(key, "value");
        expect(map.get(key)).to.equal("value");
        expect(map.has(key)).to.be.true;
        expect(ArrayUtils.from(map.entries())).to.deep.equal([[key, "value"]]);
        map.delete(key);
        expect(ArrayUtils.from(map.entries())).to.deep.equal([]);
        expect(map.get(key)).to.be.undefined;
        expect(map.has(key)).to.be.false;
    }

    it("should work with a string", () => {
        doTest(new Es5Map<string, string>(), "key");
    });

    it("should work", () => {
        doTest(new Es5Map<{}, string>(), {});
    });
});
