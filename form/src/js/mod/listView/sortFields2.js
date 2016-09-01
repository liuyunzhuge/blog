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
        //config
        /**
         * [{
         *     field: 'name',
         *     value: '', // 'desc' | 'asc' | ''
         *     order: 1,
         *     type: 'string'
         * }]
         */

        var obj = {
                fields: {}
            },
        //对排序字段的定义对象进行排序，以便给外部提供有先后顺序的排序字段
            sortBy = function (a, b) {
                return a.order - b.order;
            },
        //得到排序字段的定义对象
            getFieldDef = function (fieldName) {
                return config.filter(function (def) {
                    return def.field === fieldName;
                })[0];
            },
        //存放当前的排序字段
            currentState = [];

        //定义单个字段的排序管理对象
        var createStateIterator = function (fieldName, state) {
            if (!fieldName) return;

            //初始化时字段的排序状态
            if (!state) {
                state = 'no';
            }

            return {
                nextState: function () {

                    //根据当前状态得到下一个状态
                    state = SORT_STATES[state];

                    var fieldDef = getFieldDef(fieldName);

                    var cur = state;

                    if (cur == 'no') {
                        cur = '';
                    }

                    //更新该字段的排序状态
                    fieldDef.value = cur;

                    if (cur) {
                        currentState.push(fieldDef);
                    }
                }
            }
        };

        if (!isArray(config)) {
            config = [];
        }

        //解析config
        config.forEach(function (def) {
            if (!def.field) {
                return;
            }

            if (def.value !== 'desc' && def.value !== 'asc') {
                def.value = '';
            }

            var order = parseInt(def.order);

            if (isNaN(order)) {
                order = 0;
            }

            def.order = order;

            def.type = (def.type + '') || 'string';

            obj.fields[def.field] = createStateIterator(def.field, def.value);

            if (def.value) {
                currentState.push(def);
            }
        });

        currentState.sort(sortBy);

        $.extend(obj, {
            getCurrent: function () {
                return currentState;
            },
            changeStart: function () {
                currentState = [];
            },
            changeEnd: function () {

            }
        });

        return obj;
    };

    SortFields.SORT_STATES = SORT_STATES;

    return SortFields;
});