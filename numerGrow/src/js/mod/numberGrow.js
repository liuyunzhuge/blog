define(function (require, exports, module) {
    var $ = require('jquery'),
        ScrollLazyInit = require('mod/scrollLazyInit'),
        scrollLazy = new ScrollLazyInit({
            ns: '.numberGrow'
        });

    function NumberGrow(element, options) {
        options = options || {};

        var $this = $(element),
            time = options.time || $this.data('time'),//总时间
            num = options.num || $this.data('value'),//要显示的真实数值
            step = num * 16 / (time * 1000),//每16ms增加的数值
            start = 0,//计数器
            interval,//定时器
            old = 0;

        //每帧不能超过16ms，所以理想的interval间隔为16ms
        //step为每16ms增加的数值

        interval = setInterval(function () {
            start = start + step;
            if (start >= num) {
                clearInterval(interval);
                interval = undefined;
                start = num;
            }

            var t = Math.floor(start);

            //t未发生改变的话就直接返回
            //避免调用text函数，提高DOM性能
            if (t == old) {
                return;
            }

            old = interval ? t : start; // 需要加上这个吗
            $this.text(old);
        }, 16);
    }

    //通过[data-ride="numberGrow"]自动注册组件
    //将每个自动注册的组件的逻辑添加到scrollLazy来管理
    //以便当numberGrow在浏览器可视区域的时候自动初始化
    $('[data-ride="numberGrow"]').each(function () {
        scrollLazy.add(this, function () {
            new NumberGrow(this);
        });
    });

    //开始scrollLazy的监听管理
    scrollLazy.start();
});
