import * as objectAssign from "object-assign";
import { EventContainer } from "../utils";

export abstract class SettingsContainer<T extends object> {
    /** @internal */
    private readonly defaultSettings: T;
    /** @internal */
    private _modifiedEventContainer: EventContainer | undefined;
    /** @internal */
    protected settings: T;

    /** @internal */
    constructor(defaultSettings: T) {
        this.defaultSettings = objectAssign({}, defaultSettings);
        this.settings = defaultSettings;
    }

    /**
     * Resets the settings to the default.
     */
    reset() {
        this.settings = objectAssign({}, this.defaultSettings);
        this.fireModified();
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
        this.fireModified();
    }

    /**
     * Subscribe to modifications in the settings container.
     * @param action - Action to execute when the settings change.
     * @internal
     */
    onModified(action: () => void) {
        if (this._modifiedEventContainer == null)
            this._modifiedEventContainer = new EventContainer();
        this._modifiedEventContainer.subscribe(action);
    }

    /** @internal */
    private fireModified() {
        if (this._modifiedEventContainer != null)
            this._modifiedEventContainer.fire(undefined);
    }
}
