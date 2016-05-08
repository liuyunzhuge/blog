define(function (require, exports, module) {
    var $ = require('jquery'),
        Class = require('mod/class');


    /**
     * 这个基类可以让普通的类具备jquery对象的事件管理能力
     */
    var EventBase = Class({
        instanceMembers: {
            init: function (_jqObject) {
                this._jqObject = _jqObject && _jqObject instanceof $ && _jqObject || $({});
            },
            destroy: function(){
                this._jqObject.off();
                this._jqObject = undefined;
            }
        }
    });

    //通过统一的代理，添加on, one, off, trigger这几个原型方法
    ['on', 'one', 'off', 'trigger'].forEach(function (method) {
        EventBase.prototype[method] = function () {
            return $.fn[method].apply(this._jqObject, arguments);
        }
    });

    return EventBase;
});