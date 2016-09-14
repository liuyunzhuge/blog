define('js/app/3w_spread.js', function (require, exports, module) {
    var $ = require('proj/3w_spread/zepto'),
        Swiper = require('proj/3w_spread/swiper.jquery'),
        Ajax = require('proj/3w_spread/ajax'),
        Util = require('mod/util'),
        SimpleImgPreloader = require('mod/simpleImgPreloader'),
        ProgressBar = require('mod/progressBar'),
        StateManager = require('mod/stateManager');

    require('mod/transition');

    var api = {
            save: '/api/activity/save'
        },
        PRE_LEAVE_DURATION = 300,
        Conf = {
            firstPreloadRes: [
                '/blog/h5_demo/dist/img/3w_spread/bg.jpg',
                '/blog/h5_demo/dist/img/3w_spread/flash_1.png',
                '/blog/h5_demo/dist/img/3w_spread/flash_2.png',
                '/blog/h5_demo/dist/img/3w_spread/star.png',
                '/blog/h5_demo/dist/img/3w_spread/zhiwen.png',
                '/blog/h5_demo/dist/img/3w_spread/page_1/1.png',
                '/blog/h5_demo/dist/img/3w_spread/page_1/2.png',
                '/blog/h5_demo/dist/img/3w_spread/page_1/3.png',
            ],
            secondPreloadRes: []
        };

    function Video(options) {
        var opts = $.extend({
            onExit: $.noop,
            onPlay: $.noop
        }, options);

        var video = document.getElementById('video'),
            playing = false,
            docE = document.documentElement;

        function requestFullScreen(video) {
            if (video.requestFullscreen) {
                video.requestFullscreen();
            } else if (video.mozRequestFullScreen) {
                video.mozRequestFullScreen();
            } else if (video.webkitRequestFullScreen) {
                video.webkitRequestFullScreen();
            }
        }

        var fullscreenchangeEvent;
        ['onfullscreenchange', 'onwebkitfullscreenchange', 'onmozfullscreenchange', 'onmsfullscreenchange'].forEach(function (eventName) {
            if (!fullscreenchangeEvent && (eventName in docE)) {
                fullscreenchangeEvent = eventName;
            }
        });

        //监听全屏切换的事件
        if (fullscreenchangeEvent) {
            docE[fullscreenchangeEvent] = function (event) {
                playing = !playing;

                if (!playing) {
                    opts.onExit();
                    _pause();
                }
            };
        } else {
            video.addEventListener('webkitendfullscreen', opts.onExit, false);
        }


        video.addEventListener('playing', opts.onPlay, false);


        var _pause = function () {
            video.pause();
            video.load();
        };

        return {
            play: function () {
                requestFullScreen(video);
                video.play();
            },
            pause: _pause
        }
    }

    function main() {
        var swiper = new Swiper('#swiper', {
            direction: 'vertical',
            preloadImages: false,
            lazyLoading: true,
            lazyLoadingInPrevNext: true,
            lazyLoadingInPrevNextAmount: 2,
            slidesPerView: 1
        });

        $('#btn_play_video').on('tap', function (e) {
            video.play();
        });

        var video = new Video({
            onExit: function () {
                video.pause();
                swiper.slideTo(1);
                audio && audio.play();
            },
            onPlay: function () {
                audio && audio.pause();
            }
        });

        var audio;
        audio = (function () {
            var audio = document.getElementById('bg-audio');

            var $icon = $('#bgm_icon');
            $icon.on('click', function (e) {
                e.preventDefault();
                audio.paused ? audio.play() : audio.pause();
                $icon.toggleClass('animate');
            }).trigger('click');

            $icon.addClass('show');

            return {
                play: function(){
                    if(audio.paused) {
                        audio.play();
                        $icon.addClass('animate');
                    }
                },
                pause: function(){
                    if(!audio.paused) {
                        audio.pause();
                        $icon.removeClass('animate');
                    }
                }
            };
        })();

        var $form = $('#appForm'),
            $form_inner = $('#form_inner'),
            $form_success = $('#form_success');

        $('#btn_submit').on('tap', function () {
            var that = this;
            this.disabled = true;

            var formData = Util.formatForm($form);

            if($.trim(formData.username) == '') {
                new Msg('姓名不能为空:)');
                return;
            }
            if($.trim(formData.company) == '') {
                new Msg('公司不能为空:)');
                return;
            }
            if($.trim(formData.position) == '') {
                new Msg('联系方式不能为空:)');
                return;
            }
            if($.trim(formData.desc) == '') {
                new Msg('传播需求不能为空:)');
                return;
            }

            Ajax.post(api.save, Util.formatData(formData, 'Chuanbo')).done(function (res) {
                if(res.code == 1) {
                    $form_inner.hide();
                    $form_success.show();
                } else {
                    new Msg('请再试一下，没提交好:(');
                }
            }).always(function () {
                that.disabled = false;
            })
        });
    }

    function Msg(content,delay){
        var $msg = $('<div class="msg">' + content + '</div>').appendTo($(document.body));
        $msg[0].offsetWidth;

        $msg.addClass('msg_show');
        setTimeout(function(){
            $msg.remove();
        },(delay || 1500) + 300);
    }

    //页面初始化状态管理
    var initState = new StateManager({
        preload: false
    }, function () {
        $('#main').addClass('in').one($.transitionEnd.end, function () {
            $('#loader_wrap').remove();
            loader.destroy();
            main();
            $('#main').addClass('main_init');
        }).emulateTransitionEnd(PRE_LEAVE_DURATION);
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