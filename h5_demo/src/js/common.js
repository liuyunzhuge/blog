seajs.config({
    base: '@@CONTEXT_PATH/dist/',
    paths: {
        'app': 'js/app',
        'mod': 'js/mod',
        'lib': 'js/lib'
    },
    debug: false,
    //对应lib/中的12个文件
    alias: {
        'swiper.jquery': 'lib/swiper.jquery.js?v=20160721',
        'swiper': 'lib/swiper.js?v=20160721'
    }
});