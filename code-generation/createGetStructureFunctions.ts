import CodeBlockWriter from "code-block-writer";
import {getFlattenedExtensions} from "./common";
import {InterfaceViewModel} from "./view-models";

// todo: a lot of this code was written before this library supported manipulation
export function createGetStructureFunctions(structures: InterfaceViewModel[]) {
    const writer = new CodeBlockWriter();

    writer.writeLine("/* tslint:disable */");
    writer.writeLine("// DO NOT MANUALLY EDIT!! File generated via: npm run code-generate").newLine();
    writer.writeLine(`import * as objectAssign from "object-assign";`);
    writer.writeLine(`import * as compiler from "./../../compiler";`);
    writer.writeLine(`import * as structures from "./../../structures";`);
    writer.writeLine(`import * as getMixinStructureFuncs from "./getMixinStructureFunctions";`);

    for (const structure of structures.filter(s => shouldCreateForStructure(s))) {
        writer.newLine();
        write(writer, structure);
    }

    return writer.toString();
}

// todo: make this better... good enough for now
// for example, it would be better to be able to get the structure from a node and specify what structures to ignore when calling it... that way the logic could be kept inside
// the application and not here (basically... have a fromFunctionDeclaration(node, [nameof(ParameteredNodeStructure)]);)
function write(writer: CodeBlockWriter, vm: InterfaceViewModel) {
    const className = vm.name.replace(/Structure$/, "");
    const functionHeader = `export function from${className}(node: compiler.${className.replace("Overload", "")}): structures.${vm.name}`;
    writer.write(functionHeader).block(() => {
        writeBody(writer, vm, getFlattenedExtensions(vm).filter(e => shouldAllowExtends(vm, e)));
    });
}

function writeBody(writer: CodeBlockWriter, vm: InterfaceViewModel, extendsStructures: InterfaceViewModel[]) {
    writer.writeLine(`let structure: structures.${vm.name} = {} as any;`);
    for (const extendsStructure of extendsStructures) {
        writer.write("objectAssign(structure, ");
        writer.write("getMixinStructureFuncs.");
        const extendsClassName = extendsStructure.name.replace(/Structure$/, "");
        writer.write(`from${extendsClassName}(node));`).newLine();
    }
    writer.writeLine("return structure;");
}

function shouldCreateForStructure(structure: InterfaceViewModel) {
    switch (structure.name) {
        case "FunctionDeclarationOverloadStructure":
        case "MethodDeclarationOverloadStructure":
        case "ConstructorDeclarationOverloadStructure":
            return true;
        default:
            return false;
    }
}

function shouldAllowExtends(structure: InterfaceViewModel, extendsStructure: InterfaceViewModel) {
    if (structure.name === "FunctionDeclarationOverloadStructure") {
        switch (extendsStructure.name) {
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
    else if (structure.name === "MethodDeclarationOverloadStructure") {
        switch (extendsStructure.name) {
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
    else if (structure.name === "ConstructorDeclarationOverloadStructure") {
        switch (extendsStructure.name) {
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
