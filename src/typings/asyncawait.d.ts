// Type definitions for asyncawait
// Project: https://github.com/yortus/asyncawait
// Definitions by: Troy Gerwien <https://github.com/yortus>

declare module AsyncAwait {

    export interface Async extends AsyncReturnsPromise {
        concurrency: (n: number) => AsyncReturnsPromise;
        iterable: AsyncReturnsIteratorReturnsPromise;
        cps: AsyncAcceptsCallback
    }

    export interface Await extends AwaitFunc {
        inPlace: AwaitFunc;
    }

    export interface AsyncReturnsPromise {
        <TResult>(fn: () => TResult): () => Thenable<TResult>;
        <T, TResult>(fn: (arg: T) => TResult): (arg: T) => Thenable<TResult>;
        <T1, T2, TResult>(fn: (arg1: T1, arg2: T2) => TResult): (arg1: T1, arg2: T2) => Thenable<TResult>;
        <T1, T2, T3, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3) => TResult): (arg1: T1, arg2: T2, arg3: T3) => Thenable<TResult>;
        <T1, T2, T3, T4, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => TResult): (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => Thenable<TResult>;
        (fn: Function): () => Thenable<any>;
    }

    export interface AsyncAcceptsCallback {
        <TResult>(fn: () => TResult): (callback?: (err, result: TResult) => void) => void;
        <T, TResult>(fn: (arg: T) => TResult): (arg: T, callback?: (err, result: TResult) => void) => void;
        <T1, T2, TResult>(fn: (arg1: T1, arg2: T2) => TResult): (arg1: T1, arg2: T2, callback?: (err, result: TResult) => void) => void;
        <T1, T2, T3, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3) => TResult): (arg1: T1, arg2: T2, arg3: T3, callback?: (err, result: TResult) => void) => void;
        <T1, T2, T3, T4, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => TResult): (arg1: T1, arg2: T2, arg3: T3, arg4: T4, callback?: (err, result: TResult) => void) => void;
        (fn: Function): (callback?: (err, result) => void) => void;
    }

    export interface AsyncReturnsIteratorReturnsPromise {
        (fn: Function): () => {
            next(): Thenable<{ done: boolean; value?: any; }>;
            forEach(callback: (value) => void): Thenable<void>;
        };
    }

    export interface AwaitFunc {
        <T>(expr: AsyncAwait.Thenable<T>): T;
        <T>(expr: AsyncAwait.Thenable<T>[]): T[];
        <T>(expr: Thunk<T>): any;
        (expr: Object): Object;
    }

    export interface Thenable<T> {
        then<U>(onResolved: (value: T) => Thenable<U>, onRejected: (error: any) => Thenable<U>): Thenable<U>;
        then<U>(onResolved: (value: T) => Thenable<U>, onRejected?: (error: any) => U): Thenable<U>;
        then<U>(onResolved: (value: T) => U, onRejected: (error: any) => Thenable<U>): Thenable<U>;
        then<U>(onResolved?: (value: T) => U, onRejected?: (error: any) => U): Thenable<U>;
    }

    export interface Thunk<TResult> {
        (err: any, result: TResult): void;
    }
}

declare module "asyncawait" {
    export import async = require("asyncawait/async");
    export import await = require("asyncawait/await");
}

declare module "asyncawait/async" {
    /**
     * Creates a function that can be suspended at each asynchronous operation using await().
     * @param {Function} fn - Contains the body of the suspendable function. Calls to await()
     *                        may appear inside this function.
     * @returns {Function} A function of the form `(...args) --> Promise`. Any arguments
     *                     passed to this function are passed through to fn. The returned
     *                     promise is resolved when fn returns, or rejected if fn throws.
     */
    var M: AsyncAwait.Async;
    export = M;
}

declare module "asyncawait/await" {
    /**
     * Suspends an async-wrapped function until the given awaitable expression produces
     * a result. If the given expression produces an error, then an exception is raised
     * in the async-wrapped function.
     * @param {any} expr - The awaitable expression whose results are to be awaited.
     * @returns {any} The final result of the given awaitable expression.
     */
    var M: AsyncAwait.Await
    export = M;
}
