import { expect } from "chai";
import { Project } from "../../Project";

describe("tests for issue #735", () => {
    it("should not error when removing namespace with preceeding comment", () => {
        const project = new Project({ useInMemoryFileSystem: true });
        const sourceFile = project.createSourceFile(
            "./sample.ts",
            "//  aaaa bbbb \n namespace Foo {\n\texport class Bar {\n \t\tconstructor(){}\n \t\tsayHello(){return 'hello';}\n\t}\n}\n"
        );

        sourceFile.getNamespaces().forEach(ns => ns.unwrap());

        expect(sourceFile.getFullText()).to.equal("//  aaaa bbbb \n export class Bar {\n\tconstructor(){}\n\tsayHello(){return 'hello';}\n}\n");
    });
});
