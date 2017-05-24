(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
!function() {
    'use strict';
    function VNode() {}
    function h(nodeName, attributes) {
        var lastSimple, child, simple, i, children = EMPTY_CHILDREN;
        for (i = arguments.length; i-- > 2; ) stack.push(arguments[i]);
        if (attributes && null != attributes.children) {
            if (!stack.length) stack.push(attributes.children);
            delete attributes.children;
        }
        while (stack.length) if ((child = stack.pop()) && void 0 !== child.pop) for (i = child.length; i--; ) stack.push(child[i]); else {
            if (child === !0 || child === !1) child = null;
            if (simple = 'function' != typeof nodeName) if (null == child) child = ''; else if ('number' == typeof child) child = String(child); else if ('string' != typeof child) simple = !1;
            if (simple && lastSimple) children[children.length - 1] += child; else if (children === EMPTY_CHILDREN) children = [ child ]; else children.push(child);
            lastSimple = simple;
        }
        var p = new VNode();
        p.nodeName = nodeName;
        p.children = children;
        p.attributes = null == attributes ? void 0 : attributes;
        p.key = null == attributes ? void 0 : attributes.key;
        if (void 0 !== options.vnode) options.vnode(p);
        return p;
    }
    function extend(obj, props) {
        for (var i in props) obj[i] = props[i];
        return obj;
    }
    function cloneElement(vnode, props) {
        return h(vnode.nodeName, extend(extend({}, vnode.attributes), props), arguments.length > 2 ? [].slice.call(arguments, 2) : vnode.children);
    }
    function enqueueRender(component) {
        if (!component.__d && (component.__d = !0) && 1 == items.push(component)) (options.debounceRendering || setTimeout)(rerender);
    }
    function rerender() {
        var p, list = items;
        items = [];
        while (p = list.pop()) if (p.__d) renderComponent(p);
    }
    function isSameNodeType(node, vnode, hydrating) {
        if ('string' == typeof vnode || 'number' == typeof vnode) return void 0 !== node.splitText;
        if ('string' == typeof vnode.nodeName) return !node._componentConstructor && isNamedNode(node, vnode.nodeName); else return hydrating || node._componentConstructor === vnode.nodeName;
    }
    function isNamedNode(node, nodeName) {
        return node.__n === nodeName || node.nodeName.toLowerCase() === nodeName.toLowerCase();
    }
    function getNodeProps(vnode) {
        var props = extend({}, vnode.attributes);
        props.children = vnode.children;
        var defaultProps = vnode.nodeName.defaultProps;
        if (void 0 !== defaultProps) for (var i in defaultProps) if (void 0 === props[i]) props[i] = defaultProps[i];
        return props;
    }
    function createNode(nodeName, isSvg) {
        var node = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName);
        node.__n = nodeName;
        return node;
    }
    function removeNode(node) {
        if (node.parentNode) node.parentNode.removeChild(node);
    }
    function setAccessor(node, name, old, value, isSvg) {
        if ('className' === name) name = 'class';
        if ('key' === name) ; else if ('ref' === name) {
            if (old) old(null);
            if (value) value(node);
        } else if ('class' === name && !isSvg) node.className = value || ''; else if ('style' === name) {
            if (!value || 'string' == typeof value || 'string' == typeof old) node.style.cssText = value || '';
            if (value && 'object' == typeof value) {
                if ('string' != typeof old) for (var i in old) if (!(i in value)) node.style[i] = '';
                for (var i in value) node.style[i] = 'number' == typeof value[i] && IS_NON_DIMENSIONAL.test(i) === !1 ? value[i] + 'px' : value[i];
            }
        } else if ('dangerouslySetInnerHTML' === name) {
            if (value) node.innerHTML = value.__html || '';
        } else if ('o' == name[0] && 'n' == name[1]) {
            var useCapture = name !== (name = name.replace(/Capture$/, ''));
            name = name.toLowerCase().substring(2);
            if (value) {
                if (!old) node.addEventListener(name, eventProxy, useCapture);
            } else node.removeEventListener(name, eventProxy, useCapture);
            (node.__l || (node.__l = {}))[name] = value;
        } else if ('list' !== name && 'type' !== name && !isSvg && name in node) {
            setProperty(node, name, null == value ? '' : value);
            if (null == value || value === !1) node.removeAttribute(name);
        } else {
            var ns = isSvg && name !== (name = name.replace(/^xlink\:?/, ''));
            if (null == value || value === !1) if (ns) node.removeAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase()); else node.removeAttribute(name); else if ('function' != typeof value) if (ns) node.setAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase(), value); else node.setAttribute(name, value);
        }
    }
    function setProperty(node, name, value) {
        try {
            node[name] = value;
        } catch (e) {}
    }
    function eventProxy(e) {
        return this.__l[e.type](options.event && options.event(e) || e);
    }
    function flushMounts() {
        var c;
        while (c = mounts.pop()) {
            if (options.afterMount) options.afterMount(c);
            if (c.componentDidMount) c.componentDidMount();
        }
    }
    function diff(dom, vnode, context, mountAll, parent, componentRoot) {
        if (!diffLevel++) {
            isSvgMode = null != parent && void 0 !== parent.ownerSVGElement;
            hydrating = null != dom && !('__preactattr_' in dom);
        }
        var ret = idiff(dom, vnode, context, mountAll, componentRoot);
        if (parent && ret.parentNode !== parent) parent.appendChild(ret);
        if (!--diffLevel) {
            hydrating = !1;
            if (!componentRoot) flushMounts();
        }
        return ret;
    }
    function idiff(dom, vnode, context, mountAll, componentRoot) {
        var out = dom, prevSvgMode = isSvgMode;
        if (null == vnode) vnode = '';
        if ('string' == typeof vnode) {
            if (dom && void 0 !== dom.splitText && dom.parentNode && (!dom._component || componentRoot)) {
                if (dom.nodeValue != vnode) dom.nodeValue = vnode;
            } else {
                out = document.createTextNode(vnode);
                if (dom) {
                    if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
                    recollectNodeTree(dom, !0);
                }
            }
            out.__preactattr_ = !0;
            return out;
        }
        if ('function' == typeof vnode.nodeName) return buildComponentFromVNode(dom, vnode, context, mountAll);
        isSvgMode = 'svg' === vnode.nodeName ? !0 : 'foreignObject' === vnode.nodeName ? !1 : isSvgMode;
        if (!dom || !isNamedNode(dom, String(vnode.nodeName))) {
            out = createNode(String(vnode.nodeName), isSvgMode);
            if (dom) {
                while (dom.firstChild) out.appendChild(dom.firstChild);
                if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
                recollectNodeTree(dom, !0);
            }
        }
        var fc = out.firstChild, props = out.__preactattr_ || (out.__preactattr_ = {}), vchildren = vnode.children;
        if (!hydrating && vchildren && 1 === vchildren.length && 'string' == typeof vchildren[0] && null != fc && void 0 !== fc.splitText && null == fc.nextSibling) {
            if (fc.nodeValue != vchildren[0]) fc.nodeValue = vchildren[0];
        } else if (vchildren && vchildren.length || null != fc) innerDiffNode(out, vchildren, context, mountAll, hydrating || null != props.dangerouslySetInnerHTML);
        diffAttributes(out, vnode.attributes, props);
        isSvgMode = prevSvgMode;
        return out;
    }
    function innerDiffNode(dom, vchildren, context, mountAll, isHydrating) {
        var j, c, vchild, child, originalChildren = dom.childNodes, children = [], keyed = {}, keyedLen = 0, min = 0, len = originalChildren.length, childrenLen = 0, vlen = vchildren ? vchildren.length : 0;
        if (0 !== len) for (var i = 0; i < len; i++) {
            var _child = originalChildren[i], props = _child.__preactattr_, key = vlen && props ? _child._component ? _child._component.__k : props.key : null;
            if (null != key) {
                keyedLen++;
                keyed[key] = _child;
            } else if (props || (void 0 !== _child.splitText ? isHydrating ? _child.nodeValue.trim() : !0 : isHydrating)) children[childrenLen++] = _child;
        }
        if (0 !== vlen) for (var i = 0; i < vlen; i++) {
            vchild = vchildren[i];
            child = null;
            var key = vchild.key;
            if (null != key) {
                if (keyedLen && void 0 !== keyed[key]) {
                    child = keyed[key];
                    keyed[key] = void 0;
                    keyedLen--;
                }
            } else if (!child && min < childrenLen) for (j = min; j < childrenLen; j++) if (void 0 !== children[j] && isSameNodeType(c = children[j], vchild, isHydrating)) {
                child = c;
                children[j] = void 0;
                if (j === childrenLen - 1) childrenLen--;
                if (j === min) min++;
                break;
            }
            child = idiff(child, vchild, context, mountAll);
            if (child && child !== dom) if (i >= len) dom.appendChild(child); else if (child !== originalChildren[i]) if (child === originalChildren[i + 1]) removeNode(originalChildren[i]); else dom.insertBefore(child, originalChildren[i] || null);
        }
        if (keyedLen) for (var i in keyed) if (void 0 !== keyed[i]) recollectNodeTree(keyed[i], !1);
        while (min <= childrenLen) if (void 0 !== (child = children[childrenLen--])) recollectNodeTree(child, !1);
    }
    function recollectNodeTree(node, unmountOnly) {
        var component = node._component;
        if (component) unmountComponent(component); else {
            if (null != node.__preactattr_ && node.__preactattr_.ref) node.__preactattr_.ref(null);
            if (unmountOnly === !1 || null == node.__preactattr_) removeNode(node);
            removeChildren(node);
        }
    }
    function removeChildren(node) {
        node = node.lastChild;
        while (node) {
            var next = node.previousSibling;
            recollectNodeTree(node, !0);
            node = next;
        }
    }
    function diffAttributes(dom, attrs, old) {
        var name;
        for (name in old) if ((!attrs || null == attrs[name]) && null != old[name]) setAccessor(dom, name, old[name], old[name] = void 0, isSvgMode);
        for (name in attrs) if (!('children' === name || 'innerHTML' === name || name in old && attrs[name] === ('value' === name || 'checked' === name ? dom[name] : old[name]))) setAccessor(dom, name, old[name], old[name] = attrs[name], isSvgMode);
    }
    function collectComponent(component) {
        var name = component.constructor.name;
        (components[name] || (components[name] = [])).push(component);
    }
    function createComponent(Ctor, props, context) {
        var inst, list = components[Ctor.name];
        if (Ctor.prototype && Ctor.prototype.render) {
            inst = new Ctor(props, context);
            Component.call(inst, props, context);
        } else {
            inst = new Component(props, context);
            inst.constructor = Ctor;
            inst.render = doRender;
        }
        if (list) for (var i = list.length; i--; ) if (list[i].constructor === Ctor) {
            inst.__b = list[i].__b;
            list.splice(i, 1);
            break;
        }
        return inst;
    }
    function doRender(props, state, context) {
        return this.constructor(props, context);
    }
    function setComponentProps(component, props, opts, context, mountAll) {
        if (!component.__x) {
            component.__x = !0;
            if (component.__r = props.ref) delete props.ref;
            if (component.__k = props.key) delete props.key;
            if (!component.base || mountAll) {
                if (component.componentWillMount) component.componentWillMount();
            } else if (component.componentWillReceiveProps) component.componentWillReceiveProps(props, context);
            if (context && context !== component.context) {
                if (!component.__c) component.__c = component.context;
                component.context = context;
            }
            if (!component.__p) component.__p = component.props;
            component.props = props;
            component.__x = !1;
            if (0 !== opts) if (1 === opts || options.syncComponentUpdates !== !1 || !component.base) renderComponent(component, 1, mountAll); else enqueueRender(component);
            if (component.__r) component.__r(component);
        }
    }
    function renderComponent(component, opts, mountAll, isChild) {
        if (!component.__x) {
            var rendered, inst, cbase, props = component.props, state = component.state, context = component.context, previousProps = component.__p || props, previousState = component.__s || state, previousContext = component.__c || context, isUpdate = component.base, nextBase = component.__b, initialBase = isUpdate || nextBase, initialChildComponent = component._component, skip = !1;
            if (isUpdate) {
                component.props = previousProps;
                component.state = previousState;
                component.context = previousContext;
                if (2 !== opts && component.shouldComponentUpdate && component.shouldComponentUpdate(props, state, context) === !1) skip = !0; else if (component.componentWillUpdate) component.componentWillUpdate(props, state, context);
                component.props = props;
                component.state = state;
                component.context = context;
            }
            component.__p = component.__s = component.__c = component.__b = null;
            component.__d = !1;
            if (!skip) {
                rendered = component.render(props, state, context);
                if (component.getChildContext) context = extend(extend({}, context), component.getChildContext());
                var toUnmount, base, childComponent = rendered && rendered.nodeName;
                if ('function' == typeof childComponent) {
                    var childProps = getNodeProps(rendered);
                    inst = initialChildComponent;
                    if (inst && inst.constructor === childComponent && childProps.key == inst.__k) setComponentProps(inst, childProps, 1, context, !1); else {
                        toUnmount = inst;
                        component._component = inst = createComponent(childComponent, childProps, context);
                        inst.__b = inst.__b || nextBase;
                        inst.__u = component;
                        setComponentProps(inst, childProps, 0, context, !1);
                        renderComponent(inst, 1, mountAll, !0);
                    }
                    base = inst.base;
                } else {
                    cbase = initialBase;
                    toUnmount = initialChildComponent;
                    if (toUnmount) cbase = component._component = null;
                    if (initialBase || 1 === opts) {
                        if (cbase) cbase._component = null;
                        base = diff(cbase, rendered, context, mountAll || !isUpdate, initialBase && initialBase.parentNode, !0);
                    }
                }
                if (initialBase && base !== initialBase && inst !== initialChildComponent) {
                    var baseParent = initialBase.parentNode;
                    if (baseParent && base !== baseParent) {
                        baseParent.replaceChild(base, initialBase);
                        if (!toUnmount) {
                            initialBase._component = null;
                            recollectNodeTree(initialBase, !1);
                        }
                    }
                }
                if (toUnmount) unmountComponent(toUnmount);
                component.base = base;
                if (base && !isChild) {
                    var componentRef = component, t = component;
                    while (t = t.__u) (componentRef = t).base = base;
                    base._component = componentRef;
                    base._componentConstructor = componentRef.constructor;
                }
            }
            if (!isUpdate || mountAll) mounts.unshift(component); else if (!skip) {
                flushMounts();
                if (component.componentDidUpdate) component.componentDidUpdate(previousProps, previousState, previousContext);
                if (options.afterUpdate) options.afterUpdate(component);
            }
            if (null != component.__h) while (component.__h.length) component.__h.pop().call(component);
            if (!diffLevel && !isChild) flushMounts();
        }
    }
    function buildComponentFromVNode(dom, vnode, context, mountAll) {
        var c = dom && dom._component, originalComponent = c, oldDom = dom, isDirectOwner = c && dom._componentConstructor === vnode.nodeName, isOwner = isDirectOwner, props = getNodeProps(vnode);
        while (c && !isOwner && (c = c.__u)) isOwner = c.constructor === vnode.nodeName;
        if (c && isOwner && (!mountAll || c._component)) {
            setComponentProps(c, props, 3, context, mountAll);
            dom = c.base;
        } else {
            if (originalComponent && !isDirectOwner) {
                unmountComponent(originalComponent);
                dom = oldDom = null;
            }
            c = createComponent(vnode.nodeName, props, context);
            if (dom && !c.__b) {
                c.__b = dom;
                oldDom = null;
            }
            setComponentProps(c, props, 1, context, mountAll);
            dom = c.base;
            if (oldDom && dom !== oldDom) {
                oldDom._component = null;
                recollectNodeTree(oldDom, !1);
            }
        }
        return dom;
    }
    function unmountComponent(component) {
        if (options.beforeUnmount) options.beforeUnmount(component);
        var base = component.base;
        component.__x = !0;
        if (component.componentWillUnmount) component.componentWillUnmount();
        component.base = null;
        var inner = component._component;
        if (inner) unmountComponent(inner); else if (base) {
            if (base.__preactattr_ && base.__preactattr_.ref) base.__preactattr_.ref(null);
            component.__b = base;
            removeNode(base);
            collectComponent(component);
            removeChildren(base);
        }
        if (component.__r) component.__r(null);
    }
    function Component(props, context) {
        this.__d = !0;
        this.context = context;
        this.props = props;
        this.state = this.state || {};
    }
    function render(vnode, parent, merge) {
        return diff(merge, vnode, {}, !1, parent, !1);
    }
    var options = {};
    var stack = [];
    var EMPTY_CHILDREN = [];
    var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;
    var items = [];
    var mounts = [];
    var diffLevel = 0;
    var isSvgMode = !1;
    var hydrating = !1;
    var components = {};
    extend(Component.prototype, {
        setState: function(state, callback) {
            var s = this.state;
            if (!this.__s) this.__s = extend({}, s);
            extend(s, 'function' == typeof state ? state(s, this.props) : state);
            if (callback) (this.__h = this.__h || []).push(callback);
            enqueueRender(this);
        },
        forceUpdate: function(callback) {
            if (callback) (this.__h = this.__h || []).push(callback);
            renderComponent(this, 2);
        },
        render: function() {}
    });
    var preact = {
        h: h,
        createElement: h,
        cloneElement: cloneElement,
        Component: Component,
        render: render,
        rerender: rerender,
        options: options
    };
    if ('undefined' != typeof module) module.exports = preact; else self.preact = preact;
}();

},{}],2:[function(require,module,exports){
'use strict';

var _createClass = function () {
	function defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
		}
	}return function (Constructor, protoProps, staticProps) {
		if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
	};
}();

function _classCallCheck(instance, Constructor) {
	if (!(instance instanceof Constructor)) {
		throw new TypeError("Cannot call a class as a function");
	}
}

function _possibleConstructorReturn(self, call) {
	if (!self) {
		throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	}return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
	if (typeof superClass !== "function" && superClass !== null) {
		throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

require('./polyfills.js');

var React = require('preact'),
    Bind = require("./bind.js"),
    Pass = require('./components/Pass.js'),
    SubView = require('./components/SubView.js'),
    ShipView = require('./components/ShipView.js'),
    SonarView = require('./components/SonarView.js'),
    Style = {
	app: 'width: 100vw;'
};

var App = function (_React$Component) {
	_inherits(App, _React$Component);

	function App(props, context) {
		_classCallCheck(this, App);

		var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

		_this.state = {
			view: 0,
			payload: undefined
		};

		Bind(_this);
		return _this;
	}

	_createClass(App, [{
		key: 'render',
		value: function render(props, state) {
			switch (state.view) {
				case 0:
					return React.createElement(SubView, { segue: this.segueWithPayload });
				case 1:
					return React.createElement(Pass, { to: 'Ship', segue: this.segue });
				case 2:
					return React.createElement(ShipView, { payload: state.payload, segue: this.segueWithPayload });
				case 3:
					return React.createElement(SonarView, { payload: state.payload, segue: this.segueWithPayload });
				case 4:
					return React.createElement(Pass, { to: 'Sub', segue: this.segue });
			}
		}
	}, {
		key: 'segue',
		value: function segue() {
			this.setState({
				view: this.state.view === 4 ? 0 : this.state.view + 1
			});
		}
	}, {
		key: 'segueWithPayload',
		value: function segueWithPayload(payload, add2) {
			this.setState({
				view: this.state.view === 4 ? 0 : this.state.view + (add2 ? 2 : 1),
				payload: payload
			});
		}
	}]);

	return App;
}(React.Component);

React.render(React.createElement(App, null), document.body);

},{"./bind.js":3,"./components/Pass.js":9,"./components/ShipView.js":11,"./components/SonarView.js":12,"./components/SubView.js":13,"./polyfills.js":14,"preact":1}],3:[function(require,module,exports){
'use strict';

// convenience method
// binds every function in instance's prototype to the instance itself

module.exports = function (instance) {
	var proto = instance.constructor.prototype,
	    keys = Object.getOwnPropertyNames(proto),
	    key;
	while (key = keys.pop()) {
		if (typeof proto[key] === 'function' && key !== 'constructor') instance[key] = proto[key].bind(instance);
	}
};

},{}],4:[function(require,module,exports){
"use strict";

var React = require("preact"),
    Style = require("../style.js");

module.exports = function (props) {
	return React.createElement("div", { style: Object.assign({}, Style.Card, { background: "radial-gradient(circle, " + props.color + " 15%, #111111 100%)" }) }, props.children);
};

},{"../style.js":16,"preact":1}],5:[function(require,module,exports){
"use strict";

var _createClass = function () {
	function defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
		}
	}return function (Constructor, protoProps, staticProps) {
		if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
	};
}();

function _classCallCheck(instance, Constructor) {
	if (!(instance instanceof Constructor)) {
		throw new TypeError("Cannot call a class as a function");
	}
}

function _possibleConstructorReturn(self, call) {
	if (!self) {
		throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	}return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
	if (typeof superClass !== "function" && superClass !== null) {
		throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var React = require("preact"),
    sqrt3DivdedBy2 = Math.sqrt(3) / 2;

var Hex = function (_React$Component) {
	_inherits(Hex, _React$Component);

	function Hex() {
		_classCallCheck(this, Hex);

		return _possibleConstructorReturn(this, (Hex.__proto__ || Object.getPrototypeOf(Hex)).apply(this, arguments));
	}

	_createClass(Hex, [{
		key: "render",
		value: function render(props) {
			return React.createElement("svg", { viewBox: "0 0 1 1", width: sqrt3DivdedBy2 * 88, height: 88, style: "display:block" }, React.createElement("g", { onClick: props.onClick ? props.onClick : undefined }, React.createElement("polygon", {
				points: "0,0.75 0,0.25 0.5,0 1,0.25 1,0.75 0.5,1",
				style: {
					fill: props.bg,
					fillOpacity: props.selected ? "1" : "0.4"
				}
			}), props.children));
		}
	}]);

	return Hex;
}(React.Component);

module.exports = Hex;

},{"preact":1}],6:[function(require,module,exports){
"use strict";

var _createClass = function () {
	function defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
		}
	}return function (Constructor, protoProps, staticProps) {
		if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
	};
}();

function _classCallCheck(instance, Constructor) {
	if (!(instance instanceof Constructor)) {
		throw new TypeError("Cannot call a class as a function");
	}
}

function _possibleConstructorReturn(self, call) {
	if (!self) {
		throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	}return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
	if (typeof superClass !== "function" && superClass !== null) {
		throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var React = require("preact"),
    Hex = require("./Hex.js"),
    Style = require("../style.js"),
    sqrt3DivdedBy2 = Math.sqrt(3) / 2;

var HexButton = function (_React$Component) {
	_inherits(HexButton, _React$Component);

	function HexButton() {
		_classCallCheck(this, HexButton);

		return _possibleConstructorReturn(this, (HexButton.__proto__ || Object.getPrototypeOf(HexButton)).apply(this, arguments));
	}

	_createClass(HexButton, [{
		key: "render",
		value: function render(props) {
			var margin = (1 - sqrt3DivdedBy2) / 2;
			return React.createElement("svg", { viewBox: "0 0 1 1", width: sqrt3DivdedBy2 * 100, height: 100, style: Style.HexButton }, React.createElement("g", { onClick: props.onClick ? function () {
					return props.onClick(props.text);
				} : undefined }, React.createElement("polygon", {
				points: margin + ",0.75 " + margin + ",0.25 0.5,0 " + (1 - margin) + ",0.25 " + (1 - margin) + ",0.75 0.5,1",
				style: {
					fill: props.bg,
					fillOpacity: props.selected ? "1" : "0.4"
				}
			}), React.createElement("text", {
				x: "0.5",
				y: "0.78",
				"text-anchor": "middle",
				style: props.selected ? {
					fontFamily: "Open Sans",
					fontSize: "4.8%",
					fill: props.fg,
					fillOpacity: "1"
				} : {
					fontFamily: "Open Sans",
					fontSize: "4.8%",
					fill: "#111111",
					fillOpacity: "1"
				}
			}, props.text)));
		}
	}]);

	return HexButton;
}(React.Component);

module.exports = HexButton;

},{"../style.js":16,"./Hex.js":5,"preact":1}],7:[function(require,module,exports){
"use strict";

var React = require("preact"),
    Style = {
	div: {
		width: "66%",
		display: "flex",
		justifyContent: "flex-start",
		flexWrap: "wrap",
		marginBottom: "2rem"
	},
	text: {
		webkitFontSmoothing: "antialiased",
		display: "inline",
		fontSize: "3rem",
		fontWeight: "200",
		margin: "0.75rem",
		backgroundColor: "rgba(0,0,0,0)",
		color: "#ffffff"
	}
};

module.exports = function (props) {
	var list = [],
	    i = -1;

	while (++i < props.list.length) {
		list.push(React.createElement("p", {
			style: Style.text
		}, props.list[i]));
	}return React.createElement("div", { style: Style.div }, list);
};

},{"preact":1}],8:[function(require,module,exports){
"use strict";

var React = require("preact"),
    Style = require("../style.js");

module.exports = function (props) {
	var i = props.from,
	    buttons = [],
	    callback = function callback(e) {
		return props.onClick(Number(e.target.dataset.id));
	};

	while (i <= props.to) {
		buttons.push(React.createElement("button", {
			style: Object.assign({}, Style.NumberButton, { color: props.selected.indexOf(i) === -1 ? "rgba(1, 1, 1, 0.4)" : "#ffffff" }),
			"data-id": i,
			onClick: callback
		}, "" + i++));
	}return React.createElement("div", { style: Style.NumberBox }, buttons);
};

},{"../style.js":16,"preact":1}],9:[function(require,module,exports){
"use strict";

var React = require("preact"),
    Style = require("../style.js");

module.exports = function (props) {
	setTimeout(function () {
		return props.segue();
	}, 2000);
	return React.createElement("div", { style: Style.MainLayout }, React.createElement("img", { src: "./dist/img/BACK.png", style: Style.img }), React.createElement("h2", null, "Pass this to the " + props.to + " player."));
};

},{"../style.js":16,"preact":1}],10:[function(require,module,exports){
"use strict";

var React = require("preact"),
    HexButton = require("./HexButton.js");

module.exports = function (props, state) {
	return React.createElement("div", { style: "display: flex; justify-content: center;" }, React.createElement(HexButton, { text: "R", fg: "#ff0000", bg: "#ffffff", selected: props.selected === "R", onClick: props.onSelect }), React.createElement(HexButton, { text: "P", fg: "#cc00cc", bg: "#ffffff", selected: props.selected === "P", onClick: props.onSelect }), React.createElement(HexButton, { text: "O", fg: "#ff9900", bg: "#ffffff", selected: props.selected === "O", onClick: props.onSelect }), React.createElement(HexButton, { text: "G", fg: "#00cc33", bg: "#ffffff", selected: props.selected === "G", onClick: props.onSelect }));
};

},{"./HexButton.js":6,"preact":1}],11:[function(require,module,exports){
"use strict";

var _createClass = function () {
	function defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
		}
	}return function (Constructor, protoProps, staticProps) {
		if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
	};
}();

function _classCallCheck(instance, Constructor) {
	if (!(instance instanceof Constructor)) {
		throw new TypeError("Cannot call a class as a function");
	}
}

function _possibleConstructorReturn(self, call) {
	if (!self) {
		throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	}return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
	if (typeof superClass !== "function" && superClass !== null) {
		throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var React = require("preact"),
    Bind = require("../bind.js"),
    NumberSelector = require("./NumberSelector.js"),
    Card = require("./Card.js"),
    Style = require("../style.js");

var ShipView = function (_React$Component) {
	_inherits(ShipView, _React$Component);

	function ShipView(props, context) {
		_classCallCheck(this, ShipView);

		var _this = _possibleConstructorReturn(this, (ShipView.__proto__ || Object.getPrototypeOf(ShipView)).call(this, props));

		_this.state = {
			detection: 0
		};

		Bind(_this);
		return _this;
	}

	_createClass(ShipView, [{
		key: "render",
		value: function render(props, state) {
			return React.createElement("section", { style: Style.MainLayout }, React.createElement(Card, { color: "#cccccc" }, React.createElement("h2", null, "Detection"), React.createElement(NumberSelector, { selected: [state.detection], from: 0, to: 12, onClick: this.selectDetection })), React.createElement("button", {
				style: Style.SegueButton,
				onClick: this.viewSonar
			}, this.state.detection === 0 ? "Done" : "View Data"));
		}
	}, {
		key: "selectDetection",
		value: function selectDetection(s) {
			if (this.state.detection !== s) this.setState({ detection: s });
		}
	}, {
		key: "viewSonar",
		value: function viewSonar() {
			this.props.segue(this.props.payload(this.state.detection, this.state.detection === 0) // ship sonar function
			);
		}
	}]);

	return ShipView;
}(React.Component);

module.exports = ShipView;

},{"../bind.js":3,"../style.js":16,"./Card.js":4,"./NumberSelector.js":8,"preact":1}],12:[function(require,module,exports){
"use strict";

var React = require("preact"),
    Bind = require("../bind.js"),
    NumberList = require("./NumberList.js"),
    Card = require("./Card.js"),
    Sonar = require("../sonar.js"),
    Style = require("../style.js");

function parseDraw(cards) {
	var draw = {
		R: [],
		P: [],
		O: [],
		G: [],
		S: [],
		D: []
	},
	    c;

	while (c = cards.pop()) {
		draw[c[0]].push(Number(c[1]));
	}draw.R.sort();
	draw.P.sort();
	draw.O.sort();
	draw.G.sort();
	draw.S.sort();
	draw.D.sort();

	return draw;
}

module.exports = function (props, state) {
	var draw = parseDraw(props.payload),
	    cards = [];

	if (draw.R.length) cards.push(React.createElement(Card, { color: Sonar.ColorForQuadrant("R") }, React.createElement("h2", null, "Red"), React.createElement(NumberList, { list: draw.R })));

	if (draw.P.length) cards.push(React.createElement(Card, { color: Sonar.ColorForQuadrant("P") }, React.createElement("h2", null, "Purple"), React.createElement(NumberList, { list: draw.P })));

	if (draw.O.length) cards.push(React.createElement(Card, { color: Sonar.ColorForQuadrant("O") }, React.createElement("h2", null, "Orange"), React.createElement(NumberList, { list: draw.O })));

	if (draw.G.length) cards.push(React.createElement(Card, { color: Sonar.ColorForQuadrant("G") }, React.createElement("h2", null, "Green"), React.createElement(NumberList, { list: draw.G })));

	if (draw.S.length) cards.push(React.createElement(Card, { color: "#0139a4" }, React.createElement("h2", null, "Speed"), React.createElement(NumberList, { list: draw.S })));

	if (draw.D.length) cards.push(React.createElement(Card, { color: "#333333" }, React.createElement("h2", null, "Depth"), React.createElement(NumberList, { list: draw.D })));

	return React.createElement("section", { style: Style.MainLayout }, cards, React.createElement("button", { style: Style.SegueButton, onClick: function onClick() {
			return props.segue();
		} }, "Done"));
};

},{"../bind.js":3,"../sonar.js":15,"../style.js":16,"./Card.js":4,"./NumberList.js":7,"preact":1}],13:[function(require,module,exports){
"use strict";

var _createClass = function () {
	function defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
		}
	}return function (Constructor, protoProps, staticProps) {
		if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
	};
}();

function _classCallCheck(instance, Constructor) {
	if (!(instance instanceof Constructor)) {
		throw new TypeError("Cannot call a class as a function");
	}
}

function _possibleConstructorReturn(self, call) {
	if (!self) {
		throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	}return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
	if (typeof superClass !== "function" && superClass !== null) {
		throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var React = require("preact"),
    Bind = require("../bind.js"),
    Card = require("./Card.js"),
    QuadrantSelector = require("./QuadrantSelector.js"),
    NumberSelector = require("./NumberSelector.js"),
    Sonar = require("../sonar.js"),
    Style = require("../style.js");

var SubView = function (_React$Component) {
	_inherits(SubView, _React$Component);

	function SubView(props, context) {
		_classCallCheck(this, SubView);

		var _this = _possibleConstructorReturn(this, (SubView.__proto__ || Object.getPrototypeOf(SubView)).call(this, props));

		_this.state = {
			quadrant: "R",
			quadrantColor: "#ff0000",
			posA: undefined,
			posB: undefined,
			speed: undefined,
			depth: undefined,
			stealth: undefined
		};

		Bind(_this);
		return _this;
	}

	_createClass(SubView, [{
		key: "render",
		value: function render(props, state) {
			var noSegue = state.posA === undefined || state.posB === undefined || state.speed === undefined || state.depth === undefined || state.stealth === undefined;
			return React.createElement("section", { style: Style.MainLayout }, React.createElement(Card, { color: state.quadrantColor }, React.createElement("h2", null, "Position"), React.createElement(QuadrantSelector, { selected: state.quadrant, onSelect: this.selectQuadrant }), React.createElement(NumberSelector, { fg: state.quadrantColor, selected: [this.state.posA, this.state.posB], from: 0, to: 9, onClick: this.selectPosition })), React.createElement(Card, { color: "#333333" }, React.createElement("h2", null, "Speed"), React.createElement(NumberSelector, { selected: [state.speed], from: 0, to: 4, onClick: this.selectSpeed })), React.createElement(Card, { color: "#0139a4" }, React.createElement("h2", null, "Depth"), React.createElement(NumberSelector, { selected: [state.depth], from: 0, to: 4, onClick: this.selectDepth })), React.createElement(Card, { color: "#999999" }, React.createElement("h2", null, "Stealth"), React.createElement(NumberSelector, { selected: [state.stealth], from: 0, to: 12, onClick: this.selectStealth })), React.createElement("button", {
				style: noSegue ? Style.DisabledButton : Style.SegueButton,
				onClick: this.stackDeck,
				disabled: noSegue
			}, "Done"));
		}
	}, {
		key: "selectQuadrant",
		value: function selectQuadrant(q) {
			this.setState({
				quadrant: q,
				quadrantColor: Sonar.ColorForQuadrant(q)
			});
		}
	}, {
		key: "selectPosition",
		value: function selectPosition(p) {
			var state = {
				posA: this.state.posA,
				posB: this.state.posB
			};

			if (state.posA === p) state.posA = undefined;else if (state.posB === p) state.posB = undefined;else if (state.posA === undefined) state.posA = p;else if (state.posB == undefined) state.posB = p;

			this.setState(state);
		}
	}, {
		key: "selectSpeed",
		value: function selectSpeed(s) {
			if (this.state.speed !== s) this.setState({ speed: s });
		}
	}, {
		key: "selectDepth",
		value: function selectDepth(s) {
			if (this.state.depth !== s) this.setState({ depth: s });
		}
	}, {
		key: "selectStealth",
		value: function selectStealth(s) {
			if (this.state.stealth !== s) this.setState({ stealth: s });
		}
	}, {
		key: "stackDeck",
		value: function stackDeck() {
			this.props.segue(Sonar.SubSonar(this.state.quadrant + this.state.posA, this.state.quadrant + this.state.posB, "S" + this.state.speed, "D" + this.state.depth, this.state.stealth));
		}
	}]);

	return SubView;
}(React.Component);

module.exports = SubView;

},{"../bind.js":3,"../sonar.js":15,"../style.js":16,"./Card.js":4,"./NumberSelector.js":8,"./QuadrantSelector.js":10,"preact":1}],14:[function(require,module,exports){
'use strict';

// Object.assign POLYFILL
// source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
//

if (typeof Object.assign != 'function') {
	Object.assign = function (target, varArgs) {
		// .length of function is 2
		'use strict';

		if (target == null) {
			// TypeError if undefined or null
			throw new TypeError('Cannot convert undefined or null to object');
		}

		var to = Object(target);

		for (var index = 1; index < arguments.length; index++) {
			var nextSource = arguments[index];

			if (nextSource != null) {
				// Skip over if undefined or null
				for (var nextKey in nextSource) {
					// Avoid bugs when hasOwnProperty is shadowed
					if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
						to[nextKey] = nextSource[nextKey];
					}
				}
			}
		}
		return to;
	};
}

},{}],15:[function(require,module,exports){
"use strict";

function sonarDeck() {
	return ["G0", "G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "P0", "P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "O0", "O1", "O2", "O3", "O4", "O5", "O6", "O7", "O8", "O9", "R0", "R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8", "R9", "D0", "D1", "D2", "D3", "D4", "S0", "S1", "S2", "S3", "S4"];
}

function FisherYatesShuffle(deck) {
	var temp, i, j;

	i = deck.length;
	while (i) {
		j = Math.random() * i-- >> 0;

		temp = deck[i];
		deck[i] = deck[j];
		deck[j] = temp;
	}
}

function shuffle(deck, times) {
	while (times--) {
		FisherYatesShuffle(deck);
	}
}

function ShipSonar(detection) {
	while (detection < this.length) {
		this.pop();
	}return this;
}

function SubSonar(posA, posB, speed, depth, stealth) {
	var deck = sonarDeck(),
	    sonar = [],
	    i;

	i = deck.indexOf(posA);
	if (i !== -1) sonar.push(deck.splice(i, 1)[0]);else throw "Position: " + posA + " not in Sonar!";

	i = deck.indexOf(posB);
	if (i !== -1) sonar.push(deck.splice(i, 1)[0]);else throw "Position: " + posB + " not in Sonar!";

	i = deck.indexOf(speed);
	if (i !== -1) sonar.push(deck.splice(i, 1)[0]);else throw "Speed: " + speed + " not in Sonar!";

	i = deck.indexOf(depth);
	if (i !== -1) sonar.push(deck.splice(i, 1)[0]);else throw "Speed: " + depth + " not in Sonar!";

	shuffle(deck, 2);

	while (stealth--) {
		i = Math.random() * deck.length >> 0;
		sonar.push(deck.splice(i, 1)[0]);
	}

	shuffle(sonar, 2);

	return ShipSonar.bind(sonar);
}

function ColorForQuadrant(q) {
	switch (q) {
		case "R":
			return "#ff0000";
		case "P":
			return "#cc00cc";
		case "O":
			return "#ff9900";
		case "G":
			return "#00cc33";
	}
}

module.exports = { SubSonar: SubSonar, ColorForQuadrant: ColorForQuadrant };

},{}],16:[function(require,module,exports){
"use strict";

module.exports = {
	MainLayout: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "flex-start",
		alignItems: "center"
	},
	SegueButton: {
		width: "95vw",
		height: "4rem",
		fontWeight: "200",
		fontSize: "2rem",
		border: "none",
		outline: "none",
		color: "#ffffff",
		backgroundColor: "rgba(255,255,255,0.5)"
	},
	DisabledButton: {
		width: "95vw",
		height: "4rem",
		fontWeight: "200",
		fontSize: "2rem",
		border: "none",
		outline: "none",
		color: "#222222",
		backgroundColor: "rgba(255,255,255,0.25)"
	},
	NumberBox: {
		width: "66%",
		display: "flex",
		justifyContent: "flex-start",
		flexWrap: "wrap",
		marginBottom: "2rem"
	},
	NumberButton: {
		border: "none",
		outline: "none",
		fontSize: "3rem",
		fontWeight: "200",
		margin: "0.75rem",
		backgroundColor: "rgba(0,0,0,0)"
	},
	HexButton: {
		display: "inline",
		margin: "0.15rem",
		fontFamily: "Open Sans"
	},
	Card: {
		marginBottom: "1rem",
		width: "100%",
		borderRadius: "1rem",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center"
	},
	img: {
		width: "100%",
		height: "auto"
	}
};

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcHJlYWN0L2Rpc3QvcHJlYWN0LmpzIiwic3JjL0FwcC5qcyIsInNyYy9iaW5kLmpzIiwic3JjL2NvbXBvbmVudHMvQ2FyZC5qcyIsInNyYy9jb21wb25lbnRzL0hleC5qcyIsInNyYy9jb21wb25lbnRzL0hleEJ1dHRvbi5qcyIsInNyYy9jb21wb25lbnRzL051bWJlckxpc3QuanMiLCJzcmMvY29tcG9uZW50cy9OdW1iZXJTZWxlY3Rvci5qcyIsInNyYy9jb21wb25lbnRzL1Bhc3MuanMiLCJzcmMvY29tcG9uZW50cy9RdWFkcmFudFNlbGVjdG9yLmpzIiwic3JjL2NvbXBvbmVudHMvU2hpcFZpZXcuanMiLCJzcmMvY29tcG9uZW50cy9Tb25hclZpZXcuanMiLCJzcmMvY29tcG9uZW50cy9TdWJWaWV3LmpzIiwic3JjL3BvbHlmaWxscy5qcyIsInNyYy9zb25hci5qcyIsInNyYy9zdHlsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQy9ZQSxRQUFBLEFBQVE7O0FBRVIsSUFDQyxRQUFRLFFBRFQsQUFDUyxBQUFRO0lBRWhCLE9BQU8sUUFIUixBQUdRLEFBQVE7SUFFZixPQUFPLFFBTFIsQUFLUSxBQUFRO0lBQ2YsVUFBVSxRQU5YLEFBTVcsQUFBUTtJQUNsQixXQUFXLFFBUFosQUFPWSxBQUFRO0lBQ25CLFlBQVksUUFSYixBQVFhLEFBQVE7SUFFcEI7TUFWRCxBQVVTLEFBQ0Y7QUFERSxBQUNQOztJLEFBSUk7Z0JBQ0w7O2NBQUEsQUFBWSxPQUFaLEFBQW1CLFNBQVM7d0JBQUE7O3dHQUFBLEFBQ3JCLEFBQ047O1FBQUEsQUFBSztTQUFRLEFBQ04sQUFDTjtZQUZELEFBQWEsQUFFSCxBQUdWO0FBTGEsQUFDWjs7T0FIMEI7U0FRM0I7Ozs7O3lCLEFBRU0sTyxBQUFPLE9BQU8sQUFDcEI7V0FBUSxNQUFSLEFBQWMsQUFDYjtTQUFBLEFBQUssQUFBRztZQUFPLG9CQUFBLEFBQUMsV0FBUyxPQUFPLEtBQXhCLEFBQU8sQUFBc0IsQUFDckM7U0FBQSxBQUFLLEFBQUc7WUFBTyxvQkFBQSxBQUFDLFFBQUssSUFBTixBQUFTLFFBQU8sT0FBTyxLQUE5QixBQUFPLEFBQTRCLEFBQzNDO1NBQUEsQUFBSyxBQUFHO1lBQU8sb0JBQUEsQUFBQyxZQUFTLFNBQVMsTUFBbkIsQUFBeUIsU0FBUyxPQUFPLEtBQWhELEFBQU8sQUFBOEMsQUFDN0Q7U0FBQSxBQUFLLEFBQUc7WUFBTyxvQkFBQSxBQUFDLGFBQVUsU0FBUyxNQUFwQixBQUEwQixTQUFTLE9BQU8sS0FBakQsQUFBTyxBQUErQyxBQUM5RDtTQUFBLEFBQUssQUFBRztZQUFPLG9CQUFBLEFBQUMsUUFBSyxJQUFOLEFBQVMsT0FBTSxPQUFPLEtBTHRDLEFBS1MsQUFBTyxBQUEyQixBQUUzQzs7Ozs7MEJBQ08sQUFDUDtRQUFBLEFBQUs7VUFDRyxLQUFBLEFBQUssTUFBTCxBQUFXLFNBQVosQUFBcUIsSUFBckIsQUFBMEIsSUFBSSxLQUFBLEFBQUssTUFBTCxBQUFXLE9BRGhELEFBQWMsQUFDeUMsQUFFdkQ7QUFIYyxBQUNiOzs7O21DLEFBR2UsUyxBQUFTLE1BQU0sQUFDL0I7UUFBQSxBQUFLO1VBQ0csS0FBQSxBQUFLLE1BQUwsQUFBVyxTQUFaLEFBQXFCLElBQXJCLEFBQTBCLElBQUksS0FBQSxBQUFLLE1BQUwsQUFBVyxRQUFRLEFBQUMsT0FBRCxBQUFTLElBRG5ELEFBQ3VCLEFBQWdDLEFBQ3BFO2FBRkQsQUFBYyxBQUVKLEFBRVY7QUFKYyxBQUNiOzs7OztFQTNCZSxNLEFBQU07O0FBaUN4QixNQUFBLEFBQU0sT0FBTyxvQkFBQSxBQUFDLEtBQWQsT0FBcUIsU0FBckIsQUFBOEI7Ozs7O0FDbEQ5QjtBQUNBOztBQUNBLE9BQUEsQUFBTyxVQUFVLFVBQUEsQUFBUyxVQUFVLEFBQ25DO0tBQUksUUFBUSxTQUFBLEFBQVMsWUFBckIsQUFBaUM7S0FDaEMsT0FBTyxPQUFBLEFBQU8sb0JBRGYsQUFDUSxBQUEyQjtLQURuQyxBQUVDLEFBQ0Q7UUFBTyxNQUFNLEtBQWIsQUFBYSxBQUFLLE9BQU87TUFBSSxPQUFPLE1BQVAsQUFBTyxBQUFNLFNBQWIsQUFBc0IsY0FBYyxRQUF4QyxBQUFnRCxlQUFlLFNBQUEsQUFBUyxPQUFPLE1BQUEsQUFBTSxLQUFOLEFBQVcsS0FBbkgsQUFBd0YsQUFBZ0IsQUFBZ0I7QUFDeEg7QUFMRDs7Ozs7QUNGQSxJQUNDLFFBQVEsUUFEVCxBQUNTLEFBQVE7SUFDaEIsUUFBUSxRQUZULEFBRVMsQUFBUTs7QUFFakIsT0FBQSxBQUFPLFVBQVUsVUFBQSxBQUFTLE9BQU8sQUFDaEM7UUFDQyxNQUFBLGNBQUEsU0FBSyxPQUFPLE9BQUEsQUFBTyxPQUFQLEFBQWMsSUFBSSxNQUFsQixBQUF3QixNQUFNLEVBQUUsWUFBVyw2QkFBNkIsTUFBN0IsQUFBbUMsUUFBMUYsQUFBWSxBQUE4QixBQUF3RCxBQUMvRixrQ0FGSixBQUNDLEFBQ1MsQUFHVjtBQU5EOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNKQSxJQUNDLFFBQVEsUUFEVCxBQUNTLEFBQVE7SUFDaEIsaUJBQWlCLEtBQUEsQUFBSyxLQUFMLEFBQVUsS0FGNUIsQUFFaUM7O0ksQUFFM0I7Ozs7Ozs7Ozs7O3lCLEFBQ0UsT0FBTyxBQUNiO1VBQ0MsTUFBQSxjQUFBLFNBQUssU0FBTCxBQUFhLFdBQVUsT0FBTyxpQkFBOUIsQUFBK0MsSUFBSSxRQUFuRCxBQUEyRCxJQUFJLE9BQS9ELEFBQXFFLEFBQ3BFLHlCQUFBLGNBQUEsT0FBRyxTQUFVLE1BQUQsQUFBTyxVQUFXLE1BQWxCLEFBQXdCLFVBQXBDLEFBQThDLEFBQzdDO1lBQUEsQUFDUSxBQUNQOztXQUNPLE1BREEsQUFDTSxBQUNaO2tCQUFhLE1BQUEsQUFBTSxXQUFOLEFBQWlCLE1BTGpDLEFBQ0MsQUFFUSxBQUU4QixBQUdyQztBQUxPLEFBQ047QUFGRCxhQUpKLEFBQ0MsQUFDQyxBQVFRLEFBSVY7Ozs7O0VBaEJnQixNLEFBQU07O0FBbUJ4QixPQUFBLEFBQU8sVUFBUCxBQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdkJqQixJQUNDLFFBQVEsUUFEVCxBQUNTLEFBQVE7SUFDaEIsTUFBTSxRQUZQLEFBRU8sQUFBUTtJQUNkLFFBQVEsUUFIVCxBQUdTLEFBQVE7SUFDaEIsaUJBQWlCLEtBQUEsQUFBSyxLQUFMLEFBQVUsS0FKNUIsQUFJaUM7O0ksQUFFM0I7Ozs7Ozs7Ozs7O3lCLEFBQ0UsT0FBTyxBQUNiO09BQUksU0FBUyxDQUFDLElBQUQsQUFBSyxrQkFBbEIsQUFBb0MsQUFDcEM7VUFDQyxNQUFBLGNBQUEsU0FBSyxTQUFMLEFBQWEsV0FBVSxPQUFPLGlCQUE5QixBQUErQyxLQUFLLFFBQXBELEFBQTRELEtBQUssT0FBTyxNQUF4RSxBQUE4RSxBQUM3RSxtQkFBQSxjQUFBLE9BQUcsZUFBVSxBQUFNLFVBQVUsWUFBQTtZQUFNLE1BQUEsQUFBTSxRQUFRLE1BQXBCLEFBQU0sQUFBb0I7QUFBMUMsS0FBQSxHQUFiLEFBQStELEFBQzlEO1lBQ1MsU0FBQSxBQUFTLFdBQVQsQUFBb0IsU0FBcEIsQUFBNkIsa0JBQWtCLElBQS9DLEFBQWlELFVBQWpELEFBQTJELFlBQVksSUFBdkUsQUFBeUUsVUFEbEYsQUFDNEYsQUFDM0Y7O1dBQ08sTUFEQSxBQUNNLEFBQ1o7a0JBQWEsTUFBQSxBQUFNLFdBQU4sQUFBaUIsTUFMakMsQUFDQyxBQUVRLEFBRThCLEFBR3RDO0FBTFEsQUFDTjtBQUZELGFBTUQsY0FBQTtPQUFBLEFBQ0csQUFDRjtPQUZELEFBRUcsQUFDRjttQkFIRCxBQUdhLEFBQ1o7aUJBQVEsQUFBTTtpQkFBVyxBQUNaLEFBQ1o7ZUFGd0IsQUFFZCxBQUNWO1dBQU0sTUFIa0IsQUFHWixBQUNaO2tCQUpPLEFBQWlCLEFBSVg7QUFKVyxBQUN4QixLQURPO2lCQUtKLEFBQ1MsQUFDWjtlQUZHLEFBRU8sQUFDVjtXQUhHLEFBR0csQUFDTjtrQkFiRixBQVNLLEFBSVUsQUFFYjtBQU5HLEFBQ0g7QUFURCxZQVhKLEFBQ0MsQUFDQyxBQVFDLEFBZVEsQUFJWDs7Ozs7RUFoQ3NCLE0sQUFBTTs7QUFtQzlCLE9BQUEsQUFBTyxVQUFQLEFBQWlCOzs7OztBQ3pDakIsSUFDQyxRQUFRLFFBRFQsQUFDUyxBQUFRO0lBQ2hCOztTQUNNLEFBQ0csQUFDUDtXQUZJLEFBRUssQUFDVDtrQkFISSxBQUdZLEFBQ2hCO1lBSkksQUFJTSxBQUNWO2dCQU5NLEFBQ0YsQUFLVSxBQUVmO0FBUEssQUFDSjs7dUJBTUssQUFDZ0IsQUFDckI7V0FGSyxBQUVJLEFBQ1Q7WUFISyxBQUdLLEFBQ1Y7Y0FKSyxBQUlPLEFBQ1o7VUFMSyxBQUtHLEFBQ1I7bUJBTkssQUFNWSxBQUNqQjtTQWpCSCxBQUVTLEFBUUQsQUFPRTtBQVBGLEFBQ0w7QUFUTSxBQUNQOztBQWtCRixPQUFBLEFBQU8sVUFBVSxVQUFBLEFBQVMsT0FBTyxBQUNoQztLQUFJLE9BQUosQUFBVztLQUNWLElBQUksQ0FETCxBQUNNLEFBRU47O1FBQU8sRUFBQSxBQUFFLElBQUksTUFBQSxBQUFNLEtBQW5CLEFBQXdCLFFBQVE7T0FBQSxBQUFLLFdBQ3BDLGNBQUE7VUFDUSxNQURSLEFBQ2MsQUFDWjtBQURELEdBREQsUUFFRSxBQUFNLEtBSFQsQUFBZ0MsQUFDL0IsQUFFRSxBQUFXO0FBR2QsU0FDQyxNQUFBLGNBQUEsU0FBSyxPQUFPLE1BQVosQUFBa0IsQUFDaEIsT0FGSCxBQUNDLEFBSUQ7QUFmRDs7Ozs7QUNyQkEsSUFDQyxRQUFRLFFBRFQsQUFDUyxBQUFRO0lBQ2hCLFFBQVEsUUFGVCxBQUVTLEFBQVE7O0FBRWpCLE9BQUEsQUFBTyxVQUFVLFVBQUEsQUFBUyxPQUFPLEFBQ2hDO0tBQUksSUFBSSxNQUFSLEFBQWM7S0FDYixVQURELEFBQ1c7S0FDVixXQUFXLFNBQVgsQUFBVyxTQUFBLEFBQUMsR0FBRDtTQUFPLE1BQUEsQUFBTSxRQUFRLE9BQU8sRUFBQSxBQUFFLE9BQUYsQUFBUyxRQUFyQyxBQUFPLEFBQWMsQUFBd0I7QUFGekQsQUFJQTs7UUFBTyxLQUFLLE1BQVosQUFBa0IsSUFBSTtVQUFBLEFBQVEsV0FDN0IsY0FBQTtVQUNRLE9BQUEsQUFBTyxPQUFQLEFBQWMsSUFBSSxNQUFsQixBQUF3QixjQUFjLEVBQUUsT0FBUSxNQUFBLEFBQU0sU0FBTixBQUFlLFFBQWYsQUFBdUIsT0FBTyxDQUEvQixBQUFnQyxJQUFoQyxBQUFxQyx1QkFENUYsQUFDUSxBQUFzQyxBQUFxRSxBQUNsSDtjQUZELEFBRVUsQUFDVDtZQUhELEFBR1UsQUFDUDtBQUhGLEdBREQsT0FERCxBQUFzQixBQUNyQixBQUlRO0FBR1QsU0FDQyxNQUFBLGNBQUEsU0FBSyxPQUFPLE1BQVosQUFBa0IsQUFDaEIsYUFGSCxBQUNDLEFBSUQ7QUFsQkQ7Ozs7O0FDSkEsSUFDQyxRQUFRLFFBRFQsQUFDUyxBQUFRO0lBQ2hCLFFBQVEsUUFGVCxBQUVTLEFBQVE7O0FBRWpCLE9BQUEsQUFBTyxVQUFVLFVBQUEsQUFBUyxPQUFPLEFBQ2hDO1lBQVcsWUFBQTtTQUFNLE1BQU4sQUFBTSxBQUFNO0FBQXZCLElBQUEsQUFBZ0MsQUFDaEM7UUFDQyxNQUFBLGNBQUEsU0FBSyxPQUFPLE1BQVosQUFBa0IsQUFDakIsMkNBQUssS0FBTCxBQUFTLHVCQUFzQixPQUFPLE1BRHZDLEFBQ0MsQUFBNEMsQUFDNUMsY0FBQSxjQUFBLE1BQUssNEJBQXNCLE1BQXRCLEFBQTRCLEtBSG5DLEFBQ0MsQUFFQyxBQUFzQyxBQUd4QztBQVJEOzs7OztBQ0pBLElBQ0MsUUFBUSxRQURULEFBQ1MsQUFBUTtJQUNoQixZQUFZLFFBRmIsQUFFYSxBQUFROztBQUVyQixPQUFBLEFBQU8sVUFBVSxVQUFBLEFBQVMsT0FBVCxBQUFnQixPQUFPLEFBQ3ZDO1FBQ0MsTUFBQSxjQUFBLFNBQUssT0FBTCxBQUFXLEFBQ1YsaUVBQUEsQUFBQyxhQUFVLE1BQVgsQUFBZ0IsS0FBSSxJQUFwQixBQUF1QixXQUFVLElBQWpDLEFBQW9DLFdBQVUsVUFBVyxNQUFBLEFBQU0sYUFBL0QsQUFBNEUsS0FBTSxTQUFTLE1BRDVGLEFBQ0MsQUFBaUcsQUFDakcsaUNBQUEsQUFBQyxhQUFVLE1BQVgsQUFBZ0IsS0FBSSxJQUFwQixBQUF1QixXQUFVLElBQWpDLEFBQW9DLFdBQVUsVUFBVyxNQUFBLEFBQU0sYUFBL0QsQUFBNEUsS0FBTSxTQUFTLE1BRjVGLEFBRUMsQUFBaUcsQUFDakcsaUNBQUEsQUFBQyxhQUFVLE1BQVgsQUFBZ0IsS0FBSSxJQUFwQixBQUF1QixXQUFVLElBQWpDLEFBQW9DLFdBQVUsVUFBVyxNQUFBLEFBQU0sYUFBL0QsQUFBNEUsS0FBTSxTQUFTLE1BSDVGLEFBR0MsQUFBaUcsQUFDakcsaUNBQUEsQUFBQyxhQUFVLE1BQVgsQUFBZ0IsS0FBSSxJQUFwQixBQUF1QixXQUFVLElBQWpDLEFBQW9DLFdBQVUsVUFBVyxNQUFBLEFBQU0sYUFBL0QsQUFBNEUsS0FBTSxTQUFTLE1BTDdGLEFBQ0MsQUFJQyxBQUFpRyxBQUduRztBQVREOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNKQSxJQUNDLFFBQVEsUUFEVCxBQUNTLEFBQVE7SUFFaEIsT0FBTyxRQUhSLEFBR1EsQUFBUTtJQUVmLGlCQUFpQixRQUxsQixBQUtrQixBQUFRO0lBQ3pCLE9BQU8sUUFOUixBQU1RLEFBQVE7SUFDZixRQUFRLFFBUFQsQUFPUyxBQUFROztJLEFBRVg7cUJBQ0w7O21CQUFBLEFBQVksT0FBWixBQUFtQixTQUFTO3dCQUFBOztrSEFBQSxBQUNyQixBQUNOOztRQUFBLEFBQUs7Y0FBTCxBQUFhLEFBQ0QsQUFHWjtBQUphLEFBQ1o7O09BSDBCO1NBTzNCOzs7Ozt5QixBQUVNLE8sQUFBTyxPQUFPLEFBQ3BCO1VBQ0MsTUFBQSxjQUFBLGFBQVMsT0FBTyxNQUFoQixBQUFzQixBQUNyQixvQkFBQyxjQUFELFFBQU0sT0FBTixBQUFZLEFBQ1gsbUJBQUEsY0FBQSxNQUFBLE1BREQsQUFDQyxBQUNBLGtDQUFBLEFBQUMsa0JBQWUsVUFBVSxDQUFDLE1BQTNCLEFBQTBCLEFBQU8sWUFBWSxNQUE3QyxBQUFtRCxHQUFHLElBQXRELEFBQTBELElBQUksU0FBUyxLQUh6RSxBQUNDLEFBRUMsQUFBNEUsQUFFN0UsMkJBQUEsY0FBQTtXQUNRLE1BRFIsQUFDYyxBQUNiO2FBQVMsS0FGVixBQUVlLEFBQ1o7QUFGRixXQUVFLEFBQUssTUFBTCxBQUFXLGNBQVosQUFBMEIsSUFBMUIsQUFBK0IsU0FUbkMsQUFDQyxBQUtDLEFBRzBDLEFBRzVDOzs7O2tDLEFBRWUsR0FBRyxBQUNsQjtPQUFJLEtBQUEsQUFBSyxNQUFMLEFBQVcsY0FBZixBQUE2QixHQUFHLEtBQUEsQUFBSyxTQUFTLEVBQUMsV0FBZixBQUFjLEFBQVksQUFDMUQ7Ozs7OEJBRVcsQUFDWDtRQUFBLEFBQUssTUFBTCxBQUFXLE1BQ1YsS0FBQSxBQUFLLE1BQUwsQUFBVyxRQUFRLEtBQUEsQUFBSyxNQUF4QixBQUE4QixXQUFZLEtBQUEsQUFBSyxNQUFMLEFBQVcsY0FEdEQsQUFDQyxBQUFtRSxHQURwRSxBQUN3RSxBQUV4RTs7Ozs7O0VBakNxQixNLEFBQU07O0FBb0M3QixPQUFBLEFBQU8sVUFBUCxBQUFpQjs7Ozs7QUM3Q2pCLElBQ0MsUUFBUSxRQURULEFBQ1MsQUFBUTtJQUVoQixPQUFPLFFBSFIsQUFHUSxBQUFRO0lBRWYsYUFBYSxRQUxkLEFBS2MsQUFBUTtJQUNyQixPQUFPLFFBTlIsQUFNUSxBQUFRO0lBQ2YsUUFBUSxRQVBULEFBT1MsQUFBUTtJQUNoQixRQUFRLFFBUlQsQUFRUyxBQUFROztBQUVqQixTQUFBLEFBQVMsVUFBVCxBQUFtQixPQUFPLEFBQ3pCO0tBQUk7S0FBTyxBQUNOLEFBQ0g7S0FGUyxBQUVOLEFBQ0g7S0FIUyxBQUdOLEFBQ0g7S0FKUyxBQUlOLEFBQ0g7S0FMUyxBQUtOLEFBQ0g7S0FORixBQUFXLEFBTU47QUFOTSxBQUNUO0tBREYsQUFRQyxBQUVEOztRQUFPLElBQUksTUFBWCxBQUFXLEFBQU0sT0FBTztPQUFLLEVBQUwsQUFBSyxBQUFFLElBQVAsQUFBVyxLQUFLLE9BQU8sRUFBL0MsQUFBd0IsQUFBZ0IsQUFBTyxBQUFFO0FBRWpELE9BQUEsQUFBSyxFQUFMLEFBQU8sQUFDUDtNQUFBLEFBQUssRUFBTCxBQUFPLEFBQ1A7TUFBQSxBQUFLLEVBQUwsQUFBTyxBQUNQO01BQUEsQUFBSyxFQUFMLEFBQU8sQUFDUDtNQUFBLEFBQUssRUFBTCxBQUFPLEFBQ1A7TUFBQSxBQUFLLEVBQUwsQUFBTyxBQUVQOztRQUFBLEFBQU8sQUFDUDs7O0FBRUQsT0FBQSxBQUFPLFVBQVUsVUFBQSxBQUFTLE9BQVQsQUFBZ0IsT0FBTyxBQUN2QztLQUFJLE9BQU8sVUFBVSxNQUFyQixBQUFXLEFBQWdCO0tBQzFCLFFBREQsQUFDUyxBQUVUOztLQUFJLEtBQUEsQUFBSyxFQUFULEFBQVcsUUFBUSxNQUFBLEFBQU0sS0FDeEIsTUFBQyxjQUFELFFBQU0sT0FBTyxNQUFBLEFBQU0saUJBQW5CLEFBQWEsQUFBdUIsQUFDbkMsY0FBQSxjQUFBLE1BQUEsTUFERCxBQUNDLEFBQ0EsNEJBQUEsQUFBQyxjQUFXLE1BQU0sS0FIRCxBQUNsQixBQUVDLEFBQXVCLEFBSXpCOztLQUFJLEtBQUEsQUFBSyxFQUFULEFBQVcsUUFBUSxNQUFBLEFBQU0sS0FDeEIsTUFBQyxjQUFELFFBQU0sT0FBTyxNQUFBLEFBQU0saUJBQW5CLEFBQWEsQUFBdUIsQUFDbkMsY0FBQSxjQUFBLE1BQUEsTUFERCxBQUNDLEFBQ0EsK0JBQUEsQUFBQyxjQUFXLE1BQU0sS0FIRCxBQUNsQixBQUVDLEFBQXVCLEFBSXpCOztLQUFJLEtBQUEsQUFBSyxFQUFULEFBQVcsUUFBUSxNQUFBLEFBQU0sS0FDeEIsTUFBQyxjQUFELFFBQU0sT0FBTyxNQUFBLEFBQU0saUJBQW5CLEFBQWEsQUFBdUIsQUFDbkMsY0FBQSxjQUFBLE1BQUEsTUFERCxBQUNDLEFBQ0EsK0JBQUEsQUFBQyxjQUFXLE1BQU0sS0FIRCxBQUNsQixBQUVDLEFBQXVCLEFBSXpCOztLQUFJLEtBQUEsQUFBSyxFQUFULEFBQVcsUUFBUSxNQUFBLEFBQU0sS0FDeEIsTUFBQyxjQUFELFFBQU0sT0FBTyxNQUFBLEFBQU0saUJBQW5CLEFBQWEsQUFBdUIsQUFDbkMsY0FBQSxjQUFBLE1BQUEsTUFERCxBQUNDLEFBQ0EsOEJBQUEsQUFBQyxjQUFXLE1BQU0sS0FIRCxBQUNsQixBQUVDLEFBQXVCLEFBSXpCOztLQUFJLEtBQUEsQUFBSyxFQUFULEFBQVcsUUFBUSxNQUFBLEFBQU0sS0FDeEIsTUFBQyxjQUFELFFBQU0sT0FBTixBQUFZLEFBQ1gsbUJBQUEsY0FBQSxNQUFBLE1BREQsQUFDQyxBQUNBLDhCQUFBLEFBQUMsY0FBVyxNQUFNLEtBSEQsQUFDbEIsQUFFQyxBQUF1QixBQUl6Qjs7S0FBSSxLQUFBLEFBQUssRUFBVCxBQUFXLFFBQVEsTUFBQSxBQUFNLEtBQ3hCLE1BQUMsY0FBRCxRQUFNLE9BQU4sQUFBWSxBQUNYLG1CQUFBLGNBQUEsTUFBQSxNQURELEFBQ0MsQUFDQSw4QkFBQSxBQUFDLGNBQVcsTUFBTSxLQUhELEFBQ2xCLEFBRUMsQUFBdUIsQUFJekI7O1FBQ0MsTUFBQSxjQUFBLGFBQVMsT0FBTyxNQUFoQixBQUFzQixBQUNwQixjQURGLEFBRUMsYUFBQSxjQUFBLFlBQVEsT0FBTyxNQUFmLEFBQXFCLGFBQWEsU0FBUyxtQkFBQTtVQUFNLE1BQU4sQUFBTSxBQUFNO0FBQXZELE9BSEYsQUFDQyxBQUVDLEFBR0Y7QUFwREQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2pDQSxJQUNDLFFBQVEsUUFEVCxBQUNTLEFBQVE7SUFFaEIsT0FBTyxRQUhSLEFBR1EsQUFBUTtJQUVmLE9BQU8sUUFMUixBQUtRLEFBQVE7SUFDZixtQkFBbUIsUUFOcEIsQUFNb0IsQUFBUTtJQUMzQixpQkFBaUIsUUFQbEIsQUFPa0IsQUFBUTtJQUN6QixRQUFRLFFBUlQsQUFRUyxBQUFRO0lBRWhCLFFBQVEsUUFWVCxBQVVTLEFBQVM7O0ksQUFFWjtvQkFDTDs7a0JBQUEsQUFBWSxPQUFaLEFBQW1CLFNBQVM7d0JBQUE7O2dIQUFBLEFBQ3JCLEFBRU47O1FBQUEsQUFBSzthQUFRLEFBQ0YsQUFDVjtrQkFGWSxBQUVHLEFBQ2Y7U0FIWSxBQUdOLEFBQ047U0FKWSxBQUlOLEFBQ047VUFMWSxBQUtMLEFBQ1A7VUFOWSxBQU1MLEFBQ1A7WUFQRCxBQUFhLEFBT0gsQUFHVjtBQVZhLEFBQ1o7O09BSjBCO1NBYzNCOzs7Ozt5QixBQUVNLE8sQUFBTyxPQUFPLEFBQ3BCO09BQUksVUFBVyxNQUFBLEFBQU0sU0FBTixBQUFrQixhQUMzQixNQUFBLEFBQU0sU0FERyxBQUNTLGFBQ2xCLE1BQUEsQUFBTSxVQUZHLEFBRVMsYUFDbEIsTUFBQSxBQUFNLFVBSEcsQUFHUyxhQUNsQixNQUFBLEFBQU0sWUFKWixBQUl3QixBQUN4QjtVQUNDLE1BQUEsY0FBQSxhQUFTLE9BQU8sTUFBaEIsQUFBc0IsQUFDckIsb0JBQUMsY0FBRCxRQUFNLE9BQU8sTUFBYixBQUFtQixBQUNsQix1QkFBQSxjQUFBLE1BQUEsTUFERCxBQUNDLEFBQ0EsaUNBQUEsQUFBQyxvQkFBaUIsVUFBVSxNQUE1QixBQUFrQyxVQUFVLFVBQVUsS0FGdkQsQUFFQyxBQUEyRCxBQUMzRCx1Q0FBQSxBQUFDLGtCQUFlLElBQUksTUFBcEIsQUFBMEIsZUFBZSxVQUFVLENBQUMsS0FBQSxBQUFLLE1BQU4sQUFBWSxNQUFNLEtBQUEsQUFBSyxNQUExRSxBQUFtRCxBQUE2QixPQUFPLE1BQXZGLEFBQTZGLEdBQUcsSUFBaEcsQUFBb0csR0FBRyxTQUFTLEtBSmxILEFBQ0MsQUFHQyxBQUFxSCxBQUV0SCwwQkFBQyxjQUFELFFBQU0sT0FBTixBQUFZLEFBQ1gsbUJBQUEsY0FBQSxNQUFBLE1BREQsQUFDQyxBQUNBLDhCQUFBLEFBQUMsa0JBQWUsVUFBVSxDQUFDLE1BQTNCLEFBQTBCLEFBQU8sUUFBUSxNQUF6QyxBQUErQyxHQUFHLElBQWxELEFBQXNELEdBQUcsU0FBUyxLQVJwRSxBQU1DLEFBRUMsQUFBdUUsQUFFeEUsdUJBQUMsY0FBRCxRQUFNLE9BQU4sQUFBWSxBQUNYLG1CQUFBLGNBQUEsTUFBQSxNQURELEFBQ0MsQUFDQSw4QkFBQSxBQUFDLGtCQUFlLFVBQVUsQ0FBQyxNQUEzQixBQUEwQixBQUFPLFFBQVEsTUFBekMsQUFBK0MsR0FBRyxJQUFsRCxBQUFzRCxHQUFHLFNBQVMsS0FacEUsQUFVQyxBQUVDLEFBQXVFLEFBRXhFLHVCQUFDLGNBQUQsUUFBTSxPQUFOLEFBQVksQUFDWCxtQkFBQSxjQUFBLE1BQUEsTUFERCxBQUNDLEFBQ0EsZ0NBQUEsQUFBQyxrQkFBZSxVQUFVLENBQUMsTUFBM0IsQUFBMEIsQUFBTyxVQUFVLE1BQTNDLEFBQWlELEdBQUcsSUFBcEQsQUFBd0QsSUFBSSxTQUFTLEtBaEJ2RSxBQWNDLEFBRUMsQUFBMEUsQUFFM0UseUJBQUEsY0FBQTtXQUNTLFVBQVUsTUFBVixBQUFnQixpQkFBaUIsTUFEMUMsQUFDZ0QsQUFDL0M7YUFBUyxLQUZWLEFBRWUsQUFDZDtjQUhELEFBR1c7QUFGVixNQXBCSCxBQUNDLEFBa0JDLEFBT0Y7Ozs7aUMsQUFFYyxHQUFHLEFBQ2pCO1FBQUEsQUFBSztjQUFTLEFBQ0gsQUFDVjttQkFBZSxNQUFBLEFBQU0saUJBRnRCLEFBQWMsQUFFRSxBQUF1QixBQUV2QztBQUpjLEFBQ2I7Ozs7aUMsQUFLYSxHQUFHLEFBQ2pCO09BQUk7VUFDRyxLQUFBLEFBQUssTUFEQSxBQUNNLEFBQ2pCO1VBQU0sS0FBQSxBQUFLLE1BRlosQUFBWSxBQUVNLEFBR2xCO0FBTFksQUFDWDs7T0FJRyxNQUFBLEFBQU0sU0FBVixBQUFtQixHQUFHLE1BQUEsQUFBTSxPQUE1QixBQUFzQixBQUFhLGVBQzlCLElBQUksTUFBQSxBQUFNLFNBQVYsQUFBbUIsR0FBRyxNQUFBLEFBQU0sT0FBNUIsQUFBc0IsQUFBYSxlQUNuQyxJQUFJLE1BQUEsQUFBTSxTQUFWLEFBQW1CLFdBQVcsTUFBQSxBQUFNLE9BQXBDLEFBQThCLEFBQWEsT0FDM0MsSUFBSSxNQUFBLEFBQU0sUUFBVixBQUFrQixXQUFXLE1BQUEsQUFBTSxPQUFOLEFBQWEsQUFFL0M7O1FBQUEsQUFBSyxTQUFMLEFBQWMsQUFDZDs7Ozs4QixBQUVXLEdBQUcsQUFDZDtPQUFJLEtBQUEsQUFBSyxNQUFMLEFBQVcsVUFBZixBQUF5QixHQUFHLEtBQUEsQUFBSyxTQUFTLEVBQUMsT0FBZixBQUFjLEFBQVEsQUFDbEQ7Ozs7OEIsQUFFVyxHQUFHLEFBQ2Q7T0FBSSxLQUFBLEFBQUssTUFBTCxBQUFXLFVBQWYsQUFBeUIsR0FBRyxLQUFBLEFBQUssU0FBUyxFQUFDLE9BQWYsQUFBYyxBQUFRLEFBQ2xEOzs7O2dDLEFBRWEsR0FBRyxBQUNoQjtPQUFJLEtBQUEsQUFBSyxNQUFMLEFBQVcsWUFBZixBQUEyQixHQUFHLEtBQUEsQUFBSyxTQUFTLEVBQUMsU0FBZixBQUFjLEFBQVUsQUFDdEQ7Ozs7OEJBRVcsQUFDWDtRQUFBLEFBQUssTUFBTCxBQUFXLE1BQ1YsTUFBQSxBQUFNLFNBQVMsS0FBQSxBQUFLLE1BQUwsQUFBVyxXQUFXLEtBQUEsQUFBSyxNQUExQyxBQUFnRCxNQUFNLEtBQUEsQUFBSyxNQUFMLEFBQVcsV0FBVyxLQUFBLEFBQUssTUFBakYsQUFBdUYsTUFBTSxNQUFNLEtBQUEsQUFBSyxNQUF4RyxBQUE4RyxPQUFPLE1BQU0sS0FBQSxBQUFLLE1BQWhJLEFBQXNJLE9BQU8sS0FBQSxBQUFLLE1BRG5KLEFBQ0MsQUFBd0osQUFFeko7Ozs7O0VBeEZvQixNLEFBQU07O0FBMkY1QixPQUFBLEFBQU8sVUFBUCxBQUFpQjs7Ozs7QUN2R2pCO0FBQ0E7QUFDQTs7QUFDQSxJQUFJLE9BQU8sT0FBUCxBQUFjLFVBQWxCLEFBQTRCLFlBQVksQUFDdkM7UUFBQSxBQUFPLFNBQVMsVUFBQSxBQUFTLFFBQVQsQUFBaUIsU0FBUyxBQUFFO0FBQzNDO0FBQ0E7O01BQUksVUFBSixBQUFjLE1BQU0sQUFBRTtBQUNyQjtTQUFNLElBQUEsQUFBSSxVQUFWLEFBQU0sQUFBYyxBQUNwQjtBQUVEOztNQUFJLEtBQUssT0FBVCxBQUFTLEFBQU8sQUFFaEI7O09BQUssSUFBSSxRQUFULEFBQWlCLEdBQUcsUUFBUSxVQUE1QixBQUFzQyxRQUF0QyxBQUE4QyxTQUFTLEFBQ3REO09BQUksYUFBYSxVQUFqQixBQUFpQixBQUFVLEFBRTNCOztPQUFJLGNBQUosQUFBa0IsTUFBTSxBQUFFO0FBQ3pCO1NBQUssSUFBTCxBQUFTLFdBQVQsQUFBb0IsWUFBWSxBQUMvQjtBQUNBO1NBQUksT0FBQSxBQUFPLFVBQVAsQUFBaUIsZUFBakIsQUFBZ0MsS0FBaEMsQUFBcUMsWUFBekMsQUFBSSxBQUFpRCxVQUFVLEFBQzlEO1NBQUEsQUFBRyxXQUFXLFdBQWQsQUFBYyxBQUFXLEFBQ3pCO0FBQ0Q7QUFDRDtBQUNEO0FBQ0Q7U0FBQSxBQUFPLEFBQ1A7QUFyQkQsQUFzQkE7Ozs7OztBQzFCRCxTQUFBLEFBQVMsWUFBWSxBQUNwQjtRQUFPLENBQUEsQUFDTixNQURNLEFBRU4sTUFGTSxBQUdOLE1BSE0sQUFJTixNQUpNLEFBS04sTUFMTSxBQU1OLE1BTk0sQUFPTixNQVBNLEFBUU4sTUFSTSxBQVNOLE1BVE0sQUFVTixNQVZNLEFBV04sTUFYTSxBQVlOLE1BWk0sQUFhTixNQWJNLEFBY04sTUFkTSxBQWVOLE1BZk0sQUFnQk4sTUFoQk0sQUFpQk4sTUFqQk0sQUFrQk4sTUFsQk0sQUFtQk4sTUFuQk0sQUFvQk4sTUFwQk0sQUFxQk4sTUFyQk0sQUFzQk4sTUF0Qk0sQUF1Qk4sTUF2Qk0sQUF3Qk4sTUF4Qk0sQUF5Qk4sTUF6Qk0sQUEwQk4sTUExQk0sQUEyQk4sTUEzQk0sQUE0Qk4sTUE1Qk0sQUE2Qk4sTUE3Qk0sQUE4Qk4sTUE5Qk0sQUErQk4sTUEvQk0sQUFnQ04sTUFoQ00sQUFpQ04sTUFqQ00sQUFrQ04sTUFsQ00sQUFtQ04sTUFuQ00sQUFvQ04sTUFwQ00sQUFxQ04sTUFyQ00sQUFzQ04sTUF0Q00sQUF1Q04sTUF2Q00sQUF3Q04sTUF4Q00sQUF5Q04sTUF6Q00sQUEwQ04sTUExQ00sQUEyQ04sTUEzQ00sQUE0Q04sTUE1Q00sQUE2Q04sTUE3Q00sQUE4Q04sTUE5Q00sQUErQ04sTUEvQ00sQUFnRE4sTUFoRE0sQUFpRE4sTUFqREQsQUFBTyxBQWtETixBQUVEOzs7QUFFRCxTQUFBLEFBQVMsbUJBQVQsQUFBNEIsTUFBTSxBQUNqQztLQUFBLEFBQUssTUFBTCxBQUFXLEdBQVgsQUFBYyxBQUVkOztLQUFJLEtBQUosQUFBUyxBQUNUO1FBQUEsQUFBTSxHQUFHLEFBQ1I7TUFBSyxLQUFBLEFBQUssV0FBTixBQUFpQixPQUFyQixBQUE2QixBQUU3Qjs7U0FBTyxLQUFQLEFBQU8sQUFBSyxBQUNaO09BQUEsQUFBSyxLQUFLLEtBQVYsQUFBVSxBQUFLLEFBQ2Y7T0FBQSxBQUFLLEtBQUwsQUFBVSxBQUNWO0FBQ0Q7OztBQUVELFNBQUEsQUFBUyxRQUFULEFBQWlCLE1BQWpCLEFBQXVCLE9BQU8sQUFDN0I7UUFBQSxBQUFPLFNBQVM7cUJBQWhCLEFBQWdCLEFBQW1CO0FBQ25DOzs7QUFFRCxTQUFBLEFBQVMsVUFBVCxBQUFtQixXQUFXLEFBQzdCO1FBQU8sWUFBWSxLQUFuQixBQUF3QixRQUFRO09BQWhDLEFBQWdDLEFBQUs7QUFDckMsU0FBQSxBQUFPLEFBQ1A7OztBQUVELFNBQUEsQUFBUyxTQUFULEFBQWtCLE1BQWxCLEFBQXdCLE1BQXhCLEFBQThCLE9BQTlCLEFBQXFDLE9BQXJDLEFBQTRDLFNBQVMsQUFDcEQ7S0FBSSxPQUFKLEFBQVc7S0FDVixRQURELEFBQ1M7S0FEVCxBQUVDLEFBRUQ7O0tBQUksS0FBQSxBQUFLLFFBQVQsQUFBSSxBQUFhLEFBQ2pCO0tBQUksTUFBTSxDQUFWLEFBQVcsR0FBRyxNQUFBLEFBQU0sS0FBSyxLQUFBLEFBQUssT0FBTCxBQUFZLEdBQVosQUFBZSxHQUF4QyxBQUFjLEFBQVcsQUFBa0IsU0FDdEMsTUFBTSxlQUFBLEFBQWUsT0FBckIsQUFBNEIsQUFFakM7O0tBQUksS0FBQSxBQUFLLFFBQVQsQUFBSSxBQUFhLEFBQ2pCO0tBQUksTUFBTSxDQUFWLEFBQVcsR0FBRyxNQUFBLEFBQU0sS0FBSyxLQUFBLEFBQUssT0FBTCxBQUFZLEdBQVosQUFBZSxHQUF4QyxBQUFjLEFBQVcsQUFBa0IsU0FDdEMsTUFBTSxlQUFBLEFBQWUsT0FBckIsQUFBNEIsQUFFakM7O0tBQUksS0FBQSxBQUFLLFFBQVQsQUFBSSxBQUFhLEFBQ2pCO0tBQUksTUFBTSxDQUFWLEFBQVcsR0FBRyxNQUFBLEFBQU0sS0FBSyxLQUFBLEFBQUssT0FBTCxBQUFZLEdBQVosQUFBZSxHQUF4QyxBQUFjLEFBQVcsQUFBa0IsU0FDdEMsTUFBTSxZQUFBLEFBQVksUUFBbEIsQUFBMEIsQUFFL0I7O0tBQUksS0FBQSxBQUFLLFFBQVQsQUFBSSxBQUFhLEFBQ2pCO0tBQUksTUFBTSxDQUFWLEFBQVcsR0FBRyxNQUFBLEFBQU0sS0FBSyxLQUFBLEFBQUssT0FBTCxBQUFZLEdBQVosQUFBZSxHQUF4QyxBQUFjLEFBQVcsQUFBa0IsU0FDdEMsTUFBTSxZQUFBLEFBQVksUUFBbEIsQUFBMEIsQUFFL0I7O1NBQUEsQUFBUSxNQUFSLEFBQWMsQUFFZDs7UUFBQSxBQUFPLFdBQVcsQUFDakI7TUFBSyxLQUFBLEFBQUssV0FBVyxLQUFqQixBQUFzQixVQUExQixBQUFxQyxBQUNyQztRQUFBLEFBQU0sS0FBSyxLQUFBLEFBQUssT0FBTCxBQUFZLEdBQVosQUFBZSxHQUExQixBQUFXLEFBQWtCLEFBQzdCO0FBRUQ7O1NBQUEsQUFBUSxPQUFSLEFBQWUsQUFFZjs7UUFBTyxVQUFBLEFBQVUsS0FBakIsQUFBTyxBQUFlLEFBQ3RCOzs7QUFFRCxTQUFBLEFBQVMsaUJBQVQsQUFBMEIsR0FBRyxBQUM1QjtTQUFBLEFBQVEsQUFDUDtPQUFBLEFBQUssQUFBSztVQUFBLEFBQU8sQUFDakI7T0FBQSxBQUFLLEFBQUs7VUFBQSxBQUFPLEFBQ2pCO09BQUEsQUFBSyxBQUFLO1VBQUEsQUFBTyxBQUNqQjtPQUFBLEFBQUssQUFBSztVQUpYLEFBSVcsQUFBTyxBQUVsQjs7OztBQUVELE9BQUEsQUFBTyxVQUFVLEVBQUUsVUFBRixBQUFZLFVBQVUsa0JBQXZDLEFBQWlCLEFBQXdDOzs7OztBQ3ZIekQsT0FBQSxBQUFPOztXQUNNLEFBQ0YsQUFDVDtpQkFGVyxBQUVJLEFBQ2Y7a0JBSFcsQUFHSyxBQUNoQjtjQUxlLEFBQ0osQUFJQyxBQUViO0FBTlksQUFDWDs7U0FLWSxBQUNMLEFBQ1A7VUFGWSxBQUVKLEFBQ1I7Y0FIWSxBQUdBLEFBQ1o7WUFKWSxBQUlGLEFBQ1Y7VUFMWSxBQUtKLEFBQ1I7V0FOWSxBQU1ILEFBQ1Q7U0FQWSxBQU9MLEFBQ1A7bUJBZmUsQUFPSCxBQVFLLEFBRWxCO0FBVmEsQUFDWjs7U0FTZSxBQUNSLEFBQ1A7VUFGZSxBQUVQLEFBQ1I7Y0FIZSxBQUdILEFBQ1o7WUFKZSxBQUlMLEFBQ1Y7VUFMZSxBQUtQLEFBQ1I7V0FOZSxBQU1OLEFBQ1Q7U0FQZSxBQU9SLEFBQ1A7bUJBekJlLEFBaUJBLEFBUUUsQUFFbEI7QUFWZ0IsQUFDZjs7U0FTVSxBQUNILEFBQ1A7V0FGVSxBQUVELEFBQ1Q7a0JBSFUsQUFHTSxBQUNoQjtZQUpVLEFBSUEsQUFDVjtnQkFoQ2UsQUEyQkwsQUFLSSxBQUVmO0FBUFcsQUFDVjs7VUFNYSxBQUNMLEFBQ1I7V0FGYSxBQUVKLEFBQ1Q7WUFIYSxBQUdILEFBQ1Y7Y0FKYSxBQUlELEFBQ1o7VUFMYSxBQUtMLEFBQ1I7bUJBeENlLEFBa0NGLEFBTUksQUFFbEI7QUFSYyxBQUNiOztXQU9VLEFBQ0QsQUFDVDtVQUZVLEFBRUYsQUFDUjtjQTdDZSxBQTBDTCxBQUdFLEFBRWI7QUFMVyxBQUNWOztnQkFJSyxBQUNTLEFBQ2Q7U0FGSyxBQUVFLEFBQ1A7Z0JBSEssQUFHUyxBQUNkO1dBSkssQUFJSSxBQUNUO2lCQUxLLEFBS1UsQUFDZjtjQU5LLEFBTU8sQUFDWjtrQkF0RGUsQUErQ1YsQUFPVyxBQUVqQjtBQVRNLEFBQ0w7O1NBUUksQUFDRyxBQUNQO1VBMURGLEFBQWlCLEFBd0RYLEFBRUk7QUFGSixBQUNKO0FBekRlLEFBQ2hCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiFmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgZnVuY3Rpb24gVk5vZGUoKSB7fVxuICAgIGZ1bmN0aW9uIGgobm9kZU5hbWUsIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgdmFyIGxhc3RTaW1wbGUsIGNoaWxkLCBzaW1wbGUsIGksIGNoaWxkcmVuID0gRU1QVFlfQ0hJTERSRU47XG4gICAgICAgIGZvciAoaSA9IGFyZ3VtZW50cy5sZW5ndGg7IGktLSA+IDI7ICkgc3RhY2sucHVzaChhcmd1bWVudHNbaV0pO1xuICAgICAgICBpZiAoYXR0cmlidXRlcyAmJiBudWxsICE9IGF0dHJpYnV0ZXMuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgIGlmICghc3RhY2subGVuZ3RoKSBzdGFjay5wdXNoKGF0dHJpYnV0ZXMuY2hpbGRyZW4pO1xuICAgICAgICAgICAgZGVsZXRlIGF0dHJpYnV0ZXMuY2hpbGRyZW47XG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUgKHN0YWNrLmxlbmd0aCkgaWYgKChjaGlsZCA9IHN0YWNrLnBvcCgpKSAmJiB2b2lkIDAgIT09IGNoaWxkLnBvcCkgZm9yIChpID0gY2hpbGQubGVuZ3RoOyBpLS07ICkgc3RhY2sucHVzaChjaGlsZFtpXSk7IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGNoaWxkID09PSAhMCB8fCBjaGlsZCA9PT0gITEpIGNoaWxkID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChzaW1wbGUgPSAnZnVuY3Rpb24nICE9IHR5cGVvZiBub2RlTmFtZSkgaWYgKG51bGwgPT0gY2hpbGQpIGNoaWxkID0gJyc7IGVsc2UgaWYgKCdudW1iZXInID09IHR5cGVvZiBjaGlsZCkgY2hpbGQgPSBTdHJpbmcoY2hpbGQpOyBlbHNlIGlmICgnc3RyaW5nJyAhPSB0eXBlb2YgY2hpbGQpIHNpbXBsZSA9ICExO1xuICAgICAgICAgICAgaWYgKHNpbXBsZSAmJiBsYXN0U2ltcGxlKSBjaGlsZHJlbltjaGlsZHJlbi5sZW5ndGggLSAxXSArPSBjaGlsZDsgZWxzZSBpZiAoY2hpbGRyZW4gPT09IEVNUFRZX0NISUxEUkVOKSBjaGlsZHJlbiA9IFsgY2hpbGQgXTsgZWxzZSBjaGlsZHJlbi5wdXNoKGNoaWxkKTtcbiAgICAgICAgICAgIGxhc3RTaW1wbGUgPSBzaW1wbGU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHAgPSBuZXcgVk5vZGUoKTtcbiAgICAgICAgcC5ub2RlTmFtZSA9IG5vZGVOYW1lO1xuICAgICAgICBwLmNoaWxkcmVuID0gY2hpbGRyZW47XG4gICAgICAgIHAuYXR0cmlidXRlcyA9IG51bGwgPT0gYXR0cmlidXRlcyA/IHZvaWQgMCA6IGF0dHJpYnV0ZXM7XG4gICAgICAgIHAua2V5ID0gbnVsbCA9PSBhdHRyaWJ1dGVzID8gdm9pZCAwIDogYXR0cmlidXRlcy5rZXk7XG4gICAgICAgIGlmICh2b2lkIDAgIT09IG9wdGlvbnMudm5vZGUpIG9wdGlvbnMudm5vZGUocCk7XG4gICAgICAgIHJldHVybiBwO1xuICAgIH1cbiAgICBmdW5jdGlvbiBleHRlbmQob2JqLCBwcm9wcykge1xuICAgICAgICBmb3IgKHZhciBpIGluIHByb3BzKSBvYmpbaV0gPSBwcm9wc1tpXTtcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG4gICAgZnVuY3Rpb24gY2xvbmVFbGVtZW50KHZub2RlLCBwcm9wcykge1xuICAgICAgICByZXR1cm4gaCh2bm9kZS5ub2RlTmFtZSwgZXh0ZW5kKGV4dGVuZCh7fSwgdm5vZGUuYXR0cmlidXRlcyksIHByb3BzKSwgYXJndW1lbnRzLmxlbmd0aCA+IDIgPyBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMikgOiB2bm9kZS5jaGlsZHJlbik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGVucXVldWVSZW5kZXIoY29tcG9uZW50KSB7XG4gICAgICAgIGlmICghY29tcG9uZW50Ll9fZCAmJiAoY29tcG9uZW50Ll9fZCA9ICEwKSAmJiAxID09IGl0ZW1zLnB1c2goY29tcG9uZW50KSkgKG9wdGlvbnMuZGVib3VuY2VSZW5kZXJpbmcgfHwgc2V0VGltZW91dCkocmVyZW5kZXIpO1xuICAgIH1cbiAgICBmdW5jdGlvbiByZXJlbmRlcigpIHtcbiAgICAgICAgdmFyIHAsIGxpc3QgPSBpdGVtcztcbiAgICAgICAgaXRlbXMgPSBbXTtcbiAgICAgICAgd2hpbGUgKHAgPSBsaXN0LnBvcCgpKSBpZiAocC5fX2QpIHJlbmRlckNvbXBvbmVudChwKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaXNTYW1lTm9kZVR5cGUobm9kZSwgdm5vZGUsIGh5ZHJhdGluZykge1xuICAgICAgICBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIHZub2RlIHx8ICdudW1iZXInID09IHR5cGVvZiB2bm9kZSkgcmV0dXJuIHZvaWQgMCAhPT0gbm9kZS5zcGxpdFRleHQ7XG4gICAgICAgIGlmICgnc3RyaW5nJyA9PSB0eXBlb2Ygdm5vZGUubm9kZU5hbWUpIHJldHVybiAhbm9kZS5fY29tcG9uZW50Q29uc3RydWN0b3IgJiYgaXNOYW1lZE5vZGUobm9kZSwgdm5vZGUubm9kZU5hbWUpOyBlbHNlIHJldHVybiBoeWRyYXRpbmcgfHwgbm9kZS5fY29tcG9uZW50Q29uc3RydWN0b3IgPT09IHZub2RlLm5vZGVOYW1lO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpc05hbWVkTm9kZShub2RlLCBub2RlTmFtZSkge1xuICAgICAgICByZXR1cm4gbm9kZS5fX24gPT09IG5vZGVOYW1lIHx8IG5vZGUubm9kZU5hbWUudG9Mb3dlckNhc2UoKSA9PT0gbm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZ2V0Tm9kZVByb3BzKHZub2RlKSB7XG4gICAgICAgIHZhciBwcm9wcyA9IGV4dGVuZCh7fSwgdm5vZGUuYXR0cmlidXRlcyk7XG4gICAgICAgIHByb3BzLmNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW47XG4gICAgICAgIHZhciBkZWZhdWx0UHJvcHMgPSB2bm9kZS5ub2RlTmFtZS5kZWZhdWx0UHJvcHM7XG4gICAgICAgIGlmICh2b2lkIDAgIT09IGRlZmF1bHRQcm9wcykgZm9yICh2YXIgaSBpbiBkZWZhdWx0UHJvcHMpIGlmICh2b2lkIDAgPT09IHByb3BzW2ldKSBwcm9wc1tpXSA9IGRlZmF1bHRQcm9wc1tpXTtcbiAgICAgICAgcmV0dXJuIHByb3BzO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjcmVhdGVOb2RlKG5vZGVOYW1lLCBpc1N2Zykge1xuICAgICAgICB2YXIgbm9kZSA9IGlzU3ZnID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsIG5vZGVOYW1lKSA6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobm9kZU5hbWUpO1xuICAgICAgICBub2RlLl9fbiA9IG5vZGVOYW1lO1xuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcmVtb3ZlTm9kZShub2RlKSB7XG4gICAgICAgIGlmIChub2RlLnBhcmVudE5vZGUpIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gc2V0QWNjZXNzb3Iobm9kZSwgbmFtZSwgb2xkLCB2YWx1ZSwgaXNTdmcpIHtcbiAgICAgICAgaWYgKCdjbGFzc05hbWUnID09PSBuYW1lKSBuYW1lID0gJ2NsYXNzJztcbiAgICAgICAgaWYgKCdrZXknID09PSBuYW1lKSA7IGVsc2UgaWYgKCdyZWYnID09PSBuYW1lKSB7XG4gICAgICAgICAgICBpZiAob2xkKSBvbGQobnVsbCk7XG4gICAgICAgICAgICBpZiAodmFsdWUpIHZhbHVlKG5vZGUpO1xuICAgICAgICB9IGVsc2UgaWYgKCdjbGFzcycgPT09IG5hbWUgJiYgIWlzU3ZnKSBub2RlLmNsYXNzTmFtZSA9IHZhbHVlIHx8ICcnOyBlbHNlIGlmICgnc3R5bGUnID09PSBuYW1lKSB7XG4gICAgICAgICAgICBpZiAoIXZhbHVlIHx8ICdzdHJpbmcnID09IHR5cGVvZiB2YWx1ZSB8fCAnc3RyaW5nJyA9PSB0eXBlb2Ygb2xkKSBub2RlLnN0eWxlLmNzc1RleHQgPSB2YWx1ZSB8fCAnJztcbiAgICAgICAgICAgIGlmICh2YWx1ZSAmJiAnb2JqZWN0JyA9PSB0eXBlb2YgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoJ3N0cmluZycgIT0gdHlwZW9mIG9sZCkgZm9yICh2YXIgaSBpbiBvbGQpIGlmICghKGkgaW4gdmFsdWUpKSBub2RlLnN0eWxlW2ldID0gJyc7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiB2YWx1ZSkgbm9kZS5zdHlsZVtpXSA9ICdudW1iZXInID09IHR5cGVvZiB2YWx1ZVtpXSAmJiBJU19OT05fRElNRU5TSU9OQUwudGVzdChpKSA9PT0gITEgPyB2YWx1ZVtpXSArICdweCcgOiB2YWx1ZVtpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICgnZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUwnID09PSBuYW1lKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUpIG5vZGUuaW5uZXJIVE1MID0gdmFsdWUuX19odG1sIHx8ICcnO1xuICAgICAgICB9IGVsc2UgaWYgKCdvJyA9PSBuYW1lWzBdICYmICduJyA9PSBuYW1lWzFdKSB7XG4gICAgICAgICAgICB2YXIgdXNlQ2FwdHVyZSA9IG5hbWUgIT09IChuYW1lID0gbmFtZS5yZXBsYWNlKC9DYXB0dXJlJC8sICcnKSk7XG4gICAgICAgICAgICBuYW1lID0gbmFtZS50b0xvd2VyQ2FzZSgpLnN1YnN0cmluZygyKTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICghb2xkKSBub2RlLmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgZXZlbnRQcm94eSwgdXNlQ2FwdHVyZSk7XG4gICAgICAgICAgICB9IGVsc2Ugbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIGV2ZW50UHJveHksIHVzZUNhcHR1cmUpO1xuICAgICAgICAgICAgKG5vZGUuX19sIHx8IChub2RlLl9fbCA9IHt9KSlbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIGlmICgnbGlzdCcgIT09IG5hbWUgJiYgJ3R5cGUnICE9PSBuYW1lICYmICFpc1N2ZyAmJiBuYW1lIGluIG5vZGUpIHtcbiAgICAgICAgICAgIHNldFByb3BlcnR5KG5vZGUsIG5hbWUsIG51bGwgPT0gdmFsdWUgPyAnJyA6IHZhbHVlKTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZhbHVlIHx8IHZhbHVlID09PSAhMSkgbm9kZS5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgbnMgPSBpc1N2ZyAmJiBuYW1lICE9PSAobmFtZSA9IG5hbWUucmVwbGFjZSgvXnhsaW5rXFw6Py8sICcnKSk7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2YWx1ZSB8fCB2YWx1ZSA9PT0gITEpIGlmIChucykgbm9kZS5yZW1vdmVBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsIG5hbWUudG9Mb3dlckNhc2UoKSk7IGVsc2Ugbm9kZS5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7IGVsc2UgaWYgKCdmdW5jdGlvbicgIT0gdHlwZW9mIHZhbHVlKSBpZiAobnMpIG5vZGUuc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCBuYW1lLnRvTG93ZXJDYXNlKCksIHZhbHVlKTsgZWxzZSBub2RlLnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gc2V0UHJvcGVydHkobm9kZSwgbmFtZSwgdmFsdWUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIG5vZGVbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICB9XG4gICAgZnVuY3Rpb24gZXZlbnRQcm94eShlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fbFtlLnR5cGVdKG9wdGlvbnMuZXZlbnQgJiYgb3B0aW9ucy5ldmVudChlKSB8fCBlKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZmx1c2hNb3VudHMoKSB7XG4gICAgICAgIHZhciBjO1xuICAgICAgICB3aGlsZSAoYyA9IG1vdW50cy5wb3AoKSkge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuYWZ0ZXJNb3VudCkgb3B0aW9ucy5hZnRlck1vdW50KGMpO1xuICAgICAgICAgICAgaWYgKGMuY29tcG9uZW50RGlkTW91bnQpIGMuY29tcG9uZW50RGlkTW91bnQoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBkaWZmKGRvbSwgdm5vZGUsIGNvbnRleHQsIG1vdW50QWxsLCBwYXJlbnQsIGNvbXBvbmVudFJvb3QpIHtcbiAgICAgICAgaWYgKCFkaWZmTGV2ZWwrKykge1xuICAgICAgICAgICAgaXNTdmdNb2RlID0gbnVsbCAhPSBwYXJlbnQgJiYgdm9pZCAwICE9PSBwYXJlbnQub3duZXJTVkdFbGVtZW50O1xuICAgICAgICAgICAgaHlkcmF0aW5nID0gbnVsbCAhPSBkb20gJiYgISgnX19wcmVhY3RhdHRyXycgaW4gZG9tKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmV0ID0gaWRpZmYoZG9tLCB2bm9kZSwgY29udGV4dCwgbW91bnRBbGwsIGNvbXBvbmVudFJvb3QpO1xuICAgICAgICBpZiAocGFyZW50ICYmIHJldC5wYXJlbnROb2RlICE9PSBwYXJlbnQpIHBhcmVudC5hcHBlbmRDaGlsZChyZXQpO1xuICAgICAgICBpZiAoIS0tZGlmZkxldmVsKSB7XG4gICAgICAgICAgICBoeWRyYXRpbmcgPSAhMTtcbiAgICAgICAgICAgIGlmICghY29tcG9uZW50Um9vdCkgZmx1c2hNb3VudHMoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICBmdW5jdGlvbiBpZGlmZihkb20sIHZub2RlLCBjb250ZXh0LCBtb3VudEFsbCwgY29tcG9uZW50Um9vdCkge1xuICAgICAgICB2YXIgb3V0ID0gZG9tLCBwcmV2U3ZnTW9kZSA9IGlzU3ZnTW9kZTtcbiAgICAgICAgaWYgKG51bGwgPT0gdm5vZGUpIHZub2RlID0gJyc7XG4gICAgICAgIGlmICgnc3RyaW5nJyA9PSB0eXBlb2Ygdm5vZGUpIHtcbiAgICAgICAgICAgIGlmIChkb20gJiYgdm9pZCAwICE9PSBkb20uc3BsaXRUZXh0ICYmIGRvbS5wYXJlbnROb2RlICYmICghZG9tLl9jb21wb25lbnQgfHwgY29tcG9uZW50Um9vdCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoZG9tLm5vZGVWYWx1ZSAhPSB2bm9kZSkgZG9tLm5vZGVWYWx1ZSA9IHZub2RlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvdXQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh2bm9kZSk7XG4gICAgICAgICAgICAgICAgaWYgKGRvbSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZG9tLnBhcmVudE5vZGUpIGRvbS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChvdXQsIGRvbSk7XG4gICAgICAgICAgICAgICAgICAgIHJlY29sbGVjdE5vZGVUcmVlKGRvbSwgITApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG91dC5fX3ByZWFjdGF0dHJfID0gITA7XG4gICAgICAgICAgICByZXR1cm4gb3V0O1xuICAgICAgICB9XG4gICAgICAgIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiB2bm9kZS5ub2RlTmFtZSkgcmV0dXJuIGJ1aWxkQ29tcG9uZW50RnJvbVZOb2RlKGRvbSwgdm5vZGUsIGNvbnRleHQsIG1vdW50QWxsKTtcbiAgICAgICAgaXNTdmdNb2RlID0gJ3N2ZycgPT09IHZub2RlLm5vZGVOYW1lID8gITAgOiAnZm9yZWlnbk9iamVjdCcgPT09IHZub2RlLm5vZGVOYW1lID8gITEgOiBpc1N2Z01vZGU7XG4gICAgICAgIGlmICghZG9tIHx8ICFpc05hbWVkTm9kZShkb20sIFN0cmluZyh2bm9kZS5ub2RlTmFtZSkpKSB7XG4gICAgICAgICAgICBvdXQgPSBjcmVhdGVOb2RlKFN0cmluZyh2bm9kZS5ub2RlTmFtZSksIGlzU3ZnTW9kZSk7XG4gICAgICAgICAgICBpZiAoZG9tKSB7XG4gICAgICAgICAgICAgICAgd2hpbGUgKGRvbS5maXJzdENoaWxkKSBvdXQuYXBwZW5kQ2hpbGQoZG9tLmZpcnN0Q2hpbGQpO1xuICAgICAgICAgICAgICAgIGlmIChkb20ucGFyZW50Tm9kZSkgZG9tLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG91dCwgZG9tKTtcbiAgICAgICAgICAgICAgICByZWNvbGxlY3ROb2RlVHJlZShkb20sICEwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgZmMgPSBvdXQuZmlyc3RDaGlsZCwgcHJvcHMgPSBvdXQuX19wcmVhY3RhdHRyXyB8fCAob3V0Ll9fcHJlYWN0YXR0cl8gPSB7fSksIHZjaGlsZHJlbiA9IHZub2RlLmNoaWxkcmVuO1xuICAgICAgICBpZiAoIWh5ZHJhdGluZyAmJiB2Y2hpbGRyZW4gJiYgMSA9PT0gdmNoaWxkcmVuLmxlbmd0aCAmJiAnc3RyaW5nJyA9PSB0eXBlb2YgdmNoaWxkcmVuWzBdICYmIG51bGwgIT0gZmMgJiYgdm9pZCAwICE9PSBmYy5zcGxpdFRleHQgJiYgbnVsbCA9PSBmYy5uZXh0U2libGluZykge1xuICAgICAgICAgICAgaWYgKGZjLm5vZGVWYWx1ZSAhPSB2Y2hpbGRyZW5bMF0pIGZjLm5vZGVWYWx1ZSA9IHZjaGlsZHJlblswXTtcbiAgICAgICAgfSBlbHNlIGlmICh2Y2hpbGRyZW4gJiYgdmNoaWxkcmVuLmxlbmd0aCB8fCBudWxsICE9IGZjKSBpbm5lckRpZmZOb2RlKG91dCwgdmNoaWxkcmVuLCBjb250ZXh0LCBtb3VudEFsbCwgaHlkcmF0aW5nIHx8IG51bGwgIT0gcHJvcHMuZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUwpO1xuICAgICAgICBkaWZmQXR0cmlidXRlcyhvdXQsIHZub2RlLmF0dHJpYnV0ZXMsIHByb3BzKTtcbiAgICAgICAgaXNTdmdNb2RlID0gcHJldlN2Z01vZGU7XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlubmVyRGlmZk5vZGUoZG9tLCB2Y2hpbGRyZW4sIGNvbnRleHQsIG1vdW50QWxsLCBpc0h5ZHJhdGluZykge1xuICAgICAgICB2YXIgaiwgYywgdmNoaWxkLCBjaGlsZCwgb3JpZ2luYWxDaGlsZHJlbiA9IGRvbS5jaGlsZE5vZGVzLCBjaGlsZHJlbiA9IFtdLCBrZXllZCA9IHt9LCBrZXllZExlbiA9IDAsIG1pbiA9IDAsIGxlbiA9IG9yaWdpbmFsQ2hpbGRyZW4ubGVuZ3RoLCBjaGlsZHJlbkxlbiA9IDAsIHZsZW4gPSB2Y2hpbGRyZW4gPyB2Y2hpbGRyZW4ubGVuZ3RoIDogMDtcbiAgICAgICAgaWYgKDAgIT09IGxlbikgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgdmFyIF9jaGlsZCA9IG9yaWdpbmFsQ2hpbGRyZW5baV0sIHByb3BzID0gX2NoaWxkLl9fcHJlYWN0YXR0cl8sIGtleSA9IHZsZW4gJiYgcHJvcHMgPyBfY2hpbGQuX2NvbXBvbmVudCA/IF9jaGlsZC5fY29tcG9uZW50Ll9fayA6IHByb3BzLmtleSA6IG51bGw7XG4gICAgICAgICAgICBpZiAobnVsbCAhPSBrZXkpIHtcbiAgICAgICAgICAgICAgICBrZXllZExlbisrO1xuICAgICAgICAgICAgICAgIGtleWVkW2tleV0gPSBfY2hpbGQ7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHByb3BzIHx8ICh2b2lkIDAgIT09IF9jaGlsZC5zcGxpdFRleHQgPyBpc0h5ZHJhdGluZyA/IF9jaGlsZC5ub2RlVmFsdWUudHJpbSgpIDogITAgOiBpc0h5ZHJhdGluZykpIGNoaWxkcmVuW2NoaWxkcmVuTGVuKytdID0gX2NoaWxkO1xuICAgICAgICB9XG4gICAgICAgIGlmICgwICE9PSB2bGVuKSBmb3IgKHZhciBpID0gMDsgaSA8IHZsZW47IGkrKykge1xuICAgICAgICAgICAgdmNoaWxkID0gdmNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgY2hpbGQgPSBudWxsO1xuICAgICAgICAgICAgdmFyIGtleSA9IHZjaGlsZC5rZXk7XG4gICAgICAgICAgICBpZiAobnVsbCAhPSBrZXkpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5ZWRMZW4gJiYgdm9pZCAwICE9PSBrZXllZFtrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkID0ga2V5ZWRba2V5XTtcbiAgICAgICAgICAgICAgICAgICAga2V5ZWRba2V5XSA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICAgICAga2V5ZWRMZW4tLTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFjaGlsZCAmJiBtaW4gPCBjaGlsZHJlbkxlbikgZm9yIChqID0gbWluOyBqIDwgY2hpbGRyZW5MZW47IGorKykgaWYgKHZvaWQgMCAhPT0gY2hpbGRyZW5bal0gJiYgaXNTYW1lTm9kZVR5cGUoYyA9IGNoaWxkcmVuW2pdLCB2Y2hpbGQsIGlzSHlkcmF0aW5nKSkge1xuICAgICAgICAgICAgICAgIGNoaWxkID0gYztcbiAgICAgICAgICAgICAgICBjaGlsZHJlbltqXSA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICBpZiAoaiA9PT0gY2hpbGRyZW5MZW4gLSAxKSBjaGlsZHJlbkxlbi0tO1xuICAgICAgICAgICAgICAgIGlmIChqID09PSBtaW4pIG1pbisrO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2hpbGQgPSBpZGlmZihjaGlsZCwgdmNoaWxkLCBjb250ZXh0LCBtb3VudEFsbCk7XG4gICAgICAgICAgICBpZiAoY2hpbGQgJiYgY2hpbGQgIT09IGRvbSkgaWYgKGkgPj0gbGVuKSBkb20uYXBwZW5kQ2hpbGQoY2hpbGQpOyBlbHNlIGlmIChjaGlsZCAhPT0gb3JpZ2luYWxDaGlsZHJlbltpXSkgaWYgKGNoaWxkID09PSBvcmlnaW5hbENoaWxkcmVuW2kgKyAxXSkgcmVtb3ZlTm9kZShvcmlnaW5hbENoaWxkcmVuW2ldKTsgZWxzZSBkb20uaW5zZXJ0QmVmb3JlKGNoaWxkLCBvcmlnaW5hbENoaWxkcmVuW2ldIHx8IG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChrZXllZExlbikgZm9yICh2YXIgaSBpbiBrZXllZCkgaWYgKHZvaWQgMCAhPT0ga2V5ZWRbaV0pIHJlY29sbGVjdE5vZGVUcmVlKGtleWVkW2ldLCAhMSk7XG4gICAgICAgIHdoaWxlIChtaW4gPD0gY2hpbGRyZW5MZW4pIGlmICh2b2lkIDAgIT09IChjaGlsZCA9IGNoaWxkcmVuW2NoaWxkcmVuTGVuLS1dKSkgcmVjb2xsZWN0Tm9kZVRyZWUoY2hpbGQsICExKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcmVjb2xsZWN0Tm9kZVRyZWUobm9kZSwgdW5tb3VudE9ubHkpIHtcbiAgICAgICAgdmFyIGNvbXBvbmVudCA9IG5vZGUuX2NvbXBvbmVudDtcbiAgICAgICAgaWYgKGNvbXBvbmVudCkgdW5tb3VudENvbXBvbmVudChjb21wb25lbnQpOyBlbHNlIHtcbiAgICAgICAgICAgIGlmIChudWxsICE9IG5vZGUuX19wcmVhY3RhdHRyXyAmJiBub2RlLl9fcHJlYWN0YXR0cl8ucmVmKSBub2RlLl9fcHJlYWN0YXR0cl8ucmVmKG51bGwpO1xuICAgICAgICAgICAgaWYgKHVubW91bnRPbmx5ID09PSAhMSB8fCBudWxsID09IG5vZGUuX19wcmVhY3RhdHRyXykgcmVtb3ZlTm9kZShub2RlKTtcbiAgICAgICAgICAgIHJlbW92ZUNoaWxkcmVuKG5vZGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlbW92ZUNoaWxkcmVuKG5vZGUpIHtcbiAgICAgICAgbm9kZSA9IG5vZGUubGFzdENoaWxkO1xuICAgICAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICAgICAgdmFyIG5leHQgPSBub2RlLnByZXZpb3VzU2libGluZztcbiAgICAgICAgICAgIHJlY29sbGVjdE5vZGVUcmVlKG5vZGUsICEwKTtcbiAgICAgICAgICAgIG5vZGUgPSBuZXh0O1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRpZmZBdHRyaWJ1dGVzKGRvbSwgYXR0cnMsIG9sZCkge1xuICAgICAgICB2YXIgbmFtZTtcbiAgICAgICAgZm9yIChuYW1lIGluIG9sZCkgaWYgKCghYXR0cnMgfHwgbnVsbCA9PSBhdHRyc1tuYW1lXSkgJiYgbnVsbCAhPSBvbGRbbmFtZV0pIHNldEFjY2Vzc29yKGRvbSwgbmFtZSwgb2xkW25hbWVdLCBvbGRbbmFtZV0gPSB2b2lkIDAsIGlzU3ZnTW9kZSk7XG4gICAgICAgIGZvciAobmFtZSBpbiBhdHRycykgaWYgKCEoJ2NoaWxkcmVuJyA9PT0gbmFtZSB8fCAnaW5uZXJIVE1MJyA9PT0gbmFtZSB8fCBuYW1lIGluIG9sZCAmJiBhdHRyc1tuYW1lXSA9PT0gKCd2YWx1ZScgPT09IG5hbWUgfHwgJ2NoZWNrZWQnID09PSBuYW1lID8gZG9tW25hbWVdIDogb2xkW25hbWVdKSkpIHNldEFjY2Vzc29yKGRvbSwgbmFtZSwgb2xkW25hbWVdLCBvbGRbbmFtZV0gPSBhdHRyc1tuYW1lXSwgaXNTdmdNb2RlKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY29sbGVjdENvbXBvbmVudChjb21wb25lbnQpIHtcbiAgICAgICAgdmFyIG5hbWUgPSBjb21wb25lbnQuY29uc3RydWN0b3IubmFtZTtcbiAgICAgICAgKGNvbXBvbmVudHNbbmFtZV0gfHwgKGNvbXBvbmVudHNbbmFtZV0gPSBbXSkpLnB1c2goY29tcG9uZW50KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50KEN0b3IsIHByb3BzLCBjb250ZXh0KSB7XG4gICAgICAgIHZhciBpbnN0LCBsaXN0ID0gY29tcG9uZW50c1tDdG9yLm5hbWVdO1xuICAgICAgICBpZiAoQ3Rvci5wcm90b3R5cGUgJiYgQ3Rvci5wcm90b3R5cGUucmVuZGVyKSB7XG4gICAgICAgICAgICBpbnN0ID0gbmV3IEN0b3IocHJvcHMsIGNvbnRleHQpO1xuICAgICAgICAgICAgQ29tcG9uZW50LmNhbGwoaW5zdCwgcHJvcHMsIGNvbnRleHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaW5zdCA9IG5ldyBDb21wb25lbnQocHJvcHMsIGNvbnRleHQpO1xuICAgICAgICAgICAgaW5zdC5jb25zdHJ1Y3RvciA9IEN0b3I7XG4gICAgICAgICAgICBpbnN0LnJlbmRlciA9IGRvUmVuZGVyO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsaXN0KSBmb3IgKHZhciBpID0gbGlzdC5sZW5ndGg7IGktLTsgKSBpZiAobGlzdFtpXS5jb25zdHJ1Y3RvciA9PT0gQ3Rvcikge1xuICAgICAgICAgICAgaW5zdC5fX2IgPSBsaXN0W2ldLl9fYjtcbiAgICAgICAgICAgIGxpc3Quc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGluc3Q7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRvUmVuZGVyKHByb3BzLCBzdGF0ZSwgY29udGV4dCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvcihwcm9wcywgY29udGV4dCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHNldENvbXBvbmVudFByb3BzKGNvbXBvbmVudCwgcHJvcHMsIG9wdHMsIGNvbnRleHQsIG1vdW50QWxsKSB7XG4gICAgICAgIGlmICghY29tcG9uZW50Ll9feCkge1xuICAgICAgICAgICAgY29tcG9uZW50Ll9feCA9ICEwO1xuICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5fX3IgPSBwcm9wcy5yZWYpIGRlbGV0ZSBwcm9wcy5yZWY7XG4gICAgICAgICAgICBpZiAoY29tcG9uZW50Ll9fayA9IHByb3BzLmtleSkgZGVsZXRlIHByb3BzLmtleTtcbiAgICAgICAgICAgIGlmICghY29tcG9uZW50LmJhc2UgfHwgbW91bnRBbGwpIHtcbiAgICAgICAgICAgICAgICBpZiAoY29tcG9uZW50LmNvbXBvbmVudFdpbGxNb3VudCkgY29tcG9uZW50LmNvbXBvbmVudFdpbGxNb3VudCgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjb21wb25lbnQuY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcykgY29tcG9uZW50LmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMocHJvcHMsIGNvbnRleHQpO1xuICAgICAgICAgICAgaWYgKGNvbnRleHQgJiYgY29udGV4dCAhPT0gY29tcG9uZW50LmNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbXBvbmVudC5fX2MpIGNvbXBvbmVudC5fX2MgPSBjb21wb25lbnQuY29udGV4dDtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWNvbXBvbmVudC5fX3ApIGNvbXBvbmVudC5fX3AgPSBjb21wb25lbnQucHJvcHM7XG4gICAgICAgICAgICBjb21wb25lbnQucHJvcHMgPSBwcm9wcztcbiAgICAgICAgICAgIGNvbXBvbmVudC5fX3ggPSAhMTtcbiAgICAgICAgICAgIGlmICgwICE9PSBvcHRzKSBpZiAoMSA9PT0gb3B0cyB8fCBvcHRpb25zLnN5bmNDb21wb25lbnRVcGRhdGVzICE9PSAhMSB8fCAhY29tcG9uZW50LmJhc2UpIHJlbmRlckNvbXBvbmVudChjb21wb25lbnQsIDEsIG1vdW50QWxsKTsgZWxzZSBlbnF1ZXVlUmVuZGVyKGNvbXBvbmVudCk7XG4gICAgICAgICAgICBpZiAoY29tcG9uZW50Ll9fcikgY29tcG9uZW50Ll9fcihjb21wb25lbnQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlbmRlckNvbXBvbmVudChjb21wb25lbnQsIG9wdHMsIG1vdW50QWxsLCBpc0NoaWxkKSB7XG4gICAgICAgIGlmICghY29tcG9uZW50Ll9feCkge1xuICAgICAgICAgICAgdmFyIHJlbmRlcmVkLCBpbnN0LCBjYmFzZSwgcHJvcHMgPSBjb21wb25lbnQucHJvcHMsIHN0YXRlID0gY29tcG9uZW50LnN0YXRlLCBjb250ZXh0ID0gY29tcG9uZW50LmNvbnRleHQsIHByZXZpb3VzUHJvcHMgPSBjb21wb25lbnQuX19wIHx8IHByb3BzLCBwcmV2aW91c1N0YXRlID0gY29tcG9uZW50Ll9fcyB8fCBzdGF0ZSwgcHJldmlvdXNDb250ZXh0ID0gY29tcG9uZW50Ll9fYyB8fCBjb250ZXh0LCBpc1VwZGF0ZSA9IGNvbXBvbmVudC5iYXNlLCBuZXh0QmFzZSA9IGNvbXBvbmVudC5fX2IsIGluaXRpYWxCYXNlID0gaXNVcGRhdGUgfHwgbmV4dEJhc2UsIGluaXRpYWxDaGlsZENvbXBvbmVudCA9IGNvbXBvbmVudC5fY29tcG9uZW50LCBza2lwID0gITE7XG4gICAgICAgICAgICBpZiAoaXNVcGRhdGUpIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQucHJvcHMgPSBwcmV2aW91c1Byb3BzO1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5zdGF0ZSA9IHByZXZpb3VzU3RhdGU7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LmNvbnRleHQgPSBwcmV2aW91c0NvbnRleHQ7XG4gICAgICAgICAgICAgICAgaWYgKDIgIT09IG9wdHMgJiYgY29tcG9uZW50LnNob3VsZENvbXBvbmVudFVwZGF0ZSAmJiBjb21wb25lbnQuc2hvdWxkQ29tcG9uZW50VXBkYXRlKHByb3BzLCBzdGF0ZSwgY29udGV4dCkgPT09ICExKSBza2lwID0gITA7IGVsc2UgaWYgKGNvbXBvbmVudC5jb21wb25lbnRXaWxsVXBkYXRlKSBjb21wb25lbnQuY29tcG9uZW50V2lsbFVwZGF0ZShwcm9wcywgc3RhdGUsIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5wcm9wcyA9IHByb3BzO1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5zdGF0ZSA9IHN0YXRlO1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5jb250ZXh0ID0gY29udGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbXBvbmVudC5fX3AgPSBjb21wb25lbnQuX19zID0gY29tcG9uZW50Ll9fYyA9IGNvbXBvbmVudC5fX2IgPSBudWxsO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9fZCA9ICExO1xuICAgICAgICAgICAgaWYgKCFza2lwKSB7XG4gICAgICAgICAgICAgICAgcmVuZGVyZWQgPSBjb21wb25lbnQucmVuZGVyKHByb3BzLCBzdGF0ZSwgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5nZXRDaGlsZENvbnRleHQpIGNvbnRleHQgPSBleHRlbmQoZXh0ZW5kKHt9LCBjb250ZXh0KSwgY29tcG9uZW50LmdldENoaWxkQ29udGV4dCgpKTtcbiAgICAgICAgICAgICAgICB2YXIgdG9Vbm1vdW50LCBiYXNlLCBjaGlsZENvbXBvbmVudCA9IHJlbmRlcmVkICYmIHJlbmRlcmVkLm5vZGVOYW1lO1xuICAgICAgICAgICAgICAgIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBjaGlsZENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2hpbGRQcm9wcyA9IGdldE5vZGVQcm9wcyhyZW5kZXJlZCk7XG4gICAgICAgICAgICAgICAgICAgIGluc3QgPSBpbml0aWFsQ2hpbGRDb21wb25lbnQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnN0ICYmIGluc3QuY29uc3RydWN0b3IgPT09IGNoaWxkQ29tcG9uZW50ICYmIGNoaWxkUHJvcHMua2V5ID09IGluc3QuX19rKSBzZXRDb21wb25lbnRQcm9wcyhpbnN0LCBjaGlsZFByb3BzLCAxLCBjb250ZXh0LCAhMSk7IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9Vbm1vdW50ID0gaW5zdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5fY29tcG9uZW50ID0gaW5zdCA9IGNyZWF0ZUNvbXBvbmVudChjaGlsZENvbXBvbmVudCwgY2hpbGRQcm9wcywgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0Ll9fYiA9IGluc3QuX19iIHx8IG5leHRCYXNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdC5fX3UgPSBjb21wb25lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRDb21wb25lbnRQcm9wcyhpbnN0LCBjaGlsZFByb3BzLCAwLCBjb250ZXh0LCAhMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJDb21wb25lbnQoaW5zdCwgMSwgbW91bnRBbGwsICEwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBiYXNlID0gaW5zdC5iYXNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNiYXNlID0gaW5pdGlhbEJhc2U7XG4gICAgICAgICAgICAgICAgICAgIHRvVW5tb3VudCA9IGluaXRpYWxDaGlsZENvbXBvbmVudDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRvVW5tb3VudCkgY2Jhc2UgPSBjb21wb25lbnQuX2NvbXBvbmVudCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbml0aWFsQmFzZSB8fCAxID09PSBvcHRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2Jhc2UpIGNiYXNlLl9jb21wb25lbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZSA9IGRpZmYoY2Jhc2UsIHJlbmRlcmVkLCBjb250ZXh0LCBtb3VudEFsbCB8fCAhaXNVcGRhdGUsIGluaXRpYWxCYXNlICYmIGluaXRpYWxCYXNlLnBhcmVudE5vZGUsICEwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaW5pdGlhbEJhc2UgJiYgYmFzZSAhPT0gaW5pdGlhbEJhc2UgJiYgaW5zdCAhPT0gaW5pdGlhbENoaWxkQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBiYXNlUGFyZW50ID0gaW5pdGlhbEJhc2UucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJhc2VQYXJlbnQgJiYgYmFzZSAhPT0gYmFzZVBhcmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZVBhcmVudC5yZXBsYWNlQ2hpbGQoYmFzZSwgaW5pdGlhbEJhc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0b1VubW91bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsQmFzZS5fY29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNvbGxlY3ROb2RlVHJlZShpbml0aWFsQmFzZSwgITEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0b1VubW91bnQpIHVubW91bnRDb21wb25lbnQodG9Vbm1vdW50KTtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuYmFzZSA9IGJhc2U7XG4gICAgICAgICAgICAgICAgaWYgKGJhc2UgJiYgIWlzQ2hpbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvbXBvbmVudFJlZiA9IGNvbXBvbmVudCwgdCA9IGNvbXBvbmVudDtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKHQgPSB0Ll9fdSkgKGNvbXBvbmVudFJlZiA9IHQpLmJhc2UgPSBiYXNlO1xuICAgICAgICAgICAgICAgICAgICBiYXNlLl9jb21wb25lbnQgPSBjb21wb25lbnRSZWY7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuX2NvbXBvbmVudENvbnN0cnVjdG9yID0gY29tcG9uZW50UmVmLmNvbnN0cnVjdG9yO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNVcGRhdGUgfHwgbW91bnRBbGwpIG1vdW50cy51bnNoaWZ0KGNvbXBvbmVudCk7IGVsc2UgaWYgKCFza2lwKSB7XG4gICAgICAgICAgICAgICAgZmx1c2hNb3VudHMoKTtcbiAgICAgICAgICAgICAgICBpZiAoY29tcG9uZW50LmNvbXBvbmVudERpZFVwZGF0ZSkgY29tcG9uZW50LmNvbXBvbmVudERpZFVwZGF0ZShwcmV2aW91c1Byb3BzLCBwcmV2aW91c1N0YXRlLCBwcmV2aW91c0NvbnRleHQpO1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmFmdGVyVXBkYXRlKSBvcHRpb25zLmFmdGVyVXBkYXRlKGNvbXBvbmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobnVsbCAhPSBjb21wb25lbnQuX19oKSB3aGlsZSAoY29tcG9uZW50Ll9faC5sZW5ndGgpIGNvbXBvbmVudC5fX2gucG9wKCkuY2FsbChjb21wb25lbnQpO1xuICAgICAgICAgICAgaWYgKCFkaWZmTGV2ZWwgJiYgIWlzQ2hpbGQpIGZsdXNoTW91bnRzKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gYnVpbGRDb21wb25lbnRGcm9tVk5vZGUoZG9tLCB2bm9kZSwgY29udGV4dCwgbW91bnRBbGwpIHtcbiAgICAgICAgdmFyIGMgPSBkb20gJiYgZG9tLl9jb21wb25lbnQsIG9yaWdpbmFsQ29tcG9uZW50ID0gYywgb2xkRG9tID0gZG9tLCBpc0RpcmVjdE93bmVyID0gYyAmJiBkb20uX2NvbXBvbmVudENvbnN0cnVjdG9yID09PSB2bm9kZS5ub2RlTmFtZSwgaXNPd25lciA9IGlzRGlyZWN0T3duZXIsIHByb3BzID0gZ2V0Tm9kZVByb3BzKHZub2RlKTtcbiAgICAgICAgd2hpbGUgKGMgJiYgIWlzT3duZXIgJiYgKGMgPSBjLl9fdSkpIGlzT3duZXIgPSBjLmNvbnN0cnVjdG9yID09PSB2bm9kZS5ub2RlTmFtZTtcbiAgICAgICAgaWYgKGMgJiYgaXNPd25lciAmJiAoIW1vdW50QWxsIHx8IGMuX2NvbXBvbmVudCkpIHtcbiAgICAgICAgICAgIHNldENvbXBvbmVudFByb3BzKGMsIHByb3BzLCAzLCBjb250ZXh0LCBtb3VudEFsbCk7XG4gICAgICAgICAgICBkb20gPSBjLmJhc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAob3JpZ2luYWxDb21wb25lbnQgJiYgIWlzRGlyZWN0T3duZXIpIHtcbiAgICAgICAgICAgICAgICB1bm1vdW50Q29tcG9uZW50KG9yaWdpbmFsQ29tcG9uZW50KTtcbiAgICAgICAgICAgICAgICBkb20gPSBvbGREb20gPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYyA9IGNyZWF0ZUNvbXBvbmVudCh2bm9kZS5ub2RlTmFtZSwgcHJvcHMsIGNvbnRleHQpO1xuICAgICAgICAgICAgaWYgKGRvbSAmJiAhYy5fX2IpIHtcbiAgICAgICAgICAgICAgICBjLl9fYiA9IGRvbTtcbiAgICAgICAgICAgICAgICBvbGREb20gPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2V0Q29tcG9uZW50UHJvcHMoYywgcHJvcHMsIDEsIGNvbnRleHQsIG1vdW50QWxsKTtcbiAgICAgICAgICAgIGRvbSA9IGMuYmFzZTtcbiAgICAgICAgICAgIGlmIChvbGREb20gJiYgZG9tICE9PSBvbGREb20pIHtcbiAgICAgICAgICAgICAgICBvbGREb20uX2NvbXBvbmVudCA9IG51bGw7XG4gICAgICAgICAgICAgICAgcmVjb2xsZWN0Tm9kZVRyZWUob2xkRG9tLCAhMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRvbTtcbiAgICB9XG4gICAgZnVuY3Rpb24gdW5tb3VudENvbXBvbmVudChjb21wb25lbnQpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuYmVmb3JlVW5tb3VudCkgb3B0aW9ucy5iZWZvcmVVbm1vdW50KGNvbXBvbmVudCk7XG4gICAgICAgIHZhciBiYXNlID0gY29tcG9uZW50LmJhc2U7XG4gICAgICAgIGNvbXBvbmVudC5fX3ggPSAhMDtcbiAgICAgICAgaWYgKGNvbXBvbmVudC5jb21wb25lbnRXaWxsVW5tb3VudCkgY29tcG9uZW50LmNvbXBvbmVudFdpbGxVbm1vdW50KCk7XG4gICAgICAgIGNvbXBvbmVudC5iYXNlID0gbnVsbDtcbiAgICAgICAgdmFyIGlubmVyID0gY29tcG9uZW50Ll9jb21wb25lbnQ7XG4gICAgICAgIGlmIChpbm5lcikgdW5tb3VudENvbXBvbmVudChpbm5lcik7IGVsc2UgaWYgKGJhc2UpIHtcbiAgICAgICAgICAgIGlmIChiYXNlLl9fcHJlYWN0YXR0cl8gJiYgYmFzZS5fX3ByZWFjdGF0dHJfLnJlZikgYmFzZS5fX3ByZWFjdGF0dHJfLnJlZihudWxsKTtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fX2IgPSBiYXNlO1xuICAgICAgICAgICAgcmVtb3ZlTm9kZShiYXNlKTtcbiAgICAgICAgICAgIGNvbGxlY3RDb21wb25lbnQoY29tcG9uZW50KTtcbiAgICAgICAgICAgIHJlbW92ZUNoaWxkcmVuKGJhc2UpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb21wb25lbnQuX19yKSBjb21wb25lbnQuX19yKG51bGwpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBDb21wb25lbnQocHJvcHMsIGNvbnRleHQpIHtcbiAgICAgICAgdGhpcy5fX2QgPSAhMDtcbiAgICAgICAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgICAgICAgdGhpcy5wcm9wcyA9IHByb3BzO1xuICAgICAgICB0aGlzLnN0YXRlID0gdGhpcy5zdGF0ZSB8fCB7fTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcmVuZGVyKHZub2RlLCBwYXJlbnQsIG1lcmdlKSB7XG4gICAgICAgIHJldHVybiBkaWZmKG1lcmdlLCB2bm9kZSwge30sICExLCBwYXJlbnQsICExKTtcbiAgICB9XG4gICAgdmFyIG9wdGlvbnMgPSB7fTtcbiAgICB2YXIgc3RhY2sgPSBbXTtcbiAgICB2YXIgRU1QVFlfQ0hJTERSRU4gPSBbXTtcbiAgICB2YXIgSVNfTk9OX0RJTUVOU0lPTkFMID0gL2FjaXR8ZXgoPzpzfGd8bnxwfCQpfHJwaHxvd3N8bW5jfG50d3xpbmVbY2hdfHpvb3xeb3JkL2k7XG4gICAgdmFyIGl0ZW1zID0gW107XG4gICAgdmFyIG1vdW50cyA9IFtdO1xuICAgIHZhciBkaWZmTGV2ZWwgPSAwO1xuICAgIHZhciBpc1N2Z01vZGUgPSAhMTtcbiAgICB2YXIgaHlkcmF0aW5nID0gITE7XG4gICAgdmFyIGNvbXBvbmVudHMgPSB7fTtcbiAgICBleHRlbmQoQ29tcG9uZW50LnByb3RvdHlwZSwge1xuICAgICAgICBzZXRTdGF0ZTogZnVuY3Rpb24oc3RhdGUsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB2YXIgcyA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX19zKSB0aGlzLl9fcyA9IGV4dGVuZCh7fSwgcyk7XG4gICAgICAgICAgICBleHRlbmQocywgJ2Z1bmN0aW9uJyA9PSB0eXBlb2Ygc3RhdGUgPyBzdGF0ZShzLCB0aGlzLnByb3BzKSA6IHN0YXRlKTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykgKHRoaXMuX19oID0gdGhpcy5fX2ggfHwgW10pLnB1c2goY2FsbGJhY2spO1xuICAgICAgICAgICAgZW5xdWV1ZVJlbmRlcih0aGlzKTtcbiAgICAgICAgfSxcbiAgICAgICAgZm9yY2VVcGRhdGU6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spICh0aGlzLl9faCA9IHRoaXMuX19oIHx8IFtdKS5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIHJlbmRlckNvbXBvbmVudCh0aGlzLCAyKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVuZGVyOiBmdW5jdGlvbigpIHt9XG4gICAgfSk7XG4gICAgdmFyIHByZWFjdCA9IHtcbiAgICAgICAgaDogaCxcbiAgICAgICAgY3JlYXRlRWxlbWVudDogaCxcbiAgICAgICAgY2xvbmVFbGVtZW50OiBjbG9uZUVsZW1lbnQsXG4gICAgICAgIENvbXBvbmVudDogQ29tcG9uZW50LFxuICAgICAgICByZW5kZXI6IHJlbmRlcixcbiAgICAgICAgcmVyZW5kZXI6IHJlcmVuZGVyLFxuICAgICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgfTtcbiAgICBpZiAoJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIG1vZHVsZSkgbW9kdWxlLmV4cG9ydHMgPSBwcmVhY3Q7IGVsc2Ugc2VsZi5wcmVhY3QgPSBwcmVhY3Q7XG59KCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wcmVhY3QuanMubWFwIiwicmVxdWlyZSgnLi9wb2x5ZmlsbHMuanMnKTtcblxuY29uc3Rcblx0UmVhY3QgPSByZXF1aXJlKCdwcmVhY3QnKSxcblxuXHRCaW5kID0gcmVxdWlyZShcIi4vYmluZC5qc1wiKSxcblxuXHRQYXNzID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL1Bhc3MuanMnKSxcblx0U3ViVmlldyA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9TdWJWaWV3LmpzJyksXG5cdFNoaXBWaWV3ID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL1NoaXBWaWV3LmpzJyksXG5cdFNvbmFyVmlldyA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9Tb25hclZpZXcuanMnKSxcblxuXHRTdHlsZSA9IHtcblx0XHRhcHA6ICd3aWR0aDogMTAwdnc7J1xuXHR9O1xuXG5cbmNsYXNzIEFwcCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKHByb3BzLCBjb250ZXh0KSB7XG5cdFx0c3VwZXIocHJvcHMpO1xuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHR2aWV3OiAwLFxuXHRcdFx0cGF5bG9hZDogdW5kZWZpbmVkXG5cdFx0fVxuXG5cdFx0QmluZCh0aGlzKTtcblx0fVxuXG5cdHJlbmRlcihwcm9wcywgc3RhdGUpIHtcblx0XHRzd2l0Y2ggKHN0YXRlLnZpZXcpIHtcblx0XHRcdGNhc2UgMDogcmV0dXJuIDxTdWJWaWV3ICBzZWd1ZT17dGhpcy5zZWd1ZVdpdGhQYXlsb2FkfS8+O1xuXHRcdFx0Y2FzZSAxOiByZXR1cm4gPFBhc3MgdG89XCJTaGlwXCIgc2VndWU9e3RoaXMuc2VndWV9Lz47XG5cdFx0XHRjYXNlIDI6IHJldHVybiA8U2hpcFZpZXcgcGF5bG9hZD17c3RhdGUucGF5bG9hZH0gc2VndWU9e3RoaXMuc2VndWVXaXRoUGF5bG9hZH0vPjtcblx0XHRcdGNhc2UgMzogcmV0dXJuIDxTb25hclZpZXcgcGF5bG9hZD17c3RhdGUucGF5bG9hZH0gc2VndWU9e3RoaXMuc2VndWVXaXRoUGF5bG9hZH0vPjtcblx0XHRcdGNhc2UgNDogcmV0dXJuIDxQYXNzIHRvPVwiU3ViXCIgc2VndWU9e3RoaXMuc2VndWV9Lz47XG5cdFx0fVxuXHR9XG5cdHNlZ3VlKCkge1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0dmlldzogKHRoaXMuc3RhdGUudmlldyA9PT0gNCkgPyAwIDogdGhpcy5zdGF0ZS52aWV3ICsgMVxuXHRcdH0pO1xuXHR9XG5cdHNlZ3VlV2l0aFBheWxvYWQocGF5bG9hZCwgYWRkMikge1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0dmlldzogKHRoaXMuc3RhdGUudmlldyA9PT0gNCkgPyAwIDogdGhpcy5zdGF0ZS52aWV3ICsgKChhZGQyKSA/IDIgOiAxKSxcblx0XHRcdHBheWxvYWQ6IHBheWxvYWRcblx0XHR9KTtcblx0fVxufVxuXG5SZWFjdC5yZW5kZXIoPEFwcC8+LCBkb2N1bWVudC5ib2R5KTsiLCIvLyBjb252ZW5pZW5jZSBtZXRob2Rcbi8vIGJpbmRzIGV2ZXJ5IGZ1bmN0aW9uIGluIGluc3RhbmNlJ3MgcHJvdG90eXBlIHRvIHRoZSBpbnN0YW5jZSBpdHNlbGZcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaW5zdGFuY2UpIHtcblx0dmFyIHByb3RvID0gaW5zdGFuY2UuY29uc3RydWN0b3IucHJvdG90eXBlLFxuXHRcdGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhwcm90byksXG5cdFx0a2V5O1xuXHR3aGlsZSAoa2V5ID0ga2V5cy5wb3AoKSkgaWYgKHR5cGVvZiBwcm90b1trZXldID09PSAnZnVuY3Rpb24nICYmIGtleSAhPT0gJ2NvbnN0cnVjdG9yJykgaW5zdGFuY2Vba2V5XSA9IHByb3RvW2tleV0uYmluZChpbnN0YW5jZSk7XG59IiwiY29uc3Rcblx0UmVhY3QgPSByZXF1aXJlKFwicHJlYWN0XCIpLFxuXHRTdHlsZSA9IHJlcXVpcmUoXCIuLi9zdHlsZS5qc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihwcm9wcykge1xuXHRyZXR1cm4gKFxuXHRcdDxkaXYgc3R5bGU9e09iamVjdC5hc3NpZ24oe30sIFN0eWxlLkNhcmQsIHsgYmFja2dyb3VuZDpcInJhZGlhbC1ncmFkaWVudChjaXJjbGUsIFwiICsgcHJvcHMuY29sb3IgKyBcIiAxNSUsICMxMTExMTEgMTAwJSlcIiB9KX0+XG5cdFx0XHR7IHByb3BzLmNoaWxkcmVuIH1cblx0XHQ8L2Rpdj5cblx0KTtcbn1cbiIsImNvbnN0XG5cdFJlYWN0ID0gcmVxdWlyZShcInByZWFjdFwiKSxcblx0c3FydDNEaXZkZWRCeTIgPSBNYXRoLnNxcnQoMykgLyAyO1xuXG5jbGFzcyBIZXggZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRyZW5kZXIocHJvcHMpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PHN2ZyB2aWV3Qm94PVwiMCAwIDEgMVwiIHdpZHRoPXtzcXJ0M0RpdmRlZEJ5MiAqIDg4fSBoZWlnaHQ9ezg4fSBzdHlsZT1cImRpc3BsYXk6YmxvY2tcIj5cblx0XHRcdFx0PGcgb25DbGljaz17KHByb3BzLm9uQ2xpY2spID8gcHJvcHMub25DbGljayA6IHVuZGVmaW5lZCB9PlxuXHRcdFx0XHRcdDxwb2x5Z29uXG5cdFx0XHRcdFx0XHRwb2ludHM9XCIwLDAuNzUgMCwwLjI1IDAuNSwwIDEsMC4yNSAxLDAuNzUgMC41LDFcIlxuXHRcdFx0XHRcdFx0c3R5bGU9e3tcblx0XHRcdFx0XHRcdFx0ZmlsbDogcHJvcHMuYmcsXG5cdFx0XHRcdFx0XHRcdGZpbGxPcGFjaXR5Oihwcm9wcy5zZWxlY3RlZCA/IFwiMVwiIDogXCIwLjRcIilcblx0XHRcdFx0XHRcdH19XG5cdFx0XHRcdFx0PjwvcG9seWdvbj5cblx0XHRcdFx0XHR7cHJvcHMuY2hpbGRyZW59XG5cdFx0XHRcdDwvZz5cblx0XHRcdDwvc3ZnPlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBIZXg7IiwiY29uc3Rcblx0UmVhY3QgPSByZXF1aXJlKFwicHJlYWN0XCIpLFxuXHRIZXggPSByZXF1aXJlKFwiLi9IZXguanNcIiksXG5cdFN0eWxlID0gcmVxdWlyZShcIi4uL3N0eWxlLmpzXCIpLFxuXHRzcXJ0M0RpdmRlZEJ5MiA9IE1hdGguc3FydCgzKSAvIDI7XG5cbmNsYXNzIEhleEJ1dHRvbiBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdHJlbmRlcihwcm9wcykge1xuXHRcdHZhciBtYXJnaW4gPSAoMSAtIHNxcnQzRGl2ZGVkQnkyKSAvIDI7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxzdmcgdmlld0JveD1cIjAgMCAxIDFcIiB3aWR0aD17c3FydDNEaXZkZWRCeTIgKiAxMDB9IGhlaWdodD17MTAwfSBzdHlsZT17U3R5bGUuSGV4QnV0dG9ufT5cblx0XHRcdFx0PGcgb25DbGljaz17KHByb3BzLm9uQ2xpY2sgPyAoKSA9PiBwcm9wcy5vbkNsaWNrKHByb3BzLnRleHQpIDogdW5kZWZpbmVkKX0+XG5cdFx0XHRcdFx0PHBvbHlnb25cblx0XHRcdFx0XHRcdHBvaW50cz17bWFyZ2luICsgXCIsMC43NSBcIiArIG1hcmdpbiArIFwiLDAuMjUgMC41LDAgXCIgKyAoMS1tYXJnaW4pICsgXCIsMC4yNSBcIiArICgxLW1hcmdpbikgKyBcIiwwLjc1IDAuNSwxXCJ9XG5cdFx0XHRcdFx0XHRzdHlsZT17e1xuXHRcdFx0XHRcdFx0XHRmaWxsOiBwcm9wcy5iZyxcblx0XHRcdFx0XHRcdFx0ZmlsbE9wYWNpdHk6KHByb3BzLnNlbGVjdGVkID8gXCIxXCIgOiBcIjAuNFwiKVxuXHRcdFx0XHRcdFx0fX1cblx0XHRcdFx0XHQ+PC9wb2x5Z29uPlxuXHRcdFx0XHRcdDx0ZXh0XG5cdFx0XHRcdFx0XHR4PVwiMC41XCJcblx0XHRcdFx0XHRcdHk9XCIwLjc4XCJcblx0XHRcdFx0XHRcdHRleHQtYW5jaG9yPVwibWlkZGxlXCJcblx0XHRcdFx0XHRcdHN0eWxlPXsocHJvcHMuc2VsZWN0ZWQgPyB7XG5cdFx0XHRcdFx0XHRcdGZvbnRGYW1pbHk6IFwiT3BlbiBTYW5zXCIsXG5cdFx0XHRcdFx0XHRcdGZvbnRTaXplOiBcIjQuOCVcIixcblx0XHRcdFx0XHRcdFx0ZmlsbDogcHJvcHMuZmcsXG5cdFx0XHRcdFx0XHRcdGZpbGxPcGFjaXR5OiBcIjFcIlxuXHRcdFx0XHRcdFx0fSA6IHtcblx0XHRcdFx0XHRcdFx0Zm9udEZhbWlseTogXCJPcGVuIFNhbnNcIixcblx0XHRcdFx0XHRcdFx0Zm9udFNpemU6IFwiNC44JVwiLFxuXHRcdFx0XHRcdFx0XHRmaWxsOiBcIiMxMTExMTFcIixcblx0XHRcdFx0XHRcdFx0ZmlsbE9wYWNpdHk6IFwiMVwiXG5cdFx0XHRcdFx0XHR9KX1cblx0XHRcdFx0XHQ+e3Byb3BzLnRleHR9PC90ZXh0PlxuXHRcdFx0XHQ8L2c+XG5cdFx0XHQ8L3N2Zz5cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSGV4QnV0dG9uOyIsImNvbnN0XG5cdFJlYWN0ID0gcmVxdWlyZShcInByZWFjdFwiKSxcblx0U3R5bGUgPSB7XG5cdFx0ZGl2OiB7XG5cdFx0XHR3aWR0aDogXCI2NiVcIixcblx0XHRcdGRpc3BsYXk6IFwiZmxleFwiLFxuXHRcdFx0anVzdGlmeUNvbnRlbnQ6IFwiZmxleC1zdGFydFwiLFxuXHRcdFx0ZmxleFdyYXA6IFwid3JhcFwiLFxuXHRcdFx0bWFyZ2luQm90dG9tOiBcIjJyZW1cIlxuXHRcdH0sXG5cdFx0dGV4dDoge1xuXHRcdFx0d2Via2l0Rm9udFNtb290aGluZzogXCJhbnRpYWxpYXNlZFwiLFxuXHRcdFx0ZGlzcGxheTogXCJpbmxpbmVcIixcblx0XHRcdGZvbnRTaXplOiBcIjNyZW1cIixcblx0XHRcdGZvbnRXZWlnaHQ6IFwiMjAwXCIsXG5cdFx0XHRtYXJnaW46IFwiMC43NXJlbVwiLFxuXHRcdFx0YmFja2dyb3VuZENvbG9yOiBcInJnYmEoMCwwLDAsMClcIixcblx0XHRcdGNvbG9yOiBcIiNmZmZmZmZcIlxuXHRcdH1cblx0fTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihwcm9wcykge1xuXHR2YXIgbGlzdCA9IFtdLFxuXHRcdGkgPSAtMTtcblxuXHR3aGlsZSAoKytpIDwgcHJvcHMubGlzdC5sZW5ndGgpIGxpc3QucHVzaChcblx0XHQ8cFxuXHRcdFx0c3R5bGU9e1N0eWxlLnRleHR9XG5cdFx0Pntwcm9wcy5saXN0W2ldfTwvcD5cblx0KTtcblxuXHRyZXR1cm4gKFxuXHRcdDxkaXYgc3R5bGU9e1N0eWxlLmRpdn0+XG5cdFx0XHR7bGlzdH1cblx0XHQ8L2Rpdj5cblx0KTtcbn07IiwiY29uc3Rcblx0UmVhY3QgPSByZXF1aXJlKFwicHJlYWN0XCIpLFxuXHRTdHlsZSA9IHJlcXVpcmUoXCIuLi9zdHlsZS5qc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihwcm9wcykge1xuXHR2YXIgaSA9IHByb3BzLmZyb20sXG5cdFx0YnV0dG9ucyA9IFtdLFxuXHRcdGNhbGxiYWNrID0gKGUpID0+IHByb3BzLm9uQ2xpY2soTnVtYmVyKGUudGFyZ2V0LmRhdGFzZXQuaWQpKTtcblxuXHR3aGlsZSAoaSA8PSBwcm9wcy50bykgYnV0dG9ucy5wdXNoKFxuXHRcdDxidXR0b25cblx0XHRcdHN0eWxlPXtPYmplY3QuYXNzaWduKHt9LCBTdHlsZS5OdW1iZXJCdXR0b24sIHsgY29sb3I6IChwcm9wcy5zZWxlY3RlZC5pbmRleE9mKGkpID09PSAtMSkgPyBcInJnYmEoMSwgMSwgMSwgMC40KVwiIDogXCIjZmZmZmZmXCIgfSl9XG5cdFx0XHRkYXRhLWlkPXtpfVxuXHRcdFx0b25DbGljaz17Y2FsbGJhY2t9XG5cdFx0PnsoXCJcIiArIGkrKyl9PC9idXR0b24+XG5cdCk7XG5cblx0cmV0dXJuIChcblx0XHQ8ZGl2IHN0eWxlPXtTdHlsZS5OdW1iZXJCb3h9PlxuXHRcdFx0e2J1dHRvbnN9XG5cdFx0PC9kaXY+XG5cdCk7XG59OyIsImNvbnN0XG5cdFJlYWN0ID0gcmVxdWlyZShcInByZWFjdFwiKSxcblx0U3R5bGUgPSByZXF1aXJlKFwiLi4vc3R5bGUuanNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocHJvcHMpIHtcblx0c2V0VGltZW91dCgoKSA9PiBwcm9wcy5zZWd1ZSgpLCAyMDAwKTtcblx0cmV0dXJuIChcblx0XHQ8ZGl2IHN0eWxlPXtTdHlsZS5NYWluTGF5b3V0fT5cblx0XHRcdDxpbWcgc3JjPVwiLi9kaXN0L2ltZy9CQUNLLnBuZ1wiIHN0eWxlPXtTdHlsZS5pbWd9Lz5cblx0XHRcdDxoMj57XCJQYXNzIHRoaXMgdG8gdGhlIFwiICsgcHJvcHMudG8gKyBcIiBwbGF5ZXIuXCJ9PC9oMj5cblx0XHQ8L2Rpdj5cblx0KTtcbn0iLCJjb25zdFxuXHRSZWFjdCA9IHJlcXVpcmUoXCJwcmVhY3RcIiksXG5cdEhleEJ1dHRvbiA9IHJlcXVpcmUoXCIuL0hleEJ1dHRvbi5qc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihwcm9wcywgc3RhdGUpIHtcblx0cmV0dXJuIChcblx0XHQ8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleDsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XCI+XG5cdFx0XHQ8SGV4QnV0dG9uIHRleHQ9XCJSXCIgZmc9XCIjZmYwMDAwXCIgYmc9XCIjZmZmZmZmXCIgc2VsZWN0ZWQ9eyhwcm9wcy5zZWxlY3RlZCA9PT0gXCJSXCIpfSBvbkNsaWNrPXtwcm9wcy5vblNlbGVjdH0vPlxuXHRcdFx0PEhleEJ1dHRvbiB0ZXh0PVwiUFwiIGZnPVwiI2NjMDBjY1wiIGJnPVwiI2ZmZmZmZlwiIHNlbGVjdGVkPXsocHJvcHMuc2VsZWN0ZWQgPT09IFwiUFwiKX0gb25DbGljaz17cHJvcHMub25TZWxlY3R9Lz5cblx0XHRcdDxIZXhCdXR0b24gdGV4dD1cIk9cIiBmZz1cIiNmZjk5MDBcIiBiZz1cIiNmZmZmZmZcIiBzZWxlY3RlZD17KHByb3BzLnNlbGVjdGVkID09PSBcIk9cIil9IG9uQ2xpY2s9e3Byb3BzLm9uU2VsZWN0fS8+XG5cdFx0XHQ8SGV4QnV0dG9uIHRleHQ9XCJHXCIgZmc9XCIjMDBjYzMzXCIgYmc9XCIjZmZmZmZmXCIgc2VsZWN0ZWQ9eyhwcm9wcy5zZWxlY3RlZCA9PT0gXCJHXCIpfSBvbkNsaWNrPXtwcm9wcy5vblNlbGVjdH0vPlxuXHRcdDwvZGl2PlxuXHQpO1xufTsiLCJjb25zdFxuXHRSZWFjdCA9IHJlcXVpcmUoXCJwcmVhY3RcIiksXG5cblx0QmluZCA9IHJlcXVpcmUoXCIuLi9iaW5kLmpzXCIpLFxuXG5cdE51bWJlclNlbGVjdG9yID0gcmVxdWlyZShcIi4vTnVtYmVyU2VsZWN0b3IuanNcIiksXG5cdENhcmQgPSByZXF1aXJlKFwiLi9DYXJkLmpzXCIpLFxuXHRTdHlsZSA9IHJlcXVpcmUoXCIuLi9zdHlsZS5qc1wiKTtcblxuY2xhc3MgU2hpcFZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3Rvcihwcm9wcywgY29udGV4dCkge1xuXHRcdHN1cGVyKHByb3BzKTtcblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0ZGV0ZWN0aW9uOiAwXG5cdFx0fTtcblxuXHRcdEJpbmQodGhpcyk7XG5cdH1cblxuXHRyZW5kZXIocHJvcHMsIHN0YXRlKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxzZWN0aW9uIHN0eWxlPXtTdHlsZS5NYWluTGF5b3V0fT5cblx0XHRcdFx0PENhcmQgY29sb3I9XCIjY2NjY2NjXCI+XG5cdFx0XHRcdFx0PGgyPkRldGVjdGlvbjwvaDI+XG5cdFx0XHRcdFx0PE51bWJlclNlbGVjdG9yIHNlbGVjdGVkPXtbc3RhdGUuZGV0ZWN0aW9uXX0gZnJvbT17MH0gdG89ezEyfSBvbkNsaWNrPXt0aGlzLnNlbGVjdERldGVjdGlvbn0gLz5cblx0XHRcdFx0PC9DYXJkPlxuXHRcdFx0XHQ8YnV0dG9uXG5cdFx0XHRcdFx0c3R5bGU9e1N0eWxlLlNlZ3VlQnV0dG9ufVxuXHRcdFx0XHRcdG9uQ2xpY2s9e3RoaXMudmlld1NvbmFyfVxuXHRcdFx0XHQ+eyh0aGlzLnN0YXRlLmRldGVjdGlvbiA9PT0gMCkgPyBcIkRvbmVcIiA6IFwiVmlldyBEYXRhXCJ9PC9idXR0b24+XG5cdFx0XHQ8L3NlY3Rpb24+XG5cdFx0KTtcblx0fVxuXG5cdHNlbGVjdERldGVjdGlvbihzKSB7XG5cdFx0aWYgKHRoaXMuc3RhdGUuZGV0ZWN0aW9uICE9PSBzKSB0aGlzLnNldFN0YXRlKHtkZXRlY3Rpb246IHN9KTtcblx0fVxuXG5cdHZpZXdTb25hcigpIHtcblx0XHR0aGlzLnByb3BzLnNlZ3VlKFxuXHRcdFx0dGhpcy5wcm9wcy5wYXlsb2FkKHRoaXMuc3RhdGUuZGV0ZWN0aW9uLCAodGhpcy5zdGF0ZS5kZXRlY3Rpb24gPT09IDApKSAvLyBzaGlwIHNvbmFyIGZ1bmN0aW9uXG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNoaXBWaWV3OyIsImNvbnN0XG5cdFJlYWN0ID0gcmVxdWlyZShcInByZWFjdFwiKSxcblxuXHRCaW5kID0gcmVxdWlyZShcIi4uL2JpbmQuanNcIiksXG5cblx0TnVtYmVyTGlzdCA9IHJlcXVpcmUoXCIuL051bWJlckxpc3QuanNcIiksXG5cdENhcmQgPSByZXF1aXJlKFwiLi9DYXJkLmpzXCIpLFxuXHRTb25hciA9IHJlcXVpcmUoXCIuLi9zb25hci5qc1wiKSxcblx0U3R5bGUgPSByZXF1aXJlKFwiLi4vc3R5bGUuanNcIik7XG5cbmZ1bmN0aW9uIHBhcnNlRHJhdyhjYXJkcykge1xuXHR2YXIgZHJhdyA9IHtcblx0XHRcdFI6IFtdLFxuXHRcdFx0UDogW10sXG5cdFx0XHRPOiBbXSxcblx0XHRcdEc6IFtdLFxuXHRcdFx0UzogW10sXG5cdFx0XHREOiBbXVxuXHRcdH0sXG5cdFx0YztcblxuXHR3aGlsZSAoYyA9IGNhcmRzLnBvcCgpKSBkcmF3W2NbMF1dLnB1c2goTnVtYmVyKGNbMV0pKTtcblxuXHRkcmF3LlIuc29ydCgpO1xuXHRkcmF3LlAuc29ydCgpO1xuXHRkcmF3Lk8uc29ydCgpO1xuXHRkcmF3Lkcuc29ydCgpO1xuXHRkcmF3LlMuc29ydCgpO1xuXHRkcmF3LkQuc29ydCgpO1xuXG5cdHJldHVybiBkcmF3O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHByb3BzLCBzdGF0ZSkge1xuXHR2YXIgZHJhdyA9IHBhcnNlRHJhdyhwcm9wcy5wYXlsb2FkKSxcblx0XHRjYXJkcyA9IFtdO1xuXG5cdGlmIChkcmF3LlIubGVuZ3RoKSBjYXJkcy5wdXNoKFxuXHRcdDxDYXJkIGNvbG9yPXtTb25hci5Db2xvckZvclF1YWRyYW50KFwiUlwiKX0+XG5cdFx0XHQ8aDI+UmVkPC9oMj5cblx0XHRcdDxOdW1iZXJMaXN0IGxpc3Q9e2RyYXcuUn0gLz5cblx0XHQ8L0NhcmQ+XG5cdCk7XG5cblx0aWYgKGRyYXcuUC5sZW5ndGgpIGNhcmRzLnB1c2goXG5cdFx0PENhcmQgY29sb3I9e1NvbmFyLkNvbG9yRm9yUXVhZHJhbnQoXCJQXCIpfT5cblx0XHRcdDxoMj5QdXJwbGU8L2gyPlxuXHRcdFx0PE51bWJlckxpc3QgbGlzdD17ZHJhdy5QfSAvPlxuXHRcdDwvQ2FyZD5cblx0KTtcblxuXHRpZiAoZHJhdy5PLmxlbmd0aCkgY2FyZHMucHVzaChcblx0XHQ8Q2FyZCBjb2xvcj17U29uYXIuQ29sb3JGb3JRdWFkcmFudChcIk9cIil9PlxuXHRcdFx0PGgyPk9yYW5nZTwvaDI+XG5cdFx0XHQ8TnVtYmVyTGlzdCBsaXN0PXtkcmF3Lk99IC8+XG5cdFx0PC9DYXJkPlxuXHQpO1xuXG5cdGlmIChkcmF3LkcubGVuZ3RoKSBjYXJkcy5wdXNoKFxuXHRcdDxDYXJkIGNvbG9yPXtTb25hci5Db2xvckZvclF1YWRyYW50KFwiR1wiKX0+XG5cdFx0XHQ8aDI+R3JlZW48L2gyPlxuXHRcdFx0PE51bWJlckxpc3QgbGlzdD17ZHJhdy5HfSAvPlxuXHRcdDwvQ2FyZD5cblx0KTtcblxuXHRpZiAoZHJhdy5TLmxlbmd0aCkgY2FyZHMucHVzaChcblx0XHQ8Q2FyZCBjb2xvcj1cIiMwMTM5YTRcIj5cblx0XHRcdDxoMj5TcGVlZDwvaDI+XG5cdFx0XHQ8TnVtYmVyTGlzdCBsaXN0PXtkcmF3LlN9IC8+XG5cdFx0PC9DYXJkPlxuXHQpO1xuXG5cdGlmIChkcmF3LkQubGVuZ3RoKSBjYXJkcy5wdXNoKFxuXHRcdDxDYXJkIGNvbG9yPVwiIzMzMzMzM1wiPlxuXHRcdFx0PGgyPkRlcHRoPC9oMj5cblx0XHRcdDxOdW1iZXJMaXN0IGxpc3Q9e2RyYXcuRH0gLz5cblx0XHQ8L0NhcmQ+XG5cdCk7XG5cblx0cmV0dXJuIChcblx0XHQ8c2VjdGlvbiBzdHlsZT17U3R5bGUuTWFpbkxheW91dH0+XG5cdFx0XHR7Y2FyZHN9XG5cdFx0XHQ8YnV0dG9uIHN0eWxlPXtTdHlsZS5TZWd1ZUJ1dHRvbn0gb25DbGljaz17KCkgPT4gcHJvcHMuc2VndWUoKX0+RG9uZTwvYnV0dG9uPlxuXHRcdDwvc2VjdGlvbj5cblx0KTtcbn07IiwiY29uc3Rcblx0UmVhY3QgPSByZXF1aXJlKFwicHJlYWN0XCIpLFxuXG5cdEJpbmQgPSByZXF1aXJlKFwiLi4vYmluZC5qc1wiKSxcblxuXHRDYXJkID0gcmVxdWlyZShcIi4vQ2FyZC5qc1wiKSxcblx0UXVhZHJhbnRTZWxlY3RvciA9IHJlcXVpcmUoXCIuL1F1YWRyYW50U2VsZWN0b3IuanNcIiksXG5cdE51bWJlclNlbGVjdG9yID0gcmVxdWlyZShcIi4vTnVtYmVyU2VsZWN0b3IuanNcIiksXG5cdFNvbmFyID0gcmVxdWlyZShcIi4uL3NvbmFyLmpzXCIpLFxuXG5cdFN0eWxlID0gcmVxdWlyZSAoXCIuLi9zdHlsZS5qc1wiKTtcblxuY2xhc3MgU3ViVmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKHByb3BzLCBjb250ZXh0KSB7XG5cdFx0c3VwZXIocHJvcHMpO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdHF1YWRyYW50OiBcIlJcIixcblx0XHRcdHF1YWRyYW50Q29sb3I6IFwiI2ZmMDAwMFwiLFxuXHRcdFx0cG9zQTogdW5kZWZpbmVkLFxuXHRcdFx0cG9zQjogdW5kZWZpbmVkLFxuXHRcdFx0c3BlZWQ6IHVuZGVmaW5lZCxcblx0XHRcdGRlcHRoOiB1bmRlZmluZWQsXG5cdFx0XHRzdGVhbHRoOiB1bmRlZmluZWRcblx0XHR9O1xuXG5cdFx0QmluZCh0aGlzKTtcblx0fVxuXG5cdHJlbmRlcihwcm9wcywgc3RhdGUpIHtcblx0XHR2YXIgbm9TZWd1ZSA9IChzdGF0ZS5wb3NBICAgID09PSB1bmRlZmluZWRcblx0XHRcdFx0XHR8fCBzdGF0ZS5wb3NCICAgID09PSB1bmRlZmluZWRcblx0XHRcdFx0XHR8fCBzdGF0ZS5zcGVlZCAgID09PSB1bmRlZmluZWRcblx0XHRcdFx0XHR8fCBzdGF0ZS5kZXB0aCAgID09PSB1bmRlZmluZWRcblx0XHRcdFx0XHR8fCBzdGF0ZS5zdGVhbHRoID09PSB1bmRlZmluZWQpXG5cdFx0cmV0dXJuIChcblx0XHRcdDxzZWN0aW9uIHN0eWxlPXtTdHlsZS5NYWluTGF5b3V0fT5cblx0XHRcdFx0PENhcmQgY29sb3I9e3N0YXRlLnF1YWRyYW50Q29sb3J9PlxuXHRcdFx0XHRcdDxoMj5Qb3NpdGlvbjwvaDI+XG5cdFx0XHRcdFx0PFF1YWRyYW50U2VsZWN0b3Igc2VsZWN0ZWQ9e3N0YXRlLnF1YWRyYW50fSBvblNlbGVjdD17dGhpcy5zZWxlY3RRdWFkcmFudH0gLz5cblx0XHRcdFx0XHQ8TnVtYmVyU2VsZWN0b3IgZmc9e3N0YXRlLnF1YWRyYW50Q29sb3J9IHNlbGVjdGVkPXtbdGhpcy5zdGF0ZS5wb3NBLCB0aGlzLnN0YXRlLnBvc0JdfSBmcm9tPXswfSB0bz17OX0gb25DbGljaz17dGhpcy5zZWxlY3RQb3NpdGlvbn0gLz5cblx0XHRcdFx0PC9DYXJkPlxuXHRcdFx0XHQ8Q2FyZCBjb2xvcj1cIiMzMzMzMzNcIj5cblx0XHRcdFx0XHQ8aDI+U3BlZWQ8L2gyPlxuXHRcdFx0XHRcdDxOdW1iZXJTZWxlY3RvciBzZWxlY3RlZD17W3N0YXRlLnNwZWVkXX0gZnJvbT17MH0gdG89ezR9IG9uQ2xpY2s9e3RoaXMuc2VsZWN0U3BlZWR9IC8+XG5cdFx0XHRcdDwvQ2FyZD5cblx0XHRcdFx0PENhcmQgY29sb3I9XCIjMDEzOWE0XCI+XG5cdFx0XHRcdFx0PGgyPkRlcHRoPC9oMj5cblx0XHRcdFx0XHQ8TnVtYmVyU2VsZWN0b3Igc2VsZWN0ZWQ9e1tzdGF0ZS5kZXB0aF19IGZyb209ezB9IHRvPXs0fSBvbkNsaWNrPXt0aGlzLnNlbGVjdERlcHRofSAvPlxuXHRcdFx0XHQ8L0NhcmQ+XG5cdFx0XHRcdDxDYXJkIGNvbG9yPVwiIzk5OTk5OVwiPlxuXHRcdFx0XHRcdDxoMj5TdGVhbHRoPC9oMj5cblx0XHRcdFx0XHQ8TnVtYmVyU2VsZWN0b3Igc2VsZWN0ZWQ9e1tzdGF0ZS5zdGVhbHRoXX0gZnJvbT17MH0gdG89ezEyfSBvbkNsaWNrPXt0aGlzLnNlbGVjdFN0ZWFsdGh9IC8+XG5cdFx0XHRcdDwvQ2FyZD5cblx0XHRcdFx0PGJ1dHRvblxuXHRcdFx0XHRcdHN0eWxlPXsobm9TZWd1ZSA/IFN0eWxlLkRpc2FibGVkQnV0dG9uIDogU3R5bGUuU2VndWVCdXR0b24pfVxuXHRcdFx0XHRcdG9uQ2xpY2s9e3RoaXMuc3RhY2tEZWNrfVxuXHRcdFx0XHRcdGRpc2FibGVkPXtub1NlZ3VlfVxuXHRcdFx0XHQ+RG9uZTwvYnV0dG9uPlxuXHRcdFx0PC9zZWN0aW9uPlxuXHRcdCk7XG5cdH1cblxuXHRzZWxlY3RRdWFkcmFudChxKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRxdWFkcmFudDogcSxcblx0XHRcdHF1YWRyYW50Q29sb3I6IFNvbmFyLkNvbG9yRm9yUXVhZHJhbnQocSlcblx0XHR9KTtcblx0fVxuXG5cdHNlbGVjdFBvc2l0aW9uKHApIHtcblx0XHR2YXIgc3RhdGUgPSB7XG5cdFx0XHRwb3NBOiB0aGlzLnN0YXRlLnBvc0EsXG5cdFx0XHRwb3NCOiB0aGlzLnN0YXRlLnBvc0Jcblx0XHR9O1xuXG5cdFx0aWYgKHN0YXRlLnBvc0EgPT09IHApIHN0YXRlLnBvc0EgPSB1bmRlZmluZWQ7XG5cdFx0ZWxzZSBpZiAoc3RhdGUucG9zQiA9PT0gcCkgc3RhdGUucG9zQiA9IHVuZGVmaW5lZDtcblx0XHRlbHNlIGlmIChzdGF0ZS5wb3NBID09PSB1bmRlZmluZWQpIHN0YXRlLnBvc0EgPSBwO1xuXHRcdGVsc2UgaWYgKHN0YXRlLnBvc0IgPT0gdW5kZWZpbmVkKSBzdGF0ZS5wb3NCID0gcDtcblx0XHRcblx0XHR0aGlzLnNldFN0YXRlKHN0YXRlKTtcblx0fVxuXG5cdHNlbGVjdFNwZWVkKHMpIHtcblx0XHRpZiAodGhpcy5zdGF0ZS5zcGVlZCAhPT0gcykgdGhpcy5zZXRTdGF0ZSh7c3BlZWQ6IHN9KTtcblx0fVxuXG5cdHNlbGVjdERlcHRoKHMpIHtcblx0XHRpZiAodGhpcy5zdGF0ZS5kZXB0aCAhPT0gcykgdGhpcy5zZXRTdGF0ZSh7ZGVwdGg6IHN9KTtcblx0fVxuXG5cdHNlbGVjdFN0ZWFsdGgocykge1xuXHRcdGlmICh0aGlzLnN0YXRlLnN0ZWFsdGggIT09IHMpIHRoaXMuc2V0U3RhdGUoe3N0ZWFsdGg6IHN9KTtcblx0fVxuXG5cdHN0YWNrRGVjaygpIHtcblx0XHR0aGlzLnByb3BzLnNlZ3VlKFxuXHRcdFx0U29uYXIuU3ViU29uYXIodGhpcy5zdGF0ZS5xdWFkcmFudCArIHRoaXMuc3RhdGUucG9zQSwgdGhpcy5zdGF0ZS5xdWFkcmFudCArIHRoaXMuc3RhdGUucG9zQiwgXCJTXCIgKyB0aGlzLnN0YXRlLnNwZWVkLCBcIkRcIiArIHRoaXMuc3RhdGUuZGVwdGgsIHRoaXMuc3RhdGUuc3RlYWx0aClcblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU3ViVmlldzsiLCIvLyBPYmplY3QuYXNzaWduIFBPTFlGSUxMXG4vLyBzb3VyY2U6IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9hc3NpZ24jUG9seWZpbGxcbi8vXG5pZiAodHlwZW9mIE9iamVjdC5hc3NpZ24gIT0gJ2Z1bmN0aW9uJykge1xuXHRPYmplY3QuYXNzaWduID0gZnVuY3Rpb24odGFyZ2V0LCB2YXJBcmdzKSB7IC8vIC5sZW5ndGggb2YgZnVuY3Rpb24gaXMgMlxuXHRcdCd1c2Ugc3RyaWN0Jztcblx0XHRpZiAodGFyZ2V0ID09IG51bGwpIHsgLy8gVHlwZUVycm9yIGlmIHVuZGVmaW5lZCBvciBudWxsXG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY29udmVydCB1bmRlZmluZWQgb3IgbnVsbCB0byBvYmplY3QnKTtcblx0XHR9XG5cblx0XHR2YXIgdG8gPSBPYmplY3QodGFyZ2V0KTtcblxuXHRcdGZvciAodmFyIGluZGV4ID0gMTsgaW5kZXggPCBhcmd1bWVudHMubGVuZ3RoOyBpbmRleCsrKSB7XG5cdFx0XHR2YXIgbmV4dFNvdXJjZSA9IGFyZ3VtZW50c1tpbmRleF07XG5cblx0XHRcdGlmIChuZXh0U291cmNlICE9IG51bGwpIHsgLy8gU2tpcCBvdmVyIGlmIHVuZGVmaW5lZCBvciBudWxsXG5cdFx0XHRcdGZvciAodmFyIG5leHRLZXkgaW4gbmV4dFNvdXJjZSkge1xuXHRcdFx0XHRcdC8vIEF2b2lkIGJ1Z3Mgd2hlbiBoYXNPd25Qcm9wZXJ0eSBpcyBzaGFkb3dlZFxuXHRcdFx0XHRcdGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobmV4dFNvdXJjZSwgbmV4dEtleSkpIHtcblx0XHRcdFx0XHRcdHRvW25leHRLZXldID0gbmV4dFNvdXJjZVtuZXh0S2V5XTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHRvO1xuXHR9O1xufSIsImZ1bmN0aW9uIHNvbmFyRGVjaygpIHtcblx0cmV0dXJuIFtcblx0XHRcIkcwXCIsXG5cdFx0XCJHMVwiLFxuXHRcdFwiRzJcIixcblx0XHRcIkczXCIsXG5cdFx0XCJHNFwiLFxuXHRcdFwiRzVcIixcblx0XHRcIkc2XCIsXG5cdFx0XCJHN1wiLFxuXHRcdFwiRzhcIixcblx0XHRcIkc5XCIsXG5cdFx0XCJQMFwiLFxuXHRcdFwiUDFcIixcblx0XHRcIlAyXCIsXG5cdFx0XCJQM1wiLFxuXHRcdFwiUDRcIixcblx0XHRcIlA1XCIsXG5cdFx0XCJQNlwiLFxuXHRcdFwiUDdcIixcblx0XHRcIlA4XCIsXG5cdFx0XCJQOVwiLFxuXHRcdFwiTzBcIixcblx0XHRcIk8xXCIsXG5cdFx0XCJPMlwiLFxuXHRcdFwiTzNcIixcblx0XHRcIk80XCIsXG5cdFx0XCJPNVwiLFxuXHRcdFwiTzZcIixcblx0XHRcIk83XCIsXG5cdFx0XCJPOFwiLFxuXHRcdFwiTzlcIixcblx0XHRcIlIwXCIsXG5cdFx0XCJSMVwiLFxuXHRcdFwiUjJcIixcblx0XHRcIlIzXCIsXG5cdFx0XCJSNFwiLFxuXHRcdFwiUjVcIixcblx0XHRcIlI2XCIsXG5cdFx0XCJSN1wiLFxuXHRcdFwiUjhcIixcblx0XHRcIlI5XCIsXG5cdFx0XCJEMFwiLFxuXHRcdFwiRDFcIixcblx0XHRcIkQyXCIsXG5cdFx0XCJEM1wiLFxuXHRcdFwiRDRcIixcblx0XHRcIlMwXCIsXG5cdFx0XCJTMVwiLFxuXHRcdFwiUzJcIixcblx0XHRcIlMzXCIsXG5cdFx0XCJTNFwiXG5cdF07XG59XG5cbmZ1bmN0aW9uIEZpc2hlcllhdGVzU2h1ZmZsZShkZWNrKSB7XG5cdHZhciAgdGVtcCwgaSwgajtcblxuXHRpID0gZGVjay5sZW5ndGg7XG5cdHdoaWxlKGkpIHtcblx0XHRqID0gKE1hdGgucmFuZG9tKCkgKiBpLS0pID4+IDA7IFxuXG5cdFx0dGVtcCA9IGRlY2tbaV07XG5cdFx0ZGVja1tpXSA9IGRlY2tbal07XG5cdFx0ZGVja1tqXSA9IHRlbXA7XG5cdH1cbn1cblxuZnVuY3Rpb24gc2h1ZmZsZShkZWNrLCB0aW1lcykge1xuXHR3aGlsZSAodGltZXMtLSkgRmlzaGVyWWF0ZXNTaHVmZmxlKGRlY2spO1xufVxuXG5mdW5jdGlvbiBTaGlwU29uYXIoZGV0ZWN0aW9uKSB7XG5cdHdoaWxlIChkZXRlY3Rpb24gPCB0aGlzLmxlbmd0aCkgdGhpcy5wb3AoKTtcblx0cmV0dXJuIHRoaXM7XG59XG5cbmZ1bmN0aW9uIFN1YlNvbmFyKHBvc0EsIHBvc0IsIHNwZWVkLCBkZXB0aCwgc3RlYWx0aCkge1xuXHR2YXIgZGVjayA9IHNvbmFyRGVjaygpLFxuXHRcdHNvbmFyID0gW10sXG5cdFx0aTtcblxuXHRpID0gZGVjay5pbmRleE9mKHBvc0EpO1xuXHRpZiAoaSAhPT0gLTEpIHNvbmFyLnB1c2goZGVjay5zcGxpY2UoaSwgMSlbMF0pO1xuXHRlbHNlIHRocm93IFwiUG9zaXRpb246IFwiICsgcG9zQSArIFwiIG5vdCBpbiBTb25hciFcIjtcblxuXHRpID0gZGVjay5pbmRleE9mKHBvc0IpO1xuXHRpZiAoaSAhPT0gLTEpIHNvbmFyLnB1c2goZGVjay5zcGxpY2UoaSwgMSlbMF0pO1xuXHRlbHNlIHRocm93IFwiUG9zaXRpb246IFwiICsgcG9zQiArIFwiIG5vdCBpbiBTb25hciFcIjtcblxuXHRpID0gZGVjay5pbmRleE9mKHNwZWVkKTtcblx0aWYgKGkgIT09IC0xKSBzb25hci5wdXNoKGRlY2suc3BsaWNlKGksIDEpWzBdKTtcblx0ZWxzZSB0aHJvdyBcIlNwZWVkOiBcIiArIHNwZWVkICsgXCIgbm90IGluIFNvbmFyIVwiO1xuXG5cdGkgPSBkZWNrLmluZGV4T2YoZGVwdGgpO1xuXHRpZiAoaSAhPT0gLTEpIHNvbmFyLnB1c2goZGVjay5zcGxpY2UoaSwgMSlbMF0pO1xuXHRlbHNlIHRocm93IFwiU3BlZWQ6IFwiICsgZGVwdGggKyBcIiBub3QgaW4gU29uYXIhXCI7XG5cblx0c2h1ZmZsZShkZWNrLCAyKTtcblxuXHR3aGlsZSAoc3RlYWx0aC0tKSB7XG5cdFx0aSA9IChNYXRoLnJhbmRvbSgpICogZGVjay5sZW5ndGgpID4+IDA7XG5cdFx0c29uYXIucHVzaChkZWNrLnNwbGljZShpLCAxKVswXSk7XG5cdH1cblxuXHRzaHVmZmxlKHNvbmFyLCAyKTtcblxuXHRyZXR1cm4gU2hpcFNvbmFyLmJpbmQoc29uYXIpO1xufVxuXG5mdW5jdGlvbiBDb2xvckZvclF1YWRyYW50KHEpIHtcblx0c3dpdGNoIChxKSB7XG5cdFx0Y2FzZSBcIlJcIjogcmV0dXJuIFwiI2ZmMDAwMFwiO1xuXHRcdGNhc2UgXCJQXCI6IHJldHVybiBcIiNjYzAwY2NcIjtcblx0XHRjYXNlIFwiT1wiOiByZXR1cm4gXCIjZmY5OTAwXCI7XG5cdFx0Y2FzZSBcIkdcIjogcmV0dXJuIFwiIzAwY2MzM1wiO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geyBTdWJTb25hcjogU3ViU29uYXIsIENvbG9yRm9yUXVhZHJhbnQ6IENvbG9yRm9yUXVhZHJhbnQgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcblx0TWFpbkxheW91dDoge1xuXHRcdGRpc3BsYXk6IFwiZmxleFwiLFxuXHRcdGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG5cdFx0anVzdGlmeUNvbnRlbnQ6IFwiZmxleC1zdGFydFwiLFxuXHRcdGFsaWduSXRlbXM6IFwiY2VudGVyXCJcblx0fSxcblx0U2VndWVCdXR0b246IHtcblx0XHR3aWR0aDogXCI5NXZ3XCIsXG5cdFx0aGVpZ2h0OiBcIjRyZW1cIixcblx0XHRmb250V2VpZ2h0OiBcIjIwMFwiLFxuXHRcdGZvbnRTaXplOiBcIjJyZW1cIixcblx0XHRib3JkZXI6IFwibm9uZVwiLFxuXHRcdG91dGxpbmU6IFwibm9uZVwiLFxuXHRcdGNvbG9yOiBcIiNmZmZmZmZcIixcblx0XHRiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgyNTUsMjU1LDI1NSwwLjUpXCJcblx0fSxcblx0RGlzYWJsZWRCdXR0b246IHtcblx0XHR3aWR0aDogXCI5NXZ3XCIsXG5cdFx0aGVpZ2h0OiBcIjRyZW1cIixcblx0XHRmb250V2VpZ2h0OiBcIjIwMFwiLFxuXHRcdGZvbnRTaXplOiBcIjJyZW1cIixcblx0XHRib3JkZXI6IFwibm9uZVwiLFxuXHRcdG91dGxpbmU6IFwibm9uZVwiLFxuXHRcdGNvbG9yOiBcIiMyMjIyMjJcIixcblx0XHRiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgyNTUsMjU1LDI1NSwwLjI1KVwiXG5cdH0sXG5cdE51bWJlckJveDoge1xuXHRcdHdpZHRoOiBcIjY2JVwiLFxuXHRcdGRpc3BsYXk6IFwiZmxleFwiLFxuXHRcdGp1c3RpZnlDb250ZW50OiBcImZsZXgtc3RhcnRcIixcblx0XHRmbGV4V3JhcDogXCJ3cmFwXCIsXG5cdFx0bWFyZ2luQm90dG9tOiBcIjJyZW1cIlxuXHR9LFxuXHROdW1iZXJCdXR0b246IHtcblx0XHRib3JkZXI6IFwibm9uZVwiLFxuXHRcdG91dGxpbmU6IFwibm9uZVwiLFxuXHRcdGZvbnRTaXplOiBcIjNyZW1cIixcblx0XHRmb250V2VpZ2h0OiBcIjIwMFwiLFxuXHRcdG1hcmdpbjogXCIwLjc1cmVtXCIsXG5cdFx0YmFja2dyb3VuZENvbG9yOiBcInJnYmEoMCwwLDAsMClcIlxuXHR9LFxuXHRIZXhCdXR0b246IHtcblx0XHRkaXNwbGF5OiBcImlubGluZVwiLFxuXHRcdG1hcmdpbjogXCIwLjE1cmVtXCIsXG5cdFx0Zm9udEZhbWlseTogXCJPcGVuIFNhbnNcIlxuXHR9LFxuXHRDYXJkOiB7XG5cdFx0bWFyZ2luQm90dG9tOiBcIjFyZW1cIixcblx0XHR3aWR0aDogXCIxMDAlXCIsXG5cdFx0Ym9yZGVyUmFkaXVzOiBcIjFyZW1cIixcblx0XHRkaXNwbGF5OiBcImZsZXhcIixcblx0XHRmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuXHRcdGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG5cdFx0anVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCJcblx0fSxcblx0aW1nOiB7XG5cdFx0d2lkdGg6IFwiMTAwJVwiLFxuXHRcdGhlaWdodDogXCJhdXRvXCJcblx0fVxufTsiXX0=
