/**
 * Code Manipulation - Create `forEachStructureKind`
 * -------------------------------------------------
 * This modifies the forEachStructureKind.ts file that
 * is used for iterating over a structure's structures.
 * -------------------------------------------------
 */
import { PropertySignature, SourceFile, Type, FunctionDeclarationStructure, StructureKind } from "ts-morph";
import { TsMorphInspector, Structure } from "../inspectors";

// very messy first pass... needs cleanup

// todo: Shouldn't have functions for syntax kinds that will be no-ops (ex. `forDecoratableNode`)... actually, this will add the kind for them?

interface StructureInfo {
    name: string;
    syntaxKind: string | undefined;
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

function clearPreviouslyGeneratedFunctions(sourceFile: SourceFile) {
    // remove functions with an @generated jsdoc tag
    for (const func of sourceFile.getFunctions()) {
        if (func.getJsDocs().some(d => d.getTags().some(t => t.getTagName() === "generated")))
            func.remove();
    }
}

function addNewFunctions(sourceFile: SourceFile, structureInfos: StructureInfo[]) {
    const functions: FunctionDeclarationStructure[] = [];
    for (const info of structureInfos) {
        functions.push({
            kind: StructureKind.Function,
            docs: ["@generated"],
            name: getInfoFunctionName(info),
            parameters: [{ name: "structure", type: info.name }, { name: "action", type: "(structure: Structures) => void" }],
            statements: writer => {
                for (const baseStructure of info.baseStructures) {
                    writer.write(getInfoFunctionName(baseStructure))
                        .write("(structure, action);")
                        .newLine();
                }

                if (info.baseStructures.length > 0 && info.members.length > 0)
                    writer.blankLineIfLastNot();

                for (const member of info.members) {
                    if (member.syntaxKind != null) {
                        if (member.allStructure)
                            writer.writeLine(`forAll(structure.${member.name}, action, StructureKind.${member.syntaxKind});`);
                        else
                            writer.writeLine(`forAllIfStructure(structure.${member.name}, action, StructureKind.${member.syntaxKind});`);
                    }
                    else
                        writer.writeLine(`forAllUnknownKindIfStructure(structure.${member.name}, action);`);
                }
            }
        });
    }

    const insertIndex = sourceFile.getFunctionOrThrow("forEachStructureChild").getChildIndex() + 1;
    sourceFile.insertFunctions(insertIndex, functions);
}

function updateForEachStructureChild(sourceFile: SourceFile, structureInfos: StructureInfo[]) {
    const func = sourceFile.getFunctionOrThrow("forEachStructureChild");
    func.removeStatements([0, func.getStatementsWithComments().length - 1]);

    func.addStatements(writer => {
        writer.writeLine("// run `yarn run code-generate` to update the code in here");
        writer.write("if (structure instanceof Array)").block(() => {
            writer.writeLine("for (const item of structure)");
            writer.indent().write("forEachStructureChild(item, action);").newLine();
            writer.writeLine("return;");
        });
        writer.blankLine();
        writer.write("switch (structure.kind)").block(() => {
            for (const structureInfo of structureInfos.filter(s => s.syntaxKind != null)) {
                writer.writeLine(`case StructureKind.${structureInfo.syntaxKind!}:`);
                writer.indent().write(`${getInfoFunctionName(structureInfo)}(structure, action);`).newLine();
                writer.indent().write("break;").newLine();
            }
        });
    });
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

        const structureKindProperty = getTypeKindProperty(structure.getType());
        const info: StructureInfo = {
            name: structure.getName(),
            baseStructures: [],
            members: [],
            syntaxKind: structureKindProperty == null ? undefined : getSyntaxKind(structureKindProperty.getTypeAtLocation(structure.node))
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

        function fillMemberInfo(property: PropertySignature) {
            const propertyType = property.getType();
            const arrayTypes = getArrayTypes(propertyType.getNonNullableType());
            if (getTypeKindProperty(propertyType.getNonNullableType()) != null)
                throw new Error("Unhandled situation where there was a structure not as an array.");

            const kinds: string[] = [];
            let allStructure = true;
            for (const arrayType of arrayTypes) {
                const arrayElementType = arrayType.getArrayType();
                for (const unionElementType of getTypeOrUnionElementTypes(arrayElementType)) {
                    const kindProperty = getTypeKindProperty(unionElementType);
                    if (kindProperty != null)
                        kinds.push(getSyntaxKind(kindProperty.getTypeAtLocation(property.getTypeNodeOrThrow())));
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

            function getArrayTypes(type: Type) {
                if (type.isArray())
                    return [type];
                return type.getUnionTypes().filter(t => t.isArray());
            }

            function getTypeOrUnionElementTypes(type: Type) {
                return type.isUnion() ? type.getUnionTypes() : [type];
            }
        }

        function getTypeKindProperty(type: Type) {
            return type.getProperty("kind");
        }

        function getSyntaxKind(type: Type) {
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
