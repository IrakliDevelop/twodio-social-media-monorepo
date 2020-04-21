export * from './generated';
export * from './user';

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type ArrayOrValue<ValueType> = Array<ValueType | ArrayOrValue<ValueType>>;
export type ObjectOrValue<ValueType> = {
  [key: string]: ValueType | ObjectOrValue<ValueType>
};

