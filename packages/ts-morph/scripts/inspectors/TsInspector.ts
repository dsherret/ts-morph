import { Project, InterfaceDeclaration, SourceFile, SyntaxKind, TypeGuards } from "ts-morph";
import { ArrayUtils, Memoize } from "@ts-morph/common";
import { hasDescendantBaseType } from "../common";
import { WrapperFactory } from "./WrapperFactory";

export class TsInspector {
    constructor(private readonly wrapperFactory: WrapperFactory, private readonly project: Project) {
    }

    @Memoize
    getTsSymbol() {
        const tsMorphCommon = this.project.getSourceFileOrThrow("src/main.ts").getExportDeclarationOrThrow("@ts-morph/common").getModuleSpecifier()!.getSymbolOrThrow();
        return tsMorphCommon.getExportOrThrow("ts").getAliasedSymbolOrThrow();
    }

    @Memoize
    getTsNodes() {
        const tsSymbol = this.getTsSymbol();
        const interfaces: InterfaceDeclaration[] = [];

        for (const exportSymbol of tsSymbol.getExports()) {
            if (exportSymbol.getName() === "Node")
                continue;

            if (hasDescendantBaseType(exportSymbol.getDeclaredType(), checkingType => checkingType.getText().endsWith("Node"))) {
                const declarations = exportSymbol.getDeclarations();
                for (const interfaceDec of declarations.filter(TypeGuards.isInterfaceDeclaration))
                    interfaces.push(interfaceDec);
            }
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
