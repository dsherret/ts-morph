import Project, {InterfaceDeclaration, SourceFile, SyntaxKind} from "../../src/main";
import {Memoize, ArrayUtils} from "../../src/utils";
import {hasDescendantBaseType} from "../common";
import {TsNode} from "./ts";
import {WrapperFactory} from "./WrapperFactory";

export class TsInspector {
    constructor(private readonly wrapperFactory: WrapperFactory, private readonly project: Project) {
    }

    getDeclarationFile(): SourceFile {
        return this.project.getSourceFileOrThrow("node_modules/typescript/lib/typescript.d.ts");
    }

    @Memoize
    getTsNodes() {
        const compilerApiFile = this.project.getSourceFileOrThrow("typescript/typescript.ts");
        const interfaces: InterfaceDeclaration[] = [];
        for (const interfaceDec of ArrayUtils.flatten(compilerApiFile.getNamespaces().map(n => n.getInterfaces()))) {
            if (interfaceDec.getBaseTypes().some(t => hasDescendantBaseType(t, checkingType => checkingType.getText() === "ts.Node")))
                interfaces.push(interfaceDec);
        }
        return ArrayUtils.sortByProperty(interfaces.map(i => this.wrapperFactory.getTsNode(i)), item => item.getName());
    }

    getNamesFromKind(kind: SyntaxKind) {
        const kindToNameMappings = this.getKindToNameMappings();
        return [...kindToNameMappings[kind]];
    }

    @Memoize
    private getKindToNameMappings() {
        const kindToNameMappings: { [kind: number]: string[]; } = {};
        for (const name of Object.keys(SyntaxKind).filter(k => isNaN(parseInt(k, 10)))) {
            const value = (SyntaxKind as any)[name];
            if (kindToNameMappings[value] == null)
                kindToNameMappings[value] = [];
            kindToNameMappings[value].push(name);
        }

        return kindToNameMappings;
    }
}
