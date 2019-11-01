
import jQuery from '../thirdparty/jQuery';
import { Module } from './module';
import { Logger } from './nova-loader';

export default abstract class Base {
    protected domId;
    protected mView: Module;

    extends(object: Object) {
        return jQuery.extend(this, object);
    }

    public placeAt(domId): void {
        const element = document.getElementById(domId);
        if (!!element)
            element.appendChild(this.mView.content);
        else
            Logger.error("Element with id " + domId + " not found");
    }
} 