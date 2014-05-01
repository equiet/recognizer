var parse = require('esprima').parse;
var SourceNode = require("source-map").SourceNode;

var objectKeys = Object.keys || function (obj) {
    var keys = [];
    for (var key in obj) keys.push(key);
    return keys;
};
var forEach = function (xs, fn) {
    if (xs.forEach) return xs.forEach(fn);
    for (var i = 0; i < xs.length; i++) {
        fn.call(xs, xs[i], i, xs);
    }
};

var isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};

var base64 = function (str) {
    return new Buffer(str).toString('base64');
}

module.exports = function (src, opts, fn) {
    if (typeof opts === 'function') {
        fn = opts;
        opts = {};
    }
    if (typeof src === 'object') {
        opts = src;
        src = opts.source;
        delete opts.source;
    }
    src = src === undefined ? opts.source : src;
    opts.range = true;
    opts.loc = true;
    if (typeof src !== 'string') src = String(src);
    
    var ast = parse(src, opts);
    
    var result = {
        chunks : src.split(''),
        map : function () {
            var root = new SourceNode(null, null, null, result.chunks);
            root.setSourceContent(opts.sourceFilename || "in.js", src);
            var sm = root.toStringWithSourceMap({ file: opts.generatedFilename || "out.js" });
            return sm.map.toString();
        },
        toString : function () {
            var root = new SourceNode(null, null, null, result.chunks);
            root.setSourceContent(opts.sourceFilename || "in.js", src);
            var sm = root.toStringWithSourceMap({ file: opts.generatedFilename || "out.js" });
            return sm.code + "\n//@ sourceMappingURL=data:application/json;base64," + base64(sm.map.toString()) + "\n";
        },
        inspect : function () { return result.toString() }
    };
    var index = 0;
    
    (function walk (node, parent) {
        insertHelpers(node, parent, result.chunks, opts);
        
        forEach(objectKeys(node), function (key) {
            if (key === 'parent') return;
            
            var child = node[key];
            if (isArray(child)) {
                forEach(child, function (c) {
                    if (c && typeof c.type === 'string') {
                        walk(c, node);
                    }
                });
            }
            else if (child && typeof child.type === 'string') {
                insertHelpers(child, node, result.chunks, opts);
                walk(child, node);
            }
        });
        fn(node);
    })(ast, undefined);
    
    return result;
};
 
function insertHelpers (node, parent, chunks, opts) {
    if (!node.range) return;
    
    node.parent = parent;
    
    node.source = function () {
        return chunks.slice(
            node.range[0], node.range[1]
        ).join('');
    };
    
    node.sourceNodes = function () {
        return chunks.slice(
            node.range[0], node.range[1]
        );
    };
    
    if (node.update && typeof node.update === 'object') {
        var prev = node.update;
        forEach(objectKeys(prev), function (key) {
            update[key] = prev[key];
        });
        node.update = update;
    }
    else {
        node.update = update;
    }
    
    function update () {
        chunks[node.range[0]] = new SourceNode(
            node.loc.start.line,
            node.loc.start.column,
            opts.sourceFilename || "in.js",
            Array.prototype.slice.apply(arguments));
        for (var i = node.range[0] + 1; i < node.range[1]; i++) {
            chunks[i] = '';
        }
    };
    
    node.replace = function (sourceNode) {
        chunks[node.range[0]] = sourceNode;
        for (var i = node.range[0] + 1; i < node.range[1]; i++) {
            chunks[i] = '';
        }
    };
    
    node.prepend = function () {
        var prevNode = new SourceNode(null, null, null, node.sourceNodes());
        prevNode.prepend(new SourceNode(null, null, null, Array.prototype.slice.apply(arguments)));
        node.replace(prevNode);
    };
    
    node.append = function () {
        var prevNode = new SourceNode(null, null, null, node.sourceNodes());
        prevNode.add(new SourceNode(null, null, null, Array.prototype.slice.apply(arguments)));
        node.replace(prevNode);
    };
}
