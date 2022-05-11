export const max = <T>(xs: T[], compare: (a: T, b: T) => number): T => {
  return xs.reduce((prevValue: T, currentValue: T): T => {
    return compare(prevValue, currentValue) > 0 ? prevValue : currentValue;
  });
};

export const mod = (a: number, b: number): number => {
  return (a / b) * b + (a % b);
};
