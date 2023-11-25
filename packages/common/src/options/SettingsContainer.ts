import { EventContainer, ObjectUtils } from "../utils";

export abstract class SettingsContainer<T extends object> {
  /** @internal */
  readonly #defaultSettings: T;
  /** @internal */
  #modifiedEventContainer: EventContainer | undefined;
  protected _settings: T;

  /**
   * Constructor.
   * @param defaultSettings - The settings to use by default.
   */
  constructor(defaultSettings: T) {
    this.#defaultSettings = Object.assign({}, defaultSettings);
    this._settings = defaultSettings;
  }

  /**
   * Resets the settings to the default.
   */
  reset() {
    this._settings = Object.assign({}, this.#defaultSettings);
    this.#fireModified();
  }

  /**
   * Gets a copy of the settings as an object.
   */
  get(): T {
    return Object.assign({}, this._settings);
  }

  /**
   * Sets one or all of the settings.
   * @param settings - Settings to set.
   */
  set(settings: Partial<T>) {
    Object.assign(this._settings, settings);
    this.#fireModified();
  }

  /**
   * Subscribe to modifications in the settings container.
   * @param action - Action to execute when the settings change.
   */
  onModified(action: () => void) {
    if (this.#modifiedEventContainer == null)
      this.#modifiedEventContainer = new EventContainer();
    this.#modifiedEventContainer.subscribe(action);
  }

  #fireModified() {
    if (this.#modifiedEventContainer != null)
      this.#modifiedEventContainer.fire(undefined);
  }
}
