// Type definitions for asyncawait
// Project: https://github.com/yortus/asyncawait
// Definitions by: Troy Gerwien <https://github.com/yortus>


///<reference path="../node/node.d.ts" />
///<reference path="../bluebird/bluebird.d.ts" />


declare module AsyncAwait {


    //------------------------- Async -------------------------
    export module Async {
        
        export interface API extends PromiseBuilder {
            config(value?: Config): Config;
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

        export interface Config {
            maxConcurrency?: number;
        }

        export interface PromiseBuilder extends Builder {
            <TResult>(fn: () => TResult): () => Promise<TResult>;
            <T, TResult>(fn: (arg: T) => TResult): (arg: T) => Promise<TResult>;
            <T1, T2, TResult>(fn: (arg1: T1, arg2: T2) => TResult): (arg1: T1, arg2: T2) => Promise<TResult>;
            <T1, T2, T3, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3) => TResult): (arg1: T1, arg2: T2, arg3: T3) => Promise<TResult>;
            <T1, T2, T3, T4, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => TResult): (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => Promise<TResult>;
        }

        export interface CPSBuilder extends Builder {
            <TResult>(fn: () => TResult): (callback?: Callback<TResult>) => void;
            <T, TResult>(fn: (arg: T) => TResult): (arg: T, callback?: Callback<TResult>) => void;
            <T1, T2, TResult>(fn: (arg1: T1, arg2: T2) => TResult): (arg1: T1, arg2: T2, callback?: Callback<TResult>) => void;
            <T1, T2, T3, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3) => TResult): (arg1: T1, arg2: T2, arg3: T3, callback?: Callback<TResult>) => void;
            <T1, T2, T3, T4, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => TResult): (arg1: T1, arg2: T2, arg3: T3, arg4: T4, callback?: Callback<TResult>) => void;
        }

        export interface ThunkBuilder extends Builder {
            <TResult>(fn: () => TResult): () => Thunk<TResult>;
            <T, TResult>(fn: (arg: T) => TResult): (arg: T) => Thunk<TResult>;
            <T1, T2, TResult>(fn: (arg1: T1, arg2: T2) => TResult): (arg1: T1, arg2: T2) => Thunk<TResult>;
            <T1, T2, T3, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3) => TResult): (arg1: T1, arg2: T2, arg3: T3) => Thunk<TResult>;
            <T1, T2, T3, T4, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => TResult): (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => Thunk<TResult>;
        }

        export interface StreamBuilder extends Builder {
            (fn: Function): (...args: any[]) => ReadableStream;
        }

        export interface IterablePromiseBuilder extends Builder {
            (fn: Function): (...args: any[]) => {
                next(): Promise<{ done: boolean; value?: any; }>;
                forEach(callback: (value) => void): Promise<void>;
            };
        }

        export interface IterableCPSBuilder extends Builder {
            (fn: Function): (...args: any[]) => {
                next(callback?: Callback<any>): void;
                forEach(callback: (value) => void, doneCallback?: Callback<void>): void;
            };
        }

        export interface IterableThunkBuilder extends Builder {
            (fn: Function): (...args: any[]) => {
                next(): Thunk<{ done: boolean; value?: any; }>;
                forEach(callback: (value) => void): Thunk<void>;
            };
        }

        export interface Builder {
            (fn: Function): Function;
            protocol: Protocol;
            options: Options;
            mod<TBuilder extends Builder>(protocolFactory: (options: Options, baseProtocol: Protocol) => ProtocolOverrides, options?: Options): TBuilder;
            mod<TBuilder extends Builder>(options: Options): TBuilder;
        }

        export interface Options {
            canDiscardContext?: boolean;
        }

        export interface Protocol {
            invoke: (co: Coroutine, ...protocolArgs) => any;
            return: (co: Coroutine, result: any) => void;
            throw: (co: Coroutine, error: Error) => void;
            yield: (co: Coroutine, value: any) => void;
            finally: (co: Coroutine) => void;
        }

        export interface ProtocolOverrides {
            invoke?: (co: Coroutine, ...protocolArgs) => any;
            return?: (co: Coroutine, result: any) => void;
            throw?: (co: Coroutine, error: Error) => void;
            yield?: (co: Coroutine, value: any) => void;
            finally?: (co: Coroutine) => void;
        }

        export interface Coroutine {


            //TODO: testing...
            resume: (error?: Error, value?: any) => void;
            yield: (value: any) => void;


            //TODO: get rid of these...
            protocol: Protocol;
            body?: Function;
            fiber?: any;
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
            __: Callback<any>;
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
            handler: Handler;
            options: {};
            mod<TBuilder extends Builder>(handlerFactory: (options: {}, baseHandler: Handler) => Handler, options?: {}): TBuilder;
            mod<TBuilder extends Builder>(options: {}): TBuilder;
        }

        // TODO: better doc how handler indicates it *won't* handle an expr. Could that indicator also be async (ie not known by sync return time)?
        export interface Handler {
            (args: any[], resume: (error?, result?) => void): any;
        }
    }


    //------------------------- Yield -------------------------
    export interface Yield {
        (expr?: any): void;
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
