import {expect} from "chai";
import {StatementedNode, NamespaceDeclaration} from "./../../../../compiler";
import {getInfoFromText} from "./../../testHelpers";

describe(nameof(StatementedNode), () => {
    describe(nameof<StatementedNode>(n => n.getNamespaces), () => {
        const {sourceFile} = getInfoFromText("namespace Identifier1 {}\nnamespace Identifier2 {}");
        const namespaces = sourceFile.getNamespaces();

        it("should have the expected number of namespaces", () => {
            expect(namespaces.length).to.equal(2);
        });

        it("should have correct type", () => {
            expect(namespaces[0]).to.be.instanceOf(NamespaceDeclaration);
        });
    });

    describe(nameof<StatementedNode>(n => n.getNamespace), () => {
        const {sourceFile} = getInfoFromText("namespace Identifier1 {}\nnamespace Identifier2 {}");

        it("should get a namespace by a name", () => {
            expect(sourceFile.getNamespace("Identifier2")!.getName()).to.equal("Identifier2");
        });

        it("should get a namespace by a search function", () => {
            expect(sourceFile.getNamespace(c => c.getName() === "Identifier1")!.getName()).to.equal("Identifier1");
        });

        it("should return undefined when the namespace doesn't exist", () => {
            expect(sourceFile.getNamespace("asdf")).to.be.undefined;
        });
    });
});
