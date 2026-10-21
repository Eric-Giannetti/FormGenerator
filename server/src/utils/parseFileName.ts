export interface ParsedFileName {
  publisherName: string;
  gameName: string;
}

const normalizeSpaces = (value: string) => value.trim().replace(/\s+/g, ' ');

export function parseFileName(fileName: string): ParsedFileName | null {
  const extensionIndex = fileName.lastIndexOf('.');
  const baseName = extensionIndex > 0 ? fileName.slice(0, extensionIndex) : fileName;
  const separatorIndex = baseName.indexOf(' - ');
  if (separatorIndex === -1) return null;

  const publisherName = normalizeSpaces(baseName.slice(0, separatorIndex));
  const gameName = normalizeSpaces(baseName.slice(separatorIndex + 3));
  return publisherName && gameName ? { publisherName, gameName } : null;
}

export function publisherKey(name: string): string {
  return normalizeSpaces(name).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
}
