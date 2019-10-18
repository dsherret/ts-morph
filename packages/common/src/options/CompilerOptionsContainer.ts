import { ts } from "../typescript";
import { SettingsContainer } from "./SettingsContainer";

/**
 * Holds the compiler options.
 */
export class CompilerOptionsContainer extends SettingsContainer<ts.CompilerOptions> {
    constructor() {
        super({});
    }

    /**
     * Sets one or all of the compiler options.
     *
     * WARNING: Setting the compiler options will cause a complete reparse of all the source files.
     * @param settings - Compiler options to set.
     */
    set(settings: Partial<ts.CompilerOptions>) {
        super.set(settings);
    }

    /**
     * Gets the encoding from the compiler options or returns utf-8.
     */
    getEncoding() {
        return this._settings.charset || "utf-8";
    }
}
