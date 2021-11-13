import { expect } from "chai";
import { KeyValueCache } from "../../collections";
import { nameof } from "../../utils";

// todo: more tests

describe("KeyValueCache", () => {
  describe(nameof<KeyValueCache<number, number>>("replaceKey"), () => {
    it("should throw when replacing a key that doesn't exist", () => {
      const cache = new KeyValueCache<{}, {}>();
      expect(() => cache.replaceKey({}, {})).to.throw(Error, "Key not found.");
    });
  });
});
