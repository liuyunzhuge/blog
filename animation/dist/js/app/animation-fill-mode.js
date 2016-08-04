define(function (require, exports, module) {
    var $ = require('jquery');

    $('.btn-animate-add').on('click', function(){
        $(this).closest('.demo_box').find('.target').addClass('animate');
    });

    $('.btn-animate-cancel').on('click', function(){
        $(this).closest('.demo_box').find('.target').removeClass('animate');
    });
});