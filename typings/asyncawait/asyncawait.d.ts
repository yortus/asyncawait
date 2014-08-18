// Type definitions for asyncawait
// Project: https://github.com/yortus/asyncawait
// Definitions by: Troy Gerwien <https://github.com/yortus>


///<reference path="../node/node.d.ts" />
///<reference path="../bluebird/bluebird.d.ts" />


//TODO: reorganise this by mods (so they *could* be split into separate files/projects)


declare module AsyncAwait {
    export function AsyncAPI(...args: any[]): any;
    export module AsyncAPI { }

    export function AwaitAPI(...args: any[]): any;
    export module AwaitAPI { }

    export interface ConfigAPI {
        options(): any;
        options(value: any): ConfigAPI;             // Will trigger reload of all async/await/fiber mods
        use(mods: Mod<any>[]): ConfigAPI;           // Will trigger reload of all async/await/fiber mods
        use(mod: Mod<AsyncProtocol>): ConfigAPI;    // Will trigger reload of all async/await/fiber mods
        use(mod: Mod<AwaitProtocol>): ConfigAPI;    // Will trigger reload of all async/await/fiber mods
        use(mod: Mod<FiberProtocol>): ConfigAPI;    // Will trigger reload of all async/await/fiber mods
        use(mod: Mod<SetupProtocol>): ConfigAPI;    // Will trigger reload of all async/await/fiber mods
    }

    export interface YieldAPI {
        (value?: any): any;
    }

    export interface Mod<TProtocol> {
        name: string; // 'async.aaa'
        base: string; // 'async[.IDENT]*', 'await[.IDENT]*', 'fiber', 'setup'
        override(baseProtocol: TProtocol, options: any): TProtocol;
        defaults?: any;
    }

    export interface AsyncProtocol {
        begin?(fi: Fiber, ...protocolArgs: any[]): any;
        suspend?(fi: Fiber, error?: Error, value?: any): any;
        resume?(fi: Fiber, error?: Error, value?: any): any;
        end?(fi: Fiber, error?: Error, value?: any): any;
    }

    export interface AwaitProtocol {
        singular?(fi: Fiber, arg: any): any;
        variadic?(fi: Fiber, args: any[]): any;
        elements?(values: any[], result: (err: Error, value: any, index: number) => void): number;
    }

    export interface FiberProtocol {
        acquire?(asyncProtocol: AsyncProtocol): Fiber;
        release?(asyncProtocol: AsyncProtocol, fi: Fiber): void;
        retarget?(fi: Fiber, bodyFunc: Function, bodyThis?: any, bodyArgs?: any[]): void
    }

    export interface SetupProtocol {
        startup?(): void;
        shutdown?(): void;
    }

    //----------
    export interface Fiber {
        reset: () => any;
        run: (param?: any) => any;
        throwInto: (ex: any) => any;
    }
    export function Fiber(fn: Function): Fiber;
    export module Fiber {
        export var current: Fiber;
        export function yield(value?: any): any
        export var poolSize: number;
        export var fibersCreated: number;
    }
    export interface Fiber {
        id: number;//TODO: doc: useful for debugging/assertions
        bodyFunc: Function;
        bodyThis: any;
        bodyArgs: any[];
        awaiting: AsyncAwait.Callback<any>[]; //TODO: finalise this...

        //TODO: ...
        suspend: (error?: Error, value?: any) => void;
        resume: (error?: Error, value?: any) => void;
        context: any;
    }
    //----------
}


//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//TODO: typings for built-in mods with default config...
declare module AsyncAwait {

    // Default async and await behaviour
    export interface AsyncAPI extends AsyncPromise { }
    export interface AwaitAPI extends AwaitPromise { }

    export interface AsyncAPI {
        promise: AsyncPromise;
    }
    export interface AsyncPromise {
        <TResult>(fn: () => TResult): () => Promise<TResult>;
        <T, TResult>(fn: (arg: T) => TResult): (arg: T) => Promise<TResult>;
        <T1, T2, TResult>(fn: (arg1: T1, arg2: T2) => TResult): (arg1: T1, arg2: T2) => Promise<TResult>;
        <T1, T2, T3, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3) => TResult): (arg1: T1, arg2: T2, arg3: T3) => Promise<TResult>;
        <T1, T2, T3, T4, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => TResult): (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => Promise<TResult>;
    }
    export interface AwaitAPI {
        promise: AwaitPromise;
    }
    //TODO: Review this after making extensible
    export interface AwaitPromise {
        <T>(expr: Promise.Thenable<T>): T;
    }
}
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

//TODO: was...
declare module AsyncAwaitOLD {



    //------------------------- Extensibility -------------------------
    export interface Config {
        useDefaults(): void;
    }

    //TODO: really type these defaults?
    export interface ConfigOptions {
        fibersHotfix169?: boolean;
        fiberPool?: boolean;
        maxSlots?: number;
        cpsKeyword?: string;
    }

}
    //------------------------- Common -------------------------
//TODO:...
declare module AsyncAwait {
    export interface Callback<TResult> {
        (err: Error, result: TResult): void;
    }

    export interface Thunk<TResult> {
        (callback?: Callback<TResult>): void;
    }
}



// ------------------------- Mod: callbacks -------------------------
declare module AsyncAwait.OLD {
    export module Async {
        export interface API {
            cps: CPSBuilder;
        }
        export interface CPSBuilder {
            <TResult>(fn: () => TResult): (callback?: Callback<TResult>) => void;
            <T, TResult>(fn: (arg: T) => TResult): (arg: T, callback?: Callback<TResult>) => void;
            <T1, T2, TResult>(fn: (arg1: T1, arg2: T2) => TResult): (arg1: T1, arg2: T2, callback?: Callback<TResult>) => void;
            <T1, T2, T3, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3) => TResult): (arg1: T1, arg2: T2, arg3: T3, callback?: Callback<TResult>) => void;
            <T1, T2, T3, T4, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => TResult): (arg1: T1, arg2: T2, arg3: T3, arg4: T4, callback?: Callback<TResult>) => void;
        }
    }
    export module Await {
        export interface API {
            cps: CPSBuilder;
        }
        export interface CPSBuilder {
            (expr: any): any;
            continuation: () => Callback<any>;
        }
    }
}


// ------------------------- Mod: thunks -------------------------
declare module AsyncAwait.OLD {
    export module Async {
        export interface API {
            thunk: ThunkBuilder;
        }
        export interface ThunkBuilder {
            <TResult>(fn: () => TResult): () => Thunk<TResult>;
            <T, TResult>(fn: (arg: T) => TResult): (arg: T) => Thunk<TResult>;
            <T1, T2, TResult>(fn: (arg1: T1, arg2: T2) => TResult): (arg1: T1, arg2: T2) => Thunk<TResult>;
            <T1, T2, T3, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3) => TResult): (arg1: T1, arg2: T2, arg3: T3) => Thunk<TResult>;
            <T1, T2, T3, T4, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => TResult): (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => Thunk<TResult>;
        }
    }
    export module Await {
        export interface API {
            thunk: ThunkBuilder;
        }
        export interface ThunkBuilder {
            <T>(expr: Thunk<T>): T;
        }
    }
}


// ------------------------- Mod: streams -------------------------
declare module AsyncAwait.OLD {
    export module Async {
        export interface API {
            stream: StreamBuilder;
        }
        export interface StreamBuilder {
            (fn: Function): (...args: any[]) => NodeJS.ReadableStream;
        }
    }
}


// ------------------------- Mod: express -------------------------
declare module AsyncAwait.OLD {
    export module Async {
        export interface API {
            express: CPSBuilder;
        }
    }
}


// ------------------------- TODO: iterable stuff... -------------------------
declare module AsyncAwait {
    export module Async {
        export interface API {
            iterable: IterableAPI;
        }

        export interface IterableAPI extends IterablePromiseBuilder {
            promise: IterablePromiseBuilder;
            cps: IterableCPSBuilder;
            thunk: IterableThunkBuilder;
        }

        export interface IterablePromiseBuilder {
            (fn: Function): (...args: any[]) => {
                next(): Promise<{ done: boolean; value?: any; }>;
                forEach(callback: (value) => void): Promise<void>;
            };
        }

        export interface IterableCPSBuilder {
            (fn: Function): (...args: any[]) => {
                next(callback?: Callback<any>): void;
                forEach(callback: (value) => void, doneCallback?: Callback<void>): void;
            };
        }

        export interface IterableThunkBuilder {
            (fn: Function): (...args: any[]) => {
                next(): Thunk<{ done: boolean; value?: any; }>;
                forEach(callback: (value) => void): Thunk<void>;
            };
        }
    }
}


// ------------------------- TODO:... -------------------------
declare module "asyncawait" {
    export import async = require("asyncawait/async");
    export import await = require("asyncawait/await");
    export import config = require("asyncawait/config");
    export import yield_ = require("asyncawait/yield");
}
declare module "asyncawait/async" { var api: AsyncAwait.AsyncAPI; export = api; }
declare module "asyncawait/await" { var api: AsyncAwait.AwaitAPI; export = api; }
declare module "asyncawait/config" { var api: AsyncAwait.ConfigAPI; export = api; }
declare module "asyncawait/yield" { var api: AsyncAwait.YieldAPI; export = api; }
