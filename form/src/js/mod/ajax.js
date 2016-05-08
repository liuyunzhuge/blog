define(function (require, exports, module) {
    var $ = require('jquery');

    function create(_url, _method, _data, _async, _dataType) {
        //添加随机数
        if (_url.indexOf('?') > -1) {
            _url = _url + '&rnd=' + Math.random();
        } else {
            _url = _url + '?rnd=' + Math.random();
        }

        //为请求添加ajax标识，方便后台区分ajax和非ajax请求
        _url += '&_ajax=1';

        return $.ajax({
            url: _url,
            dataType: _dataType,
            async: _async,
            method: typeof DEVELOP_MODE != 'undefined' && DEVELOP_MODE == 'true' ? 'get' : _method,
            data: _data
        });
    }

    var ajax = {},
        methods = [
            {
                name: 'html',
                method: 'get',
                async: true,
                dataType: 'html'
            },
            {
                name: 'get',
                method: 'get',
                async: true,
                dataType: 'json'
            },
            {
                name: 'post',
                method: 'post',
                async: true,
                dataType: 'json'
            },
            {
                name: 'syncGet',
                method: 'get',
                async: false,
                dataType: 'json'
            },
            {
                name: 'syncPost',
                method: 'post',
                async: false,
                dataType: 'json'
            }
        ];

    for (var i = 0, l = methods.length; i < l; i++) {
        ajax[methods[i].name] = (function (i) {
            return function () {
                var _url = arguments[0],
                    _data = arguments[1],
                    _dataType = arguments[2] || methods[i].dataType;

                return create(_url, methods[i].method, _data, methods[i].async, _dataType);
            }
        })(i);
    }

    return ajax;
});