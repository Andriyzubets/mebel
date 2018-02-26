$(function () {
    $(document).on('click', function(event) {
        var $popup = $('#installment-popup');
        if (!($popup[0] === event.target || $.contains($popup[0], event.target))) {
            $popup.hide();
        }
    });
    $(document).on('click', '.buy-info .installment', function () {
        var buy_info_offset = $('.buy-info:first').offset();
        var $popup = $('#installment-popup');

        if ($popup.css('display') == 'none') {
            $popup.css('top', (45 + buy_info_offset.top) + 'px').fadeIn(300);

            if ($(window).height() + $(window).scrollTop() < buy_info_offset.top + 357) {
                $("html, body").animate({scrollTop: buy_info_offset.top - 230});
            }
            else if ($(window).scrollTop() > buy_info_offset.top + 50) {
                $("html, body").animate({scrollTop: buy_info_offset.top - 50});
            }
        } else {
            $popup.hide();
        }
        return false;
    });

    $('#installment-popup').each(function () {
        $('.installment-tocart').click(function () {
            yii.analytics.triggerEvent('CREDIT_ADDTOCART');

            var $element = $('.buy-info .tocart');
            if (!$element.length) {
                $element = $('.productAction-toCart');
            }
            $element.click();

            return false;
        });
        $('.close, .cancel-credit', this).click(function () {
            $('#installment-popup').hide();
            return false;
        });
    });
});
