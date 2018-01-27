import TsSimpleAst, {InterfaceDeclaration} from "./../../src/main";
import {Memoize, ArrayUtils} from "./../../src/utils";
import {hasDescendantNodeType} from "./../common";
import {TsNode} from "./ts";
import {WrapperFactory} from "./WrapperFactory";

export class TsInspector {
    constructor(private readonly wrapperFactory: WrapperFactory, private readonly ast: TsSimpleAst) {
    }

    @Memoize
    getTsNodes() {
        const compilerApiFile = this.ast.getSourceFileOrThrow("node_modules/typescript/lib/typescript.d.ts");
        const interfaces: InterfaceDeclaration[] = [];
        for (const interfaceDec of ArrayUtils.flatten(compilerApiFile.getNamespaces().map(n => n.getInterfaces()))) {
            if (interfaceDec.getBaseTypes().some(t => hasDescendantNodeType(t)))
                interfaces.push(interfaceDec);
        }
        const tsNodes = interfaces.map(i => this.wrapperFactory.getTsNode(i));
        tsNodes.sort((a, b) => a.getName() < b.getName() ? -1 : 1);
        return tsNodes;
    }
}
