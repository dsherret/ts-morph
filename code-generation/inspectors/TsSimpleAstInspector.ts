import TsSimpleAst from "./../../src/main";
import {Memoize, ArrayUtils} from "./../../src/utils";
import {isNodeClass} from "./../common";
import {WrappedNode} from "./tsSimpleAst";
import {WrapperFactory} from "./WrapperFactory";

export class TsSimpleAstInspector {
    constructor(private readonly wrapperFactory: WrapperFactory, private readonly ast: TsSimpleAst) {
    }

    @Memoize
    getWrappedNodes() {
        const compilerSourceFiles = this.ast.getSourceFiles("**/src/compiler/**/*.ts");
        const classes = ArrayUtils.flatten(compilerSourceFiles.map(f => f.getClasses()));

        return classes.filter(c => isNodeClass(c)).map(c => this.wrapperFactory.getWrapperNode(c));
    }
}
