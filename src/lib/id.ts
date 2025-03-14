const SEPARATOR = '.';

export const createId = (idGroup: string, id: string) =>
  `${idGroup}${SEPARATOR}${id}`;

export const getId = (customId: string) => {
  return customId.split(SEPARATOR);
};

export const id = { createId, getId };
