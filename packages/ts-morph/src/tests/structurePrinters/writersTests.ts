import { expect } from "chai";
import { CodeBlockWriter } from "../../codeBlockWriter";
import { TypeElementMemberedNodeStructure } from "../../structures";
import { WriterFunction } from "../../types";
import { Writers } from "../../structurePrinters/Writers";

describe(nameof<Writers>(), () => {
    function getWriter() {
        return new CodeBlockWriter();
    }

    function doWriterTest(action: (writer: CodeBlockWriter, writerFunctions: typeof Writers) => void, expected: string) {
        const writer = getWriter();
        action(writer, Writers);
        expect(writer.toString()).to.equal(expected);
    }

    describe(nameof(Writers.object), () => {
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

    describe(nameof(Writers.objectType), () => {
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

    describe(nameof(Writers.unionType), () => {
        it("should write when only specifying two types", () => {
            doWriterTest((writer, { unionType }) => unionType("C", "A")(writer), "C | A");
        });

        it("should write when specifying more than two types", () => {
            doWriterTest((writer, { unionType }) => unionType("C", "A", w => w.write("5"), 7)(writer), "C | A | 5 | 7");
        });
    });

    describe(nameof(Writers.intersectionType), () => {
        it("should write when only specifying two types", () => {
            doWriterTest((writer, { intersectionType }) => intersectionType("C", "A")(writer), "C & A");
        });

        it("should write when specifying more than two types", () => {
            doWriterTest((writer, { intersectionType }) => intersectionType("C", "A", w => w.write("5"), 7)(writer), "C & A & 5 & 7");
        });
    });

    describe(nameof(Writers.assertion), () => {
        it("should write when specifying writer functions", () => {
            doWriterTest((writer, { assertion }) => assertion(w => w.write("a"), w => w.write("b"))(writer), "a as b");
        });

        it("should write when specifying strings", () => {
            doWriterTest((writer, { assertion }) => assertion("a", "b")(writer), "a as b");
        });
    });

    describe(nameof(Writers.returnStatement), () => {
        it("should write when specifying some value", () => {
            doWriterTest((writer, { returnStatement }) => returnStatement("A")(writer), "return A;");
        });

        it("should write with hanging indentation when not using a block", () => {
            doWriterTest((writer, { returnStatement }) => returnStatement("A\n&& B")(writer), "return A\n    && B;");
        });

        it("should not write with hanging indentation when using a block", () => {
            doWriterTest(
                (writer, { returnStatement }) => returnStatement(() => writer.inlineBlock(() => writer.write("prop")))(writer),
                "return {\n    prop\n};"
            );
        });
    });
});
