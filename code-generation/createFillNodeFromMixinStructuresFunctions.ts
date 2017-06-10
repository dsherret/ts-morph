import CodeBlockWriter from "code-block-writer";
import {ClassViewModel, MixinViewModel, MixinableViewModel, FillOnlyFunctionViewModel} from "./view-models";
import {isAllowedClass, isAllowedMixin} from "./config";
import {getMixinOfMixins} from "./common";

export function createFillNodeFromMixinStructuresFunctions(opts: { classVMs: ClassViewModel[]; fillOnlyFunctionVMs: FillOnlyFunctionViewModel[]; }) {
    const {classVMs, fillOnlyFunctionVMs} = opts;
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

function removeNotAllowedMixins(mixinable: MixinableViewModel) {
    mixinable.mixins = mixinable.mixins.filter(isAllowedMixin);
    mixinable.mixins.forEach(m => removeNotAllowedMixins(m));
}
