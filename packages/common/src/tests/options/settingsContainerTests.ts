import { expect } from "chai";
import { CompilerOptionsContainer } from "../../options";
import { ts } from "../../typescript";

describe("SettingsContainer", () => {
  it("should restore nested defaults on reset", () => {
    const container = new CompilerOptionsContainer({ paths: { a: ["x"] }, lib: ["es5"] });
    const settings = container.get();
    settings.paths!.a.push("MUT");
    settings.lib!.push("MUT");

    container.reset();

    expect(container.get()).to.deep.equal({ paths: { a: ["x"] }, lib: ["es5"] });
  });

  it("should restore defaults on every reset", () => {
    const container = new CompilerOptionsContainer({ lib: ["es5"] });
    container.reset();
    container.get().lib!.push("MUT");
    container.reset();
    expect(container.get().lib).to.deep.equal(["es5"]);
  });

  it("should not share nested values with the caller's object", () => {
    const defaults: ts.CompilerOptions = { paths: { a: ["x"] }, lib: ["es5"] };
    const container = new CompilerOptionsContainer(defaults);

    container.get().paths!.a.push("MUT");
    container.get().lib!.push("MUT");
    expect(defaults).to.deep.equal({ paths: { a: ["x"] }, lib: ["es5"] });

    defaults.lib!.push("CALLER");
    container.reset();
    expect(container.get().lib).to.deep.equal(["es5"]);
  });

  it("should keep the identity of non-plain values", () => {
    class ConfigFile {
      self = this;
    }
    const configFile = new ConfigFile();
    const date = new Date();
    const defaults = { configFile, nested: { date } } as unknown as ts.CompilerOptions;
    const container = new CompilerOptionsContainer(defaults);

    container.reset();

    const settings = container.get() as any;
    expect(settings.configFile).to.equal(configFile);
    expect(settings.nested.date).to.equal(date);
  });

  it("should keep the identity of a parsed config file", () => {
    const sourceFile = ts.readJsonConfigFile("/tsconfig.json", () => `{ "compilerOptions": { "lib": ["es5"] } }`);
    const options: ts.CompilerOptions = { configFile: sourceFile, lib: ["es5"] };
    const container = new CompilerOptionsContainer(options);

    container.reset();

    expect(container.get().configFile).to.equal(sourceFile);
    expect(container.get().lib).to.deep.equal(["es5"]);
    expect(container.get().lib).to.not.equal(options.lib);
  });

  it("should keep the identity of array subclasses", () => {
    class CustomArray extends Array<string> {}
    const lib = new CustomArray();
    const container = new CompilerOptionsContainer({ lib });

    container.reset();

    expect(container.get().lib).to.equal(lib);
  });

  it("should keep frozen values frozen", () => {
    const lib = Object.freeze(["es5"]) as string[];
    const container = new CompilerOptionsContainer({ lib });
    expect(Object.isFrozen(container.get().lib)).to.equal(true);

    container.reset();

    expect(Object.isFrozen(container.get().lib)).to.equal(true);
    expect(container.get().lib).to.equal(lib);
  });

  it("should not evaluate nested accessors", () => {
    const plugin = {
      get name(): string {
        throw new Error("lazy");
      },
    };
    const container = new CompilerOptionsContainer({ plugins: [plugin] });

    container.reset();

    const descriptor = Object.getOwnPropertyDescriptor(container.get().plugins![0], "name")!;
    expect(descriptor.get).to.equal(Object.getOwnPropertyDescriptor(plugin, "name")!.get);
  });

  it("should keep symbol and non-enumerable keys on nested values", () => {
    const symbol = Symbol("key");
    const plugin: any = { name: "plugin", [symbol]: ["x"] };
    Object.defineProperty(plugin, "hidden", { value: ["y"], enumerable: false });
    const container = new CompilerOptionsContainer({ plugins: [plugin] });

    container.reset();

    const result = container.get().plugins![0] as any;
    expect(result).to.not.equal(plugin);
    expect(result[symbol]).to.deep.equal(["x"]);
    expect(result[symbol]).to.not.equal(plugin[symbol]);
    const descriptor = Object.getOwnPropertyDescriptor(result, "hidden")!;
    expect(descriptor.enumerable).to.equal(false);
    expect(descriptor.value).to.deep.equal(["y"]);
    expect(descriptor.value).to.not.equal(plugin.hidden);
  });

  it("should keep sealed and non-extensible values as is", () => {
    const sealed = Object.seal({ name: "sealed" });
    const nonExtensible = Object.preventExtensions({ name: "nonExtensible" });
    const container = new CompilerOptionsContainer({ plugins: [sealed, nonExtensible] });

    container.reset();

    const plugins = container.get().plugins!;
    expect(plugins[0]).to.equal(sealed);
    expect(Object.isSealed(plugins[0])).to.equal(true);
    expect(plugins[1]).to.equal(nonExtensible);
    expect(Object.isExtensible(plugins[1])).to.equal(false);
  });

  it("should not expose live settings through a top-level back-reference", () => {
    const options: any = { charset: "a" };
    options.self = options;
    const container = new CompilerOptionsContainer(options);

    container.get().self.charset = "MUT";
    expect(container.getEncoding()).to.equal("a");

    container.reset();
    container.get().self.charset = "MUT";
    expect(container.getEncoding()).to.equal("a");
    expect(options.charset).to.equal("a");
  });

  it("should handle cycles and an own __proto__ key", () => {
    const paths = JSON.parse(`{ "__proto__": ["x"] }`);
    const cycle: any = { name: "cycle" };
    cycle.self = cycle;
    const container = new CompilerOptionsContainer({ paths, plugins: [cycle] });

    container.reset();

    const settings = container.get();
    expect(Object.getOwnPropertyDescriptor(settings.paths, "__proto__")!.value).to.deep.equal(["x"]);
    expect(Object.getPrototypeOf(settings.paths)).to.equal(Object.prototype);
    const plugin = settings.plugins![0] as any;
    expect(plugin).to.not.equal(cycle);
    expect(plugin.self).to.equal(plugin);
  });

  it("should return the same nested values from get until reset", () => {
    const container = new CompilerOptionsContainer({ lib: ["es5"] });
    expect(container.get()).to.not.equal(container.get());
    expect(container.get().lib).to.equal(container.get().lib);
  });

  it("should fire onModified once on reset", () => {
    const container = new CompilerOptionsContainer({ lib: ["es5"] });
    let count = 0;
    container.onModified(() => count++);
    container.reset();
    expect(count).to.equal(1);
  });
});
