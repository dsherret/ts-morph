import { ts } from "@ts-morph/common";
import { Constructor } from "../../../../types";
import { Node } from "../../common";
import { DefinitionInfo } from "../../../tools";

export type CommonIdentifierBaseExtensionType = Node<ts.Node & { text: string; }>;

export interface CommonIdentifierBase {
    /**
     * Gets the text for the identifier.
     */
    getText(): string;

    /**
     * Gets the definition nodes of the identifier.
     * @remarks This is similar to "go to definition" and `.getDefinitions()`, but only returns the nodes.
     */
    getDefinitionNodes(): Node[];

    /**
     * Gets the definitions of the identifier.
     * @remarks This is similar to "go to definition." Use `.getDefinitionNodes()` if you only care about the nodes.
     */
    getDefinitions(): DefinitionInfo[];
}

export function CommonIdentifierBase<T extends Constructor<CommonIdentifierBaseExtensionType>>(Base: T): Constructor<CommonIdentifierBase> & T {
    return class extends Base implements CommonIdentifierBase {
        getText() {
            return this.compilerNode.text;
        }

        getDefinitionNodes(): Node[] {
            return this.getDefinitions().map(d => d.getDeclarationNode()).filter(d => d != null) as Node[];
        }

        getDefinitions(): DefinitionInfo[] {
            return this._context.languageService.getDefinitions(this);
        }
    };
}
