define(function (require) {
    var Class = require('mod/class');

    var TplBase = Class({
        instanceMembers: {
            init: function (_tpl, compileNow) {
                this._tpl = _tpl;

                if(compileNow !== false) {
                    this.compile();
                }
            },
            compile: function () {
                //待子类实现
            },
            render: function (source) {
                //待子类实现
            }
        }
    });

    return TplBase;
});