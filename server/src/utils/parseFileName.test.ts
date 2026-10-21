import { describe, expect, it } from 'vitest';
import { parseFileName, publisherKey } from './parseFileName.js';

describe('parseFileName', () => {
  it('splits only at the first spaced hyphen and strips the extension', () => {
    expect(parseFileName('Editora X - Jogo - Edição Deluxe.png')).toEqual({
      publisherName: 'Editora X', gameName: 'Jogo - Edição Deluxe',
    });
  });
  it('normalizes duplicate spaces without breaking hyphens in a name', () => {
    expect(parseFileName('  Marvel   -  Spider-Man  .jpg ')).toEqual({
      publisherName: 'Marvel', gameName: 'Spider-Man',
    });
  });
  it.each(['sem-separador.png', ' - Jogo.png', 'Editora -    .webp'])('rejects %s', (name) => {
    expect(parseFileName(name)).toBeNull();
  });
  it('normalizes publisher keys independent of casing and accents', () => {
    expect(publisherKey(' Galápagos ')).toBe(publisherKey('galapagos'));
  });
});
