export const toggleIn = <T>(list: T[], value: T) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
