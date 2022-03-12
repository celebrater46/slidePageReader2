class ArticlePages{
    constructor(font, width, height) {
        this.lines = [];
        this.pageObjs = [];
        this.maxWidth = width;
        this.maxHeight = height;
        this.fontSize = font; // px
        this.rubyLineHeight = this.fontSize * 2; // px
        // this.maxChars = Math.floor(this.maxWidth / this.fontSize);
        this.maxChars = Math.floor(this.maxHeight / this.fontSize);
        this.i = 0;
        this.remains = [];
    }

    getIndexOfLineBreak(line, remainLines) {
        const maxHeight = this.rubyLineHeight * remainLines;
        let str = line;
        let num = 0;
        let sumHeight = this.rubyLineHeight;
        while(str.length > this.maxChars){
            let rubyChars = 0; // 行内にルビが存在した場合の補正値（改行したらリセット）
            const rubyIndex = str.indexOf("｜");
            if(rubyIndex > -1 && rubyIndex < this.maxChars + rubyChars){
                const ruby = str.match(/｜([^《]+)《([^》]+)》/);
                const ratio = ruby[2].length / ruby[1].length; // 1-3: 1.5, 2-5: 2.5, 1-5: 2.5
                const trueChars = ratio > 2 ? ruby[2].length / 2 : ruby[1].length;
                const currentWidth = rubyIndex * this.fontSize + trueChars * this.fontSize;
                if(currentWidth > this.maxWidth){
                    num += rubyIndex;
                    sumHeight += this.rubyLineHeight;
                    if(sumHeight > maxHeight){
                        return num;
                    } else {
                        str = str.substr(rubyIndex);
                        rubyChars = 0;
                    }
                } else {
                    // ここにサラリーマンは｜存在しない《ノット・イクシスト》。
                    num += ruby[0].length - trueChars;
                    let checked = "";
                    for(let i = 0; i < trueChars; i++){
                        checked += "‖"; // pien
                    }
                    str = str.replace(ruby[0], checked);
                }
            } else {
                num += this.maxChars + rubyChars;
                sumHeight += this.rubyLineHeight;
                if(sumHeight > maxHeight){
                    return num;
                } else {
                    str = str.substr(this.maxChars);
                    rubyChars = 0;
                }
            }
            if(num > 5000){
                console.log("endless loop occurred")
                return -1; // 無限ループエラー対策
            }
        }
        if(sumHeight + this.rubyLineHeight > maxHeight && line > this.maxChars){
            return num;
        } else {
            return -1; // ページ内にすべての文字が収まる場合
        }
    }

    // 禁則処理によって排除される文字数を算出
    getNumOfDeletedCharsByKinsokuOneLine(line){
        const char = line.substr(this.maxChars - 1, 1);
        const next = line.substr(this.maxChars, 1);
        if(char.search(/[「『（《〈【〚［〔｛]/) > -1){
            return 1;
        } else if(char === "―") {
            if(line.substr(this.maxChars, 1) === "―"){
                return 1;
            }
        } else if(char === "…") {
            if(line.substr(this.maxChars, 1) === "…"){
                return 1;
            } else if(line.substr(this.maxChars - 1, 1) === "…"){
                return 2;
            }
        } else if(next.search(/[、。」』）》〉】〛］〕｝]/) > -1){
            return 1;
        }
        return 0;
    }

    getNumOfDeletedCharsBykinsoku(line){
        let sum = 0;
        let remains = line;
        let i = 0;
        while(remains.length > 0){
            const num = this.getNumOfDeletedCharsByKinsokuOneLine(remains);
            remains = remains.substr(this.maxChars - num);
            sum += num;

            // 無限ループ対策
            if(i > 1000){
                console.log("endless loop occurred");
                break;
            }
        }
        return sum;
    }

    separateFinalLine(line, remainLines){
        const rubyIndex = line.indexOf("｜");
        const max = this.maxChars * remainLines;
        if(rubyIndex > -1 && rubyIndex < max){
            // ルビが１行内にあるなら、新しい改行ポイント indexOf を取得
            const lineBreak = this.getIndexOfLineBreak(line, remainLines);
            if(lineBreak === -1){
                return [line, null];
            }
            // １行で収まりきらない場合は分割
            if(line.length > lineBreak && lineBreak > 0){
                return [line.substr(0, lineBreak), line.substr(lineBreak)];
            }
        } else {
            if(line.length > max){
                const kinsoku = this.getNumOfDeletedCharsBykinsoku(line);
                const line1 = line.substr(0, max - kinsoku);
                const line2 = line.substr(max - kinsoku);
                return [line1, line2];
            }
        }
        return [line, null];
    }

    // 1行の幅を計算（オーバーサイズルビにも対応）
    calcPWidth(line){
        let str = line;
        if(str.indexOf("<ruby>") > -1){
            const rubys = str.match(/<ruby><rb>([^\x01-\x7E]+)<\/rb><rp>\(<\/rp><rt>([^\x01-\x7E]+)<\/rt><rp>\)<\/rp><\/ruby>/g);
            rubys.map((ruby) => {
                let tempStr = ruby.replace("<ruby><rb>", "");
                tempStr = tempStr.replace("</rt><rp>)</rp></ruby>", "");
                const rprt = tempStr.split("</rb><rp>(</rp><rt>");
                const remainChars = Math.ceil(rprt[1].length / rprt[0].length) - rprt[0].length; // オーバーサイズルビの増加文字数
                let addition = "";
                for(let i = 0; i < remainChars; i++){
                    addition += "‖"; // pien
                }
                str = str.replace(ruby, rprt[0] + addition);
            });
        }
        return str.length * this.fontSize;
    }

    calcPHeight(line){
        let scale = 0;
        let str = line;
        let i = 0;
        while(str.length > 0){
            const rubyIndex = str.indexOf("｜");
            if(rubyIndex > -1 && rubyIndex < this.maxChars){
                const array = this.separateFinalLine(str, 1);
                if(array[1] === null){
                    break;
                } else {
                    str = array[1];
                }
            } else {
                const kinsoku = this.getNumOfDeletedCharsByKinsokuOneLine(str);
                str = str.substr(this.maxChars - kinsoku);
            }
            scale += this.rubyLineHeight;
            i++;
            if(i > 1000){
                console.log("endless loop!!!!!!!!!!!");
                break;
            }
        }
        return scale;
    }

    async testGetPage(i, remainLines) {
        return await this.createPage(i, remainLines);
    }

    createPage(i, remainLines){
        return new Promise((resolve, reject) => {
            // console.log("remainLines: ");
            // console.log(remainLines);
            let page = new Page(i);
            // page.lines.push(<h2>{ this.title }</h2>);
            let lines = remainLines;
            // console.log("lines:");
            // console.log(lines);
            let finalLine = 0;
            let sumHeight = this.rubyLineHeight;
            let pHeight = 0;
            let testI = 0;
            for(let j = 0; j < lines.length; j++){
                if(sumHeight < this.maxHeight){
                    page.lines.push(lines[j]);
                    pHeight = this.calcPHeight(lines[j]);
                    sumHeight += pHeight;
                    testI++;
                } else {
                    if(finalLine === 0){
                        sumHeight -= pHeight;
                        finalLine = j - 1;
                        break;
                    }
                }
            }

            if(finalLine > 0){
                page.lines.pop();
                const remainHeight = this.maxHeight - sumHeight;
                let newLines = lines.slice(finalLine + 1);
                if(remainHeight >= this.rubyLineHeight){
                    const remainLines = Math.floor(remainHeight / this.rubyLineHeight);
                    const array = this.separateFinalLine(
                        lines[finalLine],
                        remainLines
                    );
                    page.lines.push(array[0]);
                    if(array[1] !== null){
                        newLines.unshift(array[1]);
                    }
                }
                // console.log(page);
                this.pageObjs.push(page);
                resolve(newLines);
            } else {
                this.pageObjs.push(page);
                resolve("");
            }
        });
    }

    async asyncCreatePages(lines){
        this.remains = await this.createPage(this.i, lines);
        if(this.remains.length > 0){
            this.i++;
            if(this.i > 1000){
                console.log("endless loop occurred");
            } else {
                return await this.asyncCreatePages(this.remains);
            }
        } else {
            // return this.pageObjs;
        }
    }
}