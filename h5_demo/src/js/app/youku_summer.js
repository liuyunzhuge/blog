define('js/app/youku_summer.js', function (require, exports, module) {

    var Swiper = require('swiper');

    new Swiper('#swiper', {
        direction: 'vertical'
    });

    require('mod/hi').hi()
});