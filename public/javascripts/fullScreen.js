function alturaMaxima() {
    var altura = $(window).height();
    $(".full-screen").css('min-height', altura);
}

$(document).ready(function () {
    alturaMaxima();
    $(window).bind('resize', alturaMaxima);
});
