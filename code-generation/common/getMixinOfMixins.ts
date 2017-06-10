import {MixinViewModel, ClassViewModel, MixinableViewModel} from "./../view-models";

export function getMixinOfMixins(classVMs: ClassViewModel[]) {
    const result: MixinViewModel[] = [];

    function handleMixinable(mixinable: MixinableViewModel) {
        for (const mixin of mixinable.mixins) {
            if (mixin.mixins.length > 0 && result.every(m => m.name !== mixin.name))
                result.push(mixin);
            handleMixinable(mixin);
        }
    }

    for (const c of classVMs) {
        handleMixinable(c);
    }

    return result;
}
