;(function ($) {
    var analyticsStep = null;
    var analytics = {
        0: 'DIVAN_CONSTRUCTOR_PAGEVIEW',
        1: 'DIVAN_CONSTRUCTOR_FURNITURE_TYPE',
        2: 'DIVAN_CONSTRUCTOR_FURNITURE_OPTIONS',
        3: 'DIVAN_CONSTRUCTOR_FURNITURE_UPHOLSTERY',
        4: 'DIVAN_CONSTRUCTOR_CHECKOUT'
    };

    var shopProductId = null;
    var parameterValues = [];
    var updateStep2Request = null;
    var updateStep3Request = null;
    var updateStep4Request = null;
    var priceAndImageRequest = null;
    var availableValuesRequest = null;
    var selectedFabrics = {};
    var currentStep;
    var lastY = 0;
    var stepsTitles = {
        1: '',
        2: '2. Выбор параметров',
        3: '3. Выбор обивки',
        4: '4. Оформление заказа'
    };
    var $body = $('body');
    var isMobileMode = $body.hasClass('mobile-body');

    $(function () {
        analyticsStep = 0;
        yii.analytics.triggerEvent(analytics[analyticsStep]);
    });

    function areAllFabricsSelected() {
        return $('.fabrics-selector .tabs li a[data-parameter-id]').length == getSelectedFabricsAsArray().length + 2;
    }

    function canGotoStep(step) {
        if (step == 1 || step <= currentStep) {
            return true;
        } else if (step > currentStep && shopProductId) {
            if (step == 2) {
                return true;
            } else if (step == 3) {
                return true;
            } else if (step == 4 && areAllFabricsSelected()) {
                return true;
            }
        }
        return false;
    }

    function gotoStep(step) {
        $.fn.fullpage.moveTo(step);
    }

    $('[data-step]').click(function () {
        gotoStep($(this).data('step') + 1);
    });

    $('.steps-pages').fullpage({
        verticalCentered: false,
        keyboardScrolling: false,
        onLeave: function (index, nextIndex) {
            var step = nextIndex - 1;
            if (!canGotoStep(step)) {
                return false;
            }

            step = +step;
            if (step == 1) {
                analyticsStep = 0;
                yii.analytics.triggerEvent(analytics[analyticsStep]);
            } else if (step > analyticsStep) {
                for (var j = analyticsStep > 1 ? analyticsStep + 1 : 2, jj = step; j <= jj; j++) {
                    yii.analytics.triggerEvent(analytics[j]);
                }
                analyticsStep = step;
            }

            var $smallHeader = $('.small-header');
            var complete;
            var $productNameFixed = $('.product-name-fixed');
            var $mobileHeader = $('#header');
            if (step == 0) {
                complete = function () {
                    $smallHeader.hide();
                };
                if ($mobileHeader.length > 0) {
                    $mobileHeader.css({top: 0, opacity: 1});
                    $('.steps-panel').addClass('on-step0');
                }
            } else {
                $smallHeader.show();
                complete = function () {
                };
                if ($mobileHeader.length > 0) {
                    $mobileHeader.css({top: '-75px', opacity: 0});
                    $('.steps-panel').removeClass('on-step0');
                }
            }
            $productNameFixed.toggle(step > 1);
            $smallHeader.find('.step-title').text(stepsTitles[nextIndex - 1]);
            $smallHeader.animate({top: (step == 1 ? -115 : 0)}, {complete: complete});
            if (step == 3) {
                updateFabricTabs();
            }
            $('.new-sofa-btn').css('display', (step == 4 ? 'inline' : 'none'));
            $('.steps-panel .step').removeClass('active').removeClass('previous');
            $('.steps-panel .step[data-step=' + step + ']').addClass('active');
            if (step > 1) {
                for (var i = step - 1; i > 0; i--) {
                    $('.steps-panel .step' + i).addClass('previous');
                }
            }
            updateStepsAccessibility();
            hideDetails();
            return true;
        },
        afterLoad: function (anchorLink, index) {
            $('.step-page').show();
            var $mobileHeader = $('#header');
            if (!$mobileHeader.length) {
                $('.steps-pages .section:first').hide();
            }
            currentStep = index - 1;
        },
        afterRender: function () {
            var $mobileHeader = $('#header');
            if (!$mobileHeader.length) {
                $('.steps-panel .step[data-step=1]').addClass('active');
            }
        }
    });
    $.fn.fullpage.setAllowScrolling(false);

    // Переключение вкладок с типами товаров
    $('.step1-page ul.types-tabs li').click(function () {
        if (analyticsStep < 1) {
            analyticsStep = 1;
            yii.analytics.triggerEvent(analytics[analyticsStep]);
        }
        $('.step1-page ul.types-tabs li').removeClass('active');
        $(this).addClass('active');
        $('.step1-page .tab-content').removeClass('active');
        var $activeTab = $('#' + $(this).data('tab-content'));
        var $slider = $activeTab.find('.items-slider');
        $activeTab.addClass('active').find('.items-scroll-wrapper').mCustomScrollbar('update');
        $slider.sly('reload');
        $slider.sly('slideTo', 0, true);
        $activeTab.find('.model-card:first').click();
    });

    // Выбор модели
    $('.step1-page .model-card').click(function () {
        if ($(this).data('shop-product-id') != shopProductId) {
            shopProductId = $(this).data('shop-product-id');
            $('.model-card').removeClass('active');
            $('[data-shop-product-id=' + shopProductId + ']').addClass('active');
            $('.product-name').text($(this).data('shop-product-name'));
            updateStep23Page();
            updateStepsAccessibility();
        } else {
            gotoStep(3);
        }
    });

    $('.step1-page .items-scroll-wrapper').mCustomScrollbar({
        theme: 'custom-light',
        scrollInertia: 300,
        advanced: {updateOnContentResize: false}
    });

    function resizeScrollAreas() {
        var footerHeight = $('.step-footer:visible').outerHeight();
        var $tabs = $('.step1-page .tab-content .items-scroll-wrapper');
        var $visibleTab = $('.step1-page .tab-content .items-scroll-wrapper:visible');
        if ($visibleTab.length > 0) {
            var tabsTop = $visibleTab.position().top;
            $tabs.css('height', ($(window).height() - tabsTop - footerHeight) + 'px');
        }
        var $step2Container = $('.step2-page .steps-panel-margin');
        if ($step2Container.length) {
            $step2Container.css('height', ($(window).height() - ($step2Container.offset().top - $('.step2-page').offset().top) - footerHeight) + 'px');
        }
        var $fabricTabsContent = $('.fabrics-selector .bottom');
        if ($fabricTabsContent.length) {
            var fabricTabsContentTop = $('.fabrics-selector .bottom.active .materials-wrapper').offset().top - $('.step3-page').offset().top;
            $fabricTabsContent.find('.materials-wrapper').css('height', ($(window).height() - fabricTabsContentTop - footerHeight) + 'px');
            disposeImageHints();
        }
        var $step4Container = $('.step4-page .steps-panel-margin');
        if ($step4Container.length) {
            $step4Container.css('height', ($(window).height() - ($step4Container.offset().top - $('.step4-page').offset().top) - footerHeight) + 'px');
        }
    }

    resizeScrollAreas();
    $(window).on('resize', resizeScrollAreas);

    function disposeImageHints() {
        var factorX = 1;
        var factorY = 1;
        var $image = $('.step3-img');
        var imageOrigWidth = $image.data('original-width');
        var imageOrigHeight = $image.data('original-height');
        if (imageOrigWidth && imageOrigHeight) {
            factorX = $image.width() / imageOrigWidth;
            factorY = $image.height() / imageOrigHeight;
        }
        var imagePosition = $image.position();
        $('.img-hint').each(function () {
            $(this).css({
                left: factorX * $(this).data('x') + imagePosition.left,
                top: factorY * $(this).data('y') + imagePosition.top
            })
        });
    }

    function updateStep23Page() {
        if (updateStep2Request) {
            updateStep2Request.abort();
        }
        $('.step2-page').html('');
        $('.step3-page').html('');
        updateStep2Request = $.ajax({
            url: '/sofa-constructor/step2?shopProductId=' + shopProductId,
            success: function (data) {
                $('.step2-page').html(data);
                resizeScrollAreas();
                $('.step2-page .steps-panel-margin').mCustomScrollbar({
                    theme: 'custom-light'
                });
                updateStep2Request = null;
                updateStepsAccessibility();
                // Запуск расчета связанных характристик
                $('select.parameter-collection, .parameter-collection > input[name="parameterValues\\[\\]"]').eq(0).change();

                var modules = $('.step2-page .modules .shop-product-module');
                if (modules.size()) {
                    modules.shopProductModule({
                        onChange: function () {
                            updatePriceAndImage();
                        }
                    });
                }
            }
        });
        if (updateStep3Request) {
            updateStep3Request.abort();
        }
        selectedFabrics = {};
        updateStep3Request = $.ajax({
            url: '/sofa-constructor/step3?shopProductId=' + shopProductId,
            success: function (data) {
                $('.step3-page').html(data);
                updateFabricTabs();
                resizeScrollAreas();
                disposeImageHints();
                $('.step3-page .fabrics-selector .bottom .materials-wrapper').mCustomScrollbar({
                    theme: 'custom-light',
                    advanced: {updateOnContentResize: false}
                });
                updateStep3Request = null;
                updateStepsAccessibility();

                var $fabricsSelector = $('.fabrics-selector').first();
                if ($fabricsSelector.length) {
                    var fabricFilterOptions = JSON.parse($fabricsSelector.attr('data-options'));

                    new FabricFilter(fabricFilterOptions);
                }
                $(window).resize();
            }
        });
    }

    function updateStep4Page() {
        if (updateStep4Request) {
            updateStep4Request.abort();
        }
        updateStep4Request = $.ajax({
            url: '/sofa-constructor/step4',
            method: 'post',
            data: {
                shopProductId: shopProductId,
                parameterValues: getParameterValues(),
                fabricValues: getSelectedFabricsAsArray(),
                image: $('.step2-img').attr('src')
            },
            success: function (data) {
                $('.step4-page').html(data);
                resizeScrollAreas();
                $('.step4-page .steps-panel-margin').mCustomScrollbar({
                    theme: 'custom-light'
                });
                updateStep4Request = null;
                updateStepsAccessibility();
            }
        });
    }

    function updatePriceAndImage() {
        if (priceAndImageRequest) {
            priceAndImageRequest.abort();
        }
        priceAndImageRequest = $.ajax({
            url: '/shop-product/info-by-params?image=1&price=1',
            method: 'post',
            data: {
                shopProductId: shopProductId,
                parameterValues: getParameterValues(),
                fabricValues: getSelectedFabricsAsArray()
            },
            success: function (result) {
                if ('price' in result && 'image' in result) {
                    $('.product-price').html(result['price']['view']);
                    $('.step2-img').attr('src', result['image']);
                    $('.step3-img').attr('src', result['image']);
                }
                (result['modules'] || []).forEach(function (module) {
                    var $module = $('.step2-page .modules .shop-product-module[data-module-id="' + module.id + '"]');

                    $('.image img', $module).attr('src', module.image);
                    $('.price-value', $module).html(module.price.view);
                });

                priceAndImageRequest = null;
                updateStepsAccessibility();
                resizeScrollAreas();
                disposeImageHints();
                // Если выбраны все ткани, то обновляем страницу для шага 4
                if (areAllFabricsSelected()) {
                    updateStep4Page();
                }
            }
        });
    }

    function getParameterValues() {
        var result = [];
        $('select.parameter-value').each(function () {
            var val = $(this).val();
            if (val) {
                if ($.isArray(val)) {
                    $(val).each(function () {
                        result.push({id: this, count: 1});
                    })
                } else {
                    result.push({id: val, count: 1});
                }
            }
        });
        $('.parameter-value:checked').each(function () {
            var val = $(this).val();
            if (val) {
                result.push({id: val, count: 1});
            }
        });
        $('.parameter-values-list-item.selected').each(function () {
            var item = $(this);
            var val = {id: item.attr('data-parameter-value-id'), count: 1};
            var count = item.find('.count');
            if (count.size() > 0) {
                val.count = count.val();
            }
            result.push(val);
        });
        $('.modules .shop-product-module').each(function () {
            var moduleId = $(this).data('module-id');
            var count = $(this).find('.item-quantity').val();

            result.push({id: moduleId, count: count});
        });
        return result;
    }

    function getSelectedFabricsAsArray() {
        var result = [];
        $.each(selectedFabrics, function (parameterId, fabricId) {
            result.push({parameter_id: parameterId, fabric_id: fabricId});
        });
        return result;
    }

    function setFabricValue(parameterId, fabricId, updateImage) {
        var image = $('.materials .image[data-parameter-id=' + parameterId + '][data-fabric-id=' + fabricId + ']'),
            fabric_id = image.data('fabric-id'),
            parameter_id = image.data('parameter-id'),
            title = image.data('detail-title'),
            curMaterial = (parameter_id in selectedFabrics ? selectedFabrics[parameter_id] : null),
            bottom = image.closest('.bottom'),
            prev = bottom.next('.prev').find('ul'),
            fabricsSelector = image.closest('.fabrics-selector'),
            i = fabricsSelector.find('.tabs a[data-name=' + bottom.data('name') + '] i'),
            hint = $('.fabrics-preview .img-hint[data-parameter-id=' + parameterId + ']');
        if (curMaterial == fabric_id) {
            return false;
        }
        bottom.find(' .title').find('.name').text(title);
        $('.fabrics-preview .img-hint.active').removeClass('active');
        hint.find('.hint-title-value').text(image.data('hint-title'));
        ajustMarkHint();
        i.css({'background-image': image.css('background-image'), 'border': 'none'});
        var $allMaterials = $('.materials .image[data-parameter-id=' + parameterId + ']');
        $allMaterials.removeClass('active');
        image.addClass('active');
        if (isMobileMode) {
            // Фикс неотрисовки в мобильных браузерах
            var borderColor = image.css('border-color');
            $allMaterials.css({'border-color': $allMaterials.css('border-color')});
            image.css({'border-color': borderColor});
            image.css({'border-color': ''});
        }
        if (prev.find('li[data-fabric-id=' + fabric_id + ']').size() == 0) {
            var new_item = $('<li>');
            new_item.css('background', 'url(' + image.data('detail-image') + ')');
            new_item.attr({
                'data-parameter-id': parameter_id,
                'data-fabric-id': fabric_id
            });
            new_item.hide();
            prev.prepend(new_item);
            new_item.fadeIn();
        }
        if (prev.children().size() > 5) {
            prev.children().last().remove();
        }
        if (prev.children().size() > 0) {
            prev.parent().css('visibility', 'visible');
        }
        bottom.scrollTop(0);
        if (parameter_id == 'all') {
            $('.fabrics-selector .tabs li a[data-parameter-id]').each(function () {
                var parameterId = $(this).data('parameter-id');
                if (parameterId != 'all') {
                    setFabricValue(parameterId, fabricId, false);
                }
            });
        } else {
            selectedFabrics[parameter_id] = fabric_id;
        }
        if (updateImage) {
            $('.step4-page').html('');
            updatePriceAndImage();
        }
    }

    function updateStepsAccessibility() {
        $('[data-step]').removeClass('available');
        $.each([1, 2, 3, 4], function (i, step) {
            if (canGotoStep(step)) {
                $('[data-step=' + step + ']').addClass('available');
                if (step == 3) {
                    $(window).resize();
                }
            }
        });
    }

    function updateFabricTabs() {
        var $fabricsTabsSly = $('#fabrics-tabs-sly');
        if ($fabricsTabsSly.length) {
            $fabricsTabsSly.find('ul li').each(function () {
                $(this).width(Math.ceil($(this).width()));
            });
            $fabricsTabsSly.sly('reload');
            $('.fabrics-selector a[data-name=fabricall]:visible').trigger({type: 'click', originalEvent: {slyignore: true}});
        }
    }

    /**
     * Number.prototype.format(n, x, s, c)
     * @param n: length of decimal
     * @param x: length of whole part
     * @param s: sections delimiter
     * @param c: decimal delimiter
     */
    Number.prototype.format = function (n, x, s, c) {
        var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
            num = this.toFixed(Math.max(0, ~~n));

        return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
    };

    function showDetails($jObject, title, text, image, noRepeat, wide) {
        title = title || '';
        text = text || '';
        image = image || '';
        noRepeat = noRepeat || false;
        var details = $('.sofa-constructor').find('.details'),
            $detailsImage = details.find('>.top'),
            $detailsTitle = details.find('> .bottom > .title'),
            $detailsDescription = details.find('> .bottom > .descr');
        details.stop();
        if (image) {
            var cropConfig = $jObject.data('crop');

            if (cropConfig) {
                cropConfig = cropConfig.split('|');
                var cropX = +cropConfig[0] || 0;
                var cropY = +cropConfig[1] || 0;
                var cropWidth = +cropConfig[2] || null;
                var cropHeight = +cropConfig[3] || null;

                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                var imageObj = new Image();

                canvas.height = cropHeight;
                canvas.width = cropWidth;

                console.log(cropX, cropY, cropWidth, cropHeight);

                imageObj.onload = function() {
                    ctx.drawImage(imageObj, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
                    if (noRepeat) {
                        $detailsImage.addClass('no-repeat');
                    } else {
                        $detailsImage.removeClass('no-repeat');
                    }
                    if (wide) {
                        $detailsImage.addClass('wide');
                    } else {
                        $detailsImage.removeClass('wide');
                    }
                    $detailsImage.css({
                        'background-image': 'url(' + canvas.toDataURL() + ')',
                        'background-size': '100% auto'
                    }).show();
                };
                imageObj.src = image;
            } else {
                $detailsImage.css({
                    'background-image': 'url(' + image + ')',
                    'background-size': 'auto auto'
                }).show();
            }
        } else {
            $detailsImage.hide();
        }
        if (title) {
            $detailsTitle.html(title).show();
        } else {
            $detailsTitle.hide();
        }
        if (text) {
            $detailsDescription.html(text).show();
        } else {
            $detailsDescription.hide();
        }
        var left = $jObject.offset().left + $jObject.outerWidth() / 2;
        var top = $jObject.offset().top + $jObject.outerHeight() / 2 - details.outerHeight() / 2;
        var hoverImage = $jObject.hasClass('image') ? $jObject : $jObject.find('.parameter-values-list-image');
        var hoverParent = $jObject.closest('.sofa-constructor');
        if (hoverImage.length && hoverParent.length) {
            top = (hoverImage.offset().top - hoverParent.offset().top) - details.outerHeight() + hoverImage.height() / 2;
        }
        if (left + details.outerWidth() > $(window).width()) {
            left -= details.outerWidth();
        }
        if (top < 0) {
            top += details.outerHeight();
        }
        details.css('left', left).css('top', top).delay(500).fadeIn();
    }

    function hideDetails() {
        $('.sofa-constructor').find('.details').stop().hide();
    }

    function ajustMarkHint() {
        var $activeHint = $('.fabrics-preview .img-hint.active');
        if ($activeHint.length > 0) {
            var $hintTitle = $activeHint.find('.hint-title');
            var $fabricPreview = $('.fabrics-preview');
            var isLeftOverflow = $hintTitle.offset().left < $fabricPreview.offset().left;
            if (isLeftOverflow) {
                $hintTitle.css({right: 'auto', left: '120%'});
            }
        }
    }

    function showParameterHint($parameterValue) {
        if (isMobileMode) {
            return;
        }
        var $parent = $parameterValue.parent('.wmp-dropdown');
        var $hint = $('.parameter-hint');
        var $hintCorner = $('.parameter-hint-corner');
        $hint.find('.parameter-hint-image img').attr('src', ''); // Сначала сбрасываем картинку, чтобы GIF-ка отыграла еще раз
        $hint.find('.parameter-hint-image img').attr('src', $parent.data('hint-image'));
        $hint.find('.parameter-hint-text').html($parent.data('hint-text'));
        $hint.add($hintCorner).fadeToggle(!$parameterValue.hasClass('active-hint'));
        $parameterValue.toggleClass('active-hint');
        var selectOffset = $parameterValue.offset();
        var hintOffset = $hint.offset();
        $hint.css({
            top: parseInt($hint.css('top')) + selectOffset.top - hintOffset.top - $hint.height() - 16,
            left: parseInt($hint.css('left')) + selectOffset.left - hintOffset.left
        });
        $hintCorner.css({
            top: parseInt($hint.css('top')) + $hint.height(),
            left: parseInt($hint.css('left')) + $parameterValue.outerWidth() - 28
        });
    }

    function hideParameterHint(event) {
        var $parameterHint = $('.parameter-hint:visible');
        if ($parameterHint.length) {
            if (!event || $(event.target || event.srcElement).closest('.parameter-hint, .wmp-dropdown-select').length == 0) {
                $parameterHint.add('.parameter-hint-corner').fadeOut(200);
                $('.wmp-dropdown-select.active-hint').removeClass('active-hint');
            }
        }
    }

    $('#quickOrderForm')
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
                if (data.result) {
                    if (data['analytics_data']) {
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
                        yii.analytics.triggerEvent('DIVAN_CONSTRUCTOR_QUIK_BUY');
                        window.dataLayer.push({
                            event: 'EC_CART_ORDERED',
                            ecommerce: {
                                purchase: {
                                    actionField: {
                                        id: data['analytics_data']['order_info']['id'],
                                        revenue: parseInt(data['analytics_data']['order_info']['cost'])
                                    },
                                    products: products
                                }
                            }
                        });
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
                    }
                } else {
                    alert('Произошла ошибка. Попробуйте чуть позже.');
                }
                form.data('is_submitting', false);
                form[0].reset();
                form.data().yiiActiveForm.validated = false;
                $('.fastorder-form').fadeOut(200, function () {
                    $('.fastorder-success').fadeIn(400);
                });
            }, 'json');
            e.preventDefault();
        })
        .on('submit', function (e) {
            e.preventDefault();
        });

    $('.fastorder-wrapper .close, .cancel-form').click(function (e) {
        e.preventDefault();
        $('.fastorder-wrapper').blurdialog('hide');
    });

    $body
        .on('click', '.items-slider-wrapper .slide-left.active', function () {
            var $slider = $(this).closest('.items-slider-wrapper').find('.items-slider');
            Sly.getInstance($slider.get(0)).prevPage();
        })
        .on('click', '.items-slider-wrapper .slide-right.active', function () {
            var $slider = $(this).closest('.items-slider-wrapper').find('.items-slider');
            Sly.getInstance($slider.get(0)).nextPage();
        })
        .on('change', 'select.parameter-value, .parameter-values-list-values', function () {
            updatePriceAndImage();
        })
        .on('change', 'select.parameter-collection, .parameter-collection > input[name="parameterValues\\[\\]"]', function () {
            var $collectionParameters = $('select.parameter-collection, .parameter-collection > input[name="parameterValues\\[\\]"]');
            var index = $collectionParameters.index(this);
            if (index + 1 == $collectionParameters.length) {
                return;
            }
            var $nextInput = $collectionParameters.eq(index + 1);
            var $prevInputs = $collectionParameters.slice(0, index + 1);
            var prevParametersValues = [];
            var data = {};

            $prevInputs.each(function () {
                var $prevInput = $(this);
                var prevInputValue = $prevInput.val();
                var parameterID = $prevInput.attr('data-parameter-id');
                if ($prevInput.is('select')) {
                    if (prevInputValue) {
                        prevParametersValues.push(prevInputValue);
                    }
                } else {
                    prevInputValue = JSON.parse(decodeURIComponent(prevInputValue));
                    $.each(prevInputValue, function (key, value) {
                        if (value['id']) {
                            prevParametersValues.push(value['id']);
                        }
                    });
                }
                if (prevParametersValues.length) {
                    data[parameterID] = prevParametersValues;
                }
            });
            availableValuesRequest = $.ajax({
                url: '/shop-product/available-values',
                data: {
                    shopProductId: shopProductId,
                    prevParametersValues: data,
                    parameterId: $nextInput.data('parameter-id')
                },
                dataType: 'json',
                success: function (data) {
                    if ($nextInput.is('select')) {
                        $nextInput.empty();
                        $.each(data, function (key, value) {
                            var $option = $("<option>", {"value": value.id}).text(value.text);
                            $.each(value, function (attr, attrValue) {
                                $option.attr('data-' + attr, attrValue);
                            });
                            $nextInput.append($option);
                        });
                        $nextInput.change();
                    } else {
                        var $parameterValuesContainer = $nextInput.closest('.parameter-collection');
                        var isRequiredParameter = ($parameterValuesContainer.data('is-required') == 1);
                        var selectedValueId = $parameterValuesContainer.find('.parameter-values-list-item.selected').data('parameter-value-id');
                        $parameterValuesContainer.find('.parameter-values-list-item').removeClass('selected').hide();
                        var selectedValueContainer = false;
                        var firstValueContainer = false;
                        $.each(data, function (key, value) {
                            var parameterValueContainer = $parameterValuesContainer.find('.parameter-values-list-item[data-parameter-value-id="' + value.id + '"]');
                            parameterValueContainer.show();
                            if (selectedValueId && (value.id == selectedValueId)) {
                                selectedValueContainer = parameterValueContainer;
                            }
                            firstValueContainer = firstValueContainer ? firstValueContainer : parameterValueContainer;
                        });
                        if (!selectedValueContainer && isRequiredParameter) {
                            selectedValueContainer = firstValueContainer;
                        }
                        if (selectedValueContainer) {
                            selectedValueContainer.click();
                        }
                    }
                    availableValuesRequest = null;
                }
            });
        })
        .on('click', '.wmp-dropdown.readonly.has-hint > .wmp-dropdown-select', function () {
            showParameterHint($(this));
        })
        .on('click', '.fabrics-selector .tabs a', function (e) {
            e.preventDefault();
            $('.fabrics-selector .tabs a').removeClass('active');
            $('.fabrics-selector .tabs a[data-name=' + $(this).data('name') + ']').addClass('active');
            $('.fabrics-selector .bottom').removeClass('active');
            $('.fabrics-selector').find('.bottom[data-name=' + $(this).data('name') + ']')
                .addClass('active')
                .find('.materials-wrapper')
                .mCustomScrollbar('update');
        })
        .on('click', '.materials .image', function (e) {
            e.preventDefault();
            var fabricParameterId = $(this).data('parameter-id');
            var fabricId = $(this).data('fabric-id');
            setFabricValue(fabricParameterId, fabricId, true);
            if (fabricParameterId != 'all') {
                $('.materials .image[data-parameter-id=all]').removeClass('active');
            }
        })
        .on('mouseover', '.materials .image', function () {
            showDetails($(this), $(this).data('detail-name'), $(this).data('detail-text'), $(this).data('detail-image'), false, true);
        })
        .on('mouseout', '.materials .image', function () {
            hideDetails();
        })
        .on('mouseover', '.parameter-values-list-item', function () {
            if ($(this).data('parameter-value-view')) {
                showDetails($(this), $(this).data('parameter-value-title'), $(this).data('parameter-value-description'),
                    $(this).data('parameter-value-image'), true, true);
            }
        })
        .on('mouseout', '.parameter-values-list-item', function () {
            hideDetails();
        })
        .on('click', '.prev li', function () {
            var self = $(this);
            setFabricValue(self.data('parameter-id'), self.data('fabric-id'), true);
        })
        .on('click', '.fabrics-preview .img-hint', function (e) {
            e.preventDefault();
            $('.fabrics-preview .img-hint.active').not(this).click();
            $(this).toggleClass('active');
            if ($(this).hasClass('active')) {
                ajustMarkHint();
                $('.fabrics-selector .tabs li a[data-parameter-id=' + $(this).data('parameter-id') + ']')
                    .trigger({type: 'click', originalEvent: {slyignore: true}});
            }
        })
        .on('click', '.order .decrease-item-quantity, .order .increase-item-quantity', function (e) {
            e.preventDefault();
            var $input = $('input.item-quantity', $(this).parent());
            var quantity = parseInt($input.val());
            quantity += $(this).hasClass('increase-item-quantity') ? 1 : -1;
            if (quantity >= 1) {
                $input.val(quantity).change();
            }
        })
        .on('change', '.order .item-quantity', function () {
            var quantity = 0;
            var price = 0;
            $('.step4-page .order-wrapper').each(function (index, elem) {
                var id = +$(elem).attr('data-cart-position-universal-id');
                var _count = +(($('.item-price-wrapper .item-quantity', elem).val() + '').replace(/\D/g, ''));
                var _cost = +(($('.item-price-wrapper .price-value', elem).text() + '').replace(/\D/g, ''));

                $('.step2-page .shop-product-module[data-product-id="' + id + '"] .item-quantity').val(_count);

                quantity += _count;
                price += _count * _cost;
            });
            $('.total-count').text(quantity);
            $('.total-count-ending').text(quantity > 1 ? ($.inArray(quantity, [2, 3, 4]) != -1 ? 'а' : 'ов') : '');
            $('.total-price').html((price).format(0, 3, ' '));
            $('.product-price').html((price).format(0, 3, ' '));
        })
        .on('click', '.order .addToCart-btn', function (e) {
            e.preventDefault();
            var $this = $(this);

            if ($this.text() != 'В корзине') {
                if (analyticsStep != 6) {
                    analyticsStep = 6;
                    yii.analytics.triggerEvent('DIVAN_CONSTRUCTOR_ADD_TO_CART');
                }
                $.cart('put', {
                    shopProductId: shopProductId,
                    quantity: $('input.item-quantity').val(),
                    parameterValues: getParameterValues(),
                    fabricValues: getSelectedFabricsAsArray(),
                    image: $('.step3-img').attr('src'),
                    show: true,
                    complete: function () {
                        $('.addToCart-btn').text('В корзине');
                        setTimeout(function () {
                            $('.catalog-btn').fadeIn(200);
                        }, 3000);
                    }
                });
            } else {
                window.location.href = $this.attr('data-checkout-url') || '/order/check';
            }
        })
        .on('click', '.quickOrder-btn', function (e) {
            e.preventDefault();
            var title = $('.product-name').eq(0).text() + ', ';
            var quantity = $('.total-count').text();
            title += '<span class="nowrap">' + $('.total-price').html() + '</span>';
            if (quantity > 1) {
                title += ' <span class="nowrap">(за ' + quantity + ' шт.)</span>';
            }
            $('.fastorder-form .title').html(title);
            $('#quickorderform-shop_product_id').val(shopProductId);
            $('#quickorderform-parametervaluesjson').val(JSON.stringify(getParameterValues()));
            $('#quickorderform-fabricvaluesjson').val(JSON.stringify(getSelectedFabricsAsArray()));
            $('#quickorderform-quantity').val(quantity);

            if (analyticsStep != 5) {
                analyticsStep = 5;
                yii.analytics.triggerEvent('DIVAN_CONSTRUCTOR_VIEW_QUIK');
            }

            window.ga('send', 'pageview', '/virtual/fast-buy/');
            yii.analytics.triggerEvent('EC_QUICKORDER');
            $('.fastorder-form').show();
            $('.fastorder-success').hide();
            $('.fastorder-wrapper').blurdialog('show');
        })
        .on('click', '.fastorder-success .close', function (e) {
            e.preventDefault();
            $('.fastorder-wrapper').blurdialog('hide');
            setTimeout(function () {
                $('.catalog-btn').fadeIn(200);
            }, 1000);
            return false;
        });

    $(window)
        .on('scroll', function (e) {
            e.preventDefault();
            return false;
        })
        .on('resize', function () {
            var $activeModelsTab = $('.step1-page .tab-content:visible');
            if ($activeModelsTab.length > 0) {
                $activeModelsTab.find('.items-scroll-wrapper').mCustomScrollbar('update');
            }
            hideParameterHint();
            var $activeFabricTab = $('.step3-page .fabrics-selector .bottom.active');
            if ($activeFabricTab.length > 0) {
                $activeFabricTab.find('.materials-wrapper').mCustomScrollbar('update');
            }
        })
        .on('click', function (event) {
            hideParameterHint(event);
        })
        .on('touchmove', function (event) {
            var currentY = event.originalEvent.touches[0].clientY;
            if (currentStep == 1) {
                var $mobileHeader = $('#header');
                if ($mobileHeader.length > 0) {
                    if (currentY < lastY) {
                        $mobileHeader.css({top: 0, opacity: 1});
                    } else if (currentY > lastY) {
                        $mobileHeader.css({top: '-75px', opacity: 0});
                    }
                }
            }
            lastY = currentY;
            return false;
        });

    var FabricFilter = (function () {
        var instance;

        function FabricFilter(options) {
            if (!instance) {
                this.bindEvents();
                instance = this;
            }
            instance.init.call(instance, options);

            return instance;
        }

        FabricFilter.prototype.init = function (options) {
            var self = this;
            this.selected = {};
            this.options = options || {};

            $('.d-filter').each(function (index, element) {
                self.resetFilters.call(self, $(element));
            });
        };

        FabricFilter.prototype.bindEvents = function () {
            $(document)
                .on('click', '.d-filter .reset', this.onResetFilters.bind(this))
                .on('click', '.d-filter .dd-list .values li', this.onSelectFilterValue.bind(this))
                .on('click', '.d-filter .dd-head', this.onShowFilterValues.bind(this))
                .on('click', '.d-filter .dd-list .d-close, .d-filter .dd-list .reject', this.onHideFilterValues.bind(this))
                .on('click', '.d-filter .dd-list .accept', this.onAcceptFilter.bind(this));
        };

        FabricFilter.prototype.onSelectFilterValue = function (event) {
            var $this = $(event.currentTarget);

            $this.toggleClass('selected');

            return false;
        };

        FabricFilter.prototype.onAcceptFilter = function (event) {
            var self = this;
            var $this = $(event.currentTarget);
            var $list = $this.closest('.dd-list');
            var $values = $('.values li.selected', $list);
            var type = $list.data('type');
            var $tab = $this.closest('.bottom');
            var tabName = $tab.data('name');
            var $tabHeadValue = $('.dd-head > .value', $list.parent());
            var headValue = [];

            if (!self.selected.hasOwnProperty(tabName)) {
                self.selected[tabName] = {};
            }
            self.selected[tabName][type] = {};

            $values.each(function (index, element) {
                var $this = $(element);
                var filterID = $this.attr('data-id');

                self.selected[tabName][type][filterID] = filterID;
                if (self.options.hasOwnProperty(type) && self.options[type].hasOwnProperty(filterID)) {
                    headValue.push(self.options[type][filterID]['name']);
                } else {
                    headValue.push('---');
                }
            });

            if (headValue.length) {
                $tabHeadValue.text(headValue.join(', '));
            } else {
                delete self.selected[tabName][type];
                if (type == 'colors') {
                    $tabHeadValue.text('Любой');
                } else {
                    $tabHeadValue.text('Все');
                }
            }

            this.hideFilterValues($list);
            this.applyFilter(self.selected[tabName] || {}, $tab);

            return false;
        };

        FabricFilter.prototype.applyFilter = function (filters, $scope) {
            if ($.isEmptyObject(filters)) {
                $('.materials > .blocks > .material-collection', $scope).show();
                $('.materials > .blocks > div > .image', $scope).show();
            } else {
                var self = this;
                var materials = [];

                $.each(filters, function (type, value) {
                    var filterMaterials = [];

                    $.each(value, function (index, filterID) {
                        if (self.options.hasOwnProperty(type) && self.options[type].hasOwnProperty(filterID)) {
                            filterMaterials.push.apply(filterMaterials, self.options[type][filterID]['fabrics']);
                        }
                    });

                    if (materials.length) {
                        materials = materials.filter(function (n) {
                            return filterMaterials.indexOf(n) !== -1;
                        });
                    } else {
                        materials = filterMaterials;
                    }
                });

                $('.materials > .blocks > .material-collection', $scope).each(function (index, element) {
                    var $this = $(element);
                    var $image = $('> .image', $this);
                    var hidden = 0;

                    $image.each(function (index, element) {
                        var $this = $(element);

                        if ($.inArray($this.data('fabric-id'), materials) !== -1) {
                            $this.show();
                        } else {
                            $this.hide();
                            hidden++;
                        }
                    });
                    if (hidden >= $image.length) {
                        $this.hide();
                    } else {
                        $this.show();
                    }
                });
            }

            $('.materials-wrapper', $scope).mCustomScrollbar('update');
        };

        FabricFilter.prototype.onResetFilters = function (event) {
            var $this = $(event.currentTarget);
            var $fabricFilter = $this.closest('.d-filter');

            this.resetFilters($fabricFilter);

            return false;
        };

        FabricFilter.prototype.onShowFilterValues = function (event) {
            var $element = $('.dd-list', event.currentTarget.parentNode);

            this.showFilterValues($element);

            return false;
        };

        FabricFilter.prototype.onHideFilterValues = function (event) {
            var $this = $(event.currentTarget);
            var $list = $this.closest('.dd-list');

            this.hideFilterValues($list);

            return false;
        };

        FabricFilter.prototype.resetFilters = function ($element) {
            var self = this;
            var $tab = $element.closest('.bottom');
            var tabName = $tab.data('name');

            if (this.selected.hasOwnProperty(tabName)) {
                delete this.selected[tabName];
            }

            $('.dd-list', $element).each(function (index, element) {
                self.hideFilterValues.call(self, $(element));
            });
            $('.materials > .blocks > .material-collection', $tab).show();
            $('.materials > .blocks > div > .image', $tab).show();
            $('.d-filter > .color > .dd-head > .value', $tab).text('Любой');
            $('.d-filter > .tags > .dd-head > .value', $tab).text('Все');
            $('.dd-list .values li.selected', $element).removeClass('selected');
            $('.materials-wrapper', $tab).mCustomScrollbar('update');
        };

        FabricFilter.prototype.showFilterValues = function ($element) {
            var self = this;
            var $fabricFilter = $element.closest('.d-filter');

            $('.dd-list', $fabricFilter).not($element).each(function (index, element) {
                self.hideFilterValues.call(self, $(element));
            });

            $element
                .css({
                    'opacity': 0,
                    'display': 'block',
                    'top': '-20px'
                })
                .stop()
                .animate({
                    'opacity': 1,
                    'top': '-1px'
                });
        };

        FabricFilter.prototype.hideFilterValues = function ($element) {
            var type = $element.data('type');
            var $tab = $element.closest('.bottom');
            var tabName = $tab.data('name');

            $('.values li', $element).removeClass('selected');
            if (this.selected.hasOwnProperty(tabName) && this.selected[tabName].hasOwnProperty(type)) {
                $.each(this.selected[tabName][type], function (filterID) {
                    $('li[data-id=' + filterID + ']', $element).addClass('selected');
                });
            }

            $element
                .stop()
                .animate({
                    'opacity': 0,
                    'top': '-20px'
                }, function () {
                    $(this).hide();
                });
        };

        return FabricFilter;
    })();
})(jQuery);