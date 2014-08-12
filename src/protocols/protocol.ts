import references = require('references');



interface Mod {
    overrideProtocol: (baseProtocol: any, options: any) => any;
    defaultOptions: any;
    name: string;
}




class Protocol {

    constructor(modOrOptions) {
        
    }

    options: {};

    mods: Mod[];

    // <protocol methods...>            
}
