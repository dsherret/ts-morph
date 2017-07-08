import {InterfaceViewModel} from "./../view-models";

export function getFlattenedExtensions(vm: InterfaceViewModel) {
    const extensions: InterfaceViewModel[] = [];
    for (const ext of vm.extends) {
        const flattenedExts = getFlattenedExtensions(ext);
        for (const flattenedExt of flattenedExts)
            extensions.push(flattenedExt);
        extensions.push(ext);
    }
    return extensions;
}
