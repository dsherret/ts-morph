import { expect } from "chai";
import { getInfoFromText } from "../compiler/testHelpers";
import { Node } from "../../compiler";

describe("tests for issue #460", () => {
    it("should change to be ambientable", () => {
        const fileText = `export declare const foo: string;
export declare type Foo = string;
export declare interface Bar {
    foo: string;
}
export declare function baz(...args: any[]): void;`;
        const { sourceFile } = getInfoFromText(fileText, { isDefinitionFile: true });

        sourceFile.forEachChild(child => {
            if (Node.isAmbientableNode(child))
                child.setHasDeclareKeyword(false);
        });

        expect(sourceFile.getFullText()).to.equal(fileText.replace(/\bdeclare\s/g, ""));
    });
});
