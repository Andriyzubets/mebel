'use strict';
(function($){
    $('.contact-forms-popup').each(function() {
        $('form:first', this).on('beforeSubmit', function() {
            var form = $(this);
            var phone = form.find('[name="CallbackForm[phone2]"]').val();
            form.find('[name="CallbackForm[phone]"]').remove();
            form.append(
                $('<input>').attr({
                    'type': 'hidden',
                    'name': 'CallbackForm[phone]',
                    'value': phone
                })
            );

            calltouchRequest(phone)
                .then(null, callbackFallback)
                .then(onSuccess, onError);

            return false;

            function callbackFallback() {
                var deferred = $.Deferred();

                $.ajax({
                    type: 'POST',
                    url: form.data('url'),
                    data: form.serialize(),
                    dataType: 'json'
                }).then(function (data) {
                    if (data['status'] !== 'ok') {
                        if (form.find('input:last').val().length < 16 || form.find('input:last').val().charAt(15) === '_') {
                            deferred.reject(4);
                        } else {
                            deferred.reject(data['message']);
                        }
                    } else {
                        deferred.resolve(3);
                    }
                }, function () {
                    deferred.reject('Ошибка отправки');
                });

                return deferred.promise();
            }

            function onSuccess(data) {
                console.log('CallMe');
                form.closest('.contact-forms-popup').css('height','auto').find('.tab:visible').slideUp(200);
                $('.tab.tab-callback-success').slideDown(200);
                yii.analytics.triggerEvent('CALLBACK_SENT');
                directCrm('identify', {
                    operation: 'CallMe',
                    identificator: {
                        provider: 'mobilePhone',
                        identity: ($("[name='CallbackForm[phone2]']", form).val() || '')
                    },
                    data: {
                        fullName: ($("[name='CallbackForm[name]']", form).val() || '')
                    }
                });
                form[0].reset();
                setTimeout(function () {
                    $('body').click();
                    $('.header .phone-value img').removeClass('effected');
                }, 5000);

                return data;
            }

            function onError(error) {
                if (typeof error === 'string') {
                    alert(error);
                } else if (error === 4) {
                    form.find('.field-callbackform-phone2:first').addClass('has-error');
                }

                return error;
            }
        });

        $('form:last', this).on('beforeSubmit', function() {
            yii.analytics.triggerEvent('FEEDBACK_SENT');
            var form = $(this);
            $.ajax({
                type: 'POST',
                url: form.data('url'),
                data: form.serialize(),
                dataType: 'json',
                success: function (data) {
                    if (data['status'] == 'ok') {
                        form.closest('.contact-forms-popup').css('height','auto').find('.tab:visible').slideUp(200);
                        $('.tab.tab-contact-success').slideDown(200);
                        form[0].reset();
                        setTimeout("$('body').click(); $('.header .phone-value img', this).removeClass('effected');", 5000);
                    } else {
                        alert(data['message']);
                    }
                }
            });
            return false;
        });
    });
    
    $(window).click(function(e) {
        var popup = $('.contact-forms-popup:visible');
        if (popup.length) {
            e = e || event;
            if ($(e.target || e.srcElement).closest('.contact-forms-popup, .header .phone').length == 0) {
                // popup.add('.contact-forms-popup-corner').fadeOut(200);
                $('.header .phone-corner img').removeClass('effected');
            }
        } 
    });
    
    $('.header .phone').click(function() {
        var popup = $('.contact-forms-popup');
        if (popup.is(':visible')) {
            $('img', this).removeClass('effected');
            popup.fadeOut(200);
        } else {
            var offset_left = $(this).offset().left;
            $('img', this).addClass('effected');
            popup
                .each(function() {
                    $('a:first', this).addClass('active');
                    $('a:last', this).removeClass('active');
                })
                .css({
                    'left': offset_left + 'px',
                    'height': 'auto'
                })
                .each(function() {
                    $('.tab', this)
                        .hide()
                        .filter(':has(form)').each(function() { 
                            $('form',this).trigger('reset')[0].reset(); 
                        });
                    $('.tab:first', this).show();
                })
                .fadeIn(300)
        }
        return false;
    });
    
    $('.contact-forms-popup .switch').click(function() {
        var tabClass = '.tab-'+$(this).data('rel');
        $(this).parent().find('.tab:not('+tabClass+')').fadeOut(200).promise().done(function() {
            $(this).parent().find('form').trigger('reset').find('.has-error').removeClass('has-error');
            $(this).parent().find(tabClass).fadeIn(300);
        });
        $(this).parent().find('.switch').removeClass('active');
        $(this).addClass('active');
        return false;
    });

    function calltouchRequest(phone) {
        var deferred = $.Deferred();

        if (!isWorkTime()) {
            deferred.reject(1);
        } else if (!hasCalltouch()) {
            deferred.reject(2);
        } else if (hasCalltouch() && ctCheckCallbackShouldBeProcessed()) {
            var normalizedPhone = normalizePhone(phone);

            ctSendCallbackRequest(normalizedPhone);
            var timer = setInterval(function () {
                var requestStatus = ctGetCallbackRequestStatus();

                if (requestStatus !== 'Попытка отправки заявки на обратный звонок.') {
                    clearInterval(timer);
                    deferred.resolve(requestStatus);
                }
            }, 500);
        } else {
            deferred.resolve(2);
        }

        return deferred.promise();

        function isWorkTime() {
            var time = new Date();
            var timezone = +3;
            var hour = time.getUTCHours() + timezone;

            return hour >= 9 && hour < 22;
        }

        function hasCalltouch() {
            return typeof window.ctCheckCallbackShouldBeProcessed === 'function';
        }

        function normalizePhone(phone) {
            return '+' + phone.toString().replace(/[^0-9\.]/g, '');
        }
    }

})(jQuery);
