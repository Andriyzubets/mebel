(function ($) {
    'use strict';

    yii.subscribeForm = (function () {
        var $subscribe_form_buttons = null;
        var $widget = null;
        var $form = null;
        var action = null;

        var pub = {
            isPopup: false,
            isActive: false,
            init: function (action_url, autoshow) {
                if (!action_url) {
                    return;
                }
                $(document).ready(function () {
                    $subscribe_form_buttons = $('.subscribe-form-button');
                    $widget = $('.subscribe-form-widget');
                    $form = $('form', $widget);
                    action = action_url;
                    $widget.blurdialog();
                    bindEvents();
                });
            },
            show: function () {
                yii.analytics.triggerEvent('SUBSCRIBE_FORM');
                $form.get(0).reset();
                $widget.blurdialog('show');
            },
            hide: function () {
                $widget.blurdialog('hide');
            }
        };

        function bindEvents() {
            $subscribe_form_buttons.click(function () {
                pub.isPopup = false;
                pub.show();
            });
            $(".subscribe-form-widget").each(eachSubscribe);

            function eachSubscribe(index, domElem) {
                var $widget = $(domElem);
                var $form = $("form", $widget);

                $form.on("submit", $.proxy(onSubmit, {
                    "widget": $widget,
                    "form": $form
                }));
                $widget.on("click", ".subscribe-form-widget__close, .subscribe-form-widget__button_reset, .subscribe-form-widget__button_close", $.proxy(onClose, $widget));
            }

            function onClose() {
                this.blurdialog("hide");
                onReset.call(this);

                return false;
            }

            function onReset() {
                var $submit = $(".subscribe-form-widget__button_submit", this);
                $(".subscribe-form-widget__layout", this).removeClass("subscribe-form-widget__layout_active");
                $(".subscribe-form-widget__layout_type_input", this).addClass("subscribe-form-widget__layout_active");
                $(".subscribe-form-widget__button", this)
                    .attr("disabled", false)
                    .removeClass("subscribe-form-widget__button_disabled");
                $submit
                    .removeClass("subscribe-form-widget__button_close")
                    .text($submit.attr("data-title"));
                $(".subscribe-form-widget__description", $widget).show();
                $(".subscribe-form-widget__message", this)
                    .addClass("subscribe-form-widget__message_type_info")
                    .removeClass("subscribe-form-widget__message_type_error")
                    .text("Вы можете в любой момент отписаться");

                return false;
            }

            function onSubmit() {
                var $form = this.form;
                var $widget = this.widget;
                var $name = $(".subscribe-form-widget__input[name=name]", $form);
                var $email = $(".subscribe-form-widget__input[name=email]", $form);
                var $help = $(".subscribe-form-widget__message", $form);
                var email = $email.val();

                if (/^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(email)) {
                    var $close = $(".subscribe-form-widget__close", $widget);
                    var $submit = $(".subscribe-form-widget__button_submit", $form);
                    var $buttons = $(".subscribe-form-widget__button", $form);

                    $close.addClass("subscribe-form-widget__close_disabled");
                    $submit.text("Передача данных...");
                    $help
                        .addClass("subscribe-form-widget__message_type_info")
                        .removeClass("subscribe-form-widget__message_type_error")
                        .text("Вы можете в любой момент отписаться");
                    $buttons
                        .attr("disabled", true)
                        .addClass("subscribe-form-widget__button_disabled");

                    setTimeout(function () {
                        yii.analytics.triggerEvent('SUBSCRIBE_SENT');
                        directCrm('identify', {
                            operation: (pub.isPopup ? 'SubscribeTwo' : 'SubscribeOne'),
                            identificator: {
                                provider: 'email',
                                identity: email
                            },
                            data: {
                                fullName: ($name.length ? $name.val() : '')
                            }
                        });

                        $close.removeClass("subscribe-form-widget__close_disabled");
                        $(".subscribe-form-widget__layout", $widget).removeClass("subscribe-form-widget__layout_active");
                        $(".subscribe-form-widget__layout_type_success", $widget).addClass("subscribe-form-widget__layout_active");
                        $submit
                            .attr("disabled", false)
                            .addClass("subscribe-form-widget__button_close")
                            .removeClass("subscribe-form-widget__button_disabled")
                            .text("Готово");
                        $(".subscribe-form-widget__description", $widget).hide();

                        $form.trigger('SUBSCRIBE_SENT');
                    }, 500);
                } else {
                    $help
                        .addClass("subscribe-form-widget__message_type_error")
                        .removeClass("subscribe-form-widget__message_type_info")
                        .text("Значение «e-mail» не является правильным email адресом");
                }
                return false;
            }
        }

        return pub;
    })();
})(jQuery);
