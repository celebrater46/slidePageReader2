"use strict";

// const scale = document.getElementById("scale");
// const container = document.getElementById("containter")
// const isX = false; // 横書きなら true
// const scale_p_ruby = document.getElementById("scale_p_ruby");
// const rubyLineHeight = isX ? scale_p_ruby.clientHeight : scale_p_ruby.clientWidth; // 一行の高さ（ルビあり）
// const maxWidth = isX ? scale.clientWidth : scale.clientHeight; // 縦書きの場合は反転
// const maxHeight = isX ? scale.clientHeight : scale.clientWidth;
// // const checkIsPhone = () => {
// //     const agent = navigator.userAgent;
// //     if ((agent.indexOf('iPhone') > 0 && agent.indexOf('iPad') == -1)
// //         || agent.indexOf('iPod') > 0
// //         || agent.indexOf('Android') > 0)
// //     {
// //         return true;
// //     } else {
// //         return false;
// //     }
// // }
// // const isPhone = checkIsPhone();
// const fontSizeNum = parseInt(storage.sprFontSize);
// const fontSize = fontSizeArray[fontSizeNum];
// const maxChars = Math.floor(maxWidth / fontSize); // 1行あたりの最大文字数

// const getIndexOfLineBreak = (encodedLine, remainLines) => {
//     const scaleTest = document.getElementById("scaleTest");
//     scaleTest.innerHTML = "";
//     const maxHeight = rubyLineHeight * remainLines;
//     let str = encodedLine;
//     let num = 0;
//     while(true){
//         if(str.substr(num, 6) === "<ruby>") {
//             // ルビタグの抽出
//             const ruby = str.match(/<ruby><rb>([^\x01-\x7E]+)<\/rb><rp>\(<\/rp><rt>([^\x01-\x7E]+)<\/rt><rp>\)<\/rp><\/ruby>/);
//             scaleTest.innerHTML += ruby[0];
//             const pHeight = isX ? scaleTest.clientHeight : scaleTest.clientWidth;
//             if(pHeight > maxHeight){
//                 return Math.floor(num);
//             } else {
//                 num += ruby[0].length; // 本来一文字先に進むところを、ルビならルビタグ全体分進める
//             }
//             str = str.replace("<ruby>", "<xxxx>"); // 現在のルビタグの無効化
//         } else {
//             scaleTest.innerHTML += str.substr(num, 1);
//             const pHeight = isX ? scaleTest.clientHeight : scaleTest.clientWidth;
//             if(pHeight > maxHeight){
//                 return Math.floor(num);
//             } else {
//                 num++;
//             }
//         }
//         if(num > str.length){
//             return Math.floor(num);
//         }
//         if(num > 5000){
//             console.log("endless loop occurred");
//             return -1; // 無限ループエラー対策
//         }
//     }
// }
//
// // 禁則処理によって排除される文字数を算出
// const getNumOfDeletedCharsByKinsokuOneLine = (line) => {
//     const char = line.substr(maxChars - 1, 1);
//     const next = line.substr(maxChars, 1);
//     if(char.search(/[「『（《〈【〚［〔｛]/) > -1){
//         return 1;
//     } else if(char === "―") {
//         if(line.substr(maxChars, 1) === "―"){
//             return 1;
//         }
//     } else if(char === "…") {
//         if(line.substr(maxChars, 1) === "…"){
//             return 1;
//         } else if(line.substr(maxChars - 1, 1) === "…"){
//             return 2;
//         }
//     } else if(next.search(/[、。」』）》〉】〛］〕｝]/) > -1){
//         return 1;
//     }
//     return 0;
// }

// const getNumOfDeletedCharsBykinsoku = (line) => {
//     let sum = 0;
//     let remains = line;
//     let i = 0;
//     while(remains.length > 0){
//         const num = getNumOfDeletedCharsByKinsokuOneLine(remains);
//         remains = remains.substr(maxChars - num);
//         sum += num;
//
//         // 無限ループ対策
//         if(i > 1000){
//             console.log("endless loop occurred");
//             break;
//         }
//     }
//     return sum;
// }

// const separateFinalLine = (line, remainLines) => {
//     const hasRuby = line.indexOf("<ruby>");
//     const max = maxChars * remainLines;
//     if(hasRuby > -1 && hasRuby < max){
//         // ルビが１行内にあるなら、新しい改行ポイント indexOf を取得
//         const lineBreak = getIndexOfLineBreak(line, remainLines);
//         // １行で収まりきらない場合は分割
//         if(line.length > lineBreak){
//             return [line.substr(0, lineBreak), line.substr(lineBreak)];
//         }
//     } else {
//         if(line.length > max){
//             const kinsoku = getNumOfDeletedCharsBykinsoku(line);
//             const line1 = line.substr(0, max - kinsoku);
//             const line2 = line.substr(max - kinsoku);
//             return [line1, line2];
//         }
//     }
//     return [line, null];
// }

// // 最終行が複数行の場合、一度テスト用のPタグに入れて実測
// const getTruePHeight = (line) => {
//     let scaleP = document.getElementById("scale_p");
//     scaleP.innerHTML = line;
//     return scaleP.clientHeight;
// }

// // 実測した最終行が空きスペースより1行以上少ない場合、追加分を再取得
// const getAdditionalStr = (remainHeight, array) => {
//     const trueHeight = getTruePHeight(array[0]);
//     const remainLines = remainHeight - trueHeight;
//     if(remainLines > rubyLineHeight
//         && array[1].length > 0)
//     {
//         // 実測した最終行が空きスペースより1行以上少ない場合、追加分を再取得
//         return separateFinalLine(
//             array[1],
//             Math.floor(remainLines / rubyLineHeight)
//         );
//     } else {
//         return ["", array[1]];
//     }
// }

const addFinalClass = () => {
    const lastPage = container.lastElementChild;
    lastPage.classList.add("final");
}

const checkBrCode = (str) => {
    if(str.indexOf("\r\n") > -1){
        return "\r\n";
    } else if(str.indexOf("\n") > -1){
        return "\n";
    } else if(str.indexOf("\r") > -1){
        return "\r"
    } else {
        return "";
    }
}

// let pages = [];
// const createPage = (i, remainText) => new Promise(resolve => {
//     pages.push(new Page(i));
//     const encoded = encodeRuby(remainText);
//     const br = checkBrCode(encoded);
//     if(br !== ""){
//         pages[i].lines = encoded.split(br);
//     }
//     let outer = document.createElement("div");
//     outer.classList.add("page");
//     let page = document.createElement("div");
//     outer.appendChild(page);
//     container.appendChild(outer);
//     const scaleP = document.getElementById("scale_p");
//     page.id = "p-" + i;
//     let currentHeight = 0; // 縦書きの時は横幅を意味する
//     let finalLine = 0;
//     for(let j = 0; j < pages[i].lines.length; j++){
//         let line = pages[i].lines[j];
//         line = line === "" ? "　" : line;
//         scaleP.innerHTML = line;
//         if(currentHeight < maxHeight){
//             let p = document.createElement("p");
//             p.innerHTML = line;
//             page.appendChild(p);
//             const pHeight = isX ? scaleP.clientHeight : scaleP.clientWidth;
//             currentHeight += pHeight;
//         } else {
//             if(finalLine === 0){
//                 finalLine = j - 1;
//             }
//         }
//     }
//
//     if(finalLine > 0){
//         page.lastElementChild.remove(); // はみ出した最後の一行を削除
//         const pageHeight = isX ? page.clientHeight : page.clientWidth;
//         const remainHeight = maxHeight - pageHeight;
//         let lines = pages[i].lines.slice(finalLine);
//         if(remainHeight >= rubyLineHeight){
//             lines.shift();
//             const array = separateFinalLine(
//                 pages[i].lines[finalLine],
//                 Math.floor(remainHeight / rubyLineHeight)
//             );
//             const additionalArray = getAdditionalStr(remainHeight, array);
//             let finalP = document.createElement("p");
//             finalP.innerHTML = array[0] + additionalArray[0];
//             page.appendChild(finalP);
//             if(additionalArray[1] !== null){
//                 lines.unshift(additionalArray[1]);
//             }
//         }
//         resolve(lines.join("\n"));
//     } else {
//         addFinalClass();
//         resolve("");
//     }
// });

// let i = 0;
// let remains = "";
// const asyncCreatePages = async(str) => {
//     remains = await createPage(i, str);
//     if(remains.length > 0){
//         i++;
//         await asyncCreatePages(remains);
//     }
// }

const addTitlePage = (str, num) => new Promise(resolve => {
    let divPage = document.createElement("div");
    divPage.classList.add("page");
    let divPageChild = document.createElement("div");
    let h = document.createElement("h" + num);
    h.innerText = str;
    divPageChild.appendChild(h);
    divPage.appendChild(divPageChild);
    container.appendChild(divPage);
    resolve();
});
