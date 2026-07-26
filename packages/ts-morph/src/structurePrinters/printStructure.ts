import { errors } from "@ts-morph/common";
import CodeBlockWriter from "code-block-writer";
import { StructurePrinterFactory } from "../factories/StructurePrinterFactory";
import { StructureKind, Structures } from "../structures";

/** Options for printing a structure to a string. */
export interface PrintStructureOptions {
  /** Number of spaces for indentation. Defaults to 4. Ignored when useTabs is true. */
  indentNumberOfSpaces?: number;
  /** Whether to use tabs for indentation. Defaults to false. */
  useTabs?: boolean;
  /** Newline character. Defaults to "\n". */
  newLine?: "\n" | "\r\n";
  /** Whether to use single quotes. Defaults to false. */
  useSingleQuote?: boolean;
  /**
   * Whether to insert a space after opening and before closing non-empty braces.
   *
   * ex. `import { Item } from "./Item";` or `import {Item} from "./Item";`
   * @remarks Defaults to true.
   */
  insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces?: boolean;
}

/**
 * Prints a structure to a string.
 * @param structure - Structure to print.
 * @param options - Options for formatting the output.
 */
export function printStructure(structure: Structures, options?: PrintStructureOptions): string {
  const {
    indentNumberOfSpaces = 4,
    useTabs = false,
    newLine = "\n",
    useSingleQuote = false,
    insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces = true,
  } = options ?? {};

  const factory = new StructurePrinterFactory(() => ({
    insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces,
    convertTabsToSpaces: !useTabs,
    tabSize: indentNumberOfSpaces,
  }));

  const writer = new CodeBlockWriter({
    indentNumberOfSpaces: useTabs ? undefined : indentNumberOfSpaces,
    useTabs,
    newLine,
    useSingleQuote,
  });

  printStructureByKind(writer, factory, structure);

  return writer.toString();
}

function printStructureByKind(writer: CodeBlockWriter, factory: StructurePrinterFactory, structure: Structures) {
  const notAmbient = { isAmbient: false };
  switch (structure.kind) {
    // statements
    case StructureKind.Class:
      factory.forClassDeclaration(notAmbient).printText(writer, structure);
      break;
    case StructureKind.Interface:
      factory.forInterfaceDeclaration().printText(writer, structure);
      break;
    case StructureKind.Enum:
      factory.forEnumDeclaration().printText(writer, structure);
      break;
    case StructureKind.Function:
      factory.forFunctionDeclaration(notAmbient).printText(writer, structure);
      break;
    case StructureKind.FunctionOverload:
      throw new errors.NotSupportedError("Function overload structures cannot be printed standalone. Print the parent function structure instead.");
    case StructureKind.TypeAlias:
      factory.forTypeAliasDeclaration().printText(writer, structure);
      break;
    case StructureKind.VariableStatement:
      factory.forVariableStatement().printText(writer, structure);
      break;
    case StructureKind.ImportDeclaration:
      factory.forImportDeclaration().printText(writer, structure);
      break;
    case StructureKind.ExportDeclaration:
      factory.forExportDeclaration().printText(writer, structure);
      break;
    case StructureKind.ExportAssignment:
      factory.forExportAssignment().printText(writer, structure);
      break;
    case StructureKind.Module:
      factory.forModuleDeclaration(notAmbient).printText(writer, structure);
      break;
    case StructureKind.SourceFile:
      factory.forSourceFile(notAmbient).printText(writer, structure);
      break;

    // class members
    case StructureKind.Constructor:
      factory.forConstructorDeclaration(notAmbient).printText(writer, structure);
      break;
    case StructureKind.ConstructorOverload:
      throw new errors.NotSupportedError("Constructor overload structures cannot be printed standalone. Print the parent constructor structure instead.");
    case StructureKind.Method:
      factory.forMethodDeclaration(notAmbient).printText(writer, structure);
      break;
    case StructureKind.MethodOverload:
      throw new errors.NotSupportedError("Method overload structures cannot be printed standalone. Print the parent method structure instead.");
    case StructureKind.Property:
      factory.forPropertyDeclaration().printText(writer, structure);
      break;
    case StructureKind.GetAccessor:
      factory.forGetAccessorDeclaration(notAmbient).printText(writer, structure);
      break;
    case StructureKind.SetAccessor:
      factory.forSetAccessorDeclaration(notAmbient).printText(writer, structure);
      break;
    case StructureKind.ClassStaticBlock:
      factory.forClassStaticBlockDeclaration().printText(writer, structure);
      break;

    // interface members
    case StructureKind.CallSignature:
      factory.forCallSignatureDeclaration().printText(writer, structure);
      break;
    case StructureKind.ConstructSignature:
      factory.forConstructSignatureDeclaration().printText(writer, structure);
      break;
    case StructureKind.IndexSignature:
      factory.forIndexSignatureDeclaration().printText(writer, structure);
      break;
    case StructureKind.MethodSignature:
      factory.forMethodSignature().printText(writer, structure);
      break;
    case StructureKind.PropertySignature:
      factory.forPropertySignature().printText(writer, structure);
      break;

    // enum
    case StructureKind.EnumMember:
      factory.forEnumMember().printText(writer, structure);
      break;

    // module
    case StructureKind.ExportSpecifier:
      factory.forNamedImportExportSpecifier().printText(writer, structure);
      break;
    case StructureKind.ImportSpecifier:
      factory.forNamedImportExportSpecifier().printText(writer, structure);
      break;
    case StructureKind.ImportAttribute:
      factory.forImportAttribute().printText(writer, structure);
      break;

    // object literal expression
    case StructureKind.PropertyAssignment:
      factory.forPropertyAssignment().printText(writer, structure);
      break;
    case StructureKind.ShorthandPropertyAssignment:
      factory.forShorthandPropertyAssignment().printText(writer, structure);
      break;
    case StructureKind.SpreadAssignment:
      factory.forSpreadAssignment().printText(writer, structure);
      break;

    // function
    case StructureKind.Parameter:
      factory.forParameterDeclaration().printText(writer, structure);
      break;

    // type
    case StructureKind.TypeParameter:
      factory.forTypeParameterDeclaration().printText(writer, structure);
      break;
    case StructureKind.VariableDeclaration:
      factory.forVariableDeclaration().printText(writer, structure);
      break;

    // decorator
    case StructureKind.Decorator:
      factory.forDecorator().printText(writer, structure);
      break;

    // doc
    case StructureKind.JSDoc:
      factory.forJSDoc().printText(writer, structure);
      break;
    case StructureKind.JSDocTag:
      factory.forJSDocTag({ printStarsOnNewLine: true }).printText(writer, structure);
      break;

    // jsx
    case StructureKind.JsxAttribute:
      factory.forJsxAttribute().printText(writer, structure);
      break;
    case StructureKind.JsxSpreadAttribute:
      factory.forJsxSpreadAttribute().printText(writer, structure);
      break;
    case StructureKind.JsxElement:
      factory.forJsxElement().printText(writer, structure);
      break;
    case StructureKind.JsxSelfClosingElement:
      factory.forJsxSelfClosingElement().printText(writer, structure);
      break;

    default:
      errors.throwNotImplementedForNeverValueError(structure);
  }
}
