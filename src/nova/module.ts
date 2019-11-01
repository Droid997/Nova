
import { isArray,resolveURL } from "../util/util";
import { Logger, oCurrentExecutingScripts } from "./nova-loader";


export enum ModuleState {
    INITIAL = 0, // Module neither has been required nor preloaded not declared, but someone asked for it.
    PRELOADED = -1, // Module has been preloaded, but not required or declared
    LOADING = 1, // Module has been declared.
    LOADED = 2, // Module has been loaded, but not yet executed.
    EXECUTING = 3, // Module is currently being executed
    READY = 4, // Module has been loaded and executed without errors.
    FAILED = 5, // Module either could not be loaded or execution threw an error
}


export class Module {
    public data: any;
    public content: any;
    public moduleName: string;
    public state: number;
    public url: string;
    public settled:boolean;
    public error:any;
    public pending: Array<string>

    constructor(module_name) {
        this.data = null;
        this.content = null;
        this.moduleName = module_name;
        this.url = resolveURL(module_name);
        this.state = ModuleState.INITIAL;
        this.settled=false;
        this.pending = [];
    }

    public name(): string {
        return this.moduleName;
    }

   public addPending(module: any): Array<string> {
        if (isArray(module))
            this.pending = this.pending.concat(module);
        else if (typeof module === "string")
            this.pending.push(module);

        return this.pending;
    }

    public fail(err){
		this.settled = true;
		if ( this.state !== ModuleState.FAILED) {
			this.state = ModuleState.FAILED;
			this.error = err;

		}
    }

}

function attachMapper(sScript,url){
    if(sScript && url)
    {
        let oMatch = /\/\/[#@] source(Mapping)?URL=(.*)$/.exec(sScript);
        if (oMatch && oMatch[1] && /^[^/]+\.js\.map$/.test(oMatch[2])) {
            // found a sourcemap annotation with a typical UI5 generated relative URL
            sScript = sScript.slice(0, oMatch.index) + oMatch[0].slice(0, -oMatch[2].length) + resolveURL(oMatch[2], url);
        }
        // @evo-todo use only sourceMappingURL, sourceURL or both?
        if (!oMatch || oMatch[1]) {
            // write sourceURL if no annotation was there or when it was a sourceMappingURL
            sScript += "\n//# sourceURL=" + resolveURL(url) + "?eval";
        }

        return sScript;
    }else
    {
        Logger.error("Couldnt attach mapper");
    }
    
}
export function execModule(module: any): Function {
    try {
        if (module instanceof Module) {
            let moduleState = module.state;
            if (moduleState === ModuleState.READY)
                return module.content;
            else if (moduleState === ModuleState.LOADED) {
                let sScript = module.data;
                let url=module.url;
                if (sScript) {
                    sScript=attachMapper(sScript,url);
                }
                oCurrentExecutingScripts.push(module.moduleName);
                module.state=ModuleState.EXECUTING;
                eval(sScript);
                // module.state=ModuleState.READY;
            }
        } else if (typeof module === 'string') {
            var url= oCurrentExecutingScripts[oCurrentExecutingScripts.length-1];
            if (module) {
                module=attachMapper(module,url);
            }
            eval(module);
        }

    } catch (error) {
        throw new Error(error);
    }
}