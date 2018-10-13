import { expect } from "chai";
import { CodeBlockWriter } from "../../codeBlockWriter";
import { WriterFunction } from "../../types";
import { WriterFunctions } from "../../utils";

describe(nameof(WriterFunctions), () => {
    function getWriter() {
        return new CodeBlockWriter();
    }

    function doWriterTest(action: (writer: CodeBlockWriter) => void, expected: string) {
        const writer = getWriter();
        action(writer);
        expect(writer.toString()).to.equal(expected);
    }

    describe(nameof(WriterFunctions.object), () => {
        function doTest(obj: { [key: string]: string | number | WriterFunction | undefined; }, expected: string) {
            doWriterTest(writer => WriterFunctions.object(obj)(writer), expected);
        }

        it("should write an object with keys", () => {
            doTest({
                key1: "'testing'",
                key2: 5,
                key3: undefined,
                key4: writer => writer.write("6"),
                key5: "undefined"
            }, `{
    key1: 'testing',
    key2: 5,
    key3,
    key4: 6,
    key5: undefined
}`);
        });

        it("should write an object without keys on the same line", () => {
            doTest({}, `{}`);
        });
    });
});
