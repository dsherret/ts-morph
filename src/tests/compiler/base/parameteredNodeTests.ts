import {expect} from "chai";
import {ParameteredNode, FunctionDeclaration, ParameterDeclaration} from "./../../../compiler";
import {ParameterStructure} from "./../../../structures";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ParameteredNode), () => {
    describe(nameof<ParameteredNode>(d => d.getParameters), () => {
        const {firstChild} = getInfoFromText<FunctionDeclaration>("function func(param1: string, param2: number){}");
        const parameters = firstChild.getParameters();

        it("should get the right number of parameters", () => {
            expect(parameters.length).to.equal(2);
        });

        it("should have parameter of type ParameterDeclaration", () => {
            expect(parameters[0]).to.be.instanceOf(ParameterDeclaration);
        });
    });

    describe(nameof<ParameteredNode>(n => n.addParameter), () => {
        function doTest(startCode: string, structure: ParameterStructure, expectedCode: string) {
            const {firstChild} = getInfoFromText<FunctionDeclaration>(startCode);
            const result = firstChild.addParameter(structure);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result).to.be.instanceof(ParameterDeclaration);
        }

        it("should add when none exists", () => {
            doTest("function identifier() {}", { name: "param" }, "function identifier(param) {}");
        });

        it("should add when one exists", () => {
            doTest("function identifier(param1) {}", { name: "param2" }, "function identifier(param1, param2) {}");
        });
    });

    describe(nameof<ParameteredNode>(n => n.addParameters), () => {
        function doTest(startCode: string, structures: ParameterStructure[], expectedCode: string) {
            const {firstChild} = getInfoFromText<FunctionDeclaration>(startCode);
            const result = firstChild.addParameters(structures);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result.length).to.equal(structures.length);
        }

        it("should add multiple", () => {
            doTest("function identifier(param1) {}", [{ name: "param2" }, { name: "param3" }], "function identifier(param1, param2, param3) {}");
        });
    });

    describe(nameof<ParameteredNode>(n => n.insertParameter), () => {
        function doTest(startCode: string, index: number, structure: ParameterStructure, expectedCode: string) {
            const {firstChild} = getInfoFromText<FunctionDeclaration>(startCode);
            const result = firstChild.insertParameter(index, structure);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result).to.be.instanceof(ParameterDeclaration);
        }

        it("should insert when none exists", () => {
            doTest("function identifier() {}", 0, { name: "param" }, "function identifier(param) {}");
        });

        it("should insert when one exists", () => {
            doTest("function identifier(param2) {}", 0, { name: "param1" }, "function identifier(param1, param2) {}");
        });
    });

    describe(nameof<ParameteredNode>(n => n.insertParameters), () => {
        function doTest(startCode: string, insertIndex: number, structures: ParameterStructure[], expectedCode: string) {
            const {firstChild} = getInfoFromText<FunctionDeclaration>(startCode);
            const result = firstChild.insertParameters(insertIndex, structures);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result.length).to.equal(structures.length);
        }

        it("should insert when none exists", () => {
            doTest("function identifier() {}", 0, [{ name: "param1" }, { name: "param2", type: "string[]", isRestParameter: true }],
                "function identifier(param1, ...param2: string[]) {}");
        });

        it("should insert at the start", () => {
            doTest("function identifier(param2) {}", 0, [{ name: "param1" }], "function identifier(param1, param2) {}");
        });

        it("should insert at the end", () => {
            doTest("function identifier(param1) {}", 1, [{ name: "param2" }], "function identifier(param1, param2) {}");
        });

        it("should insert in the middle", () => {
            doTest("function identifier(param1, param3) {}", 1, [{ name: "param2" }], "function identifier(param1, param2, param3) {}");
        });
    });
});
