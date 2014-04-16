// Type definitions for asyncawait
// Project: https://github.com/yortus/asyncawait
// Definitions by: Troy Gerwien <https://github.com/yortus>

declare module AsyncAwait {

    //------------------------- Async -------------------------
    export interface Async extends AsyncReturnsPromise {
        cps: AsyncReturnsNothing;
        iterable: AsyncReturnsIteratorReturnsPromise;
    }

    export interface AsyncFunction {
        (fn: Function): Function;
        // These overloads provide enhanced type information to TypeScript users. The strings must match exactly.
        mod(options: 'returns: promise, iterable: false', acceptsCallback?: boolean, maxConcurrency?: number): AsyncReturnsPromise;
        mod(options: 'returns: thunk, iterable: false', acceptsCallback?: boolean, maxConcurrency?: number): AsyncReturnsThunk;
        mod(options: 'returns: value, iterable: false', acceptsCallback?: boolean, maxConcurrency?: number): AsyncReturnsValue;
        mod(options: 'returns: none, iterable: false', acceptsCallback?: boolean, maxConcurrency?: number): AsyncReturnsNothing;
        mod(options: 'returns: promise, iterable: true', acceptsCallback?: boolean, maxConcurrency?: number): AsyncReturnsIteratorReturnsPromise;
        mod(options: 'returns: thunk, iterable: true', acceptsCallback?: boolean, maxConcurrency?: number): AsyncReturnsIteratorReturnsThunk;
        mod(options: 'returns: value, iterable: true', acceptsCallback?: boolean, maxConcurrency?: number): AsyncReturnsIteratorReturnsValue;
        mod(options: 'returns: none, iterable: true', acceptsCallback?: boolean, maxConcurrency?: number): AsyncReturnsIteratorReturnsNothing;
        mod(options: string, acceptsCallback?: boolean, maxConcurrency?: number): AsyncFunction;
        mod(options: AsyncOptions): AsyncFunction;
    }

    export interface AsyncOptions {
        returnValue?: string; // Recognised values: 'none', 'promise', 'thunk', 'result'
        acceptsCallback?: boolean;
        isIterable?: boolean;
        maxConcurrency?: number;
    }

    export interface AsyncReturnsPromise extends AsyncFunction {
        <TResult>(fn: () => TResult): (callback?: Callback<TResult>) => Thenable<TResult>;
        <T, TResult>(fn: (arg: T) => TResult): (arg: T, callback?: Callback<TResult>) => Thenable<TResult>;
        <T1, T2, TResult>(fn: (arg1: T1, arg2: T2) => TResult): (arg1: T1, arg2: T2, callback?: Callback<TResult>) => Thenable<TResult>;
        <T1, T2, T3, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3) => TResult): (arg1: T1, arg2: T2, arg3: T3, callback?: Callback<TResult>) => Thenable<TResult>;
        <T1, T2, T3, T4, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => TResult): (arg1: T1, arg2: T2, arg3: T3, arg4: T4, callback?: Callback<TResult>) => Thenable<TResult>;
        (fn: Function): () => Thenable<any>;
    }

    export interface AsyncReturnsThunk extends AsyncFunction {
        <TResult>(fn: () => TResult): (callback?: Callback<TResult>) => Callback<TResult>;
        <T, TResult>(fn: (arg: T) => TResult): (arg: T, callback?: Callback<TResult>) => Callback<TResult>;
        <T1, T2, TResult>(fn: (arg1: T1, arg2: T2) => TResult): (arg1: T1, arg2: T2, callback?: Callback<TResult>) => Callback<TResult>;
        <T1, T2, T3, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3) => TResult): (arg1: T1, arg2: T2, arg3: T3, callback?: Callback<TResult>) => Callback<TResult>;
        <T1, T2, T3, T4, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => TResult): (arg1: T1, arg2: T2, arg3: T3, arg4: T4, callback?: Callback<TResult>) => Callback<TResult>;
        (fn: Function): () => Thenable<any>;
    }

    export interface AsyncReturnsValue extends AsyncFunction {
        <TResult>(fn: () => TResult): (callback?: Callback<TResult>) => TResult;
        <T, TResult>(fn: (arg: T) => TResult): (arg: T, callback?: Callback<TResult>) => TResult;
        <T1, T2, TResult>(fn: (arg1: T1, arg2: T2) => TResult): (arg1: T1, arg2: T2, callback?: Callback<TResult>) => TResult;
        <T1, T2, T3, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3) => TResult): (arg1: T1, arg2: T2, arg3: T3, callback?: Callback<TResult>) => TResult;
        <T1, T2, T3, T4, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => TResult): (arg1: T1, arg2: T2, arg3: T3, arg4: T4, callback?: Callback<TResult>) => TResult;
        (fn: Function): () => Thenable<any>;
    }

    export interface AsyncReturnsNothing extends AsyncFunction {
        <TResult>(fn: () => TResult): (callback?: Callback<TResult>) => void;
        <T, TResult>(fn: (arg: T) => TResult): (arg: T, callback?: Callback<TResult>) => void;
        <T1, T2, TResult>(fn: (arg1: T1, arg2: T2) => TResult): (arg1: T1, arg2: T2, callback?: Callback<TResult>) => void;
        <T1, T2, T3, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3) => TResult): (arg1: T1, arg2: T2, arg3: T3, callback?: Callback<TResult>) => void;
        <T1, T2, T3, T4, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => TResult): (arg1: T1, arg2: T2, arg3: T3, arg4: T4, callback?: Callback<TResult>) => void;
        (fn: Function): () => Thenable<any>;
    }

    export interface AsyncReturnsIteratorReturnsPromise extends AsyncFunction {
        (fn: Function): () => {
            next(callback?: Callback<any>): Thenable<{ done: boolean; value?: any; }>;
            forEach(callback: (value) => void, doneCallback?: Callback<void>): Thenable<void>;
        };
    }

    export interface AsyncReturnsIteratorReturnsThunk extends AsyncFunction {
        (fn: Function): () => {
            next(callback?: Callback<any>): Callback<{ done: boolean; value?: any; }>;
            forEach(callback: (value) => void, doneCallback?: Callback<void>): Callback<void>;
        };
    }

    export interface AsyncReturnsIteratorReturnsValue extends AsyncFunction {
        (fn: Function): () => {
            next(callback?: Callback<any>): { done: boolean; value?: any; };
            forEach(callback: (value) => void, doneCallback?: Callback<void>): void;
        };
    }

    export interface AsyncReturnsIteratorReturnsNothing extends AsyncFunction {
        (fn: Function): () => {
            next(callback?: Callback<any>): void;
            forEach(callback: () => void, doneCallback?: Callback<void>): void;
        };
    }

    //------------------------- Await -------------------------
    export interface Await extends AwaitFunc {
        inPlace: AwaitFunc;
    }

    export interface AwaitFunc {
        <T>(expr: AsyncAwait.Thenable<T>): T;
        <T>(expr: AsyncAwait.Thenable<T>[]): T[];
        <T>(expr: Callback<T>): any;
        (expr: Object): Object;
    }

    //------------------------- Common -------------------------
    export interface Thenable<T> {
        then<U>(onResolved: (value: T) => Thenable<U>, onRejected: (error: any) => Thenable<U>): Thenable<U>;
        then<U>(onResolved: (value: T) => Thenable<U>, onRejected?: (error: any) => U): Thenable<U>;
        then<U>(onResolved: (value: T) => U, onRejected: (error: any) => Thenable<U>): Thenable<U>;
        then<U>(onResolved?: (value: T) => U, onRejected?: (error: any) => U): Thenable<U>;
    }

    export interface Callback<TResult> {
        (err: any, result: TResult): void;
    }
}

declare module "asyncawait" {
    export import async = require("asyncawait/async");
    export import await = require("asyncawait/await");
}

declare module "asyncawait/async" {
    /**
     * Creates a suspendable function. Suspendable functions may use the await() function
     * internally to suspend execution at arbitrary points, pending the results of
     * internal asynchronous operations.
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
     * Suspends a suspendable function until the given awaitable expression produces
     * a result. If the given expression produces an error, then an exception is raised
     * in the suspendable function.
     * @param {any} expr - The awaitable expression whose results are to be awaited.
     * @returns {any} The final result of the given awaitable expression.
     */
    var M: AsyncAwait.Await
    export = M;
}
