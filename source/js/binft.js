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
            "背灯和月就花阴,已是十年踪迹十年.",
            "双眸清亮如秋水,初见纯真不染尘.",
            "欲语还休意未决,轻捻衣角步微斜.",
            "花间初识春风面,一笑纯真似玉壶.",
            "浣花溪上见卿卿,脸波明,黛眉轻.",
            "双蝶绣罗裙,东池宴,初相见.",
            "识尽千千万万人,终不似,伊家好.",
            "从此无心爱良夜,任他明月下西楼.",
            "春风十里扬州路,卷上珠帘总不如."
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