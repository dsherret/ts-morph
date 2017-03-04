import CodeBlockWriter from "code-block-writer";

function runMixin(instance: BaseDefinition, mixin: any) {
    mixin.call(instance);

    if (mixin.mixins)
        mixin.mixins.forEach((m: any) => runMixin(instance, m));
}

export abstract class BaseDefinition {
    // ReSharper disable once InconsistentNaming
    static _uniqueID = 0;
    // ReSharper disable once InconsistentNaming
    __uniqueID: number;

    constructor() {
        const mixins = (this.constructor as any)["mixins"] as any[] || [];
        mixins.forEach(mixin => runMixin(this, mixin));

        Object.defineProperty(this, nameof<BaseDefinition>(d => d.__uniqueID), {
            configurable: false,
            enumerable: false,
            writable: true,
            value: ++BaseDefinition._uniqueID
        });
    }

    onBeforeWrite: ((writer: CodeBlockWriter) => void) | null;
    onAfterWrite: ((writer: CodeBlockWriter) => void) | null;
}
