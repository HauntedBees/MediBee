if (!self.define) {
    let e, i = {};
    const s = (s, n) => (s = new URL(s + ".js", n).href, i[s] || new Promise((i => {
        if ("document" in self) {
            const e = document.createElement("script");
            e.src = s, e.onload = i, document.head.appendChild(e)
        } else e = s, importScripts(s), i()
    })).then((() => {
        let e = i[s];
        if (!e) throw new Error(`Module ${s} didn't register its module`);
        return e
    })));
    self.define = (n, r) => {
        const o = e || ("document" in self ? document.currentScript.src : "") || location.href;
        if (i[o]) return;
        let c = {};
        const f = e => s(e, o),
            d = {
                module: {
                    uri: o
                },
                exports: c,
                require: f
            };
        i[o] = Promise.all(n.map((e => d[e] || f(e)))).then((e => (r(...e), c)))
    }
}
define(["./workbox"], (function(e) {
    "use strict";
    self.skipWaiting(), e.clientsClaim(), e.precacheAndRoute([{
        url: "assets/index.BlPLida2.js",
        revision: null
    }, {
        url: "assets/index.DZ4g0vno.css",
        revision: null
    }, {
        url: "assets/workbox.js",
        revision: null
    }, {
        url: "index.html",
        revision: "6eb74b484d92a9ab051e37dd92b84b81"
    }, {
        url: "assets/Roboto-Bold-CM98DFac.ttf",
        revision: "7fbdfaab6bd8b191496ffe1ef1b9e748"
    }, {
        url: "assets/Roboto-Regular-ia0dPpEo.ttf",
        revision: "05a47f9e469d408c629f931cd33ff8b2"
    }, {
        url: "manifest.webmanifest",
        revision: "6227b806853d374111001a3f916df952"
    }], {}), e.cleanupOutdatedCaches(), e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))
}));