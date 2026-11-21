/**
 * Gets a read-only view of a structure that uses the provided defaults for undefined properties.
 *
 * Properties are read from the original object so inherited accessors keep their receiver
 * (ex. those backed by private fields) and each property is only read once.
 */
export function withStructureDefaults<T extends object>(structure: T, defaults: Partial<T>): T {
  const values = new Map<string | symbol, unknown>();
  // use an empty target because proxy invariants would prevent overriding undefined properties of frozen objects
  return new Proxy({} as T, {
    get(_target, key) {
      if (!values.has(key)) {
        const value = Reflect.get(structure, key);
        values.set(key, value === undefined ? Reflect.get(defaults, key) : value);
      }
      return values.get(key);
    },
  });
}
