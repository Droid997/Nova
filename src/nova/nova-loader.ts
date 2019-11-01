
import $ from '../thirdparty/jQuery';
import logger from '../util/logger';
import { Module, ModuleState, execModule } from './module';
import { isArray } from '../util/util';
import { AJAXLoader, loadSyncXHR } from '../util/ajax';
import { Component } from './Component';
import controller from './controller';

/**
 * @todo validate URL
 * @param url - URL to be normalized 
 */
function normalizeURL(url: string) {
    if (url.endsWith(".js"))
        return url;
    else
        return url + ".js";
}

/**
 * @static
 * Logger Export for the consistency logger instance
 * All the Logger uses the same instance
 */
export var Logger = new logger();

/**
 * @private 
 * @exports current Executing scripts
 * contains the module name of the executing script
*/
export var oCurrentExecutingScripts = [];

/**
 * @private
 * anyonymous module counter
 */
var moduleCounter = 0;

/**
 * @private
 * @exports 
 * modulename ends with .js for .xml ? 
 * [module_name]=Module
 * ex:["init"]={data,name,value,state,pending}
 */
export var mModules = Object.create(null);

/**
 * @private
 * @exports
 * [componentName]=componentPath
 */
export var mComponentPaths = Object.create(null);

/**
 * @private
 * 
 */
function getModules() {
    return mModules;
}

//TODO before Adding into componetPaths validate the url 
function validateModulepath(path: string) {
    var last = path.lastIndexOf("/");
}

// TODO: create script class ? fix return type as Module
/**
 * Gets the module if already registered in the mModules Map,
 * If the module is not registred it intializies the module
 * @param module_name 
 * @returns Module
 */
export function getModule(module_name?: string, normalize?: boolean): Module {

    //validate modulename
    if (!module_name) {

        module_name = oCurrentExecutingScripts[oCurrentExecutingScripts.length - 1];

        module_name = normalizeURL(module_name);
        if (!mModules[module_name]) {
            let module = new Module(module_name);
            mModules[module_name] = module;
            return module;
        } else if (mModules[module_name]) {
            let module = mModules[module_name]
            return module;
        }
    } else if (module_name) {

        if (normalize)
            module_name = normalizeURL(module_name);

        if (module_name === "nova/controller.js") {
            let module = mModules[module_name];
            module.content = new controller();
            return module;
        } else {
            if (mModules[module_name]) {
                return mModules[module_name];
            }
            else if (!mModules[module_name]) {

                let module = new Module(module_name);
                mModules[module_name] = module;
                return module;
            }
        }


    }
}


function requireModule(requstingModule: Module, dependencyName: string, bAsync: boolean) {

    var dModule = getModule(dependencyName);
    if (!bAsync) {
        if (dModule.state === ModuleState.INITIAL) {

            loadSyncXHR(dModule);

            execModule(dModule);

            return dModule.content;

        } else if (dModule.state === ModuleState.READY) {
            return dModule.content;
        }
    } else {

    }


}

function requireAll(module: Module, dependencies: Array<string>, fnSuccess: Function, fnError: Function, bexport: boolean, bAsync: boolean) {
    var dModules = [];

    try {
        if (!bAsync) {

            if (dependencies.length > 0) {
                for (var i = 0; i < dependencies.length; i++)
                    dModules.push(requireModule(module, dependencies[i], bAsync));
            }
            fnSuccess.call(global, dModules);
        } else {
            // Not implemented yet
            Promise.all(dModules).then((results) => {
                fnSuccess.call(global, results);
            }).catch(error => {
                fnError(error);
            })
        }
    } catch (error) {
        fnError(error);
    }



}

/**
 * 
 * @param resourceName - module name 
 * @param dependencies - depenecies of the current module
 * @param factory - call back to be executed when dependencies are loaded 
 * @param bexport - export the module to window name space
 * @param bAsync - run aSynchronousy
 */
function executeModuleDefinition(resourceName: string, dependencies: Array<string>, factory: Function, bexport: boolean, bAsync) {

    let module = getModule(resourceName);

    module.addPending(dependencies);
    if (module.state === ModuleState.LOADED) {
        return module.content;
    } else {
        if (!bAsync) {

            requireAll(module, dependencies, function (aModules) {

                if (typeof factory === 'function') {
                    // from https://github.com/amdjs/amdjs-api/blob/master/AMD.md
                    // "If the factory function returns a value (an object, function, or any value that coerces to true),
                    //  then that value should be assigned as the exported value for the module."
                    try {
                        var _export = factory.apply(window, aModules);
                        module.content = _export;

                    } catch (err) {
                        module.fail(err);
                    }
                } else {
                    module.content = factory;
                }
                module.state = ModuleState.READY;
                oCurrentExecutingScripts.pop();
            }, function (err) {
                module.fail(err);
            }, bexport, bAsync)
        }

    }
    // else if(module.state===ModuleState.EXECUTING)
    // {
    //     if (typeof factory === 'function') {
    //         // from https://github.com/amdjs/amdjs-api/blob/master/AMD.md
    //         // "If the factory function returns a value (an object, function, or any value that coerces to true),
    //         //  then that value should be assigned as the exported value for the module."
    //         try {
    //             var _export = factory.apply(window,[]);
    //             module.content = _export;

    //         } catch (err) {
    //             module.fail(err);
    //         }
    //     }else {
    //         module.content = factory;
    //     }

    //     module.state=ModuleState.READY;
    //     oCurrentExecutingScripts.pop();
    // }

}

/**
 * 
 * @param sResourceName - module name
 * @param dependenices - dependency array
 * @param factory - callback on dependecy load
 * @param bexport - export the module to window
 */
function novaDefine(sResourceName: any, dependenices: any, factory: any, bexport: any) {
    let vdependencies = [], vfactory, vexport = false;

    //module name declared
    if (typeof sResourceName === "string") {
        vdependencies = dependenices;
        vfactory = factory;
        vexport = bexport;
    }
    else if (isArray(sResourceName)) {
        //shift parameters
        vdependencies = sResourceName;
        vfactory = dependenices;
        vexport = factory;

        sResourceName = oCurrentExecutingScripts.length > 0 ? oCurrentExecutingScripts[oCurrentExecutingScripts.length - 1] : null;

    }



    executeModuleDefinition(sResourceName, vdependencies, vfactory, vexport, false/* aysnc */);
}

/**
 * Parse manifest.json file
 */
function mainfestParser(): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const manifest = "manifest.json";
        const type = "JSON";

        const fnsuccess = (result: object) => {
            Object.keys(result).forEach((key) => {
                if (key === "Components") {
                    result[key].forEach((element: object) => {
                        const componentName = Object.keys(element)[0];
                        const componentPath = Object.values(element)[0];
                        mComponentPaths[componentName] = componentPath;
                        Logger.success("Registered Component (" + componentName + ",'" + componentPath + "')");
                    });
                }
            });
            resolve(true);
        }

        const failure = (error) => {
            throw error;
            reject(false);
        }

        AJAXLoader(manifest, type, fnsuccess, failure)
    });

}

// Runs the data-main script 
// Entry Point
function initLoader(loaderScript: string): void {


    oCurrentExecutingScripts.push(loaderScript);
    // let module = getModule();
    // module.state = ModuleState.LOADING;

    var url = normalizeURL(loaderScript);
    function success(data: string) {

        // module.state = ModuleState.LOADED;
        // module.data = data;
        // execModule(module);
        execModule(data);
        // eval(data);

    }

    function error() {
        throw new Error("Module Not Found");
    }

    try {
        mainfestParser().then(() => {
            // AJAXLoader(module.moduleName, "text", success, error);
            AJAXLoader(url, "text", success, error);
        }).catch((error) => {
            throw error;
        })

    } catch (error) {
        throw new Error(error);
    }

}


function modulePreload() {
    // setting Base Controller module
    var mcontroller = new Module("nova/controller");
    mcontroller.state = ModuleState.READY;
    mcontroller.content = new controller();
    mModules[normalizeURL(mcontroller.moduleName)] = mcontroller;
}
(function preload() {
    modulePreload();
})();

export default (function (global, jQuery) {
    'use strict';

    //Export function
    var _export = {
        getModules: null,
        initLoader: null,
        define: null,
        createComponent: null
    };

    _export["getModules"] = getModules;
    _export["createComponent"] = Component;
    _export["initLoader"] = initLoader;
    _export["define"] = novaDefine;

    return _export;
})(window, $);
