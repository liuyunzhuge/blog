define(function (require, exports, module) {
    var Validation = require('mod/validation/validate');

    //因为select checkbox radio hidden textarea[data-type="ueditor"]等在jquery.validate插件的机制里面，change事件触发的时候不会引发校验、
    //所以通过Validation.addValidateEvent为这些字段添加afterChange事件的回调，并在回调内手动调用Validation实例来对字段进行校验

    Validation.addValidateEvent('selectChange', {
        selector: 'select',
        registMethod: function($field, validation){
            $field.on('afterChange.validation', function () {
                validation.element($field[0]);
            });
        }
    });
    Validation.addValidateEvent('checkboxChange', {
        selector: 'input[type="checkbox"]',
        registMethod: function($field, validation){
            $field.closest('[data-type="checkbox"]').on('afterChange.validation', function () {
                validation.element($field[0]);
            });
        }
    });
    Validation.addValidateEvent('radioChange', {
        selector: 'input[type="radio"]',
        registMethod: function($field, validation){
            $field.closest('[data-type="radio"]').on('afterChange.validation', function () {
                validation.element($field[0]);
            });
        }
    });
    Validation.addValidateEvent('hiddenChange', {
        selector: 'input[type="hidden"]',
        registMethod: function($field, validation){
            $field.on('afterChange.validation', function () {
                validation.element($field[0]);
            });
        }
    });
    Validation.addValidateEvent('ueditorChange', {
        selector: 'textarea[data-type="ueditor"]',
        registMethod: function($field, validation){
            $field.on('afterChange.validation', function () {
                validation.element($field[0]);
            });
        }
    });
    Validation.addValidateEvent('dateChange', {
        selector: 'input[data-type="date"]',
        registMethod: function($field, validation){
            $field.on('afterChange.validation', function () {
                validation.element($field[0]);
            });
        }
    });

    //将不稳定的部分单独放在这个模块中定义，以免对validate.js的逻辑造成影响
    Validation.defaultFieldTypeConfig = {
        fvRelatedTarget: {
            checkbox: function ($field) {
                var $target = $field.closest('[data-type="checkbox"]');
                if ($target.hasClass('checkbox')) return $target;
                return $target.find('.checkbox');
            },
            radio: function ($field) {
                var $target = $field.closest('[data-type="radio"]');
                if ($target.hasClass('radio')) return $target;
                return $target.find('.radio');
            }
        },
        fvTipTarget: {
            checkbox: function ($field) {
                return $field.closest('[data-type="checkbox"]');
            },
            radio: function ($field) {
                return $field.closest('[data-type="radio"]');
            }
        }
    };

    return Validation;
});