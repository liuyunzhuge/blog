function changeHref(index) {
    location.href = 'demo' + index + '.html';
}

document.addEventListener("DOMContentLoaded", function () {
    document.removeEventListener("DOMContentLoaded", arguments.callee, false);

    document.getElementById('log').innerHTML = '当前历史记录栈中的总条目数：' + history.length;
}, false);