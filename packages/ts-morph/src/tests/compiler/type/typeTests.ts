import { InMemoryFileSystemHost, ObjectFlags, SymbolFlags, TypeFlags, TypeFormatFlags } from "@ts-morph/common";
import { expect } from "chai";
import { FunctionDeclaration, Node, Type, TypeAliasDeclaration, VariableStatement, Symbol } from "../../../compiler";
import { getInfoFromText } from "../testHelpers";

describe(nameof(Type), () => {
    function getInfoFromTextWithTypeChecking<T extends Node>(text: string) {
        return getInfoFromText<T>(text, {
            host: new InMemoryFileSystemHost({ skipLoadingLibFiles: true }),
            includeLibDts: true,
            compilerOptions: { strictNullChecks: true }
        });
    }

    function getTypeFromText(text: string) {
        const result = getInfoFromTextWithTypeChecking<VariableStatement>(text);
        return { ...result, firstType: result.firstChild.getDeclarations()[0].getType() };
    }

    function getTypeAliasTypeFromText(text: string) {
        const result = getInfoFromTextWithTypeChecking<TypeAliasDeclaration>(text);
        return { ...result, firstType: result.firstChild.getTypeNodeOrThrow().getType() };
    }

    // todo: move all the tests to happen in here because this will speed up the tests quite a lot
    describe("fast test", () => {
        const text = `
enum EmptyEnum { }
enum MyEnum { value, value2, value3 }
interface MyInterface { prop: string; }
interface MyInterface2 { prop2: string; }
class MyClass {}

let anonymousType: { str: string; };
let anyType: any;
let stringType: string;
let booleanType: boolean;
let numberType: number;
let booleanLiteralType: true;
let numberLiteralType: 5;
let stringLiteralType: 'test';
let emptyEnumType: EmptyEnum;
let enumType: MyEnum;
let enumIncompleteUnionType: MyEnum.value | MyEnum.value2;
let enumCompleteUnionType: MyEnum.value | MyEnum.value2 | MyEnum.value3;
let enumLiteralType: MyEnum.value;
let interfaceType: MyInterface;
let intersectionType: MyInterface & MyInterface2;
let unionType: string | number;
let objectType: { prop: string; };
let tupleType: [string];
let tupleTypeMultiple: [string, number];
let genericArrayType: Array<string>;
let arrayType: string[];
let arrayTypeOfTuples: [string][];
let undefinedType: undefined;
let classType: MyClass;
let functionType: () => string;
let constructorType: { new(): MyClass; };
let indexedType: { [index: string]: object; [index: number]: Date; }
let emptyObjectType: { };
let stringWithUndefinedType: string | undefined;
let stringWithNullType: string | null;
let stringWithUndefinedAndNullType: string | undefined | null;
let unknownType: unknown;
`;
        const { sourceFile } = getInfoFromTextWithTypeChecking(text);
        const typesByName: { [name: string]: Type; } = {};
        for (const dec of sourceFile.getVariableDeclarations())
            typesByName[dec.getName()] = dec.getType();

        describe(nameof<Type>(t => t.compilerType), () => {
            it("should get the compiler type", () => {
                expect(typesByName["stringType"].compilerType.flags).to.equal(TypeFlags.String);
            });
        });

        describe(nameof<Type>(t => t.getUnionTypes), () => {
            it("should get them when there aren't any", () => {
                expect(typesByName["stringType"].getUnionTypes().length).to.equal(0);
            });

            it("should get them when they exist", () => {
                const firstType = typesByName["unionType"];
                expect(firstType.getUnionTypes().length).to.equal(2);
                expect(firstType.getUnionTypes()[0].getFlags()).to.equal(TypeFlags.String);
                expect(firstType.getUnionTypes()[1].getFlags()).to.equal(TypeFlags.Number);
            });

            it("should not return anything for an intersection type", () => {
                expect(typesByName["intersectionType"].getUnionTypes().length).to.equal(0);
            });
        });

        describe(nameof<Type>(t => t.getIntersectionTypes), () => {
            it("should get them when there aren't any", () => {
                expect(typesByName["stringType"].getIntersectionTypes().length).to.equal(0);
            });

            it("should get them when they exist", () => {
                const firstType = typesByName["intersectionType"];
                expect(firstType.getIntersectionTypes().length).to.equal(2);
                expect(firstType.getIntersectionTypes()[0].getText()).to.equal("MyInterface");
                expect(firstType.getIntersectionTypes()[1].getText()).to.equal("MyInterface2");
            });

            it("should not return anything for a union type", () => {
                expect(typesByName["unionType"].getIntersectionTypes().length).to.equal(0);
            });
        });

        describe(nameof<Type>(t => t.isAnonymous), () => {
            function doTest(typeName: string, expected: boolean) {
                expect(typesByName[typeName].isAnonymous()).to.equal(expected);
            }

            it("should get when it is an anonymous type", () => {
                doTest("anonymousType", true);
            });

            it("should get when it's not an anonymous type", () => {
                doTest("stringType", false);
            });
        });

        describe(nameof<Type>(t => t.isAny), () => {
            function doTest(typeName: string, expected: boolean) {
                expect(typesByName[typeName].isAny()).to.equal(expected);
            }

            it("should be when any", () => {
                doTest("anyType", true);
            });

            it("should not be when not any", () => {
                doTest("stringType", false);
            });
        });

        describe(nameof<Type>(t => t.isBoolean), () => {
            function doTest(typeName: string, expected: boolean) {
                expect(typesByName[typeName].isBoolean()).to.equal(expected);
            }

            it("should get when it is a boolean type", () => {
                doTest("booleanType", true);
            });

            it("should get when it's not a boolean type", () => {
                doTest("stringType", false);
            });
        });

        describe(nameof<Type>(t => t.isString), () => {
            function doTest(typeName: string, expected: boolean) {
                expect(typesByName[typeName].isString()).to.equal(expected);
            }

            it("should get when it is a string type", () => {
                doTest("stringType", true);
            });

            it("should get when it's not a string type", () => {
                doTest("booleanType", false);
            });
        });

        describe(nameof<Type>(t => t.isNumber), () => {
            function doTest(typeName: string, expected: boolean) {
                expect(typesByName[typeName].isNumber()).to.equal(expected);
            }

            it("should get when it is a number type", () => {
                doTest("numberType", true);
            });

            it("should get when it's not a number type", () => {
                doTest("booleanType", false);
            });
        });

        describe(nameof<Type>(t => t.isLiteral), () => {
            function doTest(typeName: string, expected: boolean) {
                expect(typesByName[typeName].isLiteral()).to.equal(expected);
            }

            it("should get when it is a boolean literal", () => {
                doTest("booleanLiteralType", true);
            });

            it("should get when it is a string literal", () => {
                doTest("stringLiteralType", true);
            });

            it("should get when it is an enum literal", () => {
                doTest("enumLiteralType", true);
            });

            it("should get when it is a number literal", () => {
                doTest("numberLiteralType", true);
            });

            it("should get when it's not", () => {
                doTest("booleanType", false);
            });
        });

        describe(nameof<Type>(t => t.isBooleanLiteral), () => {
            function doTest(typeName: string, expected: boolean) {
                expect(typesByName[typeName].isBooleanLiteral()).to.equal(expected);
            }

            it("should get when it is", () => {
                doTest("booleanLiteralType", true);
            });

            it("should get when it's not", () => {
                doTest("booleanType", false);
            });
        });

        describe(nameof<Type>(t => t.isEnumLiteral), () => {
            function doTest(typeName: string, expected: boolean) {
                expect(typesByName[typeName].isEnumLiteral()).to.equal(expected);
            }

            it("should get when it is", () => {
                doTest("enumLiteralType", true);
            });

            it("should not for an enum type", () => {
                doTest("enumType", false);
            });

            it("should not be for a union of literals", () => {
                doTest("enumIncompleteUnionType", false);
            });

            it("should not be for a number literal", () => {
                doTest("numberLiteralType", false);
            });
        });

        describe(nameof<Type>(t => t.isStringLiteral), () => {
            function doTest(typeName: string, expected: boolean) {
                expect(typesByName[typeName].isStringLiteral()).to.equal(expected);
            }

            it("should get when it is", () => {
                doTest("stringLiteralType", true);
            });

            it("should get when it's not", () => {
                doTest("stringType", false);
            });
        });

        describe(nameof<Type>(t => t.isNumberLiteral), () => {
            function doTest(typeName: string, expected: boolean) {
                expect(typesByName[typeName].isNumberLiteral()).to.equal(expected);
            }

            it("should get when it is", () => {
                doTest("numberLiteralType", true);
            });

            it("should get when it's not", () => {
                doTest("numberType", false);
            });
        });

        describe(nameof<Type>(t => t.isClass), () => {
            function doTest(typeName: string, expected: boolean) {
                expect(typesByName[typeName].isClass()).to.equal(expected);
            }

            it("should get when it is", () => {
                doTest("classType", true);
            });

            it("should get when it's not", () => {
                doTest("interfaceType", false);
            });
        });

        describe(nameof<Type>(t => t.isClassOrInterface), () => {
            function doTest(typeName: string, expected: boolean) {
                expect(typesByName[typeName].isClassOrInterface()).to.equal(expected);
            }

            it("should get when it is a class", () => {
                doTest("classType", true);
            });

            it("should get when it is an interface", () => {
                doTest("interfaceType", true);
            });

            it("should get when it's not", () => {
                doTest("enumType", false);
            });
        });

        describe(nameof<Type>(t => t.isEnum), () => {
            function doTest(typeName: string, expected: boolean) {
                expect(typesByName[typeName].isEnum()).to.equal(expected);
            }

            it("should get when it is an enum type", () => {
                doTest("enumType", true);
            });

            it("should get when it is an empty enum type", () => {
                doTest("emptyEnumType", true);
            });

            it("should not be when a union of some enum values, but not all", () => {
                doTest("enumIncompleteUnionType", false);
            });

            it("should be when a union of all the enum values", () => {
                doTest("enumCompleteUnionType", true);
            });

            it("should get when it's not an enum type", () => {
                doTest("enumLiteralType", false);
            });
        });

        describe(nameof<Type>(t => t.isInterface), () => {
            function doTest(typeName: string, expected: boolean) {
                expect(typesByName[typeName].isInterface()).to.equal(expected);
            }

            it("should get when it is", () => {
                doTest("interfaceType", true);
            });

            it("should get when it's not", () => {
                doTest("stringType", false);
            });
        });

        describe(nameof<Type>(t => t.isIntersection), () => {
            function doTest(typeName: string, expected: boolean) {
                expect(typesByName[typeName].isIntersection()).to.equal(expected);
            }

            it("should get when it is an intersection type", () => {
                doTest("intersectionType", true);
            });

            it("should get when it's not an intersection type", () => {
                doTest("unionType", false);
            });
        });

        describe(nameof<Type>(t => t.isUnion), () => {
            function doTest(typeName: string, expected: boolean) {
                expect(typesByName[typeName].isUnion()).to.equal(expected);
            }

            it("should get when it is a union type", () => {
                doTest("unionType", true);
            });

            it("should get when it's not a union type", () => {
                doTest("intersectionType", false);
            });
        });

        describe(nameof<Type>(t => t.isUnionOrIntersection), () => {
            function doTest(typeName: string, expected: boolean) {
                expect(typesByName[typeName].isUnionOrIntersection()).to.equal(expected);
            }

            it("should get when it is a union type", () => {
                doTest("unionType", true);
            });

            it("should get when it is an intersection type", () => {
                doTest("unionType", true);
            });

            it("should get when it's not either", () => {
                doTest("objectType", false);
            });
        });

        describe(nameof<Type>(t => t.isObject), () => {
            function doTest(typeName: string, expected: boolean) {
                expect(typesByName[typeName].isObject()).to.equal(expected);
            }

            it("should get when it is an object type", () => {
                doTest("objectType", true);
            });

            it("should get when it's not an object type", () => {
                doTest("numberType", false);
            });
        });

        describe(nameof<Type>(t => t.isTuple), () => {
            function doTest(typeName: string, expected: boolean) {
                expect(typesByName[typeName].isTuple()).to.equal(expected);
            }

            it("should be when tuple and one element", () => {
                doTest("tupleType", true);
            });

            it("should be when tuple and multiple", () => {
                doTest("tupleTypeMultiple", true);
            });

            it("should not be when not an array", () => {
                doTest("arrayType", false);
            });

            it("should not be when not an array of tuples", () => {
                doTest("arrayTypeOfTuples", false);
            });

            it("should not be when not tuple", () => {
                doTest("stringType", false);
            });
        });

        describe(nameof<Type>(t => t.isUndefined), () => {
            function doTest(typeName: string, expected: boolean) {
                expect(typesByName[typeName].isUndefined()).to.equal(expected);
            }

            it("should be when undefined", () => {
                doTest("undefinedType", true);
            });

            it("should not be when not undefined", () => {
                doTest("stringType", false);
            });
        });

        describe(nameof<Type>(t => t.isUnknown), () => {
            function doTest(typeName: string, expected: boolean) {
                expect(typesByName[typeName].isUnknown()).to.equal(expected);
            }

            it("should get when it is", () => {
                doTest("unknownType", true);
            });

            it("should get when it's not", () => {
                doTest("anyType", false);
            });
        });

        describe(nameof<Type>(t => t.getFlags), () => {
            it("should get the type flags", () => {
                expect(typesByName["numberType"].getFlags()).to.equal(TypeFlags.Number);
            });
        });

        describe(nameof<Type>(t => t.getObjectFlags), () => {
            it("should get the object flags when not an object", () => {
                expect(typesByName["numberType"].getObjectFlags()).to.equal(0);
            });

            it("should get the object flags when an object", () => {
                expect(typesByName["interfaceType"].getObjectFlags()).to.equal(ObjectFlags.Interface);
            });
        });

        describe(nameof<Type>(t => t.getSymbol), () => {
            it("should get symbol when it has one", () => {
                expect(typesByName["classType"].getSymbol()!.getName()).to.equal("MyClass");
            });

            it("should return undefined when it doesn't have one", () => {
                expect(typesByName["stringType"].getSymbol()).to.be.undefined;
            });
        });

        describe(nameof<Type>(t => t.getSymbolOrThrow), () => {
            it("should get symbol when it has one", () => {
                expect(typesByName["classType"].getSymbolOrThrow().getName()).to.equal("MyClass");
            });

            it("should return undefined when it doesn't have one", () => {
                expect(() => typesByName["stringType"].getSymbolOrThrow()).to.throw();
            });
        });

        describe(nameof<Type>(t => t.getApparentType), () => {
            it("should get the apparent type", () => {
                expect(typesByName["numberType"].getApparentType().getText()).to.equal("Number");
            });
        });

        describe(nameof<Type>(t => t.getCallSignatures), () => {
            it("should return no call signatures when none exist", () => {
                expect(typesByName["stringType"].getCallSignatures().length).to.equal(0);
            });

            it("should return the call signatures of a type", () => {
                expect(typesByName["functionType"].getCallSignatures().length).to.equal(1);
            });
        });

        describe(nameof<Type>(t => t.getConstructSignatures), () => {
            it("should return no construct signatures when none exist", () => {
                expect(typesByName["stringType"].getConstructSignatures().length).to.equal(0);
            });

            it("should return the construct signatures of a type", () => {
                expect(typesByName["constructorType"].getConstructSignatures().length).to.equal(1);
            });
        });

        describe(nameof<Type>(t => t.getStringIndexType), () => {
            it("should return undefined when no string index type", () => {
                expect(typesByName["emptyObjectType"].getStringIndexType()).to.be.undefined;
            });

            it("should return the string index type", () => {
                expect(typesByName["indexedType"].getStringIndexType()!.getText()).to.equal("object");
            });
        });

        describe(nameof<Type>(t => t.getNumberIndexType), () => {
            it("should return undefined when it doesn't have one", () => {
                expect(typesByName["emptyObjectType"].getNumberIndexType()).to.be.undefined;
            });

            it("should return when it does", () => {
                expect(typesByName["indexedType"].getNumberIndexType()!.getText()).to.equal("Date");
            });
        });

        describe(nameof<Type>(t => t.getNonNullableType), () => {
            function doTest(typeName: string, expected: string) {
                expect(typesByName[typeName].getNonNullableType().getText()).to.equal(expected);
            }

            it("should return the original type for a type that's already non-nullable", () => {
                doTest("stringType", "string");
            });

            it("should return the non-nullable type for undefined", () => {
                doTest("stringWithUndefinedType", "string");
            });

            it("should return the non-nullable type for null", () => {
                doTest("stringWithNullType", "string");
            });

            it("should return the non-nullable type for null and undefined", () => {
                doTest("stringWithUndefinedAndNullType", "string");
            });
        });

        describe(nameof<Type>(t => t.isNullable), () => {
            function doTest(typeName: string, expected: boolean) {
                expect(typesByName[typeName].isNullable()).to.equal(expected);
            }

            it("should return false for a non-nullable type", () => {
                doTest("stringType", false);
            });

            it("should return true for undefined", () => {
                doTest("stringWithUndefinedType", true);
            });

            it("should return true for null", () => {
                doTest("stringWithNullType", true);
            });

            it("should return true for null and undefined", () => {
                doTest("stringWithUndefinedAndNullType", true);
            });

            it("should return true for an optional property", () => {
                const { firstChild } = getInfoFromTextWithTypeChecking<FunctionDeclaration>("function test(param?: string) {}");
                expect(firstChild.getParameters()[0].getType().isNullable()).to.equal(true);
            });
        });

        describe(nameof<Type>(t => t.getTupleElements), () => {
            function doTest(typeName: string, expected: string[]) {
                expect(typesByName[typeName].getTupleElements().map(t => t.getText())).to.deep.equal(expected);
            }

            it("should get the tuple type's types", () => {
                doTest("tupleTypeMultiple", ["string", "number"]);
            });

            it("should get nothing when not a tuple", () => {
                doTest("stringType", []);
            });

            it("should get nothing for an array type that has type arguments", () => {
                doTest("genericArrayType", []);
            });
        });

        describe(nameof<Type>(t => t.getTypeArguments), () => {
            function doTest(typeName: string, expected: string[]) {
                expect(typesByName[typeName].getTypeArguments().map(t => t.getText())).to.deep.equal(expected);
            }

            it("should get the type arguments for an array", () => {
                doTest("genericArrayType", ["string"]);
            });

            it("should get them for a tuple", () => {
                doTest("tupleTypeMultiple", ["string", "number"]);
            });

            it("should get nothing when no type args", () => {
                doTest("stringType", []);
            });
        });

        describe(nameof<Type>(t => t.getBaseTypeOfLiteralType), () => {
            function doTest(typeName: string, expected: string) {
                expect(typesByName[typeName].getBaseTypeOfLiteralType().getText()).to.equal(expected);
            }

            it("should get it for a number literal", () => {
                doTest("numberLiteralType", "number");
            });

            it("should get it for a boolean literal", () => {
                doTest("booleanLiteralType", "boolean");
            });

            it("should get it for a string literal", () => {
                doTest("stringLiteralType", "string");
            });

            it("should return the same type for a string type", () => {
                doTest("stringType", "string");
            });

            it("should return the same type for any other type", () => {
                doTest("interfaceType", "MyInterface");
            });
        });

        describe(nameof<Type>(t => t.getArrayElementTypeOrThrow), () => {
            function doTest(typeName: string, expected: string | undefined) {
                if (expected == null)
                    expect(() => typesByName[typeName].getArrayElementTypeOrThrow()).to.throw();
                else
                    expect(typesByName[typeName].getArrayElementTypeOrThrow().getText()).to.equal(expected);
            }

            it("should get when exists", () => {
                doTest("arrayType", "string");
            });

            it("should be undefined when not exists", () => {
                doTest("stringType", undefined);
            });
        });

        describe(nameof<Type>(t => t.getArrayElementType), () => {
            function doTest(typeName: string, expected: string | undefined) {
                const type = typesByName[typeName].getArrayElementType();
                expect(type?.getText()).to.equal(expected);
            }

            it("should get when exists", () => {
                doTest("arrayType", "string");
            });

            it("should be undefined when not exists", () => {
                doTest("stringType", undefined);
            });
        });
    });

    describe(nameof<Type>(t => t.getText), () => {
        const repeatedStr = "o".repeat(160 * 2);
        const longType = `string | number | Date | { reallyReallyLoo${repeatedStr}ong: string; }`;

        it("should get the text", () => {
            const { firstType } = getTypeFromText("let myType: string[];");
            expect(firstType.getText()).to.equal("string[]");
        });

        it("should get the text when providing the enclosing node", () => {
            const { firstChild, firstType } = getTypeFromText(`let myType: ${longType};`);
            expect(firstType.getText(firstChild)).to.equal(longType);
        });

        it("should use the type format flags", () => {
            const { firstChild, firstType } = getTypeFromText(`let myType: ${longType};`);
            expect(firstType.getText(firstChild, TypeFormatFlags.None)).to.equal(longType.substring(0, 317) + "...");
        });
    });

    describe(nameof<Type>(t => t.getProperties), () => {
        it("should get the properties when there are none", () => {
            const { firstType } = getTypeFromText("let myType: {};");
            expect(firstType.getProperties().length).to.equal(0);
        });

        it("should get the properties of a non-object type", () => {
            const { firstType } = getTypeFromText("let myType: 1;");
            expect(firstType.getProperties().length).to.equal(6);
        });

        it("should get the properties when some exist", () => {
            const { firstType } = getTypeFromText("let myType: { str: string; };");
            const props = firstType.getProperties();
            expect(props.length).to.equal(1);
            expect(props[0].getName()).to.equal("str");
        });
    });

    describe(nameof<Type>(t => t.getPropertyOrThrow), () => {
        function doTest(text: string, nameOrFindFunction: string | ((declaration: Symbol) => boolean), expected: string | undefined) {
            const { firstType } = getTypeFromText(text);
            if (expected == null)
                expect(() => firstType.getPropertyOrThrow(nameOrFindFunction)).to.throw();
            else
                expect(firstType.getPropertyOrThrow(nameOrFindFunction).getName()).to.equal(expected);
        }

        it("should get the property by name", () => {
            doTest("let myType: { str: string; other: number; };", "other", "other");
        });

        it("should get the property by function", () => {
            doTest("let myType: { str: string; other: number; };", p => p.getName() === "other", "other");
        });

        it("should throw when not exists", () => {
            doTest("let myType: { str: string; other: number; };", "test", undefined);
        });
    });

    describe(nameof<Type>(t => t.getProperty), () => {
        function doTest(text: string, nameOrFindFunction: string | ((declaration: Symbol) => boolean), expected: string | undefined) {
            const { firstType } = getTypeFromText(text);
            const prop = firstType.getProperty(nameOrFindFunction);
            expect(prop?.getName()).to.equal(expected);
        }

        it("should get the property by name", () => {
            doTest("let myType: { str: string; other: number; };", "other", "other");
        });

        it("should get the property by function", () => {
            doTest("let myType: { str: string; other: number; };", p => p.getName() === "other", "other");
        });

        it("should return undefined when not exists", () => {
            doTest("let myType: { str: string; other: number; };", "test", undefined);
        });
    });

    describe(nameof<Type>(t => t.getApparentProperties), () => {
        it("should return the apparent properties of a type", () => {
            const { firstType } = getTypeFromText("let myType: 1;");
            expect(firstType.getApparentProperties().length).to.equal(6);
        });
    });

    describe(nameof<Type>(t => t.getApparentProperty), () => {
        it("should get the property by name", () => {
            const { firstType } = getTypeFromText("let myType: { str: string; other: number; };");
            const prop = firstType.getApparentProperty("other")!;
            expect(prop.getName()).to.equal("other");
        });

        it("should get the property by function", () => {
            const { firstType } = getTypeFromText("let myType: { str: string; other: number; };");
            const prop = firstType.getApparentProperty(p => p.getName() === "other")!;
            expect(prop.getName()).to.equal("other");
        });
    });

    describe(nameof<Type>(t => t.getConstraint), () => {
        function doTest(text: string, expected: string | undefined) {
            const { firstType } = getTypeAliasTypeFromText(text);
            expect(firstType.getConstraint()?.getText()).to.equal(expected);
        }

        it("should get the constraint when it exists", () => {
            doTest("type t<T extends string> = T;", "string");
        });

        it("should be undefined when it doesn't have a constraint", () => {
            doTest("type t<T> = T;", undefined);
        });
    });

    describe(nameof<Type>(t => t.getConstraintOrThrow), () => {
        function doTest(text: string, expected: string | undefined) {
            const { firstType } = getTypeAliasTypeFromText(text);
            if (expected == null)
                expect(() => firstType.getConstraintOrThrow()).to.throw();
            else
                expect(firstType.getConstraintOrThrow().getText()).to.equal(expected);
        }

        it("should get the constraint when it exists", () => {
            doTest("type t<T extends string> = T;", "string");
        });

        it("should be undefined when it doesn't have a constraint", () => {
            doTest("type t<T> = T;", undefined);
        });
    });

    describe(nameof<Type>(t => t.getDefault), () => {
        function doTest(text: string, expected: string | undefined) {
            const { firstType } = getTypeAliasTypeFromText(text);
            expect(firstType.getDefault()?.getText()).to.equal(expected);
        }

        it("should get the default when it exists", () => {
            doTest("type t<T = string> = T;", "string");
        });

        it("should be undefined when it doesn't have a default", () => {
            doTest("type t<T> = T;", undefined);
        });
    });

    describe(nameof<Type>(t => t.getDefaultOrThrow), () => {
        function doTest(text: string, expected: string | undefined) {
            const { firstType } = getTypeAliasTypeFromText(text);
            if (expected == null)
                expect(() => firstType.getDefaultOrThrow()).to.throw();
            else
                expect(firstType.getDefaultOrThrow().getText()).to.equal(expected);
        }

        it("should get the default when it exists", () => {
            doTest("type t<T = string> = T;", "string");
        });

        it("should be undefined when it doesn't have a default", () => {
            doTest("type t<T> = T;", undefined);
        });
    });

    describe(nameof<Type>(t => t.getBaseTypes), () => {
        it("should return the base types of a type", () => {
            const { firstType } = getTypeFromText("let myType: MyInterface; interface MyInterface extends OtherInterface {}\ninterface OtherInterface");
            const baseTypes = firstType.getBaseTypes();
            expect(baseTypes.length).to.equal(1);
            expect(baseTypes[0].getText()).to.equal("OtherInterface");
        });
    });

    describe(nameof<Type>(t => t.getAliasSymbol), () => {
        it("should return the alias symbol when it exists", () => {
            const { firstType } = getTypeFromText("let myType: MyAlias; type MyAlias = {str: string;};");
            expect(firstType.getAliasSymbol()!.getFlags()).to.equal(SymbolFlags.TypeAlias);
        });

        it("should return undefined when not exists", () => {
            const { firstType } = getTypeFromText("let myType: string;");
            expect(firstType.getAliasSymbol()).to.be.undefined;
        });
    });

    describe(nameof<Type>(t => t.getAliasSymbolOrThrow), () => {
        it("should return the alias symbol when it exists", () => {
            const { firstType } = getTypeFromText("let myType: MyAlias; type MyAlias = {str: string;};");
            expect(firstType.getAliasSymbolOrThrow().getFlags()).to.equal(SymbolFlags.TypeAlias);
        });

        it("should throw when not exists", () => {
            const { firstType } = getTypeFromText("let myType: string;");
            expect(() => firstType.getAliasSymbolOrThrow()).to.throw();
        });
    });

    describe(nameof<Type>(t => t.getAliasTypeArguments), () => {
        it("should not have any when none exist", () => {
            const { firstType } = getTypeFromText("let myType: string;");
            expect(firstType.getAliasTypeArguments().length).to.equal(0);
        });

        it("should return the type args when they exist", () => {
            const { firstType } = getTypeFromText("let myType: MyAlias<string>; type MyAlias<T> = {str: T;};");
            const typeArgs = firstType.getAliasTypeArguments();
            expect(typeArgs.length).to.equal(1);
            expect(typeArgs[0].getText()).to.equal("string");
        });
    });
});
