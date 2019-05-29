import { expect } from "chai";
import { CodeBlockWriter } from "../../codeBlockWriter";
import { TypeElementMemberedNodeStructure } from "../../structures";
import { WriterFunction } from "../../types";
import { WriterFunctions } from "../../structurePrinters/WriterFunctions";

describe(nameof<WriterFunctions>(), () => {
    function getWriter() {
        return new CodeBlockWriter();
    }

    function doWriterTest(action: (writer: CodeBlockWriter, writerFunctions: typeof WriterFunctions) => void, expected: string) {
        const writer = getWriter();
        action(writer, WriterFunctions);
        expect(writer.toString()).to.equal(expected);
    }

    describe(nameof(WriterFunctions.object), () => {
        function doTest(obj: { [key: string]: string | number | WriterFunction | undefined; }, expected: string) {
            doWriterTest((writer, { object }) => object(obj)(writer), expected);
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

    describe(nameof(WriterFunctions.objectType), () => {
        function doTest(obj: TypeElementMemberedNodeStructure, expected: string) {
            doWriterTest((writer, { objectType }) => objectType(obj)(writer), expected);
        }

        it("should write an object type with only properties", () => {
            doTest({
                properties: [{ name: "prop" }]
            }, `{
    prop;
}`);
        });

        it("should write an object type with only methods", () => {
            doTest({
                methods: [{ name: "method" }]
            }, `{
    method();
}`);
        });

        it("should write an object type with only call signatures", () => {
            doTest({
                callSignatures: [{}]
            }, `{
    (): void;
}`);
        });

        it("should write an object type with only construct signatures", () => {
            doTest({
                constructSignatures: [{}]
            }, `{
    new();
}`);
        });

        it("should write an object type with only index signatures", () => {
            doTest({
                indexSignatures: [{}]
            }, `{
    [key: string];
}`);
        });

        it("should write an object type with everything", () => {
            const structure: MakeRequired<TypeElementMemberedNodeStructure> = {
                callSignatures: [{}],
                constructSignatures: [{}],
                indexSignatures: [{}],
                properties: [{ name: "prop" }],
                methods: [{ name: "method" }]
            };

            doTest(structure, `{
    (): void;
    new();
    [key: string];
    prop;
    method();
}`);
        });

        it("should write an object without keys on the same line", () => {
            doTest({}, `{}`);
        });
    });

    describe(nameof(WriterFunctions.unionType), () => {
        it("should write when only specifying two types", () => {
            doWriterTest((writer, { unionType }) => unionType("C", "A")(writer), "C | A");
        });

        it("should write when specifying more than two types", () => {
            doWriterTest((writer, { unionType }) => unionType("C", "A", w => w.write("5"), 7)(writer), "C | A | 5 | 7");
        });
    });

    describe(nameof(WriterFunctions.intersectionType), () => {
        it("should write when only specifying two types", () => {
            doWriterTest((writer, { intersectionType }) => intersectionType("C", "A")(writer), "C & A");
        });

        it("should write when specifying more than two types", () => {
            doWriterTest((writer, { intersectionType }) => intersectionType("C", "A", w => w.write("5"), 7)(writer), "C & A & 5 & 7");
        });
    });

    describe(nameof(WriterFunctions.returnStatement), () => {
        it("should write when specifying some value", () => {
            doWriterTest((writer, { returnStatement }) => returnStatement("A")(writer), "return A;");
        });
    });
});
