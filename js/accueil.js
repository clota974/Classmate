$(document).ready(function(){
    $("#input-search").on("keyup focus", function(){ 
        if( $(this).val().length === 0) return false;

        if( !$(this).hasClass("full"))  $(".inputSearch").addClass("full");
    });
    $("#input-search").blur(function(){ $(".inputSearch").removeClass("full"); });
});