import { app as te, BrowserWindow as Pr, ipcMain as $, safeStorage as q, shell as ai, dialog as ui } from "electron";
import { fileURLToPath as ci } from "node:url";
import * as I from "node:path";
import { normalize as li } from "node:path";
import * as A from "node:fs";
import { Buffer as fi } from "node:buffer";
import pi from "fs";
import Ir from "tty";
import hi from "util";
import di from "os";
import { spawn as mi } from "child_process";
import { EventEmitter as gi } from "node:events";
var Kt = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function yi(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var st = {}, Mr = {}, it = { exports: {} }, ke = { exports: {} }, Ve, Qt;
function vi() {
  if (Qt) return Ve;
  Qt = 1;
  var e = 1e3, t = e * 60, r = t * 60, n = r * 24, s = n * 7, i = n * 365.25;
  Ve = function(f, u) {
    u = u || {};
    var a = typeof f;
    if (a === "string" && f.length > 0)
      return o(f);
    if (a === "number" && isFinite(f))
      return u.long ? l(f) : c(f);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(f)
    );
  };
  function o(f) {
    if (f = String(f), !(f.length > 100)) {
      var u = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        f
      );
      if (u) {
        var a = parseFloat(u[1]), h = (u[2] || "ms").toLowerCase();
        switch (h) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return a * i;
          case "weeks":
          case "week":
          case "w":
            return a * s;
          case "days":
          case "day":
          case "d":
            return a * n;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return a * r;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return a * t;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return a * e;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return a;
          default:
            return;
        }
      }
    }
  }
  function c(f) {
    var u = Math.abs(f);
    return u >= n ? Math.round(f / n) + "d" : u >= r ? Math.round(f / r) + "h" : u >= t ? Math.round(f / t) + "m" : u >= e ? Math.round(f / e) + "s" : f + "ms";
  }
  function l(f) {
    var u = Math.abs(f);
    return u >= n ? p(f, u, n, "day") : u >= r ? p(f, u, r, "hour") : u >= t ? p(f, u, t, "minute") : u >= e ? p(f, u, e, "second") : f + " ms";
  }
  function p(f, u, a, h) {
    var b = u >= a * 1.5;
    return Math.round(f / a) + " " + h + (b ? "s" : "");
  }
  return Ve;
}
var He, Yt;
function Dr() {
  if (Yt) return He;
  Yt = 1;
  function e(t) {
    n.debug = n, n.default = n, n.coerce = p, n.disable = c, n.enable = i, n.enabled = l, n.humanize = vi(), n.destroy = f, Object.keys(t).forEach((u) => {
      n[u] = t[u];
    }), n.names = [], n.skips = [], n.formatters = {};
    function r(u) {
      let a = 0;
      for (let h = 0; h < u.length; h++)
        a = (a << 5) - a + u.charCodeAt(h), a |= 0;
      return n.colors[Math.abs(a) % n.colors.length];
    }
    n.selectColor = r;
    function n(u) {
      let a, h = null, b, k;
      function C(...S) {
        if (!C.enabled)
          return;
        const M = C, J = Number(/* @__PURE__ */ new Date()), $e = J - (a || J);
        M.diff = $e, M.prev = a, M.curr = J, a = J, S[0] = n.coerce(S[0]), typeof S[0] != "string" && S.unshift("%O");
        let se = 0;
        S[0] = S[0].replace(/%([a-zA-Z%])/g, (le, qe) => {
          if (le === "%%")
            return "%";
          se++;
          const be = n.formatters[qe];
          if (typeof be == "function") {
            const ze = S[se];
            le = be.call(M, ze), S.splice(se, 1), se--;
          }
          return le;
        }), n.formatArgs.call(M, S), (M.log || n.log).apply(M, S);
      }
      return C.namespace = u, C.useColors = n.useColors(), C.color = n.selectColor(u), C.extend = s, C.destroy = n.destroy, Object.defineProperty(C, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => h !== null ? h : (b !== n.namespaces && (b = n.namespaces, k = n.enabled(u)), k),
        set: (S) => {
          h = S;
        }
      }), typeof n.init == "function" && n.init(C), C;
    }
    function s(u, a) {
      const h = n(this.namespace + (typeof a > "u" ? ":" : a) + u);
      return h.log = this.log, h;
    }
    function i(u) {
      n.save(u), n.namespaces = u, n.names = [], n.skips = [];
      const a = (typeof u == "string" ? u : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
      for (const h of a)
        h[0] === "-" ? n.skips.push(h.slice(1)) : n.names.push(h);
    }
    function o(u, a) {
      let h = 0, b = 0, k = -1, C = 0;
      for (; h < u.length; )
        if (b < a.length && (a[b] === u[h] || a[b] === "*"))
          a[b] === "*" ? (k = b, C = h, b++) : (h++, b++);
        else if (k !== -1)
          b = k + 1, C++, h = C;
        else
          return !1;
      for (; b < a.length && a[b] === "*"; )
        b++;
      return b === a.length;
    }
    function c() {
      const u = [
        ...n.names,
        ...n.skips.map((a) => "-" + a)
      ].join(",");
      return n.enable(""), u;
    }
    function l(u) {
      for (const a of n.skips)
        if (o(u, a))
          return !1;
      for (const a of n.names)
        if (o(u, a))
          return !0;
      return !1;
    }
    function p(u) {
      return u instanceof Error ? u.stack || u.message : u;
    }
    function f() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    return n.enable(n.load()), n;
  }
  return He = e, He;
}
var Jt;
function _i() {
  return Jt || (Jt = 1, function(e, t) {
    t.formatArgs = n, t.save = s, t.load = i, t.useColors = r, t.storage = o(), t.destroy = /* @__PURE__ */ (() => {
      let l = !1;
      return () => {
        l || (l = !0, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
      };
    })(), t.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function r() {
      if (typeof window < "u" && window.process && (window.process.type === "renderer" || window.process.__nwjs))
        return !0;
      if (typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/))
        return !1;
      let l;
      return typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator < "u" && navigator.userAgent && (l = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(l[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function n(l) {
      if (l[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + l[0] + (this.useColors ? "%c " : " ") + "+" + e.exports.humanize(this.diff), !this.useColors)
        return;
      const p = "color: " + this.color;
      l.splice(1, 0, p, "color: inherit");
      let f = 0, u = 0;
      l[0].replace(/%[a-zA-Z%]/g, (a) => {
        a !== "%%" && (f++, a === "%c" && (u = f));
      }), l.splice(u, 0, p);
    }
    t.log = console.debug || console.log || (() => {
    });
    function s(l) {
      try {
        l ? t.storage.setItem("debug", l) : t.storage.removeItem("debug");
      } catch {
      }
    }
    function i() {
      let l;
      try {
        l = t.storage.getItem("debug") || t.storage.getItem("DEBUG");
      } catch {
      }
      return !l && typeof process < "u" && "env" in process && (l = process.env.DEBUG), l;
    }
    function o() {
      try {
        return localStorage;
      } catch {
      }
    }
    e.exports = Dr()(t);
    const { formatters: c } = e.exports;
    c.j = function(l) {
      try {
        return JSON.stringify(l);
      } catch (p) {
        return "[UnexpectedJSONParseError]: " + p.message;
      }
    };
  }(ke, ke.exports)), ke.exports;
}
var we = { exports: {} }, Ke, Xt;
function bi() {
  return Xt || (Xt = 1, Ke = (e, t = process.argv) => {
    const r = e.startsWith("-") ? "" : e.length === 1 ? "-" : "--", n = t.indexOf(r + e), s = t.indexOf("--");
    return n !== -1 && (s === -1 || n < s);
  }), Ke;
}
var Qe, Zt;
function ki() {
  if (Zt) return Qe;
  Zt = 1;
  const e = di, t = Ir, r = bi(), { env: n } = process;
  let s;
  r("no-color") || r("no-colors") || r("color=false") || r("color=never") ? s = 0 : (r("color") || r("colors") || r("color=true") || r("color=always")) && (s = 1), "FORCE_COLOR" in n && (n.FORCE_COLOR === "true" ? s = 1 : n.FORCE_COLOR === "false" ? s = 0 : s = n.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(n.FORCE_COLOR, 10), 3));
  function i(l) {
    return l === 0 ? !1 : {
      level: l,
      hasBasic: !0,
      has256: l >= 2,
      has16m: l >= 3
    };
  }
  function o(l, p) {
    if (s === 0)
      return 0;
    if (r("color=16m") || r("color=full") || r("color=truecolor"))
      return 3;
    if (r("color=256"))
      return 2;
    if (l && !p && s === void 0)
      return 0;
    const f = s || 0;
    if (n.TERM === "dumb")
      return f;
    if (process.platform === "win32") {
      const u = e.release().split(".");
      return Number(u[0]) >= 10 && Number(u[2]) >= 10586 ? Number(u[2]) >= 14931 ? 3 : 2 : 1;
    }
    if ("CI" in n)
      return ["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((u) => u in n) || n.CI_NAME === "codeship" ? 1 : f;
    if ("TEAMCITY_VERSION" in n)
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(n.TEAMCITY_VERSION) ? 1 : 0;
    if (n.COLORTERM === "truecolor")
      return 3;
    if ("TERM_PROGRAM" in n) {
      const u = parseInt((n.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (n.TERM_PROGRAM) {
        case "iTerm.app":
          return u >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    return /-256(color)?$/i.test(n.TERM) ? 2 : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(n.TERM) || "COLORTERM" in n ? 1 : f;
  }
  function c(l) {
    const p = o(l, l && l.isTTY);
    return i(p);
  }
  return Qe = {
    supportsColor: c,
    stdout: i(o(!0, t.isatty(1))),
    stderr: i(o(!0, t.isatty(2)))
  }, Qe;
}
var er;
function wi() {
  return er || (er = 1, function(e, t) {
    const r = Ir, n = hi;
    t.init = f, t.log = c, t.formatArgs = i, t.save = l, t.load = p, t.useColors = s, t.destroy = n.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    ), t.colors = [6, 2, 3, 4, 5, 1];
    try {
      const a = ki();
      a && (a.stderr || a).level >= 2 && (t.colors = [
        20,
        21,
        26,
        27,
        32,
        33,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        56,
        57,
        62,
        63,
        68,
        69,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        92,
        93,
        98,
        99,
        112,
        113,
        128,
        129,
        134,
        135,
        148,
        149,
        160,
        161,
        162,
        163,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        171,
        172,
        173,
        178,
        179,
        184,
        185,
        196,
        197,
        198,
        199,
        200,
        201,
        202,
        203,
        204,
        205,
        206,
        207,
        208,
        209,
        214,
        215,
        220,
        221
      ]);
    } catch {
    }
    t.inspectOpts = Object.keys(process.env).filter((a) => /^debug_/i.test(a)).reduce((a, h) => {
      const b = h.substring(6).toLowerCase().replace(/_([a-z])/g, (C, S) => S.toUpperCase());
      let k = process.env[h];
      return /^(yes|on|true|enabled)$/i.test(k) ? k = !0 : /^(no|off|false|disabled)$/i.test(k) ? k = !1 : k === "null" ? k = null : k = Number(k), a[b] = k, a;
    }, {});
    function s() {
      return "colors" in t.inspectOpts ? !!t.inspectOpts.colors : r.isatty(process.stderr.fd);
    }
    function i(a) {
      const { namespace: h, useColors: b } = this;
      if (b) {
        const k = this.color, C = "\x1B[3" + (k < 8 ? k : "8;5;" + k), S = `  ${C};1m${h} \x1B[0m`;
        a[0] = S + a[0].split(`
`).join(`
` + S), a.push(C + "m+" + e.exports.humanize(this.diff) + "\x1B[0m");
      } else
        a[0] = o() + h + " " + a[0];
    }
    function o() {
      return t.inspectOpts.hideDate ? "" : (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function c(...a) {
      return process.stderr.write(n.formatWithOptions(t.inspectOpts, ...a) + `
`);
    }
    function l(a) {
      a ? process.env.DEBUG = a : delete process.env.DEBUG;
    }
    function p() {
      return process.env.DEBUG;
    }
    function f(a) {
      a.inspectOpts = {};
      const h = Object.keys(t.inspectOpts);
      for (let b = 0; b < h.length; b++)
        a.inspectOpts[h[b]] = t.inspectOpts[h[b]];
    }
    e.exports = Dr()(t);
    const { formatters: u } = e.exports;
    u.o = function(a) {
      return this.inspectOpts.colors = this.useColors, n.inspect(a, this.inspectOpts).split(`
`).map((h) => h.trim()).join(" ");
    }, u.O = function(a) {
      return this.inspectOpts.colors = this.useColors, n.inspect(a, this.inspectOpts);
    };
  }(we, we.exports)), we.exports;
}
typeof process > "u" || process.type === "renderer" || process.browser === !0 || process.__nwjs ? it.exports = _i() : it.exports = wi();
var Lr = it.exports;
const ot = /* @__PURE__ */ yi(Lr);
(function(e) {
  var t = Kt && Kt.__importDefault || function(c) {
    return c && c.__esModule ? c : { default: c };
  };
  Object.defineProperty(e, "__esModule", { value: !0 });
  const r = pi, s = t(Lr).default("@kwsites/file-exists");
  function i(c, l, p) {
    s("checking %s", c);
    try {
      const f = r.statSync(c);
      return f.isFile() && l ? (s("[OK] path represents a file"), !0) : f.isDirectory() && p ? (s("[OK] path represents a directory"), !0) : (s("[FAIL] path represents something other than a file or directory"), !1);
    } catch (f) {
      if (f.code === "ENOENT")
        return s("[FAIL] path is not accessible: %o", f), !1;
      throw s("[FATAL] %o", f), f;
    }
  }
  function o(c, l = e.READABLE) {
    return i(c, (l & e.FILE) > 0, (l & e.FOLDER) > 0);
  }
  e.exists = o, e.FILE = 1, e.FOLDER = 2, e.READABLE = e.FILE + e.FOLDER;
})(Mr);
(function(e) {
  function t(r) {
    for (var n in r) e.hasOwnProperty(n) || (e[n] = r[n]);
  }
  Object.defineProperty(e, "__esModule", { value: !0 }), t(Mr);
})(st);
var oe = {};
Object.defineProperty(oe, "__esModule", { value: !0 });
var jr = oe.createDeferred = ie = oe.deferred = void 0;
function wt() {
  let e, t, r = "pending";
  return {
    promise: new Promise((s, i) => {
      e = s, t = i;
    }),
    done(s) {
      r === "pending" && (r = "resolved", e(s));
    },
    fail(s) {
      r === "pending" && (r = "rejected", t(s));
    },
    get fulfilled() {
      return r !== "pending";
    },
    get status() {
      return r;
    }
  };
}
var ie = oe.deferred = wt;
jr = oe.createDeferred = wt;
oe.default = wt;
var Tt = Object.defineProperty, Ti = Object.getOwnPropertyDescriptor, Ct = Object.getOwnPropertyNames, Ci = Object.prototype.hasOwnProperty, m = (e, t) => function() {
  return e && (t = (0, e[Ct(e)[0]])(e = 0)), t;
}, Si = (e, t) => function() {
  return t || (0, e[Ct(e)[0]])((t = { exports: {} }).exports, t), t.exports;
}, x = (e, t) => {
  for (var r in t)
    Tt(e, r, { get: t[r], enumerable: !0 });
}, Ri = (e, t, r, n) => {
  if (t && typeof t == "object" || typeof t == "function")
    for (let s of Ct(t))
      !Ci.call(e, s) && s !== r && Tt(e, s, { get: () => t[s], enumerable: !(n = Ti(t, s)) || n.enumerable });
  return e;
}, E = (e) => Ri(Tt({}, "__esModule", { value: !0 }), e);
function Ei(...e) {
  const t = new String(e);
  return Pe.set(t, e), t;
}
function Oe(e) {
  return e instanceof String && Pe.has(e);
}
function tr(e) {
  return Pe.get(e) || [];
}
var Pe, de = m({
  "src/lib/args/pathspec.ts"() {
    Pe = /* @__PURE__ */ new WeakMap();
  }
}), Y, Z = m({
  "src/lib/errors/git-error.ts"() {
    Y = class extends Error {
      constructor(e, t) {
        super(t), this.task = e, Object.setPrototypeOf(this, new.target.prototype);
      }
    };
  }
}), me, ue = m({
  "src/lib/errors/git-response-error.ts"() {
    Z(), me = class extends Y {
      constructor(e, t) {
        super(void 0, t || String(e)), this.git = e;
      }
    };
  }
}), Br, Nr = m({
  "src/lib/errors/task-configuration-error.ts"() {
    Z(), Br = class extends Y {
      constructor(e) {
        super(void 0, e);
      }
    };
  }
});
function Gr(e) {
  return typeof e != "function" ? ne : e;
}
function Ur(e) {
  return typeof e == "function" && e !== ne;
}
function $r(e, t) {
  const r = e.indexOf(t);
  return r <= 0 ? [e, ""] : [e.substr(0, r), e.substr(r + 1)];
}
function qr(e, t = 0) {
  return zr(e) && e.length > t ? e[t] : void 0;
}
function re(e, t = 0) {
  if (zr(e) && e.length > t)
    return e[e.length - 1 - t];
}
function zr(e) {
  return Le(e);
}
function ge(e = "", t = !0, r = `
`) {
  return e.split(r).reduce((n, s) => {
    const i = t ? s.trim() : s;
    return i && n.push(i), n;
  }, []);
}
function St(e, t) {
  return ge(e, !0).map((r) => t(r));
}
function Rt(e) {
  return st.exists(e, st.FOLDER);
}
function w(e, t) {
  return Array.isArray(e) ? e.includes(t) || e.push(t) : e.add(t), t;
}
function Wr(e, t) {
  return Array.isArray(e) && !e.includes(t) && e.push(t), e;
}
function Ie(e, t) {
  if (Array.isArray(e)) {
    const r = e.indexOf(t);
    r >= 0 && e.splice(r, 1);
  } else
    e.delete(t);
  return t;
}
function H(e) {
  return Array.isArray(e) ? e : [e];
}
function Vr(e) {
  return e.replace(/[\s-]+(.)/g, (t, r) => r.toUpperCase());
}
function ce(e) {
  return H(e).map((t) => t instanceof String ? t : String(t));
}
function R(e, t = 0) {
  if (e == null)
    return t;
  const r = parseInt(e, 10);
  return Number.isNaN(r) ? t : r;
}
function pe(e, t) {
  const r = [];
  for (let n = 0, s = e.length; n < s; n++)
    r.push(t, e[n]);
  return r;
}
function he(e) {
  return (Array.isArray(e) ? fi.concat(e) : e).toString("utf-8");
}
function Hr(e, t) {
  const r = {};
  return t.forEach((n) => {
    e[n] !== void 0 && (r[n] = e[n]);
  }), r;
}
function at(e = 0) {
  return new Promise((t) => setTimeout(t, e));
}
function ut(e) {
  if (e !== !1)
    return e;
}
var ae, ne, ye, Me = m({
  "src/lib/utils/util.ts"() {
    Et(), ae = "\0", ne = () => {
    }, ye = Object.prototype.toString.call.bind(Object.prototype.toString);
  }
});
function U(e, t, r) {
  return t(e) ? e : arguments.length > 2 ? r : void 0;
}
function ct(e, t) {
  const r = Oe(e) ? "string" : typeof e;
  return /number|string|boolean/.test(r) && (!t || !t.includes(r));
}
function De(e) {
  return !!e && ye(e) === "[object Object]";
}
function Kr(e) {
  return typeof e == "function";
}
var ve, Qr, P, Fe, Le, Et = m({
  "src/lib/utils/argument-filters.ts"() {
    de(), Me(), ve = (e) => Array.isArray(e), Qr = (e) => typeof e == "number", P = (e) => typeof e == "string", Fe = (e) => P(e) || Array.isArray(e) && e.every(P), Le = (e) => e == null || "number|boolean|function".includes(typeof e) ? !1 : typeof e.length == "number";
  }
}), lt, Oi = m({
  "src/lib/utils/exit-codes.ts"() {
    lt = /* @__PURE__ */ ((e) => (e[e.SUCCESS = 0] = "SUCCESS", e[e.ERROR = 1] = "ERROR", e[e.NOT_FOUND = -2] = "NOT_FOUND", e[e.UNCLEAN = 128] = "UNCLEAN", e))(lt || {});
  }
}), xe, Fi = m({
  "src/lib/utils/git-output-streams.ts"() {
    xe = class Yr {
      constructor(t, r) {
        this.stdOut = t, this.stdErr = r;
      }
      asStrings() {
        return new Yr(this.stdOut.toString("utf8"), this.stdErr.toString("utf8"));
      }
    };
  }
});
function xi() {
  throw new Error("LineParser:useMatches not implemented");
}
var _, X, Ai = m({
  "src/lib/utils/line-parser.ts"() {
    _ = class {
      constructor(e, t) {
        this.matches = [], this.useMatches = xi, this.parse = (r, n) => (this.resetMatches(), this._regExp.every((s, i) => this.addMatch(s, i, r(i))) ? this.useMatches(n, this.prepareMatches()) !== !1 : !1), this._regExp = Array.isArray(e) ? e : [e], t && (this.useMatches = t);
      }
      resetMatches() {
        this.matches.length = 0;
      }
      prepareMatches() {
        return this.matches;
      }
      addMatch(e, t, r) {
        const n = r && e.exec(r);
        return n && this.pushMatch(t, n), !!n;
      }
      pushMatch(e, t) {
        this.matches.push(...t.slice(1));
      }
    }, X = class extends _ {
      addMatch(e, t, r) {
        return /^remote:\s/.test(String(r)) && super.addMatch(e, t, r);
      }
      pushMatch(e, t) {
        (e > 0 || t.length > 1) && super.pushMatch(e, t);
      }
    };
  }
});
function Jr(...e) {
  const t = process.cwd(), r = Object.assign(
    { baseDir: t, ...Xr },
    ...e.filter((n) => typeof n == "object" && n)
  );
  return r.baseDir = r.baseDir || t, r.trimmed = r.trimmed === !0, r;
}
var Xr, Pi = m({
  "src/lib/utils/simple-git-options.ts"() {
    Xr = {
      binary: "git",
      maxConcurrentProcesses: 5,
      config: [],
      trimmed: !1
    };
  }
});
function Ot(e, t = []) {
  return De(e) ? Object.keys(e).reduce((r, n) => {
    const s = e[n];
    if (Oe(s))
      r.push(s);
    else if (ct(s, ["boolean"]))
      r.push(n + "=" + s);
    else if (Array.isArray(s))
      for (const i of s)
        ct(i, ["string", "number"]) || r.push(n + "=" + i);
    else
      r.push(n);
    return r;
  }, t) : t;
}
function j(e, t = 0, r = !1) {
  const n = [];
  for (let s = 0, i = t < 0 ? e.length : t; s < i; s++)
    "string|number".includes(typeof e[s]) && n.push(String(e[s]));
  return Ot(Ft(e), n), r || n.push(...Ii(e)), n;
}
function Ii(e) {
  const t = typeof re(e) == "function";
  return ce(U(re(e, t ? 1 : 0), ve, []));
}
function Ft(e) {
  const t = Kr(re(e));
  return U(re(e, t ? 1 : 0), De);
}
function O(e, t = !0) {
  const r = Gr(re(e));
  return t || Ur(r) ? r : void 0;
}
var Mi = m({
  "src/lib/utils/task-options.ts"() {
    Et(), Me(), de();
  }
});
function ft(e, t) {
  return e(t.stdOut, t.stdErr);
}
function N(e, t, r, n = !0) {
  return H(r).forEach((s) => {
    for (let i = ge(s, n), o = 0, c = i.length; o < c; o++) {
      const l = (p = 0) => {
        if (!(o + p >= c))
          return i[o + p];
      };
      t.some(({ parse: p }) => p(l, e));
    }
  }), e;
}
var Di = m({
  "src/lib/utils/task-parser.ts"() {
    Me();
  }
}), Zr = {};
x(Zr, {
  ExitCodes: () => lt,
  GitOutputStreams: () => xe,
  LineParser: () => _,
  NOOP: () => ne,
  NULL: () => ae,
  RemoteLineParser: () => X,
  append: () => w,
  appendTaskOptions: () => Ot,
  asArray: () => H,
  asCamelCase: () => Vr,
  asFunction: () => Gr,
  asNumber: () => R,
  asStringArray: () => ce,
  bufferToString: () => he,
  callTaskParser: () => ft,
  createInstanceConfig: () => Jr,
  delay: () => at,
  filterArray: () => ve,
  filterFunction: () => Kr,
  filterHasLength: () => Le,
  filterNumber: () => Qr,
  filterPlainObject: () => De,
  filterPrimitives: () => ct,
  filterString: () => P,
  filterStringOrStringArray: () => Fe,
  filterType: () => U,
  first: () => qr,
  folderExists: () => Rt,
  forEachLineWithContent: () => St,
  getTrailingOptions: () => j,
  including: () => Wr,
  isUserFunction: () => Ur,
  last: () => re,
  objectToString: () => ye,
  orVoid: () => ut,
  parseStringResponse: () => N,
  pick: () => Hr,
  prefixedArray: () => pe,
  remove: () => Ie,
  splitOn: () => $r,
  toLinesWithContent: () => ge,
  trailingFunctionArgument: () => O,
  trailingOptionsArgument: () => Ft
});
var v = m({
  "src/lib/utils/index.ts"() {
    Et(), Oi(), Fi(), Ai(), Pi(), Mi(), Di(), Me();
  }
}), en = {};
x(en, {
  CheckRepoActions: () => pt,
  checkIsBareRepoTask: () => rn,
  checkIsRepoRootTask: () => tn,
  checkIsRepoTask: () => Li
});
function Li(e) {
  switch (e) {
    case "bare":
      return rn();
    case "root":
      return tn();
  }
  return {
    commands: ["rev-parse", "--is-inside-work-tree"],
    format: "utf-8",
    onError: je,
    parser: xt
  };
}
function tn() {
  return {
    commands: ["rev-parse", "--git-dir"],
    format: "utf-8",
    onError: je,
    parser(t) {
      return /^\.(git)?$/.test(t.trim());
    }
  };
}
function rn() {
  return {
    commands: ["rev-parse", "--is-bare-repository"],
    format: "utf-8",
    onError: je,
    parser: xt
  };
}
function ji(e) {
  return /(Not a git repository|Kein Git-Repository)/i.test(String(e));
}
var pt, je, xt, nn = m({
  "src/lib/tasks/check-is-repo.ts"() {
    v(), pt = /* @__PURE__ */ ((e) => (e.BARE = "bare", e.IN_TREE = "tree", e.IS_REPO_ROOT = "root", e))(pt || {}), je = ({ exitCode: e }, t, r, n) => {
      if (e === 128 && ji(t))
        return r(Buffer.from("false"));
      n(t);
    }, xt = (e) => e.trim() === "true";
  }
});
function Bi(e, t) {
  const r = new sn(e), n = e ? an : on;
  return ge(t).forEach((s) => {
    const i = s.replace(n, "");
    r.paths.push(i), (un.test(i) ? r.folders : r.files).push(i);
  }), r;
}
var sn, on, an, un, Ni = m({
  "src/lib/responses/CleanSummary.ts"() {
    v(), sn = class {
      constructor(e) {
        this.dryRun = e, this.paths = [], this.files = [], this.folders = [];
      }
    }, on = /^[a-z]+\s*/i, an = /^[a-z]+\s+[a-z]+\s*/i, un = /\/$/;
  }
}), ht = {};
x(ht, {
  EMPTY_COMMANDS: () => Be,
  adhocExecTask: () => cn,
  configurationErrorTask: () => B,
  isBufferTask: () => fn,
  isEmptyTask: () => pn,
  straightThroughBufferTask: () => ln,
  straightThroughStringTask: () => L
});
function cn(e) {
  return {
    commands: Be,
    format: "empty",
    parser: e
  };
}
function B(e) {
  return {
    commands: Be,
    format: "empty",
    parser() {
      throw typeof e == "string" ? new Br(e) : e;
    }
  };
}
function L(e, t = !1) {
  return {
    commands: e,
    format: "utf-8",
    parser(r) {
      return t ? String(r).trim() : r;
    }
  };
}
function ln(e) {
  return {
    commands: e,
    format: "buffer",
    parser(t) {
      return t;
    }
  };
}
function fn(e) {
  return e.format === "buffer";
}
function pn(e) {
  return e.format === "empty" || !e.commands.length;
}
var Be, F = m({
  "src/lib/tasks/task.ts"() {
    Nr(), Be = [];
  }
}), hn = {};
x(hn, {
  CONFIG_ERROR_INTERACTIVE_MODE: () => At,
  CONFIG_ERROR_MODE_REQUIRED: () => Pt,
  CONFIG_ERROR_UNKNOWN_OPTION: () => It,
  CleanOptions: () => Ce,
  cleanTask: () => dn,
  cleanWithOptionsTask: () => Gi,
  isCleanOptionsArray: () => Ui
});
function Gi(e, t) {
  const { cleanMode: r, options: n, valid: s } = $i(e);
  return r ? s.options ? (n.push(...t), n.some(Wi) ? B(At) : dn(r, n)) : B(It + JSON.stringify(e)) : B(Pt);
}
function dn(e, t) {
  return {
    commands: ["clean", `-${e}`, ...t],
    format: "utf-8",
    parser(n) {
      return Bi(e === "n", n);
    }
  };
}
function Ui(e) {
  return Array.isArray(e) && e.every((t) => Mt.has(t));
}
function $i(e) {
  let t, r = [], n = { cleanMode: !1, options: !0 };
  return e.replace(/[^a-z]i/g, "").split("").forEach((s) => {
    qi(s) ? (t = s, n.cleanMode = !0) : n.options = n.options && zi(r[r.length] = `-${s}`);
  }), {
    cleanMode: t,
    options: r,
    valid: n
  };
}
function qi(e) {
  return e === "f" || e === "n";
}
function zi(e) {
  return /^-[a-z]$/i.test(e) && Mt.has(e.charAt(1));
}
function Wi(e) {
  return /^-[^\-]/.test(e) ? e.indexOf("i") > 0 : e === "--interactive";
}
var At, Pt, It, Ce, Mt, mn = m({
  "src/lib/tasks/clean.ts"() {
    Ni(), v(), F(), At = "Git clean interactive mode is not supported", Pt = 'Git clean mode parameter ("n" or "f") is required', It = "Git clean unknown option found in: ", Ce = /* @__PURE__ */ ((e) => (e.DRY_RUN = "n", e.FORCE = "f", e.IGNORED_INCLUDED = "x", e.IGNORED_ONLY = "X", e.EXCLUDING = "e", e.QUIET = "q", e.RECURSIVE = "d", e))(Ce || {}), Mt = /* @__PURE__ */ new Set([
      "i",
      ...ce(Object.values(Ce))
    ]);
  }
});
function Vi(e) {
  const t = new yn();
  for (const r of gn(e))
    t.addValue(r.file, String(r.key), r.value);
  return t;
}
function Hi(e, t) {
  let r = null;
  const n = [], s = /* @__PURE__ */ new Map();
  for (const i of gn(e, t))
    i.key === t && (n.push(r = i.value), s.has(i.file) || s.set(i.file, []), s.get(i.file).push(r));
  return {
    key: t,
    paths: Array.from(s.keys()),
    scopes: s,
    value: r,
    values: n
  };
}
function Ki(e) {
  return e.replace(/^(file):/, "");
}
function* gn(e, t = null) {
  const r = e.split("\0");
  for (let n = 0, s = r.length - 1; n < s; ) {
    const i = Ki(r[n++]);
    let o = r[n++], c = t;
    if (o.includes(`
`)) {
      const l = $r(o, `
`);
      c = l[0], o = l[1];
    }
    yield { file: i, key: c, value: o };
  }
}
var yn, Qi = m({
  "src/lib/responses/ConfigList.ts"() {
    v(), yn = class {
      constructor() {
        this.files = [], this.values = /* @__PURE__ */ Object.create(null);
      }
      get all() {
        return this._all || (this._all = this.files.reduce((e, t) => Object.assign(e, this.values[t]), {})), this._all;
      }
      addFile(e) {
        if (!(e in this.values)) {
          const t = re(this.files);
          this.values[e] = t ? Object.create(this.values[t]) : {}, this.files.push(e);
        }
        return this.values[e];
      }
      addValue(e, t, r) {
        const n = this.addFile(e);
        Object.hasOwn(n, t) ? Array.isArray(n[t]) ? n[t].push(r) : n[t] = [n[t], r] : n[t] = r, this._all = void 0;
      }
    };
  }
});
function Ye(e, t) {
  return typeof e == "string" && Object.hasOwn(dt, e) ? e : t;
}
function Yi(e, t, r, n) {
  const s = ["config", `--${n}`];
  return r && s.push("--add"), s.push(e, t), {
    commands: s,
    format: "utf-8",
    parser(i) {
      return i;
    }
  };
}
function Ji(e, t) {
  const r = ["config", "--null", "--show-origin", "--get-all", e];
  return t && r.splice(1, 0, `--${t}`), {
    commands: r,
    format: "utf-8",
    parser(n) {
      return Hi(n, e);
    }
  };
}
function Xi(e) {
  const t = ["config", "--list", "--show-origin", "--null"];
  return e && t.push(`--${e}`), {
    commands: t,
    format: "utf-8",
    parser(r) {
      return Vi(r);
    }
  };
}
function Zi() {
  return {
    addConfig(e, t, ...r) {
      return this._runTask(
        Yi(
          e,
          t,
          r[0] === !0,
          Ye(
            r[1],
            "local"
            /* local */
          )
        ),
        O(arguments)
      );
    },
    getConfig(e, t) {
      return this._runTask(
        Ji(e, Ye(t, void 0)),
        O(arguments)
      );
    },
    listConfig(...e) {
      return this._runTask(
        Xi(Ye(e[0], void 0)),
        O(arguments)
      );
    }
  };
}
var dt, vn = m({
  "src/lib/tasks/config.ts"() {
    Qi(), v(), dt = /* @__PURE__ */ ((e) => (e.system = "system", e.global = "global", e.local = "local", e.worktree = "worktree", e))(dt || {});
  }
});
function eo(e) {
  return _n.has(e);
}
var Je, _n, bn = m({
  "src/lib/tasks/diff-name-status.ts"() {
    Je = /* @__PURE__ */ ((e) => (e.ADDED = "A", e.COPIED = "C", e.DELETED = "D", e.MODIFIED = "M", e.RENAMED = "R", e.CHANGED = "T", e.UNMERGED = "U", e.UNKNOWN = "X", e.BROKEN = "B", e))(Je || {}), _n = new Set(Object.values(Je));
  }
});
function to(...e) {
  return new wn().param(...e);
}
function ro(e) {
  const t = /* @__PURE__ */ new Set(), r = {};
  return St(e, (n) => {
    const [s, i, o] = n.split(ae);
    t.add(s), (r[s] = r[s] || []).push({
      line: R(i),
      path: s,
      preview: o
    });
  }), {
    paths: t,
    results: r
  };
}
function no() {
  return {
    grep(e) {
      const t = O(arguments), r = j(arguments);
      for (const s of kn)
        if (r.includes(s))
          return this._runTask(
            B(`git.grep: use of "${s}" is not supported.`),
            t
          );
      typeof e == "string" && (e = to().param(e));
      const n = ["grep", "--null", "-n", "--full-name", ...r, ...e];
      return this._runTask(
        {
          commands: n,
          format: "utf-8",
          parser(s) {
            return ro(s);
          }
        },
        t
      );
    }
  };
}
var kn, fe, rr, wn, Tn = m({
  "src/lib/tasks/grep.ts"() {
    v(), F(), kn = ["-h"], fe = Symbol("grepQuery"), wn = class {
      constructor() {
        this[rr] = [];
      }
      *[(rr = fe, Symbol.iterator)]() {
        for (const e of this[fe])
          yield e;
      }
      and(...e) {
        return e.length && this[fe].push("--and", "(", ...pe(e, "-e"), ")"), this;
      }
      param(...e) {
        return this[fe].push(...pe(e, "-e")), this;
      }
    };
  }
}), Cn = {};
x(Cn, {
  ResetMode: () => Se,
  getResetMode: () => io,
  resetTask: () => so
});
function so(e, t) {
  const r = ["reset"];
  return Sn(e) && r.push(`--${e}`), r.push(...t), L(r);
}
function io(e) {
  if (Sn(e))
    return e;
  switch (typeof e) {
    case "string":
    case "undefined":
      return "soft";
  }
}
function Sn(e) {
  return typeof e == "string" && Rn.includes(e);
}
var Se, Rn, En = m({
  "src/lib/tasks/reset.ts"() {
    v(), F(), Se = /* @__PURE__ */ ((e) => (e.MIXED = "mixed", e.SOFT = "soft", e.HARD = "hard", e.MERGE = "merge", e.KEEP = "keep", e))(Se || {}), Rn = ce(Object.values(Se));
  }
});
function oo() {
  return ot("simple-git");
}
function nr(e, t, r) {
  return !t || !String(t).replace(/\s*/, "") ? r ? (n, ...s) => {
    e(n, ...s), r(n, ...s);
  } : e : (n, ...s) => {
    e(`%s ${n}`, t, ...s), r && r(n, ...s);
  };
}
function ao(e, t, { namespace: r }) {
  if (typeof e == "string")
    return e;
  const n = t && t.namespace || "";
  return n.startsWith(r) ? n.substr(r.length + 1) : n || r;
}
function Dt(e, t, r, n = oo()) {
  const s = e && `[${e}]` || "", i = [], o = typeof t == "string" ? n.extend(t) : t, c = ao(U(t, P), o, n);
  return p(r);
  function l(f, u) {
    return w(
      i,
      Dt(e, c.replace(/^[^:]+/, f), u, n)
    );
  }
  function p(f) {
    const u = f && `[${f}]` || "", a = o && nr(o, u) || ne, h = nr(n, `${s} ${u}`, a);
    return Object.assign(o ? a : h, {
      label: e,
      sibling: l,
      info: h,
      step: p
    });
  }
}
var On = m({
  "src/lib/git-logger.ts"() {
    v(), ot.formatters.L = (e) => String(Le(e) ? e.length : "-"), ot.formatters.B = (e) => Buffer.isBuffer(e) ? e.toString("utf8") : ye(e);
  }
}), Fn, uo = m({
  "src/lib/runners/tasks-pending-queue.ts"() {
    var e;
    Z(), On(), Fn = (e = class {
      constructor(r = "GitExecutor") {
        this.logLabel = r, this._queue = /* @__PURE__ */ new Map();
      }
      withProgress(r) {
        return this._queue.get(r);
      }
      createProgress(r) {
        const n = e.getName(r.commands[0]), s = Dt(this.logLabel, n);
        return {
          task: r,
          logger: s,
          name: n
        };
      }
      push(r) {
        const n = this.createProgress(r);
        return n.logger("Adding task to the queue, commands = %o", r.commands), this._queue.set(r, n), n;
      }
      fatal(r) {
        for (const [n, { logger: s }] of Array.from(this._queue.entries()))
          n === r.task ? (s.info("Failed %o", r), s(
            "Fatal exception, any as-yet un-started tasks run through this executor will not be attempted"
          )) : s.info(
            "A fatal exception occurred in a previous task, the queue has been purged: %o",
            r.message
          ), this.complete(n);
        if (this._queue.size !== 0)
          throw new Error(`Queue size should be zero after fatal: ${this._queue.size}`);
      }
      complete(r) {
        this.withProgress(r) && this._queue.delete(r);
      }
      attempt(r) {
        const n = this.withProgress(r);
        if (!n)
          throw new Y(void 0, "TasksPendingQueue: attempt called for an unknown task");
        return n.logger("Starting task"), n;
      }
      static getName(r = "empty") {
        return `task:${r}:${++e.counter}`;
      }
    }, e.counter = 0, e);
  }
});
function ee(e, t) {
  return {
    method: qr(e.commands) || "",
    commands: t
  };
}
function co(e, t) {
  return (r) => {
    t("[ERROR] child process exception %o", r), e.push(Buffer.from(String(r.stack), "ascii"));
  };
}
function sr(e, t, r, n) {
  return (s) => {
    r("%s received %L bytes", t, s), n("%B", s), e.push(s);
  };
}
var mt, lo = m({
  "src/lib/runners/git-executor-chain.ts"() {
    Z(), F(), v(), uo(), mt = class {
      constructor(e, t, r) {
        this._executor = e, this._scheduler = t, this._plugins = r, this._chain = Promise.resolve(), this._queue = new Fn();
      }
      get cwd() {
        return this._cwd || this._executor.cwd;
      }
      set cwd(e) {
        this._cwd = e;
      }
      get env() {
        return this._executor.env;
      }
      get outputHandler() {
        return this._executor.outputHandler;
      }
      chain() {
        return this;
      }
      push(e) {
        return this._queue.push(e), this._chain = this._chain.then(() => this.attemptTask(e));
      }
      async attemptTask(e) {
        const t = await this._scheduler.next(), r = () => this._queue.complete(e);
        try {
          const { logger: n } = this._queue.attempt(e);
          return await (pn(e) ? this.attemptEmptyTask(e, n) : this.attemptRemoteTask(e, n));
        } catch (n) {
          throw this.onFatalException(e, n);
        } finally {
          r(), t();
        }
      }
      onFatalException(e, t) {
        const r = t instanceof Y ? Object.assign(t, { task: e }) : new Y(e, t && String(t));
        return this._chain = Promise.resolve(), this._queue.fatal(r), r;
      }
      async attemptRemoteTask(e, t) {
        const r = this._plugins.exec("spawn.binary", "", ee(e, e.commands)), n = this._plugins.exec(
          "spawn.args",
          [...e.commands],
          ee(e, e.commands)
        ), s = await this.gitResponse(
          e,
          r,
          n,
          this.outputHandler,
          t.step("SPAWN")
        ), i = await this.handleTaskData(e, n, s, t.step("HANDLE"));
        return t("passing response to task's parser as a %s", e.format), fn(e) ? ft(e.parser, i) : ft(e.parser, i.asStrings());
      }
      async attemptEmptyTask(e, t) {
        return t("empty task bypassing child process to call to task's parser"), e.parser(this);
      }
      handleTaskData(e, t, r, n) {
        const { exitCode: s, rejection: i, stdOut: o, stdErr: c } = r;
        return new Promise((l, p) => {
          n("Preparing to handle process response exitCode=%d stdOut=", s);
          const { error: f } = this._plugins.exec(
            "task.error",
            { error: i },
            {
              ...ee(e, t),
              ...r
            }
          );
          if (f && e.onError)
            return n.info("exitCode=%s handling with custom error handler"), e.onError(
              r,
              f,
              (u) => {
                n.info("custom error handler treated as success"), n("custom error returned a %s", ye(u)), l(
                  new xe(
                    Array.isArray(u) ? Buffer.concat(u) : u,
                    Buffer.concat(c)
                  )
                );
              },
              p
            );
          if (f)
            return n.info(
              "handling as error: exitCode=%s stdErr=%s rejection=%o",
              s,
              c.length,
              i
            ), p(f);
          n.info("retrieving task output complete"), l(new xe(Buffer.concat(o), Buffer.concat(c)));
        });
      }
      async gitResponse(e, t, r, n, s) {
        const i = s.sibling("output"), o = this._plugins.exec(
          "spawn.options",
          {
            cwd: this.cwd,
            env: this.env,
            windowsHide: !0
          },
          ee(e, e.commands)
        );
        return new Promise((c) => {
          const l = [], p = [];
          s.info("%s %o", t, r), s("%O", o);
          let f = this._beforeSpawn(e, r);
          if (f)
            return c({
              stdOut: l,
              stdErr: p,
              exitCode: 9901,
              rejection: f
            });
          this._plugins.exec("spawn.before", void 0, {
            ...ee(e, r),
            kill(a) {
              f = a || f;
            }
          });
          const u = mi(t, r, o);
          u.stdout.on(
            "data",
            sr(l, "stdOut", s, i.step("stdOut"))
          ), u.stderr.on(
            "data",
            sr(p, "stdErr", s, i.step("stdErr"))
          ), u.on("error", co(p, s)), n && (s("Passing child process stdOut/stdErr to custom outputHandler"), n(t, u.stdout, u.stderr, [...r])), this._plugins.exec("spawn.after", void 0, {
            ...ee(e, r),
            spawned: u,
            close(a, h) {
              c({
                stdOut: l,
                stdErr: p,
                exitCode: a,
                rejection: f || h
              });
            },
            kill(a) {
              u.killed || (f = a, u.kill("SIGINT"));
            }
          });
        });
      }
      _beforeSpawn(e, t) {
        let r;
        return this._plugins.exec("spawn.before", void 0, {
          ...ee(e, t),
          kill(n) {
            r = n || r;
          }
        }), r;
      }
    };
  }
}), xn = {};
x(xn, {
  GitExecutor: () => An
});
var An, fo = m({
  "src/lib/runners/git-executor.ts"() {
    lo(), An = class {
      constructor(e, t, r) {
        this.cwd = e, this._scheduler = t, this._plugins = r, this._chain = new mt(this, this._scheduler, this._plugins);
      }
      chain() {
        return new mt(this, this._scheduler, this._plugins);
      }
      push(e) {
        return this._chain.push(e);
      }
    };
  }
});
function po(e, t, r = ne) {
  const n = (i) => {
    r(null, i);
  }, s = (i) => {
    (i == null ? void 0 : i.task) === e && r(
      i instanceof me ? ho(i) : i,
      void 0
    );
  };
  t.then(n, s);
}
function ho(e) {
  let t = (n) => {
    console.warn(
      `simple-git deprecation notice: accessing GitResponseError.${n} should be GitResponseError.git.${n}, this will no longer be available in version 3`
    ), t = ne;
  };
  return Object.create(e, Object.getOwnPropertyNames(e.git).reduce(r, {}));
  function r(n, s) {
    return s in e || (n[s] = {
      enumerable: !1,
      configurable: !1,
      get() {
        return t(s), e.git[s];
      }
    }), n;
  }
}
var mo = m({
  "src/lib/task-callback.ts"() {
    ue(), v();
  }
});
function ir(e, t) {
  return cn((r) => {
    if (!Rt(e))
      throw new Error(`Git.cwd: cannot change to non-directory "${e}"`);
    return (t || r).cwd = e;
  });
}
var go = m({
  "src/lib/tasks/change-working-directory.ts"() {
    v(), F();
  }
});
function Xe(e) {
  const t = ["checkout", ...e];
  return t[1] === "-b" && t.includes("-B") && (t[1] = Ie(t, "-B")), L(t);
}
function yo() {
  return {
    checkout() {
      return this._runTask(
        Xe(j(arguments, 1)),
        O(arguments)
      );
    },
    checkoutBranch(e, t) {
      return this._runTask(
        Xe(["-b", e, t, ...j(arguments)]),
        O(arguments)
      );
    },
    checkoutLocalBranch(e) {
      return this._runTask(
        Xe(["-b", e, ...j(arguments)]),
        O(arguments)
      );
    }
  };
}
var vo = m({
  "src/lib/tasks/checkout.ts"() {
    v(), F();
  }
});
function _o() {
  return {
    count: 0,
    garbage: 0,
    inPack: 0,
    packs: 0,
    prunePackable: 0,
    size: 0,
    sizeGarbage: 0,
    sizePack: 0
  };
}
function bo() {
  return {
    countObjects() {
      return this._runTask({
        commands: ["count-objects", "--verbose"],
        format: "utf-8",
        parser(e) {
          return N(_o(), [Pn], e);
        }
      });
    }
  };
}
var Pn, ko = m({
  "src/lib/tasks/count-objects.ts"() {
    v(), Pn = new _(
      /([a-z-]+): (\d+)$/,
      (e, [t, r]) => {
        const n = Vr(t);
        Object.hasOwn(e, n) && (e[n] = R(r));
      }
    );
  }
});
function wo(e) {
  return N({
    author: null,
    branch: "",
    commit: "",
    root: !1,
    summary: {
      changes: 0,
      insertions: 0,
      deletions: 0
    }
  }, In, e);
}
var In, To = m({
  "src/lib/parsers/parse-commit.ts"() {
    v(), In = [
      new _(/^\[([^\s]+)( \([^)]+\))? ([^\]]+)/, (e, [t, r, n]) => {
        e.branch = t, e.commit = n, e.root = !!r;
      }),
      new _(/\s*Author:\s(.+)/i, (e, [t]) => {
        const r = t.split("<"), n = r.pop();
        !n || !n.includes("@") || (e.author = {
          email: n.substr(0, n.length - 1),
          name: r.join("<").trim()
        });
      }),
      new _(
        /(\d+)[^,]*(?:,\s*(\d+)[^,]*)(?:,\s*(\d+))/g,
        (e, [t, r, n]) => {
          e.summary.changes = parseInt(t, 10) || 0, e.summary.insertions = parseInt(r, 10) || 0, e.summary.deletions = parseInt(n, 10) || 0;
        }
      ),
      new _(
        /^(\d+)[^,]*(?:,\s*(\d+)[^(]+\(([+-]))?/,
        (e, [t, r, n]) => {
          e.summary.changes = parseInt(t, 10) || 0;
          const s = parseInt(r, 10) || 0;
          n === "-" ? e.summary.deletions = s : n === "+" && (e.summary.insertions = s);
        }
      )
    ];
  }
});
function Co(e, t, r) {
  return {
    commands: [
      "-c",
      "core.abbrev=40",
      "commit",
      ...pe(e, "-m"),
      ...t,
      ...r
    ],
    format: "utf-8",
    parser: wo
  };
}
function So() {
  return {
    commit(t, ...r) {
      const n = O(arguments), s = e(t) || Co(
        H(t),
        H(U(r[0], Fe, [])),
        [
          ...ce(U(r[1], ve, [])),
          ...j(arguments, 0, !0)
        ]
      );
      return this._runTask(s, n);
    }
  };
  function e(t) {
    return !Fe(t) && B(
      "git.commit: requires the commit message to be supplied as a string/string[]"
    );
  }
}
var Ro = m({
  "src/lib/tasks/commit.ts"() {
    To(), v(), F();
  }
});
function Eo() {
  return {
    firstCommit() {
      return this._runTask(
        L(["rev-list", "--max-parents=0", "HEAD"], !0),
        O(arguments)
      );
    }
  };
}
var Oo = m({
  "src/lib/tasks/first-commit.ts"() {
    v(), F();
  }
});
function Fo(e, t) {
  const r = ["hash-object", e];
  return t && r.push("-w"), L(r, !0);
}
var xo = m({
  "src/lib/tasks/hash-object.ts"() {
    F();
  }
});
function Ao(e, t, r) {
  const n = String(r).trim();
  let s;
  if (s = Mn.exec(n))
    return new Re(e, t, !1, s[1]);
  if (s = Dn.exec(n))
    return new Re(e, t, !0, s[1]);
  let i = "";
  const o = n.split(" ");
  for (; o.length; )
    if (o.shift() === "in") {
      i = o.join(" ");
      break;
    }
  return new Re(e, t, /^re/i.test(n), i);
}
var Re, Mn, Dn, Po = m({
  "src/lib/responses/InitSummary.ts"() {
    Re = class {
      constructor(e, t, r, n) {
        this.bare = e, this.path = t, this.existing = r, this.gitDir = n;
      }
    }, Mn = /^Init.+ repository in (.+)$/, Dn = /^Rein.+ in (.+)$/;
  }
});
function Io(e) {
  return e.includes(Lt);
}
function Mo(e = !1, t, r) {
  const n = ["init", ...r];
  return e && !Io(n) && n.splice(1, 0, Lt), {
    commands: n,
    format: "utf-8",
    parser(s) {
      return Ao(n.includes("--bare"), t, s);
    }
  };
}
var Lt, Do = m({
  "src/lib/tasks/init.ts"() {
    Po(), Lt = "--bare";
  }
});
function jt(e) {
  for (let t = 0; t < e.length; t++) {
    const r = Bt.exec(e[t]);
    if (r)
      return `--${r[1]}`;
  }
  return "";
}
function Lo(e) {
  return Bt.test(e);
}
var Bt, _e = m({
  "src/lib/args/log-format.ts"() {
    Bt = /^--(stat|numstat|name-only|name-status)(=|$)/;
  }
}), Ln, jo = m({
  "src/lib/responses/DiffSummary.ts"() {
    Ln = class {
      constructor() {
        this.changed = 0, this.deletions = 0, this.insertions = 0, this.files = [];
      }
    };
  }
});
function jn(e = "") {
  const t = Bn[e];
  return (r) => N(new Ln(), t, r, !1);
}
var Ze, or, ar, ur, Bn, Nn = m({
  "src/lib/parsers/parse-diff-summary.ts"() {
    _e(), jo(), bn(), v(), Ze = [
      new _(
        /^(.+)\s+\|\s+(\d+)(\s+[+\-]+)?$/,
        (e, [t, r, n = ""]) => {
          e.files.push({
            file: t.trim(),
            changes: R(r),
            insertions: n.replace(/[^+]/g, "").length,
            deletions: n.replace(/[^-]/g, "").length,
            binary: !1
          });
        }
      ),
      new _(
        /^(.+) \|\s+Bin ([0-9.]+) -> ([0-9.]+) ([a-z]+)/,
        (e, [t, r, n]) => {
          e.files.push({
            file: t.trim(),
            before: R(r),
            after: R(n),
            binary: !0
          });
        }
      ),
      new _(
        /(\d+) files? changed\s*((?:, \d+ [^,]+){0,2})/,
        (e, [t, r]) => {
          const n = /(\d+) i/.exec(r), s = /(\d+) d/.exec(r);
          e.changed = R(t), e.insertions = R(n == null ? void 0 : n[1]), e.deletions = R(s == null ? void 0 : s[1]);
        }
      )
    ], or = [
      new _(
        /(\d+)\t(\d+)\t(.+)$/,
        (e, [t, r, n]) => {
          const s = R(t), i = R(r);
          e.changed++, e.insertions += s, e.deletions += i, e.files.push({
            file: n,
            changes: s + i,
            insertions: s,
            deletions: i,
            binary: !1
          });
        }
      ),
      new _(/-\t-\t(.+)$/, (e, [t]) => {
        e.changed++, e.files.push({
          file: t,
          after: 0,
          before: 0,
          binary: !0
        });
      })
    ], ar = [
      new _(/(.+)$/, (e, [t]) => {
        e.changed++, e.files.push({
          file: t,
          changes: 0,
          insertions: 0,
          deletions: 0,
          binary: !1
        });
      })
    ], ur = [
      new _(
        /([ACDMRTUXB])([0-9]{0,3})\t(.[^\t]*)(\t(.[^\t]*))?$/,
        (e, [t, r, n, s, i]) => {
          e.changed++, e.files.push({
            file: i ?? n,
            changes: 0,
            insertions: 0,
            deletions: 0,
            binary: !1,
            status: ut(eo(t) && t),
            from: ut(!!i && n !== i && n),
            similarity: R(r)
          });
        }
      )
    ], Bn = {
      "": Ze,
      "--stat": Ze,
      "--numstat": or,
      "--name-status": ur,
      "--name-only": ar
    };
  }
});
function Bo(e, t) {
  return t.reduce(
    (r, n, s) => (r[n] = e[s] || "", r),
    /* @__PURE__ */ Object.create({ diff: null })
  );
}
function Gn(e = Ut, t = Un, r = "") {
  const n = jn(r);
  return function(s) {
    const i = ge(
      s.trim(),
      !1,
      Nt
    ).map(function(o) {
      const c = o.split(Gt), l = Bo(c[0].split(e), t);
      return c.length > 1 && c[1].trim() && (l.diff = n(c[1])), l;
    });
    return {
      all: i,
      latest: i.length && i[0] || null,
      total: i.length
    };
  };
}
var Nt, Gt, Ut, Un, $n = m({
  "src/lib/parsers/parse-list-log-summary.ts"() {
    v(), Nn(), _e(), Nt = "òòòòòò ", Gt = " òò", Ut = " ò ", Un = ["hash", "date", "message", "refs", "author_name", "author_email"];
  }
}), qn = {};
x(qn, {
  diffSummaryTask: () => No,
  validateLogFormatConfig: () => Ne
});
function No(e) {
  let t = jt(e);
  const r = ["diff"];
  return t === "" && (t = "--stat", r.push("--stat=4096")), r.push(...e), Ne(r) || {
    commands: r,
    format: "utf-8",
    parser: jn(t)
  };
}
function Ne(e) {
  const t = e.filter(Lo);
  if (t.length > 1)
    return B(
      `Summary flags are mutually exclusive - pick one of ${t.join(",")}`
    );
  if (t.length && e.includes("-z"))
    return B(
      `Summary flag ${t} parsing is not compatible with null termination option '-z'`
    );
}
var $t = m({
  "src/lib/tasks/diff.ts"() {
    _e(), Nn(), F();
  }
});
function Go(e, t) {
  const r = [], n = [];
  return Object.keys(e).forEach((s) => {
    r.push(s), n.push(String(e[s]));
  }), [r, n.join(t)];
}
function Uo(e) {
  return Object.keys(e).reduce((t, r) => (r in gt || (t[r] = e[r]), t), {});
}
function zn(e = {}, t = []) {
  const r = U(e.splitter, P, Ut), n = De(e.format) ? e.format : {
    hash: "%H",
    date: e.strictDate === !1 ? "%ai" : "%aI",
    message: "%s",
    refs: "%D",
    body: e.multiLine ? "%B" : "%b",
    author_name: e.mailMap !== !1 ? "%aN" : "%an",
    author_email: e.mailMap !== !1 ? "%aE" : "%ae"
  }, [s, i] = Go(n, r), o = [], c = [
    `--pretty=format:${Nt}${i}${Gt}`,
    ...t
  ], l = e.n || e["max-count"] || e.maxCount;
  if (l && c.push(`--max-count=${l}`), e.from || e.to) {
    const p = e.symmetric !== !1 ? "..." : "..";
    o.push(`${e.from || ""}${p}${e.to || ""}`);
  }
  return P(e.file) && c.push("--follow", Ei(e.file)), Ot(Uo(e), c), {
    fields: s,
    splitter: r,
    commands: [...c, ...o]
  };
}
function $o(e, t, r) {
  const n = Gn(e, t, jt(r));
  return {
    commands: ["log", ...r],
    format: "utf-8",
    parser: n
  };
}
function qo() {
  return {
    log(...r) {
      const n = O(arguments), s = zn(
        Ft(arguments),
        ce(U(arguments[0], ve, []))
      ), i = t(...r) || Ne(s.commands) || e(s);
      return this._runTask(i, n);
    }
  };
  function e(r) {
    return $o(r.splitter, r.fields, r.commands);
  }
  function t(r, n) {
    return P(r) && P(n) && B(
      "git.log(string, string) should be replaced with git.log({ from: string, to: string })"
    );
  }
}
var gt, Wn = m({
  "src/lib/tasks/log.ts"() {
    _e(), de(), $n(), v(), F(), $t(), gt = /* @__PURE__ */ ((e) => (e[e["--pretty"] = 0] = "--pretty", e[e["max-count"] = 1] = "max-count", e[e.maxCount = 2] = "maxCount", e[e.n = 3] = "n", e[e.file = 4] = "file", e[e.format = 5] = "format", e[e.from = 6] = "from", e[e.to = 7] = "to", e[e.splitter = 8] = "splitter", e[e.symmetric = 9] = "symmetric", e[e.mailMap = 10] = "mailMap", e[e.multiLine = 11] = "multiLine", e[e.strictDate = 12] = "strictDate", e))(gt || {});
  }
}), Ee, Vn, zo = m({
  "src/lib/responses/MergeSummary.ts"() {
    Ee = class {
      constructor(e, t = null, r) {
        this.reason = e, this.file = t, this.meta = r;
      }
      toString() {
        return `${this.file}:${this.reason}`;
      }
    }, Vn = class {
      constructor() {
        this.conflicts = [], this.merges = [], this.result = "success";
      }
      get failed() {
        return this.conflicts.length > 0;
      }
      get reason() {
        return this.result;
      }
      toString() {
        return this.conflicts.length ? `CONFLICTS: ${this.conflicts.join(", ")}` : "OK";
      }
    };
  }
}), yt, Hn, Wo = m({
  "src/lib/responses/PullSummary.ts"() {
    yt = class {
      constructor() {
        this.remoteMessages = {
          all: []
        }, this.created = [], this.deleted = [], this.files = [], this.deletions = {}, this.insertions = {}, this.summary = {
          changes: 0,
          deletions: 0,
          insertions: 0
        };
      }
    }, Hn = class {
      constructor() {
        this.remote = "", this.hash = {
          local: "",
          remote: ""
        }, this.branch = {
          local: "",
          remote: ""
        }, this.message = "";
      }
      toString() {
        return this.message;
      }
    };
  }
});
function et(e) {
  return e.objects = e.objects || {
    compressing: 0,
    counting: 0,
    enumerating: 0,
    packReused: 0,
    reused: { count: 0, delta: 0 },
    total: { count: 0, delta: 0 }
  };
}
function cr(e) {
  const t = /^\s*(\d+)/.exec(e), r = /delta (\d+)/i.exec(e);
  return {
    count: R(t && t[1] || "0"),
    delta: R(r && r[1] || "0")
  };
}
var Kn, Vo = m({
  "src/lib/parsers/parse-remote-objects.ts"() {
    v(), Kn = [
      new X(
        /^remote:\s*(enumerating|counting|compressing) objects: (\d+),/i,
        (e, [t, r]) => {
          const n = t.toLowerCase(), s = et(e.remoteMessages);
          Object.assign(s, { [n]: R(r) });
        }
      ),
      new X(
        /^remote:\s*(enumerating|counting|compressing) objects: \d+% \(\d+\/(\d+)\),/i,
        (e, [t, r]) => {
          const n = t.toLowerCase(), s = et(e.remoteMessages);
          Object.assign(s, { [n]: R(r) });
        }
      ),
      new X(
        /total ([^,]+), reused ([^,]+), pack-reused (\d+)/i,
        (e, [t, r, n]) => {
          const s = et(e.remoteMessages);
          s.total = cr(t), s.reused = cr(r), s.packReused = R(n);
        }
      )
    ];
  }
});
function Qn(e, t) {
  return N({ remoteMessages: new Jn() }, Yn, t);
}
var Yn, Jn, Xn = m({
  "src/lib/parsers/parse-remote-messages.ts"() {
    v(), Vo(), Yn = [
      new X(/^remote:\s*(.+)$/, (e, [t]) => (e.remoteMessages.all.push(t.trim()), !1)),
      ...Kn,
      new X(
        [/create a (?:pull|merge) request/i, /\s(https?:\/\/\S+)$/],
        (e, [t]) => {
          e.remoteMessages.pullRequestUrl = t;
        }
      ),
      new X(
        [/found (\d+) vulnerabilities.+\(([^)]+)\)/i, /\s(https?:\/\/\S+)$/],
        (e, [t, r, n]) => {
          e.remoteMessages.vulnerabilities = {
            count: R(t),
            summary: r,
            url: n
          };
        }
      )
    ], Jn = class {
      constructor() {
        this.all = [];
      }
    };
  }
});
function Ho(e, t) {
  const r = N(new Hn(), Zn, [e, t]);
  return r.message && r;
}
var lr, fr, pr, hr, Zn, dr, qt, es = m({
  "src/lib/parsers/parse-pull.ts"() {
    Wo(), v(), Xn(), lr = /^\s*(.+?)\s+\|\s+\d+\s*(\+*)(-*)/, fr = /(\d+)\D+((\d+)\D+\(\+\))?(\D+(\d+)\D+\(-\))?/, pr = /^(create|delete) mode \d+ (.+)/, hr = [
      new _(lr, (e, [t, r, n]) => {
        e.files.push(t), r && (e.insertions[t] = r.length), n && (e.deletions[t] = n.length);
      }),
      new _(fr, (e, [t, , r, , n]) => r !== void 0 || n !== void 0 ? (e.summary.changes = +t || 0, e.summary.insertions = +r || 0, e.summary.deletions = +n || 0, !0) : !1),
      new _(pr, (e, [t, r]) => {
        w(e.files, r), w(t === "create" ? e.created : e.deleted, r);
      })
    ], Zn = [
      new _(/^from\s(.+)$/i, (e, [t]) => void (e.remote = t)),
      new _(/^fatal:\s(.+)$/, (e, [t]) => void (e.message = t)),
      new _(
        /([a-z0-9]+)\.\.([a-z0-9]+)\s+(\S+)\s+->\s+(\S+)$/,
        (e, [t, r, n, s]) => {
          e.branch.local = n, e.hash.local = t, e.branch.remote = s, e.hash.remote = r;
        }
      )
    ], dr = (e, t) => N(new yt(), hr, [e, t]), qt = (e, t) => Object.assign(
      new yt(),
      dr(e, t),
      Qn(e, t)
    );
  }
}), mr, ts, gr, Ko = m({
  "src/lib/parsers/parse-merge.ts"() {
    zo(), v(), es(), mr = [
      new _(/^Auto-merging\s+(.+)$/, (e, [t]) => {
        e.merges.push(t);
      }),
      new _(/^CONFLICT\s+\((.+)\): Merge conflict in (.+)$/, (e, [t, r]) => {
        e.conflicts.push(new Ee(t, r));
      }),
      new _(
        /^CONFLICT\s+\((.+\/delete)\): (.+) deleted in (.+) and/,
        (e, [t, r, n]) => {
          e.conflicts.push(new Ee(t, r, { deleteRef: n }));
        }
      ),
      new _(/^CONFLICT\s+\((.+)\):/, (e, [t]) => {
        e.conflicts.push(new Ee(t, null));
      }),
      new _(/^Automatic merge failed;\s+(.+)$/, (e, [t]) => {
        e.result = t;
      })
    ], ts = (e, t) => Object.assign(gr(e, t), qt(e, t)), gr = (e) => N(new Vn(), mr, e);
  }
});
function yr(e) {
  return e.length ? {
    commands: ["merge", ...e],
    format: "utf-8",
    parser(t, r) {
      const n = ts(t, r);
      if (n.failed)
        throw new me(n);
      return n;
    }
  } : B("Git.merge requires at least one option");
}
var Qo = m({
  "src/lib/tasks/merge.ts"() {
    ue(), Ko(), F();
  }
});
function Yo(e, t, r) {
  const n = r.includes("deleted"), s = r.includes("tag") || /^refs\/tags/.test(e), i = !r.includes("new");
  return {
    deleted: n,
    tag: s,
    branch: !s,
    new: !i,
    alreadyUpdated: i,
    local: e,
    remote: t
  };
}
var vr, rs, _r, Jo = m({
  "src/lib/parsers/parse-push.ts"() {
    v(), Xn(), vr = [
      new _(/^Pushing to (.+)$/, (e, [t]) => {
        e.repo = t;
      }),
      new _(/^updating local tracking ref '(.+)'/, (e, [t]) => {
        e.ref = {
          ...e.ref || {},
          local: t
        };
      }),
      new _(/^[=*-]\s+([^:]+):(\S+)\s+\[(.+)]$/, (e, [t, r, n]) => {
        e.pushed.push(Yo(t, r, n));
      }),
      new _(
        /^Branch '([^']+)' set up to track remote branch '([^']+)' from '([^']+)'/,
        (e, [t, r, n]) => {
          e.branch = {
            ...e.branch || {},
            local: t,
            remote: r,
            remoteName: n
          };
        }
      ),
      new _(
        /^([^:]+):(\S+)\s+([a-z0-9]+)\.\.([a-z0-9]+)$/,
        (e, [t, r, n, s]) => {
          e.update = {
            head: {
              local: t,
              remote: r
            },
            hash: {
              from: n,
              to: s
            }
          };
        }
      )
    ], rs = (e, t) => {
      const r = _r(e, t), n = Qn(e, t);
      return {
        ...r,
        ...n
      };
    }, _r = (e, t) => N({ pushed: [] }, vr, [e, t]);
  }
}), ns = {};
x(ns, {
  pushTagsTask: () => Xo,
  pushTask: () => zt
});
function Xo(e = {}, t) {
  return w(t, "--tags"), zt(e, t);
}
function zt(e = {}, t) {
  const r = ["push", ...t];
  return e.branch && r.splice(1, 0, e.branch), e.remote && r.splice(1, 0, e.remote), Ie(r, "-v"), w(r, "--verbose"), w(r, "--porcelain"), {
    commands: r,
    format: "utf-8",
    parser: rs
  };
}
var ss = m({
  "src/lib/tasks/push.ts"() {
    Jo(), v();
  }
});
function Zo() {
  return {
    showBuffer() {
      const e = ["show", ...j(arguments, 1)];
      return e.includes("--binary") || e.splice(1, 0, "--binary"), this._runTask(
        ln(e),
        O(arguments)
      );
    },
    show() {
      const e = ["show", ...j(arguments, 1)];
      return this._runTask(
        L(e),
        O(arguments)
      );
    }
  };
}
var ea = m({
  "src/lib/tasks/show.ts"() {
    v(), F();
  }
}), br, is, ta = m({
  "src/lib/responses/FileStatusSummary.ts"() {
    br = /^(.+)\0(.+)$/, is = class {
      constructor(e, t, r) {
        if (this.path = e, this.index = t, this.working_dir = r, t === "R" || r === "R") {
          const n = br.exec(e) || [null, e, e];
          this.from = n[2] || "", this.path = n[1] || "";
        }
      }
    };
  }
});
function kr(e) {
  const [t, r] = e.split(ae);
  return {
    from: r || t,
    to: t
  };
}
function G(e, t, r) {
  return [`${e}${t}`, r];
}
function tt(e, ...t) {
  return t.map((r) => G(e, r, (n, s) => w(n.conflicted, s)));
}
function ra(e, t) {
  const r = t.trim();
  switch (" ") {
    case r.charAt(2):
      return n(r.charAt(0), r.charAt(1), r.substr(3));
    case r.charAt(1):
      return n(" ", r.charAt(0), r.substr(2));
    default:
      return;
  }
  function n(s, i, o) {
    const c = `${s}${i}`, l = os.get(c);
    l && l(e, o), c !== "##" && c !== "!!" && e.files.push(new is(o, s, i));
  }
}
var wr, os, as, na = m({
  "src/lib/responses/StatusSummary.ts"() {
    v(), ta(), wr = class {
      constructor() {
        this.not_added = [], this.conflicted = [], this.created = [], this.deleted = [], this.ignored = void 0, this.modified = [], this.renamed = [], this.files = [], this.staged = [], this.ahead = 0, this.behind = 0, this.current = null, this.tracking = null, this.detached = !1, this.isClean = () => !this.files.length;
      }
    }, os = new Map([
      G(
        " ",
        "A",
        (e, t) => w(e.created, t)
      ),
      G(
        " ",
        "D",
        (e, t) => w(e.deleted, t)
      ),
      G(
        " ",
        "M",
        (e, t) => w(e.modified, t)
      ),
      G(
        "A",
        " ",
        (e, t) => w(e.created, t) && w(e.staged, t)
      ),
      G(
        "A",
        "M",
        (e, t) => w(e.created, t) && w(e.staged, t) && w(e.modified, t)
      ),
      G(
        "D",
        " ",
        (e, t) => w(e.deleted, t) && w(e.staged, t)
      ),
      G(
        "M",
        " ",
        (e, t) => w(e.modified, t) && w(e.staged, t)
      ),
      G(
        "M",
        "M",
        (e, t) => w(e.modified, t) && w(e.staged, t)
      ),
      G("R", " ", (e, t) => {
        w(e.renamed, kr(t));
      }),
      G("R", "M", (e, t) => {
        const r = kr(t);
        w(e.renamed, r), w(e.modified, r.to);
      }),
      G("!", "!", (e, t) => {
        w(e.ignored = e.ignored || [], t);
      }),
      G(
        "?",
        "?",
        (e, t) => w(e.not_added, t)
      ),
      ...tt(
        "A",
        "A",
        "U"
        /* UNMERGED */
      ),
      ...tt(
        "D",
        "D",
        "U"
        /* UNMERGED */
      ),
      ...tt(
        "U",
        "A",
        "D",
        "U"
        /* UNMERGED */
      ),
      [
        "##",
        (e, t) => {
          const r = /ahead (\d+)/, n = /behind (\d+)/, s = /^(.+?(?=(?:\.{3}|\s|$)))/, i = /\.{3}(\S*)/, o = /\son\s(\S+?)(?=\.{3}|$)/;
          let c = r.exec(t);
          e.ahead = c && +c[1] || 0, c = n.exec(t), e.behind = c && +c[1] || 0, c = s.exec(t), e.current = U(c == null ? void 0 : c[1], P, null), c = i.exec(t), e.tracking = U(c == null ? void 0 : c[1], P, null), c = o.exec(t), c && (e.current = U(c == null ? void 0 : c[1], P, e.current)), e.detached = /\(no branch\)/.test(t);
        }
      ]
    ]), as = function(e) {
      const t = e.split(ae), r = new wr();
      for (let n = 0, s = t.length; n < s; ) {
        let i = t[n++].trim();
        i && (i.charAt(0) === "R" && (i += ae + (t[n++] || "")), ra(r, i));
      }
      return r;
    };
  }
});
function sa(e) {
  return {
    format: "utf-8",
    commands: [
      "status",
      "--porcelain",
      "-b",
      "-u",
      "--null",
      ...e.filter((r) => !us.includes(r))
    ],
    parser(r) {
      return as(r);
    }
  };
}
var us, ia = m({
  "src/lib/tasks/status.ts"() {
    na(), us = ["--null", "-z"];
  }
});
function Ae(e = 0, t = 0, r = 0, n = "", s = !0) {
  return Object.defineProperty(
    {
      major: e,
      minor: t,
      patch: r,
      agent: n,
      installed: s
    },
    "toString",
    {
      value() {
        return `${this.major}.${this.minor}.${this.patch}`;
      },
      configurable: !1,
      enumerable: !1
    }
  );
}
function oa() {
  return Ae(0, 0, 0, "", !1);
}
function aa() {
  return {
    version() {
      return this._runTask({
        commands: ["--version"],
        format: "utf-8",
        parser: ua,
        onError(e, t, r, n) {
          if (e.exitCode === -2)
            return r(Buffer.from(Wt));
          n(t);
        }
      });
    }
  };
}
function ua(e) {
  return e === Wt ? oa() : N(Ae(0, 0, 0, e), cs, e);
}
var Wt, cs, ca = m({
  "src/lib/tasks/version.ts"() {
    v(), Wt = "installed=false", cs = [
      new _(
        /version (\d+)\.(\d+)\.(\d+)(?:\s*\((.+)\))?/,
        (e, [t, r, n, s = ""]) => {
          Object.assign(
            e,
            Ae(R(t), R(r), R(n), s)
          );
        }
      ),
      new _(
        /version (\d+)\.(\d+)\.(\D+)(.+)?$/,
        (e, [t, r, n, s = ""]) => {
          Object.assign(e, Ae(R(t), R(r), n, s));
        }
      )
    ];
  }
}), ls = {};
x(ls, {
  SimpleGitApi: () => vt
});
var vt, la = m({
  "src/lib/simple-git-api.ts"() {
    mo(), go(), vo(), ko(), Ro(), vn(), Oo(), Tn(), xo(), Do(), Wn(), Qo(), ss(), ea(), ia(), F(), ca(), v(), vt = class {
      constructor(e) {
        this._executor = e;
      }
      _runTask(e, t) {
        const r = this._executor.chain(), n = r.push(e);
        return t && po(e, n, t), Object.create(this, {
          then: { value: n.then.bind(n) },
          catch: { value: n.catch.bind(n) },
          _executor: { value: r }
        });
      }
      add(e) {
        return this._runTask(
          L(["add", ...H(e)]),
          O(arguments)
        );
      }
      cwd(e) {
        const t = O(arguments);
        return typeof e == "string" ? this._runTask(ir(e, this._executor), t) : typeof (e == null ? void 0 : e.path) == "string" ? this._runTask(
          ir(
            e.path,
            e.root && this._executor || void 0
          ),
          t
        ) : this._runTask(
          B("Git.cwd: workingDirectory must be supplied as a string"),
          t
        );
      }
      hashObject(e, t) {
        return this._runTask(
          Fo(e, t === !0),
          O(arguments)
        );
      }
      init(e) {
        return this._runTask(
          Mo(e === !0, this._executor.cwd, j(arguments)),
          O(arguments)
        );
      }
      merge() {
        return this._runTask(
          yr(j(arguments)),
          O(arguments)
        );
      }
      mergeFromTo(e, t) {
        return P(e) && P(t) ? this._runTask(
          yr([e, t, ...j(arguments)]),
          O(arguments, !1)
        ) : this._runTask(
          B(
            "Git.mergeFromTo requires that the 'remote' and 'branch' arguments are supplied as strings"
          )
        );
      }
      outputHandler(e) {
        return this._executor.outputHandler = e, this;
      }
      push() {
        const e = zt(
          {
            remote: U(arguments[0], P),
            branch: U(arguments[1], P)
          },
          j(arguments)
        );
        return this._runTask(e, O(arguments));
      }
      stash() {
        return this._runTask(
          L(["stash", ...j(arguments)]),
          O(arguments)
        );
      }
      status() {
        return this._runTask(
          sa(j(arguments)),
          O(arguments)
        );
      }
    }, Object.assign(
      vt.prototype,
      yo(),
      So(),
      Zi(),
      bo(),
      Eo(),
      no(),
      qo(),
      Zo(),
      aa()
    );
  }
}), fs = {};
x(fs, {
  Scheduler: () => ps
});
var Tr, ps, fa = m({
  "src/lib/runners/scheduler.ts"() {
    v(), On(), Tr = /* @__PURE__ */ (() => {
      let e = 0;
      return () => {
        e++;
        const { promise: t, done: r } = jr();
        return {
          promise: t,
          done: r,
          id: e
        };
      };
    })(), ps = class {
      constructor(e = 2) {
        this.concurrency = e, this.logger = Dt("", "scheduler"), this.pending = [], this.running = [], this.logger("Constructed, concurrency=%s", e);
      }
      schedule() {
        if (!this.pending.length || this.running.length >= this.concurrency) {
          this.logger(
            "Schedule attempt ignored, pending=%s running=%s concurrency=%s",
            this.pending.length,
            this.running.length,
            this.concurrency
          );
          return;
        }
        const e = w(this.running, this.pending.shift());
        this.logger("Attempting id=%s", e.id), e.done(() => {
          this.logger("Completing id=", e.id), Ie(this.running, e), this.schedule();
        });
      }
      next() {
        const { promise: e, id: t } = w(this.pending, Tr());
        return this.logger("Scheduling id=%s", t), this.schedule(), e;
      }
    };
  }
}), hs = {};
x(hs, {
  applyPatchTask: () => pa
});
function pa(e, t) {
  return L(["apply", ...t, ...e]);
}
var ha = m({
  "src/lib/tasks/apply-patch.ts"() {
    F();
  }
});
function da(e, t) {
  return {
    branch: e,
    hash: t,
    success: !0
  };
}
function ma(e) {
  return {
    branch: e,
    hash: null,
    success: !1
  };
}
var ds, ga = m({
  "src/lib/responses/BranchDeleteSummary.ts"() {
    ds = class {
      constructor() {
        this.all = [], this.branches = {}, this.errors = [];
      }
      get success() {
        return !this.errors.length;
      }
    };
  }
});
function ms(e, t) {
  return t === 1 && _t.test(e);
}
var Cr, _t, Sr, Ge, ya = m({
  "src/lib/parsers/parse-branch-delete.ts"() {
    ga(), v(), Cr = /(\S+)\s+\(\S+\s([^)]+)\)/, _t = /^error[^']+'([^']+)'/m, Sr = [
      new _(Cr, (e, [t, r]) => {
        const n = da(t, r);
        e.all.push(n), e.branches[t] = n;
      }),
      new _(_t, (e, [t]) => {
        const r = ma(t);
        e.errors.push(r), e.all.push(r), e.branches[t] = r;
      })
    ], Ge = (e, t) => N(new ds(), Sr, [e, t]);
  }
}), gs, va = m({
  "src/lib/responses/BranchSummary.ts"() {
    gs = class {
      constructor() {
        this.all = [], this.branches = {}, this.current = "", this.detached = !1;
      }
      push(e, t, r, n, s) {
        e === "*" && (this.detached = t, this.current = r), this.all.push(r), this.branches[r] = {
          current: e === "*",
          linkedWorkTree: e === "+",
          name: r,
          commit: n,
          label: s
        };
      }
    };
  }
});
function Rr(e) {
  return e ? e.charAt(0) : "";
}
function ys(e, t = !1) {
  return N(
    new gs(),
    t ? [_s] : vs,
    e
  );
}
var vs, _s, _a = m({
  "src/lib/parsers/parse-branch.ts"() {
    va(), v(), vs = [
      new _(
        /^([*+]\s)?\((?:HEAD )?detached (?:from|at) (\S+)\)\s+([a-z0-9]+)\s(.*)$/,
        (e, [t, r, n, s]) => {
          e.push(Rr(t), !0, r, n, s);
        }
      ),
      new _(
        /^([*+]\s)?(\S+)\s+([a-z0-9]+)\s?(.*)$/s,
        (e, [t, r, n, s]) => {
          e.push(Rr(t), !1, r, n, s);
        }
      )
    ], _s = new _(/^(\S+)$/s, (e, [t]) => {
      e.push("*", !1, t, "", "");
    });
  }
}), bs = {};
x(bs, {
  branchLocalTask: () => ka,
  branchTask: () => ba,
  containsDeleteBranchCommand: () => ks,
  deleteBranchTask: () => Ta,
  deleteBranchesTask: () => wa
});
function ks(e) {
  const t = ["-d", "-D", "--delete"];
  return e.some((r) => t.includes(r));
}
function ba(e) {
  const t = ks(e), r = e.includes("--show-current"), n = ["branch", ...e];
  return n.length === 1 && n.push("-a"), n.includes("-v") || n.splice(1, 0, "-v"), {
    format: "utf-8",
    commands: n,
    parser(s, i) {
      return t ? Ge(s, i).all[0] : ys(s, r);
    }
  };
}
function ka() {
  return {
    format: "utf-8",
    commands: ["branch", "-v"],
    parser(e) {
      return ys(e);
    }
  };
}
function wa(e, t = !1) {
  return {
    format: "utf-8",
    commands: ["branch", "-v", t ? "-D" : "-d", ...e],
    parser(r, n) {
      return Ge(r, n);
    },
    onError({ exitCode: r, stdOut: n }, s, i, o) {
      if (!ms(String(s), r))
        return o(s);
      i(n);
    }
  };
}
function Ta(e, t = !1) {
  const r = {
    format: "utf-8",
    commands: ["branch", "-v", t ? "-D" : "-d", e],
    parser(n, s) {
      return Ge(n, s).branches[e];
    },
    onError({ exitCode: n, stdErr: s, stdOut: i }, o, c, l) {
      if (!ms(String(o), n))
        return l(o);
      throw new me(
        r.parser(he(i), he(s)),
        String(o)
      );
    }
  };
  return r;
}
var Ca = m({
  "src/lib/tasks/branch.ts"() {
    ue(), ya(), _a(), v();
  }
});
function Sa(e) {
  const t = e.trim().replace(/^["']|["']$/g, "");
  return t && li(t);
}
var ws, Ra = m({
  "src/lib/responses/CheckIgnore.ts"() {
    ws = (e) => e.split(/\n/g).map(Sa).filter(Boolean);
  }
}), Ts = {};
x(Ts, {
  checkIgnoreTask: () => Ea
});
function Ea(e) {
  return {
    commands: ["check-ignore", ...e],
    format: "utf-8",
    parser: ws
  };
}
var Oa = m({
  "src/lib/tasks/check-ignore.ts"() {
    Ra();
  }
}), Cs = {};
x(Cs, {
  cloneMirrorTask: () => xa,
  cloneTask: () => Ss
});
function Fa(e) {
  return /^--upload-pack(=|$)/.test(e);
}
function Ss(e, t, r) {
  const n = ["clone", ...r];
  return P(e) && n.push(e), P(t) && n.push(t), n.find(Fa) ? B("git.fetch: potential exploit argument blocked.") : L(n);
}
function xa(e, t, r) {
  return w(r, "--mirror"), Ss(e, t, r);
}
var Aa = m({
  "src/lib/tasks/clone.ts"() {
    F(), v();
  }
});
function Pa(e, t) {
  return N({
    raw: e,
    remote: null,
    branches: [],
    tags: [],
    updated: [],
    deleted: []
  }, Rs, [e, t]);
}
var Rs, Ia = m({
  "src/lib/parsers/parse-fetch.ts"() {
    v(), Rs = [
      new _(/From (.+)$/, (e, [t]) => {
        e.remote = t;
      }),
      new _(/\* \[new branch]\s+(\S+)\s*-> (.+)$/, (e, [t, r]) => {
        e.branches.push({
          name: t,
          tracking: r
        });
      }),
      new _(/\* \[new tag]\s+(\S+)\s*-> (.+)$/, (e, [t, r]) => {
        e.tags.push({
          name: t,
          tracking: r
        });
      }),
      new _(/- \[deleted]\s+\S+\s*-> (.+)$/, (e, [t]) => {
        e.deleted.push({
          tracking: t
        });
      }),
      new _(
        /\s*([^.]+)\.\.(\S+)\s+(\S+)\s*-> (.+)$/,
        (e, [t, r, n, s]) => {
          e.updated.push({
            name: n,
            tracking: s,
            to: r,
            from: t
          });
        }
      )
    ];
  }
}), Es = {};
x(Es, {
  fetchTask: () => Da
});
function Ma(e) {
  return /^--upload-pack(=|$)/.test(e);
}
function Da(e, t, r) {
  const n = ["fetch", ...r];
  return e && t && n.push(e, t), n.find(Ma) ? B("git.fetch: potential exploit argument blocked.") : {
    commands: n,
    format: "utf-8",
    parser: Pa
  };
}
var La = m({
  "src/lib/tasks/fetch.ts"() {
    Ia(), F();
  }
});
function ja(e) {
  return N({ moves: [] }, Os, e);
}
var Os, Ba = m({
  "src/lib/parsers/parse-move.ts"() {
    v(), Os = [
      new _(/^Renaming (.+) to (.+)$/, (e, [t, r]) => {
        e.moves.push({ from: t, to: r });
      })
    ];
  }
}), Fs = {};
x(Fs, {
  moveTask: () => Na
});
function Na(e, t) {
  return {
    commands: ["mv", "-v", ...H(e), t],
    format: "utf-8",
    parser: ja
  };
}
var Ga = m({
  "src/lib/tasks/move.ts"() {
    Ba(), v();
  }
}), xs = {};
x(xs, {
  pullTask: () => Ua
});
function Ua(e, t, r) {
  const n = ["pull", ...r];
  return e && t && n.splice(1, 0, e, t), {
    commands: n,
    format: "utf-8",
    parser(s, i) {
      return qt(s, i);
    },
    onError(s, i, o, c) {
      const l = Ho(
        he(s.stdOut),
        he(s.stdErr)
      );
      if (l)
        return c(new me(l));
      c(i);
    }
  };
}
var $a = m({
  "src/lib/tasks/pull.ts"() {
    ue(), es(), v();
  }
});
function qa(e) {
  const t = {};
  return As(e, ([r]) => t[r] = { name: r }), Object.values(t);
}
function za(e) {
  const t = {};
  return As(e, ([r, n, s]) => {
    Object.hasOwn(t, r) || (t[r] = {
      name: r,
      refs: { fetch: "", push: "" }
    }), s && n && (t[r].refs[s.replace(/[^a-z]/g, "")] = n);
  }), Object.values(t);
}
function As(e, t) {
  St(e, (r) => t(r.split(/\s+/)));
}
var Wa = m({
  "src/lib/responses/GetRemoteSummary.ts"() {
    v();
  }
}), Ps = {};
x(Ps, {
  addRemoteTask: () => Va,
  getRemotesTask: () => Ha,
  listRemotesTask: () => Ka,
  remoteTask: () => Qa,
  removeRemoteTask: () => Ya
});
function Va(e, t, r) {
  return L(["remote", "add", ...r, e, t]);
}
function Ha(e) {
  const t = ["remote"];
  return e && t.push("-v"), {
    commands: t,
    format: "utf-8",
    parser: e ? za : qa
  };
}
function Ka(e) {
  const t = [...e];
  return t[0] !== "ls-remote" && t.unshift("ls-remote"), L(t);
}
function Qa(e) {
  const t = [...e];
  return t[0] !== "remote" && t.unshift("remote"), L(t);
}
function Ya(e) {
  return L(["remote", "remove", e]);
}
var Ja = m({
  "src/lib/tasks/remote.ts"() {
    Wa(), F();
  }
}), Is = {};
x(Is, {
  stashListTask: () => Xa
});
function Xa(e = {}, t) {
  const r = zn(e), n = ["stash", "list", ...r.commands, ...t], s = Gn(
    r.splitter,
    r.fields,
    jt(n)
  );
  return Ne(n) || {
    commands: n,
    format: "utf-8",
    parser: s
  };
}
var Za = m({
  "src/lib/tasks/stash-list.ts"() {
    _e(), $n(), $t(), Wn();
  }
}), Ms = {};
x(Ms, {
  addSubModuleTask: () => eu,
  initSubModuleTask: () => tu,
  subModuleTask: () => Ue,
  updateSubModuleTask: () => ru
});
function eu(e, t) {
  return Ue(["add", e, t]);
}
function tu(e) {
  return Ue(["init", ...e]);
}
function Ue(e) {
  const t = [...e];
  return t[0] !== "submodule" && t.unshift("submodule"), L(t);
}
function ru(e) {
  return Ue(["update", ...e]);
}
var nu = m({
  "src/lib/tasks/sub-module.ts"() {
    F();
  }
});
function su(e, t) {
  const r = Number.isNaN(e), n = Number.isNaN(t);
  return r !== n ? r ? 1 : -1 : r ? Ds(e, t) : 0;
}
function Ds(e, t) {
  return e === t ? 0 : e > t ? 1 : -1;
}
function iu(e) {
  return e.trim();
}
function Te(e) {
  return typeof e == "string" && parseInt(e.replace(/^\D+/g, ""), 10) || 0;
}
var Er, Ls, ou = m({
  "src/lib/responses/TagList.ts"() {
    Er = class {
      constructor(e, t) {
        this.all = e, this.latest = t;
      }
    }, Ls = function(e, t = !1) {
      const r = e.split(`
`).map(iu).filter(Boolean);
      t || r.sort(function(s, i) {
        const o = s.split("."), c = i.split(".");
        if (o.length === 1 || c.length === 1)
          return su(Te(o[0]), Te(c[0]));
        for (let l = 0, p = Math.max(o.length, c.length); l < p; l++) {
          const f = Ds(Te(o[l]), Te(c[l]));
          if (f)
            return f;
        }
        return 0;
      });
      const n = t ? r[0] : [...r].reverse().find((s) => s.indexOf(".") >= 0);
      return new Er(r, n);
    };
  }
}), js = {};
x(js, {
  addAnnotatedTagTask: () => cu,
  addTagTask: () => uu,
  tagListTask: () => au
});
function au(e = []) {
  const t = e.some((r) => /^--sort=/.test(r));
  return {
    format: "utf-8",
    commands: ["tag", "-l", ...e],
    parser(r) {
      return Ls(r, t);
    }
  };
}
function uu(e) {
  return {
    format: "utf-8",
    commands: ["tag", e],
    parser() {
      return { name: e };
    }
  };
}
function cu(e, t) {
  return {
    format: "utf-8",
    commands: ["tag", "-a", "-m", t, e],
    parser() {
      return { name: e };
    }
  };
}
var lu = m({
  "src/lib/tasks/tag.ts"() {
    ou();
  }
}), fu = Si({
  "src/git.js"(e, t) {
    var { GitExecutor: r } = (fo(), E(xn)), { SimpleGitApi: n } = (la(), E(ls)), { Scheduler: s } = (fa(), E(fs)), { configurationErrorTask: i } = (F(), E(ht)), {
      asArray: o,
      filterArray: c,
      filterPrimitives: l,
      filterString: p,
      filterStringOrStringArray: f,
      filterType: u,
      getTrailingOptions: a,
      trailingFunctionArgument: h,
      trailingOptionsArgument: b
    } = (v(), E(Zr)), { applyPatchTask: k } = (ha(), E(hs)), {
      branchTask: C,
      branchLocalTask: S,
      deleteBranchesTask: M,
      deleteBranchTask: J
    } = (Ca(), E(bs)), { checkIgnoreTask: $e } = (Oa(), E(Ts)), { checkIsRepoTask: se } = (nn(), E(en)), { cloneTask: Vt, cloneMirrorTask: le } = (Aa(), E(Cs)), { cleanWithOptionsTask: qe, isCleanOptionsArray: be } = (mn(), E(hn)), { diffSummaryTask: ze } = ($t(), E(qn)), { fetchTask: Us } = (La(), E(Es)), { moveTask: $s } = (Ga(), E(Fs)), { pullTask: qs } = ($a(), E(xs)), { pushTagsTask: zs } = (ss(), E(ns)), {
      addRemoteTask: Ws,
      getRemotesTask: Vs,
      listRemotesTask: Hs,
      remoteTask: Ks,
      removeRemoteTask: Qs
    } = (Ja(), E(Ps)), { getResetMode: Ys, resetTask: Js } = (En(), E(Cn)), { stashListTask: Xs } = (Za(), E(Is)), {
      addSubModuleTask: Zs,
      initSubModuleTask: ei,
      subModuleTask: ti,
      updateSubModuleTask: ri
    } = (nu(), E(Ms)), { addAnnotatedTagTask: ni, addTagTask: si, tagListTask: ii } = (lu(), E(js)), { straightThroughBufferTask: oi, straightThroughStringTask: V } = (F(), E(ht));
    function y(d, g) {
      this._plugins = g, this._executor = new r(
        d.baseDir,
        new s(d.maxConcurrentProcesses),
        g
      ), this._trimmed = d.trimmed;
    }
    (y.prototype = Object.create(n.prototype)).constructor = y, y.prototype.customBinary = function(d) {
      return this._plugins.reconfigure("binary", d), this;
    }, y.prototype.env = function(d, g) {
      return arguments.length === 1 && typeof d == "object" ? this._executor.env = d : (this._executor.env = this._executor.env || {})[d] = g, this;
    }, y.prototype.stashList = function(d) {
      return this._runTask(
        Xs(
          b(arguments) || {},
          c(d) && d || []
        ),
        h(arguments)
      );
    };
    function Ht(d, g, T, D) {
      return typeof T != "string" ? i(`git.${d}() requires a string 'repoPath'`) : g(T, u(D, p), a(arguments));
    }
    y.prototype.clone = function() {
      return this._runTask(
        Ht("clone", Vt, ...arguments),
        h(arguments)
      );
    }, y.prototype.mirror = function() {
      return this._runTask(
        Ht("mirror", le, ...arguments),
        h(arguments)
      );
    }, y.prototype.mv = function(d, g) {
      return this._runTask($s(d, g), h(arguments));
    }, y.prototype.checkoutLatestTag = function(d) {
      var g = this;
      return this.pull(function() {
        g.tags(function(T, D) {
          g.checkout(D.latest, d);
        });
      });
    }, y.prototype.pull = function(d, g, T, D) {
      return this._runTask(
        qs(
          u(d, p),
          u(g, p),
          a(arguments)
        ),
        h(arguments)
      );
    }, y.prototype.fetch = function(d, g) {
      return this._runTask(
        Us(
          u(d, p),
          u(g, p),
          a(arguments)
        ),
        h(arguments)
      );
    }, y.prototype.silent = function(d) {
      return console.warn(
        "simple-git deprecation notice: git.silent: logging should be configured using the `debug` library / `DEBUG` environment variable, this will be an error in version 3"
      ), this;
    }, y.prototype.tags = function(d, g) {
      return this._runTask(
        ii(a(arguments)),
        h(arguments)
      );
    }, y.prototype.rebase = function() {
      return this._runTask(
        V(["rebase", ...a(arguments)]),
        h(arguments)
      );
    }, y.prototype.reset = function(d) {
      return this._runTask(
        Js(Ys(d), a(arguments)),
        h(arguments)
      );
    }, y.prototype.revert = function(d) {
      const g = h(arguments);
      return typeof d != "string" ? this._runTask(i("Commit must be a string"), g) : this._runTask(
        V(["revert", ...a(arguments, 0, !0), d]),
        g
      );
    }, y.prototype.addTag = function(d) {
      const g = typeof d == "string" ? si(d) : i("Git.addTag requires a tag name");
      return this._runTask(g, h(arguments));
    }, y.prototype.addAnnotatedTag = function(d, g) {
      return this._runTask(
        ni(d, g),
        h(arguments)
      );
    }, y.prototype.deleteLocalBranch = function(d, g, T) {
      return this._runTask(
        J(d, typeof g == "boolean" ? g : !1),
        h(arguments)
      );
    }, y.prototype.deleteLocalBranches = function(d, g, T) {
      return this._runTask(
        M(d, typeof g == "boolean" ? g : !1),
        h(arguments)
      );
    }, y.prototype.branch = function(d, g) {
      return this._runTask(
        C(a(arguments)),
        h(arguments)
      );
    }, y.prototype.branchLocal = function(d) {
      return this._runTask(S(), h(arguments));
    }, y.prototype.raw = function(d) {
      const g = !Array.isArray(d), T = [].slice.call(g ? arguments : d, 0);
      for (let z = 0; z < T.length && g; z++)
        if (!l(T[z])) {
          T.splice(z, T.length - z);
          break;
        }
      T.push(...a(arguments, 0, !0));
      var D = h(arguments);
      return T.length ? this._runTask(V(T, this._trimmed), D) : this._runTask(
        i("Raw: must supply one or more command to execute"),
        D
      );
    }, y.prototype.submoduleAdd = function(d, g, T) {
      return this._runTask(Zs(d, g), h(arguments));
    }, y.prototype.submoduleUpdate = function(d, g) {
      return this._runTask(
        ri(a(arguments, !0)),
        h(arguments)
      );
    }, y.prototype.submoduleInit = function(d, g) {
      return this._runTask(
        ei(a(arguments, !0)),
        h(arguments)
      );
    }, y.prototype.subModule = function(d, g) {
      return this._runTask(
        ti(a(arguments)),
        h(arguments)
      );
    }, y.prototype.listRemote = function() {
      return this._runTask(
        Hs(a(arguments)),
        h(arguments)
      );
    }, y.prototype.addRemote = function(d, g, T) {
      return this._runTask(
        Ws(d, g, a(arguments)),
        h(arguments)
      );
    }, y.prototype.removeRemote = function(d, g) {
      return this._runTask(Qs(d), h(arguments));
    }, y.prototype.getRemotes = function(d, g) {
      return this._runTask(Vs(d === !0), h(arguments));
    }, y.prototype.remote = function(d, g) {
      return this._runTask(
        Ks(a(arguments)),
        h(arguments)
      );
    }, y.prototype.tag = function(d, g) {
      const T = a(arguments);
      return T[0] !== "tag" && T.unshift("tag"), this._runTask(V(T), h(arguments));
    }, y.prototype.updateServerInfo = function(d) {
      return this._runTask(
        V(["update-server-info"]),
        h(arguments)
      );
    }, y.prototype.pushTags = function(d, g) {
      const T = zs(
        { remote: u(d, p) },
        a(arguments)
      );
      return this._runTask(T, h(arguments));
    }, y.prototype.rm = function(d) {
      return this._runTask(
        V(["rm", "-f", ...o(d)]),
        h(arguments)
      );
    }, y.prototype.rmKeepLocal = function(d) {
      return this._runTask(
        V(["rm", "--cached", ...o(d)]),
        h(arguments)
      );
    }, y.prototype.catFile = function(d, g) {
      return this._catFile("utf-8", arguments);
    }, y.prototype.binaryCatFile = function() {
      return this._catFile("buffer", arguments);
    }, y.prototype._catFile = function(d, g) {
      var T = h(g), D = ["cat-file"], z = g[0];
      if (typeof z == "string")
        return this._runTask(
          i("Git.catFile: options must be supplied as an array of strings"),
          T
        );
      Array.isArray(z) && D.push.apply(D, z);
      const We = d === "buffer" ? oi(D) : V(D);
      return this._runTask(We, T);
    }, y.prototype.diff = function(d, g) {
      const T = p(d) ? i(
        "git.diff: supplying options as a single string is no longer supported, switch to an array of strings"
      ) : V(["diff", ...a(arguments)]);
      return this._runTask(T, h(arguments));
    }, y.prototype.diffSummary = function() {
      return this._runTask(
        ze(a(arguments, 1)),
        h(arguments)
      );
    }, y.prototype.applyPatch = function(d) {
      const g = f(d) ? k(o(d), a([].slice.call(arguments, 1))) : i(
        "git.applyPatch requires one or more string patches as the first argument"
      );
      return this._runTask(g, h(arguments));
    }, y.prototype.revparse = function() {
      const d = ["rev-parse", ...a(arguments, !0)];
      return this._runTask(
        V(d, !0),
        h(arguments)
      );
    }, y.prototype.clean = function(d, g, T) {
      const D = be(d), z = D && d.join("") || u(d, p) || "", We = a([].slice.call(arguments, D ? 1 : 0));
      return this._runTask(
        qe(z, We),
        h(arguments)
      );
    }, y.prototype.exec = function(d) {
      const g = {
        commands: [],
        format: "utf-8",
        parser() {
          typeof d == "function" && d();
        }
      };
      return this._runTask(g);
    }, y.prototype.clearQueue = function() {
      return this;
    }, y.prototype.checkIgnore = function(d, g) {
      return this._runTask(
        $e(o(u(d, f, []))),
        h(arguments)
      );
    }, y.prototype.checkIsRepo = function(d, g) {
      return this._runTask(
        se(u(d, p)),
        h(arguments)
      );
    }, t.exports = y;
  }
});
de();
Z();
var pu = class extends Y {
  constructor(e, t) {
    super(void 0, t), this.config = e;
  }
};
Z();
Z();
var Q = class extends Y {
  constructor(e, t, r) {
    super(e, r), this.task = e, this.plugin = t, Object.setPrototypeOf(this, new.target.prototype);
  }
};
ue();
Nr();
nn();
mn();
vn();
bn();
Tn();
En();
function hu(e) {
  return e ? [{
    type: "spawn.before",
    action(n, s) {
      e.aborted && s.kill(new Q(void 0, "abort", "Abort already signaled"));
    }
  }, {
    type: "spawn.after",
    action(n, s) {
      function i() {
        s.kill(new Q(void 0, "abort", "Abort signal received"));
      }
      e.addEventListener("abort", i), s.spawned.on("close", () => e.removeEventListener("abort", i));
    }
  }] : void 0;
}
function du(e) {
  return typeof e == "string" && e.trim().toLowerCase() === "-c";
}
function mu(e, t) {
  if (du(e) && /^\s*protocol(.[a-z]+)?.allow/.test(t))
    throw new Q(
      void 0,
      "unsafe",
      "Configuring protocol.allow is not permitted without enabling allowUnsafeExtProtocol"
    );
}
function gu(e, t) {
  if (/^\s*--(upload|receive)-pack/.test(e))
    throw new Q(
      void 0,
      "unsafe",
      "Use of --upload-pack or --receive-pack is not permitted without enabling allowUnsafePack"
    );
  if (t === "clone" && /^\s*-u\b/.test(e))
    throw new Q(
      void 0,
      "unsafe",
      "Use of clone with option -u is not permitted without enabling allowUnsafePack"
    );
  if (t === "push" && /^\s*--exec\b/.test(e))
    throw new Q(
      void 0,
      "unsafe",
      "Use of push with option --exec is not permitted without enabling allowUnsafePack"
    );
}
function yu({
  allowUnsafeProtocolOverride: e = !1,
  allowUnsafePack: t = !1
} = {}) {
  return {
    type: "spawn.args",
    action(r, n) {
      return r.forEach((s, i) => {
        const o = i < r.length ? r[i + 1] : "";
        e || mu(s, o), t || gu(s, n.method);
      }), r;
    }
  };
}
v();
function vu(e) {
  const t = pe(e, "-c");
  return {
    type: "spawn.args",
    action(r) {
      return [...t, ...r];
    }
  };
}
v();
var Or = ie().promise;
function _u({
  onClose: e = !0,
  onExit: t = 50
} = {}) {
  function r() {
    let s = -1;
    const i = {
      close: ie(),
      closeTimeout: ie(),
      exit: ie(),
      exitTimeout: ie()
    }, o = Promise.race([
      e === !1 ? Or : i.closeTimeout.promise,
      t === !1 ? Or : i.exitTimeout.promise
    ]);
    return n(e, i.close, i.closeTimeout), n(t, i.exit, i.exitTimeout), {
      close(c) {
        s = c, i.close.done();
      },
      exit(c) {
        s = c, i.exit.done();
      },
      get exitCode() {
        return s;
      },
      result: o
    };
  }
  function n(s, i, o) {
    s !== !1 && (s === !0 ? i.promise : i.promise.then(() => at(s))).then(o.done);
  }
  return {
    type: "spawn.after",
    async action(s, { spawned: i, close: o }) {
      var f, u;
      const c = r();
      let l = !0, p = () => void (l = !1);
      (f = i.stdout) == null || f.on("data", p), (u = i.stderr) == null || u.on("data", p), i.on("error", p), i.on("close", (a) => c.close(a)), i.on("exit", (a) => c.exit(a));
      try {
        await c.result, l && await at(50), o(c.exitCode);
      } catch (a) {
        o(c.exitCode, a);
      }
    }
  };
}
v();
var bu = "Invalid value supplied for custom binary, requires a single string or an array containing either one or two strings", Fr = "Invalid value supplied for custom binary, restricted characters must be removed or supply the unsafe.allowUnsafeCustomBinary option";
function ku(e) {
  return !e || !/^([a-z]:)?([a-z0-9/.\\_-]+)$/i.test(e);
}
function xr(e, t) {
  if (e.length < 1 || e.length > 2)
    throw new Q(void 0, "binary", bu);
  if (e.some(ku))
    if (t)
      console.warn(Fr);
    else
      throw new Q(void 0, "binary", Fr);
  const [n, s] = e;
  return {
    binary: n,
    prefix: s
  };
}
function wu(e, t = ["git"], r = !1) {
  let n = xr(H(t), r);
  e.on("binary", (s) => {
    n = xr(H(s), r);
  }), e.append("spawn.binary", () => n.binary), e.append("spawn.args", (s) => n.prefix ? [n.prefix, ...s] : s);
}
Z();
function Tu(e) {
  return !!(e.exitCode && e.stdErr.length);
}
function Cu(e) {
  return Buffer.concat([...e.stdOut, ...e.stdErr]);
}
function Su(e = !1, t = Tu, r = Cu) {
  return (n, s) => !e && n || !t(s) ? n : r(s);
}
function Ar(e) {
  return {
    type: "task.error",
    action(t, r) {
      const n = e(t.error, {
        stdErr: r.stdErr,
        stdOut: r.stdOut,
        exitCode: r.exitCode
      });
      return Buffer.isBuffer(n) ? { error: new Y(void 0, n.toString("utf-8")) } : {
        error: n
      };
    }
  };
}
v();
var Ru = class {
  constructor() {
    this.plugins = /* @__PURE__ */ new Set(), this.events = new gi();
  }
  on(e, t) {
    this.events.on(e, t);
  }
  reconfigure(e, t) {
    this.events.emit(e, t);
  }
  append(e, t) {
    const r = w(this.plugins, { type: e, action: t });
    return () => this.plugins.delete(r);
  }
  add(e) {
    const t = [];
    return H(e).forEach((r) => r && this.plugins.add(w(t, r))), () => {
      t.forEach((r) => this.plugins.delete(r));
    };
  }
  exec(e, t, r) {
    let n = t;
    const s = Object.freeze(Object.create(r));
    for (const i of this.plugins)
      i.type === e && (n = i.action(n, s));
    return n;
  }
};
v();
function Eu(e) {
  const t = "--progress", r = ["checkout", "clone", "fetch", "pull", "push"];
  return [{
    type: "spawn.args",
    action(i, o) {
      return r.includes(o.method) ? Wr(i, t) : i;
    }
  }, {
    type: "spawn.after",
    action(i, o) {
      var c;
      o.commands.includes(t) && ((c = o.spawned.stderr) == null || c.on("data", (l) => {
        const p = /^([\s\S]+?):\s*(\d+)% \((\d+)\/(\d+)\)/.exec(l.toString("utf8"));
        p && e({
          method: o.method,
          stage: Ou(p[1]),
          progress: R(p[2]),
          processed: R(p[3]),
          total: R(p[4])
        });
      }));
    }
  }];
}
function Ou(e) {
  return String(e.toLowerCase().split(" ", 1)) || "unknown";
}
v();
function Fu(e) {
  const t = Hr(e, ["uid", "gid"]);
  return {
    type: "spawn.options",
    action(r) {
      return { ...t, ...r };
    }
  };
}
function xu({
  block: e,
  stdErr: t = !0,
  stdOut: r = !0
}) {
  if (e > 0)
    return {
      type: "spawn.after",
      action(n, s) {
        var p, f;
        let i;
        function o() {
          i && clearTimeout(i), i = setTimeout(l, e);
        }
        function c() {
          var u, a;
          (u = s.spawned.stdout) == null || u.off("data", o), (a = s.spawned.stderr) == null || a.off("data", o), s.spawned.off("exit", c), s.spawned.off("close", c), i && clearTimeout(i);
        }
        function l() {
          c(), s.kill(new Q(void 0, "timeout", "block timeout reached"));
        }
        r && ((p = s.spawned.stdout) == null || p.on("data", o)), t && ((f = s.spawned.stderr) == null || f.on("data", o)), s.spawned.on("exit", c), s.spawned.on("close", c), o();
      }
    };
}
de();
function Au() {
  return {
    type: "spawn.args",
    action(e) {
      const t = [];
      let r;
      function n(s) {
        (r = r || []).push(...s);
      }
      for (let s = 0; s < e.length; s++) {
        const i = e[s];
        if (Oe(i)) {
          n(tr(i));
          continue;
        }
        if (i === "--") {
          n(
            e.slice(s + 1).flatMap((o) => Oe(o) && tr(o) || o)
          );
          break;
        }
        t.push(i);
      }
      return r ? [...t, "--", ...r.map(String)] : t;
    }
  };
}
v();
var Pu = fu();
function Iu(e, t) {
  var s;
  const r = new Ru(), n = Jr(
    e && (typeof e == "string" ? { baseDir: e } : e) || {},
    t
  );
  if (!Rt(n.baseDir))
    throw new pu(
      n,
      "Cannot use simple-git on a directory that does not exist"
    );
  return Array.isArray(n.config) && r.add(vu(n.config)), r.add(yu(n.unsafe)), r.add(Au()), r.add(_u(n.completion)), n.abort && r.add(hu(n.abort)), n.progress && r.add(Eu(n.progress)), n.timeout && r.add(xu(n.timeout)), n.spawnOptions && r.add(Fu(n.spawnOptions)), r.add(Ar(Su(!0))), n.errors && r.add(Ar(n.errors)), wu(r, n.binary, (s = n.unsafe) == null ? void 0 : s.allowUnsafeCustomBinary), new Pu(n, r);
}
ue();
var rt = Iu;
const Bs = I.dirname(ci(import.meta.url));
process.env.APP_ROOT = I.join(Bs, "..");
const bt = process.env.VITE_DEV_SERVER_URL, Wu = I.join(process.env.APP_ROOT, "dist-electron"), Ns = I.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = bt ? I.join(process.env.APP_ROOT, "public") : Ns;
let K;
console.log(te.getPath("userData"));
const kt = I.join(te.getPath("userData"), "instances.json");
function W() {
  if (!A.existsSync(kt))
    return [];
  try {
    const e = A.readFileSync(kt, "utf-8");
    return JSON.parse(e);
  } catch (e) {
    return console.error("Failed to load config", e), [];
  }
}
function nt(e) {
  A.writeFileSync(kt, JSON.stringify(e, null, 2));
}
function Mu() {
  $.handle("get-instances", async () => {
    const i = W();
    return q.isEncryptionAvailable() ? i.map((o) => {
      if (o.encryptedToken)
        try {
          const c = Buffer.from(o.encryptedToken, "base64");
          o.token = q.decryptString(c);
        } catch (c) {
          console.error("Failed to decrypt token", c), o.token = "";
        }
      return o;
    }) : i;
  }), $.handle("save-instance", async (i, o) => {
    const c = W();
    if (o.token && q.isEncryptionAvailable()) {
      const p = q.encryptString(o.token);
      o.encryptedToken = p.toString("base64"), delete o.token;
    } else o.token && console.warn("SafeStorage not available, saving token in plain text");
    const l = c.findIndex((p) => p.id === o.id);
    return l >= 0 ? c[l] = { ...c[l], ...o } : (o.id || (o.id = Date.now().toString()), c.push(o)), nt(c), !0;
  }), $.handle("delete-instance", async (i, o) => {
    let c = W();
    return c = c.filter((l) => l.id !== o), nt(c), !0;
  });
  function e(i) {
    if (i.customSchemaPath)
      return i.customSchemaPath;
    const o = i.name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    return I.join(te.getPath("userData"), o);
  }
  $.handle("pull-instance", async (i, o) => {
    const l = W().find((h) => h.id === o);
    if (!l) throw new Error("Instance not found");
    let p = l.token;
    l.encryptedToken && q.isEncryptionAvailable() && (p = q.decryptString(Buffer.from(l.encryptedToken, "base64")));
    const f = e(l);
    A.existsSync(f) || A.mkdirSync(f, { recursive: !0 });
    const u = `module.exports = {
  directusUrl: '${l.url}',
  directusToken: '${p}',
  dumpPath: './'
};`;
    A.writeFileSync(I.join(f, "directus-sync.config.js"), u);
    const { exec: a } = await import("child_process");
    return new Promise((h, b) => {
      a("npx directus-sync pull", { cwd: f }, (k, C, S) => {
        if (k)
          b(new Error(S || k.message));
        else {
          const M = C.includes("Done!");
          h({ success: M, output: C });
        }
      });
    });
  }), $.handle("push-instance", async (i, o, c) => {
    const l = W(), p = l.find((k) => k.id === o), f = l.find((k) => k.id === c);
    if (!p) throw new Error("Source instance not found");
    if (!f) throw new Error("Destination instance not found");
    let u = f.token;
    f.encryptedToken && q.isEncryptionAvailable() && (u = q.decryptString(Buffer.from(f.encryptedToken, "base64")));
    const a = e(p);
    if (!A.existsSync(a)) throw new Error("Source instance has not been pulled yet");
    const h = `module.exports = {
  directusUrl: '${f.url}',
  directusToken: '${u}',
  dumpPath: './'
};`;
    A.writeFileSync(I.join(a, "directus-sync.config.js"), h);
    const { exec: b } = await import("child_process");
    return new Promise((k, C) => {
      b("npx directus-sync push", { cwd: a }, (S, M, J) => {
        S ? C(new Error(J || S.message)) : k({ success: !0, output: M });
      });
    });
  }), $.handle("open-folder", async (i, o) => {
    const l = W().find((f) => f.id === o);
    if (!l) throw new Error("Instance not found");
    const p = e(l);
    return A.existsSync(p) || A.mkdirSync(p, { recursive: !0 }), await ai.openPath(p), !0;
  }), $.handle("select-schema-folder", async () => (await ui.showOpenDialog(K, {
    properties: ["openDirectory", "createDirectory"]
  })).filePaths[0] || null);
  function t(i) {
    const o = e(i);
    return A.existsSync(o) || A.mkdirSync(o, { recursive: !0 }), rt(o);
  }
  function r(i) {
    return i.encryptedGitToken && q.isEncryptionAvailable() ? q.decryptString(Buffer.from(i.encryptedGitToken, "base64")) : i.gitToken || "";
  }
  function n(i, o) {
    if (!o) return i;
    const c = new URL(i);
    return c.username = o, c.toString();
  }
  function s(i) {
    let o = i;
    const c = I.parse(o).root;
    for (; o !== c; ) {
      const p = I.join(o, ".git");
      if (A.existsSync(p))
        return o;
      o = I.dirname(o);
    }
    const l = I.join(c, ".git");
    return A.existsSync(l) ? c : null;
  }
  $.handle("git-status", async (i, o) => {
    var a;
    const l = W().find((h) => h.id === o);
    if (!l) throw new Error("Instance not found");
    const p = e(l);
    if (!A.existsSync(p))
      return { initialized: !1, hasRemote: !1, changesCount: 0 };
    const f = s(p);
    if (!f)
      return { initialized: !1, hasRemote: !1, changesCount: 0 };
    const u = rt(f);
    try {
      const b = (await u.getRemotes(!0)).find((M) => M.name === "origin"), C = (await u.status()).files.length, S = await u.branch();
      return {
        initialized: !0,
        hasRemote: !!b,
        remoteUrl: ((a = b == null ? void 0 : b.refs) == null ? void 0 : a.fetch) || l.gitRemoteUrl || "",
        currentBranch: S.current || "main",
        changesCount: C,
        gitRoot: f !== p ? f : void 0
        // Include if git root is a parent
      };
    } catch (h) {
      return console.error("Git status error:", h), { initialized: !1, hasRemote: !1, changesCount: 0 };
    }
  }), $.handle("git-init", async (i, o) => {
    const l = W().find((a) => a.id === o);
    if (!l) throw new Error("Instance not found");
    const p = e(l);
    A.existsSync(p) || A.mkdirSync(p, { recursive: !0 });
    const f = s(p);
    if (f)
      return {
        success: !0,
        alreadyExists: !0,
        gitRoot: f
      };
    const u = rt(p);
    await u.init();
    try {
      await u.log();
    } catch {
      const a = I.join(p, ".gitignore");
      A.existsSync(a) || A.writeFileSync(a, `node_modules/
.DS_Store
`), await u.add(".gitignore"), await u.commit("Initial commit");
    }
    return { success: !0, alreadyExists: !1 };
  }), $.handle("git-set-remote", async (i, o, c, l) => {
    const p = W(), f = p.findIndex((k) => k.id === o);
    if (f < 0) throw new Error("Instance not found");
    const u = p[f], a = t(u);
    l && q.isEncryptionAvailable() ? u.encryptedGitToken = q.encryptString(l).toString("base64") : l && (u.gitToken = l), u.gitRemoteUrl = c, p[f] = u, nt(p);
    const h = n(c, l);
    return (await a.getRemotes()).find((k) => k.name === "origin") ? await a.remote(["set-url", "origin", h]) : await a.addRemote("origin", h), { success: !0 };
  }), $.handle("git-pull", async (i, o) => {
    const l = W().find((u) => u.id === o);
    if (!l) throw new Error("Instance not found");
    const p = t(l), f = r(l);
    if (l.gitRemoteUrl && f) {
      const u = n(l.gitRemoteUrl, f);
      await p.remote(["set-url", "origin", u]);
    }
    try {
      const a = (await p.branch()).current || "main", h = await p.pull("origin", a);
      return { success: !0, output: JSON.stringify(h) };
    } catch (u) {
      throw new Error(u.message || "Git pull failed");
    }
  }), $.handle("git-push", async (i, o, c) => {
    const p = W().find((a) => a.id === o);
    if (!p) throw new Error("Instance not found");
    const f = t(p), u = r(p);
    if (p.gitRemoteUrl && u) {
      const a = n(p.gitRemoteUrl, u);
      await f.remote(["set-url", "origin", a]);
    }
    try {
      if (await f.add("."), (await f.status()).files.length > 0) {
        const k = c || `Update: ${(/* @__PURE__ */ new Date()).toISOString()}`;
        await f.commit(k);
      }
      const b = (await f.branch()).current || "main";
      return await f.push("origin", b, ["--set-upstream"]), { success: !0, output: "Push completed successfully" };
    } catch (a) {
      throw new Error(a.message || "Git push failed");
    }
  });
}
function Gs() {
  K = new Pr({
    icon: I.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: I.join(Bs, "preload.mjs")
    }
  }), K.webContents.on("did-finish-load", () => {
    K == null || K.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), bt ? K.loadURL(bt) : K.loadFile(I.join(Ns, "index.html"));
}
te.on("window-all-closed", () => {
  process.platform !== "darwin" && (te.quit(), K = null);
});
te.on("activate", () => {
  Pr.getAllWindows().length === 0 && Gs();
});
te.whenReady().then(() => {
  Mu(), Gs();
});
export {
  Wu as MAIN_DIST,
  Ns as RENDERER_DIST,
  bt as VITE_DEV_SERVER_URL
};
