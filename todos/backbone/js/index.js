//提示类
var TipView = Backbone.View.extend({
    className: 'operation_tip',
    render: function () {
        this.$el.html('<div class="operation_tip_inner">' + this.model.info + '</div>').addClass(this.model.type || 'success');
        document.body.appendChild(this.el);
        return this;
    },
    show: function () {
        this.$el.show();
        this.el.offsetWidth;
        this.$el.addClass('in');

        var that = this;
        setTimeout(function () {
            that.remove();
        }, this.model.delay || 2000);
    }
}, {
    create: function (model) {
        return new TipView({
            model: model
        }).render();
    }
});

//构建Todo类
var Todo = Backbone.Model.extend({
    defaults: function () {
        return {
            text: '',
            complete: false
        }
    },
    toggle: function () {
        //1. 将异步对象返回，方便view层做交互
        //2. 此处调用save方法不建议加{wait: true}，如果加了，就只能等到异步请求成功才会触发change事件，而此时可能UI已经发生变化，最终导致UI与model不一致的问题
        return this.save('complete', !this.get('complete'));
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
        var _async = this.model.toggle();
        _async && _async.done(function () {
            TipView.create({info: '修改成功', type: 'success'}).show();
        });
    },
    endEdit: function (e) {
        if (e.type == 'keypress' && e.which != 13) return;
        this.$el.removeClass('edit');

        var value = $.trim(this.$input.val());

        if (value) {
            var _async = this.model.save({text: value});
            _async && _async.done(function () {
                TipView.create({info: '修改成功', type: 'success'}).show();
            });
        } else {
            this.clear();
        }
    },
    clear: function (e) {
        //1. 此处调用destroy方法建议加{wait: true}，目的是为了只有在后端添加成功之后才去更新UI，否则可能会出现后端没有删除成功，但是前端已经删除了的问题
        var _async = this.model.destroy({wait: true});
        _async && _async.done(function () {
            TipView.create({info: '删除成功', type: 'success'}).show();
        });
    }
});

//构建TodoList
var TodoList = Backbone.Collection.extend({
    model: Todo,
    comparator: 'id',
    localStorage: new Backbone.LocalStorage('todo'),
    getComplete: function () {
        return this.where({complete: true});
    }
});

var AppView = Backbone.View.extend({
    el: '#app',
    events: {
        'keypress #new_input': 'createTodo',
        'change #complete_all': 'toggleAll',
        'click .btn-clear-all': 'clearCompleted'
    },
    footerTemplate: (function () {
        var t = $('#footer_tpl').html();
        Mustache.parse(t);
        return t;
    })(),
    initialize: function () {
        //创建一个内部的todos_list
        this.todos = new TodoList();

        this.$new_input = $('#new_input').focus();
        this.$todos_list = $('#todos_list');
        this.$complete_all = $('#complete_all');
        this.$footer = $('#footer');

        this.listenTo(this.todos, 'add', this.addOne);
        this.listenTo(this.todos, 'reset', this.addAll);
        this.listenTo(this.todos, 'all', this.render);

        //异步获取已有的todos，并触发reset事件
        this.todos.fetch({reset: true});
    },
    render: function () {
        var all = this.todos.length,
            complete = this.todos.getComplete().length,
            unComplete = all - complete;

        this.$complete_all.toggleClass('hidden', !all);
        this.$complete_all.find('input')[0].checked = all == complete;

        //一个待办项都没有时隐藏footer
        this.$footer.toggleClass('hidden', !all);

        //显示已完成和未完成的统计信息
        this.$footer.html(Mustache.render(this.footerTemplate, {
            unComplete: unComplete,
            complete: complete
        }));
    },
    createTodo: function (e) {
        var $new_input = this.$new_input,
            value = $.trim($new_input.val());

        if (e.which == 13 && value) {

            //创建todo
            var td = new Todo({
                text: value
            }, {
                //必须通过collection指定todo属于的集合，否则后面的save方法会报错
                collection: this.todos
            });

            //异步保存
            //此处加wait: true也是为了保证后端请求与前端UI展现一致，只有后端保存成功了，我们才会在前端新增一个TodoView
            var _async = td.save({}, {wait: true}), that = this;

            _async && _async.done(function () {
                //保存成功后与用户交互
                TipView.create({info: '新增成功', type: 'success'}).show();

                //添加到todos，以便触发todos的add事件
                that.todos.add(td);

                $new_input.focus().val('');
            });
        }
    },
    addOne: function (todo) {
        var tv = new TodoView({
            model: todo
        });
        this.$todos_list.append(tv.render().el);
    },
    addAll: function () {
        this.todos.each(this.addOne, this);
    },
    toggleAll: function (e) {
        //todo 应该改成批量处理
        var complete = this.$complete_all.find('input')[0].checked;
        this.todos.each(function (todo) {
            todo.save({complete: complete});
        });
    },
    clearCompleted: function () {
        //todo 应该改成批量处理
        _.invoke(this.todos.getComplete(), 'destroy', {wait: true});
    }
});

new AppView();