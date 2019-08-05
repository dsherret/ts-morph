import { expect } from "chai";
import { Project } from "../../Project";
import { SyntaxKind } from "../../typescript";

describe("tests for issue #671", () => {
    // see this comment for why this happens:
    // https://github.com/dsherret/ts-morph/issues/653#issuecomment-506003489
    it("should return string when getting the type of T", () => {
        const project = new Project({ useVirtualFileSystem: true });
        const file = project.createSourceFile("test.ts", `
type Date = string;
type T = Date;
`);
        const tType = file.getFirstDescendantByKindOrThrow(SyntaxKind.TypeReference);

        expect(tType.getText()).to.equal("Date");
        expect(tType.getType().getText()).to.equal("string");
    });
});
