(function ($) {
    $(document).on('mouseenter', '.catalog-card', function (event) {
        var $this = $(this);
        var $footer = $('.catalog-card__row_footer', $this);
        var $box = $('.catalog-card__box', $this);
        var height = $this.outerHeight() + $footer.outerHeight(true) - 2 * parseFloat($box.css("top"));

        $box.height(height);
    });

    $(document).on('click', '.catalog-card__action_cart', function () {
        var config = this.getAttribute('data-bem');

        if (config) {
            var bem = JSON.parse(config);

            bem.productID && $.ajax({
                url: '/site/quick-order',
                data: {
                    shopProductId: bem.productID,
                    format: 'json'
                },
                method: 'get'
            }).then(function (data) {
                var options = {
                    'cart_widget': 'sidebar',
                    'data': bem,
                    'shopProductId': data['shop_product_id']
                };

                var parameterValues = JSON.parse(data['parameterValuesJson']);
                if (parameterValues.length) {
                    options.parameterValues = parameterValues;
                }

                $.cart('putWithSidebar', options);
            });
        }

        return false;
    });

    $(document).on('click', '.catalog-card__action_quick-buy', function (event) {
        var $product = $(this).closest('.catalog-card');
        var productID = +$product.attr('data-product-id');

        var productName = $('meta[itemprop="description"]', $product).attr('content');
        var productPrice = (+$product.attr('data-product-price')).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1 ");

        $('.quickBuy').html('<div id="fastorder-wrapper' + productID + '" class="fastorder-wrapper blur">' +
            '    <form id="quick_order_' + productID + '" action="/order/quick-order" method="post">' +
            '        <input type="hidden" name="_csrf">' +
            '        <a href="#" class="close white"></a>' +
            '        Быстрая покупка' +
            '        <div class="title">' + productName + ', <span>' + productPrice + '<span class="rub2"> руб.</span></span></div>' +
            '        <div class="text">' +
            '            <div class="form-group field-quickorderform-first_name">' +
            '                <label class="control-label" for="quickorderform-first_name_' + productID + '">Имя</label>' +
            '                <input type="text" id="quickorderform-first_name_' + productID + '" class="form-control" name="QuickOrderForm[first_name]">' +
            '                <div class="help-block"></div>' +
            '            </div>' +
            '            <div class="form-group field-quickorderform-mobile required">' +
            '                <label class="control-label" for="quickorderform-mobile_' + productID + '"">Мобильный телефон</label>' +
            '                <input type="text" id="quickorderform-mobile_' + productID + '" class="form-control" name="QuickOrderForm[mobile]">' +
            '                <div class="help-block"></div>' +
            '            </div>' +
            '            <div class="form-group field-quickorderform-shop_product_id required">' +
            '                <input type="hidden" id="quickorderform-shop_product_id_' + productID + '" class="form-control" name="QuickOrderForm[shop_product_id]" value="' + productID + '">' +
            '                <div class="help-block"></div>' +
            '            </div>' +
            '            <div class="form-group field-quickorderform-parametervaluesjson">' +
            '                <input type="hidden" id="quickorderform-parametervaluesjson_' + productID + '" class="form-control" name="QuickOrderForm[parameterValuesJson]">' +
            '                <div class="help-block"></div>' +
            '            </div>' +
            '            <div class="form-group field-quickorderform-quantity">' +
            '                <input type="hidden" id="quickorderform-quantity_' + productID + '" class="form-control" name="QuickOrderForm[quantity]">' +
            '                <div class="help-block"></div>' +
            '            </div>' +
            '        </div>' +
            '        <button type="submit" class="colored button" style="font-family:Circe-Light, sans-serif;">Купить</button>' +
            '        <button type="button" class="button clean cancel-form" style="font-family:Circe-Light, sans-serif;">Отменить покупку</button>' +
            '    </form>' +
            '</div>');

        $('#quick_order_' + productID)
            .yiiActiveForm([{
                "id": "quickorderform-first_name",
                "name": "first_name",
                "container": ".field-quickorderform-first_name",
                "input": "#quickorderform-first_name_" + productID,
                "enableAjaxValidation": true,
                "validate": function (attribute, value, messages, deferred, $form) {
                    yii.validation.string(value, messages, {"message": "Значение «Имя» должно быть строкой.", "max": 85, "tooLong": "Значение «Имя» должно содержать максимум 85 символов.", "skipOnEmpty": 1});
                }
            }, {
                "id": "quickorderform-mobile",
                "name": "mobile",
                "container": ".field-quickorderform-mobile",
                "input": "#quickorderform-mobile_" + productID,
                "enableAjaxValidation": true,
                "validate": function (attribute, value, messages, deferred, $form) {
                    yii.validation.required(value, messages, {"message": "Необходимо заполнить «Мобильный телефон»."});
                    yii.validation.compare(value, messages, {"operator": "!=", "type": "string", "compareValue": "+7(903)755-10-55", "skipOnEmpty": 1, "message": "Значение «Мобильный телефон» не должно быть равно «+7(903)755-10-55»."});
                    yii.validation.regularExpression(value, messages, {"pattern": /^\+7\(\d{3}\)\d{3}-\d\d-\d\d$/, "not": false, "message": "Значение «Мобильный телефон» неверно.", "skipOnEmpty": 1});
                }
            }, {
                "id": "quickorderform-shop_product_id",
                "name": "shop_product_id",
                "container": ".field-quickorderform-shop_product_id",
                "input": "#quickorderform-shop_product_id_" + productID,
                "enableAjaxValidation": true,
                "validate": function (attribute, value, messages, deferred, $form) {
                    yii.validation.required(value, messages, {"message": "Необходимо заполнить «Shop Product Id»."});
                    yii.validation.number(value, messages, {"pattern": /^\s*[+-]?\d+\s*$/, "message": "Значение «Shop Product Id» должно быть целым числом.", "skipOnEmpty": 1});
                }
            }, {
                "id": "quickorderform-parametervaluesjson",
                "name": "parameterValuesJson",
                "container": ".field-quickorderform-parametervaluesjson",
                "input": "#quickorderform-parametervaluesjson_" + productID,
                "enableAjaxValidation": true,
                "validate": function (attribute, value, messages, deferred, $form) {
                    yii.validation.string(value, messages, {"message": "Значение «Parameter Values Json» должно быть строкой.", "skipOnEmpty": 1});
                }
            }, {
                "id": "quickorderform-quantity",
                "name": "quantity",
                "container": ".field-quickorderform-quantity",
                "input": "#quickorderform-quantity_" + productID,
                "enableAjaxValidation": true,
                "validate": function (attribute, value, messages, deferred, $form) {
                    yii.validation.number(value, messages, {"pattern": /^\s*[+-]?\d+\s*$/, "message": "Значение «Quantity» должно быть целым числом.", "min": 1, "tooSmall": "Значение «Quantity» должно быть не меньше 1.", "skipOnEmpty": 1});
                }
            }], [])
            .on('beforeSubmit', function (e) {
                var form = $(this);
                if (form.data('is_submitting')) {
                    return false;
                }
                yii.analytics.triggerEvent('EC_QUICKORDER_FORM');
                form.data('is_submitting', true);
                var $name = $("[name='QuickOrderForm[first_name]']", form);
                var $phone = $("[name='QuickOrderForm[mobile]']", form);
                $.post(form.attr('action'), form.serialize(), function (data) {
                    var dialog = $('#fastorder-wrapper' + productID);
                    var message = null;
                    if (data.result) {
                        var products = [];
                        var directCrmProducts = [];
                        (data.analytics_data.positions || []).forEach(function (position) {
                            (position.products || []).forEach(function (product) {
                                products.push({
                                    name: product.name,
                                    id: product.id,
                                    sku: product.id,
                                    price: parseInt(product.price),
                                    quantity: product.quantity,
                                    category: product.category,
                                    brand: 'Диван.ру'
                                });
                                directCrmProducts.push({
                                    productId: product.id,
                                    quantity: product.quantity,
                                    price: parseInt(product.price)
                                });
                            });
                        });

                        try {
                            yii.analytics.push({
                                event: 'EC_CART_ORDERED',
                                ecommerce: {
                                    purchase: {
                                        actionField: {
                                            id: data.analytics_data.order_info.id,
                                            revenue: parseInt(data.analytics_data.order_info.cost)
                                        },
                                        products: products
                                    }
                                }
                            });
                        } catch(e) {}
                        try {
                            directCrm('identify', {
                                operation: 'OneClickBuy',
                                identificator: {
                                    provider: 'mobilePhone',
                                    identity: ($phone.length ? $phone.val() : '')
                                },
                                data: {
                                    fullName: ($name.length ? $name.val() : ''),
                                    order: {
                                        webSiteId: data.analytics_data.order_info.id,
                                        price: parseInt(data.analytics_data.order_info.cost),
                                        items: directCrmProducts
                                    }
                                }
                            });
                        } catch(e) {}

                        var time = Date.now || function () {
                            return +new Date;
                        };
                        message = $('<div class="order-success"><a href="#" class="close white"></a>Быстрая покупка<div class="title">Это успех, друг!</div><div class="text">Ваш заказ успешно оформлен. О любом изменении статуса мы будем информировать вас по телефону. Спасибо!</div><a class="colored button" href="/">Перейти на главную страницу</a></div>');
                    } else {
                        message = $('<div class="order-success"><a href="#" class="close white"></a>Быстрая покупка<div class="title">Ошибка...</div><div class="text">При оформлении заказа произошла ошибка. Попробуйте чуть позже.</div><a class="colored button" href="/">Перейти на главную страницу</a></div>');
                    }
                    message && form.fadeOut(500, function () {
                        message.on("click", ".close", function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            dialog.blurdialog('hide');
                        });
                        dialog.one("ct-blurdialog.afterHide", function () {
                            message.off().remove();
                            dialog.parent().remove();
                        });
                        form.hide().after(message);
                    });
                    form.data('is_submitting', false);
                    form[0].reset();
                    form.data().yiiActiveForm.validated = false;
                }, 'json');
                e.preventDefault();
            }).on('submit', function (e) {
            e.preventDefault();
        });

        $('#fastorder-wrapper' + productID).blurdialog('show');
        $('#fastorder-wrapper' + productID + ' [name="QuickOrderForm[mobile]"]').inputmask({"mask": "+7(999)999-99-99"});

        $('#fastorder-wrapper' + productID + ' .close, #fastorder-wrapper' + productID + ' .cancel-form').click(function (e) {
            var dialog = $('#fastorder-wrapper' + productID);
            dialog.one("ct-blurdialog.afterHide", function () {
                dialog.parent().remove();
            }).blurdialog('hide');

            return false;
        });

        try {
            window.ga('send', 'pageview', '/virtual/fast-buy/');
        } catch(e) {}
        try {
            yii.analytics.triggerEvent('EC_QUICKORDER');
        } catch(e) {}
        $.ajax({
            url: '/site/quick-order',
            data: {
                shopProductId: productID,
                format: 'json'
            },
            method: 'get'
        }).then(function (data) {
            console.log(data);
            $('#fastorder-wrapper' + productID + ' [name="QuickOrderForm[shop_product_id]"]').val(data['shop_product_id']);
            $('#fastorder-wrapper' + productID + ' [name="QuickOrderForm[parameterValuesJson]"]').val(data['parameterValuesJson'] || '[]');
            $('#fastorder-wrapper' + productID + ' [name="QuickOrderForm[quantity]"]').val(data['quantity']);
        });

        return false;
    });

    if ('compareList' in yii) {
        $(document).on('click', '.catalog-card__like', function (event) {
            var $product = $(this).closest('.catalog-card');
            var productID = +$product.attr('data-product-id');

            yii.compareList.putProduct(productID);

            return false;
        });

        $(document).on('onAddToCompare', function (event, productID) {
            $('.catalog-card[data-product-id=' + productID + '] .catalog-card__like').addClass('catalog-card__like_active');
        });

        $(document).on('onRemoveFromCompare', function (event, productID) {
            $('.catalog-card[data-product-id=' + productID + '] .catalog-card__like').removeClass('catalog-card__like_active');
        });
    }
}(jQuery));
