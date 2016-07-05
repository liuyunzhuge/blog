var CODE_MAP = {};

//codemirror
$('textarea').each(function () {
    var $tarea = $(this),
        _cm = CodeMirror.fromTextArea(this, {
            lineNumbers: true,
            indentUnit: 4,
            mode: {
                name: 'javascript',
                json: true
            },
            theme: 'monokai',
            readOnly: true
        });

    CODE_MAP[$tarea.data('index')] = _cm;
});

var console = {
    $result: '',
    log: function (msg) {
        this.$result && this.$result.removeClass('hidden').append('<p>' + msg + '</p>');
    }
};

$(document).on('click', '.btn-excute', function (e) {
    var $btn = $(e.currentTarget);

    console.$result = $btn.closest('.code').next('.result').html('');
    eval(CODE_MAP[$btn.data('target')].getValue());
});

var Todo = Backbone.Model.extend({
    defaults: function () {
        return {
            text: '',
            complete: false
        }
    },
    parse: function (res) {
        return res.data;
    }
});

var TodoList = Backbone.Collection.extend({
    model: Todo,
    parse: function (res) {
        return res.data;
    }
});


