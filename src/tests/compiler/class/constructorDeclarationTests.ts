import {expect} from "chai";
import {ClassDeclaration, ConstructorDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ConstructorDeclaration), () => {
    describe(nameof<ConstructorDeclaration>(d => d.remove), () => {
        function doTest(startCode: string, expectedCode: string) {
            const {sourceFile, firstChild} = getInfoFromText<ClassDeclaration>(startCode);
            firstChild.getConstructors().forEach(c => c.remove());
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should remove when only member", () => {
            doTest("class MyClass {\n    constructor() {\n    }\n}",
                "class MyClass {\n}");
        });

        it("should remove when between other members", () => {
            doTest("class MyClass {\n    prop: string;\n\n    constructor() {\n    }\n\n    m() {\n    }\n}",
                "class MyClass {\n    prop: string;\n\n    m() {\n    }\n}");
        });

        it("should remove when at start", () => {
            doTest("class MyClass {\n    constructor() {\n    }\n\n    prop: string;\n}",
                "class MyClass {\n    prop: string;\n}");
        });

        it("should remove when at end", () => {
            doTest("class MyClass {\n    prop: string;\n\n    constructor() {\n    }\n}",
                "class MyClass {\n    prop: string;\n}");
        });

        it("should remove when there are overloads", () => {
            doTest("class MyClass {\n    constructor();constructor() {\n    }\n}",
                "class MyClass {\n}");
        });
    });
});
