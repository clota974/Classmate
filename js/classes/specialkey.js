class SpecialKey{

    constructor(obj){
        this.keyword = "Définition"
        this.color = "";
        this.title = "Titre";
        this.content = "Contenu";
        this.number = 0;
        // this.number = findPosition();

        if(obj != undefined) replaceValues(obj, this);

        this.html = this.generateHTML();
        
        this.appendHTML();
        this.updateNumber();

        skeleton.specialKeys.push(this);
        for (const element of skeleton.specialKeys) {
            element.updateNumber();
        }

        
    }

    generateHTML(){
        var self = this;
        var parent = $(`<div class="specialKey" data-key="${self.keyword}"></div>`);
        var content = $(`
        <div class="note"></div>
        <div class="keyword">${self.keyword}</div>
        <div class="hr"></div>
        <div class="title"><span>${self.title}</span></div>
        <p class="content">
            ${self.content}
        </p>
        `);

        $(parent).append(content);
        return parent;
    }

    appendHTML(){
        var self = this;
        var html = this.html;
        var p = $(`<p></p>`);
        var p2 = $(`<p></p>`);

        var sel = document.getSelection();
        var range = sel.getRangeAt(0);
        
        range.insertNode(p.get(0));
        range.insertNode(html.get(0));
        range.insertNode(p2.get(0));

        $(html).unwrap("p");

        
    }
    updateNumber(){
        this.number = $(this.html).index(`.specialKey[data-key='${this.keyword}']`)+1;
        $(this.html).children(".note").text(this.number);
    }
}