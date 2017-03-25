import {expect} from "chai";
import {PropertyDeclaration, ClassDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(PropertyDeclaration), () => {
    function getInfoWithFirstPropertyFromText(text: string) {
        const result = getInfoFromText<ClassDeclaration>(text);
        return {...result, firstProperty: result.firstChild.getPropertyDeclarations()[0] };
    }

    describe(nameof<PropertyDeclaration>(d => d.isOptional), () => {
        it("should be optional when optional", () => {
            const {firstProperty} = getInfoWithFirstPropertyFromText("class MyClass {\nprop?: string;}\n");
            expect(firstProperty.isOptional()).to.be.true;
        });

        it("should not be optional when not optional", () => {
            const {firstProperty} = getInfoWithFirstPropertyFromText("class MyClass {\nprop: string;}\n");
            expect(firstProperty.isOptional()).to.be.false;
        });
    });

    describe(nameof<PropertyDeclaration>(d => d.isReadonly), () => {
        it("should be readonly when readonly", () => {
            const {firstProperty} = getInfoWithFirstPropertyFromText("class MyClass {\nreadonly prop: string;}\n");
            expect(firstProperty.isReadonly()).to.be.true;
        });

        it("should not be readonly when not readonly", () => {
            const {firstProperty} = getInfoWithFirstPropertyFromText("class MyClass {\nprop: string;}\n");
            expect(firstProperty.isReadonly()).to.be.false;
        });
    });

    describe(nameof<PropertyDeclaration>(d => d.getReadonlyKeyword), () => {
        it("should be get the readonly keyword when readonly", () => {
            const {firstProperty} = getInfoWithFirstPropertyFromText("class MyClass {\nreadonly prop: string;}\n");
            expect(firstProperty.getReadonlyKeyword()!.getText()).to.equal("readonly");
        });

        it("should return undefined when not readonly", () => {
            const {firstProperty} = getInfoWithFirstPropertyFromText("class MyClass {\nprop: string;}\n");
            expect(firstProperty.getReadonlyKeyword()).to.be.undefined;
        });
    });
});
