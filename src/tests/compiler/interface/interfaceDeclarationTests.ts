import {expect} from "chai";
import {InterfaceDeclaration, MethodSignature, PropertySignature} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(InterfaceDeclaration), () => {
    describe(nameof<InterfaceDeclaration>(d => d.getMethodSignatures), () => {
        describe("no methods", () => {
            it("should not have any methods", () => {
                const {firstChild} = getInfoFromText<InterfaceDeclaration>("interface Identifier {\n}\n");
                expect(firstChild.getMethodSignatures().length).to.equal(0);
            });
        });

        describe("has methods", () => {
            const {firstChild} = getInfoFromText<InterfaceDeclaration>("interface Identifier {\n    prop: string;\n    method1():void;\n    method2():string;\n}\n");

            it("should get the right number of methods", () => {
                expect(firstChild.getMethodSignatures().length).to.equal(2);
            });

            it("should get a method of the right instance of", () => {
                expect(firstChild.getMethodSignatures()[0]).to.be.instanceOf(MethodSignature);
            });
        });
    });

    describe(nameof<InterfaceDeclaration>(d => d.getPropertySignatures), () => {
        describe("no properties", () => {
            it("should not have any properties", () => {
                const {firstChild} = getInfoFromText<InterfaceDeclaration>("interface Identifier {\n}\n");
                expect(firstChild.getPropertySignatures().length).to.equal(0);
            });
        });

        describe("has properties", () => {
            const {firstChild} = getInfoFromText<InterfaceDeclaration>("interface Identifier {\nprop: string;\nprop2: number;method1(): void;\n}\n");

            it("should get the right number of properties", () => {
                expect(firstChild.getPropertySignatures().length).to.equal(2);
            });

            it("should get a property of the right instance of", () => {
                expect(firstChild.getPropertySignatures()[0]).to.be.instanceOf(PropertySignature);
            });
        });
    });
});
