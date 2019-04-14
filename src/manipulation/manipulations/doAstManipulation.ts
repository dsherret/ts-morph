/* barrel:ignore */
import { SourceFile, Statement } from "../../compiler";
import { hasParsedTokens, ExtendedParser } from "../../compiler/ast/utils";
import { ts } from "../../typescript";
import * as errors from "../../errors";
import { NodeHandler } from "../nodeHandlers";
import { AstTextManipulator } from "../textManipulators";

export function doAstManipulation(sourceFile: SourceFile, textManipulator: AstTextManipulator, astNodeHandler: AstNodeHandler) {
    sourceFile._firePreModified();
    const compilerSourceFile = sourceFile.compilerNode;
    const originalText = compilerSourceFile.text;
    const newFileTextResult = textManipulator.getNewTextForAst(originalText);
    const newFileText = newFileTextResult.newText;
    astNodeHandler.updateAst();
    compilerSourceFile.text = newFileText;
    updateNodes(compilerSourceFile, newFileTextResult.pos, newFileTextResult.end, newFileText.length - originalText.length);
}

export interface AstNodeHandler {
    updateAst(): void;
}

function updateNodes(sourceFile: ts.SourceFile, pos: number, end: number, lengthDifference: number) {
    updateNodeAndChildren(sourceFile);

    function updateNodeAndChildren(node: ts.Node) {
        if (hasParsedTokens(node)) {
            const children = ExtendedParser.getCompilerChildren(node, sourceFile);
            for (const child of children)
                updateNodeAndChildren(child);
        }
        else {
            ts.forEachChild(node, child => {
                updateNodeAndChildren(child);
            });
        }

        updateNode(node);
    }

    function updateNode(node: ts.Node) {
        // todo: a lot...
        if (node.pos > pos)
            node.pos += lengthDifference;
        if (node.end > pos)
            node.end += lengthDifference;
        // todo: update extended comment positions (ex. full start)
    }
}

export class RemoveStatementAstNodeHandler implements AstNodeHandler {
    constructor(private readonly sourceFile: SourceFile, private readonly statement: Statement) {
    }

    updateAst() {
        const statement = this.statement.compilerNode;
        this.statement.forget();

        const parent = statement.parent as ts.Node & { statements: ts.Statement[]; };
        const statements = ExtendedParser.getContainerArray(parent as any, this.sourceFile.compilerNode);
        const index = statements.indexOf(statement);
        statements.splice(index, 1);

        // update the next sibling to have the old node's position
        if (statements[index] != null)
            statements[index].pos = statement.pos;

        const statementIndex = parent.statements.indexOf(statement);
        if (statementIndex >= 0)
            parent.statements.splice(index, 1);

        if (hasParsedTokens(parent)) {
            const children = ExtendedParser.getCompilerChildren(parent, this.sourceFile.compilerNode);
            const syntaxLists = children.filter(n => n.kind === ts.SyntaxKind.SyntaxList) as ts.SyntaxList[];
            for (const syntaxList of syntaxLists) {
                const syntaxListChildren = ExtendedParser.getCompilerChildren(syntaxList, this.sourceFile.compilerNode);
                const index = syntaxListChildren.indexOf(statement);
                if (index >= 0) {
                    syntaxListChildren.splice(index, 1);
                    break;
                }
            }
        }
    }
}