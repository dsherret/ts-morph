import { CompilerOptions } from "../typescript";
import { SettingsContainer } from "./SettingsContainer";

/**
 * Holds the compiler options.
 */
export class CompilerOptionsContainer extends SettingsContainer<CompilerOptions> {
    constructor() {
        super({});
    }
}
