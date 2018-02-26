var SellPoints = (function () {
    function SellPoints(domElem, points, options) {
        var self = this;

        this.points = points || [];
        this.domElem = domElem;
        this.mapElem = domElem.querySelector('.sell-points__map');

        ymaps.ready(function init() {
            ymaps.option.presetStorage.add('custom#showroom', {
                iconLayout: 'default#image',
                iconImageHref: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAAAyCAQAAABvjeoYAAADsklEQVR4AZ3TA6wj6x/H4WemXfXs37Zt27bNa9tGdG3btm1ba9ve9qCn896kWUzeTLd42pn4k29+ySQKfSb1DT/0VR/zZq9Xs8ZUL3vInVboQPIZYm+yk829R5FBtzjOY11mw0i7O8BYm3aHnU3ZZPbTcj7uMl/QiQG7O72jbPih67xO586yvYZCyaes8yO3Gak7l/qvTOts+IwnVHTvWHsWZj8JYz3ro3oR/NENLbLhBLvo1WIfs1KkHIQP2F7v3movB4ikgb2M0Dt29FqR5GMVC7xW5LOO0uctYInFpnnc9Vra2tlR9qO/daOYz7lKbJzDvKjQHX4R3/ZHCgTwUcDn/M4ffcoFDnedAt8zQl1O2snH+qLD/dI4FQd7pwJjfCxe+xEtBRvN83t3e7/d7KnAR7xCPvva1sEgj8vt55uCAq+L16adZ2+3n7d4p3nERsTZeT6khTg7F7zFXGKL4uwkH+p0LTUVQSD2Upy93y87XftFFTxHbPrsWeSl7tSxP2CcAvdIorWzX37Pyz7TyRHe7U94QBDLrpBIhFyWcLGj2h/hS45X8Yojic1Y9Hi0tlQmnO8wY1qvfY9P+pWfqZhp66Kt5w4nEqlMAJTLzFv6zktspcCc6IAHmUOsWr1YqoQgANIyhONtIZXzJhstschzrvWMItmlq9c0lya5+yZJAt5+ub/rxUD162vmGjas0fxlYEwpAX0TbCfRteziFTfLEIT8EdZlq0v6PuxzulWr7livCvI/COuy9D1rO2VdaZy5+n5ywUCUra6qvNa3dGPpqr2zIVm0NIN1Wag8ZTNjdax+ZO2V3M4gINOAJLHRm/7nAh0K45Zvbkhd3ZBh9eYzZAAoywkX2dbXgYBYbkLoP0mq1FxX0pBKZAYgOgL9Rj9rS2lxNP8ZNW6r3izI//qtgYK1rHjh9SfbjWCTVlYvWLc0VWruXWG1nFTs4DA7iESLh85vDCg1f2nzt9gq8pJE7LU/dYdES9kza48yZEi9+a6ZqkbbLK853/+1Uqvt11hsaN1vmYnqxMoKhN391DsVql/VWC1dd4IFJgsKpAqsXWF7hbKJg0+si/KySYJIdIRY38X+LdY/cFRjsbq6pR62CrrMVl7vJe+JDnBl/almdIJHDdNDlsoPwr2S/Oc6cKm6AfcZr41US7X7nZCLrh28TckKV0TRbrPY3zjrDN8aBr3gIktFujwCjPqE540ie7p+q2uME+tprcEJYS/CwvqFToijXa6NjbijcVF2uaALrwLEoYuZA+atSQAAAABJRU5ErkJggg==',
                iconImageSize: [43, 50],
                iconImageOffset: [-10, -50]
            });

            ymaps.option.presetStorage.add('custom#showroom-active', {
                iconLayout: 'default#image',
                iconImageHref: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAAAyCAYAAADFhCKTAAAE00lEQVR4AcXXA7BbSxyA8XNt1bZt27Zt27Zt27bbwbNt+9U2z/t23mxnm8nJ5qRBZ373zsnd7H7zD2vY+Xeve89glMdEHMePuIEXuIeLeAur0AZJMLzF3YXJMQV/wrThEQ6gnD9iwzEGd2G+ptPI6avYPPgUphc9RF9vx1bDLZg+shYh3oitjscwfWwHgl8ntiDuw/STBZ7GxuIHmH70Ak08iV0CMwAuI9FObFY8gRkgM+3EroIZQLcR705sNG7D1PmtXXuzRcaMZqXkKUw+fV8S171y5jJXli1vvt+kqafBPd2JbQTT3VjitEQ4az35hNPGLvUg1unftlWuauaIjBR/F7/tTvkBwnSxb3ojVrrcqYuYrAwW13aCC+hiL3ozVhLPbdaJ57Gd2Ka62Pu+iL1Qr4F88dmJ7aKLfeiLWB5+udbOU6GnLvZnX8RCrrXzztBIF3vSV7G8wOzGZtHFjvB+rK210i9B//8zrIjYgr6I5T1XfkC4tfftbj3WEhTsMpYfIvhLu7F3ubYiXlDyKXC4Zi23Yv9o37EqLSEI0sWO9Fbsr6xpznusnOpd/b5iza+Z4+IjaQl1ERsiY1PggaexYpJftWxlruADQE5UBHO7XOMy+t+OncfTEYUwF9ONED9k8Dq3YzVmFS/hEArrqd6bXrJUJhpiEIkwi+dulBqbF89dxTI9p3HyKyIvKvE0UAL1sX936CReWEmIQxTCLaYbrV6I4N3WzyvvcNjz4ezSZQpzdnIkaKYb5RibD8/1kd4J/r19x02cmxYp3JhuuBorg7dpI7v1cE2ucbHHnW497g8uWKgkZ2ZAaofpRjh5Zwh2FptJPDy6wDsWLOMdfNmq9XLOy47MSIeUynSjnU3XIRZgs7lwGXbbiTsWHMNvdu1+tUzqNGKquZDFYrryuauNjWfji5pALavo0/UbTOKcgsiD7MhkMd0wGJaxEpt3dhZ5S+jaXc8i/K8Onb4ODwkpxRlFkN9iuvGIhOFubBCHvOcs8qaeVfSLySVK9mL/MiiOQsp0MyrvDLEwtLEqNi/CYU+dRd5QdemmXlsGf9isxQn2rYLyKIWiDtNNj3gYtmMFDlukBl4nTI94QYnm4/dm4RQpWrBndVSymG4CDI9jOSyWQ/+4oYRcU1zt3FVSb2cdlOAVFSotYr8GqIWqKI+SKIJ8iIOhi9Xi0Fp4ocZdcUGGy+hPmrf8iH1aojHqooYy3UKIhuGVWIGAzTLmMsS3qktOXBaUcL7+3ec9dRB7tEEzZbpVUFC+PXk1loOTiPhHRl5UEKRev4wWsYvKld/M/bugncN0c8s3fK/HCkQ0lnH/KP52uJbx7zVt/h33641u6Ig2IhYZ5J4+ixWI2U6c+B5q/oU/FeL6b4jg39p1eFAyVeop3KcfeqILGshXvF9iiUkk6k/ixH/yXvEnZPSkEiX3sH4YBqIPKiMUht9iBcKq/ta+4wumZwq/4jeJ4ON1633NurEYgQHIJ+/r91iBwEW/EOfoi5at72aKi5vHmgnojhQwAhr7c9v2kT+0aff1T23bm6q2OXOKh386Gsi3pYDHCsTm/bZ120f8NoXlFSp+yO2TkV+uCXis6t0mzQZ+17qteb5Bw4sxYWH9Na/2wMYKx+rUO9Mka9Z28k3eV/4DVJHn5nIou6kAAAAASUVORK5CYII=',
                iconImageSize: [43, 50],
                iconImageOffset: [-10, -50]
            });

            ymaps.option.presetStorage.add('custom#retail', {
                iconLayout: 'default#image',
                iconImageHref: 'data:image/png;base64,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',
                iconImageSize: [43, 50],
                iconImageOffset: [-10, -50]
            });

            ymaps.option.presetStorage.add('custom#retail-active', {
                iconLayout: 'default#image',
                iconImageHref: 'data:image/png;base64,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',
                iconImageSize: [43, 50],
                iconImageOffset: [-10, -50]
            });

            var map = new ymaps.Map(self.mapElem, {
                "center": options.center,
                "zoom": options.zoom || 9,
                "controls": ["zoomControl", "fullscreenControl"]
            });
            map.behaviors.disable("scrollZoom");
            window.map = {moscow: map};

            for (var i = 0, ii = self.points.length; i < ii; i++) {
                var point = self.points[i];
                var placemark = new ymaps.Placemark(point.position,
                    {
                        'hintContent': point.address
                    },
                    {
                        preset: point.type === 1 ? 'custom#showroom' : 'custom#retail',
                        hasBalloon: false
                    });

                (function (placemark, point, index) {
                    placemark.events.add('click', function () {
                        if (!self.domElem.querySelector('.sell-point-popup[data-index="' + index + '"]')) {
                            $('.sell-point-popup', self.domElem).trigger('close');
                            var html =
                                '<div class="sell-point-popup" data-index="' + index + '">' +
                                '  <div class="sell-point-popup__section sell-point-popup__section_close">' +
                                '      <div class="sell-point-popup__close"></div>' +
                                '  </div>' +
                                '  <div class="sell-point-popup__title">Ждем Вас в нашем <span class="word">' + (point.type === 1 ? 'шоу-руме' : 'магазине') + '</span></div>' +
                                '  <div class="sell-point-popup__section sell-point-popup__section_info sell-point-popup__section_address">' +
                                '      <div class="sell-point-popup__address">' + point.address + '</div>' +
                                '  </div>' +
                                '  <div class="sell-point-popup__section sell-point-popup__section_info sell-point-popup__section_phone">' +
                                '      <div class="sell-point-popup__phone">' + point.phone + '</div>' +
                                '  </div>' +
                                '  <div class="sell-point-popup__section sell-point-popup__section_info sell-point-popup__section_schedule">' +
                                '      <div class="sell-point-popup__schedule">' + point.schedule + '</div>' +
                                '  </div>' +
                                '  <div class="sell-point-popup__section sell-point-popup__section_gallery">' +
                                ((point.images.length === 0) ? '' : (
                                    '<div class="sell-point-popup__section sell-point-popup__section_gallery-grid">' +
                                    '    <div class="sell-point-popup__gallery-grid">' +
                                    ((point.images.length === 1) ? (
                                        '<div class="sell-point-popup__gallery-cell sell-point-popup__gallery-cell_active">' +
                                        '    <div class="sell-point-popup__gallery-image" data-index="0" href="' + point.images[0].image + '" style="background-image:url(' + point.images[0].thumb + ')"></div>' +
                                        '</div>'
                                    ) : (
                                        '<div class="sell-point-popup__gallery-cell">' +
                                        '    <div class="sell-point-popup__gallery-image" data-index="0" href="' + point.images[0].image + '" style="background-image:url(' + point.images[0].thumb + ')"></div>' +
                                        '</div>' +
                                        '<div class="sell-point-popup__gallery-cell">' +
                                        '    <div class="sell-point-popup__gallery-image" data-index="1" href="' + point.images[1].image + '" style="background-image:url(' + point.images[1].thumb + ')"></div>' +
                                        '</div>'
                                    )) +
                                    '    </div>' +
                                    '</div>' +
                                    ((point.images.length <= 2) ? '' : (
                                        '<div class="sell-point-popup__section sell-point-popup__section_gallery-more">' +
                                        '    <div class="sell-point-popup__gallery-more">Смотреть все фото</div>' +
                                        '</div>'
                                    ))) +
                                    '  </div>') +
                                '</div>';

                            var $popup = $(html)
                                .one('click', '.sell-point-popup__close', function (event) {
                                    hidePopup($(event.delegateTarget), placemark, point);

                                    return false;
                                })
                                .one('close', function (event) {
                                    hidePopup($(event.delegateTarget), placemark, point);

                                    return false;
                                })
                                .on('click', '.sell-point-popup__gallery-image', function (event) {
                                    var index = $(event.target).attr('data-index') || 0;
                                    galleryPopup(+index);

                                    return false;
                                })
                                .on('click', '.sell-point-popup__gallery-more', function () {
                                    galleryPopup(0);

                                    return false;
                                })
                                .appendTo(self.domElem);

                            $popup
                                .css('height', $popup[0].scrollHeight + 'px')
                                .addClass('sell-point-popup_active');

                            placemark.options.set({
                                preset: point.type === 1 ? 'custom#showroom-active' : 'custom#retail-active'
                            });

                            function hidePopup($element, placemark, point) {
                                placemark.options.set({
                                    preset: point.type === 1 ? 'custom#showroom' : 'custom#retail'
                                });
                                $element.remove();
                            }

                            function galleryPopup(index) {
                                var html =
                                    '<div class="showroom-page-slider showroom-page-slider_modal blur-content">' +
                                    '    <span class="close"></span>' +
                                    '    <div class="showroom-page-slider__images">' +
                                    point.images.reduce(function (html, item) {
                                        return html +
                                            '<div>' +
                                            '    <div class="showroom-page-slider__image">' +
                                            '        <div class="showroom-page-slider__image-bg" style="background-image:url(' + item.image + ')"></div>' +
                                            '    </div>' +
                                            '</div>';
                                    }, '') +
                                    '    </div>' +
                                    '    <div class="showroom-page-slider__thumbs">' +
                                    point.images.reduce(function (html, item) {
                                        return html +
                                            '<div class="showroom-page-slider__thumb">' +
                                            '    <div class="showroom-page-slider__thumb-bg" style="background-image:url(' + item.thumb + ')"></div>' +
                                            '</div>';
                                    }, '') +
                                    '    </div>' +
                                    '</div>';

                                var $this = $(html);
                                var $images = $(".showroom-page-slider__images", $this);
                                var $thumbs = $(".showroom-page-slider__thumbs", $this);

                                $this
                                    .one("ct-blurdialog.afterHide", function () {
                                        $this.parent().remove();
                                    })
                                    .one("click", ".close", function () {
                                        $this.blurdialog('hide');

                                        return false;
                                    });
                                $this.blurdialog({animate: false});
                                $this.blurdialog('show');

                                $images.slick({
                                    "slidesToShow": 1,
                                    "slidesToScroll": 1,
                                    "fade": true,
                                    "swipe": false,
                                    "prevArrow": '<div class="showroom-page-slider__prev"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30.7 58.5"><path d="M0 29.3L29.3 0l1.4 1.4-28 28 28 27.7-1.4 1.5L0 29.3"></path></svg></div>',
                                    "nextArrow": '<div class="showroom-page-slider__next"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30.7 58.5"><path d="M30.7 29.3L1.4 0 0 1.4l28 28L0 57l1.4 1.5 29.3-29.2"></path></svg></div>',
                                    "responsive": [
                                        {
                                            "breakpoint": 640,
                                            "settings": {
                                                "arrows": false,
                                                "swipe": true
                                            }
                                        }
                                    ]
                                });
                                var thumbsPrev = $('<div class="showroom-page-slider__prev">');
                                var thumbsNext = $('<div class="showroom-page-slider__next">');
                                $thumbs.slick({
                                    "slidesToShow": 9,
                                    "slidesPerRow": 1,
                                    "slidesToScroll": 1,
                                    "focusOnSelect": false,
                                    "infinite": false,
                                    "arrows": false
                                });
                                thumbsPrev.appendTo($thumbs).on('click', function(){
                                    $thumbs.slick('slickPrev');
                                });
                                thumbsNext.appendTo($thumbs).on('click', function(){
                                    $thumbs.slick('slickNext');
                                });
                                $images.on("beforeChange", function (event, slick, currentSlide, nextSlide) {
                                    var left = +$(".slick-active", $thumbs).first().attr("data-slick-index");
                                    var right = +$(".slick-active", $thumbs).last().attr("data-slick-index");

                                    var $slide = $(".slick-slide[data-slick-index=\"" + nextSlide + "\"]", $images).first();
                                    $(".showroom-page-slider__prev, .showroom-page-slider__next", $images)[$slide.hasClass("showroom-page-slider__pano_active") ? "fadeOut" : "fadeIn"](500);

                                    if (nextSlide >= left && nextSlide <= right) return;

                                    if (currentSlide == 0 && nextSlide != 1 || nextSlide == 0) {
                                        $thumbs.slick("slickGoTo", nextSlide);
                                    } else if (currentSlide < nextSlide) {
                                        $thumbs.slick("slickGoTo", left + 1);
                                    } else {
                                        $thumbs.slick("slickGoTo", left - 1);
                                    }
                                });
                                $(".showroom-page-slider__thumb", $this).on("click", function () {
                                    var $this = $(this);
                                    var slide = +$this.attr("data-slick-index");
                                    $images.slick("slickGoTo", slide);
                                });

                                $images.slick('slickGoTo', index);
                                $thumbs.slick('slickGoTo', index);
                            }
                        }
                    });
                    map.geoObjects.add(placemark);
                })(placemark, point, i);
            }
        });
    }

    SellPoints.prototype.setArea = function (area) {

    };

    return SellPoints
}());
