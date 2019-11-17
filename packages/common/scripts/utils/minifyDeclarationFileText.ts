import * as ts from "typescript";

const scanner = ts.createScanner(
    ts.ScriptTarget.Latest,
    /* skipTrivia */ false,
    ts.LanguageVariant.Standard
);
const keywordsToSkipPreceedingSpace = new Set([
    ts.SyntaxKind.BreakKeyword,
    ts.SyntaxKind.CaseKeyword,
    ts.SyntaxKind.CatchKeyword,
    ts.SyntaxKind.ClassKeyword,
    ts.SyntaxKind.ConstKeyword,
    ts.SyntaxKind.ContinueKeyword,
    ts.SyntaxKind.DebuggerKeyword,
    ts.SyntaxKind.DefaultKeyword,
    ts.SyntaxKind.DeleteKeyword,
    ts.SyntaxKind.DoKeyword,
    ts.SyntaxKind.ElseKeyword,
    ts.SyntaxKind.EnumKeyword,
    ts.SyntaxKind.ExportKeyword,
    ts.SyntaxKind.FalseKeyword,
    ts.SyntaxKind.FinallyKeyword,
    ts.SyntaxKind.ForKeyword,
    ts.SyntaxKind.FunctionKeyword,
    ts.SyntaxKind.IfKeyword,
    ts.SyntaxKind.ImportKeyword,
    ts.SyntaxKind.NewKeyword,
    ts.SyntaxKind.NullKeyword,
    ts.SyntaxKind.ReturnKeyword,
    ts.SyntaxKind.SuperKeyword,
    ts.SyntaxKind.SwitchKeyword,
    ts.SyntaxKind.ThisKeyword,
    ts.SyntaxKind.ThrowKeyword,
    ts.SyntaxKind.TrueKeyword,
    ts.SyntaxKind.TryKeyword,
    ts.SyntaxKind.VarKeyword,
    ts.SyntaxKind.VoidKeyword,
    ts.SyntaxKind.WhileKeyword,
    ts.SyntaxKind.WithKeyword,
    ts.SyntaxKind.InterfaceKeyword,
    ts.SyntaxKind.LetKeyword,
    ts.SyntaxKind.PackageKeyword,
    ts.SyntaxKind.PrivateKeyword,
    ts.SyntaxKind.ProtectedKeyword,
    ts.SyntaxKind.PublicKeyword,
    ts.SyntaxKind.StaticKeyword,
    ts.SyntaxKind.YieldKeyword,
    ts.SyntaxKind.AbstractKeyword,
    ts.SyntaxKind.AnyKeyword,
    ts.SyntaxKind.AsyncKeyword,
    ts.SyntaxKind.AwaitKeyword,
    ts.SyntaxKind.BooleanKeyword,
    ts.SyntaxKind.ConstructorKeyword,
    ts.SyntaxKind.DeclareKeyword,
    ts.SyntaxKind.GetKeyword,
    ts.SyntaxKind.ModuleKeyword,
    ts.SyntaxKind.NamespaceKeyword,
    ts.SyntaxKind.NeverKeyword,
    ts.SyntaxKind.ReadonlyKeyword,
    ts.SyntaxKind.RequireKeyword,
    ts.SyntaxKind.NumberKeyword,
    ts.SyntaxKind.ObjectKeyword,
    ts.SyntaxKind.SetKeyword,
    ts.SyntaxKind.StringKeyword,
    ts.SyntaxKind.SymbolKeyword,
    ts.SyntaxKind.TypeKeyword,
    ts.SyntaxKind.UndefinedKeyword,
    ts.SyntaxKind.UniqueKeyword,
    ts.SyntaxKind.UnknownKeyword,
    ts.SyntaxKind.GlobalKeyword,
    ts.SyntaxKind.BigIntKeyword
]);
const keywordsToSkipSpace = new Set([
    ts.SyntaxKind.CatchKeyword,
    ts.SyntaxKind.DebuggerKeyword,
    ts.SyntaxKind.DefaultKeyword,
    ts.SyntaxKind.DoKeyword,
    ts.SyntaxKind.ElseKeyword,
    ts.SyntaxKind.FalseKeyword,
    ts.SyntaxKind.FinallyKeyword,
    ts.SyntaxKind.ForKeyword,
    ts.SyntaxKind.IfKeyword,
    ts.SyntaxKind.NullKeyword,
    ts.SyntaxKind.SuperKeyword,
    ts.SyntaxKind.SwitchKeyword,
    ts.SyntaxKind.ThisKeyword,
    ts.SyntaxKind.TrueKeyword,
    ts.SyntaxKind.TryKeyword,
    ts.SyntaxKind.WhileKeyword,
    ts.SyntaxKind.WithKeyword,
    ts.SyntaxKind.AnyKeyword,
    ts.SyntaxKind.BooleanKeyword,
    ts.SyntaxKind.ConstructorKeyword,
    ts.SyntaxKind.NeverKeyword,
    ts.SyntaxKind.RequireKeyword,
    ts.SyntaxKind.NumberKeyword,
    ts.SyntaxKind.ObjectKeyword,
    ts.SyntaxKind.StringKeyword,
    ts.SyntaxKind.SymbolKeyword,
    ts.SyntaxKind.UndefinedKeyword,
    ts.SyntaxKind.UnknownKeyword,
    ts.SyntaxKind.FromKeyword,
    ts.SyntaxKind.BigIntKeyword
]);

export function minifyDeclarationFileText(text: string) {
    let result = "";

    scanner.setText(text);

    while (scanner.scan() !== ts.SyntaxKind.EndOfFileToken) {
        const token = scanner.getToken();
        switch (token) {
            case ts.SyntaxKind.WhitespaceTrivia:
            case ts.SyntaxKind.NewLineTrivia:
                continue;
            case ts.SyntaxKind.SingleLineCommentTrivia:
                const tokenText = scanner.getTokenText();
                // simple check to just keep all triple slash comments in case they are a directive
                if (!tokenText.startsWith("///") || !tokenText.includes("<"))
                    continue;
                result += tokenText + "\n";
                break;
            case ts.SyntaxKind.MultiLineCommentTrivia: {
                const tokenText = scanner.getTokenText();
                const isJsDoc = tokenText.startsWith("/**");

                if (!isJsDoc)
                    continue;

                // remove the leading whitespace on each line
                result += tokenText.replace(/^\s+\*/mg, " *");
                break;
            }
            default:
                const isKeyword = token >= ts.SyntaxKind.FirstKeyword && token <= ts.SyntaxKind.LastKeyword;
                if (isKeyword && !keywordsToSkipPreceedingSpace.has(token))
                    result += " ";

                result += scanner.getTokenText();

                if (isKeyword && !keywordsToSkipSpace.has(token))
                    result += " ";
        }
    }

    return result;
}
