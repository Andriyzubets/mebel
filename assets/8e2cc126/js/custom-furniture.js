(function ($) {
    "use strict";

    var rAF = (function (global) {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for (var x = 0; x < vendors.length && !global.requestAnimationFrame; ++x) {
            global.requestAnimationFrame = global[vendors[x] + 'RequestAnimationFrame'];
            global.cancelAnimationFrame = global[vendors[x] + 'CancelAnimationFrame'] || global[vendors[x] + 'CancelRequestAnimationFrame'];
        }

        if (!global.requestAnimationFrame)
            global.requestAnimationFrame = function (callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = global.setTimeout(function () {
                        callback(currTime + timeToCall);
                    },
                    timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };

        if (!global.cancelAnimationFrame)
            global.cancelAnimationFrame = function (id) {
                clearTimeout(id);
            };

        return global;
    })(window);

    var SmoothScroll = (function () {
        function SmoothScroll(el, duration, timingFunctionName, context) {
            var self = this;

            if (typeof el !== 'function') {
                timingFunctionName = timingFunctionName || "ease-in-out-cubic";
                self.timingFunction = timingFunction(timingFunctionName);
                self.duration = duration || 500;
                self.context = context || window;
                self.start = window.pageYOffset || document.documentElement.scrollTop;
                self.end = typeof el === 'number' ? parseInt(el) : getTop(el);
                self.clock = Date.now();
                self.frame();
            }
        }

        SmoothScroll.prototype.position = function (progress) {
            var self = this;
            return progress > 1 ? self.end : self.start + (self.end - self.start) * self.timingFunction(progress);
        };

        SmoothScroll.prototype.frame = function () {
            var self = this;
            var progress = (Date.now() - self.clock) / self.duration;
            var position = self.position(progress);

            if (self.context !== window) {
                self.context.scrollTop = position;
            }
            else {
                self.context.scroll(0, position);
            }

            if (progress < 1) {
                rAF.requestAnimationFrame(self.frame.bind(self));
            }
        };

        return SmoothScroll;

        function getTop(element) {
            if (element.nodeName === 'HTML') {
                return -window.pageYOffset;
            }
            return element.getBoundingClientRect().top + window.pageYOffset;
        }

        function timingFunction(name) {
            if (name == "ease-in-out-cubic") {
                return easeInOutCubicTimingFunction;
            }
            return linearTimingFunction;
        }

        function linearTimingFunction(t) {
            return t;
        }

        function easeInOutCubicTimingFunction(t) {
            return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        }
    })();

    var Accordion = (function () {
        function Accordion(options) {
            this._defaultOptions = {
                marked: [],
                items: [],
                limit: 0
            };
            this._options = Object.assign({}, this._defaultOptions, options || {});

            this.marked = this._options.marked || [];
            this.items = this._options.items || [];
            this.limit = +this._options.limit || 0;

            if (typeof this._options.onMark === 'function') {
                this.onMark = this._options.onMark;
            }
            if (typeof this._options.onUnmark === 'function') {
                this.onUnmark = this._options.onUnmark;
            }

            this._options.select !== undefined && this.toggleByIndex(this._options.select);
        }

        Accordion.prototype.select = function (item) {
            return this.items.filter(function (value) {
                return item === value;
            })
        };

        Accordion.prototype.push = function (item) {
            this.items.push(item);
        };

        Accordion.prototype.delete = function (item) {
            var count = 0;
            var pos;

            for (pos = 0; (pos = this.marked.indexOf(item, pos)) !== -1;) {
                this.marked.splice(pos, 1);
            }
            for (pos = 0; (pos = this.items.indexOf(item, pos)) !== -1;) {
                count++;
                this.items.splice(pos, 1);
            }

            return count;
        };

        Accordion.prototype.mark = function (item) {
            while (this.limit && this.marked.length >= this.limit) {
                var overflow = this.marked.shift();
                this.onUnmark(overflow);
            }
            this.marked.push(item);
            this.onMark(item);
        };

        Accordion.prototype.unmark = function (item, pos) {
            this.marked.splice(pos, 1);
            this.onUnmark(item);
        };

        Accordion.prototype.toggleByValue = function (item) {
            var pos = this.marked.indexOf(item);

            if (pos !== -1) {
                this.unmark(item, pos);
            } else {
                this.mark(item);
            }
        };

        Accordion.prototype.toggleByIndex = function (index) {
            var item = this.items[index];

            this.toggleByValue(item);
        };

        Accordion.prototype.onMark = function (item) {
        };

        Accordion.prototype.onUnmark = function (item) {
        };

        return Accordion;
    })();

    var collapse = function (options) {
        this.each(function () {
            var _defaultOptions = {
                selector: 'condition',
                events: ['click'],
                triggers: ['.custom-furniture-condition__title']
            };

            var _options = Object.assign({}, _defaultOptions, options || {});

            var $conditions = $(['.', _options.selector].join(''), this);

            $conditions.addClass([_options.selector, 'collapsed'].join('_'));

            var accordion = new Accordion({
                select: _options.select,
                limit: _options.limit,
                items: Array.prototype.slice.call($conditions),
                onMark: function (node) {
                    $(node)
                        .removeClass([_options.selector, 'collapsed'].join('_'))
                        .addClass([_options.selector, 'expanded'].join('_'));
                },
                onUnmark: function (node) {
                    $(node)
                        .removeClass([_options.selector, 'expanded'].join('_'))
                        .addClass([_options.selector, 'collapsed'].join('_'));
                }
            });

            $conditions.on(_options.events.join(' '), _options.triggers.join(' '), function () {
                var $condition = $(this).closest(['.', _options.selector].join(''));

                accordion.toggleByValue.call(accordion, $condition[0]);
            });
        })
    };

    var scroll = (function (el, duration, timingFunction, context) {
        return (new SmoothScroll(el, duration, timingFunction, context));
    });

    $.fn.scroll = scroll;
    $.fn.collapse = collapse;
})(jQuery);

(function ($) {
    $('.custom-furniture-conditions__map').collapse({
        selector: 'custom-furniture-condition',
        limit: 1,
        select: 0
    });

    $('.custom-furniture-custom-button_theme_custom-solution').on('click', function () {
        var target = document.querySelector('.custom-furniture-request_full');

        target && $.fn.scroll(target);
    });

    $('.custom-furniture-slider-product__order').on('click', function () {
        var productID = this.getAttribute('data-product-id');
        $.ajax({
            url: '/custom-furniture/quick-order',
            data: {
                shopProductId: productID
            },
            success: function (data) {
                $('.quickBuy').html(data);
                $('#fastorder-wrapper' + productID).blurdialog('show');
            }
        });
        return false;
    });

    $('.subscribe-form-widget__control_type_file').on('change', function (event) {
        var target = event.target;
        var label = this.querySelector('.control-label');

        if (target.files.length) {
            label.textContent = 'Файл прикреплен';
            $(this).addClass('file-attached');
        } else {
            label.textContent = 'Прикрепить свой файл';
            $(this).removeClass('file-attached');
        }
    });

    $('.custom-furniture-facade_theme_furniture .custom-furniture-material').on('mouseenter', function () {
        var map = {
            "iasen-shimo-temnyi": "/images/custom-furniture/facade_iasen-shimo-temnyi.jpg",
            "orekh-mariia-luiza": "/images/custom-furniture/facade_orekh-mariia-luiza.jpg",
            "orekh-ekko": "/images/custom-furniture/facade_orekh-ekko.jpg",
            "iasen-shimo-svetlyi": "/images/custom-furniture/facade_iasen-shimo-svetlyi.jpg",
            "dub-molochnyi": "/images/custom-furniture/facade_dub-molochnyi.jpg",
            "dub-sonoma": "/images/custom-furniture/facade_dub-sonoma.jpg",
            "olkha-naturalnaia": "/images/custom-furniture/facade_olkha-naturalnaia.jpg",
            "venge-tcavo": "/images/custom-furniture/facade_venge-tcavo.jpg",
            "vudlain_kremovyi": "/images/custom-furniture/facade_vudlain_kremovyi.jpg",
            "belyi-premium": "/images/custom-furniture/facade_belyi-premium.jpg"
        };
        var mods = this.className.split(' ');

        mods = mods.filter(function (mod) {
            return /^custom-furniture-material_/.test(mod);
        });

        var image = mods.pop();

        if (image) {
            image = image.slice('custom-furniture-material_'.length);

            map[image] && $('.custom-furniture-facade__preview').attr('src', map[image]);
        }
    });

    $('.custom-furniture-facade_theme_kitchen .custom-furniture-material').on('mouseenter', function () {
        var map = {
            "pvc-sonoma": "/images/custom-furniture/kitchen_pvc-sonoma.jpg",
            "pvc-quasar": "/images/custom-furniture/kitchen_pvc-quasar.jpg",
            "pvc-lime": "/images/custom-furniture/kitchen_pvc-lime.jpg",
            "pvc-wenge": "/images/custom-furniture/kitchen_pvc-wenge.jpg",

            "plastic-arpa0211": "/images/custom-furniture/kitchen_plastic-arpa0211.jpg",
            "plastic-arpa0616": "/images/custom-furniture/kitchen_plastic-arpa0616.jpg",
            "plastic-arpa0675": "/images/custom-furniture/kitchen_plastic-arpa0675.jpg",
            "plastic-arpa0690": "/images/custom-furniture/kitchen_plastic-arpa0690.jpg",

            "enamel-orange": "/images/custom-furniture/kitchen_enamel-orange.jpg",
            "enamel-chameleon": "/images/custom-furniture/kitchen_enamel-chameleon.jpg",
            "enamel-ral1013": "/images/custom-furniture/kitchen_enamel-ral1013.jpg",
            "enamel-ral4003": "/images/custom-furniture/kitchen_enamel-ral4003.jpg",

            "veneer-ral9003": "/images/custom-furniture/kitchen_veneer-ral9003.jpg",
            "veneer-oak": "/images/custom-furniture/kitchen_veneer-oak.jpg",
            "veneer-ral9004": "/images/custom-furniture/kitchen_veneer-ral9004.jpg",
            "veneer-ral1013": "/images/custom-furniture/kitchen_veneer-ral1013.jpg"
        };
        var mods = this.className.split(' ');

        mods = mods.filter(function (mod) {
            return /^custom-furniture-material_/.test(mod);
        });

        var image = mods.pop();

        if (image) {
            image = image.slice('custom-furniture-material_'.length);

            map[image] && $('.custom-furniture-facade__preview').attr('src', map[image]);
        }
    });

    $('.custom-furniture-component_tabletop').on('mouseenter', '.custom-furniture-material', function (event) {
        var map = {
            "postforming-28-mm": "/images/custom-furniture/tabletop_postforming-28-mm.jpg",
            "postforming-38-mm": "/images/custom-furniture/tabletop_postforming-38-mm.jpg",
            "iskusstvennyi-kamen": "/images/custom-furniture/tabletop_tabletop-belyi-premium.jpg"
        };
        var mods = this.className.split(' ');

        mods = mods.filter(function (mod) {
            return /^custom-furniture-material_/.test(mod);
        });

        var image = mods.pop();

        if (image) {
            image = image.slice('custom-furniture-material_'.length);

            map[image] && $('.custom-furniture-component__preview', event.delegateTarget).css('background-image', 'url("' + map[image] + '")');
        }
    });

    $('.custom-furniture-component_wallpanel').on('mouseenter', '.custom-furniture-material', function (event) {
        var map = {
            "plastik-v-tcvet-stoleshnitcy": "/images/custom-furniture/wallpanel_plastik-v-tcvet-stoleshnitcy.jpg",
            "mdf-s-fotopechatiu": "/images/custom-furniture/wallpanel_mdf-s-fotopechatiu.jpg",
            "zakalennoe-steklo-s-fotopechatiu": "/images/custom-furniture/wallpanel_zakalennoe-steklo-s-fotopechatiu.jpg"
        };
        var mods = this.className.split(' ');

        mods = mods.filter(function (mod) {
            return /^custom-furniture-material_/.test(mod);
        });

        var image = mods.pop();

        if (image) {
            image = image.slice('custom-furniture-material_'.length);

            map[image] && $('.custom-furniture-component__preview', event.delegateTarget).css('background-image', 'url("' + map[image] + '")');
        }
    });

    $('.showroom-page-slider__images').slick({
        "slidesToShow": 1,
        "slidesToScroll": 1,
        "fade": true,
        "swipe": false,
        "prevArrow": '<div class="showroom-page-slider__prev"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30.7 58.5"><path d="M0 29.3L29.3 0l1.4 1.4-28 28 28 27.7-1.4 1.5L0 29.3"></path></svg></div>',
        "nextArrow": '<div class="showroom-page-slider__next"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30.7 58.5"><path d="M30.7 29.3L1.4 0 0 1.4l28 28L0 57l1.4 1.5 29.3-29.2"></path></svg></div>'
    });

    $('.showroom-page-slider__thumbs').slick({
        "slidesToShow": 9,
        "slidesToScroll": 1,
        "focusOnSelect": false,
        "infinite": false,
        "prevArrow": '<div class="showroom-page-slider__prev"></div>',
        "nextArrow": '<div class="showroom-page-slider__next"></div>'
    });
})(jQuery);
