// Type definitions for asyncawait
// Project: https://github.com/yortus/asyncawait
// Definitions by: Troy Gerwien <https://github.com/yortus>


declare module AsyncAwait {

    //------------------------- Async -------------------------
    export interface Async extends AsyncPromise {
        promise: AsyncPromise;
        cps: AsyncCPS;
        thunk: AsyncThunk;
        stream: AsyncStream;
        express: AsyncCPS;
        iterable: AsyncIterable;
        maxConcurrency(n?: number): number;
    }

    export interface AsyncIterable extends AsyncIterablePromise {
        promise: AsyncIterablePromise;
        cps: AsyncIterableCPS;
        thunk: AsyncIterableThunk;
    }

    export interface AsyncOptions {
        protocol: ProtocolStatic;
    }

    export interface AsyncFunction {
        (fn: Function): Function;

        //TODO:...
        mod(options: AsyncOptions): AsyncFunction;
        protocol: ProtocolStatic;
    }

    export interface AsyncPromise extends AsyncFunction {
        <TResult>(fn: () => TResult): () => Promise<TResult>;
        <T, TResult>(fn: (arg: T) => TResult): (arg: T) => Promise<TResult>;
        <T1, T2, TResult>(fn: (arg1: T1, arg2: T2) => TResult): (arg1: T1, arg2: T2) => Promise<TResult>;
        <T1, T2, T3, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3) => TResult): (arg1: T1, arg2: T2, arg3: T3) => Promise<TResult>;
        <T1, T2, T3, T4, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => TResult): (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => Promise<TResult>;
    }

    export interface AsyncCPS extends AsyncFunction {
        <TResult>(fn: () => TResult): (callback?: Callback<TResult>) => void;
        <T, TResult>(fn: (arg: T) => TResult): (arg: T, callback?: Callback<TResult>) => void;
        <T1, T2, TResult>(fn: (arg1: T1, arg2: T2) => TResult): (arg1: T1, arg2: T2, callback?: Callback<TResult>) => void;
        <T1, T2, T3, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3) => TResult): (arg1: T1, arg2: T2, arg3: T3, callback?: Callback<TResult>) => void;
        <T1, T2, T3, T4, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => TResult): (arg1: T1, arg2: T2, arg3: T3, arg4: T4, callback?: Callback<TResult>) => void;
    }

    export interface AsyncThunk extends AsyncFunction {
        <TResult>(fn: () => TResult): () => Thunk<TResult>;
        <T, TResult>(fn: (arg: T) => TResult): (arg: T) => Thunk<TResult>;
        <T1, T2, TResult>(fn: (arg1: T1, arg2: T2) => TResult): (arg1: T1, arg2: T2) => Thunk<TResult>;
        <T1, T2, T3, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3) => TResult): (arg1: T1, arg2: T2, arg3: T3) => Thunk<TResult>;
        <T1, T2, T3, T4, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => TResult): (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => Thunk<TResult>;
    }

    export interface AsyncStream extends AsyncFunction {//TODO: require stream
        (fn: Function): (...args: any[]) => any;
    }

    export interface AsyncIterablePromise extends AsyncFunction {
        (fn: Function): (...args: any[]) => {
            next(): Promise<{ done: boolean; value?: any; }>;
            forEach(callback: (value) => void): Promise<void>;
        };
    }

    export interface AsyncIterableCPS extends AsyncFunction {
        (fn: Function): (...args: any[]) => {
            next(callback?: Callback<any>): void;
            forEach(callback: (value) => void, doneCallback?: Callback<void>): void;
        };
    }

    export interface AsyncIterableThunk extends AsyncFunction {
        (fn: Function): (...args: any[]) => {
            next(): Thunk<{ done: boolean; value?: any; }>;
            forEach(callback: (value) => void): Thunk<void>;
        };
    }

    //------------------------- Await -------------------------
    export interface Await extends AwaitFunction {
        in: AwaitFunction;
        top(n: number): AwaitFunction;
    }

    export interface AwaitFunction {
        <T>(expr: Thenable<T>): T;
        <T>(expr: Thenable<T>[]): T[];
        <T>(expr: Thunk<T>): T;
        <T>(expr: Thunk<T>[]): T[];
        (expr: Object): Object;
    }

    //------------------------- Common -------------------------
    export interface Thenable<T> {
        then<U>(onResolved: (value: T) => Thenable<U>, onRejected: (error: any) => Thenable<U>): Thenable<U>;
        then<U>(onResolved: (value: T) => Thenable<U>, onRejected?: (error: any) => U): Thenable<U>;
        then<U>(onResolved: (value: T) => U, onRejected: (error: any) => Thenable<U>): Thenable<U>;
        then<U>(onResolved?: (value: T) => U, onRejected?: (error: any) => U): Thenable<U>;
    }

    export interface Promise<T> extends Thenable<T> {
        then<U>(onResolved: (value: T) => Thenable<U>, onRejected: (error: any) => Thenable<U>): Promise<U>;
        then<U>(onResolved: (value: T) => Thenable<U>, onRejected?: (error: any) => U): Promise<U>;
        then<U>(onResolved: (value: T) => U, onRejected: (error: any) => Thenable<U>): Promise<U>;
        then<U>(onResolved?: (value: T) => U, onRejected?: (error: any) => U): Promise<U>;
        catch<U>(onReject?: (error: any) => Thenable<U>): Promise<U>;
        catch<U>(onReject?: (error: any) => U): Promise<U>;
        finally(handler: (value: T) => Thenable<T>): Promise<T>;
        finally(handler: (value: T) => T): Promise<T>;
        progressed(handler: (note: any) => any): Promise<T>;
    }

    export interface Callback<TResult> {
        (err: any, result: TResult): void;
    }

    export interface Thunk<TResult> {
        (callback?: (err, result?) => void): void;
    }






    export interface ProtocolStatic {
        new(): Protocol;
        maxConcurrency(n?: number): number;
        arityFor(func: Function): number;
    }


    export interface Protocol {
        invoke(func: Function, this_: any, args: any[]): any; //outside
        resume(): void;             // outside
        suspend(): void;            // inside
        return(result: any): void;  // inside
        throw(error: any): void;    // inside
        yield(value: any): void;    // inside
        dispose(): void;            // ???
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

declare module "asyncawait/yield" {
    //TODO: doc this
    var M: (expr?: any) => void;
    export = M;
}
