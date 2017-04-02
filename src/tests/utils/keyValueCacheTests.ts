import {expect} from "chai";
import {KeyValueCache} from "./../../utils";

// todo: more tests

describe(nameof(KeyValueCache), () => {
    describe(nameof<KeyValueCache<number, number>>(c => c.replaceKey), () => {
        it("should throw when replacing a key that doesn't exist", () => {
            const cache = new KeyValueCache<number, number>();
            expect(() => cache.replaceKey(1, 1)).to.throw(Error, "Key not found.");
        });
    });
});
