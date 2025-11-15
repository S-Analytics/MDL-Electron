// Minimal preload stub in case we need ipc in future
import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('mdl', {
  // placeholder for future APIs
});
