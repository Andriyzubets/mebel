(function ($) {
    "use strict";

    yii.locationForm = (function () {
        var $widget = null;
        var $popup = null;

        return {
            "init": function () {
                $(document).ready(function () {
                    $widget = $(".location-form-widget");
                    $widget.each(eachSubscribe);

                    $popup = $('.location-confirm-popup');
                    $popup
                        .on('click', '.location-confirm-popup__action_primary', $.proxy(onConfirmPrimary))
                        .on('click', '.location-confirm-popup__action_close', $.proxy(onConfirmClose));
                });
            },
            "confirm": function () {
                if (!getCookie('region')) {
                    var $this = $('.header .location');
                    var offset = $this.offset();

                    $('img', $this).addClass('effected');
                    $popup
                        .css({
                            'top': (offset.top + $this.outerHeight() + 11) + 'px',
                            'left': offset.left + 'px',
                            'height': 'auto'
                        })
                        .fadeIn(300);
                }

                return false;
            }
        };

        function getCookie(name) {
            var matches = document.cookie.match(new RegExp(
                "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
            ));
            return matches ? decodeURIComponent(matches[1]) : undefined;
        }

        function eachSubscribe(index, domElem) {
            var $widget = $(domElem);

            $('.header .location')
                .on("click", $.proxy(onOpen, $widget));

            $widget
                .on("click", ".location-form-widget__close", $.proxy(onClose, $widget))
                .on("click", ".location-form-widget__location", $.proxy(onClick, $widget));
        }

        function onOpen() {
            var $this = $('.header .location');
            var offset = $this.offset();

            this
                .css({
                    'top': (offset.top + $this.outerHeight() + 13) + 'px',
                    'left': (offset.left - 15) + 'px'
                })
                .fadeToggle();

            return false;
        }

        function onClick(event) {
            var href = event.target.getAttribute('href');
            var date = new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000);

            document.cookie = "region=" + event.target.getAttribute('data-region') + ";path=/;expires=" + date.toUTCString();

            if (href) {
                window.location.href = href;
            }

            return false;
        }

        function onClose() {
            this.fadeOut();

            return false;
        }

        function onConfirmPrimary(event) {
            var $this = $(event.delegateTarget);

            $('img', $this).removeClass('effected');
            $this.fadeOut(200);

            var date = new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000);
            document.cookie = "region=" + event.target.getAttribute('data-region') + ";path=/;expires=" + date.toUTCString();
        }

        function onConfirmClose(event) {
            var $this = $(event.delegateTarget);

            $('img', $this).removeClass('effected');
            $this.fadeOut(200);

            var date = new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000);
            document.cookie = "region=" + event.target.getAttribute('data-region') + ";path=/;expires=" + date.toUTCString();
            window.location.href = '/';
        }
    })();
})(jQuery);
