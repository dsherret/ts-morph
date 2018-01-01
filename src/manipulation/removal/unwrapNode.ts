import {Node} from "./../../compiler";
import {NodeHandlerFactory} from "./../nodeHandlers";
import {UnwrapTextManipulator} from "./../textManipulators";
import {doManipulation} from "./../doManipulation";

export function unwrapNode(node: Node) {
    doManipulation(node.sourceFile,
        new UnwrapTextManipulator(node),
        new NodeHandlerFactory().getForUnwrappingNode(node));
}
