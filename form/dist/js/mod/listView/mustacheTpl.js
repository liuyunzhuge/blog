define(function (require) {
    var TplBase = require('mod/listView/base/tplBase'),
        ms = require('mustache'),
        Class = require('mod/class');

    var MustacheTpl = Class({
        instanceMembers: {
            init: function (_tpl) {
                this.base(_tpl);
            },
            compile: function () {
                ms.parse(this._tpl);
            },
            render: function (source) {
                return ms.render(this._tpl, source);
            }
        },
        extend: TplBase
    });

    return MustacheTpl;
});