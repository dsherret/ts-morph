import { expect } from "chai";
import * as ts from "../../tsgo/ts";

/**
 * The enums the `ts` namespace has to carry, and the values tsgo gives them.
 *
 * Every enum here is named by the declared type of something the namespace
 * exposes — a compiler option, a symbol's flags, a checker parameter — so a
 * caller who reads a member off one is writing against a name rather than a
 * number. Leaving one out does not fail to compile, because the *type* still
 * resolves through the tsgo declaration it came from; it fails at run time with
 * "cannot read properties of undefined", which is what these tests guard.
 *
 * The values are asserted in full rather than checked for presence, because
 * several of them moved relative to the `typescript` package. `JsxEmit.React`
 * and `JsxEmit.ReactNative` in particular are transposed, so a wrong number
 * emits the wrong JSX rather than failing.
 */
describe("ts enums", () => {
  function assertMembers(name: string, actual: object | undefined, expected: Record<string, number | string>) {
    it(`should export ${name} with tsgo's values`, () => {
      expect(actual, `ts.${name} is not defined at runtime`).to.not.equal(undefined);
      const members = Object.fromEntries(Object.entries(actual!).filter(([key]) => Number.isNaN(Number(key))));
      expect(members).to.deep.equal(expected);
    });
  }

  describe("named by CompilerOptions", () => {
    // note: `React` and `ReactNative` swapped numbers relative to the
    // `typescript` package, where React was 2 and ReactNative was 3
    assertMembers("JsxEmit", ts.JsxEmit, {
      None: 0,
      Preserve: 1,
      ReactNative: 2,
      React: 3,
      ReactJSX: 4,
      ReactJSXDev: 5,
    });

    // note: classic had Legacy = 1 and Auto = 2, and no None
    assertMembers("ModuleDetectionKind", ts.ModuleDetectionKind, {
      None: 0,
      Auto: 1,
      Legacy: 2,
      Force: 3,
    });
  });

  describe("named by the checker surface", () => {
    // `Symbol#checkFlags`
    assertMembers("CheckFlags", ts.CheckFlags, {
      None: 0,
      Instantiated: 1,
      SyntheticProperty: 2,
      SyntheticMethod: 4,
      Readonly: 8,
      ReadPartial: 16,
      WritePartial: 32,
      HasNonUniformType: 64,
      HasLiteralType: 128,
      ContainsPublic: 256,
      ContainsProtected: 512,
      ContainsPrivate: 1024,
      ContainsStatic: 2048,
      Late: 4096,
      ReverseMapped: 8192,
      OptionalParameter: 16384,
      RestParameter: 32768,
      DeferredType: 65536,
      HasNeverType: 131072,
      Mapped: 262144,
      StripOptional: 524288,
      Unresolved: 1048576,
      IsDiscriminantComputed: 2097152,
      IsDiscriminant: 4194304,
      IndexSymbol: 8388608,
      Synthetic: 6,
      NonUniformAndLiteral: 192,
      Partial: 48,
    });

    // `TupleType#elementFlags`
    assertMembers("ElementFlags", ts.ElementFlags, {
      None: 0,
      Required: 1,
      Optional: 2,
      Rest: 4,
      Variadic: 8,
      Fixed: 3,
      Variable: 12,
      NonRequired: 14,
      NonRest: 11,
    });

    // `TypeChecker#getSignaturesOfType`
    assertMembers("SignatureKind", ts.SignatureKind, {
      Call: 0,
      Construct: 1,
    });

    // the `kind` of a `TypeChecker#getTypePredicateOfSignature` result
    assertMembers("TypePredicateKind", ts.TypePredicateKind, {
      This: 0,
      Identifier: 1,
      AssertsThis: 2,
      AssertsIdentifier: 3,
    });

    // the `kind` of a `TypeChecker#getCompletionsAtPosition` entry. This is an
    // LSP completion kind; the `typescript` package classified completions with
    // ScriptElementKind instead, and the two do not line up.
    assertMembers("CompletionItemKind", ts.CompletionItemKind, {
      Text: 1,
      Method: 2,
      Function: 3,
      Constructor: 4,
      Field: 5,
      Variable: 6,
      Class: 7,
      Interface: 8,
      Module: 9,
      Property: 10,
      Unit: 11,
      Value: 12,
      Enum: 13,
      Keyword: 14,
      Snippet: 15,
      Color: 16,
      File: 17,
      Reference: 18,
      Folder: 19,
      EnumMember: 20,
      Constant: 21,
      Struct: 22,
      Event: 23,
      Operator: 24,
      TypeParameter: 25,
    });
  });

  describe("named by the node helpers", () => {
    // the `kinds` parameter of `isOuterExpression` and `skipOuterExpressions`.
    // note: `ExcludeJSDocTypeAssertion` was `1 << 31` in the `typescript`
    // package and is 64 here, so the members above it are new numbers too.
    assertMembers("OuterExpressionKinds", ts.OuterExpressionKinds, {
      Parentheses: 1,
      TypeAssertions: 2,
      NonNullAssertions: 4,
      PartiallyEmittedExpressions: 8,
      ExpressionsWithTypeArguments: 16,
      Satisfies: 32,
      ExcludeJSDocTypeAssertion: 64,
      Assignments: 128,
      Comma: 256,
      Assertions: 38,
      All: 63,
      AllExceptAssertionsOrExpressionsWithTypeArguments: 9,
      ExpressionTypePassthrough: 385,
    });

    // the internal names an escaped `__String` can hold — `Symbol#escapedName`,
    // and what `escapeLeadingUnderscores` produces. Note that classic's
    // `Resolving` is gone and `AssignmentDeclaration`/`ModuleExports` are new.
    assertMembers("InternalSymbolName", ts.InternalSymbolName, {
      Call: "__call",
      Constructor: "__constructor",
      New: "__new",
      Index: "__index",
      ExportStar: "__export",
      Global: "__global",
      Missing: "__missing",
      Type: "__type",
      Object: "__object",
      JSXAttributes: "__jsxAttributes",
      Class: "__class",
      Function: "__function",
      Computed: "__computed",
      AssignmentDeclaration: "__assignment",
      InstantiationExpression: "__instantiationExpression",
      ImportAttributes: "__importAttributes",
      ExportEquals: "export=",
      Default: "default",
      This: "this",
      ModuleExports: "module.exports",
    });
  });

  describe("string unions tsgo does not give a run-time value", () => {
    // These were enum objects in the `typescript` package and are unions of
    // string literals in tsgo, so there is nothing to re-export and nothing to
    // read a member off. Asserted so that a later tsgo release turning either
    // back into an enum is noticed rather than silently unexported.
    it("should not define OrganizeImportsMode or QuotePreference", () => {
      const namespace = ts as Record<string, unknown>;
      expect(namespace.OrganizeImportsMode).to.equal(undefined);
      expect(namespace.QuotePreference).to.equal(undefined);
    });
  });
});
