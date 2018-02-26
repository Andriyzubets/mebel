(function (window, document, $) {
    "use strict";

    var LazyLinkPager = (function () {
        function LazyLinkPager(blockName, linkMap) {
            if (!blockName) {
                throw new TypeError("'blockName' must be set");
            }
            if (!linkMap) {
                throw new TypeError("'linkMap' must be set");
            }

            var _this = this;

            _this._blockName = blockName;
            _this._linkMap = JSON.parse(linkMap);
            _this._hasPushState = !!(window.history && window.history.replaceState);

            _this.init();
            _this.watch();
        }

        LazyLinkPager.prototype.init = function () {
            var _this = this;
            var $lazyLinkPager = $("." + _this._blockName);

            $lazyLinkPager.each(onEach);
            $(document).on("click", "." + _this._blockName, onClick);


            function onEach(index, domElem) {
                var dataBem = JSON.parse(domElem.getAttribute("data-bem") || "{}");
                var params = dataBem[_this._blockName] || {};
                var scope = {
                    domElem: $(domElem),
                    params: params,
                    isDisabled: false
                };

                params.auto && $(window).on("scroll", throttle(onScroll, 250, scope));
            }

            function onScroll() {
                var scope = this;
                var scroll = window.pageYOffset || document.documentElement.scrollTop;
                var viewport = window.innerHeight;
                var top = scope.domElem.offset().top;

                if (
                    !scope.isDisabled && scope.params.step &&
                    (
                        ((scroll + 1.5 * viewport) > top && scope.params.step > 0) ||
                        ((scroll - 1.5 * viewport) < top && scope.params.step < 0)
                    )
                ) {
                    scope.isDisabled = true;
                    var domElem = scope.domElem[0];
                    var dataBem = JSON.parse(domElem.getAttribute("data-bem") || "{}");
                    var params = dataBem[_this._blockName] || {};
                    var result = _this.setPage(params.page);

                    if (!result) return;

                    result.then(function (response) {
                        var page = +response.page + (params.step ? +params.step : 0);
                        if (page >= 0 && page < _this._linkMap.length) {
                            params.page = +page;
                        } else {
                            params.page = null;
                        }
                        dataBem[_this._blockName] = params;
                        domElem.setAttribute("data-bem", JSON.stringify(dataBem));

                        params.page === null && _this.onEdge.call(_this, response, domElem, params);
                        _this.onPaginate.call(_this, response, domElem, params);
                        scope.isDisabled = false;
                    });
                }
            }

            function onClick() {
                var domElem = this;
                var dataBem = JSON.parse(domElem.getAttribute("data-bem") || "{}");
                var params = dataBem[_this._blockName] || {};
                var result = _this.setPage(params.page);

                if (!result) return;

                result.then(function (response) {
                    var page = +response.page + (params.step ? +params.step : 0);
                    if (page >= 0 && page < _this._linkMap.length) {
                        params.page = +page;
                    } else {
                        params.page = null;
                    }
                    dataBem[_this._blockName] = params;
                    domElem.setAttribute("data-bem", JSON.stringify(dataBem));

                    params.page === null && _this.onEdge.call(_this, response, domElem, params);
                    _this.onPaginate.call(_this, response, domElem, params);
                });
            }
        };

        LazyLinkPager.prototype.watch = function () {
            $(window).on({
                "resize": throttle(this.onScroll, 250, this),
                "scroll": throttle(this.onScroll, 250, this)
            });
        };

        LazyLinkPager.prototype.setPage = function (page) {
            var _this = this;

            if ($.isNumeric(page) && _this._linkMap[page]) {
                var url = _this._linkMap[page];
                var response = $.ajax(url);

                return response.then(function (response) {
                    _this.setUrl(response.page);

                    return response;
                });
            }
        };

        LazyLinkPager.prototype.setUrl = function (page) {
            var _this = this;

            if (_this._hasPushState && $.isNumeric(page) && _this._linkMap[page]) {
                window.history.replaceState({}, document.title, _this._linkMap[page]);
            }

            $(".pagination li").removeClass("active");
            $(".pagination [data-page='" + page + "']").parent(":not(.next,.prev)").addClass("active");
        };

        LazyLinkPager.prototype.onResize = function () {
        };

        LazyLinkPager.prototype.onScroll = function () {
            var scroll = window.pageYOffset || document.documentElement.scrollTop;
            var viewport = window.innerHeight;
            var topBorder = scroll - 150;
            var bottomBorder = scroll + viewport + 50;

            var elems = $("[data-lazy-link-pager]");
            var map = {};

            for (var i = 0, ii = this._linkMap.length; i < ii; i++) {
                map[i] = 0;
            }
            elems.each(function(index, domElem) {
                var $this = $(this);
                var top = $this.offset().top;

                if (topBorder <= top && top <= bottomBorder) {
                    map[$this.attr("data-lazy-link-pager")] += 1;
                }
            });
            var page = 0;
            var weight = map[0];
            var out = "";
            for (var i = 0, ii = this._linkMap.length; i < ii; i++) {
                if (map[i] > weight) {
                    page = i;
                    weight = map[i]
                }
                //out += "map [" + i + "]: " + map[i] + " | ";
            }
            if (weight > 0) {
                this.setUrl(page);
            }
            //console.log(out);
        };

        LazyLinkPager.prototype.onPaginate = function (response, domElem, params) {
        };

        LazyLinkPager.prototype.onEdge = function (response, domElem, params) {
            $(domElem).hide();
        };

        return LazyLinkPager;
    }());

    window.LazyLinkPager = LazyLinkPager;

    function throttle(fn, timeout, invokeAsap, ctx) {
        var typeofInvokeAsap = typeof invokeAsap;
        if(typeofInvokeAsap === 'undefined') {
            invokeAsap = true;
        } else if(arguments.length === 3 && typeofInvokeAsap !== 'boolean') {
            ctx = invokeAsap;
            invokeAsap = true;
        }

        var timer, args, needInvoke,
            wrapper = function() {
                if(needInvoke) {
                    fn.apply(ctx, args);
                    needInvoke = false;
                    timer = window.setTimeout(wrapper, timeout);
                } else {
                    timer = null;
                }
            };

        return function() {
            args = arguments;
            ctx || (ctx = this);
            needInvoke = true;

            if(!timer) {
                invokeAsap?
                    wrapper() :
                    timer = window.setTimeout(wrapper, timeout);
            }
        };
    }
}(window, document, jQuery));
