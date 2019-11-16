/**
 * Code Manipulation - Create `forEachStructureKind`
 * -------------------------------------------------
 * This modifies the forEachStructureKind.ts file that
 * is used for iterating over a structure's structures.
 * -------------------------------------------------
 */
import { tsMorph } from "@ts-morph/scripts";
import { TsMorphInspector, Structure } from "../inspectors";

// very messy first pass... needs cleanup

// todo: Shouldn't have functions for syntax kinds that will be no-ops (ex. `forDecoratableNode`)... actually, this will add the kind for them?

interface StructureInfo {
    name: string;
    structureKind: string | undefined;
    baseStructures: StructureInfo[];
    members: MemberInfo[];
}

interface MemberInfo {
    name: string;
    syntaxKind: string | undefined;
    allStructure: boolean;
}

export function createForEachStructureChild(inspector: TsMorphInspector) {
    const forEachStructureChildFile = inspector.getProject().getSourceFileOrThrow("forEachStructureChild.ts");
    clearPreviouslyGeneratedFunctions(forEachStructureChildFile);
    const structureInfos = getStructureInfos(inspector);
    addNewFunctions(forEachStructureChildFile, structureInfos);
    updateForEachStructureChild(forEachStructureChildFile, structureInfos);
    forEachStructureChildFile.fixMissingImports();
}

function clearPreviouslyGeneratedFunctions(sourceFile: tsMorph.SourceFile) {
    // remove functions with an @generated jsdoc tag
    for (const func of sourceFile.getFunctions()) {
        if (func.getJsDocs().some(d => d.getTags().some(t => t.getTagName() === "generated")))
            func.remove();
    }
}

function updateForEachStructureChild(sourceFile: tsMorph.SourceFile, structureInfos: StructureInfo[]) {
    const func = sourceFile.getFunctionOrThrow("forEachStructureChild");
    func.removeStatements([0, func.getStatementsWithComments().length - 1]);

    func.addStatements(writer => {
        writer.writeLine("// automatically generated: run `yarn run code-generate` to update the code in here");
        writer.write("if (ArrayUtils.isReadonlyArray(structure))").block(() => {
            writer.write("for (const item of structure)").block(() => {
                writer.writeLine("const result = callback(item);");
                writer.writeLine("if (result)");
                writer.indent().write("return result;").newLine();
            });
            writer.writeLine("return undefined;");
        });
        writer.blankLine();
        writer.write("switch (structure.kind)").block(() => {
            for (const structureInfo of structureInfos.filter(s => s.structureKind != null)) {
                writer.writeLine(`case StructureKind.${structureInfo.structureKind!}:`);
                writer.indent().write(`return ${getInfoFunctionName(structureInfo)}(structure, callback);`).newLine();
            }
            writer.writeLine("default:");
            writer.indent().write("return undefined;").newLine();
        });
    });
}

function addNewFunctions(sourceFile: tsMorph.SourceFile, structureInfos: StructureInfo[]) {
    const functions: tsMorph.FunctionDeclarationStructure[] = [];
    for (const info of structureInfos) {
        functions.push({
            kind: tsMorph.StructureKind.Function,
            docs: ["@generated"],
            name: getInfoFunctionName(info),
            typeParameters: ["TStructure"],
            parameters: [{ name: "structure", type: info.name }, { name: "callback", type: "(structure: Structures) => TStructure | void" }],
            returnType: "TStructure | undefined",
            statements: writer => {
                let isFirst = true;
                writer.write("return ");

                for (const baseStructure of info.baseStructures)
                    addExpression(getInfoFunctionName(baseStructure) + "(structure, callback)");

                for (const member of info.members) {
                    if (member.syntaxKind != null) {
                        if (member.allStructure)
                            addExpression(`forAll(structure.${member.name}, callback, StructureKind.${member.syntaxKind})`);
                        else
                            addExpression(`forAllIfStructure(structure.${member.name}, callback, StructureKind.${member.syntaxKind})`);
                    }
                    else {
                        addExpression(`forAllUnknownKindIfStructure(structure.${member.name}, callback)`);
                    }
                }

                writer.write(";");

                function addExpression(text: string) {
                    if (isFirst)
                        isFirst = false;
                    else
                        writer.newLine().indent().write("|| ");

                    writer.write(text);
                }
            }
        });
    }

    const insertIndex = sourceFile.getFunctionOrThrow("forEachStructureChild").getChildIndex() + 1;
    sourceFile.insertFunctions(insertIndex, functions);
}

function getStructureInfos(inspector: TsMorphInspector) {
    const infos = new Map<Structure, StructureInfo>();
    const structures = inspector.getStructures();

    for (const structure of structures) {
        if (structure.getName().endsWith("SpecificStructure") || structure.getName() === "KindedStructure" || structure.getName() === "Structure")
            continue;

        const type = structure.getType();
        const kindSymbol = type.getProperty("kind");
        if (kindSymbol == null)
            continue;

        handleStructure(structure);
    }

    return Array.from(infos.values()).filter(shouldIncludeInfo);

    function handleStructure(structure: Structure): StructureInfo {
        if (infos.has(structure))
            return infos.get(structure)!;

        const info: StructureInfo = {
            name: structure.getName(),
            baseStructures: [],
            members: [],
            structureKind: structure.getStructureKindName()
        };
        infos.set(structure, info);

        for (const property of getProperties())
            fillMemberInfo(property);

        for (const baseStructure of structure.getBaseStructures()) {
            if (!baseStructure.getName().endsWith("SpecificStructure") && baseStructure.getName() !== "Structure") {
                const baseStructureInfo = handleStructure(baseStructure);
                if (shouldIncludeInfo(baseStructureInfo))
                    info.baseStructures.push(baseStructureInfo);
            }
        }

        return info;

        function getProperties() {
            const result = structure.getProperties();
            const specificStructureName = structure.getName().replace(/Structure$/, "SpecificStructure");
            const specificStructure = structure.getBaseStructures().find(s => s.getName() === specificStructureName);
            if (specificStructure != null)
                result.push(...specificStructure.getProperties());
            return result;
        }

        function fillMemberInfo(property: tsMorph.PropertySignature) {
            const propertyType = property.getType();
            const arrayTypes = getArrayTypes(propertyType.getNonNullableType());
            if (getTypeKindProperty(propertyType.getNonNullableType()) != null)
                throw new Error("Unhandled situation where there was a structure not as an array.");

            const kinds: string[] = [];
            let allStructure = true;
            for (const arrayType of arrayTypes) {
                const arrayElementType = arrayType.getArrayElementTypeOrThrow();
                for (const unionElementType of getTypeOrUnionElementTypes(arrayElementType)) {
                    const kindProperty = getTypeKindProperty(unionElementType);
                    if (kindProperty != null)
                        kinds.push(getStructureKind(kindProperty.getTypeAtLocation(property.getTypeNodeOrThrow())));
                    else
                        allStructure = false;
                }
            }

            if (kinds.length > 0) {
                info.members.push({
                    name: property.getName(),
                    syntaxKind: kinds.length > 1 ? undefined : kinds[0],
                    allStructure
                });
            }

            function getArrayTypes(type: tsMorph.Type) {
                if (type.isArray())
                    return [type];
                return type.getUnionTypes().filter(t => t.isArray());
            }

            function getTypeOrUnionElementTypes(type: tsMorph.Type) {
                return type.isUnion() ? type.getUnionTypes() : [type];
            }
        }

        function getTypeKindProperty(type: tsMorph.Type) {
            return type.getProperty("kind");
        }

        function getStructureKind(type: tsMorph.Type) {
            return type.getNonNullableType().getText().replace(/^.*\.([^\.]+)$/, "$1");
        }
    }

    function shouldIncludeInfo(info: StructureInfo) {
        return info.baseStructures.length > 0 || info.members.length > 0;
    }
}

function getInfoFunctionName(info: StructureInfo) {
    return `for${info.name.replace(/Structure$/, "")}`;
}
