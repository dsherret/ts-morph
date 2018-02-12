import {StatementedNode, EnumDeclaration, EnumMemberStructure, InterfaceDeclaration, TypeAliasDeclaration, ClassDeclaration,
    PropertyDeclaration} from "./../../src/main";

// todo: in the future this should be done in the library (ex. node.addInterface(cloningInterface.getStructure()))

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
            typeParameters: method.getTypeParameters().map(p => ({
                name: p.getName(),
                constraint: p.getConstraintNode() == null ? undefined : p.getConstraintNode()!.getText()
            })),
            parameters: method.getParameters().map(p => ({
                name: p.getNameOrThrow(),
                hasQuestionToken: p.hasQuestionToken(),
                type: p.getTypeNodeOrThrow().getText()
            }))
        }))
    })));
}
