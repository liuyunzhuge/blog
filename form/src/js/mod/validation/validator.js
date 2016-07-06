define(function (require, exports, module) {
    var $ = require('jquery');

    require('jquery.validate');

    //可在这里添加新的validator，按照jquery.validate官方文档中给出的添加方式。

    $.extend($.validator.messages, {
        required: "请输入必填字段.",
        remote: "请重新输入该字段.",
        email: "请输入合法的邮箱.",
        url: "请输入合法的网址.",
        date: "请输入合法的日期.",
        dateISO: "请输入合法的日期( ISO ).",
        number: "请输入合法的数字.",
        digits: "请输入整数.",
        equalTo: "请再次输入相同的内容.",
        maxlength: $.validator.format("您最多可输入{0}个字符."),
        minlength: $.validator.format("您至少要输入{0}个字符."),
        rangelength: $.validator.format("请输入{0}-{1}个字符."),
        range: $.validator.format("请输入{0}-{1}之间的值."),
        max: $.validator.format("请输入小于等于{0}的值."),
        min: $.validator.format("请输入大于等于{0}的值."),
        step: $.validator.format("Please enter a multiple of {0}.")
    });
});