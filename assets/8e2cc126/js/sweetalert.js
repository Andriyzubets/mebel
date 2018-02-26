/**
 * Функция вызова алертов на сайте. Следует использовать вместо обычного sweetAlert чтобы в алерте был крестик закрытия
 * @param args
 */
var sweetAlert = swal = (function () {
    var original_sweet = sweetAlert;
    var sweet = function () {
        original_sweet.apply(this, arguments);
        var $sweetAlert = $('.sweet-alert');
        if (!$sweetAlert.find('.sa-cross-close').size()) {
            var $close = $('<span class="sa-cross-close">').click(original_sweet.close);
            $sweetAlert.append($close);
        }
    };
    for (var attrname in original_sweet) {
        sweet[attrname] = original_sweet[attrname];
    }
    return sweet;

})();
