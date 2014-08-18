// Type definitions for asyncawait
// Project: https://github.com/yortus/asyncawait
// Definitions by: Troy Gerwien <https://github.com/yortus>


///<reference path="../node/node.d.ts" />
///<reference path="../bluebird/bluebird.d.ts" />


//TODO: reorganise this by mods (so they *could* be split into separate files/projects)

declare module AsyncAwait2 {
    export interface ConfigAPI {
        options(): any;
        options(value: any): ConfigAPI;             // Will trigger reload of all async/await/fiber mods
        use(mods: Mod<any>[]): ConfigAPI;           // Will trigger reload of all async/await/fiber mods
        use(mod: Mod<AsyncProtocol>): ConfigAPI;    // Will trigger reload of all async/await/fiber mods
        use(mod: Mod<AwaitProtocol>): ConfigAPI;    // Will trigger reload of all async/await/fiber mods
        use(mod: Mod<FiberProtocol>): ConfigAPI;    // Will trigger reload of all async/await/fiber mods
        use(mod: Mod<SetupProtocol>): ConfigAPI;    // Will trigger reload of all async/await/fiber mods
    }

    export function AsyncAPI(...args: any[]): any;

    export function AwaitAPI(...args: any[]): any;

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
declare module AsyncAwait2 {

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


declare module AsyncAwait {

    //------------------------- Async -------------------------
    export module Async {

        export interface API extends PromiseBuilder {
            use(mod: AsyncMod, expose?: boolean): void;
            mods: { [name: string]: AsyncMod; }
        }

        export interface TypedBuilder<TBuilder extends Builder> extends Builder {
            mod<TBuilder2 extends Builder>(mod: TypedAsyncMod<TBuilder2>): TBuilder2;
            mod(mod: AsyncMod): TBuilder;
            mod(options: {}): TBuilder;
        }

        export interface Builder {
            (fn: Function): Function;
            name: string;
            mod<TBuilder extends Builder>(mod: TypedAsyncMod<TBuilder>): TBuilder;
            mod(mod: AsyncMod): Builder;
            mod(options: {}): Builder;
        }

        export interface TypedAsyncMod<TBuilder extends Builder> extends AsyncMod {
            type: TBuilder;
        }

        export interface AsyncMod extends Mod<AsyncProtocol, any> { }

        //TODO: doc these methods
        export interface AsyncProtocol {
            begin: (fi: Fiber, ...protocolArgs) => any;
            suspend: (fi: Fiber, error?: Error, value?: any) => any;
            resume: (fi: Fiber, error?: Error, value?: any) => any;
            end: (fi: Fiber, error?: Error, value?: any) => any;
        }
    }


    //------------------------- Await -------------------------
    export module Await {

        export interface API extends Builder {
            //TODO: was...
            //in: AwaitFunction;
            //top(n: number): AwaitFunction;
        }

        export interface TypedBuilder<TBuilder extends Builder> extends Builder {
            mod<TBuilder2 extends Builder>(mod: TypedAwaitMod<TBuilder2>): TBuilder2;
            mod(mod: AwaitMod): TBuilder;
            mod(options: {}): TBuilder;
        }

        export interface Builder {
            (...args: any[]): any;
            name: string;//TODO: support this...
            handlers: AwaitProtocol;//TODO: deprecating? or not?
            mod<TBuilder extends Builder>(mod: TypedAwaitMod<TBuilder>): TBuilder;
            mod(mod: AwaitMod): Builder;
            mod(options: {}): Builder;
        }

        export interface TypedAwaitMod<TBuilder extends Builder> extends AwaitMod {
            type: TBuilder;
        }

        export interface AwaitMod extends Mod<AwaitProtocol, any> { }

        // TODO: new...
        // TODO: better doc how handler indicates it *won't* handle an expr. Could that indicator also be async (ie not known by sync return time)?
        // TODO: doc: handlers *must* resume coro asynchronously
        // TODO: doc: arg/allArgs fast/slow paths
        export interface AwaitProtocol {
            singular: (fi: Fiber, arg: any) => any;
            variadic: (fi: Fiber, args: any[]) => any;
            elements?: (values: any[], result: (err: Error, value: any, index: number) => void) => number;
        }
    }


    //------------------------- Yield -------------------------
    export interface Yield {
        (expr?: any): void;
    }


    //------------------------- Extensibility -------------------------
    export interface Config {
        options(): ConfigOptions;
        options(value: ConfigOptions): void;
        use(mod: JointMod): void;
        useDefaults(): void;
    }

    //TODO: really type these defaults?
    export interface ConfigOptions {
        fibersHotfix169?: boolean;
        fiberPool?: boolean;
        maxSlots?: number;
        cpsKeyword?: string;
    }

    export interface JointMod extends Mod<JointProtocol, any> { }

    export interface JointProtocol {
        acquireFiber: (asyncProtocol: Async.AsyncProtocol) => Fiber;
        releaseFiber: (asyncProtocol: Async.AsyncProtocol, fi: Fiber) => void;
        setFiberTarget: (fi: Fiber, bodyFunc: Function, bodyThis?: any, bodyArgs?: any[]) => void
        startup: () => void;
        shutdown: () => void;
    }

    export interface JointProtocolOverrides {
        acquireFiber?: (asyncProtocol: Async.AsyncProtocol) => Fiber;
        releaseFiber?: (asyncProtocol: Async.AsyncProtocol, fi: Fiber) => void;
        setFiberTarget?: (fi: Fiber, bodyFunc: Function, bodyThis?: any, bodyArgs?: any[]) => void
        startup?: () => void;
        shutdown?: () => void;
    }


    //------------------------- Common -------------------------
    export interface Callback<TResult> {
        (err: Error, result: TResult): void;
    }

    export interface Thunk<TResult> {
        (callback?: Callback<TResult>): void;
    }

    //TODO: finalise and rename...
    export interface Mod<TMembers, TOptions> {
        override: (baseMembers: TMembers, options: TOptions) => any;
        defaults?: TOptions;
        name?: string;
    }
}


// ------------------------- Mod: promises -------------------------
declare module AsyncAwait {
    export module Async {
        export interface API {
            promise: PromiseBuilder;
        }
        export interface PromiseBuilder extends TypedBuilder<PromiseBuilder> {
            <TResult>(fn: () => TResult): () => Promise<TResult>;
            <T, TResult>(fn: (arg: T) => TResult): (arg: T) => Promise<TResult>;
            <T1, T2, TResult>(fn: (arg1: T1, arg2: T2) => TResult): (arg1: T1, arg2: T2) => Promise<TResult>;
            <T1, T2, T3, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3) => TResult): (arg1: T1, arg2: T2, arg3: T3) => Promise<TResult>;
            <T1, T2, T3, T4, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => TResult): (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => Promise<TResult>;
        }
    }
    export module Await {
        export interface API {
            promise: PromiseBuilder;
        }
        //TODO: Review this after making extensible
        export interface PromiseBuilder extends Builder {
            <T>(expr: Promise.Thenable<T>): T;
        }
    }
}


// ------------------------- Mod: callbacks -------------------------
declare module AsyncAwait {
    export module Async {
        export interface API {
            cps: CPSBuilder;
        }
        export interface CPSBuilder extends TypedBuilder<CPSBuilder> {
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
        export interface CPSBuilder extends Builder {
            (expr: any): any;
            continuation: () => Callback<any>;
        }
    }
}


// ------------------------- Mod: thunks -------------------------
declare module AsyncAwait {
    export module Async {
        export interface API {
            thunk: ThunkBuilder;
        }
        export interface ThunkBuilder extends TypedBuilder<ThunkBuilder> {
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
        export interface ThunkBuilder extends Builder {
            <T>(expr: Thunk<T>): T;
        }
    }
}


// ------------------------- Mod: streams -------------------------
declare module AsyncAwait {
    export module Async {
        export interface API {
            stream: StreamBuilder;
        }
        export interface StreamBuilder extends TypedBuilder<StreamBuilder> {
            (fn: Function): (...args: any[]) => NodeJS.ReadableStream;
        }
    }
}


// ------------------------- Mod: express -------------------------
declare module AsyncAwait {
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

        export interface IterablePromiseBuilder extends TypedBuilder<IterablePromiseBuilder> {
            (fn: Function): (...args: any[]) => {
                next(): Promise<{ done: boolean; value?: any; }>;
                forEach(callback: (value) => void): Promise<void>;
            };
        }

        export interface IterableCPSBuilder extends TypedBuilder<IterableCPSBuilder> {
            (fn: Function): (...args: any[]) => {
                next(callback?: Callback<any>): void;
                forEach(callback: (value) => void, doneCallback?: Callback<void>): void;
            };
        }

        export interface IterableThunkBuilder extends TypedBuilder<IterableThunkBuilder> {
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
declare module "asyncawait/async" { var api: AsyncAwait.Async.API; export = api; }
declare module "asyncawait/await" { var api: AsyncAwait.Await.API; export = api; }
declare module "asyncawait/config" { var api: AsyncAwait.Config; export = api; }
declare module "asyncawait/yield" { var api: AsyncAwait.Yield; export = api; }
declare module "asyncawait/async/promise" { var api: AsyncAwait.Async.PromiseBuilder; export = api; }
declare module "asyncawait/async/cps" { var api: AsyncAwait.Async.CPSBuilder; export = api; }
//TODO: restore these...
//declare module "asyncawait/async/thunk" { var api: AsyncAwait.AsyncThunk; export = api; }
//declare module "asyncawait/async/stream" { var api: AsyncAwait.AsyncStream; export = api; }
//declare module "asyncawait/async/express" { var api: AsyncAwait.AsyncCPS; export = api; }
//declare module "asyncawait/async/iterable" { var api: AsyncAwait.AsyncIterable; export = api; }
//declare module "asyncawait/async/iterable/promise" { var api: AsyncAwait.AsyncIterablePromise; export = api; }
//declare module "asyncawait/async/iterable/cps" { var api: AsyncAwait.AsyncIterableCPS; export = api; }
//declare module "asyncawait/async/iterable/thunk" { var api: AsyncAwait.AsyncIterableThunk; export = api; }






//TODO: was...
//declare module "asyncawait" {
//    export import async = require("asyncawait/async");
//    export import await = require("asyncawait/await");
//}

//declare module "asyncawait/async" {
//    /**
//     * Creates a suspendable function. Suspendable functions may use the await() function
//     * internally to suspend execution at arbitrary points, pending the results of
//     * internal asynchronous operations.
//     * @param {Function} fn - Contains the body of the suspendable function. Calls to await()
//     *                        may appear inside this function.
//     * @returns {Function} A function of the form `(...args) --> Promise`. Any arguments
//     *                     passed to this function are passed through to fn. The returned
//     *                     promise is resolved when fn returns, or rejected if fn throws.
//     */
//    var M: AsyncAwait.Async;
//    export = M;
//}

//declare module "asyncawait/await" {
//    /**
//     * Suspends a suspendable function until the given awaitable expression produces
//     * a result. If the given expression produces an error, then an exception is raised
//     * in the suspendable function.
//     * @param {any} expr - The awaitable expression whose results are to be awaited.
//     * @returns {any} The final result of the given awaitable expression.
//     */
//    var M: AsyncAwait.Await
//    export = M;
//}

//declare module "asyncawait/yield" {
//    //TODO: doc this
//    var M: (expr?: any) => void;
//    export = M;
//}
