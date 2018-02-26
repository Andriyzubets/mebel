$(".wikidivania-product-collage-item__buy").click(function (event) {
    var data = this.getAttribute('data-bem');

    if (data) {
        var config = JSON.parse(data);
        var cart = {
            "shopProductId": config.productID,
            "parameterValues": [],
            "data": config,
            "cart_widget": 'sidebar'
        };
        $.cart('putWithSidebar', cart);
    }

    return false;
});