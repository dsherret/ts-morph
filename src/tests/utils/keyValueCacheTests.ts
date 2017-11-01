import {expect} from "chai";
import {KeyValueCache, Es5Map, ArrayUtils} from "./../../utils";

// todo: more tests

describe(nameof(KeyValueCache), () => {
    describe(nameof<KeyValueCache<number, number>>(c => c.replaceKey), () => {
        it("should throw when replacing a key that doesn't exist", () => {
            const cache = new KeyValueCache<{}, {}>();
            expect(() => cache.replaceKey({}, {})).to.throw(Error, "Key not found.");
        });
    });
});

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
