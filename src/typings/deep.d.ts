declare module Deep {
    export function isPlainObject(obj: any): boolean;
    export function clone(obj: any): any;
    export function equals(a: any, b: any): boolean;
    export function extend(...args: any[]): any;
    export function select(root: any, filter: (obj) => boolean): { value: any; path: string[] }[];
    export function set(root: any, path: string[], value: any): void;
    export function transform(obj: any, filter: (obj) => boolean, transform: (obj) => any): any;
}

declare module "deep" {
    export = Deep;
}
