import {StatementedNode, EnumDeclaration, EnumMemberStructure, InterfaceDeclaration, TypeAliasDeclaration, ClassDeclaration,
    PropertyDeclaration, FunctionDeclaration, VariableStatement, NamespaceDeclaration, TypeGuards} from "../../src/main";

// todo: in the future this should be done in the library (ex. node.addInterface(cloningInterface.getStructure()))
// What's done here is not so great...

export function cloneNamespaces(node: StatementedNode, cloningNamespaces: NamespaceDeclaration[]) {
    const namespaces = node.addNamespaces(cloningNamespaces.map(n => ({
        isExported: true,
        hasDeclareKeyword: true,
        name: n.getName()
    })));
    for (let i = 0; i < cloningNamespaces.length; i++) {
        cloneInterfaces(namespaces[i], cloningNamespaces[i].getInterfaces());
        cloneClasses(namespaces[i], cloningNamespaces[i].getClasses());
        cloneFunctions(namespaces[i], cloningNamespaces[i].getFunctions());
        cloneEnums(namespaces[i], cloningNamespaces[i].getEnums());
        cloneVariables(namespaces[i], cloningNamespaces[i].getVariableStatements());
        cloneTypeAliases(namespaces[i], cloningNamespaces[i].getTypeAliases());

        // bad... will be fixed when moving towards using getStructure() functions
        for (const statement of namespaces[i].getStatements()) {
            if (TypeGuards.isAmbientableNode(statement))
                statement.setHasDeclareKeyword(false);
        }
    }
}

export function cloneInterfaces(node: StatementedNode, cloningInterfaces: InterfaceDeclaration[]) {
    node.addInterfaces(cloningInterfaces.map(cloningInterface => ({
        isExported: true,
        name: cloningInterface.getName(),
        typeParameters: cloningInterface.getTypeParameters().map(p => ({
            name: p.getName(),
            constraint: p.getConstraintNode() == null ? undefined : p.getConstraintNode()!.getText()
        })),
        extends: cloningInterface.getExtends().map(e => e.getText()),
        docs: cloningInterface.getJsDocs().map(d => ({ description: d.getInnerText() })),
        properties: cloningInterface.getProperties().map(nodeProp => ({
            name: nodeProp.getName(),
            type: nodeProp.getTypeNodeOrThrow().getText(),
            hasQuestionToken: nodeProp.hasQuestionToken(),
            docs: nodeProp.getJsDocs().map(d => ({ description: d.getInnerText().replace(/\r?\n/g, "\r\n") }))
        })),
        methods: cloningInterface.getMethods().map(method => ({
            name: method.getName(),
            hasQuestionToken: method.hasQuestionToken(),
            returnType: method.getReturnTypeNodeOrThrow().getText(),
            docs: method.getJsDocs().map(d => ({ description: d.getInnerText().replace(/\r?\n/g, "\r\n") })),
            typeParameters: method.getTypeParameters().map(p => ({
                name: p.getName(),
                constraint: p.getConstraintNode() == null ? undefined : p.getConstraintNode()!.getText()
            })),
            parameters: method.getParameters().map(p => ({
                name: p.getNameOrThrow(),
                hasQuestionToken: p.hasQuestionToken(),
                type: p.getTypeNodeOrThrow().getText()
            }))
        })),
        indexSignatures: cloningInterface.getIndexSignatures().map(s => ({
            keyName: s.getKeyName(),
            keyType: s.getKeyTypeNode().getText(),
            returnType: s.getReturnTypeNode().getText(),
            docs: s.getJsDocs().map(d => ({ description: d.getInnerText().replace(/\r?\n/g, "\r\n") }))
        }))
    })));
}

export function cloneEnums(node: StatementedNode, cloningEnums: EnumDeclaration[]) {
    node.addEnums(cloningEnums.map(cloningEnum => ({
        name: cloningEnum.getName(),
        isExported: true,
        members: cloningEnum.getMembers().map(m => ({
            name: m.getName(),
            docs: m.getJsDocs().map(d => ({ description: d.getInnerText().replace(/\r?\n/g, "\r\n") })),
            value: m.getValue()
        }) as EnumMemberStructure)
    })));
}

export function cloneTypeAliases(node: StatementedNode, typeAliases: TypeAliasDeclaration[]) {
    node.addTypeAliases(typeAliases.map(typeAlias => ({
        name: typeAlias.getName(),
        isExported: true,
        typeParameters: typeAlias.getTypeParameters().map(p => ({
            name: p.getName(),
            constraint: p.getConstraintNode() == null ? undefined : p.getConstraintNode()!.getText()
        })),
        docs: typeAlias.getJsDocs().map(d => ({ description: d.getInnerText().replace(/\r?\n/g, "\r\n") })),
        type: typeAlias.getTypeNodeOrThrow().getText()
    })));
}

export function cloneClasses(node: StatementedNode, classes: ClassDeclaration[]) {
    node.addClasses(classes.map(c => ({
        name: c.getName(),
        isExported: true,
        hasDeclareKeyword: true,
        typeParameters: c.getTypeParameters().map(p => ({
            name: p.getName(),
            constraint: p.getConstraintNode() == null ? undefined : p.getConstraintNode()!.getText()
        })),
        docs: c.getJsDocs().map(d => ({ description: d.getInnerText().replace(/\r?\n/g, "\r\n") })),
        properties: (c.getInstanceProperties() as PropertyDeclaration[]).map(nodeProp => ({
            name: nodeProp.getName(),
            type: nodeProp.getType().getText(),
            hasQuestionToken: nodeProp.hasQuestionToken(),
            docs: nodeProp.getJsDocs().map(d => ({ description: d.getInnerText().replace(/\r?\n/g, "\r\n") }))
        })),
        methods: c.getInstanceMethods().map(method => ({
            name: method.getName(),
            returnType: method.getReturnTypeNodeOrThrow().getText(),
            docs: method.getJsDocs().map(d => ({ description: d.getInnerText().replace(/\r?\n/g, "\r\n") })),
            typeParameters: method.getTypeParameters().map(p => ({
                name: p.getName(),
                constraint: p.getConstraintNode() == null ? undefined : p.getConstraintNode()!.getText()
            })),
            parameters: method.getParameters().map(p => ({
                name: p.getNameOrThrow(),
                hasQuestionToken: p.hasQuestionToken(),
                type: p.getTypeNodeOrThrow().getText(),
                isRestParameter: p.isRestParameter()
            }))
        }))
    })));
}

export function cloneFunctions(node: StatementedNode, functions: FunctionDeclaration[]) {
    node.addFunctions(functions.map(f => ({
        name: f.getName(),
        hasDeclareKeyword: true,
        isExported: true,
        typeParameters: f.getTypeParameters().map(p => ({
            name: p.getName(),
            constraint: p.getConstraintNode() == null ? undefined : p.getConstraintNode()!.getText()
        })),
        docs: f.getJsDocs().map(d => ({ description: d.getInnerText().replace(/\r?\n/g, "\r\n") })),
        parameters: f.getParameters().map(p => ({
            name: p.getNameOrThrow(),
            hasQuestionToken: p.isOptional(),
            type: p.getTypeNodeOrThrow().getText(),
            isRestParameter: p.isRestParameter()
        })),
        returnType: f.getReturnTypeNodeOrThrow().getText()
    })));
}

export function cloneVariables(node: StatementedNode, variables: VariableStatement[]) {
    node.addVariableStatements(variables.map(v => ({
        isExported: true,
        declarationType: v.getDeclarationType(),
        hasDeclareKeyword: true,
        docs: v.getJsDocs().map(d => ({ description: d.getInnerText().replace(/\r?\n/g, "\r\n") })),
        declarations: v.getDeclarations().map(d => ({
            name: d.getName(),
            type: d.getTypeNode() == null ? undefined : d.getTypeNodeOrThrow().getText(),
            initializer: d.getInitializer() == null ? undefined : d.getInitializerOrThrow().getText()
        }))
    })));
}
