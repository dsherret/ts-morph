import CodeBlockWriter from "code-block-writer";
import {ClassViewModel, MixinViewModel, MixinableViewModel, FillOnlyFunctionViewModel, InterfaceViewModel} from "./view-models";
import {isAllowedClass, isAllowedMixin} from "./config";
import {getMixinOfMixins} from "./common";

export interface Options {
    classVMs: ClassViewModel[];
    fillOnlyFunctionVMs: FillOnlyFunctionViewModel[];
    overloadStructureVMs: InterfaceViewModel[];
}

export function createFillNodeFromMixinStructuresFunctions(opts: Options) {
    const {classVMs, fillOnlyFunctionVMs, overloadStructureVMs} = opts;
    classVMs.forEach(c => removeNotAllowedMixins(c));

    const writer = new CodeBlockWriter();
    const mixinsOfMixins = getMixinOfMixins(classVMs);

    writer.writeLine("/* ts-lint:disable */");
    writer.writeLine("// DO NOT MANUALLY EDIT!! File generated via: npm run code-generate").newLine();
    writer.writeLine(`import * as compiler from "./../compiler";`);
    writer.writeLine(`import * as structures from "./../structures";`);
    writer.writeLine(`import * as fillFuncs from "./fillMixinFunctions";`);
    writer.writeLine(`import * as fillOnlyFuncs from "./fillOnlyFunctions";`);

    for (const vm of [...classVMs.filter(c => isAllowedClass(c) && c.mixins.length > 0), ...mixinsOfMixins.filter(m => m.mixins.length > 0)]) {
        writer.newLine();
        write(writer, vm, fillOnlyFunctionVMs);
    }

    for (const vm of overloadStructureVMs) {
        writer.newLine();
        writeOverloadStructure(writer, vm);
    }

    return writer.toString();
}

function write(writer: CodeBlockWriter, vm: ClassViewModel | MixinViewModel, fillOnlyFunctionVMs: FillOnlyFunctionViewModel[]) {
    const functionHeader = `export function fill${vm.name}FromStructure(node: compiler.${vm.name}, structure: structures.${vm.name}Structure)`;
    writer.write(functionHeader).block(() => {
        for (const mixin of vm.mixins) {
            if (mixin.mixins.length === 0)
                writer.write("fillFuncs.");
            writer.write(`fill${mixin.name}FromStructure(node, structure);`).newLine();
        }
        const fillOnlyFunction = fillOnlyFunctionVMs.find(f => f.className === vm.name);
        if (fillOnlyFunction != null)
            writer.write(`fillOnlyFuncs.${fillOnlyFunction.functionName}(node, structure);`).newLine();
    });
}

function writeOverloadStructure(writer: CodeBlockWriter, vm: InterfaceViewModel) {
    const name = vm.name.replace(/Structure$/, "");
    const className = name.replace("Overload", "");
    const functionHeader = `export function fill${name}FromStructure(node: compiler.${className}, structure: structures.${vm.name})`;
    writer.write(functionHeader).block(() => {
        for (const extendsDec of vm.extends) {
            if (extendsDec.extends.length === 0)
                writer.write("fillFuncs.");
            const extendsName = extendsDec.name.replace(/Structure$/, "");
            writer.write(`fill${extendsName}FromStructure(node, structure);`).newLine();
        }
    });
}

function removeNotAllowedMixins(mixinable: MixinableViewModel) {
    mixinable.mixins = mixinable.mixins.filter(isAllowedMixin);
    mixinable.mixins.forEach(m => removeNotAllowedMixins(m));
}
