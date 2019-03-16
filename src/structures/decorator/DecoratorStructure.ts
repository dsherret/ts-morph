import { WriterFunction } from "../../types";
import { Structure } from "../Structure";

export interface DecoratorStructure extends Structure, DecoratorSpecificStructure {
}

export interface DecoratorSpecificStructure {
    name: string;
    /**
     * Arguments for a decorator factory.
     * @remarks Provide an empty array to make the structure a decorator factory.
     */
    arguments?: (string | WriterFunction)[] | WriterFunction;
    typeArguments?: string[];
}
