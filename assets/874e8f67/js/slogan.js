'use strict';
yii.mainPageAnimation = (function ($) {
    var slide1 = $(".animation .slide-1");
    var slide2 = $(".animation .slide-2");
    var slide1_svg = Snap($('svg', slide1)[0]);
    var howtodo_button = $('.howtodo');
    var finish_text = $('.finish-text');
    var repeat_button = $('.repeat-animation');
    var speed = 1000;
    var pub = {
        init: function () {
            $('.slogan .open, .slogan .close').click(function () {
                var slogan = $(this).parent();
                $('.slogan_detail', slogan).slideToggle(function () {
                    if ($('.open', slogan).is('.hidden')) {
                        animateInSlide1();
                    }
                });
                initSlides();
                $('.open', slogan).toggleClass('hidden');
                $('.close', slogan).toggleClass('hidden');
            });

            repeat_button.click(function (e) {
                e.stopPropagation();
                initSlides();
                animateInSlide1();
            })
        }
    };

    function initSlides() {
        var items = slide1_svg.selectAll('circle, path, rect, polygon, polyline, line');
        items.forEach(function (elem) {
            var length = Snap.path.getTotalLength(elem.getBBox().path);
            elem.attr({
                strokeDasharray: length,
                strokeDashoffset: length
            });
        });
        howtodo_button.text('Как сделать мебель дешевле?').removeClass('bounceOutDown bounceInUp').hide();
        slide1.show();
        $('.infoitems').removeClass('flip-mode');
        repeat_button.hide();
        slide2.hide();
        finish_text.hide();
        $('.infoitems .shield').hide();
    }

    function animateInSlide1() {


        slide1_svg.selectAll('circle, path, rect, polygon, polyline, line').animate(
            {strokeDashoffset: 0},
            speed,
            function () {
                howtodo_button.addClass('bounceInUp').show();
            }
        );

        howtodo_button.add(slide1).off().one('click', function (e) {
            e.stopPropagation();
            animateOutSlide1(function () {
                slide2.show();
                slide1.hide();
                animateInSlide2();
            });
        });
    }

    function animateOutSlide1(callback) {
        var items = slide1_svg.selectAll('circle, path, rect, polygon, polyline, line');
        var callbacker = 0;
        items.forEach(function (elem) {
            var length = Snap.path.getTotalLength(elem.getBBox().path);
            elem.animate({
                strokeDashoffset: length
            }, speed, function () {
                callbacker++;
                if (callbacker == items.length) {
                    if (typeof callback == 'function') {
                        callback();
                    }
                }
            });
        });
        howtodo_button.addClass('bounceOutDown');
    }

    function animateInSlide2() {
        $('.infoitems .item:last').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
            $('.infoitems .front .shield').show().one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                howtodo_button.removeClass('bounceOutDown');
                $(this).off();
            });
            $(this).off();
        });
        howtodo_button.off().text('Мы делаем по-другому!').one('click', function (e) {
            e.stopPropagation();
            animateSlide2SecondStage();
        });
    }

    function animateSlide2SecondStage() {
        $('.infoitems').addClass('flip-mode');
        howtodo_button.addClass('bounceOutDown');
        $('.infoitems .item:last').one('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function () {
            $('.infoitems .back .shield').show().one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                finish_text.show().one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                    repeat_button.show();
                    $(this).off();
                });
                $(this).off();

            });
            $(this).off();
        });
    }

    return pub;
})(jQuery);
