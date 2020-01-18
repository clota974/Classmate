$.fn.extend({
    insertAtCaret: function(myValue) {
      this.each(function() {
        if (document.selection) {
          this.focus();
          var sel = document.selection.createRange();
          sel.text = myValue;
          this.focus();
        } else if (this.selectionStart || this.selectionStart == '0') {
          var startPos = this.selectionStart;
          var endPos = this.selectionEnd;
          var scrollTop = this.scrollTop;
          this.value = this.value.substring(0, startPos) +
            myValue + this.value.substring(endPos,this.value.length);
          this.focus();
          this.selectionStart = startPos + myValue.length;
          this.selectionEnd = startPos + myValue.length;
          this.scrollTop = scrollTop;
        } else {
          this.value += myValue;
          this.focus();
        }
      });
      return this;
    }
  });



class Formula{

    constructor(obj){
        this.formula = obj.formula // REQUIRED
        this.isBlock = obj.isBlock || false // REQUIRED : 

        this.html = $("<div class='formula'></div>");
        this.generateHTML();
        if(!obj.doNotAppend) this.appendHTML();

        if(obj.openEditor) new FormulaEditor(this);

        console.log("hello")

    }

    generateHTML(){
        var self = this;
        console.log(this.formula)
        

        if(!this.isBlock){
            $(this.html).addClass("inline")
            console.log(this.html)
        }else{
            $(this.html).removeClass("inline")
        }
        $(this.html).html(katex.renderToString(this.formula, {throwOnError: false, displayMode: self.isBlock}));
        $(this.html).data("object", this);
        $(this.html).click(function(){
            skeleton.formulaEditor = new FormulaEditor( $(this).data("object") );
        })

    }
    
    
    appendHTML(){
        var sel = document.getSelection();
        var range = sel.getRangeAt(0);
        range.insertNode(this.html.get(0));

    }

    onClick(){
        
    }

    destroy(){
        $(this.html).remove();
        console.log(this.html)
        delete this;
    }
}


class FormulaEditor{

    constructor(obj){
        if(skeleton.formulaEditor) skeleton.formulaEditor.destroy();

        var self = this;
        this.object = obj;
        $("#intent-editeur").addClass("latexIsOn");
        this.editor = $(".latex-editor");
        this.textarea = $(this.editor).children("textarea");
        this.buttons = $(this.editor).children(".buttons").children("button");
        skeleton.formulaEditor = this;

        self.update(obj.formula);

        $(this.textarea).on("input", function(){
            self.update($(this).val());
        });
        $(this.textarea).blur(function(){
            self.destroy();
        })

        $(this.buttons).mousedown(function(ev){
            ev.preventDefault();
            ev.stopImmediatePropagation();
            var func = $(this).attr("data-role");
            func = func.replace(/□/g, "");
            $(self.textarea).insertAtCaret(func);
            self.update($(self.textarea).val());
        });

        $(this.editor).find(".confirm").click(function(){
            self.destroy();
        })
        $(this.editor).find(".format").mousedown(function(ev){
            ev.preventDefault();
            self.object.isBlock = self.object.isBlock ? false : true;
            self.object.generateHTML();
            console.log(self.object.isBlock)
        })
    }

    update(val){
        this.object.formula = val;

        $(this.textarea).val(val);
        this.object.generateHTML();
    }

    destroy(){
        $("#intent-editeur").removeClass("latexIsOn");
        skeleton.formulaEditor = null;

        $(this.textarea).off("input");

        if($(this.textarea).val().length == 0) this.object.destroy();
        delete this;
    }
}