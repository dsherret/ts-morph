import { expect } from "chai";
import { getInfoFromText } from "../compiler/testHelpers";

describe("tests for issue #484", () => {
    it("should not error when organizing imports", () => {
        const { project } = getInfoFromText("");

        const lionFile = project.createSourceFile("src/animal/lion/Lion.ts", `
import {Food} from '../../food/Food';
import {Animal} from '../Animal';

export class Lion {
    eat(meat: Food) {}
}`);

        const foodFile = project.createSourceFile("src/food/Food.ts", `
export class Food {
    energy: number;
    canEatBy: number[];
}`);
        const foodClass = foodFile.getClassOrThrow("Food");
        foodClass.findReferences();

        lionFile.addImportDeclaration({
            moduleSpecifier: "../foo",
            namedImports: [{ name: "Foo" }]
        });
        lionFile.organizeImports();
        expect(lionFile.getText()).to.equal(`import { Food } from '../../food/Food';

export class Lion {
    eat(meat: Food) {}
}`);
    });
});
