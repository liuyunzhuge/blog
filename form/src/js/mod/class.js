define(function () {
    var hasOwn = Object.prototype.hasOwnProperty;

    //用来判断是否为Object的实例
    function isObject(o) {
        return typeof (o) === 'object';
    }

    //用来判断是否为Function的实例
    function isFunction(f) {
        return typeof (f) === 'function';
    }

    //简单复制
    function copy(source) {
        var target = {};
        for (var i in source) {
            if (hasOwn.call(source, i)) {
                target[i] = source[i];
            }
        }
        return target;
    }

    function ClassBuilder(options) {
        if (!isObject(options)) {
            throw new Error('Class options must be an valid object instance!');
        }

        var instanceMembers = isObject(options) && options.instanceMembers || {},
            staticMembers = isObject(options) && options.staticMembers || {},
            extend = isObject(options) && isFunction(options.extend) && options.extend,
            prop;

        //表示要构建的类的构造函数
        function TargetClass() {
            if (extend) {
                //如果有要继承的父类
                //就在每个实例中添加baseProto属性，以便实例内部可以通过这个属性访问到父类的原型
                //因为copy函数导致原型链断裂，无法通过原型链访问到父类的原型
                this.baseProto = extend.prototype;
            }
            if (isFunction(this.init)) {
                this.init.apply(this, arguments);
            }
        }

        //添加静态成员，这段代码需在原型设置的前面执行，避免staticMembers中包含prototype属性，覆盖类的原型
        for (prop in staticMembers) {
            if (hasOwn.call(staticMembers, prop)) {
                TargetClass[prop] = staticMembers[prop];
            }
        }

        //如果有要继承的父类，先把父类的实例方法都复制过来
        extend && (TargetClass.prototype = copy(extend.prototype));

        //添加实例方法
        for (prop in instanceMembers) {

            if (hasOwn.call(instanceMembers, prop)) {

                //如果有要继承的父类，且在父类的原型上存在当前实例方法同名的方法
                if (extend && isFunction(instanceMembers[prop]) && isFunction(extend.prototype[prop])) {
                    TargetClass.prototype[prop] = (function (name, func) {
                        return function () {
                            //记录实例原有的this.base的值
                            var old = this.base;
                            //将实例的this.base指向父类的原型的同名方法
                            this.base = extend.prototype[name];
                            //调用子类自身定义的实例方法，也就是func参数传递进来的函数
                            var ret = func.apply(this, arguments);
                            //还原实例原有的this.base的值
                            this.base = old;
                            return ret;
                        }
                    })(prop, instanceMembers[prop]);
                } else {
                    TargetClass.prototype[prop] = instanceMembers[prop];
                }
            }
        }

        TargetClass.prototype.constructor = TargetClass;

        return TargetClass;
    }

    return ClassBuilder
});