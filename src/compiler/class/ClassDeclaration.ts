import * as ts from "typescript";
import * as errors from "./../../errors";
import {insertCreatingSyntaxList, insertIntoSyntaxList, replaceStraight, getEndIndexFromArray, insertIntoBracesOrSourceFileWithFillAndGetChildren} from "./../../manipulation";
import {PropertyStructure, MethodStructure, ConstructorStructure} from "./../../structures";
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
export type ClassMemberTypes = MethodDeclaration | PropertyDeclaration | GetAccessorDeclaration | SetAccessorDeclaration | ConstructorDeclaration;

export const ClassDeclarationBase = ImplementsClauseableNode(HeritageClauseableNode(DecoratableNode(TypeParameteredNode(
    DocumentationableNode(AmbientableNode(AbstractableNode(ExportableNode(ModifierableNode(NamedNode(Node))))))
))));
export class ClassDeclaration extends ClassDeclarationBase<ts.ClassDeclaration> {
    /**
     * Sets the extends expression.
     * @param text - Text to set as the extends expression.
     */
    setExtends(text: string) {
        errors.throwIfNotStringOrWhitespace(text, nameof(text));

        const heritageClauses = this.getHeritageClauses();
        const extendsClause = heritageClauses.find(c => c.node.token === ts.SyntaxKind.ExtendsKeyword);
        if (extendsClause != null) {
            const extendsClauseStart = extendsClause.getStart();
            replaceStraight(this.getSourceFile(), extendsClauseStart, extendsClause.getEnd() - extendsClauseStart, `extends ${text}`);
            return this;
        }

        const implementsClause = heritageClauses.find(c => c.node.token === ts.SyntaxKind.ImplementsKeyword);
        let insertPos: number;
        if (implementsClause != null) {
            insertPos = implementsClause.getStart();
        }
        else {
            const openBraceToken = this.getFirstChildByKindOrThrow(ts.SyntaxKind.OpenBraceToken);
            insertPos = openBraceToken.getStart();
        }

        const isLastSpace = /\s/.test(this.getSourceFile().getFullText()[insertPos - 1]);
        let insertText = `extends ${text} `;
        if (!isLastSpace)
            insertText = " " + insertText;

        if (implementsClause == null)
            insertCreatingSyntaxList(this.getSourceFile(), insertPos, insertText);
        else
            insertIntoSyntaxList(this.getSourceFile(), insertPos, insertText, implementsClause.getParentSyntaxListOrThrow(), 0, 1);

        return this;
    }

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
     * Adds a constructor. Will remove the previous constructor if it exists.
     * @param structure - Structure of the constructor.
     */
    addConstructor(structure: ConstructorStructure = {}) {
        return this.insertConstructor(getEndIndexFromArray(this.node.members), structure);
    }

    /**
     * Inserts a constructor. Will remove the previous constructor if it exists.
     * @param index - Index to insert at.
     * @param structure - Structure of the constructor.
     */
    insertConstructor(index: number, structure: ConstructorStructure = {}) {
        const currentCtor = this.getConstructor();
        if (currentCtor != null)
            currentCtor.remove();

        const indentationText = this.getChildIndentationText();
        const newLineChar = this.factory.getLanguageService().getNewLine();
        const code = `${indentationText}constructor() {${newLineChar}${indentationText}}`;

        return insertIntoBracesOrSourceFileWithFillAndGetChildren<ConstructorDeclaration, ConstructorStructure>({
            getChildren: () => this.getAllMembers(),
            sourceFile: this.getSourceFile(),
            parent: this,
            index,
            childCodes: [code],
            structures: [structure],
            previousBlanklineWhen: () => true,
            nextBlanklineWhen: () => true,
            expectedKind: ts.SyntaxKind.Constructor
        })[0];
    }

    /**
     * Gets the constructor declaration or undefined if none exists.
     */
    getConstructor() {
        const constructorMember = this.node.members.find(m => m.kind === ts.SyntaxKind.Constructor) as ts.ConstructorDeclaration | undefined;
        return constructorMember == null ? undefined : this.factory.getConstructorDeclaration(constructorMember, this.sourceFile);
    }

    /**
     * Add property.
     * @param structure - Structure representing the property.
     */
    addProperty(structure: PropertyStructure) {
        return this.addProperties([structure])[0];
    }

    /**
     * Add properties.
     * @param structures - Structures representing the properties.
     */
    addProperties(structures: PropertyStructure[]) {
        return this.insertProperties(getEndIndexFromArray(this.node.members), structures);
    }

    /**
     * Insert property.
     * @param index - Index to insert at.
     * @param structure - Structure representing the property.
     */
    insertProperty(index: number, structure: PropertyStructure) {
        return this.insertProperties(index, [structure])[0];
    }

    /**
     * Insert properties.
     * @param index - Index to insert at.
     * @param structures - Structures representing the properties.
     */
    insertProperties(index: number, structures: PropertyStructure[]) {
        const indentationText = this.getChildIndentationText();

        // create code
        const codes: string[] = [];
        for (const structure of structures) {
            let code = `${indentationText}`;
            if (structure.isStatic)
                code += "static ";
            code += structure.name;
            if (structure.hasQuestionToken)
                code += "?";
            if (structure.type != null && structure.type.length > 0)
                code += `: ${structure.type}`;
            code += ";";
            codes.push(code);
        }

        return insertIntoBracesOrSourceFileWithFillAndGetChildren<PropertyDeclaration, PropertyStructure>({
            getChildren: () => this.getAllMembers(),
            sourceFile: this.getSourceFile(),
            parent: this,
            index,
            childCodes: codes,
            structures,
            previousBlanklineWhen: n => n.isBodyableNode() || n.isBodiedNode(),
            nextBlanklineWhen: n => n.isBodyableNode() || n.isBodiedNode(),
            expectedKind: ts.SyntaxKind.PropertyDeclaration
        });
    }

    /**
     * Gets the class instance property declarations.
     */
    getInstanceProperties(): ClassPropertyTypes[] {
        return this.getInstanceMembers()
            .filter(m => isClassPropertyType(m)) as ClassPropertyTypes[];
    }

    /**
     * Gets the class instance property declarations.
     */
    getStaticProperties(): ClassPropertyTypes[] {
        return this.getStaticMembers()
            .filter(m => isClassPropertyType(m)) as ClassPropertyTypes[];
    }

    /**
     * Add method.
     * @param structure - Structure representing the method.
     */
    addMethod(structure: MethodStructure) {
        return this.addMethods([structure])[0];
    }

    /**
     * Add methods.
     * @param structures - Structures representing the methods.
     */
    addMethods(structures: MethodStructure[]) {
        return this.insertMethods(getEndIndexFromArray(this.node.members), structures);
    }

    /**
     * Insert method.
     * @param index - Index to insert at.
     * @param structure - Structure representing the method.
     */
    insertMethod(index: number, structure: MethodStructure) {
        return this.insertMethods(index, [structure])[0];
    }

    /**
     * Insert methods.
     * @param index - Index to insert at.
     * @param structures - Structures representing the methods.
     */
    insertMethods(index: number, structures: MethodStructure[]) {
        const indentationText = this.getChildIndentationText();
        const newLineChar = this.factory.getLanguageService().getNewLine();

        // create code
        const codes: string[] = [];
        for (const structure of structures) {
            let code = indentationText;
            if (structure.isStatic)
                code += "static ";
            code += `${structure.name}()`;
            if (structure.returnType != null && structure.returnType.length > 0)
                code += `: ${structure.returnType}`;
            code += ` {` + newLineChar;
            code += indentationText + `}`;
            codes.push(code);
        }

        // insert, fill, and get created nodes
        return insertIntoBracesOrSourceFileWithFillAndGetChildren<MethodDeclaration, MethodStructure>({
            getChildren: () => this.getAllMembers(),
            sourceFile: this.getSourceFile(),
            parent: this,
            index,
            childCodes: codes,
            structures,
            previousBlanklineWhen: () => true,
            nextBlanklineWhen: () => true,
            separatorNewlineWhen: () => true,
            expectedKind: ts.SyntaxKind.MethodDeclaration
        });
    }

    /**
     * Gets the class instance method declarations.
     */
    getInstanceMethods(): MethodDeclaration[] {
        return this.getInstanceMembers().filter(m => m instanceof MethodDeclaration) as MethodDeclaration[];
    }

    /**
     * Gets the class instance method declarations.
     */
    getStaticMethods(): MethodDeclaration[] {
        return this.getStaticMembers().filter(m => m instanceof MethodDeclaration) as MethodDeclaration[];
    }

    /**
     * Gets the instance members.
     */
    getInstanceMembers() {
        return this.getAllMembers().filter(m => !m.isConstructorDeclaration() && !m.isStatic());
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
        return this.node.members.map(m => this.factory.getNodeFromCompilerNode(m, this.sourceFile)) as ClassMemberTypes[];
    }
}

function isClassPropertyType(m: Node): m is ClassPropertyTypes {
    return m instanceof PropertyDeclaration || m instanceof SetAccessorDeclaration || m instanceof GetAccessorDeclaration;
}
