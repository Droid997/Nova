import { mComponentPaths, oCurrentExecutingScripts, mModules } from './nova-loader';
import { Module, ModuleState } from './module';
import { parseXML } from './XMLParser';
import { Logger, getModule } from "./nova-loader";
import { mAJAXLoader } from '../util/ajax';
import Base from './baseExtender';
import { throws } from 'assert';



// var mcontroller;

function intializeComponent(vModule) {
    var thiz = this;
    mAJAXLoader(vModule, function () {
        // parse the XML and connect the controller
        const parser = new parseXML(vModule);
        vModule.content = parser.getContent();
    }, function (error) {
        Logger.error(error);
    }, false, 'xml');
}

export class Component extends Base {
    // private mView: Module;
    private componentName;

    constructor(component_name: string) {
        super();
        let componentPath = mComponentPaths[component_name];
        if (componentPath) {
            this.componentName = component_name;
            let viewName =`${component_name}.xml`;

            // let viewName = componentPath.substr(0, componentPath.indexOf("/")) + ".xml";
            // let viewName=componentPath.endsWith("/")==true?componentPath.substring(0,componentPath.length-1):componentPath;
            // viewName+=".xml";
            this.mView = getModule(componentPath + viewName, false/*Normalize*/);

            this.mView["componentName"] = component_name;

            intializeComponent.call(this, this.mView);

        } else {
            Logger.error("Component with name " + component_name + " Not Registered, Register in manifest.json file");
        }

    }


    

}