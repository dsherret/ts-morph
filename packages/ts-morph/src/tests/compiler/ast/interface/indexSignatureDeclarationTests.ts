import { expect } from "chai";
import { IndexSignatureDeclaration, InterfaceDeclaration } from "../../../../compiler";
import { errors } from "@ts-morph/common";
import { IndexSignatureDeclarationStructure, StructureKind } from "../../../../structures";
import { WriterFunction } from "../../../../types";
import { getInfoFromText, OptionalKindAndTrivia, OptionalTrivia, fillStructures } from "../../testHelpers";

describe(nameof(IndexSignatureDeclaration), () => {
    function getFirstIndexSignatureWithInfo(code: string) {
        const opts = getInfoFromText<InterfaceDeclaration>(code);
        return { ...opts, firstIndexSignature: opts.firstChild.getIndexSignatures()[0] };
    }

    describe(nameof<IndexSignatureDeclaration>(n => n.getKeyName), () => {
        function doTest(code: string, expectedName: string) {
            const { firstIndexSignature } = getFirstIndexSignatureWithInfo(code);
            expect(firstIndexSignature.getKeyName()).to.equal(expectedName);
        }

        it("should get the key name", () => {
            doTest("interface Identifier { [keyName: string]: number; }", "keyName");
        });
    });

    describe(nameof<IndexSignatureDeclaration>(n => n.getKeyNameNode), () => {
        function doTest(code: string, expectedName: string) {
            const { firstIndexSignature, sourceFile } = getFirstIndexSignatureWithInfo(code);
            expect(firstIndexSignature.getKeyNameNode().getText()).to.equal(expectedName);
        }

        it("should get the key name node", () => {
            doTest("interface Identifier { [keyName: string]: number; }", "keyName");
        });
    });

    describe(nameof<IndexSignatureDeclaration>(n => n.setKeyName), () => {
        function doTest(code: string, name: string, expectedCode: string) {
            const { firstIndexSignature, sourceFile } = getFirstIndexSignatureWithInfo(code);
            firstIndexSignature.setKeyName(name);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should set the key name", () => {
            doTest("interface Identifier { [keyName: string]: number; }", "newKeyName", "interface Identifier { [newKeyName: string]: number; }");
        });

        function doThrowTest(name: string) {
            const { firstIndexSignature, sourceFile } = getFirstIndexSignatureWithInfo("interface Identifier { [keyName: string]: number; }");
            expect(() => firstIndexSignature.setKeyName(name)).to.throw(errors.ArgumentNullOrWhitespaceError);
        }

        it("should throw when specifying an empty string", () => {
            doThrowTest("");
        });
    });

    describe(nameof<IndexSignatureDeclaration>(n => n.getKeyType), () => {
        function doTest(code: string, expected: string) {
            const { firstIndexSignature } = getFirstIndexSignatureWithInfo(code);
            expect(firstIndexSignature.getKeyType().getText()).to.equal(expected);
        }

        it("should get", () => {
            doTest("interface Identifier { [keyName: string]: number; }", "string");
        });
    });

    describe(nameof<IndexSignatureDeclaration>(n => n.getKeyTypeNode), () => {
        function doTest(code: string, expectedName: string) {
            const { firstIndexSignature } = getFirstIndexSignatureWithInfo(code);
            expect(firstIndexSignature.getKeyTypeNode().getText()).to.equal(expectedName);
        }

        it("should get", () => {
            doTest("interface Identifier { [keyName: string]: number; }", "string");
        });
    });

    describe(nameof<IndexSignatureDeclaration>(n => n.setKeyType), () => {
        function doTest(code: string, name: string, expectedCode: string) {
            const { firstIndexSignature, sourceFile } = getFirstIndexSignatureWithInfo(code);
            firstIndexSignature.setKeyType(name);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should set", () => {
            doTest("interface Identifier { [keyName: string]: number; }", "number", "interface Identifier { [keyName: number]: number; }");
        });

        function doThrowTest(name: string) {
            const { firstIndexSignature } = getFirstIndexSignatureWithInfo("interface Identifier { [keyName: string]: number; }");
            expect(() => firstIndexSignature.setKeyType(name)).to.throw(errors.ArgumentNullOrWhitespaceError);
        }

        it("should throw when specifying an empty string", () => {
            doThrowTest("");
        });
    });

    describe(nameof<IndexSignatureDeclaration>(n => n.getReturnType), () => {
        function doTest(code: string, expected: string) {
            const { firstIndexSignature, sourceFile } = getFirstIndexSignatureWithInfo(code);
            expect(firstIndexSignature.getReturnType().getText()).to.equal(expected);
        }

        it("should get when it exists", () => {
            doTest("interface Identifier { [keyName: string]: number; }", "number");
        });

        it("should get when it doesn't exist", () => {
            doTest("interface Identifier { [keyName: string]; }", "any");
        });
    });

    describe(nameof<IndexSignatureDeclaration>(n => n.getReturnTypeNode), () => {
        function doTest(code: string, expectedName: string | undefined) {
            const { firstIndexSignature } = getFirstIndexSignatureWithInfo(code);
            const returnTypeNode = firstIndexSignature.getReturnTypeNode();
            expect(returnTypeNode?.getText()).to.equal(expectedName);
        }

        it("should get when exists", () => {
            doTest("interface Identifier { [keyName: string]: number; }", "number");
        });

        it("should be undefined when not exists", () => {
            doTest("interface Identifier { [keyName: string]; }", undefined);
        });
    });

    describe(nameof<IndexSignatureDeclaration>(n => n.setReturnType), () => {
        function doTest(code: string, textOrWriterFunction: string | WriterFunction, expectedCode: string) {
            const { firstIndexSignature, sourceFile } = getFirstIndexSignatureWithInfo(code);
            firstIndexSignature.setReturnType(textOrWriterFunction);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should set with a string", () => {
            doTest("interface Identifier { [keyName: string]: number; }", "Date", "interface Identifier { [keyName: string]: Date; }");
        });

        it("should set with a writer function", () => {
            doTest("interface Identifier { [keyName: string]: number; }", writer => writer.write("Date"), "interface Identifier { [keyName: string]: Date; }");
        });

        it("should set when it doesn't exist", () => {
            doTest("interface Identifier { [keyName: string]; }", "Date", "interface Identifier { [keyName: string]: Date; }");
        });

        it("should remove when specifying an empty string", () => {
            doTest("interface Identifier { [keyName: string]: number; }", "", "interface Identifier { [keyName: string]; }");
        });
    });

    describe(nameof<IndexSignatureDeclaration>(n => n.setIsReadonly), () => {
        function doTest(code: string, value: boolean, expectedCode: string) {
            const { firstIndexSignature, sourceFile } = getFirstIndexSignatureWithInfo(code);
            firstIndexSignature.setIsReadonly(value);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should set as readonly", () => {
            doTest("interface Identifier { [keyName: string]: number; }", true, "interface Identifier { readonly [keyName: string]: number; }");
        });

        it("should set as not readonly", () => {
            doTest("interface Identifier { readonly [keyName: string]: number; }", false, "interface Identifier { [keyName: string]: number; }");
        });
    });

    describe(nameof<IndexSignatureDeclaration>(n => n.remove), () => {
        function doTest(code: string, indexToRemove: number, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<InterfaceDeclaration>(code);
            firstChild.getIndexSignatures()[indexToRemove].remove();
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should remove when it's the only member", () => {
            doTest("interface Identifier {\n    [key: string]: string;\n}", 0, "interface Identifier {\n}");
        });

        it("should remove when it's the first member", () => {
            doTest("interface Identifier {\n    [key: string]: string;\n    prop: string;\n    [key: string]: string;\n}", 0,
                "interface Identifier {\n    prop: string;\n    [key: string]: string;\n}");
        });

        it("should remove when it's the middle member", () => {
            doTest("interface Identifier {\n    [key: string]: string;\n    [key2: number]: number;\n    [key3: number]: Date;\n}", 1,
                "interface Identifier {\n    [key: string]: string;\n    [key3: number]: Date;\n}");
        });

        it("should remove when it's the last member", () => {
            doTest("interface Identifier {\n    [key: string]: string;\n    [key2: number]: number;\n}", 1,
                "interface Identifier {\n    [key: string]: string;\n}");
        });

        it("should only remove the new signature specified", () => {
            doTest("interface Identifier {\n    [key: string]: string;\n    [key2: number]: string;\n    [key3: number]: Date;\n}", 1,
                "interface Identifier {\n    [key: string]: string;\n    [key3: number]: Date;\n}");
        });
    });

    describe(nameof<IndexSignatureDeclaration>(n => n.set), () => {
        function doTest(code: string, structure: Partial<IndexSignatureDeclarationStructure>, expectedCode: string) {
            const { firstIndexSignature, sourceFile } = getFirstIndexSignatureWithInfo(code);
            firstIndexSignature.set(structure);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should not change when nothing is set", () => {
            doTest("interface Identifier { [key: string]: number; }", {}, "interface Identifier { [key: string]: number; }");
        });

        it("should change when setting", () => {
            const allProps: OptionalKindAndTrivia<MakeRequired<IndexSignatureDeclarationStructure>> = {
                docs: [{ description: "Desc" }],
                keyName: "newKeyName",
                keyType: "number",
                returnType: "Date",
                isReadonly: true
            };
            doTest("interface Identifier {\n    [key: string]: SomeReference;\n}", allProps,
                "interface Identifier {\n    /** Desc */\n    readonly [newKeyName: number]: Date;\n}");
        });

        it("should change the return type when using a writer", () => {
            doTest("interface Identifier { [key: string]: number; }", { returnType: writer => writer.write("string") },
                "interface Identifier { [key: string]: string; }");
        });
    });

    describe(nameof<IndexSignatureDeclaration>(n => n.getStructure), () => {
        function doTest(code: string, expectedStructure: OptionalTrivia<MakeRequired<IndexSignatureDeclarationStructure>>) {
            const { firstIndexSignature } = getFirstIndexSignatureWithInfo(code);
            const structure = firstIndexSignature.getStructure();
            expect(structure).to.deep.equal(fillStructures.indexSignature(expectedStructure));
        }

        it("should get when not has anything", () => {
            // use type aliases to make sure the node text and not the type text is returned
            doTest("interface Identifier { [key: OtherType]: MyType; } type OtherType = number; type MyType = string;", {
                kind: StructureKind.IndexSignature,
                isReadonly: false,
                keyName: "key",
                keyType: "OtherType",
                docs: [],
                returnType: "MyType"
            });
        });

        it("should get when doesn't have return type", () => {
            doTest("interface Identifier { [key: string]; }", {
                kind: StructureKind.IndexSignature,
                isReadonly: false,
                keyName: "key",
                keyType: "string",
                docs: [],
                returnType: undefined
            });
        });

        it("should get when has everything", () => {
            const code = `
interface Identifier {
    /** Test */
    readonly [key: string]: number;
}`;
            doTest(code, {
                kind: StructureKind.IndexSignature,
                isReadonly: true,
                keyName: "key",
                keyType: "string",
                docs: [{ description: "Test" }],
                returnType: "number"
            });
        });
    });
});
