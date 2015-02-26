export = Coroutine;


interface Coroutine {
    body: Function;
    this: any;
    args: any[];

    suspend: () => void;
    resume: (error?: Error, value?: any) => void;
}
