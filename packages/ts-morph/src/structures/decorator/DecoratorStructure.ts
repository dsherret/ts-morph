import { WriterFunction } from "../../types";
import { KindedStructure, Structure } from "../Structure.generated";
import { StructureKind } from "../StructureKind";

export interface DecoratorStructure extends Structure, DecoratorSpecificStructure {
}

export interface DecoratorSpecificStructure extends KindedStructure<StructureKind.Decorator> {
  name: string;
  /**
   * Arguments for a decorator factory.
   * @remarks Provide an empty array to make the structure a decorator factory.
   */
  arguments?: (string | WriterFunction)[] | WriterFunction;
  typeArguments?: string[];
}
