var TodoListView = function (element, options) {
    var defaults = {
            onRemove: $.noop,
            onUpdate: $.noop
        },
        opts = $.extend({}, defaults, options),
        $element = $(element),
        renderItem = function (todo) {
            return ['<li data-id="',
                todo.id,
                '" class="',
                todo.complete ? 'complete' : '', '">',
                '    <label>',
                '        <input type="checkbox" class="chk_complete" ',
                todo.complete ? 'checked' : '',
                '>',
                '    </label>',
                '    <span class="todo_text">',
                todo.text,
                '</span>',
                '    <a href="javascript:;" class="remove pull-right"><span class="glyphicon glyphicon-remove"></span></a>',
                '    <input class="form-control edit_input" type="text" value="',
                todo.text,
                '">',
                '</li>'].join("");
        };

    //注册事件
    //因为后面有清空DOM的操作，所以事件都采用委托方式注册
    $element.on('change', '.chk_complete', function (e) {//单个完成
        var $target = $(e.currentTarget),
            $parent = $target.closest('li');

        //修改样式
        $parent.toggleClass('complete', $target[0].checked);

        //通知外部修改数据
        opts.onUpdate({
            id: $parent.data('id'),
            complete: $target[0].checked
        });
    }).on('click', '.remove', function (e) {//单个清除
        e.preventDefault();

        var $target = $(e.currentTarget),
            $parent = $target.closest('li'),
            id = $parent.data('id');

        //删除dom
        $parent.remove();

        //通知外部删除数据
        opts.onRemove(id);
    }).on('dblclick', 'li', function (e) {//双击进入修改模式
        var $li = $(e.currentTarget);
        $li.addClass('edit');
        setTimeout(function(){
            $li.find('.edit_input').focus();
        },0);
    }).on('blur keypress', '.edit_input', function(e){//修改生效
        var $target = $(e.currentTarget),
            $parent = $target.closest('li'),
            id = $parent.data('id');

        if(e.type == 'keypress' && e.which != 13) return;

        var value = $.trim($target.val());

        //修改样式及文本
        $parent.removeClass('edit').find('.todo_text').text(value);

        //通知外部修改数据
        opts.onUpdate({
            id: id,
            text: value
        });
    });

    return {
        clear: function () {
            $element.html('')
        },
        render: function (data) {
            var html = [];
            if (data) {
                data.forEach(function (todo) {
                    html.push(renderItem(todo));
                })
            }
            $element.html(html.join(''));
        },
        add: function (todo) {
            $element.append(renderItem(todo));
        }
    }
};
