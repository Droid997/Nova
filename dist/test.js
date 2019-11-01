nova.define(["nova/controller","./test2"], function (controller,test2) {
    'use strict';
    debugger;
    return test2.extends({
        test: function () {
            console.log("From test1");
        }
    });
});