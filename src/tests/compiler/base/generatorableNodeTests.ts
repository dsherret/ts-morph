import {expect} from "chai";
import {GeneratorableNode, FunctionDeclaration, ClassDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(GeneratorableNode), () => {
    const {sourceFile: mainSourceFile} = getInfoFromText("function* Identifier() {}\nfunction Identifier2() {}");
    const generatorFunc = mainSourceFile.getFunctions()[0];
    const func  = mainSourceFile.getFunctions()[1];

    describe(nameof<GeneratorableNode>(n => n.isGenerator), () => {
        it("should be a generator when so", () => {
            expect(generatorFunc.isGenerator()).to.be.true;
        });

        it("should not be generator when not so", () => {
            expect(func.isGenerator()).to.be.false;
        });
    });

    describe(nameof<GeneratorableNode>(n => n.getAsteriskToken), () => {
        it("should have an asterisk token when a generator", () => {
            expect(generatorFunc.getAsteriskToken()!.getText()).to.equal("*");
        });

        it("should not have a async keyword when not async", () => {
            expect(func.getAsteriskToken()).to.be.undefined;
        });
    });

    describe(nameof<GeneratorableNode>(n => n.setIsGenerator), () => {
        describe("Functions", () => {
            it("should set as generator when not a generator", () => {
                const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>("function Identifier() {}");
                firstChild.setIsGenerator(true);
                expect(sourceFile.getText()).to.equal("function* Identifier() {}");
            });

            it("should set as not a generator when a generator", () => {
                const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>("function* Identifier() {}");
                firstChild.setIsGenerator(false);
                expect(sourceFile.getText()).to.equal("function Identifier() {}");
            });
        });

        describe("Methods", () => {
            it("should set as generator when not a generator", () => {
                const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>("class Identifier { public identifier() { } }");
                const method = firstChild.getInstanceMethods()[0];
                method.setIsGenerator(true);
                expect(sourceFile.getText()).to.equal("class Identifier { public *identifier() { } }");
            });

            it("should set as not a generator when a generator", () => {
                const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>("class Identifier { public *identifier() { } }");
                const method = firstChild.getInstanceMethods()[0];
                method.setIsGenerator(false);
                expect(sourceFile.getText()).to.equal("class Identifier { public identifier() { } }");
            });
        });
    });
});
