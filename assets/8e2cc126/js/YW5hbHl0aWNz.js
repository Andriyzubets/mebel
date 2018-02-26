'use strict';
yii.analytics = (function ($) {
    var dataLayer = null;
    var pub = {
        init: function () {
            dataLayer = window.dataLayer = window.dataLayer || [];
            this.productImpressions();
        },
        push: function (data) {
            dataLayer.push(data);
        },
        triggerEvent: function (event_id) {
            this.push({event: event_id});
        },
        pushProductList: function (selector, list_name) {
            var ga_products = [];
            var ga_products_map = {};

            if ($(selector).size() == 0) {
                return false;
            }
            $(selector).each(function () {
                var id = $(this).attr('data-product-id');

                if (!ga_products_map[id]) {
                    ga_products_map[id] = true;
                    ga_products.push({
                        id: id,
                        name: $(this).attr('data-product-name'),
                        price: $(this).attr('data-product-price'),
                        dimension7: $(this).attr('data-product-price'),
                        category: $(this).attr('data-product-category-name'),
                        variant: $(this).attr('data-product-variant'),
                        list: list_name
                    });
                }
            });

            ga_products.length && yii.analytics.push({
                event: 'productImpressions',
                ecommerce: {
                    impressions: ga_products
                }
            });
            return ga_products;
        },
        productImpressions: function () {
            var ga_products = [];
            var ga_products_map = {};
            var $lists = $('[data-anal-list]');
            var productsSelector = '.catalog-card[data-product-id], .catalog-item[data-product-id], .assoc-product[data-product-id], .kit-product[data-product-id], .order-item[data-product-id], .kiit-item__products[data-product-id], .kiit-item__product[data-product-id]';
            $lists.each(function () {
                var $list = $(this);
                var position = 1;
                var $products = $list.find(productsSelector);
                $products.each(function () {
                    var id = $(this).attr('data-product-id');

                    if (!ga_products_map[id]) {
                        ga_products_map[id] = true;
                        ga_products.push({
                            id: id,
                            name: $(this).attr('data-product-name'),
                            price: $(this).attr('data-product-price'),
                            dimension7: $(this).attr('data-product-price'),
                            category: $(this).attr('data-product-category-name'),
                            variant: $(this).attr('data-product-variant'),
                            list: $list.attr('data-anal-list'),
                            brand: 'Диван.ру',
                            position: position++
                        });
                    }
                });

                //Клик на товаре
                $products.click(function () {
                    yii.analytics.push({
                        event: 'productClick',
                        ecommerce: {
                            click: {
                                actionField: {list: $list.attr('data-anal-list')},
                                products: [{
                                    name: $(this).attr('data-product-name'),
                                    id: $(this).attr('data-product-id'),
                                    price: $(this).attr('data-product-price'),
                                    dimension7: $(this).attr('data-product-price'),
                                    category: $(this).attr('data-product-category-name'),
                                    variant: $(this).attr('data-product-variant'),
                                    brand: 'Диван.ру',
                                    position: $(this).index() + 1
                                }]
                            }
                        }
                    });
                });
            });

            ga_products.length && yii.analytics.push({
                event: 'productImpressions',
                ecommerce: {
                    impressions: ga_products
                }
            });
        }
    };

    return pub;
})(jQuery);
