(function ($, document) {
    "use strict";

    var GIF = (function () {
        function GIF(domElem) {
            var self = this;

            $.data(domElem, "gif", "inited");
            self.gif = new Image();
            self.canvas = document.createElement("canvas");
            self.ctx = self.canvas.getContext("2d");
            self.domElem = domElem;
            self.url = domElem.getAttribute("src");
            self.gif.onload = function () {
                var height = self.gif.height;
                var width = self.gif.width;
                var dimension = Math.floor(Math.min(height, width) / 2);
                var left = Math.floor((width - dimension) / 2);
                var top = Math.floor((height - dimension) / 2);

                self.canvas.height = height;
                self.canvas.width = width;
                self.ctx.drawImage(self.gif, 0, 0);
                self.ctx.fillStyle = "rgba(51, 51, 51, 0.4)";
                self.ctx.beginPath();
                self.ctx.arc(Math.floor(left + dimension / 2), Math.floor(top + dimension / 2), Math.floor(dimension / 2), 0, 2 * Math.PI);
                self.ctx.moveTo(Math.floor(left + 0.41176471 * dimension), Math.floor(top + 0.70588235 * dimension));
                self.ctx.lineTo(Math.floor(left + 0.67647059 * dimension), Math.floor(top + 0.5 * dimension));
                self.ctx.lineTo(Math.floor(left + 0.41176471 * dimension), Math.floor(top + 0.29411765 * dimension));
                self.ctx.fill();
                self.domElem.setAttribute("src", self.canvas.toDataURL());
                $(self.domElem)
                    .on("mouseenter", function () {
                        self.domElem.setAttribute("src", self.url);
                    })
                    .on("mouseleave", function () {
                        self.domElem.setAttribute("src", self.canvas.toDataURL());
                    });
            };
            self.gif.src = self.url;
        }

        return GIF;
    }());

    $.fn.gifPlayer = function () {
        if (canvasSupport()) {
            this.each(function () {
                $.hasData(this, "gif") || new GIF(this);
            });
        }
        return this;
    };

    function canvasSupport() {
        var canvas = document.createElement("canvas");
        return !!(canvas.getContext && canvas.getContext('2d')) && canvas.toDataURL('image/png').indexOf('data:image/png') === 0;
    }
})(jQuery, document);
