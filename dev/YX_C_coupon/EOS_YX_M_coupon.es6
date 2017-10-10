let api = (function() {
    let num = function() {
        console.log('num');
    }
    let app = function() {
        console.log('123');
    }

    return {
        num: num
    }
})();

window.API = $.extend(window.API || {}, api);