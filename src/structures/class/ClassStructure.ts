import {NamedStructure} from "./../base";
import {PropertyStructure} from "./PropertyStructure";

// todo: implement this
export interface ClassStructure extends NamedStructure {
    properties?: PropertyStructure[];
}
