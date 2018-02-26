$(function () {
    "use strict";
    var $customer_info_form = $('#customer-info-form');
    var $discounts=$('.discounts');
    var $gameDiscount=$('.game-discount', $discounts);
    var $couponDiscount=$('.coupon-discount', $discounts);
    var step = {"1": false, "2": false, "3": false, "4": false};

    window.step = step;

    $('#cart').on('cartLoad', function(){
        if ($(".order-item").length) {
            getCartProducts(function (products) {
                var ecomm_prodid = [];
                var ecomm_totalvalue = 0;
                products.forEach(function (product) {
                    ecomm_prodid.push(product.id);
                    ecomm_totalvalue = ecomm_totalvalue + parseInt(product.price);
                });

                yii.analytics.push({
                    'event': 'fireRemarketingTag',
                    'google_tag_params': {
                        'ecomm_prodid': ecomm_prodid,
                        'ecomm_pagetype': 'cart',
                        'ecomm_totalvalue': ecomm_totalvalue
                    }
                });
                if (!step[1]) {
                    step[1] = true;
                    yii.analytics.push({
                        event: 'checkout',
                        ecommerce: {
                            checkout: {
                                actionField: {step: 1, option: ''},
                                products: products
                            }
                        }
                    });
                }
            });
        }
    });

    $customer_info_form.on('afterValidate', function (event, messages) {
        var $el = $('.order-form .title:first');
        if (messages && $el.length) {
            $('body, html').animate({scrollTop: $el.offset().top}, 400);
        }
    }).on('beforeSubmit', function (e) {
        var form = $(this);
        if (!form.data('is_submiting')) {
            form.data('is_submiting', true);
            yii.analytics.triggerEvent('EC_ORDER_COMPLETE');
            getCartProducts(function (products) {
                for (var i = 1, ii = 4; i <= ii; i++) {
                    if (!step[i]) {
                        step[i] = true;
                        yii.analytics.push({
                            'event': 'checkout',
                            'ecommerce': {
                                'checkout': {
                                    'actionField': {'step': i, 'option': ''},
                                    'products': products
                                }
                            }
                        });
                    }
                }
            });

            var formData = form.serializeArray();
            var orderUser = {
                settlement: '',
                firstName: '',
                mobilePhone: '',
                email: ''
            };
            formData.forEach(function (field) {
                if (field.name == 'OrderForm[first_name]') {
                    orderUser.firstName = field.value;
                } else if (field.name == 'OrderForm[email]') {
                    orderUser.email = field.value;
                } else if (field.name == 'OrderForm[mobile]') {
                    orderUser.mobilePhone = field.value;
                } else if (field.name == 'OrderForm[address]') {
                    orderUser.settlement = field.value;
                }
            });
            $.ajax({
                type: 'post',
                url: form.attr('action'),
                data: form.serialize(),
                success: function (data) {
                    if (data.result) {
                        form[0].reset();
                        form.data().yiiActiveForm.validated = false;
                        var products = [], total_price = 0;
                        var ecomm_prodid = [];
                        var rrOrder = {
                            transaction: data.order_id,
                            items: []
                        };
                        var directProducts = [];
                        var configurator = {};
                        data.info.positions.forEach(function (position) {
                            position.products.forEach(function (product) {
                                if (product.configurator) {
                                    configurator[product.configurator] = 1;
                                }
                                products.push({
                                    name: product.name,
                                    id: product.id,
                                    sku: product.id,
                                    price: product.price,
                                    quantity: product.quantity,
                                    category: product.category,
                                    variant: product.variant,
                                    brand: 'Диван.ру'
                                });
                                rrOrder.items.push({
                                    id: parseInt(product.id),
                                    qnt: product.quantity,
                                    price: product.price
                                });
                                directProducts.push({
                                    productId: product.id,
                                    quantity: product.quantity,
                                    price: product.price
                                });
                                ecomm_prodid.push(product.id);
                            });
                        });
                        total_price = data.info.cost;
                        //yii.analytics.push({
                        //    'event': 'transaction',
                        //    'ecommerce': {
                        //        'purchase': {
                        //            'actionField': {
                        //                'id': data.order_id,
                        //                'revenue': parseInt(total_price),
                        //                'goal_id': '13563730',
                        //            },
                        //            'products': products
                        //        }
                        //    }
                        //});
                        var deliveryMethodDescription = '';
                        var deliveryMethod = $(".delivery-item.active");
                        if (deliveryMethod.length) {
                            if (deliveryMethod.is('.courier')) {
                                deliveryMethodDescription = 'Курьером';
                            }
                            if (deliveryMethod.is('.pickup')) {
                                deliveryMethodDescription = 'Самовывоз';
                            }
                        }

                        var paymentMethodDescription = '';
                        var paymentMethod = $(".pay-item.active");
                        if (paymentMethod.length) {
                            if (paymentMethod.is('.cash')) {
                                paymentMethodDescription = 'Наличными';
                            }
                            if (paymentMethod.is('.bank')) {
                                paymentMethodDescription = 'Банковский перевод';
                            }
                            if (paymentMethod.is('.ecommerce')) {
                                paymentMethodDescription = 'Банковская карта';
                            }
                            if (paymentMethod.is('.courier')) {
                                paymentMethodDescription = 'Наличными курьеру';
                            }
                        }

                        yii.analytics.push({
                            'dimension11': deliveryMethodDescription,
                            'dimension12': paymentMethodDescription
                        });

                        yii.analytics.push({
                            'event': 'EC_CART_ORDERED',
                            'ecommerce': {
                                'purchase': {
                                    'actionField': {
                                        'id': data.order_id,
                                        'revenue': parseInt(total_price)
                                    },
                                    'products': products
                                }
                            },
                            'rrOrder' : rrOrder
                        });
                        yii.analytics.push({
                            'transactionId': data.order_id,
                            'transactionTotal': total_price,
                            'transactionProducts': products
                        });
                        yii.analytics.push({
                            'event': 'fireRemarketingTag',
                            'google_tag_params': {
                                'ecomm_prodid': ecomm_prodid,
                                'ecomm_pagetype': 'purchase',
                                'ecomm_totalvalue': total_price
                            }
                        });
                        directCrm('identify', {
                            operation: 'OrderByAuth',
                            identificator: {
                                provider: 'mobilePhone',
                                identity: orderUser.mobilePhone
                            },
                            data: {
                                settlement: orderUser.settlement,
                                firstName: orderUser.firstName,
                                email: orderUser.email,
                                order: {
                                    webSiteId: data.order_id,
                                    price: total_price,
                                    items: directProducts
                                }
                            }
                        });

                        $.each(configurator, function(key, value) {
                            if (key === 'ConfigurationSofa') {
                                yii.analytics.triggerEvent('UPHOLSTERED_FURNITURE_CONSTRUCTOR_PURCHASE');
                            } else if (key === 'ConfigurationCupboard') {
                                yii.analytics.triggerEvent('CABINET_FURNITURE_CONSTRUCTOR_PURCHASE');
                            }
                        });

                        var user_email = $('#orderform-email').val();
                        if (user_email) {
                            yii.analytics.push({
                                event: 'USER_EMAIL_ENTERED',
                                user_email: user_email
                            });
                        }

                        $.cart('removeAll', true);
                        if (data['bank-card-params'] && data['bank-card-params']['url'] && data['bank-card-params']['params']) {
                            var tmpForm = $('<form/>', {action: data['bank-card-params']['url'], method: 'POST'});
                            $.each(data['bank-card-params']['params'], function (key, val) {
                                tmpForm.append('<input type=\"hidden\" name=\"' + key + '\" value=\"' + val + '\" >');
                            });
                            tmpForm.appendTo('body').submit();
                        } else {
                            var params = {
                                '_shopId': '637',
                                '_bannerId': '1058',
                                '_customerFirstName': orderUser.firstName || '',
                                '_customerLastName': '',
                                '_customerEmail': orderUser.email || '',
                                '_customerPhone': orderUser.mobilePhone || '',
                                '_customerGender': '',
                                '_orderId': data.order_id,
                                '_orderValue': parseInt(total_price),
                                '_orderCurrency': 'RUB',
                                '_usedPromoCode': ''
                            };

                            var iPromoCpnObj = new _iPromoBannerObj(params);
                            iPromoCpnObj.start();
                            $('.order-success').blurdialog('show');
                        }
                    } else {
                        alert('Произошла ошибка. Попробуйте чуть позже.');
                    }
                },
                dataType: 'json',
                complete: function () {
                    form.data('is_submiting', false)
                }
            });
        }
        e.preventDefault();
    }).on('submit', function (e) {
        e.preventDefault();
    });

    $customer_info_form.keypress(function (e) {
        if (e.which == 13 && $('#customer-info-form input, #customer-info-form select, #customer-info-form textarea').is(':focus')) {
            $customer_info_form.submit();
        }
    });

    $('.order .order-form .pay-item').click(function (e) {
        e.preventDefault();
        setPaymentType($(this).data('payment-id'));
    });
    $('.order .order-form .pay-variant-item').click(function (e) {
        e.preventDefault();
        $(this).siblings().removeClass('active');
        $(this).addClass('active');
        $('#orderform-payment_variant').val($(this).data('payment-variant-id'));
        $('#empty_input').focus();
    });
    $('.order .delivery-list .delivery-item').click(function (e) {
        e.preventDefault();
        $(this).siblings().removeClass('active');
        $(this).addClass('active');
        $('#orderform-delivery_type_id').val($(this).data('delivery-id'));
        $('#empty_input').focus();

        var deliveryMethod = $(this).data('delivery-method');
        var fields = $('.order .delivery-methods > div:not(.' + deliveryMethod + ')');
        if (fields.length) {
            $('.order .delivery-methods > div:not(.' + deliveryMethod + ')').fadeOut(function () {
                $('.delivery-methods .' + deliveryMethod).fadeIn().addClass('active');
            });
        } else {
            $('.delivery-methods .' + deliveryMethod).fadeIn().addClass('active');
        }
        setPaymentType($(this).data('default-payment-type-id'));
    });

    $('.coupon-activation-link').click(function () {
        $(this).fadeOut(function () {
            $('.coupon-activation-form').fadeIn();
        });
    });
    $('.order_info_continue_btn').on('click', function (e) {
        e.preventDefault();

        yii.analytics.triggerEvent('EC_ORDER_FORM');
        $('[data-payment-id]').removeClass('active');
        $('.payment-variants').hide();
        $('.order .wrapper-end').fadeIn().addClass("is_show");
        var position = $('#order_form').offset();
        $(".order_info_btn").addClass("is_visible");
        $(".order_info_continue_btn").fadeOut(700, function () {
            $(this).remove();
        });
        $("html, body").animate({scrollTop: position.top - 20}, 700, function () {
            $(".order_submit").addClass("is_visible");
            if ($('#orderform-payment_type_id').val()) {
                setPaymentType($('#orderform-payment_type_id').val());
            }
        });
        $('.pay-list[data-default-payment-type-id]').each(function () {
            $(this).find('a[data-payment-id="' + $(this).data('default-payment-type-id') + '"]').click();
        });
    });
    $('.order_submit').on('click', function (e) {
        e.preventDefault();
        $("#customer-info-form").submit();
    });

    var nameDataSent = false;
    $('#orderform-first_name').keyup(function () {
        if (!step[2]) {
            if ($(this).val().length >= 3 && !nameDataSent) {
                step[2] = true;
                nameDataSent = true;
                getCartProducts(function (products) {
                    yii.analytics.push({
                        event: 'checkout',
                        ecommerce: {
                            checkout: {
                                actionField: {step: 2, option: ''},
                                products: products
                            }
                        }
                    });
                });
            }
        }
    });

    var emailDataSent = false;
    $('#orderform-email').on("change input", function () {
        if (!step[2]) {
            if (isEmail($(this).val()) && !emailDataSent) {
                step[2] = true;
                emailDataSent = true;
                getCartProducts(function (products) {
                    yii.analytics.push({
                        event: 'checkout',
                        ecommerce: {
                            checkout: {
                                actionField: {step: 2, option: ''},
                                products: products
                            }
                        }
                    });
                })
            }
        }
    });

    var mobileDataSent=false;
    $('#orderform-mobile').on("change input", function () {
        if (!step[2]) {
            if (isPhone($(this).val()) && !mobileDataSent) {
                step[2] = true;
                mobileDataSent = true;
                getCartProducts(function (products) {
                    yii.analytics.push({
                        event: 'checkout',
                        ecommerce: {
                            checkout: {
                                actionField: {step: 2, option: ''},
                                products: products
                            }
                        }
                    });
                });
            }
        }
    });

    var addressDataSent = false;
    $('#orderform-address').on("change input", function () {
        if (!step[3]) {
            if ($(this).val().length >= 4 && !addressDataSent) {
                step[3] = true;
                addressDataSent = true;
                getCartProducts(function (products) {
                    yii.analytics.push({
                        event: 'checkout',
                        ecommerce: {
                            checkout: {
                                actionField: {step: 3, option: ''},
                                products: products
                            }
                        }
                    });
                })
            }
        }
    });

    $('.delivery-item.pickup').click(function () {
        if (!step[3]) {
            step[3] = true;
            getCartProducts(function (products) {
                yii.analytics.push({
                    event: 'checkout',
                    ecommerce: {
                        checkout: {
                            actionField: {step: 3, option: ''},
                            products: products
                        }
                    }
                });
            });
        }
    });

    $('.pay-item').click(function () {
        var option = '';
        if ($(this).is('.cash')) {
            option = 'Cash';
        }
        if ($(this).is('.bank')) {
            option = 'Bank';
        }
        if ($(this).is('.ecommerce')) {
            option = 'Ecommerce';
        }
        if ($(this).is('.courier')) {
            option = 'Courier';
        }
        if (!option) {
            return;
        }
        if (!step[4]) {
            step[4] = true;
            getCartProducts(function (products) {
                yii.analytics.push({
                    event: 'checkout',
                    ecommerce: {
                        checkout: {
                            actionField: {step: 4, option: ''},
                            products: products
                        }
                    }
                });
            })
        }
    });

    function isEmail(email) {
        var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        return regex.test(email);
    }

    function isPhone(phone) {
        var regex = /^\+7\(\d{3}\)\d{3}-\d\d-\d\d$/;
        return regex.test(phone);
    };

    function getCartProducts(callback) {
        var products = [];
        $.cart("getCartInfo", function (cartInfo) {
            cartInfo.positions.forEach(function (position) {
                position.products.forEach(function (product) {
                    products.push({
                        name: product.name,
                        id: product.id,
                        price: product.price,
                        dimension7: product.price,
                        category: product.category,
                        brand: 'Диван.ру',
                        variant: product.variant,
                        quantity: product.quantity
                    });
                })
            });
            if (typeof callback == 'function') {
                callback(products)
            }
        });
    }

    $('.static-page-bg, .static-page-content').appendTo('body');

    $('.static-page-blur').click(function (e) {
        e.preventDefault();
        $('.static-page-blur').removeClass('active');
        $(this).addClass('active');
        $('.static-page-content:hidden, .static-page-bg:hidden').fadeIn();
        $('body').css('overflow', 'hidden');
        var id = $(this).attr('id');
        var page = $('#static-' + id);
        $('.blur-modal').hide();
        $('#static-' + id + ':hidden').fadeIn();
    });
    $('.static-page-content > .close, .static-page-bg').click(function (e) {
        e.preventDefault();
        $('.static-page-blur').removeClass('active');
        $('.static-page-content, .static-page-bg').fadeOut(function () {
            $('body').css('overflow', 'visible');
        });
    });

    var setPaymentType = function (newPaymentTypeId) {
        if (newPaymentTypeId != $('#orderform-payment_type_id').val()) {
            $('#orderform-payment_type_id').val(newPaymentTypeId);
        }
        var availablePaymentTypes = $.cart("option", "availablePaymentTypes");
        $('[data-payment-id], [data-payment-variant-id], .payment-types, .payment-variants').hide();
        $('[data-payment-id], [data-payment-variant-id]').removeClass('active');
        var visiblePaymentVariantsCount = 0;
        var deliveryTypeId = $('#orderform-delivery_type_id').val();
        if (deliveryTypeId && deliveryTypeId in availablePaymentTypes) {
            $.each(availablePaymentTypes[deliveryTypeId], function (paymentTypeId, paymentVariants) {
                $('[data-payment-id="' + paymentTypeId + '"]').show();
                if (paymentTypeId == newPaymentTypeId) {
                    $('[data-payment-id="' + paymentTypeId + '"]').addClass('active');
                    var currentPaymentVariant = $('#orderform-payment_variant').val();
                    if (!(currentPaymentVariant in paymentVariants)) {
                        for (var paymentVariant in paymentVariants) {
                            $('#orderform-payment_variant').val(paymentVariant);
                            currentPaymentVariant = paymentVariant;
                            break;
                        }
                    }
                    $.each(paymentVariants, function (paymentVariant, paymentVariantData) {
                        var paymentVariantElement = $('[data-payment-variant-id="' + paymentVariant + '"]');
                        paymentVariantElement.text(paymentVariantData['name']);
                        if (currentPaymentVariant == paymentVariant) {
                            paymentVariantElement.addClass('active');
                        }
                        paymentVariantElement.show();
                        visiblePaymentVariantsCount += 1;
                    });
                }
            });
            $('.payment-types').show();
            $('.payment-variants').toggle(visiblePaymentVariantsCount > 1);
        }
    };

    $('#cart').on("cartChange", function () {
        setPaymentType($('#orderform-payment_type_id').val());
        $('.total_cost').html($(this).cart("option", "cost"));

        var count = $(this).cart("option", "count");
        var discount = $(this).cart("option", "discount");
        var gameDiscount = $(this).cart("option", "gameDiscount");
        var couponDiscount = $(this).cart("option", "couponDiscount");
        var hiddenCount = $(this).cart("option", "hiddenCount");

        if (discount) {
            $('.total_discount span:first').text($(this).cart("option", "discount"));
            $('.discount-total').show();
            if (gameDiscount) {
                $gameDiscount.show();
            } else {
                $gameDiscount.hide();
            }
            if (couponDiscount) {
                $couponDiscount.show();
            } else {
                $couponDiscount.hide();
            }
            $discounts.show();
        } else {
            $discounts.hide();
            $('.discount-total').hide();
        }
        $('.total_count').text(count);
        $('.total_count_ending').each(function () {
            if (count > 1) {
                $(this).text((count == 2 || count == 3 || count == 4) ? 'а' : 'ов');
            } else {
                $(this).text('');
            }
        });
    }).on("cartUpdatePosition", function (event, data) {
        $('.check-order-item[data-cart-position-id=' + data.cartPositionId + '] .count').text(data.quantity);
    });

    $(window).on('scroll', function (e) {
        var order_items_block = $(".order-items");
        var order_info = $('#order_info');
        if (order_items_block.length && order_info.length && $(window).width() >= 1020) {

            var dop_margin = 80,
                order_items_top_pos = order_items_block.offset().top,
                order_items_height = order_items_block.height();

            var order_info_height = order_info.height();

            if ($(window).scrollTop() >= order_items_top_pos - dop_margin) {
                if ($(window).scrollTop() < order_items_top_pos + order_items_height - order_info_height - dop_margin) {
                    order_info.css({
                        'margin-top': $(window).scrollTop() - order_items_top_pos + dop_margin + 5
                    });
                } else {
                    return false;
                }
            }
        } else {
            order_info.css({
                'margin-top': 0
            });
        }
    });

    $(window).on('resize', function (e) {
        var order_items_block = $(".order-items");
        var order_info = $('#order_info');
        if (order_items_block.length && order_info.length && $(window).width() < 1020) {
            order_info.css({
                'margin-top': 0
            });
        }
    });

    $('.order-success .close').click(function (e) {
        e.preventDefault();
        $(this).parent().blurdialog('hide');
    });

    $('.order-items-container').on('click', '.assoc-products-header', function () {
        var $parent = $(this).parents('.assoc-products-wrapper').toggleClass('expanded');
        if ($parent.hasClass('expanded')) {
            $parent.find('.product-images').stop().fadeOut(200, function () {
                $parent.find('.assoc-products-list').stop().slideDown();
            });
        } else {
            $parent.find('.assoc-products-list').stop().slideUp(function () {
                $parent.find('.product-images').stop().fadeIn(200);
            });
        }
    });

    //Скрытие продукта
    $('.order-items').on('click', '.order-item > .close', function (e) {
        e.preventDefault();
        if ($(this).data('clicked')) {
            return false;
        }
        $(this).data('clicked', true);
        var orderWrapper = $(this).closest('.order-wrapper');
        $.cart('hidePosition', {
            cartPositionId: orderWrapper.data('cart-position-id'),
            callback: function (data) {
                $(this).data('clicked', false);
                var $position = $(data.hiddenPositions);
                var $hiddenProducts = $('.hidden-products');
                if ($hiddenProducts.is(':visible')) {
                    $position.hide().prependTo($('.hidden-products-list')).slideDown();
                } else {
                    $position.prependTo($('.hidden-products-list'));
                    $hiddenProducts.slideDown();
                }
                $.each(data.cartInfo.removedPositions, function (k, position) {
                    $('.check-order-item[data-cart-position-id=' + position.id + ']').remove();
                });
                if ($('.order-wrapper').size() == 1) {
                    $('.order-wrap').slideUp(function () {
                        orderWrapper.remove();
                        $('.order-empty').slideDown();
                    });
                } else {
                    orderWrapper.slideUp(function () {
                        $(this).remove();
                    })
                }
                $('html, body').animate({scrollTop: 0}, 400);
            }
        });
    })
        //Изменение количества
        .on('click', '.decrease-item-quantity, .increase-item-quantity', function (e) {
            e.preventDefault();
            var input = $(this).closest(".count-wrapper").find(".item-quantity");
            var quantity = parseInt(input.val());
            if ($(this).hasClass("increase-item-quantity")) {
                quantity++;
            } else {
                quantity--;
            }
            input.val(quantity).change();
        }).on('change', '.item-quantity', function () {
            var positionId = $(this).closest(".order-wrapper").data('cart-position-id');
            var quantity = parseInt($(this).val());
            if (isNaN(quantity) || quantity <= 0) {
                quantity = 1;
                $(this).val(quantity);
            }
            $.cart('update', {"cartPositionId": positionId, "quantity": quantity});
        });

    //Восстановление продукта
    $('.hidden-products').on('click', '.restore-product', function () {
        if ($(this).data('clicked')) {
            return false;
        }
        $(this).data('clicked', true);
        var $hiddenProduct = $(this).parents('.hidden-product');
        $.cart('unhidePosition',
            {
                cartPositionId: $(this).data('restore-position-id'),
                callback: function (data) {
                    $(this).data('clicked', false);
                    var $position = $(data.unhiddenPositions);
                    var $orderWrap = $('.order-wrap');
                    var $orderEmpty = $('.order-empty');
                    if ($orderWrap.is(':visible')) {
                        $position.hide().prependTo($('.order-items-container')).slideDown();
                    } else {
                        $position.prependTo($('.order-items-container'));
                        $orderEmpty.slideUp();
                        $orderWrap.slideDown();
                    }
                    $('.check-order-items').prepend($(data.unhiddenPositionCheckItems));

                    if ($('.hidden-product').size() == 1) {
                        $('.hidden-products').slideUp(function () {
                            $hiddenProduct.remove();
                        });
                    } else {
                        $hiddenProduct.slideUp(function () {
                            $(this).remove();
                        });
                    }
                }
            }
        );
    });

    //Добавление сопутствующего товара
    $('.order-wrap').on('click', '.add-assoc-to-cart', function (e) {
        var productId = $(this).attr('data-assoc-product-id');
        var $orderWrapper = $(this).parents('.order-wrapper');
        var position = {
            shopProductId: productId,
            htmlForNewOrderItem: true,
            callback: function (data) {
                $('.add-assoc-to-cart[data-assoc-product-id=' + productId + ']').each(function () {
                    $(this).siblings('.product-added').show();
                    $(this).remove();
                });
                $(data.newPositionItemHtml).hide().insertAfter($orderWrapper).slideDown();
                $('.check-order-items').prepend($(data.newPositionCheckItemHtml));
            }
        };
        $.cart('put', position);
        yii.analytics.triggerEvent('RELATED_ADDTOCART')
        $(e).off();
    });

    $('.add-related-to-cart').on('click', function (e) {
        e.stopPropagation();
        var productId = $(this).attr('data-related-product-id');
        yii.analytics.push({
            event: 'RR_ADD_TO_CART',
            rr_item_id: productId,
            rr_method: 'RelatedItems'
        });
        var position = {
            shopProductId: productId,
            htmlForNewOrderItem: true,
            callback: function (data) {
                $('.add-assoc-to-cart[data-assoc-product-id=' + productId + '], .add-related-to-cart[data-related-product-id=' + productId + ']').each(function () {
                    $(this).siblings('.product-added').show();
                    $(this).remove();
                });
                $(data.newPositionItemHtml).hide().appendTo($('.order-items-container')).slideDown();
                $('.check-order-items').append($(data.newPositionCheckItemHtml));
            }
        };
        $.cart('put', position);
        yii.analytics.triggerEvent('RELATED_ADDTOCART');
        $(e).off();
    });


    var $related_products = $('.related .catalog-item');
    $related_products.hover(
        function () {
            if ($(this).find('.product-popover').length) {
                var popover = $(this).find('.product-popover');//.clone().prependTo('body').hide().fadeIn(500);
                var position = $(this).position();
                var scrollWrapper = $(this).parents('.scrollWrapper');
                if ((position.left >= 0 && (position.left + popover.width() - ((Math.abs($(this).width() - popover.width())) / 2)) <= scrollWrapper.width()) || scrollWrapper.size() == 0) {
                    popover.css({
                        left: position.left,
                        top: 0
                    }).stop().fadeIn(750);
                }
            }
        },
        function () {
            $(this).find('.product-popover').hide();
        }
    );

    $('.like', $related_products).click(function (e) {
        e.preventDefault();
        yii.compareList.putProduct($(this).closest('.catalog-item[data-product-id]').data('productId'));
    });

    $related_products.on('onAddToCompare', function () {
        var self = $(this);
        self.find('.like').addClass('active');
    });

    $related_products.on('onRemoveFromCompare', function () {
        $(this).find('.like').removeClass('active');
    });


});