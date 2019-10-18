import { expect } from "chai";
import { CodeBlockWriter } from "../../codeBlockWriter";
import { WriterUtils } from "../../utils";

describe(nameof(WriterUtils), () => {
    describe(nameof(WriterUtils.getLastCharactersToPos), () => {
        it("should get the last characters to the provided position when at the start", () => {
            const writer = new CodeBlockWriter();
            writer.write("0123");
            expect(WriterUtils.getLastCharactersToPos(writer, 0)).to.equal("0123");
        });

        it("should get the last characters to the provided position when in the middle", () => {
            const writer = new CodeBlockWriter();
            writer.write("0123");
            expect(WriterUtils.getLastCharactersToPos(writer, 2)).to.equal("23");
        });

        it("should get the last characters to the provided position when at the end", () => {
            const writer = new CodeBlockWriter();
            writer.write("0123");
            expect(WriterUtils.getLastCharactersToPos(writer, 4)).to.equal("");
        });
    });
});
