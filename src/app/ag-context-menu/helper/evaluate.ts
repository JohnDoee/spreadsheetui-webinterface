export const evaluateIfFunction = <T>(
  value: boolean | ((value?: T) => boolean),
  item?: T
): boolean => {
  if (value instanceof Function) {
    return value(item);
  }
  return value;
};
