var $new_input = $('#new_input'),
    $complete_all = $('#complete_all'),
    $footer = $('#footer');

var todoList = new TodoList();
var todoListView = new TodoListView('#todos_list', {
    onUpdate: function (todo) {
        todoList.update(todo);
        updateFooter();
        updateHeader();
    },
    onRemove: function (id) {
        todoList.remove(id);
        updateFooter();
        updateHeader();
    }
});

//更新顶部全选的相关内容
var updateHeader = function () {
    var all = todoList.getCount();

    $complete_all.toggleClass('hidden', !all);
    $complete_all.find('input')[0].checked = all == todoList.getCompletedCount();
};

//更新footer的统计信息
var updateFooter = function () {
    var all = todoList.getCount(),
        complete = todoList.getCompletedCount(),
        unComplete = all - complete;

    //一个待办项都没有时隐藏footer
    $footer.toggleClass('hidden', !all);

    //显示已完成和未完成的统计信息
    //已完成数量为0时不显示清除已完成的按钮
    $footer.find('.uncomplete_count').text(unComplete).end()
        .find('.complete_count').text(complete).closest('.btn-clear-all').toggleClass('hidden', !complete);
};

todoListView.render(todoList.data());
updateFooter();
updateHeader();

//注册新待办的事件回调
$new_input.focus().on('keypress', function (e) {
    if (e.which == 13) {
        //添加新的todo
        var new_todo = todoList.add({text: $.trim(this.value)});
        todoListView.add(new_todo);
        updateFooter();
        updateHeader();

        $new_input.focus().val('');
    }
});

//注册全选相关的事件回调
$complete_all.find('input').on('change', function (e) {
    //批量更新数据
    todoList.toggleAll(this.checked);

    //清除dom
    todoListView.clear();

    //重新渲染
    todoListView.render(todoList.data());

    updateFooter();
});

//注册清除全部相关的事件回调
$footer.on('click', '.btn-clear-all', function (e) {
    e.preventDefault();

    //清除数据
    todoList.clearCompleted();

    //清除dom
    todoListView.clear();

    //重新渲染
    todoListView.render(todoList.data());

    updateFooter();
    updateHeader();
});