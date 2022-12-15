const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld(
  "getConfig",
  async () => await ipcRenderer.invoke("getConfig")
);
contextBridge.exposeInMainWorld(
  "getMedias",
  async (...paths) => await ipcRenderer.invoke("getMedias", ...paths)
);
contextBridge.exposeInMainWorld("importMedia", (file) =>
  ipcRenderer.invoke("importMedia", file)
);
contextBridge.exposeInMainWorld("openMedia", (key) =>
  ipcRenderer.invoke("openMedia", key)
);
