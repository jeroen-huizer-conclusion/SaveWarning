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
    "use strict";

    // Declare widget"s prototype.
    return declare("SaveWarning.widget.SaveWarning", [_WidgetBase], {

        //Widget variables
        inputAttribute: null,       
        entity: '',                 // entityname
        parent: '',                 // association to parent

        //Local variable
        _contextObj: null,          // the context
        _attributes: [],
        // _originalValues: [],

        postCreate: function () {
            logger.debug(this.id + ".postCreate"); 
            this._originalValues = {};
        },

        update: function (obj, callback) {
            
            if(obj){
                this._contextObj = obj;
                this._attributes = obj.getAttributes();

                // Arr.forEach(this._attributes, function(attribute){
                //     this._originalValues[attribute] = this._contextObj.get(attribute);
                // }, this)

                this._resetSubscriptions();
            }

            callback && callback();
        },

        uninitialize: function(){

            this._changed = Arr.some(this._attributes, this._hasChanged ,this);

            if(this._changed){
                this._showAlert();
            } else{
                this._resetSubscriptions();
            }
        },

        _hasChanged: function(attribute){
            var valA = this._contextObj.get(attribute);
            var valB = this._contextObj.getOriginalValue(attribute);

            var typeA = typeof valA
            var typeB = typeof valB;

            if(typeA !== typeB)
                return true;

            if(lang.isArray(typeA) && lang.isArray(typeB)){
                // Does not work with arrays of non-primitives
                return (valA.length !== valB.length) &&
                    Arr.some(typeA, function(el){return valB.indexOf(el) < 0}) 
            }

            if(typeA === "object")
                return (typeof valA.valueOf === "function" && typeof valB.valueOf === "function") 
                    && valA.valueOf() !== valB.valueOf();

            return valA !== valB;
        },

        _resetSubscriptions: function () {
            logger.debug(this.id + "._resetSubscriptions");
            this.unsubscribeAll();
        },

        _showAlert: function(){
            // Put this in a template

            var body = this.ownerDocument.body;

            var modal = domConstruct.create("div", {class: "modal-dialog mx-dialog", style: "z-index : 1002; visibility: hidden"}, body);
            var modalContent = domConstruct.create("div", {class: "modal-content mx-dialog-content"}, modal)
            var modalHeader = domConstruct.create("div", {class: "modal-header mx-dialog-header"}, modalContent);
            var modalBody = domConstruct.create("div", {class: "modal-body mx-dialog-body"}, modalContent);
            var modalFooter = domConstruct.create("div", {class: "modal-footer mx-dialog-footer"}, modalContent);
            var overlay = domConstruct.create("div", {class: "mx-underlay", style: "z-index : 1001"}, body);

            Arr.forEach(["n", "e", "s", "w", "ne", "se", "sw", "nw"], function(pos){
                domConstruct.create("div", {class: "mx-resizer mx-resizer-"+pos, "data-resize-dir": pos, style:"user-select: none;"}, modal);
            });
            
            domConstruct.create("h4", {innerHTML: this.header}, modalHeader);
            domConstruct.create("p", {innerHTML: this.message}, modalBody);

            Arr.forEach(this.buttons, function(butDef){

                var button = domConstruct.create("button", 
                                    {   class: "btn btn-"+butDef.buttonStyle, 
                                        innerHTML: butDef.buttonCaption}, modalFooter);

                if(butDef.action == "commit"){
                    on(button, "click", lang.hitch(this, this._commit));
                } else if(butDef.action == "rollback"){
                    on(button, "click", lang.hitch(this, this._rollback));
                } else if(butDef.action == "custom"){
                    on(button, "click", lang.hitch(this, this._custom, butDef.customAction));
                } else if(butDef.action == "back"){
                    on(button, "click", lang.hitch(this, this._navigateBack));
                }
            }, this);

            // Reposition window
            var left = body.clientWidth/2 - style.get(modal, "width")/2;
            var top = body.clientHeight/2 - style.get(modal, "height")/2;

            style.set(modal, "left", left +"px");
            style.set(modal, "top", top+"px");
            style.set(modal, "visibility", "visible");

            // Store for later reference
            this._modal = modal;
            this._overlay = overlay;
        },

        _commit: function(){
            mx.data.commit({
                    mxobj: this._contextObj,
                    callback: lang.hitch(this, this._closePopUp),
                    error: lang.hitch(this, this._showError),
                    onValidation: lang.hitch(this, this._handleValidation)
                });            
        },

        _rollback: function(){
            mx.data.rollback({
                mxobj: this._contextObj,
                callback: lang.hitch(this, this._closePopUp),
                error: lang.hitch(this, this._showError)
            });
        },

        _navigateBack: function(){
            this._closePopUp();
            mx.ui.back(); // Can be annoying when you current page is same as previous page
        },

        _custom: function(microflow){
            mx.data.action({
                    params: {
                        applyto: "selection",
                        actionname: microflow,
                        guids: [this._contextObj.getGuid()]
                    },
                    callback: lang.hitch(this, this._closePopUp),
                    error:  lang.hitch(this, this._showError)
                }, this);
        },

        _closePopUp: function(){
            // Anything to release? Don't think so..
            if(this._modal){
                this._modal.remove();
                this._overlay.remove();
            }
        },

        _showError: function(err){
            this._closePopUp();
            if(err.message.indexOf("validation") === -1) // Validation errors are handled elsewhere
                mx.ui.error(err.message, true);
        },

        _handleValidation: function(validations) {           
            this._navigateBack(); // Go back to the form that we tried to commit

            // Mendix throws a similar error by itself ???
            // var val = validations[0];
            // Arr.forEach(this._attributes, function(attribute){
            //     var msg = val.getReasonByAttribute(this._refAttribute);
            //     if (msg) {
            //         mx.ui.error(msg, true);
            //         val.removeAttribute(this._refAttribute);
            //     }
            // }, this);
        }
    })
});

require(["SaveWarning/widget/SaveWarning"]);