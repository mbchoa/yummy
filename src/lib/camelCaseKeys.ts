import camelCase from "lodash-es/camelCase";
import isPlainObject from "lodash-es/isObject";

export const camelCaseKeys = <
  T extends Record<string, unknown> | Record<string, unknown>[]
>(
  obj: T
): SnakeToCamelCaseNested<T> => {
  if (Array.isArray(obj)) {
    return <SnakeToCamelCaseNested<T>>obj.map((v) => camelCaseKeys(v));
  } else if (isPlainObject(obj)) {
    return <SnakeToCamelCaseNested<T>>Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [camelCase(key)]: camelCaseKeys(<T>obj[key]),
      }),
      {}
    );
  }
  return obj;
};
