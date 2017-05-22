import {expect} from "chai";
import {StatementedNode, TypeAliasDeclaration} from "./../../../../compiler";
import {getInfoFromText} from "./../../testHelpers";

describe(nameof(StatementedNode), () => {
    describe(nameof<StatementedNode>(n => n.getTypeAliases), () => {
        const {sourceFile} = getInfoFromText("type Identifier1 = string;\ntype Identifier2 = number;");
        const typeAliases = sourceFile.getTypeAliases();

        it("should have the expected number of typeAliases", () => {
            expect(typeAliases.length).to.equal(2);
        });

        it("should have correct type", () => {
            expect(typeAliases[0]).to.be.instanceOf(TypeAliasDeclaration);
        });
    });

    describe(nameof<StatementedNode>(n => n.getTypeAlias), () => {
        const {sourceFile} = getInfoFromText("type Identifier1 = string;\ntype Identifier2 = number;");

        it("should get a type alias by a name", () => {
            expect(sourceFile.getTypeAlias("Identifier2")!.getName()).to.equal("Identifier2");
        });

        it("should get a type alias by a search function", () => {
            expect(sourceFile.getTypeAlias(c => c.getName() === "Identifier1")!.getName()).to.equal("Identifier1");
        });

        it("should return undefined when the type alias doesn't exist", () => {
            expect(sourceFile.getTypeAlias("asdf")).to.be.undefined;
        });
    });
});
