//这个模块完成鼠标方向判断的功能
var MouseDirection = function (element, opts) {

    var $element = $(element);

    //enter leave代表鼠标移入移出时的回调
    opts = $.extend({}, {
        enter: $.noop,
        leave: $.noop
    }, opts || {});

    var dirs = ['top', 'right', 'bottom', 'left'];

    var calculate = function (e) {
        var w = $element.outerWidth(),
            h = $element.outerHeight(),
            offset = $element.offset(),
            x = (e.pageX - offset.left - (w / 2)) * (w > h ? (h / w) : 1),
            y = (e.pageY - offset.top - (h / 2)) * (h > w ? (w / h) : 1);

        return Math.round((((Math.atan2(y, x) * (180 / Math.PI)) + 180) / 90) + 3) % 4;
    };

    $element.on('mouseenter', function (e) {
        var r = calculate(e);
        opts.enter($element, dirs[r]);
    }).on('mouseleave', function (e) {
        var r = calculate(e);
        opts.leave($element, dirs[r]);
    });
};