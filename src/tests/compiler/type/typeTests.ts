import {expect} from "chai";
import {ts, TypeFlags, ObjectFlags, SymbolFlags, TypeFormatFlags} from "./../../../typescript";
import {Type, VariableStatement, Node, FunctionDeclaration} from "./../../../compiler";
import {VirtualFileSystemHost, DefaultFileSystemHost} from "./../../../fileSystem";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(Type), () => {
    function getInfoFromTextWithTypeChecking<T extends Node>(text: string) {
        return getInfoFromText<T>(text, { host: new VirtualFileSystemHost(), includeLibDts: true, compilerOptions: { strictNullChecks: true } });
    }

    function getTypeFromText(text: string) {
        const result = getInfoFromTextWithTypeChecking<VariableStatement>(text);
        return {...result, firstType: result.firstChild.getDeclarations()[0].getType()};
    }

    describe(nameof<Type>(t => t.compilerType), () => {
        it("should get the compiler type", () => {
            const {firstType} = getTypeFromText("let myType: string;");
            expect(firstType.compilerType.flags).to.equal(TypeFlags.String);
        });
    });

    describe(nameof<Type>(t => t.getText), () => {
        const longType = "string | number | Date | { reallyReallyLooooooonnnnnnnnnnnnggggggggggggggggNnnnnnnaaaaaaaaammmmmmmmmmmeeeeee: string; }";

        it("should get the text", () => {
            const {firstType} = getTypeFromText("let myType: string[];");
            expect(firstType.getText()).to.equal("string[]");
        });

        it("should get the text when providing the enclosing node", () => {
            const {firstChild, firstType} = getTypeFromText(`let myType: ${longType};`);
            expect(firstType.getText(firstChild)).to.equal(longType);
        });

        it("should use the type format flags", () => {
            const {firstChild, firstType} = getTypeFromText(`let myType: ${longType};`);
            expect(firstType.getText(firstChild, TypeFormatFlags.None)).to.equal(longType.substring(0, 97) + "...");
        });
    });

    describe(nameof<Type>(t => t.getProperties), () => {
        it("should get the properties when there are none", () => {
            const {firstType} = getTypeFromText("let myType: {};");
            expect(firstType.getProperties().length).to.equal(0);
        });

        it("should get the properties of a non-object type", () => {
            const {firstType} = getTypeFromText("let myType: 1;");
            expect(firstType.getProperties().length).to.equal(6);
        });

        it("should get the properties when some exist", () => {
            const {firstType} = getTypeFromText("let myType: { str: string; };");
            const props = firstType.getProperties();
            expect(props.length).to.equal(1);
            expect(props[0].getName()).to.equal("str");
        });
    });

    describe(nameof<Type>(t => t.getProperty), () => {
        it("should get the property by name", () => {
            const {firstType} = getTypeFromText("let myType: { str: string; other: number; };");
            const prop = firstType.getProperty("other")!;
            expect(prop.getName()).to.equal("other");
        });

        it("should get the property by function", () => {
            const {firstType} = getTypeFromText("let myType: { str: string; other: number; };");
            const prop = firstType.getProperty(p => p.getName() === "other")!;
            expect(prop.getName()).to.equal("other");
        });
    });

    describe(nameof<Type>(t => t.getApparentProperties), () => {
        it("should return the apparent properties of a type", () => {
            const {firstType} = getTypeFromText("let myType: 1;");
            expect(firstType.getApparentProperties().length).to.equal(6);
        });
    });

    describe(nameof<Type>(t => t.getApparentProperty), () => {
        it("should get the property by name", () => {
            const {firstType} = getTypeFromText("let myType: { str: string; other: number; };");
            const prop = firstType.getApparentProperty("other")!;
            expect(prop.getName()).to.equal("other");
        });

        it("should get the property by function", () => {
            const {firstType} = getTypeFromText("let myType: { str: string; other: number; };");
            const prop = firstType.getApparentProperty(p => p.getName() === "other")!;
            expect(prop.getName()).to.equal("other");
        });
    });

    describe(nameof<Type>(t => t.getUnionTypes), () => {
        it("should get the union types when there aren't any", () => {
            const {firstType} = getTypeFromText("let myType: string;");
            expect(firstType.getUnionTypes().length).to.equal(0);
        });

        it("should get the union types when they exist", () => {
            const {firstType} = getTypeFromText("let myType: string | number;");
            expect(firstType.getUnionTypes().length).to.equal(2);
            expect(firstType.getUnionTypes()[0].getFlags()).to.equal(TypeFlags.String);
            expect(firstType.getUnionTypes()[1].getFlags()).to.equal(TypeFlags.Number);
        });

        it("should not return anything for an intersection type", () => {
            const {firstType} = getTypeFromText("let myType: string & number;");
            expect(firstType.getUnionTypes().length).to.equal(0);
        });
    });

    describe(nameof<Type>(t => t.getIntersectionTypes), () => {
        it("should get the union types when there aren't any", () => {
            const {firstType} = getTypeFromText("let myType: string;");
            expect(firstType.getIntersectionTypes().length).to.equal(0);
        });

        it("should get the union types when they exist", () => {
            const {firstType} = getTypeFromText("let myType: string & number;");
            expect(firstType.getIntersectionTypes().length).to.equal(2);
            expect(firstType.getIntersectionTypes()[0].getFlags()).to.equal(TypeFlags.String);
            expect(firstType.getIntersectionTypes()[1].getFlags()).to.equal(TypeFlags.Number);
        });

        it("should not return anything for a union type", () => {
            const {firstType} = getTypeFromText("let myType: string | number;");
            expect(firstType.getIntersectionTypes().length).to.equal(0);
        });
    });

    describe(nameof<Type>(t => t.isAnonymousType), () => {
        function doTest(text: string, expected: boolean) {
            const {firstType} = getTypeFromText(text);
            expect(firstType.isAnonymousType()).to.equal(expected);
        }

        it("should get when it is an anonymous type", () => {
            doTest("let myType: { str: string; };", true);
        });

        it("should get when it's not an anonymous type", () => {
            doTest("let myType: string;", false);
        });
    });

    describe(nameof<Type>(t => t.isBooleanType), () => {
        function doTest(text: string, expected: boolean) {
            const {firstType} = getTypeFromText(text);
            expect(firstType.isBooleanType()).to.equal(expected);
        }

        it("should get when it is a boolean type", () => {
            doTest("let myType: boolean;", true);
        });

        it("should get when it's not a boolean type", () => {
            doTest("let myType: string;", false);
        });
    });

    describe(nameof<Type>(t => t.isStringType), () => {
        function doTest(text: string, expected: boolean) {
            const {firstType} = getTypeFromText(text);
            expect(firstType.isStringType()).to.equal(expected);
        }

        it("should get when it is a string type", () => {
            doTest("let myType: string;", true);
        });

        it("should get when it's not a string type", () => {
            doTest("let myType: boolean;", false);
        });
    });

    describe(nameof<Type>(t => t.isNumberType), () => {
        function doTest(text: string, expected: boolean) {
            const {firstType} = getTypeFromText(text);
            expect(firstType.isNumberType()).to.equal(expected);
        }

        it("should get when it is a number type", () => {
            doTest("let myType: number;", true);
        });

        it("should get when it's not a number type", () => {
            doTest("let myType: boolean;", false);
        });
    });

    describe(nameof<Type>(t => t.isEnumType), () => {
        function doTest(text: string, expected: boolean) {
            const {firstType} = getTypeFromText(text);
            expect(firstType.isEnumType()).to.equal(expected);
        }

        it("should get when it is an enum type", () => {
            doTest("let myType: MyEnum; enum MyEnum {}", true);
        });

        it("should get when it's not an enum type", () => {
            doTest("let myType: string;", false);
        });
    });

    describe(nameof<Type>(t => t.isInterfaceType), () => {
        function doTest(text: string, expected: boolean) {
            const {firstType} = getTypeFromText(text);
            expect(firstType.isInterfaceType()).to.equal(expected);
        }

        it("should get when it is an interface type", () => {
            doTest("let myType: MyInterface; interface MyInterface {}", true);
        });

        it("should get when it's not an enum type", () => {
            doTest("let myType: string;", false);
        });
    });

    describe(nameof<Type>(t => t.isIntersectionType), () => {
        function doTest(text: string, expected: boolean) {
            const {firstType} = getTypeFromText(text);
            expect(firstType.isIntersectionType()).to.equal(expected);
        }

        it("should get when it is an intersection type", () => {
            doTest("let myType: number & string;", true);
        });

        it("should get when it's not an intersection type", () => {
            doTest("let myType: number | string;", false);
        });
    });

    describe(nameof<Type>(t => t.isObjectType), () => {
        function doTest(text: string, expected: boolean) {
            const {firstType} = getTypeFromText(text);
            expect(firstType.isObjectType()).to.equal(expected);
        }

        it("should get when it is an object type", () => {
            doTest("let myType: { str: string; };", true);
        });

        it("should get when it's not an object type", () => {
            doTest("let myType: number;", false);
        });
    });

    describe(nameof<Type>(t => t.isUnionType), () => {
        function doTest(text: string, expected: boolean) {
            const {firstType} = getTypeFromText(text);
            expect(firstType.isUnionType()).to.equal(expected);
        }

        it("should get when it is a union type", () => {
            doTest("let myType: number | string;", true);
        });

        it("should get when it's not a union type", () => {
            doTest("let myType: number & string;", false);
        });
    });

    describe(nameof<Type>(t => t.getFlags), () => {
        it("should get the type flags", () => {
            const {firstType} = getTypeFromText("let myType: number;");
            expect(firstType.getFlags()).to.equal(TypeFlags.Number);
        });
    });

    describe(nameof<Type>(t => t.getObjectFlags), () => {
        it("should get the object flags when not an object", () => {
            const {firstType} = getTypeFromText("let myType: number;");
            expect(firstType.getObjectFlags()).to.equal(0);
        });

        it("should get the object flags when an object", () => {
            const {firstType} = getTypeFromText("let myType: MyInterface; interface MyInterface {}");
            expect(firstType.getObjectFlags()).to.equal(ObjectFlags.Interface);
        });
    });

    describe(nameof<Type>(t => t.getSymbol), () => {
        it("should get symbol when it has one", () => {
            const {firstType} = getTypeFromText("let myType: MyClass; class MyClass {}");
            expect(firstType.getSymbol()!.getName()).to.equal("MyClass");
        });

        it("should return undefined when it doesn't have one", () => {
            const {firstType} = getTypeFromText("let myType: string;");
            expect(firstType.getSymbol()).to.be.undefined;
        });
    });

    describe(nameof<Type>(t => t.getSymbolOrThrow), () => {
        it("should get symbol when it has one", () => {
            const {firstType} = getTypeFromText("let myType: MyClass; class MyClass {}");
            expect(firstType.getSymbolOrThrow().getName()).to.equal("MyClass");
        });

        it("should return undefined when it doesn't have one", () => {
            const {firstType} = getTypeFromText("let myType: string;");
            expect(() => firstType.getSymbolOrThrow()).to.throw();
        });
    });

    describe(nameof<Type>(t => t.getApparentType), () => {
        it("should get the apparent type", () => {
            const {firstType} = getTypeFromText(`const myType = 4;`);
            expect(firstType.getApparentType().getText()).to.equal("Number");
        });
    });

    describe(nameof<Type>(t => t.getCallSignatures), () => {
        it("should return no call signatures when none exist", () => {
            const {firstType} = getTypeFromText("let myType: string;");
            expect(firstType.getCallSignatures().length).to.equal(0);
        });

        it("should return the call signatures of a type", () => {
            const {firstType} = getTypeFromText("let myType: () => string;");
            expect(firstType.getCallSignatures().length).to.equal(1);
        });
    });

    describe(nameof<Type>(t => t.getConstructSignatures), () => {
        it("should return no construct signatures when none exist", () => {
            const {firstType} = getTypeFromText("let myType: string;");
            expect(firstType.getConstructSignatures().length).to.equal(0);
        });

        it("should return the construct signatures of a type", () => {
            const {firstType} = getTypeFromText("let myType: { new(): MyClass; };");
            expect(firstType.getConstructSignatures().length).to.equal(1);
        });
    });

    describe(nameof<Type>(t => t.getBaseTypes), () => {
        it("should return the base types of a type", () => {
            const {firstType} = getTypeFromText("let myType: MyInterface; interface MyInterface extends OtherInterface {}\ninterface OtherInterface");
            const baseTypes = firstType.getBaseTypes();
            expect(baseTypes.length).to.equal(1);
            expect(baseTypes[0].getText()).to.equal("OtherInterface");
        });
    });

    describe(nameof<Type>(t => t.getStringIndexType), () => {
        it("should return undefined when no string index type", () => {
            const {firstType} = getTypeFromText("let myType: { };");
            const stringIndexType = firstType.getStringIndexType();
            expect(stringIndexType).to.be.undefined;
        });

        it("should return the string index type", () => {
            const {firstType} = getTypeFromText("let myType: { [index: string]: object; [index: number]: Date; };");
            const stringIndexType = firstType.getStringIndexType()!;
            expect(stringIndexType.getText()).to.equal("object");
        });
    });

    describe(nameof<Type>(t => t.getNumberIndexType), () => {
        it("should return undefined when no number index type", () => {
            const {firstType} = getTypeFromText("let myType: { };");
            const numberIndexType = firstType.getNumberIndexType();
            expect(numberIndexType).to.be.undefined;
        });

        it("should return the number index type", () => {
            const {firstType} = getTypeFromText("let myType: { [index: string]: object; [index: number]: Date; };");
            const numberIndexType = firstType.getNumberIndexType()!;
            expect(numberIndexType.getText()).to.equal("Date");
        });
    });

    describe(nameof<Type>(t => t.getNonNullableType), () => {
        function doTest(typeStr: string, expected: string) {
            const {firstType} = getTypeFromText(`let myType: ${typeStr};`);
            const nonNullableType = firstType.getNonNullableType();
            expect(nonNullableType.getText()).to.equal(expected);
        }

        it("should return the original type for a type that's already non-nullable", () => {
            doTest("string", "string");
        });

        it("should return the non-nullable type for undefined", () => {
            doTest("string | undefined", "string");
        });

        it("should return the non-nullable type for null", () => {
            doTest("string | null", "string");
        });

        it("should return the non-nullable type for null and undefined", () => {
            doTest("string | null | undefined", "string");
        });
    });

    describe(nameof<Type>(t => t.isNullable), () => {
        function doTest(typeStr: string, expected: boolean) {
            const {firstType} = getTypeFromText(`let myType: ${typeStr};`);
            expect(firstType.isNullable()).to.equal(expected);
        }

        it("should return false for a non-nullable type", () => {
            doTest("string", false);
        });

        it("should return true for undefined", () => {
            doTest("string | undefined", true);
        });

        it("should return true for null", () => {
            doTest("string | null", true);
        });

        it("should return true for null and undefined", () => {
            doTest("string | null | undefined", true);
        });

        it("should return true for an optional property", () => {
            const {firstChild} = getInfoFromTextWithTypeChecking<FunctionDeclaration>("function test(param?: string) {}");
            expect(firstChild.getParameters()[0].getType().isNullable()).to.equal(true);
        });
    });

    describe(nameof<Type>(t => t.getAliasSymbol), () => {
        it("should return the alias symbol when it exists", () => {
            const {firstType} = getTypeFromText("let myType: MyAlias; type MyAlias = {str: string;};");
            expect(firstType.getAliasSymbol()!.getFlags()).to.equal(SymbolFlags.TypeAlias);
        });

        it("should return undefined when not exists", () => {
            const {firstType} = getTypeFromText("let myType: string;");
            expect(firstType.getAliasSymbol()).to.be.undefined;
        });
    });

    describe(nameof<Type>(t => t.getAliasSymbolOrThrow), () => {
        it("should return the alias symbol when it exists", () => {
            const {firstType} = getTypeFromText("let myType: MyAlias; type MyAlias = {str: string;};");
            expect(firstType.getAliasSymbolOrThrow().getFlags()).to.equal(SymbolFlags.TypeAlias);
        });

        it("should throw when not exists", () => {
            const {firstType} = getTypeFromText("let myType: string;");
            expect(() => firstType.getAliasSymbolOrThrow()).to.throw();
        });
    });

    describe(nameof<Type>(t => t.getAliasTypeArguments), () => {
        it("should not have any when none exist", () => {
            const {firstType} = getTypeFromText("let myType: string;");
            expect(firstType.getAliasTypeArguments().length).to.equal(0);
        });

        it("should return the type args when they exist", () => {
            const {firstType} = getTypeFromText("let myType: MyAlias<string>; type MyAlias<T> = {str: T;};");
            const typeArgs = firstType.getAliasTypeArguments();
            expect(typeArgs.length).to.equal(1);
            expect(typeArgs[0].getText()).to.equal("string");
        });
    });

    describe(nameof<Type>(t => t.isUndefinedType), () => {
        it("should not be undefined when not undefined", () => {
            const {firstType} = getTypeFromText("let myType: string;");
            expect(firstType.isUndefinedType()).to.be.false;
        });

        it("should be undefined when not undefined", () => {
            const {firstType} = getTypeFromText("let myType: undefined;");
            expect(firstType.isUndefinedType()).to.be.true;
        });
    });
});
