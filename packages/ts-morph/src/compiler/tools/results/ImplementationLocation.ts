import { ts } from "@ts-morph/common";
import { ProjectContext } from "../../../ProjectContext";
import { DocumentSpan } from "./DocumentSpan";

/**
 * Location of an implementation.
 *
 * Breaking change: `getKind()` and `getDisplayParts()` are gone. tsgo reports an
 * implementation as a file span and nothing else.
 */
export class ImplementationLocation extends DocumentSpan<ts.ImplementationLocation> {
  /**
   * @private
   */
  constructor(context: ProjectContext, compilerObject: ts.ImplementationLocation) {
    super(context, compilerObject);
  }
}
