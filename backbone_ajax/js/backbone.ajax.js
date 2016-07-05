/**
 * 这个文件用来覆盖backbone默认的restful api的功能
 * 改成更传统的get post请求以及form-data的形式来发送请求和处理请求传递的数据
 */

//将restful的http method(get post put delete patch)改成只用get跟post
Backbone.emulateHTTP = true;
//将http请求发送的数据从application/json的形式改成application/x-www-form-urlencoded
Backbone.emulateJSON = true;

//覆盖backbone默认的ajax模块
Backbone.ajax = function () {
    var args = Array.prototype.slice.call(arguments),
        options = args[0],
        success = options.success,
        error = options.error;

    delete options.success;
    delete options.error;

    //在请求时通过options.params选项追加额外的参数
    if (options.params) {
        if (!options.data) {
            options.data = {};
        }
        Backbone.$.extend(options.data, options.params);
    }

    //通过then的方式注册异步请求的成功或失败回调，并在http的成功回调里面，增加对自定义http response code的处理
    //只有满足预定义的code(如：200)才会触发真正的成功回调
    return Backbone.$.ajax.call(Backbone.$, options).then(function (res) {
        if (res.code == 200) {
            success.apply(null, arguments);
        } else {
            error.apply(null, arguments);
        }
    }, error);
};