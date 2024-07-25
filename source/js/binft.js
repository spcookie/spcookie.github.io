var binft = function (r) {
    var isTransparent = true;
    function getRandomColor() {
        if(isTransparent){
            isTransparent = false;
            //此处修改字体颜色,最后的 0 和 1 不要改
            return "rgba(255,255,255,0)"
        }else{
            isTransparent = true;
            return "rgba(255,255,255,1)"
        }
    }  
    function n(r) {
        for (var n = document.createDocumentFragment(), i = 0; r > i; i++) {
            var oneword = document.createElement("span");
            oneword.textContent = "_"; // 此处是末尾字符,如果想用光标样式可以改为"|"
            oneword.style.color = getRandomColor();
            n.appendChild(oneword);
        }
        return n
    }
    function i() {
        var t = wordList[c.skillI];
        c.step ? c.step-- : (c.step = refreshDelayTime, c.prefixP < l.length ? (c.prefixP >= 0 && (c.text += l[c.prefixP]), c.prefixP++) : "forward" === c.direction ? c.skillP < t.length ? (c.text += t[c.skillP], c.skillP++) : c.delay ? c.delay-- : (c.direction = "backward", c.delay = showTotalWordDelayTime) : c.skillP > 0 ? (c.text = c.text.slice(0, -1), c.skillP--) : (c.skillI = (c.skillI + 1) % wordList.length, c.direction = "forward")), r.textContent = c.text, r.appendChild(n(c.prefixP < l.length ? Math.min(maxLength, maxLength + c.prefixP) : Math.min(maxLength, t.length - c.skillP))), setTimeout(i, d)
    }
    var l = "",
    //此处改成你自己的诗词
    wordList = [ 
            "有花堪折直需折,莫待无花空折枝.",
            "闲居少邻并,草径入荒园.鸟宿池边树,僧敲月下门.",
            "侯门一入深如海,从此萧郎是路人.",
            "才见岭头云似盖,已惊岩下雪如尘.",
            "人间万事消磨尽,只有清香似旧时.",
            "日暮酒醒人已远,满天风雨下西楼.",
            "落灯花,棋未收,叹新丰逆旅淹留.",
            "软风吹过窗纱,心期便隔天涯.",
            "迷惑失故路,薄暮无宿栖.",
            "不见白头相携老,只许与君共天明.",
            "晓迎秋露一枝新,不占园中最上春.",
            "荷尽已无擎雨盖,菊残犹有傲霜枝.",
            "春未绿,鬓先丝.人间别久不成悲.",
            "江东子弟多才俊,卷土重来未可知.",
            "莫听穿林打叶声,何妨吟啸且徐行.",
            "在天愿作比翼鸟,在地愿为连理枝.",
        ].map(function (r) {
    return r + ""
    }),
    showTotalWordDelayTime = 2,
    refreshDelayTime = 1,
    maxLength = 1,
    d = 75,
    c = {
        text: "",
        prefixP: -maxLength,
        skillI: 0,
        skillP: 0,
        direction: "forward",
        delay: showTotalWordDelayTime,
        step: refreshDelayTime
    };
    i()
};
binft(document.getElementById('binft'));