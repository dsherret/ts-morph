import { StringUtils, ts } from "@ts-morph/common";
import { CompilerCommentNode } from "./CompilerComments";

enum CommentKind {
    SingleLine,
    MultiLine,
    JsDoc
}

export interface CommentScanner {
    setPos(newPos: number): void;
    parseUntilLineBreakOrToken(parent: ts.Node, fullStart: number): Iterable<CompilerCommentNode>;
}

export function createCommentScanner(sourceFile: ts.SourceFile): CommentScanner {
    const sourceFileText = sourceFile.text;
    let pos = 0;

    return {
        setPos(newPos: number) {
            pos = newPos;
        },
        parseUntilLineBreakOrToken
    };

    function* parseUntilLineBreakOrToken(parent: ts.Node, fullStart: number) {
        while (pos < sourceFileText.length) {
            const commentKind = getCommentKind();
            if (commentKind != null)
                yield parseForComment(commentKind);
            else if (!StringUtils.isWhitespace(sourceFileText[pos]))
                return;
            else if (sourceFileText[pos] === "\n") {
                pos++;
                return;
            }
            else
                pos++;
        }

        function getCommentKind() {
            const currentChar = sourceFileText[pos];
            if (currentChar !== "/")
                return undefined;

            const nextChar = sourceFileText[pos + 1];
            if (nextChar === "/")
                return CommentKind.SingleLine;

            if (nextChar !== "*")
                return undefined;

            const nextNextChar = sourceFileText[pos + 2];
            return nextNextChar === "*" ? CommentKind.JsDoc : CommentKind.MultiLine;
        }

        function parseForComment(commentKind: CommentKind) {
            if (commentKind === CommentKind.SingleLine)
                return parseSingleLineComment();

            const isJsDoc = commentKind === CommentKind.JsDoc;
            return parseMultiLineComment(isJsDoc);
        }

        function parseSingleLineComment() {
            const start = pos;
            skipSingleLineComment();
            const end = pos;

            return new CompilerCommentNode(fullStart, start, end, ts.SyntaxKind.SingleLineCommentTrivia, sourceFile, parent);
        }

        function skipSingleLineComment() {
            pos += 2; // skip the slash slash

            while (pos < sourceFileText.length && sourceFileText[pos] !== "\n" && sourceFileText[pos] !== "\r")
                pos++;
        }

        function parseMultiLineComment(isJsDoc: boolean) {
            const start = pos;
            skipSlashStarComment(isJsDoc);
            const end = pos;

            return new CompilerCommentNode(fullStart, start, end, ts.SyntaxKind.MultiLineCommentTrivia, sourceFile, parent);
        }

        function skipSlashStarComment(isJsDoc: boolean) {
            pos += isJsDoc ? 3 : 2; // skip slash star star or slash star

            while (pos < sourceFileText.length) {
                if (sourceFileText[pos] === "*" && sourceFileText[pos + 1] === "/") {
                    pos += 2; // skip star slash
                    break;
                }
                pos++;
            }
        }
    }
}
