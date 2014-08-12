//TODO: put this in util?


interface Mod {
    overrideProtocol: (baseProtocol: any, options: any) => any;
    defaultOptions: any;
    name: string;
}

interface Info {
    protocol: any;
    options: any;
}

function modMaker(oldState: Info, modList: Mod[], newMod: Mod): Info {

    var isOptionsOnly = !newMod.overrideProtocol;

    //var overrideProtocol = isOptionsOnly ? old.







    return null;
    
}
