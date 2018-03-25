import * as objectAssign from "object-assign";

export abstract class SettingsContainer<T extends object> {
    private readonly defaultSettings: T;
    protected settings: T;

    constructor(defaultSettings: T) {
        this.defaultSettings = objectAssign({}, defaultSettings);
        this.settings = defaultSettings;
    }

    /**
     * Resets the settings to the default.
     */
    reset() {
        this.settings = objectAssign({}, this.defaultSettings);
    }

    /**
     * Gets a copy of the settings as an object.
     */
    get(): T {
        return objectAssign({}, this.settings);
    }

    /**
     * Sets one or all of the settings.
     * @param settings - Settings to set.
     */
    set(settings: Partial<T>) {
        objectAssign(this.settings, settings);
    }
}
