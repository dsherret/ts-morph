import { expect } from "chai";
import { FileTextChanges } from "../../../../compiler";
import * as errors from "../../../../errors";
import { Project } from "../../../../Project";

describe(nameof(FileTextChanges), () => {
    describe(nameof<FileTextChanges>(a => a.applyChanges), () => {
        function setup() {
            const project = new Project({ useVirtualFileSystem: true });
            project.createSourceFile("test.ts", "const t; const u;");
            return project;
        }

        it("should throw if a file text change instruct to create a new file that already exists", () => {
            const project = setup();
            const change = new FileTextChanges(project._context, {
                fileName: "test.ts",
                isNewFile: true,
                textChanges: [{ newText: "new text", span: { start: 0, length: 3 } }]
            });
            expect(() => change.applyChanges()).to.throw(errors.InvalidOperationError);
        });

        it("should not throw if a file text change instruct to create a new file that already exists and the overwrite option is provided", () => {
            const project = setup();
            const change = new FileTextChanges(project._context, {
                fileName: "test.ts",
                isNewFile: true,
                textChanges: [{ newText: "console;", span: { start: 0, length: 3 } }]
            });
            change.applyChanges({ overwrite: true });
            expect(project.getSourceFileOrThrow("test.ts").getText()).to.equal("console;");
        });

        it("should throw if a file text change instruct to modify a file that doesn't exists and a isNewFile is false", () => {
            const project = setup();
            const change = new FileTextChanges(project._context, {
                fileName: "nonExistent.ts",
                textChanges: [{ newText: "new text", span: { start: 0, length: 3 } }]
            });
            expect(() => change.applyChanges()).to.throw(errors.InvalidOperationError);
        });

        it("should create new files if isNewFile is true", () => {
            const project = setup();
            const change = new FileTextChanges(project._context, {
                fileName: "newFile.ts",
                isNewFile: true,
                textChanges: [{ newText: "new text", span: { start: 0, length: 0 } }]
            });
            change.applyChanges();
            change.applyChanges(); // should do nothing if called twice
            expect(project.getSourceFileOrThrow("newFile.ts").getText()).to.equal("new text");
        });

        it("should apply the file text change", () => {
            const project = setup();
            const change = new FileTextChanges(project._context, {
                fileName: "test.ts",
                isNewFile: false,
                textChanges: [{ newText: "text; ", span: { start: 0, length: 0 } }]
            });
            change.applyChanges();
            change.applyChanges(); // should do nothing if called twice
            expect(change.getSourceFile()!.getText()).to.equal("text; const t; const u;");
        });
    });
});
