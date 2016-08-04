define(function (require, exports, module) {
    var IScroll = require('iscroll'),
        $ = require('jquery');

    $('[data-scroll="vertical"]').each(function(){
        new IScroll(this);
    });

    var prevetTouchemove = function (e) {
        e.preventDefault();
    };
    
    return {
        IScroll: IScroll,
        stopDefaultTouch: function () {
            document.addEventListener('touchmove', prevetTouchemove, false);
        },
        resetDefaultTouch: function(){
            document.removeEventListener('touchmove', prevetTouchemove);
        }
    }
});
