import { expect } from "chai";
import { ClassDeclaration, FunctionDeclaration, NamespaceDeclaration, StatementedNode } from "../../../../../compiler";
import { getInfoFromText } from "../../../testHelpers";

// todo: make tests in other files reusable for StatementedNode. Then retest everything within namespaces and functions.

describe(nameof(StatementedNode), () => {
    describe("getting a declaration within a namespace", () => {
        const { firstChild } = getInfoFromText<NamespaceDeclaration>("namespace Namespace1 {\n    class Class1 {}\n}\n");
        const classes = firstChild.getClasses();

        it("should have the expected number of classes", () => {
            expect(classes.length).to.equal(1);
        });

        it("should have correct type", () => {
            expect(classes[0]).to.be.instanceOf(ClassDeclaration);
        });
    });

    describe("getting a declaration within a namespace with dot tokens", () => {
        const { firstChild } = getInfoFromText<NamespaceDeclaration>("namespace Namespace1.Namespace2.Namespace3 { class MyClass {} }\n");
        const classes = firstChild.getClasses();

        it("should have the expected number of classes", () => {
            expect(classes.length).to.equal(1);
        });
    });

    it("should get items inside a namespace", () => {
        // only need to check for one kind in here
        const { firstChild } = getInfoFromText<NamespaceDeclaration>("namespace Identifier { function function1() {}\nfunction function2() {} }");
        const functions = firstChild.getFunctions();
        expect(functions.length).to.equal(2);
    });

    it("should get items inside a function", () => {
        // only need to check for one kind in here
        const { firstChild } = getInfoFromText<FunctionDeclaration>("function Identifier() { function function1() {}\nfunction function2() {} }");
        const functions = firstChild.getFunctions();
        expect(functions.length).to.equal(2);
    });
});
