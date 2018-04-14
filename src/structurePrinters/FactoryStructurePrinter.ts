import { StructurePrinterFactory } from "../factories";
import { StructurePrinter } from "./StructurePrinter";

export abstract class FactoryStructurePrinter<TStructure> extends StructurePrinter<TStructure> {
    constructor(protected readonly factory: StructurePrinterFactory) {
        super();
    }
}
