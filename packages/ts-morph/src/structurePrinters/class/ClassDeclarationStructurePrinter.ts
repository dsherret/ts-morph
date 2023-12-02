import { ArrayUtils, StringUtils } from "@ts-morph/common";
import { CodeBlockWriter } from "../../codeBlockWriter";
import { StructurePrinterFactory } from "../../factories";
import { ClassDeclarationStructure, OptionalKind } from "../../structures";
import { BlankLineFormattingStructuresPrinter } from "../formatting";
import { NodePrinter } from "../NodePrinter";
import { GetAndSetAccessorStructurePrinter } from "./GetAndSetAccessorStructurePrinter";

export class ClassDeclarationStructurePrinter extends NodePrinter<OptionalKind<ClassDeclarationStructure>> {
  readonly #options: { isAmbient: boolean };
  readonly #multipleWriter = new BlankLineFormattingStructuresPrinter(this);

  constructor(factory: StructurePrinterFactory, options: { isAmbient: boolean }) {
    super(factory);
    this.#options = options;
  }

  printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<ClassDeclarationStructure>> | undefined) {
    this.#multipleWriter.printText(writer, structures);
  }

  protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<ClassDeclarationStructure>) {
    const isAmbient = structure.hasDeclareKeyword || this.#options.isAmbient;
    this.factory.forJSDoc().printDocs(writer, structure.docs);
    this.factory.forDecorator().printTexts(writer, structure.decorators);
    this.#printHeader(writer, structure);

    writer.inlineBlock(() => {
      this.factory.forPropertyDeclaration().printTexts(writer, structure.properties);
      this.#printCtors(writer, structure, isAmbient);
      this.#printGetAndSet(writer, structure, isAmbient);

      if (!ArrayUtils.isNullOrEmpty(structure.methods)) {
        this.#conditionalSeparator(writer, isAmbient);
        this.factory.forMethodDeclaration({ isAmbient }).printTexts(writer, structure.methods);
      }
    });
  }

  #printHeader(writer: CodeBlockWriter, structure: OptionalKind<ClassDeclarationStructure>) {
    this.factory.forModifierableNode().printText(writer, structure);
    writer.write(`class`);
    // can be null, ex. `export default class { ... }`
    if (!StringUtils.isNullOrWhitespace(structure.name))
      writer.space().write(structure.name);
    this.factory.forTypeParameterDeclaration().printTextsWithBrackets(writer, structure.typeParameters);
    writer.space();

    writer.hangingIndent(() => {
      if (structure.extends != null) {
        const extendsText = this.getText(writer, structure.extends);
        if (!StringUtils.isNullOrWhitespace(extendsText))
          writer.write(`extends ${extendsText} `);
      }

      if (structure.implements != null) {
        const implementsText = structure.implements instanceof Array
          ? structure.implements.map(i => this.getText(writer, i)).join(", ")
          : this.getText(writer, structure.implements);

        if (!StringUtils.isNullOrWhitespace(implementsText))
          writer.write(`implements ${implementsText} `);
      }
    });
  }

  #printCtors(writer: CodeBlockWriter, structure: OptionalKind<ClassDeclarationStructure>, isAmbient: boolean) {
    if (ArrayUtils.isNullOrEmpty(structure.ctors))
      return;

    for (const ctor of structure.ctors) {
      this.#conditionalSeparator(writer, isAmbient);
      this.factory.forConstructorDeclaration({ isAmbient }).printText(writer, ctor);
    }
  }

  #printGetAndSet(writer: CodeBlockWriter, structure: OptionalKind<ClassDeclarationStructure>, isAmbient: boolean) {
    if (structure.getAccessors == null && structure.setAccessors == null)
      return;

    const getAccessorWriter = this.factory.forGetAccessorDeclaration({ isAmbient });
    const setAccessorWriter = this.factory.forSetAccessorDeclaration({ isAmbient });

    const combinedPrinter = new GetAndSetAccessorStructurePrinter(getAccessorWriter, setAccessorWriter);
    combinedPrinter.printGetAndSet(writer, structure.getAccessors, structure.setAccessors, isAmbient);
  }

  #conditionalSeparator(writer: CodeBlockWriter, isAmbient: boolean) {
    if (writer.isAtStartOfFirstLineOfBlock())
      return;

    if (isAmbient)
      writer.newLine();
    else
      writer.blankLine();
  }
}
