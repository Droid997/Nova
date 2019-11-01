


export function isArray(obj: any) {
    return Array.isArray(obj);
};

export function pathOnly(href) {
    var p = href.search(/[?#]/);
    return p < 0 ? href : href.slice(0, p);
}

function docBase() {
    return pathOnly(document.baseURI);
}

export var resolveURL = (function (_URL) {

    // feature check: URI support
    // - can URL be used as a constructor (fails in IE 11)?
    // - does toString() return the expected URL string (fails in PhantomJS 2.1)?
    try {
        if (!/localhost/.test(new _URL('index.html', 'http://localhost:8080/').toString())) {
            _URL = null;
        }
    } catch (e) {
        _URL = null;
    }

    if (_URL) {
        return function (sURI, sBase?: string) {
            // For a spec see https://url.spec.whatwg.org/
            // For browser support see https://developer.mozilla.org/en/docs/Web/API/URL
            return new _URL(sURI, sBase ? new _URL(sBase, docBase()) : docBase()).toString();
        };
    }

    // fallback for IE11 and PhantomJS: use a shadow document with <base> and <a>nchor tag
    var doc = document.implementation.createHTMLDocument("Dummy doc for resolveURI");
    var base = doc.createElement('base');
    base.href = docBase();
    doc.head.appendChild(base);
    var anchor = doc.createElement("A");
    doc.body.appendChild(anchor);

    return function (sURI, sBase?: string) {
        base.href = docBase();
        if (sBase != null) {
            // first resolve sBase relative to location
            anchor["href"] = sBase;
            // then use it as base
            base.href = anchor["href"];
        }
        anchor["href"] = sURI;
        // console.log("(" + sURI + "," + sBase + ") => (" + base.href + "," + anchor.href + ")");
        return anchor["href"];
    };

}(global["URL"] || global["webkitURL"]));