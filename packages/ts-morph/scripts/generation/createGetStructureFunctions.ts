/**
 * Code generation: Create "get structure" functions
 * -------------------------------------------------
 * This file generations the functions found in getStructureFunctions.ts
 *
 * Right now these are only used to get the structure for populating new overloads. This code needs a lot of work and
 * might be used to implement issue #45 (if it's decided that should be implemented).
 * -------------------------------------------------
 */
import { tsMorph } from "@ts-morph/scripts";
import * as fs from "fs";
import * as path from "path";
import { rootFolder } from "../config";
import { Structure } from "../inspectors";

// todo: a lot of this code was written before this library supported manipulation

export function createGetStructureFunctions(structures: Structure[]) {
    const writer = new tsMorph.CodeBlockWriter({ newLine: "\r\n" });

    writer.writeLine("// dprint-ignore-file");
    writer.writeLine("// DO NOT MANUALLY EDIT!! File generated via: yarn code-generate").newLine();
    writer.writeLine(`import { ObjectUtils } from "@ts-morph/common";`);
    writer.writeLine(`import * as compiler from "../../compiler";`);
    writer.writeLine(`import * as structures from "../../structures";`);
    writer.writeLine(`import * as getMixinStructureFuncs from "./getMixinStructureFunctions";`);

    for (const structure of structures.filter(s => shouldCreateForStructure(s.getName()))) {
        writer.blankLineIfLastNot();
        write(writer, structure);
    }

    writer.newLineIfLastNot();

    fs.writeFileSync(path.join(rootFolder, "src/manipulation/helpers/getStructureFunctions.ts"), writer.toString(), { encoding: "utf-8" });
}

// todo: make this better... good enough for now
// for example, it would be better to be able to get the structure from a node and specify what structures to ignore when calling it... that way the logic could be kept inside
// the application and not here (basically... have a fromFunctionDeclaration(node, [nameof(ParameteredNodeStructure)]);)
function write(writer: tsMorph.CodeBlockWriter, structure: Structure) {
    const className = structure.getName().replace(/Structure$/, "");
    const functionHeader = `export function from${className}(node: compiler.${className.replace("Overload", "")}): structures.${structure.getName()}`;
    writer.write(functionHeader).block(() => {
        writeBody(writer, structure, structure.getDescendantBaseStructures().filter(b => shouldAllowExtends(structure, b)));
    });
}

function writeBody(writer: tsMorph.CodeBlockWriter, structure: Structure, baseStructures: Structure[]) {
    writer.writeLine(`const structure: structures.${structure.getName()} = {} as any;`);
    for (const extendsStructure of baseStructures) {
        writer.write("ObjectUtils.assign(structure, ");
        writer.write("getMixinStructureFuncs.");
        const extendsClassName = extendsStructure.getName().replace(/Structure$/, "");
        writer.write(`from${extendsClassName}(node));`).newLine();
    }
    writer.writeLine("return structure;");
}

function shouldCreateForStructure(name: string) {
    switch (name) {
        case "FunctionDeclarationOverloadStructure":
        case "MethodDeclarationOverloadStructure":
        case "ConstructorDeclarationOverloadStructure":
            return true;
        default:
            return false;
    }
}

function shouldAllowExtends(structure: Structure, baseStructure: Structure) {
    if (baseStructure.getName() === "Structure" || baseStructure.getName().endsWith("SpecificStructure") || baseStructure.getName() === "KindedStructure")
        return false;

    if (structure.getName() === "FunctionDeclarationOverloadStructure") {
        switch (baseStructure.getName()) {
            case "ParameteredNodeStructure":
            case "TypeParameteredNodeStructure":
            case "JSDocableNodeStructure":
            case "SignaturedDeclarationStructure":
            case "ReturnTypedNodeStructure":
            case "GeneratorableNodeStructure":
            case "AsyncableNodeStructure":
                return false;
            default:
                return true;
        }
    }
    else if (structure.getName() === "MethodDeclarationOverloadStructure") {
        switch (baseStructure.getName()) {
            case "ParameteredNodeStructure":
            case "TypeParameteredNodeStructure":
            case "JSDocableNodeStructure":
            case "SignaturedDeclarationStructure":
            case "ReturnTypedNodeStructure":
            case "GeneratorableNodeStructure":
            case "AsyncableNodeStructure":
            case "DecoratableNodeStructure":
                return false;
            default:
                return true;
        }
    }
    else if (structure.getName() === "ConstructorDeclarationOverloadStructure") {
        switch (baseStructure.getName()) {
            case "ParameteredNodeStructure":
            case "TypeParameteredNodeStructure":
            case "JSDocableNodeStructure":
            case "SignaturedDeclarationStructure":
            case "ReturnTypedNodeStructure":
                return false;
            default:
                return true;
        }
    }
    return true;
}
