import { expect } from "chai";
import { KeyValueCache } from "../../collections";

// todo: more tests

describe(nameof(KeyValueCache), () => {
    describe(nameof<KeyValueCache<number, number>>(c => c.replaceKey), () => {
        it("should throw when replacing a key that doesn't exist", () => {
            const cache = new KeyValueCache<{}, {}>();
            expect(() => cache.replaceKey({}, {})).to.throw(Error, "Key not found.");
        });
    });
});
