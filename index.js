let Prism = require('node-prismjs');
let path = require('path');
let fs = require('hexo-fs');

const codeblock = require('./lib/codeblock');

/**
 * Code block tag
 *
 * Syntax:
 *   {% codeblock [title] [lang:language] [url] [link text] [line_number:(true|false)] [highlight:(true|false)] [first_line:number] [mark:#,#-#] %}
 *   code snippet
 *   {% endcodeblock %}
 */

hexo.extend.tag.register('codeblock', codeblock(hexo), { ends: true });

const baseDir = hexo.base_dir;
const prismDir = path.join(baseDir, 'node_modules', 'prismjs');
const prismThemeDir = path.join(prismDir, 'themes');
const prismjsFilePath = path.join(prismThemeDir, 'prism.js');

// Plugin settings from config
let prismThemeName = hexo.config.codeblock.theme || '';
let line_number = hexo.config.codeblock.line_number || false;

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
        assets.push({
            path: 'css/prism-line-highlight.css',
            data: () => fs.createReadStream(path.join(prismDir, 'plugins/line-highlight', 'prism-line-highlight.css'))
        });
        assets.push({
            path: 'js/prism-line-highlight.min.js',
            data: () => fs.createReadStream(path.join(prismDir, 'plugins/line-highlight', 'prism-line-highlight.min.js'))
        });
    }

    return assets;
});

hexo.extend.filter.register('after_render:html', function (str, data) {

    let css = `<link rel="stylesheet" href="/css/${prismThemeFileName}" type="text/css">`;

    let js = '';

    if (line_number) {
        css += `<link rel="stylesheet" href="/css/prism-line-numbers.css" type="text/css">
            <link rel="stylesheet" href="/css/prism-line-highlight.css" type="text/css">
        `;
        js += `<script src="/js/prism-line-highlight.min.js"></script>`;
    }

    str = str.replace(/<\s*\/\s*head\s*>/, css + js + '</head>');
    //console.log('String ', str);
    return str;
});