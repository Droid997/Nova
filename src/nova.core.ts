import $ from './thirdparty/jQuery';
import novaLoader from './nova/nova-loader';

(function (global) {
    if (!global["nova"]) {

        global["nova"] = {};
        global["nova"].jQuery = $;
        global["nova"].define = novaLoader.define;
        global["nova"].modules = novaLoader.getModules;
        global["nova"].createComponent = novaLoader.createComponent;

        let currentScript = document.currentScript;
        let loaderScript = currentScript.dataset["init"] || undefined;
        if (loaderScript) {
            novaLoader.initLoader(loaderScript);
        }



    }

})(window);
