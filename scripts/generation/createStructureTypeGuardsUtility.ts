/**
 * Code Manipulation - Create `StructureTypeGuards`
 * -------------------------------------------------
 * This modifies the StructureTypeGuards.ts file that
 * is used for doing type guards on structures.
 * -------------------------------------------------
 */
import { ClassDeclaration, TypeParameterDeclarationStructure, OptionalKind } from "ts-morph";
import { TsMorphInspector, Structure } from "../inspectors";

export function createStructureTypeGuardsUtility(inspector: TsMorphInspector) {
    const structureTypeGuardsFile = inspector.getProject().getSourceFileOrThrow("StructureTypeGuards.ts");
    const typeGuardsClass = structureTypeGuardsFile.getClassOrThrow("StructureTypeGuards");
    clearPreviouslyGeneratedMethods(typeGuardsClass);
    const structureInfos = getStructureInfos(inspector);
    addNewMethods(typeGuardsClass, structureInfos);
    structureTypeGuardsFile.fixMissingImports();
}

function clearPreviouslyGeneratedMethods(typeGuardsClass: ClassDeclaration) {
    // remove all the static methods that start with "is"
    typeGuardsClass.getStaticMethods()
        .filter(m => m.getName().startsWith("is"))
        .forEach(m => m.remove());
}

interface StructureInfo {
    name: string;
    kind: string | undefined;
    kinds: Set<string>;
}

function getStructureInfos(inspector: TsMorphInspector) {
    const infos = new Map<Structure, StructureInfo>();
    const structures = inspector.getStructures();

    for (const structure of structures) {
        if (!shouldIncludeStructure(structure.getName()))
            continue;

        const structureKind = structure.getStructureKindName();
        if (structureKind == null)
            continue;
        handleStructure(structure, structureKind);
    }

    return Array.from(infos.values()).filter(v => shouldIncludeStructure(v.name));

    function handleStructure(structure: Structure, structureKind: string) {
        let structureInfo = infos.get(structure);
        if (structureInfo == null) {
            structureInfo = {
                name: structure.getName(),
                kind: structure.getStructureKindName(),
                kinds: new Set<string>()
            };
            infos.set(structure, structureInfo);
        }

        if (structureInfo.kinds.has(structureKind))
            throw new Error(`The structure ${structure.getName()} incorrectly has the structure kind "${structureKind}" twice.`);
        structureInfo.kinds.add(structureKind);

        for (const baseStructure of structure.getBaseStructures())
            handleStructure(baseStructure, structureKind);
    }

    function shouldIncludeStructure(name: string) {
        return !name.endsWith("SpecificStructure") && name !== "KindedStructure" && name !== "Structure";
    }
}

function addNewMethods(typeGuardsClass: ClassDeclaration, structureInfos: StructureInfo[]) {
    typeGuardsClass.addMethods(structureInfos.map(info => ({
        docs: [`Gets if the provided structure is a ${info.name}.`],
        isStatic: true,
        name: `is${formatName(info.name)}`,
        parameters: [{ name: "structure", type: getParameterType(info) }],
        returnType: `structure is ${getReturnType(info)}`,
        typeParameters: getTypeParameters(info),
        statements: writer => {
            if (info.kinds.size === 1)
                writer.write(`return structure.kind === StructureKind.${Array.from(info.kinds)[0]};`);
            else {
                writer.write("switch (structure.kind)").block(() => {
                    for (const kind of info.kinds)
                        writer.writeLine(`case StructureKind.${kind}:`);

                    writer.indent().write("return true;").newLine();
                    writer.writeLine("default:");
                    writer.indent().write("return false;").newLine();
                });
            }
        }
    })));

    function getTypeParameters(info: StructureInfo): OptionalKind<TypeParameterDeclarationStructure>[] {
        if (info.kind == null)
            return [{ name: "T", constraint: "Structure & { kind: StructureKind; }" }];
        return [];
    }

    function getParameterType(info: StructureInfo) {
        if (info.kind == null)
            return "T";
        return "Structure & { kind: StructureKind; }";
    }

    function getReturnType(info: StructureInfo) {
        if (info.kind == null)
            return `T & ${info.name}`;
        return info.name;
    }

    function formatName(name: string) {
        name = name.replace("Structure", "").replace(/Node$/, "");
        if (name === "ExportDeclaration" || name === "ImportDeclaration" || name === "VariableDeclaration")
            return name;
        return name.replace(/Declaration$/, "");
    }
}
