// Type definitions for asyncawait
// Project: https://github.com/yortus/asyncawait
// Definitions by: Troy Gerwien <https://github.com/yortus>


///<reference path="../node/node.d.ts" />
///<reference path="../bluebird/bluebird.d.ts" />


declare module AsyncAwait {


    //------------------------- Async -------------------------
    export module Async {
        
        export interface API extends PromiseBuilder {
            config: Config;
            promise: PromiseBuilder;
            cps: CPSBuilder;
            thunk: ThunkBuilder;
            stream: StreamBuilder;
            express: CPSBuilder;
            iterable: IterableAPI;
        }

        export interface IterableAPI extends IterablePromiseBuilder {
            promise: IterablePromiseBuilder;
            cps: IterableCPSBuilder;
            thunk: IterableThunkBuilder;
        }

        export interface PromiseBuilder extends TypedBuilder<PromiseBuilder> {
            <TResult>(fn: () => TResult): () => Promise<TResult>;
            <T, TResult>(fn: (arg: T) => TResult): (arg: T) => Promise<TResult>;
            <T1, T2, TResult>(fn: (arg1: T1, arg2: T2) => TResult): (arg1: T1, arg2: T2) => Promise<TResult>;
            <T1, T2, T3, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3) => TResult): (arg1: T1, arg2: T2, arg3: T3) => Promise<TResult>;
            <T1, T2, T3, T4, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => TResult): (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => Promise<TResult>;
        }

        export interface CPSBuilder extends TypedBuilder<CPSBuilder> {
            <TResult>(fn: () => TResult): (callback?: Callback<TResult>) => void;
            <T, TResult>(fn: (arg: T) => TResult): (arg: T, callback?: Callback<TResult>) => void;
            <T1, T2, TResult>(fn: (arg1: T1, arg2: T2) => TResult): (arg1: T1, arg2: T2, callback?: Callback<TResult>) => void;
            <T1, T2, T3, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3) => TResult): (arg1: T1, arg2: T2, arg3: T3, callback?: Callback<TResult>) => void;
            <T1, T2, T3, T4, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => TResult): (arg1: T1, arg2: T2, arg3: T3, arg4: T4, callback?: Callback<TResult>) => void;
        }

        export interface ThunkBuilder extends TypedBuilder<ThunkBuilder> {
            <TResult>(fn: () => TResult): () => Thunk<TResult>;
            <T, TResult>(fn: (arg: T) => TResult): (arg: T) => Thunk<TResult>;
            <T1, T2, TResult>(fn: (arg1: T1, arg2: T2) => TResult): (arg1: T1, arg2: T2) => Thunk<TResult>;
            <T1, T2, T3, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3) => TResult): (arg1: T1, arg2: T2, arg3: T3) => Thunk<TResult>;
            <T1, T2, T3, T4, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => TResult): (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => Thunk<TResult>;
        }

        export interface StreamBuilder extends TypedBuilder<StreamBuilder> {
            (fn: Function): (...args: any[]) => NodeJS.ReadableStream;
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

        export interface TypedBuilder<TBuilder extends Builder> extends Builder {
            mod<TBuilder2 extends Builder>(mod: TypedMod<TBuilder2>): TBuilder2;
            mod(mod: Mod): TBuilder;
            mod(options: {}): TBuilder;
        }

        export interface Builder {
            (fn: Function): Function;
            name: string;
            protocol: Protocol;
            options: any;
            mod<TBuilder extends Builder>(mod: TypedMod<TBuilder>): TBuilder;
            mod(mod: Mod): Builder;
            mod(options: {}): Builder;
        }

        export interface TypedMod<TBuilder extends Builder> extends Mod {
            type: TBuilder;
        }

        export interface Mod {
            overrideProtocol: (base: Protocol, options: any) => ProtocolOverrides;
            defaultOptions?: {};
            name?: string;
        }

        //TODO: doc these methods
        export interface Protocol {
            begin: (fi: Fiber, ...protocolArgs) => any;
            suspend: (fi: Fiber, error?: Error, value?: any) => any;
            resume: (fi: Fiber, error?: Error, value?: any) => any;
            end: (fi: Fiber, error?: Error, value?: any) => any;
        }

        export interface ProtocolOverrides {
            begin?: (fi: Fiber, ...protocolArgs) => any;
            suspend?: (fi: Fiber, error?: Error, value?: any) => any;
            resume?: (fi: Fiber, error?: Error, value?: any) => any;
            end?: (fi: Fiber, error?: Error, value?: any) => any;
        }
    }


    //------------------------- Await -------------------------
    export module Await {

        export interface API extends Builder {
            promise: PromiseBuilder;
            cps: CPSBuilder;
            thunk: ThunkBuilder;

            //TODO: was...
            //in: AwaitFunction;
            //top(n: number): AwaitFunction;
        }

        //TODO: Review this after making extensible
        export interface PromiseBuilder extends Builder {
            <T>(expr: Promise.Thenable<T>): T;
        }

        export interface CPSBuilder extends Builder {
            (expr: any): any;
            continuation: () => Callback<any>;
        }

        export interface ThunkBuilder extends Builder {
            <T>(expr: Thunk<T>): T;
        }

        //TODO: ...?
        export interface PromiseArrayBuilder extends Builder {
            <T>(expr: Promise.Thenable<T>[]): T[];
        }

        export interface Builder {
            (...args: any[]): any;
            handlers: Handlers;
            options: any;
            mod<TBuilder extends Builder>(mod: Mod<TBuilder>): TBuilder;
        }

        export interface Mod<TBuilder extends Builder> {
            name?: string;
            type?: TBuilder;
            overrideHandlers?: (base: Handlers, options: any) => HandlerOverrides; //TODO: new...
            defaultOptions?: {};
        }

        // TODO: new...
        // TODO: better doc how handler indicates it *won't* handle an expr. Could that indicator also be async (ie not known by sync return time)?
        // TODO: doc: handlers *must* resume coro asynchronously
        // TODO: doc: arg/allArgs fast/slow paths
        export interface Handlers {
            singular: (fi: Fiber, arg: any) => any;
            variadic: (fi: Fiber, args: any[]) => any;
            elements?: (values: any[], result: (err: Error, value: any, index: number) => void) => number;
        }

        // TODO: new...
        export interface HandlerOverrides {
            singular?: (fi: Fiber, arg: any) => any;
            variadic?: (fi: Fiber, args: any[]) => any;
        }
    }


    //------------------------- Yield -------------------------
    export interface Yield {
        (expr?: any): void;
    }


    //------------------------- Extensibility -------------------------
    export interface Config {
        (): ConfigOptions;
        //TODO: was... (options: ConfigOptions): void;
        mod(mod: Mod): void;
        mod(options: {}): void;
    }

    //TODO: really type these defaults?
    export interface ConfigOptions {
        fibersHotfix169?: boolean;
        fiberPool?: boolean;
        maxSlots?: number;
        cpsKeyword?: string;
    }

    // TODO: should be AsyncAwait.Config.Mod - need another namespace
    //TODO: make similar to async protocol typings
    export interface Mod {
        overrideProtocol: (base: JointProtocol, options: ConfigOptions) => JointProtocolOverrides;
        defaultOptions?: {};
        name?: string;
    }

    export interface JointProtocol {
        acquireFiber: (asyncProtocol: Async.Protocol) => Fiber;
        releaseFiber: (asyncProtocol: Async.Protocol, fi: Fiber) => void;
        setFiberTarget: (fi: Fiber, bodyFunc: Function, bodyThis?: any, bodyArgs?: any[]) => void
        startup: () => void;
        shutdown: () => void;
    }

    export interface JointProtocolOverrides {
        acquireFiber?: (asyncProtocol: Async.Protocol) => Fiber;
        releaseFiber?: (asyncProtocol: Async.Protocol, fi: Fiber) => void;
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
}


declare module "asyncawait" {
    export import async = require("asyncawait/async");
    export import await = require("asyncawait/await");
    export import yield_ = require("asyncawait/yield");
}
declare module "asyncawait/async" { var api: AsyncAwait.Async.API; export = api; }
declare module "asyncawait/await" { var api: AsyncAwait.Await.API; export = api; }
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
