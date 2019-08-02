import { expect } from "chai";
import { getInfoFromText } from "../compiler/testHelpers";

describe("tests for issue #312", () => {
    it("should still correctly add a function when the syntax is wrong like this", () => {
        const text = `
export type compilerVersions = "2.8.1" | "2.6.2" | "2.7.2";

export enum CompilerVersion {
    typescript = "2.8.1",
    typescript-2.6.2 = "2.6.2",
    typescript-2.7.2 = "2.7.2"
}`;
        const { sourceFile } = getInfoFromText(text);
        expect(() => sourceFile.addFunction({ name: "func" })).to.not.throw();
    });
});
