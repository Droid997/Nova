import jQuery from '../thirdparty/jQuery';
import { Module, ModuleState } from '../nova/module'

function ensureStacktrace(error: Error) {
    throw error;
}

export function loadSyncXHR(oModule: Module) {
    var xhr = new XMLHttpRequest();

    oModule.state = ModuleState.LOADING;
    function enrichXHRError(error) {
        error = error || ensureStacktrace(new Error(xhr.status + " - " + xhr.statusText));
        error.status = xhr.status;
        error.statusText = xhr.statusText;
        error.loadError = true;
        return error;
    }

    xhr.addEventListener('load', function (e) {
        // File protocol (file://) always has status code 0
        if (xhr.status === 200 || xhr.status === 0) {
            oModule.state = ModuleState.LOADED;
            oModule.data = xhr.responseText;

        } else {
            oModule.error = enrichXHRError(e);
        }
    });
    // Note: according to whatwg spec, error event doesn't fire for sync send(), instead an error is thrown
    // we register a handler, in case a browser doesn't follow the spec
    xhr.addEventListener('error', function (e) {
        oModule.state = ModuleState.FAILED;
        oModule.error = enrichXHRError(e);
    });

    xhr.open('GET', oModule.url, false);

    try {
        xhr.send();
    } catch (error) {
        oModule.error = enrichXHRError(error);
    }
}

export function mAJAXLoader(module: Module, success: Function, error?: Function,aysnc: boolean = true,type:string="text" ) {
    let url = module.url;
    module.state = ModuleState.LOADING;
    jQuery.ajax({
        url: url,
        dataType: type,
        async: aysnc,
        success: function (result) {
            module.state = ModuleState.LOADED;
            module.data = result;
            success(arguments[0]);
        },
        error: function () {
            if (error) {
                module.error = error
                error(arguments[2]);
            }
        },
        cache: true
    });
}

export function AJAXLoader(url: string, type: string, success: Function, error?: Function, aysnc: boolean = true) {
    jQuery.ajax({
        url: url,
        dataType: type,
        async: aysnc,
        success: function () {
            success(arguments[0]);
        },
        error: function () {
            if (error)
                error(arguments[2]);
        },
        cache: true
    });
}