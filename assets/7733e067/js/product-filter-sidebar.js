yii.productFilterSidebar = (function ($) {
    'use strict';

    return {

        init: function () {
            var module = this;

            $('.product-filter-widget-toolbar__item_order-by').on('click', '.dropdown-popup__item', function (event) {
                window.location = event.currentTarget.getAttribute('data-url');
            });

            $('.product-filter-widget-toolbar__sidebar-toogle').on('click', function () {
                var $root = $(this).closest('.product-filter-widget');

                if ($root.hasClass('product-filter-widget_sidebar')) {
                    $root.removeClass('product-filter-widget_sidebar')
                } else {
                    $root.addClass('product-filter-widget_sidebar')
                }
            });

            function closeAll(exclude) {
                var $popup = $('.dropdown__popup_active');

                for (var i = 0, ii = $popup.length; i < ii; i++) {
                    if (exclude !== $popup[i] && !($popup[i] === event.target || $.contains($popup[i], event.target))) {
                        $popup
                            .removeClass('dropdown__popup_active')
                            .stop()
                            .animate({
                                'opacity': 0,
                                'top': '-20px'
                            }, 150, function () {
                                $popup.css({'display': 'none'});
                            });
                    }
                }
            }

            $(document).on('click', closeAll);

            $('.dropdown').each(function (index, element) {
                var $element = $(element);

                $element.on('click', '.dropdown__trigger', function (event) {
                    var $elem = event.delegateTarget;
                    var $popup = $('.dropdown__popup', $elem);

                    closeAll($popup[0]);

                    $popup
                        .addClass('dropdown__popup_active')
                        .css({'opacity': 0, 'display': 'block', 'top': '-20px'})
                        .stop()
                        .animate({'opacity': 1, 'top': '-1px'}, 300);

                    return false;
                });

                $element.on('click', '.dropdown-popup__close', function (event) {
                    var $popup = $('.dropdown__popup', $element);

                    $popup
                        .removeClass('dropdown__popup_active')
                        .stop()
                        .animate({
                            'opacity': 0,
                            'top': '-20px'
                        }, 150, function () {
                            $popup.css({'display': 'none'});
                        });

                    return false;
                });
            });

            $('.product-filter-item[data-variant-count]').each(function (index, element) {
                var i, ii, count, height;
                var $productFilterItem = $(element);
                var $productFilterItemValues = $('.product-filter-item__section_values', element);
                var $productFilterItemBody = $('.product-filter-item__section_body', element);

                var MAX_VARIANT_COUNT = +$productFilterItem.attr('data-variant-count') || 0;
                var $values = $('.product-filter-item__section_value', $productFilterItemValues);

                if ($values.length > MAX_VARIANT_COUNT) {
                    var $more = $('<div class="product-filter-item__section product-filter-item__section_more"><div class="product-filter-item__more">Показать все</div></div>');
                    var $moreButton = $('.product-filter-item__more', $more);

                    $moreButton
                        .on('click', function (event) {
                            var $tagret = $(event.target);

                            onClick($tagret);

                            return false;
                        });

                    if ($productFilterItem.hasClass('product-filter-item__section_collapsed')) {
                        collapse($moreButton);
                    } else if ($productFilterItem.hasClass('product-filter-item__section_expanded')) {
                        expand($moreButton);
                    }
                    $productFilterItemBody.append($more);
                }

                function onClick($tagret) {
                    if ($productFilterItem.hasClass('product-filter-item__section_collapsed')) {
                        expand($tagret);
                    } else {
                        collapse($tagret);
                    }
                }

                function collapse($tagret) {
                    count = MAX_VARIANT_COUNT;
                    height = 3 * (count + 1);
                    for (i = 0, ii = count; i < ii; i++) {
                        height += $values.eq(i).outerHeight() || 20;
                    }

                    $tagret.text('Показать все');
                    $productFilterItem
                        .addClass('product-filter-item__section_collapsed')
                        .removeClass('product-filter-item__section_expanded');

                    $productFilterItemValues.height(height);
                }

                function expand($tagret) {
                    count = $values.length;
                    height = 3 * (count + 1);
                    for (i = 0, ii = count; i < ii; i++) {
                        height += $values.eq(i).outerHeight() || 20;
                    }

                    $tagret.text('Скрыть');
                    $productFilterItem
                        .addClass('product-filter-item__section_expanded')
                        .removeClass('product-filter-item__section_collapsed');

                    $productFilterItemValues.height(height);
                }
            });

            var CatalogFilter = (function () {
                function CatalogFilter(domElem, options) {
                    var self = this;

                    options = options || {};

                    this.isAnimating = false;
                    this.sort = options.sort || 0;
                    this.url = options.url || '';
                    this.domElem = domElem;
                    this.$domElem = $(domElem);
                    this.$filters = $('.product-filter-item', domElem);

                    this.$domElem
                        .on('click', '.product-filter-sidebar__apply, .product-filter-more__action', function () {
                            self.applyFilters.call(self);
                        })
                        .on('click', '.product-filter-sidebar__reset', function () {
                            var state = {};

                            if (self.sort) {
                                state.sort = self.sort;
                            }
                            window.location = self.getFilterUrl.call(self, state);
                        });

                    this.init();
                }

                CatalogFilter.prototype.init = function () {
                    var self = this;

                    this.$filters.each(function () {
                        var $this = $(this);

                        if ($this.hasClass('product-filter-item_type_number')) {
                            self.rangeFilter($this);
                        } else {
                            self.multipleFilter($this);
                        }
                    });
                };

                CatalogFilter.prototype.setSort = function (sort) {
                    this.sort = sort;
                };

                CatalogFilter.prototype.rangeFilter = function ($filter) {
                    var self = this;

                    $('.product-filter-item__slider', $filter).each(function (index, slider) {
                        var step = +slider.getAttribute('data-step');
                        var globalMinimum = +slider.getAttribute('data-min');
                        var globalMaximum = +slider.getAttribute('data-max');
                        var localMinimum = +slider.getAttribute('data-current-min');
                        var localMaximum = +slider.getAttribute('data-current-max');
                        var selectorFrom = '.product-filter-item-value_from .product-filter-item-value__value';
                        var selectorTo = '.product-filter-item-value_to .product-filter-item-value__value';

                        if (globalMinimum === globalMaximum) {
                            globalMinimum -= 10;
                            globalMaximum += 10;
                            step = 10;
                        }

                        noUiSlider.create(slider, {
                            start: [localMinimum, localMaximum],
                            connect: true,
                            range: {
                                'min': globalMinimum,
                                'max': globalMaximum
                            },
                            step: step,
                            format: {
                                from: parseInt,
                                to: parseInt
                            }
                        });

                        slider.noUiSlider.on('update', function (values, handle) {
                            $(handle ? selectorTo : selectorFrom, $filter).val(values[handle]);
                        });
                        slider.noUiSlider.on('set', function () {
                            var $slider = $(slider);
                            var top = $slider.position().top + $slider.outerHeight(true) / 2;

                            self.showMore(top);
                        });

                        $filter
                            .on('change', selectorFrom, function (event) {
                                var target = event.currentTarget;
                                var value = +target.value;

                                slider.noUiSlider.set([value, null]);
                            })
                            .on('change', selectorTo, function (event) {
                                var target = event.currentTarget;
                                var value = +target.value;

                                slider.noUiSlider.set([null, value]);
                            });
                    });
                };

                CatalogFilter.prototype.multipleFilter = function ($domElem) {
                    var self = this;

                    $domElem.on('click', '.product-filter-item-value__container', function (event) {
                        var target = event.currentTarget;
                        var $value = $(target).closest('.product-filter-item-value');

                        if ($value.hasClass('product-filter-item-value_selected')) {
                            $value.removeClass('product-filter-item-value_selected');
                        } else {
                            $value.addClass('product-filter-item-value_selected');
                        }

                        var top = $value.position().top + $value.outerHeight(true) / 2;
                        self.showMore(top);

                        return false;
                    });
                };

                CatalogFilter.prototype.getState = function () {
                    var state = {};

                    this.$filters.each(function () {
                        var $values, i, ii;
                        var $filter = $(this);
                        var parameterID = $filter.attr('data-parameter-id');

                        if (parameterID === 'type') {
                            $values = $('.product-filter-item-value_selected', this);
                            if ($values.length) {
                                state['types'] = [];
                                for (i = 0, ii = $values.length; i < ii; i++) {
                                    state['types'].push($values.eq(i).attr('data-value-id'));
                                }
                            }
                        } else if ($filter.hasClass('product-filter-item_type_number')) {
                            var $uiSlider = $('.product-filter-item__slider', this);
                            var uiSlider = $uiSlider[0].noUiSlider;

                            if (!uiSlider) {
                                return;
                            }

                            var range = uiSlider.get();
                            var globalMinimum = +$uiSlider.attr('data-min');
                            var globalMaximum = +$uiSlider.attr('data-max');

                            if (range[0] <= globalMinimum && range[1] >= globalMaximum) {
                                return;
                            }

                            if (parameterID === 'price') {
                                state['prices'] = {'from': range[0], 'to': range[1]};
                            } else {
                                if (!state['parameters']) {
                                    state['parameters'] = {};
                                }
                                state['parameters'][parameterID] = {'from': range[0], 'to': range[1]};
                            }
                        } else {
                            $values = $('.product-filter-item-value_selected', this);
                            if ($values.length) {
                                if (!state['parameters']) {
                                    state['parameters'] = {};
                                }
                                state['parameters'][parameterID] = [];
                                for (i = 0, ii = $values.length; i < ii; i++) {
                                    state['parameters'][parameterID].push($values.eq(i).attr('data-value-id'));
                                }
                            }
                        }
                    });

                    if (this.sort) {
                        state.sort = this.sort;
                    }

                    return state;
                };

                CatalogFilter.prototype.getFilterUrl = function (state) {
                    var url = $.isEmptyObject(state) ?
                        this.url :
                        this.url + (this.url.indexOf('?') > -1 ? '&' : '?') + $.param(state);

                    return decodeURIComponent(url);
                };

                CatalogFilter.prototype.showMore = function (top) {
                    var self = this;

                    if (!self.isAnimating) {
                        self.isAnimating = true;

                        var state = this.getState();

                        state['onlyCount'] = 1;
                        var url = this.getFilterUrl(state);
                        var $more = $('.product-filter-more', this.$domElem);
                        var $result = $.getJSON(url);

                        $more
                            .stop()
                            .fadeOut(function () {
                                $result.then(function (data) {

                                    $more
                                        .stop()
                                        .find('.product-filter-more__count')
                                        .text(data.totalCount || 0)
                                        .end()
                                        .css('top', top + 'px')
                                        .fadeIn(function () {
                                            self.isAnimating = false;
                                        });
                                });
                            });
                    }
                };

                CatalogFilter.prototype.applyFilters = function () {
                    var state = this.getState();

                    window.location = this.getFilterUrl(state);
                };

                return CatalogFilter;
            })();

            module.CatalogFilter = CatalogFilter;

            $(document).on('click', function (event) {
                if (!self.isAnimating) {
                    var $more = $('.product-filter-more');
                    if (!$.contains($more[0], event.target)) {
                        $more.filter(':not(:animated)')
                            .stop()
                            .fadeOut();
                    }
                }
            });
        }
    };
})(jQuery);
