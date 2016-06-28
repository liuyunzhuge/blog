var TodoList = function () {
    var local = Storage.local,
        KEY = 'todoList',
        data = local.get(KEY),
        save = function () {
            local.put(KEY, data);
        },
        nextId = function () {
            if (data.length) {
                return data[data.length - 1].id + 1;
            }
            return 1;
        },
        initData = function () {
            data = [];
            save();
        };

    //初始化
    !data && initData();

    return {
        //新增一个
        add: function (todo) {
            todo.id = nextId();
            todo.complete = false;
            data.push(todo);
            save();

            return todo;
        },
        //按id查找
        find: function (id) {
            var ret;
            data.forEach(function (todo) {
                if (!ret && todo.id == (~~id)) {
                    ret = todo;
                }
            });
            return ret;
        },
        //查找位置
        findIndex: function (id) {
            var ret;
            data.forEach(function (todo, index) {
                if (!ret && todo.id == (~~id)) {
                    ret = index;
                }
            });
            return ret;
        },
        //更新一个
        update: function (todo) {
            if (!todo.id) return;

            var dbTodo = this.find(todo.id);
            dbTodo && $.extend(dbTodo, todo);
            save();
        },
        //删除
        remove: function (id) {
            var remIndex = this.findIndex(id);
            if (remIndex !== undefined) {
                data.splice(remIndex, 1);
                save();
            }
        },
        //重置
        clear: function () {
            initData();
        },
        //清除已经完成的
        clearCompleted: function () {
            data = data.filter(function (todo) {
                return !todo.complete;
            });
            save();
        },
        //批量设置完成状态
        toggleAll: function (complete) {
            data.forEach(function (todo) {
                todo.complete = !!complete;
            });
            save();
        },
        data: function () {
            return data;
        },
        getCount: function () {
            return data.length;
        },
        getCompletedCount: function () {
            return data.filter(function (todo) {
                return todo.complete;
            }).length;
        }
    }
};