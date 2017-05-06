import {expect} from "chai";
import {AsyncableNode, FunctionDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(AsyncableNode), () => {
    const {sourceFile: mainSourceFile} = getInfoFromText("async function Identifier() {}\nfunction Identifier2() {}");
    const asyncFunc = mainSourceFile.getFunctions()[0];
    const nonAsyncFunc  = mainSourceFile.getFunctions()[1];

    describe(nameof<AsyncableNode>(n => n.isAsync), () => {
        it("should be async when async", () => {
            expect(asyncFunc.isAsync()).to.be.true;
        });

        it("should not be async when not async", () => {
            expect(nonAsyncFunc.isAsync()).to.be.false;
        });
    });

    describe(nameof<AsyncableNode>(n => n.getAsyncKeyword), () => {
        it("should have a async keyword when async", () => {
            expect(asyncFunc.getAsyncKeyword()!.getText()).to.equal("async");
        });

        it("should not have a async keyword when not async", () => {
            expect(nonAsyncFunc.getAsyncKeyword()).to.be.undefined;
        });
    });

    describe(nameof<AsyncableNode>(n => n.setIsAsync), () => {
        it("should set as async when not async", () => {
            const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>("function Identifier() {}");
            firstChild.setIsAsync(true);
            expect(sourceFile.getText()).to.equal("async function Identifier() {}");
        });

        it("should set as not async when async", () => {
            const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>("async function Identifier() {}");
            firstChild.setIsAsync(false);
            expect(sourceFile.getText()).to.equal("function Identifier() {}");
        });
    });
});
