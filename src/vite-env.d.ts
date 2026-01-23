/// <reference types="vite/client" />

export interface Instance {
    id: string;
    name: string;
    url: string;
    token?: string; // Only present in Main or decrypted in Renderer
    encryptedToken?: string;
}

export interface IpcRendererApi {
    on: (channel: string, listener: (event: any, ...args: any[]) => void) => void;
    off: (channel: string, ...omit: any[]) => void;
    send: (channel: string, ...omit: any[]) => void;
    invoke: (channel: string, ...omit: any[]) => Promise<any>;

    getInstances: () => Promise<Instance[]>;
    saveInstance: (instance: Partial<Instance>) => Promise<boolean>;
    deleteInstance: (id: string) => Promise<boolean>;
    pullInstance: (id: string) => Promise<{ success: boolean; output: string }>;
    pushInstance: (sourceId: string, destId: string) => Promise<{ success: boolean; output: string }>;
    openFolder: (id: string) => Promise<boolean>;
}

declare global {
    interface Window {
        ipcRenderer: IpcRendererApi
    }
}
