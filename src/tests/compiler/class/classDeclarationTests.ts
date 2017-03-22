import {expect} from "chai";
import {ClassDeclaration, MethodDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ClassDeclaration), () => {
    describe(nameof<ClassDeclaration>(d => d.getMethodDeclarations), () => {
        describe("no methods", () => {
            it("should not have any methods", () => {
                const {firstChild} = getInfoFromText<ClassDeclaration>("class MyClass {\n}\n");
                expect(firstChild.getMethodDeclarations().length).to.equal(0);
            });
        });

        describe("methods", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("class MyClass {\n    prop: string;\n    method1() {}\n    method2() {}\n}\n");

            it("should get the right number of methods", () => {
                expect(firstChild.getMethodDeclarations().length).to.equal(2);
            });

            it("should get a method of the right instance of", () => {
                expect(firstChild.getMethodDeclarations()[0]).to.be.instanceOf(MethodDeclaration);
            });
        });
    });
});
