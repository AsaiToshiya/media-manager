export interface Config {
  libraryPath: string;
  thumbnailSize?: number;
}

interface Media {
  isFolder: boolean;
  name: string;
}

declare global {
  interface Window {
    getConfig(): Config;
    getMedias(...paths: string[]): Media[];
    importMedia(file: string): void;
    openMedia(key: string): void;
  }
}
