import { WriterFunction } from "../../types";

export interface DecoratorStructure {
    name: string;
    /**
     * Arguments for a decorator factory.
     * @remarks Provide an empty array to make the structure a decorator factory.
     */
    arguments?: (string | WriterFunction)[] | WriterFunction;
    typeArguments?: string[];
}
