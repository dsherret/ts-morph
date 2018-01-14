import {MixinableViewModel} from "./MixinableViewModel";

export interface ClassViewModel extends MixinableViewModel {
    name: string;
    path: string;
    isNodeClass: boolean;
    base: ClassViewModel | undefined;
}
