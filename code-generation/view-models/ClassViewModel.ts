import {MixinableViewModel} from "./MixinableViewModel";
import {Node} from "./../../src/main";

export interface ClassViewModel extends MixinableViewModel {
    name: string;
    path: string;
    isNodeClass: boolean;
    base: ClassViewModel | undefined;
    associatedTsNodes: Node[];
}
