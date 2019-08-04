import { expect } from "chai";
import { AwaitableNode, ForOfStatement } from "../../../../compiler";
import { AwaitableNodeStructure } from "../../../../structures";
import { getInfoFromText } from "../../testHelpers";
describe(nameof(AwaitableNode), () => {
    const awaitForOfText = "for await (const x of [Promise.resolve(1)]) {}";
    const forOfText = "for (const x of [Promise.resolve(1)]) {}";
    const { sourceFile: mainSourceFile } = getInfoFromText(`${awaitForOfText}\n${forOfText}`);
    const awaitForOf = mainSourceFile.getStatements()[0] as ForOfStatement;
    const forOf = mainSourceFile.getStatements()[1] as ForOfStatement;

    describe(nameof<AwaitableNode>(n => n.isAwaited), () => {
        it("should be a await when so", () => {
            expect(awaitForOf.isAwaited()).to.be.true;
        });

        it("should not be await when not so", () => {
            expect(forOf.isAwaited()).to.be.false;
        });
    });

    describe(nameof<AwaitableNode>(n => n.getAwaitKeyword), () => {
        it("should have an await token when awaited", () => {
            expect(awaitForOf.getAwaitKeyword()!.getText()).to.equal("await");
        });

        it("should not have an await keyword when not awaited", () => {
            expect(forOf.getAwaitKeyword()).to.be.undefined;
        });
    });

    describe(nameof<AwaitableNode>(n => n.getAwaitKeywordOrThrow), () => {
        it("should have an await token when awaited", () => {
            expect(awaitForOf.getAwaitKeywordOrThrow().getText()).to.equal("await");
        });

        it("should not have an await keyword when not awaited", () => {
            expect(() => forOf.getAwaitKeywordOrThrow()).to.throw();
        });
    });

    describe(nameof<AwaitableNode>(n => n.setIsAwaited), () => {
        describe("For of", () => {
            it("should set as await when not a await", () => {
                const { firstChild, sourceFile } = getInfoFromText<ForOfStatement>(forOfText);
                firstChild.setIsAwaited(true);
                expect(sourceFile.getText()).to.equal(awaitForOfText);
            });

            it("should set as not a await when a await", () => {
                const { firstChild, sourceFile } = getInfoFromText<ForOfStatement>(awaitForOfText);
                firstChild.setIsAwaited(false);
                expect(sourceFile.getText()).to.equal(forOfText);
            });

            it("should not change the await when already that value", () => {
                const { firstChild, sourceFile } = getInfoFromText<ForOfStatement>(awaitForOfText);
                firstChild.setIsAwaited(true);
                expect(sourceFile.getText()).to.equal(awaitForOfText);
            });

            // Well, sort of properly - it maintains there is no space before the first parens.
            it("should handle for spacing properly when adding await", () => {
                const { firstChild, sourceFile } = getInfoFromText<ForOfStatement>("for(const x of [Promise.resolve(1)]) {}");
                firstChild.setIsAwaited(true);
                expect(sourceFile.getText()).to.equal("for await(const x of [Promise.resolve(1)]) {}");
            });

            it("should handle for spacing properly when removing await", () => {
                const { firstChild, sourceFile } = getInfoFromText<ForOfStatement>("for await(const x of [Promise.resolve(1)]) {}");
                firstChild.setIsAwaited(false);
                expect(sourceFile.getText()).to.equal("for(const x of [Promise.resolve(1)]) {}");
            });
        });
    });

    describe("fill", () => {
        function doTest(startCode: string, structure: AwaitableNodeStructure, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ForOfStatement>(startCode);
            (firstChild as any).set(structure); // nothing is using this yet
            expect(firstChild.getText()).to.equal(expectedCode);
        }

        it("should not modify anything if the structure doesn't change anything", () => {
            doTest(forOfText, {}, forOfText);
        });

        it("should not modify anything if the structure doesn't change anything and the node has everything set", () => {
            doTest(awaitForOfText, {}, awaitForOfText);
        });

        it("should modify when setting as await", () => {
            doTest(forOfText, { isAwaited: true }, awaitForOfText);
        });
    });
});
