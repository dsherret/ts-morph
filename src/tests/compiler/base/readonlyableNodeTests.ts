import {expect} from "chai";
import {ClassDeclaration, ReadonlyableNode, PropertyDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ReadonlyableNode), () => {
    function getInfoWithFirstPropertyFromText(text: string) {
        const result = getInfoFromText<ClassDeclaration>(text);
        return {...result, firstProperty: result.firstChild.getInstanceProperties()[0] as PropertyDeclaration };
    }

    describe(nameof<ReadonlyableNode>(d => d.isReadonly), () => {
        it("should be readonly when readonly", () => {
            const {firstProperty} = getInfoWithFirstPropertyFromText("class MyClass {\nreadonly prop: string;}\n");
            expect(firstProperty.isReadonly()).to.be.true;
        });

        it("should not be readonly when not readonly", () => {
            const {firstProperty} = getInfoWithFirstPropertyFromText("class MyClass {\nprop: string;}\n");
            expect(firstProperty.isReadonly()).to.be.false;
        });
    });

    describe(nameof<ReadonlyableNode>(d => d.getReadonlyKeyword), () => {
        it("should be get the readonly keyword when readonly", () => {
            const {firstProperty} = getInfoWithFirstPropertyFromText("class MyClass {\nreadonly prop: string;}\n");
            expect(firstProperty.getReadonlyKeyword()!.getText()).to.equal("readonly");
        });

        it("should return undefined when not readonly", () => {
            const {firstProperty} = getInfoWithFirstPropertyFromText("class MyClass {\nprop: string;}\n");
            expect(firstProperty.getReadonlyKeyword()).to.be.undefined;
        });
    });

    describe(nameof<ReadonlyableNode>(n => n.setIsReadonly), () => {
        it("should set as readonly when not readonly", () => {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>("class MyClass { prop: string; }");
            (firstChild.getInstanceProperties()[0] as PropertyDeclaration).setIsReadonly(true);
            expect(sourceFile.getText()).to.equal("class MyClass { readonly prop: string; }");
        });

        it("should set as not readonly when readonly", () => {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>("class MyClass { readonly prop: string; }");
            (firstChild.getInstanceProperties()[0] as PropertyDeclaration).setIsReadonly(false);
            expect(sourceFile.getText()).to.equal("class MyClass { prop: string; }");
        });
    });
});
