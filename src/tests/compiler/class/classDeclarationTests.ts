import {expect} from "chai";
import {ClassDeclaration, MethodDeclaration, PropertyDeclaration, GetAccessorDeclaration, SetAccessorDeclaration, ExpressionWithTypeArguments,
    ConstructorDeclaration} from "./../../../compiler";
import {PropertyDeclarationStructure, MethodDeclarationStructure, ConstructorDeclarationStructure} from "./../../../structures";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ClassDeclaration), () => {
    describe(nameof<ClassDeclaration>(d => d.getExtends), () => {
        it("should return undefined when no extends clause exists", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("class Identifier { }");
            expect(firstChild.getExtends()).to.be.undefined;
        });

        it("should return a heritage clause when an extends clause exists", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("class Identifier extends Base { }");
            expect(firstChild.getExtends()).to.be.instanceOf(ExpressionWithTypeArguments);
        });
    });

    describe(nameof<ClassDeclaration>(d => d.setExtends), () => {
        it("should set an extends", () => {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>("  class Identifier {}  ");
            firstChild.setExtends("Base");
            expect(sourceFile.getFullText()).to.equal("  class Identifier extends Base {}  ");
        });

        it("should set an extends when an implements exists", () => {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>("class Identifier implements IBase {}");
            firstChild.setExtends("Base");
            expect(sourceFile.getFullText()).to.equal("class Identifier extends Base implements IBase {}");
        });

        it("should set an extends when the brace is right beside the identifier", () => {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>("  class Identifier{}  ");
            firstChild.setExtends("Base");
            expect(sourceFile.getFullText()).to.equal("  class Identifier extends Base {}  ");
        });

        it("should set an extends when an extends already exists", () => {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>("class Identifier extends Base1 {}");
            firstChild.setExtends("Base2");
            expect(sourceFile.getFullText()).to.equal("class Identifier extends Base2 {}");
        });

        it("should throw an error when providing invalid input", () => {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>("class Identifier extends Base1 {}");
            expect(() => firstChild.setExtends("")).to.throw();
            expect(() => firstChild.setExtends("  ")).to.throw();
            expect(() => firstChild.setExtends(5 as any)).to.throw();
        });
    });

    describe(nameof<ClassDeclaration>(d => d.insertConstructor), () => {
        function doTest(startCode: string, insertIndex: number, structure: ConstructorDeclarationStructure, expectedCode: string) {
            const {firstChild} = getInfoFromText<ClassDeclaration>(startCode);
            const result = firstChild.insertConstructor(insertIndex, structure);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result).to.be.instanceOf(ConstructorDeclaration);
        }

        it("should insert when none exists", () => {
            doTest("class c {\n}", 0, {}, "class c {\n    constructor() {\n    }\n}");
        });

        it("should insert multiple into other members", () => {
            doTest("class c {\n    prop1;\n    prop2;\n}", 1, {},
                "class c {\n    prop1;\n\n    constructor() {\n    }\n\n    prop2;\n}");
        });
    });

    describe(nameof<ClassDeclaration>(d => d.addConstructor), () => {
        function doTest(startCode: string, structure: ConstructorDeclarationStructure, expectedCode: string) {
            const {firstChild} = getInfoFromText<ClassDeclaration>(startCode);
            const result = firstChild.addConstructor(structure);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result).to.be.instanceOf(ConstructorDeclaration);
        }

        it("should add at the end", () => {
            doTest("class c {\n    prop1;\n}", {},
                "class c {\n    prop1;\n\n    constructor() {\n    }\n}");
        });
    });

    describe(nameof<ClassDeclaration>(d => d.getConstructors), () => {
        it("should return undefined when no constructor exists", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("class Identifier { }");
            expect(firstChild.getConstructors().length).to.equal(0);
        });

        it("should return the constructor when it exists", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("class Identifier { constructor() { } }");
            expect(firstChild.getConstructors()[0]!.getText()).to.equal("constructor() { }");
        });

        it("should return the constructor overload when it exists", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("class Identifier { constructor(str: string);constructor(str: any) { } }");
            const constructors = firstChild.getConstructors();
            expect(constructors.length).to.equal(2);
            expect(constructors[0]!.getText()).to.equal("constructor(str: string);");
            expect(constructors[1]!.getText()).to.equal("constructor(str: any) { }");
        });
    });

    describe(nameof<ClassDeclaration>(d => d.insertProperties), () => {
        function doTest(startCode: string, insertIndex: number, structures: PropertyDeclarationStructure[], expectedCode: string) {
            const {firstChild} = getInfoFromText<ClassDeclaration>(startCode);
            const result = firstChild.insertProperties(insertIndex, structures);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result.length).to.equal(structures.length);
        }

        it("should insert when none exists", () => {
            doTest("class c {\n}", 0, [{ name: "prop" }], "class c {\n    prop;\n}");
        });

        it("should insert multiple into other properties", () => {
            doTest("class c {\n    prop1;\n    prop4;\n}", 1, [{ name: "prop2", hasQuestionToken: true, type: "string" }, { name: "prop3" }],
                "class c {\n    prop1;\n    prop2?: string;\n    prop3;\n    prop4;\n}");
        });

        it("should add an extra newline if inserting before non-property", () => {
            doTest("class c {\n    myMethod() {}\n}", 0, [{ name: "prop" }],
                "class c {\n    prop;\n\n    myMethod() {}\n}");
        });

        it("should add an extra newline if inserting ater non-property", () => {
            doTest("class c {\n    myMethod() {}\n}", 1, [{ name: "prop" }],
                "class c {\n    myMethod() {}\n\n    prop;\n}");
        });
    });

    describe(nameof<ClassDeclaration>(d => d.insertProperty), () => {
        function doTest(startCode: string, insertIndex: number, structure: PropertyDeclarationStructure, expectedCode: string) {
            const {firstChild} = getInfoFromText<ClassDeclaration>(startCode);
            const result = firstChild.insertProperty(insertIndex, structure);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result).to.be.instanceOf(PropertyDeclaration);
        }

        it("should insert at index", () => {
            doTest("class c {\n    prop1;\n    prop3;\n}", 1, { name: "prop2" }, "class c {\n    prop1;\n    prop2;\n    prop3;\n}");
        });
    });

    describe(nameof<ClassDeclaration>(d => d.addProperties), () => {
        function doTest(startCode: string, structures: PropertyDeclarationStructure[], expectedCode: string) {
            const {firstChild} = getInfoFromText<ClassDeclaration>(startCode);
            const result = firstChild.addProperties(structures);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result.length).to.equal(structures.length);
        }

        it("should add multiple at end", () => {
            doTest("class c {\n    prop1;\n}", [{ name: "prop2" }, { name: "prop3" }], "class c {\n    prop1;\n    prop2;\n    prop3;\n}");
        });
    });

    describe(nameof<ClassDeclaration>(d => d.addProperty), () => {
        function doTest(startCode: string, structure: PropertyDeclarationStructure, expectedCode: string) {
            const {firstChild} = getInfoFromText<ClassDeclaration>(startCode);
            const result = firstChild.addProperty(structure);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result).to.be.instanceOf(PropertyDeclaration);
        }

        it("should add at end", () => {
            doTest("class c {\n    prop1;\n}", { name: "prop2" }, "class c {\n    prop1;\n    prop2;\n}");
        });
    });

    describe(nameof<ClassDeclaration>(d => d.getInstanceProperties), () => {
        describe("no properties", () => {
            it("should not have any properties", () => {
                const {firstChild} = getInfoFromText<ClassDeclaration>("class Identifier {\n}\n");
                expect(firstChild.getInstanceProperties().length).to.equal(0);
            });
        });

        describe("has properties", () => {
            const code = "class Identifier {\nstatic prop2: string;\nstatic method() {}\ninstanceProp: string;\nprop2: number;method1() {}\n" +
                "get prop(): string {return '';}\nset prop(val: string) {}\n}\n";
            const {firstChild} = getInfoFromText<ClassDeclaration>(code);

            it("should get the right number of properties", () => {
                expect(firstChild.getInstanceProperties().length).to.equal(4);
            });

            it("should get a property of the right instance of", () => {
                expect(firstChild.getInstanceProperties()[0]).to.be.instanceOf(PropertyDeclaration);
            });

            it("should get a property of the right instance of for the get accessor", () => {
                expect(firstChild.getInstanceProperties()[2]).to.be.instanceOf(GetAccessorDeclaration);
            });

            it("should get a property of the right instance of for the set accessor", () => {
                expect(firstChild.getInstanceProperties()[3]).to.be.instanceOf(SetAccessorDeclaration);
            });
        });
    });

    describe(nameof<ClassDeclaration>(d => d.getStaticProperties), () => {
        describe("no static properties", () => {
            it("should not have any properties", () => {
                const {firstChild} = getInfoFromText<ClassDeclaration>("class Identifier {\n}\n");
                expect(firstChild.getStaticProperties().length).to.equal(0);
            });
        });

        describe("has static properties", () => {
            const code = "class Identifier {\nstatic prop2: string;\nstatic method() {}\nprop: string;\nprop2: number;method1() {}\n" +
                "\nstatic get prop(): string { return ''; }\nstatic set prop(val: string) {}\n}";
            const {firstChild} = getInfoFromText<ClassDeclaration>(code);

            it("should get the right number of static properties", () => {
                expect(firstChild.getStaticProperties().length).to.equal(3);
            });

            it("should get a property of the right instance of", () => {
                expect(firstChild.getStaticProperties()[0]).to.be.instanceOf(PropertyDeclaration);
            });

            it("should get a property of the right instance of for the get accessor", () => {
                expect(firstChild.getStaticProperties()[1]).to.be.instanceOf(GetAccessorDeclaration);
            });

            it("should get a property of the right instance of for the set accessor", () => {
                expect(firstChild.getStaticProperties()[2]).to.be.instanceOf(SetAccessorDeclaration);
            });
        });
    });

    describe(nameof<ClassDeclaration>(d => d.insertMethods), () => {
        function doTest(startCode: string, insertIndex: number, structures: MethodDeclarationStructure[], expectedCode: string) {
            const {firstChild} = getInfoFromText<ClassDeclaration>(startCode);
            const result = firstChild.insertMethods(insertIndex, structures);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result.length).to.equal(structures.length);
        }

        it("should insert when none exists", () => {
            doTest("class c {\n}", 0, [{ name: "myMethod" }], "class c {\n    myMethod() {\n    }\n}");
        });

        it("should insert multiple into other methods", () => {
            doTest("class c {\n    m1() {\n    }\n\n    m4() {\n    }\n}", 1, [{ isStatic: true, name: "m2", returnType: "string" }, { name: "m3" }],
                "class c {\n    m1() {\n    }\n\n    static m2(): string {\n    }\n\n    m3() {\n    }\n\n    m4() {\n    }\n}");
        });
    });

    describe(nameof<ClassDeclaration>(d => d.insertMethod), () => {
        function doTest(startCode: string, insertIndex: number, structure: MethodDeclarationStructure, expectedCode: string) {
            const {firstChild} = getInfoFromText<ClassDeclaration>(startCode);
            const result = firstChild.insertMethod(insertIndex, structure);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result).to.be.instanceOf(MethodDeclaration);
        }

        it("should insert", () => {
            doTest("class c {\n    m1() {\n    }\n\n    m3() {\n    }\n}", 1, { name: "m2" },
                "class c {\n    m1() {\n    }\n\n    m2() {\n    }\n\n    m3() {\n    }\n}");
        });
    });

    describe(nameof<ClassDeclaration>(d => d.addMethods), () => {
        function doTest(startCode: string, structures: MethodDeclarationStructure[], expectedCode: string) {
            const {firstChild} = getInfoFromText<ClassDeclaration>(startCode);
            const result = firstChild.addMethods(structures);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result.length).to.equal(structures.length);
        }

        it("should add multiple", () => {
            doTest("class c {\n    m1() {\n    }\n}", [{ name: "m2" }, { name: "m3" }],
                "class c {\n    m1() {\n    }\n\n    m2() {\n    }\n\n    m3() {\n    }\n}");
        });
    });

    describe(nameof<ClassDeclaration>(d => d.addMethod), () => {
        function doTest(startCode: string, structure: MethodDeclarationStructure, expectedCode: string) {
            const {firstChild} = getInfoFromText<ClassDeclaration>(startCode);
            const result = firstChild.addMethod(structure);
            expect(firstChild.getText()).to.equal(expectedCode);
            expect(result).to.be.instanceOf(MethodDeclaration);
        }

        it("should insert", () => {
            doTest("class c {\n    m1() {\n    }\n}", { name: "m2" },
                "class c {\n    m1() {\n    }\n\n    m2() {\n    }\n}");
        });
    });

    describe(nameof<ClassDeclaration>(d => d.getInstanceMethods), () => {
        describe("no methods", () => {
            it("should not have any methods", () => {
                const {firstChild} = getInfoFromText<ClassDeclaration>("class Identifier {\n}\n");
                expect(firstChild.getInstanceMethods().length).to.equal(0);
            });
        });

        describe("has methods", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("class Identifier {\nstatic prop2: string;\nstatic method() {}\nprop: string;\nmethod1() {}\nmethod2() {}\n}\n");

            it("should get the right number of methods", () => {
                expect(firstChild.getInstanceMethods().length).to.equal(2);
            });

            it("should get a method of the right instance of", () => {
                expect(firstChild.getInstanceMethods()[0]).to.be.instanceOf(MethodDeclaration);
            });
        });
    });

    describe(nameof<ClassDeclaration>(d => d.getStaticMethods), () => {
        describe("no static methods", () => {
            it("should not have any static methods", () => {
                const {firstChild} = getInfoFromText<ClassDeclaration>("class Identifier {\n}\n");
                expect(firstChild.getStaticMethods().length).to.equal(0);
            });
        });

        describe("has static methods", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("class Identifier {\nstatic prop2: string;\nstatic method() {}\nprop: string;\nmethod1() {}\nmethod2() {}\n}\n");

            it("should get the right number of static methods", () => {
                expect(firstChild.getStaticMethods().length).to.equal(1);
            });

            it("should get a method of the right instance of", () => {
                expect(firstChild.getStaticMethods()[0]).to.be.instanceOf(MethodDeclaration);
            });
        });
    });

    describe(nameof<ClassDeclaration>(d => d.getInstanceMembers), () => {
        const {firstChild} = getInfoFromText<ClassDeclaration>("class Identifier {\nstatic prop2: string;\nstatic method() {}\nprop: string;\nprop2: number;method1() {}\n}\n");
        it("should get the right number of instance members", () => {
            expect(firstChild.getInstanceMembers().length).to.equal(3);
        });
    });

    describe(nameof<ClassDeclaration>(d => d.getStaticMembers), () => {
        const {firstChild} = getInfoFromText<ClassDeclaration>("class Identifier {\nstatic prop2: string;\nstatic method() {}\nprop: string;\nprop2: number;method1() {}\n}\n");
        it("should get the right number of static members", () => {
            expect(firstChild.getStaticMembers().length).to.equal(2);
        });
    });

    describe(nameof<ClassDeclaration>(d => d.getAllMembers), () => {
        const code = "class Identifier {\nconstructor() {}\nstatic prop2: string;\nstatic method() {}\nprop: string;\nprop2: number;method1() {}\n}\n";
        const {firstChild} = getInfoFromText<ClassDeclaration>(code);
        it("should get the right number of instance, static, and constructor members", () => {
            expect(firstChild.getAllMembers().length).to.equal(6);
        });
    });
});
