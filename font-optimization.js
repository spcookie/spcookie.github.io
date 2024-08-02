const fs = require('fs');
const path = require('path');
const Fontmin = require('fontmin');

// 定义要搜索的文件扩展名
const fileExtensions = ['md', 'js', 'css', 'ejs', 'styl'];

// 定义要搜索的文件夹数组
const directories = [path.join(__dirname, '/source'), path.join(__dirname, '/cdn/static')];

// 定义特定的文件路径数组
const specificFiles = [path.join(__dirname, '/_config.volantis.yml'), path.join(__dirname, '/_config.yml')];

// 定义本地缓存路径
const fontCachePath = path.join(__dirname, '/source/LXGWWenKaiMonoScreen.ttf');

// 不可见字符和非基本多文种平面（BMP）字符
const filterRegex = /[\0-\u001F\u007F-\u009F\u2000-\u206F\uFEFF\uFFF0-\uFFFF]/gu;

// 用于存储所有字符的集合, 定义特定的
let allChars = '胜可折叠昵';

// 递归函数，用于读取文件夹中的所有文件
function readDirectory(directory) {
    fs.readdirSync(directory).forEach(file => {
        const fullPath = path.join(directory, file);
        const fileStats = fs.statSync(fullPath);
        if (fileStats.isDirectory()) {
            readDirectory(fullPath);
        } else if (fileExtensions.includes(path.extname(file).slice(1).toLowerCase())) {
            const content = fs.readFileSync(fullPath, 'utf8');
            // 过滤掉不可见字符和非基本多文种平面（BMP）字符
            const filteredContent = content.replace(filterRegex, '');
            allChars += filteredContent;
        }
    });
}

// 处理特定的文件
function processSpecificFiles(files) {
    files.forEach(file => {
        if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');
            const filteredContent = content.replace(filterRegex, '');
            allChars += filteredContent;
        } else {
            console.log(`File not found: ${file}`);
        }
    });
}

function optimizeFont() {
    // 遍历所有文件夹
    directories.forEach(dir => {
        readDirectory(dir);
    });

    // 处理特定文件
    processSpecificFiles(specificFiles);

    // 将字符串拆分为字符数组，并去除重复字符
    const charsArray = Array.from(new Set(allChars));

    // 对字符数组进行排序（以字符的Unicode码点排序）
    charsArray.sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0));

    // 将排序后的字符数组转换为字符串
    const chars = charsArray.join('');
    
    console.log('============================================================')
    console.log(chars)
    console.log('============================================================')

    // 创建 Fontmin 实例
    const fontmin = new Fontmin()
        .src('cdn/static/LXGWWenKaiMonoScreen.ttf') // 指定源字体文件路径
        .dest('cdn/static/font') // 指定输出路径
        .use(Fontmin.glyph({ // 使用 glyph 插件
            text: chars,
            hinting: false  // keep ttf hint info (fpgm, prep, cvt). default = true
        }));

    // 运行 Fontmin 实例
    fontmin.run(function (err, files) {
        if (err) {
            console.error('Error:', err);
            return;
        }
        console.log('Font optimization completed:', files[0].path);
    });
}

// 检查字体缓存并执行相应操作
function checkAndProcessFont() {
    try {
        optimizeFont();
    } catch (err) {
        console.error('Error:', err);
    }
}

console.log('Font optimization start...')

// 优化字体
checkAndProcessFont()