define(function () {
    var searchObj = (function () {
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
        baseUrl = location.protocol + '//' + location.hostname + (location.port == '' ? '' : (':' + location.port)) + '@@CONTEXT_PATH/',
        _getUrl = function (url) {
            return baseUrl + (url || '');
        };

    return {
        getBaseUrl: function () {
            return baseUrl;
        },
        getUrl: _getUrl,
        getParam: function (param) {
            return searchObj[param];
        },
        go: function (url) {
            location.href = _getUrl(url);
        }
    }
});