"use strict";

const getId = () => {
    const parameter = location.search;
    if(parameter.indexOf("book") > -1){
        const book = parameter.match(/book=\d+/);
        const id = book[0].substr(5);
        return parseInt(id);
    } else {
        return 0;
    }
}

const getArticleNum = () => {
    const parameter = location.search;
    if(parameter.indexOf("article") > -1){
        const book = parameter.match(/article=\d+/);
        const num = book[0].substr(8);
        return parseInt(num);
    } else {
        return 0;
    }
}

const getVer = (fileName) => {
    if(storage.sprVersions){
        const v = JSON.parse(storage.sprVersions);
        if(v[fileName]){
            return parseInt(v[fileName]);
        } else {
            return 0;
        }
    }
}

// バージョン番号を比べ、更新されていれば true
const allowReload = (latest, fileName) => {
    const ls = getVer(fileName);
    return latest > ls;
}

const getList = async() => {
    const response = await fetch('./books/bookList.txt');
    const str = await response.text();
    const br = checkBrCode(str);
    const array = str.split(br);
    return array.map((line) => {
        const titleAndPath = line.split("|");
        return {
            title: titleAndPath[0],
            path: titleAndPath[1],
            ver: titleAndPath[2]
        };
    });
}

const setArticleSelector = (titles) => {
    if(titles){
        titles.map((title) => {
            let option = document.createElement("option");
            option.text = title;
            selectArticle.appendChild(option);
        });
    } else {
        selectArticle.style.display = "none";
    }
}

const updateVerInLocalStorage = (path, ver) => {
    let vers = JSON.parse(storage.sprVersions);
    vers[path] = ver;
    storage.sprVersions = JSON.stringify(vers);
}

const getFileName = (path) => {
    if(path.indexOf("/") > -1){
        const fileName = path.match(/\/([a-zA-Z0-9_-]+)\.txt/);
        return fileName[0].replace(".txt", "");
    } else {
        return path.replace(".txt", "");
    }
}

const createDivs = (pages) => {
    let pageNum = 0;
    pages.map((page) => {
        const div = document.createElement("div");
        div.classList.add("page");
        const divInDiv = document.createElement("div");
        divInDiv.id = "p-" + pageNum;
        page.lines.map((line) => {
            const p = document.createElement("p");
            p.innerHTML = encodeRuby(line);
            divInDiv.appendChild(p);
            // console.log(line);
            // console.log(p);
        });
        // console.log(divInDiv);
        div.appendChild(divInDiv);
        container.appendChild(div);
        pageNum++;
    });
}

const init = async() => {
    const id = getId();
    const articleNum = getArticleNum();
    const listObj = await getList();
    const fileName = getFileName(listObj[id].path);
    // const reload = allowReload(listObj[id].ver, fileName);
    const reload = true;
    let book = {};
    if(reload){
        book = await createBook(listObj[id].path);
        let json = JSON.parse(storage.sprBookObj);
        json[fileName] = book;
        storage.sprBookObj = JSON.stringify(json);
    } else {
        const obj = JSON.parse(storage.sprBookObj);
        book = obj[fileName];
    }
    await addTitlePage(book.title, 1);
    let articlePagesArray = [1];
    for(let i = 0; i < book.articles.length; i++){
        const chapter = book.articles[i].chapter;
        if(chapter !== null){
            await addTitlePage(chapter, 2);
        }
        const subTitle = book.articles[i].title;
        if(subTitle !== null){
            await addTitlePage(subTitle, 2);
        }
        const articlePages = new ArticlePages(fontSize, maxWidth, maxHeight);
        // await articlePages.asyncCreatePages(book.articles[i].plane);
        await articlePages.asyncCreatePages(book.articles[i].lines);
        // console.log("book.articles[i].lines: ");
        // console.log(book.articles[i].lines);
        // console.log("book.articles[i]: ");
        // console.log(book.articles[i]);
        console.log("articlePages:");
        console.log(articlePages);
        createDivs(articlePages.pageObjs);
        articlePagesArray.push(container.childElementCount + 1);
    }
    articlePagesArray.pop();
    storage.sprArticleStartPageArray = articlePagesArray;
    setArticleSelector(book.subTitles);
    const max = container.childElementCount;
    container.style.width = max * window.innerWidth;
    storage.sprMaxPage = max;
    updateVerInLocalStorage(fileName, listObj[id].ver);
    setSlidersMax(max);
    scroll(articlePagesArray[articleNum], false);
    document.getElementById("nowLoading").style.display = "none";
}

init();
