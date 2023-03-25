// #region preamble

import path from "path";
import url from "url";
import fs from "fs/promises";

import { Project } from "../../dist/ts-morph.js";
import type {
  InterfaceDeclaration,
  InterfaceDeclarationStructure,
  PropertySignatureStructure,
} from "../../lib/ts-morph";

import CodeBlockWriter from "code-block-writer";

// #endregion preamble

// #region utilities

// "packages/ts-morph" location
const projectDir = path.normalize(path.join(
  url.fileURLToPath(import.meta.url), "../../.."
));

// The final output location.
const docsReference = path.normalize(path.join(
  projectDir, "../../docs/references/structures.md"
));

/**
 * Do we care about the kind property of these structures?
 */
type PropertyWithoutKind = Omit<PropertySignatureStructure, "kind">;

/**
 * When you have keys and promised values, this provides a resolve() method to resolve the values.
 */
class AwaitedMap<K, V> extends Map<K, Promise<V>>
{
  /** Resolve the values of this map in a new Map. */
  async resolve() : Promise<Map<K, Awaited<V>>>
  {
    const promisedEntries = Array.from(this.entries());
    const names = promisedEntries.map(e => e[0]),
          promises = promisedEntries.map(e => e[1]);

    const values = await Promise.all(promises);

    const entries: [K, Awaited<V>][] = values.map((value, index) => [names[index], value]);
    return new Map(entries);
  }
}

type PromiseResolver = (value: undefined) => void;

/**
 * A helper class for when one key has dependencies on other keys.
 *
 * @remarks
 * I use this to handle the `extends` property of the interfaces.
 */
class DependencyTracker
{
  readonly #resolverMap = new Map<string, PromiseResolver>;
  readonly #promiseMap = new AwaitedMap<string, undefined>;

  /**
   * @param names - the set of known names to depend on.
   */
  constructor(names: ReadonlyArray<string>)
  {
    names.forEach(name => {
      const promise = new Promise<undefined>(resolve => {
        this.#resolverMap.set(name, resolve);
      });
      this.#promiseMap.set(name, promise);
    });
  }

  /**
   * 
   * @param name - the target name to resolve
   * @param dependentNames - names the target depends on.
   * @param callback - the true operation for the target.
   */
  async resolve<T>(
    name: string,
    dependentNames: ReadonlyArray<string>,
    callback: () => Promise<T>,
  ) : Promise<T>
  {
    await Promise.all(dependentNames.map(
      extendName => this.#promiseMap.get(extendName) as Promise<unknown>
    ));

    const result = await callback();

    (this.#resolverMap.get(name) as PromiseResolver)(undefined);
    return result;
  }
}

/**
 * Extending each PropertySignatureStructure with the interface it came from.
 * @param name - the interface name.
 * @param property - the structure.
 */
function defineFromInterface(
  name: string,
  property: PropertyWithoutKind
) : void
{
  Reflect.defineProperty(
    property, "fromInterface", {
      value: name,
      writable: false,
      configurable: false,
      enumerable: true,
    }
  );
}

function PropertySorter(
  a: PropertyWithoutKind,
  b: PropertyWithoutKind,
) : -1 | 0 | 1
{
  if (a.name < b.name)
    return -1;
  if (a.name > b.name)
    return +1;
  return 0;
}

function EntriesSorter<T>(
  a: [string, T],
  b: [string, T]
) : -1 | 0 | 1
{
  if (a[0] < b[0])
    return -1;
  if (a[0] > b[0])
    return +1;
  return 0;
}

type Entries<T> = ReadonlyArray<[string, T]>;
/** Get structures for each structure interface. */
function getStructureInterfaces() : Entries<InterfaceDeclarationStructure>
{
  const project = new Project({
    tsConfigFilePath: path.join(projectDir, "tsconfig.declarations.json"),
    skipAddingFilesFromTsConfig: true,
  });
  project.addSourceFileAtPath("lib/ts-morph.d.ts");

  const typeFile = project.getSourceFileOrThrow("lib/ts-morph.d.ts");
  const structureInterfaces = (
    typeFile.getInterfaces() as InterfaceDeclaration[]
  ).filter(typeInterface => typeInterface.getName().endsWith("Structure"));

  return structureInterfaces.map(
    si => [si.getName(), si.getStructure()]
  );
}

type PropertyArray = ReadonlyArray<PropertyWithoutKind>;
/**
 * Build a map of structure interfaces to all their inherited properties.
 *
 * @remarks
 *
 * You may ask, "why is this async when all the objects are here?"
 * The reason is looking up inherited properties of one interface requires
 * waiting for the interface's `extends` interfaces to resolve.
 *
 * Sure, this could be done synchronously, if we sorted the entries where
 * dependencies come first.  This is so fast, though, that it doesn't matter.
 */
async function getStructuresPropertiesMap() : Promise<Map<string, PropertyArray>>
{
  const selfStructures = getStructureInterfaces();
  const allStructureNames = selfStructures.map(([name]) => name);
  allStructureNames.sort();

  const selfExtends = new Map(selfStructures.map(
    ([name, structure]) => {
      return [name, (structure.extends as string[]) ?? []]
    }
  ));

  const selfPropsMap = new Map<
    string, ReadonlyArray<PropertyWithoutKind>
  >
  (
    selfStructures.map(
      ([name, { properties = [] }]) => {
        properties.forEach(p => defineFromInterface(name, p));
        return [name, properties];
      }
    )
  );

  const allPropsPromisesMap = new AwaitedMap<string, PropertyArray>;
  const extendsDependencies = new DependencyTracker(allStructureNames);

  /**
   * Get all the properties, inherited or not, from an interface structure.
   * @param name - the name of the interface.
   * @returns the list of properties, sorted by name.
   */
  async function getAllPropertiesOfInterface(name: string) : Promise<PropertyArray>
  {
    const extendsArray = (selfExtends.get(name) as string[]).map(
      // Remove the type parameters.
      extendName => extendName.replace(/<.*/, "")
    );

    return await extendsDependencies.resolve(name, extendsArray, async () => {
      const selfProperties = selfPropsMap.get(name);
      if (!selfProperties)
        throw new Error("no properties for name " + name);

      // These represent the properties we inherit from each `extends` interface.
      const promises = extendsArray.map(
        extendName => allPropsPromisesMap.get(extendName) as Promise<PropertyArray>
      );
      promises.push(Promise.resolve(selfProperties));

      const properties_2D = await Promise.all(promises);
    
      const properties = properties_2D.flat();
      if (!properties.every(Boolean)) {
        throw new Error("missing property: " + name);
      }
      properties.sort(PropertySorter);
      return properties;
    });
  }

  allStructureNames.forEach(
    name => allPropsPromisesMap.set(name, getAllPropertiesOfInterface(name))
  );

  // Build our final list of map entries via the await!
  const allPropsMapEntries = Array.from(
    (await allPropsPromisesMap.resolve())
  .entries());
  allPropsMapEntries.sort(EntriesSorter);

  return new Map(allPropsMapEntries);
}
// #endregion utilities

// #region Markdown generation

/**
 * Build Markdown code for a structure.
 * @param name - the name of the interface.
 * @param properties - the set of properties for the structure.
 * @returns the Markdown rendering.
 */
function buildStructureMarkdown(
  name: string,
  properties: PropertyArray
) : string
{
  return `
### ${name}

${properties.map(property => propertyAsMarkdown(name, property)).join("\n")}
  `.trim() + "\n";
}

const StructureRE = /\b\w*Structure\b/g;

/**
 * Generate a single Markdown list line for an interface's property.
 * @param interfaceName - the name of the interface.
 * @param property - the property structure.
 * @returns the Markdown line.
 */
function propertyAsMarkdown(
  interfaceName: string,
  property: PropertyWithoutKind
) : string
{
  const fromInterface = Reflect.get(property, "fromInterface") as string;

  let docs = "";
  if (property.docs)
  {
    docs = property.docs.map(doc => {
      if (typeof doc === "string")
        return doc;
      if (typeof doc.description === "string")
        return doc.description;
      if (typeof doc.description !== "undefined") {
        const writer = new CodeBlockWriter;
        doc.description(writer);
        return writer.toString();
      }

      return "";
    }).join(" ").trim();
  }

  let type = "";
  if (typeof property.type === "string") {
    type = ": " + property.type;
  }
  else if (typeof property.type !== "undefined") {
    const writer = new CodeBlockWriter;
    property.type(writer);
    type = ": " + writer.toString();
  }
  // # for anchors within the same structures.md document
  type = type.replace(StructureRE, match => `[${match}](#${match.toLowerCase()})`);

  const linkText = (interfaceName !== fromInterface) ?
    `  From [${fromInterface}](#${fromInterface.toLowerCase()}).` :
    "";

  return [
    "- ",
    property.isReadonly ? "readonly " : "",
    property.name,
    property.hasQuestionToken ? "?" : "",
    type + "; ",
    docs ?? "",
    linkText,
  ].join("").trim();
}
// #endregion Markdown generation

// main code
{
  const allPropsEntries = Array.from((await getStructuresPropertiesMap()).entries());
  await fs.mkdir(path.dirname(docsReference), { recursive: true });
  const contents = "# Reference\n\n## Structures\n\n" + allPropsEntries.map(
    ([name, properties]) => buildStructureMarkdown(name, properties)
  ).join("\n");

  await fs.writeFile(docsReference, contents, { encoding: "utf-8" });
};
