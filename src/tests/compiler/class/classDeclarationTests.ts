import { expect } from "chai";
import { ClassDeclaration } from "../../../compiler";
import { ClassDeclarationSpecificStructure, ClassDeclarationStructure, InterfaceDeclarationStructure } from "../../../structures";
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

    describe(nameof<ClassDeclaration>(d => d.extractInterface), () => {
        function doTest(code: string, name: string | undefined, expectedStructure: InterfaceDeclarationStructure, filePath?: string) {
            const { descendant } = getInfoFromTextWithDescendant<ClassDeclaration>(code, SyntaxKind.ClassDeclaration, { filePath });
            const structure = descendant.extractInterface(name);

            if (expectedStructure.properties == null)
                expectedStructure.properties = [];
            if (expectedStructure.methods == null)
                expectedStructure.methods = [];

            expect(structure).to.deep.equal(expectedStructure);
        }

        it("should use the class name when no name", () => {
            doTest("class Test { }", undefined, { name: "Test" });
        });

        it("should use the base name when no name and no class name", () => {
            doTest("export default class { }", undefined, { name: "File_42$" }, "/dir/File^_4#2$.ts");
        });

        it("should get when class has everything", () => {
            doTest(`
abstract class Test<T extends string = number, U> extends Base implements IBase {
    constructor(public param1: string, readonly param2?: number, public readonly param3: string, private param3) {}
    static test: number;
    prop1: string;
    readonly prop2?: number;
    protected myProtectedProp: number;
    private myPrivateProp: string;
    get myGet() { return 5; }
    get myGetAndSet() { return ""; }
    set myGetAndSet(value: string) {}
    set mySet(value: string) {}
    protected get myProtectedAccessor() { return 5; }
    protected set myProtectedAccessor(value: string) {}
    private get myPrivateAccessor() { return 5; }
    myMethod<T extends string = number, U>(param1: string) { return 5; }
    abstract myAbstractMethod?(): number;
    static myStaticMethod() {}
    protected myProtected() {}
    private myPrivate() {}
}`,
                undefined, {
                    name: "Test",
                    typeParameters: [
                        { name: "T", constraint: "string", default: "number" },
                        { name: "U", constraint: undefined, default: undefined }
                    ],
                    properties: [
                        { name: "param1", type: "string", hasQuestionToken: false, isReadonly: false },
                        { name: "param2", type: "number", hasQuestionToken: true, isReadonly: true },
                        { name: "param3", type: "string", hasQuestionToken: false, isReadonly: true },
                        { name: "prop1", type: "string", hasQuestionToken: false, isReadonly: false },
                        { name: "prop2", type: "number", hasQuestionToken: true, isReadonly: true },
                        { name: "myGet", type: "number", hasQuestionToken: false, isReadonly: true },
                        { name: "myGetAndSet", type: "string", hasQuestionToken: false, isReadonly: false },
                        { name: "mySet", type: "string", hasQuestionToken: false, isReadonly: false }
                    ],
                    methods: [{
                        name: "myMethod",
                        returnType: "number",
                        parameters: [
                            { name: "param1", type: "string" }
                        ],
                        typeParameters: [
                            { name: "T", constraint: "string", default: "number" },
                            { name: "U", constraint: undefined, default: undefined }
                        ]
                    }, {
                        name: "myAbstractMethod",
                        returnType: "number",
                        parameters: [],
                        typeParameters: [],
                        hasQuestionToken: true
                    }]
                });
        });
    });
});
