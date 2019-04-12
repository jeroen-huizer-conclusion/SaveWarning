/* global define, require, mx*/
"use strict";

define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",

    "mxui/dom",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/on"
    ],
    function (declare, _WidgetBase, dom, lang, Arr, domConstruct, style, on) {

    // Declare widget"s prototype.
    return declare("SaveWarning.widget.SaveWarning", [_WidgetBase], {

        //Widget variables
        header: "Warning",
        message: "There are unsaved changes.",
        buttons: [{
            buttonCaption: "OK",
            action: "nothing",
            customAction: "",   // microflowname
            buttonStyle: ""     // Bootstrap styles
        }],

        //Local variable
        _contextObj: null,
        _attributes: [],
        _currentForm: {path: "", location:""},

        update: function (obj, callback) {
            // Reset to the new
            if(obj){
                // Contextobject switched in current window
                if(this._contextObj && this._contextObj.getGuid() != obj.getGuid()){
                    if(Arr.some(this._attributes, this._hasChanged ,this)){
                        this._showAlert();
                    }
                }
                this._contextObj = obj;
                this._attributes = obj.getAttributes();
                this._currentForm = {path: this.mxform.path, location: this.mxform.place};
            }
            if(callback){
                callback();
            }
        },

        uninitialize: function(){
            if(Arr.some(this._attributes, this._hasChanged ,this)){
                this._showAlert();
            }
        },

        _hasChanged: function(attribute){
            var valA = this._contextObj.get(attribute);
            var valB = this._contextObj.getOriginalValue(attribute);

            var typeA = typeof valA;
            var typeB = typeof valB;

            if(typeA !== typeB)
                return true;

            if(lang.isArray(typeA) && lang.isArray(typeB)){
                // Does not work with arrays of non-primitives
                return (valA.length !== valB.length) && Arr.some(typeA, function(el){return valB.indexOf(el) < 0;});
            }

            if(typeA === "object" && valA !== null)
                return (typeof valA.valueOf === "function" && typeof valB.valueOf === "function") && valA.valueOf() !== valB.valueOf();

            return valA !== valB;
        },

        _showAlert: function(){
            // Most of this stuff should be in a template or someting.

            var body = this.ownerDocument.body;

            var modal = domConstruct.create("div", {class: "modal-dialog mx-dialog", style: "z-index : 1002; visibility: hidden"}, body);
            var modalContent = domConstruct.create("div", {class: "modal-content mx-dialog-content"}, modal);
            var modalHeader = domConstruct.create("div", {class: "modal-header mx-dialog-header"}, modalContent);
            var modalBody = domConstruct.create("div", {class: "modal-body mx-dialog-body"}, modalContent);
            var modalFooter = domConstruct.create("div", {class: "modal-footer mx-dialog-footer"}, modalContent);
            var overlay = domConstruct.create("div", {class: "mx-underlay", style: "z-index : 1001"}, body);

            Arr.forEach(["n", "e", "s", "w", "ne", "se", "sw", "nw"], function(pos){
                domConstruct.create("div", {class: "mx-resizer mx-resizer-"+pos, "data-resize-dir": pos, style:"user-select: none;"}, modal);
            });

            domConstruct.create("h4", {innerHTML: this.header}, modalHeader);
            domConstruct.create("p", {innerHTML: this.message}, modalBody);

            Arr.forEach(this.buttons, function(def){

                var button = domConstruct.create("button", {class: "btn btn-"+def.buttonStyle, innerHTML: def.buttonCaption}, modalFooter);

                if(def.action == "commit"){
                    on(button, "click", lang.hitch(this, this._commit, this._contextObj));
                } else if(def.action == "rollback"){
                    on(button, "click", lang.hitch(this, this._rollback, this._contextObj));
                } else if(def.action == "custom"){
                    on(button, "click", lang.hitch(this, this._custom, def.customAction, this._contextObj));
                } else if(def.action == "back"){
                    on(button, "click", lang.hitch(this, this._navigateBack, this._contextObj, this._currentForm));
                } else if(def.action == "nothing"){
                    on(button, "click", lang.hitch(this, this._closePopUp));
                }
            }, this);

            // Reposition window
            var left = body.clientWidth/2 - style.get(modal, "width")/2;
            var top = body.clientHeight/2 - style.get(modal, "height")/2;

            style.set(modal, "left", left +"px");
            style.set(modal, "top", top+"px");
            style.set(modal, "visibility", "visible"); // So we don't see it move..

            // Store for later reference
            this._modal = modal;
            this._overlay = overlay;
        },

        _commit: function(obj){
            mx.data.commit({
                    mxobj: obj,
                    callback: lang.hitch(this, this._closePopUp),
                    error: lang.hitch(this, this._showError),
                    onValidation: lang.hitch(this, this._navigateBack) // Mendix will throw validation messages anyay.
                });
        },

        _rollback: function(obj){
            mx.data.rollback({
                mxobj: obj,
                callback: lang.hitch(this, this._closePopUp),
                error: lang.hitch(this, this._showError)
            });
        },

        _navigateBack: function(obj, form){
            this._closePopUp();
            //mx.ui.back(); // Can be annoying when you current page is same as previous page

            var context= new mendix.lib.MxContext();
            context.setContext(obj.getEntity(), obj.getGuid());

            // Handle any errors? What to do on callback?
            mx.ui.openForm(form.path, {
                    location: form.location,
                    context: context,
                    callback: null
            });
        },

        _custom: function(microflow, obj){
            // Microflow has no idea where call comes from.. (this.mxform)
            mx.data.action({
                    params: {
                        applyto: "selection",
                        actionname: microflow,
                        guids: [obj.getGuid()]
                    },
                    callback: lang.hitch(this, this._closePopUp),
                    error:  lang.hitch(this, this._showError)
                }, this);
        },

        _showError: function(err){
            this._closePopUp();
            if(err.message.indexOf("validation") === -1) // Validation errors are handled elsewhere
                mx.ui.error(err.message, true);
        },

        _closePopUp: function(){
            // Anything to release? Don't think so..
            if(this._modal){
                domConstruct.destroy(this._modal);
                domConstruct.destroy(this._overlay);
            }
        }
    });
});

require(["SaveWarning/widget/SaveWarning"]);
