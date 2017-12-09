import * as path from "path";
import {expect} from "chai";
import * as ts from "typescript";
import {TsSimpleAst} from "./../TsSimpleAst";
import {createWrappedNode} from "./../createWrappedNode";
import {SourceFile} from "./../compiler";
import * as errors from "./../errors";
import * as testHelpers from "./testHelpers";

describe(nameof(createWrappedNode), () => {
    it("should throw an exception if passing in a node not created with setParentNodes set to true.", () => {
        const sourceFile = ts.createSourceFile("file.ts", "class MyClass {}", ts.ScriptTarget.ES2016, false);
        let child: ts.Node;
        ts.forEachChild(sourceFile, node => child = node);
        expect(child!.parent).to.equal(undefined);
        expect(() => {
            createWrappedNode(child);
        }).to.throw(errors.InvalidOperationError, "Please ensure the node was created from a source file with 'setParentNodes' set to 'true'.");
    });

    it("should get a wrapped node", () => {
        const compilerSourceFile = ts.createSourceFile("file.ts", "class MyClass {}", ts.ScriptTarget.ES2016, true);
        const child = compilerSourceFile.getChildren()[0];
        const node = createWrappedNode(child);
        const sourceFile = node.getSourceFile();

        expect(node.getKind()).to.equal(ts.SyntaxKind.SyntaxList);
        expect(sourceFile.getClasses().length).to.equal(1);
    });

    it("should get a wrapped node when also providing the source file", () => {
        const compilerSourceFile = ts.createSourceFile("file.ts", "class MyClass {}", ts.ScriptTarget.ES2016, true);
        const child = compilerSourceFile.getChildren()[0];
        const node = createWrappedNode(child, { sourceFile: compilerSourceFile });
        const sourceFile = node.getSourceFile();

        // testing for something arbitrary
        expect(sourceFile.getClasses().length).to.equal(1);
    });

    it("should be able to provide compiler options", () => {
        const compilerSourceFile = ts.createSourceFile("file.ts", "class MyClass {}", ts.ScriptTarget.ES2016, true);
        const child = compilerSourceFile.getChildren()[0];
        const compilerOptions = { target: ts.ScriptTarget.ES2016 };
        const node = createWrappedNode(child, { compilerOptions });

        expect(node.global.compilerOptions).to.deep.equal(compilerOptions);
    });

    it("should be able to provide a type checker", () => {
        const ast = new TsSimpleAst();
        const sourceFile = ast.addSourceFileFromText("test.ts", "let s = '';");
        const typeChecker = ast.getTypeChecker();
        const wrappedSourceFile = createWrappedNode(sourceFile.compilerNode, { typeChecker: typeChecker.compilerObject }) as SourceFile;

        expect(wrappedSourceFile.getVariableDeclarationOrThrow("s").getType().getText()).to.equal("string");
    });

    it("should throw when getting the type and no type checker was provided", () => {
        const compilerSourceFile = ts.createSourceFile("file.ts", "let s = '';", ts.ScriptTarget.ES2016, true);
        const wrappedSourceFile = createWrappedNode(compilerSourceFile) as SourceFile;
        const expectedMessage = "A type checker is required for this operation. This might occur when manipulating or " +
            "getting type information from a node that was not added to a TsSimpleAst object and created via createWrappedNode. " +
            "Please submit a bug report if you don't believe a type checker should be required for this operation.";

        expect(() => wrappedSourceFile.getVariableDeclarationOrThrow("s").getType()).to.throw(errors.InvalidOperationError, expectedMessage);
    });
});
