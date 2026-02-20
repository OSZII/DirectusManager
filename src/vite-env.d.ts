/// <reference types="vite/client" />

export interface Instance {
    id: string;
    name: string;
    url: string;
    token?: string; // Only present in Main or decrypted in Renderer
    encryptedToken?: string;
    // Git fields
    gitRemoteUrl?: string;
    encryptedGitToken?: string;
    gitToken?: string; // Fallback if encryption unavailable
    // Custom schema path
    customSchemaPath?: string; // Custom folder path for schema data
    // Custom types path
    customTypesPath?: string; // Custom folder path for generated TS types
}

export interface GitStatus {
    initialized: boolean;
    hasRemote: boolean;
    remoteUrl?: string;
    currentBranch?: string;
    changesCount: number;
}

export interface SchemaField {
    field: string;
    type: string;
    isPrimaryKey: boolean;
    isForeignKey: boolean;
    foreignKeyTable?: string;
    isNullable: boolean;
    special?: string[];
}

export interface SchemaCollection {
    collection: string;
    fields: SchemaField[];
    isJunction: boolean;
}

export interface SchemaRelation {
    collection: string;
    field: string;
    relatedCollection: string;
    relatedField?: string;
    type: 'M2O' | 'O2M' | 'M2M';
    junctionField?: string;
}

export interface SchemaData {
    collections: SchemaCollection[];
    relations: SchemaRelation[];
}

// API Explorer types
export interface OpenApiParameter {
    name: string;
    in: 'query' | 'path' | 'header' | 'cookie';
    description?: string;
    required?: boolean;
    schema?: {
        type?: string;
        default?: any;
        enum?: any[];
        format?: string;
    };
}

export interface ParsedEndpoint {
    path: string;
    method: 'get' | 'post' | 'put' | 'patch' | 'delete';
    summary: string;
    description?: string;
    tags: string[];
    operationId?: string;
    parameters: OpenApiParameter[];
    requestBody?: any;
}

export interface ApiResponse {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: any;
    elapsed: number;
    url: string;
}

export interface IpcRendererApi {
    on: (channel: string, listener: (event: any, ...args: any[]) => void) => void;
    off: (channel: string, ...omit: any[]) => void;
    send: (channel: string, ...omit: any[]) => void;
    invoke: (channel: string, ...omit: any[]) => Promise<any>;

    // Instance Management
    getInstances: () => Promise<Instance[]>;
    saveInstance: (instance: Partial<Instance>) => Promise<boolean>;
    deleteInstance: (id: string) => Promise<boolean>;
    pullInstance: (id: string) => Promise<{ success: boolean; output: string }>;
    pushInstance: (sourceId: string, destId: string) => Promise<{ success: boolean; output: string }>;
    openFolder: (id: string) => Promise<boolean>;
    openExternal: (url: string) => Promise<boolean>;

    // Git Operations
    gitStatus: (id: string) => Promise<GitStatus>;
    gitInit: (id: string) => Promise<{ success: boolean }>;
    gitSetRemote: (id: string, remoteUrl: string, token: string) => Promise<{ success: boolean }>;
    gitPull: (id: string) => Promise<{ success: boolean; output: string }>;
    gitPush: (id: string, commitMessage?: string) => Promise<{ success: boolean; output: string }>;

    // Folder Selection
    selectSchemaFolder: () => Promise<string | null>;
    selectTypesFolder: () => Promise<string | null>;

    // Schema
    getSchema: (id: string) => Promise<SchemaData>;

    // TypeScript Types
    pullTypes: (id: string) => Promise<{ success: boolean; output: string }>;

    // API Explorer
    fetchOpenApiSpec: (id: string) => Promise<any>;
    apiRequest: (id: string, method: string, path: string, queryParams?: Record<string, string>, body?: any) => Promise<ApiResponse>;
}

declare global {
    const __APP_VERSION__: string;
    interface Window {
        ipcRenderer: IpcRendererApi
    }
}

