//构建Todo类
var Todo = Backbone.Model.extend({
    defaults: function () {
        return {
            text: '',
            complete: false
        }
    },
    localStorage: new Backbone.LocalStorage('todo'),
    toggle: function () {
        //1. 只有后台更新成功了才触发change事件
        //2. 将异步对象返回，方便view层做交互
        return this.save('complete', !this.get('complete'), {wait: true});
    }
});

//构建TodoView
var TodoView = Backbone.View.extend({
    tagName: 'li',
    template: (function () {
        var t = $('#todo_view_tpl').html();
        Mustache.parse(t);
        return t;
    })(),
    events: {
        'change .chk_complete': 'toggle',
        'dblclick': 'enterEdit',
        'keypress .edit_input': 'endEdit',
        'blur .edit_input': 'endEdit',
        'click .remove': 'clear'
    },
    initialize: function () {
        this.listenTo(this.model, 'change', this.render);
        this.listenTo(this.model, 'destroy', this.remove);
    },
    render: function () {
        if (!this.model) return;
        this.$el.html(Mustache.render(this.template, this.model.toJSON()))
            .toggleClass('complete', this.model.get('complete'))
            .data('id', this.model.id);
        this.$input = this.$el.find('.edit_input');
        return this;
    },
    enterEdit: function (e) {
        this.$el.addClass('edit');
        this.$input.focus();
    },
    toggle: function (e) {
        var async = this.model.toggle();
        async && async.done(function () {
            alert('修改成功！');
        });
    },
    endEdit: function (e) {
        if (e.type == 'keypress' && e.which != 13) return;
        this.$el.removeClass('edit');

        var value = $.trim(this.$input.val());

        if (value) {
            var async = this.model.save({text: value}, {wait: true});
            async && async.done(function () {
                alert('修改成功！');
            });
        } else {
            this.clear();
        }
    },
    clear: function (e) {
        var async = this.model.destroy({wait: true});
        async && async.done(function () {
            alert('删除成功！');
        });
    }
});

//注册新待办的事件回调
var $new_input = $('#new_input').focus().on('keypress', function (e) {
    var value = $.trim(this.value);
    if (e.which == 13 && value) {
        //添加新的todo
        var tv = new TodoView({
            model: new Todo({
                text: value
            })
        });

        $('#todos_list').append(tv.render().el);

        $new_input.focus().val('');
    }
});