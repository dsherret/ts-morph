import {ts, SyntaxKind} from "./../../typescript";
import {Node, SourceFile} from "./../../compiler";
import {getRangeFromArray} from "./getRangeFromArray";

export interface FillAndGetChildrenOptions<TNode extends Node, TStructure> {
    sourceFile: SourceFile;
    allChildren: Node[];
    index: number;
    expectedKind: SyntaxKind;
    structures: TStructure[];
    fillFunction?: (child: TNode, structure: TStructure) => void;
}

export function fillAndGetChildren<TNode extends Node, TStructure>(opts: FillAndGetChildrenOptions<TNode, TStructure>) {
    const children = getRangeFromArray<TNode>(opts.allChildren, opts.index, opts.structures.length, opts.expectedKind);

    if (opts.fillFunction != null) {
        for (let i = 0; i < children.length; i++) {
            opts.fillFunction(children[i], opts.structures[i]);
        }
    }

    return children;
}
