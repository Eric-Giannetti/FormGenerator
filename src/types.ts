export interface Game {
  fileId: string;
  gameName: string;
  originalFileName: string;
  thumbnailUrl?: string;
}
export interface Publisher {
  id: string;
  name: string;
  games: Game[];
}
export interface UnidentifiedImage {
  fileId: string;
  originalFileName: string;
  thumbnailUrl?: string;
  publisherName?: string;
  gameName?: string;
}
export interface MonthGames {
  month: string;
  publishers: Publisher[];
  unidentified: UnidentifiedImage[];
}
export interface Month { id: string; name: string }
