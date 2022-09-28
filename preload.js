const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld(
  "getConfig",
  async () => await ipcRenderer.invoke("getConfig")
);
contextBridge.exposeInMainWorld(
  "getMedias",
  async () => await ipcRenderer.invoke("getMedias")
);
