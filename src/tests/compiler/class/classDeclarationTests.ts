import { expect } from "chai";
import { ClassDeclaration, MethodDeclaration } from "../../../compiler";
import { ClassDeclarationSpecificStructure, ClassDeclarationStructure } from "../../../structures";
import { SyntaxKind } from "../../../typescript";
import { getInfoFromText, getInfoFromTextWithDescendant } from "../testHelpers";

describe(nameof(ClassDeclaration), () => {
    describe(nameof<ClassDeclaration>(d => d.getType), () => {
        it("should get the class' type", () => {
            const { sourceFile } = getInfoFromText("class Identifier { prop: string; }");
            expect(sourceFile.getClassOrThrow("Identifier").getType().getText()).to.deep.equal("Identifier");
        });
    });

    describe(nameof<ClassDeclaration>(d => d.remove), () => {
        function doTest(text: string, index: number, expectedText: string) {
            const { sourceFile } = getInfoFromText(text);
            sourceFile.getClasses()[index].remove();
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should remove the class declaration", () => {
            doTest("class I {}\n\nclass J {}\n\nclass K {}", 1, "class I {}\n\nclass K {}");
        });
    });

    describe(nameof<ClassDeclaration>(c => c.set), () => {
        function doTest(startingCode: string, structure: ClassDeclarationSpecificStructure, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(startingCode);
            firstChild.set(structure);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should not modify anything if the structure doesn't change anything", () => {
            const code = `
class Identifier extends Test {
    constructor() {}
    method() {}
    property: string;
    get prop() {}
    set prop() {}
}
`;
            doTest(code, {}, code);
        });

        it("should replace the existing items when specified", () => {
            const code = `
class Identifier extends Test {
    constructor() {}
    method() {}
    property: string;
    get prop() {}
    set prop() {}
}
`;
            const expectedCode = `
class Identifier extends Other {
    constructor() {
    }

    p;

    get g() {
    }

    set s(value: string) {
    }

    m() {
    }
}
`;
            const structure: MakeRequired<ClassDeclarationSpecificStructure> = {
                extends: "Other",
                ctors: [{}],
                properties: [{ name: "p" }],
                getAccessors: [{ name: "g" }],
                setAccessors: [{ name: "s", parameters: [{ name: "value", type: "string" }] }],
                methods: [{ name: "m" }]
            };
            doTest(code, structure, expectedCode);
        });

        it("should remove the existing items when specifying empty values", () => {
            const code = `
class Identifier extends Test {
    constructor() {}
    method() {}
    property: string;
    get prop() {}
    set prop() {}
}
`;
            const expectedCode = `
class Identifier {
}
`;
            const structure: MakeRequired<ClassDeclarationSpecificStructure> = {
                extends: undefined,
                ctors: [],
                properties: [],
                getAccessors: [],
                setAccessors: [],
                methods: []
            };
            doTest(code, structure, expectedCode);
        });
    });

    describe(nameof<ClassDeclaration>(d => d.getStructure), () => {
        function doTest(code: string, expectedStructure: MakeRequired<ClassDeclarationStructure>) {
            const { descendant, project } = getInfoFromTextWithDescendant<ClassDeclaration>(code, SyntaxKind.ClassDeclaration);
            const structure = descendant.getStructure();

            // only bother comparing the basics
            structure.ctors = structure.ctors!.map(s => ({}));
            structure.decorators = structure.decorators!.map(s => ({ name: s.name }));
            structure.getAccessors = structure.getAccessors!.map(s => ({ name: s.name }));
            structure.methods = structure.methods!.map(s => ({ name: s.name }));
            structure.properties = structure.properties!.map(s => ({ name: s.name }));
            structure.setAccessors = structure.setAccessors!.map(s => ({ name: s.name }));
            structure.typeParameters = structure.typeParameters!.map(s => ({ name: s.name }));

            expect(structure).to.deep.equal(expectedStructure);
        }

        it("should get the structure for an empty class", () => {
            doTest("class Identifier {}", {
                ctors: [],
                decorators: [],
                docs: [],
                extends: undefined,
                implements: [],
                getAccessors: [],
                hasDeclareKeyword: false,
                isAbstract: false,
                isDefaultExport: false,
                isExported: false,
                methods: [],
                name: "Identifier",
                properties: [],
                setAccessors: [],
                typeParameters: []
            });
        });

        it("should get the structure of a class that has everything", () => {
            const code = `
/** Test */
@dec export default abstract class Identifier<T> extends Base implements IBase {
    constructor() {}
    method() {}
    prop: string;
    get getAccessor() {}
    set setAccessor(value: string) {}
}
`;
            doTest(code, {
                ctors: [{}],
                decorators: [{ name: "dec" }],
                docs: [{ description: "Test" }],
                extends: "Base",
                implements: ["IBase"],
                getAccessors: [{ name: "getAccessor" }],
                hasDeclareKeyword: false,
                isAbstract: true,
                isDefaultExport: true,
                isExported: true,
                methods: [{ name: "method" }],
                name: "Identifier",
                properties: [{ name: "prop" }],
                setAccessors: [{ name: "setAccessor" }],
                typeParameters: [{ name: "T" }]
            });
        });

        it("should get the structure of an ambient class", () => {
            const code = `
declare class Identifier {
    constructor(): string;
    constructor(): number;
    method();
    method(p);
    prop: string;
    get getAccessor();
    set setAccessor(value: string);
}
`;
            doTest(code, {
                ctors: [{}, {}],
                decorators: [],
                docs: [],
                extends: undefined,
                implements: [],
                getAccessors: [{ name: "getAccessor" }],
                hasDeclareKeyword: true,
                isAbstract: false,
                isDefaultExport: false,
                isExported: false,
                methods: [{ name: "method" }, { name: "method" }],
                name: "Identifier",
                properties: [{ name: "prop" }],
                setAccessors: [{ name: "setAccessor" }],
                typeParameters: []
            });
        });
    });
});
