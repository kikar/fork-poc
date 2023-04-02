export interface ClassType<T> extends Function {
  new (...args: unknown[]): T;
}
