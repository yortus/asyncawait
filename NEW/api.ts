import Coroutine = require('./coroutine');


export interface Protocol {
    type: string;
    name?: string;
    autoSelect?: (...args) => boolean;
    dependencies?: string[];
    definition: Function;
}


export interface AsyncProtocol extends Protocol {
    definition: (...deps: AsyncProtocolDefinition[]) => AsyncProtocolDefinition;
}


export interface AwaitProtocol extends Protocol {
    definition: (...deps: AwaitProtocolDefinition[]) => AwaitProtocolDefinition;
}


export interface AsyncProtocolDefinition {
    define?: (bodyFunc: Function) => { name: string; params: string[]; };
    invoke?: (coro: Coroutine) => any;
    return?: (coro: Coroutine, value?: any) => void;
    throw?: (coro: Coroutine, error: Error) => void;
    yield?: (coro: Coroutine, value: any) => void;
}


export interface AwaitProtocolDefinition {
    resolve?: (callback: (error?: Error, value?: any) => void, ...args: any[]) => void;
}


export interface CoroProtocolDefinition {
    acquire: (func: Function, args: any[], this_: any) => Coroutine;
    release: (coro: Coroutine) => void;
}


export declare function use(protocol: AsyncProtocol);
export declare function use(protocol: AwaitProtocol);

