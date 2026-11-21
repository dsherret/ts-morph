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
    this.#defaultSettings = cloneSettings(defaultSettings);
    this._settings = cloneSettings(defaultSettings);
  }

  /**
   * Resets the settings to the default.
   */
  reset() {
    this._settings = cloneSettings(this.#defaultSettings);
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

function cloneSettings<T extends object>(settings: T): T {
  const clones = new Map<object, unknown>();
  const result = Object.assign({}, settings) as Record<PropertyKey, unknown>;
  clones.set(settings, result);
  for (const key of Reflect.ownKeys(result))
    result[key] = cloneValue(result[key], clones);
  return result as T;
}

// only arrays and plain objects are cloned because values like `configFile` are shared class instances
function cloneValue(value: unknown, clones: Map<object, unknown>): unknown {
  if (!isPlainArrayOrObject(value) || Object.isFrozen(value))
    return value;
  if (clones.has(value))
    return clones.get(value);

  const result = Array.isArray(value) ? new Array(value.length) : Object.create(Object.getPrototypeOf(value));
  clones.set(value, result);
  for (const key of Object.keys(value)) {
    // define rather than assign so an own `__proto__` key stays a normal property
    Object.defineProperty(result, key, {
      value: cloneValue((value as Record<string, unknown>)[key], clones),
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }
  return result;
}

function isPlainArrayOrObject(value: unknown): value is object {
  if (typeof value !== "object" || value === null)
    return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Array.prototype || prototype === Object.prototype || prototype === null;
}
