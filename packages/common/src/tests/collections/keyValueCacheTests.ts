import { expect } from "chai";
import { KeyValueCache } from "../../collections";

// todo: more tests

describe("KeyValueCache", () => {
    describe(nameof.property<KeyValueCache<number, number>>("replaceKey"), () => {
        it("should throw when replacing a key that doesn't exist", () => {
            const cache = new KeyValueCache<{}, {}>();
            expect(() => cache.replaceKey({}, {})).to.throw(Error, "Key not found.");
        });
    });
});
