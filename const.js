const fontSizeArray = [16, 20, 24, 28];
const storage = localStorage;
const scale = document.getElementById("scale");
const container = document.getElementById("containter")
const isX = false; // 横書きなら true
const scale_p_ruby = document.getElementById("scale_p_ruby");
const rubyLineHeight = isX ? scale_p_ruby.clientHeight : scale_p_ruby.clientWidth; // 一行の高さ（ルビあり）
const maxWidth = isX ? scale.clientWidth : scale.clientHeight; // 縦書きの場合は反転
const maxHeight = isX ? scale.clientHeight : scale.clientWidth;
const fontSizeNum = parseInt(storage.sprFontSize);
const fontSize = fontSizeArray[fontSizeNum];
const maxChars = Math.floor(maxWidth / fontSize); // 1行あたりの最大文字数

if(storage.sprColor === undefined){
    storage.sprColor = "black";
}
if(storage.sprFontFamily === undefined){
    storage.sprFontFamily = "mincho";
}
if(storage.sprFontSize === undefined){
    storage.sprFontSize = 1; // 0-3
}
if(storage.currentPage === undefined){
    storage.currentPage = 1;
}
if(storage.sprMaxPage === undefined){
    storage.sprMaxPage = 1;
}
if(storage.sprArticleStartPageArray === undefined){
    storage.sprArticleStartPageArray = [1];
}
if(storage.sprBackGroundColor === undefined){
    storage.sprBackGroundColor = "black";
}
if(storage.sprVersions === undefined){
    storage.sprVersions = JSON.stringify({
        default: "1"
    });
}
if(storage.sprBookObj === undefined){
    storage.sprBookObj = JSON.stringify({ default: null });
}