var docdown = require("docdownjs");

var fs = require('fs');

// generate Markdown
var markdown = docdown(String(fs.readFileSync('queryize.js')), {
  title: 'Queryize <sup>v0.1.1</sup>',
  // toc: 'categories',
  url: 'https://github.com/ChiperSoft/QueryizeJS/blob/master/queryize.js'
});

fs.writeFileSync('DOCS.md', markdown, 'utf-8');