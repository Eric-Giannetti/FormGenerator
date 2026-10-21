export interface DriveImage {
  fileId: string;
  originalFileName: string;
  thumbnailUrl?: string;
}

export interface Game extends DriveImage {
  gameName: string;
}

export interface Publisher {
  id: string;
  name: string;
  games: Game[];
}

export interface UnidentifiedImage extends DriveImage {
  publisherName?: string;
  gameName?: string;
}

export interface MonthGames {
  month: string;
  publishers: Publisher[];
  unidentified: UnidentifiedImage[];
}
