import { drive_v3 } from 'googleapis';
import { MonthGames, Publisher, UnidentifiedImage } from '../types.js';
import { parseFileName, publisherKey } from '../utils/parseFileName.js';

const IMAGE_MIMES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

export class DriveService {
  constructor(private readonly drive: drive_v3.Drive) {}

  async listMonths(rootFolderId: string) {
    return this.listAll(`'${rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      'id,name').then((files) => files.map((file) => ({ id: file.id!, name: file.name! })).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')));
  }

  async getMonthGames(folderId: string): Promise<MonthGames> {
    const [folder, files] = await Promise.all([
      this.drive.files.get({ fileId: folderId, fields: 'id,name,mimeType' }),
      this.listAll(`'${folderId}' in parents and trashed = false`, 'id,name,mimeType,thumbnailLink'),
    ]);
    if (folder.data.mimeType !== 'application/vnd.google-apps.folder') throw new Error('O item selecionado não é uma pasta.');

    const groups = new Map<string, Publisher>();
    const nameVariants = new Map<string, Map<string, number>>();
    const unidentified: UnidentifiedImage[] = [];
    for (const file of files) {
      if (!file.id || !file.name || !file.mimeType || !IMAGE_MIMES.has(file.mimeType)) continue;
      const image = { fileId: file.id, originalFileName: file.name, thumbnailUrl: file.thumbnailLink ?? undefined };
      const parsed = parseFileName(file.name);
      if (!parsed) { unidentified.push(image); continue; }
      const key = publisherKey(parsed.publisherName);
      const group = groups.get(key) ?? { id: key, name: parsed.publisherName, games: [] };
      group.games.push({ ...image, gameName: parsed.gameName });
      groups.set(key, group);
      const variants = nameVariants.get(key) ?? new Map<string, number>();
      variants.set(parsed.publisherName, (variants.get(parsed.publisherName) ?? 0) + 1);
      nameVariants.set(key, variants);
    }
    for (const [key, group] of groups) {
      const variants = nameVariants.get(key)!;
      group.name = [...variants.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR'))[0][0];
    }
    return {
      month: folder.data.name ?? 'Mês',
      publishers: [...groups.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
      unidentified,
    };
  }

  async getImage(fileId: string) {
    return this.drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
  }

  private async listAll(query: string, fields: string) {
    const files: drive_v3.Schema$File[] = [];
    let pageToken: string | undefined;
    do {
      const response = await this.drive.files.list({ q: query, fields: `nextPageToken,files(${fields})`, pageToken, pageSize: 1000 });
      files.push(...(response.data.files ?? []));
      pageToken = response.data.nextPageToken ?? undefined;
    } while (pageToken);
    return files;
  }
}
