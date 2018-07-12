import { Comparer } from "./Comparer";

export class PropertyComparer<TValue, TProperty> implements Comparer<TValue> {
    constructor(private readonly getProperty: (value: TValue) => TProperty, private readonly comparer: Comparer<TProperty>) {
    }

    compareTo(a: TValue, b: TValue) {
        return this.comparer.compareTo(this.getProperty(a), this.getProperty(b));
    }
}
