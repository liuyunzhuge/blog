define('js/app/3w_saas.js', function (require, exports, module) {
    var $ = require('proj/3w_saas/zepto'),
        Swiper = require('proj/3w_saas/swiper.jquery'),
        SimpleImgPreloader = require('mod/3w_saas/simpleImgPreloader'),
        ProgressBar = require('mod/3w_saas/progressBar'),
        StateManager = require('mod/3w_saas/stateManager');

    $.fn.cssAnimate = function (option) {
        return this.each(function () {
            var $this = $(this);

            if(Object.prototype.toString.call(option) != '[object Object]') {
                return;
            }

            if(option.animateClass) {
                option.before && option.before();

                $this.addClass(option.animateClass).one('animationend webkitAnimationEnd', function(){
                    option.after && option.after();
                    $this.addClass('animate_end').removeClass(option.animateClass);
                });
            }
        })
    };

    var Conf = {
            firstPreloadRes: [
                //'/img/3w_saas/bg.jpg'
                '/img/3w_saas/btn_sign.png',
                '/img/3w_saas/btn_vip.png',
            ],
            secondPreloadRes: []
        },
        main = function () {
            new Swiper('#swiper', {
                direction: 'vertical',
                preloadImages: false,
                lazyLoading: true,
                lazyLoadingInPrevNext: true,
                lazyLoadingInPrevNextAmount: 2,
                slidesPerView: 1
            });
        };

    //页面初始化状态管理
    var initState = new StateManager({
        preload: false
    }, function () {
        $('#main').cssAnimate({
            animateClass: 'slideInUp',
            before: function(){
                $('#loader_wrap').remove();
                loader.destroy();
            },
            after: function(){
                main();
            }
        });
    });

    //进度加载条
    var loader = new ProgressBar('#loader', {
        onComplete: function () {
            //告诉initState，预加载的资源已经OK了
           initState.set('preload', true);
        },
        duration: 1000
    });

    //资源预加载
    SimpleImgPreloader(Conf.firstPreloadRes, function (percentage) {
        loader.setValue(percentage);
    });
});