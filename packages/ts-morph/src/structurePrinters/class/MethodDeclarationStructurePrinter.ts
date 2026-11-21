import { CodeBlockWriter } from "../../codeBlockWriter";
import { StructurePrinterFactory } from "../../factories";
import { MethodDeclarationOverloadStructure, MethodDeclarationStructure, OptionalKind } from "../../structures";
import { withStructureDefaults } from "../../utils";
import { NodePrinter } from "../NodePrinter";

export class MethodDeclarationStructurePrinter extends NodePrinter<OptionalKind<MethodDeclarationStructure>> {
  readonly #options: { isAmbient: boolean };

  constructor(factory: StructurePrinterFactory, options: { isAmbient: boolean }) {
    super(factory);
    this.#options = options;
  }

  printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<MethodDeclarationStructure>> | undefined) {
    if (structures == null)
      return;

    for (let i = 0; i < structures.length; i++) {
      if (i > 0) {
        if (this.#options.isAmbient)
          writer.newLine();
        else
          writer.blankLine();
      }
      this.printText(writer, structures[i]);
    }
  }

  protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<MethodDeclarationStructure>) {
    // read once because the name may be a getter that returns different values
    const name = structure.name;
    this.#printOverloads(writer, name, getOverloadStructures());
    this.#printHeader(writer, name, structure);

    if (this.#options.isAmbient || structure.isAbstract)
      writer.write(";");
    else {
      writer.spaceIfLastNot().inlineBlock(() => {
        this.factory.forStatementedNode(this.#options).printText(writer, structure);
      });
    }

    function getOverloadStructures() {
      // all the overloads need to have the same scope as the implementation
      const overloads = structure.overloads;
      if (overloads == null || overloads.length === 0)
        return;

      const defaults = {
        scope: structure.scope,
        isStatic: structure.isStatic, // allow people to do stupid things
        isAbstract: structure.isAbstract,
        hasQuestionToken: structure.hasQuestionToken,
      };
      return overloads.map(overload => withStructureDefaults(overload, defaults));
    }
  }

  #printOverloads(writer: CodeBlockWriter, name: string, structures: ReadonlyArray<OptionalKind<MethodDeclarationOverloadStructure>> | undefined) {
    if (structures == null || structures.length === 0)
      return;

    for (const structure of structures) {
      this.printOverload(writer, name, structure);
      writer.newLine();
    }
  }

  printOverload(writer: CodeBlockWriter, name: string, structure: OptionalKind<MethodDeclarationOverloadStructure>) {
    this.printLeadingTrivia(writer, structure);
    this.#printHeader(writer, name, structure);
    writer.write(";");
    this.printTrailingTrivia(writer, structure);
  }

  #printHeader(
    writer: CodeBlockWriter,
    name: string,
    structure: OptionalKind<MethodDeclarationOverloadStructure> | OptionalKind<MethodDeclarationStructure>,
  ) {
    this.factory.forJSDoc().printDocs(writer, structure.docs);
    if ((structure as MethodDeclarationStructure).decorators != null)
      this.factory.forDecorator().printTexts(writer, (structure as MethodDeclarationStructure).decorators);

    this.factory.forModifierableNode().printText(writer, structure);
    writer.conditionalWrite(structure.isGenerator, "*");
    writer.write(name);
    writer.conditionalWrite(structure.hasQuestionToken, "?");
    this.factory.forTypeParameterDeclaration().printTextsWithBrackets(writer, structure.typeParameters);
    this.factory.forParameterDeclaration().printTextsWithParenthesis(writer, structure.parameters);
    this.factory.forReturnTypedNode().printText(writer, structure);
  }
}
