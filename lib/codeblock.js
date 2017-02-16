const Prism = require('node-prismjs');
require('prismjs/plugins/line-numbers/prism-line-numbers.min');
require('prismjs/plugins/line-highlight/prism-line-highlight.min');
const util = require('hexo-util');
const escapeHTML = util.escapeHTML;
/**
 * Code block tag
 *
 * Syntax:
 *   {% codeblock [title] [lang:language] [url] [link text] [line_number:(true|false)] [highlight:(true|false)] [first_line:number] [mark:#,#-#] %}
 *   code snippet
 *   {% endcodeblock %}
 */
const rCaptionUrlTitle = /(\S[\S\s]*)\s+(https?:\/\/)(\S+)\s+(.+)/i;
const rCaptionUrl = /(\S[\S\s]*)\s+(https?:\/\/)(\S+)/i;
const rCaption = /(\S[\S\s]*)/;
const rLang = /\s*lang:(\w+)/i;
const rLineNumber = /\s*line_number:(\w+)/i;
const rHighlight = /\s*highlight:(\w+)/i;
const rFirstLine = /\s*first_line:(\d+)/i;
const rMark = /\s*mark:([0-9,\-]+)/i;

const codeblock = (hexo) => {
  return (args, content) => {
    let arg = args.join(' ');
    let config = hexo.config.codeblock || {};
    let enable = config.enable;

    if (rHighlight.test(arg)) {
      arg = arg.replace(rHighlight, function() {
        enable = arguments[1] === 'true';
        return '';
      });
    }

    if (!enable) {
      content = escapeHTML(content);
      return '<pre><code>' + content + '</code></pre>';
    }

    let caption = '';
    let lang = '';
    let line_number = config.line_number;
    // let first_line = 1;
    let mark = '';
    let match;

    if (rLang.test(arg)) {
      arg = arg.replace(rLang, function() {
        lang = arguments[1];
        return '';
      });
    }

    if (rLineNumber.test(arg)) {
      arg = arg.replace(rLineNumber, function() {
        line_number = arguments[1] === 'true';
        return '';
      });
    }

    if (rMark.test(arg)) {
      arg = arg.replace(rMark, function() {
        mark = arguments[1];
        return '';
      });
    }

    let lineNumbers = line_number ? 'line-numbers' : '';
    const startTag = `<pre class="${lineNumbers} language-${lang}" data-line="${mark}"><code class="language-${lang}">`;
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
  }
};

module.exports = codeblock;
