define(function (require) {

    var EventBase = require('mod/eventBase'),
        $ = require('jquery'),
        Class = require('mod/class');

    //简单状态机，定义排序方式的变换规则
    //升序->降序
    //降序->不排序
    //不排序->升序
    var SORT_STATES = {
        'asc': 'desc',
        'desc': 'no',
        'no': 'asc'
    };

    var DEFAULTS = {
            config: [],
            onStateChange: $.noop,
            onSortStart: $.noop,
            onSortEnd: $.noop,
            onSortChange: $.noop,
            onReset: $.noop,
            onInit: $.noop
        },
        isArray = function (arr) {
            return Object.prototype.toString.call(arr) == '[object Array]';
        },
        getDefFrom = function (target, fieldName) {
            return target.filter(function (def) {
                return def.field === fieldName;
            })[0];
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

                if (typeof(opts.onStateChange) === 'function') {
                    this.on('sortStateChange' + this.namespace, $.proxy(opts.onStateChange, this));
                }

                if (typeof(opts.onSortStart) === 'function') {
                    this.on('sortStart' + this.namespace, $.proxy(opts.onSortStart, this));
                }

                if (typeof(opts.onSortEnd) === 'function') {
                    this.on('sortEnd' + this.namespace, $.proxy(opts.onSortEnd, this));
                }

                if (typeof(opts.onInit) === 'function') {
                    this.on('sortInit' + this.namespace, $.proxy(opts.onInit, this));
                }

                if (typeof(opts.onReset) === 'function') {
                    this.on('sortReset' + this.namespace, $.proxy(opts.onReset, this));
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

                //保存初始时的排序状态
                this.initConfig = $.extend(true, [], this.config);

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
                return $.extend(true, [], this.config);
            },
            getValue: function () {
                return this.getConfig().filter(function (def) {
                    return def.value !== 'no';
                }).sort(sortByOrder);
            },
            reset: function () {
                this.config = $.extend(true, [], this.initConfig);

                this.trigger('sortReset' + this.namespace);
            },
            _saveConfig: function () {
                //深拷贝
                this.lastConfig = $.extend(true, [], this.config);
            },
            _clear: function () {
                this.config.forEach(function (def) {
                    def.value = 'no';
                    def.order = 0;
                });
            },
            changeState: function (fieldName, multiple) {
                var curDef = getDefFrom(this.config, fieldName);
                if (!curDef) return;

                var firstSortField = !this.sorting;

                if (!this.sorting) {
                    //先把当前的状态记录下来，以便在endSort里面跟操作后的状态进行比较
                    this._saveConfig();
                    //每次排序操作开始，先清除掉当前的排序状态
                    this._clear();
                    //定义一个变量用来管理字段的顺序
                    this.sortIndex = 1;
                    this.sorting = true;

                    this.trigger('sortStart' + this.namespace);
                }

                //只有在一次排序操作过程中第一个调用此方法的字段，才从lastConfig中取上次的排序状态
                //来计算当前的排序状态
                if (firstSortField) {
                    curDef.value = SORT_STATES[getDefFrom(this.lastConfig, fieldName).value];
                } else {
                    curDef.value = SORT_STATES[curDef.value];
                }

                if (!curDef.order) {
                    curDef.order = this.sortIndex;
                }

                this.sortIndex = this.sortIndex + 1;

                this.trigger('sortStateChange' + this.namespace, {
                    field: curDef.field,
                    value: curDef.value
                });

                if (!multiple) {
                    this.endSort();
                }
            },
            endSort: function () {
                if (!this.sorting) return;

                this.sorting = false;

                var oldState = [];
                this.lastConfig.sort(sortByOrder).forEach(function (def) {
                    if (def.value !== 'no') {
                        oldState.push({
                            field: def.field,
                            value: def.value
                        });
                    }
                });

                var newState = [];
                this.config.sort(sortByOrder).forEach(function (def) {
                    if (def.value !== 'no') {
                        newState.push({
                            field: def.field,
                            value: def.value
                        });
                    }
                });

                //仅在排序发生变化的时候才触发事件
                //排序变化依赖于排序不为no的字段个数，以及字段的顺序
                if (JSON.stringify(oldState) !== JSON.stringify(newState)) {
                    this.trigger('sortChange' + this.namespace);
                }

                this.trigger('sortEnd' + this.namespace);
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