class Article {
    constructor(num, text) {
        this.id = num;
        this.chapter = this.getChapter(text);
        this.title = this.getTitle(text);
        this.plane = this.getText(text);
        // this.pages = [];
        this.lines = this.getLines(text);
    }

    getChapter(text){
        const chap = text.match(/<Chapter>(.*)<\/Chapter>/i);
        return chap === null ? null : chap[0].replace(/<Chapter>(.*)<\/Chapter>/i, "$1");
    }

    getTitle(text){
        const sub = text.match(/<Sub>(.*)<\/Sub>/i);
        return sub === null ? null : sub[0].replace(/<Sub>(.*)<\/Sub>/i, "$1");
    }

    getText(text){
        let str = text.replace(/((\r\n)*|(\r)*|(\n)*)<Title>(.*)<\/Title>((\r\n)*|(\r)*|(\n)*)/gi, "");
        str = str.replace(/((\r\n)*|(\r)*|(\n)*)<Chapter>(.*)<\/Chapter>((\r\n)*|(\r)*|(\n)*)/gi, "");
        str = str.replace(/((\r\n)*|(\r)*|(\n)*)<Sub>(.*)<\/Sub>((\r\n)*|(\r)*|(\n)*)/gi, "");
        return str;
    }

    getLines(text){
        // console.log("did getLines()");
        const str = this.getText(text);
        const br = checkBrCode(str);
        const array = str.split(br);
        return array.map((line) => {
            return line === "" ? "　" : line;
        });
    }
}