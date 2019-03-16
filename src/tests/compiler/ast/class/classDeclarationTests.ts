import { expect } from "chai";
import { ClassDeclaration } from "../../../../compiler";
import { ClassDeclarationSpecificStructure, ClassLikeDeclarationBaseSpecificStructure, ClassDeclarationStructure,
    InterfaceDeclarationStructure, TypeParameterDeclarationStructure, OptionalKind, StructureKind } from "../../../../structures";
import { SyntaxKind } from "../../../../typescript";
import { getInfoFromText, getInfoFromTextWithDescendant } from "../../testHelpers";

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
        function doTest(startingCode: string, structure: OptionalKind<ClassDeclarationSpecificStructure> & ClassLikeDeclarationBaseSpecificStructure, expectedCode: string) {
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
            const structure: OptionalKind<MakeRequired<ClassDeclarationSpecificStructure & ClassLikeDeclarationBaseSpecificStructure>> = {
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
            const structure: OptionalKind<MakeRequired<ClassDeclarationSpecificStructure & ClassLikeDeclarationBaseSpecificStructure>> = {
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
            structure.typeParameters = structure.typeParameters!.map(s => ({ name: (s as TypeParameterDeclarationStructure).name }));

            expect(structure).to.deep.equal(expectedStructure);
        }

        it("should get the structure for an empty class", () => {
            doTest("class Identifier {}", {
                kind: StructureKind.Class,
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
                kind: StructureKind.Class,
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
                kind: StructureKind.Class,
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

            if (expectedStructure.docs == null)
                expectedStructure.docs = [];
            if (expectedStructure.typeParameters == null)
                expectedStructure.typeParameters = [];
            if (expectedStructure.properties == null)
                expectedStructure.properties = [];
            if (expectedStructure.methods == null)
                expectedStructure.methods = [];

            expect(structure).to.deep.equal(expectedStructure);
        }

        it("should use the class name when no name", () => {
            doTest("class Test { }", undefined, { kind: StructureKind.Interface, name: "Test" });
        });

        it("should use the file's base name when no name and no class name", () => {
            doTest("export default class { }", undefined, { kind: StructureKind.Interface, name: "File_42$" }, "/dir/File^_4#2$.ts");
        });

        it("should get when class has everything", () => {
            doTest(`
/** Test */
abstract class Test<T extends string = number, U> extends Base implements IBase {
    /**
     * Description.
     * @param param1 Test description.
     */
    constructor(@dec public param1: string, readonly param2?: number, public readonly param3: string, private param3) {}
    static test: number;
    /** Description */
    prop1: string;
    readonly prop2?: number;
    protected myProtectedProp: number;
    private myPrivateProp: string;
    /** MyGet */
    get myGet() { return 5; }
    /** MyGetAndSet Get */
    get myGetAndSet() { return ""; }
    /** MyGetAndSet Set */
    set myGetAndSet(value: string) {}
    /** MySet */
    set mySet(value: string) {}
    static get myStaticGet() {}
    protected get myProtectedAccessor() { return 5; }
    protected set myProtectedAccessor(value: string) {}
    private get myPrivateAccessor() { return 5; }
    /** Method */
    myMethod<T extends string = number, U>(@dec param1: string) { return 5; }
    overloadMethod(str: string): void;
    overloadMethod(): string;
    overloadMethod() { return ""; }
    abstract myAbstractMethod?(): number;
    static myStaticMethod() {}
    protected myProtected() {}
    private myPrivate() {}
}`,
                undefined, {
                    kind: StructureKind.Interface,
                    name: "Test",
                    docs: [{ description: "Test" }],
                    typeParameters: [
                        { name: "T", constraint: "string", default: "number" },
                        { name: "U", constraint: undefined, default: undefined }
                    ],
                    properties: [
                        { name: "param1", type: "string", hasQuestionToken: false, isReadonly: false, docs: [{ description: "Test description." }] },
                        { name: "param2", type: "number", hasQuestionToken: true, isReadonly: true, docs: [] },
                        { name: "param3", type: "string", hasQuestionToken: false, isReadonly: true, docs: [] },
                        { name: "prop1", type: "string", hasQuestionToken: false, isReadonly: false, docs: [{ description: "Description" }] },
                        { name: "prop2", type: "number", hasQuestionToken: true, isReadonly: true, docs: [] },
                        { name: "myGet", type: "number", hasQuestionToken: false, isReadonly: true, docs: [{ description: "MyGet" }] },
                        { name: "myGetAndSet", type: "string", hasQuestionToken: false, isReadonly: false, docs: [{ description: "MyGetAndSet Get" }] },
                        { name: "mySet", type: "string", hasQuestionToken: false, isReadonly: false, docs: [{ description: "MySet" }] }
                    ],
                    methods: [{
                        docs: [{ description: "Method" }],
                        name: "myMethod",
                        returnType: "number",
                        hasQuestionToken: false,
                        parameters: [{
                            decorators: [],
                            hasQuestionToken: false,
                            initializer: undefined,
                            isReadonly: false,
                            isRestParameter: false,
                            name: "param1",
                            type: "string",
                            scope: undefined
                        }],
                        typeParameters: [
                            { name: "T", constraint: "string", default: "number" },
                            { name: "U", constraint: undefined, default: undefined }
                        ]
                    }, {
                        docs: [],
                        name: "overloadMethod",
                        returnType: "void",
                        hasQuestionToken: false,
                        parameters: [{
                            decorators: [],
                            hasQuestionToken: false,
                            initializer: undefined,
                            isReadonly: false,
                            isRestParameter: false,
                            name: "str",
                            type: "string",
                            scope: undefined
                        }],
                        typeParameters: []
                    }, {
                        docs: [],
                        name: "overloadMethod",
                        returnType: "string",
                        hasQuestionToken: false,
                        parameters: [],
                        typeParameters: []
                    }, {
                        docs: [],
                        name: "myAbstractMethod",
                        returnType: "number",
                        hasQuestionToken: true,
                        parameters: [],
                        typeParameters: []
                    }]
                });
        });

        it("should handle constructor and method overloads", () => {
            doTest(`
class Test {
    /**
     * @param param Test.
     */
    constructor(public param: string, protected paramProtected: number);
    /**
     * @param param2 Test2.
     */
    constructor(public param2: number, private paramPrivate: number);
    constructor() {}
    /**
     * Description1.
     */
    method(param1: string): string;
    /**
     * Description2.
     */
    method(param2: number): number;
    /** Ignores this implementation */
    method() {
    }
}`,
                undefined, {
                    kind: StructureKind.Interface,
                    name: "Test",
                    properties: [
                        { name: "param", type: "string", hasQuestionToken: false, isReadonly: false, docs: [{ description: "Test." }] },
                        { name: "param2", type: "number", hasQuestionToken: false, isReadonly: false, docs: [{ description: "Test2." }] }
                    ],
                    methods: [{
                        docs: [{ description: "Description1." }],
                        name: "method",
                        returnType: "string",
                        hasQuestionToken: false,
                        parameters: [{
                            decorators: [],
                            hasQuestionToken: false,
                            initializer: undefined,
                            isReadonly: false,
                            isRestParameter: false,
                            name: "param1",
                            type: "string",
                            scope: undefined
                        }],
                        typeParameters: []
                    }, {
                        docs: [{ description: "Description2." }],
                        name: "method",
                        returnType: "number",
                        hasQuestionToken: false,
                        parameters: [{
                            decorators: [],
                            hasQuestionToken: false,
                            initializer: undefined,
                            isReadonly: false,
                            isRestParameter: false,
                            name: "param2",
                            type: "number",
                            scope: undefined
                        }],
                        typeParameters: []
                    }]
                });
        });
    });

    describe(nameof<ClassDeclaration>(d => d.extractStaticInterface), () => {
        function doTest(code: string, name: string, expectedStructure: InterfaceDeclarationStructure, filePath?: string) {
            const { descendant } = getInfoFromTextWithDescendant<ClassDeclaration>(code, SyntaxKind.ClassDeclaration, { filePath });
            const structure = descendant.extractStaticInterface(name);

            if (expectedStructure.properties == null)
                expectedStructure.properties = [];
            if (expectedStructure.methods == null)
                expectedStructure.methods = [];
            if (expectedStructure.constructSignatures == null)
                expectedStructure.constructSignatures = [];

            expect(structure).to.deep.equal(expectedStructure);
        }

        it("should use the file's base name in the constructor signature return types when no class name", () => {
            doTest("export default class { constructor() {} }", "Test", {
                kind: StructureKind.Interface,
                name: "Test",
                constructSignatures: [{
                    docs: [],
                    parameters: [],
                    returnType: "File_42$"
                }],
                methods: [],
                properties: []
            }, "/dir/File^_4#2$.ts");
        });

        it("should get when class has everything", () => {
            doTest(`
/** Test */
class Test<T extends string = number, U> extends Base implements IBase {
    /**
     * Description.
     */
    constructor(@dec public param1: string, readonly param2?: number, public readonly param3: string, private param4) {}
    test: number;
    /** Description */
    static prop1: string;
    static readonly prop2?: number;
    protected static myProtectedProp: number;
    private static myPrivateProp: string;
    /** MyGet */
    static get myGet() { return 5; }
    /** MyGetAndSet Get */
    static get myGetAndSet() { return ""; }
    /** MyGetAndSet Set */
    static set myGetAndSet(value: string) {}
    /** MySet */
    static set mySet(value: string) {}
    get myStaticGet() {}
    protected static get myProtectedAccessor() { return 5; }
    protected static set myProtectedAccessor(value: string) {}
    private static get myPrivateAccessor() { return 5; }
    /** Method */
    static myMethod<T extends string = number, U>(@dec param1: string) { return 5; }
    static overloadMethod(str: string): void;
    static overloadMethod(): string;
    static overloadMethod() { return ""; }
    myInstanceMethod() {}
    static protected myProtected() {}
    static private myPrivate() {}
}`,
                "Name", {
                    kind: StructureKind.Interface,
                    name: "Name",
                    constructSignatures: [{
                        docs: [{ description: "Description." }],
                        parameters: [{
                            decorators: [],
                            hasQuestionToken: false,
                            initializer: undefined,
                            isReadonly: false,
                            isRestParameter: false,
                            name: "param1",
                            type: "string",
                            scope: undefined
                        }, {
                            decorators: [],
                            hasQuestionToken: true,
                            initializer: undefined,
                            isReadonly: false,
                            isRestParameter: false,
                            name: "param2",
                            type: "number",
                            scope: undefined
                        }, {
                            decorators: [],
                            hasQuestionToken: false,
                            initializer: undefined,
                            isReadonly: false,
                            isRestParameter: false,
                            name: "param3",
                            type: "string",
                            scope: undefined
                        }, {
                            decorators: [],
                            hasQuestionToken: false,
                            initializer: undefined,
                            isReadonly: false,
                            isRestParameter: false,
                            name: "param4",
                            type: undefined,
                            scope: undefined
                        }],
                        returnType: "Test"
                    }],
                    properties: [
                        { name: "prop1", type: "string", hasQuestionToken: false, isReadonly: false, docs: [{ description: "Description" }] },
                        { name: "prop2", type: "number", hasQuestionToken: true, isReadonly: true, docs: [] },
                        { name: "myGet", type: "number", hasQuestionToken: false, isReadonly: true, docs: [{ description: "MyGet" }] },
                        { name: "myGetAndSet", type: "string", hasQuestionToken: false, isReadonly: false, docs: [{ description: "MyGetAndSet Get" }] },
                        { name: "mySet", type: "string", hasQuestionToken: false, isReadonly: false, docs: [{ description: "MySet" }] }
                    ],
                    methods: [{
                        docs: [{ description: "Method" }],
                        name: "myMethod",
                        returnType: "number",
                        hasQuestionToken: false,
                        parameters: [{
                            decorators: [],
                            hasQuestionToken: false,
                            initializer: undefined,
                            isReadonly: false,
                            isRestParameter: false,
                            name: "param1",
                            type: "string",
                            scope: undefined
                        }],
                        typeParameters: [
                            { name: "T", constraint: "string", default: "number" },
                            { name: "U", constraint: undefined, default: undefined }
                        ]
                    }, {
                        docs: [],
                        name: "overloadMethod",
                        returnType: "void",
                        hasQuestionToken: false,
                        parameters: [{
                            decorators: [],
                            hasQuestionToken: false,
                            initializer: undefined,
                            isReadonly: false,
                            isRestParameter: false,
                            name: "str",
                            type: "string",
                            scope: undefined
                        }],
                        typeParameters: []
                    }, {
                        docs: [],
                        name: "overloadMethod",
                        returnType: "string",
                        hasQuestionToken: false,
                        parameters: [],
                        typeParameters: []
                    }]
                });
        });

        it("should handle constructor and method overloads", () => {
            doTest(`
class Test {
    /**
     * Test.
     */
    constructor(public param: string);
    /**
     * Test2.
     */
    constructor(private param2: number);
    constructor() {}
    /**
     * Description1.
     */
    static method(param1: string): string;
    /**
     * Description2.
     */
    static method(param2: number): number;
    /** Ignores this implementation */
    static method() {
    }
}`,
                "Name", {
                    kind: StructureKind.Interface,
                    name: "Name",
                    constructSignatures: [{
                        docs: [{ description: "Test." }],
                        parameters: [{
                            decorators: [],
                            hasQuestionToken: false,
                            initializer: undefined,
                            isReadonly: false,
                            isRestParameter: false,
                            name: "param",
                            type: "string",
                            scope: undefined
                        }],
                        returnType: "Test"
                    }, {
                        docs: [{ description: "Test2." }],
                        parameters: [{
                            decorators: [],
                            hasQuestionToken: false,
                            initializer: undefined,
                            isReadonly: false,
                            isRestParameter: false,
                            name: "param2",
                            type: "number",
                            scope: undefined
                        }],
                        returnType: "Test"
                    }],
                    properties: [],
                    methods: [{
                        docs: [{ description: "Description1." }],
                        name: "method",
                        returnType: "string",
                        hasQuestionToken: false,
                        parameters: [{
                            decorators: [],
                            hasQuestionToken: false,
                            initializer: undefined,
                            isReadonly: false,
                            isRestParameter: false,
                            name: "param1",
                            type: "string",
                            scope: undefined
                        }],
                        typeParameters: []
                    }, {
                        docs: [{ description: "Description2." }],
                        name: "method",
                        returnType: "number",
                        hasQuestionToken: false,
                        parameters: [{
                            decorators: [],
                            hasQuestionToken: false,
                            initializer: undefined,
                            isReadonly: false,
                            isRestParameter: false,
                            name: "param2",
                            type: "number",
                            scope: undefined
                        }],
                        typeParameters: []
                    }]
                });
        });
    });
});
