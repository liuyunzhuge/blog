define(function (require, exports, module) {
    var $ = require('jquery'),
        Scroller = require('mod/scroller'),
        Swiper = require('swiper.jquery');

    //禁止默认的滚动操作
    Scroller.stopDefaultTouch();

    var $tabs = $("#tabs"),
        tabSwiper = new Swiper('#swiper-tab-content', {
            speed: 500,
            onSlideChangeStart: function () {
                $tabs.children('.active').removeClass('active');
                $tabs.children().eq(tabSwiper.activeIndex).addClass('active');
            }
        });

    $tabs.on('click', 'a', function (e) {
        e.preventDefault();
        $tabs.children('.active').removeClass('active');

        var $parent = $(this).parent();
        $parent.addClass('active');
        tabSwiper.slideTo($parent.index());
    });
});