let util = require('hexo-util');
let Prism = require('node-prismjs');

const codeblock = (args, content) => {
    let lang = args[0];
    let line_number = hexo.config.prism_plugin.line_number || false;
    let lineNumbers = line_number ? 'line-numbers' : '';
    const startTag = `<pre class="${lineNumbers} language-${lang}"><code class="language-${lang}">`;
    const endTag = `</code></pre>`;
    let parsedCode = '';

    if (Prism.languages[lang]) {
      parsedCode = Prism.highlight(content, Prism.languages[lang]);
    }

    return startTag + parsedCode + endTag;
};

module.exports = codeblock;
