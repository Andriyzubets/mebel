(function ($) {
    'use strict';

    adjustWidth();
    $(window).on('resize', adjustWidth);

    function adjustWidth() {
        var wikiTopMenuWidth = $('.wikiTopMenu-content').width();
        var wikiTopMenuItemWidth = $('.wikiTopMenu-article').outerWidth(true);
        var countWikiTopMenuItems = Math.floor(wikiTopMenuWidth / wikiTopMenuItemWidth) - 1;

        $('#wikiTopMenu .wikiTopMenu-articles').each(function(){
            var $articles = $('.wikiTopMenu-article', this);
            $articles.each(function(index, elem){
                if ($articles.length == index + 1) {
                    $(elem).show()
                } else {
                    $(elem)[countWikiTopMenuItems > index ? 'show' : 'hide']();
                }
            })
        });
    }
}(jQuery));
