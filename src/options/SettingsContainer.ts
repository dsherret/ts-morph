import { EventContainer, ObjectUtils } from "../utils";

export abstract class SettingsContainer<T extends object> {
    /** @internal */
    private readonly _defaultSettings: T;
    /** @internal */
    private _modifiedEventContainer: EventContainer | undefined;
    /** @internal */
    protected settings: T;

    /** @private */
    constructor(defaultSettings: T) {
        this._defaultSettings = ObjectUtils.assign({}, defaultSettings);
        this.settings = defaultSettings;
    }

    /**
     * Resets the settings to the default.
     */
    reset() {
        this.settings = ObjectUtils.assign({}, this._defaultSettings);
        this._fireModified();
    }

    /**
     * Gets a copy of the settings as an object.
     */
    get(): T {
        return ObjectUtils.assign({}, this.settings);
    }

    /**
     * Sets one or all of the settings.
     * @param settings - Settings to set.
     */
    set(settings: Partial<T>) {
        ObjectUtils.assign(this.settings, settings);
        this._fireModified();
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
    private _fireModified() {
        if (this._modifiedEventContainer != null)
            this._modifiedEventContainer.fire(undefined);
    }
}
