import { errors } from "@ts-morph/common";

/** Occurs when there is a problem doing a manipulation. */
export class ManipulationError extends errors.InvalidOperationError {
    constructor(
        public readonly filePath: string,
        public readonly oldText: string,
        public readonly newText: string,
        errorMessage: string
    ) {
        super(errorMessage);
    }
}
