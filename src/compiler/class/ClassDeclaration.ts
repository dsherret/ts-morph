import * as ts from "typescript";
import * as errors from "./../../errors";
import {Node} from "./../common";
import {NamedNode, ExportableNode, ModifierableNode, AmbientableNode, DocumentationableNode, TypeParameteredNode, DecoratableNode, HeritageClauseableNode,
    ImplementsClauseableNode} from "./../base";
import {AbstractableNode} from "./base";
import {SourceFile} from "./../file";
import {ExpressionWithTypeArguments} from "./../type";
import {ConstructorDeclaration} from "./ConstructorDeclaration";
import {MethodDeclaration} from "./MethodDeclaration";
import {PropertyDeclaration} from "./PropertyDeclaration";
import {GetAccessorDeclaration} from "./GetAccessorDeclaration";
import {SetAccessorDeclaration} from "./SetAccessorDeclaration";

export type ClassPropertyTypes = PropertyDeclaration | GetAccessorDeclaration | SetAccessorDeclaration;

export const ClassDeclarationBase = ImplementsClauseableNode(HeritageClauseableNode(DecoratableNode(TypeParameteredNode(
    DocumentationableNode(AmbientableNode(AbstractableNode(ExportableNode(ModifierableNode(NamedNode(Node))))))
))));
export class ClassDeclaration extends ClassDeclarationBase<ts.ClassDeclaration> {
    /**
     * Gets the extends expression.
     */
    getExtends(): ExpressionWithTypeArguments | undefined {
        const heritageClauses = this.getHeritageClauses();
        const extendsClause = heritageClauses.find(c => c.node.token === ts.SyntaxKind.ExtendsKeyword);
        if (extendsClause == null)
            return undefined;

        const types = extendsClause.getTypes();
        return types.length === 0 ? undefined : types[0];
    }

    /**
     * Sets the extends expression.
     * @param text - Text to set as the extends expression.
     * @param sourceFile - Optional source file to help with performance.
     */
    setExtends(text: string, sourceFile: SourceFile = this.getRequiredSourceFile()) {
        errors.throwIfNotStringOrWhitespace(text, nameof(text));

        const heritageClauses = this.getHeritageClauses();
        const extendsClause = heritageClauses.find(c => c.node.token === ts.SyntaxKind.ExtendsKeyword);
        if (extendsClause != null) {
            sourceFile.replaceText(extendsClause.getStart(), extendsClause.getEnd(), `extends ${text}`);
            return this;
        }

        const implementsClause = heritageClauses.find(c => c.node.token === ts.SyntaxKind.ImplementsKeyword);
        let insertPos: number;
        if (implementsClause != null) {
            insertPos = implementsClause.getStart();
        }
        else {
            const openBraceToken = this.getFirstChildByKind(ts.SyntaxKind.OpenBraceToken);
            /* istanbul ignore if */
            if (openBraceToken == null)
                throw new errors.InvalidOperationError("Could not found open brace token.");
            insertPos = openBraceToken.getStart();
        }

        const isLastSpace = /\s/.test(sourceFile.getFullText()[insertPos - 1]);
        let insertText = `extends ${text} `;
        if (!isLastSpace)
            insertText = " " + insertText;

        sourceFile.insertText(insertPos, insertText);
    }

    /**
     * Gets the constructor declaration or undefined if none exists.
     */
    getConstructor() {
        const constructorMember = this.node.members.find(m => m.kind === ts.SyntaxKind.Constructor) as ts.ConstructorDeclaration | undefined;
        return constructorMember == null ? undefined : this.factory.getConstructorDeclaration(constructorMember);
    }

    /**
     * Gets the class instance method declarations.
     */
    getInstanceMethods(): MethodDeclaration[] {
        return this.getInstanceMembers().filter(m => m instanceof MethodDeclaration) as MethodDeclaration[];
    }

    /**
     * Gets the class instance property declarations.
     */
    getInstanceProperties(): ClassPropertyTypes[] {
        return this.getInstanceMembers()
            .filter(m => isClassPropertyType(m)) as ClassPropertyTypes[];
    }

    /**
     * Gets the instance members.
     */
    getInstanceMembers() {
        return this.getAllMembers().filter(m => !m.isConstructorDeclaration() && !m.isStatic());
    }

    /**
     * Gets the class instance method declarations.
     */
    getStaticMethods(): MethodDeclaration[] {
        return this.getStaticMembers().filter(m => m instanceof MethodDeclaration) as MethodDeclaration[];
    }

    /**
     * Gets the class instance property declarations.
     */
    getStaticProperties(): ClassPropertyTypes[] {
        return this.getStaticMembers()
            .filter(m => isClassPropertyType(m)) as ClassPropertyTypes[];
    }

    /**
     * Gets the static members.
     */
    getStaticMembers() {
        return this.getAllMembers().filter(m => !m.isConstructorDeclaration() && m.isStatic());
    }

    /**
     * Gets the instance and static members.
     */
    getAllMembers() {
        return this.node.members
            .map(m => this.factory.getNodeFromCompilerNode(m)) as (MethodDeclaration | PropertyDeclaration | GetAccessorDeclaration | SetAccessorDeclaration | ConstructorDeclaration)[];
    }
}

function isClassPropertyType(m: Node): m is ClassPropertyTypes {
    return m instanceof PropertyDeclaration || m instanceof SetAccessorDeclaration || m instanceof GetAccessorDeclaration;
}
