define(function (require, exports, module) {

    var $ = require('jquery'),
        searchObj = (function () {
            var url = window.location.href,
                search = url.substring(url.lastIndexOf("?") + 1),
                obj = {},
                reg = /([^?&=]+)=([^?&=]*)/g;

            search.replace(reg, function (rs, $1, $2) {
                var name = decodeURIComponent($1);
                var val = decodeURIComponent($2);
                val = String(val);
                obj[name] = val;
                return rs;
            });
            return obj;
        })(),
        baseUrl = location.protocol + '//' + location.hostname + (location.port == '' ? '' : (':' + location.port)) + '/' + 'blog/form/',
        _getUrl = function (url) {
            return baseUrl + (url || '');
        };

    return {
        getBaseUrl: function () {
            return baseUrl;
        },
        getUrl: _getUrl,
        reload: function (params) {
            var obj = {},
                href = location.href,
                clear = params === false;

            !clear && $.extend(obj, searchObj, params || {});

            var queryString = $.param(obj);

            location.href = href.substring(0, href.indexOf('?') > -1 ? href.indexOf('?') : undefined) + (clear || !queryString ? '' : ('?' + queryString));
        },
        getParam: function (param) {
            return searchObj[param];
        },
        go: function (url) {
            location.href = _getUrl(url);
        }
    }
});