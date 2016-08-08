define('js/app/youku_summer.js', function (require, exports, module) {

    var Swiper = require('swiper.jquery'),
        $ = require('jquery'),
        Url = require('mod/url'),
        SimpleImgPreloader = require('mod/simpleImgPreloader');

    require('mod/transition');

    var $preloader = $('#preloader'),
        $preloader_content = $preloader.find('.preloader_content'),
        preLoadList = [
            'img/youku_summer/1.png',
            'img/youku_summer/24.png',
            'img/youku_summer/15.png',
            'img/youku_summer/18.png',
            'img/youku_summer/25.png',
            'img/youku_summer/10.png'
        ];

    var PRE_LEAVE_DURATION = 300;

    //资源预加载
    SimpleImgPreloader($.map(preLoadList, function (u) {
        return Url.getUrl(u);
    }), function (percentage) {

        $preloader_content.text((percentage * 100).toFixed(0) + '%');

        if (percentage >= 1) {
            $preloader.addClass('leave').one($.transitionEnd.end, function () {
                $preloader.remove();
            }).emulateTransitionEnd(PRE_LEAVE_DURATION);

            //带懒加载的滑屏
            new Swiper('#swiper', {
                direction: 'vertical',
                preloadImages: false,
                lazyLoading: true,
                lazyLoadingInPrevNext: true,
                lazyLoadingInPrevNextAmount: 1,
                slidesPerView: 1
            });
        }
    });
});