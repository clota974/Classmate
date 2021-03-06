const katex = require("katex");

var currentWin = remote.getCurrentWindow();
currentWin.setMaximizable(true);
currentWin.setResizable(true);

var numbers = {
    1: ["I", "II", "III", "IV"],
    2: ["1", "2", "3", "4", "5"]
}

skeleton = {
    specialKeys: []
}

var floating_tool = null;
var floatingShown = false;
var lastObjCreated = null; 

var roles_fn = {
    highlight: function(color = "transparent"){
        document.execCommand("hiliteColor", true, color)

        // var sel = document.getSelection();
        // var focus = sel.focusNode.parentElement;
        
        // if(!color) color = "var(--none)";


        // if(sel.focusNode === lastObjCreated){
        //     obj = lastObjCreated;
        //     $(obj).css("background-color", color);    
        //     return false;      
        // }
        // if(focus.innerText === document.getSelection().toString()){
        //     obj = focus;
        //     $(obj).css("background-color", color);    
        //     return false;        
        // }
        // // if(sel === lastObjCreated)
        // var obj = $("<mark></mark>").get(0);

        // $(obj).css("background-color", color);

        // var range = sel.getRangeAt(0);
        // console.log(range)
        // range.surroundContents(obj);

        // sel.collapse($(obj).get(0))

        // lastObjCreated = obj;
        // console.log(document.getSelection().focusNode);
    },
    color: function(color = "black"){
        document.execCommand("foreColor", true, color)
    },
    specialKey: function(){
        new SpecialKey({keyword:"Définition"});
    },
    formula: function(){
        new Formula({
            formula: "",
            isBlock: false,
            openEditor: true
        })
    }
}

$(document).ready(function(){

    $(".fff").html(function(){
        return new Formula({
            formula: "ax^2+bx+c=0",
            isBlock: true,
            doNotAppend: true
        }).html
    })

    $(".color-circle").each(function(){
        var color = $(this).attr("data-color");
        $(this).css("background-color", `var(--${color})`)
    })

    $(".color-circle").mousedown(function(ev){
        ev.preventDefault();

        var color = "var(--"+$(this).attr("data-color")+")";
        color = $(this).css("background-color");
        
        format(floating_tool, color);
    })

    $("[data-role=color], [data-role=highlight]").hover(function(){
        var cx = getCenterOfElement(this).cx;
        var circle_center = $("#floating-color-circle").width()/2;


        $("#floating-color-circle").css("left", cx-circle_center);
        $("#floating-color-circle").addClass("show")

        floating_tool = $(this).attr("data-role");
    }, ()=>floatingShown = true);


    
    

    $("body").on("mousemove",function(ev){
        /**  
         * Do not use RETURN FALSE or selection will be prevented ;(
         * **/
        if(floatingShown === true){ 
            var x = ev.originalEvent.clientX;
            var y = ev.originalEvent.clientY;

            var boundX1 = $("#floating-color-circle").position().left;
            var boundX2 = boundX1 + $("#floating-color-circle").width();
            var boundY = $("#floating-color-circle").position().top + $("#floating-color-circle").height();

            if(x < boundX1 || x > boundX2 || y > boundY+20){
                floating_tool = null;
                floatingShown = false;
                $("#floating-color-circle").removeClass("show")
            }
        }
    });

    $(".tools").mousedown(function(ev){
        // ev.preventDefault();
    })
    $(".m-icon").mousedown(function(ev){
        // ev.preventDefault();

        var role = $(this).attr("data-role");
        format(role);
    })
    
    $(".m-title").click(function(){
        
    })

    $(".h-title").change(function(){
        alert();
    })


    $(".latex-editor .buttons button").each(function(ix, el){
        var text = $(el).text();
        $(el).attr("data-role", text);
        $(el).html( katex.renderToString(text) );
    });

    $(".stop").on("remove", function(){
        alert();
    });

    document.onselectionchange = () => {
        try {
            localize();
        } catch (error) {
            skeleton.print.object = null;
        }
    }
    $("body").on("keyup", function(ev){
        if(skeleton.print.critical && ev.keyCode == 8){
            console.log("ERASING")
            $(skeleton.print.object).parent().remove();
        }
        try {
            localize()
        } catch (error) {
            skeleton.print.object = null;
        }
    })
});

function format(tool, value){
    if(roles_fn.hasOwnProperty(tool)){
        roles_fn[tool](value);
        return false;
    }

    
    document.execCommand(tool)
}

function localize(){
    if( $("textarea:focus, input:focus").length == 1 ){
        return false;
    }
    var print = {
        parts: [],
        node: "",
        object: null,
        critical: false // Determines if it can delete an object
    }

    var parts = [];

    var focus = document.getSelection().getRangeAt(0).startContainer.parentElement;

    var atRoot = false;
    var parent = focus;

    var i = 0;
    // Title
    while(!atRoot){
        i++;

        parent = $(parent).parent();

        if( $(parent).hasClass("lessonContent") || parent.length === 0){
            atRoot = true;
            break;
        }
        parts.unshift( $(parent).attr("data-number") )

        if(i>=10){
            console.error("Couldn't localize parts.")
            break;
        }
    }
    print.parts = parts;

    // Element type
    var range = document.getSelection().getRangeAt(0);

    if( $(range.startContainer.parentElement).parent(".specialKey").length){
        print.node = "specialKey"
    }else if(range.startContainer.className === "h-title"){
        print.node = "title";
        
        print.object = range.startContainer;
    }else if(range.startContainer.nodeName === "#text"){
        if(range.startContainer.parentElement.className === "h-title"){
            print.node = "title";
            print.object = range.startContainer.parentElement;
        }else{
            print.node = range.startContainer.parentElement.nodeName;
        }
    }
    
    if(range.startContainer.nodeName == "SPAN"){
        print.critical = true;
    }

    skeleton.print = print;
    return print;
}

function getCenterOfElement(el){
    var top = $(el).position().top;
    var left = $(el).position().left;
    var w = $(el).width();
    var h = $(el).height();

    var cx = left+w/2;
    var cy = top+h/2;

    return {cx,cy};
}