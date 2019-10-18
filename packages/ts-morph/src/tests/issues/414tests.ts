import { expect } from "chai";
import { getInfoFromText } from "../compiler/testHelpers";

describe("tests for issue #414", () => {
    it("should not error when inserting into a namespace with insertText", () => {
        const text = `
declare global {
    export interface Person { name: string }
    export type People = Person[];
}`;
        const { sourceFile } = getInfoFromText(text, { includeLibDts: true });
        const globalNode = sourceFile.getNamespaceOrThrow("global");

        globalNode.insertText(globalNode.getEnd() - 1, writer => {
            writer.indent().write("export interface Car { model: string }").newLine();
        });
        expect(sourceFile.getFullText()).to.equal(`
declare global {
    export interface Person { name: string }
    export type People = Person[];
    export interface Car { model: string }
}`);
    });
});
