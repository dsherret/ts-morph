import {expect} from "chai";
import {StatementedNode, InterfaceDeclaration} from "./../../../../compiler";
import {getInfoFromText} from "./../../testHelpers";

describe(nameof(StatementedNode), () => {
    describe(nameof<StatementedNode>(n => n.getInterfaces), () => {
        const {sourceFile} = getInfoFromText("interface Identifier1 {}\ninterface Identifier2 {}");
        const interfaces = sourceFile.getInterfaces();

        it("should have the expected number of interfaces", () => {
            expect(interfaces.length).to.equal(2);
        });

        it("should have correct type", () => {
            expect(interfaces[0]).to.be.instanceOf(InterfaceDeclaration);
        });
    });

    describe(nameof<StatementedNode>(n => n.getInterface), () => {
        const {sourceFile} = getInfoFromText("interface Identifier1 {}\ninterface Identifier2 {}");

        it("should get an interface by a name", () => {
            expect(sourceFile.getInterface("Identifier2")!.getName()).to.equal("Identifier2");
        });

        it("should get a interface by a search function", () => {
            expect(sourceFile.getInterface(c => c.getName() === "Identifier1")!.getName()).to.equal("Identifier1");
        });

        it("should return undefined when the interface doesn't exist", () => {
            expect(sourceFile.getInterface("asdf")).to.be.undefined;
        });
    });
});
