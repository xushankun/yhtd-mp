var Tokenizer = require("./Tokenizer.js");
var DomHandler = require("./DomHandler.js");
var openImpliesClose = {
  tr: {
    tr: true,
    th: true,
    td: true
  },
  th: {
    th: true
  },
  td: {
    thead: true,
    th: true,
    td: true
  },
  body: {
    head: true,
    link: true,
    script: true
  },
  li: {
    li: true
  },
  p: {
    p: true
  },
  h1: {
    p: true
  },
  h2: {
    p: true
  },
  h3: {
    p: true
  },
  h4: {
    p: true
  },
  h5: {
    p: true
  },
  h6: {
    p: true
  },
  option: {
    option: true
  },
  optgroup: {
    optgroup: true
  }
};
var voidElements = {
  __proto__: null,
  area: true,
  base: true,
  basefont: true,
  br: true,
  col: true,
  command: true,
  embed: true,
  frame: true,
  hr: true,
  img: true,
  input: true,
  isindex: true,
  keygen: true,
  link: true,
  meta: true,
  param: true,
  source: true,
  track: true,
  wbr: true,
  path: true,
  circle: true,
  ellipse: true,
  line: true,
  rect: true,
  use: true,
  stop: true,
  polyline: true,
  polygon: true
};

function Parser(cbs) {
  this._cbs = cbs || {};
  this._tagname = "";
  this._attribname = "";
  this._attribvalue = "";
  this._attribs = null;
  this._stack = [];
  this.startIndex = 0;
  this.endIndex = null;
  this._tokenizer = new Tokenizer(this);
  this._cbs.onparserinit(this);
}

Parser.prototype._updatePosition = function(initialOffset) {
  if (this.endIndex === null) {
    if (this._tokenizer._sectionStart <= initialOffset) {
      this.startIndex = 0;
    } else {
      this.startIndex = this._tokenizer._sectionStart - initialOffset;
    }
  } else this.startIndex = this.endIndex + 1;
  this.endIndex = this._tokenizer.getAbsoluteIndex();
};

Parser.prototype.ontext = function(data) {
  this._updatePosition(1);
  this.endIndex--;
  this._cbs.ontext(data);
};

Parser.prototype.onopentagname = function(name) {
  this._tagname = name;
  this._attribs = {};
  if (name in openImpliesClose) {
    for (
      var el;
      (el = this._stack[this._stack.length - 1]) in openImpliesClose[name]; this.onclosetag(el)
    );
  }
  if (!(name in voidElements)) {
    this._stack.push(name);
  }
};

Parser.prototype.onopentagend = function() {
  this._updatePosition(1);
  if (this._attribs) {
    this._cbs.onopentag(this._tagname, this._attribs);
    this._attribs = null;
  }
  if (this._tagname in voidElements) {
    this._cbs.onclosetag(this._tagname);
  }
  this._tagname = "";
};

Parser.prototype.onclosetag = function(name) {
  this._updatePosition(1);
  if (this._stack.length && !(name in voidElements)) {
    var pos = this._stack.lastIndexOf(name);
    if (pos !== -1) {
      pos = this._stack.length - pos;
      while (pos--) this._cbs.onclosetag(this._stack.pop());
    } else if (name === "p") {
      this.onopentagname(name);
      this._closeCurrentTag();
    }
  } else if (name === "br" || name === "p") {
    this.onopentagname(name);
    this._closeCurrentTag();
  }
};

Parser.prototype.onselfclosingtag = function() {
  this.onopentagend();
};

Parser.prototype._closeCurrentTag = function() {
  var name = this._tagname;
  this.onopentagend();
  if (this._stack[this._stack.length - 1] === name) {
    this._cbs.onclosetag(name);
    this._stack.pop();
  }
};

Parser.prototype.onattribname = function(name) {
  this._attribname = name;
};

Parser.prototype.onattribdata = function(value) {
  this._attribvalue += value;
};

Parser.prototype.onattribend = function() {
  if (
    this._attribs &&
    !Object.prototype.hasOwnProperty.call(this._attribs, this._attribname)
  ) {
    this._attribs[this._attribname] = this._attribvalue;
  }
  this._attribname = "";
  this._attribvalue = "";
};

Parser.prototype.onerror = function(err) {
  console.error(err);
};

Parser.prototype.onend = function() {
  for (
    var i = this._stack.length; i > 0; this._cbs.onclosetag(this._stack[--i])
  );
  this._cbs.onend();
};

Parser.prototype.reset = function() {
  this._cbs.onreset();
  this._tokenizer.reset();
  this._tagname = "";
  this._attribname = "";
  this._attribs = null;
  this._stack = [];
  this._cbs.onparserinit(this);
};

Parser.prototype.parseComplete = function(data) {
  this.reset();
  this.end(data);
};

Parser.prototype.write = function(chunk) {
  this._tokenizer.write(chunk);
};

Parser.prototype.end = function(chunk) {
  this._tokenizer.end(chunk);
};

Parser.prototype.pause = function() {
  this._tokenizer.pause();
};

Parser.prototype.resume = function() {
  this._tokenizer.resume();
};

Parser.prototype.parseChunk = Parser.prototype.write;
Parser.prototype.done = Parser.prototype.end;

function html2nodes(data,options) {
  return new Promise(function(resolve, reject) {
    data = data.replace(/>\s*?</g, '><'); //删除空格
    data = data.replace(/<!--[\s\S]*?-->/g, ''); //删除注释
    data = data.replace(/<!\[CDATA\[[\s\S]*?\]\]>/gi, ''); //删除CDATA
    data = data.replace(/<script[\s\S]*?<\/script>/gi, ''); //删除脚本
    var style='';
    data = data.replace(/<style.*?>([\s\S]*?)<\/style>/gi,function(){
      style += arguments[1];
      return '';
    }); //处理style
    data = data.replace(/<head[\s\S]*?<\/head>/gi, ''); //删除head
    var handler = new DomHandler(style,options);
    new Parser(handler).end(data);
    resolve({
      'nodes': handler.dom,
      'imgList': handler.imgList
    })
  })
}

module.exports = html2nodes;