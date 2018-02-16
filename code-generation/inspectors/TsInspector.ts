import TsSimpleAst, {InterfaceDeclaration, SourceFile} from "./../../src/main";
import {Memoize, ArrayUtils} from "./../../src/utils";
import {hasDescendantBaseType} from "./../common";
import {TsNode} from "./ts";
import {WrapperFactory} from "./WrapperFactory";

export class TsInspector {
    constructor(private readonly wrapperFactory: WrapperFactory, private readonly ast: TsSimpleAst) {
    }

    getDeclarationFile(): SourceFile {
        return this.ast.getSourceFileOrThrow("node_modules/typescript/lib/typescript.d.ts");
    }

    @Memoize
    getTsNodes() {
        const compilerApiFile = this.ast.getSourceFileOrThrow("typescript/typescript.ts");
        const interfaces: InterfaceDeclaration[] = [];
        for (const interfaceDec of ArrayUtils.flatten(compilerApiFile.getNamespaces().map(n => n.getInterfaces()))) {
            if (interfaceDec.getBaseTypes().some(t => hasDescendantBaseType(t, checkingType => checkingType.getText() === "ts.Node")))
                interfaces.push(interfaceDec);
        }
        return ArrayUtils.sortByProperty(interfaces.map(i => this.wrapperFactory.getTsNode(i)), item => item.getName());
    }
}
