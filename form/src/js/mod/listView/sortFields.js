define(function (require) {

    var EventBase = require('mod/eventBase'),
        $ = require('jquery'),
        Class = require('mod/class');

    //简单状态机，定义排序方式的变换规则
    //升序-》降序
    //降序-》不排序
    //不排序-》升序
    var SORT_STATES = {
        'asc': 'desc',
        'desc': 'no',
        'no': 'asc'
    };

    var DEFAULTS = {
            config: [],
            onSortChange: $.noop,
            onInit: $.noop
        },
        isArray = function (arr) {
            return Object.prototype.toString.call(arr) == '[object Array]';
        },
        sortByOrder = function (a, b) {
            return a.order - b.order;
        };

    var SortFields = Class({
        instanceMembers: {
            init: function (options) {
                var opts = this.options = this.getOptions(options);
                //初始化，注册事件管理的功能：EventBase
                this.base();

                //设置数据属性名称命名空间名称
                this.dataAttr = this.constructor.dataAttr;
                this.namespace = '.' + this.dataAttr;

                //注册事件
                if (typeof(opts.onSortChange) === 'function') {
                    this.on('sortChange' + this.namespace, $.proxy(opts.onSortChange, this));
                }

                if (typeof(opts.onInit) === 'function') {
                    this.on('sortInit' + this.namespace, $.proxy(opts.onInit, this));
                }

                //解析config
                var config = this.config = opts.config;
                if (!isArray(config)) {
                    config = [];
                }
                config.forEach(function (def) {
                    if (!def.field) {
                        return;
                    }

                    if (def.value !== 'desc' && def.value !== 'asc') {
                        def.value = 'no';
                    }

                    var order = parseInt(def.order);

                    if (isNaN(order)) {
                        order = 0;
                    }

                    def.order = order;

                    def.type = (def.type || 'string') + '';
                });
                config.sort(sortByOrder);

                this.trigger('sortInit' + this.namespace);
            },
            getOptions: function (options) {
                var defaults = this.getDefaults(),
                    _opts = $.extend({}, defaults, options),
                    opts = {};

                //保证返回的对象内容项始终与当前类定义的DEFAULTS的内容项保持一致
                for (var i in defaults) {
                    if (Object.prototype.hasOwnProperty.call(defaults, i)) {
                        opts[i] = _opts[i];
                    }
                }

                return opts;
            },
            getDefaults: function () {
                return this.constructor.DEFAULTS;
            },
            getConfig: function () {
                return this.config;
            },
            changeState: function (fieldName) {

            }
        },
        extend: EventBase,
        staticMembers: {
            SORT_STATES: SORT_STATES,
            DEFAULTS: DEFAULTS,
            dataAttr: 'sortFields'
        }
    });

    return SortFields;
});