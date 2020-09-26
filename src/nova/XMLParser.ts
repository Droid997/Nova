import { Logger, mComponentPaths, getModule } from "./nova-loader";
import { Module, execModule } from './module';
import { mAJAXLoader } from '../util/ajax';
import jQuery from '../thirdparty/jQuery';
import { Component } from './component';

enum NODETYPE {
    ELEMENT_NODE = 1,//An Element node like <p> or <div>.
    TEXT_NODE = 3,//The actual Text inside an Element or Attr.
    CDATA_SECTION_NODE = 4,//A CDATASection, such as <!CDATA[[ … ]]>.
    PROCESSING_INSTRUCTION_NODE = 7,//A ProcessingInstruction of an XML document, such as <?xml-stylesheet … ?>.
    COMMENT_NODE = 8,//A Comment node, such as <!-- … -->.
    DOCUMENT_NODE = 9,//A Document node.
    DOCUMENT_TYPE_NODE = 10,//A DocumentType node, such as <!DOCTYPE html>.
    DOCUMENT_FRAGMENT_NODE = 11,//A DocumentFragment node.
    ATTRIBUTE_NODE = 2,//An Attribute of an Element
}

export class parseXML {
    private mnameSpaces = {};
    private mComponentName: string;
    private mComponentPath: string;
    private controllerLoaded: boolean = false;
    private controllerModule: Module;
    private melementCount = 0;
    private viewDOM;
    
    constructor(module: Module) {
        try {
            const oThis = this;
            var DefaultNameSpace = false;
            // contains the xml document  
            var dom = module.data;
            this.mComponentName = module["componentName"];
            this.mComponentPath = mComponentPaths[this.mComponentName];
            // xml attributes of the document
            var rootattributes = dom.documentElement.attributes;
            // parse xml attributes
            Object.keys(rootattributes).forEach(function (key) {
                var element = rootattributes[key];
                if (element.nodeName.includes("xmlns")) {
                    if (element.nodeName === "xmlns")
                        DefaultNameSpace = true;

                    oThis.mnameSpaces[element.nodeValue] = element.nodeName;
                }
            });


            if (!DefaultNameSpace)
                Logger.error("Error Creating component '" + this.mComponentName + "' Default Namespace not present in xml");
            else if (!this.mnameSpaces["http://www.w3.org/1999/xhtml"])
                Logger.warning("Default Namespace should be 'http://www.w3.org/1999/xhtml'" + " but found " + this.mnameSpaces["xmlns"]);
            else {

                // creates a new div element with id as component name
                this.viewDOM = document.createElement("div");
                this.viewDOM.setAttribute("id", module["componentName"]);

                var xmlContent = dom.documentElement;

                const nodename = xmlContent.nodeName.split(":")[1];

                if (nodename === "component" || nodename === "Component") {
                    for (var i = 0; i < xmlContent.children.length; i++) {
                        this.viewDOM.appendChild(this.parseNode(xmlContent.children[i]));
                    }
                } else {
                    this.enrichError(nodename + " unexpected type, expected 'component' ");
                }
            }

            Logger.debug("Parsed");
        } catch (error) {
            Logger.error(error);
        }
    }

    public getContent() {
        return this.viewDOM;
    }

    private parseNode(Node: any) {
        var element;

        if (Node.nodeType === NODETYPE.ELEMENT_NODE && Node.namespaceURI === "http://www.w3.org/1999/xhtml") {
            element = document.createElement(Node.tagName);
            this.bindAttributes(Node, element);
            if (Node.children.length === 0) {
                element.innerHTML = Node.innerHTML;
                return element;
            } else {
                for (var i = 0; i < Node.children.length; i++) {
                    element.appendChild(this.parseNode(Node.children[i]));
                }
                return element;
            }
        } else if (Node.nodeType === NODETYPE.ELEMENT_NODE && Node.namespaceURI === "nova.component") {
            var componentName = Node.getAttribute('componentName');
            if (componentName) {
                element = document.createElement("div");
                element.id = this.mComponentName + "--element" + this.getElementCount();
                new Component(componentName);
                var componentpath = mComponentPaths[componentName];
                var modulePath = componentpath + componentName + ".xml";
                var innerModule = getModule(modulePath);
                element.appendChild(innerModule.content);
                return element;
            } else {
                Logger.error("componentName attribute not found");
            }
        }
    }

    private bindAttributes(Node, element) {
        let idFlag = false;

        // Attribute Parser
        Object.values(Node.attributes).forEach((attribute) => {
            const attributeName: string = attribute["name"];
            const attributeValue = attribute["nodeValue"];
            if (attributeName === "id")
                idFlag = attributeValue;
            else {
                let eventName = 'on' + attributeName.toLowerCase();

                if (eventName in Node) {
                    if (!this.controllerLoaded) {

                        const controllerName = this.mComponentPath.substr(0, this.mComponentPath.indexOf("/"));
                        this.controllerModule = getModule(this.mComponentPath + controllerName, true/*Normalize*/);

                        this.loadControllerModule(this.controllerModule);
                        this.controllerLoaded = true;
                    }
                    this.bindEvent(element, attributeName, attributeValue);
                } else
                    jQuery(element).attr(attributeName, attributeValue);
            }
        });

        if (idFlag)
            element.id = idFlag;
        else
            element.id = this.mComponentName + "--element" + this.getElementCount();
    }

    private bindEvent(element, eventName, listner) {
        jQuery(element).bind(eventName, this.controllerModule.content[listner]);
    }

    private loadControllerModule(cModule: Module) {
        mAJAXLoader(cModule, function () {
            execModule(cModule);
            Logger.debug("Controller Module " + cModule.name() + " loaded");
        }, function (error) {
            Logger.error(error);
        }, false);
    }

    private getElementCount() {
        return this.melementCount++;
    }

    private enrichError(message) {
        Logger.error(message + " in component " + this.mComponentName);
    }
}











