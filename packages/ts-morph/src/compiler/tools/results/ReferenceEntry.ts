import { ts } from "@ts-morph/common";
import { ProjectContext } from "../../../ProjectContext";
import { DocumentSpan } from "./DocumentSpan";

export class ReferenceEntry<T extends ts.ReferenceEntry = ts.ReferenceEntry> extends DocumentSpan<T> {
  /**
   * @private
   */
  constructor(context: ProjectContext, compilerObject: T) {
    super(context, compilerObject);
  }

  isWriteAccess() {
    // todo: not sure what this does
    return this.compilerObject.isWriteAccess;
  }

  isInString() {
    // todo: not sure what this does and why it can be undefined
    return this.compilerObject.isInString;
  }
}

export class ReferencedSymbolEntry extends ReferenceEntry<ts.ReferencedSymbolEntry> {
  /**
   * @private
   */
  constructor(context: ProjectContext, compilerObject: ts.ReferencedSymbolEntry) {
    super(context, compilerObject);
  }

  /**
   * If this is the definition reference.
   */
  isDefinition() {
    return this.compilerObject.isDefinition;
  }
}
