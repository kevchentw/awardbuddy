// ==UserScript==
// @name         Award Buddy
// @namespace    https://github.com/kevchentw/awardbuddy
// @version      1.6.0
// @description  Award flight and hotel search across many dates at once — Alaska Airlines, LifeMiles, Cathay Pacific, EVA Air, Flying Blue, Starlux Airlines, Japan Airlines, ANA, Air Canada, American Airlines, IHG, Marriott, Hilton, Hyatt, Choice & I Prefer hotels
// @homepageURL  https://github.com/kevchentw/awardbuddy
// @supportURL   https://github.com/kevchentw/awardbuddy/issues
// @updateURL    https://raw.githubusercontent.com/kevchentw/awardbuddy/main/dist/award-buddy.user.js
// @downloadURL  https://raw.githubusercontent.com/kevchentw/awardbuddy/main/dist/award-buddy.user.js
// @match        https://www.alaskaair.com/*
// @match        https://www.lifemiles.com/*
// @match        https://www.cathaypacific.com/*
// @match        https://book.cathaypacific.com/*
// @match        https://*.evaair.com/*
// @match        https://wwws.airfrance.us/*
// @match        https://www.klm.com/*
// @match        https://www.starlux-airlines.com/*
// @match        https://*.jal.co.jp/*
// @match        https://*.ana.co.jp/*
// @match        https://www.aircanada.com/*
// @match        https://www.aa.com/*
// @match        https://www.ihg.com/*
// @match        https://www.marriott.com/*
// @match        https://www.hilton.com/*
// @match        https://www.hyatt.com/*
// @match        https://www.choicehotels.com/*
// @match        https://iprefer.com/*
// @match        https://preferredhotels.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(() => {
  // node_modules/preact/dist/preact.module.js
  var n;
  var l;
  var u;
  var t;
  var i;
  var r;
  var o;
  var e;
  var f;
  var c;
  var a;
  var s;
  var h;
  var p;
  var v;
  var y;
  var d = {};
  var w = [];
  var _ = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
  var g = Array.isArray;
  function m(n2, l3) {
    for (var u4 in l3) n2[u4] = l3[u4];
    return n2;
  }
  function b(n2) {
    n2 && n2.parentNode && n2.parentNode.removeChild(n2);
  }
  function k(l3, u4, t3) {
    var i3, r3, o3, e3 = {};
    for (o3 in u4) "key" == o3 ? i3 = u4[o3] : "ref" == o3 ? r3 = u4[o3] : e3[o3] = u4[o3];
    if (arguments.length > 2 && (e3.children = arguments.length > 3 ? n.call(arguments, 2) : t3), "function" == typeof l3 && null != l3.defaultProps) for (o3 in l3.defaultProps) void 0 === e3[o3] && (e3[o3] = l3.defaultProps[o3]);
    return x(l3, e3, i3, r3, null);
  }
  function x(n2, t3, i3, r3, o3) {
    var e3 = { type: n2, props: t3, key: i3, ref: r3, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: null == o3 ? ++u : o3, __i: -1, __u: 0 };
    return null == o3 && null != l.vnode && l.vnode(e3), e3;
  }
  function S(n2) {
    return n2.children;
  }
  function C(n2, l3) {
    this.props = n2, this.context = l3;
  }
  function $(n2, l3) {
    if (null == l3) return n2.__ ? $(n2.__, n2.__i + 1) : null;
    for (var u4; l3 < n2.__k.length; l3++) if (null != (u4 = n2.__k[l3]) && null != u4.__e) return u4.__e;
    return "function" == typeof n2.type ? $(n2) : null;
  }
  function I(n2) {
    if (n2.__P && n2.__d) {
      var u4 = n2.__v, t3 = u4.__e, i3 = [], r3 = [], o3 = m({}, u4);
      o3.__v = u4.__v + 1, l.vnode && l.vnode(o3), q(n2.__P, o3, u4, n2.__n, n2.__P.namespaceURI, 32 & u4.__u ? [t3] : null, i3, null == t3 ? $(u4) : t3, !!(32 & u4.__u), r3), o3.__v = u4.__v, o3.__.__k[o3.__i] = o3, D(i3, o3, r3), u4.__e = u4.__ = null, o3.__e != t3 && P(o3);
    }
  }
  function P(n2) {
    if (null != (n2 = n2.__) && null != n2.__c) return n2.__e = n2.__c.base = null, n2.__k.some(function(l3) {
      if (null != l3 && null != l3.__e) return n2.__e = n2.__c.base = l3.__e;
    }), P(n2);
  }
  function A(n2) {
    (!n2.__d && (n2.__d = true) && i.push(n2) && !H.__r++ || r != l.debounceRendering) && ((r = l.debounceRendering) || o)(H);
  }
  function H() {
    try {
      for (var n2, l3 = 1; i.length; ) i.length > l3 && i.sort(e), n2 = i.shift(), l3 = i.length, I(n2);
    } finally {
      i.length = H.__r = 0;
    }
  }
  function L(n2, l3, u4, t3, i3, r3, o3, e3, f4, c3, a3) {
    var s3, h3, p3, v3, y3, _3, g2 = t3 && t3.__k || w, m3 = l3.length;
    for (f4 = T(u4, l3, g2, f4, m3), s3 = 0; s3 < m3; s3++) null != (p3 = u4.__k[s3]) && (h3 = -1 != p3.__i && g2[p3.__i] || d, p3.__i = s3, _3 = q(n2, p3, h3, i3, r3, o3, e3, f4, c3, a3), v3 = p3.__e, p3.ref && h3.ref != p3.ref && (h3.ref && J(h3.ref, null, p3), a3.push(p3.ref, p3.__c || v3, p3)), null == y3 && null != v3 && (y3 = v3), 4 & p3.__u ? (f4 = j(p3, f4, n2), h3.__e && (h3.__e = null)) : "function" == typeof p3.type && void 0 !== _3 ? f4 = _3 : v3 && (f4 = v3.nextSibling), p3.__u &= -7);
    return u4.__e = y3, f4;
  }
  function T(n2, l3, u4, t3, i3) {
    var r3, o3, e3, f4, c3, a3 = u4.length, s3 = a3, h3 = 0;
    for (n2.__k = new Array(i3), r3 = 0; r3 < i3; r3++) null != (o3 = l3[r3]) && "boolean" != typeof o3 && "function" != typeof o3 ? ("string" == typeof o3 || "number" == typeof o3 || "bigint" == typeof o3 || o3.constructor == String ? o3 = n2.__k[r3] = x(null, o3, null, null, null) : g(o3) ? o3 = n2.__k[r3] = x(S, { children: o3 }, null, null, null) : void 0 === o3.constructor && o3.__b > 0 ? o3 = n2.__k[r3] = x(o3.type, o3.props, o3.key, o3.ref ? o3.ref : null, o3.__v) : n2.__k[r3] = o3, f4 = r3 + h3, o3.__ = n2, o3.__b = n2.__b + 1, e3 = null, -1 != (c3 = o3.__i = O(o3, u4, f4, s3)) && (s3--, (e3 = u4[c3]) && (e3.__u |= 2)), null == e3 || null == e3.__v ? (-1 == c3 && (i3 > a3 ? h3-- : i3 < a3 && h3++), "function" != typeof o3.type && (o3.__u |= 4)) : c3 != f4 && (c3 == f4 - 1 ? h3-- : c3 == f4 + 1 ? h3++ : (c3 > f4 ? h3-- : h3++, o3.__u |= 4))) : n2.__k[r3] = null;
    if (s3) for (r3 = 0; r3 < a3; r3++) null != (e3 = u4[r3]) && 0 == (2 & e3.__u) && (e3.__e == t3 && (t3 = $(e3)), K(e3, e3));
    return t3;
  }
  function j(n2, l3, u4) {
    var t3, i3;
    if ("function" == typeof n2.type) {
      for (t3 = n2.__k, i3 = 0; t3 && i3 < t3.length; i3++) t3[i3] && (t3[i3].__ = n2, l3 = j(t3[i3], l3, u4));
      return l3;
    }
    n2.__e != l3 && (l3 && n2.type && !l3.parentNode && (l3 = $(n2)), l3 = u4.insertBefore(n2.__e, l3 || null));
    do {
      l3 = l3 && l3.nextSibling;
    } while (null != l3 && 8 == l3.nodeType);
    return l3;
  }
  function O(n2, l3, u4, t3) {
    var i3, r3, o3, e3 = n2.key, f4 = n2.type, c3 = l3[u4], a3 = null != c3 && 0 == (2 & c3.__u);
    if (null === c3 && null == e3 || a3 && e3 == c3.key && f4 == c3.type) return u4;
    if (t3 > (a3 ? 1 : 0)) {
      for (i3 = u4 - 1, r3 = u4 + 1; i3 >= 0 || r3 < l3.length; ) if (null != (c3 = l3[o3 = i3 >= 0 ? i3-- : r3++]) && 0 == (2 & c3.__u) && e3 == c3.key && f4 == c3.type) return o3;
    }
    return -1;
  }
  function z(n2, l3, u4) {
    "-" == l3[0] ? n2.setProperty(l3, null == u4 ? "" : u4) : n2[l3] = null == u4 ? "" : "number" != typeof u4 || _.test(l3) ? u4 : u4 + "px";
  }
  function N(n2, l3, u4, t3, i3) {
    var r3, o3;
    n: if ("style" == l3) if ("string" == typeof u4) n2.style.cssText = u4;
    else {
      if ("string" == typeof t3 && (n2.style.cssText = t3 = ""), t3) for (l3 in t3) u4 && l3 in u4 || z(n2.style, l3, "");
      if (u4) for (l3 in u4) t3 && u4[l3] == t3[l3] || z(n2.style, l3, u4[l3]);
    }
    else if ("o" == l3[0] && "n" == l3[1]) r3 = l3 != (l3 = l3.replace(s, "$1")), o3 = l3.toLowerCase(), l3 = o3 in n2 || "onFocusOut" == l3 || "onFocusIn" == l3 ? o3.slice(2) : l3.slice(2), n2.l || (n2.l = {}), n2.l[l3 + r3] = u4, u4 ? t3 ? u4[a] = t3[a] : (u4[a] = h, n2.addEventListener(l3, r3 ? v : p, r3)) : n2.removeEventListener(l3, r3 ? v : p, r3);
    else {
      if ("http://www.w3.org/2000/svg" == i3) l3 = l3.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
      else if ("width" != l3 && "height" != l3 && "href" != l3 && "list" != l3 && "form" != l3 && "tabIndex" != l3 && "download" != l3 && "rowSpan" != l3 && "colSpan" != l3 && "role" != l3 && "popover" != l3 && l3 in n2) try {
        n2[l3] = null == u4 ? "" : u4;
        break n;
      } catch (n3) {
      }
      "function" == typeof u4 || (null == u4 || false === u4 && "-" != l3[4] ? n2.removeAttribute(l3) : n2.setAttribute(l3, "popover" == l3 && 1 == u4 ? "" : u4));
    }
  }
  function V(n2) {
    return function(u4) {
      if (this.l) {
        var t3 = this.l[u4.type + n2];
        if (null == u4[c]) u4[c] = h++;
        else if (u4[c] < t3[a]) return;
        return t3(l.event ? l.event(u4) : u4);
      }
    };
  }
  function q(n2, u4, t3, i3, r3, o3, e3, f4, c3, a3) {
    var s3, h3, p3, v3, y3, d3, _3, k5, x2, M, I2, P2, A3, H2, T3, j3, F = u4.type;
    if (void 0 !== u4.constructor) return null;
    128 & t3.__u && (c3 = !!(32 & t3.__u), o3 = [f4 = u4.__e = t3.__e]), (s3 = l.__b) && s3(u4);
    n: if ("function" == typeof F) {
      h3 = e3.length;
      try {
        if (x2 = u4.props, M = F.prototype && F.prototype.render, I2 = (s3 = F.contextType) && i3[s3.__c], P2 = s3 ? I2 ? I2.props.value : s3.__ : i3, t3.__c ? k5 = (p3 = u4.__c = t3.__c).__ = p3.__E : (M ? u4.__c = p3 = new F(x2, P2) : (u4.__c = p3 = new C(x2, P2), p3.constructor = F, p3.render = Q), I2 && I2.sub(p3), p3.state || (p3.state = {}), p3.__n = i3, v3 = p3.__d = true, p3.__h = [], p3._sb = []), M && null == p3.__s && (p3.__s = p3.state), M && null != F.getDerivedStateFromProps && (p3.__s == p3.state && (p3.__s = m({}, p3.__s)), m(p3.__s, F.getDerivedStateFromProps(x2, p3.__s))), y3 = p3.props, d3 = p3.state, p3.__v = u4, v3) M && null == F.getDerivedStateFromProps && null != p3.componentWillMount && p3.componentWillMount(), M && null != p3.componentDidMount && p3.__h.push(p3.componentDidMount);
        else {
          if (M && null == F.getDerivedStateFromProps && x2 !== y3 && null != p3.componentWillReceiveProps && p3.componentWillReceiveProps(x2, P2), u4.__v == t3.__v || !p3.__e && null != p3.shouldComponentUpdate && false === p3.shouldComponentUpdate(x2, p3.__s, P2)) {
            u4.__v != t3.__v && (p3.props = x2, p3.state = p3.__s, p3.__d = false), u4.__e = t3.__e, u4.__k = t3.__k, u4.__k.some(function(n3) {
              n3 && (n3.__ = u4);
            }), w.push.apply(p3.__h, p3._sb), p3._sb = [], p3.__h.length && e3.push(p3), f4 = $(t3);
            break n;
          }
          null != p3.componentWillUpdate && p3.componentWillUpdate(x2, p3.__s, P2), M && null != p3.componentDidUpdate && p3.__h.push(function() {
            p3.componentDidUpdate(y3, d3, _3);
          });
        }
        if (p3.context = P2, p3.props = x2, p3.__P = n2, p3.__e = false, A3 = l.__r, H2 = 0, M) p3.state = p3.__s, p3.__d = false, A3 && A3(u4), s3 = p3.render(p3.props, p3.state, p3.context), w.push.apply(p3.__h, p3._sb), p3._sb = [];
        else do {
          p3.__d = false, A3 && A3(u4), s3 = p3.render(p3.props, p3.state, p3.context), p3.state = p3.__s;
        } while (p3.__d && ++H2 < 25);
        p3.state = p3.__s, null != p3.getChildContext && (i3 = m(m({}, i3), p3.getChildContext())), M && !v3 && null != p3.getSnapshotBeforeUpdate && (_3 = p3.getSnapshotBeforeUpdate(y3, d3)), T3 = null != s3 && s3.type === S && null == s3.key ? E(s3.props.children) : s3, f4 = L(n2, g(T3) ? T3 : [T3], u4, t3, i3, r3, o3, e3, f4, c3, a3), p3.base = u4.__e, u4.__u &= -161, p3.__h.length && e3.push(p3), k5 && (p3.__E = p3.__ = null);
      } catch (n3) {
        if (e3.length = h3, u4.__v = null, c3 || null != o3) {
          if (n3.then) {
            for (u4.__u |= c3 ? 160 : 128; f4 && 8 == f4.nodeType && f4.nextSibling; ) f4 = f4.nextSibling;
            null != o3 && (o3[o3.indexOf(f4)] = null), u4.__e = f4;
          } else if (null != o3) for (j3 = o3.length; j3--; ) b(o3[j3]);
        } else u4.__e = t3.__e;
        null == u4.__k && (u4.__k = t3.__k || []), n3.then || B(u4), l.__e(n3, u4, t3);
      }
    } else null == o3 && u4.__v == t3.__v ? (u4.__k = t3.__k, u4.__e = t3.__e) : f4 = u4.__e = G(t3.__e, u4, t3, i3, r3, o3, e3, c3, a3);
    return (s3 = l.diffed) && s3(u4), 128 & u4.__u ? void 0 : f4;
  }
  function B(n2) {
    n2 && (n2.__c && (n2.__c.__e = true), n2.__k && n2.__k.some(B));
  }
  function D(n2, u4, t3) {
    for (var i3 = 0; i3 < t3.length; i3++) J(t3[i3], t3[++i3], t3[++i3]);
    l.__c && l.__c(u4, n2), n2.some(function(u5) {
      try {
        n2 = u5.__h, u5.__h = [], n2.some(function(n3) {
          n3.call(u5);
        });
      } catch (n3) {
        l.__e(n3, u5.__v);
      }
    });
  }
  function E(n2) {
    return "object" != typeof n2 || null == n2 || n2.__b > 0 ? n2 : g(n2) ? n2.map(E) : void 0 !== n2.constructor ? null : m({}, n2);
  }
  function G(u4, t3, i3, r3, o3, e3, f4, c3, a3) {
    var s3, h3, p3, v3, y3, w3, _3, m3 = i3.props || d, k5 = t3.props, x2 = t3.type;
    if ("svg" == x2 ? o3 = "http://www.w3.org/2000/svg" : "math" == x2 ? o3 = "http://www.w3.org/1998/Math/MathML" : o3 || (o3 = "http://www.w3.org/1999/xhtml"), null != e3) {
      for (s3 = 0; s3 < e3.length; s3++) if ((y3 = e3[s3]) && "setAttribute" in y3 == !!x2 && (x2 ? y3.localName == x2 : 3 == y3.nodeType)) {
        u4 = y3, e3[s3] = null;
        break;
      }
    }
    if (null == u4) {
      if (null == x2) return document.createTextNode(k5);
      u4 = document.createElementNS(o3, x2, k5.is && k5), c3 && (l.__m && l.__m(t3, e3), c3 = false), e3 = null;
    }
    if (null == x2) m3 === k5 || c3 && u4.data == k5 || (u4.data = k5);
    else {
      if (e3 = "textarea" == x2 && null != k5.defaultValue ? null : e3 && n.call(u4.childNodes), !c3 && null != e3) for (m3 = {}, s3 = 0; s3 < u4.attributes.length; s3++) m3[(y3 = u4.attributes[s3]).name] = y3.value;
      for (s3 in m3) y3 = m3[s3], "dangerouslySetInnerHTML" == s3 ? p3 = y3 : "children" == s3 || s3 in k5 || "value" == s3 && "defaultValue" in k5 || "checked" == s3 && "defaultChecked" in k5 || N(u4, s3, null, y3, o3);
      for (s3 in k5) y3 = k5[s3], "children" == s3 ? v3 = y3 : "dangerouslySetInnerHTML" == s3 ? h3 = y3 : "value" == s3 ? w3 = y3 : "checked" == s3 ? _3 = y3 : c3 && "function" != typeof y3 || m3[s3] === y3 || N(u4, s3, y3, m3[s3], o3);
      if (h3) c3 || p3 && (h3.__html == p3.__html || h3.__html == u4.innerHTML) || (u4.innerHTML = h3.__html), t3.__k = [];
      else if (p3 && (u4.innerHTML = ""), L("template" == t3.type ? u4.content : u4, g(v3) ? v3 : [v3], t3, i3, r3, "foreignObject" == x2 ? "http://www.w3.org/1999/xhtml" : o3, e3, f4, e3 ? e3[0] : i3.__k && $(i3, 0), c3, a3), null != e3) for (s3 = e3.length; s3--; ) b(e3[s3]);
      c3 && "textarea" != x2 || (s3 = "value", "progress" == x2 && null == w3 ? u4.removeAttribute("value") : null != w3 && (w3 !== u4[s3] || "progress" == x2 && !w3 || "option" == x2 && w3 != m3[s3]) && N(u4, s3, w3, m3[s3], o3), s3 = "checked", null != _3 && _3 != u4[s3] && N(u4, s3, _3, m3[s3], o3));
    }
    return u4;
  }
  function J(n2, u4, t3) {
    try {
      if ("function" == typeof n2) {
        var i3 = "function" == typeof n2.__u;
        i3 && n2.__u(), i3 && null == u4 || (n2.__u = n2(u4));
      } else n2.current = u4;
    } catch (n3) {
      l.__e(n3, t3);
    }
  }
  function K(n2, u4, t3) {
    var i3, r3;
    if (l.unmount && l.unmount(n2), (i3 = n2.ref) && (i3.current && i3.current != n2.__e || J(i3, null, u4)), null != (i3 = n2.__c)) {
      if (i3.componentWillUnmount) try {
        i3.componentWillUnmount();
      } catch (n3) {
        l.__e(n3, u4);
      }
      i3.base = i3.__P = i3.__n = null;
    }
    if (i3 = n2.__k) for (r3 = 0; r3 < i3.length; r3++) i3[r3] && K(i3[r3], u4, t3 || "function" != typeof n2.type);
    t3 || b(n2.__e), n2.__c = n2.__ = n2.__e = void 0;
  }
  function Q(n2, l3, u4) {
    return this.constructor(n2, u4);
  }
  function R(u4, t3, i3) {
    var r3, o3, e3, f4;
    t3 == document && (t3 = document.documentElement), l.__ && l.__(u4, t3), o3 = (r3 = "function" == typeof i3) ? null : i3 && i3.__k || t3.__k, e3 = [], f4 = [], q(t3, u4 = (!r3 && i3 || t3).__k = k(S, null, [u4]), o3 || d, d, t3.namespaceURI, !r3 && i3 ? [i3] : o3 ? null : t3.firstChild ? n.call(t3.childNodes) : null, e3, !r3 && i3 ? i3 : o3 ? o3.__e : t3.firstChild, r3, f4), D(e3, u4, f4), u4.props.children = null;
  }
  n = w.slice, l = { __e: function(n2, l3, u4, t3) {
    for (var i3, r3, o3; l3 = l3.__; ) if ((i3 = l3.__c) && !i3.__) try {
      if ((r3 = i3.constructor) && null != r3.getDerivedStateFromError && (i3.setState(r3.getDerivedStateFromError(n2)), o3 = i3.__d), null != i3.componentDidCatch && (i3.componentDidCatch(n2, t3 || {}), o3 = i3.__d), o3) return i3.__E = i3;
    } catch (l4) {
      n2 = l4;
    }
    throw n2;
  } }, u = 0, t = function(n2) {
    return null != n2 && void 0 === n2.constructor;
  }, C.prototype.setState = function(n2, l3) {
    var u4;
    u4 = null != this.__s && this.__s != this.state ? this.__s : this.__s = m({}, this.state), "function" == typeof n2 && (n2 = n2(m({}, u4), this.props)), n2 && m(u4, n2), null != n2 && this.__v && (l3 && this._sb.push(l3), A(this));
  }, C.prototype.forceUpdate = function(n2) {
    this.__v && (this.__e = true, n2 && this.__h.push(n2), A(this));
  }, C.prototype.render = S, i = [], o = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, e = function(n2, l3) {
    return n2.__v.__b - l3.__v.__b;
  }, H.__r = 0, f = Math.random().toString(8), c = "__d" + f, a = "__a" + f, s = /(PointerCapture)$|Capture$/i, h = 0, p = V(false), v = V(true), y = 0;

  // node_modules/preact/hooks/dist/hooks.module.js
  var t2;
  var r2;
  var u2;
  var i2;
  var o2 = 0;
  var f2 = [];
  var c2 = l;
  var e2 = c2.__b;
  var a2 = c2.__r;
  var v2 = c2.diffed;
  var l2 = c2.__c;
  var m2 = c2.unmount;
  var p2 = c2.__;
  function s2(n2, t3) {
    c2.__h && c2.__h(r2, n2, o2 || t3), o2 = 0;
    var u4 = r2.__H || (r2.__H = { __: [], __h: [] });
    return n2 >= u4.__.length && u4.__.push({}), u4.__[n2];
  }
  function d2(n2) {
    return o2 = 1, y2(D2, n2);
  }
  function y2(n2, u4, i3) {
    var o3 = s2(t2++, 2);
    if (o3.t = n2, !o3.__c && (o3.__ = [i3 ? i3(u4) : D2(void 0, u4), function(n3) {
      var t3 = o3.__N ? o3.__N[0] : o3.__[0], r3 = o3.t(t3, n3);
      t3 !== r3 && (o3.__N = [r3, o3.__[1]], o3.__c.setState({}));
    }], o3.__c = r2, !r2.__f)) {
      var f4 = function(n3, t3, r3) {
        if (!o3.__c.__H) return true;
        var u5 = false, i4 = o3.__c.props !== n3;
        if (o3.__c.__H.__.some(function(n4) {
          if (n4.__N) {
            u5 = true;
            var t4 = n4.__[0];
            n4.__ = n4.__N, n4.__N = void 0, t4 !== n4.__[0] && (i4 = true);
          }
        }), c3) {
          var f5 = c3.call(this, n3, t3, r3);
          return u5 ? f5 || i4 : f5;
        }
        return !u5 || i4;
      };
      r2.__f = true;
      var c3 = r2.shouldComponentUpdate, e3 = r2.componentWillUpdate;
      r2.componentWillUpdate = function(n3, t3, r3) {
        if (this.__e) {
          var u5 = c3;
          c3 = void 0, f4(n3, t3, r3), c3 = u5;
        }
        e3 && e3.call(this, n3, t3, r3);
      }, r2.shouldComponentUpdate = f4;
    }
    return o3.__N || o3.__;
  }
  function h2(n2, u4) {
    var i3 = s2(t2++, 3);
    !c2.__s && C2(i3.__H, u4) && (i3.__ = n2, i3.u = u4, r2.__H.__h.push(i3));
  }
  function _2(n2, u4) {
    var i3 = s2(t2++, 4);
    !c2.__s && C2(i3.__H, u4) && (i3.__ = n2, i3.u = u4, r2.__h.push(i3));
  }
  function A2(n2) {
    return o2 = 5, T2(function() {
      return { current: n2 };
    }, []);
  }
  function T2(n2, r3) {
    var u4 = s2(t2++, 7);
    return C2(u4.__H, r3) && (u4.__ = n2(), u4.__H = r3, u4.__h = n2), u4.__;
  }
  function j2() {
    for (var n2; n2 = f2.shift(); ) {
      var t3 = n2.__H;
      if (n2.__P && t3) try {
        t3.__h.some(z2), t3.__h.some(B2), t3.__h = [];
      } catch (r3) {
        t3.__h = [], c2.__e(r3, n2.__v);
      }
    }
  }
  c2.__b = function(n2) {
    r2 = null, e2 && e2(n2);
  }, c2.__ = function(n2, t3) {
    n2 && t3.__k && t3.__k.__m && (n2.__m = t3.__k.__m), p2 && p2(n2, t3);
  }, c2.__r = function(n2) {
    a2 && a2(n2), t2 = 0;
    var i3 = (r2 = n2.__c).__H;
    i3 && (u2 === r2 ? (i3.__h = [], r2.__h = [], i3.__.some(function(n3) {
      n3.__N && (n3.__ = n3.__N), n3.u = n3.__N = void 0;
    })) : (i3.__h.some(z2), i3.__h.some(B2), i3.__h = [], t2 = 0)), u2 = r2;
  }, c2.diffed = function(n2) {
    v2 && v2(n2);
    var t3 = n2.__c;
    t3 && t3.__H && (t3.__H.__h.length && (1 !== f2.push(t3) && i2 === c2.requestAnimationFrame || ((i2 = c2.requestAnimationFrame) || w2)(j2)), t3.__H.__.some(function(n3) {
      n3.u && (n3.__H = n3.u, n3.u = void 0);
    })), u2 = r2 = null;
  }, c2.__c = function(n2, t3) {
    t3.some(function(n3) {
      try {
        n3.__h.some(z2), n3.__h = n3.__h.filter(function(n4) {
          return !n4.__ || B2(n4);
        });
      } catch (r3) {
        t3.some(function(n4) {
          n4.__h && (n4.__h = []);
        }), t3 = [], c2.__e(r3, n3.__v);
      }
    }), l2 && l2(n2, t3);
  }, c2.unmount = function(n2) {
    m2 && m2(n2);
    var t3, r3 = n2.__c;
    r3 && r3.__H && (r3.__H.__.some(function(n3) {
      try {
        z2(n3);
      } catch (n4) {
        t3 = n4;
      }
    }), r3.__H = void 0, t3 && c2.__e(t3, r3.__v));
  };
  var k2 = "function" == typeof requestAnimationFrame;
  function w2(n2) {
    var t3, r3 = function() {
      clearTimeout(u4), k2 && cancelAnimationFrame(t3), setTimeout(n2);
    }, u4 = setTimeout(r3, 35);
    k2 && (t3 = requestAnimationFrame(r3));
  }
  function z2(n2) {
    var t3 = r2, u4 = n2.__c;
    "function" == typeof u4 && (n2.__c = void 0, u4()), r2 = t3;
  }
  function B2(n2) {
    var t3 = r2;
    n2.__c = n2.__(), r2 = t3;
  }
  function C2(n2, t3) {
    return !n2 || n2.length !== t3.length || t3.some(function(t4, r3) {
      return t4 !== n2[r3];
    });
  }
  function D2(n2, t3) {
    return "function" == typeof t3 ? t3(n2) : t3;
  }

  // src/common/constants.js
  var CABIN_LABELS = { F: "First", J: "Business", N: "Prem Eco", Y: "Economy" };
  var CABIN_COLORS = { F: "#7c3aed", J: "#0369a1", N: "#059669", Y: "#374151" };
  var CABIN_ORDER = ["F", "J", "N", "Y"];
  var CONCURRENCY = 2;
  var COMMON_AIRPORTS = [
    // ── Asia ──
    { code: "AAC", name: "El Arish" },
    { code: "AAN", name: "Al Ain" },
    { code: "ABA", name: "Abakan" },
    { code: "ABD", name: "Abadan" },
    { code: "ADB", name: "Gaziemir" },
    { code: "ADE", name: "Aden" },
    { code: "ADJ", name: "Amman" },
    { code: "AHB", name: "Abha" },
    { code: "AJF", name: "Al-Jawf" },
    { code: "AKX", name: "Aktobe" },
    { code: "ALA", name: "Almaty" },
    { code: "ALP", name: "Aleppo" },
    { code: "AMD", name: "Ahmedabad" },
    { code: "AMM", name: "Amman" },
    { code: "AMQ", name: "Ambon" },
    { code: "AOE", name: "Eski\u015Fehir" },
    { code: "AOJ", name: "Aomori" },
    { code: "AQI", name: "Qaisumah" },
    { code: "AQJ", name: "Aqaba" },
    { code: "ASB", name: "Ashgabat" },
    { code: "ASF", name: "Astrakhan" },
    { code: "ASR", name: "Kayseri" },
    { code: "ATQ", name: "Amritsar" },
    { code: "AUH", name: "Abu Dhabi" },
    { code: "AWZ", name: "Ahvaz" },
    { code: "AYT", name: "Antalya" },
    { code: "AZI", name: "Abu Dhabi" },
    { code: "BAH", name: "Manama" },
    { code: "BAV", name: "Baotou" },
    { code: "BAX", name: "Barnaul" },
    { code: "BBI", name: "Bhubaneswar" },
    { code: "BCD", name: "Bacolod City" },
    { code: "BDJ", name: "Banjarbaru" },
    { code: "BDQ", name: "Vadodara" },
    { code: "BEY", name: "Beirut" },
    { code: "BGW", name: "Baghdad" },
    { code: "BHK", name: "Bukhara" },
    { code: "BHO", name: "Bhopal" },
    { code: "BJV", name: "Bodrum" },
    { code: "BKI", name: "Kota Kinabalu" },
    { code: "BKK", name: "Bangkok (Suvarnabhumi)" },
    { code: "BLR", name: "Bengaluru" },
    { code: "BND", name: "Bandar Abbas" },
    { code: "BOM", name: "Mumbai" },
    { code: "BPN", name: "Balikpapan" },
    { code: "BSR", name: "Basra" },
    { code: "BSZ", name: "Bishkek" },
    { code: "BTH", name: "Batam" },
    { code: "BTJ", name: "Banda Aceh" },
    { code: "BUS", name: "Batumi" },
    { code: "BWA", name: "Siddharthanagar (Bhairahawa)" },
    { code: "BWN", name: "Bandar Seri Begawan" },
    { code: "BXY", name: "Baikonur" },
    { code: "CAN", name: "Guangzhou" },
    { code: "CCJ", name: "Calicut" },
    { code: "CCK", name: "West Island" },
    { code: "CCU", name: "Kolkata" },
    { code: "CEB", name: "Cebu City/Lapu-Lapu City" },
    { code: "CEI", name: "Chiang Rai" },
    { code: "CEK", name: "Chelyabinsk" },
    { code: "CGK", name: "Jakarta (Soekarno-Hatta)" },
    { code: "CGO", name: "Zhengzhou" },
    { code: "CGP", name: "Chattogram (Chittagong)" },
    { code: "CGQ", name: "Changchun" },
    { code: "CGY", name: "Laguindingan" },
    { code: "CIT", name: "Shymkent" },
    { code: "CJB", name: "Coimbatore" },
    { code: "CJJ", name: "Cheongju" },
    { code: "CJU", name: "Jeju City" },
    { code: "CKG", name: "Chongqing" },
    { code: "CMB", name: "Colombo" },
    { code: "CNN", name: "Kannur" },
    { code: "CNX", name: "Chiang Mai" },
    { code: "COK", name: "Kochi" },
    { code: "COV", name: "Tarsus" },
    { code: "CRK", name: "Mabalacat" },
    { code: "CRZ", name: "T\xFCrkmenabat" },
    { code: "CSX", name: "Changsha (Changsha)" },
    { code: "CTS", name: "Sapporo (Chitose)" },
    { code: "CTU", name: "Chengdu" },
    { code: "CXR", name: "Nha Trang/nha Trang aiurportCam Ranh" },
    { code: "DAC", name: "Dhaka" },
    { code: "DAD", name: "Da Nang" },
    { code: "DAM", name: "Damascus" },
    { code: "DAT", name: "Datong" },
    { code: "DEL", name: "New Delhi" },
    { code: "DHA", name: "Dhahran" },
    { code: "DIA", name: "Doha" },
    { code: "DIL", name: "Dili" },
    { code: "DJJ", name: "Sentani" },
    { code: "DLC", name: "Dalian (Ganjingzi)" },
    { code: "DLM", name: "Dalaman" },
    { code: "DMB", name: "Taraz" },
    { code: "DMK", name: "Bangkok (Don Mueang)" },
    { code: "DMM", name: "Ad Dammam" },
    { code: "DNA", name: "Okinawa" },
    { code: "DNH", name: "Dunhuang" },
    { code: "DOH", name: "Doha" },
    { code: "DPS", name: "Bali (Denpasar)" },
    { code: "DQM", name: "Duqm" },
    { code: "DRP", name: "Legazpi" },
    { code: "DSN", name: "Ordos" },
    { code: "DSY", name: "Ta Noun" },
    { code: "DVO", name: "Davao" },
    { code: "DWC", name: "Dubai (Al Maktoum)" },
    { code: "DXB", name: "Dubai" },
    { code: "DXN", name: "Gautam Buddha Nagar" },
    { code: "DYG", name: "Zhangjiajie (Yongding)" },
    { code: "DYU", name: "Dushanbe" },
    { code: "DZN", name: "Zhezkazgan" },
    { code: "EBL", name: "Arbil" },
    { code: "ECN", name: "Tymbou (Kirklar)" },
    { code: "EDO", name: "Edremit" },
    { code: "EHU", name: "Ezhou" },
    { code: "ELQ", name: "Qassim" },
    { code: "ESB", name: "Ankara" },
    { code: "ETM", name: "Eilat" },
    { code: "EVN", name: "Yerevan" },
    { code: "FJR", name: "Fujairah" },
    { code: "FNJ", name: "Pyongyang" },
    { code: "FOC", name: "Fuzhou (Changle)" },
    { code: "FSZ", name: "Makinohara / Shimada" },
    { code: "FUK", name: "Fukuoka" },
    { code: "GAN", name: "Gan" },
    { code: "GAU", name: "Guwahati" },
    { code: "GES", name: "General Santos" },
    { code: "GMP", name: "Seoul (Gimpo)" },
    { code: "GNJ", name: "Ganja" },
    { code: "GNY", name: "\u015Eanl\u0131urfa" },
    { code: "GOI", name: "Vasco da Gama" },
    { code: "GOX", name: "Mopa" },
    { code: "GRV", name: "Grozny" },
    { code: "GSM", name: "Qeshm(Dayrestan)" },
    { code: "GSV", name: "Saratov" },
    { code: "GUW", name: "Atyrau" },
    { code: "GWD", name: "Gurandani" },
    { code: "GXF", name: "Seiyun" },
    { code: "GYD", name: "Baku" },
    { code: "GZT", name: "Gaziantep" },
    { code: "HAK", name: "Haikou" },
    { code: "HAN", name: "Hanoi" },
    { code: "HAQ", name: "Haa Dhaalu Atoll" },
    { code: "HAS", name: "Hail" },
    { code: "HDY", name: "Hat Yai" },
    { code: "HEA", name: "Guzara" },
    { code: "HET", name: "Hohhot" },
    { code: "HFE", name: "Hefei" },
    { code: "HGH", name: "Hangzhou" },
    { code: "HIA", name: "Huai'an" },
    { code: "HIJ", name: "Hiroshima" },
    { code: "HKD", name: "Hakodate" },
    { code: "HKG", name: "Hong Kong" },
    { code: "HKT", name: "Phuket" },
    { code: "HLD", name: "Hailar" },
    { code: "HLP", name: "Jakarta" },
    { code: "HND", name: "Tokyo (Haneda)" },
    { code: "HOF", name: "Hofuf" },
    { code: "HPH", name: "Haiphong (Hai An)" },
    { code: "HRB", name: "Harbin" },
    { code: "HSA", name: "Turk\u0131stan" },
    { code: "HSG", name: "Saga" },
    { code: "HSN", name: "Zhoushan" },
    { code: "HSR", name: "Rajkot" },
    { code: "HSS", name: "Hisar" },
    { code: "HTA", name: "Chita" },
    { code: "HUI", name: "Hu\u1EBF" },
    { code: "HUN", name: "Hualien City" },
    { code: "HWR", name: "Halwara" },
    { code: "HYD", name: "Hyderabad" },
    { code: "IBR", name: "Omitama" },
    { code: "ICN", name: "Seoul (Incheon)" },
    { code: "IDR", name: "Indore" },
    { code: "IFN", name: "Isfahan" },
    { code: "IKA", name: "Tehran" },
    { code: "IKT", name: "Irkutsk" },
    { code: "IKU", name: "Tamchy" },
    { code: "ILO", name: "Cabatuan" },
    { code: "IMF", name: "Imphal" },
    { code: "INC", name: "Yinchuan" },
    { code: "IPH", name: "Ipoh" },
    { code: "ISB", name: "Attock" },
    { code: "ISK", name: "Nashik" },
    { code: "ITM", name: "Osaka (Itami)" },
    { code: "IXB", name: "Siliguri" },
    { code: "IXC", name: "Chandigarh" },
    { code: "IXE", name: "Mangaluru" },
    { code: "IXZ", name: "Port Blair" },
    { code: "JAF", name: "Jaffna" },
    { code: "JAI", name: "Jaipur" },
    { code: "JED", name: "Jeddah" },
    { code: "JGN", name: "Jiayuguan" },
    { code: "JHB", name: "Johor Bahru" },
    { code: "JHG", name: "Jinghong (Gasa)" },
    { code: "JJN", name: "Quanzhou" },
    { code: "KBL", name: "Kabul" },
    { code: "KBV", name: "Krabi" },
    { code: "KCH", name: "Kuching" },
    { code: "KCZ", name: "Nankoku" },
    { code: "KDH", name: "Kandahar" },
    { code: "KDU", name: "Skardu" },
    { code: "KEJ", name: "Kemerovo" },
    { code: "KER", name: "Kerman" },
    { code: "KGF", name: "Karaganda" },
    { code: "KGS", name: "Kos Island" },
    { code: "KHG", name: "Kashgar" },
    { code: "KHH", name: "Kaohsiung" },
    { code: "KHI", name: "Karachi" },
    { code: "KHN", name: "Nanchang" },
    { code: "KIH", name: "Kish Island" },
    { code: "KIJ", name: "Niigata" },
    { code: "KIK", name: "Kirkuk" },
    { code: "KIX", name: "Osaka (Kansai)" },
    { code: "KJA", name: "Krasnoyarsk" },
    { code: "KKJ", name: "Kitakyushu" },
    { code: "KLO", name: "Kalibo" },
    { code: "KMG", name: "Kunming" },
    { code: "KMI", name: "Miyazaki" },
    { code: "KMJ", name: "Kumamoto" },
    { code: "KMQ", name: "Kanazawa" },
    { code: "KNO", name: "Beringin" },
    { code: "KOJ", name: "Kagoshima" },
    { code: "KOS", name: "Preah Sihanouk" },
    { code: "KOV", name: "Kokshetau" },
    { code: "KQT", name: "Bokhtar" },
    { code: "KSN", name: "Kostanay" },
    { code: "KTI", name: "Phnom Penh (Boeng Khyang)" },
    { code: "KTM", name: "Kathmandu" },
    { code: "KUL", name: "Kuala Lumpur" },
    { code: "KUT", name: "Kopitnari" },
    { code: "KWE", name: "Guiyang (Nanming)" },
    { code: "KWI", name: "Kuwait City" },
    { code: "KWL", name: "Guilin (Lingui)" },
    { code: "KYA", name: "Konya" },
    { code: "KZN", name: "Kazan" },
    { code: "KZO", name: "Kyzylorda" },
    { code: "LAO", name: "Laoag City" },
    { code: "LBD", name: "Khujand" },
    { code: "LCA", name: "Larnaca" },
    { code: "LGK", name: "Langkawi" },
    { code: "LHE", name: "Lahore" },
    { code: "LHW", name: "Lanzhou (Yongdeng)" },
    { code: "LJG", name: "Lijiang" },
    { code: "LKO", name: "Lucknow" },
    { code: "LOP", name: "Mataram (Pujut, Lombok Tengah)" },
    { code: "LPQ", name: "Luang Phabang" },
    { code: "LTH", name: "Ho Chi Minh City (Long Thanh)" },
    { code: "LWN", name: "Gyumri" },
    { code: "LXA", name: "Shannan (Gonggar)" },
    { code: "LYA", name: "Luoyang (Laocheng)" },
    { code: "LYG", name: "Lianyungang" },
    { code: "LYP", name: "Faisalabad" },
    { code: "MAA", name: "Chennai" },
    { code: "MCT", name: "Muscat/Seeb" },
    { code: "MCX", name: "Makhachkala" },
    { code: "MDC", name: "Manado" },
    { code: "MDL", name: "Mandalay" },
    { code: "MED", name: "Medina" },
    { code: "MFM", name: "Macau" },
    { code: "MHD", name: "Mashhad" },
    { code: "MLE", name: "Mal\xE9" },
    { code: "MNL", name: "Manila" },
    { code: "MQF", name: "Magnitogorsk" },
    { code: "MUX", name: "Multan" },
    { code: "MWX", name: "Muan (Piseo-ri)" },
    { code: "MYJ", name: "Matsuyama" },
    { code: "MZG", name: "Huxi" },
    { code: "MZR", name: "Mazar-i-Sharif" },
    { code: "NAG", name: "Nagpur" },
    { code: "NAJ", name: "Nakhchivan" },
    { code: "NAV", name: "Nev\u015Fehir" },
    { code: "NCU", name: "Nukus" },
    { code: "NDG", name: "Qiqihar" },
    { code: "NGB", name: "Ningbo" },
    { code: "NGO", name: "Nagoya" },
    { code: "NGS", name: "Nagasaki" },
    { code: "NJC", name: "Nizhnevartovsk" },
    { code: "NJF", name: "Najaf" },
    { code: "NKG", name: "Nanjing" },
    { code: "NMA", name: "Namangan" },
    { code: "NMI", name: "Navi Mumbai" },
    { code: "NNG", name: "Nanning (Jiangnan)" },
    { code: "NQZ", name: "Astana" },
    { code: "NRT", name: "Tokyo (Narita)" },
    { code: "NSK", name: "Norilsk" },
    { code: "NUM", name: "Sharma" },
    { code: "NYT", name: "Naypyitaw" },
    { code: "OEC", name: "Oecussi-Ambeno" },
    { code: "OHS", name: "Suhar" },
    { code: "OKA", name: "Okinawa (Naha)" },
    { code: "OKJ", name: "Okayama" },
    { code: "OMS", name: "Omsk" },
    { code: "OSM", name: "Mosul" },
    { code: "OSS", name: "Osh" },
    { code: "PBH", name: "Paro" },
    { code: "PDG", name: "Padang (Katapiang)" },
    { code: "PEE", name: "Perm" },
    { code: "PEK", name: "Beijing (Capital)" },
    { code: "PEN", name: "Penang" },
    { code: "PEW", name: "Peshawar" },
    { code: "PFO", name: "Paphos" },
    { code: "PHH", name: "Pokhara" },
    { code: "PKC", name: "Petropavlovsk-Kamchatsky" },
    { code: "PKX", name: "Beijing (Daxing)" },
    { code: "PKZ", name: "Pakse" },
    { code: "PLX", name: "Semey" },
    { code: "PNH", name: "Phnom Penh (Pou Senchey)" },
    { code: "PNK", name: "Pontianak" },
    { code: "PNQ", name: "Pune" },
    { code: "PPK", name: "Petropavl" },
    { code: "PPS", name: "Puerto Princesa" },
    { code: "PQC", name: "Phu Quoc Island" },
    { code: "PUS", name: "Busan" },
    { code: "PVG", name: "Shanghai (Pudong)" },
    { code: "PWQ", name: "Pavlodar" },
    { code: "PYK", name: "Karaj" },
    { code: "RGN", name: "Yangon" },
    { code: "RHO", name: "Rhodes" },
    { code: "RIY", name: "Mukalla(Riyan)" },
    { code: "RKT", name: "Ras Al Khaimah" },
    { code: "RKZ", name: "Xigaz\xEA (Samzhubz\xEA)" },
    { code: "RML", name: "Colombo" },
    { code: "RMQ", name: "Taichung" },
    { code: "RSI", name: "Hanak" },
    { code: "RUH", name: "Riyadh" },
    { code: "SAG", name: "Kakadi" },
    { code: "SAH", name: "Sanaa" },
    { code: "SAI", name: "Siem Reap" },
    { code: "SAW", name: "Istanbul (Sabiha G\xF6k\xE7en)" },
    { code: "SCO", name: "Aktau" },
    { code: "SDJ", name: "Sendai" },
    { code: "SFS", name: "Olongapo" },
    { code: "SGC", name: "Surgut" },
    { code: "SGN", name: "Ho Chi Minh City" },
    { code: "SHA", name: "Shanghai (Hongqiao)" },
    { code: "SHE", name: "Shenyang" },
    { code: "SHJ", name: "Sharjah" },
    { code: "SIN", name: "Singapore" },
    { code: "SJW", name: "Shijiazhuang" },
    { code: "SKD", name: "Samarkand" },
    { code: "SKT", name: "Sialkot" },
    { code: "SLL", name: "Salalah" },
    { code: "SOC", name: "Surakarta" },
    { code: "SRG", name: "Semarang" },
    { code: "SSH", name: "Sharm El Sheikh" },
    { code: "STV", name: "Surat" },
    { code: "SUB", name: "Surabaya" },
    { code: "SVX", name: "Yekaterinburg" },
    { code: "SWA", name: "Jieyang (Rongcheng)" },
    { code: "SXR", name: "Srinagar" },
    { code: "SYX", name: "Sanya" },
    { code: "SYZ", name: "Shiraz" },
    { code: "SZB", name: "Subang" },
    { code: "SZX", name: "Shenzhen" },
    { code: "TAE", name: "Daegu" },
    { code: "TAG", name: "Panglao" },
    { code: "TAK", name: "Takamatsu" },
    { code: "TAO", name: "Qingdao (Jiaozhou)" },
    { code: "TAS", name: "Tashkent" },
    { code: "TAZ", name: "Da\u015Foguz" },
    { code: "TBS", name: "Tbilisi" },
    { code: "TBZ", name: "Tabriz" },
    { code: "TFU", name: "Chengdu (Jianyang)" },
    { code: "THR", name: "Tehran" },
    { code: "TIF", name: "Taif" },
    { code: "TIR", name: "Tirupati" },
    { code: "TJM", name: "Tyumen" },
    { code: "TJU", name: "Kulob" },
    { code: "TKS", name: "Tokushima" },
    { code: "TLV", name: "Tel Aviv" },
    { code: "TNA", name: "Jinan (Licheng)" },
    { code: "TNN", name: "Tainan (Rende)" },
    { code: "TOF", name: "Tomsk" },
    { code: "TPE", name: "Taipei (Taoyuan)" },
    { code: "TRV", name: "Thiruvananthapuram" },
    { code: "TRZ", name: "Tiruchirappalli" },
    { code: "TSA", name: "Taipei (Songshan)" },
    { code: "TSN", name: "Tianjin" },
    { code: "TUK", name: "Turbat" },
    { code: "TUU", name: "Tabuk" },
    { code: "TXN", name: "Huangshan" },
    { code: "TYN", name: "Taiyuan" },
    { code: "UBN", name: "Ulaanbaatar (Sergelen)" },
    { code: "UET", name: "Quetta" },
    { code: "UGC", name: "Urgench" },
    { code: "UKB", name: "Kobe" },
    { code: "UKK", name: "Ust-Kamenogorsk (Oskemen)" },
    { code: "ULH", name: "Al-Ula" },
    { code: "ULN", name: "Ulaanbaatar" },
    { code: "UPG", name: "Makassar" },
    { code: "URA", name: "Uralsk" },
    { code: "URC", name: "\xDCr\xFCmqi" },
    { code: "USM", name: "Na Thon (Ko Samui Island)" },
    { code: "UTH", name: "Udon Thani" },
    { code: "UTP", name: "Rayong" },
    { code: "UUD", name: "Ulan Ude" },
    { code: "UUS", name: "Yuzhno-Sakhalinsk" },
    { code: "VCA", name: "Can Tho" },
    { code: "VGA", name: "Vijayawada" },
    { code: "VNS", name: "Varanasi" },
    { code: "VTE", name: "Vientiane" },
    { code: "VTZ", name: "Visakhapatnam" },
    { code: "VVO", name: "Artyom" },
    { code: "WNZ", name: "Wenzhou (Longwan)" },
    { code: "WUH", name: "Wuhan" },
    { code: "WUX", name: "Wuxi" },
    { code: "XBJ", name: "Birjand" },
    { code: "XIY", name: "Xi\\'an" },
    { code: "XMN", name: "Xiamen" },
    { code: "XNN", name: "Haidong (Huzhu Tu Autonomous County)" },
    { code: "YCU", name: "Yuncheng (Yanhu)" },
    { code: "YIA", name: "Yogyakarta" },
    { code: "YIW", name: "Yiwu/Jinhua" },
    { code: "YKS", name: "Yakutsk" },
    { code: "YNB", name: "Yanbu" },
    { code: "YNT", name: "Yantai" },
    { code: "YNY", name: "Gonghang-ro" },
    { code: "YNZ", name: "Yancheng (Tinghu)" },
    { code: "ZAH", name: "Zahedan" },
    { code: "ZAM", name: "Zamboanga" },
    { code: "ZHA", name: "Zhanjiang" },
    { code: "ZUH", name: "Zhuhai (Jinwan)" },
    { code: "ZYL", name: "Sylhet" },
    { code: "AAP", name: "Samarinda" },
    { code: "AAT", name: "Altay" },
    { code: "AAY", name: "Al Ghaydah" },
    { code: "ABT", name: "Al-Baha" },
    { code: "ACX", name: "Xingyi" },
    { code: "ADF", name: "Ad\u0131yaman" },
    { code: "ADU", name: "Ardabil" },
    { code: "AEB", name: "Baise (Tianyang)" },
    { code: "AEU", name: "Abu Musa" },
    { code: "AFZ", name: "Sabzevar" },
    { code: "AGR", name: "Agra" },
    { code: "AGX", name: "Agatti" },
    { code: "AHA", name: "Ambikapur" },
    { code: "AJI", name: "A\u011Fr\u0131" },
    { code: "AJL", name: "Aizawl (Lengpui)" },
    { code: "AKJ", name: "Higashikagura" },
    { code: "AKU", name: "Aksu (Onsu)" },
    { code: "AKY", name: "Sittwe" },
    { code: "AOG", name: "Anshan" },
    { code: "AOR", name: "Alor Satar" },
    { code: "AQG", name: "Anqing" },
    { code: "ASJ", name: "Amami" },
    { code: "AVA", name: "Anshun (Xixiu)" },
    { code: "AVK", name: "Arvaikheer" },
    { code: "AVR", name: "Amravati" },
    { code: "AXF", name: "Bayanhot" },
    { code: "AXJ", name: "Amakusa" },
    { code: "AXT", name: "Akita" },
    { code: "AYJ", name: "Faizabad" },
    { code: "AZD", name: "Yazd" },
    { code: "AZN", name: "Andijan" },
    { code: "BAL", name: "Batman" },
    { code: "BAR", name: "Qionghai (Basuo)" },
    { code: "BBM", name: "Battambang" },
    { code: "BBN", name: "Bario" },
    { code: "BCH", name: "Baucau" },
    { code: "BDH", name: "Bandar Lengeh" },
    { code: "BDO", name: "Bandung" },
    { code: "BEJ", name: "Tanjung Redeb - Borneo Island" },
    { code: "BEK", name: "Bareilly" },
    { code: "BFJ", name: "Bijie" },
    { code: "BFV", name: "Buriram" },
    { code: "BFY", name: "Bengbu" },
    { code: "BGG", name: "Bing\xF6l" },
    { code: "BHH", name: "Bisha" },
    { code: "BHJ", name: "Bhuj" },
    { code: "BHU", name: "Bhavnagar" },
    { code: "BHV", name: "Bahawalpur" },
    { code: "BHY", name: "Beihai" },
    { code: "BIK", name: "Biak" },
    { code: "BIR", name: "Biratnagar" },
    { code: "BJB", name: "Bojnord" },
    { code: "BKN", name: "Balkanabat" },
    { code: "BKS", name: "Bengkulu" },
    { code: "BMU", name: "Bima" },
    { code: "BMV", name: "Buon Ma Thuot" },
    { code: "BOR", name: "Ton Phueng" },
    { code: "BPE", name: "Qinhuangdao (Changli)" },
    { code: "BPL", name: "Bole" },
    { code: "BPX", name: "Bangda" },
    { code: "BQS", name: "Blagoveschensk" },
    { code: "BSD", name: "Baoshan (Longyang)" },
    { code: "BSO", name: "Basco" },
    { code: "BTC", name: "Batticaloa" },
    { code: "BTK", name: "Bratsk" },
    { code: "BTU", name: "Bintulu" },
    { code: "BUZ", name: "Bushehr" },
    { code: "BVJ", name: "Bovanenkovo" },
    { code: "BWO", name: "Balakovo" },
    { code: "BXH", name: "Balkhash" },
    { code: "BXR", name: "Bam" },
    { code: "BXU", name: "Butuan" },
    { code: "BYN", name: "Bayankhongor" },
    { code: "BZI", name: "Bal\u0131kesir" },
    { code: "BZL", name: "Barisal" },
    { code: "BZX", name: "Bazhong" },
    { code: "CAH", name: "Ca Mau City" },
    { code: "CBO", name: "Datu Odin Sinsuat" },
    { code: "CDE", name: "Chengde" },
    { code: "CDP", name: "Kadapa" },
    { code: "CGD", name: "Changde (Dingcheng)" },
    { code: "CGM", name: "Mambajao" },
    { code: "CHG", name: "Shuangta, Chaoyang" },
    { code: "CIF", name: "Chifeng" },
    { code: "CJL", name: "Chitral" },
    { code: "CJM", name: "Chumphon" },
    { code: "CKH", name: "Chokurdah" },
    { code: "CKZ", name: "\xC7anakkale" },
    { code: "COQ", name: "Choibalsan" },
    { code: "CQW", name: "Wulong" },
    { code: "CRM", name: "Catarman" },
    { code: "CSY", name: "Cheboksary" },
    { code: "CWJ", name: "Lincang (Cangyuan)" },
    { code: "CXB", name: "Cox's Bazar" },
    { code: "CXP", name: "Cilacap" },
    { code: "CYI", name: "Shuishang" },
    { code: "CYP", name: "Calbayog City" },
    { code: "CYX", name: "Cherskiy" },
    { code: "CYZ", name: "Cauayan City" },
    { code: "CZX", name: "Changzhou" },
    { code: "DBC", name: "Baicheng" },
    { code: "DBR", name: "Darbhanga" },
    { code: "DCY", name: "Garz\xEA (Daocheng)" },
    { code: "DDG", name: "Dandong (Zhenxing)" },
    { code: "DDR", name: "Xigaz\xEA (Dingri)" },
    { code: "DEA", name: "Dera Ghazi Khan" },
    { code: "DED", name: "Dehradun (Jauligrant)" },
    { code: "DEF", name: "Dezful" },
    { code: "DGT", name: "Dumaguete City" },
    { code: "DHM", name: "Kangra" },
    { code: "DHX", name: "Kediri" },
    { code: "DIB", name: "Dibrugarh" },
    { code: "DIG", name: "Diqing (Shangri-La)" },
    { code: "DIN", name: "Dien Bien Phu" },
    { code: "DIY", name: "Diyarbak\u0131r" },
    { code: "DLI", name: "Da Lat" },
    { code: "DLU", name: "Dali (Xiaguan)" },
    { code: "DLZ", name: "Dalanzadgad" },
    { code: "DMU", name: "Dimapur" },
    { code: "DNZ", name: "Denizli" },
    { code: "DOY", name: "Dongying (Kenli)" },
    { code: "DPL", name: "Dipolog" },
    { code: "DSO", name: "S\u014Fnd\u014Fng-ni" },
    { code: "DTU", name: "Heihe" },
    { code: "DUM", name: "Dumai" },
    { code: "DWD", name: "Dawadmi" },
    { code: "DYR", name: "Anadyr" },
    { code: "DZH", name: "Dazhou (Dachuan)" },
    { code: "EAM", name: "Najran" },
    { code: "EIE", name: "Yeniseysk" },
    { code: "EJH", name: "Al Wajh" },
    { code: "ENH", name: "Enshi (Enshi)" },
    { code: "ENY", name: "Yan'an (Baota)" },
    { code: "ERC", name: "Erzincan" },
    { code: "ERL", name: "Erenhot" },
    { code: "ERZ", name: "Erzurum" },
    { code: "EZS", name: "Elaz\u0131\u011F" },
    { code: "FEG", name: "Fergana" },
    { code: "FKQ", name: "Fakfak" },
    { code: "FKS", name: "Sukagawa" },
    { code: "FLZ", name: "Sibolga (Pinangsori)" },
    { code: "FUG", name: "Yingzhou, Fuyang" },
    { code: "FUJ", name: "Goto" },
    { code: "FUO", name: "Foshan (Nanhai)" },
    { code: "FYJ", name: "Fuyuan" },
    { code: "FYN", name: "Fuyun" },
    { code: "GAJ", name: "Higashine" },
    { code: "GAY", name: "Gaya" },
    { code: "GBB", name: "Gabala" },
    { code: "GCH", name: "Gachsaran" },
    { code: "GDB", name: "Gondia" },
    { code: "GDX", name: "Magadan" },
    { code: "GIL", name: "Gilgit" },
    { code: "GIZ", name: "Jizan" },
    { code: "GMQ", name: "Golog (Maq\xEAn)" },
    { code: "GNS", name: "Gunungsitoli" },
    { code: "GOP", name: "Gorakhpur" },
    { code: "GOQ", name: "Golmud" },
    { code: "GWL", name: "Gwalior" },
    { code: "GXH", name: "Gannan (Xiahe)" },
    { code: "GYS", name: "Guangyuan (Lizhou)" },
    { code: "GYU", name: "Guyuan (Yuanzhou)" },
    { code: "GZP", name: "Gazipa\u015Fa" },
    { code: "HAC", name: "Hachijojima" },
    { code: "HBX", name: "Hubballi" },
    { code: "HCJ", name: "Hechi (Jinchengjiang)" },
    { code: "HCZ", name: "Chenzhou" },
    { code: "HDG", name: "Handan" },
    { code: "HDM", name: "Hamadan" },
    { code: "HEH", name: "Heho" },
    { code: "HEK", name: "Heihe" },
    { code: "HFA", name: "Haifa" },
    { code: "HGI", name: "Hollongi" },
    { code: "HGN", name: "Mae Hong Son" },
    { code: "HHQ", name: "Hua Hin" },
    { code: "HIN", name: "Sacheon" },
    { code: "HJJ", name: "Huaihua" },
    { code: "HJR", name: "Khajuraho" },
    { code: "HMA", name: "Khanty-Mansiysk" },
    { code: "HMI", name: "Hami" },
    { code: "HNA", name: "Hanamaki" },
    { code: "HPG", name: "Shennongjia (Hongping)" },
    { code: "HQL", name: "Tashikuergan" },
    { code: "HRI", name: "Mattala" },
    { code: "HSC", name: "Shaoguan" },
    { code: "HTG", name: "Khatanga" },
    { code: "HTN", name: "Hotan" },
    { code: "HTT", name: "Mengnai" },
    { code: "HTY", name: "Antakya" },
    { code: "HUO", name: "Holingol" },
    { code: "HUZ", name: "Huizhou (Pingtan)" },
    { code: "HVD", name: "Khovd" },
    { code: "HXD", name: "Delingha" },
    { code: "HYN", name: "Taizhou (Luqiao)" },
    { code: "HZA", name: "Heze (Dingtao)" },
    { code: "HZG", name: "Hanzhong (Chenggu)" },
    { code: "HZH", name: "Liping" },
    { code: "IAA", name: "Igarka" },
    { code: "IGD", name: "I\u011Fd\u0131r" },
    { code: "IGT", name: "Sunzha" },
    { code: "IJK", name: "Izhevsk" },
    { code: "IKG", name: "Karakol" },
    { code: "IKI", name: "Iki" },
    { code: "IKS", name: "Tiksi" },
    { code: "IQM", name: "Qiemo" },
    { code: "IQN", name: "Qingyang (Xifeng)" },
    { code: "ISE", name: "Isparta" },
    { code: "ISG", name: "Ishigaki" },
    { code: "ISU", name: "Sulaymaniyah" },
    { code: "IWJ", name: "Masuda" },
    { code: "IWK", name: "Iwakuni" },
    { code: "IXA", name: "Agartala" },
    { code: "IXD", name: "Allahabad" },
    { code: "IXG", name: "Belgaum" },
    { code: "IXI", name: "Lilabari" },
    { code: "IXJ", name: "Jammu" },
    { code: "IXK", name: "Keshod" },
    { code: "IXL", name: "Leh" },
    { code: "IXM", name: "Madurai" },
    { code: "IXP", name: "Pathankot" },
    { code: "IXR", name: "Ranchi" },
    { code: "IXS", name: "Silchar" },
    { code: "IXU", name: "Aurangabad" },
    { code: "IXY", name: "Kandla" },
    { code: "IZO", name: "Izumo" },
    { code: "JDH", name: "Jodhpur" },
    { code: "JDZ", name: "Jingdezhen" },
    { code: "JGA", name: "Jamnagar" },
    { code: "JGD", name: "Jiagedaqi" },
    { code: "JGS", name: "Ji'an" },
    { code: "JIC", name: "Jinchang" },
    { code: "JIQ", name: "Qianjiang" },
    { code: "JKR", name: "Janakpur" },
    { code: "JLR", name: "Jabalpur" },
    { code: "JMJ", name: "Pu'er (Lancang)" },
    { code: "JMU", name: "Jiamusi" },
    { code: "JNG", name: "Jining" },
    { code: "JNH", name: "Xiuzhou, Hangzhou" },
    { code: "JNZ", name: "Jinzhou (Linghai)" },
    { code: "JOG", name: "Yogyakarta" },
    { code: "JOL", name: "Jolo" },
    { code: "JRH", name: "Jorhat" },
    { code: "JSA", name: "Jaisalmer" },
    { code: "JSJ", name: "Jiansanjiang" },
    { code: "JSR", name: "Jashore (Jessore)" },
    { code: "JUZ", name: "Quzhou (Kezheng)" },
    { code: "JXA", name: "Jixi" },
    { code: "JZH", name: "Ngawa (Songpan)" },
    { code: "KAC", name: "Qamishli" },
    { code: "KAW", name: "Kawthoung" },
    { code: "KBR", name: "Kota Baharu" },
    { code: "KCM", name: "Kahramanmara\u015F" },
    { code: "KCT", name: "Galle" },
    { code: "KCY", name: "Krasnoyarsk" },
    { code: "KDM", name: "Huvadhu Atoll" },
    { code: "KDO", name: "Kadhdhoo" },
    { code: "KEP", name: "Nepalgunj" },
    { code: "KET", name: "Kengtung" },
    { code: "KFS", name: "Kastamonu" },
    { code: "KGP", name: "Kogalym" },
    { code: "KGT", name: "Garz\xEA (Kangding)" },
    { code: "KHD", name: "Khoram Abad" },
    { code: "KHK", name: "Khark" },
    { code: "KHS", name: "Khasab" },
    { code: "KHT", name: "Khost" },
    { code: "KHV", name: "Khabarovsk" },
    { code: "KJB", name: "Orvakal" },
    { code: "KJH", name: "Kaili  (Huangping)" },
    { code: "KJI", name: "Burqin" },
    { code: "KJT", name: "Kertajati" },
    { code: "KKC", name: "Khon Kaen" },
    { code: "KKS", name: "Kashan" },
    { code: "KKX", name: "Kikai" },
    { code: "KLH", name: "Kolhapur" },
    { code: "KMC", name: "King Khaled Military City" },
    { code: "KNG", name: "Kaimana" },
    { code: "KNH", name: "Shang-I" },
    { code: "KNU", name: "Kanpur" },
    { code: "KOE", name: "Kupang" },
    { code: "KOP", name: "Nakhon Phanom" },
    { code: "KPO", name: "Pohang" },
    { code: "KPW", name: "Keperveem" },
    { code: "KQH", name: "Ajmer (Kishangarh)" },
    { code: "KRL", name: "Korla" },
    { code: "KRO", name: "Kurgan" },
    { code: "KRW", name: "Turkmenba\u015Fy" },
    { code: "KSH", name: "Kermanshah" },
    { code: "KSY", name: "Kars" },
    { code: "KTD", name: "Kitadait\u014Djima" },
    { code: "KTG", name: "Ketapang" },
    { code: "KUA", name: "Kuantan" },
    { code: "KUH", name: "Kushiro" },
    { code: "KUM", name: "Yakushima" },
    { code: "KUU", name: "Bhuntar" },
    { code: "KUV", name: "Gunsan" },
    { code: "KWJ", name: "Gwangju" },
    { code: "KXB", name: "Kolaka" },
    { code: "KXK", name: "Komsomolsk-on-Amur" },
    { code: "KYD", name: "Orchid Island" },
    { code: "KYP", name: "Kyaukpyu" },
    { code: "KYZ", name: "Kyzyl" },
    { code: "KZR", name: "Alt\u0131nta\u015F" },
    { code: "LBU", name: "Labuan" },
    { code: "LCX", name: "Longyan (Liancheng)" },
    { code: "LDS", name: "Yichun" },
    { code: "LDU", name: "Lahad Datu" },
    { code: "LFM", name: "Lamerd" },
    { code: "LFQ", name: "Linfen (Yaodu)" },
    { code: "LHL", name: "Lachin" },
    { code: "LIW", name: "Loikaw" },
    { code: "LLF", name: "Yongzhou" },
    { code: "LLV", name: "L\xFCliang" },
    { code: "LMN", name: "Limbang" },
    { code: "LNJ", name: "Lincang" },
    { code: "LNL", name: "Longnan (Cheng)" },
    { code: "LOE", name: "Loei" },
    { code: "LPF", name: "Liupanshui (Zhongshan)" },
    { code: "LPT", name: "Lampang" },
    { code: "LRR", name: "Lar" },
    { code: "LSG", name: "Leshan (Wutongqiao)" },
    { code: "LSH", name: "Lashio" },
    { code: "LSR", name: "Kutacane" },
    { code: "LTI", name: "Altai" },
    { code: "LTK", name: "Latakia" },
    { code: "LTU", name: "Latur" },
    { code: "LUA", name: "Lukla" },
    { code: "LUM", name: "Dehong (Mangshi)" },
    { code: "LUV", name: "Langgur" },
    { code: "LYI", name: "Linyi (Hedong)" },
    { code: "LZG", name: "Nanchong (Langzhong)" },
    { code: "LZH", name: "Liuzhou (Liujiang)" },
    { code: "LZN", name: "Matsu (Nangan)" },
    { code: "LZO", name: "Luzhou (Yunlong)" },
    { code: "LZY", name: "Nyingchi (Mainling)" },
    { code: "MAQ", name: "Mae Sot" },
    { code: "MBE", name: "Monbetsu" },
    { code: "MBT", name: "Masbate" },
    { code: "MDG", name: "Mudanjiang" },
    { code: "MEQ", name: "Kuala Pesisir" },
    { code: "MFK", name: "Matsu (Beigan)" },
    { code: "MGZ", name: "Mkeik" },
    { code: "MIG", name: "Mianyang (Fucheng)" },
    { code: "MJZ", name: "Mirny" },
    { code: "MKM", name: "Mukah" },
    { code: "MKQ", name: "Merauke" },
    { code: "MKW", name: "Manokwari" },
    { code: "MKZ", name: "Malacca" },
    { code: "MLG", name: "Malang" },
    { code: "MLX", name: "Malatya" },
    { code: "MMB", name: "\u014Czora" },
    { code: "MMD", name: "Minamidaito" },
    { code: "MMJ", name: "Matsumoto" },
    { code: "MMY", name: "Miyakojima" },
    { code: "MOG", name: "Mong Hsat" },
    { code: "MPH", name: "Caticlan" },
    { code: "MQJ", name: "Khonuu" },
    { code: "MQM", name: "Mardin" },
    { code: "MRX", name: "Mahshahr" },
    { code: "MSJ", name: "Misawa" },
    { code: "MSR", name: "Mu\u015F" },
    { code: "MUR", name: "Marudi" },
    { code: "MXV", name: "M\xF6r\xF6n" },
    { code: "MYE", name: "Miyakejima" },
    { code: "MYP", name: "Mary" },
    { code: "MYQ", name: "Mysore" },
    { code: "MYT", name: "Myitkyina" },
    { code: "MYY", name: "Miri" },
    { code: "MZH", name: "Amasya" },
    { code: "MZS", name: "Moradabad" },
    { code: "MZV", name: "Mulu" },
    { code: "NAH", name: "Tabukan Utara, Sangihe Islands" },
    { code: "NAM", name: "Namniwel" },
    { code: "NAW", name: "Narathiwat" },
    { code: "NBC", name: "Nizhnekamsk" },
    { code: "NBS", name: "Baishan" },
    { code: "NDC", name: "Nanded" },
    { code: "NER", name: "Neryungri" },
    { code: "NGQ", name: "Shiquanhe" },
    { code: "NKM", name: "Nagoya" },
    { code: "NKT", name: "\u015E\u0131rnak" },
    { code: "NLH", name: "Ninglang" },
    { code: "NLI", name: "Nikolayevsk-na-Amure Airport" },
    { code: "NLT", name: "Xinyuan" },
    { code: "NMF", name: "Noonu Atoll" },
    { code: "NNT", name: "Nan" },
    { code: "NOJ", name: "Noyabrsk" },
    { code: "NOP", name: "Sinop" },
    { code: "NOZ", name: "Novokuznetsk" },
    { code: "NPO", name: "Nanga Pinoh-Borneo Island" },
    { code: "NSH", name: "Nowshahr" },
    { code: "NST", name: "Nakhon Si Thammarat" },
    { code: "NTG", name: "Nantong (Tongzhou)" },
    { code: "NTQ", name: "Wajima" },
    { code: "NTX", name: "Ranai-Natuna Besar Island" },
    { code: "NUX", name: "Novy Urengoy" },
    { code: "NVI", name: "Navoi" },
    { code: "NYM", name: "Nadym" },
    { code: "NZH", name: "Manzhouli" },
    { code: "NZL", name: "Zhalantun" },
    { code: "OBO", name: "Obihiro" },
    { code: "OGN", name: "Yonaguni" },
    { code: "OGU", name: "Ordu" },
    { code: "OHE", name: "Mohe" },
    { code: "OHO", name: "Okhotsk" },
    { code: "OIM", name: "Izu Oshima" },
    { code: "OIR", name: "Okushiri Island" },
    { code: "OIT", name: "Oita" },
    { code: "OKD", name: "Sapporo" },
    { code: "OKE", name: "Wadomari" },
    { code: "OKI", name: "Okinoshima" },
    { code: "OKL", name: "Oksibil" },
    { code: "OLZ", name: "Olyokminsk" },
    { code: "OMH", name: "Urmia" },
    { code: "OMN", name: "Zomin" },
    { code: "ONJ", name: "Kitaakita" },
    { code: "ONQ", name: "Zonguldak" },
    { code: "OSW", name: "Orsk" },
    { code: "OVS", name: "Sovetskiy" },
    { code: "OZC", name: "Ozamiz" },
    { code: "PAB", name: "Bilaspur" },
    { code: "PAG", name: "Pagadian" },
    { code: "PAT", name: "Patna" },
    { code: "PBD", name: "Porbandar" },
    { code: "PBU", name: "Putao" },
    { code: "PDO", name: "Talang Gudang-Sumatra Island" },
    { code: "PEZ", name: "Penza" },
    { code: "PGH", name: "Pantnagar" },
    { code: "PGK", name: "Pangkal Pinang" },
    { code: "PGU", name: "Khiyaroo" },
    { code: "PHS", name: "Phitsanulok" },
    { code: "PHY", name: "Phetchabun" },
    { code: "PKR", name: "Pokhara" },
    { code: "PKU", name: "Pekanbaru" },
    { code: "PKY", name: "Palangkaraya" },
    { code: "PLM", name: "Palembang" },
    { code: "PLW", name: "Palu" },
    { code: "PNY", name: "Puducherry (Pondicherry)" },
    { code: "PSU", name: "Putussibau-Borneo Island" },
    { code: "PWE", name: "Apapelgino" },
    { code: "PXR", name: "Surin" },
    { code: "PXU", name: "Pleiku" },
    { code: "PYJ", name: "Yakutia" },
    { code: "PZH", name: "Fort Sandeman" },
    { code: "PZI", name: "Panzhihua (Renhe)" },
    { code: "QSZ", name: "Shache" },
    { code: "RAE", name: "Arar" },
    { code: "RAH", name: "Rafha" },
    { code: "RAS", name: "Rasht" },
    { code: "RDP", name: "Durgapur" },
    { code: "REN", name: "Orenburg" },
    { code: "REW", name: "Rewa" },
    { code: "RGO", name: "Hoemun-ri" },
    { code: "RIS", name: "Rishiri" },
    { code: "RIZ", name: "Rizhao (Donggang)" },
    { code: "RJA", name: "Madhurapudi" },
    { code: "RJH", name: "Rajshahi" },
    { code: "RJN", name: "Rafsanjan" },
    { code: "RLK", name: "Bayannur" },
    { code: "RMZ", name: "Tobolsk" },
    { code: "RNJ", name: "Yoron" },
    { code: "ROI", name: "Roi Et" },
    { code: "RPR", name: "Raipur" },
    { code: "RQA", name: "Ruoqiang Town" },
    { code: "RSU", name: "Yeosu" },
    { code: "RXS", name: "Roxas City" },
    { code: "RYK", name: "Rahim Yar Khan" },
    { code: "RZR", name: "Ramsar" },
    { code: "RZV", name: "Rize" },
    { code: "SBT", name: "Sabetta" },
    { code: "SBW", name: "Sibu" },
    { code: "SCT", name: "Mori" },
    { code: "SDG", name: "Sanandaj" },
    { code: "SDK", name: "Sandakan" },
    { code: "SDS", name: "Sado" },
    { code: "SDW", name: "Chipi" },
    { code: "SEK", name: "Srednekolymsk" },
    { code: "SHB", name: "Nakashibetsu" },
    { code: "SHI", name: "Miyakojima" },
    { code: "SHL", name: "Shillong" },
    { code: "SHM", name: "Shirahama" },
    { code: "SHS", name: "Jingzhou (Shashi)" },
    { code: "SHW", name: "Sharurah" },
    { code: "SJI", name: "San Jose" },
    { code: "SKZ", name: "Sukkur" },
    { code: "SLY", name: "Salekhard" },
    { code: "SNO", name: "Sakon Nakhon" },
    { code: "SNW", name: "Thandwe" },
    { code: "SOQ", name: "Sorong" },
    { code: "SPD", name: "Saidpur" },
    { code: "SQD", name: "Shangrao (Hengfeng)" },
    { code: "SQG", name: "Sintang" },
    { code: "SQJ", name: "Sanming (Sha)" },
    { code: "SRY", name: "Sari" },
    { code: "SUG", name: "Surigao City" },
    { code: "SUI", name: "Sukhumi" },
    { code: "SYO", name: "Shonai" },
    { code: "SYS", name: "Saskylakh" },
    { code: "SZF", name: "Samsun" },
    { code: "SZH", name: "Shuozhou" },
    { code: "TAC", name: "Tacloban City" },
    { code: "TAI", name: "Taiz" },
    { code: "TBB", name: "Tuy Hoa" },
    { code: "TBH", name: "Tablas Island" },
    { code: "TCP", name: "Taba" },
    { code: "TCZ", name: "Baoshan (Tengchong)" },
    { code: "TDK", name: "Taldykorgan" },
    { code: "TDX", name: "Laem Ngop" },
    { code: "TEN", name: "Tongren (Daxing)" },
    { code: "TEZ", name: "Tezpur" },
    { code: "TGG", name: "Kuala Terengganu" },
    { code: "TGO", name: "Tongliao" },
    { code: "THL", name: "Tachileik" },
    { code: "THQ", name: "Tianshui (Maiji)" },
    { code: "THS", name: "Sukhothai" },
    { code: "TIM", name: "Timika" },
    { code: "TJG", name: "Tanta-Tabalong" },
    { code: "TJH", name: "Toyooka" },
    { code: "TJK", name: "Tokat" },
    { code: "TKG", name: "Bandar Lampung" },
    { code: "TKN", name: "Amagi" },
    { code: "TLQ", name: "Turpan" },
    { code: "TMH", name: "Tanah Merah" },
    { code: "TMJ", name: "Termez" },
    { code: "TNE", name: "Tanegashima" },
    { code: "TNH", name: "Tonghua" },
    { code: "TNJ", name: "Tanjung Pinang-Bintan Island" },
    { code: "TOD", name: "Tioman Island" },
    { code: "TOY", name: "Toyama" },
    { code: "TPJ", name: "Taplejung" },
    { code: "TRA", name: "Tarama" },
    { code: "TRK", name: "Tarakan" },
    { code: "TRR", name: "Trincomalee" },
    { code: "TRT", name: "Toraja" },
    { code: "TSJ", name: "Tsushima" },
    { code: "TST", name: "Trang" },
    { code: "TTE", name: "Ternate" },
    { code: "TTJ", name: "Tottori" },
    { code: "TTT", name: "Taitung City" },
    { code: "TUG", name: "Tuguegarao City" },
    { code: "TUI", name: "Turaif" },
    { code: "TVT", name: "Tashkent" },
    { code: "TVY", name: "Dawei" },
    { code: "TWT", name: "Bongao" },
    { code: "TWU", name: "Tawau" },
    { code: "TXE", name: "Takengon" },
    { code: "TZX", name: "Trabzon" },
    { code: "UAI", name: "Suai" },
    { code: "UBJ", name: "Ube" },
    { code: "UBP", name: "Ubon Ratchathani" },
    { code: "UCB", name: "Ulanqab" },
    { code: "UCT", name: "Ukhta" },
    { code: "UDR", name: "Udaipur" },
    { code: "UEO", name: "Kumejima" },
    { code: "UGA", name: "Bulgan" },
    { code: "UGU", name: "Bilogai" },
    { code: "UIH", name: "Quy Nohn" },
    { code: "UKE", name: "Bhawanipatna" },
    { code: "UKX", name: "Ust-Kut" },
    { code: "ULG", name: "\xD6lgii" },
    { code: "ULK", name: "Lensk" },
    { code: "ULO", name: "Ulaangom" },
    { code: "ULY", name: "Cherdakly" },
    { code: "UNN", name: "Ranong" },
    { code: "URJ", name: "Uray" },
    { code: "URT", name: "Surat Thani" },
    { code: "URY", name: "Gurayat" },
    { code: "USK", name: "Usinsk" },
    { code: "USN", name: "Ulsan" },
    { code: "USR", name: "Ust-Nera" },
    { code: "USU", name: "Coron" },
    { code: "UUA", name: "Bugulma" },
    { code: "UYN", name: "Yulin" },
    { code: "VAM", name: "Maamigili" },
    { code: "VAN", name: "Van" },
    { code: "VAQ", name: "Vanavara" },
    { code: "VAS", name: "Sivas" },
    { code: "VCS", name: "Con Dao" },
    { code: "VDH", name: "Dong Hoi" },
    { code: "VDO", name: "Van Don" },
    { code: "VEO", name: "Severo-Yeniseysk" },
    { code: "VII", name: "Vinh" },
    { code: "VKG", name: "Rach Gia" },
    { code: "VKT", name: "Vorkuta" },
    { code: "VRC", name: "Virac" },
    { code: "VUS", name: "Velikiy Ustyug" },
    { code: "VYI", name: "Vilyuisk" },
    { code: "WAE", name: "Wadi Al Dawasir" },
    { code: "WDS", name: "Shiyan (Maojian)" },
    { code: "WEF", name: "Weifang (Kuiwen)" },
    { code: "WEH", name: "Weihai" },
    { code: "WGN", name: "Shaoyang (Wugang)" },
    { code: "WHA", name: "Wuhu" },
    { code: "WJU", name: "Wonju" },
    { code: "WKJ", name: "Wakkanai" },
    { code: "WMT", name: "Zunyi" },
    { code: "WMX", name: "Wamena" },
    { code: "WNI", name: "Wangi-wangi Island" },
    { code: "WNP", name: "Naga" },
    { code: "WNS", name: "Nawabashah" },
    { code: "WOS", name: "Wonsan" },
    { code: "WUA", name: "Wuhai" },
    { code: "WUS", name: "Wuyishan" },
    { code: "WUZ", name: "Tangbu" },
    { code: "XAI", name: "Xinyang" },
    { code: "XCH", name: "Flying Fish Cove" },
    { code: "XFN", name: "Xiangyang (Xiangzhou)" },
    { code: "XIC", name: "Liangshan (Xichang)" },
    { code: "XIL", name: "Xilinhot" },
    { code: "XSP", name: "Seletar" },
    { code: "XUZ", name: "Xuzhou" },
    { code: "YBP", name: "Yibin (Cuiping)" },
    { code: "YEI", name: "Yeni\u015Fehir" },
    { code: "YGJ", name: "Yonago" },
    { code: "YIC", name: "Yichun" },
    { code: "YIE", name: "Arxan" },
    { code: "YIH", name: "Yichang (Xiaoting)" },
    { code: "YIN", name: "Ili (Yining / Ghulja)" },
    { code: "YKH", name: "Yingkou (Laobian)" },
    { code: "YKO", name: "Hakkari" },
    { code: "YLX", name: "Yulin" },
    { code: "YNJ", name: "Yanji" },
    { code: "YSQ", name: "Qian Gorlos Mongol Autonomous County" },
    { code: "YTY", name: "Yangzhou" },
    { code: "YUS", name: "Yushu (Batang)" },
    { code: "YYA", name: "Yueyang (Yueyanglou)" },
    { code: "YZY", name: "Zhangye (Ganzhou)" },
    { code: "ZAT", name: "Zhaotong" },
    { code: "ZBR", name: "Konarak" },
    { code: "ZHY", name: "Zhongwei (Shapotou)" },
    { code: "ZIX", name: "Zhigansk" },
    { code: "ZKP", name: "Zyryanka" },
    { code: "ZQZ", name: "Zhangjiakou" },
    { code: "ZYI", name: "Zunyi" },
    // ── Oceania ──
    { code: "ADL", name: "Adelaide" },
    { code: "AKL", name: "Auckland" },
    { code: "APW", name: "Apia" },
    { code: "AVV", name: "Geelong/Melbourne" },
    { code: "BME", name: "Broome" },
    { code: "BNE", name: "Brisbane" },
    { code: "CHC", name: "Christchurch" },
    { code: "CNS", name: "Cairns" },
    { code: "CXI", name: "Kiritimati" },
    { code: "DRW", name: "Darwin" },
    { code: "GUM", name: "Hag\xE5t\xF1a" },
    { code: "HBA", name: "Hobart (Cambridge)" },
    { code: "HIR", name: "Honiara" },
    { code: "HNL", name: "Honolulu, Oahu" },
    { code: "KOA", name: "Kailua-Kona" },
    { code: "KSA", name: "Okat" },
    { code: "LAE", name: "Lae" },
    { code: "LIH", name: "Lihue, Kauai" },
    { code: "MAJ", name: "Majuro Atoll" },
    { code: "MCY", name: "Maroochydore" },
    { code: "MEL", name: "Melbourne" },
    { code: "NAN", name: "Nadi" },
    { code: "NOU", name: "Noum\xE9a (La Tontouta)" },
    { code: "NTL", name: "Williamtown" },
    { code: "OGG", name: "Kahului" },
    { code: "OOL", name: "Gold Coast" },
    { code: "PER", name: "Perth" },
    { code: "PHE", name: "Port Hedland" },
    { code: "POM", name: "Port Moresby" },
    { code: "PPG", name: "Pago Pago" },
    { code: "PPT", name: "Papeete" },
    { code: "RAR", name: "Avarua" },
    { code: "ROP", name: "Rota Island" },
    { code: "ROR", name: "Babelthuap Island" },
    { code: "SUV", name: "Nausori" },
    { code: "SYD", name: "Sydney" },
    { code: "TBU", name: "Nuku'alofa" },
    { code: "TKK", name: "Weno Island" },
    { code: "TRW", name: "South Tarawa" },
    { code: "VAV", name: "Vava'u Island" },
    { code: "VLI", name: "Port Vila" },
    { code: "WLG", name: "Wellington" },
    { code: "WLS", name: "Wallis Island" },
    { code: "WSI", name: "Sydney" },
    { code: "WTB", name: "Toowoomba" },
    { code: "YAP", name: "Yap Island" },
    { code: "ZQN", name: "Queenstown" },
    { code: "AAA", name: "Anaa" },
    { code: "ABX", name: "East Albury" },
    { code: "AHE", name: "Ahe Atoll" },
    { code: "ALH", name: "Albany" },
    { code: "ARM", name: "Armidale" },
    { code: "ASP", name: "Alice Springs" },
    { code: "AUQ", name: "Hiva Oa Island" },
    { code: "AWK", name: "Wake Island" },
    { code: "AXR", name: "Arutua" },
    { code: "AYQ", name: "Yulara" },
    { code: "BCI", name: "Barcaldine" },
    { code: "BDB", name: "Bundaberg" },
    { code: "BEU", name: "Bedourie" },
    { code: "BHE", name: "Blenheim" },
    { code: "BHQ", name: "Broken Hill" },
    { code: "BHS", name: "Bathurst" },
    { code: "BKQ", name: "Blackall" },
    { code: "BNK", name: "Ballina" },
    { code: "BOB", name: "Motu Mute" },
    { code: "BQL", name: "Boulia" },
    { code: "BRK", name: "Bourke" },
    { code: "BUA", name: "Buka Island" },
    { code: "BVI", name: "Birdsville" },
    { code: "BWT", name: "Burnie" },
    { code: "CAZ", name: "Cobar" },
    { code: "CBR", name: "Canberra" },
    { code: "CED", name: "Ceduna" },
    { code: "CFS", name: "Coffs Harbour" },
    { code: "CHT", name: "Te One" },
    { code: "CMA", name: "Cunnamulla" },
    { code: "CMU", name: "Kundiawa" },
    { code: "CNB", name: "Coonamble" },
    { code: "CNJ", name: "Cloncurry" },
    { code: "CPD", name: "Coober Pedy" },
    { code: "CTL", name: "Charleville" },
    { code: "CTN", name: "Cooktown" },
    { code: "CUQ", name: "Coen" },
    { code: "CVQ", name: "Carnarvon" },
    { code: "DAU", name: "Daru" },
    { code: "DBO", name: "Dubbo" },
    { code: "DPO", name: "Devonport" },
    { code: "DUD", name: "Dunedin" },
    { code: "ELC", name: "Elcho Island" },
    { code: "EMD", name: "Emerald" },
    { code: "EPR", name: "Esperance" },
    { code: "FAV", name: "Fakarava" },
    { code: "FGU", name: "Fangatau" },
    { code: "FIZ", name: "Fitzroy Crossing" },
    { code: "FUN", name: "Funafuti" },
    { code: "GEA", name: "Noum\xE9a" },
    { code: "GET", name: "Moonyoonooka" },
    { code: "GFF", name: "Griffith" },
    { code: "GIS", name: "Gisborne" },
    { code: "GKA", name: "Goronka" },
    { code: "GLT", name: "Gladstone" },
    { code: "GMR", name: "Totegegie" },
    { code: "GOV", name: "Nhulunbuy" },
    { code: "GTE", name: "Groote Eylandt" },
    { code: "GUR", name: "Gurney" },
    { code: "HGU", name: "Mount Hagen" },
    { code: "HID", name: "Horn" },
    { code: "HKK", name: "Hokitika Airfield" },
    { code: "HKN", name: "Kimbe" },
    { code: "HLZ", name: "Hamilton" },
    { code: "HNM", name: "Hana" },
    { code: "HOI", name: "Otepa" },
    { code: "HPA", name: "Lifuka" },
    { code: "HTI", name: "Hamilton Island" },
    { code: "HUH", name: "Fare" },
    { code: "HVB", name: "Hervey Bay" },
    { code: "ILP", name: "\xCEle des Pins" },
    { code: "INU", name: "Yaren" },
    { code: "IRG", name: "Lockhart River" },
    { code: "ISA", name: "Mount Isa" },
    { code: "ITO", name: "Hilo" },
    { code: "IUE", name: "Alofi" },
    { code: "IVC", name: "Invercargill" },
    { code: "JHM", name: "Lahaina" },
    { code: "KAT", name: "Awanui" },
    { code: "KGC", name: "Kingscote" },
    { code: "KGI", name: "Broadwood" },
    { code: "KKE", name: "Kerikeri" },
    { code: "KKR", name: "Raitahiti" },
    { code: "KMA", name: "Kerema" },
    { code: "KNQ", name: "Kon\xE9" },
    { code: "KNS", name: "King Island" },
    { code: "KNX", name: "Kununurra" },
    { code: "KTA", name: "Karratha" },
    { code: "KVG", name: "Kavieng" },
    { code: "KWA", name: "Kwajalein" },
    { code: "KWM", name: "Kowanyama" },
    { code: "LBS", name: "Labasa" },
    { code: "LEA", name: "Exmouth" },
    { code: "LER", name: "Leinster" },
    { code: "LHG", name: "Lightning Ridge" },
    { code: "LIF", name: "Lifou" },
    { code: "LNO", name: "Leonora" },
    { code: "LNY", name: "Lanai City" },
    { code: "LRE", name: "Longreach" },
    { code: "LST", name: "Launceston (Western Junction)" },
    { code: "LSY", name: "Lismore" },
    { code: "MAG", name: "Madang" },
    { code: "MAS", name: "Manus Island" },
    { code: "MAU", name: "Maupiti" },
    { code: "MBW", name: "Melbourne" },
    { code: "MDU", name: "Mendi" },
    { code: "MEB", name: "Essendon Fields" },
    { code: "MEE", name: "Mar\xE9" },
    { code: "MGB", name: "Mount Gambier" },
    { code: "MHU", name: "Mount Hotham" },
    { code: "MIM", name: "Merimbula" },
    { code: "MJK", name: "Denham" },
    { code: "MKK", name: "Kaunakakai" },
    { code: "MKP", name: "Makemo" },
    { code: "MKR", name: "Meekatharra" },
    { code: "MKY", name: "Mackay" },
    { code: "MMG", name: "Mount Magnet" },
    { code: "MNG", name: "Maningrida" },
    { code: "MOV", name: "Moranbah" },
    { code: "MOZ", name: "Moorea-Maiao" },
    { code: "MQL", name: "Mildura" },
    { code: "MRZ", name: "Moree" },
    { code: "MUA", name: "Munda" },
    { code: "MUE", name: "Waimea (Kamuela)" },
    { code: "MVT", name: "Mataiva" },
    { code: "MYA", name: "Moruya" },
    { code: "NAA", name: "Narrabri" },
    { code: "NHV", name: "Nuku Hiva" },
    { code: "NLK", name: "Burnt Pine" },
    { code: "NPE", name: "Napier" },
    { code: "NPL", name: "New Plymouth" },
    { code: "NRA", name: "Narrandera" },
    { code: "NSN", name: "Nelson" },
    { code: "NTN", name: "Normanton" },
    { code: "OKY", name: "Oakey Army Aviation Centre" },
    { code: "OOM", name: "Cooma" },
    { code: "OPU", name: "Balimo" },
    { code: "PBO", name: "Paraburdoo" },
    { code: "PKE", name: "Parkes" },
    { code: "PLO", name: "Port Lincoln" },
    { code: "PMR", name: "Palmerston North" },
    { code: "PNI", name: "Pohnpei Island" },
    { code: "PNP", name: "Popondetta" },
    { code: "PPP", name: "Proserpine" },
    { code: "PQQ", name: "Port Macquarie" },
    { code: "PTJ", name: "Portland" },
    { code: "PUG", name: "Port Augusta" },
    { code: "RAB", name: "Kokopo" },
    { code: "RFP", name: "Uturoa" },
    { code: "RGI", name: "Rangiroa" },
    { code: "RMA", name: "Roma" },
    { code: "ROK", name: "Rockhampton" },
    { code: "ROT", name: "Rotorua" },
    { code: "RUR", name: "Rurutu" },
    { code: "SNB", name: "Milikapiti" },
    { code: "SON", name: "Luganville" },
    { code: "SPN", name: "I Fadang, Saipan" },
    { code: "TAH", name: "Tanna Island" },
    { code: "TCA", name: "Tennant Creek" },
    { code: "TGJ", name: "Tiga" },
    { code: "THG", name: "Biloela" },
    { code: "TIH", name: "Tuherahera" },
    { code: "TIQ", name: "Tinian Island" },
    { code: "TIU", name: "Timaru" },
    { code: "TKP", name: "Takapoto" },
    { code: "TKX", name: "Takaroa" },
    { code: "TMW", name: "Tamworth" },
    { code: "TOU", name: "Touho" },
    { code: "TRG", name: "Tauranga" },
    { code: "TSV", name: "Townsville" },
    { code: "TUB", name: "Tubuai" },
    { code: "TUO", name: "Taupo" },
    { code: "ULP", name: "Quilpie" },
    { code: "UVE", name: "Ouv\xE9a" },
    { code: "VAI", name: "Vanimo" },
    { code: "VMU", name: "Baimuru" },
    { code: "WAG", name: "Wanganui" },
    { code: "WBM", name: "Wapenamanda" },
    { code: "WEI", name: "Weipa" },
    { code: "WGA", name: "Forest Hill" },
    { code: "WGE", name: "Walgett" },
    { code: "WHK", name: "Whakat\u0101ne" },
    { code: "WIN", name: "Winton" },
    { code: "WKA", name: "Wanaka" },
    { code: "WNR", name: "Windorah" },
    { code: "WRE", name: "Whangarei" },
    { code: "WSZ", name: "Westport" },
    { code: "WUN", name: "Wiluna" },
    { code: "WWK", name: "Wewak" },
    { code: "WYA", name: "Whyalla" },
    { code: "XMH", name: "Manihi" },
    { code: "XTG", name: "Thargomindah" },
    { code: "ZNE", name: "Newman" },
    // ── Europe ──
    { code: "AAL", name: "Aalborg" },
    { code: "AAR", name: "Aarhus" },
    { code: "ABZ", name: "Aberdeen" },
    { code: "AER", name: "Sochi" },
    { code: "AES", name: "\xC5lesund" },
    { code: "AEY", name: "Akureyri" },
    { code: "AGP", name: "M\xE1laga" },
    { code: "ALC", name: "Alicante" },
    { code: "AMS", name: "Amsterdam" },
    { code: "ARN", name: "Stockholm" },
    { code: "ATH", name: "Spata-Artemida" },
    { code: "BBU", name: "Bucharest" },
    { code: "BCM", name: "Bac\u0103u" },
    { code: "BCN", name: "Barcelona" },
    { code: "BDS", name: "Brindisi" },
    { code: "BEG", name: "Belgrade" },
    { code: "BER", name: "Berlin" },
    { code: "BES", name: "Brest" },
    { code: "BFS", name: "Belfast" },
    { code: "BGO", name: "Bergen" },
    { code: "BGY", name: "Orio al Serio (BG)" },
    { code: "BHX", name: "Birmingham, West Midlands" },
    { code: "BIA", name: "Bastia" },
    { code: "BIO", name: "Bilbao" },
    { code: "BLL", name: "Billund" },
    { code: "BLQ", name: "Bologna" },
    { code: "BNX", name: "Mahovljani" },
    { code: "BOD", name: "Bordeaux" },
    { code: "BOJ", name: "Burgas" },
    { code: "BOO", name: "Bod\xF8" },
    { code: "BQT", name: "Brest" },
    { code: "BRE", name: "Bremen" },
    { code: "BRI", name: "Bari" },
    { code: "BRS", name: "Bristol" },
    { code: "BRU", name: "Zaventem" },
    { code: "BSL", name: "B\xE2le / Mulhouse" },
    { code: "BTS", name: "Bratislava" },
    { code: "BUD", name: "Budapest" },
    { code: "BVA", name: "Beauvais" },
    { code: "CAG", name: "Cagliari" },
    { code: "CDG", name: "Paris (CDG)" },
    { code: "CFE", name: "Clermont-Ferrand" },
    { code: "CFU", name: "Kerkyra (Corfu)" },
    { code: "CGN", name: "K\xF6ln (Cologne)" },
    { code: "CHQ", name: "Souda" },
    { code: "CIA", name: "Rome (Ciampino)" },
    { code: "CLJ", name: "Cluj-Napoca" },
    { code: "CND", name: "Constan\u021Ba" },
    { code: "CPH", name: "Copenhagen" },
    { code: "CRA", name: "Craiova" },
    { code: "CRL", name: "Charleroi" },
    { code: "CTA", name: "Catania" },
    { code: "CWL", name: "Cardiff" },
    { code: "DBV", name: "Dubrovnik" },
    { code: "DEB", name: "Debrecen" },
    { code: "DME", name: "Moscow" },
    { code: "DRS", name: "Dresden" },
    { code: "DTM", name: "Dortmund" },
    { code: "DUB", name: "Dublin" },
    { code: "DUS", name: "D\xFCsseldorf" },
    { code: "EDI", name: "Ingliston, Edinburgh" },
    { code: "EIN", name: "Eindhoven" },
    { code: "EMA", name: "Nottingham, Leicestershire" },
    { code: "ERF", name: "Erfurt" },
    { code: "EVE", name: "Evenes" },
    { code: "FAE", name: "V\xE1gar" },
    { code: "FAO", name: "Faro" },
    { code: "FCO", name: "Rome (Fiumicino)" },
    { code: "FDH", name: "Friedrichshafen" },
    { code: "FKB", name: "Rheinm\xFCnster" },
    { code: "FLR", name: "Firenze (FI)" },
    { code: "FMM", name: "Memmingen" },
    { code: "FMO", name: "Greven" },
    { code: "FNC", name: "Funchal" },
    { code: "FRA", name: "Frankfurt" },
    { code: "FSC", name: "Figari" },
    { code: "GDN", name: "Gda\u0144sk" },
    { code: "GHV", name: "Bra\u0219ov (Ghimbav)" },
    { code: "GIB", name: "Gibraltar" },
    { code: "GLA", name: "Glasgow" },
    { code: "GOA", name: "Genova (GE)" },
    { code: "GOJ", name: "Nizhny Novgorod" },
    { code: "GOT", name: "G\xF6teborg" },
    { code: "GRO", name: "Girona" },
    { code: "GRQ", name: "Groningen" },
    { code: "GRZ", name: "Feldkirchen bei Graz" },
    { code: "GVA", name: "Geneva" },
    { code: "HAJ", name: "Hannover" },
    { code: "HAM", name: "Hamburg" },
    { code: "HEL", name: "Helsinki (Vantaa)" },
    { code: "HER", name: "Heraklion" },
    { code: "HHN", name: "Frankfurt am Main (Lautzenhausen)" },
    { code: "IAR", name: "Tunoshna" },
    { code: "IAS", name: "Ia\u015Fi" },
    { code: "IBZ", name: "Ibiza (Eivissa)" },
    { code: "INI", name: "Ni\u0161" },
    { code: "INN", name: "Innsbruck" },
    { code: "IOM", name: "Castletown" },
    { code: "ISL", name: "Istanbul(Bak\u0131rk\xF6y)" },
    { code: "IST", name: "Istanbul" },
    { code: "IVL", name: "Ivalo" },
    { code: "JCL", name: "\u010Cesk\xE9 Bud\u011Bjovice" },
    { code: "JTR", name: "Santorini Island" },
    { code: "KBP", name: "Boryspil" },
    { code: "KEF", name: "Reykjav\xEDk" },
    { code: "KGD", name: "Kaliningrad" },
    { code: "KLU", name: "Klagenfurt am W\xF6rthersee" },
    { code: "KLV", name: "Karlovy Vary" },
    { code: "KRK", name: "Balice" },
    { code: "KRN", name: "Kiruna" },
    { code: "KRR", name: "Krasnodar" },
    { code: "KRS", name: "Kristiansand(Kjevik)" },
    { code: "KSF", name: "Calden" },
    { code: "KTT", name: "Kittil\xE4" },
    { code: "KTW", name: "Katowice" },
    { code: "KUF", name: "Samara" },
    { code: "KUN", name: "Kaunas" },
    { code: "KUO", name: "Kuopio / Siilinj\xE4rvi" },
    { code: "KVA", name: "Kavala" },
    { code: "LBA", name: "Leeds, West Yorkshire" },
    { code: "LBG", name: "Paris" },
    { code: "LCJ", name: "\u0141\xF3d\u017A" },
    { code: "LED", name: "St. Petersburg" },
    { code: "LEJ", name: "Schkeuditz" },
    { code: "LGW", name: "London (Gatwick)" },
    { code: "LHR", name: "London (Heathrow)" },
    { code: "LIL", name: "Lesquin" },
    { code: "LIN", name: "Milan (Linate)" },
    { code: "LIS", name: "Lisbon" },
    { code: "LJU", name: "Zgornji Brnik" },
    { code: "LLA", name: "Lule\xE5" },
    { code: "LNZ", name: "Linz" },
    { code: "LPI", name: "Link\xF6ping" },
    { code: "LPL", name: "Liverpool" },
    { code: "LPP", name: "Lappeenranta" },
    { code: "LPX", name: "Liep\u0101ja" },
    { code: "LTN", name: "London (Luton)" },
    { code: "LUX", name: "Luxembourg" },
    { code: "LUZ", name: "Lublin" },
    { code: "LWO", name: "Lviv" },
    { code: "LYS", name: "Colombier-Saugnieu, Rh\xF4ne" },
    { code: "MAD", name: "Madrid" },
    { code: "MAH", name: "Mah\xF3n (Ma\xF3)" },
    { code: "MAN", name: "Manchester, Greater Manchester" },
    { code: "MLA", name: "Valletta" },
    { code: "MMK", name: "Murmansk" },
    { code: "MMX", name: "Malm\xF6" },
    { code: "MPL", name: "Montpellier/M\xE9diterran\xE9e" },
    { code: "MRS", name: "Marignane, Bouches-du-Rh\xF4ne" },
    { code: "MRV", name: "Mineralnyye Vody" },
    { code: "MSQ", name: "Minsk" },
    { code: "MST", name: "Maastricht" },
    { code: "MUC", name: "Munich" },
    { code: "MXP", name: "Milan (Malpensa)" },
    { code: "NAP", name: "Napoli" },
    { code: "NCE", name: "Nice, Alpes-Maritimes" },
    { code: "NCL", name: "Newcastle upon Tyne, Tyne and Wear" },
    { code: "NOC", name: "Charlestown" },
    { code: "NRN", name: "Weeze" },
    { code: "NTE", name: "Nantes" },
    { code: "NUE", name: "Nuremberg" },
    { code: "NYO", name: "Nyk\xF6ping" },
    { code: "ODE", name: "Odense" },
    { code: "ODS", name: "Odesa" },
    { code: "OHD", name: "Ohrid" },
    { code: "OLB", name: "Olbia (SS)" },
    { code: "OMO", name: "Mostar" },
    { code: "OMR", name: "Oradea" },
    { code: "OPO", name: "Porto" },
    { code: "ORK", name: "Cork" },
    { code: "ORY", name: "Paris (Orly)" },
    { code: "OSL", name: "Oslo (Gardermoen)" },
    { code: "OSR", name: "Mo\u0161nov" },
    { code: "OST", name: "Oostende" },
    { code: "OTP", name: "Otopeni" },
    { code: "OUL", name: "Oulu / Oulunsalo" },
    { code: "OVB", name: "Novosibirsk" },
    { code: "OVD", name: "Ran\xF3n" },
    { code: "PAD", name: "B\xFCren" },
    { code: "PDL", name: "Ponta Delgada" },
    { code: "PDV", name: "Plovdiv" },
    { code: "PED", name: "Pardubice" },
    { code: "PEG", name: "Perugia (PG)" },
    { code: "PEV", name: "P\xE9cs" },
    { code: "PIK", name: "Prestwick, South Ayrshire" },
    { code: "PLQ", name: "Palanga" },
    { code: "PMI", name: "Palma de Mallorca" },
    { code: "PMO", name: "Palermo" },
    { code: "POZ", name: "Pozna\u0144" },
    { code: "PRG", name: "Prague" },
    { code: "PRN", name: "Prishtina" },
    { code: "PSA", name: "Pisa (PI)" },
    { code: "PSR", name: "Pescara" },
    { code: "PUY", name: "Pula" },
    { code: "REU", name: "Reus" },
    { code: "RIX", name: "Riga" },
    { code: "RJK", name: "Rijeka(Omi\u0161alj)" },
    { code: "RMI", name: "Rimini (RN)" },
    { code: "RMO", name: "Chi\u015Fin\u0103u" },
    { code: "RMU", name: "Corvera" },
    { code: "ROV", name: "Rostov-on-Don" },
    { code: "RTM", name: "Rotterdam" },
    { code: "RVN", name: "Rovaniemi" },
    { code: "RZE", name: "Jasionka" },
    { code: "SBZ", name: "Sibiu" },
    { code: "SCQ", name: "Santiago de Compostela" },
    { code: "SCR", name: "Malung-S\xE4len" },
    { code: "SCV", name: "Suceava" },
    { code: "SIP", name: "Simferopol" },
    { code: "SJJ", name: "Sarajevo" },
    { code: "SKG", name: "Thessaloniki" },
    { code: "SKP", name: "Ilinden" },
    { code: "SKX", name: "Saransk" },
    { code: "SNN", name: "Shannon" },
    { code: "SOF", name: "Sofia" },
    { code: "SPU", name: "Split" },
    { code: "STN", name: "London (Stansted)" },
    { code: "STR", name: "Stuttgart" },
    { code: "SUF", name: "Lamezia Terme (CZ)" },
    { code: "SVG", name: "Stavanger" },
    { code: "SVO", name: "Moscow" },
    { code: "SVQ", name: "Seville" },
    { code: "SXB", name: "Strasbourg" },
    { code: "SZG", name: "Salzburg" },
    { code: "SZZ", name: "Szczecin(Glewice)" },
    { code: "TGD", name: "Podgorica" },
    { code: "TIA", name: "Rinas" },
    { code: "TKU", name: "Turku" },
    { code: "TLL", name: "Tallinn" },
    { code: "TLS", name: "Toulouse/Blagnac" },
    { code: "TMP", name: "Tampere / Pirkkala" },
    { code: "TOS", name: "Troms\xF8" },
    { code: "TRD", name: "Trondheim" },
    { code: "TRF", name: "Sandefjord(Torp)" },
    { code: "TRN", name: "Caselle Torinese (TO)" },
    { code: "TRS", name: "Ronchi dei Legionari/Trieste" },
    { code: "TSF", name: "Treviso (TV)" },
    { code: "TSR", name: "Timi\u015Foara" },
    { code: "TZL", name: "Dubrave Gornje" },
    { code: "UFA", name: "Ufa" },
    { code: "UME", name: "Ume\xE5" },
    { code: "VAA", name: "Vaasa" },
    { code: "VAR", name: "Varna" },
    { code: "VBY", name: "Visby" },
    { code: "VCE", name: "Venezia (VE)" },
    { code: "VIE", name: "Vienna" },
    { code: "VKO", name: "Moscow" },
    { code: "VLC", name: "Valencia" },
    { code: "VNO", name: "Vilnius" },
    { code: "VOG", name: "Volgograd" },
    { code: "VRN", name: "Caselle (VR)" },
    { code: "VST", name: "Stockholm / V\xE4ster\xE5s" },
    { code: "WAW", name: "Warsaw" },
    { code: "WMI", name: "Nowy Dw\xF3r Mazowiecki" },
    { code: "WRO", name: "Wroc\u0142aw" },
    { code: "ZAD", name: "Zadar" },
    { code: "ZAG", name: "Velika Gorica" },
    { code: "ZAZ", name: "Zaragoza" },
    { code: "ZIA", name: "Moscow" },
    { code: "ZRH", name: "Zurich" },
    { code: "ACH", name: "St. Gallen" },
    { code: "ACI", name: "Saint Anne" },
    { code: "AGH", name: "\xC4ngelholm" },
    { code: "AHO", name: "Alghero" },
    { code: "AJA", name: "Ajaccio" },
    { code: "AJR", name: "Arvidsjaur" },
    { code: "ALF", name: "Alta" },
    { code: "AMV", name: "Amderma" },
    { code: "ANR", name: "Antwerp" },
    { code: "ANX", name: "Andenes" },
    { code: "AOI", name: "Falconara Marittima (AN)" },
    { code: "AOK", name: "Karpathos Island" },
    { code: "ARH", name: "Archangelsk" },
    { code: "ARW", name: "Arad" },
    { code: "AUR", name: "Aurillac" },
    { code: "AVN", name: "Avignon" },
    { code: "AXD", name: "Alexandroupolis" },
    { code: "BAY", name: "T\u0103u\u021Bii-M\u0103gher\u0103u\u0219" },
    { code: "BDU", name: "M\xE5lselv" },
    { code: "BEB", name: "Balivanich" },
    { code: "BGC", name: "Bragan\xE7a" },
    { code: "BHD", name: "Belfast" },
    { code: "BIQ", name: "Biarritz" },
    { code: "BJF", name: "B\xE5tsfjord" },
    { code: "BJZ", name: "Badajoz" },
    { code: "BLE", name: "Borlange" },
    { code: "BMA", name: "Stockholm" },
    { code: "BNN", name: "Br\xF8nn\xF8y" },
    { code: "BOH", name: "Bournemouth" },
    { code: "BRN", name: "Bern" },
    { code: "BRQ", name: "Brno" },
    { code: "BRR", name: "Eoligarry" },
    { code: "BVE", name: "Brive" },
    { code: "BVG", name: "Berlev\xE5g" },
    { code: "BWK", name: "Gornji Humac" },
    { code: "BZG", name: "Bydgoszcz" },
    { code: "BZO", name: "Bolzano (BZ)" },
    { code: "BZR", name: "B\xE9ziers" },
    { code: "CAL", name: "Campbeltown" },
    { code: "CAT", name: "Cascais" },
    { code: "CCF", name: "Carcassonne" },
    { code: "CDT", name: "Castell\xF3n de la Plana" },
    { code: "CEE", name: "Cherepovets" },
    { code: "CFN", name: "Donegal" },
    { code: "CFR", name: "Caen" },
    { code: "CIY", name: "Comiso" },
    { code: "CLY", name: "Calvi" },
    { code: "CMF", name: "Chamb\xE9ry" },
    { code: "CRV", name: "Isola di Capo Rizzuto (KR)" },
    { code: "CUF", name: "Levaldigi (CN)" },
    { code: "DCM", name: "Castres" },
    { code: "DLE", name: "Dole" },
    { code: "DND", name: "Dundee" },
    { code: "DOL", name: "Deauville" },
    { code: "EAS", name: "Hondarribia" },
    { code: "EBA", name: "Campo nell'Elba (LI)" },
    { code: "EBJ", name: "Esbjerg" },
    { code: "EFL", name: "Kefallinia Island" },
    { code: "EGC", name: "Bergerac" },
    { code: "EGS", name: "Egilssta\xF0ir" },
    { code: "ENF", name: "Enontekio" },
    { code: "EOI", name: "Eday" },
    { code: "EPU", name: "P\xE4rnu" },
    { code: "ESL", name: "Elista" },
    { code: "ETZ", name: "Goin" },
    { code: "EXT", name: "Exeter, Devon" },
    { code: "EYK", name: "Beloyarskiy" },
    { code: "FCN", name: "Wurster Nordseek\xFCste" },
    { code: "FLW", name: "Santa Cruz das Flores" },
    { code: "FNI", name: "N\xEEmes/Garons" },
    { code: "FOG", name: "Foggia (FG)" },
    { code: "FRL", name: "Forl\xEC (FC)" },
    { code: "FRO", name: "Flor\xF8" },
    { code: "GCI", name: "Saint Peter Port" },
    { code: "GDZ", name: "Gelendzhik" },
    { code: "GEV", name: "G\xE4llivare" },
    { code: "GME", name: "Gomel" },
    { code: "GNB", name: "Grenoble" },
    { code: "GPA", name: "Patras" },
    { code: "GRW", name: "Santa Cruz da Graciosa" },
    { code: "GRX", name: "Granada" },
    { code: "GRY", name: "Gr\xEDmsey/Sandv\xEDk" },
    { code: "GWT", name: "Sylt" },
    { code: "HAD", name: "Halmstad" },
    { code: "HAU", name: "Karm\xF8y" },
    { code: "HDF", name: "Zirchow" },
    { code: "HFN", name: "H\xF6fn" },
    { code: "HFT", name: "Hammerfest" },
    { code: "HOR", name: "Horta" },
    { code: "HOV", name: "\xD8rsta" },
    { code: "HUY", name: "Grimsby, Lincolnshire" },
    { code: "HVG", name: "Honningsv\xE5g" },
    { code: "IEG", name: "Nowe Kramsko" },
    { code: "IFJ", name: "\xCDsafj\xF6r\xF0ur" },
    { code: "ILD", name: "Lleida" },
    { code: "ILY", name: "Isle of Islay, Argyll and Bute" },
    { code: "INV", name: "Inverness" },
    { code: "IOA", name: "Ioannina" },
    { code: "IWA", name: "Ivanovo" },
    { code: "JER", name: "St. Peter" },
    { code: "JKG", name: "J\xF6nk\xF6ping" },
    { code: "JKH", name: "Chios Island" },
    { code: "JMK", name: "Mykonos" },
    { code: "JOE", name: "Joensuu" },
    { code: "JSH", name: "Crete Island" },
    { code: "JSI", name: "Skiathos" },
    { code: "JYV", name: "Jyv\xE4skyl\xE4n Maalaiskunta" },
    { code: "KAJ", name: "Kajaani" },
    { code: "KAO", name: "Kuusamo" },
    { code: "KDL", name: "K\xE4rdla" },
    { code: "KEM", name: "Kemi / Tornio" },
    { code: "KIR", name: "Farranfore" },
    { code: "KKN", name: "Kirkenes" },
    { code: "KLR", name: "Kalmar" },
    { code: "KLX", name: "Kalamata" },
    { code: "KMW", name: "Kostroma" },
    { code: "KOI", name: "Kirkwall, Orkney Islands" },
    { code: "KOK", name: "Kokkola / Kruunupyy" },
    { code: "KRF", name: "Nyland" },
    { code: "KRP", name: "Karup" },
    { code: "KSC", name: "Ko\u0161ice" },
    { code: "KSD", name: "Karlstad" },
    { code: "KSU", name: "Kvernberget" },
    { code: "KSZ", name: "Kotlas" },
    { code: "KVO", name: "Kraljevo" },
    { code: "KVX", name: "Kirov" },
    { code: "KZI", name: "Kozani" },
    { code: "LBC", name: "L\xFCbeck" },
    { code: "LCG", name: "Culleredo" },
    { code: "LCY", name: "London (City)" },
    { code: "LDE", name: "Tarbes/Lourdes/Pyr\xE9n\xE9es" },
    { code: "LDY", name: "Derry, Derry and Strabane" },
    { code: "LEI", name: "Almer\xEDa" },
    { code: "LEN", name: "La Virgen del Camino" },
    { code: "LEU", name: "La Seu d'Urgell Pyrenees and Andorra" },
    { code: "LGG", name: "Gr\xE2ce-Hollogne" },
    { code: "LIG", name: "Limoges/Bellegarde" },
    { code: "LKL", name: "Lakselv" },
    { code: "LKN", name: "Leknes" },
    { code: "LMP", name: "Lampedusa" },
    { code: "LRH", name: "La Rochelle" },
    { code: "LSI", name: "Lerwick, Shetland" },
    { code: "LUG", name: "Agno" },
    { code: "LYC", name: "Lycksele" },
    { code: "LYR", name: "Longyearbyen" },
    { code: "MBX", name: "Maribor" },
    { code: "MEH", name: "Mehamn" },
    { code: "MHG", name: "Mannheim" },
    { code: "MHQ", name: "Mariehamn" },
    { code: "MJF", name: "Mosj\xF8en" },
    { code: "MJT", name: "Mytilene" },
    { code: "MME", name: "Darlington, Durham" },
    { code: "MOL", name: "\xC5r\xF8" },
    { code: "MQN", name: "Mo i Rana" },
    { code: "MVQ", name: "Mogilev" },
    { code: "MXX", name: "Mora" },
    { code: "NAL", name: "Nalchik" },
    { code: "NCY", name: "Annecy" },
    { code: "NNM", name: "Naryan Mar" },
    { code: "NQY", name: "Newquay" },
    { code: "NRK", name: "Norrk\xF6ping" },
    { code: "NWI", name: "Norwich, Norfolk" },
    { code: "NYA", name: "Nyagan" },
    { code: "ODB", name: "C\xF3rdoba" },
    { code: "OER", name: "\xD6rnsk\xF6ldsvik" },
    { code: "OGZ", name: "Beslan" },
    { code: "OLA", name: "\xD8rland" },
    { code: "ORB", name: "\xD6rebro" },
    { code: "OSD", name: "\xD6stersund" },
    { code: "OSI", name: "Osijek(Klisa)" },
    { code: "PES", name: "Petrozavodsk" },
    { code: "PEX", name: "Pechora" },
    { code: "PGF", name: "Perpignan/Rivesaltes" },
    { code: "PIS", name: "Poitiers/Biard" },
    { code: "PIX", name: "Pico Island" },
    { code: "PKV", name: "Pskov" },
    { code: "PMF", name: "Parma (PR)" },
    { code: "PNA", name: "Pamplona" },
    { code: "PNL", name: "Pantelleria (TP)" },
    { code: "POR", name: "Pori" },
    { code: "PRM", name: "Portim\xE3o" },
    { code: "PUF", name: "Pau/Pyr\xE9n\xE9es (Uzein)" },
    { code: "PVK", name: "Preveza" },
    { code: "PXO", name: "Vila Baleira" },
    { code: "QSR", name: "Salerno" },
    { code: "RDO", name: "Radom" },
    { code: "RDZ", name: "Rodez/Marcillac" },
    { code: "REG", name: "Reggio Calabria" },
    { code: "RJL", name: "Logro\xF1o" },
    { code: "RKE", name: "Roskilde" },
    { code: "RKV", name: "Reykjav\xEDk" },
    { code: "RLG", name: "Laage" },
    { code: "RNB", name: "Ronneby" },
    { code: "RNN", name: "R\xF8nne" },
    { code: "RNS", name: "Saint-Jacques-de-la-Lande, Ille-et-Vilaine" },
    { code: "RRS", name: "R\xF8ros" },
    { code: "RVK", name: "R\xF8rvik" },
    { code: "SCN", name: "Saarbr\xFCcken" },
    { code: "SCW", name: "Syktyvkar" },
    { code: "SDL", name: "Sundsvall/ H\xE4rn\xF6sand" },
    { code: "SDR", name: "Santander" },
    { code: "SEN", name: "Southend-on-Sea, Essex" },
    { code: "SFT", name: "Skellefte\xE5" },
    { code: "SGD", name: "S\xF8nderborg" },
    { code: "SJZ", name: "Velas" },
    { code: "SKN", name: "Hadsel" },
    { code: "SLD", name: "Slia\u010D" },
    { code: "SLM", name: "Salamanca" },
    { code: "SMA", name: "Vila do Porto" },
    { code: "SMI", name: "Samos Island" },
    { code: "SOB", name: "S\xE1rmell\xE9k" },
    { code: "SOJ", name: "S\xF8rkjosen" },
    { code: "SOU", name: "Southampton" },
    { code: "SRP", name: "Leirvik" },
    { code: "SSJ", name: "Alstahaug" },
    { code: "STW", name: "Stavropol" },
    { code: "SUJ", name: "Satu Mare" },
    { code: "SVJ", name: "Svolv\xE6r" },
    { code: "SVL", name: "Savonlinna" },
    { code: "SYY", name: "Stornoway, Western Isles" },
    { code: "SZY", name: "Szymany" },
    { code: "TAT", name: "Poprad" },
    { code: "TAY", name: "Tartu" },
    { code: "TEQ", name: "\xC7orlu" },
    { code: "TER", name: "Praia da Vit\xF3ria" },
    { code: "TGM", name: "Recea" },
    { code: "THN", name: "Trollh\xE4ttan" },
    { code: "TIV", name: "Tivat" },
    { code: "TLN", name: "Hy\xE8res, Var" },
    { code: "TPS", name: "Trapani (TP)" },
    { code: "TRE", name: "Balemartine, Argyll and Bute" },
    { code: "TUF", name: "Tours, Indre-et-Loire" },
    { code: "TYF", name: "Torsby" },
    { code: "ULV", name: "Ulyanovsk" },
    { code: "URE", name: "Kuressaare" },
    { code: "VAW", name: "Vard\xF8" },
    { code: "VBS", name: "Montichiari (BS)" },
    { code: "VDS", name: "Vads\xF8" },
    { code: "VGO", name: "Vigo" },
    { code: "VHM", name: "Vilhelmina" },
    { code: "VIT", name: "Alava" },
    { code: "VLL", name: "Valladolid" },
    { code: "VOL", name: "Nea Anchialos" },
    { code: "VOZ", name: "Voronezh" },
    { code: "VPN", name: "Vopnafj\xF6r\xF0ur" },
    { code: "VRL", name: "Vila Real" },
    { code: "VSE", name: "Viseu" },
    { code: "VXO", name: "V\xE4xj\xF6" },
    { code: "WIC", name: "Wick" },
    { code: "XCR", name: "Chalons en Champagne" },
    { code: "XRY", name: "Jerez de la Frontera" },
    { code: "ZTH", name: "Zakynthos" },
    // ── Africa ──
    { code: "AAE", name: "Annaba" },
    { code: "ABB", name: "Asaba" },
    { code: "ABJ", name: "Abidjan" },
    { code: "ABV", name: "Abuja" },
    { code: "ACC", name: "Accra" },
    { code: "ACE", name: "San Bartolom\xE9" },
    { code: "ADD", name: "Addis Ababa" },
    { code: "AGA", name: "Agadir (Temsia)" },
    { code: "ALG", name: "Algiers" },
    { code: "APL", name: "Nampula" },
    { code: "ASK", name: "Yamoussoukro" },
    { code: "ASW", name: "Aswan" },
    { code: "ATZ", name: "Asyut" },
    { code: "AWA", name: "Hawassa" },
    { code: "BBK", name: "Kasane" },
    { code: "BCU", name: "Bauchi" },
    { code: "BEM", name: "Oulad Yaich" },
    { code: "BEN", name: "Benina" },
    { code: "BEW", name: "Beira" },
    { code: "BFN", name: "Bloemfontein" },
    { code: "BGF", name: "Bangui" },
    { code: "BJA", name: "B\xE9ja\xEFa" },
    { code: "BJL", name: "Banjul (Yundum)" },
    { code: "BJM", name: "Bujumbura" },
    { code: "BKO", name: "Bamako" },
    { code: "BLJ", name: "Batna" },
    { code: "BLZ", name: "Blantyre" },
    { code: "BOY", name: "Bobo Dioulasso" },
    { code: "BSA", name: "Bosaso" },
    { code: "BSG", name: "Bata" },
    { code: "BSK", name: "Biskra" },
    { code: "BUQ", name: "Bulawayo" },
    { code: "BVC", name: "Rabil" },
    { code: "BZV", name: "Brazzaville" },
    { code: "CAI", name: "Cairo" },
    { code: "CFK", name: "Chlef" },
    { code: "CKY", name: "Conakry" },
    { code: "CMN", name: "Casablanca" },
    { code: "COO", name: "Cotonou" },
    { code: "CPT", name: "Cape Town" },
    { code: "CZL", name: "Constantine" },
    { code: "DAR", name: "Dar es Salaam" },
    { code: "DBB", name: "El Alamein" },
    { code: "DIR", name: "Dire Dawa" },
    { code: "DJE", name: "Mellita" },
    { code: "DJG", name: "Djanet" },
    { code: "DKR", name: "Dakar" },
    { code: "DLA", name: "Douala" },
    { code: "DSS", name: "Dakar" },
    { code: "DUR", name: "Durban" },
    { code: "DZA", name: "Dzaoudzi" },
    { code: "EBB", name: "Entebbe" },
    { code: "EDL", name: "Eldoret" },
    { code: "EES", name: "Berenice Troglodytica" },
    { code: "ELS", name: "East London" },
    { code: "ENU", name: "Enegu" },
    { code: "EUN", name: "El Aai\xFAn" },
    { code: "FBM", name: "Lubumbashi" },
    { code: "FEZ", name: "Sa\xEFss" },
    { code: "FIH", name: "Kinshasa" },
    { code: "FKI", name: "Kisangani" },
    { code: "FNA", name: "Freetown (Lungi-Town)" },
    { code: "FRW", name: "Francistown" },
    { code: "FUE", name: "El Matorral" },
    { code: "GBE", name: "Gaborone" },
    { code: "GJL", name: "Tahir" },
    { code: "GOM", name: "Goma" },
    { code: "GOU", name: "Garoua" },
    { code: "GRJ", name: "George" },
    { code: "HAH", name: "Moroni" },
    { code: "HBE", name: "Alexandria" },
    { code: "HGA", name: "Hargeisa" },
    { code: "HLA", name: "Johannesburg" },
    { code: "HMB", name: "Suhaj" },
    { code: "HRE", name: "Harare" },
    { code: "HRG", name: "Hurghada" },
    { code: "ILR", name: "Ilorin/Ogbomosho" },
    { code: "JIB", name: "Djibouti City" },
    { code: "JIJ", name: "Jijiga" },
    { code: "JNB", name: "Johannesburg" },
    { code: "JRO", name: "Arusha" },
    { code: "JUB", name: "Juba" },
    { code: "KAD", name: "Kaduna" },
    { code: "KAN", name: "Kano" },
    { code: "KGL", name: "Kigali" },
    { code: "KIM", name: "Kimberley" },
    { code: "KIS", name: "Kisumu" },
    { code: "KMS", name: "Kumasi" },
    { code: "KRT", name: "Khartoum" },
    { code: "LAD", name: "Luanda" },
    { code: "LAQ", name: "Al Albraq" },
    { code: "LBV", name: "Libreville" },
    { code: "LFW", name: "Lom\xE9" },
    { code: "LLW", name: "Lumbadzi" },
    { code: "LOS", name: "Lagos" },
    { code: "LPA", name: "Gran Canaria Island" },
    { code: "LRL", name: "Niamtougou" },
    { code: "LUN", name: "Lusaka" },
    { code: "LVI", name: "Livingstone" },
    { code: "LXR", name: "Luxor" },
    { code: "MBA", name: "Mombasa" },
    { code: "MFU", name: "Mfuwe" },
    { code: "MGQ", name: "Mogadishu" },
    { code: "MIU", name: "Maiduguri" },
    { code: "MJI", name: "Tripoli" },
    { code: "MJN", name: "Mahajanga" },
    { code: "MPM", name: "Maputo" },
    { code: "MQP", name: "Mbombela" },
    { code: "MRU", name: "Plaine Magnien" },
    { code: "MSU", name: "Maseru(Mazenod)" },
    { code: "MUB", name: "Maun" },
    { code: "MUH", name: "Marsa Matruh" },
    { code: "MWZ", name: "Mwanza" },
    { code: "NBJ", name: "Luanda (\xCDcolo e Bengo)" },
    { code: "NBO", name: "Nairobi" },
    { code: "NDB", name: "Nouadhibou" },
    { code: "NDJ", name: "N'Djamena" },
    { code: "NDR", name: "Al Aaroui" },
    { code: "NIM", name: "Niamey" },
    { code: "NKC", name: "Nouakchott" },
    { code: "NLA", name: "Ndola" },
    { code: "NOS", name: "Nosy Be" },
    { code: "NSI", name: "Yaound\xE9" },
    { code: "OCS", name: "Corisco Island" },
    { code: "ORN", name: "Es-S\xE9nia" },
    { code: "OUA", name: "Ouagadougou" },
    { code: "OUD", name: "Ahl Angad" },
    { code: "OXB", name: "Bissau" },
    { code: "OZG", name: "Zagora" },
    { code: "OZZ", name: "Ouarzazate" },
    { code: "PHC", name: "Port Harcourt" },
    { code: "PLZ", name: "Gqeberha (Port Elizabeth)" },
    { code: "PNR", name: "Pointe Noire" },
    { code: "POG", name: "Port Gentil" },
    { code: "PSD", name: "Port Said" },
    { code: "PTG", name: "Polokwane" },
    { code: "PZU", name: "Port Sudan" },
    { code: "RAI", name: "Praia" },
    { code: "RAK", name: "Marrakesh" },
    { code: "RBA", name: "Rabat" },
    { code: "RMF", name: "Marsa Alam" },
    { code: "ROB", name: "Monrovia" },
    { code: "RUN", name: "Sainte-Marie" },
    { code: "SEZ", name: "Victoria" },
    { code: "SHO", name: "Mpaka" },
    { code: "SID", name: "Espargos" },
    { code: "SKO", name: "Sokoto" },
    { code: "SPX", name: "Al Jiza" },
    { code: "SRX", name: "Sirt" },
    { code: "SSG", name: "Malabo" },
    { code: "TET", name: "Tete" },
    { code: "TFN", name: "Tenerife" },
    { code: "TFS", name: "Tenerife" },
    { code: "TLM", name: "Zenata" },
    { code: "TML", name: "Tamale" },
    { code: "TMM", name: "Toamasina" },
    { code: "TMR", name: "Tamanrasset" },
    { code: "TMS", name: "S\xE3o Tom\xE9" },
    { code: "TNG", name: "Tangier" },
    { code: "TNR", name: "Antananarivo" },
    { code: "TOM", name: "Timbuktu" },
    { code: "TTU", name: "T\xE9touan" },
    { code: "TUN", name: "Tunis" },
    { code: "VFA", name: "Victoria Falls" },
    { code: "VIL", name: "Dakhla" },
    { code: "VXE", name: "S\xE3o Pedro" },
    { code: "WDH", name: "Windhoek" },
    { code: "WVB", name: "Walvis Bay(Rooikop)" },
    { code: "ZNZ", name: "Zanzibar" },
    { code: "ZSE", name: "Saint-Pierre" },
    { code: "ABK", name: "Kebri Dahar" },
    { code: "ABS", name: "Abu Simbel" },
    { code: "AHU", name: "Al Hoceima" },
    { code: "AJN", name: "Ouani" },
    { code: "AKF", name: "Kufra" },
    { code: "AKR", name: "Akure" },
    { code: "AMH", name: "Arba Minch" },
    { code: "ARK", name: "Arusha" },
    { code: "ASI", name: "Cat Hill" },
    { code: "ASM", name: "Asmara" },
    { code: "ASO", name: "Asosa" },
    { code: "ASV", name: "Ol Tukai" },
    { code: "AXU", name: "Axum" },
    { code: "AZR", name: "Adrar" },
    { code: "BBO", name: "Berbera" },
    { code: "BCO", name: "Jinka" },
    { code: "BDT", name: "Gbadolite" },
    { code: "BJR", name: "Bahir Dar" },
    { code: "BMW", name: "Bordj Badji Mokhtar" },
    { code: "BNI", name: "Benin" },
    { code: "BPY", name: "Besalampy" },
    { code: "BUX", name: "Bunia" },
    { code: "BYK", name: "Bouak\xE9" },
    { code: "CAB", name: "Cabinda" },
    { code: "CBH", name: "B\xE9char" },
    { code: "CBQ", name: "Calabar" },
    { code: "CBT", name: "Catumbela" },
    { code: "CCE", name: "New Cairo" },
    { code: "CSK", name: "Cap Skirring" },
    { code: "DIE", name: "Antisiranana" },
    { code: "DKA", name: "Katsina" },
    { code: "DOD", name: "Dodoma" },
    { code: "DOG", name: "Dongola" },
    { code: "DUE", name: "Chitato" },
    { code: "EBD", name: "El-Obeid" },
    { code: "ELF", name: "El Fasher" },
    { code: "ELG", name: "El Menia" },
    { code: "ELU", name: "Guemar" },
    { code: "ERH", name: "Errachidia" },
    { code: "ERS", name: "Windhoek" },
    { code: "ESU", name: "Essaouira" },
    { code: "FDU", name: "Bandundu" },
    { code: "FMI", name: "Kalemie" },
    { code: "FTU", name: "T\xF4lanaro" },
    { code: "GAQ", name: "Gao" },
    { code: "GDE", name: "Gode" },
    { code: "GDQ", name: "Azezo" },
    { code: "GEM", name: "Mengomey\xE9n" },
    { code: "GHA", name: "El Atteuf" },
    { code: "GID", name: "Gitega" },
    { code: "GMA", name: "Gemena" },
    { code: "GMB", name: "Gambela" },
    { code: "GMO", name: "Gombe" },
    { code: "GXG", name: "Negage" },
    { code: "HDS", name: "Hoedspruit" },
    { code: "HGO", name: "Korhogo" },
    { code: "HLE", name: "Jamestown" },
    { code: "HME", name: "Hassi Messaoud" },
    { code: "IAM", name: "In Am\xE9nas" },
    { code: "IBA", name: "Ibadan" },
    { code: "INH", name: "Inhambane" },
    { code: "INZ", name: "In Salah" },
    { code: "IRP", name: "Isiro" },
    { code: "JIM", name: "Jimma" },
    { code: "JOS", name: "Jos" },
    { code: "KAB", name: "Kariba" },
    { code: "KGA", name: "Kananga" },
    { code: "KHX", name: "Kihihi" },
    { code: "KKW", name: "Kikwit" },
    { code: "KME", name: "Kamembe" },
    { code: "KND", name: "Kindu" },
    { code: "KSL", name: "Kassala" },
    { code: "KWZ", name: "Kolwezi" },
    { code: "KYS", name: "Kayes" },
    { code: "LAU", name: "Lamu" },
    { code: "LOO", name: "Laghouat" },
    { code: "LTD", name: "Ghadames" },
    { code: "LUD", name: "Luderitz" },
    { code: "MAK", name: "Malakal" },
    { code: "MBD", name: "Mafeking" },
    { code: "MBI", name: "Mbeya" },
    { code: "MDI", name: "Makurdi" },
    { code: "MDK", name: "Mbandaka" },
    { code: "MEG", name: "Malanje" },
    { code: "MGH", name: "Margate" },
    { code: "MIR", name: "Monastir" },
    { code: "MJM", name: "Mbuji Mayi" },
    { code: "MKU", name: "Makokou" },
    { code: "MLN", name: "Melilla" },
    { code: "MLW", name: "Monrovia" },
    { code: "MMO", name: "Vila do Maio" },
    { code: "MNC", name: "Nacala" },
    { code: "MNJ", name: "Mananjary" },
    { code: "MOQ", name: "Morondava" },
    { code: "MPA", name: "Mpacha" },
    { code: "MQX", name: "Mekele" },
    { code: "MRE", name: "Serena" },
    { code: "MSZ", name: "Mo\xE7\xE2medes" },
    { code: "MVB", name: "Franceville" },
    { code: "MVR", name: "Maroua" },
    { code: "MYD", name: "Malindi" },
    { code: "MYW", name: "Mtwara" },
    { code: "MZI", name: "S\xE9var\xE9" },
    { code: "MZQ", name: "Mkuze" },
    { code: "MZW", name: "Mecheria" },
    { code: "NBE", name: "Enfidha" },
    { code: "NDU", name: "Rundu" },
    { code: "NGE", name: "N'Gaound\xE9r\xE9" },
    { code: "NOV", name: "Huambo" },
    { code: "NYI", name: "Sunyani" },
    { code: "NYK", name: "Gathiuru" },
    { code: "OGX", name: "Ouargla" },
    { code: "OMD", name: "Oranjemund" },
    { code: "OND", name: "Ondangwa" },
    { code: "OUZ", name: "Zou\xE9rate" },
    { code: "OYE", name: "Oyem" },
    { code: "PCP", name: "S\xE3o Tom\xE9 & Pr\xEDncipe" },
    { code: "PHG", name: "Port Harcourt" },
    { code: "PHW", name: "Phalaborwa" },
    { code: "POL", name: "Pemba" },
    { code: "PRI", name: "Praslin Island" },
    { code: "PZB", name: "Pietermaritzburg" },
    { code: "QOW", name: "Owerri" },
    { code: "QRW", name: "Okpe" },
    { code: "QSF", name: "S\xE9tif" },
    { code: "QUO", name: "Uyo" },
    { code: "RCB", name: "Richards Bay" },
    { code: "RRG", name: "Port Mathurin" },
    { code: "RUA", name: "Arua" },
    { code: "SDD", name: "Lubango" },
    { code: "SEB", name: "Sabha" },
    { code: "SFA", name: "Sfax" },
    { code: "SIS", name: "Sishen" },
    { code: "SMS", name: "Vohilava" },
    { code: "SMW", name: "Smara" },
    { code: "SNE", name: "Pregui\xE7a" },
    { code: "SPC", name: "Sta Cruz de la Palma, La Palma Island" },
    { code: "SPP", name: "Menongue" },
    { code: "SPY", name: "San Pedro" },
    { code: "SRT", name: "Soroti" },
    { code: "SSY", name: "Mbanza Congo" },
    { code: "SVB", name: "Sambava" },
    { code: "SZA", name: "Soyo" },
    { code: "SZK", name: "Skukuza" },
    { code: "TBJ", name: "Tabarka" },
    { code: "TEE", name: "T\xE9bessi" },
    { code: "TGR", name: "Touggourt" },
    { code: "TGT", name: "Tanga" },
    { code: "TIN", name: "Tindouf" },
    { code: "TKD", name: "Sekondi-Takoradi" },
    { code: "TLE", name: "Toliara" },
    { code: "TMX", name: "Timimoun" },
    { code: "TOE", name: "Tozeur" },
    { code: "TTA", name: "Tan Tan" },
    { code: "UAR", name: "Bouarfa" },
    { code: "UEL", name: "Quelimane" },
    { code: "ULU", name: "Gulu" },
    { code: "UTN", name: "Upington" },
    { code: "UTT", name: "Mthatha" },
    { code: "UYL", name: "Nyala" },
    { code: "VDE", name: "El Hierro Island" },
    { code: "VNX", name: "Vilanculo" },
    { code: "VPE", name: "Ngiva" },
    { code: "VPY", name: "Chimoio" },
    { code: "VVZ", name: "Illizi" },
    { code: "VXC", name: "Lichinga" },
    { code: "WIL", name: "Nairobi" },
    { code: "WJR", name: "Wajir" },
    { code: "WMN", name: "Maroantsetra" },
    { code: "WUU", name: "Wau" },
    { code: "YOL", name: "Yola" },
    { code: "ZIG", name: "Ziguinchor" },
    { code: "ZND", name: "Zinder" },
    // ── North America ──
    { code: "ABQ", name: "Albuquerque" },
    { code: "ACA", name: "Acapulco" },
    { code: "ADZ", name: "San Andr\xE9s" },
    { code: "AGU", name: "Aguascalientes" },
    { code: "ALB", name: "Albany" },
    { code: "ANC", name: "Anchorage" },
    { code: "ANU", name: "Osbourn" },
    { code: "ATL", name: "Atlanta" },
    { code: "AUA", name: "Oranjestad" },
    { code: "AUS", name: "Austin" },
    { code: "BDA", name: "Hamilton" },
    { code: "BDL", name: "Hartford" },
    { code: "BGI", name: "Bridgetown" },
    { code: "BHM", name: "Birmingham" },
    { code: "BJX", name: "Silao" },
    { code: "BNA", name: "Nashville" },
    { code: "BOI", name: "Boise" },
    { code: "BON", name: "Kralendijk" },
    { code: "BOS", name: "Boston" },
    { code: "BUF", name: "Buffalo" },
    { code: "BUR", name: "Burbank" },
    { code: "BWI", name: "Baltimore" },
    { code: "BZE", name: "Belize City" },
    { code: "CAP", name: "Cap Haitien" },
    { code: "CHS", name: "Charleston" },
    { code: "CJS", name: "Ciudad Ju\xE1rez" },
    { code: "CLE", name: "Cleveland" },
    { code: "CLT", name: "Charlotte" },
    { code: "CMH", name: "Columbus" },
    { code: "CMW", name: "Camaguey" },
    { code: "COS", name: "Colorado Springs" },
    { code: "CUL", name: "Culiac\xE1n" },
    { code: "CUN", name: "Canc\xFAn" },
    { code: "CUR", name: "Willemstad" },
    { code: "CUU", name: "Chihuahua" },
    { code: "CVG", name: "Cincinnati / Covington" },
    { code: "CZM", name: "Cozumel" },
    { code: "DAL", name: "Dallas" },
    { code: "DCA", name: "Washington (Reagan)" },
    { code: "DEN", name: "Denver" },
    { code: "DFW", name: "Dallas-Fort Worth" },
    { code: "DJT", name: "West Palm Beach" },
    { code: "DSM", name: "Des Moines" },
    { code: "DTW", name: "Detroit" },
    { code: "EIS", name: "Beef Island" },
    { code: "ELP", name: "El Paso" },
    { code: "EWR", name: "New York (Newark)" },
    { code: "FAT", name: "Fresno" },
    { code: "FDF", name: "Fort-de-France" },
    { code: "FLL", name: "Fort Lauderdale" },
    { code: "FPO", name: "Freeport" },
    { code: "GCM", name: "George Town" },
    { code: "GDL", name: "Guadalajara" },
    { code: "GEG", name: "Spokane" },
    { code: "GND", name: "Saint George's" },
    { code: "GOH", name: "Nuuk" },
    { code: "GRR", name: "Grand Rapids" },
    { code: "GSO", name: "Greensboro" },
    { code: "GUA", name: "Guatemala City" },
    { code: "HAV", name: "Havana" },
    { code: "HMO", name: "Hermosillo" },
    { code: "HOG", name: "Holguin" },
    { code: "HOU", name: "Houston" },
    { code: "HUX", name: "Huatulco" },
    { code: "IAD", name: "Washington (Dulles)" },
    { code: "IAH", name: "Houston" },
    { code: "IND", name: "Indianapolis" },
    { code: "JAX", name: "Jacksonville" },
    { code: "JFK", name: "New York (JFK)" },
    { code: "KIN", name: "Kingston" },
    { code: "LAS", name: "Las Vegas" },
    { code: "LAX", name: "Los Angeles" },
    { code: "LGA", name: "New York (LaGuardia)" },
    { code: "LGB", name: "Long Beach" },
    { code: "LIR", name: "Liberia" },
    { code: "LRM", name: "La Romana" },
    { code: "LTO", name: "Loreto" },
    { code: "MBJ", name: "Montego Bay" },
    { code: "MCI", name: "Kansas City" },
    { code: "MCO", name: "Orlando" },
    { code: "MDW", name: "Chicago (Midway)" },
    { code: "MEM", name: "Memphis" },
    { code: "MEX", name: "Mexico City" },
    { code: "MGA", name: "Managua" },
    { code: "MIA", name: "Miami" },
    { code: "MID", name: "M\xE9rida" },
    { code: "MKE", name: "Milwaukee" },
    { code: "MLM", name: "Morelia" },
    { code: "MNI", name: "Gerald's Park" },
    { code: "MSP", name: "Minneapolis" },
    { code: "MSY", name: "New Orleans" },
    { code: "MTY", name: "Monterrey" },
    { code: "MYR", name: "Myrtle Beach" },
    { code: "MZT", name: "Mazatl\xE0n" },
    { code: "NAS", name: "Nassau" },
    { code: "NLU", name: "Mexico City" },
    { code: "OAK", name: "Oakland" },
    { code: "OAX", name: "Oaxaca" },
    { code: "OKC", name: "Oklahoma City" },
    { code: "OMA", name: "Omaha" },
    { code: "ONT", name: "Ontario" },
    { code: "ORD", name: "Chicago (O\\'Hare)" },
    { code: "ORF", name: "Norfolk" },
    { code: "PAP", name: "Port-au-Prince" },
    { code: "PBC", name: "Puebla" },
    { code: "PDX", name: "Portland" },
    { code: "PHL", name: "Philadelphia" },
    { code: "PHX", name: "Phoenix" },
    { code: "PIE", name: "Pinellas Park" },
    { code: "PIT", name: "Pittsburgh" },
    { code: "PLS", name: "Providenciales" },
    { code: "PMV", name: "Isla Margarita" },
    { code: "PNS", name: "Pensacola" },
    { code: "POS", name: "Port of Spain" },
    { code: "PSP", name: "Palm Springs" },
    { code: "PTP", name: "Pointe-\xE0-Pitre" },
    { code: "PTY", name: "Tocumen" },
    { code: "PUJ", name: "Punta Cana" },
    { code: "PVD", name: "Providence/Warwick" },
    { code: "PVR", name: "Puerto Vallarta" },
    { code: "PWM", name: "Portland" },
    { code: "QRO", name: "Quer\xE9taro" },
    { code: "RDU", name: "Raleigh/Durham" },
    { code: "RIC", name: "Richmond" },
    { code: "RNO", name: "Reno" },
    { code: "ROC", name: "Rochester" },
    { code: "RSW", name: "Fort Myers" },
    { code: "RTB", name: "Coxen Hole" },
    { code: "SAL", name: "San Salvador (San Luis Talpa)" },
    { code: "SAN", name: "San Diego" },
    { code: "SAP", name: "San Pedro Sula" },
    { code: "SAT", name: "San Antonio" },
    { code: "SAV", name: "Savannah" },
    { code: "SBD", name: "San Bernardino" },
    { code: "SCU", name: "Santiago" },
    { code: "SDF", name: "Louisville" },
    { code: "SDQ", name: "Santo Domingo" },
    { code: "SEA", name: "Seattle" },
    { code: "SFB", name: "Orlando" },
    { code: "SFO", name: "San Francisco" },
    { code: "SJC", name: "San Jose" },
    { code: "SJD", name: "San Jos\xE9 del Cabo" },
    { code: "SJO", name: "San Jos\xE9 (Alajuela)" },
    { code: "SJU", name: "San Juan" },
    { code: "SKB", name: "Basseterre" },
    { code: "SLC", name: "Salt Lake City" },
    { code: "SMF", name: "Sacramento" },
    { code: "SNA", name: "Santa Ana" },
    { code: "SNU", name: "Santa Clara" },
    { code: "SRQ", name: "Sarasota/Bradenton" },
    { code: "STI", name: "Santiago" },
    { code: "STL", name: "St Louis" },
    { code: "STT", name: "Charlotte Amalie" },
    { code: "SVD", name: "Kingstown" },
    { code: "SXM", name: "Sint Maarten" },
    { code: "SYR", name: "Syracuse" },
    { code: "TAB", name: "Scarborough" },
    { code: "TIJ", name: "Tijuana" },
    { code: "TLC", name: "Toluca" },
    { code: "TPA", name: "Tampa" },
    { code: "TQO", name: "Tulum" },
    { code: "TUL", name: "Tulsa" },
    { code: "TUS", name: "Tucson" },
    { code: "TYS", name: "Knoxville/Maryville" },
    { code: "UVF", name: "Vieux Fort" },
    { code: "VER", name: "Veracruz" },
    { code: "VRA", name: "Matanzas" },
    { code: "VSA", name: "Villahermosa" },
    { code: "XPL", name: "Palmerola" },
    { code: "YEG", name: "Edmonton" },
    { code: "YHM", name: "Hamilton" },
    { code: "YHZ", name: "Halifax" },
    { code: "YLW", name: "Kelowna" },
    { code: "YOW", name: "Ottawa" },
    { code: "YQB", name: "Quebec" },
    { code: "YQG", name: "Windsor" },
    { code: "YUL", name: "Montr\xE9al" },
    { code: "YVR", name: "Vancouver" },
    { code: "YWG", name: "Winnipeg" },
    { code: "YXE", name: "Saskatoon" },
    { code: "YYC", name: "Calgary" },
    { code: "YYJ", name: "Victoria" },
    { code: "YYT", name: "St. John's" },
    { code: "YYZ", name: "Toronto" },
    { code: "ZIH", name: "Ixtapa" },
    { code: "ZSA", name: "San Salvador" },
    { code: "ABE", name: "Allentown/Bethlehem" },
    { code: "ABI", name: "Abilene" },
    { code: "ABL", name: "Ambler" },
    { code: "ABR", name: "Aberdeen" },
    { code: "ABY", name: "Albany" },
    { code: "ACK", name: "Nantucket" },
    { code: "ACT", name: "Waco" },
    { code: "ACV", name: "Arcata/Eureka" },
    { code: "ACY", name: "Atlantic City" },
    { code: "ADK", name: "Adak" },
    { code: "ADQ", name: "Kodiak" },
    { code: "AEX", name: "Alexandria" },
    { code: "AGS", name: "Augusta" },
    { code: "AIA", name: "Alliance" },
    { code: "AIN", name: "Wainwright" },
    { code: "AKN", name: "King Salmon" },
    { code: "AKP", name: "Anaktuvuk Pass" },
    { code: "ALO", name: "Waterloo" },
    { code: "ALS", name: "Alamosa" },
    { code: "ALW", name: "Walla Walla" },
    { code: "AMA", name: "Amarillo" },
    { code: "ANI", name: "Aniak" },
    { code: "ANV", name: "Anvik" },
    { code: "AOO", name: "Altoona" },
    { code: "APN", name: "Alpena" },
    { code: "ARC", name: "Arctic Village" },
    { code: "ART", name: "Watertown" },
    { code: "ASD", name: "Andros Town" },
    { code: "ASE", name: "Aspen" },
    { code: "ATC", name: "Arthur's Town" },
    { code: "ATK", name: "Atqasuk" },
    { code: "ATW", name: "Appleton" },
    { code: "ATY", name: "Watertown" },
    { code: "AUG", name: "Augusta" },
    { code: "AVL", name: "Asheville" },
    { code: "AVP", name: "Wilkes-Barre/Scranton" },
    { code: "AXA", name: "The Valley" },
    { code: "AXP", name: "Spring Point" },
    { code: "AZA", name: "Mesa" },
    { code: "AZO", name: "Kalamazoo" },
    { code: "AZS", name: "Samana" },
    { code: "BBQ", name: "Codrington" },
    { code: "BCA", name: "Baracoa" },
    { code: "BED", name: "Bedford" },
    { code: "BEF", name: "Bluefields" },
    { code: "BET", name: "Bethel" },
    { code: "BFD", name: "Bradford" },
    { code: "BFF", name: "Scottsbluff" },
    { code: "BFI", name: "Seattle" },
    { code: "BFL", name: "Bakersfield" },
    { code: "BGM", name: "Binghamton" },
    { code: "BGR", name: "Bangor" },
    { code: "BHB", name: "Bar Harbor" },
    { code: "BIH", name: "Bishop" },
    { code: "BIL", name: "Billings" },
    { code: "BIM", name: "South Bimini" },
    { code: "BIS", name: "Bismarck" },
    { code: "BJC", name: "Denver" },
    { code: "BKG", name: "Branson" },
    { code: "BKW", name: "Beaver" },
    { code: "BLD", name: "Boulder City" },
    { code: "BLI", name: "Bellingham" },
    { code: "BLV", name: "Belleville" },
    { code: "BMI", name: "Bloomington/Normal" },
    { code: "BOC", name: "Isla Col\xF3n" },
    { code: "BPT", name: "Beaumont/Port Arthur" },
    { code: "BQK", name: "Brunswick" },
    { code: "BQN", name: "Aguadilla" },
    { code: "BQU", name: "Bequia" },
    { code: "BRD", name: "Brainerd" },
    { code: "BRL", name: "Burlington" },
    { code: "BRO", name: "Brownsville" },
    { code: "BRW", name: "Utqia\u0121vik" },
    { code: "BRX", name: "Barahona" },
    { code: "BTI", name: "Barter Island" },
    { code: "BTM", name: "Butte" },
    { code: "BTR", name: "Baton Rouge" },
    { code: "BTV", name: "Burlington" },
    { code: "BYM", name: "Bayamo" },
    { code: "BZN", name: "Bozeman" },
    { code: "CAE", name: "Columbia" },
    { code: "CAK", name: "Akron" },
    { code: "CCC", name: "Cayo Coco" },
    { code: "CCR", name: "Concord" },
    { code: "CCZ", name: "Chub Cay" },
    { code: "CDB", name: "Cold Bay" },
    { code: "CDC", name: "Cedar City" },
    { code: "CDR", name: "Chadron" },
    { code: "CDV", name: "Cordova" },
    { code: "CEC", name: "Crescent City" },
    { code: "CEN", name: "Ciudad Obreg\xF3n" },
    { code: "CEZ", name: "Cortez" },
    { code: "CFG", name: "Cienfuegos" },
    { code: "CGI", name: "Cape Girardeau" },
    { code: "CHA", name: "Chattanooga" },
    { code: "CHO", name: "Charlottesville" },
    { code: "CHX", name: "Changuinola" },
    { code: "CID", name: "Cedar Rapids" },
    { code: "CIU", name: "Kincheloe" },
    { code: "CIW", name: "Canouan" },
    { code: "CKB", name: "Bridgeport" },
    { code: "CLD", name: "Carlsbad" },
    { code: "CLL", name: "College Station" },
    { code: "CLQ", name: "Colima" },
    { code: "CME", name: "Ciudad del Carmen" },
    { code: "CMI", name: "Savoy" },
    { code: "CMX", name: "Hancock" },
    { code: "CNM", name: "Carlsbad" },
    { code: "CNP", name: "Neerlerit Inaat" },
    { code: "CNY", name: "Moab" },
    { code: "COD", name: "Cody" },
    { code: "COU", name: "Columbia" },
    { code: "CPE", name: "Campeche" },
    { code: "CPR", name: "Casper" },
    { code: "CPX", name: "Culebra" },
    { code: "CRI", name: "Colonel Hill" },
    { code: "CRP", name: "Corpus Christi" },
    { code: "CRW", name: "Charleston" },
    { code: "CSG", name: "Columbus" },
    { code: "CSW", name: "Cabo San Lucas" },
    { code: "CTD", name: "Chitr\xE9" },
    { code: "CTM", name: "Chetumal" },
    { code: "CUK", name: "Caye Caulker" },
    { code: "CVM", name: "Ciudad Victoria" },
    { code: "CVN", name: "Clovis" },
    { code: "CWA", name: "Mosinee" },
    { code: "CYA", name: "Les Cayes" },
    { code: "CYB", name: "West End" },
    { code: "CYC", name: "Caye Chapel" },
    { code: "CYO", name: "Cayo Largo del Sur" },
    { code: "CYS", name: "Cheyenne" },
    { code: "CZH", name: "Corozal" },
    { code: "DAB", name: "Daytona Beach" },
    { code: "DAV", name: "David" },
    { code: "DAY", name: "Dayton" },
    { code: "DBQ", name: "Dubuque" },
    { code: "DCF", name: "Canefield" },
    { code: "DDC", name: "Dodge City" },
    { code: "DEC", name: "Decatur" },
    { code: "DGA", name: "Dangriga" },
    { code: "DGO", name: "Durango" },
    { code: "DHN", name: "Dothan" },
    { code: "DIK", name: "Dickinson" },
    { code: "DLG", name: "Dillingham" },
    { code: "DLH", name: "Duluth" },
    { code: "DOM", name: "Marigot" },
    { code: "DOV", name: "Dover" },
    { code: "DRG", name: "Deering" },
    { code: "DRO", name: "Durango" },
    { code: "DSI", name: "Destin" },
    { code: "DUJ", name: "Dubois" },
    { code: "DUT", name: "Unalaska" },
    { code: "DVL", name: "Devils Lake" },
    { code: "EAR", name: "Kearney" },
    { code: "EAT", name: "Wenatchee" },
    { code: "EAU", name: "Eau Claire" },
    { code: "ECP", name: "Panama City Beach" },
    { code: "EGE", name: "Eagle" },
    { code: "EGX", name: "Egegik" },
    { code: "EKO", name: "Elko" },
    { code: "ELD", name: "El Dorado" },
    { code: "ELH", name: "North Eleuthera" },
    { code: "ELM", name: "Elmira/Corning" },
    { code: "EMK", name: "Emmonak" },
    { code: "ENA", name: "Kenai" },
    { code: "ERI", name: "Erie" },
    { code: "ESC", name: "Escanaba" },
    { code: "ESD", name: "Eastsound" },
    { code: "EUG", name: "Eugene" },
    { code: "EUX", name: "Oranjestad" },
    { code: "EVV", name: "Evansville" },
    { code: "EWB", name: "New Bedford" },
    { code: "EWN", name: "New Bern" },
    { code: "EYW", name: "Key West" },
    { code: "FAI", name: "Fairbanks" },
    { code: "FAR", name: "Fargo" },
    { code: "FAY", name: "Fayetteville" },
    { code: "FCA", name: "Kalispell" },
    { code: "FLG", name: "Flagstaff" },
    { code: "FLO", name: "Florence" },
    { code: "FNT", name: "Flint" },
    { code: "FOD", name: "Fort Dodge" },
    { code: "FON", name: "La Fortuna" },
    { code: "FRD", name: "Friday Harbor" },
    { code: "FRS", name: "San Benito" },
    { code: "FSD", name: "Sioux Falls" },
    { code: "FSM", name: "Fort Smith" },
    { code: "FSP", name: "Saint-Pierre" },
    { code: "FTW", name: "Fort Worth" },
    { code: "FWA", name: "Fort Wayne" },
    { code: "FYU", name: "Fort Yukon" },
    { code: "GAL", name: "Galena" },
    { code: "GAM", name: "Gambell" },
    { code: "GBJ", name: "Grand-Bourg" },
    { code: "GCC", name: "Gillette" },
    { code: "GCK", name: "Garden City" },
    { code: "GCN", name: "Grand Canyon - Tusayan" },
    { code: "GDT", name: "Cockburn Town" },
    { code: "GDV", name: "Glendive" },
    { code: "GER", name: "Nueva Gerona" },
    { code: "GFK", name: "Grand Forks" },
    { code: "GGG", name: "Longview" },
    { code: "GGT", name: "Moss Town" },
    { code: "GGW", name: "Glasgow" },
    { code: "GHB", name: "Governor's Harbour" },
    { code: "GJA", name: "Guanaja" },
    { code: "GJT", name: "Grand Junction" },
    { code: "GKN", name: "Gulkana" },
    { code: "GLF", name: "Golfito" },
    { code: "GLH", name: "Greenville" },
    { code: "GNV", name: "Gainesville" },
    { code: "GPT", name: "Gulfport" },
    { code: "GRB", name: "Green Bay" },
    { code: "GRI", name: "Grand Island" },
    { code: "GRK", name: "Fort Cavazos" },
    { code: "GSP", name: "Greenville/Greer/Spartanburg" },
    { code: "GST", name: "Gustavus" },
    { code: "GTF", name: "Great Falls" },
    { code: "GTR", name: "Columbus/W Point/Starkville" },
    { code: "GUC", name: "Gunnison" },
    { code: "GUP", name: "Gallup" },
    { code: "GYM", name: "Guaymas" },
    { code: "GYY", name: "Gary" },
    { code: "HCR", name: "Holy Cross" },
    { code: "HDN", name: "Hayden" },
    { code: "HGR", name: "Hagerstown" },
    { code: "HHH", name: "Hilton Head Island" },
    { code: "HHR", name: "Hawthorne" },
    { code: "HIB", name: "Hibbing" },
    { code: "HII", name: "Lake Havasu City" },
    { code: "HLN", name: "Helena" },
    { code: "HNS", name: "Haines" },
    { code: "HOB", name: "Hobbs" },
    { code: "HOM", name: "Homer" },
    { code: "HOT", name: "Hot Springs" },
    { code: "HPN", name: "White Plains" },
    { code: "HRL", name: "Harlingen" },
    { code: "HRO", name: "Harrison" },
    { code: "HSL", name: "Huslia" },
    { code: "HSV", name: "Huntsville" },
    { code: "HTS", name: "Huntington" },
    { code: "HVN", name: "New Haven" },
    { code: "HVR", name: "Havre" },
    { code: "HYA", name: "Hyannis" },
    { code: "HYS", name: "Hays" },
    { code: "IAG", name: "Niagara Falls" },
    { code: "IAN", name: "Kiana" },
    { code: "ICT", name: "Wichita" },
    { code: "IDA", name: "Idaho Falls" },
    { code: "IGA", name: "Matthew Town" },
    { code: "ILG", name: "Wilmington" },
    { code: "ILI", name: "Iliamna" },
    { code: "ILM", name: "Wilmington" },
    { code: "ILS", name: "San Salvador" },
    { code: "IMT", name: "Kingsford" },
    { code: "INL", name: "International Falls" },
    { code: "IPL", name: "Imperial" },
    { code: "IPT", name: "Williamsport" },
    { code: "IRK", name: "Kirksville" },
    { code: "ISP", name: "Islip" },
    { code: "ITH", name: "Ithaca" },
    { code: "IZT", name: "Ixtepec" },
    { code: "JAC", name: "Jackson" },
    { code: "JAN", name: "Jackson" },
    { code: "JAV", name: "Ilulissat" },
    { code: "JBQ", name: "La Isabela" },
    { code: "JBR", name: "Jonesboro" },
    { code: "JEE", name: "Carrefour Sanon" },
    { code: "JEG", name: "Aasiaat" },
    { code: "JHS", name: "Sisimiut" },
    { code: "JJU", name: "Qaqortoq" },
    { code: "JLN", name: "Joplin" },
    { code: "JMS", name: "Jamestown" },
    { code: "JNU", name: "Juneau" },
    { code: "JST", name: "Johnstown" },
    { code: "KLW", name: "Klawock" },
    { code: "KTN", name: "Ketchikan" },
    { code: "KTP", name: "Tinson Pen" },
    { code: "KUS", name: "Kulusuk" },
    { code: "LAF", name: "West Lafayette" },
    { code: "LAL", name: "Lakeland" },
    { code: "LAN", name: "Lansing" },
    { code: "LAP", name: "La Paz" },
    { code: "LAR", name: "Laramie" },
    { code: "LAW", name: "Lawton" },
    { code: "LBB", name: "Lubbock" },
    { code: "LBE", name: "Latrobe" },
    { code: "LBF", name: "North Platte" },
    { code: "LBL", name: "Liberal" },
    { code: "LCE", name: "La Ceiba" },
    { code: "LCH", name: "Lake Charles" },
    { code: "LCK", name: "Columbus" },
    { code: "LEB", name: "Lebanon" },
    { code: "LEX", name: "Lexington" },
    { code: "LFT", name: "Lafayette" },
    { code: "LGI", name: "Deadman's Cay" },
    { code: "LIO", name: "Lim\xF3n" },
    { code: "LIT", name: "Little Rock" },
    { code: "LMM", name: "Los Mochis" },
    { code: "LNK", name: "Lincoln" },
    { code: "LNS", name: "Lancaster" },
    { code: "LRD", name: "Laredo" },
    { code: "LRU", name: "Las Cruces" },
    { code: "LSE", name: "La Crosse" },
    { code: "LUK", name: "Cincinnati" },
    { code: "LUR", name: "Cape Lisburne" },
    { code: "LWB", name: "Lewisburg" },
    { code: "LWS", name: "Lewiston" },
    { code: "LYH", name: "Lynchburg" },
    { code: "MAF", name: "Midland" },
    { code: "MAM", name: "Matamoros" },
    { code: "MAZ", name: "Mayaguez" },
    { code: "MBS", name: "Freeland" },
    { code: "MCE", name: "Merced" },
    { code: "MCG", name: "McGrath" },
    { code: "MCK", name: "McCook" },
    { code: "MCN", name: "Macon" },
    { code: "MCW", name: "Mason City" },
    { code: "MDT", name: "Harrisburg" },
    { code: "MEI", name: "Meridian" },
    { code: "MFE", name: "McAllen" },
    { code: "MFR", name: "Medford" },
    { code: "MGC", name: "Michigan City" },
    { code: "MGM", name: "Montgomery" },
    { code: "MGW", name: "Morgantown" },
    { code: "MHH", name: "Marsh Harbour" },
    { code: "MHK", name: "Manhattan" },
    { code: "MHT", name: "Manchester" },
    { code: "MKG", name: "Muskegon" },
    { code: "MKL", name: "Jackson" },
    { code: "MLB", name: "Melbourne" },
    { code: "MLI", name: "Moline" },
    { code: "MLU", name: "Monroe" },
    { code: "MMH", name: "Mammoth Lakes" },
    { code: "MOB", name: "Mobile" },
    { code: "MOT", name: "Minot" },
    { code: "MQS", name: "Lovell" },
    { code: "MQT", name: "Gwinn" },
    { code: "MRI", name: "Anchorage" },
    { code: "MRY", name: "Monterey" },
    { code: "MSL", name: "Muscle Shoals" },
    { code: "MSN", name: "Madison" },
    { code: "MSO", name: "Missoula" },
    { code: "MSS", name: "Massena" },
    { code: "MTJ", name: "Montrose" },
    { code: "MTT", name: "Cosoleacaque" },
    { code: "MWA", name: "Marion" },
    { code: "MWL", name: "Mineral Wells" },
    { code: "MXL", name: "Mexicali" },
    { code: "MYG", name: "Abraham Bay Settlement" },
    { code: "MYL", name: "McCall" },
    { code: "MYU", name: "Mekoryuk" },
    { code: "MZO", name: "Manzanillo" },
    { code: "NAQ", name: "Qaanaaq" },
    { code: "NCA", name: "North Caicos" },
    { code: "NEV", name: "Charlestown" },
    { code: "NLD", name: "Nuevo Laredo" },
    { code: "NOB", name: "Nicoya" },
    { code: "NPT", name: "Newport" },
    { code: "NRR", name: "Ceiba" },
    { code: "NUI", name: "Nuiqsut" },
    { code: "OAJ", name: "Richlands" },
    { code: "OCE", name: "Ocean City" },
    { code: "OCJ", name: "Boscobel" },
    { code: "OGD", name: "Ogden" },
    { code: "OGS", name: "Ogdensburg" },
    { code: "OLF", name: "Wolf Point" },
    { code: "OLM", name: "Olympia" },
    { code: "OME", name: "Nome" },
    { code: "ONX", name: "Col\xF3n" },
    { code: "OPF", name: "Miami" },
    { code: "ORH", name: "Worcester" },
    { code: "ORT", name: "Northway" },
    { code: "OTH", name: "North Bend" },
    { code: "OTZ", name: "Kotzebue" },
    { code: "OWB", name: "Owensboro" },
    { code: "PAC", name: "Albrook" },
    { code: "PAE", name: "Everett" },
    { code: "PAH", name: "Paducah" },
    { code: "PAZ", name: "Poza Rica" },
    { code: "PBG", name: "Plattsburgh" },
    { code: "PBR", name: "Puerto Barrios" },
    { code: "PDK", name: "Atlanta" },
    { code: "PDS", name: "Piedras Negras" },
    { code: "PDT", name: "Pendleton" },
    { code: "PGA", name: "Page" },
    { code: "PGD", name: "Punta Gorda" },
    { code: "PGV", name: "Greenville" },
    { code: "PHF", name: "Newport News" },
    { code: "PIA", name: "Peoria" },
    { code: "PIB", name: "Moselle" },
    { code: "PIH", name: "Pocatello" },
    { code: "PIR", name: "Pierre" },
    { code: "PIZ", name: "Point Lay" },
    { code: "PJM", name: "Puerto Jimenez" },
    { code: "PKB", name: "Parkersburg (Williamstown)" },
    { code: "PLJ", name: "Placencia" },
    { code: "PLN", name: "Pellston" },
    { code: "POP", name: "Puerto Plata" },
    { code: "PQI", name: "Presque Isle" },
    { code: "PRC", name: "Prescott" },
    { code: "PSC", name: "Pasco" },
    { code: "PSE", name: "Ponce" },
    { code: "PSG", name: "Petersburg" },
    { code: "PSM", name: "Portsmouth" },
    { code: "PTH", name: "Port Heiden" },
    { code: "PTU", name: "Platinum" },
    { code: "PUB", name: "Pueblo" },
    { code: "PUW", name: "Pullman" },
    { code: "PUZ", name: "Puerto Cabezas" },
    { code: "PVA", name: "Providencia" },
    { code: "PVU", name: "Provo" },
    { code: "PXM", name: "Puerto Escondido" },
    { code: "QBC", name: "Bella Coola" },
    { code: "RAP", name: "Rapid City" },
    { code: "RBY", name: "Ruby" },
    { code: "RDD", name: "Redding" },
    { code: "RDM", name: "Redmond" },
    { code: "RER", name: "Retalhuleu" },
    { code: "REX", name: "Reynosa" },
    { code: "RFD", name: "Chicago/Rockford" },
    { code: "RHI", name: "Rhinelander" },
    { code: "RIW", name: "Riverton" },
    { code: "RKD", name: "Rockland" },
    { code: "RKS", name: "Rock Springs" },
    { code: "ROA", name: "Roanoke" },
    { code: "ROW", name: "Roswell" },
    { code: "RSD", name: "Rock Sound" },
    { code: "RST", name: "Rochester" },
    { code: "RUT", name: "Rutland" },
    { code: "SAB", name: "Zion's Hill" },
    { code: "SAF", name: "Santa Fe" },
    { code: "SAQ", name: "Andros Island" },
    { code: "SBA", name: "Santa Barbara" },
    { code: "SBH", name: "Gustavia" },
    { code: "SBN", name: "South Bend" },
    { code: "SBP", name: "San Luis Obispo" },
    { code: "SBY", name: "Salisbury" },
    { code: "SCC", name: "Deadhorse" },
    { code: "SCE", name: "State College" },
    { code: "SCK", name: "Stockton" },
    { code: "SDP", name: "Sand Point" },
    { code: "SDY", name: "Sidney" },
    { code: "SFG", name: "Grand Case" },
    { code: "SFJ", name: "Kangerlussuaq" },
    { code: "SGF", name: "Springfield" },
    { code: "SGU", name: "St George" },
    { code: "SHD", name: "Weyers Cave" },
    { code: "SHR", name: "Sheridan" },
    { code: "SHV", name: "Shreveport" },
    { code: "SIG", name: "San Juan" },
    { code: "SIT", name: "Sitka" },
    { code: "SJT", name: "San Angelo" },
    { code: "SLE", name: "Salem" },
    { code: "SLK", name: "Saranac Lake" },
    { code: "SLN", name: "Salina" },
    { code: "SLP", name: "San Luis Potos\xED" },
    { code: "SLU", name: "Castries" },
    { code: "SLW", name: "Saltillo" },
    { code: "SML", name: "Stella Maris" },
    { code: "SMN", name: "Salmon" },
    { code: "SMX", name: "Santa Maria" },
    { code: "SNP", name: "St Paul Island" },
    { code: "SOW", name: "Show Low" },
    { code: "SPI", name: "Springfield" },
    { code: "SPR", name: "San Pedro" },
    { code: "SPS", name: "Wichita Falls" },
    { code: "SQL", name: "San Carlos" },
    { code: "STC", name: "Saint Cloud" },
    { code: "STG", name: "St George" },
    { code: "STS", name: "Santa Rosa" },
    { code: "STX", name: "Christiansted" },
    { code: "SUN", name: "Hailey" },
    { code: "SUX", name: "Sioux City" },
    { code: "SVA", name: "Savoonga" },
    { code: "SVC", name: "Silver City" },
    { code: "SWF", name: "Newburgh" },
    { code: "SWO", name: "Stillwater" },
    { code: "SYQ", name: "San Jose" },
    { code: "TAM", name: "Ciudad Madero" },
    { code: "TAP", name: "Tapachula" },
    { code: "TBI", name: "Cat Island" },
    { code: "TBN", name: "Fort Leonard Wood" },
    { code: "TCB", name: "Treasure Cay" },
    { code: "TEB", name: "Teterboro" },
    { code: "TEX", name: "Telluride" },
    { code: "TGU", name: "Tegucigalpa" },
    { code: "TGZ", name: "Tuxtla Guti\xE9rrez" },
    { code: "TIW", name: "Tacoma" },
    { code: "TKF", name: "Truckee" },
    { code: "TLH", name: "Tallahassee" },
    { code: "TND", name: "Trinidad" },
    { code: "TOL", name: "Toledo" },
    { code: "TPQ", name: "Tepic" },
    { code: "TRC", name: "Torre\xF3n" },
    { code: "TRI", name: "Blountville" },
    { code: "TSM", name: "Taos" },
    { code: "TTN", name: "Ewing Township" },
    { code: "TUP", name: "Tupelo" },
    { code: "TVC", name: "Traverse City" },
    { code: "TVF", name: "Thief River Falls" },
    { code: "TWF", name: "Twin Falls" },
    { code: "TXK", name: "Texarkana" },
    { code: "TYR", name: "Tyler" },
    { code: "TZA", name: "Belize City" },
    { code: "TZN", name: "Andros" },
    { code: "UIN", name: "Quincy" },
    { code: "UNI", name: "Union Island" },
    { code: "UNK", name: "Unalakleet" },
    { code: "UPN", name: "Uruapan" },
    { code: "USA", name: "Concord" },
    { code: "UST", name: "St Augustine" },
    { code: "UTO", name: "Utopia Creek" },
    { code: "VCT", name: "Victoria" },
    { code: "VDZ", name: "Valdez" },
    { code: "VEL", name: "Vernal" },
    { code: "VIJ", name: "Spanish Town" },
    { code: "VLD", name: "Valdosta" },
    { code: "VPS", name: "Valparaiso" },
    { code: "VQS", name: "Vieques" },
    { code: "VRB", name: "Vero Beach" },
    { code: "VTU", name: "Las Tunas" },
    { code: "WKK", name: "Aleknagik" },
    { code: "WRG", name: "Wrangell" },
    { code: "WST", name: "Westerly" },
    { code: "WYS", name: "West Yellowstone" },
    { code: "XKS", name: "Kasabonika" },
    { code: "XNA", name: "Fayetteville/Springdale/Rogers" },
    { code: "XQP", name: "Quepos" },
    { code: "XQU", name: "Qualicum Beach" },
    { code: "XSC", name: "South Caicos" },
    { code: "XWA", name: "Williston" },
    { code: "YAA", name: "Anahim Lake" },
    { code: "YAG", name: "Fort Frances" },
    { code: "YAK", name: "Yakutat" },
    { code: "YAM", name: "Sault Ste Marie" },
    { code: "YAY", name: "St. Anthony" },
    { code: "YAZ", name: "Tofino" },
    { code: "YBC", name: "Baie-Comeau" },
    { code: "YBG", name: "Saguenay" },
    { code: "YBK", name: "Baker Lake" },
    { code: "YBL", name: "Campbell River" },
    { code: "YBR", name: "Brandon" },
    { code: "YBX", name: "Blanc-Sablon" },
    { code: "YBY", name: "Bonnyville" },
    { code: "YCB", name: "Cambridge Bay" },
    { code: "YCD", name: "Nanaimo" },
    { code: "YCG", name: "Castlegar" },
    { code: "YCM", name: "Niagara-on-the-Lake" },
    { code: "YDA", name: "Dawson City" },
    { code: "YDF", name: "Deer Lake" },
    { code: "YDN", name: "Dauphin" },
    { code: "YEV", name: "Inuvik" },
    { code: "YFB", name: "Iqaluit" },
    { code: "YFC", name: "Fredericton" },
    { code: "YFS", name: "Fort Simpson" },
    { code: "YGL", name: "La Grande Rivi\xE8re" },
    { code: "YGP", name: "Gasp\xE9" },
    { code: "YGR", name: "Les \xCEles-de-la-Madeleine" },
    { code: "YGV", name: "Havre-Saint-Pierre" },
    { code: "YGW", name: "Kuujjuarapik" },
    { code: "YHU", name: "Montr\xE9al" },
    { code: "YHY", name: "Hay River" },
    { code: "YIF", name: "St-Augustin" },
    { code: "YIV", name: "Island Lake" },
    { code: "YKA", name: "Kamloops" },
    { code: "YKF", name: "Breslau" },
    { code: "YKL", name: "Schefferville" },
    { code: "YKM", name: "Yakima" },
    { code: "YLK", name: "Barrie" },
    { code: "YLL", name: "Lloydminster" },
    { code: "YMM", name: "Fort McMurray" },
    { code: "YMO", name: "Moosonee" },
    { code: "YMT", name: "Chibougamau" },
    { code: "YMX", name: "Montr\xE9al" },
    { code: "YNA", name: "Natashquan" },
    { code: "YND", name: "Gatineau" },
    { code: "YNL", name: "Points North Landing" },
    { code: "YOJ", name: "High Level" },
    { code: "YPA", name: "Prince Albert" },
    { code: "YPE", name: "Peace River" },
    { code: "YPL", name: "Pickle Lake" },
    { code: "YPN", name: "Port-Menier" },
    { code: "YPQ", name: "Peterborough" },
    { code: "YPR", name: "Prince Rupert" },
    { code: "YPW", name: "Powell River" },
    { code: "YPX", name: "Puvirnituq" },
    { code: "YPY", name: "Fort Chipewyan" },
    { code: "YPZ", name: "Burns Lake" },
    { code: "YQA", name: "Gravenhurst" },
    { code: "YQD", name: "The Pas" },
    { code: "YQH", name: "Watson Lake" },
    { code: "YQK", name: "Kenora" },
    { code: "YQL", name: "Lethbridge" },
    { code: "YQM", name: "Moncton" },
    { code: "YQN", name: "Nakina" },
    { code: "YQQ", name: "Comox" },
    { code: "YQR", name: "Regina" },
    { code: "YQT", name: "Thunder Bay" },
    { code: "YQU", name: "Grande Prairie" },
    { code: "YQX", name: "Gander" },
    { code: "YQY", name: "Sydney" },
    { code: "YQZ", name: "Quesnel" },
    { code: "YRB", name: "Resolute Bay" },
    { code: "YRJ", name: "Roberval" },
    { code: "YRL", name: "Red Lake" },
    { code: "YRO", name: "Ottawa" },
    { code: "YRT", name: "Rankin Inlet" },
    { code: "YSB", name: "Sudbury" },
    { code: "YSF", name: "Stony Rapids" },
    { code: "YSJ", name: "Saint John" },
    { code: "YSM", name: "Fort Smith" },
    { code: "YTH", name: "Thompson" },
    { code: "YTS", name: "Timmins" },
    { code: "YTZ", name: "Toronto" },
    { code: "YUM", name: "Yuma" },
    { code: "YUX", name: "Sanirajak" },
    { code: "YUY", name: "Rouyn-Noranda" },
    { code: "YVB", name: "Bonaventure" },
    { code: "YVC", name: "La Ronge" },
    { code: "YVO", name: "Val-d'Or" },
    { code: "YVP", name: "Kuujjuaq" },
    { code: "YVQ", name: "Norman Wells" },
    { code: "YVV", name: "Wiarton" },
    { code: "YWK", name: "Wabush" },
    { code: "YWL", name: "Williams Lake" },
    { code: "YXC", name: "Cranbrook" },
    { code: "YXH", name: "Medicine Hat" },
    { code: "YXJ", name: "Fort Saint John" },
    { code: "YXL", name: "Sioux Lookout" },
    { code: "YXS", name: "Prince George" },
    { code: "YXT", name: "Terrace" },
    { code: "YXU", name: "London" },
    { code: "YXX", name: "Abbotsford" },
    { code: "YXY", name: "Whitehorse" },
    { code: "YYB", name: "North Bay" },
    { code: "YYD", name: "Smithers" },
    { code: "YYE", name: "Fort Nelson" },
    { code: "YYF", name: "Penticton" },
    { code: "YYG", name: "Charlottetown" },
    { code: "YYL", name: "Lynn Lake" },
    { code: "YYQ", name: "Churchill" },
    { code: "YYR", name: "Goose Bay" },
    { code: "YYY", name: "Mont-Joli" },
    { code: "YZF", name: "Yellowknife" },
    { code: "YZP", name: "Sandspit" },
    { code: "YZS", name: "Coral Harbour" },
    { code: "YZT", name: "Port Hardy" },
    { code: "YZU", name: "Whitecourt" },
    { code: "YZV", name: "Sept-\xCEles" },
    { code: "ZBF", name: "South Tetagouche" },
    { code: "ZCL", name: "Zacatecas" },
    { code: "ZEL", name: "Bella Bella" },
    { code: "ZLO", name: "Manzanillo" },
    { code: "ZMT", name: "Masset" },
    { code: "ZSJ", name: "Sandy Lake" },
    // ── South America ──
    { code: "AEP", name: "Buenos Aires (Aeroparque)" },
    { code: "AGT", name: "Ciudad del Este" },
    { code: "ANF", name: "Antofagasta" },
    { code: "AQP", name: "Arequipa" },
    { code: "ASU", name: "Asunci\xF3n" },
    { code: "BAQ", name: "Barranquilla" },
    { code: "BEL", name: "Bel\xE9m" },
    { code: "BLA", name: "Barcelona" },
    { code: "BOG", name: "Bogota" },
    { code: "BPS", name: "Porto Seguro" },
    { code: "BRC", name: "San Carlos de Bariloche" },
    { code: "BRM", name: "Barquisimeto" },
    { code: "BSB", name: "Bras\xEDlia" },
    { code: "BVB", name: "Boa Vista" },
    { code: "CAY", name: "Matoury" },
    { code: "CBB", name: "Cochabamba" },
    { code: "CCP", name: "Concepcion" },
    { code: "CCS", name: "Maiquet\xEDa" },
    { code: "CGB", name: "Cuiab\xE1" },
    { code: "CGH", name: "S\xE3o Paulo" },
    { code: "CIX", name: "Chiclayo" },
    { code: "CLO", name: "Cali" },
    { code: "CNF", name: "Belo Horizonte" },
    { code: "COR", name: "Cordoba" },
    { code: "CRD", name: "Comodoro Rivadavia" },
    { code: "CTG", name: "Cartagena" },
    { code: "CUZ", name: "Cusco" },
    { code: "CWB", name: "Curitiba" },
    { code: "ENO", name: "Encarnaci\xF3n" },
    { code: "ESM", name: "Tachina" },
    { code: "EZE", name: "Buenos Aires (Ezeiza)" },
    { code: "FLN", name: "Florian\xF3polis" },
    { code: "FOR", name: "Fortaleza" },
    { code: "GEO", name: "Georgetown" },
    { code: "GIG", name: "Rio de Janeiro (Gale\xE3o)" },
    { code: "GRU", name: "S\xE3o Paulo (Guarulhos)" },
    { code: "GYE", name: "Guayaquil" },
    { code: "GYN", name: "Goi\xE2nia" },
    { code: "IGU", name: "Foz do Igua\xE7u" },
    { code: "IPC", name: "Isla De Pascua" },
    { code: "IQQ", name: "Iquique" },
    { code: "IQT", name: "Iquitos" },
    { code: "JPA", name: "Jo\xE3o Pessoa" },
    { code: "JUJ", name: "San Salvador de Jujuy" },
    { code: "JUL", name: "Juliaca" },
    { code: "LIM", name: "Lima" },
    { code: "LPB", name: "La Paz / El Alto" },
    { code: "MAO", name: "Manaus" },
    { code: "MAR", name: "Maracaibo" },
    { code: "MCZ", name: "Macei\xF3" },
    { code: "MDE", name: "Medell\xEDn" },
    { code: "MDZ", name: "Mendoza" },
    { code: "MVD", name: "Ciudad de la Costa" },
    { code: "NAT", name: "Natal" },
    { code: "NQN", name: "Neuqu\xE9n" },
    { code: "NVT", name: "Navegantes" },
    { code: "ORU", name: "Oruro" },
    { code: "PBM", name: "Paramaribo" },
    { code: "PCL", name: "Pucallpa" },
    { code: "PIO", name: "Pisco" },
    { code: "PMC", name: "Puerto Montt" },
    { code: "POA", name: "Porto Alegre" },
    { code: "PUQ", name: "Punta Arenas" },
    { code: "PVH", name: "Porto Velho" },
    { code: "PZO", name: "Guyana City" },
    { code: "RBR", name: "Rio Branco" },
    { code: "REC", name: "Recife" },
    { code: "RES", name: "Resistencia" },
    { code: "RGL", name: "Rio Gallegos" },
    { code: "ROS", name: "Rosario" },
    { code: "SCL", name: "Santiago" },
    { code: "SDU", name: "Rio de Janeiro" },
    { code: "SLA", name: "Salta" },
    { code: "SLZ", name: "S\xE3o Lu\xEDs" },
    { code: "SNC", name: "Salinas/La Libertad" },
    { code: "SRE", name: "Sucre" },
    { code: "SSA", name: "Salvador" },
    { code: "TRU", name: "Trujillo" },
    { code: "TUC", name: "San Miguel de Tucum\xE1n" },
    { code: "UIO", name: "Quito" },
    { code: "UYU", name: "Quijarro" },
    { code: "VCP", name: "Campinas" },
    { code: "VIX", name: "Vit\xF3ria" },
    { code: "VLN", name: "Valencia" },
    { code: "VVI", name: "Santa Cruz" },
    { code: "ZCO", name: "Temuco" },
    { code: "AAX", name: "Arax\xE1" },
    { code: "AFA", name: "San Rafael" },
    { code: "AFL", name: "Alta Floresta" },
    { code: "AJU", name: "Aracaju" },
    { code: "APO", name: "Carepa" },
    { code: "AQA", name: "Araraquara" },
    { code: "ARI", name: "Arica" },
    { code: "ARU", name: "Ara\xE7atuba" },
    { code: "ATM", name: "Altamira" },
    { code: "AUC", name: "Arauca" },
    { code: "AUX", name: "Aragua\xEDna" },
    { code: "AXM", name: "Armenia" },
    { code: "AYP", name: "Ayacucho" },
    { code: "BBA", name: "Balmaceda" },
    { code: "BGA", name: "Bucaramanga" },
    { code: "BHI", name: "Bah\xEDa Blanca" },
    { code: "BNS", name: "Barinas" },
    { code: "BSC", name: "Bah\xEDa Solano" },
    { code: "BUN", name: "Buenaventura" },
    { code: "BVH", name: "Vilhena" },
    { code: "CAC", name: "Cascavel" },
    { code: "CAJ", name: "Canaima" },
    { code: "CAW", name: "Campos dos Goytacazes" },
    { code: "CGR", name: "Campo Grande" },
    { code: "CHH", name: "Chachapoyas" },
    { code: "CHM", name: "Chimbote" },
    { code: "CIJ", name: "Cobija" },
    { code: "CJA", name: "Cajamarca" },
    { code: "CJC", name: "Calama" },
    { code: "CKS", name: "Parauapebas" },
    { code: "CMG", name: "Corumb\xE1" },
    { code: "CNQ", name: "Corrientes" },
    { code: "CPC", name: "Chapelco/San Martin de los Andes" },
    { code: "CPO", name: "Copiapo" },
    { code: "CPV", name: "Campina Grande" },
    { code: "CTC", name: "Catamarca" },
    { code: "CUC", name: "C\xFAcuta" },
    { code: "CUE", name: "Cuenca" },
    { code: "CUM", name: "Cuman\xE1" },
    { code: "CUP", name: "Car\xFApano" },
    { code: "CXJ", name: "Caxias Do Sul" },
    { code: "CZE", name: "Coro" },
    { code: "CZS", name: "Cruzeiro Do Sul" },
    { code: "CZU", name: "Corozal" },
    { code: "EJA", name: "Barrancabermeja" },
    { code: "EOH", name: "Medell\xEDn" },
    { code: "EQS", name: "Esquel" },
    { code: "ESR", name: "El Salvador" },
    { code: "ETR", name: "Santa Rosa" },
    { code: "EYP", name: "Yopal" },
    { code: "FEN", name: "Fernando de Noronha" },
    { code: "FLA", name: "Florencia" },
    { code: "FMA", name: "Formosa" },
    { code: "FTE", name: "El Calafate" },
    { code: "GEL", name: "Santo \xC2ngelo" },
    { code: "GPI", name: "Guapi" },
    { code: "GPS", name: "Isla Baltra" },
    { code: "GVR", name: "Governador Valadares" },
    { code: "GYA", name: "Guayaramer\xEDn" },
    { code: "HUU", name: "Hu\xE1nuco" },
    { code: "IBE", name: "Ibagu\xE9" },
    { code: "IGR", name: "Puerto Iguazu" },
    { code: "ILQ", name: "Ilo" },
    { code: "IMP", name: "Imperatriz" },
    { code: "IOS", name: "Ilh\xE9us" },
    { code: "IPI", name: "Ipiales" },
    { code: "IPN", name: "Ipatinga" },
    { code: "IRJ", name: "La Rioja" },
    { code: "ITB", name: "Itaituba" },
    { code: "IZA", name: "Juiz de Fora" },
    { code: "JAE", name: "Ja\xE9n" },
    { code: "JAU", name: "Jauja" },
    { code: "JDF", name: "Juiz de Fora" },
    { code: "JJD", name: "Cruz" },
    { code: "JOI", name: "Joinville" },
    { code: "JTC", name: "Bauru" },
    { code: "KAI", name: "Kaieteur Falls" },
    { code: "LAJ", name: "Lages" },
    { code: "LDB", name: "Londrina" },
    { code: "LDX", name: "Saint-Laurent-du-Maroni" },
    { code: "LET", name: "Leticia" },
    { code: "LHS", name: "Las Heras" },
    { code: "LSC", name: "La Serena-Coquimbo" },
    { code: "LSP", name: "Paraguan\xE1" },
    { code: "LTM", name: "Lethem" },
    { code: "LTX", name: "Latacunga" },
    { code: "LUQ", name: "San Luis" },
    { code: "MAB", name: "Marab\xE1" },
    { code: "MCP", name: "Macap\xE1" },
    { code: "MDQ", name: "Mar del Plata" },
    { code: "MEC", name: "Manta" },
    { code: "MGF", name: "Maring\xE1" },
    { code: "MII", name: "Mar\xEDlia" },
    { code: "MNX", name: "Manicor\xE9" },
    { code: "MOC", name: "Montes Claros" },
    { code: "MPN", name: "Mount Pleasant" },
    { code: "MPY", name: "Maripasoula" },
    { code: "MTR", name: "Monter\xEDa" },
    { code: "MUN", name: "Matur\xEDn" },
    { code: "MVF", name: "Mossor\xF3" },
    { code: "MVP", name: "Mit\xFA" },
    { code: "MZL", name: "Manizales" },
    { code: "NEC", name: "Necochea" },
    { code: "NVA", name: "Neiva" },
    { code: "NZC", name: "Nazca" },
    { code: "OCC", name: "Coca" },
    { code: "OGL", name: "Ogle" },
    { code: "PAV", name: "Paulo Afonso" },
    { code: "PCR", name: "Puerto Carre\xF1o" },
    { code: "PDA", name: "Puerto In\xEDrida" },
    { code: "PDP", name: "Punta del Este" },
    { code: "PEI", name: "Pereira" },
    { code: "PEM", name: "Puerto Maldonado" },
    { code: "PET", name: "Pelotas" },
    { code: "PFB", name: "Passo Fundo" },
    { code: "PGZ", name: "Ponta Grossa" },
    { code: "PHB", name: "Parna\xEDba" },
    { code: "PIU", name: "Piura" },
    { code: "PMG", name: "Ponta Por\xE3" },
    { code: "PMQ", name: "Perito Moreno" },
    { code: "PMW", name: "Palmas" },
    { code: "PMY", name: "Puerto Madryn" },
    { code: "PNT", name: "Puerto Natales" },
    { code: "PNZ", name: "Petrolina" },
    { code: "PPB", name: "Presidente Prudente" },
    { code: "PPN", name: "Popay\xE1n" },
    { code: "PRA", name: "Parana" },
    { code: "PSO", name: "Chachag\xFC\xED" },
    { code: "PSS", name: "Posadas" },
    { code: "PSZ", name: "Puerto Su\xE1rez" },
    { code: "PUD", name: "Puerto Deseado" },
    { code: "PUU", name: "Puerto As\xEDs" },
    { code: "RAO", name: "Ribeir\xE3o Preto" },
    { code: "RCH", name: "Riohacha" },
    { code: "REL", name: "Rawson" },
    { code: "RGA", name: "Rio Grande" },
    { code: "RHD", name: "Termas de R\xEDo Hondo" },
    { code: "RIA", name: "Santa Maria" },
    { code: "RIB", name: "Riberalta" },
    { code: "ROO", name: "Rondon\xF3polis" },
    { code: "RSA", name: "Santa Rosa" },
    { code: "RVY", name: "Rivera/Santana do Livramento" },
    { code: "SDE", name: "Santiago del Estero" },
    { code: "SFN", name: "Santa Fe" },
    { code: "SJE", name: "San Jos\xE9 Del Guaviare" },
    { code: "SJK", name: "S\xE3o Jos\xE9 Dos Campos" },
    { code: "SJL", name: "S\xE3o Gabriel da Cachoeira" },
    { code: "SJP", name: "S\xE3o Jos\xE9 do Rio Preto" },
    { code: "SMR", name: "Santa Marta" },
    { code: "SNV", name: "Santa Elena de Uair\xE9n" },
    { code: "SOM", name: "El Tigre" },
    { code: "SRZ", name: "Santa Cruz" },
    { code: "SST", name: "Santa Teresita" },
    { code: "STD", name: "Santo Domingo" },
    { code: "STM", name: "Santar\xE9m" },
    { code: "SVI", name: "San Vicente Del Cagu\xE1n" },
    { code: "SVZ", name: "San Antonio del Tachira" },
    { code: "TBP", name: "Tumbes" },
    { code: "TBT", name: "Tabatinga" },
    { code: "TCO", name: "Tumaco" },
    { code: "TCQ", name: "Tacna" },
    { code: "TDD", name: "Trinidad" },
    { code: "TFF", name: "Tef\xE9" },
    { code: "THE", name: "Teresina" },
    { code: "TJA", name: "Tarija" },
    { code: "TME", name: "Tame" },
    { code: "TMT", name: "Oriximin\xE1" },
    { code: "TPP", name: "Tarapoto" },
    { code: "TUA", name: "Tulc\xE1n" },
    { code: "TUR", name: "Tucuru\xED" },
    { code: "TYL", name: "Talara" },
    { code: "UAQ", name: "San Juan" },
    { code: "UBA", name: "Uberaba" },
    { code: "UDI", name: "Uberl\xE2ndia" },
    { code: "UIB", name: "Quibd\xF3" },
    { code: "URG", name: "Uruguaiana" },
    { code: "USH", name: "Ushuaia" },
    { code: "VDC", name: "Vit\xF3ria da Conquista" },
    { code: "VDM", name: "Viedma / Carmen de Patagones" },
    { code: "VIG", name: "El Vig\xEDa" },
    { code: "VLV", name: "Valera" },
    { code: "VUP", name: "Valledupar" },
    { code: "VVC", name: "Villavicencio" },
    { code: "XAP", name: "Chapec\xF3" },
    { code: "XMS", name: "Macas" },
    { code: "YMS", name: "Yurimaguas" },
    { code: "ZAL", name: "Valdivia" },
    { code: "ZOS", name: "Osorno" }
  ];

  // src/common/search.js
  function addDays(iso, n2) {
    const d3 = /* @__PURE__ */ new Date(iso + "T00:00:00Z");
    d3.setUTCDate(d3.getUTCDate() + n2);
    return d3.toISOString().slice(0, 10);
  }
  function getDates(start, end) {
    const dates = [];
    for (let cur = start; cur <= end; cur = addDays(cur, 1)) dates.push(cur);
    return dates;
  }
  function todayISO() {
    const d3 = /* @__PURE__ */ new Date();
    return `${d3.getFullYear()}-${String(d3.getMonth() + 1).padStart(2, "0")}-${String(d3.getDate()).padStart(2, "0")}`;
  }
  function sleep(ms) {
    return new Promise((r3) => setTimeout(r3, ms));
  }
  async function runPool(tasks, concurrency) {
    const results = [];
    let i3 = 0;
    async function worker() {
      while (i3 < tasks.length) {
        const idx = i3++;
        results[idx] = await tasks[idx]();
      }
    }
    await Promise.all(Array.from({ length: concurrency }, worker));
    return results;
  }
  function parseNumberList(text) {
    const out = /* @__PURE__ */ new Set();
    for (const part of String(text ?? "").split(",").map((s3) => s3.trim()).filter(Boolean)) {
      const m3 = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
      if (!m3) return [];
      const a3 = Number(m3[1]), b2 = Number(m3[2] ?? m3[1]);
      if (b2 < a3 || b2 - a3 > 60) return [];
      for (let n2 = a3; n2 <= b2; n2++) out.add(n2);
    }
    return [...out];
  }
  function combos(lists) {
    return Object.entries(lists).reduce(
      (acc, [key, values]) => acc.flatMap((c3) => values.map((v3) => ({ ...c3, [key]: v3 }))),
      [{}]
    );
  }
  function monthSpans(fromMonth, toMonth, minDate = todayISO()) {
    const spans = [];
    let [y3, m3] = fromMonth.split("-").map(Number);
    const [ty, tm] = toMonth.split("-").map(Number);
    for (; y3 < ty || y3 === ty && m3 <= tm; m3 > 11 ? (y3++, m3 = 1) : m3++) {
      const ym = `${y3}-${String(m3).padStart(2, "0")}`;
      const end = `${ym}-${String(new Date(Date.UTC(y3, m3, 0)).getUTCDate()).padStart(2, "0")}`;
      const start = `${ym}-01` < minDate ? minDate : `${ym}-01`;
      if (start <= end) spans.push({ start, end });
    }
    return spans;
  }
  function monthISO(offset = 0) {
    const d3 = /* @__PURE__ */ new Date();
    d3.setDate(1);
    d3.setMonth(d3.getMonth() + offset);
    return `${d3.getFullYear()}-${String(d3.getMonth() + 1).padStart(2, "0")}`;
  }
  var isDate = (v3) => typeof v3 === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v3);
  var isMonth = (v3) => typeof v3 === "string" && /^\d{4}-\d{2}$/.test(v3);
  function restoreDates(start, end, today = todayISO()) {
    if (!isDate(start)) return { start: null, end: null };
    end = isDate(end) && end > start ? end : null;
    if ((end ?? start) < today) return { start: null, end: null };
    if (start >= today) return { start, end };
    return { start: today, end: end > today ? end : null };
  }
  function restoreMonths(fromMonth, toMonth, now = monthISO(0), fallbackTo = monthISO(2)) {
    if (!isMonth(fromMonth) || !isMonth(toMonth) || toMonth < fromMonth || toMonth < now) return { fromMonth: now, toMonth: fallbackTo };
    return { fromMonth: fromMonth < now ? now : fromMonth, toMonth };
  }

  // src/ui/styles.js
  var CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, sans-serif; }
  #ab-fab {
    position: fixed; bottom: 24px; right: 24px; z-index: 2147483647;
    width: 52px; height: 52px; border-radius: 50%;
    color: #fff; font-size: 22px; border: none; cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,.3);
    display: flex; align-items: center; justify-content: center;
    background: var(--ab-color);
  }
  #ab-panel {
    position: fixed; bottom: 86px; right: 24px; z-index: 2147483646;
    width: 440px; max-height: 80vh; background: #fff; border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,.18); display: flex; flex-direction: column; overflow: hidden;
  }
  #ab-panel.hidden { display: none; }
  #ab-panel.ab-expanded {
    top: 12px; left: 12px; right: 12px; bottom: 12px;
    width: auto; max-height: none;
  }
  .ab-header {
    color: #fff; padding: 12px 16px; font-size: 15px; font-weight: 600;
    display: flex; justify-content: space-between; align-items: center;
    background: var(--ab-color);
  }
  .ab-header button { background: none; border: none; color: #fff; font-size: 18px; cursor: pointer; }
  .ab-session-bar {
    padding: 6px 14px; font-size: 12px; display: flex; align-items: center; gap: 6px;
    border-bottom: 1px solid #e5e7eb;
  }
  .ab-session-bar.ok { background: #f0fdf4; color: #166534; }
  .ab-session-bar.waiting { background: #fffbeb; color: #92400e; }
  .ab-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .ok .ab-dot { background: #16a34a; }
  .waiting .ab-dot { background: #d97706; animation: ab-pulse 1.5s infinite; }
  @keyframes ab-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  .ab-body { padding: 14px 16px; overflow-y: auto; flex: 1; }
  .ab-row { display: flex; gap: 8px; margin-bottom: 10px; }
  .ab-row label { font-size: 12px; color: #666; display: block; margin-bottom: 3px; }
  .ab-row .ab-field { flex: 1; }
  input[type=text], input[type=date], select {
    width: 100%; padding: 7px 9px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; outline: none;
    background: #fff;
  }
  input:focus, select:focus { border-color: var(--ab-color); }
  .ab-combo { position: relative; }
  .ab-combo-box {
    display: flex; flex-wrap: wrap; gap: 4px; align-items: center;
    min-height: 34px; padding: 4px 6px; border: 1px solid #ddd; border-radius: 6px;
    cursor: text; background: #fff;
  }
  .ab-combo-box:focus-within { border-color: var(--ab-color); }
  .ab-chip {
    display: inline-flex; align-items: center; gap: 3px;
    background: var(--ab-color); color: #fff; border-radius: 4px;
    padding: 1px 5px; font-size: 12px; white-space: nowrap;
  }
  .ab-chip-x { background: none; border: none; color: #fff; cursor: pointer; font-size: 13px; padding: 0 1px; line-height: 1; }
  .ab-combo-input { border: none; outline: none; font-size: 13px; flex: 1; min-width: 60px; padding: 1px 2px; }
  .ab-combo-drop {
    position: absolute; top: 100%; left: 0; right: 0; z-index: 9999;
    background: #fff; border: 1px solid #ddd; border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,.12); max-height: 180px; overflow-y: auto; margin-top: 2px;
  }
  .ab-combo-opt { padding: 6px 10px; font-size: 12px; cursor: pointer; }
  .ab-combo-opt:hover { background: #f0f4ff; }
  .ab-combo-opt strong { font-size: 13px; }
  .ab-cabins { display: flex; gap: 6px; flex-wrap: wrap; }
  .ab-cabin-btn {
    padding: 4px 10px; border-radius: 20px; border: 1.5px solid #ddd;
    font-size: 12px; cursor: pointer; background: #fff; transition: all .15s;
  }
  .ab-search-btn {
    width: 100%; padding: 9px; color: #fff; border: none; border-radius: 7px;
    font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 6px;
    background: var(--ab-color);
  }
  .ab-search-btn:disabled { background: #aaa !important; cursor: not-allowed; }
  .ab-status { font-size: 12px; color: #666; margin-top: 8px; min-height: 16px; }
  .ab-progress { height: 4px; background: #e5e7eb; border-radius: 2px; margin-top: 6px; }
  .ab-progress-bar { height: 100%; border-radius: 2px; transition: width .3s; background: var(--ab-color); }
  .ab-results { margin-top: 12px; overflow-x: auto; }
  .ab-flt-bar { display: flex; flex-wrap: nowrap; gap: 6px; margin-bottom: 8px; align-items: center; overflow-x: auto; padding-bottom: 2px; }
  .ab-flt-bar::-webkit-scrollbar { height: 3px; }
  .ab-flt-bar::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }
  .ab-flt-sep { width: 1px; min-width: 1px; background: #e0e0e0; height: 16px; margin: 0 3px; flex-shrink: 0; }
  .ab-flt-btn { padding: 4px 11px; border-radius: 20px; border: 1.5px solid #ddd; font-size: 11px; cursor: pointer; background: #fff; color: #555; white-space: nowrap; flex-shrink: 0; }
  .ab-flt-btn:hover { border-color: #aaa; }
  .ab-flt-btn.active { background: #fff; border-color: var(--ab-color); color: var(--ab-color); font-weight: 600; }
  .ab-pill { position: relative; flex-shrink: 0; }
  .ab-pill-btn { display: flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 20px; border: 1.5px solid #ddd; font-size: 12px; cursor: pointer; background: #fff; color: #555; white-space: nowrap; transition: border-color .15s; }
  .ab-pill-btn:hover { border-color: #aaa; background: #fafafa; }
  .ab-pill-btn.active { border-color: var(--ab-color); color: var(--ab-color); font-weight: 600; background: #eef4ff; }
  .ab-pill-chevron { font-size: 9px; opacity: .55; transition: transform .15s; }
  .ab-pill-btn.open .ab-pill-chevron { transform: rotate(180deg); }
  .ab-drop { position: fixed; z-index: 2147483647; background: #fff; border: 1.5px solid #e0e0e0; border-radius: 12px; box-shadow: 0 4px 18px rgba(0,0,0,.12); padding: 6px; min-width: 140px; display: none; }
  .ab-drop.open { display: block; }
  .ab-drop-item { display: block; width: 100%; text-align: left; padding: 6px 12px; border-radius: 8px; border: none; font-size: 12px; cursor: pointer; background: none; color: #444; white-space: nowrap; }
  .ab-drop-item:hover { background: #f3f4f6; }
  .ab-drop-item.active { background: #eef4ff; color: var(--ab-color); font-weight: 600; }
  .ab-tbl { width: 100%; border-collapse: collapse; font-size: 12px; white-space: nowrap; }
  .ab-tbl th {
    text-align: left; font-size: 11px; font-weight: 600; color: #888;
    padding: 4px 8px; border-bottom: 2px solid #e5e7eb; background: #fafafa;
  }
  .ab-tbl td { padding: 6px 8px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
  .ab-tbl tr:hover td { background: #f8fafc; }
  .ab-cab-cell { min-width: 80px; color: #bbb; font-size: 11px; }
  .ab-cab-avail { color: #111; }
  .ab-cab-stops { font-size: 10px; color: #888; }
  .ab-cab-miles { font-weight: 600; }
  .ab-route { color: #666; font-size: 11px; }
  .ab-months { display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; }
  .ab-month-btn { padding: 5px 0; border-radius: 6px; border: 1px solid #ddd; font-size: 12px; cursor: pointer; background: #fff; color: #555; }
  .ab-month-btn:hover { border-color: var(--ab-color); }
  .ab-month-btn.sel { background: var(--ab-color); border-color: transparent; color: #fff; }
  .ab-summary {
    display: flex; align-items: center; gap: 8px; padding: 7px 10px; margin-bottom: 4px;
    background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 12px; color: #333;
  }
  .ab-summary span { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ab-summary button { background: none; border: none; color: var(--ab-color); font-size: 12px; font-weight: 600; cursor: pointer; }
  .ab-link-btn { background: none; border: none; color: var(--ab-color); font-size: 11px; font-weight: 600; cursor: pointer; margin-left: 6px; }
  .ab-hlist { margin-top: 8px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 10px; background: #fafafa; }
  .ab-hlist-head { display: flex; align-items: center; gap: 6px; font-size: 12px; margin-bottom: 6px; }
  .ab-hlist-head .ab-link-btn { margin-left: 0; }
  .ab-hlist-note { font-size: 12px; color: #999; padding: 6px 0; }
  .ab-hlist-items { max-height: 220px; overflow-y: auto; }
  .ab-hlist-item { display: flex; align-items: baseline; gap: 6px; padding: 4px 2px; font-size: 12px; cursor: pointer; }
  .ab-hlist-item.added { color: #999; cursor: default; }
  .ab-hlist-name { flex: 1; }
  .ab-hlist-sub { font-size: 11px; color: #999; white-space: nowrap; }
  .ab-hlist-add { width: 100%; margin-top: 6px; padding: 6px; border: 1px solid var(--ab-color); border-radius: 6px; background: #fff; color: var(--ab-color); font-size: 12px; font-weight: 600; cursor: pointer; }
  .ab-hotel-cell { font-size: 11px; max-width: 150px; overflow: hidden; text-overflow: ellipsis; }
  .ab-hotel-legend { display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: 11px; color: #555; margin-bottom: 8px; }
  .ab-hotel-legend i { display: inline-block; width: 8px; height: 8px; border-radius: 2px; margin-right: 4px; }
  .ab-tip { font-size: 12px; color: #8a6d00; background: #fff8e1; border-radius: 6px; padding: 6px 8px; margin-bottom: 10px; }
  .ab-no-results { text-align: center; color: #999; font-size: 13px; padding: 20px 0; }
  .ab-mode-toggle { display: flex; gap: 0; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 6px; overflow: hidden; }
  .ab-mode-btn { flex: 1; padding: 5px; font-size: 12px; background: #fff; border: none; cursor: pointer; color: #666; }
  .ab-mode-btn.active { background: var(--ab-color); color: #fff; }
  .ab-cal-months { overflow-y: auto; }
  .ab-cal-month { margin-bottom: 16px; }
  .ab-cal-month-name { font-weight: 600; font-size: 13px; margin-bottom: 4px; }
  .ab-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
  .ab-cal-dow { font-size: 10px; color: #999; text-align: center; padding: 2px 0; }
  .ab-cal-day { min-height: 38px; border: 1px solid #f0f0f0; border-radius: 4px; padding: 2px 3px; }
  .ab-cal-day.avail { cursor: pointer; background: #f8fafc; }
  .ab-cal-day.avail:hover { background: #e8f4ff; }
  .ab-cal-day.sel { outline: 2px solid var(--ab-color); outline-offset: -1px; }
  .ab-cal-day-num { font-size: 10px; color: #666; }
  .ab-cal-m { padding: 1px 3px; border-radius: 3px; font-size: 9px; color: #fff; white-space: nowrap; margin-top: 1px; display: block; }
  .ab-drp { position: relative; }
  .ab-drp-input {
    width: 100%; padding: 7px 9px; border: 1px solid #ddd; border-radius: 6px;
    font-size: 13px; cursor: pointer; background: #fff; display: flex; align-items: center; gap: 6px;
  }
  .ab-drp-input:hover { border-color: #aaa; }
  .ab-drp-input.open { border-color: var(--ab-color); }
  .ab-drp-text { flex: 1; color: #333; user-select: none; }
  .ab-drp-clear { background: none; border: none; cursor: pointer; font-size: 16px; color: #bbb; padding: 0; line-height: 1; }
  .ab-drp-popup {
    position: fixed; z-index: 9999;
    background: #fff; border: 1px solid #ddd; border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0,0,0,.15); padding: 12px; width: 280px;
  }
  .ab-drp-cal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .ab-drp-cal-title { font-size: 14px; font-weight: 600; }
  .ab-drp-nav { background: none; border: none; cursor: pointer; font-size: 18px; color: #555; padding: 2px 8px; border-radius: 4px; }
  .ab-drp-nav:hover { background: #f0f0f0; }
  .ab-drp-dow { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 2px; }
  .ab-drp-dow span { text-align: center; font-size: 10px; color: #999; padding: 3px 0; }
  .ab-drp-days { display: grid; grid-template-columns: repeat(7, 1fr); }
  .ab-drp-day {
    aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
    font-size: 12px; border-radius: 4px; cursor: pointer; border: none; background: none; padding: 0;
  }
  .ab-drp-day:not(:disabled):hover { background: #e8f0ff; }
  .ab-drp-day.in-range { background: #dbeafe; border-radius: 0; }
  .ab-drp-day.range-start { background: #dbeafe; border-radius: 4px 0 0 4px; }
  .ab-drp-day.range-end { background: #dbeafe; border-radius: 0 4px 4px 0; }
  .ab-drp-day.sel { background: var(--ab-color) !important; color: #fff; border-radius: 4px; }
  .ab-drp-day:disabled { color: #ccc; cursor: default; }
  .ab-drp-presets { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 10px; padding-top: 8px; border-top: 1px solid #f0f0f0; }
  .ab-drp-preset {
    padding: 3px 8px; border-radius: 20px; border: 1px solid #ddd;
    font-size: 11px; cursor: pointer; background: #fff; color: #555;
  }
  .ab-drp-preset:hover { border-color: var(--ab-color); color: var(--ab-color); }
  @media (max-width: 480px) {
    #ab-panel { width: calc(100vw - 24px); right: 12px; bottom: 80px; }
    #ab-fab { bottom: 16px; right: 16px; }
  }
`;

  // src/ui/util.js
  var cx = (...names) => names.filter(Boolean).join(" ");
  function useOutsideClick(ref, onOutside) {
    const cb = A2(onOutside);
    cb.current = onOutside;
    h2(() => {
      const handler = (e3) => {
        if (ref.current && !e3.composedPath().includes(ref.current)) cb.current();
      };
      document.addEventListener("click", handler, true);
      return () => document.removeEventListener("click", handler, true);
    }, []);
  }

  // node_modules/preact/jsx-runtime/dist/jsxRuntime.module.js
  var f3 = 0;
  function u3(e3, t3, n2, o3, i3, u4) {
    t3 || (t3 = {});
    var a3, c3, p3 = t3;
    if ("ref" in p3) for (c3 in p3 = {}, t3) "ref" == c3 ? a3 = t3[c3] : p3[c3] = t3[c3];
    var l3 = { type: e3, props: p3, key: n2, ref: a3, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --f3, __i: -1, __u: 0, __source: i3, __self: u4 };
    if ("function" == typeof e3 && (a3 = e3.defaultProps)) for (c3 in a3) void 0 === p3[c3] && (p3[c3] = a3[c3]);
    return l.vnode && l.vnode(l3), l3;
  }

  // src/ui/AirportCombo.jsx
  function AirportCombo({ airports, value, onChange }) {
    const [query, setQuery] = d2("");
    const [open, setOpen] = d2(false);
    const wrapRef = A2(), inputRef = A2();
    useOutsideClick(wrapRef, () => setOpen(false));
    const q2 = query.toLowerCase();
    const opts = open ? airports.filter((a3) => !value.includes(a3.code) && (a3.code.toLowerCase().includes(q2) || a3.name.toLowerCase().includes(q2))).slice(0, 20) : [];
    const add = (code) => {
      onChange([...value, code]);
      setQuery("");
    };
    function onKeyDown(e3) {
      if (e3.key === "Backspace" && !query && value.length) onChange(value.slice(0, -1));
      else if (e3.key === "Enter") {
        e3.preventDefault();
        const typed = query.trim().toUpperCase();
        const exact = opts.find((a3) => a3.code === typed);
        if (exact || opts[0]) add((exact ?? opts[0]).code);
        else if (/^[A-Z]{3}$/.test(typed) && !value.includes(typed)) add(typed);
      } else if (e3.key === "Escape") setOpen(false);
    }
    return /* @__PURE__ */ u3("div", { class: "ab-combo", ref: wrapRef, children: [
      /* @__PURE__ */ u3("div", { class: "ab-combo-box", onClick: () => inputRef.current?.focus(), children: [
        value.map((code) => /* @__PURE__ */ u3("span", { class: "ab-chip", children: [
          code,
          /* @__PURE__ */ u3(
            "button",
            {
              class: "ab-chip-x",
              "aria-label": `Remove ${code}`,
              onClick: (e3) => {
                e3.stopPropagation();
                onChange(value.filter((c3) => c3 !== code));
              },
              children: "\xD7"
            }
          )
        ] }, code)),
        /* @__PURE__ */ u3(
          "input",
          {
            ref: inputRef,
            class: "ab-combo-input",
            autocomplete: "off",
            placeholder: value.length ? "" : "Search\u2026",
            value: query,
            onInput: (e3) => {
              setQuery(e3.currentTarget.value);
              setOpen(true);
            },
            onFocus: () => setOpen(true),
            onKeyDown
          }
        )
      ] }),
      opts.length > 0 && /* @__PURE__ */ u3("div", { class: "ab-combo-drop", children: opts.map((a3) => (
        // mousedown + preventDefault keeps focus in the input
        /* @__PURE__ */ u3("div", { class: "ab-combo-opt", onMouseDown: (e3) => {
          e3.preventDefault();
          add(a3.code);
          setOpen(false);
        }, children: [
          /* @__PURE__ */ u3("strong", { children: a3.code }),
          " ",
          a3.name
        ] }, a3.code)
      )) })
    ] });
  }

  // src/ui/Calendar.jsx
  var DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  var MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  var pad = (n2) => String(n2).padStart(2, "0");
  var byCabin = ([a3], [b2]) => CABIN_ORDER.indexOf(a3) - CABIN_ORDER.indexOf(b2);
  var k3 = (miles) => `${(miles / 1e3).toFixed(1).replace(/\.0$/, "")}k`;
  var inMonthRange = (date, fromMonth, toMonth) => date >= fromMonth && date <= toMonth + "-31";
  function CalendarView({ calData, fromMonth, toMonth }) {
    const multiRoute = new Set(Object.values(calData).flatMap((r3) => Object.keys(r3))).size > 1;
    const months = [];
    let [y3, m3] = fromMonth.split("-").map(Number);
    const [ty, tm] = toMonth.split("-").map(Number);
    for (; y3 < ty || y3 === ty && m3 <= tm; m3 > 11 ? (y3++, m3 = 1) : m3++) months.push([y3, m3]);
    return /* @__PURE__ */ u3("div", { class: "ab-cal-months", children: months.map(([y4, m4]) => {
      const firstDow = new Date(y4, m4 - 1, 1).getDay();
      const daysInMonth = new Date(y4, m4, 0).getDate();
      return /* @__PURE__ */ u3("div", { class: "ab-cal-month", children: [
        /* @__PURE__ */ u3("div", { class: "ab-cal-month-name", children: [
          MONTH_NAMES[m4 - 1],
          " ",
          y4
        ] }),
        /* @__PURE__ */ u3("div", { class: "ab-cal-grid", children: [
          DOW.map((d3) => /* @__PURE__ */ u3("div", { class: "ab-cal-dow", children: d3 }, d3)),
          Array.from({ length: firstDow }, (_3, i3) => /* @__PURE__ */ u3("div", {}, `b${i3}`)),
          Array.from({ length: daysInMonth }, (_3, i3) => {
            const avail = calData[`${y4}-${pad(m4)}-${pad(i3 + 1)}`];
            if (!avail) return /* @__PURE__ */ u3("div", { class: "ab-cal-day", children: /* @__PURE__ */ u3("div", { class: "ab-cal-day-num", children: i3 + 1 }) }, i3);
            return /* @__PURE__ */ u3("div", { class: "ab-cal-day avail", children: [
              /* @__PURE__ */ u3("div", { class: "ab-cal-day-num", children: i3 + 1 }),
              Object.entries(avail).map(([route, cabins]) => [
                multiRoute && /* @__PURE__ */ u3("div", { style: { fontSize: 8, color: "#999", marginTop: 2 }, children: route }),
                Object.entries(cabins).sort(byCabin).map(([c3, miles]) => /* @__PURE__ */ u3("span", { class: "ab-cal-m", style: { background: CABIN_COLORS[c3] }, children: [
                  CABIN_LABELS[c3].slice(0, 3),
                  miles > 0 && ` ${k3(miles)}`
                ] }))
              ])
            ] }, i3);
          })
        ] })
      ] }, `${y4}-${m4}`);
    }) });
  }
  var calToRows = (calData, fromMonth, toMonth) => Object.entries(calData).filter(([date]) => inMonthRange(date, fromMonth, toMonth)).flatMap(([date, routes]) => Object.entries(routes).map(([route, miles]) => {
    const [origin, destination] = route.split("\u2192");
    return { date, origin, destination, miles, cabins: Object.fromEntries(Object.keys(miles).map((c3) => [c3, true])) };
  }));
  function MonthRangePicker({ from, to, onChange }) {
    const now = /* @__PURE__ */ new Date();
    const months = Array.from({ length: 12 }, (_3, i3) => {
      const d3 = new Date(now.getFullYear(), now.getMonth() + i3, 1);
      return [`${d3.getFullYear()}-${pad(d3.getMonth() + 1)}`, `${MONTH_NAMES[d3.getMonth()].slice(0, 3)}${d3.getMonth() === 0 || i3 === 0 ? ` ${String(d3.getFullYear()).slice(2)}` : ""}`];
    });
    const pick = (m3) => from === to && m3 > from ? onChange(from, m3) : onChange(m3, m3);
    return /* @__PURE__ */ u3("div", { class: "ab-months", children: months.map(([m3, label]) => /* @__PURE__ */ u3("button", { class: cx("ab-month-btn", m3 >= from && m3 <= to && "sel"), onClick: () => pick(m3), children: label }, m3)) });
  }

  // src/ui/DateRangePicker.jsx
  var pad2 = (n2) => String(n2).padStart(2, "0");
  function DateRangePicker({ start, end, onChange }) {
    const [open, setOpen] = d2(false);
    const [view, setView] = d2(() => {
      const t3 = todayISO();
      return { y: +t3.slice(0, 4), m: +t3.slice(5, 7) - 1 };
    });
    const [awaitingEnd, setAwaitingEnd] = d2(false);
    const wrapRef = A2(), inputRef = A2(), popupRef = A2();
    useOutsideClick(wrapRef, () => setOpen(false));
    _2(() => {
      if (!open) return;
      const r3 = inputRef.current.getBoundingClientRect(), el = popupRef.current, h3 = el.offsetHeight;
      el.style.top = (r3.bottom + 4 + h3 <= innerHeight ? r3.bottom + 4 : r3.top - h3 - 4) + "px";
      el.style.left = r3.left + "px";
    }, [open, view]);
    const today = todayISO();
    function pick(iso) {
      if (!awaitingEnd || iso < start) {
        onChange(iso, null);
        setAwaitingEnd(true);
      } else if (iso === start) {
        onChange(start, null);
        setAwaitingEnd(false);
        setOpen(false);
      } else {
        onChange(start, iso);
        setAwaitingEnd(false);
      }
    }
    function preset(n2) {
      const anchor = start || todayISO();
      onChange(addDays(anchor, -n2), addDays(anchor, n2));
      setAwaitingEnd(false);
    }
    function clear(e3) {
      e3.stopPropagation();
      onChange(null, null);
      setAwaitingEnd(false);
      setOpen(false);
    }
    const shift = (d3) => setView(({ y: y3, m: m3 }) => {
      const t3 = new Date(y3, m3 + d3, 1);
      return { y: t3.getFullYear(), m: t3.getMonth() };
    });
    const firstDow = new Date(view.y, view.m, 1).getDay();
    const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
    const text = start ? `${start} \u2014 ${end ?? "?"}` : "Select dates";
    return /* @__PURE__ */ u3("div", { class: "ab-drp", ref: wrapRef, children: [
      /* @__PURE__ */ u3("div", { class: cx("ab-drp-input", open && "open"), ref: inputRef, onClick: () => setOpen(!open), children: [
        /* @__PURE__ */ u3("span", { style: { fontSize: 14 }, children: "\u{1F4C5}" }),
        /* @__PURE__ */ u3("span", { class: "ab-drp-text", children: text }),
        /* @__PURE__ */ u3("button", { class: "ab-drp-clear", title: "Clear", onClick: clear, children: "\xD7" })
      ] }),
      open && /* @__PURE__ */ u3("div", { class: "ab-drp-popup", ref: popupRef, children: [
        /* @__PURE__ */ u3("div", { class: "ab-drp-cal-header", children: [
          /* @__PURE__ */ u3("button", { class: "ab-drp-nav", onClick: () => shift(-1), children: "\u2039" }),
          /* @__PURE__ */ u3("span", { class: "ab-drp-cal-title", children: [
            MONTH_NAMES[view.m],
            " ",
            view.y
          ] }),
          /* @__PURE__ */ u3("button", { class: "ab-drp-nav", onClick: () => shift(1), children: "\u203A" })
        ] }),
        /* @__PURE__ */ u3("div", { class: "ab-drp-dow", children: DOW.map((d3) => /* @__PURE__ */ u3("span", { children: d3 }, d3)) }),
        /* @__PURE__ */ u3("div", { class: "ab-drp-days", children: [
          Array.from({ length: firstDow }, (_3, i3) => /* @__PURE__ */ u3("button", { class: "ab-drp-day", disabled: true }, `b${i3}`)),
          Array.from({ length: daysInMonth }, (_3, i3) => {
            const iso = `${view.y}-${pad2(view.m + 1)}-${pad2(i3 + 1)}`;
            const sel = iso === start || iso === end;
            const inRange = start && end && iso > start && iso < end;
            const past = iso < today;
            return /* @__PURE__ */ u3("button", { class: cx("ab-drp-day", sel && "sel", inRange && "in-range"), onClick: () => !past && pick(iso), disabled: past, children: i3 + 1 }, iso);
          })
        ] }),
        /* @__PURE__ */ u3("div", { class: "ab-drp-presets", children: [1, 3, 7, 14].map((n2) => /* @__PURE__ */ u3("button", { class: "ab-drp-preset", onClick: () => preset(n2), children: [
          "\xB1",
          n2,
          "d"
        ] }, n2)) })
      ] })
    ] });
  }

  // src/ui/ResultsTable.jsx
  var PAGE_SIZE = 50;
  var DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var stopsOf = (r3) => (r3.segs?.length ?? 1) - 1;
  var hhmm = (iso) => iso?.slice(11, 16) || "";
  function filterAndSort(results, filters, sort, cols) {
    const rows = results.filter((r3) => (!filters.cabin || r3.cabins?.[filters.cabin] != null) && (filters.stops == null || stopsOf(r3) <= filters.stops) && (filters.dow == null || (/* @__PURE__ */ new Date(r3.date + "T12:00:00")).getDay() === filters.dow));
    const val = (r3) => sort.key === "date" ? r3.date : sort.key === "dur" ? r3.duration ?? 9999 : cols.includes(sort.key) ? r3.miles?.[sort.key] ?? Infinity : 0;
    return rows.sort((a3, b2) => {
      const av = val(a3), bv = val(b2);
      return av < bv ? -sort.dir : av > bv ? sort.dir : 0;
    });
  }
  function CabinCell({ r: r3, c: c3 }) {
    const seats = r3.cabins?.[c3];
    if (seats == null) return /* @__PURE__ */ u3("td", { class: "ab-cab-cell", children: "\u2014" });
    const miles = r3.miles?.[c3];
    const stops = stopsOf(r3);
    return /* @__PURE__ */ u3("td", { class: "ab-cab-cell ab-cab-avail", children: [
      r3.segs && /* @__PURE__ */ u3("span", { class: "ab-cab-stops", children: stops === 0 ? "direct" : `${stops} stop` }),
      /* @__PURE__ */ u3("span", { class: "ab-cab-miles", style: { color: CABIN_COLORS[c3] }, children: [
        " ",
        miles ? `${(miles / 1e3).toFixed(1).replace(/\.0$/, "")}k` : ""
      ] }),
      !!r3.mixPct?.[c3] && c3 !== "Y" && /* @__PURE__ */ u3("span", { style: { color: "#bbb" }, children: [
        " ",
        r3.mixPct[c3],
        "%mx"
      ] }),
      seats !== true && /* @__PURE__ */ u3("span", { style: { color: "#bbb", fontSize: 10 }, children: [
        " (",
        seats,
        ")"
      ] })
    ] });
  }
  function Pagination({ page, totalPages, total, setPage }) {
    const pages = [];
    for (let i3 = 0; i3 < totalPages; i3++) {
      if (totalPages <= 5 || i3 === 0 || i3 === totalPages - 1 || Math.abs(i3 - page) <= 1)
        pages.push(/* @__PURE__ */ u3("button", { class: cx("ab-flt-btn", i3 === page && "active"), onClick: () => setPage(i3), children: i3 + 1 }, i3));
      else if (Math.abs(i3 - page) === 2) pages.push(/* @__PURE__ */ u3("span", { style: { padding: "4px 2px" }, children: "\u2026" }, i3));
    }
    const nav = (to, label, disabled) => /* @__PURE__ */ u3("button", { class: "ab-flt-btn", disabled, style: disabled ? { color: "#ccc" } : void 0, onClick: () => setPage(to), children: label });
    return /* @__PURE__ */ u3("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: "#666", marginTop: 8, paddingTop: 6, borderTop: "1px solid #f0f0f0" }, children: [
      /* @__PURE__ */ u3("span", { children: [
        page * PAGE_SIZE + 1,
        "\u2013",
        Math.min((page + 1) * PAGE_SIZE, total),
        " of ",
        total
      ] }),
      /* @__PURE__ */ u3("div", { style: { display: "flex", gap: 3 }, children: [
        nav(page - 1, "\u2039", page === 0),
        pages,
        nav(page + 1, "\u203A", page >= totalPages - 1)
      ] })
    ] });
  }
  function FilterBar({ pills, filters, onChange, children }) {
    const [drop, setDrop] = d2(null);
    const barRef = A2();
    useOutsideClick(barRef, () => setDrop(null));
    return /* @__PURE__ */ u3("div", { class: "ab-flt-bar", ref: barRef, children: [
      pills.map((p3) => {
        const value = filters[p3.id], isOpen = drop?.id === p3.id;
        return /* @__PURE__ */ u3("div", { class: "ab-pill", children: [
          /* @__PURE__ */ u3("button", { class: cx("ab-pill-btn", value !== null && "active", isOpen && "open"), onClick: (e3) => {
            if (isOpen) return setDrop(null);
            const r3 = e3.currentTarget.getBoundingClientRect();
            setDrop({ id: p3.id, top: r3.bottom + 6, left: r3.left });
          }, children: [
            p3.label,
            value !== null && /* @__PURE__ */ u3(S, { children: [
              ": ",
              /* @__PURE__ */ u3("b", { children: p3.display })
            ] }),
            " ",
            /* @__PURE__ */ u3("span", { class: "ab-pill-chevron", children: "\u25BE" })
          ] }),
          isOpen && /* @__PURE__ */ u3("div", { class: "ab-drop open", style: { top: drop.top, left: drop.left }, children: p3.items.map(([v3, text, style]) => /* @__PURE__ */ u3(
            "button",
            {
              class: cx("ab-drop-item", value === v3 && "active"),
              style,
              onClick: () => {
                onChange({ ...filters, [p3.id]: v3 });
                setDrop(null);
              },
              children: text
            },
            String(v3)
          )) })
        ] }, p3.id);
      }),
      children
    ] });
  }
  function ResultsTable({ results }) {
    const [sort, setSort] = d2({ key: "date", dir: 1 });
    const [filters, setFilters] = d2({ cabin: null, stops: null, dow: null });
    const [page, setPage] = d2(0);
    if (!results.length) return null;
    const cols = CABIN_ORDER.filter((c3) => results.some((r3) => r3.cabins?.[c3] !== void 0));
    const rows = filterAndSort(results, filters, sort, cols);
    const totalPages = Math.ceil(rows.length / PAGE_SIZE);
    const pg = Math.min(page, Math.max(0, totalPages - 1));
    const detailed = results.some((r3) => r3.segs);
    const hasStopover = results.some((r3) => r3.stopover);
    const stopCounts = [...new Set(results.map(stopsOf))].sort((a3, b2) => a3 - b2);
    const pills = [
      {
        id: "cabin",
        label: "Cabin",
        display: CABIN_LABELS[filters.cabin],
        items: [[null, "All cabins"], ...cols.map((c3) => [c3, CABIN_LABELS[c3], { color: CABIN_COLORS[c3] }])]
      },
      detailed && {
        id: "stops",
        label: "Stops",
        display: filters.stops === 0 ? "Direct" : `\u2264${filters.stops}`,
        items: [[null, "Any"], ...stopCounts.map((n2) => [n2, n2 === 0 ? "Direct" : `\u2264${n2} stop`])]
      },
      {
        id: "dow",
        label: "Day of week",
        display: DOW_LABELS[filters.dow],
        items: [[null, "Any day"], ...[1, 2, 3, 4, 5, 6, 0].map((n2) => [n2, DOW_LABELS[n2]])]
      }
    ].filter(Boolean);
    function th(key, label, color) {
      const active = sort.key === key;
      return /* @__PURE__ */ u3(
        "th",
        {
          style: { cursor: "pointer", userSelect: "none", color: active ? "var(--ab-color)" : color },
          onClick: () => {
            setSort(active ? { key, dir: -sort.dir } : { key, dir: 1 });
            setPage(0);
          },
          children: [
            label,
            " ",
            /* @__PURE__ */ u3("span", { style: { fontSize: 9, color: active ? "var(--ab-color)" : "#aaa" }, children: active ? sort.dir === 1 ? "\u2191" : "\u2193" : "\u2195" })
          ]
        }
      );
    }
    return /* @__PURE__ */ u3("div", { children: [
      /* @__PURE__ */ u3(FilterBar, { pills, filters, onChange: (f4) => {
        setFilters(f4);
        setPage(0);
      }, children: (sort.key !== "date" || sort.dir !== 1) && /* @__PURE__ */ u3("button", { class: "ab-flt-btn", style: { marginLeft: "auto" }, onClick: () => {
        setSort({ key: "date", dir: 1 });
        setPage(0);
      }, children: "\u21BA Reset sort" }) }),
      /* @__PURE__ */ u3("div", { style: { fontSize: 11, color: "#999", marginBottom: 4 }, children: [
        rows.length,
        " / ",
        results.length,
        " result(s)"
      ] }),
      /* @__PURE__ */ u3("table", { class: "ab-tbl", children: [
        /* @__PURE__ */ u3("thead", { children: /* @__PURE__ */ u3("tr", { children: [
          th("date", "Date"),
          /* @__PURE__ */ u3("th", { children: "Orig" }),
          /* @__PURE__ */ u3("th", { children: "Dest" }),
          hasStopover && /* @__PURE__ */ u3("th", { children: "Stopover" }),
          detailed && /* @__PURE__ */ u3(S, { children: [
            /* @__PURE__ */ u3("th", { children: "Flight" }),
            /* @__PURE__ */ u3("th", { children: "Dep" }),
            /* @__PURE__ */ u3("th", { children: "Arr" }),
            th("dur", "Dur")
          ] }),
          cols.map((c3) => th(c3, CABIN_LABELS[c3], CABIN_COLORS[c3]))
        ] }) }),
        /* @__PURE__ */ u3("tbody", { children: rows.slice(pg * PAGE_SIZE, (pg + 1) * PAGE_SIZE).map((r3, i3) => /* @__PURE__ */ u3("tr", { children: [
          /* @__PURE__ */ u3("td", { children: r3.date }),
          /* @__PURE__ */ u3("td", { class: "ab-route", children: r3.origin }),
          /* @__PURE__ */ u3("td", { class: "ab-route", children: r3.destination }),
          hasStopover && /* @__PURE__ */ u3("td", { class: "ab-route", children: r3.stopover ? `${r3.stopover.at} \xB7 ${r3.stopover.days}d` : "" }),
          detailed && /* @__PURE__ */ u3(S, { children: [
            /* @__PURE__ */ u3("td", { style: { fontSize: 11, color: "#555", lineHeight: 1.4 }, children: r3.segs?.map((s3, j3) => {
              const cab = r3.segCabinsJ?.[j3];
              return /* @__PURE__ */ u3("div", { children: [
                s3.flight,
                cab && /* @__PURE__ */ u3(S, { children: [
                  " ",
                  /* @__PURE__ */ u3("span", { style: { fontSize: 9, fontWeight: 600, padding: "0 3px", borderRadius: 2, background: CABIN_COLORS[cab], color: "#fff" }, children: cab })
                ] })
              ] }, j3);
            }) }),
            /* @__PURE__ */ u3("td", { children: hhmm(r3.segs?.[0]?.dep) }),
            /* @__PURE__ */ u3("td", { children: hhmm(r3.segs?.[r3.segs.length - 1]?.arr) }),
            /* @__PURE__ */ u3("td", { style: { color: "#888" }, children: r3.duration ? `${Math.floor(r3.duration / 60)}h${String(r3.duration % 60).padStart(2, "0")}m` : "" })
          ] }),
          cols.map((c3) => /* @__PURE__ */ u3(CabinCell, { r: r3, c: c3 }, c3))
        ] }, i3)) })
      ] }),
      totalPages > 1 && /* @__PURE__ */ u3(Pagination, { page: pg, totalPages, total: rows.length, setPage })
    ] });
  }

  // src/ui/searchRun.jsx
  function useSearchRun(form) {
    const [searching, setSearching] = d2(false);
    const [btnLabel, setBtnLabel] = d2(null);
    const [status, setStatus] = d2("");
    const [progress, setProgress] = d2(null);
    const [collapsed, setCollapsed] = d2(false);
    const ctl = A2({ searching: false, stop: false, rerun: false }).current;
    h2(() => {
      if (!ctl.searching) return;
      ctl.rerun = true;
      ctl.stop = true;
      setBtnLabel("Restarting\u2026");
    }, [form]);
    return {
      ctl,
      searching,
      btnLabel,
      status,
      setStatus,
      progress,
      setProgress,
      collapsed,
      setCollapsed,
      // Returns true when the click should stop the running search instead of starting one
      stopIfRunning() {
        if (!ctl.searching) return false;
        ctl.stop = true;
        ctl.rerun = false;
        setBtnLabel("Stopping\u2026");
        return true;
      },
      begin() {
        ctl.searching = true;
        ctl.stop = false;
        ctl.t0 = Date.now();
        setSearching(true);
        setBtnLabel(null);
        setProgress(0);
        setCollapsed(true);
      },
      end() {
        ctl.searching = false;
        setSearching(false);
        setBtnLabel(null);
      },
      // Wall-clock time since begin(), e.g. "8.4s" or "2m 05s"
      elapsed() {
        const sec = (Date.now() - ctl.t0) / 1e3;
        return sec < 60 ? `${sec.toFixed(1)}s` : `${Math.floor(sec / 60)}m ${String(Math.floor(sec % 60)).padStart(2, "0")}s`;
      }
    };
  }
  var restoredKeys = /* @__PURE__ */ new Set();
  function useSavedResults(id, run, state, restore) {
    const key = `award-buddy:${id}:results`;
    h2(() => {
      if (restoredKeys.has(key)) return;
      restoredKeys.add(key);
      let saved;
      try {
        saved = JSON.parse(sessionStorage.getItem(key));
      } catch {
      }
      if (!saved?.state) return;
      restore(saved.state);
      const at = new Date(saved.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      run.setStatus(`Showing results of the last search (${at}). Search again to refresh.`);
    }, []);
    h2(() => {
      if (run.searching || !run.ctl.t0) return;
      try {
        sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), state }));
      } catch {
      }
    }, [run.searching, ...Object.values(state)]);
  }
  function SearchSummary({ run, text }) {
    return /* @__PURE__ */ u3("div", { class: "ab-summary", children: [
      /* @__PURE__ */ u3("span", { children: text }),
      /* @__PURE__ */ u3("button", { onClick: () => run.setCollapsed(false), children: "Edit" })
    ] });
  }
  function SearchControls({ run, session, onSearch }) {
    return /* @__PURE__ */ u3(S, { children: [
      /* @__PURE__ */ u3("button", { class: "ab-search-btn", disabled: !session.ready && !run.searching, onClick: onSearch, children: run.btnLabel ?? (run.searching ? "Stop" : "Search") }),
      /* @__PURE__ */ u3("div", { class: "ab-status", children: run.status }),
      run.progress !== null && /* @__PURE__ */ u3("div", { class: "ab-progress", children: /* @__PURE__ */ u3("div", { class: "ab-progress-bar", style: { width: `${run.progress}%` } }) })
    ] });
  }

  // src/common/hotels.js
  var HOTEL_COLORS = ["#0369a1", "#b45309", "#7c3aed", "#059669", "#be123c", "#374151"];
  function lowestByDate(results) {
    var _a;
    const out = {};
    for (const r3 of results) {
      const day = out[_a = r3.date] ?? (out[_a] = {});
      if (day[r3.hotel] == null || r3.points < day[r3.hotel]) day[r3.hotel] = r3.points;
    }
    return out;
  }
  function cheapestOnly(results) {
    const best = /* @__PURE__ */ new Map();
    for (const r3 of results) {
      const key = `${r3.hotel}|${r3.date}`;
      if (!best.has(key) || r3.points < best.get(key).points) best.set(key, r3);
    }
    return [...best.values()];
  }
  function parseHotelCodes(text) {
    return [...new Set(String(text ?? "").split(/[\s,]+/).map((s3) => s3.trim().toUpperCase()).filter(Boolean))];
  }

  // src/ui/HotelResults.jsx
  var PAGE_SIZE2 = 50;
  var pad3 = (n2) => String(n2).padStart(2, "0");
  var k4 = (points) => `${(points / 1e3).toFixed(1).replace(/\.0$/, "")}k`;
  var hotelColor = (hotels, code) => HOTEL_COLORS[hotels.indexOf(code) % HOTEL_COLORS.length];
  function HotelCalendar({ results, hotels, names, fromMonth, toMonth, selected, onSelect }) {
    const byDate = lowestByDate(results);
    const multi = hotels.length > 1;
    const months = [];
    let [y3, m3] = fromMonth.split("-").map(Number);
    const [ty, tm] = toMonth.split("-").map(Number);
    for (; y3 < ty || y3 === ty && m3 <= tm; m3 > 11 ? (y3++, m3 = 1) : m3++) months.push([y3, m3]);
    return /* @__PURE__ */ u3("div", { class: "ab-cal-months", children: [
      multi && /* @__PURE__ */ u3("div", { class: "ab-hotel-legend", children: hotels.map((h3) => /* @__PURE__ */ u3("span", { children: [
        /* @__PURE__ */ u3("i", { style: { background: hotelColor(hotels, h3) } }),
        names[h3] ?? h3
      ] }, h3)) }),
      months.map(([y4, m4]) => {
        const firstDow = new Date(y4, m4 - 1, 1).getDay();
        const daysInMonth = new Date(y4, m4, 0).getDate();
        return /* @__PURE__ */ u3("div", { class: "ab-cal-month", children: [
          /* @__PURE__ */ u3("div", { class: "ab-cal-month-name", children: [
            MONTH_NAMES[m4 - 1],
            " ",
            y4
          ] }),
          /* @__PURE__ */ u3("div", { class: "ab-cal-grid", children: [
            DOW.map((d3) => /* @__PURE__ */ u3("div", { class: "ab-cal-dow", children: d3 }, d3)),
            Array.from({ length: firstDow }, (_3, i3) => /* @__PURE__ */ u3("div", {}, `b${i3}`)),
            Array.from({ length: daysInMonth }, (_3, i3) => {
              const date = `${y4}-${pad3(m4)}-${pad3(i3 + 1)}`;
              const avail = byDate[date];
              if (!avail) return /* @__PURE__ */ u3("div", { class: "ab-cal-day", children: /* @__PURE__ */ u3("div", { class: "ab-cal-day-num", children: i3 + 1 }) }, i3);
              return /* @__PURE__ */ u3(
                "div",
                {
                  class: cx("ab-cal-day avail", selected === date && "sel"),
                  title: "Show this date only",
                  onClick: () => onSelect(selected === date ? null : date),
                  children: [
                    /* @__PURE__ */ u3("div", { class: "ab-cal-day-num", children: i3 + 1 }),
                    hotels.filter((h3) => avail[h3] != null).map((h3) => /* @__PURE__ */ u3("span", { class: "ab-cal-m", style: { background: hotelColor(hotels, h3) }, children: k4(avail[h3]) }, h3))
                  ]
                },
                i3
              );
            })
          ] })
        ] }, `${y4}-${m4}`);
      })
    ] });
  }
  function HotelTable({ results, hotels, names, date, onClearDate, sharedPills = [], shared = {}, onSharedChange }) {
    const [sort, setSort] = d2({ key: "date", dir: 1 });
    const [filters, setFilters] = d2({ hotel: null, dow: null });
    const [cheapest, setCheapest] = d2(true);
    const [page, setPage] = d2(0);
    if (!results.length) return null;
    const rows = (cheapest ? cheapestOnly(results) : results).filter((r3) => (!date || r3.date === date) && (!filters.hotel || r3.hotel === filters.hotel) && (filters.dow == null || (/* @__PURE__ */ new Date(r3.date + "T12:00:00")).getDay() === filters.dow));
    const val = (r3) => sort.key === "points" ? r3.points : r3.date;
    rows.sort((a3, b2) => {
      const av = val(a3), bv = val(b2);
      return av < bv ? -sort.dir : av > bv ? sort.dir : a3.points - b2.points;
    });
    const totalPages = Math.ceil(rows.length / PAGE_SIZE2);
    const pg = Math.min(page, Math.max(0, totalPages - 1));
    const multi = hotels.length > 1;
    const hasBook = results.some((r3) => r3.bookUrl);
    const hotelName = (code) => names[code] ?? code;
    const pills = [
      ...sharedPills,
      multi && {
        id: "hotel",
        label: "Hotel",
        display: filters.hotel && hotelName(filters.hotel),
        items: [[null, "All hotels"], ...hotels.map((h3) => [h3, hotelName(h3), { color: hotelColor(hotels, h3) }])]
      },
      {
        id: "dow",
        label: "Day of week",
        display: DOW_LABELS[filters.dow],
        items: [[null, "Any day"], ...[1, 2, 3, 4, 5, 6, 0].map((n2) => [n2, DOW_LABELS[n2]])]
      }
    ].filter(Boolean);
    function th(key, label) {
      const active = sort.key === key;
      return /* @__PURE__ */ u3(
        "th",
        {
          style: { cursor: "pointer", userSelect: "none", color: active ? "var(--ab-color)" : void 0 },
          onClick: () => {
            setSort(active ? { key, dir: -sort.dir } : { key, dir: 1 });
            setPage(0);
          },
          children: [
            label,
            " ",
            /* @__PURE__ */ u3("span", { style: { fontSize: 9, color: active ? "var(--ab-color)" : "#aaa" }, children: active ? sort.dir === 1 ? "\u2191" : "\u2193" : "\u2195" })
          ]
        }
      );
    }
    return /* @__PURE__ */ u3("div", { children: [
      /* @__PURE__ */ u3(FilterBar, { pills, filters: { ...shared, ...filters }, onChange: (f4) => {
        const own = { hotel: f4.hotel, dow: f4.dow };
        if (sharedPills.some((p3) => f4[p3.id] !== shared[p3.id])) onSharedChange(f4);
        else setFilters(own);
        setPage(0);
      }, children: [
        date && /* @__PURE__ */ u3("button", { class: "ab-flt-btn active", onClick: onClearDate, children: [
          date,
          " \u2715"
        ] }),
        /* @__PURE__ */ u3("button", { class: cx("ab-flt-btn", cheapest && "active"), onClick: () => {
          setCheapest(!cheapest);
          setPage(0);
        }, children: "Cheapest room only" })
      ] }),
      /* @__PURE__ */ u3("div", { style: { fontSize: 11, color: "#999", marginBottom: 4 }, children: [
        rows.length,
        " / ",
        results.length,
        " rate(s)"
      ] }),
      /* @__PURE__ */ u3("table", { class: "ab-tbl", children: [
        /* @__PURE__ */ u3("thead", { children: /* @__PURE__ */ u3("tr", { children: [
          th("date", "Date"),
          multi && /* @__PURE__ */ u3("th", { children: "Hotel" }),
          /* @__PURE__ */ u3("th", { children: "Room" }),
          th("points", "Points"),
          /* @__PURE__ */ u3("th", { children: "Left" }),
          hasBook && /* @__PURE__ */ u3("th", {})
        ] }) }),
        /* @__PURE__ */ u3("tbody", { children: rows.slice(pg * PAGE_SIZE2, (pg + 1) * PAGE_SIZE2).map((r3, i3) => /* @__PURE__ */ u3("tr", { children: [
          /* @__PURE__ */ u3("td", { children: r3.date }),
          multi && /* @__PURE__ */ u3("td", { class: "ab-hotel-cell", style: { color: hotelColor(hotels, r3.hotel) }, title: `${hotelName(r3.hotel)} (${r3.hotel})`, children: hotelName(r3.hotel) }),
          /* @__PURE__ */ u3("td", { style: { fontSize: 11, color: "#555" }, children: r3.room ?? "" }),
          /* @__PURE__ */ u3("td", { class: "ab-cab-miles", children: r3.points.toLocaleString() }),
          /* @__PURE__ */ u3("td", { style: { color: "#888" }, children: r3.roomsLeft ?? "" }),
          hasBook && /* @__PURE__ */ u3("td", { children: r3.bookUrl && /* @__PURE__ */ u3("a", { href: r3.bookUrl, target: "_blank", style: { color: "var(--ab-color)", fontSize: 11 }, children: "Book \u2197" }) })
        ] }, i3)) })
      ] }),
      totalPages > 1 && /* @__PURE__ */ u3(Pagination, { page: pg, totalPages, total: rows.length, setPage })
    ] });
  }

  // src/ui/HotelPicker.jsx
  function HotelPicker({ program: program2, value, names, onChange }) {
    const [query, setQuery] = d2("");
    const [open, setOpen] = d2(false);
    const [sugs, setSugs] = d2([]);
    const [list, setList] = d2(null);
    const [picked, setPicked] = d2([]);
    const wrapRef = A2(), inputRef = A2();
    useOutsideClick(wrapRef, () => setOpen(false));
    h2(() => {
      const text = query.trim();
      if (text.length < 2 || !program2.suggestHotels) {
        setSugs([]);
        return;
      }
      let stale = false;
      const t3 = setTimeout(() => program2.suggestHotels(text).then((s3) => !stale && setSugs(s3), () => !stale && setSugs([])), 300);
      return () => {
        stale = true;
        clearTimeout(t3);
      };
    }, [query]);
    function add(hotels) {
      const fresh = hotels.filter((h3) => !value.includes(h3.code));
      const named = Object.fromEntries(hotels.filter((h3) => h3.name).map((h3) => [h3.code, h3.name]));
      onChange([...value, ...fresh.map((h3) => h3.code)], { ...names, ...named });
    }
    const remove = (code) => onChange(value.filter((c3) => c3 !== code), names);
    function showList(title, hotels) {
      setPicked([]);
      setList({ title, hotels });
      const missing = hotels.filter((h3) => !h3.name && !names[h3.code]).map((h3) => h3.code);
      if (!program2.hotelName || !missing.length) return;
      let i3 = 0;
      const next = async () => {
        while (i3 < missing.length) {
          const code = missing[i3++];
          const name = await program2.hotelName(code).catch(() => null);
          if (name) setList((l3) => l3 && { ...l3, hotels: l3.hotels.map((h3) => h3.code === code ? { ...h3, name } : h3) });
        }
      };
      for (let n2 = 0; n2 < 4; n2++) next();
    }
    async function showPageHotels() {
      const title = "Hotels on this page";
      setList({ title, hotels: [], loading: true });
      try {
        showList(title, await program2.pageHotels());
      } catch {
        setList({ title, hotels: [], error: true });
      }
    }
    async function choose(s3) {
      setOpen(false);
      setQuery("");
      setSugs([]);
      setList({ title: s3.label, hotels: [], loading: true });
      try {
        const { exact, nearby } = await program2.hotelsAt(s3.ref);
        if (exact) {
          add([{ ...exact, name: exact.name ?? await program2.hotelName?.(exact.code).catch(() => null) }]);
          setList(null);
        } else showList(`Hotels near ${s3.label}`, nearby);
      } catch {
        setList({ title: s3.label, hotels: [], error: true });
      }
    }
    function onKeyDown(e3) {
      if (e3.key === "Backspace" && !query && value.length) remove(value[value.length - 1]);
      else if (e3.key === "Enter") {
        e3.preventDefault();
        const typed = query.trim().toUpperCase();
        if (program2.isHotelCode?.(typed)) {
          add([{ code: typed }]);
          setQuery("");
        } else if (sugs[0]) choose(sugs[0]);
      } else if (e3.key === "Escape") setOpen(false);
    }
    const toggle = (code) => setPicked((p3) => p3.includes(code) ? p3.filter((c3) => c3 !== code) : [...p3, code]);
    const choosable = list?.hotels.filter((h3) => !value.includes(h3.code)) ?? [];
    const nameOf = (h3) => h3.name ?? names[h3.code];
    return /* @__PURE__ */ u3("div", { ref: wrapRef, children: [
      /* @__PURE__ */ u3("div", { class: "ab-combo", children: [
        /* @__PURE__ */ u3("div", { class: "ab-combo-box", onClick: () => inputRef.current?.focus(), children: [
          value.map((code) => /* @__PURE__ */ u3("span", { class: "ab-chip", title: code, children: [
            names[code] ?? code,
            /* @__PURE__ */ u3("button", { class: "ab-chip-x", "aria-label": `Remove ${code}`, onClick: (e3) => {
              e3.stopPropagation();
              remove(code);
            }, children: "\xD7" })
          ] }, code)),
          /* @__PURE__ */ u3(
            "input",
            {
              ref: inputRef,
              class: "ab-combo-input",
              autocomplete: "off",
              placeholder: value.length ? "" : program2.hotelPlaceholder ?? "Hotel name, city or code",
              value: query,
              onInput: (e3) => {
                setQuery(e3.currentTarget.value);
                setOpen(true);
              },
              onFocus: () => setOpen(true),
              onKeyDown
            }
          )
        ] }),
        open && sugs.length > 0 && /* @__PURE__ */ u3("div", { class: "ab-combo-drop", children: sugs.map((s3, i3) => (
          // mousedown + preventDefault keeps focus in the input
          /* @__PURE__ */ u3("div", { class: "ab-combo-opt", onMouseDown: (e3) => {
            e3.preventDefault();
            choose(s3);
          }, children: [
            /* @__PURE__ */ u3("strong", { children: s3.label }),
            s3.sub && /* @__PURE__ */ u3("span", { style: { color: "#999" }, children: [
              " \xB7 ",
              s3.sub
            ] })
          ] }, i3)
        )) })
      ] }),
      program2.pageHotels && !list && /* @__PURE__ */ u3("button", { class: "ab-link-btn", style: { margin: "4px 0 0" }, onClick: showPageHotels, children: "+ Pick from hotels on this page" }),
      list && /* @__PURE__ */ u3("div", { class: "ab-hlist", children: [
        /* @__PURE__ */ u3("div", { class: "ab-hlist-head", children: [
          /* @__PURE__ */ u3("b", { children: list.title }),
          choosable.length > 0 && /* @__PURE__ */ u3("button", { class: "ab-link-btn", onClick: () => setPicked(picked.length === choosable.length ? [] : choosable.map((h3) => h3.code)), children: picked.length === choosable.length ? "Select none" : "Select all" }),
          /* @__PURE__ */ u3("button", { class: "ab-link-btn", style: { marginLeft: "auto" }, onClick: () => setList(null), children: "\u2715" })
        ] }),
        list.loading ? /* @__PURE__ */ u3("div", { class: "ab-hlist-note", children: "Loading\u2026" }) : list.error ? /* @__PURE__ */ u3("div", { class: "ab-hlist-note", children: "Couldn't load hotels. Try again." }) : !list.hotels.length ? /* @__PURE__ */ u3("div", { class: "ab-hlist-note", children: "No hotels found." }) : /* @__PURE__ */ u3("div", { class: "ab-hlist-items", children: list.hotels.map((h3) => {
          const added = value.includes(h3.code);
          return /* @__PURE__ */ u3("label", { class: cx("ab-hlist-item", added && "added"), children: [
            /* @__PURE__ */ u3("input", { type: "checkbox", checked: added || picked.includes(h3.code), disabled: added, onChange: () => toggle(h3.code) }),
            /* @__PURE__ */ u3("span", { class: "ab-hlist-name", children: nameOf(h3) ?? "\u2026" }),
            /* @__PURE__ */ u3("span", { class: "ab-hlist-sub", children: [
              h3.code,
              h3.sub ? ` \xB7 ${h3.sub}` : ""
            ] })
          ] }, h3.code);
        }) }),
        picked.length > 0 && /* @__PURE__ */ u3("button", { class: "ab-hlist-add", onClick: () => {
          add(list.hotels.filter((h3) => picked.includes(h3.code)).map((h3) => ({ code: h3.code, name: nameOf(h3) })));
          setList(null);
        }, children: [
          "Add ",
          picked.length,
          " hotel(s)"
        ] })
      ] })
    ] });
  }

  // src/ui/HotelSearch.jsx
  var storeKey = (id) => `award-buddy:${id}`;
  function initialForm(program2, storeId, carried) {
    if (carried) return carried;
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem(storeKey(storeId))) || {};
    } catch {
    }
    const current = program2.currentHotel?.();
    const hotels = Array.isArray(saved.hotels) ? saved.hotels.filter((c3) => typeof c3 === "string") : parseHotelCodes(saved.hotels);
    return {
      // On a hotel page with nothing saved, start with that hotel
      hotels: hotels.length ? hotels : current ? [current] : [],
      ...restoreMonths(saved.fromMonth, saved.toMonth)
    };
  }
  function initialNames(storeId) {
    try {
      const n2 = JSON.parse(localStorage.getItem(storeKey(storeId)))?.names;
      return n2 && typeof n2 === "object" ? n2 : {};
    } catch {
      return {};
    }
  }
  var modeKey = (program2) => `award-buddy:${program2.id}:mode`;
  function initialMode(program2) {
    let saved;
    try {
      saved = localStorage.getItem(modeKey(program2));
    } catch {
    }
    const valid = (code) => program2.modes.some((m3) => m3.code === code);
    const page = program2.pageMode?.();
    return valid(page) ? page : valid(saved) ? saved : program2.modes[0].code;
  }
  function HotelSearch({ program: program2, session }) {
    if (!program2.modes) return /* @__PURE__ */ u3(HotelSearchForm, { program: program2, session });
    return /* @__PURE__ */ u3(HotelSearchModes, { program: program2, session });
  }
  function HotelSearchModes({ program: program2, session }) {
    const [mode, setMode] = d2(() => initialMode(program2));
    const query = A2(null);
    h2(() => {
      try {
        localStorage.setItem(modeKey(program2), mode);
      } catch {
      }
    }, [mode]);
    const active = program2.modes.find((m3) => m3.code === mode);
    return /* @__PURE__ */ u3(S, { children: [
      /* @__PURE__ */ u3("div", { class: "ab-row", children: /* @__PURE__ */ u3("div", { class: "ab-field", children: [
        /* @__PURE__ */ u3("label", { children: program2.modeLabel ?? "Search mode" }),
        /* @__PURE__ */ u3("select", { value: mode, onChange: (e3) => setMode(e3.currentTarget.value), children: program2.modes.map((m3) => /* @__PURE__ */ u3("option", { value: m3.code, children: m3.name }, m3.code)) })
      ] }) }),
      active.tip && /* @__PURE__ */ u3("div", { class: "ab-tip", children: [
        "\u{1F4A1} ",
        active.tip,
        active.tipLink && /* @__PURE__ */ u3(S, { children: [
          " ",
          /* @__PURE__ */ u3("a", { href: active.tipLink.url, target: "_blank", style: { color: "var(--ab-color)" }, children: active.tipLink.text })
        ] })
      ] }),
      /* @__PURE__ */ u3(
        HotelSearchForm,
        {
          program: active.program,
          session,
          storeId: program2.id,
          carried: query.current,
          onFormChange: (f4) => {
            query.current = f4;
          }
        },
        active.code
      )
    ] });
  }
  function HotelSearchForm({ program: program2, session, storeId = program2.id, carried, onFormChange }) {
    const [form, setForm] = d2(() => initialForm(program2, storeId, carried));
    const set = (patch) => setForm((f4) => ({ ...f4, ...patch }));
    const [names, setNames] = d2(() => initialNames(storeId));
    h2(() => {
      try {
        localStorage.setItem(storeKey(storeId), JSON.stringify({ hotels: form.hotels, fromMonth: form.fromMonth, toMonth: form.toMonth, names }));
      } catch {
      }
      onFormChange?.(form);
    }, [form, names]);
    h2(() => {
      if (!program2.hotelName) return;
      for (const code of form.hotels.filter((c3) => !names[c3])) {
        program2.hotelName(code).then((name) => name && setNames((n2) => ({ ...n2, [code]: name })), () => {
        });
      }
    }, [form.hotels]);
    const run = useSearchRun(form);
    const { ctl, setStatus, setProgress } = run;
    h2(() => () => {
      ctl.stop = true;
      ctl.rerun = false;
    }, []);
    const [results, setResults] = d2([]);
    const [shown, setShown] = d2(null);
    const [date, setDate] = d2(null);
    const [noResults, setNoResults] = d2(false);
    useSavedResults(program2.id, run, { results, shown, noResults }, (saved) => {
      setResults(saved.results ?? []);
      setShown(saved.shown ?? null);
      setNoResults(!!saved.noResults);
    });
    const [rateType, setRateType] = d2(null);
    const [roomType, setRoomType] = d2(null);
    const latest = A2();
    latest.current = form;
    const hotels = form.hotels;
    const spans = form.fromMonth && form.toMonth ? monthSpans(form.fromMonth, form.toMonth) : [];
    async function search() {
      if (run.stopIfRunning()) return;
      const f4 = latest.current;
      const codes2 = f4.hotels;
      const spans2 = monthSpans(f4.fromMonth, f4.toMonth);
      if (!codes2.length || !spans2.length) {
        setStatus("\u26A0 Fill in all fields");
        return;
      }
      run.begin();
      setNoResults(false);
      setResults([]);
      setDate(null);
      setStatus("");
      setShown({ hotels: codes2, fromMonth: f4.fromMonth, toMonth: f4.toMonth });
      const total = spans2.length * codes2.length;
      let done = 0, failed = 0;
      const all = [];
      const tasks = spans2.flatMap(({ start, end }) => codes2.map((hotel) => async () => {
        if (ctl.stop) return;
        let result;
        try {
          result = await program2.onHotelSearch({ hotel, start, end });
        } catch {
          failed++;
        }
        if (result === "SESSION_EXPIRED") {
          ctl.stop = true;
          setStatus(program2.expiredMessage ?? "\u26A0 Session expired \u2014 refresh the page and try again");
          return;
        }
        done++;
        setProgress(done / total * 100);
        setStatus(`${done} / ${total} done`);
        all.push(...result || []);
        setResults([...all]);
      }));
      await runPool(tasks, CONCURRENCY);
      run.end();
      if (ctl.rerun) {
        ctl.rerun = false;
        search();
        return;
      }
      if (!ctl.stop) {
        setProgress(null);
        const failNote = failed ? ` ${failed} request(s) failed.` : "";
        setStatus(`Done in ${run.elapsed()}. Found ${all.length} rate(s) across ${total} request(s).${failNote}`);
        if (!all.length) setNoResults(true);
      } else if (all.length) setStatus((s3) => `${s3} (${all.length} found so far)`);
    }
    const rateTypes = ["Standard", "Premium"].filter((t3) => results.some((r3) => r3.rateType === t3));
    const activeRateType = rateTypes.includes(rateType) ? rateType : null;
    const lowest = {};
    for (const r3 of results) if (r3.roomType && (!activeRateType || r3.rateType === activeRateType) && !(lowest[r3.roomType] <= r3.points)) lowest[r3.roomType] = r3.points;
    const roomTypes = Object.keys(lowest).sort((a3, b2) => lowest[a3] - lowest[b2]);
    const activeRoomType = roomTypes.includes(roomType) ? roomType : null;
    const visible = results.filter((r3) => (!activeRateType || r3.rateType === activeRateType) && (!activeRoomType || r3.roomType === activeRoomType));
    const pills = [
      rateTypes.length > 1 && {
        id: "rateType",
        label: "Reward",
        display: activeRateType && `${activeRateType} only`,
        items: [[null, "Standard & Premium"], ["Standard", "Standard only"], ["Premium", "Premium only"]]
      },
      (roomTypes.length > 1 || activeRoomType) && {
        id: "roomType",
        label: "Room",
        display: activeRoomType,
        items: [[null, "All rooms"], ...roomTypes.map((t3) => [t3, t3])]
      }
    ].filter(Boolean);
    const summary2 = [
      hotels.map((c3) => names[c3] ?? c3).join(", ") || "?",
      `${form.fromMonth} \u2013 ${form.toMonth}`
    ].join(" \xB7 ");
    return /* @__PURE__ */ u3(S, { children: [
      run.collapsed ? /* @__PURE__ */ u3(SearchSummary, { run, text: summary2 }) : /* @__PURE__ */ u3(S, { children: [
        /* @__PURE__ */ u3("div", { class: "ab-row", children: /* @__PURE__ */ u3("div", { class: "ab-field", children: [
          /* @__PURE__ */ u3("label", { children: "Hotels" }),
          /* @__PURE__ */ u3(HotelPicker, { program: program2, value: form.hotels, names, onChange: (hotels2, n2) => {
            set({ hotels: hotels2 });
            setNames(n2);
          } })
        ] }) }),
        /* @__PURE__ */ u3("div", { class: "ab-row", children: /* @__PURE__ */ u3("div", { class: "ab-field", children: [
          /* @__PURE__ */ u3("label", { children: "Months (click start, then end)" }),
          /* @__PURE__ */ u3(MonthRangePicker, { from: form.fromMonth, to: form.toMonth, onChange: (fromMonth, toMonth) => set({ fromMonth, toMonth }) })
        ] }) }),
        /* @__PURE__ */ u3("div", { style: { fontSize: 11, color: "#888", marginBottom: 6, minHeight: 14 }, children: hotels.length > 0 && spans.length > 0 && `~${hotels.length * spans.length} request(s) (${hotels.length} hotel(s) \xD7 ${spans.length} month(s))` })
      ] }),
      /* @__PURE__ */ u3(SearchControls, { run, session, onSearch: search }),
      /* @__PURE__ */ u3("div", { children: [
        shown && results.length > 0 && /* @__PURE__ */ u3(
          HotelCalendar,
          {
            results: visible,
            hotels: shown.hotels,
            names,
            fromMonth: shown.fromMonth,
            toMonth: shown.toMonth,
            selected: date,
            onSelect: setDate
          }
        ),
        /* @__PURE__ */ u3(
          HotelTable,
          {
            results: visible,
            hotels: shown?.hotels ?? [],
            names,
            date,
            onClearDate: () => setDate(null),
            sharedPills: pills,
            shared: { rateType: activeRateType, roomType: activeRoomType },
            onSharedChange: (f4) => {
              setRateType(f4.rateType);
              setRoomType(f4.roomType);
              setDate(null);
            }
          }
        ),
        noResults && /* @__PURE__ */ u3("div", { class: "ab-no-results", children: "No award availability found." })
      ] })
    ] });
  }

  // src/ui/App.jsx
  var codes = (v3) => Array.isArray(v3) ? v3 : v3.split(",").map((s3) => s3.trim().toUpperCase()).filter(Boolean);
  var optionFields = (program2, form) => program2.optionsFor?.(form.carrier) ?? [];
  function optionRaw(fd, form) {
    const v3 = form.options[fd.key] ?? fd.default;
    return fd.type === "airports" ? Array.isArray(v3) ? v3 : [] : String(v3 ?? "");
  }
  function optionCombos(program2, form) {
    return combos(Object.fromEntries(optionFields(program2, form).map((fd) => {
      const v3 = optionRaw(fd, form);
      return [fd.key, fd.type === "airports" ? v3 : fd.type === "numbers" ? parseNumberList(v3) : v3.trim() ? [v3.trim()] : []];
    })));
  }
  var storeKey2 = (program2) => `award-buddy:${program2.id}`;
  function loadSaved(program2) {
    try {
      return JSON.parse(localStorage.getItem(storeKey2(program2))) || {};
    } catch {
      return {};
    }
  }
  var sameShape = (v3, fallback) => v3 != null && typeof v3 === typeof fallback && Array.isArray(v3) === Array.isArray(fallback) ? v3 : fallback;
  function initialForm2(program2) {
    const saved = loadSaved(program2);
    return {
      origins: sameShape(saved.origins, program2.airports ? [] : ""),
      dests: sameShape(saved.dests, program2.airports ? [] : "NRT"),
      ...restoreDates(saved.start, saved.end),
      ...restoreMonths(saved.fromMonth, saved.toMonth),
      carrier: program2.carriers?.some((c3) => c3.code === saved.carrier) ? saved.carrier : program2.carriers?.[0]?.code,
      options: saved.options && typeof saved.options === "object" ? saved.options : {},
      cabins: Array.isArray(saved.cabins) ? saved.cabins.filter((c3) => program2.cabins.includes(c3)) : []
    };
  }
  function summary(program2, form, calMode) {
    const route = `${codes(form.origins).join(", ") || "?"} \u2192 ${codes(form.dests).join(", ") || "?"}`;
    const when = calMode ? `${form.fromMonth} \u2013 ${form.toMonth}` : form.start ? `${form.start} \u2013 ${form.end || form.start}` : "?";
    const cabins = form.cabins.length ? form.cabins.map((c3) => CABIN_LABELS[c3]).join("/") : "Any cabin";
    const carrier = program2.carriers?.find((c3) => c3.code === form.carrier)?.name;
    const opts = optionFields(program2, form).map((fd) => `${fd.label} ${[optionRaw(fd, form)].flat().join(", ") || "?"}`);
    return [route, when, cabins, carrier, ...opts].filter(Boolean).join(" \xB7 ");
  }
  function requestHint(program2, form, calMode) {
    const routes = codes(form.origins).length * codes(form.dests).length;
    if (!routes) return "";
    if (calMode) {
      if (!form.fromMonth || !form.toMonth || form.toMonth < form.fromMonth) return "";
      const per = program2.calendarRequestsPerRoute?.(form.fromMonth, form.toMonth, form.cabins) ?? 1;
      return `~${routes * per} request(s) (${routes} route(s)${per > 1 ? ` \xD7 ${per}` : ""})`;
    }
    if (!form.start) return "";
    const days = getDates(form.start, form.end || form.start).length;
    const opts = optionFields(program2, form).length ? optionCombos(program2, form).length : 1;
    return `~${routes * days * opts} request(s) (${routes} route(s) \xD7 ${days} day(s)${opts > 1 ? ` \xD7 ${opts} combos` : ""})`;
  }
  function useSession(program2) {
    const check = () => ({
      ready: !program2.requiresSession || program2.isSessionReady(),
      url: program2.getSessionUrl?.() || program2.loginUrl
    });
    const [session, setSession] = d2(check);
    h2(() => {
      if (!program2.requiresSession || !program2.onSessionReady) return;
      const update = () => setSession(check());
      program2.onSessionReady(update);
      const poll = setInterval(() => {
        update();
        if (program2.isSessionReady()) clearInterval(poll);
      }, 1e3);
      return () => clearInterval(poll);
    }, []);
    return session;
  }
  function FlightSearch({ program: program2, session }) {
    const [calMode, setCalMode] = d2(() => loadSaved(program2).calMode === true);
    const [form, setForm] = d2(() => initialForm2(program2));
    const set = (patch) => setForm((f4) => ({ ...f4, ...patch }));
    const airports = program2.airportsFor?.(form.carrier) ?? program2.airports;
    const hasCalendar = !!program2.onCalendarSearch && (program2.calendarFor?.(form.carrier) ?? true);
    h2(() => {
      if (!hasCalendar) setCalMode(false);
    }, [hasCalendar]);
    h2(() => {
      const { origins, dests, start, end, fromMonth, toMonth, cabins, carrier, options } = form;
      try {
        localStorage.setItem(storeKey2(program2), JSON.stringify({ origins, dests, start, end, fromMonth, toMonth, calMode, cabins, carrier, options }));
      } catch {
      }
    }, [form, calMode]);
    const run = useSearchRun(form);
    const { ctl, setStatus, setProgress } = run;
    const [results, setResults] = d2([]);
    const [cal, setCal] = d2(null);
    const [noResults, setNoResults] = d2(false);
    useSavedResults(program2.id, run, { results, cal, noResults }, (saved) => {
      setResults(saved.results ?? []);
      setCal(saved.cal ?? null);
      setNoResults(!!saved.noResults);
    });
    const latest = A2();
    latest.current = { form, calMode };
    async function search() {
      if (run.stopIfRunning()) return;
      const { form: f4, calMode: calMode2 } = latest.current;
      const origins = codes(f4.origins), dests = codes(f4.dests);
      const cabinFilter = [...f4.cabins];
      if (calMode2) {
        const { fromMonth, toMonth } = f4;
        if (!origins.length || !dests.length || !fromMonth || !toMonth) {
          setStatus("\u26A0 Fill in all fields");
          return;
        }
        run.begin();
        setNoResults(false);
        setResults([]);
        setStatus("Fetching calendar\u2026");
        const merged = {};
        const found = () => Object.keys(merged).filter((d3) => inMonthRange(d3, fromMonth, toMonth)).length;
        setCal({ data: merged, fromMonth, toMonth });
        let route = "";
        const onProgress = (partial, meta) => {
          if (partial) {
            for (const [date, cabinMiles] of Object.entries(partial)) {
              merged[date] ?? (merged[date] = {});
              merged[date][route] = { ...merged[date][route], ...cabinMiles };
            }
            setCal({ data: { ...merged }, fromMonth, toMonth });
          }
          if (meta) {
            setProgress(meta.done / meta.total * 100);
            setStatus(`${meta.label ? meta.label + " " : ""}(${meta.done}/${meta.total}) \xB7 ${found()} date(s) found`);
          } else setStatus(`${found()} date(s) found\u2026`);
        };
        for (const o3 of origins) {
          for (const d3 of dests) {
            if (ctl.stop) break;
            route = `${o3}\u2192${d3}`;
            const result = await program2.onCalendarSearch(o3, d3, cabinFilter, fromMonth, toMonth, onProgress);
            if (result === "SESSION_EXPIRED") {
              setStatus(program2.expiredMessage ?? "\u26A0 Session expired \u2014 navigate to the award booking page to refresh");
              run.end();
              return;
            }
          }
        }
        run.end();
        setProgress(null);
        setStatus(`Done in ${run.elapsed()}. ${found()} date(s) with availability.`);
        if (ctl.rerun) {
          ctl.rerun = false;
          search();
        }
        return;
      }
      const from = f4.start, to = f4.end || f4.start;
      const optionSets = optionCombos(program2, f4);
      if (!origins.length || !dests.length || !from || !optionSets.length) {
        setStatus("\u26A0 Fill in all fields");
        return;
      }
      const dates = getDates(from, to);
      const total = origins.length * dests.length * dates.length * optionSets.length;
      run.begin();
      setNoResults(false);
      setCal(null);
      setResults([]);
      setStatus("");
      let done = 0;
      const all = [];
      const tasks = origins.flatMap((o3) => dests.flatMap((d3) => dates.flatMap((date) => optionSets.map((options) => async () => {
        if (ctl.stop) return;
        const result = await program2.onSearch({ origin: o3, destination: d3, date, cabinFilter, carrier: f4.carrier, options });
        if (result === "SESSION_EXPIRED") {
          ctl.stop = true;
          setStatus(program2.expiredMessage ?? "\u26A0 Session expired \u2014 search a flight on the site to refresh");
          return;
        }
        done++;
        setProgress(done / total * 100);
        setStatus(`${done} / ${total} done`);
        all.push(...(result || []).filter((r3) => !cabinFilter.length || cabinFilter.some((c3) => r3.cabins?.[c3] != null)));
        setResults([...all]);
      }))));
      await runPool(tasks, CONCURRENCY);
      run.end();
      if (ctl.rerun) {
        ctl.rerun = false;
        search();
        return;
      }
      if (!ctl.stop) {
        setProgress(null);
        setStatus(`Done in ${run.elapsed()}. Found ${all.length} result(s) across ${total} searches.`);
        if (!all.length) setNoResults(true);
      } else if (all.length) setStatus((s3) => `${s3} (${all.length} found so far)`);
    }
    const toggleCabin = (c3) => set({ cabins: form.cabins.includes(c3) ? form.cabins.filter((x2) => x2 !== c3) : [...form.cabins, c3] });
    const airportField = (key, label, placeholder) => /* @__PURE__ */ u3("div", { class: "ab-field", children: [
      /* @__PURE__ */ u3("label", { children: airports ? label : `${label}${key === "origins" ? " (comma separated)" : ""}` }),
      airports ? /* @__PURE__ */ u3(AirportCombo, { airports, value: form[key], onChange: (v3) => set({ [key]: v3 }) }) : /* @__PURE__ */ u3("input", { type: "text", placeholder, value: form[key], onInput: (e3) => set({ [key]: e3.currentTarget.value }) })
    ] });
    return /* @__PURE__ */ u3(S, { children: [
      run.collapsed ? /* @__PURE__ */ u3(SearchSummary, { run, text: summary(program2, form, calMode) }) : /* @__PURE__ */ u3(S, { children: [
        program2.carriers && /* @__PURE__ */ u3("div", { class: "ab-row", children: /* @__PURE__ */ u3("div", { class: "ab-field", children: [
          /* @__PURE__ */ u3("label", { children: program2.carrierLabel ?? "Carrier" }),
          /* @__PURE__ */ u3("select", { value: form.carrier, onChange: (e3) => set({ carrier: e3.currentTarget.value }), children: program2.carriers.map((c3) => /* @__PURE__ */ u3("option", { value: c3.code, children: c3.name }, c3.code)) })
        ] }) }),
        optionFields(program2, form).length > 0 && /* @__PURE__ */ u3("div", { class: "ab-row", children: optionFields(program2, form).map((fd) => /* @__PURE__ */ u3("div", { class: "ab-field", children: [
          /* @__PURE__ */ u3("label", { children: fd.label }),
          fd.type === "airports" ? /* @__PURE__ */ u3(AirportCombo, { airports, value: optionRaw(fd, form), onChange: (v3) => set({ options: { ...form.options, [fd.key]: v3 } }) }) : /* @__PURE__ */ u3(
            "input",
            {
              type: "text",
              placeholder: fd.placeholder,
              value: optionRaw(fd, form),
              onInput: (e3) => set({ options: { ...form.options, [fd.key]: e3.currentTarget.value } })
            }
          )
        ] }, fd.key)) }),
        hasCalendar && /* @__PURE__ */ u3("div", { class: "ab-mode-toggle", children: [
          /* @__PURE__ */ u3("button", { class: cx("ab-mode-btn", !calMode && "active"), onClick: () => setCalMode(false), children: "Search" }),
          /* @__PURE__ */ u3("button", { class: cx("ab-mode-btn", calMode && "active"), onClick: () => setCalMode(true), children: "Calendar" })
        ] }),
        hasCalendar && !calMode && program2.searchTip && /* @__PURE__ */ u3("div", { class: "ab-tip", children: [
          "\u{1F4A1} ",
          program2.searchTip
        ] }),
        /* @__PURE__ */ u3("div", { class: "ab-row", children: [
          airportField("origins", "Origins", "e.g. TPE, TSA"),
          airportField("dests", "Destinations", "e.g. NRT, HND")
        ] }),
        calMode ? /* @__PURE__ */ u3("div", { class: "ab-row", children: /* @__PURE__ */ u3("div", { class: "ab-field", children: [
          /* @__PURE__ */ u3("label", { children: "Months (click start, then end)" }),
          /* @__PURE__ */ u3(MonthRangePicker, { from: form.fromMonth, to: form.toMonth, onChange: (fromMonth, toMonth) => set({ fromMonth, toMonth }) })
        ] }) }) : /* @__PURE__ */ u3("div", { class: "ab-row", children: /* @__PURE__ */ u3("div", { class: "ab-field", children: [
          /* @__PURE__ */ u3("label", { children: "Dates" }),
          /* @__PURE__ */ u3(DateRangePicker, { start: form.start, end: form.end, onChange: (start, end) => set({ start, end }) })
        ] }) }),
        /* @__PURE__ */ u3("div", { style: { marginBottom: 10 }, children: [
          /* @__PURE__ */ u3("label", { style: { fontSize: 12, color: "#666", display: "block", marginBottom: 5 }, children: "Cabin (leave all off = any)" }),
          /* @__PURE__ */ u3("div", { class: "ab-cabins", children: program2.cabins.map((c3) => /* @__PURE__ */ u3(
            "button",
            {
              class: "ab-cabin-btn",
              onClick: () => toggleCabin(c3),
              style: form.cabins.includes(c3) ? { background: CABIN_COLORS[c3], color: "#fff", borderColor: "transparent" } : void 0,
              children: CABIN_LABELS[c3]
            },
            c3
          )) })
        ] }),
        /* @__PURE__ */ u3("div", { style: { fontSize: 11, color: "#888", marginBottom: 6, minHeight: 14 }, children: requestHint(program2, form, calMode) })
      ] }),
      /* @__PURE__ */ u3(SearchControls, { run, session, onSearch: search }),
      /* @__PURE__ */ u3("div", { children: [
        cal && /* @__PURE__ */ u3(CalendarView, { calData: cal.data, fromMonth: cal.fromMonth, toMonth: cal.toMonth }),
        /* @__PURE__ */ u3(ResultsTable, { results: cal ? calToRows(cal.data, cal.fromMonth, cal.toMonth) : results }),
        noResults && /* @__PURE__ */ u3("div", { class: "ab-no-results", children: "No award availability found." })
      ] })
    ] });
  }
  function App({ program: program2 }) {
    const [open, setOpen] = d2(false);
    const [expanded, setExpanded] = d2(false);
    const session = useSession(program2);
    const Search = program2.kind === "hotel" ? HotelSearch : FlightSearch;
    return /* @__PURE__ */ u3(S, { children: [
      /* @__PURE__ */ u3("style", { children: CSS }),
      /* @__PURE__ */ u3("button", { id: "ab-fab", title: `Award Buddy \u2013 ${program2.name}`, onClick: () => setOpen(!open), children: program2.kind === "hotel" ? "\u{1F3E8}" : "\u2708" }),
      /* @__PURE__ */ u3("div", { id: "ab-panel", class: cx(!open && "hidden", expanded && "ab-expanded"), children: [
        /* @__PURE__ */ u3("div", { class: "ab-header", children: [
          /* @__PURE__ */ u3("span", { children: [
            program2.kind === "hotel" ? "\u{1F3E8}" : "\u2708",
            " Award Buddy \u2013 ",
            program2.name
          ] }),
          /* @__PURE__ */ u3("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [
            /* @__PURE__ */ u3("button", { title: "Expand", style: { fontSize: 20, lineHeight: 1 }, onClick: () => setExpanded(!expanded), children: expanded ? "\u2921" : "\u2922" }),
            /* @__PURE__ */ u3("button", { onClick: () => setOpen(false), children: "\u2715" })
          ] })
        ] }),
        program2.requiresSession && (session.ready ? /* @__PURE__ */ u3("div", { class: "ab-session-bar ok", children: [
          /* @__PURE__ */ u3("div", { class: "ab-dot" }),
          " Session ready"
        ] }) : /* @__PURE__ */ u3("div", { class: "ab-session-bar waiting", children: [
          /* @__PURE__ */ u3("div", { class: "ab-dot" }),
          " ",
          program2.sessionHint ?? "Waiting for session\u2026",
          program2.triggerSession ? /* @__PURE__ */ u3("button", { style: { marginLeft: 6, fontSize: 12 }, onClick: () => program2.triggerSession(), children: "Get session" }) : session.url && /* @__PURE__ */ u3("a", { href: session.url, target: "_blank", style: { color: "inherit", marginLeft: 6 }, children: "\u2192 Get session" })
        ] })),
        /* @__PURE__ */ u3("div", { class: "ab-body", children: /* @__PURE__ */ u3(Search, { program: program2, session }) })
      ] })
    ] });
  }
  function mountPanel(program2) {
    const host = document.createElement("div");
    document.body.appendChild(host);
    host.style.setProperty("--ab-color", program2.color);
    R(/* @__PURE__ */ u3(App, { program: program2 }), host.attachShadow({ mode: "open" }));
  }

  // src/programs/as.js
  var AS_CABIN_MAP = { "FIRST": "F", "BUSINESS": "J", "PREMIUM-COACH": "N", "COACH": "Y" };
  var AS_SEARCH_URL = "https://www.alaskaair.com/search/api/flightresults";
  var AS_CAL_URL = "https://www.alaskaair.com/search/calendar/__data.json";
  var AS_CAL_FARE_TYPE = { Y: "Main", N: "Partner Premium", J: "Partner Business", F: "First Class" };
  var AS_DELAY_MS = 800;
  function asBuildRequest(origin, destination, date) {
    return JSON.stringify({
      origins: [origin],
      destinations: [destination],
      dates: [date],
      numADTs: 1,
      numINFs: 0,
      numCHDs: 0,
      fareView: "as_awards",
      isAwards: true,
      isMultiCity: false,
      onba: false,
      dnba: false,
      sliceId: 0,
      sessionID: "",
      solutionIDs: [],
      solutionSetIDs: [],
      qpxcVersion: "",
      trackingTags: [],
      isMobileApp: false,
      isAlaska: false,
      umnrAgeGroup: "",
      isAddingToAdultRes: false,
      lockFare: false,
      discount: {
        code: "",
        status: 0,
        expirationDate: (/* @__PURE__ */ new Date()).toISOString(),
        message: "",
        memo: "",
        type: 0,
        amount: 0,
        distribution: 0,
        searchContainsDiscountedFare: false,
        campaignName: "",
        campaignCode: "",
        validationErrors: [],
        maxPassengers: 0,
        minPassengers: 0
      }
    });
  }
  function asParseCalendarChunk(body) {
    for (const line of body.split("\n")) {
      if (!line.startsWith("{")) continue;
      let chunk;
      try {
        chunk = JSON.parse(line);
      } catch {
        continue;
      }
      if (chunk.type !== "chunk" || !Array.isArray(chunk.data)) continue;
      const data = chunk.data;
      const resolver = data.find((item) => item && typeof item === "object" && "calendarDates" in item);
      if (!resolver) continue;
      const calList = data[resolver.calendarDates];
      if (!Array.isArray(calList)) continue;
      return calList.flatMap((idx) => {
        if (typeof idx !== "number") return [];
        const e3 = data[idx];
        const date = typeof e3?.date === "number" ? data[e3.date] : e3?.date;
        const apRaw = e3?.awardPoints;
        const ap = typeof apRaw === "number" ? Number.isInteger(apRaw) && apRaw < data.length && typeof data[apRaw] === "number" ? data[apRaw] : apRaw : null;
        return typeof date === "string" && typeof ap === "number" && ap > 0 ? [{ date, awardPoints: ap }] : [];
      });
    }
    return [];
  }
  function asParseResponse(data, origin, destination, date) {
    if (!data?.rows) return [];
    const results = [];
    for (const row of data.rows) {
      const solutions = Object.values(row.solutions ?? {});
      if (!solutions.length) continue;
      const byCabin2 = {};
      for (const sol of solutions) {
        const raw = sol.cabins?.[0];
        if (!raw) continue;
        if (!byCabin2[raw] || sol.atmosPoints < byCabin2[raw].atmosPoints) byCabin2[raw] = sol;
      }
      const cabins = { F: null, J: null, N: null, Y: null }, miles = {};
      for (const [raw, sol] of Object.entries(byCabin2)) {
        const c3 = AS_CABIN_MAP[raw];
        if (!c3) continue;
        cabins[c3] = sol.seatsRemaining;
        if (sol.atmosPoints > 0) miles[c3] = sol.atmosPoints;
      }
      if (!Object.values(cabins).some((v3) => v3 !== null)) continue;
      const segs = (row.segments ?? []).map((seg) => ({
        airline: seg.publishingCarrier.carrierCode,
        flight: seg.publishingCarrier.carrierCode + seg.publishingCarrier.flightNumber,
        origin: seg.departureStation,
        destination: seg.arrivalStation,
        dep: seg.departureTime,
        arr: seg.arrivalTime
      }));
      const bookUrl = `https://www.alaskaair.com/search/results?A=1&O=${origin}&D=${destination}&OD=${date}&OT=Anytime&RT=false&UPG=none&ShoppingMethod=onlineaward&locale=en-us`;
      results.push({ date, origin, destination, segs, cabins, miles, duration: row.duration, bookUrl });
    }
    return results;
  }
  var asProgram = {
    id: "as",
    name: "Alaska Airlines",
    color: "#00467F",
    cabins: ["F", "J", "N", "Y"],
    airports: COMMON_AIRPORTS,
    requiresSession: false,
    matches: ["www.alaskaair.com"],
    async onSearch({ origin, destination, date }) {
      await sleep(AS_DELAY_MS);
      try {
        const res = await fetch(AS_SEARCH_URL, {
          method: "POST",
          headers: { "content-type": "text/plain;charset=UTF-8", "adrum": "isAjax:true" },
          credentials: "include",
          body: asBuildRequest(origin, destination, date)
        });
        if (!res.ok) return [];
        const data = await res.json();
        return asParseResponse(data, origin, destination, date);
      } catch {
        return [];
      }
    },
    async onCalendarSearch(origin, destination, cabins, fromMonth, toMonth, onProgress) {
      const cabinsToSearch = (cabins.length ? cabins : ["F", "J", "N", "Y"]).filter((c3) => c3 in AS_CAL_FARE_TYPE);
      const [fy, fm] = fromMonth.split("-").map(Number);
      const [ty, tm] = toMonth.split("-").map(Number);
      const months = [];
      for (let y3 = fy, m3 = fm; y3 < ty || y3 === ty && m3 <= tm; m3 > 11 ? (y3++, m3 = 1) : m3++)
        months.push(`${y3}-${String(m3).padStart(2, "0")}`);
      const total = cabinsToSearch.length * months.length;
      let done = 0;
      const byDate = {};
      for (const cabin of cabinsToSearch) {
        for (const yearMonth of months) {
          onProgress?.(null, { done, total, label: `Searching ${cabin} \u2013 ${yearMonth}` });
          await sleep(AS_DELAY_MS);
          try {
            const params = new URLSearchParams({
              O: origin,
              D: destination,
              OD: `${yearMonth}-01`,
              A: "1",
              RT: "false",
              RequestType: "Calendar",
              ShoppingMethod: "onlineaward",
              locale: "en-us",
              FareType: AS_CAL_FARE_TYPE[cabin],
              "x-sveltekit-invalidated": "11"
            });
            const res = await fetch(`${AS_CAL_URL}?${params}`, {
              headers: { adrum: "isAjax:true" },
              credentials: "include"
            });
            if (!res.ok) {
              done++;
              continue;
            }
            const body = await res.text();
            const partial = {};
            for (const { date, awardPoints } of asParseCalendarChunk(body)) {
              if (date < fromMonth || date > toMonth + "-31") continue;
              if (!byDate[date]) byDate[date] = {};
              byDate[date][cabin] = awardPoints;
              partial[date] = { ...partial[date] ?? {}, [cabin]: awardPoints };
            }
            done++;
            onProgress?.(Object.keys(partial).length ? partial : null, { done, total });
          } catch {
            done++;
          }
        }
      }
      return byDate;
    }
  };

  // src/programs/lifemiles.js
  var LM_SEARCH_URL = "https://api.lifemiles.com/svc/air-redemption-find-flight-private";
  var LM_PAR_URL = "https://api.lifemiles.com/svc/air-redemption-par-header-private";
  var LM_DELAY_MS = 1e3;
  var LM_CARRIERS = [
    { code: "SSA", name: "Star Alliance" },
    { code: "SMR", name: "Smart Search" },
    { code: "TG", name: "Thai Airways" },
    { code: "AVH", name: "Avianca + Gol" },
    { code: "A3", name: "Aegean Airlines" },
    { code: "NH", name: "ANA" },
    { code: "LH", name: "Lufthansa" },
    { code: "SQ", name: "Singapore Airlines" },
    { code: "UA", name: "United Airlines" }
  ];
  var lmCaptured = { bearerToken: null, secret: null, sessionData: null, schTokens: null };
  var lmParTriggered = false;
  var lmSessionCallback = null;
  function lmNotify() {
    if (lmSessionCallback && lmCaptured.bearerToken && lmCaptured.sessionData) lmSessionCallback();
  }
  function lmExtractToken(auth, secret) {
    if (auth?.startsWith("Bearer ")) lmCaptured.bearerToken = auth.slice(7);
    if (secret) lmCaptured.secret = secret;
    if (lmCaptured.bearerToken && !lmParTriggered) lmSchedulePar();
    lmNotify();
  }
  function lmExtractSession(data) {
    if (!data?.sch) return;
    lmCaptured.sessionData = JSON.stringify({
      sch: data.sch || {},
      discounts: data.discounts || [],
      promotionCodes: data.promotionCodes || [],
      suscriptionPaymentStatus: data.suscriptionPaymentStatus || "",
      officeId: data.officeId || "",
      idCotizacion: data.idCotizacion || ""
    });
    lmNotify();
  }
  (function() {
    const origOpen = XMLHttpRequest.prototype.open;
    const origSetHeader = XMLHttpRequest.prototype.setRequestHeader;
    const origSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
      this._abUrl = String(url);
      this._abHdrs = {};
      return origOpen.apply(this, [method, url, ...rest]);
    };
    XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
      if (this._abHdrs) this._abHdrs[name.toLowerCase()] = value;
      return origSetHeader.apply(this, [name, value]);
    };
    XMLHttpRequest.prototype.send = function(body) {
      const url = this._abUrl || "", hdrs = this._abHdrs || {};
      if (url.includes("api.lifemiles.com")) lmExtractToken(hdrs["authorization"], hdrs["secret"]);
      if (url.includes("air-redemption-par-header"))
        this.addEventListener("load", function() {
          try {
            lmExtractSession(JSON.parse(this.responseText));
          } catch {
          }
        });
      if (url.includes("air-redemption-find-flight") && body)
        try {
          const bd = JSON.parse(String(body));
          if (bd?.sch) lmCaptured.schTokens = JSON.stringify(bd.sch);
        } catch {
        }
      return origSend.apply(this, [body]);
    };
  })();
  var lmOrigFetch = window.fetch.bind(window);
  if (location.hostname === "www.lifemiles.com") window.fetch = function(input, init) {
    const url = typeof input === "string" ? input : input instanceof Request ? input.url : String(input);
    const hdrs = init?.headers || (input instanceof Request ? input.headers : null);
    const result = lmOrigFetch(input, init);
    if (url.includes("sso.lifemiles.com") && url.includes("/token"))
      result.then((r3) => r3.clone().json()).then((d3) => {
        if (d3?.access_token) {
          lmCaptured.bearerToken = d3.access_token;
          lmNotify();
          lmSchedulePar();
        }
      }).catch(() => {
      });
    if (url.includes("api.lifemiles.com") && hdrs) {
      let auth = null, secret = null;
      if (hdrs instanceof Headers) {
        auth = hdrs.get("authorization");
        secret = hdrs.get("secret");
      } else if (typeof hdrs === "object") {
        auth = hdrs["authorization"] || hdrs["Authorization"];
        secret = hdrs["secret"] || hdrs["Secret"];
      }
      lmExtractToken(auth, secret);
    }
    if (url.includes("air-redemption-par-header"))
      result.then((r3) => r3.clone().json()).then((d3) => lmExtractSession(d3)).catch(() => {
      });
    if (url.includes("air-redemption-find-flight")) {
      const body = init?.body ? String(init.body) : "";
      try {
        const bd = JSON.parse(body);
        if (bd?.sch) lmCaptured.schTokens = JSON.stringify(bd.sch);
      } catch {
      }
    }
    return result;
  };
  async function lmSchedulePar() {
    if (lmParTriggered || lmCaptured.sessionData) return;
    lmParTriggered = true;
    await sleep(3e3);
    if (lmCaptured.sessionData) return;
    try {
      const res = await lmOrigFetch(LM_PAR_URL, {
        method: "POST",
        credentials: "include",
        headers: {
          "accept": "application/json",
          "content-type": "application/json",
          "authorization": `Bearer ${lmCaptured.bearerToken}`,
          "realm": "lifemiles"
        },
        body: JSON.stringify({
          cabin: "1",
          ftNum: "",
          internationalization: { language: "en", country: "us", currency: "usd" },
          itineraryName: "One-Way",
          itineraryType: "OW",
          numOd: 1,
          ods: [{ id: 1, origin: { cityName: "Miami", cityCode: "MIA" }, destination: { cityName: "Bogota", cityCode: "BOG" } }],
          paxNum: 1,
          selectedSearchType: "SMR"
        })
      });
      lmExtractSession(await res.json());
    } catch {
    }
  }
  function lmBuildBody(origin, destination, date, searchType = "SMR") {
    const session = lmCaptured.sessionData ? JSON.parse(lmCaptured.sessionData) : {};
    let capturedSch = {};
    if (lmCaptured.schTokens) try {
      capturedSch = JSON.parse(lmCaptured.schTokens);
    } catch {
    }
    const sch = { ...session.sch || {}, ...capturedSch };
    return JSON.stringify({
      internationalization: { language: "en", country: "us", currency: "usd" },
      currencies: [{ currency: "USD", decimal: 2, rateUsd: 1 }],
      passengers: 1,
      od: { orig: origin, dest: destination, depDate: date, depTime: "" },
      filter: false,
      codPromo: null,
      idCoti: session.idCotizacion || "",
      officeId: session.officeId || "",
      ftNum: "",
      discounts: session.discounts || [],
      promotionCodes: session.promotionCodes || [],
      context: "D",
      channel: "COM",
      cabin: "1",
      itinerary: "OW",
      odNum: 1,
      usdTaxValue: "0",
      getQuickSummary: false,
      ods: "",
      searchType,
      searchTypePrioritized: searchType,
      sch,
      posCountry: "US",
      odAp: [{ org: origin, dest: destination, cabin: 1 }],
      suscriptionPaymentStatus: session.suscriptionPaymentStatus || ""
    });
  }
  function lmParseResponse(data, origin, destination, date) {
    if (data.status !== "success") return [];
    const results = [];
    for (const trip of data.tripsList || []) {
      const flights = trip.flightsDetail || [];
      const baseSegs = flights.map((leg, i3) => {
        const dep = `${leg.departingDate}T${leg.departingTime}:00`;
        const arr = `${leg.arrivalDate}T${leg.arrivalTime}:00`;
        const seg = {
          airline: leg.marketingCompany || "",
          flight: (leg.marketingCompany || "") + (leg.flightNumber || ""),
          origin: leg.departingCityCode,
          destination: leg.arrivalCityCode,
          dep,
          arr,
          transit: 0,
          durationMins: Math.floor((new Date(arr) - new Date(dep)) / 6e4)
        };
        if (i3 > 0) {
          const prev = flights[i3 - 1];
          seg.transit = Math.floor((new Date(dep) - /* @__PURE__ */ new Date(`${prev.arrivalDate}T${prev.arrivalTime}:00`)) / 6e4);
        }
        return seg;
      });
      const products = trip.products || [];
      const ecoMiles = {}, ecoSeats = {};
      for (const p3 of products) {
        if (p3.soldOut || p3.cabinCode !== 1) continue;
        for (const f4 of p3.flights || [])
          if (!f4.soldOut && f4.miles && (!ecoMiles[f4.id] || f4.miles < ecoMiles[f4.id])) {
            ecoMiles[f4.id] = f4.miles;
            ecoSeats[f4.id] = f4.remainingSeats;
          }
      }
      const comboMap = {};
      for (const p3 of products) {
        if (p3.soldOut || p3.cabinCode !== 1 && p3.cabinCode !== 2) continue;
        let totalMiles = 0, minSeats = Infinity, valid = true;
        const segCabins = {}, segSeatsMap = {};
        for (const f4 of p3.flights || []) {
          if (!f4.soldOut && f4.miles) {
            segCabins[f4.id] = p3.cabinCode === 2 ? "J" : "Y";
            segSeatsMap[f4.id] = f4.remainingSeats;
            totalMiles += f4.miles;
            minSeats = Math.min(minSeats, f4.remainingSeats);
          } else if (ecoMiles[f4.id]) {
            segCabins[f4.id] = "Y";
            segSeatsMap[f4.id] = ecoSeats[f4.id] || 0;
            totalMiles += ecoMiles[f4.id];
            minSeats = Math.min(minSeats, ecoSeats[f4.id] || 0);
          } else {
            valid = false;
            break;
          }
        }
        if (!valid || !totalMiles) continue;
        const segKey = baseSegs.map((s3) => segCabins[`${s3.airline}${s3.flight.replace(s3.airline, "")}`] || "Y").join("+");
        const seats = minSeats === Infinity ? 0 : minSeats;
        if (!comboMap[segKey] || totalMiles < comboMap[segKey].miles)
          comboMap[segKey] = { miles: totalMiles, seats, segCabins: { ...segCabins } };
      }
      if (!Object.keys(comboMap).length) continue;
      let eco = null, biz = null, bizKey = null;
      for (const [key, combo] of Object.entries(comboMap)) {
        if (key.includes("J")) {
          if (!biz || combo.miles < biz.miles) {
            biz = combo;
            bizKey = key;
          }
        } else {
          if (!eco || combo.miles < eco.miles) eco = combo;
        }
      }
      let segCabinsJ = null, mixPct = {};
      if (biz && bizKey) {
        segCabinsJ = baseSegs.map((s3) => biz.segCabins[`${s3.airline}${s3.flight.replace(s3.airline, "")}`] || "Y");
        const totalMins = baseSegs.reduce((s3, seg) => s3 + (seg.durationMins || 0), 0);
        const jMins = baseSegs.reduce((s3, seg, i3) => s3 + (segCabinsJ[i3] === "J" ? seg.durationMins || 0 : 0), 0);
        if (jMins < totalMins && totalMins > 0) mixPct.J = Math.round(jMins / totalMins * 100);
      }
      const [h3, m3] = (trip.duration || "0:0").split(":").map(Number);
      const bookUrl = `https://www.lifemiles.com/fly/redemption?orig=${origin}&dest=${destination}&depDate=${date}&cabin=1&paxNum=1`;
      results.push({
        date,
        origin,
        destination,
        segs: baseSegs,
        cabins: { F: null, J: biz?.seats ?? null, N: null, Y: eco?.seats ?? null },
        miles: { ...biz ? { J: biz.miles } : {}, ...eco ? { Y: eco.miles } : {} },
        duration: (h3 || 0) * 60 + (m3 || 0),
        ...segCabinsJ ? { segCabinsJ } : {},
        ...Object.keys(mixPct).length ? { mixPct } : {},
        bookUrl
      });
    }
    return results;
  }
  var lifemilesProgram = {
    id: "lifemiles",
    name: "LifeMiles",
    color: "#E31837",
    cabins: ["J", "Y"],
    airports: COMMON_AIRPORTS,
    carriers: LM_CARRIERS,
    requiresSession: true,
    matches: ["www.lifemiles.com"],
    // called by ui.js to wire up session-ready callback → enables the search button
    onSessionReady(cb) {
      lmSessionCallback = cb;
    },
    isSessionReady() {
      return !!(lmCaptured.bearerToken && lmCaptured.sessionData);
    },
    async onSearch({ origin, destination, date, carrier }) {
      await sleep(LM_DELAY_MS);
      try {
        const res = await lmOrigFetch(LM_SEARCH_URL, {
          method: "POST",
          credentials: "include",
          headers: {
            "accept": "application/json",
            "content-type": "application/json",
            "authorization": `Bearer ${lmCaptured.bearerToken}`,
            "realm": "lifemiles",
            ...lmCaptured.secret ? { "secret": lmCaptured.secret } : {}
          },
          body: lmBuildBody(origin, destination, date, carrier || "SMR")
        });
        const data = await res.json();
        if (data.fault || data.status && data.status !== "success" && !data.tripsList) return "SESSION_EXPIRED";
        return lmParseResponse(data, origin, destination, date);
      } catch {
        return [];
      }
    }
  };

  // src/programs/cx.js
  var CX_DELAY_MS = 500;
  var CX_AVAILABILITY_BASE = "https://book.cathaypacific.com/CathayPacificAwardV3/dyn/air/booking/availability";
  var CX_AWARD_PAGE = "https://www.cathaypacific.com/cx/en_HK/book-a-trip/redeem-flights/redeem-flight-awards.html";
  var CX_REDIBE_BASE = "https://api.cathaypacific.com/redibe/IBEFacade";
  var cxCaptured = { requestParams: null, tabId: null, formSubmitUrl: null };
  var cxSessionCallback = null;
  function cxApply(parsed) {
    if (!parsed?.TAB_ID) return false;
    cxCaptured.requestParams = parsed;
    cxCaptured.tabId = parsed.TAB_ID;
    cxCaptured.formSubmitUrl = CX_AVAILABILITY_BASE + "?TAB_ID=" + parsed.TAB_ID;
    if (cxSessionCallback) cxSessionCallback();
    return true;
  }
  function cxExtractFromHtml(html) {
    const m3 = html.match(/requestParams = JSON\.parse\(JSON\.stringify\('([^']+)/);
    if (!m3) return null;
    try {
      return JSON.parse(m3[1]);
    } catch {
      return null;
    }
  }
  function cxTryCapture() {
    const rp = window.requestParams;
    if (rp) {
      const parsed = typeof rp === "string" ? JSON.parse(rp) : rp;
      if (cxApply(parsed)) return true;
    }
    for (const script of document.scripts) {
      const text = script.textContent;
      if (!text.includes("requestParams")) continue;
      const m3 = text.match(/requestParams = JSON\.parse\(JSON\.stringify\('([^']+)/);
      if (!m3) continue;
      try {
        if (cxApply(JSON.parse(m3[1]))) return true;
      } catch {
      }
    }
    const tabInput = document.querySelector('input[name="TAB_ID"]');
    if (tabInput && tabInput.value) {
      const form = tabInput.closest("form");
      const params = { TAB_ID: tabInput.value };
      if (form) {
        for (const el of form.elements) {
          if (el.name && el.value) params[el.name] = el.value;
        }
      }
      if (cxApply(params)) return true;
    }
    return false;
  }
  function cxSessionUrl(origin, dest, date) {
    const d3 = /* @__PURE__ */ new Date();
    d3.setMonth(d3.getMonth() + 1);
    const today = d3.toISOString().slice(0, 10).replace(/-/g, "");
    const p3 = new URLSearchParams({
      ACTION: "RED_AWARD_SEARCH",
      ENTRYPOINT: CX_AWARD_PAGE,
      ENTRYLANGUAGE: "en",
      ENTRYCOUNTRY: "HK",
      RETURNURL: CX_AWARD_PAGE,
      ERRORURL: "https://www.cathaypacific.com/cx/en_HK/book-a-trip/redeem-flights/redeem-flight-awards.handler.html",
      LOGINURL: "https://www.cathaypacific.com/cx/en_HK/sign-in.html",
      CABINCLASS: "Y",
      ADULT: "1",
      CHILD: "0",
      DISCOUNTCODE: "",
      FLEXIBLEDATE: "true",
      BRAND: "CX",
      "ORIGIN[1]": origin || "HKG",
      "DESTINATION[1]": dest || "NRT",
      "DEPARTUREDATE[1]": date || today
    });
    return `${CX_REDIBE_BASE}?${p3}`;
  }
  async function cxRefreshTabId() {
    const enc = cxCaptured.requestParams?.ENC;
    if (!enc) return false;
    try {
      const body = new URLSearchParams({
        SERVICE_ID: "1",
        LANGUAGE: "TW",
        EMBEDDED_TRANSACTION: "AirAvailabilityServlet",
        SITE: "CXAWCXAW",
        ENC: enc,
        ENCT: "2",
        ENTRYCOUNTRY: "",
        ENTRYLANGUAGE: ""
      });
      const res = await fetch(CX_AVAILABILITY_BASE, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: body.toString()
      });
      const html = await res.text();
      return cxApply(cxExtractFromHtml(html));
    } catch {
      return false;
    }
  }
  function cxBuildParams(origin, destination, date) {
    const p3 = { ...cxCaptured.requestParams };
    p3.B_LOCATION_1 = origin;
    p3.E_LOCATION_1 = destination;
    p3.B_DATE_1 = date.replace(/-/g, "") + "0000";
    p3.ADULT = "1";
    p3.CHILD = "0";
    delete p3.ENCT;
    delete p3.SERVICE_ID;
    delete p3.DIRECT_LOGIN;
    delete p3.ENC;
    return new URLSearchParams(p3).toString();
  }
  var CX_FAMILY_CABIN = { ECOSTD: "Y", PEYSTD: "N", BUSSTD: "J", FSTSTD: "F", FIRFAM: "F", FIRFST: "F" };
  function cxParseResponse(data, origin, destination, date) {
    let bom = data;
    if (data.pageBom) try {
      bom = JSON.parse(data.pageBom);
    } catch {
      return [];
    }
    const av = bom?.modelObject?.availabilities;
    const upsell = av?.upsell;
    const flights = upsell?.bounds?.[0]?.flights;
    if (!flights?.length) return [];
    const miles = {};
    try {
      const rp = JSON.parse(data.requestParams ?? "{}");
      if (rp.MILES_ECO) miles.Y = +rp.MILES_ECO;
      if (rp.MILES_PEY) miles.N = +rp.MILES_PEY;
      if (rp.MILES_BUS) miles.J = +rp.MILES_BUS;
      if (rp.MILES_FIR) miles.F = +rp.MILES_FIR;
    } catch {
    }
    const flightCabins = {};
    for (const assoc of Object.values(upsell.associations ?? {})) {
      const { flightId, fareFamily, lsa } = assoc.boundAssociations[0];
      if (!lsa) continue;
      const cabin = CX_FAMILY_CABIN[fareFamily] ?? (fareFamily.includes("FIR") ? "F" : null);
      if (!cabin) continue;
      if (!flightCabins[flightId]) flightCabins[flightId] = { F: null, J: null, N: null, Y: null };
      flightCabins[flightId][cabin] = lsa;
    }
    const results = [];
    for (const flight of flights) {
      const cabins = flightCabins[flight.id];
      if (!cabins || !Object.values(cabins).some((v3) => v3 !== null)) continue;
      const segs = flight.segments.map((seg) => ({
        airline: seg.flightIdentifier.marketingAirline,
        flight: seg.flightIdentifier.marketingAirline + seg.flightIdentifier.flightNumber,
        origin: seg.originLocation.replace(/^[^_]*_/, ""),
        destination: seg.destinationLocation.replace(/^[^_]*_/, ""),
        dep: new Date(seg.flightIdentifier.originDate).toISOString(),
        arr: new Date(seg.destinationDate).toISOString()
      }));
      results.push({ date, origin, destination, segs, cabins, miles, duration: Math.round(flight.duration / 6e4), bookUrl: CX_AWARD_PAGE });
    }
    return results;
  }
  async function cxDoSearch(origin, destination, date) {
    await sleep(CX_DELAY_MS);
    const res = await fetch(cxCaptured.formSubmitUrl, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/x-www-form-urlencoded", "accept": "application/json, text/plain, */*" },
      body: cxBuildParams(origin, destination, date)
    });
    if (res.status === 404 || res.status >= 300) {
      const ok = await cxRefreshTabId();
      if (!ok) return [];
      const res2 = await fetch(cxCaptured.formSubmitUrl, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/x-www-form-urlencoded", "accept": "application/json, text/plain, */*" },
        body: cxBuildParams(origin, destination, date)
      });
      if (!res2.ok) return [];
      const data2 = await res2.json();
      return cxParseResponse(data2, origin, destination, date);
    }
    if (!res.ok) return [];
    const data = await res.json();
    return cxParseResponse(data, origin, destination, date);
  }
  var cxProgram = {
    id: "cx",
    name: "Cathay Pacific",
    color: "#006564",
    cabins: ["F", "J", "N", "Y"],
    airports: COMMON_AIRPORTS,
    requiresSession: true,
    matches: ["www.cathaypacific.com", "book.cathaypacific.com"],
    // Returns a URL the user can navigate to in order to establish a session on book.cathaypacific.com
    getSessionUrl() {
      return cxSessionUrl();
    },
    onSessionReady(cb) {
      cxSessionCallback = cb;
      if (cxTryCapture()) return;
      let attempts = 0;
      const poll = setInterval(() => {
        if (cxTryCapture()) {
          clearInterval(poll);
          return;
        }
        if (++attempts > 60) clearInterval(poll);
      }, 500);
    },
    isSessionReady() {
      return !!(cxCaptured.requestParams && cxCaptured.tabId);
    },
    async onSearch({ origin, destination, date }) {
      try {
        return await cxDoSearch(origin, destination, date);
      } catch {
        return [];
      }
    }
  };

  // src/programs/br.js
  var BR_SEARCH_URL = "https://booking.evaair.com/flyeva/EVA/B2C/plan-your-journey/award-upgrade-availability/award-upgrade-availability.aspx";
  var BR_DELAY_MS = 15e3;
  var BR_CABIN_PARAM = { Y: "EY", N: "PE", J: "SD" };
  var BR_MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var BR_ZONE_OF = {
    TPE: "TW",
    TSA: "TW",
    KHH: "TW",
    HKG: "HK",
    MFM: "HK",
    BNE: "OC",
    LAX: "AM",
    SFO: "AM",
    SEA: "AM",
    YVR: "AM",
    ORD: "AM+",
    JFK: "AM+",
    IAH: "AM+",
    DFW: "AM+",
    IAD: "AM+",
    YYZ: "AM+",
    AMS: "EU",
    LHR: "EU",
    MXP: "EU",
    MUC: "EU",
    CDG: "EU",
    VIE: "EU"
  };
  var BR_CHART = {
    TWHK: { Y: 1e4, J: 25e3 },
    ASIA: { Y: 17500, N: 2e4, J: 25e3 },
    OC: { Y: 5e4, J: 75e3 },
    AM: { Y: 5e4, N: 55e3, J: 75e3 },
    "AM+": { Y: 55e3, N: 6e4, J: 8e4 },
    EU: { Y: 5e4, N: 55e3, J: 75e3 }
  };
  function brAwardMiles(origin, destination, cabin) {
    const zo = BR_ZONE_OF[origin] || "ASIA", zd = BR_ZONE_OF[destination] || "ASIA";
    const isAsia = (z3) => z3 === "TW" || z3 === "HK" || z3 === "ASIA";
    let zone;
    if (isAsia(zo) && isAsia(zd)) zone = [zo, zd].sort().join("") === "HKTW" ? "TWHK" : "ASIA";
    else if (isAsia(zo) !== isAsia(zd)) zone = isAsia(zo) ? zd : zo;
    return BR_CHART[zone]?.[cabin] ?? 0;
  }
  var brCaptured = { zipState: null };
  var brSessionCallback = null;
  var brChallenged = false;
  var brLastPostAt = Date.now();
  var brHasManualSearch = () => !!document.querySelector('[aria-label][id*="_td_Day_"]');
  var BR_CHALLENGE_MESSAGE = "\u26A0 EVA bot check \u2014 run one search on the EVA page by hand, then search again";
  var brIsBlockedPage = (html) => html.includes("sec_chlge_form") || /<title>\s*(Challenge Validation|Access Denied)\s*<\/title>/i.test(html);
  function brExtractZipState(html) {
    const m3 = html.match(/id="__ZIPSTATE"[^>]*value="([^"]+)"/);
    return m3 ? m3[1] : null;
  }
  function brTryCapture() {
    const el = document.getElementById("__ZIPSTATE");
    if (!el?.value) return false;
    brCaptured.zipState = el.value;
    if (brSessionCallback) brSessionCallback();
    return true;
  }
  async function brFetchSession() {
    try {
      const res = await fetch(BR_SEARCH_URL, { credentials: "include" });
      if (!res.ok) return false;
      const html = await res.text();
      const zs = brExtractZipState(html);
      if (!zs) return false;
      brCaptured.zipState = zs;
      if (brSessionCallback) brSessionCallback();
      return true;
    } catch {
      return false;
    }
  }
  function brParseAriaDate(label) {
    const dm = label.match(/^([A-Za-z]{3})[a-z]*\.?\s+(\d+),\s+(\d{4})/);
    const mon = dm ? BR_MONTH_ABBR.indexOf(dm[1]) : -1;
    if (mon === -1) return null;
    return `${dm[3]}-${String(mon + 1).padStart(2, "0")}-${String(+dm[2]).padStart(2, "0")}`;
  }
  function brBuildBody(origin, destination, date, cabinParam, zipState) {
    const fmtDate = date;
    return new URLSearchParams({
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __ZIPSTATE: zipState,
      __VIEWSTATE: "",
      __VIEWSTATEENCRYPTED: "",
      "ctl00$__MasterEVENTTARGET": "ctl00$content$btn_ok",
      "ctl00$__MasterEVENTARGUMENT": "",
      languageLocation: "North America",
      languageSelector: "4",
      "ctl00$content$hid_Dep": origin,
      "ctl00$content$hid_Arr": destination,
      "ctl00$content$hid_From": "",
      "ctl00$content$hid_To": "",
      "ctl00$content$hid_Segment": "",
      "ctl00$content$hid_SearchType": "",
      "ctl00$content$hid_InitGoDate": "",
      "ctl00$content$hid_InitBackDate": "",
      "ctl00$content$rbn_SearchType": "award",
      "ctl00$content$rbn_Segment": "ONE_WAY",
      "ctl00$content$txt_formcity": origin,
      "ctl00$content$txt_tocity": destination,
      "ctl00$content$txt_tbGoYYYYMM": fmtDate,
      "ctl00$content$txt_tbBackYYYYMM": fmtDate,
      "ctl00$content$txt_tbGo2YYYYMM": fmtDate,
      "ctl00$content$ddl_Award_Cabin": cabinParam,
      "ctl00$content$ddl_Upgrade_Cabin": "PE",
      "ctl00$content$ddl_PassengerCount": "1"
    }).toString();
  }
  function brParseWeekDates(doc) {
    const map = {};
    for (const el of doc.querySelectorAll('[aria-label][id*="_td_Day_"]')) {
      const m3 = el.id.match(/_td_Day_(\d+)$/);
      if (!m3) continue;
      const date = brParseAriaDate(el.getAttribute("aria-label") || "");
      if (date) map[date] = +m3[1];
    }
    return map;
  }
  function brParseResponse(html, origin, destination, date, cabin) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const dayIdx = brParseWeekDates(doc)[date];
    if (dayIdx == null) return [];
    const rows = doc.querySelectorAll("#content_control_Award_AvailabilityGO_div_Result tr.table-dataRow");
    const results = [];
    for (const row of rows) {
      const td = row.querySelector(`[id$="_td_Day_${dayIdx}"]`);
      if (!td) continue;
      const img = td.querySelector("img");
      if (!img || img.alt.trim() !== "Available") continue;
      const th = row.querySelector("th");
      if (!th) continue;
      const flightNums = [...th.querySelectorAll(".table-flightNumber")].map((el) => el.textContent.trim());
      const lis = [...th.querySelectorAll("li")];
      const segs = [];
      for (let i3 = 0; i3 < lis.length; i3++) {
        const text = lis[i3].textContent.replace(/\s+/g, " ").trim();
        const m3 = text.match(/^((?:BR|[A-Z]{2})\d+)\s+([A-Z]{3})\s+(\d{2}:\d{2})\s+([A-Z]{3})\s+(\d{2}:\d{2})/);
        if (!m3) continue;
        const [, flight, org, dep, dst, arr] = m3;
        segs.push({
          airline: flight.slice(0, 2),
          flight,
          origin: org,
          destination: dst,
          dep: `${date}T${dep}:00`,
          arr: `${date}T${arr}:00`
        });
      }
      if (!segs.length) {
        segs.push({ airline: "BR", flight: flightNums[0] || "BR???", origin, destination, dep: `${date}T00:00:00`, arr: `${date}T00:00:00` });
      }
      const cabins = { F: null, J: null, N: null, Y: null };
      cabins[cabin] = 1;
      const miles = { [cabin]: brAwardMiles(origin, destination, cabin) };
      results.push({ date, origin, destination, segs, cabins, miles, duration: null, bookUrl: BR_SEARCH_URL });
    }
    return results;
  }
  var brQueue = Promise.resolve();
  function brPost(origin, destination, date, cabin) {
    const run = brQueue.then(() => brPostNow(origin, destination, date, cabin));
    brQueue = run.catch(() => {
    });
    return run;
  }
  var BR_WEEK_TTL_MS = 30 * 60 * 1e3;
  var brWeekCache = /* @__PURE__ */ new Map();
  function brWeekKey(origin, destination, date, cabin) {
    const d3 = /* @__PURE__ */ new Date(`${date}T00:00:00Z`);
    d3.setUTCDate(d3.getUTCDate() - d3.getUTCDay());
    return `${origin}|${destination}|${cabin}|${d3.toISOString().slice(0, 10)}`;
  }
  function brPostWeek(origin, destination, date, cabin) {
    const key = brWeekKey(origin, destination, date, cabin);
    const hit = brWeekCache.get(key);
    if (hit && Date.now() - hit.at < BR_WEEK_TTL_MS) return hit.html;
    const html = brPost(origin, destination, date, cabin);
    brWeekCache.set(key, { at: Date.now(), html });
    html.then(
      (h3) => {
        if (typeof h3 !== "string" || h3 === "SESSION_EXPIRED") brWeekCache.delete(key);
      },
      () => brWeekCache.delete(key)
    );
    return html;
  }
  async function brPostNow(origin, destination, date, cabin) {
    if (brChallenged) return "SESSION_EXPIRED";
    await sleep(brLastPostAt + BR_DELAY_MS - Date.now());
    brLastPostAt = Date.now();
    const post = () => fetch(BR_SEARCH_URL, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: brBuildBody(origin, destination, date, BR_CABIN_PARAM[cabin], brCaptured.zipState)
    });
    const blocked = () => {
      brChallenged = true;
      brSessionCallback?.();
      return "SESSION_EXPIRED";
    };
    let res = await post();
    if (res.status === 403) return blocked();
    if (!res.ok || res.url.includes("login")) {
      if (!await brFetchSession()) return "SESSION_EXPIRED";
      await sleep(BR_DELAY_MS);
      brLastPostAt = Date.now();
      res = await post();
      if (!res.ok) return null;
    }
    const html = await res.text();
    if (brIsBlockedPage(html)) return blocked();
    const newZs = brExtractZipState(html);
    if (newZs) brCaptured.zipState = newZs;
    return html;
  }
  var BR_AIRPORTS = [
    { code: "TPE", name: "Taipei (Taoyuan)" },
    { code: "KHH", name: "Kaohsiung" },
    { code: "TSA", name: "Taipei (Songshan)" },
    { code: "HKG", name: "Hong Kong" },
    { code: "MFM", name: "Macau" },
    { code: "PEK", name: "Beijing" },
    { code: "CTU", name: "Chengdu" },
    { code: "CAN", name: "Guangzhou" },
    { code: "HGH", name: "Hangzhou" },
    { code: "SHA", name: "Shanghai (Hongqiao)" },
    { code: "PVG", name: "Shanghai (Pudong)" },
    { code: "SZX", name: "Shenzhen" },
    { code: "XMN", name: "Xiamen" },
    { code: "AOJ", name: "Aomori" },
    { code: "AKJ", name: "Asahikawa" },
    { code: "PUS", name: "Busan" },
    { code: "FUK", name: "Fukuoka" },
    { code: "KMQ", name: "Komatsu" },
    { code: "MYJ", name: "Matsuyama" },
    { code: "OKA", name: "Okinawa" },
    { code: "KIX", name: "Osaka (Kansai)" },
    { code: "UKB", name: "Osaka (Kobe)" },
    { code: "CTS", name: "Sapporo" },
    { code: "SDJ", name: "Sendai" },
    { code: "GMP", name: "Seoul (Gimpo)" },
    { code: "ICN", name: "Seoul (Incheon)" },
    { code: "HND", name: "Tokyo (Haneda)" },
    { code: "NRT", name: "Tokyo (Narita)" },
    { code: "HKD", name: "Hakodate" },
    { code: "CRK", name: "Angeles (Clark)" },
    { code: "BKK", name: "Bangkok" },
    { code: "CEB", name: "Cebu" },
    { code: "CNX", name: "Chiang Mai" },
    { code: "DAD", name: "Da Nang" },
    { code: "DPS", name: "Denpasar Bali" },
    { code: "HAN", name: "Hanoi" },
    { code: "SGN", name: "Ho Chi Minh City" },
    { code: "CGK", name: "Jakarta" },
    { code: "KUL", name: "Kuala Lumpur" },
    { code: "MNL", name: "Manila" },
    { code: "KTI", name: "Phnom Penh" },
    { code: "SIN", name: "Singapore" },
    { code: "DEL", name: "Delhi" },
    { code: "ORD", name: "Chicago (O'Hare)" },
    { code: "DFW", name: "Dallas" },
    { code: "IAH", name: "Houston" },
    { code: "LAX", name: "Los Angeles" },
    { code: "JFK", name: "New York (JFK)" },
    { code: "SFO", name: "San Francisco" },
    { code: "SEA", name: "Seattle" },
    { code: "YYZ", name: "Toronto" },
    { code: "YVR", name: "Vancouver" },
    { code: "IAD", name: "Washington D.C." },
    { code: "AMS", name: "Amsterdam" },
    { code: "LHR", name: "London (Heathrow)" },
    { code: "MXP", name: "Milan (Malpensa)" },
    { code: "MUC", name: "Munich" },
    { code: "CDG", name: "Paris (CDG)" },
    { code: "VIE", name: "Vienna" },
    { code: "BNE", name: "Brisbane" }
  ];
  var brProgram = {
    id: "br",
    name: "EVA Air",
    color: "#006537",
    cabins: ["J", "N", "Y"],
    requiresSession: true,
    loginUrl: "https://booking.evaair.com/flyeva/eva/b2c/plan-your-journey/award-upgrade-availability/login.aspx?lang=en-us",
    airports: BR_AIRPORTS,
    matches: [],
    matchHost: (h3) => h3 === "evaair.com" || h3.endsWith(".evaair.com"),
    expiredMessage: BR_CHALLENGE_MESSAGE,
    sessionHint: "Search one route on this EVA page by hand first",
    searchTip: "EVA blocks requests quickly: use Calendar first to find days with seats, then search those days",
    onSessionReady(cb) {
      brSessionCallback = cb;
      if (brTryCapture()) return;
      let attempts = 0;
      let fetchPending = false;
      const poll = setInterval(async () => {
        if (brTryCapture()) {
          clearInterval(poll);
          return;
        }
        if (++attempts % 6 === 0 && !fetchPending) {
          fetchPending = true;
          await brFetchSession();
          fetchPending = false;
          if (brCaptured.zipState) {
            clearInterval(poll);
            return;
          }
        }
        if (attempts > 120) clearInterval(poll);
      }, 500);
    },
    // A bot check sticks until the page is reloaded (which re-runs Akamai's sensor)
    isSessionReady() {
      return !brChallenged && !!brCaptured.zipState && location.hostname === "booking.evaair.com" && brHasManualSearch();
    },
    calendarRequestsPerRoute(fromMonth, toMonth, cabinFilter) {
      const cabins = (cabinFilter.length ? cabinFilter : ["J", "N", "Y"]).filter((c3) => c3 !== "F");
      const start = /* @__PURE__ */ new Date(`${fromMonth}-01`);
      const end = /* @__PURE__ */ new Date(`${toMonth}-28`);
      end.setMonth(end.getMonth() + 1);
      let weeks = 0;
      for (let d3 = new Date(start); d3 <= end; d3.setDate(d3.getDate() + 7)) weeks++;
      return cabins.length * weeks;
    },
    async onCalendarSearch(origin, destination, cabins, fromMonth, toMonth, onProgress) {
      const cabinsToSearch = (cabins.length ? cabins : ["J", "N", "Y"]).filter((c3) => c3 !== "F");
      const startDate = /* @__PURE__ */ new Date(`${fromMonth}-01`);
      const endDate = /* @__PURE__ */ new Date(`${toMonth}-28`);
      endDate.setMonth(endDate.getMonth() + 1);
      const weekStarts = [];
      for (let d3 = new Date(startDate); d3 <= endDate; d3.setDate(d3.getDate() + 7))
        weekStarts.push(d3.toISOString().slice(0, 10));
      const total = cabinsToSearch.length * weekStarts.length;
      let done = 0;
      const byDate = {};
      for (const cabin of cabinsToSearch) {
        for (const weekStart of weekStarts) {
          if (weekStart < fromMonth || weekStart > toMonth + "-38") {
            done++;
            continue;
          }
          onProgress?.(null, { done, total, label: `${cabin} \u2013 week of ${weekStart}` });
          try {
            const html = await brPostWeek(origin, destination, weekStart, cabin);
            if (html === "SESSION_EXPIRED") return html;
            if (!html) {
              done++;
              continue;
            }
            const doc = new DOMParser().parseFromString(html, "text/html");
            const weekDates = brParseWeekDates(doc);
            const rows = doc.querySelectorAll("#content_control_Award_AvailabilityGO_div_Result tr.table-dataRow");
            const partial = {};
            const miles = brAwardMiles(origin, destination, cabin);
            for (const [date, colIdx] of Object.entries(weekDates)) {
              if (date < fromMonth || date > toMonth + "-31") continue;
              for (const row of rows) {
                const td = row.querySelector(`[id$="_td_Day_${colIdx}"]`);
                if (!td) continue;
                const img = td.querySelector("img");
                if (!img || img.alt.trim() !== "Available") continue;
                if (!byDate[date]) byDate[date] = {};
                byDate[date][cabin] = miles;
                if (!partial[date]) partial[date] = {};
                partial[date][cabin] = miles;
                break;
              }
            }
            done++;
            onProgress?.(Object.keys(partial).length ? partial : null, { done, total });
          } catch {
            done++;
          }
        }
      }
      return byDate;
    },
    async onSearch({ origin, destination, date, cabinFilter }) {
      const cabins = cabinFilter.length ? cabinFilter.filter((c3) => c3 !== "F") : ["J", "N", "Y"];
      const byFlight = {};
      for (const cabin of cabins) {
        try {
          const html = await brPostWeek(origin, destination, date, cabin);
          if (html === "SESSION_EXPIRED") return html;
          if (!html) continue;
          const rows = brParseResponse(html, origin, destination, date, cabin);
          for (const row of rows) {
            const key = row.segs.map((s3) => s3.flight).join("+");
            if (!byFlight[key]) byFlight[key] = row;
            else {
              byFlight[key].cabins[cabin] = 1;
              byFlight[key].miles[cabin] = row.miles[cabin];
            }
          }
        } catch {
        }
      }
      return Object.values(byFlight);
    }
  };

  // src/programs/jx.js
  var JX_SEARCH_URL = "https://ecapi.starlux-airlines.com/searchFlight/v2/redemption/flights/search";
  var JX_CAL_URL = "https://ecapi.starlux-airlines.com/searchFlight/v2/redemption/calendars";
  var JX_DELAY_MS = 600;
  var JX_CABIN_TO = { Y: "eco", N: "ecoPremium", J: "business", F: "first" };
  var JX_CABIN_FROM = { eco: "Y", ecoPremium: "N", business: "J", first: "F" };
  var jxCaptured = { token: null };
  var jxSessionCallback = null;
  function jxApplyToken(raw) {
    if (jxCaptured.token) return;
    jxCaptured.token = raw.startsWith("Bearer ") ? raw.slice(7) : raw;
    if (jxSessionCallback) jxSessionCallback();
  }
  (function patchJx() {
    if (location.hostname !== "www.starlux-airlines.com") return;
    const origFetch = window.fetch;
    window.fetch = function(input, init) {
      if (!jxCaptured.token && init?.headers) {
        const hdrs = init.headers instanceof Headers ? init.headers : new Headers(init.headers);
        const raw = hdrs.get("jx-cosmile-token");
        if (raw) jxApplyToken(raw);
      }
      return origFetch.call(window, input, init);
    };
    const OrigXHR = window.XMLHttpRequest;
    function PatchedXHR() {
      const xhr = new OrigXHR();
      const origSetHeader = xhr.setRequestHeader.bind(xhr);
      xhr.setRequestHeader = function(name, value) {
        if (!jxCaptured.token && name.toLowerCase() === "jx-cosmile-token") jxApplyToken(value);
        return origSetHeader(name, value);
      };
      return xhr;
    }
    PatchedXHR.prototype = OrigXHR.prototype;
    window.XMLHttpRequest = PatchedXHR;
  })();
  function jxParseFlights(json, origin, destination, date) {
    if (!json?.success) return [];
    const flights = json?.data?.flights;
    if (!Array.isArray(flights)) return [];
    const results = [];
    for (const flight of flights) {
      const segs = [];
      for (const seg of flight.flightDetails ?? []) {
        segs.push({
          airline: seg.marketingAirlineCode,
          flight: seg.marketingAirlineCode + seg.marketingFlightNumber,
          origin: seg.departure?.airport,
          destination: seg.arrival?.airport,
          dep: seg.departure?.dateTime,
          arr: seg.arrival?.dateTime
        });
      }
      if (!segs.length) continue;
      const flightDate = (segs[0].dep ?? date).slice(0, 10);
      const firstDep = new Date(segs[0].dep);
      const lastArr = new Date(segs[segs.length - 1].arr);
      const duration = isNaN(firstDep) ? null : Math.round((lastArr - firstDep) / 6e4);
      const cabins = { F: null, J: null, N: null, Y: null };
      const miles = {};
      for (const offer of flight.airOffers ?? []) {
        if (offer.isSoldOut) continue;
        const c3 = JX_CABIN_FROM[offer.cabin];
        if (!c3) continue;
        cabins[c3] = -1;
        const m3 = offer.milesConversion?.convertedMiles;
        if (typeof m3 === "number" && (!miles[c3] || m3 < miles[c3])) miles[c3] = m3;
      }
      if (!Object.values(cabins).some((v3) => v3 !== null)) continue;
      results.push({
        date: flightDate,
        origin: segs[0].origin,
        destination: segs[segs.length - 1].destination,
        segs,
        cabins,
        miles,
        duration,
        bookUrl: "https://www.starlux-airlines.com/en-US/redeem-award-ticket/index"
      });
    }
    return results;
  }
  var jxProgram = {
    id: "jx",
    name: "Starlux Airlines",
    color: "#1B3D6F",
    cabins: ["F", "J", "N", "Y"],
    requiresSession: true,
    // ponytail: point at redeem page so clicking "Get session" triggers the token-bearing API calls
    loginUrl: "https://www.starlux-airlines.com/en-US/redeem-award-ticket/index",
    matches: [],
    matchHost: (h3) => h3 === "www.starlux-airlines.com",
    onSessionReady(cb) {
      jxSessionCallback = cb;
      if (jxCaptured.token) cb();
    },
    isSessionReady() {
      return !!jxCaptured.token;
    },
    async onSearch({ origin, destination, date, cabinFilter }) {
      const cabinsToSearch = cabinFilter.length ? cabinFilter : ["F", "J", "N", "Y"];
      const byFlight = {};
      for (const cabin of cabinsToSearch) {
        await sleep(JX_DELAY_MS);
        try {
          const res = await fetch(JX_SEARCH_URL, {
            method: "POST",
            credentials: "omit",
            headers: {
              "accept": "application/json, text/plain, */*",
              "content-type": "application/json",
              "jx-cosmile-token": `Bearer ${jxCaptured.token}`,
              "jx-lang": "en-Global"
            },
            body: JSON.stringify({
              cabin: JX_CABIN_TO[cabin],
              companyCode: "JX",
              itineraries: [{ departure: origin, arrival: destination, departureDate: date }],
              travelers: { adt: 1, chd: 0, inf: 0 }
            })
          });
          if (res.status === 401 || res.status === 403) {
            jxCaptured.token = null;
            return "SESSION_EXPIRED";
          }
          if (!res.ok) continue;
          const json = await res.json();
          const rows = jxParseFlights(json, origin, destination, date);
          for (const row of rows) {
            const key = row.segs.map((s3) => s3.flight).join("+");
            if (!byFlight[key]) byFlight[key] = row;
            else {
              for (const c3 of Object.keys(row.cabins)) {
                if (row.cabins[c3] !== null) {
                  byFlight[key].cabins[c3] = row.cabins[c3];
                  if (row.miles[c3]) byFlight[key].miles[c3] = row.miles[c3];
                }
              }
            }
          }
        } catch {
        }
      }
      return Object.values(byFlight);
    },
    // Calendar mode: use /redemption/calendars API — one call per cabin per 14-day anchor
    // Returns availability only (no miles); much faster than per-date search
    async onCalendarSearch(origin, destination, cabins, fromMonth, toMonth, onProgress) {
      const cabinsToSearch = cabins.length ? cabins : ["F", "J", "N", "Y"];
      const [fy, fm] = fromMonth.split("-").map(Number);
      const [ty, tm] = toMonth.split("-").map(Number);
      const endDate = new Date(ty, tm, 0);
      const anchors = [];
      for (let d3 = new Date(fy, fm - 1, 1); d3 <= endDate; d3.setDate(d3.getDate() + 14))
        anchors.push(d3.toISOString().slice(0, 10));
      const total = cabinsToSearch.length * anchors.length;
      let done = 0;
      const byDate = {};
      for (const cabin of cabinsToSearch) {
        for (const anchor of anchors) {
          onProgress?.(null, { done, total, label: `Searching ${CABIN_LABELS[cabin]} class` });
          await sleep(JX_DELAY_MS);
          try {
            const res = await fetch(JX_CAL_URL, {
              method: "POST",
              credentials: "omit",
              headers: {
                "accept": "application/json, text/plain, */*",
                "content-type": "application/json",
                "jx-cosmile-token": `Bearer ${jxCaptured.token}`,
                "jx-lang": "en-Global"
              },
              body: JSON.stringify({
                cabin: JX_CABIN_TO[cabin],
                companyCode: "JX",
                itineraries: [{ departure: origin, arrival: destination, departureDate: anchor }],
                travelers: { adt: 1, chd: 0, inf: 0 }
              })
            });
            if (res.status === 401 || res.status === 403) {
              jxCaptured.token = null;
              return "SESSION_EXPIRED";
            }
            if (!res.ok) {
              done++;
              continue;
            }
            const json = await res.json();
            const partial = {};
            for (const cal of json?.data?.calendars ?? []) {
              if (cal.status !== "available") continue;
              const date = cal.departureDate;
              if (date < fromMonth || date > toMonth + "-31") continue;
              if (!byDate[date]) byDate[date] = {};
              byDate[date][cabin] = 0;
              if (!partial[date]) partial[date] = {};
              partial[date][cabin] = 0;
            }
            done++;
            onProgress?.(Object.keys(partial).length ? partial : null, { done, total, label: `${CABIN_LABELS[cabin]} class` });
          } catch {
            done++;
          }
        }
      }
      return byDate;
    }
  };

  // src/programs/fb.js
  var FB_GQL_PATH = "/gql/v1";
  var FB_OP = "SearchResultAvailableOffersQuery";
  var FB_PERSISTED_HASH = "2fefa196c99a8c9847e453d4611888d114e5e7780bfc3f7670d47c598d935795";
  var FB_CAL_OP = "SharedSearchLowestFareOffersForSearchQuery";
  var FB_CAL_HASH = "da21c63708940f578da4e9fb30c1fdf41ae6e7bf4fe8851257c351d66b5dff80";
  var FB_GAP_MS = 4e3;
  var FB_BACKOFF_MS = 3e4;
  var FB_CABIN_KEY = { ECONOMY: "Y", PREMIUM: "N", BUSINESS: "J" };
  var FB_CABIN_GQL = { Y: "ECONOMY", N: "PREMIUM", J: "BUSINESS" };
  var fbHeaders = null;
  var fbSessionCallback = null;
  var fbSessionValid = false;
  (function fbPatchFetch() {
    if (location.hostname !== "wwws.airfrance.us" && location.hostname !== "www.klm.com") return;
    const orig = window.fetch;
    window.fetch = function(input, init) {
      try {
        const url = typeof input === "string" ? input : input?.url;
        if (url?.includes(FB_GQL_PATH) && init?.body && init.headers) {
          fbHeaders = init.headers instanceof Headers ? Object.fromEntries(init.headers) : { ...init.headers };
          const isSearch = url.includes(FB_OP) || url.includes(FB_CAL_OP);
          let isReward = false;
          try {
            isReward = JSON.parse(init.body)?.variables?.bookingFlow === "REWARD";
          } catch {
          }
          if (isSearch && isReward) {
            const promise = orig.apply(this, arguments);
            promise.then((r3) => r3.clone().json()).then((data) => {
              const ao = data?.data?.availableOffers;
              const lo = data?.data?.lowestFareOffers;
              const valid = ao && ao.__typename !== "DataSourceError" || lo && lo.__typename !== "DataSourceError";
              if (valid) {
                fbSessionValid = true;
                fbSessionCallback?.();
              }
            }).catch(() => {
            });
            return promise;
          }
          if (fbUuid()) fbSessionCallback?.();
        }
      } catch {
      }
      return orig.apply(this, arguments);
    };
  })();
  function fbUuid() {
    try {
      return JSON.parse(sessionStorage.getItem("bwsfe-state-searchStateUuid")) || null;
    } catch {
      return null;
    }
  }
  async function fbSha256Hex(str) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
    return [...new Uint8Array(buf)].map((b2) => b2.toString(16).padStart(2, "0")).join("");
  }
  function fbSortVars(t3) {
    if (Array.isArray(t3)) return t3.map(fbSortVars);
    if (t3 !== null && typeof t3 === "object") {
      const out = {};
      for (const k5 of Object.keys(t3).sort((a3, b2) => a3.localeCompare(b2))) out[k5] = fbSortVars(t3[k5]);
      return out;
    }
    return t3;
  }
  async function fbHashcash(variables, timestamp) {
    const challengeHash = await fbSha256Hex(JSON.stringify(Object.assign({}, fbSortVars(variables), { timestamp })));
    for (let nonce = 0; ; nonce++) {
      const candidate = challengeHash + "-" + nonce;
      if ((await fbSha256Hex(candidate)).startsWith("000")) return { version: 2, timestamp, hash: candidate };
    }
  }
  function fbParseResponse(data, origin, destination, date) {
    const results = [];
    for (const itin of data?.data?.availableOffers?.offerItineraries || []) {
      const conn = itin.activeConnection;
      if (!conn) continue;
      const segs = conn.segments.map((seg) => {
        const mf = seg.marketingFlight;
        return {
          airline: mf?.carrier?.code || "",
          flight: (mf?.carrier?.code || "") + (mf?.number || "").replace(/^0+/, ""),
          origin: seg.origin?.code || "",
          destination: seg.destination?.code || "",
          dep: seg.departureDateTime,
          arr: seg.arrivalDateTime
        };
      });
      const cabins = { F: null, J: null, N: null, Y: null };
      const miles = {};
      for (const up of itin.upsellCabinProducts || []) {
        for (const c3 of up.connections || []) {
          const key = FB_CABIN_KEY[c3.cabinClass];
          if (!key || !(c3.numberOfSeatsAvailable > 0)) continue;
          cabins[key] = c3.numberOfSeatsAvailable;
          if (c3.price?.amount) miles[key] = c3.price.amount;
        }
      }
      if (!Object.values(cabins).some((v3) => v3 !== null)) continue;
      results.push({
        date,
        origin: segs[0]?.origin || origin,
        destination: segs.at(-1)?.destination || destination,
        segs,
        cabins,
        miles,
        duration: conn.duration ?? null,
        bookUrl: `https://${location.hostname}/search/flights/0`
      });
    }
    return results;
  }
  var FB_CUSTOMER = { selectedTravelCompanions: [{ passengerId: 1, travelerKey: 0, travelerSource: "PROFILE" }] };
  async function fbFetchOnce(op, hash, variables) {
    const hashcash = await fbHashcash(variables, (/* @__PURE__ */ new Date()).toISOString());
    return window.fetch(`${FB_GQL_PATH}?bookingFlow=REWARD&operationName=${op}`, {
      method: "POST",
      credentials: "include",
      headers: fbHeaders,
      body: JSON.stringify({
        operationName: op,
        variables,
        extensions: { hashcash, persistedQuery: { version: 1, sha256Hash: hash } }
      })
    }).catch(() => ({ status: 503 }));
  }
  var fbQueue = Promise.resolve();
  var fbLastAt = 0;
  function fbEnqueue(fn) {
    const run = fbQueue.then(async () => {
      await sleep(Math.max(0, fbLastAt + FB_GAP_MS - Date.now()));
      try {
        return await fn();
      } finally {
        fbLastAt = Date.now();
      }
    });
    fbQueue = run.catch(() => {
    });
    return run;
  }
  async function fbGql(op, hash, buildVariables) {
    if (!fbHeaders || !fbUuid()) return "SESSION_EXPIRED";
    const send = () => fbEnqueue(() => fbFetchOnce(op, hash, buildVariables()));
    let res = await send();
    if (res.status === 503) {
      await sleep(FB_BACKOFF_MS);
      res = await send();
    }
    if (res.status === 403 || res.status === 503) return "SESSION_EXPIRED";
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    if (data?.data?.availableOffers?.__typename === "DataSourceError" || data?.data?.lowestFareOffers?.__typename === "DataSourceError") {
      fbSessionValid = false;
      fbSessionCallback?.();
      return "SESSION_EXPIRED";
    }
    fbSessionValid = true;
    return data;
  }
  async function fbSearchDate(origin, destination, date) {
    const data = await fbGql(FB_OP, FB_PERSISTED_HASH, () => ({
      activeConnectionIndex: 0,
      bookingFlow: "REWARD",
      availableOfferRequestBody: {
        commercialCabins: ["ECONOMY"],
        passengers: [{ id: 1, type: "ADT" }],
        requestedConnections: [{
          origin: { code: origin, type: "AIRPORT" },
          destination: { code: destination, type: "AIRPORT" },
          departureDate: date
        }],
        bookingFlow: "REWARD",
        customer: FB_CUSTOMER,
        withUpsellCabins: true
      },
      searchStateUuid: fbUuid()
    }));
    if (data === "SESSION_EXPIRED") return data;
    return fbParseResponse(data, origin, destination, date);
  }
  function fbMonths(fromMonth, toMonth) {
    const months = [];
    for (let m3 = fromMonth; m3 <= toMonth; m3 = addDays(m3 + "-28", 7).slice(0, 7)) months.push(m3);
    return months;
  }
  function fbCalCabins(cabinFilter) {
    return cabinFilter.length ? cabinFilter.filter((c3) => c3 in FB_CABIN_GQL) : ["J", "N", "Y"];
  }
  async function fbSearchMonth(origin, destination, cabin, month) {
    const today = todayISO();
    const first = month + "-01" < today ? today : month + "-01";
    const last = addDays(addDays(month + "-28", 7).slice(0, 7) + "-01", -1);
    if (first > last) return {};
    const data = await fbGql(FB_CAL_OP, FB_CAL_HASH, () => ({
      lowestFareOffersRequest: {
        bookingFlow: "REWARD",
        withUpsellCabins: true,
        passengers: [{ id: 1, type: "ADT" }],
        commercialCabins: [FB_CABIN_GQL[cabin]],
        customer: FB_CUSTOMER,
        type: "DAY",
        requestedConnections: [{
          departureDate: first,
          dateInterval: `${first}/${last}`,
          origin: { type: "AIRPORT", code: origin },
          destination: { type: "AIRPORT", code: destination }
        }]
      },
      activeConnection: 0,
      searchStateUuid: fbUuid(),
      bookingFlow: "REWARD"
    }));
    if (data === "SESSION_EXPIRED") return data;
    const out = {};
    for (const o3 of data?.data?.lowestFareOffers?.lowestOffers || []) {
      if (o3.noFlight || !o3.displayPrice || o3.currency !== "MILES") continue;
      out[o3.flightDate] = o3.displayPrice;
    }
    return out;
  }
  var FB_SEARCH_PATH = "/search/advanced";
  var FB_GET_SESSION_KEY = "ab-fb-get-session";
  async function fbSubmitRewardSearch() {
    for (let i3 = 0; i3 < 30 && location.pathname === FB_SEARCH_PATH; i3++) {
      const toggle = document.querySelector(".bw-search-widget__reward-toggle button[role=switch]");
      const submit = document.querySelector(".bw-search-widget__search-button");
      if (toggle?.getAttribute("aria-checked") !== "true") toggle?.click();
      else submit?.click();
      await sleep(1e3);
    }
  }
  if ((location.hostname === "wwws.airfrance.us" || location.hostname === "www.klm.com") && location.pathname === FB_SEARCH_PATH && sessionStorage.getItem(FB_GET_SESSION_KEY)) {
    sessionStorage.removeItem(FB_GET_SESSION_KEY);
    fbSubmitRewardSearch();
  }
  var fbProgram = {
    id: "fb",
    name: "Flying Blue",
    color: "#002157",
    cabins: ["J", "N", "Y"],
    airports: COMMON_AIRPORTS,
    requiresSession: true,
    loginUrl: "https://wwws.airfrance.us/search/flights/0",
    matchHost: (h3) => h3 === "wwws.airfrance.us" || h3 === "www.klm.com",
    onSessionReady(cb) {
      fbSessionCallback = cb;
      if (fbHeaders && fbUuid()) cb();
    },
    isSessionReady() {
      return !!(fbHeaders && fbUuid() && fbSessionValid);
    },
    getSessionUrl() {
      return `https://${location.hostname}/search/flights/0`;
    },
    // Deep links to /search/flights/0 redirect to /search/advanced and run a cash search, so instead
    // flip the page's "Book with my Miles" toggle and submit the widget (logged-in only).
    // fbPatchFetch sniffs the resulting REWARD response and sets fbSessionValid.
    triggerSession() {
      if (location.pathname !== FB_SEARCH_PATH) {
        sessionStorage.setItem(FB_GET_SESSION_KEY, "1");
        location.href = FB_SEARCH_PATH;
        return;
      }
      fbSubmitRewardSearch();
    },
    onSearch({ origin, destination, date }) {
      return fbSearchDate(origin, destination, date);
    },
    calendarRequestsPerRoute(fromMonth, toMonth, cabinFilter) {
      return fbCalCabins(cabinFilter).length * fbMonths(fromMonth, toMonth).length;
    },
    async onCalendarSearch(origin, destination, cabinFilter, fromMonth, toMonth, onProgress) {
      const cabins = fbCalCabins(cabinFilter);
      const months = fbMonths(fromMonth, toMonth);
      const total = cabins.length * months.length;
      let done = 0;
      const byDate = {};
      for (const cabin of cabins) {
        for (const month of months) {
          onProgress?.(null, { done, total, label: `Searching ${cabin} \u2013 ${month}` });
          const days = await fbSearchMonth(origin, destination, cabin, month);
          if (days === "SESSION_EXPIRED") return days;
          const partial = {};
          for (const [date, miles] of Object.entries(days)) {
            byDate[date] = { ...byDate[date], [cabin]: miles };
            partial[date] = { [cabin]: miles };
          }
          onProgress?.(Object.keys(partial).length ? partial : null, { done: ++done, total });
        }
      }
      return byDate;
    }
  };

  // src/programs/jal.js
  var JAL_HOST = "book-i.jal.co.jp";
  var JAL_BASE = "https://book-i.jal.co.jp/JLInt/dyn/air/booking";
  var JAL_AWARD_URL = "https://www.jal.co.jp/jp/en/jmb/award-inter/booking/";
  var JAL_CABIN_HIST = { F: "F", J: "B", N: "N", Y: "E" };
  var JAL_CFF = { F: "9FE", J: "9JE", N: "9NE", Y: "9YE" };
  var JAL_FF_CABIN = { "9Z0Z0YPZ": "Y", "9Z0Z0WPZ": "N", "9Z0Z0JPZ": "J", "9Z0Z0FPZ": "F" };
  var JAL_BOOKING_CABIN = { F: "F", C: "J", W: "N", M: "Y", Y: "Y" };
  var JAL_OWN = "JL";
  var JAL_SEARCH_MODES = [
    { code: JAL_OWN, name: "JAL (own flights)" },
    { code: "AS", name: "Partner: Alaska / Hawaiian" },
    { code: "AA", name: "Partner: American Airlines" },
    { code: "BA", name: "Partner: British Airways" },
    { code: "CX", name: "Partner: Cathay Pacific" },
    { code: "FJ", name: "Partner: Fiji Airways" },
    { code: "AY", name: "Partner: Finnair" },
    { code: "IB", name: "Partner: Iberia" },
    { code: "MH", name: "Partner: Malaysia Airlines" },
    { code: "WY", name: "Partner: Oman Air" },
    { code: "QF", name: "Partner: Qantas" },
    { code: "QR", name: "Partner: Qatar Airways" },
    { code: "AT", name: "Partner: Royal Air Maroc" },
    { code: "RJ", name: "Partner: Royal Jordanian" },
    { code: "UL", name: "Partner: SriLankan Airlines" },
    { code: "AF", name: "Partner: Air France" },
    { code: "PG", name: "Partner: Bangkok Airways" },
    { code: "EK", name: "Partner: Emirates" },
    { code: "GA", name: "Partner: Garuda Indonesia" },
    { code: "KE", name: "Partner: Korean Air" },
    { code: "LA", name: "Partner: LATAM Airlines" }
  ];
  var JAL_PARTNER_CABIN = { F: "F", B: "J", N: "N", E: "Y" };
  var JAL_PARTNER_GAP_MS = 3e3;
  var jalCaptured = { sessionId: null };
  var jalSessionCallback = null;
  function jalTryCapture() {
    const m3 = location.pathname.match(/;JAL_SESSION_ID=([^/?;&]+)/);
    if (!m3) return false;
    if (jalCaptured.sessionId === m3[1]) return true;
    jalCaptured.sessionId = m3[1];
    if (jalSessionCallback) jalSessionCallback();
    return true;
  }
  function jalWatchTimeout() {
    if (location.hostname !== JAL_HOST) return;
    if (location.pathname.includes("/affinity")) return;
    new MutationObserver(() => {
      const dialog = document.querySelector("jal-tmos-popin-mobile");
      if (!dialog) return;
      const title = dialog.querySelector(".popin-title");
      if (!title?.textContent?.includes("Time out")) return;
      const sid = jalCaptured.sessionId;
      if (!sid) return;
      fetch(`${JAL_BASE}/timeoutSession;JAL_SESSION_ID=${sid}`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: "SITE=J019J019&COUNTRY_SITE=JAL_JR_JP&LANGUAGE=GB",
        credentials: "include"
      }).then(() => {
        document.querySelectorAll(".cdk-overlay-backdrop, .cdk-global-overlay-wrapper").forEach((el) => el.remove());
        document.body.classList.remove("cdk-global-scrollblock");
      }).catch(() => {
      });
    }).observe(document.body, { childList: true, subtree: true });
  }
  function jalParseAvailability(html, date) {
    try {
      const m3 = html.match(/<script[^>]*id="clientSideData"[^>]*>([\s\S]*?)<\/script>/);
      if (!m3) return [];
      const json = JSON.parse(m3[1]);
      const pageData = json?.PAGE?.DATA;
      if (pageData?.context?.flow?.mode === "REVENUE") return "SESSION_EXPIRED";
      const upsell = pageData?.jlowdFlexpricerAvailability?.upsell;
      const flights = upsell?.bounds?.[0]?.flights;
      if (!flights?.length) return [];
      const fareFamily = upsell?.bounds?.[0]?.fareFamilies?.[0] ?? "";
      const associations = upsell?.associations ?? {};
      const recommendations = upsell?.recommendations ?? {};
      const results = [];
      for (let fi = 0; fi < flights.length; fi++) {
        const flight = flights[fi];
        const rawSegs = flight.segments;
        if (!rawSegs?.length) continue;
        const segs = rawSegs.map((seg) => ({
          airline: seg.flightIdentifier.marketingAirline,
          flight: seg.flightIdentifier.marketingAirline + seg.flightIdentifier.flightNumber,
          origin: seg.originLocation.slice(-3),
          destination: seg.destinationLocation.slice(-3),
          dep: new Date(seg.flightIdentifier.originDate).toISOString(),
          arr: new Date(seg.destinationDate).toISOString()
        }));
        const flightId = flight.id;
        const assocKey = fareFamily ? `${fareFamily}_${flightId ?? fi}` : Object.keys(associations).find((k5) => k5.endsWith(`_${flightId ?? fi}`));
        const assoc = assocKey ? associations[assocKey] : void 0;
        if (!assoc) continue;
        const boundAssoc = assoc.boundAssociations?.[0];
        const lsa = boundAssoc?.lsa;
        const bookingClass = boundAssoc?.bookingClass ?? "";
        const lsaCabin = (fareFamily ? JAL_FF_CABIN[fareFamily] : void 0) ?? JAL_BOOKING_CABIN[bookingClass];
        const cabins = { F: null, J: null, N: null, Y: null };
        if (lsaCabin && lsa != null && lsa > 0) cabins[lsaCabin] = lsa;
        if (!Object.values(cabins).some((v3) => v3 !== null)) continue;
        const recoId = assoc.recoId;
        const reco = recoId != null ? recommendations[String(recoId)] : void 0;
        const miles = reco?.recommendationPrice?.price?.totalPrice?.milesAmount?.amount;
        const milesKey = assocKey ? JAL_FF_CABIN[assocKey.slice(0, assocKey.lastIndexOf("_"))] ?? "Y" : "Y";
        results.push({
          date,
          origin: segs[0].origin,
          destination: segs[segs.length - 1].destination,
          segs,
          cabins,
          miles: miles ? { [milesKey]: miles } : {},
          duration: Math.floor(flight.duration / 6e4),
          bookUrl: "https://www.jal.co.jp/jp/en/inter/award/"
        });
      }
      return results;
    } catch {
      return [];
    }
  }
  function jalSubmit(sid, params, { scripts = false } = {}) {
    return new Promise((resolve) => {
      const frameName = `_jal_av_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const iframe = Object.assign(document.createElement("iframe"), { name: frameName });
      iframe.style.cssText = "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none";
      iframe.sandbox = scripts ? "allow-same-origin allow-forms allow-scripts" : "allow-same-origin allow-forms";
      const form = document.createElement("form");
      form.method = "POST";
      form.action = `${JAL_BASE}/availability${sid ? `;JAL_SESSION_ID=${sid}` : ""}`;
      form.target = frameName;
      for (const [k5, v3] of Object.entries(params)) {
        const inp = document.createElement("input");
        inp.type = "hidden";
        inp.name = k5;
        inp.value = v3;
        form.appendChild(inp);
      }
      document.body.appendChild(iframe);
      document.body.appendChild(form);
      const cleanup = () => {
        iframe.remove();
        form.remove();
      };
      iframe.onload = () => {
        try {
          resolve({ html: iframe.contentDocument?.documentElement?.outerHTML ?? null, url: iframe.contentWindow.location.href });
        } catch {
          resolve({ html: null, url: null });
        } finally {
          cleanup();
        }
      };
      iframe.onerror = () => {
        resolve({ html: null, url: null });
        cleanup();
      };
      form.submit();
    });
  }
  var jalIsBlocked = (html) => /<title>\s*Access Denied/i.test(html ?? "");
  function jalParsePartnerAvailability(html, date) {
    try {
      const m3 = html.match(/<script[^>]*id="clientSideData"[^>]*>([\s\S]*?)<\/script>/);
      if (!m3) return "SESSION_EXPIRED";
      const pageData = JSON.parse(m3[1])?.PAGE?.DATA;
      if (pageData?.context?.flow?.mode !== "REDEMPTION") return "SESSION_EXPIRED";
      const flights = pageData?.jlScheduleDrivenAvailability?.upsell?.bounds?.[0]?.flights;
      if (!flights?.length) return [];
      const results = [];
      for (const flight of flights) {
        if (!flight.bookable || !flight.segments?.length) continue;
        const cabins = { F: null, J: null, N: null, Y: null };
        for (const [code, cabin] of Object.entries(JAL_PARTNER_CABIN)) {
          const seats = flight.segments.map((s3) => Number(s3.cabins?.[code]?.status) || 0);
          const min = Math.min(...seats);
          if (min > 0) cabins[cabin] = min;
        }
        if (!Object.values(cabins).some((v3) => v3 !== null)) continue;
        const segs = flight.segments.map((seg) => ({
          airline: seg.flightIdentifier.marketingAirline,
          flight: seg.flightIdentifier.marketingAirline + seg.flightIdentifier.flightNumber,
          origin: seg.originLocation.slice(-3),
          destination: seg.destinationLocation.slice(-3),
          dep: new Date(seg.flightIdentifier.originDate).toISOString(),
          arr: new Date(seg.destinationDate).toISOString()
        }));
        results.push({
          date,
          origin: segs[0].origin,
          destination: segs[segs.length - 1].destination,
          segs,
          cabins,
          miles: {},
          // partner awards are priced off JAL's distance chart, not returned here
          duration: Math.floor(flight.duration / 6e4),
          bookUrl: "https://www.jal.co.jp/jp/en/jmb/award/partner/"
        });
      }
      return results;
    } catch {
      return [];
    }
  }
  var jalPartnerQueue = Promise.resolve();
  var jalPartnerLastAt = 0;
  function jalPartnerEnqueue(fn) {
    const run = jalPartnerQueue.then(async () => {
      await sleep(Math.max(0, jalPartnerLastAt + JAL_PARTNER_GAP_MS - Date.now()));
      try {
        return await fn();
      } finally {
        jalPartnerLastAt = Date.now();
      }
    });
    jalPartnerQueue = run.catch(() => {
    });
    return run;
  }
  var JAL_PARTNER_BASE = {
    SITE: "J019J019",
    LANGUAGE: "GB",
    COUNTRY_SITE: "JAL_AR_US",
    FLOW_MODE: "REDEMPTION",
    PATTERN: "1B",
    DEVICE_TYPE: "DESKTOP",
    STREAM: "booking",
    NB_ADT: "1",
    NB_YADT: "",
    NB_CHD: "0",
    NB_INF: "0",
    IS_FLEXIBLE: "FALSE",
    WDS_USER_TRAVELLING: "TRUE",
    SEARCH_CASSETTE_ID: ""
  };
  var jalPartnerParams = (partner, origin, destination, date) => ({
    ...JAL_PARTNER_BASE,
    PARTNER_CODE: partner,
    CABIN: "E",
    DEPARTURE_LOCATION_1: origin,
    ARRIVAL_LOCATION_1: destination,
    DEPARTURE_DATE_1: `${date.replace(/-/g, "")}0000`
  });
  var jalPartnerSessions = {};
  async function jalPartnerSession(partner, origin, destination, date) {
    if (jalPartnerSessions[partner]) return jalPartnerSessions[partner];
    const enc = document.cookie.match(/(?:^|; )enc1A=([^;]*)/)?.[1];
    if (!enc) return null;
    const { html, url } = await jalPartnerEnqueue(() => jalSubmit(null, {
      ...jalPartnerParams(partner, origin, destination, date),
      ENC: decodeURIComponent(enc),
      ENCT: "2"
    }, { scripts: true }));
    if (jalIsBlocked(html)) return "BLOCKED";
    const sid = url?.match(/;JAL_SESSION_ID=([^/?;&]+)/)?.[1];
    if (sid) jalPartnerSessions[partner] = sid;
    return sid ?? null;
  }
  async function jalPartnerSearch(partner, origin, destination, date) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const sid = await jalPartnerSession(partner, origin, destination, date);
      if (!sid || sid === "BLOCKED") return "SESSION_EXPIRED";
      const { html } = await jalPartnerEnqueue(() => jalSubmit(sid, { ...jalPartnerParams(partner, origin, destination, date), TRIP_TYPE: "M" }));
      if (jalIsBlocked(html)) return "SESSION_EXPIRED";
      const rows = html ? jalParsePartnerAvailability(html, date) : "SESSION_EXPIRED";
      if (rows !== "SESSION_EXPIRED") return rows;
      delete jalPartnerSessions[partner];
    }
    return "SESSION_EXPIRED";
  }
  function jalParseHistogram(raw) {
    try {
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;
      const pageData = data?.mapDataUI?.PAGE?.DATA ?? data?.DATA;
      if (pageData?.context?.flow?.mode === "REVENUE") return null;
      const recommendations = pageData?.outputs?.affinity?.recommendations;
      if (!recommendations) return {};
      const result = {};
      for (const entry of Object.values(recommendations)) {
        const { departureDate, price } = entry;
        if (!departureDate) continue;
        const miles = price?.totalPrice?.milesAmount?.amount;
        if (!miles || miles <= 0) continue;
        const isoDate = new Date(departureDate).toISOString().slice(0, 10);
        if (!result[isoDate] || miles < result[isoDate]) result[isoDate] = miles;
      }
      return result;
    } catch {
      return {};
    }
  }
  var JAL_AIRPORTS = [
    // Japan
    { code: "AXT", name: "Akita" },
    { code: "ASJ", name: "Amamioshima" },
    { code: "AOJ", name: "Aomori" },
    { code: "AKJ", name: "Asahikawa" },
    { code: "FUK", name: "Fukuoka" },
    { code: "HKD", name: "Hakodate" },
    { code: "HNA", name: "Hanamaki" },
    { code: "HIJ", name: "Hiroshima" },
    { code: "ISG", name: "Ishigaki" },
    { code: "IZO", name: "Izumo" },
    { code: "KOJ", name: "Kagoshima" },
    { code: "KKJ", name: "Kitakyushu" },
    { code: "KCZ", name: "Kochi" },
    { code: "KMQ", name: "Komatsu" },
    { code: "KMJ", name: "Kumamoto" },
    { code: "UEO", name: "Kumejima" },
    { code: "KUH", name: "Kushiro" },
    { code: "MMJ", name: "Matsumoto" },
    { code: "MYJ", name: "Matsuyama" },
    { code: "MMB", name: "Memanbetsu" },
    { code: "MSJ", name: "Misawa" },
    { code: "MMY", name: "Miyako" },
    { code: "KMI", name: "Miyazaki" },
    { code: "NGS", name: "Nagasaki" },
    { code: "NGO", name: "Nagoya" },
    { code: "KIJ", name: "Niigata" },
    { code: "OBO", name: "Obihiro" },
    { code: "OIT", name: "Oita" },
    { code: "OKJ", name: "Okayama" },
    { code: "OKA", name: "Okinawa" },
    { code: "OSA", name: "Osaka" },
    { code: "SPK", name: "Sapporo" },
    { code: "SDJ", name: "Sendai" },
    { code: "SHM", name: "Shirahama" },
    { code: "TJH", name: "Tajima" },
    { code: "TAK", name: "Takamatsu" },
    { code: "TKS", name: "Tokushima" },
    { code: "TYO", name: "Tokyo" },
    { code: "KUM", name: "Yakushima" },
    { code: "GAJ", name: "Yamagata" },
    { code: "UBJ", name: "Yamaguchi Ube" },
    // East Asia
    { code: "BJS", name: "Beijing" },
    { code: "PUS", name: "Busan" },
    { code: "DLC", name: "Dalian" },
    { code: "CAN", name: "Guangzhou" },
    { code: "HKG", name: "Hong Kong" },
    { code: "KHH", name: "Kaohsiung" },
    { code: "SEL", name: "Seoul" },
    { code: "SHA", name: "Shanghai" },
    { code: "TPE", name: "Taipei" },
    { code: "TSN", name: "Tianjin" },
    // Guam
    { code: "GUM", name: "Guam" },
    // South-East Asia / South Asia
    { code: "BKK", name: "Bangkok" },
    { code: "BLR", name: "Bengaluru" },
    { code: "DEL", name: "Delhi" },
    { code: "HAN", name: "Hanoi" },
    { code: "SGN", name: "Ho Chi Minh City" },
    { code: "JKT", name: "Jakarta" },
    { code: "KUL", name: "Kuala Lumpur" },
    { code: "MNL", name: "Manila" },
    { code: "SIN", name: "Singapore" },
    // Oceania
    { code: "MEL", name: "Melbourne" },
    { code: "SYD", name: "Sydney" },
    // Europe / Russia
    { code: "FRA", name: "Frankfurt" },
    { code: "HEL", name: "Helsinki" },
    { code: "LON", name: "London" },
    { code: "MOW", name: "Moscow" },
    { code: "PAR", name: "Paris" },
    { code: "VVO", name: "Vladivostok" },
    // Middle East
    { code: "DOH", name: "Doha" },
    // Hawaii
    { code: "HNL", name: "Honolulu" },
    { code: "KOA", name: "Kona" },
    // North America
    { code: "BOS", name: "Boston" },
    { code: "CHI", name: "Chicago" },
    { code: "DFW", name: "Dallas Fort Worth" },
    { code: "LAX", name: "Los Angeles" },
    { code: "NYC", name: "New York" },
    { code: "SAN", name: "San Diego" },
    { code: "SFO", name: "San Francisco" },
    { code: "SEA", name: "Seattle" },
    { code: "YVR", name: "Vancouver" }
  ];
  var JAL_PARTNER_AIRPORTS = [...JAL_AIRPORTS, ...COMMON_AIRPORTS.filter((a3) => !JAL_AIRPORTS.some((j3) => j3.code === a3.code))];
  var jalProgram = {
    id: "jal",
    name: "Japan Airlines",
    color: "#C00000",
    cabins: ["F", "J", "N", "Y"],
    requiresSession: true,
    loginUrl: JAL_AWARD_URL,
    airports: JAL_AIRPORTS,
    // Search mode dropdown: JAL's own award search, or one partner airline's
    carriers: JAL_SEARCH_MODES,
    carrierLabel: "Search mode",
    airportsFor: (carrier) => carrier === JAL_OWN ? JAL_AIRPORTS : JAL_PARTNER_AIRPORTS,
    calendarFor: (carrier) => carrier === JAL_OWN,
    // histogram API only covers JAL flights
    matches: [],
    matchHost: (h3) => h3 === JAL_HOST || h3.endsWith(".jal.co.jp"),
    onSessionReady(cb) {
      jalSessionCallback = cb;
      jalWatchTimeout();
      if (jalTryCapture()) return;
      const poll = setInterval(() => {
        if (jalTryCapture()) clearInterval(poll);
      }, 500);
    },
    isSessionReady() {
      return !!jalCaptured.sessionId;
    },
    // Submit the award search form ourselves (same POST as frmInter on JAL_AWARD_URL); the page lands on
    // book-i with ;JAL_SESSION_ID= in its path, which jalTryCapture picks up. Needs the enc1A JMB login cookie.
    triggerSession() {
      const enc = document.cookie.match(/(?:^|; )enc1A=([^;]*)/)?.[1];
      if (!enc) {
        location.href = JAL_AWARD_URL;
        return;
      }
      const d3 = /* @__PURE__ */ new Date();
      d3.setMonth(d3.getMonth() + 1);
      const form = Object.assign(document.createElement("form"), { method: "POST", action: `${JAL_BASE}/availability` });
      const params = {
        SITE: "J019J019",
        LANGUAGE: "GB",
        COUNTRY_SITE: "JAL_JR_JP",
        DEVICE_TYPE: "DESKTOP",
        ENC: decodeURIComponent(enc),
        ENCT: "2",
        FLOW_MODE: "REDEMPTION",
        PATTERN: "1B",
        DEPARTURE_LOCATION_1: "TYO",
        ARRIVAL_LOCATION_1: "LAX",
        DEPARTURE_DATE_1: `${d3.toISOString().slice(0, 10).replace(/-/g, "")}0000`,
        CFF_OUTBOUND: JAL_CFF.Y,
        NB_ADT: "1",
        NB_YADT: "0",
        NB_CHD: "0",
        NB_INF: "0",
        SEARCH_CASSETTE_ID: "",
        IS_FLEXIBLE: "FALSE",
        WDS_USER_TRAVELLING: "TRUE"
      };
      for (const [name, value] of Object.entries(params)) form.appendChild(Object.assign(document.createElement("input"), { type: "hidden", name, value }));
      document.body.appendChild(form);
      form.submit();
    },
    async onSearch({ origin, destination, date, cabinFilter, carrier }) {
      if (carrier && carrier !== JAL_OWN) return jalPartnerSearch(carrier, origin, destination, date);
      const sid = jalCaptured.sessionId;
      if (!sid) return [];
      const cabins = cabinFilter.length ? cabinFilter : ["F", "J", "N", "Y"];
      const byFlight = {};
      let ddsId = Number(new URL(location.href).searchParams.get("DDS_PREVIOUS_REQUEST_ID") || 0);
      for (const cabin of cabins) {
        await sleep(500);
        try {
          const prevId = ddsId;
          const currId = ddsId + 1;
          ddsId = currId;
          const { html } = await jalSubmit(sid, {
            COUNTRY_SITE: "JAL_JR_JP",
            LANGUAGE: "GB",
            SITE: "J019J019",
            LOCATION: origin,
            DESTINATION: destination,
            DEPARTURE_LOCATION_1: origin,
            ARRIVAL_LOCATION_1: destination,
            DEPARTURE_DATE_1: `${date.replace(/-/g, "")}0000`,
            CABIN_CODE: "ALL",
            CFF_OUTBOUND: JAL_CFF[cabin] ?? "9YE",
            FLOW_MODE: "REDEMPTION",
            TRIP_TYPE: "O",
            NB_ADT: "1",
            NB_CHD: "0",
            NB_INF: "0",
            IS_FLEXIBLE: "false",
            PATTERN: "1B",
            DEVICE_TYPE: "mobile",
            STREAM: "booking",
            DDS_CURRENT_REQUEST_ID: currId,
            DDS_PREVIOUS_REQUEST_ID: prevId,
            DDS_FROM_PAGE: "AFFH",
            PAGE_TICKET: "1"
          });
          if (!html) continue;
          const rows = jalParseAvailability(html, date);
          if (rows === "SESSION_EXPIRED") return "SESSION_EXPIRED";
          for (const row of rows) {
            const key = row.segs.map((s3) => s3.flight).join("+");
            if (!byFlight[key]) byFlight[key] = row;
            else {
              for (const c3 of Object.keys(row.cabins)) {
                if (row.cabins[c3] !== null) {
                  byFlight[key].cabins[c3] = row.cabins[c3];
                  if (row.miles[c3]) byFlight[key].miles[c3] = row.miles[c3];
                }
              }
            }
          }
        } catch {
        }
      }
      return Object.values(byFlight);
    },
    // Calendar mode: one histogram request per cabin → { isoDate: { cabin: miles } }
    async onCalendarSearch(origin, destination, cabins, _fromMonth, _toMonth, onProgress) {
      const sid = jalCaptured.sessionId;
      if (!sid) return "SESSION_EXPIRED";
      const cabinsToSearch = cabins.length ? cabins : ["F", "J", "N", "Y"];
      const total = cabinsToSearch.length;
      const byDate = {};
      for (let i3 = 0; i3 < total; i3++) {
        const cabin = cabinsToSearch[i3];
        onProgress?.(null, { done: i3, total, label: `Searching ${CABIN_LABELS[cabin]} class` });
        await sleep(300);
        try {
          const res = await fetch(`${JAL_BASE}/histogramInformation;JAL_SESSION_ID=${sid}`, {
            method: "POST",
            credentials: "include",
            headers: { "content-type": "application/x-www-form-urlencoded", "accept": "application/json" },
            body: `SITE=J019J019&COUNTRY_SITE=JAL_JR_JP&LANGUAGE=GB&LOCATION=${origin}&TRIP_TYPE=O&DESTINATION=${destination}&CABIN_CODE=${JAL_CABIN_HIST[cabin] ?? "E"}`
          });
          if (!res.ok) continue;
          const dateMap = jalParseHistogram(await res.text());
          if (dateMap === null) return "SESSION_EXPIRED";
          const partial = {};
          for (const [date, miles] of Object.entries(dateMap)) {
            if (!byDate[date]) byDate[date] = {};
            byDate[date][cabin] = miles;
            if (!partial[date]) partial[date] = {};
            partial[date][cabin] = miles;
          }
          onProgress?.(partial, { done: i3 + 1, total, label: `${CABIN_LABELS[cabin]} class done` });
        } catch {
        }
      }
      return byDate;
    }
  };

  // src/programs/ana.js
  var ANA_HOST = "aswbe-i.ana.co.jp";
  var ANA_INPUT_PATH = "/international_asw/pages/award/search/roundtrip/award_search_roundtrip_input.xhtml";
  var ANA_CFF = { F: "CFF3", J: "CFF2", N: "CFF4", Y: "CFF1" };
  var ANA_SERVICE_LEVEL_CABIN = { 200: "F", 400: "F", 600: "J", 800: "J", 1e3: "N", 1200: "Y", 1400: "Y" };
  var anaCaptured = { aswcid: null, basePath: null };
  var anaSessionCallback = null;
  function anaTryCapture() {
    if (location.hostname !== ANA_HOST) return false;
    const m3 = location.pathname.match(/^\/(rei[^/]+)\//);
    const q2 = new URLSearchParams(location.search);
    const aswcid = q2.get("aswcid");
    if (!aswcid) return false;
    const changed = anaCaptured.aswcid !== aswcid || anaCaptured.basePath !== (m3?.[1] ?? null);
    anaCaptured.aswcid = aswcid;
    anaCaptured.basePath = m3?.[1] ?? null;
    if (changed && anaSessionCallback) anaSessionCallback();
    return true;
  }
  function anaInputUrl() {
    const base = anaCaptured.basePath ? `https://${ANA_HOST}/${anaCaptured.basePath}` : `https://${ANA_HOST}`;
    return `${base}${ANA_INPUT_PATH}?aswcid=${anaCaptured.aswcid}`;
  }
  function anaParseInputPage(html) {
    const actionM = html.match(/id="conditionInput"[^>]*action="([^"]+)"/);
    if (!actionM) return null;
    const action = actionM[1].replace(/&amp;/g, "&");
    const vsM = html.match(/name="javax\.faces\.ViewState"[^>]*value="([^"]+)"/);
    if (!vsM) return null;
    const viewState = vsM[1];
    const btnM = html.match(/name="(j_idt\d+)" value="Search"/) ?? html.match(/name="(j_idt\d+)" value="検索する"/);
    if (!btnM) return null;
    return { action, viewState, searchBtn: btnM[1] };
  }
  function anaParseResults(html, date) {
    try {
      const obListM = html.match(/var obList = new Array\(\);([\s\S]*?)var ibList/);
      if (!obListM) return [];
      const flightMap = {};
      const flightRe = /new f\('(\d+)'[^,]*,[^,]*,'[^']*','([^']+)','([^']+)','(\d{2}:\d{2})','(\d{2}:\d{2})','([A-Z]{2}\d+)'[^)]*\)/g;
      let m3;
      while ((m3 = flightRe.exec(obListM[1])) !== null) {
        const [, idx, orig, dest, dep, arr, flight] = m3;
        if (!flightMap[idx]) flightMap[idx] = { segs: [] };
        const seg = { flight, origin: orig.match(/\(([A-Z]{3})\)/)?.[1] ?? orig, destination: dest.match(/\(([A-Z]{3})\)/)?.[1] ?? dest, dep, arr };
        if (!flightMap[idx].segs.some((s3) => s3.flight === seg.flight)) {
          flightMap[idx].segs.push(seg);
        }
      }
      const segMapRe = /addOutboundSegmentInfoMap\('(\d+)_(\d+)',\s*'[A-Z]{2}',\s*'(\d+)',\s*'([A-Z]{3})',\s*'([A-Z]{3})'/g;
      while ((m3 = segMapRe.exec(html)) !== null) {
        const [, flightIdx, segIdx, flightNum, orig, dest] = m3;
        if (flightMap[flightIdx]?.segs[+segIdx]) {
          flightMap[flightIdx].segs[+segIdx].origin = orig;
          flightMap[flightIdx].segs[+segIdx].destination = dest;
        }
      }
      const recRe = /addRecommendation\((\d+),\s*\d+,\s*null,\s*'(\d+)',\s*null,\s*[\d.]+,\s*null,\s*[\d.]+,\s*\w+,\s*\d+,\s*null,\s*(\d+)/g;
      const results = {};
      while ((m3 = recRe.exec(html)) !== null) {
        const [, obIdx, fareCode, miles] = m3;
        const cabin = ANA_SERVICE_LEVEL_CABIN[+fareCode];
        if (!cabin || !flightMap[obIdx]) continue;
        if (!results[obIdx]) {
          const info = flightMap[obIdx];
          const segs = info.segs;
          results[obIdx] = {
            date,
            origin: segs[0].origin,
            destination: segs[segs.length - 1].destination,
            segs: segs.map((s3) => ({
              airline: s3.flight.slice(0, 2),
              flight: s3.flight,
              origin: s3.origin,
              destination: s3.destination,
              dep: `${date}T${s3.dep}:00`,
              arr: `${date}T${s3.arr}:00`
            })),
            cabins: { F: null, J: null, N: null, Y: null },
            miles: {},
            bookUrl: "https://aswbe-i.ana.co.jp/international_asw/pages/award/search/roundtrip/award_search_roundtrip_input.xhtml"
          };
        }
        const r3 = results[obIdx];
        const mi = +miles;
        if (r3.cabins[cabin] === null) {
          r3.cabins[cabin] = 1;
          r3.miles[cabin] = mi;
        } else if (mi < (r3.miles[cabin] ?? Infinity)) {
          r3.miles[cabin] = mi;
        }
      }
      return Object.values(results);
    } catch {
      return [];
    }
  }
  var anaProgram = {
    id: "ana",
    name: "ANA",
    color: "#003087",
    cabins: ["F", "J", "N", "Y"],
    airports: COMMON_AIRPORTS,
    requiresSession: true,
    loginUrl: `https://${ANA_HOST}${ANA_INPUT_PATH}?aswcid=1`,
    matches: [],
    matchHost: (h3) => h3.endsWith(".ana.co.jp"),
    onSessionReady(cb) {
      anaSessionCallback = cb;
      if (anaTryCapture()) return;
      const poll = setInterval(() => {
        if (anaTryCapture()) clearInterval(poll);
      }, 500);
    },
    isSessionReady() {
      return !!anaCaptured.aswcid;
    },
    async onSearch({ origin, destination, date, cabinFilter }) {
      if (!anaCaptured.aswcid) return [];
      const cabins = cabinFilter.length ? cabinFilter : ["F", "J", "N", "Y"];
      const inputRes = await fetch(anaInputUrl(), { credentials: "include" });
      if (!inputRes.ok) return [];
      const inputHtml = await inputRes.text();
      const parsed = anaParseInputPage(inputHtml);
      if (!parsed) return [];
      const cff = ANA_CFF[cabins[0]] ?? "CFF1";
      const body = new URLSearchParams({
        "conditionInput": "conditionInput",
        "conditionInput_operationTicket": "",
        "conditionInput_cmnPageTicket": "0",
        "hiddenSearchMode": "ONE_WAY",
        "itineraryButtonCheck": "oneWay",
        "hiddenAction": "AwardRoundTripSearchInputAction",
        "hiddenRoundtripOpenJawSelected": "0",
        "departureAirportCode:field": origin,
        "departureAirportCode:field_pctext": origin,
        "arrivalAirportCode:field": destination,
        "arrivalAirportCode:field_pctext": destination,
        "awardDepartureDate:field": date.replace(/-/g, ""),
        "hiddenBoardingClassType": "0",
        "boardingClass": cff,
        "adult:count": "1",
        "youngAdult:count": "0",
        "child:count": "0",
        "hiddenDomesticChildAge": "false",
        "infant:count": "0",
        [parsed.searchBtn]: "Search",
        "javax.faces.ViewState": parsed.viewState
      });
      const res = await fetch(parsed.action, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: body.toString()
      });
      if (!res.ok) return [];
      const html = await res.text();
      return anaParseResults(html, date);
    }
  };

  // src/programs/ac.js
  (function acInstallInterceptor() {
    const _orig = window.fetch;
    window.fetch = async function(...args) {
      const url = typeof args[0] === "string" ? args[0] : args[0]?.url;
      const res = await _orig.apply(this, args);
      if (url?.includes("dbaas.aircanada.com")) {
        res.clone().json().then((json) => {
          if (json?.data?.sessionToken) {
            acOnSessionData(json);
          } else if (json?.data?.airBoundGroups) {
            acOnSearchResult({ ...json.data, dictionaries: json.dictionaries });
          } else if (json?.errors?.some((e3) => e3.code === AC_NO_FLIGHTS)) {
            acOnSearchResult({ airBoundGroups: [] });
          }
        }).catch(() => {
        });
      }
      return res;
    };
  })();
  var AC_NO_FLIGHTS = "7959";
  var AC_BOOK_URL = "https://www.aircanada.com/aeroplan/redeem/availability/outbound";
  var acSession = { marketCode: null, userId: null, ready: false };
  var acSessionCallback = null;
  var acPending = null;
  function acOnSessionData(json) {
    if (acSession.ready) return;
    acSession.marketCode = json.data.marketCode || "NBM";
    acSession.userId = json.userId || null;
    acSession.ready = true;
    if (acSessionCallback) acSessionCallback();
  }
  function acOnSearchResult(data) {
    if (acPending && location.search === acPending.search) acPending.resolve(data);
  }
  var AC_ONE_WAY = "O";
  var AC_STOPOVER = "SO";
  var AC_SEARCH_MODES = [
    { code: AC_ONE_WAY, name: "One-way" },
    { code: AC_STOPOVER, name: "One-way with stopover" }
  ];
  function acSearchUrl(origin, dest, date, stopover) {
    const route = stopover ? `tripType=M&marketCode=INT&org0=${origin}&dest0=${dest}&locationCodes0=${stopover.city}&stayDuration0=${stopover.days}` : `tripType=O&org0=${origin}&dest0=${dest}`;
    return `${AC_BOOK_URL}?${route}&departureDate0=${date}&ADT=1&YTH=0&CHD=0&INF=0&INS=0`;
  }
  function acNavigateSearch(origin, dest, date, stopover) {
    history.pushState({}, "", acSearchUrl(origin, dest, date, stopover));
    window.dispatchEvent(new PopStateEvent("popstate", { state: history.state }));
  }
  var acQueue = Promise.resolve();
  function acTriggerSearch(origin, dest, date, stopover, timeoutMs = 25e3) {
    const run = acQueue.then(() => new Promise((resolve) => {
      const done = (data) => {
        clearTimeout(timer);
        acPending = null;
        resolve(data);
      };
      const timer = setTimeout(() => done(null), timeoutMs);
      acNavigateSearch(origin, dest, date, stopover);
      acPending = { search: location.search, resolve: done };
    }));
    acQueue = run;
    return run;
  }
  function acParseFlightId(flightId, totalDurSec, segCount, dict) {
    const m3 = flightId.match(/^SEG-([A-Z]{2})(\d+[A-Z]?)-([A-Z]{3})([A-Z]{3})-(\d{4}-\d{2}-\d{2})-(\d{4})$/);
    if (!m3) return null;
    const [, airline, num, org, dst, date, t3] = m3;
    const info = dict?.[flightId];
    const dep = info?.departure?.dateTime?.slice(0, 19) ?? `${date}T${t3.slice(0, 2)}:${t3.slice(2)}:00`;
    const arr = info?.arrival?.dateTime?.slice(0, 19) ?? new Date(new Date(dep).getTime() + totalDurSec / segCount * 1e3).toISOString().slice(0, 19);
    return { airline, flight: airline + num, origin: org, destination: dst, dep, arr };
  }
  var AC_CABIN_MAP = { eco: "Y", premium: "N", business: "J", first: "F" };
  function acParseData(data, origin, destination, date, stopover = null) {
    const byKey = {};
    const dict = data.dictionaries?.flight;
    for (const group of data.airBoundGroups || []) {
      const { boundDetails, airBounds } = group;
      const segDefs = boundDetails?.segments || [];
      const stayIdx = stopover && segDefs.length > 1 ? segDefs.reduce((best, s3, i3) => (s3.connectionTime || 0) > (segDefs[best].connectionTime || 0) ? i3 : best, 0) : -1;
      const dur = (boundDetails?.duration || 0) - (segDefs[stayIdx]?.connectionTime || 0);
      const segs = segDefs.map((s3) => acParseFlightId(s3.flightId, dur, segDefs.length, dict)).filter(Boolean);
      if (!segs.length) continue;
      const stopoverInfo = stayIdx >= 0 && segs.length === segDefs.length ? {
        at: segs[stayIdx].destination,
        days: Math.round((Date.parse(segs[stayIdx + 1].dep.slice(0, 10)) - Date.parse(segs[stayIdx].arr.slice(0, 10))) / 864e5)
      } : void 0;
      const key = segDefs.map((s3) => s3.flightId).join("+");
      if (!byKey[key]) {
        byKey[key] = {
          date,
          origin,
          destination,
          segs,
          cabins: { F: null, J: null, N: null, Y: null },
          miles: {},
          duration: Math.round(dur / 60),
          bookUrl: acSearchUrl(origin, destination, date, stopover),
          stopover: stopoverInfo
        };
      }
      const entry = byKey[key];
      for (const bound of airBounds || []) {
        const avail = bound.availabilityDetails?.[0];
        const cabin = AC_CABIN_MAP[avail?.cabin] || "Y";
        const seats = avail?.quota ?? 1;
        const miles = bound.prices?.convertedMiles?.base ?? bound.prices?.unitPrices?.[0]?.milesConversion?.convertedMiles?.base;
        if (entry.cabins[cabin] == null || miles && miles < (entry.miles[cabin] || Infinity)) {
          entry.cabins[cabin] = seats;
          if (miles) entry.miles[cabin] = miles;
        } else if (entry.cabins[cabin] != null && !miles) {
          entry.cabins[cabin] = seats;
        }
        const details = bound.availabilityDetails || [];
        if (details.length > 1 && details.length === segDefs.length) {
          const cabinsPerSeg = details.map((d3) => AC_CABIN_MAP[d3?.cabin] || "Y");
          const unique = new Set(cabinsPerSeg);
          if (unique.size > 1) {
            const segDurs = segDefs.map((s3) => s3.duration || dur / segDefs.length);
            const totalDur = segDurs.reduce((a3, b2) => a3 + b2, 0) || 1;
            const cabinDur = segDurs.reduce((sum, d3, i3) => cabinsPerSeg[i3] === cabin ? sum + d3 : sum, 0);
            const pct = Math.round(cabinDur / totalDur * 100);
            if (!entry.mixPct) entry.mixPct = {};
            if (!entry.mixPct[cabin] || pct > entry.mixPct[cabin]) entry.mixPct[cabin] = pct;
          }
        }
      }
    }
    return Object.values(byKey);
  }
  var AC_AIRPORTS = [
    { code: "YVR", name: "Vancouver" },
    { code: "YYZ", name: "Toronto" },
    { code: "YUL", name: "Montr\xE9al" },
    { code: "YYC", name: "Calgary" },
    { code: "YEG", name: "Edmonton" },
    { code: "YOW", name: "Ottawa" },
    { code: "YHZ", name: "Halifax" },
    { code: "YWG", name: "Winnipeg" },
    { code: "NRT", name: "Tokyo (Narita)" },
    { code: "HND", name: "Tokyo (Haneda)" },
    { code: "KIX", name: "Osaka (Kansai)" },
    { code: "FUK", name: "Fukuoka" },
    { code: "CTS", name: "Sapporo" },
    { code: "OKA", name: "Okinawa" },
    { code: "ICN", name: "Seoul (Incheon)" },
    { code: "GMP", name: "Seoul (Gimpo)" },
    { code: "HKG", name: "Hong Kong" },
    { code: "TPE", name: "Taipei (Taoyuan)" },
    { code: "PEK", name: "Beijing" },
    { code: "PVG", name: "Shanghai (Pudong)" },
    { code: "CAN", name: "Guangzhou" },
    { code: "SIN", name: "Singapore" },
    { code: "BKK", name: "Bangkok" },
    { code: "KUL", name: "Kuala Lumpur" },
    { code: "CGK", name: "Jakarta" },
    { code: "MNL", name: "Manila" },
    { code: "HAN", name: "Hanoi" },
    { code: "SGN", name: "Ho Chi Minh City" },
    { code: "DEL", name: "Delhi" },
    { code: "BOM", name: "Mumbai" },
    { code: "DXB", name: "Dubai" },
    { code: "DOH", name: "Doha" },
    { code: "TLV", name: "Tel Aviv" },
    { code: "LHR", name: "London (Heathrow)" },
    { code: "CDG", name: "Paris (CDG)" },
    { code: "FRA", name: "Frankfurt" },
    { code: "AMS", name: "Amsterdam" },
    { code: "ZRH", name: "Zurich" },
    { code: "MXP", name: "Milan (Malpensa)" },
    { code: "FCO", name: "Rome" },
    { code: "BCN", name: "Barcelona" },
    { code: "MAD", name: "Madrid" },
    { code: "VIE", name: "Vienna" },
    { code: "MUC", name: "Munich" },
    { code: "DUB", name: "Dublin" },
    { code: "LIS", name: "Lisbon" },
    { code: "JFK", name: "New York (JFK)" },
    { code: "EWR", name: "New York (Newark)" },
    { code: "LAX", name: "Los Angeles" },
    { code: "ORD", name: "Chicago (O'Hare)" },
    { code: "SFO", name: "San Francisco" },
    { code: "MIA", name: "Miami" },
    { code: "BOS", name: "Boston" },
    { code: "SEA", name: "Seattle" },
    { code: "DFW", name: "Dallas" },
    { code: "IAH", name: "Houston" },
    { code: "IAD", name: "Washington D.C." },
    { code: "ATL", name: "Atlanta" },
    { code: "DEN", name: "Denver" },
    { code: "GRU", name: "S\xE3o Paulo" },
    { code: "EZE", name: "Buenos Aires" },
    { code: "MEX", name: "Mexico City" },
    { code: "SYD", name: "Sydney" },
    { code: "MEL", name: "Melbourne" },
    { code: "AKL", name: "Auckland" }
  ];
  var acProgram = {
    id: "ac",
    name: "Air Canada (Aeroplan)",
    color: "#d2001f",
    cabins: ["J", "N", "Y"],
    requiresSession: true,
    loginUrl: AC_BOOK_URL,
    airports: AC_AIRPORTS,
    carriers: AC_SEARCH_MODES,
    carrierLabel: "Search mode",
    optionsFor: (carrier) => carrier === AC_STOPOVER ? [
      { key: "stopoverCity", label: "Stopover cities", type: "airports" },
      { key: "stayDays", label: "Stay (days)", type: "numbers", placeholder: "e.g. 3-5, 7", default: "5" }
    ] : [],
    matches: [],
    matchHost: (h3) => h3 === "aircanada.com" || h3.endsWith(".aircanada.com"),
    onSessionReady(cb) {
      acSessionCallback = cb;
      if (acSession.ready) cb();
    },
    isSessionReady() {
      return acSession.ready && location.hostname.endsWith("aircanada.com");
    },
    getSessionUrl() {
      return AC_BOOK_URL + "?tripType=O&org0=YVR&dest0=NRT&departureDate0=2027-03-01&ADT=1&YTH=0&CHD=0&INF=0&INS=0";
    },
    async onSearch({ origin, destination, date, carrier, options }) {
      const stopover = carrier === AC_STOPOVER ? { city: options.stopoverCity.toUpperCase(), days: Number(options.stayDays) } : null;
      const data = await acTriggerSearch(origin, destination, date, stopover);
      if (!data) return [];
      return acParseData(data, origin, destination, date, stopover);
    }
  };

  // src/programs/aa.js
  var AA_RESULTS_URL = "https://www.aa.com/booking/choose-flights/1";
  var AA_DELAY_MS = [2500, 6e3];
  var AA_BURST = [8, 15];
  var AA_BREAK_MS = [15e3, 3e4];
  var AA_BACKOFF_STEP = 1.5;
  var AA_BACKOFF_MAX = 4;
  var AA_PRODUCT_MAP = { FIRST: "F", BUSINESS: "J", PREMIUM_ECONOMY: "N", COACH: "Y" };
  var AA_CABIN_RANK = { COACH: 0, PREMIUM_ECONOMY: 1, BUSINESS: 2, FIRST: 3 };
  function aaSearchRequest(origin, destination, date, cabin = "") {
    return {
      loyaltyInfo: null,
      metadata: { errorCode: null, selectedProducts: [], tripType: "OneWay" },
      passengers: [{ type: "adult", count: 1 }],
      queryParams: { sessionId: "", sliceIndex: 0, solutionId: "", solutionSet: "" },
      slices: [{
        allCarriers: true,
        cabin,
        departureDate: date,
        origin,
        originNearbyAirports: false,
        destination,
        destinationNearbyAirports: false
      }],
      tripOptions: {
        corporateBooking: false,
        fareType: "Lowest",
        locale: "en_US",
        pointOfSale: null,
        searchType: "Award",
        travelType: null,
        enableBenefits: true
      },
      requestHeader: { clientId: "AAcom" },
      version: "cfr"
    };
  }
  var AA_CHALLENGE_MESSAGE = `\u26A0 AA bot check \u2014 click Get session, tick "I'm not a robot" on aa.com if asked, then search again`;
  var aaSessionCallback = null;
  var aaChallenged = false;
  var aaFetchOk = false;
  var aaOnResultsPage = () => location.pathname.startsWith("/booking/choose-flights") && document.readyState !== "loading" && document.title !== "Challenge Validation";
  function aaSessionUrl() {
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem("award-buddy:aa")) || {};
    } catch {
    }
    const first = (v3) => Array.isArray(v3) ? v3[0] : void 0;
    return aaBookUrl(first(saved.origins) ?? "DFW", first(saved.dests) ?? "LHR", addDays(todayISO(), 30));
  }
  var aaRand = ([lo, hi]) => lo + Math.random() * (hi - lo);
  var AA_BACKOFF_KEY = "award-buddy:aa-backoff";
  var aaBackoff = 1;
  try {
    aaBackoff = Number(sessionStorage.getItem(AA_BACKOFF_KEY)) || 1;
  } catch {
  }
  function aaSetBackoff(v3) {
    aaBackoff = v3;
    try {
      sessionStorage.setItem(AA_BACKOFF_KEY, String(v3));
    } catch {
    }
  }
  var aaUntilBreak = Math.round(aaRand(AA_BURST));
  function aaNextDelay() {
    if (--aaUntilBreak <= 0) {
      aaUntilBreak = Math.round(aaRand(AA_BURST));
      return aaRand(AA_BREAK_MS) * aaBackoff;
    }
    return aaRand(AA_DELAY_MS) * aaBackoff;
  }
  var aaQueue = Promise.resolve();
  function aaFetch(origin, destination, date, cabin) {
    const run = aaQueue.then(() => aaFetchNow(origin, destination, date, cabin));
    aaQueue = run;
    return run;
  }
  async function aaFetchNow(origin, destination, date, cabin) {
    await sleep(aaNextDelay());
    try {
      const res = await fetch(AA_RESULTS_URL, {
        method: "POST",
        credentials: "include",
        body: new URLSearchParams({
          searchRequest: JSON.stringify(aaSearchRequest(origin, destination, date, cabin)),
          requestType: "itinerary"
        })
      });
      if (!res.ok) return null;
      const html = await res.text();
      if (html.includes("<title>Challenge Validation</title>")) {
        aaChallenged = true;
        aaSetBackoff(Math.min(aaBackoff * AA_BACKOFF_STEP, AA_BACKOFF_MAX));
        aaSessionCallback?.();
        return "SESSION_EXPIRED";
      }
      const m3 = html.match(/<script id="ng-state" type="application\/json">([\s\S]*?)<\/script>/);
      const data = m3 && JSON.parse(m3[1]).SearchData;
      if (data) {
        aaFetchOk = true;
        aaSetBackoff(Math.max(1, aaBackoff * 0.95));
      }
      return data?.itineraryResult ? data : null;
    } catch {
      return null;
    }
  }
  function aaBookUrl(origin, destination, date) {
    const slices = JSON.stringify([{ orig: origin, origNearby: false, dest: destination, destNearby: false, date }]);
    return `https://www.aa.com/booking/search?locale=en_US&pax=1&adult=1&type=OneWay&searchType=Award&cabin=&carriers=ALL&slices=${encodeURIComponent(slices)}`;
  }
  function aaCabinPct(legs, productType) {
    const want = AA_CABIN_RANK[productType];
    let total = 0, inCabin = 0;
    for (const leg of legs) {
      const mins = leg.durationInMinutes || 0;
      const cabinType = leg.productDetails?.find((p3) => p3.productType === productType)?.cabinType;
      total += mins;
      if ((AA_CABIN_RANK[cabinType] ?? -1) >= want) inCabin += mins;
    }
    return total ? Math.round(inCabin / total * 100) : 100;
  }
  function aaParseResults(itineraryResult, origin, destination, date) {
    const results = [];
    for (const slice of itineraryResult?.slices ?? []) {
      const segs = (slice.segments ?? []).map((seg) => ({
        airline: seg.flight.carrierCode,
        flight: seg.flight.carrierCode + seg.flight.flightNumber,
        origin: seg.origin.code,
        destination: seg.destination.code,
        dep: seg.departureDateTime.slice(0, 19),
        arr: seg.arrivalDateTime.slice(0, 19)
      }));
      if (!segs.length) continue;
      const legs = slice.segments.flatMap((seg) => seg.legs ?? []);
      const cabins = { F: null, J: null, N: null, Y: null }, miles = {}, mixPct = {};
      for (const p3 of slice.pricingDetail ?? []) {
        const c3 = AA_PRODUCT_MAP[p3.productType];
        if (!c3 || !p3.productAvailable || !(p3.perPassengerAwardPoints > 0)) continue;
        cabins[c3] = p3.seatsRemaining > 0 ? p3.seatsRemaining : true;
        miles[c3] = p3.perPassengerAwardPoints;
        const pct = aaCabinPct(legs, p3.productType);
        if (pct < 100) mixPct[c3] = pct;
      }
      if (!Object.values(cabins).some((v3) => v3 !== null)) continue;
      results.push({
        date,
        origin,
        destination,
        segs,
        cabins,
        miles,
        ...Object.keys(mixPct).length ? { mixPct } : {},
        duration: slice.durationInMinutes,
        bookUrl: aaBookUrl(origin, destination, date)
      });
    }
    return results;
  }
  function aaCalendarMonths(fromMonth, toMonth) {
    const months = [];
    const thisMonth = todayISO().slice(0, 7);
    for (let [y3, m3] = fromMonth.split("-").map(Number); ; m3 === 12 ? (y3++, m3 = 1) : m3++) {
      const ym = `${y3}-${String(m3).padStart(2, "0")}`;
      if (ym > toMonth) break;
      if (ym >= thisMonth) months.push(ym);
    }
    return months;
  }
  function aaCalendarRequest(origin, destination, date, cabin) {
    return {
      metadata: { selectedProducts: [], tripType: "OneWay", udo: {} },
      passengers: [{ type: "adult", count: 1 }],
      requestHeader: { clientId: "AAcom" },
      slices: [{
        allCarriers: true,
        cabin,
        departureDate: date,
        destination,
        destinationNearbyAirports: false,
        maxStops: null,
        origin,
        originNearbyAirports: false
      }],
      tripOptions: {
        corporateBooking: false,
        fareType: "Lowest",
        locale: "en_US",
        pointOfSale: null,
        searchType: "Award",
        enableBenefits: true
      },
      loyaltyInfo: null,
      version: "",
      queryParams: { sliceIndex: 0, sessionId: "", solutionSet: "", solutionId: "" }
    };
  }
  function aaParseCalendar(json) {
    const out = {};
    for (const month of json?.calendarMonths ?? [])
      for (const week of month.weeks ?? [])
        for (const day of week.days ?? []) {
          const pts = day.solution?.perPassengerAwardPoints;
          if (day.validDay && day.date && pts > 0) out[day.date] = pts;
        }
    return out;
  }
  function aaCalendarFetch(origin, destination, date, cabin) {
    const run = aaQueue.then(() => aaCalendarFetchNow(origin, destination, date, cabin));
    aaQueue = run;
    return run;
  }
  async function aaCalendarFetchNow(origin, destination, date, cabin) {
    await sleep(aaNextDelay());
    const xsrf = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/)?.[1];
    try {
      const res = await fetch("/booking/api/search/calendar", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
          ...xsrf ? { "X-XSRF-TOKEN": decodeURIComponent(xsrf) } : {},
          "X-CID": crypto.randomUUID()
        },
        body: JSON.stringify(aaCalendarRequest(origin, destination, date, cabin))
      });
      const text = await res.text();
      let json = null;
      try {
        json = JSON.parse(text);
      } catch {
      }
      if (!json && (text.includes("Challenge Validation") || [403, 428, 429].includes(res.status))) {
        aaChallenged = true;
        aaSetBackoff(Math.min(aaBackoff * AA_BACKOFF_STEP, AA_BACKOFF_MAX));
        aaSessionCallback?.();
        return "SESSION_EXPIRED";
      }
      if (!res.ok || !json) return null;
      aaFetchOk = true;
      aaSetBackoff(Math.max(1, aaBackoff * 0.95));
      return aaParseCalendar(json);
    } catch {
      return null;
    }
  }
  var AA_CAL_CABIN = { F: "FIRST", J: "BUSINESS", N: "PREMIUM_COACH", Y: "COACH" };
  var aaCalCabins = (cabinFilter) => cabinFilter.length ? cabinFilter : ["F", "J", "N", "Y"];
  var aaProgram = {
    id: "aa",
    name: "American Airlines",
    color: "#0078d2",
    cabins: ["F", "J", "N", "Y"],
    airports: COMMON_AIRPORTS,
    requiresSession: true,
    matches: ["www.aa.com"],
    expiredMessage: AA_CHALLENGE_MESSAGE,
    onSessionReady(cb) {
      aaSessionCallback = cb;
    },
    isSessionReady() {
      return !aaChallenged && (aaFetchOk || aaOnResultsPage());
    },
    getSessionUrl() {
      return aaSessionUrl();
    },
    triggerSession() {
      location.href = aaSessionUrl();
    },
    async onSearch({ origin, destination, date }) {
      const data = await aaFetch(origin, destination, date, "");
      if (data === "SESSION_EXPIRED") return data;
      return data ? aaParseResults(data.itineraryResult, origin, destination, date) : [];
    },
    calendarRequestsPerRoute(fromMonth, toMonth, cabinFilter) {
      return aaCalCabins(cabinFilter).length * aaCalendarMonths(fromMonth, toMonth).length;
    },
    async onCalendarSearch(origin, destination, cabinFilter, fromMonth, toMonth, onProgress) {
      const cabins = aaCalCabins(cabinFilter);
      const months = aaCalendarMonths(fromMonth, toMonth);
      const today = todayISO();
      const total = cabins.length * months.length;
      let done = 0;
      const byDate = {};
      for (const cabin of cabins) {
        for (const month of months) {
          onProgress?.(null, { done, total, label: `Searching ${cabin} \u2013 ${month}` });
          const date = [`${month}-01`, today].sort()[1];
          const days = await aaCalendarFetch(origin, destination, date, AA_CAL_CABIN[cabin]);
          if (days === "SESSION_EXPIRED") return days;
          const partial = {};
          for (const [d3, pts] of Object.entries(days ?? {})) {
            if (d3 < today) continue;
            byDate[d3] = { ...byDate[d3], [cabin]: pts };
            partial[d3] = { [cabin]: pts };
          }
          onProgress?.(Object.keys(partial).length ? partial : null, { done: ++done, total });
        }
      }
      return byDate;
    }
  };

  // src/programs/ihg.js
  var IHG_API = "https://apis.ihg.com";
  var IHG_API_KEY = "se9ym5iAzaW8pxfBjkmgbuGjJcr3Pj6Y";
  var IHG_HEADERS = { accept: "application/json", "x-ihg-api-key": IHG_API_KEY, "ihg-language": "en-US" };
  var NEARBY_RADIUS_MI = 30;
  var NEARBY_MAX = 30;
  var SAME_PLACE_KM = 0.15;
  var IHG_DELAY_MS = 600;
  var REWARD_RATE_PLANS = ["IVAN1", "IVAN3", "IVAN5", "IVAN6", "IVAN7", "IVANI"];
  var BED_TYPE = { K: "King", C: "Double", T: "Twin", Q: "Queen", S: "Studio", D: "Double" };
  var ROOM_CATEGORY = {
    AB: "Accessible",
    CL: "Club",
    DX: "Deluxe",
    EX: "Executive",
    JR: "Junior Suite",
    OT: "One-Bed",
    PR: "Premium",
    SP: "Superior",
    ST: "Standard",
    SU: "Suite"
  };
  function ihgRoomLabel(code) {
    if (!code || code.length < 3) return code;
    return `${BED_TYPE[code[0]] ?? code[0]} ${ROOM_CATEGORY[code.slice(1, 3)] ?? code.slice(1, 3)}`;
  }
  function ihgBuildRequest({ hotel, start, end }) {
    return {
      hotelMnemonics: [hotel],
      startDate: start,
      endDate: end,
      lengthOfStay: 1,
      guestCounts: [{ otaCode: "AQC10", count: 1 }],
      options: {
        includeSellStrategy: "followChannel",
        returnAmountsAfterTaxForLowestOffer: true,
        returnAverages: true,
        lowestOfferPerRatePlan: true,
        identifyLowestOfferPerRatePlan: true
      },
      rates: { ratePlanCodes: REWARD_RATE_PLANS }
    };
  }
  function ihgParseCalendar(data) {
    const results = [];
    for (const h3 of data?.data?.hotels ?? []) {
      const hotel = h3.hotel?.hotelMnemonic?.toUpperCase();
      if (!hotel) continue;
      for (const day of h3.calendar ?? []) {
        if (!day.start) continue;
        for (const offer of day.offers ?? []) {
          if (!REWARD_RATE_PLANS.includes(offer.ratePlanCode)) continue;
          const points = offer.checkInPoints;
          if (!(points > 0)) continue;
          const inv = offer.inventoryTypesAvailable?.[0];
          results.push({
            date: day.start,
            hotel,
            points,
            room: ihgRoomLabel(inv?.inventoryTypeCode),
            roomsLeft: inv?.numberOfAvailableProducts
          });
        }
      }
    }
    return results;
  }
  function ihgParseDestinations(data) {
    return (Array.isArray(data) ? data : []).filter((d3) => d3.clarifiedLocation && d3.latitude != null && d3.longitude != null).map((d3) => ({
      label: d3.clarifiedLocation,
      sub: d3.type === "A" ? "Airport" : void 0,
      ref: { lat: d3.latitude, lng: d3.longitude, label: d3.clarifiedLocation, airport: d3.type === "A" }
    }));
  }
  function ihgParseNearby(data, ref) {
    const hotels = [...data?.hotels ?? []].filter((h3) => h3.hotelMnemonic).sort((a3, b2) => (a3.distanceKm ?? Infinity) - (b2.distanceKm ?? Infinity));
    const first = hotels[0];
    if (first && !ref.airport && first.distanceKm < SAME_PLACE_KM) return { exact: { code: first.hotelMnemonic }, nearby: [] };
    return {
      nearby: hotels.slice(0, NEARBY_MAX).map((h3) => ({
        code: h3.hotelMnemonic,
        sub: [h3.distanceKm != null && `${h3.distanceKm.toFixed(1)} km`, h3.availabilityStatus && h3.availabilityStatus !== "OPEN" && h3.availabilityStatus.toLowerCase()].filter(Boolean).join(" \xB7 ")
      }))
    };
  }
  function ihgHotelFromUrl(url) {
    const u4 = new URL(url);
    const code = u4.searchParams.get("qSlH") ?? u4.pathname.match(/\/([a-z0-9]{5})\/hoteldetail/i)?.[1] ?? (u4.pathname.includes("/find-hotels/hotel/") ? u4.searchParams.get("qDest") : null);
    return code && /^[a-z0-9]{5}$/i.test(code) ? code.toUpperCase() : null;
  }
  var ihgProgram = {
    id: "ihg",
    kind: "hotel",
    name: "IHG",
    color: "#0D2D52",
    matches: ["www.ihg.com"],
    requiresSession: false,
    hotelPlaceholder: "Hotel name, city, airport or code",
    expiredMessage: "\u26A0 IHG rejected the request \u2014 refresh the page and try again",
    currentHotel: () => ihgHotelFromUrl(location.href),
    isHotelCode: (text) => /^[A-Z0-9]{5}$/.test(text),
    // The hotel page the user is on, or the cards on a search results page (each card's id is the code)
    pageHotels() {
      const hotels = [...document.querySelectorAll('app-hotel-card-list-view[data-testid="hotel-card"]')].filter((card) => /^[a-z0-9]{5}$/i.test(card.id)).map((card) => ({
        code: card.id.toUpperCase(),
        name: (card.querySelector(".hotel-name") ?? card.querySelector("h2"))?.textContent.replace(/\s+/g, " ").trim() || void 0
      }));
      const current = ihgHotelFromUrl(location.href);
      if (current && !hotels.some((h3) => h3.code === current)) hotels.unshift({ code: current });
      return hotels;
    },
    async suggestHotels(text) {
      const res = await fetch(`${IHG_API}/locations/v2/destinations?destination=${encodeURIComponent(text)}`, { headers: IHG_HEADERS });
      return res.ok ? ihgParseDestinations(await res.json()) : [];
    },
    // The offers search needs a stay; any near-future night lists the same hotels
    async hotelsAt(ref) {
      const start = addDays(todayISO(), 30);
      const res = await fetch(`${IHG_API}/availability/v3/hotels/offers?fieldset=summary`, {
        method: "POST",
        headers: { ...IHG_HEADERS, "content-type": "application/json; charset=UTF-8" },
        credentials: "include",
        body: JSON.stringify({
          startDate: start,
          endDate: addDays(start, 1),
          hotelMnemonics: null,
          rates: { ratePlanCodes: [{ internal: "IVANI" }] },
          products: [{ productCode: "SR", guestCounts: [{ otaCode: "AQC10", count: 1 }], quantity: 1 }],
          options: { disabilityMode: "ACCESSIBLE_AND_NON_ACCESSIBLE" },
          geoLocation: [{ latitude: ref.lat, longitude: ref.lng, radius: NEARBY_RADIUS_MI, uom: "MI" }]
        })
      });
      if (!res.ok) throw new Error(`IHG ${res.status}`);
      return ihgParseNearby(await res.json(), ref);
    },
    async hotelName(code) {
      const res = await fetch(`${IHG_API}/hotels/v3/profiles/${code}/details?fieldset=brandInfo,profile`, { headers: IHG_HEADERS });
      if (!res.ok) return null;
      const h3 = (await res.json())?.hotelContent?.[0];
      const name = h3?.profile?.name?.[0]?.value;
      return h3?.profile?.gdsName?.replace(/ by IHG$/, "") ?? (name && [h3.brandInfo?.brandName, name].filter(Boolean).join(" ")) ?? null;
    },
    async onHotelSearch(params) {
      await sleep(IHG_DELAY_MS);
      const res = await fetch(`${IHG_API}/availability/v1/calendar`, {
        method: "POST",
        headers: { ...IHG_HEADERS, "content-type": "application/json; charset=UTF-8" },
        credentials: "include",
        body: JSON.stringify(ihgBuildRequest(params))
      });
      if (res.status === 403) return "SESSION_EXPIRED";
      if (!res.ok) throw new Error(`IHG ${res.status}`);
      return ihgParseCalendar(await res.json());
    }
  };

  // src/programs/marriott.js
  var MARRIOTT_SIGNATURES = {
    phoenixShopADFSearchProductsByProperty: "887375892e1ad2a43f46a9c95c55ea47cf6eca3af03331c2134f1b440cff3f9f",
    phoenixShopSuggestedPlacesQuery: "70b3555c91797ca8945e4f4b1bdda42c3e37fa1f08fa99feafb73195702c1d34",
    phoenixShopSuggestedPlacesDetailsQuery: "0b89c8ea7a6a6408eaee651983d6c7ee168670b727cc5beea980b2d2edfdbe2b",
    phoenixShopSearchPropertiesByGeoLocation: "bea225a1df0a1546d3f0a18ac19b5f5cfe1b94fbead7cf0624e5d5dcef28419f",
    phoenixShopPropertyInfoCall: "00f8d18ee03321350caae9366a33f51b190bc80e760eb3d586260f31b902e843"
  };
  var MARRIOTT_QUERIES = {
    phoenixShopADFSearchProductsByProperty: `query phoenixShopADFSearchProductsByProperty($search: CalendarSearchByPropertyInput!, $id: [ID!]!) {
  search { calendarSearchByProperty(search: $search) { edges { node { startDate rateModes { pointsPerQuantity { points } } } } } }
}`,
    phoenixShopSuggestedPlacesQuery: `query phoenixShopSuggestedPlacesQuery($query: String!) {
  suggestedPlaces(query: $query) { edges { node { placeId primaryDescription secondaryDescription } } }
}`,
    phoenixShopSuggestedPlacesDetailsQuery: `query phoenixShopSuggestedPlacesDetailsQuery($placeId: ID!) {
  suggestedPlaceDetails(placeId: $placeId) { placeId destinationType location { latitude longitude } }
}`,
    phoenixShopSearchPropertiesByGeoLocation: `query phoenixShopSearchPropertiesByGeoLocation($search: SearchPropertiesByGeolocationInput!, $sort: SearchPropertiesSort, $limit: Int, $offset: Int, $filter: [PropertyDescriptionType]) {
  search { properties { searchByGeolocation(search: $search, sort: $sort, limit: $limit, offset: $offset) { edges { distance node { id basicInformation { name } } } } } }
}`,
    phoenixShopPropertyInfoCall: `query phoenixShopPropertyInfoCall($propertyId: ID!) {
  property(id: $propertyId) { id basicInformation { name } }
}`
  };
  var MARRIOTT_DELAY_MS = 600;
  var NEARBY_RADIUS_M = 80467;
  var NEARBY_MAX2 = 30;
  var SAME_PLACE_M = 150;
  var CODE_RE = /^[A-Z0-9]{5}$/;
  async function marriottQuery(operationName, variables) {
    const res = await fetch(`/mi/query/${operationName}`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "content-type": "application/json",
        "apollographql-client-name": "phoenix_shop",
        "apollographql-client-version": "v1",
        "application-name": "shop",
        "graphql-operation-name": operationName,
        "graphql-operation-signature": MARRIOTT_SIGNATURES[operationName],
        "graphql-require-safelisting": "true"
      },
      credentials: "include",
      body: JSON.stringify({ operationName, variables, query: MARRIOTT_QUERIES[operationName] })
    });
    if (res.status === 403 || res.status === 429) return "SESSION_EXPIRED";
    if (!res.ok) throw new Error(`Marriott ${res.status}`);
    const data = await res.json();
    if (data?.errors?.length && !data.data) throw new Error(`Marriott: ${data.errors[0].message}`);
    return data;
  }
  function marriottCalendarVariables({ hotel, start, end }) {
    return {
      id: [hotel],
      search: {
        propertyId: hotel,
        options: {
          startDate: start,
          endDate: end,
          numberOfRooms: 1,
          numberOfDays: 1,
          numberInParty: 1,
          rateRequestTypes: [{ type: "REDEMPTION" }]
        }
      }
    };
  }
  var marriottBookUrl = (hotel) => `https://www.marriott.com/search/availabilityCalendar.mi?propertyCode=${hotel}&isRateCalendar=true&isSearch=true`;
  function marriottParseCalendar(data, hotel) {
    const results = [];
    for (const edge of data?.data?.search?.calendarSearchByProperty?.edges ?? []) {
      const node = edge?.node;
      const points = node?.rateModes?.pointsPerQuantity?.points;
      if (!node?.startDate || !(points > 0)) continue;
      results.push({ date: node.startDate, hotel, points, bookUrl: marriottBookUrl(hotel) });
    }
    return results;
  }
  function marriottHotelFromUrl(url) {
    const u4 = new URL(url);
    const code = u4.searchParams.get("propertyCode") ?? u4.searchParams.get("marshaCode") ?? u4.pathname.match(/\/hotels\/(?:travel\/)?([a-z0-9]{5})(?:-|\/|$)/i)?.[1];
    return code && CODE_RE.test(code.toUpperCase()) ? code.toUpperCase() : null;
  }
  function marriottPageHotels(doc, url) {
    const hotels = [];
    const push = (code, name) => {
      code = code?.toUpperCase();
      if (code && CODE_RE.test(code) && !hotels.some((h3) => h3.code === code)) hotels.push({ code, name: name?.replace(/\s+/g, " ").trim() || void 0 });
    };
    for (const card of doc.querySelectorAll(".property-card[data-marsha]")) {
      let name;
      try {
        name = JSON.parse(card.getAttribute("data-property") ?? "{}").hotelName;
      } catch {
      }
      push(card.getAttribute("data-marsha"), name ?? card.querySelector(".property-card-title, h2, h3")?.textContent);
    }
    for (const card of doc.querySelectorAll(".HotelCardContainer")) {
      const href = card.querySelector('a[href*="propertyCode="]')?.getAttribute("href");
      const code = href && new URL(href, "https://www.marriott.com").searchParams.get("propertyCode");
      push(code, card.querySelector(".HotelCard__top-section_title")?.textContent);
    }
    const current = marriottHotelFromUrl(url);
    if (current && !hotels.some((h3) => h3.code === current)) hotels.unshift({ code: current, name: doc.querySelector(".hotel-name")?.textContent.replace(/\s+/g, " ").trim() || void 0 });
    return hotels;
  }
  function marriottParseSuggestions(data) {
    return (data?.data?.suggestedPlaces?.edges ?? []).map((e3) => e3?.node).filter((n2) => n2?.placeId && n2.primaryDescription).map((n2) => ({
      label: n2.primaryDescription,
      sub: n2.secondaryDescription || void 0,
      ref: { placeId: n2.placeId, label: n2.primaryDescription }
    }));
  }
  function marriottParseNearby(data, place2) {
    const hotels = (data?.data?.search?.properties?.searchByGeolocation?.edges ?? []).filter((e3) => e3?.node?.id && CODE_RE.test(e3.node.id.toUpperCase())).map((e3) => ({ code: e3.node.id.toUpperCase(), name: e3.node.basicInformation?.name || void 0, distance: e3.distance })).sort((a3, b2) => (a3.distance ?? Infinity) - (b2.distance ?? Infinity));
    const first = hotels[0];
    if (first && place2?.destinationType === "Hotel Name" && first.distance < SAME_PLACE_M) {
      return { exact: { code: first.code, name: first.name }, nearby: [] };
    }
    return {
      nearby: hotels.slice(0, NEARBY_MAX2).map((h3) => ({
        code: h3.code,
        name: h3.name,
        sub: h3.distance != null ? `${(h3.distance / 1e3).toFixed(1)} km` : void 0
      }))
    };
  }
  var marriottProgram = {
    id: "marriott",
    kind: "hotel",
    name: "Marriott",
    color: "#1C1C1C",
    matches: ["www.marriott.com"],
    requiresSession: false,
    hotelPlaceholder: "Hotel name, city, airport or code",
    expiredMessage: "\u26A0 Marriott blocked the request \u2014 refresh the page and try again",
    currentHotel: () => marriottHotelFromUrl(location.href),
    isHotelCode: (text) => CODE_RE.test(text),
    pageHotels: () => marriottPageHotels(document, location.href),
    async suggestHotels(text) {
      const data = await marriottQuery("phoenixShopSuggestedPlacesQuery", { query: text });
      return data === "SESSION_EXPIRED" ? [] : marriottParseSuggestions(data);
    },
    async hotelsAt(ref) {
      const details = await marriottQuery("phoenixShopSuggestedPlacesDetailsQuery", { placeId: ref.placeId });
      if (details === "SESSION_EXPIRED") throw new Error("Marriott blocked the request");
      const place2 = details?.data?.suggestedPlaceDetails;
      const { latitude, longitude } = place2?.location ?? {};
      if (latitude == null || longitude == null) return { nearby: [] };
      const data = await marriottQuery("phoenixShopSearchPropertiesByGeoLocation", {
        search: { latitude, longitude, distance: NEARBY_RADIUS_M },
        limit: NEARBY_MAX2 * 2,
        offset: 0
      });
      if (data === "SESSION_EXPIRED") throw new Error("Marriott blocked the request");
      return marriottParseNearby(data, place2);
    },
    async hotelName(code) {
      const data = await marriottQuery("phoenixShopPropertyInfoCall", { propertyId: code });
      return data === "SESSION_EXPIRED" ? null : data?.data?.property?.basicInformation?.name ?? null;
    },
    async onHotelSearch(params) {
      await sleep(MARRIOTT_DELAY_MS);
      const data = await marriottQuery("phoenixShopADFSearchProductsByProperty", marriottCalendarVariables(params));
      return data === "SESSION_EXPIRED" ? data : marriottParseCalendar(data, params.hotel);
    }
  };

  // src/programs/hilton.js
  var HILTON_GRAPHQL = "/graphql/customer";
  var HILTON_QUERIES = {
    hotel_shopAvailOptions_shopCalendarPropAvail: `query hotel_shopAvailOptions_shopCalendarPropAvail($arrivalDate: String!, $ctyhocn: String!, $language: String!, $guestLocationCountry: String, $numAdults: Int!, $numChildren: Int!, $numRooms: Int!, $displayCurrency: String, $lengthOfStay: Int!, $specialRates: ShopSpecialRateInput) {
  hotel(ctyhocn: $ctyhocn, language: $language) {
    ctyhocn
    shopCalendarAvail(input: {guestLocationCountry: $guestLocationCountry, arrivalDate: $arrivalDate, displayCurrency: $displayCurrency, numAdults: $numAdults, numChildren: $numChildren, numRooms: $numRooms, lengthOfStay: $lengthOfStay, displayRateType: average, specialRates: $specialRates}) {
      calendars { arrivalDate roomRate { dailyRmPointsRate numRoomsAvail ratePlan { ratePlanName } } }
    }
  }
}`,
    geocode_hotelSummaryOptions: `query geocode_hotelSummaryOptions($address: String, $distanceUnit: HotelDistanceUnit, $language: String!, $placeId: String, $queryLimit: Int!, $sessionToken: String) {
  geocode(language: $language, address: $address, placeId: $placeId, sessionToken: $sessionToken) {
    match { id type }
    hotelSummaryOptions(distanceUnit: $distanceUnit, sortBy: distance) { hotels(first: $queryLimit) { ctyhocn name distance } }
  }
}`,
    hotel: `query hotel($ctyhocn: String!, $language: String!) {
  hotel(ctyhocn: $ctyhocn, language: $language) { ctyhocn name }
}`
  };
  var HILTON_DELAY_MS = 600;
  var NEARBY_MAX3 = 30;
  var CODE_RE2 = /^[A-Z]{7}$/;
  async function hiltonQuery(operationName, variables) {
    const res = await fetch(`${HILTON_GRAPHQL}?appName=dx-res-ui&operationName=${operationName}&bl=en`, {
      method: "POST",
      headers: { accept: "*/*", "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ operationName, variables, query: HILTON_QUERIES[operationName] })
    });
    if (res.status === 403 || res.status === 429) return "SESSION_EXPIRED";
    if (!res.ok) throw new Error(`Hilton ${res.status}`);
    const data = await res.json();
    if (data?.errors?.length && !data.data) throw new Error(`Hilton: ${data.errors[0].message}`);
    return data;
  }
  function hiltonCalendarVariables({ hotel, start }) {
    return {
      arrivalDate: start,
      ctyhocn: hotel,
      language: "en",
      guestLocationCountry: "US",
      lengthOfStay: 1,
      numAdults: 1,
      numChildren: 0,
      numRooms: 1,
      displayCurrency: null,
      specialRates: { hhonors: true }
    };
  }
  var hiltonBookUrl = (hotel, date, nextDate) => `https://www.hilton.com/en/book/reservation/rooms/?ctyhocn=${hotel}&arrivalDate=${date}&departureDate=${nextDate}&room1NumAdults=1&redeemPts=true`;
  var nextDay = (date) => {
    const d3 = /* @__PURE__ */ new Date(`${date}T00:00:00Z`);
    d3.setUTCDate(d3.getUTCDate() + 1);
    return d3.toISOString().slice(0, 10);
  };
  var rateTypeOf = (name) => /premium/i.test(name ?? "") ? "Premium" : /standard/i.test(name ?? "") ? "Standard" : void 0;
  function hiltonParseCalendar(data, { hotel, start, end }) {
    const results = [];
    for (const day of data?.data?.hotel?.shopCalendarAvail?.calendars ?? []) {
      const date = day?.arrivalDate;
      const rate = day?.roomRate;
      const points = rate?.dailyRmPointsRate;
      if (!date || date < start || date > end || !(points > 0)) continue;
      results.push({
        date,
        hotel,
        points,
        room: rate.ratePlan?.ratePlanName || void 0,
        rateType: rateTypeOf(rate.ratePlan?.ratePlanName),
        roomsLeft: rate.numRoomsAvail ?? void 0,
        bookUrl: hiltonBookUrl(hotel, date, nextDay(date))
      });
    }
    return results;
  }
  function hiltonHotelFromUrl(url) {
    const u4 = new URL(url);
    const code = u4.searchParams.get("ctyhocn") ?? u4.pathname.match(/\/hotels\/([a-z]{7})(?:-|\/|$)/i)?.[1];
    return code && CODE_RE2.test(code.toUpperCase()) ? code.toUpperCase() : null;
  }
  function hiltonPageHotels(doc, url) {
    const hotels = [];
    for (const card of doc.querySelectorAll('li[data-testid^="hotel-card-"]')) {
      const code = card.getAttribute("data-testid").slice("hotel-card-".length).toUpperCase();
      if (!CODE_RE2.test(code) || hotels.some((h3) => h3.code === code)) continue;
      hotels.push({ code, name: card.querySelector("h3")?.textContent.replace(/\s+/g, " ").trim() || void 0 });
    }
    const current = hiltonHotelFromUrl(url);
    if (current && !hotels.some((h3) => h3.code === current)) hotels.unshift({ code: current });
    return hotels;
  }
  function hiltonParseSuggestions(data) {
    return (data?.predictions ?? []).filter((p3) => p3?.structured_formatting?.main_text).map((p3) => {
      const label = p3.structured_formatting.main_text;
      const code = p3.place_id?.match(/^dx-hotel::([a-z]{7})$/i)?.[1]?.toUpperCase();
      return {
        label,
        sub: p3.type === "airport" ? ["Airport", p3.structured_formatting.secondary_text].filter(Boolean).join(" \xB7 ") : p3.structured_formatting.secondary_text || void 0,
        ref: code ? { code, label } : { placeId: p3.place_id ?? null, address: p3.description ?? label, label }
      };
    });
  }
  function hiltonParseNearby(data) {
    const hotels = (data?.data?.geocode?.hotelSummaryOptions?.hotels ?? []).filter((h3) => h3?.ctyhocn && CODE_RE2.test(h3.ctyhocn.toUpperCase())).sort((a3, b2) => (a3.distance ?? Infinity) - (b2.distance ?? Infinity));
    return {
      nearby: hotels.slice(0, NEARBY_MAX3).map((h3) => ({
        code: h3.ctyhocn.toUpperCase(),
        name: h3.name || void 0,
        sub: h3.distance != null ? `${h3.distance.toFixed(1)} km` : void 0
      }))
    };
  }
  var hiltonProgram = {
    id: "hilton",
    kind: "hotel",
    name: "Hilton",
    color: "#104C97",
    matches: ["www.hilton.com"],
    requiresSession: false,
    hotelPlaceholder: "Hotel name, city, airport or code",
    expiredMessage: "\u26A0 Hilton blocked the request \u2014 refresh the page and try again",
    currentHotel: () => hiltonHotelFromUrl(location.href),
    isHotelCode: (text) => CODE_RE2.test(text),
    pageHotels: () => hiltonPageHotels(document, location.href),
    async suggestHotels(text) {
      const res = await fetch(`/dx-customer/autocomplete?input=${encodeURIComponent(text)}&language=en`, {
        headers: { "dx-map-session-token": crypto.randomUUID() },
        credentials: "include"
      });
      return res.ok ? hiltonParseSuggestions(await res.json()) : [];
    },
    // A hotel suggestion already has its code; any other place lists what's around it
    async hotelsAt(ref) {
      if (ref.code) return { exact: { code: ref.code, name: ref.label }, nearby: [] };
      const data = await hiltonQuery("geocode_hotelSummaryOptions", {
        address: ref.address,
        placeId: ref.placeId,
        language: "en",
        distanceUnit: "km",
        queryLimit: NEARBY_MAX3
      });
      if (data === "SESSION_EXPIRED") throw new Error("Hilton blocked the request");
      return hiltonParseNearby(data);
    },
    async hotelName(code) {
      const data = await hiltonQuery("hotel", { ctyhocn: code, language: "en" });
      return data === "SESSION_EXPIRED" ? null : data?.data?.hotel?.name ?? null;
    },
    async onHotelSearch(params) {
      await sleep(HILTON_DELAY_MS);
      const data = await hiltonQuery("hotel_shopAvailOptions_shopCalendarPropAvail", hiltonCalendarVariables(params));
      return data === "SESSION_EXPIRED" ? data : hiltonParseCalendar(data, params);
    }
  };

  // src/programs/hyatt.js
  var HYATT_DELAY_MS = 600;
  var NEARBY_RADIUS_KM = 80;
  var NEARBY_MAX4 = 30;
  var CODE_RE3 = /^[A-Z0-9]{5}$/;
  var ROOM_TYPES = {
    STANDARD_ROOM: "Standard Room",
    CLUB: "Club Access",
    STANDARD_SUITE: "Standard Suite",
    PREMIUM_SUITE: "Premium Suite"
  };
  var PEAK_LEVELS = {
    SUPER_OFF_PEAK: "Super off-peak",
    OFF_PEAK: "Off-peak",
    STANDARD: "Standard",
    PEAK: "Peak",
    SUPER_PEAK: "Super peak"
  };
  async function hyattGet(path) {
    const res = await fetch(path, { headers: { accept: "application/json" }, credentials: "include", redirect: "manual" });
    if (res.type === "opaqueredirect" || res.status === 403 || res.status === 429) return "SESSION_EXPIRED";
    if (!res.ok) throw new Error(`Hyatt ${res.status}`);
    return res.json();
  }
  var hyattCalendarUrl = ({ hotel, start, end }) => `/explore-hotels/service/avail/days?spiritCode=${hotel.toLowerCase()}&startDate=${start}&endDate=${end}&numAdults=1&numChildren=0&roomQuantity=1&los=1&isMock=false`;
  var hyattBookUrl = (hotel, date, nextDate) => `https://www.hyatt.com/shop/rooms/${hotel}?checkinDate=${date}&checkoutDate=${nextDate}&rooms=1&adults=1&kids=0&rateFilter=woh`;
  var nextDay2 = (date) => {
    const d3 = /* @__PURE__ */ new Date(`${date}T00:00:00Z`);
    d3.setUTCDate(d3.getUTCDate() + 1);
    return d3.toISOString().slice(0, 10);
  };
  function hyattParseCalendar(data, { hotel, start, end }) {
    const results = [];
    for (const [date, rooms] of Object.entries(data?.days ?? {})) {
      if (date < start || date > end) continue;
      for (const [type, rate] of Object.entries(rooms ?? {})) {
        const points = rate?.pointsValue?.[0];
        if (!(points > 0)) continue;
        const level = PEAK_LEVELS[rate.pointsLevel];
        const room = ROOM_TYPES[type] ?? type;
        results.push({ date, hotel, points, room: level ? `${room} \xB7 ${level}` : room, roomType: room, bookUrl: hyattBookUrl(hotel, date, nextDay2(date)) });
      }
    }
    return results.sort((a3, b2) => a3.date.localeCompare(b2.date) || a3.points - b2.points);
  }
  function hyattHotelFromUrl(url) {
    const u4 = new URL(url);
    const code = u4.searchParams.get("spiritCode") ?? u4.pathname.match(/^\/shop\/(?:rooms\/)?([a-z0-9]{5})(?:\/|$)/i)?.[1] ?? u4.pathname.match(/^\/[a-z-]+\/(?:[a-z]{2}-[A-Z]{2}\/)?([a-z0-9]{5})-[a-z0-9-]+\/?/i)?.[1];
    return code && CODE_RE3.test(code.toUpperCase()) ? code.toUpperCase() : null;
  }
  function hyattPageHotels(doc, url) {
    const hotels = [];
    for (const card of doc.querySelectorAll('div[data-js="hotel-card"][data-spirit-code]')) {
      const raw = card.getAttribute("data-spirit-code");
      const code = raw.toUpperCase();
      if (!CODE_RE3.test(code) || hotels.some((h3) => h3.code === code)) continue;
      const name = card.querySelector(`[id="map-result-card-title-${raw}"]`)?.textContent.replace(/\s+/g, " ").trim();
      hotels.push({ code, name: name || void 0 });
    }
    const current = hyattHotelFromUrl(url);
    if (current && !hotels.some((h3) => h3.code === current)) hotels.unshift({ code: current });
    return hotels;
  }
  function hyattParseSuggestions(data) {
    const hotels = (data?.properties ?? []).filter((p3) => p3?.spiritCode && CODE_RE3.test(p3.spiritCode.toUpperCase())).map((p3) => {
      const code = p3.spiritCode.toUpperCase();
      return { label: p3.label, sub: code, ref: { code, label: p3.label } };
    });
    const cities = (data?.cities ?? []).filter((c3) => c3?.label).map((c3) => ({
      label: c3.city || c3.label,
      sub: [c3.province, c3.country].filter(Boolean).join(", ") || void 0,
      ref: { place: c3.label, label: c3.label }
    }));
    const places = (data?.suggestions ?? []).filter((s3) => s3?.label).map((s3) => ({
      label: s3.label,
      sub: s3.types?.includes("airport") ? "Airport" : void 0,
      ref: { place: s3.label, label: s3.label }
    }));
    return [...cities, ...places, ...hotels];
  }
  function hyattParseCenter(html) {
    const cp = String(html ?? "").replace(/\\"/g, '"').match(/"centerPoint":\{[^}]*\}/)?.[0];
    const lat = +cp?.match(/"latitude":(-?[\d.]+)/)?.[1];
    const lon = +cp?.match(/"longitude":(-?[\d.]+)/)?.[1];
    return Number.isFinite(lat) && Number.isFinite(lon) && cp ? { lat, lon } : null;
  }
  function hyattNearby(directory3, { lat, lon }) {
    const rad = Math.PI / 180;
    const km = (lat2, lon2) => {
      const x2 = Math.sin((lat2 - lat) * rad / 2) ** 2 + Math.cos(lat * rad) * Math.cos(lat2 * rad) * Math.sin((lon2 - lon) * rad / 2) ** 2;
      return 12742 * Math.asin(Math.sqrt(x2));
    };
    const hotels = [];
    for (const h3 of Object.values(directory3 ?? {})) {
      const g2 = h3?.location?.geolocation;
      const code = h3?.spiritCode?.toUpperCase();
      if (!code || !CODE_RE3.test(code) || g2?.latitude == null || g2?.longitude == null) continue;
      if (h3.booking?.isExternal || h3.openStatus?.key === "NOT_BOOKABLE" || h3.openStatus === "NOT_BOOKABLE") continue;
      const d3 = km(g2.latitude, g2.longitude);
      if (d3 <= NEARBY_RADIUS_KM) hotels.push({ code, name: h3.name || void 0, d: d3, category: h3.awardCategory?.label });
    }
    hotels.sort((a3, b2) => a3.d - b2.d);
    return hotels.slice(0, NEARBY_MAX4).map((h3) => ({
      code: h3.code,
      name: h3.name,
      sub: [`${h3.d.toFixed(1)} km`, h3.category && `Category ${h3.category}`].filter(Boolean).join(" \xB7 ")
    }));
  }
  var directory;
  function hyattDirectory() {
    directory ?? (directory = hyattGet("/explore-hotels/service/hotels").then((d3) => {
      if (d3 === "SESSION_EXPIRED" || !d3 || typeof d3 !== "object") throw new Error("Hyatt blocked the request");
      return d3;
    }));
    return directory.catch((err) => {
      directory = void 0;
      throw err;
    });
  }
  var hyattProgram = {
    id: "hyatt",
    kind: "hotel",
    name: "Hyatt",
    color: "#0D2D52",
    matches: ["www.hyatt.com"],
    requiresSession: false,
    hotelPlaceholder: "Hotel name, city, airport or code",
    expiredMessage: "\u26A0 Hyatt blocked the request \u2014 refresh the page and try again",
    currentHotel: () => hyattHotelFromUrl(location.href),
    isHotelCode: (text) => CODE_RE3.test(text),
    pageHotels: () => hyattPageHotels(document, location.href),
    async suggestHotels(text) {
      const res = await fetch(`/quickbook/autocomplete?query=${encodeURIComponent(text)}&locale=en-US&includeGoogleSuggestions=true`, { credentials: "include" });
      return res.ok ? hyattParseSuggestions(await res.json()) : [];
    },
    // A hotel suggestion already has its code; any other place lists the hotels around it
    async hotelsAt(ref) {
      if (ref.code) return { exact: { code: ref.code, name: ref.label }, nearby: [] };
      const [res, dir] = await Promise.all([
        fetch(`/search/hotels/en-US/${encodeURIComponent(ref.place)}`, { credentials: "include" }),
        hyattDirectory()
      ]);
      if (!res.ok) throw new Error(`Hyatt ${res.status}`);
      const center = hyattParseCenter(await res.text());
      return { nearby: center ? hyattNearby(dir, center) : [] };
    },
    async hotelName(code) {
      return (await hyattDirectory())[code.toLowerCase()]?.name ?? null;
    },
    async onHotelSearch(params) {
      await sleep(HYATT_DELAY_MS);
      const data = await hyattGet(hyattCalendarUrl(params));
      return data === "SESSION_EXPIRED" ? data : hyattParseCalendar(data, params);
    }
  };

  // src/programs/choice.js
  var CHOICE_GRAPHQL = "/dxapi/graphql";
  var CHOICE_QUERIES = {
    GetHotelCalendarRates: `query GetHotelCalendarRates($hotelCode: String!, $startDate: String!, $endDate: String!, $adults: Int!, $minors: Int!, $ratePlanCodes: [String!], $currencyCode: String!) {
  getHotelAvailabilityCalendarRates(hotelCode: $hotelCode, startDate: $startDate, endDate: $endDate, adults: $adults, minors: $minors, ratePlanCodes: $ratePlanCodes, currencyCode: $currencyCode) {
    calendarRates { startDate points availableForSale }
  }
}`,
    SearchAutoSuggestions: `query SearchAutoSuggestions($searchTerm: String!, $limit: Int) {
  searchPoisByTerm(searchTerm: $searchTerm, limit: $limit) { placeId placeType displayName }
}`,
    SearchPoisByPlaceId: `query SearchPoisByPlaceId($placeId: String!) {
  searchPoisByPlaceId(placeId: $placeId) { placeType latitude longitude }
}`,
    SearchHotelsByGeoLocation: `query SearchHotelsByGeoLocation($latitude: Float!, $longitude: Float!, $radius: Int) {
  searchHotelsByGeoLocation(latitude: $latitude, longitude: $longitude, radius: $radius) {
    code details { name status geoLocation { latitude longitude } }
  }
}`,
    FetchHotelSummary: `query FetchHotelSummary($hotelIds: [String!]!) {
  fetchHotelSummary(hotelIds: $hotelIds) { code name }
}`
  };
  var CHOICE_DELAY_MS = 600;
  var NEARBY_RADIUS_MI2 = 30;
  var NEARBY_MAX5 = 30;
  var SAME_PLACE_KM2 = 0.15;
  var REWARD_RATE_PLAN = "SRD";
  var CODE_RE4 = /^[A-Z]{2}[A-Z0-9]{3}$/;
  async function choiceQuery(operationName, variables) {
    const res = await fetch(`${CHOICE_GRAPHQL}?q=${operationName}`, {
      method: "POST",
      headers: { accept: "*/*", "content-type": "application/json", "dxapi-context": "locale:en-us,platform:desktop,sitename:us" },
      credentials: "include",
      body: JSON.stringify({ operationName, variables, query: CHOICE_QUERIES[operationName] })
    });
    if (res.status === 403 || res.status === 429) return "SESSION_EXPIRED";
    const data = await res.json().catch(() => null);
    if (choiceUnknownHotel(data)) return data;
    if (!res.ok) throw new Error(`Choice ${res.status}`);
    if (data?.errors?.length && !data.data) throw new Error(`Choice: ${data.errors[0].message}`);
    return data;
  }
  var choiceUnknownHotel = (data) => !!data?.errors?.some((e3) => /NONEXISTENT_HOTEL/.test(e3?.message));
  function choiceCalendarVariables({ hotel, start, end }) {
    return {
      hotelCode: hotel,
      startDate: start,
      endDate: end,
      adults: 1,
      minors: 0,
      ratePlanCodes: [REWARD_RATE_PLAN],
      currencyCode: "HOTEL_DEFAULT_CURRENCY"
    };
  }
  var choiceBookUrl = (hotel, date, nextDate) => `https://www.choicehotels.com/hotel/${hotel.toLowerCase()}?checkInDate=${date}&checkOutDate=${nextDate}&ratePlanCode=${REWARD_RATE_PLAN}`;
  var nextDay3 = (date) => {
    const d3 = /* @__PURE__ */ new Date(`${date}T00:00:00Z`);
    d3.setUTCDate(d3.getUTCDate() + 1);
    return d3.toISOString().slice(0, 10);
  };
  function choiceParseCalendar(data, { hotel, start, end }) {
    const results = [];
    for (const rate of data?.data?.getHotelAvailabilityCalendarRates?.calendarRates ?? []) {
      const date = rate?.startDate;
      if (!date || date < start || date > end || !rate.availableForSale || !(rate.points > 0)) continue;
      results.push({ date, hotel, points: rate.points, bookUrl: choiceBookUrl(hotel, date, nextDay3(date)) });
    }
    return results.sort((a3, b2) => a3.date.localeCompare(b2.date));
  }
  function choiceHotelFromUrl(url) {
    const u4 = new URL(url);
    const code = u4.pathname.match(/\/(?:hotel|[a-z0-9-]+-hotels)\/([a-z0-9]{5})\/?$/i)?.[1]?.toUpperCase();
    return code && CODE_RE4.test(code) ? code : null;
  }
  function choicePageHotels(doc, url) {
    const hotels = [];
    for (const el of doc.querySelectorAll('[id^="search-page-list-card-property-name_"]')) {
      const code = el.id.split("_").pop().toUpperCase();
      if (!CODE_RE4.test(code) || hotels.some((h3) => h3.code === code)) continue;
      hotels.push({ code, name: el.textContent.replace(/\s+/g, " ").trim() || void 0 });
    }
    const current = choiceHotelFromUrl(url);
    if (current && !hotels.some((h3) => h3.code === current)) hotels.unshift({ code: current });
    return hotels;
  }
  function choiceParseSuggestions(data) {
    return (data?.data?.searchPoisByTerm ?? []).filter((p3) => p3?.placeId && p3.displayName).map((p3) => {
      const [label, ...rest] = p3.displayName.split(", ");
      return {
        label,
        sub: [p3.placeType === "Airport" && "Airport", rest.join(", ")].filter(Boolean).join(" \xB7 ") || void 0,
        ref: { placeId: p3.placeId, label: p3.displayName }
      };
    });
  }
  function choiceNearby(hotels, place2) {
    const { latitude: lat, longitude: lon } = place2;
    const rad = Math.PI / 180;
    const km = (lat2, lon2) => {
      const x2 = Math.sin((lat2 - lat) * rad / 2) ** 2 + Math.cos(lat * rad) * Math.cos(lat2 * rad) * Math.sin((lon2 - lon) * rad / 2) ** 2;
      return 12742 * Math.asin(Math.sqrt(x2));
    };
    const list = [];
    for (const h3 of hotels ?? []) {
      const code = h3?.code?.toUpperCase();
      const g2 = h3?.details?.geoLocation;
      if (!code || !CODE_RE4.test(code) || g2?.latitude == null || g2?.longitude == null) continue;
      if (h3.details.status && h3.details.status !== "ACTIVE") continue;
      list.push({ code, name: h3.details.name || void 0, d: km(g2.latitude, g2.longitude) });
    }
    list.sort((a3, b2) => a3.d - b2.d);
    const first = list[0];
    if (first && place2.placeType !== "Airport" && first.d < SAME_PLACE_KM2) return { exact: { code: first.code, name: first.name }, nearby: [] };
    return { nearby: list.slice(0, NEARBY_MAX5).map((h3) => ({ code: h3.code, name: h3.name, sub: `${h3.d.toFixed(1)} km` })) };
  }
  var choiceProgram = {
    id: "choice",
    kind: "hotel",
    name: "Choice",
    color: "#0070BA",
    matches: ["www.choicehotels.com"],
    requiresSession: false,
    hotelPlaceholder: "Hotel name, city, airport or code",
    expiredMessage: "\u26A0 Choice blocked the request \u2014 refresh the page and try again",
    currentHotel: () => choiceHotelFromUrl(location.href),
    isHotelCode: (text) => CODE_RE4.test(text),
    pageHotels: () => choicePageHotels(document, location.href),
    async suggestHotels(text) {
      const data = await choiceQuery("SearchAutoSuggestions", { searchTerm: text, limit: 8 });
      return data === "SESSION_EXPIRED" ? [] : choiceParseSuggestions(data);
    },
    async hotelsAt(ref) {
      const poi = await choiceQuery("SearchPoisByPlaceId", { placeId: ref.placeId });
      if (poi === "SESSION_EXPIRED") throw new Error("Choice blocked the request");
      const place2 = poi?.data?.searchPoisByPlaceId?.[0];
      if (place2?.latitude == null || place2?.longitude == null) return { nearby: [] };
      const data = await choiceQuery("SearchHotelsByGeoLocation", { latitude: place2.latitude, longitude: place2.longitude, radius: NEARBY_RADIUS_MI2 });
      if (data === "SESSION_EXPIRED") throw new Error("Choice blocked the request");
      return choiceNearby(data?.data?.searchHotelsByGeoLocation, place2);
    },
    async hotelName(code) {
      const data = await choiceQuery("FetchHotelSummary", { hotelIds: [code] });
      return data === "SESSION_EXPIRED" ? null : data?.data?.fetchHotelSummary?.find((h3) => h3?.code?.toUpperCase() === code)?.name ?? null;
    },
    async onHotelSearch(params) {
      await sleep(CHOICE_DELAY_MS);
      const data = await choiceQuery("GetHotelCalendarRates", choiceCalendarVariables(params));
      return data === "SESSION_EXPIRED" ? data : choiceParseCalendar(data, params);
    }
  };

  // src/programs/iprefer.js
  var PTG_API = "https://ptgapis.com";
  var IPREFER_DELAY_MS = 600;
  var CALENDAR_TTL_MS = 30 * 60 * 1e3;
  var NEARBY_RADIUS_KM2 = 80;
  var NEARBY_MAX6 = 30;
  var REGION_MAX = 100;
  var SUGGEST_MAX = 8;
  var REWARD_RATE_CODE = "IPPOINTS";
  var DIRECTORY_FIELDS = {
    field_item_code: {},
    field_display_title: {},
    field_address: { type: "address", fields: { locality: {} } },
    field_geolocation: { type: "geolocation", fields: { lat: {}, lng: {} } },
    field_state_name: {},
    field_country_name: {},
    field_i_prefer_book_with_points: {},
    entity_url: {},
    field_synxis_id: {},
    participates_in_choice_points: {},
    choice_points_value: {}
  };
  var CODE_RE5 = /^[A-Z0-9]{5}$/;
  var ipreferCalendarUrl = (hotel) => `${PTG_API}/rate-calendar/v2?propertyCode=${hotel}&adults=1&children=0&rateCode=${REWARD_RATE_CODE}`;
  var ipreferBookUrl = (path, date, nextDate) => `https://iprefer.com${path}?arrivalDate=${date}&departureDate=${nextDate}&rateType=RN`;
  var nextDay4 = (date) => {
    const d3 = /* @__PURE__ */ new Date(`${date}T00:00:00Z`);
    d3.setUTCDate(d3.getUTCDate() + 1);
    return d3.toISOString().slice(0, 10);
  };
  function ipreferParseCalendar(data, { hotel, start, end }, path) {
    const results = [];
    const days = data?.results;
    if (!days || typeof days !== "object" || Array.isArray(days)) return results;
    for (const [date, night] of Object.entries(days)) {
      if (date < start || date > end || !night?.is_available || !night.has_inventory || !night.allows_check_in) continue;
      const points = Number(night.points);
      if (!(points > 0)) continue;
      results.push({ date, hotel, points, bookUrl: path ? ipreferBookUrl(path, date, nextDay4(date)) : void 0 });
    }
    return results.sort((a3, b2) => a3.date.localeCompare(b2.date));
  }
  function ipreferParseDirectory(data) {
    const hotels = [];
    for (const p3 of Object.values(data?.properties ?? {})) {
      const code = p3?.field_item_code?.toUpperCase();
      if (!code || !CODE_RE5.test(code)) continue;
      const lat = parseFloat(p3.field_geolocation?.lat), lng = parseFloat(p3.field_geolocation?.lng);
      hotels.push({
        code,
        name: p3.field_display_title || void 0,
        city: p3.field_address?.locality || void 0,
        state: p3.field_state_name || void 0,
        country: p3.field_country_name || void 0,
        lat: Number.isFinite(lat) ? lat : void 0,
        lng: Number.isFinite(lng) ? lng : void 0,
        path: p3.entity_url?.startsWith("/") ? p3.entity_url : void 0,
        points: p3.field_i_prefer_book_with_points === "1",
        synxisId: p3.field_synxis_id || void 0,
        choicePoints: p3.participates_in_choice_points === "1" && Number(p3.choice_points_value) > 0 ? Number(p3.choice_points_value) : void 0
      });
    }
    return hotels;
  }
  var norm = (s3) => String(s3 ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  var wordMatch = (text, q2) => ` ${norm(text)}`.includes(` ${q2}`);
  var place = (h3) => [h3.city, h3.state, h3.country].filter(Boolean).join(", ");
  var bookableWithPoints = (h3) => h3.points;
  function ipreferSuggest(directory3, text, bookableIf = bookableWithPoints) {
    const q2 = norm(text);
    if (!q2) return [];
    const bookable = (directory3 ?? []).filter(bookableIf);
    const cities = /* @__PURE__ */ new Map(), regions = /* @__PURE__ */ new Map(), hotels = [];
    for (const h3 of bookable) {
      if (h3.city && wordMatch(h3.city, q2)) {
        const key = `${h3.city}|${h3.country ?? ""}`;
        if (!cities.has(key)) cities.set(key, { label: h3.city, sub: [h3.state, h3.country].filter(Boolean).join(", ") || void 0, ref: { city: h3.city, country: h3.country, label: h3.city } });
      }
      for (const [field, other] of [["state", "country"], ["country", null]]) {
        if (!h3[field] || !wordMatch(h3[field], q2)) continue;
        const key = `${field}|${h3[field]}`;
        if (!regions.has(key)) regions.set(key, { label: h3[field], sub: other && h3[other] || void 0, ref: { [field]: h3[field], label: h3[field] } });
      }
      if (h3.code === text.trim().toUpperCase() || wordMatch(h3.name, q2)) hotels.push({ label: h3.name ?? h3.code, sub: place(h3) || h3.code, ref: { code: h3.code, label: h3.name } });
    }
    return [...cities.values(), ...regions.values(), ...hotels].slice(0, SUGGEST_MAX);
  }
  function ipreferHotelsAt(directory3, ref, bookableIf = bookableWithPoints) {
    if (ref.code) return { exact: { code: ref.code, name: ref.label }, nearby: [] };
    const bookable = (directory3 ?? []).filter(bookableIf);
    if (ref.state || ref.country && !ref.city) {
      const inRegion = bookable.filter((h3) => ref.state ? h3.state === ref.state : h3.country === ref.country).sort((a3, b2) => (a3.name ?? a3.code).localeCompare(b2.name ?? b2.code));
      return { nearby: inRegion.slice(0, REGION_MAX).map((h3) => ({ code: h3.code, name: h3.name, sub: [h3.city, h3.state].filter(Boolean).join(", ") || void 0 })) };
    }
    const inCity = bookable.filter((h3) => h3.city === ref.city && h3.country === ref.country && h3.lat != null);
    if (!inCity.length) return { nearby: [] };
    const lat = inCity.reduce((s3, h3) => s3 + h3.lat, 0) / inCity.length;
    const lng = inCity.reduce((s3, h3) => s3 + h3.lng, 0) / inCity.length;
    const rad = Math.PI / 180;
    const km = (h3) => {
      const x2 = Math.sin((h3.lat - lat) * rad / 2) ** 2 + Math.cos(lat * rad) * Math.cos(h3.lat * rad) * Math.sin((h3.lng - lng) * rad / 2) ** 2;
      return 12742 * Math.asin(Math.sqrt(x2));
    };
    const near = bookable.filter((h3) => h3.lat != null && h3.lng != null).map((h3) => ({ h: h3, d: km(h3) })).filter(({ h: h3, d: d3 }) => d3 <= NEARBY_RADIUS_KM2 || inCity.includes(h3)).sort((a3, b2) => a3.d - b2.d);
    return { nearby: near.slice(0, NEARBY_MAX6).map(({ h: h3, d: d3 }) => ({ code: h3.code, name: h3.name, sub: [h3.city, `${d3.toFixed(1)} km`].filter(Boolean).join(" \xB7 ") })) };
  }
  function ipreferHotelFromPage(html, url) {
    const path = new URL(url).pathname.replace(/\/$/, "");
    if (!/^\/hotels\/[^/]+\/[^/]+$/.test(path)) return null;
    const text = String(html ?? "").replace(/\\"/g, '"');
    const esc = path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const code = text.match(new RegExp(`"title":"([A-Za-z0-9]{5}) - [^"]*","entityUrl":\\{"path":"${esc}"`))?.[1]?.toUpperCase();
    return code && CODE_RE5.test(code) ? code : null;
  }
  function ipreferPageHotels(doc, directory3, current) {
    const byName = new Map((directory3 ?? []).map((h3) => [norm(h3.name), h3]));
    const hotels = [];
    for (const el of doc.querySelectorAll(".property-card__title, .marker-popup__header")) {
      const h3 = byName.get(norm(el.textContent));
      if (h3 && !hotels.some((x2) => x2.code === h3.code)) hotels.push({ code: h3.code, name: h3.name });
    }
    if (current && !hotels.some((h3) => h3.code === current)) hotels.unshift({ code: current });
    return hotels;
  }
  var directory2;
  function ipreferDirectory() {
    directory2 ?? (directory2 = fetch(`${PTG_API}/property-search/v1?site=IPrefer`, {
      method: "POST",
      headers: { accept: "application/json", "content-type": "text/plain;charset=UTF-8" },
      body: JSON.stringify(DIRECTORY_FIELDS)
    }).then(async (res) => {
      if (!res.ok) throw new Error(`I Prefer ${res.status}`);
      const hotels = ipreferParseDirectory(await res.json());
      if (!hotels.length) throw new Error("I Prefer: no hotels");
      return hotels;
    }));
    return directory2.catch((err) => {
      directory2 = void 0;
      throw err;
    });
  }
  var calendarCache = /* @__PURE__ */ new Map();
  function ptgCalendar(url) {
    const hit = calendarCache.get(url);
    if (hit && Date.now() - hit.at < CALENDAR_TTL_MS) return hit.data;
    const data = sleep(IPREFER_DELAY_MS).then(() => fetch(url, { headers: { accept: "application/json" } })).then((res) => {
      if (res.status === 403 || res.status === 429) return "SESSION_EXPIRED";
      if (!res.ok) throw new Error(`I Prefer ${res.status}`);
      return res.json();
    });
    calendarCache.set(url, { at: Date.now(), data });
    data.then((d3) => {
      if (d3 === "SESSION_EXPIRED") calendarCache.delete(url);
    }, () => calendarCache.delete(url));
    return data;
  }
  var currentHotel = () => ipreferHotelFromPage(document.documentElement.innerHTML, location.href);
  var ipreferPointsProgram = {
    id: "iprefer",
    kind: "hotel",
    name: "I Prefer points",
    requiresSession: false,
    hotelPlaceholder: "Hotel name, city, country or code",
    expiredMessage: "\u26A0 I Prefer rejected the request \u2014 refresh the page and try again",
    currentHotel,
    isHotelCode: (text) => CODE_RE5.test(text),
    async suggestHotels(text) {
      return ipreferSuggest(await ipreferDirectory(), text);
    },
    async hotelsAt(ref) {
      return ipreferHotelsAt(ref.code ? null : await ipreferDirectory(), ref);
    },
    async hotelName(code) {
      return (await ipreferDirectory()).find((h3) => h3.code === code)?.name ?? null;
    },
    async onHotelSearch(params) {
      const [data, dir] = await Promise.all([ptgCalendar(ipreferCalendarUrl(params.hotel)), ipreferDirectory().catch(() => [])]);
      return data === "SESSION_EXPIRED" ? data : ipreferParseCalendar(data, params, dir.find((h3) => h3.code === params.hotel)?.path);
    }
  };

  // src/programs/preferred-choice.js
  var PARTNER_PAGE_URL = "https://www.choicehotels.com/ascend/preferred-hotels-partner";
  var preferredChoiceCalendarUrl = (hotel) => `${PTG_API}/rate-calendar/v2?propertyCode=${hotel}&program=CH&adults=1&children=0`;
  var preferredChoiceBookUrl = (synxisId) => `https://preferredhotels.com/choicepoints/book/hotel/${synxisId}`;
  var takesChoicePoints = (h3) => h3.choicePoints > 0;
  function preferredChoiceParseCalendar(data, { hotel, start, end }, info) {
    const results = [];
    const days = data?.results;
    if (!takesChoicePoints(info ?? {}) || !days || typeof days !== "object" || Array.isArray(days)) return results;
    const currency = data.currency_code ?? "USD";
    for (const [date, night] of Object.entries(days)) {
      if (date < start || date > end || !night?.is_available || !night.has_inventory || !night.allows_check_in) continue;
      const cash = Math.round((Number(night.tax) || 0) + (Number(night.fees) || 0));
      results.push({
        date,
        hotel,
        points: info.choicePoints,
        room: cash > 0 ? `+ ${currency === "USD" ? `$${cash}` : `${cash} ${currency}`} taxes & fees` : void 0,
        bookUrl: info.synxisId ? preferredChoiceBookUrl(info.synxisId) : void 0
      });
    }
    return results.sort((a3, b2) => a3.date.localeCompare(b2.date));
  }
  var preferredChoiceProgram = {
    id: "choice-preferred",
    kind: "hotel",
    name: "Preferred Hotels (Choice points)",
    requiresSession: false,
    hotelPlaceholder: "Hotel name, city, country or code",
    expiredMessage: "\u26A0 Preferred Hotels rejected the request \u2014 refresh the page and try again",
    isHotelCode: (text) => CODE_RE5.test(text),
    async suggestHotels(text) {
      return ipreferSuggest(await ipreferDirectory(), text, takesChoicePoints);
    },
    async hotelsAt(ref) {
      return ipreferHotelsAt(ref.code ? null : await ipreferDirectory(), ref, takesChoicePoints);
    },
    async hotelName(code) {
      return (await ipreferDirectory()).find((h3) => h3.code === code)?.name ?? null;
    },
    async onHotelSearch(params) {
      const [data, dir] = await Promise.all([ptgCalendar(preferredChoiceCalendarUrl(params.hotel)), ipreferDirectory()]);
      return data === "SESSION_EXPIRED" ? data : preferredChoiceParseCalendar(data, params, dir.find((h3) => h3.code === params.hotel));
    }
  };

  // src/programs/preferred.js
  function preferredSynxisFromUrl(url) {
    return new URL(url).pathname.match(/^\/choicepoints\/book\/hotel\/(\d+)\/?$/)?.[1] ?? null;
  }
  function preferredPageHotels(doc, directory3, url, bookableIf) {
    const bookable = (directory3 ?? []).filter(bookableIf);
    const path = new URL(url).pathname.replace(/\/$/, "");
    const synxisId = preferredSynxisFromUrl(url);
    const current = bookable.find((h3) => synxisId ? h3.synxisId === synxisId : h3.path === path)?.code;
    return ipreferPageHotels(doc, bookable, current);
  }
  var pageHotelsFor = (bookableIf) => async () => preferredPageHotels(document, await ipreferDirectory(), location.href, bookableIf);
  var ipreferMode = { ...ipreferPointsProgram, pageHotels: pageHotelsFor(bookableWithPoints) };
  var choiceMode = { ...preferredChoiceProgram, currentHotel: ipreferPointsProgram.currentHotel, pageHotels: pageHotelsFor(takesChoicePoints) };
  var ipreferProgram = {
    ...ipreferMode,
    id: "preferred",
    name: "I Prefer",
    color: "#1B2A3A",
    matchHost: (h3) => h3 === "iprefer.com" || h3 === "preferredhotels.com",
    modes: [
      { code: "iprefer", name: "I Prefer points", program: ipreferMode },
      {
        code: "choice",
        name: "Choice Privileges points",
        program: choiceMode,
        tip: "Booking needs your Choice Privileges login: enter the portal from Start booking on the partner page, then the Book links open the hotel on preferredhotels.com (pick the dates there).",
        tipLink: { url: PARTNER_PAGE_URL, text: "Partner page \u2197" }
      }
    ],
    // The Choice points portal lives under /choicepoints
    pageMode: () => location.pathname.startsWith("/choicepoints") ? "choice" : null
  };

  // src/entrypoint.js
  var ALL_PROGRAMS = [asProgram, lifemilesProgram, cxProgram, brProgram, jxProgram, fbProgram, jalProgram, anaProgram, acProgram, aaProgram, ihgProgram, marriottProgram, hiltonProgram, hyattProgram, choiceProgram, ipreferProgram];
  var program = ALL_PROGRAMS.find((p3) => p3.matchHost?.(location.hostname) ?? p3.matches.includes(location.hostname));
  if (program) {
    if (document.body) mountPanel(program);
    else document.addEventListener("DOMContentLoaded", () => mountPanel(program));
  }
})();
