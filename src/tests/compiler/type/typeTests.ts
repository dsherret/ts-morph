import {expect} from "chai";
import {ts, TypeFlags, ObjectFlags, SymbolFlags, TypeFormatFlags} from "./../../../typescript";
import {Type, VariableStatement} from "./../../../compiler";
import {VirtualFileSystemHost, DefaultFileSystemHost} from "./../../../fileSystem";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(Type), () => {
    function getTypeFromText(text: string) {
        const result = getInfoFromText<VariableStatement>(text, { host: new VirtualFileSystemHost(), includeLibDts: true });
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
        it("should get when it is an anonymous type", () => {
            const {firstType} = getTypeFromText("let myType: { str: string; };");
            expect(firstType.isAnonymousType()).to.equal(true);
        });

        it("should get when it's not an anonymous type", () => {
            const {firstType} = getTypeFromText("let myType: string;");
            expect(firstType.isAnonymousType()).to.equal(false);
        });
    });

    describe(nameof<Type>(t => t.isBooleanType), () => {
        it("should get when it is a boolean type", () => {
            const {firstType} = getTypeFromText("let myType: boolean;");
            expect(firstType.isBooleanType()).to.equal(true);
        });

        it("should get when it's not a boolean type", () => {
            const {firstType} = getTypeFromText("let myType: string;");
            expect(firstType.isBooleanType()).to.equal(false);
        });
    });

    describe(nameof<Type>(t => t.isEnumType), () => {
        it("should get when it is an enum type", () => {
            const {firstType} = getTypeFromText("let myType: MyEnum; enum MyEnum {}");
            expect(firstType.isEnumType()).to.equal(true);
        });

        it("should get when it's not an enum type", () => {
            const {firstType} = getTypeFromText("let myType: string;");
            expect(firstType.isEnumType()).to.equal(false);
        });
    });

    describe(nameof<Type>(t => t.isInterfaceType), () => {
        it("should get when it is an interface type", () => {
            const {firstType} = getTypeFromText("let myType: MyInterface; interface MyInterface {}");
            expect(firstType.isInterfaceType()).to.equal(true);
        });

        it("should get when it's not an enum type", () => {
            const {firstType} = getTypeFromText("let myType: string;");
            expect(firstType.isInterfaceType()).to.equal(false);
        });
    });

    describe(nameof<Type>(t => t.isIntersectionType), () => {
        it("should get when it is an intersection type", () => {
            const {firstType} = getTypeFromText("let myType: number & string;");
            expect(firstType.isIntersectionType()).to.equal(true);
        });

        it("should get when it's not an intersection type", () => {
            const {firstType} = getTypeFromText("let myType: number | string;");
            expect(firstType.isIntersectionType()).to.equal(false);
        });
    });

    describe(nameof<Type>(t => t.isObjectType), () => {
        it("should get when it is an object type", () => {
            const {firstType} = getTypeFromText("let myType: { str: string; };");
            expect(firstType.isObjectType()).to.equal(true);
        });

        it("should get when it's not an object type", () => {
            const {firstType} = getTypeFromText("let myType: number;");
            expect(firstType.isObjectType()).to.equal(false);
        });
    });

    describe(nameof<Type>(t => t.isUnionType), () => {
        it("should get when it is a union type", () => {
            const {firstType} = getTypeFromText("let myType: number | string;");
            expect(firstType.isUnionType()).to.equal(true);
        });

        it("should get when it's not a union type", () => {
            const {firstType} = getTypeFromText("let myType: number & string;");
            expect(firstType.isUnionType()).to.equal(false);
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
        it("should return the original type for a type that's already non-nullable", () => {
            const {firstType} = getTypeFromText("let myType: string;");
            const nonNullableType = firstType.getNonNullableType();
            expect(nonNullableType.getText()).to.equal("string");
        });

        it("should return the non-nullable type", () => {
            const {firstType} = getTypeFromText("let myType: string | undefined;");
            const nonNullableType = firstType.getNonNullableType()!;
            expect(nonNullableType.getText()).to.equal("string");
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
