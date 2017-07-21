define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",

    "mxui/dom",
    "dojo/_base/lang",
    "dojo/_base/array"

    ], 
    function (declare, _WidgetBase, dom, lang, Arr) {
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
        _originalValues: [],

        postCreate: function () {
            logger.debug(this.id + ".postCreate"); 
            this._originalValues = {};
        },

        update: function (obj, callback) {
            
            if(obj){
                this._contextObj = obj;
                this._attributes = obj.getAttributes();

                Arr.forEach(this._attributes, function(attribute){
                    this._originalValues[attribute] = this._contextObj.get(attribute);
                }, this)

                this._resetSubscriptions();
            }

            callback && callback();
        },

        uninitialize: function(){

            this._changed = Arr.some(this._attributes, function(attribute){
                return this._contextObj.get(attribute) != this._contextObj.getOriginalValue(attribute);
            },this);

            if(this._changed){
                this._showAlert();
            }
        },

        _resetSubscriptions: function () {
            logger.debug(this.id + "._resetSubscriptions");

            this.unsubscribeAll();

            // if (this._contextObj) {
            //     this.subscribe({
            //         guid: this._contextObj.getGuid(),
            //         callback: lang.hitch(this, this._changeHandler)
            //     });
            // }

            // Arr.forEach(this._attributes, function(attribute){
            //     this.subscribe({
            //         guid: this._contextObj.getGuid(),
            //         attr: attribute,
            //         callback: lang.hitch(this, this._changeHandler)
            //     });
            // }, this)
        },

        _changeHandler: function(){
            this._changed = Arr.some(this._attributes, function(attribute){
                return this._contextObj.get(attribute) != this._originalValues[attribute];
            },this);
        },

        _showAlert: function(){
            logger.debug(this.id + "._showAlert");
            mx.ui.confirmation({
                content: this.message,
                proceed: 'OK',
                cancel: 'Cancel',
                handler: lang.hitch(this, this._clickButton)
            });
        },

        _clickButton: function(){
            logger.debug(this.id + "._clickButton");
            this._contextObj = null; // Do this here, or on callback?
            //this._contextObj.commit();
        }
    })
});

require(["SaveWarning/widget/SaveWarning"]);