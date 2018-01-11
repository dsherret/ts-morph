import * as ts from "typescript";
import {expect} from "chai";
import {ObjectLiteralExpression, PropertyAssignment, ShorthandPropertyAssignment, SpreadAssignment, MethodDeclaration,
    GetAccessorDeclaration, SetAccessorDeclaration} from "./../../../../compiler";
import {PropertyAssignmentStructure, ShorthandPropertyAssignmentStructure, SpreadAssignmentStructure, GetAccessorDeclarationStructure,
    SetAccessorDeclarationStructure, MethodDeclarationStructure} from "./../../../../structures";
import {getInfoFromText} from "./../../testHelpers";

describe(nameof(ObjectLiteralExpression), () => {
    function getObjectLiteralExpression(text: string) {
        const opts = getInfoFromText(text);
        const objectLiteralExpression = opts.sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.ObjectLiteralExpression) as ObjectLiteralExpression;
        return {
            objectLiteralExpression,
            ...opts
        };
    }

    describe(nameof<ObjectLiteralExpression>(e => e.getProperties), () => {
        function doTest(text: string, props: string[]) {
            const {objectLiteralExpression} = getObjectLiteralExpression(text);
            expect(objectLiteralExpression.getProperties().map(p => p.getText())).to.deep.equal(props);
        }

        it("should get the properties from the object literal expression", () => {
            doTest("const t = { prop: 5, prop2: 8, prop3 };", ["prop: 5", "prop2: 8", "prop3"]);
        });
    });

    describe(nameof<ObjectLiteralExpression>(e => e.getProperty), () => {
        it("should return undefined when it doesn't exist", () => {
            const {objectLiteralExpression} = getObjectLiteralExpression("const t = { prop: 5 }");
            const property = objectLiteralExpression.getProperty("prop2");
            expect(property).to.be.undefined;
        });

        it("should get the property by name", () => {
            const {objectLiteralExpression} = getObjectLiteralExpression("const t = { prop: 5 }");
            const property = objectLiteralExpression.getProperty("prop");
            expect(property!.getText()).to.equal("prop: 5");
        });

        it("should get the property by a find function", () => {
            const {objectLiteralExpression} = getObjectLiteralExpression("const t = { prop: 5 }");
            const property = objectLiteralExpression.getProperty(p => p.getKind() === ts.SyntaxKind.PropertyAssignment);
            expect(property!.getText()).to.equal("prop: 5");
        });
    });

    describe(nameof<ObjectLiteralExpression>(e => e.getPropertyOrThrow), () => {
        it("should return undefined when it doesn't exist", () => {
            const {objectLiteralExpression} = getObjectLiteralExpression("const t = { prop: 5 }");
            expect(() => objectLiteralExpression.getPropertyOrThrow("prop2")).to.throw();
        });

        it("should get the property by name", () => {
            const {objectLiteralExpression} = getObjectLiteralExpression("const t = { prop: 5 }");
            const property = objectLiteralExpression.getPropertyOrThrow("prop");
            expect(property.getText()).to.equal("prop: 5");
        });

        it("should get the property by a find function", () => {
            const {objectLiteralExpression} = getObjectLiteralExpression("const t = { prop: 5 }");
            const property = objectLiteralExpression.getPropertyOrThrow(p => p.getKind() === ts.SyntaxKind.PropertyAssignment);
            expect(property.getText()).to.equal("prop: 5");
        });
    });

    /* Property Assignments */

    describe(nameof<ObjectLiteralExpression>(e => e.insertPropertyAssignments), () => {
        function doTest(text: string, index: number, structures: PropertyAssignmentStructure[], expectedText: string) {
            const {sourceFile, objectLiteralExpression} = getObjectLiteralExpression(text);
            const result = objectLiteralExpression.insertPropertyAssignments(index, structures);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result.length).to.deep.equal(structures.length);
        }

        it("should insert the property assignments when none exist", () => {
            doTest("const t = {};", 0, [{ name: "prop1", initializer: "4" }, { name: "prop2", initializer: "5" }],
                "const t = {\n    prop1: 4,\n    prop2: 5\n};");
        });

        it("should insert the property assignments when none exist and there is some whitespace in the current object", () => {
            doTest("const t = {\n};", 0, [{ name: "prop", initializer: "5" }],
                "const t = {\n    prop: 5\n};");
        });

        it("should insert the property assignments at the beginning", () => {
            doTest("const t = {\n    prop: 5\n};", 0, [{ name: "prop1", initializer: `"test"` }],
                `const t = {\n    prop1: "test",\n    prop: 5\n};`);
        });

        it("should insert the property assignments in the middle", () => {
            doTest("const t = {\n    prop: 5,\n    prop3\n};", 1, [{ name: "prop2", initializer: "4" }],
                "const t = {\n    prop: 5,\n    prop2: 4,\n    prop3\n};");
        });

        it("should insert the property assignments at the end", () => {
            doTest("const t = {\n    prop: 5\n};", 1, [{ name: "prop1", initializer: "4" }],
                "const t = {\n    prop: 5,\n    prop1: 4\n};");
        });
    });

    describe(nameof<ObjectLiteralExpression>(e => e.insertPropertyAssignment), () => {
        function doTest(text: string, index: number, structure: PropertyAssignmentStructure, expectedText: string) {
            const {sourceFile, objectLiteralExpression} = getObjectLiteralExpression(text);
            const result = objectLiteralExpression.insertPropertyAssignment(index, structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result).to.be.instanceOf(PropertyAssignment);
        }

        it("should insert a property assignment", () => {
            doTest("const t = {\n    prop2: 5\n};", 0, { name: "prop1", initializer: "4" },
                "const t = {\n    prop1: 4,\n    prop2: 5\n};");
        });
    });

    describe(nameof<ObjectLiteralExpression>(e => e.addPropertyAssignments), () => {
        function doTest(text: string, structures: PropertyAssignmentStructure[], expectedText: string) {
            const {sourceFile, objectLiteralExpression} = getObjectLiteralExpression(text);
            const result = objectLiteralExpression.addPropertyAssignments(structures);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result.length).to.deep.equal(structures.length);
        }

        it("should add property assignments", () => {
            doTest("const t = {\n    prop1: 5\n};", [{ name: "prop2", initializer: "3" }, { name: "prop3", initializer: "2" }],
                "const t = {\n    prop1: 5,\n    prop2: 3,\n    prop3: 2\n};");
        });
    });

    describe(nameof<ObjectLiteralExpression>(e => e.addPropertyAssignment), () => {
        function doTest(text: string, structure: PropertyAssignmentStructure, expectedText: string) {
            const {sourceFile, objectLiteralExpression} = getObjectLiteralExpression(text);
            const result = objectLiteralExpression.addPropertyAssignment(structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result).to.be.instanceOf(PropertyAssignment);
        }

        it("should add a property assignment", () => {
            doTest("const t = {\n    prop1: 5\n};", { name: "prop2", initializer: "2" },
                "const t = {\n    prop1: 5,\n    prop2: 2\n};");
        });
    });

    /* Shorthand Property Assignments */

    describe(nameof<ObjectLiteralExpression>(e => e.insertShorthandPropertyAssignments), () => {
        function doTest(text: string, index: number, structures: ShorthandPropertyAssignmentStructure[], expectedText: string) {
            const {sourceFile, objectLiteralExpression} = getObjectLiteralExpression(text);
            const result = objectLiteralExpression.insertShorthandPropertyAssignments(index, structures);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result.length).to.deep.equal(structures.length);
        }

        it("should insert the shorthand property assignments in the middle", () => {
            doTest("const t = {\n    prop: 5,\n    prop4\n};", 1, [{ name: "prop2" }, { name: "prop3" }],
                "const t = {\n    prop: 5,\n    prop2,\n    prop3,\n    prop4\n};");
        });
    });

    describe(nameof<ObjectLiteralExpression>(e => e.insertShorthandPropertyAssignment), () => {
        function doTest(text: string, index: number, structure: ShorthandPropertyAssignmentStructure, expectedText: string) {
            const {sourceFile, objectLiteralExpression} = getObjectLiteralExpression(text);
            const result = objectLiteralExpression.insertShorthandPropertyAssignment(index, structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result).to.be.instanceOf(ShorthandPropertyAssignment);
        }

        it("should insert a shorthand property assignment", () => {
            doTest("const t = {\n    prop2: 5\n};", 0, { name: "prop1" },
                "const t = {\n    prop1,\n    prop2: 5\n};");
        });
    });

    describe(nameof<ObjectLiteralExpression>(e => e.addShorthandPropertyAssignments), () => {
        function doTest(text: string, structures: ShorthandPropertyAssignmentStructure[], expectedText: string) {
            const {sourceFile, objectLiteralExpression} = getObjectLiteralExpression(text);
            const result = objectLiteralExpression.addShorthandPropertyAssignments(structures);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result.length).to.deep.equal(structures.length);
        }

        it("should add shorthand property assignments", () => {
            doTest("const t = {\n    prop1: 5\n};", [{ name: "prop2" }, { name: "prop3" }],
                "const t = {\n    prop1: 5,\n    prop2,\n    prop3\n};");
        });
    });

    describe(nameof<ObjectLiteralExpression>(e => e.addShorthandPropertyAssignment), () => {
        function doTest(text: string, structure: ShorthandPropertyAssignmentStructure, expectedText: string) {
            const {sourceFile, objectLiteralExpression} = getObjectLiteralExpression(text);
            const result = objectLiteralExpression.addShorthandPropertyAssignment(structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result).to.be.instanceOf(ShorthandPropertyAssignment);
        }

        it("should add a shorthand property assignment", () => {
            doTest("const t = {\n    prop1: 5\n};", { name: "prop2" },
                "const t = {\n    prop1: 5,\n    prop2\n};");
        });
    });

    /* Spread Assignments */

    describe(nameof<ObjectLiteralExpression>(e => e.insertSpreadAssignments), () => {
        function doTest(text: string, index: number, structures: SpreadAssignmentStructure[], expectedText: string) {
            const {sourceFile, objectLiteralExpression} = getObjectLiteralExpression(text);
            const result = objectLiteralExpression.insertSpreadAssignments(index, structures);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result.length).to.deep.equal(structures.length);
        }

        it("should insert the spread assignments in the middle", () => {
            doTest("const t = {\n    prop: 5,\n    prop4\n};", 1, [{ expression: "prop2" }, { expression: "prop3" }],
                "const t = {\n    prop: 5,\n    ...prop2,\n    ...prop3,\n    prop4\n};");
        });
    });

    describe(nameof<ObjectLiteralExpression>(e => e.insertSpreadAssignment), () => {
        function doTest(text: string, index: number, structure: SpreadAssignmentStructure, expectedText: string) {
            const {sourceFile, objectLiteralExpression} = getObjectLiteralExpression(text);
            const result = objectLiteralExpression.insertSpreadAssignment(index, structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result).to.be.instanceOf(SpreadAssignment);
        }

        it("should insert a spread assignment", () => {
            doTest("const t = {\n    prop2: 5\n};", 0, { expression: "prop1" },
                "const t = {\n    ...prop1,\n    prop2: 5\n};");
        });
    });

    describe(nameof<ObjectLiteralExpression>(e => e.addSpreadAssignments), () => {
        function doTest(text: string, structures: SpreadAssignmentStructure[], expectedText: string) {
            const {sourceFile, objectLiteralExpression} = getObjectLiteralExpression(text);
            const result = objectLiteralExpression.addSpreadAssignments(structures);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result.length).to.deep.equal(structures.length);
        }

        it("should add spread assignments", () => {
            doTest("const t = {\n    prop1: 5\n};", [{ expression: "prop2" }, { expression: "prop3" }],
                "const t = {\n    prop1: 5,\n    ...prop2,\n    ...prop3\n};");
        });
    });

    describe(nameof<ObjectLiteralExpression>(e => e.addSpreadAssignment), () => {
        function doTest(text: string, structure: SpreadAssignmentStructure, expectedText: string) {
            const {sourceFile, objectLiteralExpression} = getObjectLiteralExpression(text);
            const result = objectLiteralExpression.addSpreadAssignment(structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result).to.be.instanceOf(SpreadAssignment);
        }

        it("should add a spread assignment", () => {
            doTest("const t = {\n    prop1: 5\n};", { expression: "prop2" },
                "const t = {\n    prop1: 5,\n    ...prop2\n};");
        });
    });

    /* Methods */

    describe(nameof<ObjectLiteralExpression>(e => e.insertMethods), () => {
        function doTest(text: string, index: number, structures: MethodDeclarationStructure[], expectedText: string) {
            const {sourceFile, objectLiteralExpression} = getObjectLiteralExpression(text);
            const result = objectLiteralExpression.insertMethods(index, structures);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result.length).to.deep.equal(structures.length);
        }

        it("should insert the methods in the middle", () => {
            doTest("const t = {\n    prop: 5,\n    prop4\n};", 1, [{ name: "prop2" }, { name: "prop3" }],
                "const t = {\n    prop: 5,\n    prop2() {\n    },\n    prop3() {\n    },\n    prop4\n};");
        });
    });

    describe(nameof<ObjectLiteralExpression>(e => e.insertMethod), () => {
        function doTest(text: string, index: number, structure: MethodDeclarationStructure, expectedText: string) {
            const {sourceFile, objectLiteralExpression} = getObjectLiteralExpression(text);
            const result = objectLiteralExpression.insertMethod(index, structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result).to.be.instanceOf(MethodDeclaration);
        }

        it("should insert a method", () => {
            doTest("const t = {\n    prop2: 5\n};", 0, { name: "prop1" },
                "const t = {\n    prop1() {\n    },\n    prop2: 5\n};");
        });
    });

    describe(nameof<ObjectLiteralExpression>(e => e.addMethods), () => {
        function doTest(text: string, structures: MethodDeclarationStructure[], expectedText: string) {
            const {sourceFile, objectLiteralExpression} = getObjectLiteralExpression(text);
            const result = objectLiteralExpression.addMethods(structures);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result.length).to.deep.equal(structures.length);
        }

        it("should add methods", () => {
            doTest("const t = {\n    prop1: 5\n};", [{ name: "prop2" }, { name: "prop3" }],
                "const t = {\n    prop1: 5,\n    prop2() {\n    },\n    prop3() {\n    }\n};");
        });
    });

    describe(nameof<ObjectLiteralExpression>(e => e.addMethod), () => {
        function doTest(text: string, structure: MethodDeclarationStructure, expectedText: string) {
            const {sourceFile, objectLiteralExpression} = getObjectLiteralExpression(text);
            const result = objectLiteralExpression.addMethod(structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result).to.be.instanceOf(MethodDeclaration);
        }

        it("should add a method", () => {
            doTest("const t = {\n    prop1: 5\n};", { name: "prop2" },
                "const t = {\n    prop1: 5,\n    prop2() {\n    }\n};");
        });
    });

    /* Get Accessor */

    describe(nameof<ObjectLiteralExpression>(e => e.insertGetAccessors), () => {
        function doTest(text: string, index: number, structures: GetAccessorDeclarationStructure[], expectedText: string) {
            const {sourceFile, objectLiteralExpression} = getObjectLiteralExpression(text);
            const result = objectLiteralExpression.insertGetAccessors(index, structures);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result.length).to.deep.equal(structures.length);
        }

        it("should insert the get accessors in the middle", () => {
            doTest("const t = {\n    prop: 5,\n    prop4\n};", 1, [{ name: "prop2" }, { name: "prop3" }],
                "const t = {\n    prop: 5,\n    get prop2() {\n    },\n    get prop3() {\n    },\n    prop4\n};");
        });
    });

    describe(nameof<ObjectLiteralExpression>(e => e.insertGetAccessor), () => {
        function doTest(text: string, index: number, structure: GetAccessorDeclarationStructure, expectedText: string) {
            const {sourceFile, objectLiteralExpression} = getObjectLiteralExpression(text);
            const result = objectLiteralExpression.insertGetAccessor(index, structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result).to.be.instanceOf(GetAccessorDeclaration);
        }

        it("should insert a get accessor", () => {
            doTest("const t = {\n    prop2: 5\n};", 0, { name: "prop1" },
                "const t = {\n    get prop1() {\n    },\n    prop2: 5\n};");
        });
    });

    describe(nameof<ObjectLiteralExpression>(e => e.addGetAccessors), () => {
        function doTest(text: string, structures: GetAccessorDeclarationStructure[], expectedText: string) {
            const {sourceFile, objectLiteralExpression} = getObjectLiteralExpression(text);
            const result = objectLiteralExpression.addGetAccessors(structures);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result.length).to.deep.equal(structures.length);
        }

        it("should add get accessors", () => {
            doTest("const t = {\n    prop1: 5\n};", [{ name: "prop2" }, { name: "prop3" }],
                "const t = {\n    prop1: 5,\n    get prop2() {\n    },\n    get prop3() {\n    }\n};");
        });
    });

    describe(nameof<ObjectLiteralExpression>(e => e.addGetAccessor), () => {
        function doTest(text: string, structure: GetAccessorDeclarationStructure, expectedText: string) {
            const {sourceFile, objectLiteralExpression} = getObjectLiteralExpression(text);
            const result = objectLiteralExpression.addGetAccessor(structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result).to.be.instanceOf(GetAccessorDeclaration);
        }

        it("should add a get accessor", () => {
            doTest("const t = {\n    prop1: 5\n};", { name: "prop2" },
                "const t = {\n    prop1: 5,\n    get prop2() {\n    }\n};");
        });
    });

    /* Set Accessor */

    describe(nameof<ObjectLiteralExpression>(e => e.insertSetAccessors), () => {
        function doTest(text: string, index: number, structures: SetAccessorDeclarationStructure[], expectedText: string) {
            const {sourceFile, objectLiteralExpression} = getObjectLiteralExpression(text);
            const result = objectLiteralExpression.insertSetAccessors(index, structures);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result.length).to.deep.equal(structures.length);
        }

        it("should insert the set accessors in the middle", () => {
            doTest("const t = {\n    prop: 5,\n    prop4\n};", 1, [{ name: "prop2" }, { name: "prop3" }],
                "const t = {\n    prop: 5,\n    set prop2() {\n    },\n    set prop3() {\n    },\n    prop4\n};");
        });
    });

    describe(nameof<ObjectLiteralExpression>(e => e.insertSetAccessor), () => {
        function doTest(text: string, index: number, structure: SetAccessorDeclarationStructure, expectedText: string) {
            const {sourceFile, objectLiteralExpression} = getObjectLiteralExpression(text);
            const result = objectLiteralExpression.insertSetAccessor(index, structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result).to.be.instanceOf(SetAccessorDeclaration);
        }

        it("should insert a set accessor", () => {
            doTest("const t = {\n    prop2: 5\n};", 0, { name: "prop1" },
                "const t = {\n    set prop1() {\n    },\n    prop2: 5\n};");
        });
    });

    describe(nameof<ObjectLiteralExpression>(e => e.addSetAccessors), () => {
        function doTest(text: string, structures: SetAccessorDeclarationStructure[], expectedText: string) {
            const {sourceFile, objectLiteralExpression} = getObjectLiteralExpression(text);
            const result = objectLiteralExpression.addSetAccessors(structures);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result.length).to.deep.equal(structures.length);
        }

        it("should add set accessors", () => {
            doTest("const t = {\n    prop1: 5\n};", [{ name: "prop2" }, { name: "prop3" }],
                "const t = {\n    prop1: 5,\n    set prop2() {\n    },\n    set prop3() {\n    }\n};");
        });
    });

    describe(nameof<ObjectLiteralExpression>(e => e.addSetAccessor), () => {
        function doTest(text: string, structure: SetAccessorDeclarationStructure, expectedText: string) {
            const {sourceFile, objectLiteralExpression} = getObjectLiteralExpression(text);
            const result = objectLiteralExpression.addSetAccessor(structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result).to.be.instanceOf(SetAccessorDeclaration);
        }

        it("should add a set accessor", () => {
            doTest("const t = {\n    prop1: 5\n};", { name: "prop2" },
                "const t = {\n    prop1: 5,\n    set prop2() {\n    }\n};");
        });
    });
});
