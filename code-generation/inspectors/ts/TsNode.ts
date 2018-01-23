import {InterfaceDeclaration} from "./../../../src/main";
import {Memoize} from "./../../../src/utils";
import {WrapperFactory} from "./../WrapperFactory";

export class TsNode {
    constructor(private readonly wrapperFactory: WrapperFactory, private readonly node: InterfaceDeclaration) {
    }

    @Memoize
    getName() {
        return this.node.getName();
    }
}
