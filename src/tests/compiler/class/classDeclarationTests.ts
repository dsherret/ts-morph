import {expect} from "chai";
import {ClassDeclaration, MethodDeclaration, PropertyDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ClassDeclaration), () => {
    describe(nameof<ClassDeclaration>(d => d.getMethodDeclarations), () => {
        describe("no methods", () => {
            it("should not have any methods", () => {
                const {firstChild} = getInfoFromText<ClassDeclaration>("class MyClass {\n}\n");
                expect(firstChild.getMethodDeclarations().length).to.equal(0);
            });
        });

        describe("has methods", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("class MyClass {\n    prop: string;\n    method1() {}\n    method2() {}\n}\n");

            it("should get the right number of methods", () => {
                expect(firstChild.getMethodDeclarations().length).to.equal(2);
            });

            it("should get a method of the right instance of", () => {
                expect(firstChild.getMethodDeclarations()[0]).to.be.instanceOf(MethodDeclaration);
            });
        });
    });

    describe(nameof<ClassDeclaration>(d => d.getPropertyDeclarations), () => {
        describe("no properties", () => {
            it("should not have any properties", () => {
                const {firstChild} = getInfoFromText<ClassDeclaration>("class MyClass {\n}\n");
                expect(firstChild.getPropertyDeclarations().length).to.equal(0);
            });
        });

        describe("has properties", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("class MyClass {\nprop: string;\nprop2: number;method1() {}\n}\n");

            it("should get the right number of properties", () => {
                expect(firstChild.getPropertyDeclarations().length).to.equal(2);
            });

            it("should get a property of the right instance of", () => {
                expect(firstChild.getPropertyDeclarations()[0]).to.be.instanceOf(PropertyDeclaration);
            });
        });
    });
});
