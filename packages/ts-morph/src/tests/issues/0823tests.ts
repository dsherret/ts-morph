import { expect } from "chai";
import { getInfoFromText } from "../compiler/testHelpers";

describe("tests for issue #817", () => {
    it("should not throw", () => {
        const { sourceFile } = getInfoFromText(`
interface Document {
    $save(): Promise<void>;
}

interface Product ex {
    name: string;
    description: string;
}`);
        sourceFile.getInterfaceOrThrow("Document");

        expect(() => {
            sourceFile.replaceWithText(`
interface Document {
    $save(): Promise<void>;
}

interface Product {
    name: string;
    description: string;
}`);
        }).to.not.throw();
    });
});
