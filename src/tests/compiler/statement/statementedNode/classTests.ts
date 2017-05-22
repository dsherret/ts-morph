import {expect} from "chai";
import {StatementedNode, ClassDeclaration} from "./../../../../compiler";
import {getInfoFromText} from "./../../testHelpers";

describe(nameof(StatementedNode), () => {
    describe(nameof<StatementedNode>(n => n.getClasses), () => {
        const {sourceFile} = getInfoFromText("class Class1 {}\nclass Class2 { prop: string; }");
        const classes = sourceFile.getClasses();

        it("should have the expected number of classes", () => {
            expect(classes.length).to.equal(2);
        });

        it("should have correct type", () => {
            expect(classes[0]).to.be.instanceOf(ClassDeclaration);
        });
    });

    describe(nameof<StatementedNode>(n => n.getClass), () => {
        const {sourceFile} = getInfoFromText("class Identifier1 {}\nclass Identifier2 { prop: string; }");

        it("should get a class by a name", () => {
            expect(sourceFile.getClass("Identifier2")!.getName()).to.equal("Identifier2");
        });

        it("should get a class by a search function", () => {
            expect(sourceFile.getClass(c => c.getName() === "Identifier1")!.getName()).to.equal("Identifier1");
        });

        it("should return undefined when the class doesn't exist", () => {
            expect(sourceFile.getClass("asdf")).to.be.undefined;
        });
    });
});
