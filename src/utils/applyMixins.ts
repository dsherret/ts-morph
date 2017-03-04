export function applyMixins(derivedCtor: any, extendsClass: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            if (name !== "constructor" && derivedCtor.prototype[name] == null) {
                const descriptor = Object.getOwnPropertyDescriptor(baseCtor.prototype, name);
                Object.defineProperty(derivedCtor.prototype, name, descriptor);
            }
        });
    });

    derivedCtor.mixins = baseCtors;
    derivedCtor.mixins.push(...(extendsClass.mixins || []));
}
