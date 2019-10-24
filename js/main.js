$ = window.jQuery = require("jquery");
const remote = require('electron').remote; // For traffic lights

var intents = ["main"];

$(document).ready(function(){
    $(".main").css("top",0)

    setTimeout(function(){
        // $(".main").addClass("show")
    },500)

    // Traffic lights
    var win = remote.getCurrentWindow();
    $(".traffic-close").click(function(){ win.close() });
    $(".traffic-minimize").click(function(){ win.minimize() });
    $(".traffic-maximize").click(function(){ 
        if( $(this).hasClass("disabled") )  return false
        
        if(win.isFullScreen()){
            $("div.root").removeClass("isFullScreen");
            win.setFullScreen(false);
        }else{
            $("div.root").addClass("isFullScreen");
            win.setFullScreen(true);
        }
    });

    if(win.isFullScreen()) $("div.root").addClass("isFullScreen");

    $("img").each(function(){
        // Empêcher le glisser-déposer des images
        if( $(this).is("[draggable]") == false ){
            
            $(this).attr("draggable", "false");
        }
    });

    $(".fn-backIntent").click(backIntent);
})

function openIntent(intentName){
    if($(`[data-intent=${intentName}]`).length === 1){
        intents.push(intentName)

        $(`[data-intent=${intentName}]`).addClass("show");
    }else{
        console.error(`Intent '${intentName}' could not be started : None or too many of this name`)
    }
}

function backIntent(){
    var currentIntent = intents[intents.length-1];
    $(`[data-intent=${currentIntent}]`).removeClass("show");

    intents.pop();
}
