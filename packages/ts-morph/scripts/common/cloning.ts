import { tsMorph } from "@ts-morph/scripts";

export function cloneNamespaces(node: tsMorph.StatementedNode, cloningNamespaces: tsMorph.NamespaceDeclaration[]) {
    const namespaces = node.addNamespaces(cloningNamespaces.map(n => ({
        isExported: true,
        hasDeclareKeyword: true,
        name: n.getName()
    })));
    for (let i = 0; i < cloningNamespaces.length; i++) {
        // todo: remove repetitiveness
        namespaces[i].addInterfaces(cloningNamespaces[i].getInterfaces().map(interfaceDec => ({
            ...interfaceDec.getStructure(),
            isExported: true
        })));
        namespaces[i].addClasses(cloningNamespaces[i].getClasses().map(c => ({
            ...c.getStructure(),
            isExported: true
        })));
        namespaces[i].addFunctions(cloningNamespaces[i].getFunctions().map(f => ({
            ...f.getStructure() as tsMorph.FunctionDeclarationStructure,
            isExported: true
        })));
        namespaces[i].addEnums(cloningNamespaces[i].getEnums().map(e => ({
            ...e.getStructure(),
            isExported: true
        })));
        namespaces[i].addVariableStatements(cloningNamespaces[i].getVariableStatements().map(v => ({
            ...v.getStructure(),
            isExported: true
        })));
        namespaces[i].addTypeAliases(cloningNamespaces[i].getTypeAliases().map(t => ({
            ...t.getStructure(),
            isExported: true
        })));
    }
}
