export interface Disposable {
    /**
     * @internal
     */
    dispose(): void;
}

export function using<T extends Disposable>(resource: T, func: (resource: T) => void) {
    try {
        func(resource);
    } finally {
        resource.dispose();
    }
}
