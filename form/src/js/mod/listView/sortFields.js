define(function (require) {

    var isArray = function (arr) {
        return Object.prototype.toString.call(arr) == '[object Array]';
    };

    //简单状态机，定义排序方式的变换规则
    //升序-》降序
    //降序-》不排序
    //不排序-》升序
    var SORT_STATES = {
        'asc': 'desc',
        'desc': 'no',
        'no': 'asc'
    };

    var SortFields = function (config) {
        /**
         * [{ field: 'name', value: '', order: 1, type: 'string'}]
         * value: desc|asc
         */

        var ret = {},
            sortBy = function (a, b) {
                return a.order - b.order;
            },
            sorting = false,
            getFieldDef = function (fieldName) {
                //得到特定排序字段的定义
                return config.filter(function (def) {
                    return def.field === fieldName;
                })[0];
            },
            currentState = [],//存放当前的排序字段
            addToCurrent = function (fieldDef) {
                if (fieldDef.value !== 'no') {
                    currentState.push(fieldDef);
                }
            },
            isExistsInCurrent = function (fieldName) {
                return (config.filter(function (def) {
                        return def.field === fieldName;
                    }).length) > 0;
            },
            _bakup = {},
            backup = function () {
                config.forEach(function (def) {
                    _bakup[def.field] = def.value;
                });
            },
            clear = function () {
                config.forEach(function (def) {
                    def.value = 'no';
                });
            };

        //初始化
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

            addToCurrent(def);
        });
        currentState.sort(sortBy);

        console.dir(JSON.stringify(currentState));

        //添加实例方法
        $.extend(ret, {
            getAll: function () {
                return config;
            },
            getCurrent: function () {
                return currentState;
            },
            startSort: function () {
                sorting = true;
                currentState = [];
                //备份上一次的排序状态
                backup();
                //全部设置为未排序
                clear();
            },
            nextState: function (fieldName) {
                //必须先调用了startSort方法才能调用此方法
                if (!sorting) return;

                var def = getFieldDef(fieldName);
                if (!def) return;

                //根据上一个状态找到下一个排序状态
                def.value = SORT_STATES[_bakup[fieldName]];

                //把这个字段放入当前的排序字段数组中
                !isExistsInCurrent(fieldName) && addToCurrent(def);
                console.dir(JSON.stringify(config));
            },
            endSort: function () {
                sorting = false;

                console.dir(JSON.stringify(currentState));
            }
        });

        return ret;
    };

    SortFields.SORT_STATES = SORT_STATES;

    return SortFields;
});