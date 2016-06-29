//创建Todo类
var Todo = Backbone.Model.extend({
        //默认值用函数来定义，防止所有实例共享同一个defaults对象
        defaults: function () {
            return {
                text: '',
                complete: false
            }
        },
        localStorage: new Backbone.LocalStorage('todo'),
        toggle: function () {
            this.set('complete', !this.get('complete'));
        }
    }
);