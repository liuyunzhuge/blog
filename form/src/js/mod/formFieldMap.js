define(function (require, exports, module) {
    var FormFieldText = require('mod/formFieldText'),
        FormFieldCheckbox = require('mod/formFieldCheckbox'),
        FormFieldRadio = require('mod/formFieldRadio'),
        FormFieldSelect = require('mod/formFieldSelect'),
        FormFieldDate = require('mod/formFieldDate'),
        FormFieldUeditor = require('mod/formFieldUeditor');

    return {
        checkbox: FormFieldCheckbox,
        date: FormFieldDate,
        radio: FormFieldRadio,
        text: FormFieldText,
        select: FormFieldSelect,
        ueditor: FormFieldUeditor
    }
});