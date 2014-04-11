// Type definitions for asyncawait
// Project: https://github.com/yortus/asyncawait
// Definitions by: Troy Gerwien <https://github.com/yortus>

declare module AsyncAwait {

    export interface Await extends AwaitFunc {
        inPlace: AwaitFunc;
    }

    export interface IAsync {
        <TResult>(fn: () => TResult): () => Thenable<TResult>;
        <T, TResult>(fn: (arg: T) => TResult): (arg: T) => Thenable<TResult>;
        <T1, T2, TResult>(fn: (arg1: T1, arg2: T2) => TResult): (arg1: T1, arg2: T2) => Thenable<TResult>;
        <T1, T2, T3, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3) => TResult): (arg1: T1, arg2: T2, arg3: T3) => Thenable<TResult>;
        <T1, T2, T3, T4, TResult>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => TResult): (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => Thenable<TResult>;
        (fn: Function): () => Thenable<any>;
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

declare module AsyncAwaitStatic {
    export var async: AsyncAwait.IAsync;
    export var await: AsyncAwait.Await;
}

declare module "asyncawait" {
    export = AsyncAwaitStatic
}
declare module "asyncawait/async" {
    var _: AsyncAwait.IAsync;
    export = _;
}
declare module "asyncawait/await" {
    var _: AsyncAwait.Await
    export = _;
}
