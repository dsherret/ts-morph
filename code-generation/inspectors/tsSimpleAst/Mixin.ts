import {InterfaceDeclaration} from "./../../../src/main";
import {WrapperFactory} from "./../WrapperFactory";

export class Mixin {
    constructor(private readonly wrapperFactory: WrapperFactory, private readonly node: InterfaceDeclaration) {
    }

    getName() {
        return this.node.getName();
    }
}
