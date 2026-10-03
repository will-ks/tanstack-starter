/**
 * Takes an unknown variable argument.
 * If the argument is null or undefined, throws a runtime error.
 * Otherwise, returns the argument asserted as NonNullable.
 * @throws {Error} If the first argument is null or undefined.
 */
export function getAsserted<T extends unknown>(
  assertedValue: T,
  options: {
    name?: string;
    errorConstructor?: ErrorConstructor;
  } = {},
) {
  const { errorConstructor = Error, name = "Asserted value" } = options;
  if (assertedValue === null || assertedValue === undefined) {
    throw new errorConstructor(`${name} is null or undefined`);
  }

  return assertedValue as NonNullable<T>;
}
