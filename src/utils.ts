export const addId = (key: string, id: string | undefined) =>
  id ? `${id}.${key}` : key
