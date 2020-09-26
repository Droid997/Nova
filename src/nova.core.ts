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
        const loaderScript = currentScript.dataset["init"] || undefined;
        const maniestPath=currentScript.dataset["manifest"] || undefined;
        if (loaderScript) {
            novaLoader.initLoader(loaderScript,maniestPath);
        }else{
            throw new Error("data-init tag is missing ")
        }



    }

})(window);
