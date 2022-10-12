export interface Config {
  libraryPath: string;
}

declare global {
  interface Window {
    getConfig(): Config;
    getMedias(): string[];
    importMedia(file: string): void;
    openMedia(key: string): void;
  }
}
