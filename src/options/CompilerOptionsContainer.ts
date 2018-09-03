import { CompilerOptions } from "../typescript";
import { SettingsContainer } from "./SettingsContainer";

/**
 * Holds the compiler options.
 */
export class CompilerOptionsContainer extends SettingsContainer<CompilerOptions> {
    constructor() {
        super({});
    }

    /**
     * Sets one or all of the compiler options.
     *
     * WARNING: Setting the compiler options will cause a complete reparse of all the source files.
     * @param settings - Compiler options to set.
     */
    set(settings: Partial<CompilerOptions>) {
        super.set(settings);
    }
}
