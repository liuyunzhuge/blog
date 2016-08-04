seajs.config({
    base: '/blog/animation/dist/',
    paths: {
        'app': 'js/app',
        'mod': 'js/mod',
        'lib': 'js/lib'
    },
    debug: false,
    //对应lib/中的12个文件
    alias: {
        'swiper.jquery': 'lib/swiper.jquery.umd.js?v=20160721',
        'swiper': 'lib/swiper.js?v=20160721',
        'iscroll': 'lib/iscroll-lite.js?v=20160721',
        'jquery': 'lib/zepto.js?v=20160721'
    }
});