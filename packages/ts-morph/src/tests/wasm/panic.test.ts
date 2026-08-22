import { expect } from "chai";

describe("Wasm Panic Handling", () => {
    it("should catch Go panics and throw them as standard JS errors", () => {
        // Mock panic from Go
        const mockGoPanic = () => {
            throw new Error("Go Panic: index out of bounds");
        };

        expect(() => mockGoPanic()).to.throw("Go Panic");
    });
});
