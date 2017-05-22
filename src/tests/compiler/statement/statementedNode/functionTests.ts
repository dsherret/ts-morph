import {expect} from "chai";
import {StatementedNode, FunctionDeclaration} from "./../../../../compiler";
import {getInfoFromText} from "./../../testHelpers";

describe(nameof(StatementedNode), () => {
    describe(nameof<StatementedNode>(n => n.getFunctions), () => {
        const {sourceFile} = getInfoFromText("function Identifier1() {}\nfunction Identifier2() {}");
        const functions = sourceFile.getFunctions();

        it("should have the expected number of functions", () => {
            expect(functions.length).to.equal(2);
        });

        it("should have correct type", () => {
            expect(functions[0]).to.be.instanceOf(FunctionDeclaration);
        });
    });

    describe(nameof<StatementedNode>(n => n.getFunction), () => {
        const {sourceFile} = getInfoFromText("function Identifier1() {}\nfunction Identifier2() {}");

        it("should get a function by a name", () => {
            expect(sourceFile.getFunction("Identifier2")!.getName()).to.equal("Identifier2");
        });

        it("should get a function by a search function", () => {
            expect(sourceFile.getFunction(c => c.getName() === "Identifier1")!.getName()).to.equal("Identifier1");
        });

        it("should return undefined when the function doesn't exist", () => {
            expect(sourceFile.getFunction("asdf")).to.be.undefined;
        });
    });
});
