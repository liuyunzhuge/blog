seajs.config({
    base: '/@@CONTEXT_PATHdist/',
    paths: {
        'mod': 'js/mod',
        'lib': 'js/lib'
    },
    alias: {
        "jquery": "lib/jquery.js"
    }
});