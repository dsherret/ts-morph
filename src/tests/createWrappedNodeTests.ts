import * as path from "path";
import {expect} from "chai";
import * as ts from "typescript";
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
        const node = createWrappedNode(child, compilerSourceFile);
        const sourceFile = node.getSourceFile();

        // testing for something arbitrary
        expect(sourceFile.getClasses().length).to.equal(1);
    });

    it("should get a wrapped node when also providing the wrapped source file", () => {
        const sourceFile = createWrappedNode(ts.createSourceFile("file.ts", "class MyClass {}", ts.ScriptTarget.ES2016, true)) as SourceFile;
        const firstClass = sourceFile.getClasses()[0];
        const node = createWrappedNode(firstClass.compilerNode, sourceFile);

        expect(node).to.equal(firstClass);
        expect(node.getSourceFile()).to.equal(sourceFile);
    });
});
