nova.define(["nova/controller"], function (controller) {
    'use strict';
    debugger;
    return controller.extends({
        test2: function () {
            console.log("From test2");
        }
    });
});