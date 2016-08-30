define(function (require) {

    var ms = require('mustache');

    return function () {
        var tpl;
        return {
            compile: function (_tpl) {
                ms.parse(_tpl);
                tpl = _tpl;
            },
            render: function (source) {
                return ms.render(tpl, source);
            }
        }
    };
});