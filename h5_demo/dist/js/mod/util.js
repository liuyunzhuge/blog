define(function () {
    var hasOwn = Object.prototype.hasOwnProperty,
        toString = Object.prototype.toString;

    return {
        formatForm: function ($form) {
            var formData = {},
                o = $form.serializeArray();

            for (var i in o) {
                if (typeof (formData[o[i].name]) == 'undefined') {
                    formData[o[i].name] = o[i].value;
                } else {
                    formData[o[i].name] += "," + o[i].value;
                }
            }
            return formData;
        },
        formatData: function () {
            var argsLength = arguments.length, dest = false, data, prefix = 'model';
            if (argsLength === 1) {
                //如果只传递了一个参数，认为传递的是data参数
                data = arguments[0];
            } else if (argsLength === 2) {
                //如果传递了两个参数
                data = arguments[0];
                if (data === true || data === false) {
                    //如果第一个是一个布尔的值，则把第一个参数赋给dest
                    //第二个参数用来传递data
                    dest = data;
                    data = arguments[1];
                } else {
                    //如果第一个不是布尔值
                    //那么第一个参数还是作为data，第二个参数作为prefix
                    prefix = arguments[1];
                }
            } else {
                //如果是三个参数，就与前面的一一对应
                dest = !!arguments[0];
                data = arguments[1];
                prefix = arguments[2];
            }

            if (toString.call(data) != '[object Object]') return;

            //深度拷贝，防止返回的对象在外部修改导致formData意外改变
            data = $.extend(dest, {}, data);

            var ret = {};
            for (var i  in data) {
                if (hasOwn.call(data, i)) {
                    ret[prefix + '[' + i + ']'] = data[i];
                }
            }

            return ret;
        }
    }
});