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
		fontSize: "2rem",
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
			style: Object.assign({}, Style.NumberButton, { color: props.selected.indexOf(i) === -1 ? "rgba(255, 255, 255, 0.3)" : "#ffffff" }),
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
		alignItems: "center",
		maxWidth: "25rem"
	},
	SegueButton: {
		width: "24rem",
		height: "4rem",
		fontWeight: "200",
		fontSize: "2rem",
		border: "none",
		outline: "none",
		color: "#ffffff",
		backgroundColor: "rgba(255,255,255,0.5)"
	},
	DisabledButton: {
		width: "24rem",
		height: "4rem",
		fontWeight: "200",
		fontSize: "2rem",
		border: "none",
		outline: "none",
		color: "#222222",
		backgroundColor: "rgba(255,255,255,0.25)"
	},
	NumberBox: {
		marginLeft: "auto",
		marginRight: "auto",
		width: "80%",
		display: "flex",
		justifyContent: "flex-start",
		flexWrap: "wrap",
		marginBottom: "2rem"
	},
	NumberButton: {
		border: "none",
		outline: "none",
		fontSize: "2rem",
		fontWeight: "200",
		margin: "0.75rem",
		backgroundColor: "rgba(0,0,0,0)"
	},
	HexButton: {
		display: "inline",
		margin: "0.15rem",
		fontFamily: "Open Sans",
		fontSize: "1rem",
		width: "5rem",
		height: "5rem"
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcHJlYWN0L2Rpc3QvcHJlYWN0LmpzIiwic3JjL0FwcC5qcyIsInNyYy9iaW5kLmpzIiwic3JjL2NvbXBvbmVudHMvQ2FyZC5qcyIsInNyYy9jb21wb25lbnRzL0hleC5qcyIsInNyYy9jb21wb25lbnRzL0hleEJ1dHRvbi5qcyIsInNyYy9jb21wb25lbnRzL051bWJlckxpc3QuanMiLCJzcmMvY29tcG9uZW50cy9OdW1iZXJTZWxlY3Rvci5qcyIsInNyYy9jb21wb25lbnRzL1Bhc3MuanMiLCJzcmMvY29tcG9uZW50cy9RdWFkcmFudFNlbGVjdG9yLmpzIiwic3JjL2NvbXBvbmVudHMvU2hpcFZpZXcuanMiLCJzcmMvY29tcG9uZW50cy9Tb25hclZpZXcuanMiLCJzcmMvY29tcG9uZW50cy9TdWJWaWV3LmpzIiwic3JjL3BvbHlmaWxscy5qcyIsInNyYy9zb25hci5qcyIsInNyYy9zdHlsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQy9ZQSxRQUFBLEFBQVE7O0FBRVIsSUFDQyxRQUFRLFFBRFQsQUFDUyxBQUFRO0lBRWhCLE9BQU8sUUFIUixBQUdRLEFBQVE7SUFFZixPQUFPLFFBTFIsQUFLUSxBQUFRO0lBQ2YsVUFBVSxRQU5YLEFBTVcsQUFBUTtJQUNsQixXQUFXLFFBUFosQUFPWSxBQUFRO0lBQ25CLFlBQVksUUFSYixBQVFh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Y0FOSyxBQU1PLEFBQ1o7a0JBNURlLEFBcURWLEFBT1csQUFFakI7QUFUTSxBQUNMOztTQVFJLEFBQ0csQUFDUDtVQWhFRixBQUFpQixBQThEWCxBQUVJO0FBRkosQUFDSjtBQS9EZSxBQUNoQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIhZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGZ1bmN0aW9uIFZOb2RlKCkge31cbiAgICBmdW5jdGlvbiBoKG5vZGVOYW1lLCBhdHRyaWJ1dGVzKSB7XG4gICAgICAgIHZhciBsYXN0U2ltcGxlLCBjaGlsZCwgc2ltcGxlLCBpLCBjaGlsZHJlbiA9IEVNUFRZX0NISUxEUkVOO1xuICAgICAgICBmb3IgKGkgPSBhcmd1bWVudHMubGVuZ3RoOyBpLS0gPiAyOyApIHN0YWNrLnB1c2goYXJndW1lbnRzW2ldKTtcbiAgICAgICAgaWYgKGF0dHJpYnV0ZXMgJiYgbnVsbCAhPSBhdHRyaWJ1dGVzLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICBpZiAoIXN0YWNrLmxlbmd0aCkgc3RhY2sucHVzaChhdHRyaWJ1dGVzLmNoaWxkcmVuKTtcbiAgICAgICAgICAgIGRlbGV0ZSBhdHRyaWJ1dGVzLmNoaWxkcmVuO1xuICAgICAgICB9XG4gICAgICAgIHdoaWxlIChzdGFjay5sZW5ndGgpIGlmICgoY2hpbGQgPSBzdGFjay5wb3AoKSkgJiYgdm9pZCAwICE9PSBjaGlsZC5wb3ApIGZvciAoaSA9IGNoaWxkLmxlbmd0aDsgaS0tOyApIHN0YWNrLnB1c2goY2hpbGRbaV0pOyBlbHNlIHtcbiAgICAgICAgICAgIGlmIChjaGlsZCA9PT0gITAgfHwgY2hpbGQgPT09ICExKSBjaGlsZCA9IG51bGw7XG4gICAgICAgICAgICBpZiAoc2ltcGxlID0gJ2Z1bmN0aW9uJyAhPSB0eXBlb2Ygbm9kZU5hbWUpIGlmIChudWxsID09IGNoaWxkKSBjaGlsZCA9ICcnOyBlbHNlIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgY2hpbGQpIGNoaWxkID0gU3RyaW5nKGNoaWxkKTsgZWxzZSBpZiAoJ3N0cmluZycgIT0gdHlwZW9mIGNoaWxkKSBzaW1wbGUgPSAhMTtcbiAgICAgICAgICAgIGlmIChzaW1wbGUgJiYgbGFzdFNpbXBsZSkgY2hpbGRyZW5bY2hpbGRyZW4ubGVuZ3RoIC0gMV0gKz0gY2hpbGQ7IGVsc2UgaWYgKGNoaWxkcmVuID09PSBFTVBUWV9DSElMRFJFTikgY2hpbGRyZW4gPSBbIGNoaWxkIF07IGVsc2UgY2hpbGRyZW4ucHVzaChjaGlsZCk7XG4gICAgICAgICAgICBsYXN0U2ltcGxlID0gc2ltcGxlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwID0gbmV3IFZOb2RlKCk7XG4gICAgICAgIHAubm9kZU5hbWUgPSBub2RlTmFtZTtcbiAgICAgICAgcC5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuICAgICAgICBwLmF0dHJpYnV0ZXMgPSBudWxsID09IGF0dHJpYnV0ZXMgPyB2b2lkIDAgOiBhdHRyaWJ1dGVzO1xuICAgICAgICBwLmtleSA9IG51bGwgPT0gYXR0cmlidXRlcyA/IHZvaWQgMCA6IGF0dHJpYnV0ZXMua2V5O1xuICAgICAgICBpZiAodm9pZCAwICE9PSBvcHRpb25zLnZub2RlKSBvcHRpb25zLnZub2RlKHApO1xuICAgICAgICByZXR1cm4gcDtcbiAgICB9XG4gICAgZnVuY3Rpb24gZXh0ZW5kKG9iaiwgcHJvcHMpIHtcbiAgICAgICAgZm9yICh2YXIgaSBpbiBwcm9wcykgb2JqW2ldID0gcHJvcHNbaV07XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNsb25lRWxlbWVudCh2bm9kZSwgcHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIGgodm5vZGUubm9kZU5hbWUsIGV4dGVuZChleHRlbmQoe30sIHZub2RlLmF0dHJpYnV0ZXMpLCBwcm9wcyksIGFyZ3VtZW50cy5sZW5ndGggPiAyID8gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpIDogdm5vZGUuY2hpbGRyZW4pO1xuICAgIH1cbiAgICBmdW5jdGlvbiBlbnF1ZXVlUmVuZGVyKGNvbXBvbmVudCkge1xuICAgICAgICBpZiAoIWNvbXBvbmVudC5fX2QgJiYgKGNvbXBvbmVudC5fX2QgPSAhMCkgJiYgMSA9PSBpdGVtcy5wdXNoKGNvbXBvbmVudCkpIChvcHRpb25zLmRlYm91bmNlUmVuZGVyaW5nIHx8IHNldFRpbWVvdXQpKHJlcmVuZGVyKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcmVyZW5kZXIoKSB7XG4gICAgICAgIHZhciBwLCBsaXN0ID0gaXRlbXM7XG4gICAgICAgIGl0ZW1zID0gW107XG4gICAgICAgIHdoaWxlIChwID0gbGlzdC5wb3AoKSkgaWYgKHAuX19kKSByZW5kZXJDb21wb25lbnQocCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzU2FtZU5vZGVUeXBlKG5vZGUsIHZub2RlLCBoeWRyYXRpbmcpIHtcbiAgICAgICAgaWYgKCdzdHJpbmcnID09IHR5cGVvZiB2bm9kZSB8fCAnbnVtYmVyJyA9PSB0eXBlb2Ygdm5vZGUpIHJldHVybiB2b2lkIDAgIT09IG5vZGUuc3BsaXRUZXh0O1xuICAgICAgICBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIHZub2RlLm5vZGVOYW1lKSByZXR1cm4gIW5vZGUuX2NvbXBvbmVudENvbnN0cnVjdG9yICYmIGlzTmFtZWROb2RlKG5vZGUsIHZub2RlLm5vZGVOYW1lKTsgZWxzZSByZXR1cm4gaHlkcmF0aW5nIHx8IG5vZGUuX2NvbXBvbmVudENvbnN0cnVjdG9yID09PSB2bm9kZS5ub2RlTmFtZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaXNOYW1lZE5vZGUobm9kZSwgbm9kZU5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5vZGUuX19uID09PSBub2RlTmFtZSB8fCBub2RlLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgPT09IG5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGdldE5vZGVQcm9wcyh2bm9kZSkge1xuICAgICAgICB2YXIgcHJvcHMgPSBleHRlbmQoe30sIHZub2RlLmF0dHJpYnV0ZXMpO1xuICAgICAgICBwcm9wcy5jaGlsZHJlbiA9IHZub2RlLmNoaWxkcmVuO1xuICAgICAgICB2YXIgZGVmYXVsdFByb3BzID0gdm5vZGUubm9kZU5hbWUuZGVmYXVsdFByb3BzO1xuICAgICAgICBpZiAodm9pZCAwICE9PSBkZWZhdWx0UHJvcHMpIGZvciAodmFyIGkgaW4gZGVmYXVsdFByb3BzKSBpZiAodm9pZCAwID09PSBwcm9wc1tpXSkgcHJvcHNbaV0gPSBkZWZhdWx0UHJvcHNbaV07XG4gICAgICAgIHJldHVybiBwcm9wcztcbiAgICB9XG4gICAgZnVuY3Rpb24gY3JlYXRlTm9kZShub2RlTmFtZSwgaXNTdmcpIHtcbiAgICAgICAgdmFyIG5vZGUgPSBpc1N2ZyA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCBub2RlTmFtZSkgOiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KG5vZGVOYW1lKTtcbiAgICAgICAgbm9kZS5fX24gPSBub2RlTmFtZTtcbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlbW92ZU5vZGUobm9kZSkge1xuICAgICAgICBpZiAobm9kZS5wYXJlbnROb2RlKSBub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHNldEFjY2Vzc29yKG5vZGUsIG5hbWUsIG9sZCwgdmFsdWUsIGlzU3ZnKSB7XG4gICAgICAgIGlmICgnY2xhc3NOYW1lJyA9PT0gbmFtZSkgbmFtZSA9ICdjbGFzcyc7XG4gICAgICAgIGlmICgna2V5JyA9PT0gbmFtZSkgOyBlbHNlIGlmICgncmVmJyA9PT0gbmFtZSkge1xuICAgICAgICAgICAgaWYgKG9sZCkgb2xkKG51bGwpO1xuICAgICAgICAgICAgaWYgKHZhbHVlKSB2YWx1ZShub2RlKTtcbiAgICAgICAgfSBlbHNlIGlmICgnY2xhc3MnID09PSBuYW1lICYmICFpc1N2Zykgbm9kZS5jbGFzc05hbWUgPSB2YWx1ZSB8fCAnJzsgZWxzZSBpZiAoJ3N0eWxlJyA9PT0gbmFtZSkge1xuICAgICAgICAgICAgaWYgKCF2YWx1ZSB8fCAnc3RyaW5nJyA9PSB0eXBlb2YgdmFsdWUgfHwgJ3N0cmluZycgPT0gdHlwZW9mIG9sZCkgbm9kZS5zdHlsZS5jc3NUZXh0ID0gdmFsdWUgfHwgJyc7XG4gICAgICAgICAgICBpZiAodmFsdWUgJiYgJ29iamVjdCcgPT0gdHlwZW9mIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCdzdHJpbmcnICE9IHR5cGVvZiBvbGQpIGZvciAodmFyIGkgaW4gb2xkKSBpZiAoIShpIGluIHZhbHVlKSkgbm9kZS5zdHlsZVtpXSA9ICcnO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gdmFsdWUpIG5vZGUuc3R5bGVbaV0gPSAnbnVtYmVyJyA9PSB0eXBlb2YgdmFsdWVbaV0gJiYgSVNfTk9OX0RJTUVOU0lPTkFMLnRlc3QoaSkgPT09ICExID8gdmFsdWVbaV0gKyAncHgnIDogdmFsdWVbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoJ2Rhbmdlcm91c2x5U2V0SW5uZXJIVE1MJyA9PT0gbmFtZSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlKSBub2RlLmlubmVySFRNTCA9IHZhbHVlLl9faHRtbCB8fCAnJztcbiAgICAgICAgfSBlbHNlIGlmICgnbycgPT0gbmFtZVswXSAmJiAnbicgPT0gbmFtZVsxXSkge1xuICAgICAgICAgICAgdmFyIHVzZUNhcHR1cmUgPSBuYW1lICE9PSAobmFtZSA9IG5hbWUucmVwbGFjZSgvQ2FwdHVyZSQvLCAnJykpO1xuICAgICAgICAgICAgbmFtZSA9IG5hbWUudG9Mb3dlckNhc2UoKS5zdWJzdHJpbmcoMik7XG4gICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIW9sZCkgbm9kZS5hZGRFdmVudExpc3RlbmVyKG5hbWUsIGV2ZW50UHJveHksIHVzZUNhcHR1cmUpO1xuICAgICAgICAgICAgfSBlbHNlIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLCBldmVudFByb3h5LCB1c2VDYXB0dXJlKTtcbiAgICAgICAgICAgIChub2RlLl9fbCB8fCAobm9kZS5fX2wgPSB7fSkpW25hbWVdID0gdmFsdWU7XG4gICAgICAgIH0gZWxzZSBpZiAoJ2xpc3QnICE9PSBuYW1lICYmICd0eXBlJyAhPT0gbmFtZSAmJiAhaXNTdmcgJiYgbmFtZSBpbiBub2RlKSB7XG4gICAgICAgICAgICBzZXRQcm9wZXJ0eShub2RlLCBuYW1lLCBudWxsID09IHZhbHVlID8gJycgOiB2YWx1ZSk7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2YWx1ZSB8fCB2YWx1ZSA9PT0gITEpIG5vZGUucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIG5zID0gaXNTdmcgJiYgbmFtZSAhPT0gKG5hbWUgPSBuYW1lLnJlcGxhY2UoL154bGlua1xcOj8vLCAnJykpO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdmFsdWUgfHwgdmFsdWUgPT09ICExKSBpZiAobnMpIG5vZGUucmVtb3ZlQXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCBuYW1lLnRvTG93ZXJDYXNlKCkpOyBlbHNlIG5vZGUucmVtb3ZlQXR0cmlidXRlKG5hbWUpOyBlbHNlIGlmICgnZnVuY3Rpb24nICE9IHR5cGVvZiB2YWx1ZSkgaWYgKG5zKSBub2RlLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgbmFtZS50b0xvd2VyQ2FzZSgpLCB2YWx1ZSk7IGVsc2Ugbm9kZS5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHNldFByb3BlcnR5KG5vZGUsIG5hbWUsIHZhbHVlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBub2RlW25hbWVdID0gdmFsdWU7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGV2ZW50UHJveHkoZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fX2xbZS50eXBlXShvcHRpb25zLmV2ZW50ICYmIG9wdGlvbnMuZXZlbnQoZSkgfHwgZSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGZsdXNoTW91bnRzKCkge1xuICAgICAgICB2YXIgYztcbiAgICAgICAgd2hpbGUgKGMgPSBtb3VudHMucG9wKCkpIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmFmdGVyTW91bnQpIG9wdGlvbnMuYWZ0ZXJNb3VudChjKTtcbiAgICAgICAgICAgIGlmIChjLmNvbXBvbmVudERpZE1vdW50KSBjLmNvbXBvbmVudERpZE1vdW50KCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gZGlmZihkb20sIHZub2RlLCBjb250ZXh0LCBtb3VudEFsbCwgcGFyZW50LCBjb21wb25lbnRSb290KSB7XG4gICAgICAgIGlmICghZGlmZkxldmVsKyspIHtcbiAgICAgICAgICAgIGlzU3ZnTW9kZSA9IG51bGwgIT0gcGFyZW50ICYmIHZvaWQgMCAhPT0gcGFyZW50Lm93bmVyU1ZHRWxlbWVudDtcbiAgICAgICAgICAgIGh5ZHJhdGluZyA9IG51bGwgIT0gZG9tICYmICEoJ19fcHJlYWN0YXR0cl8nIGluIGRvbSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJldCA9IGlkaWZmKGRvbSwgdm5vZGUsIGNvbnRleHQsIG1vdW50QWxsLCBjb21wb25lbnRSb290KTtcbiAgICAgICAgaWYgKHBhcmVudCAmJiByZXQucGFyZW50Tm9kZSAhPT0gcGFyZW50KSBwYXJlbnQuYXBwZW5kQ2hpbGQocmV0KTtcbiAgICAgICAgaWYgKCEtLWRpZmZMZXZlbCkge1xuICAgICAgICAgICAgaHlkcmF0aW5nID0gITE7XG4gICAgICAgICAgICBpZiAoIWNvbXBvbmVudFJvb3QpIGZsdXNoTW91bnRzKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgZnVuY3Rpb24gaWRpZmYoZG9tLCB2bm9kZSwgY29udGV4dCwgbW91bnRBbGwsIGNvbXBvbmVudFJvb3QpIHtcbiAgICAgICAgdmFyIG91dCA9IGRvbSwgcHJldlN2Z01vZGUgPSBpc1N2Z01vZGU7XG4gICAgICAgIGlmIChudWxsID09IHZub2RlKSB2bm9kZSA9ICcnO1xuICAgICAgICBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIHZub2RlKSB7XG4gICAgICAgICAgICBpZiAoZG9tICYmIHZvaWQgMCAhPT0gZG9tLnNwbGl0VGV4dCAmJiBkb20ucGFyZW50Tm9kZSAmJiAoIWRvbS5fY29tcG9uZW50IHx8IGNvbXBvbmVudFJvb3QpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRvbS5ub2RlVmFsdWUgIT0gdm5vZGUpIGRvbS5ub2RlVmFsdWUgPSB2bm9kZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3V0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodm5vZGUpO1xuICAgICAgICAgICAgICAgIGlmIChkb20pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRvbS5wYXJlbnROb2RlKSBkb20ucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQob3V0LCBkb20pO1xuICAgICAgICAgICAgICAgICAgICByZWNvbGxlY3ROb2RlVHJlZShkb20sICEwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvdXQuX19wcmVhY3RhdHRyXyA9ICEwO1xuICAgICAgICAgICAgcmV0dXJuIG91dDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2Ygdm5vZGUubm9kZU5hbWUpIHJldHVybiBidWlsZENvbXBvbmVudEZyb21WTm9kZShkb20sIHZub2RlLCBjb250ZXh0LCBtb3VudEFsbCk7XG4gICAgICAgIGlzU3ZnTW9kZSA9ICdzdmcnID09PSB2bm9kZS5ub2RlTmFtZSA/ICEwIDogJ2ZvcmVpZ25PYmplY3QnID09PSB2bm9kZS5ub2RlTmFtZSA/ICExIDogaXNTdmdNb2RlO1xuICAgICAgICBpZiAoIWRvbSB8fCAhaXNOYW1lZE5vZGUoZG9tLCBTdHJpbmcodm5vZGUubm9kZU5hbWUpKSkge1xuICAgICAgICAgICAgb3V0ID0gY3JlYXRlTm9kZShTdHJpbmcodm5vZGUubm9kZU5hbWUpLCBpc1N2Z01vZGUpO1xuICAgICAgICAgICAgaWYgKGRvbSkge1xuICAgICAgICAgICAgICAgIHdoaWxlIChkb20uZmlyc3RDaGlsZCkgb3V0LmFwcGVuZENoaWxkKGRvbS5maXJzdENoaWxkKTtcbiAgICAgICAgICAgICAgICBpZiAoZG9tLnBhcmVudE5vZGUpIGRvbS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChvdXQsIGRvbSk7XG4gICAgICAgICAgICAgICAgcmVjb2xsZWN0Tm9kZVRyZWUoZG9tLCAhMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGZjID0gb3V0LmZpcnN0Q2hpbGQsIHByb3BzID0gb3V0Ll9fcHJlYWN0YXR0cl8gfHwgKG91dC5fX3ByZWFjdGF0dHJfID0ge30pLCB2Y2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlbjtcbiAgICAgICAgaWYgKCFoeWRyYXRpbmcgJiYgdmNoaWxkcmVuICYmIDEgPT09IHZjaGlsZHJlbi5sZW5ndGggJiYgJ3N0cmluZycgPT0gdHlwZW9mIHZjaGlsZHJlblswXSAmJiBudWxsICE9IGZjICYmIHZvaWQgMCAhPT0gZmMuc3BsaXRUZXh0ICYmIG51bGwgPT0gZmMubmV4dFNpYmxpbmcpIHtcbiAgICAgICAgICAgIGlmIChmYy5ub2RlVmFsdWUgIT0gdmNoaWxkcmVuWzBdKSBmYy5ub2RlVmFsdWUgPSB2Y2hpbGRyZW5bMF07XG4gICAgICAgIH0gZWxzZSBpZiAodmNoaWxkcmVuICYmIHZjaGlsZHJlbi5sZW5ndGggfHwgbnVsbCAhPSBmYykgaW5uZXJEaWZmTm9kZShvdXQsIHZjaGlsZHJlbiwgY29udGV4dCwgbW91bnRBbGwsIGh5ZHJhdGluZyB8fCBudWxsICE9IHByb3BzLmRhbmdlcm91c2x5U2V0SW5uZXJIVE1MKTtcbiAgICAgICAgZGlmZkF0dHJpYnV0ZXMob3V0LCB2bm9kZS5hdHRyaWJ1dGVzLCBwcm9wcyk7XG4gICAgICAgIGlzU3ZnTW9kZSA9IHByZXZTdmdNb2RlO1xuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH1cbiAgICBmdW5jdGlvbiBpbm5lckRpZmZOb2RlKGRvbSwgdmNoaWxkcmVuLCBjb250ZXh0LCBtb3VudEFsbCwgaXNIeWRyYXRpbmcpIHtcbiAgICAgICAgdmFyIGosIGMsIHZjaGlsZCwgY2hpbGQsIG9yaWdpbmFsQ2hpbGRyZW4gPSBkb20uY2hpbGROb2RlcywgY2hpbGRyZW4gPSBbXSwga2V5ZWQgPSB7fSwga2V5ZWRMZW4gPSAwLCBtaW4gPSAwLCBsZW4gPSBvcmlnaW5hbENoaWxkcmVuLmxlbmd0aCwgY2hpbGRyZW5MZW4gPSAwLCB2bGVuID0gdmNoaWxkcmVuID8gdmNoaWxkcmVuLmxlbmd0aCA6IDA7XG4gICAgICAgIGlmICgwICE9PSBsZW4pIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBfY2hpbGQgPSBvcmlnaW5hbENoaWxkcmVuW2ldLCBwcm9wcyA9IF9jaGlsZC5fX3ByZWFjdGF0dHJfLCBrZXkgPSB2bGVuICYmIHByb3BzID8gX2NoaWxkLl9jb21wb25lbnQgPyBfY2hpbGQuX2NvbXBvbmVudC5fX2sgOiBwcm9wcy5rZXkgOiBudWxsO1xuICAgICAgICAgICAgaWYgKG51bGwgIT0ga2V5KSB7XG4gICAgICAgICAgICAgICAga2V5ZWRMZW4rKztcbiAgICAgICAgICAgICAgICBrZXllZFtrZXldID0gX2NoaWxkO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChwcm9wcyB8fCAodm9pZCAwICE9PSBfY2hpbGQuc3BsaXRUZXh0ID8gaXNIeWRyYXRpbmcgPyBfY2hpbGQubm9kZVZhbHVlLnRyaW0oKSA6ICEwIDogaXNIeWRyYXRpbmcpKSBjaGlsZHJlbltjaGlsZHJlbkxlbisrXSA9IF9jaGlsZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoMCAhPT0gdmxlbikgZm9yICh2YXIgaSA9IDA7IGkgPCB2bGVuOyBpKyspIHtcbiAgICAgICAgICAgIHZjaGlsZCA9IHZjaGlsZHJlbltpXTtcbiAgICAgICAgICAgIGNoaWxkID0gbnVsbDtcbiAgICAgICAgICAgIHZhciBrZXkgPSB2Y2hpbGQua2V5O1xuICAgICAgICAgICAgaWYgKG51bGwgIT0ga2V5KSB7XG4gICAgICAgICAgICAgICAgaWYgKGtleWVkTGVuICYmIHZvaWQgMCAhPT0ga2V5ZWRba2V5XSkge1xuICAgICAgICAgICAgICAgICAgICBjaGlsZCA9IGtleWVkW2tleV07XG4gICAgICAgICAgICAgICAgICAgIGtleWVkW2tleV0gPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgICAgIGtleWVkTGVuLS07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICghY2hpbGQgJiYgbWluIDwgY2hpbGRyZW5MZW4pIGZvciAoaiA9IG1pbjsgaiA8IGNoaWxkcmVuTGVuOyBqKyspIGlmICh2b2lkIDAgIT09IGNoaWxkcmVuW2pdICYmIGlzU2FtZU5vZGVUeXBlKGMgPSBjaGlsZHJlbltqXSwgdmNoaWxkLCBpc0h5ZHJhdGluZykpIHtcbiAgICAgICAgICAgICAgICBjaGlsZCA9IGM7XG4gICAgICAgICAgICAgICAgY2hpbGRyZW5bal0gPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgaWYgKGogPT09IGNoaWxkcmVuTGVuIC0gMSkgY2hpbGRyZW5MZW4tLTtcbiAgICAgICAgICAgICAgICBpZiAoaiA9PT0gbWluKSBtaW4rKztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNoaWxkID0gaWRpZmYoY2hpbGQsIHZjaGlsZCwgY29udGV4dCwgbW91bnRBbGwpO1xuICAgICAgICAgICAgaWYgKGNoaWxkICYmIGNoaWxkICE9PSBkb20pIGlmIChpID49IGxlbikgZG9tLmFwcGVuZENoaWxkKGNoaWxkKTsgZWxzZSBpZiAoY2hpbGQgIT09IG9yaWdpbmFsQ2hpbGRyZW5baV0pIGlmIChjaGlsZCA9PT0gb3JpZ2luYWxDaGlsZHJlbltpICsgMV0pIHJlbW92ZU5vZGUob3JpZ2luYWxDaGlsZHJlbltpXSk7IGVsc2UgZG9tLmluc2VydEJlZm9yZShjaGlsZCwgb3JpZ2luYWxDaGlsZHJlbltpXSB8fCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoa2V5ZWRMZW4pIGZvciAodmFyIGkgaW4ga2V5ZWQpIGlmICh2b2lkIDAgIT09IGtleWVkW2ldKSByZWNvbGxlY3ROb2RlVHJlZShrZXllZFtpXSwgITEpO1xuICAgICAgICB3aGlsZSAobWluIDw9IGNoaWxkcmVuTGVuKSBpZiAodm9pZCAwICE9PSAoY2hpbGQgPSBjaGlsZHJlbltjaGlsZHJlbkxlbi0tXSkpIHJlY29sbGVjdE5vZGVUcmVlKGNoaWxkLCAhMSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlY29sbGVjdE5vZGVUcmVlKG5vZGUsIHVubW91bnRPbmx5KSB7XG4gICAgICAgIHZhciBjb21wb25lbnQgPSBub2RlLl9jb21wb25lbnQ7XG4gICAgICAgIGlmIChjb21wb25lbnQpIHVubW91bnRDb21wb25lbnQoY29tcG9uZW50KTsgZWxzZSB7XG4gICAgICAgICAgICBpZiAobnVsbCAhPSBub2RlLl9fcHJlYWN0YXR0cl8gJiYgbm9kZS5fX3ByZWFjdGF0dHJfLnJlZikgbm9kZS5fX3ByZWFjdGF0dHJfLnJlZihudWxsKTtcbiAgICAgICAgICAgIGlmICh1bm1vdW50T25seSA9PT0gITEgfHwgbnVsbCA9PSBub2RlLl9fcHJlYWN0YXR0cl8pIHJlbW92ZU5vZGUobm9kZSk7XG4gICAgICAgICAgICByZW1vdmVDaGlsZHJlbihub2RlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiByZW1vdmVDaGlsZHJlbihub2RlKSB7XG4gICAgICAgIG5vZGUgPSBub2RlLmxhc3RDaGlsZDtcbiAgICAgICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgICAgIHZhciBuZXh0ID0gbm9kZS5wcmV2aW91c1NpYmxpbmc7XG4gICAgICAgICAgICByZWNvbGxlY3ROb2RlVHJlZShub2RlLCAhMCk7XG4gICAgICAgICAgICBub2RlID0gbmV4dDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBkaWZmQXR0cmlidXRlcyhkb20sIGF0dHJzLCBvbGQpIHtcbiAgICAgICAgdmFyIG5hbWU7XG4gICAgICAgIGZvciAobmFtZSBpbiBvbGQpIGlmICgoIWF0dHJzIHx8IG51bGwgPT0gYXR0cnNbbmFtZV0pICYmIG51bGwgIT0gb2xkW25hbWVdKSBzZXRBY2Nlc3Nvcihkb20sIG5hbWUsIG9sZFtuYW1lXSwgb2xkW25hbWVdID0gdm9pZCAwLCBpc1N2Z01vZGUpO1xuICAgICAgICBmb3IgKG5hbWUgaW4gYXR0cnMpIGlmICghKCdjaGlsZHJlbicgPT09IG5hbWUgfHwgJ2lubmVySFRNTCcgPT09IG5hbWUgfHwgbmFtZSBpbiBvbGQgJiYgYXR0cnNbbmFtZV0gPT09ICgndmFsdWUnID09PSBuYW1lIHx8ICdjaGVja2VkJyA9PT0gbmFtZSA/IGRvbVtuYW1lXSA6IG9sZFtuYW1lXSkpKSBzZXRBY2Nlc3Nvcihkb20sIG5hbWUsIG9sZFtuYW1lXSwgb2xkW25hbWVdID0gYXR0cnNbbmFtZV0sIGlzU3ZnTW9kZSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNvbGxlY3RDb21wb25lbnQoY29tcG9uZW50KSB7XG4gICAgICAgIHZhciBuYW1lID0gY29tcG9uZW50LmNvbnN0cnVjdG9yLm5hbWU7XG4gICAgICAgIChjb21wb25lbnRzW25hbWVdIHx8IChjb21wb25lbnRzW25hbWVdID0gW10pKS5wdXNoKGNvbXBvbmVudCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNyZWF0ZUNvbXBvbmVudChDdG9yLCBwcm9wcywgY29udGV4dCkge1xuICAgICAgICB2YXIgaW5zdCwgbGlzdCA9IGNvbXBvbmVudHNbQ3Rvci5uYW1lXTtcbiAgICAgICAgaWYgKEN0b3IucHJvdG90eXBlICYmIEN0b3IucHJvdG90eXBlLnJlbmRlcikge1xuICAgICAgICAgICAgaW5zdCA9IG5ldyBDdG9yKHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgICAgIENvbXBvbmVudC5jYWxsKGluc3QsIHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGluc3QgPSBuZXcgQ29tcG9uZW50KHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgICAgIGluc3QuY29uc3RydWN0b3IgPSBDdG9yO1xuICAgICAgICAgICAgaW5zdC5yZW5kZXIgPSBkb1JlbmRlcjtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGlzdCkgZm9yICh2YXIgaSA9IGxpc3QubGVuZ3RoOyBpLS07ICkgaWYgKGxpc3RbaV0uY29uc3RydWN0b3IgPT09IEN0b3IpIHtcbiAgICAgICAgICAgIGluc3QuX19iID0gbGlzdFtpXS5fX2I7XG4gICAgICAgICAgICBsaXN0LnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbnN0O1xuICAgIH1cbiAgICBmdW5jdGlvbiBkb1JlbmRlcihwcm9wcywgc3RhdGUsIGNvbnRleHQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IocHJvcHMsIGNvbnRleHQpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzZXRDb21wb25lbnRQcm9wcyhjb21wb25lbnQsIHByb3BzLCBvcHRzLCBjb250ZXh0LCBtb3VudEFsbCkge1xuICAgICAgICBpZiAoIWNvbXBvbmVudC5fX3gpIHtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fX3ggPSAhMDtcbiAgICAgICAgICAgIGlmIChjb21wb25lbnQuX19yID0gcHJvcHMucmVmKSBkZWxldGUgcHJvcHMucmVmO1xuICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5fX2sgPSBwcm9wcy5rZXkpIGRlbGV0ZSBwcm9wcy5rZXk7XG4gICAgICAgICAgICBpZiAoIWNvbXBvbmVudC5iYXNlIHx8IG1vdW50QWxsKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5jb21wb25lbnRXaWxsTW91bnQpIGNvbXBvbmVudC5jb21wb25lbnRXaWxsTW91bnQoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY29tcG9uZW50LmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMpIGNvbXBvbmVudC5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgICAgIGlmIChjb250ZXh0ICYmIGNvbnRleHQgIT09IGNvbXBvbmVudC5jb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjb21wb25lbnQuX19jKSBjb21wb25lbnQuX19jID0gY29tcG9uZW50LmNvbnRleHQ7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LmNvbnRleHQgPSBjb250ZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFjb21wb25lbnQuX19wKSBjb21wb25lbnQuX19wID0gY29tcG9uZW50LnByb3BzO1xuICAgICAgICAgICAgY29tcG9uZW50LnByb3BzID0gcHJvcHM7XG4gICAgICAgICAgICBjb21wb25lbnQuX194ID0gITE7XG4gICAgICAgICAgICBpZiAoMCAhPT0gb3B0cykgaWYgKDEgPT09IG9wdHMgfHwgb3B0aW9ucy5zeW5jQ29tcG9uZW50VXBkYXRlcyAhPT0gITEgfHwgIWNvbXBvbmVudC5iYXNlKSByZW5kZXJDb21wb25lbnQoY29tcG9uZW50LCAxLCBtb3VudEFsbCk7IGVsc2UgZW5xdWV1ZVJlbmRlcihjb21wb25lbnQpO1xuICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5fX3IpIGNvbXBvbmVudC5fX3IoY29tcG9uZW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiByZW5kZXJDb21wb25lbnQoY29tcG9uZW50LCBvcHRzLCBtb3VudEFsbCwgaXNDaGlsZCkge1xuICAgICAgICBpZiAoIWNvbXBvbmVudC5fX3gpIHtcbiAgICAgICAgICAgIHZhciByZW5kZXJlZCwgaW5zdCwgY2Jhc2UsIHByb3BzID0gY29tcG9uZW50LnByb3BzLCBzdGF0ZSA9IGNvbXBvbmVudC5zdGF0ZSwgY29udGV4dCA9IGNvbXBvbmVudC5jb250ZXh0LCBwcmV2aW91c1Byb3BzID0gY29tcG9uZW50Ll9fcCB8fCBwcm9wcywgcHJldmlvdXNTdGF0ZSA9IGNvbXBvbmVudC5fX3MgfHwgc3RhdGUsIHByZXZpb3VzQ29udGV4dCA9IGNvbXBvbmVudC5fX2MgfHwgY29udGV4dCwgaXNVcGRhdGUgPSBjb21wb25lbnQuYmFzZSwgbmV4dEJhc2UgPSBjb21wb25lbnQuX19iLCBpbml0aWFsQmFzZSA9IGlzVXBkYXRlIHx8IG5leHRCYXNlLCBpbml0aWFsQ2hpbGRDb21wb25lbnQgPSBjb21wb25lbnQuX2NvbXBvbmVudCwgc2tpcCA9ICExO1xuICAgICAgICAgICAgaWYgKGlzVXBkYXRlKSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnByb3BzID0gcHJldmlvdXNQcm9wcztcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuc3RhdGUgPSBwcmV2aW91c1N0YXRlO1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5jb250ZXh0ID0gcHJldmlvdXNDb250ZXh0O1xuICAgICAgICAgICAgICAgIGlmICgyICE9PSBvcHRzICYmIGNvbXBvbmVudC5zaG91bGRDb21wb25lbnRVcGRhdGUgJiYgY29tcG9uZW50LnNob3VsZENvbXBvbmVudFVwZGF0ZShwcm9wcywgc3RhdGUsIGNvbnRleHQpID09PSAhMSkgc2tpcCA9ICEwOyBlbHNlIGlmIChjb21wb25lbnQuY29tcG9uZW50V2lsbFVwZGF0ZSkgY29tcG9uZW50LmNvbXBvbmVudFdpbGxVcGRhdGUocHJvcHMsIHN0YXRlLCBjb250ZXh0KTtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQucHJvcHMgPSBwcm9wcztcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuc3RhdGUgPSBzdGF0ZTtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb21wb25lbnQuX19wID0gY29tcG9uZW50Ll9fcyA9IGNvbXBvbmVudC5fX2MgPSBjb21wb25lbnQuX19iID0gbnVsbDtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fX2QgPSAhMTtcbiAgICAgICAgICAgIGlmICghc2tpcCkge1xuICAgICAgICAgICAgICAgIHJlbmRlcmVkID0gY29tcG9uZW50LnJlbmRlcihwcm9wcywgc3RhdGUsIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnQuZ2V0Q2hpbGRDb250ZXh0KSBjb250ZXh0ID0gZXh0ZW5kKGV4dGVuZCh7fSwgY29udGV4dCksIGNvbXBvbmVudC5nZXRDaGlsZENvbnRleHQoKSk7XG4gICAgICAgICAgICAgICAgdmFyIHRvVW5tb3VudCwgYmFzZSwgY2hpbGRDb21wb25lbnQgPSByZW5kZXJlZCAmJiByZW5kZXJlZC5ub2RlTmFtZTtcbiAgICAgICAgICAgICAgICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgY2hpbGRDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNoaWxkUHJvcHMgPSBnZXROb2RlUHJvcHMocmVuZGVyZWQpO1xuICAgICAgICAgICAgICAgICAgICBpbnN0ID0gaW5pdGlhbENoaWxkQ29tcG9uZW50O1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5zdCAmJiBpbnN0LmNvbnN0cnVjdG9yID09PSBjaGlsZENvbXBvbmVudCAmJiBjaGlsZFByb3BzLmtleSA9PSBpbnN0Ll9faykgc2V0Q29tcG9uZW50UHJvcHMoaW5zdCwgY2hpbGRQcm9wcywgMSwgY29udGV4dCwgITEpOyBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvVW5tb3VudCA9IGluc3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQuX2NvbXBvbmVudCA9IGluc3QgPSBjcmVhdGVDb21wb25lbnQoY2hpbGRDb21wb25lbnQsIGNoaWxkUHJvcHMsIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdC5fX2IgPSBpbnN0Ll9fYiB8fCBuZXh0QmFzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3QuX191ID0gY29tcG9uZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0Q29tcG9uZW50UHJvcHMoaW5zdCwgY2hpbGRQcm9wcywgMCwgY29udGV4dCwgITEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyQ29tcG9uZW50KGluc3QsIDEsIG1vdW50QWxsLCAhMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYmFzZSA9IGluc3QuYmFzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYmFzZSA9IGluaXRpYWxCYXNlO1xuICAgICAgICAgICAgICAgICAgICB0b1VubW91bnQgPSBpbml0aWFsQ2hpbGRDb21wb25lbnQ7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0b1VubW91bnQpIGNiYXNlID0gY29tcG9uZW50Ll9jb21wb25lbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5pdGlhbEJhc2UgfHwgMSA9PT0gb3B0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNiYXNlKSBjYmFzZS5fY29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UgPSBkaWZmKGNiYXNlLCByZW5kZXJlZCwgY29udGV4dCwgbW91bnRBbGwgfHwgIWlzVXBkYXRlLCBpbml0aWFsQmFzZSAmJiBpbml0aWFsQmFzZS5wYXJlbnROb2RlLCAhMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGluaXRpYWxCYXNlICYmIGJhc2UgIT09IGluaXRpYWxCYXNlICYmIGluc3QgIT09IGluaXRpYWxDaGlsZENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYmFzZVBhcmVudCA9IGluaXRpYWxCYXNlLnBhcmVudE5vZGU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChiYXNlUGFyZW50ICYmIGJhc2UgIT09IGJhc2VQYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VQYXJlbnQucmVwbGFjZUNoaWxkKGJhc2UsIGluaXRpYWxCYXNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdG9Vbm1vdW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbEJhc2UuX2NvbXBvbmVudCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjb2xsZWN0Tm9kZVRyZWUoaW5pdGlhbEJhc2UsICExKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodG9Vbm1vdW50KSB1bm1vdW50Q29tcG9uZW50KHRvVW5tb3VudCk7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LmJhc2UgPSBiYXNlO1xuICAgICAgICAgICAgICAgIGlmIChiYXNlICYmICFpc0NoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb21wb25lbnRSZWYgPSBjb21wb25lbnQsIHQgPSBjb21wb25lbnQ7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlICh0ID0gdC5fX3UpIChjb21wb25lbnRSZWYgPSB0KS5iYXNlID0gYmFzZTtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5fY29tcG9uZW50ID0gY29tcG9uZW50UmVmO1xuICAgICAgICAgICAgICAgICAgICBiYXNlLl9jb21wb25lbnRDb25zdHJ1Y3RvciA9IGNvbXBvbmVudFJlZi5jb25zdHJ1Y3RvcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWlzVXBkYXRlIHx8IG1vdW50QWxsKSBtb3VudHMudW5zaGlmdChjb21wb25lbnQpOyBlbHNlIGlmICghc2tpcCkge1xuICAgICAgICAgICAgICAgIGZsdXNoTW91bnRzKCk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5jb21wb25lbnREaWRVcGRhdGUpIGNvbXBvbmVudC5jb21wb25lbnREaWRVcGRhdGUocHJldmlvdXNQcm9wcywgcHJldmlvdXNTdGF0ZSwgcHJldmlvdXNDb250ZXh0KTtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5hZnRlclVwZGF0ZSkgb3B0aW9ucy5hZnRlclVwZGF0ZShjb21wb25lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG51bGwgIT0gY29tcG9uZW50Ll9faCkgd2hpbGUgKGNvbXBvbmVudC5fX2gubGVuZ3RoKSBjb21wb25lbnQuX19oLnBvcCgpLmNhbGwoY29tcG9uZW50KTtcbiAgICAgICAgICAgIGlmICghZGlmZkxldmVsICYmICFpc0NoaWxkKSBmbHVzaE1vdW50cygpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGJ1aWxkQ29tcG9uZW50RnJvbVZOb2RlKGRvbSwgdm5vZGUsIGNvbnRleHQsIG1vdW50QWxsKSB7XG4gICAgICAgIHZhciBjID0gZG9tICYmIGRvbS5fY29tcG9uZW50LCBvcmlnaW5hbENvbXBvbmVudCA9IGMsIG9sZERvbSA9IGRvbSwgaXNEaXJlY3RPd25lciA9IGMgJiYgZG9tLl9jb21wb25lbnRDb25zdHJ1Y3RvciA9PT0gdm5vZGUubm9kZU5hbWUsIGlzT3duZXIgPSBpc0RpcmVjdE93bmVyLCBwcm9wcyA9IGdldE5vZGVQcm9wcyh2bm9kZSk7XG4gICAgICAgIHdoaWxlIChjICYmICFpc093bmVyICYmIChjID0gYy5fX3UpKSBpc093bmVyID0gYy5jb25zdHJ1Y3RvciA9PT0gdm5vZGUubm9kZU5hbWU7XG4gICAgICAgIGlmIChjICYmIGlzT3duZXIgJiYgKCFtb3VudEFsbCB8fCBjLl9jb21wb25lbnQpKSB7XG4gICAgICAgICAgICBzZXRDb21wb25lbnRQcm9wcyhjLCBwcm9wcywgMywgY29udGV4dCwgbW91bnRBbGwpO1xuICAgICAgICAgICAgZG9tID0gYy5iYXNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKG9yaWdpbmFsQ29tcG9uZW50ICYmICFpc0RpcmVjdE93bmVyKSB7XG4gICAgICAgICAgICAgICAgdW5tb3VudENvbXBvbmVudChvcmlnaW5hbENvbXBvbmVudCk7XG4gICAgICAgICAgICAgICAgZG9tID0gb2xkRG9tID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGMgPSBjcmVhdGVDb21wb25lbnQodm5vZGUubm9kZU5hbWUsIHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgICAgIGlmIChkb20gJiYgIWMuX19iKSB7XG4gICAgICAgICAgICAgICAgYy5fX2IgPSBkb207XG4gICAgICAgICAgICAgICAgb2xkRG9tID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNldENvbXBvbmVudFByb3BzKGMsIHByb3BzLCAxLCBjb250ZXh0LCBtb3VudEFsbCk7XG4gICAgICAgICAgICBkb20gPSBjLmJhc2U7XG4gICAgICAgICAgICBpZiAob2xkRG9tICYmIGRvbSAhPT0gb2xkRG9tKSB7XG4gICAgICAgICAgICAgICAgb2xkRG9tLl9jb21wb25lbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgIHJlY29sbGVjdE5vZGVUcmVlKG9sZERvbSwgITEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkb207XG4gICAgfVxuICAgIGZ1bmN0aW9uIHVubW91bnRDb21wb25lbnQoY29tcG9uZW50KSB7XG4gICAgICAgIGlmIChvcHRpb25zLmJlZm9yZVVubW91bnQpIG9wdGlvbnMuYmVmb3JlVW5tb3VudChjb21wb25lbnQpO1xuICAgICAgICB2YXIgYmFzZSA9IGNvbXBvbmVudC5iYXNlO1xuICAgICAgICBjb21wb25lbnQuX194ID0gITA7XG4gICAgICAgIGlmIChjb21wb25lbnQuY29tcG9uZW50V2lsbFVubW91bnQpIGNvbXBvbmVudC5jb21wb25lbnRXaWxsVW5tb3VudCgpO1xuICAgICAgICBjb21wb25lbnQuYmFzZSA9IG51bGw7XG4gICAgICAgIHZhciBpbm5lciA9IGNvbXBvbmVudC5fY29tcG9uZW50O1xuICAgICAgICBpZiAoaW5uZXIpIHVubW91bnRDb21wb25lbnQoaW5uZXIpOyBlbHNlIGlmIChiYXNlKSB7XG4gICAgICAgICAgICBpZiAoYmFzZS5fX3ByZWFjdGF0dHJfICYmIGJhc2UuX19wcmVhY3RhdHRyXy5yZWYpIGJhc2UuX19wcmVhY3RhdHRyXy5yZWYobnVsbCk7XG4gICAgICAgICAgICBjb21wb25lbnQuX19iID0gYmFzZTtcbiAgICAgICAgICAgIHJlbW92ZU5vZGUoYmFzZSk7XG4gICAgICAgICAgICBjb2xsZWN0Q29tcG9uZW50KGNvbXBvbmVudCk7XG4gICAgICAgICAgICByZW1vdmVDaGlsZHJlbihiYXNlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29tcG9uZW50Ll9fcikgY29tcG9uZW50Ll9fcihudWxsKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gQ29tcG9uZW50KHByb3BzLCBjb250ZXh0KSB7XG4gICAgICAgIHRoaXMuX19kID0gITA7XG4gICAgICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgIHRoaXMucHJvcHMgPSBwcm9wcztcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHRoaXMuc3RhdGUgfHwge307XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlbmRlcih2bm9kZSwgcGFyZW50LCBtZXJnZSkge1xuICAgICAgICByZXR1cm4gZGlmZihtZXJnZSwgdm5vZGUsIHt9LCAhMSwgcGFyZW50LCAhMSk7XG4gICAgfVxuICAgIHZhciBvcHRpb25zID0ge307XG4gICAgdmFyIHN0YWNrID0gW107XG4gICAgdmFyIEVNUFRZX0NISUxEUkVOID0gW107XG4gICAgdmFyIElTX05PTl9ESU1FTlNJT05BTCA9IC9hY2l0fGV4KD86c3xnfG58cHwkKXxycGh8b3dzfG1uY3xudHd8aW5lW2NoXXx6b298Xm9yZC9pO1xuICAgIHZhciBpdGVtcyA9IFtdO1xuICAgIHZhciBtb3VudHMgPSBbXTtcbiAgICB2YXIgZGlmZkxldmVsID0gMDtcbiAgICB2YXIgaXNTdmdNb2RlID0gITE7XG4gICAgdmFyIGh5ZHJhdGluZyA9ICExO1xuICAgIHZhciBjb21wb25lbnRzID0ge307XG4gICAgZXh0ZW5kKENvbXBvbmVudC5wcm90b3R5cGUsIHtcbiAgICAgICAgc2V0U3RhdGU6IGZ1bmN0aW9uKHN0YXRlLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIHMgPSB0aGlzLnN0YXRlO1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9fcykgdGhpcy5fX3MgPSBleHRlbmQoe30sIHMpO1xuICAgICAgICAgICAgZXh0ZW5kKHMsICdmdW5jdGlvbicgPT0gdHlwZW9mIHN0YXRlID8gc3RhdGUocywgdGhpcy5wcm9wcykgOiBzdGF0ZSk7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spICh0aGlzLl9faCA9IHRoaXMuX19oIHx8IFtdKS5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIGVucXVldWVSZW5kZXIodGhpcyk7XG4gICAgICAgIH0sXG4gICAgICAgIGZvcmNlVXBkYXRlOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSAodGhpcy5fX2ggPSB0aGlzLl9faCB8fCBbXSkucHVzaChjYWxsYmFjayk7XG4gICAgICAgICAgICByZW5kZXJDb21wb25lbnQodGhpcywgMik7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7fVxuICAgIH0pO1xuICAgIHZhciBwcmVhY3QgPSB7XG4gICAgICAgIGg6IGgsXG4gICAgICAgIGNyZWF0ZUVsZW1lbnQ6IGgsXG4gICAgICAgIGNsb25lRWxlbWVudDogY2xvbmVFbGVtZW50LFxuICAgICAgICBDb21wb25lbnQ6IENvbXBvbmVudCxcbiAgICAgICAgcmVuZGVyOiByZW5kZXIsXG4gICAgICAgIHJlcmVuZGVyOiByZXJlbmRlcixcbiAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgIH07XG4gICAgaWYgKCd1bmRlZmluZWQnICE9IHR5cGVvZiBtb2R1bGUpIG1vZHVsZS5leHBvcnRzID0gcHJlYWN0OyBlbHNlIHNlbGYucHJlYWN0ID0gcHJlYWN0O1xufSgpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cHJlYWN0LmpzLm1hcCIsInJlcXVpcmUoJy4vcG9seWZpbGxzLmpzJyk7XG5cbmNvbnN0XG5cdFJlYWN0ID0gcmVxdWlyZSgncHJlYWN0JyksXG5cblx0QmluZCA9IHJlcXVpcmUoXCIuL2JpbmQuanNcIiksXG5cblx0UGFzcyA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9QYXNzLmpzJyksXG5cdFN1YlZpZXcgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvU3ViVmlldy5qcycpLFxuXHRTaGlwVmlldyA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9TaGlwVmlldy5qcycpLFxuXHRTb25hclZpZXcgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvU29uYXJWaWV3LmpzJyksXG5cblx0U3R5bGUgPSB7XG5cdFx0YXBwOiAnd2lkdGg6IDEwMHZ3Oydcblx0fTtcblxuXG5jbGFzcyBBcHAgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRjb25zdHJ1Y3Rvcihwcm9wcywgY29udGV4dCkge1xuXHRcdHN1cGVyKHByb3BzKTtcblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0dmlldzogMCxcblx0XHRcdHBheWxvYWQ6IHVuZGVmaW5lZFxuXHRcdH1cblxuXHRcdEJpbmQodGhpcyk7XG5cdH1cblxuXHRyZW5kZXIocHJvcHMsIHN0YXRlKSB7XG5cdFx0c3dpdGNoIChzdGF0ZS52aWV3KSB7XG5cdFx0XHRjYXNlIDA6IHJldHVybiA8U3ViVmlldyAgc2VndWU9e3RoaXMuc2VndWVXaXRoUGF5bG9hZH0vPjtcblx0XHRcdGNhc2UgMTogcmV0dXJuIDxQYXNzIHRvPVwiU2hpcFwiIHNlZ3VlPXt0aGlzLnNlZ3VlfS8+O1xuXHRcdFx0Y2FzZSAyOiByZXR1cm4gPFNoaXBWaWV3IHBheWxvYWQ9e3N0YXRlLnBheWxvYWR9IHNlZ3VlPXt0aGlzLnNlZ3VlV2l0aFBheWxvYWR9Lz47XG5cdFx0XHRjYXNlIDM6IHJldHVybiA8U29uYXJWaWV3IHBheWxvYWQ9e3N0YXRlLnBheWxvYWR9IHNlZ3VlPXt0aGlzLnNlZ3VlV2l0aFBheWxvYWR9Lz47XG5cdFx0XHRjYXNlIDQ6IHJldHVybiA8UGFzcyB0bz1cIlN1YlwiIHNlZ3VlPXt0aGlzLnNlZ3VlfS8+O1xuXHRcdH1cblx0fVxuXG5cdHNlZ3VlKCkge1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0dmlldzogKHRoaXMuc3RhdGUudmlldyA9PT0gNCkgPyAwIDogdGhpcy5zdGF0ZS52aWV3ICsgMVxuXHRcdH0pO1xuXHR9XG5cblx0c2VndWVXaXRoUGF5bG9hZChwYXlsb2FkLCBhZGQyKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHR2aWV3OiAodGhpcy5zdGF0ZS52aWV3ID09PSA0KSA/IDAgOiB0aGlzLnN0YXRlLnZpZXcgKyAoKGFkZDIpID8gMiA6IDEpLFxuXHRcdFx0cGF5bG9hZDogcGF5bG9hZFxuXHRcdH0pO1xuXHR9XG59XG5cblJlYWN0LnJlbmRlcig8QXBwLz4sIGRvY3VtZW50LmJvZHkpOyIsIi8vIGNvbnZlbmllbmNlIG1ldGhvZFxuLy8gYmluZHMgZXZlcnkgZnVuY3Rpb24gaW4gaW5zdGFuY2UncyBwcm90b3R5cGUgdG8gdGhlIGluc3RhbmNlIGl0c2VsZlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpbnN0YW5jZSkge1xuXHR2YXIgcHJvdG8gPSBpbnN0YW5jZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGUsXG5cdFx0a2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHByb3RvKSxcblx0XHRrZXk7XG5cdHdoaWxlIChrZXkgPSBrZXlzLnBvcCgpKSBpZiAodHlwZW9mIHByb3RvW2tleV0gPT09ICdmdW5jdGlvbicgJiYga2V5ICE9PSAnY29uc3RydWN0b3InKSBpbnN0YW5jZVtrZXldID0gcHJvdG9ba2V5XS5iaW5kKGluc3RhbmNlKTtcbn0iLCJjb25zdFxuXHRSZWFjdCA9IHJlcXVpcmUoXCJwcmVhY3RcIiksXG5cdFN0eWxlID0gcmVxdWlyZShcIi4uL3N0eWxlLmpzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHByb3BzKSB7XG5cdHJldHVybiAoXG5cdFx0PGRpdiBzdHlsZT17T2JqZWN0LmFzc2lnbih7fSwgU3R5bGUuQ2FyZCwgeyBiYWNrZ3JvdW5kOlwicmFkaWFsLWdyYWRpZW50KGNpcmNsZSwgXCIgKyBwcm9wcy5jb2xvciArIFwiIDE1JSwgIzExMTExMSAxMDAlKVwiIH0pfT5cblx0XHRcdHsgcHJvcHMuY2hpbGRyZW4gfVxuXHRcdDwvZGl2PlxuXHQpO1xufVxuIiwiY29uc3Rcblx0UmVhY3QgPSByZXF1aXJlKFwicHJlYWN0XCIpLFxuXHRzcXJ0M0RpdmRlZEJ5MiA9IE1hdGguc3FydCgzKSAvIDI7XG5cbmNsYXNzIEhleCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdHJlbmRlcihwcm9wcykge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8c3ZnIHZpZXdCb3g9XCIwIDAgMSAxXCIgd2lkdGg9e3NxcnQzRGl2ZGVkQnkyICogODh9IGhlaWdodD17ODh9IHN0eWxlPVwiZGlzcGxheTpibG9ja1wiPlxuXHRcdFx0XHQ8ZyBvbkNsaWNrPXsocHJvcHMub25DbGljaykgPyBwcm9wcy5vbkNsaWNrIDogdW5kZWZpbmVkIH0+XG5cdFx0XHRcdFx0PHBvbHlnb25cblx0XHRcdFx0XHRcdHBvaW50cz1cIjAsMC43NSAwLDAuMjUgMC41LDAgMSwwLjI1IDEsMC43NSAwLjUsMVwiXG5cdFx0XHRcdFx0XHRzdHlsZT17e1xuXHRcdFx0XHRcdFx0XHRmaWxsOiBwcm9wcy5iZyxcblx0XHRcdFx0XHRcdFx0ZmlsbE9wYWNpdHk6KHByb3BzLnNlbGVjdGVkID8gXCIxXCIgOiBcIjAuNFwiKVxuXHRcdFx0XHRcdFx0fX1cblx0XHRcdFx0XHQ+PC9wb2x5Z29uPlxuXHRcdFx0XHRcdHtwcm9wcy5jaGlsZHJlbn1cblx0XHRcdFx0PC9nPlxuXHRcdFx0PC9zdmc+XG5cdFx0KTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEhleDsiLCJjb25zdFxuXHRSZWFjdCA9IHJlcXVpcmUoXCJwcmVhY3RcIiksXG5cdEhleCA9IHJlcXVpcmUoXCIuL0hleC5qc1wiKSxcblx0U3R5bGUgPSByZXF1aXJlKFwiLi4vc3R5bGUuanNcIiksXG5cdHNxcnQzRGl2ZGVkQnkyID0gTWF0aC5zcXJ0KDMpIC8gMjtcblxuY2xhc3MgSGV4QnV0dG9uIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0cmVuZGVyKHByb3BzKSB7XG5cdFx0dmFyIG1hcmdpbiA9ICgxIC0gc3FydDNEaXZkZWRCeTIpIC8gMjtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PHN2ZyB2aWV3Qm94PVwiMCAwIDEgMVwiIHdpZHRoPXtzcXJ0M0RpdmRlZEJ5MiAqIDEwMH0gaGVpZ2h0PXsxMDB9IHN0eWxlPXtTdHlsZS5IZXhCdXR0b259PlxuXHRcdFx0XHQ8ZyBvbkNsaWNrPXsocHJvcHMub25DbGljayA/ICgpID0+IHByb3BzLm9uQ2xpY2socHJvcHMudGV4dCkgOiB1bmRlZmluZWQpfT5cblx0XHRcdFx0XHQ8cG9seWdvblxuXHRcdFx0XHRcdFx0cG9pbnRzPXttYXJnaW4gKyBcIiwwLjc1IFwiICsgbWFyZ2luICsgXCIsMC4yNSAwLjUsMCBcIiArICgxLW1hcmdpbikgKyBcIiwwLjI1IFwiICsgKDEtbWFyZ2luKSArIFwiLDAuNzUgMC41LDFcIn1cblx0XHRcdFx0XHRcdHN0eWxlPXt7XG5cdFx0XHRcdFx0XHRcdGZpbGw6IHByb3BzLmJnLFxuXHRcdFx0XHRcdFx0XHRmaWxsT3BhY2l0eToocHJvcHMuc2VsZWN0ZWQgPyBcIjFcIiA6IFwiMC40XCIpXG5cdFx0XHRcdFx0XHR9fVxuXHRcdFx0XHRcdD48L3BvbHlnb24+XG5cdFx0XHRcdFx0PHRleHRcblx0XHRcdFx0XHRcdHg9XCIwLjVcIlxuXHRcdFx0XHRcdFx0eT1cIjAuNzhcIlxuXHRcdFx0XHRcdFx0dGV4dC1hbmNob3I9XCJtaWRkbGVcIlxuXHRcdFx0XHRcdFx0c3R5bGU9eyhwcm9wcy5zZWxlY3RlZCA/IHtcblx0XHRcdFx0XHRcdFx0Zm9udEZhbWlseTogXCJPcGVuIFNhbnNcIixcblx0XHRcdFx0XHRcdFx0Zm9udFNpemU6IFwiNC44JVwiLFxuXHRcdFx0XHRcdFx0XHRmaWxsOiBwcm9wcy5mZyxcblx0XHRcdFx0XHRcdFx0ZmlsbE9wYWNpdHk6IFwiMVwiXG5cdFx0XHRcdFx0XHR9IDoge1xuXHRcdFx0XHRcdFx0XHRmb250RmFtaWx5OiBcIk9wZW4gU2Fuc1wiLFxuXHRcdFx0XHRcdFx0XHRmb250U2l6ZTogXCI0LjglXCIsXG5cdFx0XHRcdFx0XHRcdGZpbGw6IFwiIzExMTExMVwiLFxuXHRcdFx0XHRcdFx0XHRmaWxsT3BhY2l0eTogXCIxXCJcblx0XHRcdFx0XHRcdH0pfVxuXHRcdFx0XHRcdD57cHJvcHMudGV4dH08L3RleHQ+XG5cdFx0XHRcdDwvZz5cblx0XHRcdDwvc3ZnPlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBIZXhCdXR0b247IiwiY29uc3Rcblx0UmVhY3QgPSByZXF1aXJlKFwicHJlYWN0XCIpLFxuXHRTdHlsZSA9IHtcblx0XHRkaXY6IHtcblx0XHRcdHdpZHRoOiBcIjY2JVwiLFxuXHRcdFx0ZGlzcGxheTogXCJmbGV4XCIsXG5cdFx0XHRqdXN0aWZ5Q29udGVudDogXCJmbGV4LXN0YXJ0XCIsXG5cdFx0XHRmbGV4V3JhcDogXCJ3cmFwXCIsXG5cdFx0XHRtYXJnaW5Cb3R0b206IFwiMnJlbVwiXG5cdFx0fSxcblx0XHR0ZXh0OiB7XG5cdFx0XHR3ZWJraXRGb250U21vb3RoaW5nOiBcImFudGlhbGlhc2VkXCIsXG5cdFx0XHRkaXNwbGF5OiBcImlubGluZVwiLFxuXHRcdFx0Zm9udFNpemU6IFwiMnJlbVwiLFxuXHRcdFx0Zm9udFdlaWdodDogXCIyMDBcIixcblx0XHRcdG1hcmdpbjogXCIwLjc1cmVtXCIsXG5cdFx0XHRiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgwLDAsMCwwKVwiLFxuXHRcdFx0Y29sb3I6IFwiI2ZmZmZmZlwiXG5cdFx0fVxuXHR9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHByb3BzKSB7XG5cdHZhciBsaXN0ID0gW10sXG5cdFx0aSA9IC0xO1xuXG5cdHdoaWxlICgrK2kgPCBwcm9wcy5saXN0Lmxlbmd0aCkgbGlzdC5wdXNoKFxuXHRcdDxwXG5cdFx0XHRzdHlsZT17U3R5bGUudGV4dH1cblx0XHQ+e3Byb3BzLmxpc3RbaV19PC9wPlxuXHQpO1xuXG5cdHJldHVybiAoXG5cdFx0PGRpdiBzdHlsZT17U3R5bGUuZGl2fT5cblx0XHRcdHtsaXN0fVxuXHRcdDwvZGl2PlxuXHQpO1xufTsiLCJjb25zdFxuXHRSZWFjdCA9IHJlcXVpcmUoXCJwcmVhY3RcIiksXG5cdFN0eWxlID0gcmVxdWlyZShcIi4uL3N0eWxlLmpzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHByb3BzKSB7XG5cdHZhciBpID0gcHJvcHMuZnJvbSxcblx0XHRidXR0b25zID0gW10sXG5cdFx0Y2FsbGJhY2sgPSAoZSkgPT4gcHJvcHMub25DbGljayhOdW1iZXIoZS50YXJnZXQuZGF0YXNldC5pZCkpO1xuXG5cdHdoaWxlIChpIDw9IHByb3BzLnRvKSBidXR0b25zLnB1c2goXG5cdFx0PGJ1dHRvblxuXHRcdFx0c3R5bGU9e09iamVjdC5hc3NpZ24oe30sIFN0eWxlLk51bWJlckJ1dHRvbiwgeyBjb2xvcjogKHByb3BzLnNlbGVjdGVkLmluZGV4T2YoaSkgPT09IC0xKSA/IFwicmdiYSgyNTUsIDI1NSwgMjU1LCAwLjMpXCIgOiBcIiNmZmZmZmZcIiB9KX1cblx0XHRcdGRhdGEtaWQ9e2l9XG5cdFx0XHRvbkNsaWNrPXtjYWxsYmFja31cblx0XHQ+eyhcIlwiICsgaSsrKX08L2J1dHRvbj5cblx0KTtcblxuXHRyZXR1cm4gKFxuXHRcdDxkaXYgc3R5bGU9e1N0eWxlLk51bWJlckJveH0+XG5cdFx0XHR7YnV0dG9uc31cblx0XHQ8L2Rpdj5cblx0KTtcbn07IiwiY29uc3Rcblx0UmVhY3QgPSByZXF1aXJlKFwicHJlYWN0XCIpLFxuXHRTdHlsZSA9IHJlcXVpcmUoXCIuLi9zdHlsZS5qc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihwcm9wcykge1xuXHRzZXRUaW1lb3V0KCgpID0+IHByb3BzLnNlZ3VlKCksIDIwMDApO1xuXHRyZXR1cm4gKFxuXHRcdDxkaXYgc3R5bGU9e1N0eWxlLk1haW5MYXlvdXR9PlxuXHRcdFx0PGltZyBzcmM9XCIuL2Rpc3QvaW1nL0JBQ0sucG5nXCIgc3R5bGU9e1N0eWxlLmltZ30vPlxuXHRcdFx0PGgyPntcIlBhc3MgdGhpcyB0byB0aGUgXCIgKyBwcm9wcy50byArIFwiIHBsYXllci5cIn08L2gyPlxuXHRcdDwvZGl2PlxuXHQpO1xufSIsImNvbnN0XG5cdFJlYWN0ID0gcmVxdWlyZShcInByZWFjdFwiKSxcblx0SGV4QnV0dG9uID0gcmVxdWlyZShcIi4vSGV4QnV0dG9uLmpzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHByb3BzLCBzdGF0ZSkge1xuXHRyZXR1cm4gKFxuXHRcdDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcIj5cblx0XHRcdDxIZXhCdXR0b24gdGV4dD1cIlJcIiBmZz1cIiNmZjAwMDBcIiBiZz1cIiNmZmZmZmZcIiBzZWxlY3RlZD17KHByb3BzLnNlbGVjdGVkID09PSBcIlJcIil9IG9uQ2xpY2s9e3Byb3BzLm9uU2VsZWN0fS8+XG5cdFx0XHQ8SGV4QnV0dG9uIHRleHQ9XCJQXCIgZmc9XCIjY2MwMGNjXCIgYmc9XCIjZmZmZmZmXCIgc2VsZWN0ZWQ9eyhwcm9wcy5zZWxlY3RlZCA9PT0gXCJQXCIpfSBvbkNsaWNrPXtwcm9wcy5vblNlbGVjdH0vPlxuXHRcdFx0PEhleEJ1dHRvbiB0ZXh0PVwiT1wiIGZnPVwiI2ZmOTkwMFwiIGJnPVwiI2ZmZmZmZlwiIHNlbGVjdGVkPXsocHJvcHMuc2VsZWN0ZWQgPT09IFwiT1wiKX0gb25DbGljaz17cHJvcHMub25TZWxlY3R9Lz5cblx0XHRcdDxIZXhCdXR0b24gdGV4dD1cIkdcIiBmZz1cIiMwMGNjMzNcIiBiZz1cIiNmZmZmZmZcIiBzZWxlY3RlZD17KHByb3BzLnNlbGVjdGVkID09PSBcIkdcIil9IG9uQ2xpY2s9e3Byb3BzLm9uU2VsZWN0fS8+XG5cdFx0PC9kaXY+XG5cdCk7XG59OyIsImNvbnN0XG5cdFJlYWN0ID0gcmVxdWlyZShcInByZWFjdFwiKSxcblxuXHRCaW5kID0gcmVxdWlyZShcIi4uL2JpbmQuanNcIiksXG5cblx0TnVtYmVyU2VsZWN0b3IgPSByZXF1aXJlKFwiLi9OdW1iZXJTZWxlY3Rvci5qc1wiKSxcblx0Q2FyZCA9IHJlcXVpcmUoXCIuL0NhcmQuanNcIiksXG5cdFN0eWxlID0gcmVxdWlyZShcIi4uL3N0eWxlLmpzXCIpO1xuXG5jbGFzcyBTaGlwVmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKHByb3BzLCBjb250ZXh0KSB7XG5cdFx0c3VwZXIocHJvcHMpO1xuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRkZXRlY3Rpb246IDBcblx0XHR9O1xuXG5cdFx0QmluZCh0aGlzKTtcblx0fVxuXG5cdHJlbmRlcihwcm9wcywgc3RhdGUpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PHNlY3Rpb24gc3R5bGU9e1N0eWxlLk1haW5MYXlvdXR9PlxuXHRcdFx0XHQ8Q2FyZCBjb2xvcj1cIiNjY2NjY2NcIj5cblx0XHRcdFx0XHQ8aDI+RGV0ZWN0aW9uPC9oMj5cblx0XHRcdFx0XHQ8TnVtYmVyU2VsZWN0b3Igc2VsZWN0ZWQ9e1tzdGF0ZS5kZXRlY3Rpb25dfSBmcm9tPXswfSB0bz17MTJ9IG9uQ2xpY2s9e3RoaXMuc2VsZWN0RGV0ZWN0aW9ufSAvPlxuXHRcdFx0XHQ8L0NhcmQ+XG5cdFx0XHRcdDxidXR0b25cblx0XHRcdFx0XHRzdHlsZT17U3R5bGUuU2VndWVCdXR0b259XG5cdFx0XHRcdFx0b25DbGljaz17dGhpcy52aWV3U29uYXJ9XG5cdFx0XHRcdD57KHRoaXMuc3RhdGUuZGV0ZWN0aW9uID09PSAwKSA/IFwiRG9uZVwiIDogXCJWaWV3IERhdGFcIn08L2J1dHRvbj5cblx0XHRcdDwvc2VjdGlvbj5cblx0XHQpO1xuXHR9XG5cblx0c2VsZWN0RGV0ZWN0aW9uKHMpIHtcblx0XHRpZiAodGhpcy5zdGF0ZS5kZXRlY3Rpb24gIT09IHMpIHRoaXMuc2V0U3RhdGUoe2RldGVjdGlvbjogc30pO1xuXHR9XG5cblx0dmlld1NvbmFyKCkge1xuXHRcdHRoaXMucHJvcHMuc2VndWUoXG5cdFx0XHR0aGlzLnByb3BzLnBheWxvYWQodGhpcy5zdGF0ZS5kZXRlY3Rpb24sICh0aGlzLnN0YXRlLmRldGVjdGlvbiA9PT0gMCkpIC8vIHNoaXAgc29uYXIgZnVuY3Rpb25cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2hpcFZpZXc7IiwiY29uc3Rcblx0UmVhY3QgPSByZXF1aXJlKFwicHJlYWN0XCIpLFxuXG5cdEJpbmQgPSByZXF1aXJlKFwiLi4vYmluZC5qc1wiKSxcblxuXHROdW1iZXJMaXN0ID0gcmVxdWlyZShcIi4vTnVtYmVyTGlzdC5qc1wiKSxcblx0Q2FyZCA9IHJlcXVpcmUoXCIuL0NhcmQuanNcIiksXG5cdFNvbmFyID0gcmVxdWlyZShcIi4uL3NvbmFyLmpzXCIpLFxuXHRTdHlsZSA9IHJlcXVpcmUoXCIuLi9zdHlsZS5qc1wiKTtcblxuZnVuY3Rpb24gcGFyc2VEcmF3KGNhcmRzKSB7XG5cdHZhciBkcmF3ID0ge1xuXHRcdFx0UjogW10sXG5cdFx0XHRQOiBbXSxcblx0XHRcdE86IFtdLFxuXHRcdFx0RzogW10sXG5cdFx0XHRTOiBbXSxcblx0XHRcdEQ6IFtdXG5cdFx0fSxcblx0XHRjO1xuXG5cdHdoaWxlIChjID0gY2FyZHMucG9wKCkpIGRyYXdbY1swXV0ucHVzaChOdW1iZXIoY1sxXSkpO1xuXG5cdGRyYXcuUi5zb3J0KCk7XG5cdGRyYXcuUC5zb3J0KCk7XG5cdGRyYXcuTy5zb3J0KCk7XG5cdGRyYXcuRy5zb3J0KCk7XG5cdGRyYXcuUy5zb3J0KCk7XG5cdGRyYXcuRC5zb3J0KCk7XG5cblx0cmV0dXJuIGRyYXc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocHJvcHMsIHN0YXRlKSB7XG5cdHZhciBkcmF3ID0gcGFyc2VEcmF3KHByb3BzLnBheWxvYWQpLFxuXHRcdGNhcmRzID0gW107XG5cblx0aWYgKGRyYXcuUi5sZW5ndGgpIGNhcmRzLnB1c2goXG5cdFx0PENhcmQgY29sb3I9e1NvbmFyLkNvbG9yRm9yUXVhZHJhbnQoXCJSXCIpfT5cblx0XHRcdDxoMj5SZWQ8L2gyPlxuXHRcdFx0PE51bWJlckxpc3QgbGlzdD17ZHJhdy5SfSAvPlxuXHRcdDwvQ2FyZD5cblx0KTtcblxuXHRpZiAoZHJhdy5QLmxlbmd0aCkgY2FyZHMucHVzaChcblx0XHQ8Q2FyZCBjb2xvcj17U29uYXIuQ29sb3JGb3JRdWFkcmFudChcIlBcIil9PlxuXHRcdFx0PGgyPlB1cnBsZTwvaDI+XG5cdFx0XHQ8TnVtYmVyTGlzdCBsaXN0PXtkcmF3LlB9IC8+XG5cdFx0PC9DYXJkPlxuXHQpO1xuXG5cdGlmIChkcmF3Lk8ubGVuZ3RoKSBjYXJkcy5wdXNoKFxuXHRcdDxDYXJkIGNvbG9yPXtTb25hci5Db2xvckZvclF1YWRyYW50KFwiT1wiKX0+XG5cdFx0XHQ8aDI+T3JhbmdlPC9oMj5cblx0XHRcdDxOdW1iZXJMaXN0IGxpc3Q9e2RyYXcuT30gLz5cblx0XHQ8L0NhcmQ+XG5cdCk7XG5cblx0aWYgKGRyYXcuRy5sZW5ndGgpIGNhcmRzLnB1c2goXG5cdFx0PENhcmQgY29sb3I9e1NvbmFyLkNvbG9yRm9yUXVhZHJhbnQoXCJHXCIpfT5cblx0XHRcdDxoMj5HcmVlbjwvaDI+XG5cdFx0XHQ8TnVtYmVyTGlzdCBsaXN0PXtkcmF3Lkd9IC8+XG5cdFx0PC9DYXJkPlxuXHQpO1xuXG5cdGlmIChkcmF3LlMubGVuZ3RoKSBjYXJkcy5wdXNoKFxuXHRcdDxDYXJkIGNvbG9yPVwiIzAxMzlhNFwiPlxuXHRcdFx0PGgyPlNwZWVkPC9oMj5cblx0XHRcdDxOdW1iZXJMaXN0IGxpc3Q9e2RyYXcuU30gLz5cblx0XHQ8L0NhcmQ+XG5cdCk7XG5cblx0aWYgKGRyYXcuRC5sZW5ndGgpIGNhcmRzLnB1c2goXG5cdFx0PENhcmQgY29sb3I9XCIjMzMzMzMzXCI+XG5cdFx0XHQ8aDI+RGVwdGg8L2gyPlxuXHRcdFx0PE51bWJlckxpc3QgbGlzdD17ZHJhdy5EfSAvPlxuXHRcdDwvQ2FyZD5cblx0KTtcblxuXHRyZXR1cm4gKFxuXHRcdDxzZWN0aW9uIHN0eWxlPXtTdHlsZS5NYWluTGF5b3V0fT5cblx0XHRcdHtjYXJkc31cblx0XHRcdDxidXR0b24gc3R5bGU9e1N0eWxlLlNlZ3VlQnV0dG9ufSBvbkNsaWNrPXsoKSA9PiBwcm9wcy5zZWd1ZSgpfT5Eb25lPC9idXR0b24+XG5cdFx0PC9zZWN0aW9uPlxuXHQpO1xufTsiLCJjb25zdFxuXHRSZWFjdCA9IHJlcXVpcmUoXCJwcmVhY3RcIiksXG5cblx0QmluZCA9IHJlcXVpcmUoXCIuLi9iaW5kLmpzXCIpLFxuXG5cdENhcmQgPSByZXF1aXJlKFwiLi9DYXJkLmpzXCIpLFxuXHRRdWFkcmFudFNlbGVjdG9yID0gcmVxdWlyZShcIi4vUXVhZHJhbnRTZWxlY3Rvci5qc1wiKSxcblx0TnVtYmVyU2VsZWN0b3IgPSByZXF1aXJlKFwiLi9OdW1iZXJTZWxlY3Rvci5qc1wiKSxcblx0U29uYXIgPSByZXF1aXJlKFwiLi4vc29uYXIuanNcIiksXG5cblx0U3R5bGUgPSByZXF1aXJlIChcIi4uL3N0eWxlLmpzXCIpO1xuXG5jbGFzcyBTdWJWaWV3IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IocHJvcHMsIGNvbnRleHQpIHtcblx0XHRzdXBlcihwcm9wcyk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0cXVhZHJhbnQ6IFwiUlwiLFxuXHRcdFx0cXVhZHJhbnRDb2xvcjogXCIjZmYwMDAwXCIsXG5cdFx0XHRwb3NBOiB1bmRlZmluZWQsXG5cdFx0XHRwb3NCOiB1bmRlZmluZWQsXG5cdFx0XHRzcGVlZDogdW5kZWZpbmVkLFxuXHRcdFx0ZGVwdGg6IHVuZGVmaW5lZCxcblx0XHRcdHN0ZWFsdGg6IHVuZGVmaW5lZFxuXHRcdH07XG5cblx0XHRCaW5kKHRoaXMpO1xuXHR9XG5cblx0cmVuZGVyKHByb3BzLCBzdGF0ZSkge1xuXHRcdHZhciBub1NlZ3VlID0gKHN0YXRlLnBvc0EgICAgPT09IHVuZGVmaW5lZFxuXHRcdFx0XHRcdHx8IHN0YXRlLnBvc0IgICAgPT09IHVuZGVmaW5lZFxuXHRcdFx0XHRcdHx8IHN0YXRlLnNwZWVkICAgPT09IHVuZGVmaW5lZFxuXHRcdFx0XHRcdHx8IHN0YXRlLmRlcHRoICAgPT09IHVuZGVmaW5lZFxuXHRcdFx0XHRcdHx8IHN0YXRlLnN0ZWFsdGggPT09IHVuZGVmaW5lZClcblx0XHRyZXR1cm4gKFxuXHRcdFx0PHNlY3Rpb24gc3R5bGU9e1N0eWxlLk1haW5MYXlvdXR9PlxuXHRcdFx0XHQ8Q2FyZCBjb2xvcj17c3RhdGUucXVhZHJhbnRDb2xvcn0+XG5cdFx0XHRcdFx0PGgyPlBvc2l0aW9uPC9oMj5cblx0XHRcdFx0XHQ8UXVhZHJhbnRTZWxlY3RvciBzZWxlY3RlZD17c3RhdGUucXVhZHJhbnR9IG9uU2VsZWN0PXt0aGlzLnNlbGVjdFF1YWRyYW50fSAvPlxuXHRcdFx0XHRcdDxOdW1iZXJTZWxlY3RvciBmZz17c3RhdGUucXVhZHJhbnRDb2xvcn0gc2VsZWN0ZWQ9e1t0aGlzLnN0YXRlLnBvc0EsIHRoaXMuc3RhdGUucG9zQl19IGZyb209ezB9IHRvPXs5fSBvbkNsaWNrPXt0aGlzLnNlbGVjdFBvc2l0aW9ufSAvPlxuXHRcdFx0XHQ8L0NhcmQ+XG5cdFx0XHRcdDxDYXJkIGNvbG9yPVwiIzMzMzMzM1wiPlxuXHRcdFx0XHRcdDxoMj5TcGVlZDwvaDI+XG5cdFx0XHRcdFx0PE51bWJlclNlbGVjdG9yIHNlbGVjdGVkPXtbc3RhdGUuc3BlZWRdfSBmcm9tPXswfSB0bz17NH0gb25DbGljaz17dGhpcy5zZWxlY3RTcGVlZH0gLz5cblx0XHRcdFx0PC9DYXJkPlxuXHRcdFx0XHQ8Q2FyZCBjb2xvcj1cIiMwMTM5YTRcIj5cblx0XHRcdFx0XHQ8aDI+RGVwdGg8L2gyPlxuXHRcdFx0XHRcdDxOdW1iZXJTZWxlY3RvciBzZWxlY3RlZD17W3N0YXRlLmRlcHRoXX0gZnJvbT17MH0gdG89ezR9IG9uQ2xpY2s9e3RoaXMuc2VsZWN0RGVwdGh9IC8+XG5cdFx0XHRcdDwvQ2FyZD5cblx0XHRcdFx0PENhcmQgY29sb3I9XCIjOTk5OTk5XCI+XG5cdFx0XHRcdFx0PGgyPlN0ZWFsdGg8L2gyPlxuXHRcdFx0XHRcdDxOdW1iZXJTZWxlY3RvciBzZWxlY3RlZD17W3N0YXRlLnN0ZWFsdGhdfSBmcm9tPXswfSB0bz17MTJ9IG9uQ2xpY2s9e3RoaXMuc2VsZWN0U3RlYWx0aH0gLz5cblx0XHRcdFx0PC9DYXJkPlxuXHRcdFx0XHQ8YnV0dG9uXG5cdFx0XHRcdFx0c3R5bGU9eyhub1NlZ3VlID8gU3R5bGUuRGlzYWJsZWRCdXR0b24gOiBTdHlsZS5TZWd1ZUJ1dHRvbil9XG5cdFx0XHRcdFx0b25DbGljaz17dGhpcy5zdGFja0RlY2t9XG5cdFx0XHRcdFx0ZGlzYWJsZWQ9e25vU2VndWV9XG5cdFx0XHRcdD5Eb25lPC9idXR0b24+XG5cdFx0XHQ8L3NlY3Rpb24+XG5cdFx0KTtcblx0fVxuXG5cdHNlbGVjdFF1YWRyYW50KHEpIHtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdHF1YWRyYW50OiBxLFxuXHRcdFx0cXVhZHJhbnRDb2xvcjogU29uYXIuQ29sb3JGb3JRdWFkcmFudChxKVxuXHRcdH0pO1xuXHR9XG5cblx0c2VsZWN0UG9zaXRpb24ocCkge1xuXHRcdHZhciBzdGF0ZSA9IHtcblx0XHRcdHBvc0E6IHRoaXMuc3RhdGUucG9zQSxcblx0XHRcdHBvc0I6IHRoaXMuc3RhdGUucG9zQlxuXHRcdH07XG5cblx0XHRpZiAoc3RhdGUucG9zQSA9PT0gcCkgc3RhdGUucG9zQSA9IHVuZGVmaW5lZDtcblx0XHRlbHNlIGlmIChzdGF0ZS5wb3NCID09PSBwKSBzdGF0ZS5wb3NCID0gdW5kZWZpbmVkO1xuXHRcdGVsc2UgaWYgKHN0YXRlLnBvc0EgPT09IHVuZGVmaW5lZCkgc3RhdGUucG9zQSA9IHA7XG5cdFx0ZWxzZSBpZiAoc3RhdGUucG9zQiA9PSB1bmRlZmluZWQpIHN0YXRlLnBvc0IgPSBwO1xuXHRcdFxuXHRcdHRoaXMuc2V0U3RhdGUoc3RhdGUpO1xuXHR9XG5cblx0c2VsZWN0U3BlZWQocykge1xuXHRcdGlmICh0aGlzLnN0YXRlLnNwZWVkICE9PSBzKSB0aGlzLnNldFN0YXRlKHtzcGVlZDogc30pO1xuXHR9XG5cblx0c2VsZWN0RGVwdGgocykge1xuXHRcdGlmICh0aGlzLnN0YXRlLmRlcHRoICE9PSBzKSB0aGlzLnNldFN0YXRlKHtkZXB0aDogc30pO1xuXHR9XG5cblx0c2VsZWN0U3RlYWx0aChzKSB7XG5cdFx0aWYgKHRoaXMuc3RhdGUuc3RlYWx0aCAhPT0gcykgdGhpcy5zZXRTdGF0ZSh7c3RlYWx0aDogc30pO1xuXHR9XG5cblx0c3RhY2tEZWNrKCkge1xuXHRcdHRoaXMucHJvcHMuc2VndWUoXG5cdFx0XHRTb25hci5TdWJTb25hcih0aGlzLnN0YXRlLnF1YWRyYW50ICsgdGhpcy5zdGF0ZS5wb3NBLCB0aGlzLnN0YXRlLnF1YWRyYW50ICsgdGhpcy5zdGF0ZS5wb3NCLCBcIlNcIiArIHRoaXMuc3RhdGUuc3BlZWQsIFwiRFwiICsgdGhpcy5zdGF0ZS5kZXB0aCwgdGhpcy5zdGF0ZS5zdGVhbHRoKVxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTdWJWaWV3OyIsIi8vIE9iamVjdC5hc3NpZ24gUE9MWUZJTExcbi8vIHNvdXJjZTogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvT2JqZWN0L2Fzc2lnbiNQb2x5ZmlsbFxuLy9cbmlmICh0eXBlb2YgT2JqZWN0LmFzc2lnbiAhPSAnZnVuY3Rpb24nKSB7XG5cdE9iamVjdC5hc3NpZ24gPSBmdW5jdGlvbih0YXJnZXQsIHZhckFyZ3MpIHsgLy8gLmxlbmd0aCBvZiBmdW5jdGlvbiBpcyAyXG5cdFx0J3VzZSBzdHJpY3QnO1xuXHRcdGlmICh0YXJnZXQgPT0gbnVsbCkgeyAvLyBUeXBlRXJyb3IgaWYgdW5kZWZpbmVkIG9yIG51bGxcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjb252ZXJ0IHVuZGVmaW5lZCBvciBudWxsIHRvIG9iamVjdCcpO1xuXHRcdH1cblxuXHRcdHZhciB0byA9IE9iamVjdCh0YXJnZXQpO1xuXG5cdFx0Zm9yICh2YXIgaW5kZXggPSAxOyBpbmRleCA8IGFyZ3VtZW50cy5sZW5ndGg7IGluZGV4KyspIHtcblx0XHRcdHZhciBuZXh0U291cmNlID0gYXJndW1lbnRzW2luZGV4XTtcblxuXHRcdFx0aWYgKG5leHRTb3VyY2UgIT0gbnVsbCkgeyAvLyBTa2lwIG92ZXIgaWYgdW5kZWZpbmVkIG9yIG51bGxcblx0XHRcdFx0Zm9yICh2YXIgbmV4dEtleSBpbiBuZXh0U291cmNlKSB7XG5cdFx0XHRcdFx0Ly8gQXZvaWQgYnVncyB3aGVuIGhhc093blByb3BlcnR5IGlzIHNoYWRvd2VkXG5cdFx0XHRcdFx0aWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChuZXh0U291cmNlLCBuZXh0S2V5KSkge1xuXHRcdFx0XHRcdFx0dG9bbmV4dEtleV0gPSBuZXh0U291cmNlW25leHRLZXldO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdG87XG5cdH07XG59IiwiZnVuY3Rpb24gc29uYXJEZWNrKCkge1xuXHRyZXR1cm4gW1xuXHRcdFwiRzBcIixcblx0XHRcIkcxXCIsXG5cdFx0XCJHMlwiLFxuXHRcdFwiRzNcIixcblx0XHRcIkc0XCIsXG5cdFx0XCJHNVwiLFxuXHRcdFwiRzZcIixcblx0XHRcIkc3XCIsXG5cdFx0XCJHOFwiLFxuXHRcdFwiRzlcIixcblx0XHRcIlAwXCIsXG5cdFx0XCJQMVwiLFxuXHRcdFwiUDJcIixcblx0XHRcIlAzXCIsXG5cdFx0XCJQNFwiLFxuXHRcdFwiUDVcIixcblx0XHRcIlA2XCIsXG5cdFx0XCJQN1wiLFxuXHRcdFwiUDhcIixcblx0XHRcIlA5XCIsXG5cdFx0XCJPMFwiLFxuXHRcdFwiTzFcIixcblx0XHRcIk8yXCIsXG5cdFx0XCJPM1wiLFxuXHRcdFwiTzRcIixcblx0XHRcIk81XCIsXG5cdFx0XCJPNlwiLFxuXHRcdFwiTzdcIixcblx0XHRcIk84XCIsXG5cdFx0XCJPOVwiLFxuXHRcdFwiUjBcIixcblx0XHRcIlIxXCIsXG5cdFx0XCJSMlwiLFxuXHRcdFwiUjNcIixcblx0XHRcIlI0XCIsXG5cdFx0XCJSNVwiLFxuXHRcdFwiUjZcIixcblx0XHRcIlI3XCIsXG5cdFx0XCJSOFwiLFxuXHRcdFwiUjlcIixcblx0XHRcIkQwXCIsXG5cdFx0XCJEMVwiLFxuXHRcdFwiRDJcIixcblx0XHRcIkQzXCIsXG5cdFx0XCJENFwiLFxuXHRcdFwiUzBcIixcblx0XHRcIlMxXCIsXG5cdFx0XCJTMlwiLFxuXHRcdFwiUzNcIixcblx0XHRcIlM0XCJcblx0XTtcbn1cblxuZnVuY3Rpb24gRmlzaGVyWWF0ZXNTaHVmZmxlKGRlY2spIHtcblx0dmFyICB0ZW1wLCBpLCBqO1xuXG5cdGkgPSBkZWNrLmxlbmd0aDtcblx0d2hpbGUoaSkge1xuXHRcdGogPSAoTWF0aC5yYW5kb20oKSAqIGktLSkgPj4gMDsgXG5cblx0XHR0ZW1wID0gZGVja1tpXTtcblx0XHRkZWNrW2ldID0gZGVja1tqXTtcblx0XHRkZWNrW2pdID0gdGVtcDtcblx0fVxufVxuXG5mdW5jdGlvbiBzaHVmZmxlKGRlY2ssIHRpbWVzKSB7XG5cdHdoaWxlICh0aW1lcy0tKSBGaXNoZXJZYXRlc1NodWZmbGUoZGVjayk7XG59XG5cbmZ1bmN0aW9uIFNoaXBTb25hcihkZXRlY3Rpb24pIHtcblx0d2hpbGUgKGRldGVjdGlvbiA8IHRoaXMubGVuZ3RoKSB0aGlzLnBvcCgpO1xuXHRyZXR1cm4gdGhpcztcbn1cblxuZnVuY3Rpb24gU3ViU29uYXIocG9zQSwgcG9zQiwgc3BlZWQsIGRlcHRoLCBzdGVhbHRoKSB7XG5cdHZhciBkZWNrID0gc29uYXJEZWNrKCksXG5cdFx0c29uYXIgPSBbXSxcblx0XHRpO1xuXG5cdGkgPSBkZWNrLmluZGV4T2YocG9zQSk7XG5cdGlmIChpICE9PSAtMSkgc29uYXIucHVzaChkZWNrLnNwbGljZShpLCAxKVswXSk7XG5cdGVsc2UgdGhyb3cgXCJQb3NpdGlvbjogXCIgKyBwb3NBICsgXCIgbm90IGluIFNvbmFyIVwiO1xuXG5cdGkgPSBkZWNrLmluZGV4T2YocG9zQik7XG5cdGlmIChpICE9PSAtMSkgc29uYXIucHVzaChkZWNrLnNwbGljZShpLCAxKVswXSk7XG5cdGVsc2UgdGhyb3cgXCJQb3NpdGlvbjogXCIgKyBwb3NCICsgXCIgbm90IGluIFNvbmFyIVwiO1xuXG5cdGkgPSBkZWNrLmluZGV4T2Yoc3BlZWQpO1xuXHRpZiAoaSAhPT0gLTEpIHNvbmFyLnB1c2goZGVjay5zcGxpY2UoaSwgMSlbMF0pO1xuXHRlbHNlIHRocm93IFwiU3BlZWQ6IFwiICsgc3BlZWQgKyBcIiBub3QgaW4gU29uYXIhXCI7XG5cblx0aSA9IGRlY2suaW5kZXhPZihkZXB0aCk7XG5cdGlmIChpICE9PSAtMSkgc29uYXIucHVzaChkZWNrLnNwbGljZShpLCAxKVswXSk7XG5cdGVsc2UgdGhyb3cgXCJTcGVlZDogXCIgKyBkZXB0aCArIFwiIG5vdCBpbiBTb25hciFcIjtcblxuXHRzaHVmZmxlKGRlY2ssIDIpO1xuXG5cdHdoaWxlIChzdGVhbHRoLS0pIHtcblx0XHRpID0gKE1hdGgucmFuZG9tKCkgKiBkZWNrLmxlbmd0aCkgPj4gMDtcblx0XHRzb25hci5wdXNoKGRlY2suc3BsaWNlKGksIDEpWzBdKTtcblx0fVxuXG5cdHNodWZmbGUoc29uYXIsIDIpO1xuXG5cdHJldHVybiBTaGlwU29uYXIuYmluZChzb25hcik7XG59XG5cbmZ1bmN0aW9uIENvbG9yRm9yUXVhZHJhbnQocSkge1xuXHRzd2l0Y2ggKHEpIHtcblx0XHRjYXNlIFwiUlwiOiByZXR1cm4gXCIjZmYwMDAwXCI7XG5cdFx0Y2FzZSBcIlBcIjogcmV0dXJuIFwiI2NjMDBjY1wiO1xuXHRcdGNhc2UgXCJPXCI6IHJldHVybiBcIiNmZjk5MDBcIjtcblx0XHRjYXNlIFwiR1wiOiByZXR1cm4gXCIjMDBjYzMzXCI7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7IFN1YlNvbmFyOiBTdWJTb25hciwgQ29sb3JGb3JRdWFkcmFudDogQ29sb3JGb3JRdWFkcmFudCB9OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuXHRNYWluTGF5b3V0OiB7XG5cdFx0ZGlzcGxheTogXCJmbGV4XCIsXG5cdFx0ZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcblx0XHRqdXN0aWZ5Q29udGVudDogXCJmbGV4LXN0YXJ0XCIsXG5cdFx0YWxpZ25JdGVtczogXCJjZW50ZXJcIixcblx0XHRtYXhXaWR0aDogXCIyNXJlbVwiXG5cdH0sXG5cdFNlZ3VlQnV0dG9uOiB7XG5cdFx0d2lkdGg6IFwiMjRyZW1cIixcblx0XHRoZWlnaHQ6IFwiNHJlbVwiLFxuXHRcdGZvbnRXZWlnaHQ6IFwiMjAwXCIsXG5cdFx0Zm9udFNpemU6IFwiMnJlbVwiLFxuXHRcdGJvcmRlcjogXCJub25lXCIsXG5cdFx0b3V0bGluZTogXCJub25lXCIsXG5cdFx0Y29sb3I6IFwiI2ZmZmZmZlwiLFxuXHRcdGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDI1NSwyNTUsMjU1LDAuNSlcIlxuXHR9LFxuXHREaXNhYmxlZEJ1dHRvbjoge1xuXHRcdHdpZHRoOiBcIjI0cmVtXCIsXG5cdFx0aGVpZ2h0OiBcIjRyZW1cIixcblx0XHRmb250V2VpZ2h0OiBcIjIwMFwiLFxuXHRcdGZvbnRTaXplOiBcIjJyZW1cIixcblx0XHRib3JkZXI6IFwibm9uZVwiLFxuXHRcdG91dGxpbmU6IFwibm9uZVwiLFxuXHRcdGNvbG9yOiBcIiMyMjIyMjJcIixcblx0XHRiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgyNTUsMjU1LDI1NSwwLjI1KVwiXG5cdH0sXG5cdE51bWJlckJveDoge1xuXHRcdG1hcmdpbkxlZnQ6IFwiYXV0b1wiLFxuXHRcdG1hcmdpblJpZ2h0OiBcImF1dG9cIixcblx0XHR3aWR0aDogXCI4MCVcIixcblx0XHRkaXNwbGF5OiBcImZsZXhcIixcblx0XHRqdXN0aWZ5Q29udGVudDogXCJmbGV4LXN0YXJ0XCIsXG5cdFx0ZmxleFdyYXA6IFwid3JhcFwiLFxuXHRcdG1hcmdpbkJvdHRvbTogXCIycmVtXCJcblx0fSxcblx0TnVtYmVyQnV0dG9uOiB7XG5cdFx0Ym9yZGVyOiBcIm5vbmVcIixcblx0XHRvdXRsaW5lOiBcIm5vbmVcIixcblx0XHRmb250U2l6ZTogXCIycmVtXCIsXG5cdFx0Zm9udFdlaWdodDogXCIyMDBcIixcblx0XHRtYXJnaW46IFwiMC43NXJlbVwiLFxuXHRcdGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDAsMCwwLDApXCJcblx0fSxcblx0SGV4QnV0dG9uOiB7XG5cdFx0ZGlzcGxheTogXCJpbmxpbmVcIixcblx0XHRtYXJnaW46IFwiMC4xNXJlbVwiLFxuXHRcdGZvbnRGYW1pbHk6IFwiT3BlbiBTYW5zXCIsXG5cdFx0Zm9udFNpemU6IFwiMXJlbVwiLFxuXHRcdHdpZHRoOiBcIjVyZW1cIixcblx0XHRoZWlnaHQ6IFwiNXJlbVwiXG5cdH0sXG5cdENhcmQ6IHtcblx0XHRtYXJnaW5Cb3R0b206IFwiMXJlbVwiLFxuXHRcdHdpZHRoOiBcIjEwMCVcIixcblx0XHRib3JkZXJSYWRpdXM6IFwiMXJlbVwiLFxuXHRcdGRpc3BsYXk6IFwiZmxleFwiLFxuXHRcdGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG5cdFx0YWxpZ25JdGVtczogXCJjZW50ZXJcIixcblx0XHRqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIlxuXHR9LFxuXHRpbWc6IHtcblx0XHR3aWR0aDogXCIxMDAlXCIsXG5cdFx0aGVpZ2h0OiBcImF1dG9cIlxuXHR9XG59OyJdfQ==
