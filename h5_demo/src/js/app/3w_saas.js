define('js/app/3w_saas.js', function (require, exports, module) {
    var $ = require('proj/3w_saas/zepto'),
        Swiper = require('proj/3w_saas/swiper.jquery'),
        SimpleImgPreloader = require('mod/3w_saas/simpleImgPreloader'),
        ProgressBar = require('mod/3w_saas/progressBar'),
        StateManager = require('mod/3w_saas/stateManager');

   /* $('[data-background]').each(function(){
        if(!($(this).hasClass('swiper-lazy'))) {
            console.log($(this).data('background'));
        }
    });
    return;*/

    $.fn.cssAnimate = function (option) {
        return this.each(function () {
            var $this = $(this);

            if (Object.prototype.toString.call(option) != '[object Object]') {
                return;
            }

            if (option.animateClass) {
                option.before && option.before();

                $this.addClass(option.animateClass).one('animationend webkitAnimationEnd', (function (call) {
                    var ret;
                    return function () {
                        return !ret && (ret = call.apply(this, arguments));
                    }
                })(function () {
                    option.after && option.after();
                    $this.addClass('animate_end').removeClass(option.animateClass);
                    return true;
                }));
            }
        })
    };

    var Conf = {
            firstPreloadRes: [
                '@@CONTEXT_PATH/img/3w_saas/btn_sign.png',
                '@@CONTEXT_PATH/img/3w_saas/bottom_bg.png',
                '@@CONTEXT_PATH/img/3w_saas/top_right_text.png',
                '@@CONTEXT_PATH/img/3w_saas/bottom_l_text.png',
                '@@CONTEXT_PATH/img/3w_saas/slide_arrow.png',
                '@@CONTEXT_PATH/img/3w_saas/bottom_right_arrow_up.png',
                '@@CONTEXT_PATH/img/3w_saas/bottom_right_arrow_down.png',
                '@@CONTEXT_PATH/img/3w_saas/bg_main_angle.png',
                '@@CONTEXT_PATH/img/3w_saas/bg_top_angle.png',
                '@@CONTEXT_PATH/img/3w_saas/angle_01.png',
                '@@CONTEXT_PATH/img/3w_saas/page_0/title_banner.png',
                '@@CONTEXT_PATH/img/3w_saas/page_0/main_bg.png',
                '@@CONTEXT_PATH/img/3w_saas/page_0/title_top.png',
                '@@CONTEXT_PATH/img/3w_saas/page_0/title_bottom.png',
                '@@CONTEXT_PATH/img/3w_saas/page_0/title_decorate_1.png',
                '@@CONTEXT_PATH/img/3w_saas/page_0/title_decorate_2.png',
                '@@CONTEXT_PATH/img/3w_saas/page_0/title_text_top.png',
                '@@CONTEXT_PATH/img/3w_saas/page_0/title_text_bottom.png',
                '@@CONTEXT_PATH/img/3w_saas/page_0/address.png',
                '@@CONTEXT_PATH/img/3w_saas/page_0/address_line.png',
                '@@CONTEXT_PATH/img/3w_saas/page_0/page_bottom.png'
            ],
            secondPreloadRes: []
        },
        main = function () {
            var $swiper = $('#swiper'),
                pages = $swiper.children('.swiper-wrapper').children('.swiper-slide').length;

            for (var i = 0; i < pages; i++) {
                Pages[i] = new Page(i, PageConf[i]);
            }

            new Swiper('#swiper', {
                resistanceRatio: 0,
                direction: 'vertical',
                preloadImages: false,
                lazyLoading: true,
                lazyLoadingInPrevNext: true,
                lazyLoadingInPrevNextAmount: 2,
                slidesPerView: 1,
                onInit: function (swiper) {
                    Pages[swiper.activeIndex].init(swiper);
                },
                onSlideChangeEnd: function (swiper) {
                    Pages[swiper.activeIndex].init(swiper);
                }
            });
        },
        Page = function (index, conf) {
            return {
                _init: false,
                init: function (swiper) {
                    if (this._init) return;

                    this.$page = $(swiper.slides[index]);
                    this.$page.addClass('swiper-slide-init');
                    if (conf) {
                        $.extend(this, conf);
                    }
                    this.ready();
                    this._init = true;
                },
                ready: $.noop,
                reset: $.noop
            }
        },
        Pages = {},
        PageConf = {
            3: {
                ready: function () {
                    new Swiper(this.$page.find('.swiper-container')[0], {
                        resistanceRatio: 0,
                        slidesPerView: 1,
                        pagination: '.swiper-pagination',
                        spaceBetween: lib.flexible.rem2px(0.66666),
                        onInit: initSlide,
                        onSlideChangeEnd: initSlide
                    });
                }
            },
            5: {
                ready: function () {
                    new Swiper(this.$page.find('.swiper-container')[0], {
                        resistanceRatio: 0,
                        slidesPerView: 1,
                        pagination: '.swiper-pagination',
                        spaceBetween: lib.flexible.rem2px(0.66666),
                        onInit: initSlide,
                        onSlideChangeEnd: initSlide
                    });
                }
            },
            6: {
                ready: function () {
                    new Swiper(this.$page.find('.swiper-container')[0], {
                        resistanceRatio: 0,
                        slidesPerView: 1,
                        pagination: '.swiper-pagination',
                        spaceBetween: lib.flexible.rem2px(0.66666),
                        onInit: initSlide,
                        onSlideChangeEnd: initSlide
                    });
                }
            }
        },
        initSlide = function (swiper) {
            $(swiper.slides[swiper.activeIndex]).addClass('swiper-slide-init');
        };

    //页面初始化状态管理
    var initState = new StateManager({
        preload: false
    }, function () {
        $('#main').cssAnimate({
            animateClass: 'slideInUp',
            before: function () {
                $('#loader_wrap').remove();
                loader.destroy();
            },
            after: function () {
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