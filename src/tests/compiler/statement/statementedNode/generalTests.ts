import {expect} from "chai";
import {StatementedNode, ClassDeclaration, FunctionDeclaration, NamespaceDeclaration} from "./../../../../compiler";
import {getInfoFromText} from "./../../testHelpers";

describe(nameof(StatementedNode), () => {
    describe("getting a declaration within a namespace", () => {
        const {sourceFile} = getInfoFromText("namespace Namespace1 {\n    class Class1 {}\n}\n");
        const namespaceDeclaration = sourceFile.getNamespaces()[0];
        const classes = namespaceDeclaration.getClasses();

        it("should have the expected number of classes", () => {
            expect(classes.length).to.equal(1);
        });

        it("should have correct type", () => {
            expect(classes[0]).to.be.instanceOf(ClassDeclaration);
        });
    });

    it("should get items inside a namespace", () => {
        // only need to check for one kind in here
        const {firstChild} = getInfoFromText<NamespaceDeclaration>("namespace Identifier { function function1() {}\nfunction function2() {} }");
        const functions = firstChild.getFunctions();
        expect(functions.length).to.equal(2);
    });

    it("should get items inside a function", () => {
        // only need to check for one kind in here
        const {firstChild} = getInfoFromText<FunctionDeclaration>("function Identifier() { function function1() {}\nfunction function2() {} }");
        const functions = firstChild.getFunctions();
        expect(functions.length).to.equal(2);
    });
});
