import {InterfaceDeclaration} from "./../../../src/main";
import {Memoize, TypeGuards} from "./../../../src/utils";
import {WrapperFactory} from "./../WrapperFactory";

export class Mixin {
    constructor(private readonly wrapperFactory: WrapperFactory, private readonly node: InterfaceDeclaration) {
    }

    getName() {
        return this.node.getName();
    }

    @Memoize
    getMixins() {
        const baseInterfaces = this.node.getBaseDeclarations().filter(d => TypeGuards.isInterfaceDeclaration(d)) as InterfaceDeclaration[];
        return baseInterfaces.map(i => this.wrapperFactory.getMixin(i));
    }
}
