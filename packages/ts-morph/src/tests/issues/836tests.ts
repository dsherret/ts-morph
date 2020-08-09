import { expect } from "chai";
import { Project } from "../../Project";

describe("tests for issue #837", () => {
    it("should add quotation marks", () => {
        const project = new Project({ useInMemoryFileSystem: true });
        const sourceFile = project.createSourceFile("src/myEnum.ts", ``);
        sourceFile.addEnum({
            name: "testEnum",
            members: [{
                name: "normalName",
                value: "normalValue",
            }, {
                name: "poor-name",
                value: "poor-name-value",
            }, {
                name: "'poor-name'-containing quotations",
                value: "poor-name-value-containing-quotations",
            }, {
                name: "\"poor-name\"-containing quotations-2",
                value: "poor-name-value-containing-quotations-2",
            }, {
                name: "'already-quoted-name'",
                value: "already-quoted-value",
            }, {
                name: "do",
                value: "test-quoting-do",
            }, {
                name: "enum",
                value: "test-quoting-enum",
            }],
        });
        expect(sourceFile.getFullText()).to.equal("enum testEnum {\n"
            + "    normalName = \"normalValue\",\n"
            + "    \"poor-name\" = \"poor-name-value\",\n"
            + "    \"'poor-name'-containing quotations\" = \"poor-name-value-containing-quotations\",\n"
            + "    \"\\\"poor-name\\\"-containing quotations-2\" = \"poor-name-value-containing-quotations-2\",\n"
            + "    'already-quoted-name' = \"already-quoted-value\",\n"
            + "    \"do\" = \"test-quoting-do\",\n"
            + "    \"enum\" = \"test-quoting-enum\"\n"
            + "}\n");
    });
});
