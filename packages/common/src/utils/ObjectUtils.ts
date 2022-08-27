export class ObjectUtils {
  private constructor() {
  }

  static clone<T>(obj: T): T {
    // todo: make this an actual deep clone... good enough for now...
    if (obj == null)
      return undefined as any as T;
    if (obj instanceof Array)
      return cloneArray(obj) as any as T;
    return Object.assign({}, obj);

    function cloneArray(a: any[]) {
      return a.map(item => ObjectUtils.clone(item));
    }
  }
}
