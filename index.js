let Prism = require('node-prismjs');
let path = require('path');
let fs = require('hexo-fs');

hexo.extend.tag.register('codeblock', (args, content) => {
    let lang = args[0];
    let line_number = hexo.config.prism_plugin.line_number || false;
    let lineNumbers = line_number ? 'line-numbers' : '';
    const startTag = `<pre class="${lineNumbers} language-${lang}"><code class="language-${lang}">`;
    const endTag = `</code></pre>`;
    let parsedCode = '';

    if (Prism.languages[lang]) {
        parsedCode = Prism.highlight(content, Prism.languages[lang]);
    } else {
        parsedCode += content;
    }
    if (line_number) {
        let match = parsedCode.match(/\n(?!$)/g);
        let linesNum = match ? match.length + 1 : 1;
        let lines = new Array(linesNum + 1);
        lines = lines.join('<span></span>');
        let startLine = '<span aria-hidden="true" class="line-numbers-rows">';
        let endLine = '</span>';
        parsedCode += startLine + lines + endLine;
    }

    return startTag + parsedCode + endTag;
}, { ends: true });

const baseDir = hexo.base_dir;
const prismDir = path.join(baseDir, 'node_modules', 'prismjs');
const prismThemeDir = path.join(prismDir, 'themes');
const prismjsFilePath = path.join(prismThemeDir, 'prism.js');

// Plugin settings from config
let prismThemeName = hexo.config.prism_plugin.theme || '';
let line_number = hexo.config.prism_plugin.line_number || false;

const prismThemeFileName = 'prism' + (prismThemeName === 'default' ? '' : `-${prismThemeName}`) + '.css';
const prismThemeFilePath = path.join(prismThemeDir, prismThemeFileName);

hexo.extend.generator.register('prism_asset', function (locals) {


    // Register scripts and stylesheets
    let assets = [{
        path: `css/${prismThemeFileName}`,
        data: () => fs.createReadStream(prismThemeFilePath)
    }];
    // If line_number is enabled in plugin config add the corresponding stylesheet
    if (line_number) {
        assets.push({
            path: 'css/prism-line-numbers.css',
            data: () => fs.createReadStream(path.join(prismDir, 'plugins/line-numbers', 'prism-line-numbers.css'))
        });
    }

    return assets;
});

hexo.extend.filter.register('after_render:html', function (str, data) {

    let css = `<link rel="stylesheet" href="/css/${prismThemeFileName}" type="text/css">`;

    let js = '';

    if (line_number) {
        css += `<link rel="stylesheet" href="/css/prism-line-numbers.css" type="text/css">`;
    }

    str = str.replace(/<\s*\/\s*head\s*>/, css + js + '</head>');
    //console.log('String ', str);
    return str;
});