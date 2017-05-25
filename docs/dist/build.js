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
					fillOpacity: "0.5"
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

function ButtonRow(index, props, callback) {
	var buttons = [],
	    width = 3;

	while (width-- && index <= props.to) {
		buttons.push(React.createElement("button", {
			style: Object.assign({}, Style.NumberButton, { color: props.selected.indexOf(index) === -1 ? "rgba(255, 255, 255, 0.3)" : "#ffffff" }),
			"data-id": index,
			onClick: callback
		}, "" + index++));
	}return React.createElement("div", { style: Style.FlexRow }, buttons);
}

module.exports = function (props) {
	var i = props.from,
	    rows = [],
	    callback = function callback(e) {
		return props.onClick(Number(e.target.dataset.id));
	};

	while (i <= props.to) {
		rows.push(ButtonRow(i, props, callback));
		i += 3;
	}

	return React.createElement("div", { style: Style.NumberBox }, rows);
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
    HexButton = require("./HexButton.js"),
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

	if (draw.R.length) cards.push(React.createElement(Card, { color: Sonar.ColorForQuadrant("R") }, React.createElement(HexButton, { text: "R", selected: "true", fg: Sonar.ColorForQuadrant("R"), bg: "#ffffff" }), React.createElement(NumberList, { list: draw.R })));

	if (draw.P.length) cards.push(React.createElement(Card, { color: Sonar.ColorForQuadrant("P") }, React.createElement(HexButton, { text: "P", selected: "true", fg: Sonar.ColorForQuadrant("P"), bg: "#ffffff" }), React.createElement(NumberList, { list: draw.P })));

	if (draw.O.length) cards.push(React.createElement(Card, { color: Sonar.ColorForQuadrant("O") }, React.createElement(HexButton, { text: "O", selected: "true", fg: Sonar.ColorForQuadrant("O"), bg: "#ffffff" }), React.createElement(NumberList, { list: draw.O })));

	if (draw.G.length) cards.push(React.createElement(Card, { color: Sonar.ColorForQuadrant("G") }, React.createElement(HexButton, { text: "G", selected: "true", fg: Sonar.ColorForQuadrant("G"), bg: "#ffffff" }), React.createElement(NumberList, { list: draw.G })));

	if (draw.S.length) cards.push(React.createElement(Card, { color: "#0139a4" }, React.createElement("h2", null, "Speed"), React.createElement(NumberList, { list: draw.S })));

	if (draw.D.length) cards.push(React.createElement(Card, { color: "#333333" }, React.createElement("h2", null, "Depth"), React.createElement(NumberList, { list: draw.D })));

	return React.createElement("section", { style: Style.MainLayout }, cards, React.createElement("button", { style: Style.SegueButton, onClick: function onClick() {
			return props.segue();
		} }, "Done"));
};

},{"../bind.js":3,"../sonar.js":15,"../style.js":16,"./Card.js":4,"./HexButton.js":6,"./NumberList.js":7,"preact":1}],13:[function(require,module,exports){
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
			return React.createElement("section", { style: Style.MainLayout }, React.createElement(Card, { color: state.quadrantColor }, React.createElement(QuadrantSelector, { selected: state.quadrant, onSelect: this.selectQuadrant }), React.createElement(NumberSelector, { fg: state.quadrantColor, selected: [this.state.posA, this.state.posB], from: 0, to: 9, onClick: this.selectPosition })), React.createElement(Card, { color: "#333333" }, React.createElement("h2", null, "Speed"), React.createElement(NumberSelector, { selected: [state.speed], from: 0, to: 4, onClick: this.selectSpeed })), React.createElement(Card, { color: "#0139a4" }, React.createElement("h2", null, "Depth"), React.createElement(NumberSelector, { selected: [state.depth], from: 0, to: 4, onClick: this.selectDepth })), React.createElement(Card, { color: "#999999" }, React.createElement("h2", null, "Stealth"), React.createElement(NumberSelector, { selected: [state.stealth], from: 0, to: 12, onClick: this.selectStealth })), React.createElement("button", {
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
		width: "20rem",
		height: "4rem",
		fontWeight: "200",
		fontSize: "2rem",
		border: "none",
		outline: "none",
		color: "#ffffff",
		backgroundColor: "rgba(255,255,255,0.5)"
	},
	DisabledButton: {
		width: "20rem",
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
		alignItems: "center",
		flexWrap: "wrap",
		marginBottom: "2rem"
	},
	FlexRow: {
		width: "100%",
		display: "flex",
		justifyContent: "center",
		alignItems: "center"
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
		marginTop: "1rem",
		marginLeft: "0.15rem",
		marginRight: "0.15rem",
		fontFamily: "Open Sans",
		fontSize: "1rem",
		width: "4rem",
		height: "4rem"
	},
	Card: {
		marginBottom: "1rem",
		width: "100%",
		borderRadius: "1rem",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		maxWidth: "20rem"
	},
	img: {
		width: "100%",
		height: "auto"
	}
};

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcHJlYWN0L2Rpc3QvcHJlYWN0LmpzIiwic3JjL0FwcC5qcyIsInNyYy9iaW5kLmpzIiwic3JjL2NvbXBvbmVudHMvQ2FyZC5qcyIsInNyYy9jb21wb25lbnRzL0hleC5qcyIsInNyYy9jb21wb25lbnRzL0hleEJ1dHRvbi5qcyIsInNyYy9jb21wb25lbnRzL051bWJlckxpc3QuanMiLCJzcmMvY29tcG9uZW50cy9OdW1iZXJTZWxlY3Rvci5qcyIsInNyYy9jb21wb25lbnRzL1Bhc3MuanMiLCJzcmMvY29tcG9uZW50cy9RdWFkcmFudFNlbGVjdG9yLmpzIiwic3JjL2NvbXBvbmVudHMvU2hpcFZpZXcuanMiLCJzcmMvY29tcG9uZW50cy9Tb25hclZpZXcuanMiLCJzcmMvY29tcG9uZW50cy9TdWJWaWV3LmpzIiwic3JjL3BvbHlmaWxscy5qcyIsInNyYy9zb25hci5qcyIsInNyYy9zdHlsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQy9ZQSxRQUFBLEFBQVE7O0FBRVIsSUFDQyxRQUFRLFFBRFQsQUFDUyxBQUFRO0lBRWhCLE9BQU8sUUFIUixBQUdRLEFBQVE7SUFFZixPQUFPLFFBTFIsQUFLUSxBQUFRO0lBQ2YsVUFBVSxRQU5YLEFBTVcsQUFBUTtJQUNsQixXQUFXLFFBUFosQUFPWSxBQUFRO0lBQ25CLFlBQVksUUFSYixBQVFhLEFBQVE7SUFFcEI7TUFWRCxBQVVTLEFBQ0Y7QUFERSxBQUNQOztJLEFBSUk7Z0JBQ0w7O2NBQUEsQUFBWSxPQUFaLEFBQW1CLFNBQVM7d0JBQUE7O3dHQUFBLEFBQ3JCLEFBQ047O1FBQUEsQUFBSztTQUFRLEFBQ04sQUFDTjtZQUZELEFBQWEsQUFFSCxBQUdWO0FBTGEsQUFDWjs7T0FIMEI7U0FRM0I7Ozs7O3lCLEFBRU0sTyxBQUFPLE9BQU8sQUFDcEI7V0FBUSxNQUFSLEFBQWMsQUFDYjtTQUFBLEFBQUssQUFBRztZQUFPLG9CQUFBLEFBQUMsV0FBUyxPQUFPLEtBQXhCLEFBQU8sQUFBc0IsQUFDckM7U0FBQSxBQUFLLEFBQUc7WUFBTyxvQkFBQSxBQUFDLFFBQUssSUFBTixBQUFTLFFBQU8sT0FBTyxLQUE5QixBQUFPLEFBQTRCLEFBQzNDO1NBQUEsQUFBSyxBQUFHO1lBQU8sb0JBQUEsQUFBQyxZQUFTLFNBQVMsTUFBbkIsQUFBeUIsU0FBUyxPQUFPLEtBQWhELEFBQU8sQUFBOEMsQUFDN0Q7U0FBQSxBQUFLLEFBQUc7WUFBTyxvQkFBQSxBQUFDLGFBQVUsU0FBUyxNQUFwQixBQUEwQixTQUFTLE9BQU8sS0FBakQsQUFBTyxBQUErQyxBQUM5RDtTQUFBLEFBQUssQUFBRztZQUFPLG9CQUFBLEFBQUMsUUFBSyxJQUFOLEFBQVMsT0FBTSxPQUFPLEtBTHRDLEFBS1MsQUFBTyxBQUEyQixBQUUzQzs7Ozs7MEJBRU8sQUFDUDtRQUFBLEFBQUs7VUFDRyxLQUFBLEFBQUssTUFBTCxBQUFXLFNBQVosQUFBcUIsSUFBckIsQUFBMEIsSUFBSSxLQUFBLEFBQUssTUFBTCxBQUFXLE9BRGhELEFBQWMsQUFDeUMsQUFFdkQ7QUFIYyxBQUNiOzs7O21DLEFBSWUsUyxBQUFTLE1BQU0sQUFDL0I7UUFBQSxBQUFLO1VBQ0csS0FBQSxBQUFLLE1BQUwsQUFBVyxTQUFaLEFBQXFCLElBQXJCLEFBQTBCLElBQUksS0FBQSxBQUFLLE1BQUwsQUFBVyxRQUFRLEFBQUMsT0FBRCxBQUFTLElBRG5ELEFBQ3VCLEFBQWdDLEFBQ3BFO2FBRkQsQUFBYyxBQUVKLEFBRVY7QUFKYyxBQUNiOzs7OztFQTdCZSxNLEFBQU07O0FBbUN4QixNQUFBLEFBQU0sT0FBTyxvQkFBQSxBQUFDLEtBQWQsT0FBcUIsU0FBckIsQUFBOEI7Ozs7O0FDcEQ5QjtBQUNBOztBQUNBLE9BQUEsQUFBTyxVQUFVLFVBQUEsQUFBUyxVQUFVLEFBQ25DO0tBQUksUUFBUSxTQUFBLEFBQVMsWUFBckIsQUFBaUM7S0FDaEMsT0FBTyxPQUFBLEFBQU8sb0JBRGYsQUFDUSxBQUEyQjtLQURuQyxBQUVDLEFBQ0Q7UUFBTyxNQUFNLEtBQWIsQUFBYSxBQUFLLE9BQU87TUFBSSxPQUFPLE1BQVAsQUFBTyxBQUFNLFNBQWIsQUFBc0IsY0FBYyxRQUF4QyxBQUFnRCxlQUFlLFNBQUEsQUFBUyxPQUFPLE1BQUEsQUFBTSxLQUFOLEFBQVcsS0FBbkgsQUFBd0YsQUFBZ0IsQUFBZ0I7QUFDeEg7QUFMRDs7Ozs7QUNGQSxJQUNDLFFBQVEsUUFEVCxBQUNTLEFBQVE7SUFDaEIsUUFBUSxRQUZULEFBRVMsQUFBUTs7QUFFakIsT0FBQSxBQUFPLFVBQVUsVUFBQSxBQUFTLE9BQU8sQUFDaEM7UUFDQyxNQUFBLGNBQUEsU0FBSyxPQUFPLE9BQUEsQUFBTyxPQUFQLEFBQWMsSUFBSSxNQUFsQixBQUF3QixNQUFNLEVBQUUsWUFBVyw2QkFBNkIsTUFBN0IsQUFBbUMsUUFBMUYsQUFBWSxBQUE4QixBQUF3RCxBQUMvRixrQ0FGSixBQUNDLEFBQ1MsQUFHVjtBQU5EOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNKQSxJQUNDLFFBQVEsUUFEVCxBQUNTLEFBQVE7SUFDaEIsaUJBQWlCLEtBQUEsQUFBSyxLQUFMLEFBQVUsS0FGNUIsQUFFaUM7O0ksQUFFM0I7Ozs7Ozs7Ozs7O3lCLEFBQ0UsT0FBTyxBQUNiO1VBQ0MsTUFBQSxjQUFBLFNBQUssU0FBTCxBQUFhLFdBQVUsT0FBTyxpQkFBOUIsQUFBK0MsSUFBSSxRQUFuRCxBQUEyRCxJQUFJLE9BQS9ELEFBQXFFLEFBQ3BFLHlCQUFBLGNBQUEsT0FBRyxTQUFVLE1BQUQsQUFBTyxVQUFXLE1BQWxCLEFBQXdCLFVBQXBDLEFBQThDLEFBQzdDO1lBQUEsQUFDUSxBQUNQOztXQUNPLE1BREEsQUFDTSxBQUNaO2tCQUFhLE1BQUEsQUFBTSxXQUFOLEFBQWlCLE1BTGpDLEFBQ0MsQUFFUSxBQUU4QixBQUdyQztBQUxPLEFBQ047QUFGRCxhQUpKLEFBQ0MsQUFDQyxBQVFRLEFBSVY7Ozs7O0VBaEJnQixNLEFBQU07O0FBbUJ4QixPQUFBLEFBQU8sVUFBUCxBQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdkJqQixJQUNDLFFBQVEsUUFEVCxBQUNTLEFBQVE7SUFDaEIsTUFBTSxRQUZQLEFBRU8sQUFBUTtJQUNkLFFBQVEsUUFIVCxBQUdTLEFBQVE7SUFDaEIsaUJBQWlCLEtBQUEsQUFBSyxLQUFMLEFBQVUsS0FKNUIsQUFJaUM7O0ksQUFFM0I7Ozs7Ozs7Ozs7O3lCLEFBQ0UsT0FBTyxBQUNiO09BQUksU0FBUyxDQUFDLElBQUQsQUFBSyxrQkFBbEIsQUFBb0MsQUFDcEM7VUFDQyxNQUFBLGNBQUEsU0FBSyxTQUFMLEFBQWEsV0FBVSxPQUFPLGlCQUE5QixBQUErQyxLQUFLLFFBQXBELEFBQTRELEtBQUssT0FBTyxNQUF4RSxBQUE4RSxBQUM3RSxtQkFBQSxjQUFBLE9BQUcsZUFBVSxBQUFNLFVBQVUsWUFBQTtZQUFNLE1BQUEsQUFBTSxRQUFRLE1BQXBCLEFBQU0sQUFBb0I7QUFBMUMsS0FBQSxHQUFiLEFBQStELEFBQzlEO1lBQ1MsU0FBQSxBQUFTLFdBQVQsQUFBb0IsU0FBcEIsQUFBNkIsa0JBQWtCLElBQS9DLEFBQWlELFVBQWpELEFBQTJELFlBQVksSUFBdkUsQUFBeUUsVUFEbEYsQUFDNEYsQUFDM0Y7O1dBQ08sTUFEQSxBQUNNLEFBQ1o7a0JBQWEsTUFBQSxBQUFNLFdBQU4sQUFBaUIsTUFMakMsQUFDQyxBQUVRLEFBRThCLEFBR3RDO0FBTFEsQUFDTjtBQUZELGFBTUQsY0FBQTtPQUFBLEFBQ0csQUFDRjtPQUZELEFBRUcsQUFDRjttQkFIRCxBQUdhLEFBQ1o7aUJBQVEsQUFBTTtpQkFBVyxBQUNaLEFBQ1o7ZUFGd0IsQUFFZCxBQUNWO1dBQU0sTUFIa0IsQUFHWixBQUNaO2tCQUpPLEFBQWlCLEFBSVg7QUFKVyxBQUN4QixLQURPO2lCQUtKLEFBQ1MsQUFDWjtlQUZHLEFBRU8sQUFDVjtXQUhHLEFBR0csQUFDTjtrQkFiRixBQVNLLEFBSVUsQUFFYjtBQU5HLEFBQ0g7QUFURCxZQVhKLEFBQ0MsQUFDQyxBQVFDLEFBZVEsQUFJWDs7Ozs7RUFoQ3NCLE0sQUFBTTs7QUFtQzlCLE9BQUEsQUFBTyxVQUFQLEFBQWlCOzs7OztBQ3pDakIsSUFDQyxRQUFRLFFBRFQsQUFDUyxBQUFRO0lBRWhCOztTQUNNLEFBQ0csQUFDUDtXQUZJLEFBRUssQUFDVDtrQkFISSxBQUdZLEFBQ2hCO1lBSkksQUFJTSxBQUNWO2dCQU5NLEFBQ0YsQUFLVSxBQUVmO0FBUEssQUFDSjs7dUJBTUssQUFDZ0IsQUFDckI7V0FGSyxBQUVJLEFBQ1Q7WUFISyxBQUdLLEFBQ1Y7Y0FKSyxBQUlPLEFBQ1o7VUFMSyxBQUtHLEFBQ1I7bUJBTkssQUFNWSxBQUNqQjtTQWxCSCxBQUdTLEFBUUQsQUFPRTtBQVBGLEFBQ0w7QUFUTSxBQUNQOztBQWtCRixPQUFBLEFBQU8sVUFBVSxVQUFBLEFBQVMsT0FBTyxBQUNoQztLQUFJLE9BQUosQUFBVztLQUNWLElBQUksQ0FETCxBQUNNLEFBRU47O1FBQU8sRUFBQSxBQUFFLElBQUksTUFBQSxBQUFNLEtBQW5CLEFBQXdCLFFBQVE7T0FBQSxBQUFLLFdBQ3BDLGNBQUE7VUFDUSxNQURSLEFBQ2MsQUFDWjtBQURELEdBREQsUUFFRSxBQUFNLEtBSFQsQUFBZ0MsQUFDL0IsQUFFRSxBQUFXO0FBR2QsU0FDQyxNQUFBLGNBQUEsU0FBSyxPQUFPLE1BQVosQUFBa0IsQUFDaEIsT0FGSCxBQUNDLEFBSUQ7QUFmRDs7Ozs7QUN0QkEsSUFDQyxRQUFRLFFBRFQsQUFDUyxBQUFRO0lBQ2hCLFFBQVEsUUFGVCxBQUVTLEFBQVE7O0FBRWpCLFNBQUEsQUFBUyxVQUFULEFBQW1CLE9BQW5CLEFBQTBCLE9BQTFCLEFBQWlDLFVBQVUsQUFDMUM7S0FBSSxVQUFKLEFBQWM7S0FDYixRQURELEFBQ1MsQUFFVDs7UUFBTyxXQUFXLFNBQVMsTUFBM0IsQUFBaUMsSUFBSTtVQUFBLEFBQVEsV0FDNUMsY0FBQTtVQUNRLE9BQUEsQUFBTyxPQUFQLEFBQWMsSUFBSSxNQUFsQixBQUF3QixjQUFjLEVBQUUsT0FBUSxNQUFBLEFBQU0sU0FBTixBQUFlLFFBQWYsQUFBdUIsV0FBVyxDQUFuQyxBQUFvQyxJQUFwQyxBQUF5Qyw2QkFEaEcsQUFDUSxBQUFzQyxBQUErRSxBQUM1SDtjQUZELEFBRVUsQUFDVDtZQUhELEFBR1UsQUFDUDtBQUhGLEdBREQsT0FERCxBQUFxQyxBQUNwQyxBQUlRO0FBR1QsU0FBUSxNQUFBLGNBQUEsU0FBSyxPQUFPLE1BQVosQUFBa0IsQUFBVSxXQUFwQyxBQUFRLEFBQ1I7OztBQUVELE9BQUEsQUFBTyxVQUFVLFVBQUEsQUFBUyxPQUFPLEFBQ2hDO0tBQUksSUFBSSxNQUFSLEFBQWM7S0FDYixPQURELEFBQ1E7S0FDUCxXQUFXLFNBQVgsQUFBVyxTQUFBLEFBQUMsR0FBRDtTQUFPLE1BQUEsQUFBTSxRQUFRLE9BQU8sRUFBQSxBQUFFLE9BQUYsQUFBUyxRQUFyQyxBQUFPLEFBQWMsQUFBd0I7QUFGekQsQUFJQTs7UUFBTyxLQUFLLE1BQVosQUFBa0IsSUFBSSxBQUNyQjtPQUFBLEFBQUssS0FBSyxVQUFBLEFBQVUsR0FBVixBQUFhLE9BQXZCLEFBQVUsQUFBb0IsQUFDOUI7T0FBQSxBQUFLLEFBQ0w7QUFFRDs7UUFDQyxNQUFBLGNBQUEsU0FBSyxPQUFPLE1BQVosQUFBa0IsQUFDaEIsYUFGSCxBQUNDLEFBSUQ7QUFmRDs7Ozs7QUNuQkEsSUFDQyxRQUFRLFFBRFQsQUFDUyxBQUFRO0lBQ2hCLFFBQVEsUUFGVCxBQUVTLEFBQVE7O0FBRWpCLE9BQUEsQUFBTyxVQUFVLFVBQUEsQUFBUyxPQUFPLEFBQ2hDO1lBQVcsWUFBQTtTQUFNLE1BQU4sQUFBTSxBQUFNO0FBQXZCLElBQUEsQUFBZ0MsQUFDaEM7UUFDQyxNQUFBLGNBQUEsU0FBSyxPQUFPLE1BQVosQUFBa0IsQUFDakIsMkNBQUssS0FBTCxBQUFTLHVCQUFzQixPQUFPLE1BRHZDLEFBQ0MsQUFBNEMsQUFDNUMsY0FBQSxjQUFBLE1BQUssNEJBQXNCLE1BQXRCLEFBQTRCLEtBSG5DLEFBQ0MsQUFFQyxBQUFzQyxBQUd4QztBQVJEOzs7OztBQ0pBLElBQ0MsUUFBUSxRQURULEFBQ1MsQUFBUTtJQUNoQixZQUFZLFFBRmIsQUFFYSxBQUFROztBQUVyQixPQUFBLEFBQU8sVUFBVSxVQUFBLEFBQVMsT0FBVCxBQUFnQixPQUFPLEFBQ3ZDO1FBQ0MsTUFBQSxjQUFBLFNBQUssT0FBTCxBQUFXLEFBQ1YsaUVBQUEsQUFBQyxhQUFVLE1BQVgsQUFBZ0IsS0FBSSxJQUFwQixBQUF1QixXQUFVLElBQWpDLEFBQW9DLFdBQVUsVUFBVyxNQUFBLEFBQU0sYUFBL0QsQUFBNEUsS0FBTSxTQUFTLE1BRDVGLEFBQ0MsQUFBaUcsQUFDakcsaUNBQUEsQUFBQyxhQUFVLE1BQVgsQUFBZ0IsS0FBSSxJQUFwQixBQUF1QixXQUFVLElBQWpDLEFBQW9DLFdBQVUsVUFBVyxNQUFBLEFBQU0sYUFBL0QsQUFBNEUsS0FBTSxTQUFTLE1BRjVGLEFBRUMsQUFBaUcsQUFDakcsaUNBQUEsQUFBQyxhQUFVLE1BQVgsQUFBZ0IsS0FBSSxJQUFwQixBQUF1QixXQUFVLElBQWpDLEFBQW9DLFdBQVUsVUFBVyxNQUFBLEFBQU0sYUFBL0QsQUFBNEUsS0FBTSxTQUFTLE1BSDVGLEFBR0MsQUFBaUcsQUFDakcsaUNBQUEsQUFBQyxhQUFVLE1BQVgsQUFBZ0IsS0FBSSxJQUFwQixBQUF1QixXQUFVLElBQWpDLEFBQW9DLFdBQVUsVUFBVyxNQUFBLEFBQU0sYUFBL0QsQUFBNEUsS0FBTSxTQUFTLE1BTDdGLEFBQ0MsQUFJQyxBQUFpRyxBQUduRztBQVREOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNKQSxJQUNDLFFBQVEsUUFEVCxBQUNTLEFBQVE7SUFFaEIsT0FBTyxRQUhSLEFBR1EsQUFBUTtJQUVmLGlCQUFpQixRQUxsQixBQUtrQixBQUFRO0lBQ3pCLE9BQU8sUUFOUixBQU1RLEFBQVE7SUFDZixRQUFRLFFBUFQsQUFPUyxBQUFROztJLEFBRVg7cUJBQ0w7O21CQUFBLEFBQVksT0FBWixBQUFtQixTQUFTO3dCQUFBOztrSEFBQSxBQUNyQixBQUNOOztRQUFBLEFBQUs7Y0FBTCxBQUFhLEFBQ0QsQUFHWjtBQUphLEFBQ1o7O09BSDBCO1NBTzNCOzs7Ozt5QixBQUVNLE8sQUFBTyxPQUFPLEFBQ3BCO1VBQ0MsTUFBQSxjQUFBLGFBQVMsT0FBTyxNQUFoQixBQUFzQixBQUNyQixvQkFBQyxjQUFELFFBQU0sT0FBTixBQUFZLEFBQ1gsbUJBQUEsY0FBQSxNQUFBLE1BREQsQUFDQyxBQUNBLGtDQUFBLEFBQUMsa0JBQWUsVUFBVSxDQUFDLE1BQTNCLEFBQTBCLEFBQU8sWUFBWSxNQUE3QyxBQUFtRCxHQUFHLElBQXRELEFBQTBELElBQUksU0FBUyxLQUh6RSxBQUNDLEFBRUMsQUFBNEUsQUFFN0UsMkJBQUEsY0FBQTtXQUNRLE1BRFIsQUFDYyxBQUNiO2FBQVMsS0FGVixBQUVlLEFBQ1o7QUFGRixXQUVFLEFBQUssTUFBTCxBQUFXLGNBQVosQUFBMEIsSUFBMUIsQUFBK0IsU0FUbkMsQUFDQyxBQUtDLEFBRzBDLEFBRzVDOzs7O2tDLEFBRWUsR0FBRyxBQUNsQjtPQUFJLEtBQUEsQUFBSyxNQUFMLEFBQVcsY0FBZixBQUE2QixHQUFHLEtBQUEsQUFBSyxTQUFTLEVBQUMsV0FBZixBQUFjLEFBQVksQUFDMUQ7Ozs7OEJBRVcsQUFDWDtRQUFBLEFBQUssTUFBTCxBQUFXLE1BQ1YsS0FBQSxBQUFLLE1BQUwsQUFBVyxRQUFRLEtBQUEsQUFBSyxNQUF4QixBQUE4QixXQUFZLEtBQUEsQUFBSyxNQUFMLEFBQVcsY0FEdEQsQUFDQyxBQUFtRSxHQURwRSxBQUN3RSxBQUV4RTs7Ozs7O0VBakNxQixNLEFBQU07O0FBb0M3QixPQUFBLEFBQU8sVUFBUCxBQUFpQjs7Ozs7QUM3Q2pCLElBQ0MsUUFBUSxRQURULEFBQ1MsQUFBUTtJQUVoQixPQUFPLFFBSFIsQUFHUSxBQUFRO0lBRWYsWUFBWSxRQUxiLEFBS2EsQUFBUTtJQUNwQixhQUFhLFFBTmQsQUFNYyxBQUFRO0lBQ3JCLE9BQU8sUUFQUixBQU9RLEFBQVE7SUFDZixRQUFRLFFBUlQsQUFRUyxBQUFRO0lBRWhCLFFBQVEsUUFWVCxBQVVTLEFBQVE7O0FBRWpCLFNBQUEsQUFBUyxVQUFULEFBQW1CLE9BQU8sQUFDekI7S0FBSTtLQUFPLEFBQ04sQUFDSDtLQUZTLEFBRU4sQUFDSDtLQUhTLEFBR04sQUFDSDtLQUpTLEFBSU4sQUFDSDtLQUxTLEFBS04sQUFDSDtLQU5GLEFBQVcsQUFNTjtBQU5NLEFBQ1Q7S0FERixBQVFDLEFBRUQ7O1FBQU8sSUFBSSxNQUFYLEFBQVcsQUFBTSxPQUFPO09BQUssRUFBTCxBQUFLLEFBQUUsSUFBUCxBQUFXLEtBQUssT0FBTyxFQUEvQyxBQUF3QixBQUFnQixBQUFPLEFBQUU7QUFFakQsT0FBQSxBQUFLLEVBQUwsQUFBTyxBQUNQO01BQUEsQUFBSyxFQUFMLEFBQU8sQUFDUDtNQUFBLEFBQUssRUFBTCxBQUFPLEFBQ1A7TUFBQSxBQUFLLEVBQUwsQUFBTyxBQUNQO01BQUEsQUFBSyxFQUFMLEFBQU8sQUFDUDtNQUFBLEFBQUssRUFBTCxBQUFPLEFBRVA7O1FBQUEsQUFBTyxBQUNQOzs7QUFFRCxPQUFBLEFBQU8sVUFBVSxVQUFBLEFBQVMsT0FBVCxBQUFnQixPQUFPLEFBQ3ZDO0tBQUksT0FBTyxVQUFVLE1BQXJCLEFBQVcsQUFBZ0I7S0FDMUIsUUFERCxBQUNTLEFBRVQ7O0tBQUksS0FBQSxBQUFLLEVBQVQsQUFBVyxRQUFRLE1BQUEsQUFBTSxLQUN4QixNQUFDLGNBQUQsUUFBTSxPQUFPLE1BQUEsQUFBTSxpQkFBbkIsQUFBYSxBQUF1QixBQUNuQyw0QkFBQSxBQUFDLGFBQVUsTUFBWCxBQUFnQixLQUFJLFVBQXBCLEFBQTZCLFFBQU8sSUFBSSxNQUFBLEFBQU0saUJBQTlDLEFBQXdDLEFBQXVCLE1BQU0sSUFEdEUsQUFDQyxBQUF3RSxBQUN4RSxrQ0FBQSxBQUFDLGNBQVcsTUFBTSxLQUhELEFBQ2xCLEFBRUMsQUFBdUIsQUFJekI7O0tBQUksS0FBQSxBQUFLLEVBQVQsQUFBVyxRQUFRLE1BQUEsQUFBTSxLQUN4QixNQUFDLGNBQUQsUUFBTSxPQUFPLE1BQUEsQUFBTSxpQkFBbkIsQUFBYSxBQUF1QixBQUNuQyw0QkFBQSxBQUFDLGFBQVUsTUFBWCxBQUFnQixLQUFJLFVBQXBCLEFBQTZCLFFBQU8sSUFBSSxNQUFBLEFBQU0saUJBQTlDLEFBQXdDLEFBQXVCLE1BQU0sSUFEdEUsQUFDQyxBQUF3RSxBQUN4RSxrQ0FBQSxBQUFDLGNBQVcsTUFBTSxLQUhELEFBQ2xCLEFBRUMsQUFBdUIsQUFJekI7O0tBQUksS0FBQSxBQUFLLEVBQVQsQUFBVyxRQUFRLE1BQUEsQUFBTSxLQUN4QixNQUFDLGNBQUQsUUFBTSxPQUFPLE1BQUEsQUFBTSxpQkFBbkIsQUFBYSxBQUF1QixBQUNuQyw0QkFBQSxBQUFDLGFBQVUsTUFBWCxBQUFnQixLQUFJLFVBQXBCLEFBQTZCLFFBQU8sSUFBSSxNQUFBLEFBQU0saUJBQTlDLEFBQXdDLEFBQXVCLE1BQU0sSUFEdEUsQUFDQyxBQUF3RSxBQUN4RSxrQ0FBQSxBQUFDLGNBQVcsTUFBTSxLQUhELEFBQ2xCLEFBRUMsQUFBdUIsQUFJekI7O0tBQUksS0FBQSxBQUFLLEVBQVQsQUFBVyxRQUFRLE1BQUEsQUFBTSxLQUN4QixNQUFDLGNBQUQsUUFBTSxPQUFPLE1BQUEsQUFBTSxpQkFBbkIsQUFBYSxBQUF1QixBQUNuQyw0QkFBQSxBQUFDLGFBQVUsTUFBWCxBQUFnQixLQUFJLFVBQXBCLEFBQTZCLFFBQU8sSUFBSSxNQUFBLEFBQU0saUJBQTlDLEFBQXdDLEFBQXVCLE1BQU0sSUFEdEUsQUFDQyxBQUF3RSxBQUN4RSxrQ0FBQSxBQUFDLGNBQVcsTUFBTSxLQUhELEFBQ2xCLEFBRUMsQUFBdUIsQUFJekI7O0tBQUksS0FBQSxBQUFLLEVBQVQsQUFBVyxRQUFRLE1BQUEsQUFBTSxLQUN4QixNQUFDLGNBQUQsUUFBTSxPQUFOLEFBQVksQUFDWCxtQkFBQSxjQUFBLE1BQUEsTUFERCxBQUNDLEFBQ0EsOEJBQUEsQUFBQyxjQUFXLE1BQU0sS0FIRCxBQUNsQixBQUVDLEFBQXVCLEFBSXpCOztLQUFJLEtBQUEsQUFBSyxFQUFULEFBQVcsUUFBUSxNQUFBLEFBQU0sS0FDeEIsTUFBQyxjQUFELFFBQU0sT0FBTixBQUFZLEFBQ1gsbUJBQUEsY0FBQSxNQUFBLE1BREQsQUFDQyxBQUNBLDhCQUFBLEFBQUMsY0FBVyxNQUFNLEtBSEQsQUFDbEIsQUFFQyxBQUF1QixBQUl6Qjs7UUFDQyxNQUFBLGNBQUEsYUFBUyxPQUFPLE1BQWhCLEFBQXNCLEFBQ3BCLGNBREYsQUFFQyxhQUFBLGNBQUEsWUFBUSxPQUFPLE1BQWYsQUFBcUIsYUFBYSxTQUFTLG1CQUFBO1VBQU0sTUFBTixBQUFNLEFBQU07QUFBdkQsT0FIRixBQUNDLEFBRUMsQUFHRjtBQXBERDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDbkNBLElBQ0MsUUFBUSxRQURULEFBQ1MsQUFBUTtJQUVoQixPQUFPLFFBSFIsQUFHUSxBQUFRO0lBRWYsT0FBTyxRQUxSLEFBS1EsQUFBUTtJQUNmLG1CQUFtQixRQU5wQixBQU1vQixBQUFRO0lBQzNCLGlCQUFpQixRQVBsQixBQU9rQixBQUFRO0lBQ3pCLFFBQVEsUUFSVCxBQVFTLEFBQVE7SUFFaEIsUUFBUSxRQVZULEFBVVMsQUFBUzs7SSxBQUVaO29CQUNMOztrQkFBQSxBQUFZLE9BQVosQUFBbUIsU0FBUzt3QkFBQTs7Z0hBQUEsQUFDckIsQUFFTjs7UUFBQSxBQUFLO2FBQVEsQUFDRixBQUNWO2tCQUZZLEFBRUcsQUFDZjtTQUhZLEFBR04sQUFDTjtTQUpZLEFBSU4sQUFDTjtVQUxZLEFBS0wsQUFDUDtVQU5ZLEFBTUwsQUFDUDtZQVBELEFBQWEsQUFPSCxBQUdWO0FBVmEsQUFDWjs7T0FKMEI7U0FjM0I7Ozs7O3lCLEFBRU0sTyxBQUFPLE9BQU8sQUFDcEI7T0FBSSxVQUFXLE1BQUEsQUFBTSxTQUFOLEFBQWtCLGFBQzNCLE1BQUEsQUFBTSxTQURHLEFBQ1MsYUFDbEIsTUFBQSxBQUFNLFVBRkcsQUFFUyxhQUNsQixNQUFBLEFBQU0sVUFIRyxBQUdTLGFBQ2xCLE1BQUEsQUFBTSxZQUpaLEFBSXdCLEFBQ3hCO1VBQ0MsTUFBQSxjQUFBLGFBQVMsT0FBTyxNQUFoQixBQUFzQixBQUNyQixvQkFBQyxjQUFELFFBQU0sT0FBTyxNQUFiLEFBQW1CLEFBQ2xCLHFDQUFBLEFBQUMsb0JBQWlCLFVBQVUsTUFBNUIsQUFBa0MsVUFBVSxVQUFVLEtBRHZELEFBQ0MsQUFBMkQsQUFDM0QsdUNBQUEsQUFBQyxrQkFBZSxJQUFJLE1BQXBCLEFBQTBCLGVBQWUsVUFBVSxDQUFDLEtBQUEsQUFBSyxNQUFOLEFBQVksTUFBTSxLQUFBLEFBQUssTUFBMUUsQUFBbUQsQUFBNkIsT0FBTyxNQUF2RixBQUE2RixHQUFHLElBQWhHLEFBQW9HLEdBQUcsU0FBUyxLQUhsSCxBQUNDLEFBRUMsQUFBcUgsQUFFdEgsMEJBQUMsY0FBRCxRQUFNLE9BQU4sQUFBWSxBQUNYLG1CQUFBLGNBQUEsTUFBQSxNQURELEFBQ0MsQUFDQSw4QkFBQSxBQUFDLGtCQUFlLFVBQVUsQ0FBQyxNQUEzQixBQUEwQixBQUFPLFFBQVEsTUFBekMsQUFBK0MsR0FBRyxJQUFsRCxBQUFzRCxHQUFHLFNBQVMsS0FQcEUsQUFLQyxBQUVDLEFBQXVFLEFBRXhFLHVCQUFDLGNBQUQsUUFBTSxPQUFOLEFBQVksQUFDWCxtQkFBQSxjQUFBLE1BQUEsTUFERCxBQUNDLEFBQ0EsOEJBQUEsQUFBQyxrQkFBZSxVQUFVLENBQUMsTUFBM0IsQUFBMEIsQUFBTyxRQUFRLE1BQXpDLEFBQStDLEdBQUcsSUFBbEQsQUFBc0QsR0FBRyxTQUFTLEtBWHBFLEFBU0MsQUFFQyxBQUF1RSxBQUV4RSx1QkFBQyxjQUFELFFBQU0sT0FBTixBQUFZLEFBQ1gsbUJBQUEsY0FBQSxNQUFBLE1BREQsQUFDQyxBQUNBLGdDQUFBLEFBQUMsa0JBQWUsVUFBVSxDQUFDLE1BQTNCLEFBQTBCLEFBQU8sVUFBVSxNQUEzQyxBQUFpRCxHQUFHLElBQXBELEFBQXdELElBQUksU0FBUyxLQWZ2RSxBQWFDLEFBRUMsQUFBMEUsQUFFM0UseUJBQUEsY0FBQTtXQUNTLFVBQVUsTUFBVixBQUFnQixpQkFBaUIsTUFEMUMsQUFDZ0QsQUFDL0M7YUFBUyxLQUZWLEFBRWUsQUFDZDtjQUhELEFBR1c7QUFGVixNQW5CSCxBQUNDLEFBaUJDLEFBT0Y7Ozs7aUMsQUFFYyxHQUFHLEFBQ2pCO1FBQUEsQUFBSztjQUFTLEFBQ0gsQUFDVjttQkFBZSxNQUFBLEFBQU0saUJBRnRCLEFBQWMsQUFFRSxBQUF1QixBQUV2QztBQUpjLEFBQ2I7Ozs7aUMsQUFLYSxHQUFHLEFBQ2pCO09BQUk7VUFDRyxLQUFBLEFBQUssTUFEQSxBQUNNLEFBQ2pCO1VBQU0sS0FBQSxBQUFLLE1BRlosQUFBWSxBQUVNLEFBR2xCO0FBTFksQUFDWDs7T0FJRyxNQUFBLEFBQU0sU0FBVixBQUFtQixHQUFHLE1BQUEsQUFBTSxPQUE1QixBQUFzQixBQUFhLGVBQzlCLElBQUksTUFBQSxBQUFNLFNBQVYsQUFBbUIsR0FBRyxNQUFBLEFBQU0sT0FBNUIsQUFBc0IsQUFBYSxlQUNuQyxJQUFJLE1BQUEsQUFBTSxTQUFWLEFBQW1CLFdBQVcsTUFBQSxBQUFNLE9BQXBDLEFBQThCLEFBQWEsT0FDM0MsSUFBSSxNQUFBLEFBQU0sUUFBVixBQUFrQixXQUFXLE1BQUEsQUFBTSxPQUFOLEFBQWEsQUFFL0M7O1FBQUEsQUFBSyxTQUFMLEFBQWMsQUFDZDs7Ozs4QixBQUVXLEdBQUcsQUFDZDtPQUFJLEtBQUEsQUFBSyxNQUFMLEFBQVcsVUFBZixBQUF5QixHQUFHLEtBQUEsQUFBSyxTQUFTLEVBQUMsT0FBZixBQUFjLEFBQVEsQUFDbEQ7Ozs7OEIsQUFFVyxHQUFHLEFBQ2Q7T0FBSSxLQUFBLEFBQUssTUFBTCxBQUFXLFVBQWYsQUFBeUIsR0FBRyxLQUFBLEFBQUssU0FBUyxFQUFDLE9BQWYsQUFBYyxBQUFRLEFBQ2xEOzs7O2dDLEFBRWEsR0FBRyxBQUNoQjtPQUFJLEtBQUEsQUFBSyxNQUFMLEFBQVcsWUFBZixBQUEyQixHQUFHLEtBQUEsQUFBSyxTQUFTLEVBQUMsU0FBZixBQUFjLEFBQVUsQUFDdEQ7Ozs7OEJBRVcsQUFDWDtRQUFBLEFBQUssTUFBTCxBQUFXLE1BQ1YsTUFBQSxBQUFNLFNBQVMsS0FBQSxBQUFLLE1BQUwsQUFBVyxXQUFXLEtBQUEsQUFBSyxNQUExQyxBQUFnRCxNQUFNLEtBQUEsQUFBSyxNQUFMLEFBQVcsV0FBVyxLQUFBLEFBQUssTUFBakYsQUFBdUYsTUFBTSxNQUFNLEtBQUEsQUFBSyxNQUF4RyxBQUE4RyxPQUFPLE1BQU0sS0FBQSxBQUFLLE1BQWhJLEFBQXNJLE9BQU8sS0FBQSxBQUFLLE1BRG5KLEFBQ0MsQUFBd0osQUFFeko7Ozs7O0VBdkZvQixNLEFBQU07O0FBMEY1QixPQUFBLEFBQU8sVUFBUCxBQUFpQjs7Ozs7QUN0R2pCO0FBQ0E7QUFDQTs7QUFDQSxJQUFJLE9BQU8sT0FBUCxBQUFjLFVBQWxCLEFBQTRCLFlBQVksQUFDdkM7UUFBQSxBQUFPLFNBQVMsVUFBQSxBQUFTLFFBQVQsQUFBaUIsU0FBUyxBQUFFO0FBQzNDO0FBQ0E7O01BQUksVUFBSixBQUFjLE1BQU0sQUFBRTtBQUNyQjtTQUFNLElBQUEsQUFBSSxVQUFWLEFBQU0sQUFBYyxBQUNwQjtBQUVEOztNQUFJLEtBQUssT0FBVCxBQUFTLEFBQU8sQUFFaEI7O09BQUssSUFBSSxRQUFULEFBQWlCLEdBQUcsUUFBUSxVQUE1QixBQUFzQyxRQUF0QyxBQUE4QyxTQUFTLEFBQ3REO09BQUksYUFBYSxVQUFqQixBQUFpQixBQUFVLEFBRTNCOztPQUFJLGNBQUosQUFBa0IsTUFBTSxBQUFFO0FBQ3pCO1NBQUssSUFBTCxBQUFTLFdBQVQsQUFBb0IsWUFBWSxBQUMvQjtBQUNBO1NBQUksT0FBQSxBQUFPLFVBQVAsQUFBaUIsZUFBakIsQUFBZ0MsS0FBaEMsQUFBcUMsWUFBekMsQUFBSSxBQUFpRCxVQUFVLEFBQzlEO1NBQUEsQUFBRyxXQUFXLFdBQWQsQUFBYyxBQUFXLEFBQ3pCO0FBQ0Q7QUFDRDtBQUNEO0FBQ0Q7U0FBQSxBQUFPLEFBQ1A7QUFyQkQsQUFzQkE7Ozs7OztBQzFCRCxTQUFBLEFBQVMsWUFBWSxBQUNwQjtRQUFPLENBQUEsQUFDTixNQURNLEFBRU4sTUFGTSxBQUdOLE1BSE0sQUFJTixNQUpNLEFBS04sTUFMTSxBQU1OLE1BTk0sQUFPTixNQVBNLEFBUU4sTUFSTSxBQVNOLE1BVE0sQUFVTixNQVZNLEFBV04sTUFYTSxBQVlOLE1BWk0sQUFhTixNQWJNLEFBY04sTUFkTSxBQWVOLE1BZk0sQUFnQk4sTUFoQk0sQUFpQk4sTUFqQk0sQUFrQk4sTUFsQk0sQUFtQk4sTUFuQk0sQUFvQk4sTUFwQk0sQUFxQk4sTUFyQk0sQUFzQk4sTUF0Qk0sQUF1Qk4sTUF2Qk0sQUF3Qk4sTUF4Qk0sQUF5Qk4sTUF6Qk0sQUEwQk4sTUExQk0sQUEyQk4sTUEzQk0sQUE0Qk4sTUE1Qk0sQUE2Qk4sTUE3Qk0sQUE4Qk4sTUE5Qk0sQUErQk4sTUEvQk0sQUFnQ04sTUFoQ00sQUFpQ04sTUFqQ00sQUFrQ04sTUFsQ00sQUFtQ04sTUFuQ00sQUFvQ04sTUFwQ00sQUFxQ04sTUFyQ00sQUFzQ04sTUF0Q00sQUF1Q04sTUF2Q00sQUF3Q04sTUF4Q00sQUF5Q04sTUF6Q00sQUEwQ04sTUExQ00sQUEyQ04sTUEzQ00sQUE0Q04sTUE1Q00sQUE2Q04sTUE3Q00sQUE4Q04sTUE5Q00sQUErQ04sTUEvQ00sQUFnRE4sTUFoRE0sQUFpRE4sTUFqREQsQUFBTyxBQWtETixBQUVEOzs7QUFFRCxTQUFBLEFBQVMsbUJBQVQsQUFBNEIsTUFBTSxBQUNqQztLQUFBLEFBQUssTUFBTCxBQUFXLEdBQVgsQUFBYyxBQUVkOztLQUFJLEtBQUosQUFBUyxBQUNUO1FBQUEsQUFBTSxHQUFHLEFBQ1I7TUFBSyxLQUFBLEFBQUssV0FBTixBQUFpQixPQUFyQixBQUE2QixBQUU3Qjs7U0FBTyxLQUFQLEFBQU8sQUFBSyxBQUNaO09BQUEsQUFBSyxLQUFLLEtBQVYsQUFBVSxBQUFLLEFBQ2Y7T0FBQSxBQUFLLEtBQUwsQUFBVSxBQUNWO0FBQ0Q7OztBQUVELFNBQUEsQUFBUyxRQUFULEFBQWlCLE1BQWpCLEFBQXVCLE9BQU8sQUFDN0I7UUFBQSxBQUFPLFNBQVM7cUJBQWhCLEFBQWdCLEFBQW1CO0FBQ25DOzs7QUFFRCxTQUFBLEFBQVMsVUFBVCxBQUFtQixXQUFXLEFBQzdCO1FBQU8sWUFBWSxLQUFuQixBQUF3QixRQUFRO09BQWhDLEFBQWdDLEFBQUs7QUFDckMsU0FBQSxBQUFPLEFBQ1A7OztBQUVELFNBQUEsQUFBUyxTQUFULEFBQWtCLE1BQWxCLEFBQXdCLE1BQXhCLEFBQThCLE9BQTlCLEFBQXFDLE9BQXJDLEFBQTRDLFNBQVMsQUFDcEQ7S0FBSSxPQUFKLEFBQVc7S0FDVixRQURELEFBQ1M7S0FEVCxBQUVDLEFBRUQ7O0tBQUksS0FBQSxBQUFLLFFBQVQsQUFBSSxBQUFhLEFBQ2pCO0tBQUksTUFBTSxDQUFWLEFBQVcsR0FBRyxNQUFBLEFBQU0sS0FBSyxLQUFBLEFBQUssT0FBTCxBQUFZLEdBQVosQUFBZSxHQUF4QyxBQUFjLEFBQVcsQUFBa0IsU0FDdEMsTUFBTSxlQUFBLEFBQWUsT0FBckIsQUFBNEIsQUFFakM7O0tBQUksS0FBQSxBQUFLLFFBQVQsQUFBSSxBQUFhLEFBQ2pCO0tBQUksTUFBTSxDQUFWLEFBQVcsR0FBRyxNQUFBLEFBQU0sS0FBSyxLQUFBLEFBQUssT0FBTCxBQUFZLEdBQVosQUFBZSxHQUF4QyxBQUFjLEFBQVcsQUFBa0IsU0FDdEMsTUFBTSxlQUFBLEFBQWUsT0FBckIsQUFBNEIsQUFFakM7O0tBQUksS0FBQSxBQUFLLFFBQVQsQUFBSSxBQUFhLEFBQ2pCO0tBQUksTUFBTSxDQUFWLEFBQVcsR0FBRyxNQUFBLEFBQU0sS0FBSyxLQUFBLEFBQUssT0FBTCxBQUFZLEdBQVosQUFBZSxHQUF4QyxBQUFjLEFBQVcsQUFBa0IsU0FDdEMsTUFBTSxZQUFBLEFBQVksUUFBbEIsQUFBMEIsQUFFL0I7O0tBQUksS0FBQSxBQUFLLFFBQVQsQUFBSSxBQUFhLEFBQ2pCO0tBQUksTUFBTSxDQUFWLEFBQVcsR0FBRyxNQUFBLEFBQU0sS0FBSyxLQUFBLEFBQUssT0FBTCxBQUFZLEdBQVosQUFBZSxHQUF4QyxBQUFjLEFBQVcsQUFBa0IsU0FDdEMsTUFBTSxZQUFBLEFBQVksUUFBbEIsQUFBMEIsQUFFL0I7O1NBQUEsQUFBUSxNQUFSLEFBQWMsQUFFZDs7UUFBQSxBQUFPLFdBQVcsQUFDakI7TUFBSyxLQUFBLEFBQUssV0FBVyxLQUFqQixBQUFzQixVQUExQixBQUFxQyxBQUNyQztRQUFBLEFBQU0sS0FBSyxLQUFBLEFBQUssT0FBTCxBQUFZLEdBQVosQUFBZSxHQUExQixBQUFXLEFBQWtCLEFBQzdCO0FBRUQ7O1NBQUEsQUFBUSxPQUFSLEFBQWUsQUFFZjs7UUFBTyxVQUFBLEFBQVUsS0FBakIsQUFBTyxBQUFlLEFBQ3RCOzs7QUFFRCxTQUFBLEFBQVMsaUJBQVQsQUFBMEIsR0FBRyxBQUM1QjtTQUFBLEFBQVEsQUFDUDtPQUFBLEFBQUssQUFBSztVQUFBLEFBQU8sQUFDakI7T0FBQSxBQUFLLEFBQUs7VUFBQSxBQUFPLEFBQ2pCO09BQUEsQUFBSyxBQUFLO1VBQUEsQUFBTyxBQUNqQjtPQUFBLEFBQUssQUFBSztVQUpYLEFBSVcsQUFBTyxBQUVsQjs7OztBQUVELE9BQUEsQUFBTyxVQUFVLEVBQUUsVUFBRixBQUFZLFVBQVUsa0JBQXZDLEFBQWlCLEFBQXdDOzs7OztBQ3ZIekQsT0FBQSxBQUFPOztXQUNNLEFBQ0YsQUFDVDtpQkFGVyxBQUVJLEFBQ2Y7a0JBSFcsQUFHSyxBQUNoQjtjQUxlLEFBQ0osQUFJQyxBQUViO0FBTlksQUFDWDs7U0FLWSxBQUNMLEFBQ1A7VUFGWSxBQUVKLEFBQ1I7Y0FIWSxBQUdBLEFBQ1o7WUFKWSxBQUlGLEFBQ1Y7VUFMWSxBQUtKLEFBQ1I7V0FOWSxBQU1ILEFBQ1Q7U0FQWSxBQU9MLEFBQ1A7bUJBZmUsQUFPSCxBQVFLLEFBRWxCO0FBVmEsQUFDWjs7U0FTZSxBQUNSLEFBQ1A7VUFGZSxBQUVQLEFBQ1I7Y0FIZSxBQUdILEFBQ1o7WUFKZSxBQUlMLEFBQ1Y7VUFMZSxBQUtQLEFBQ1I7V0FOZSxBQU1OLEFBQ1Q7U0FQZSxBQU9SLEFBQ1A7bUJBekJlLEFBaUJBLEFBUUUsQUFFbEI7QUFWZ0IsQUFDZjs7Y0FTVSxBQUNFLEFBQ1o7ZUFGVSxBQUVHLEFBQ2I7U0FIVSxBQUdILEFBQ1A7V0FKVSxBQUlELEFBQ1Q7a0JBTFUsQUFLTSxBQUNoQjtjQU5VLEFBTUUsQUFDWjtZQVBVLEFBT0EsQUFDVjtnQkFuQ2UsQUEyQkwsQUFRSSxBQUVmO0FBVlcsQUFDVjs7U0FTUSxBQUNELEFBQ1A7V0FGUSxBQUVDLEFBQ1Q7a0JBSFEsQUFHUSxBQUNoQjtjQXpDZSxBQXFDUCxBQUlJLEFBRWI7QUFOUyxBQUNSOztVQUthLEFBQ0wsQUFDUjtXQUZhLEFBRUosQUFDVDtZQUhhLEFBR0gsQUFDVjtjQUphLEFBSUQsQUFDWjtVQUxhLEFBS0wsQUFDUjttQkFqRGUsQUEyQ0YsQUFNSSxBQUVsQjtBQVJjLEFBQ2I7O1dBT1UsQUFDRCxBQUNUO2FBRlUsQUFFQyxBQUNYO2NBSFUsQUFHRSxBQUNaO2VBSlUsQUFJRyxBQUNiO2NBTFUsQUFLRSxBQUNaO1lBTlUsQUFNQSxBQUNWO1NBUFUsQUFPSCxBQUNQO1VBM0RlLEFBbURMLEFBUUYsQUFFVDtBQVZXLEFBQ1Y7O2dCQVNLLEFBQ1MsQUFDZDtTQUZLLEFBRUUsQUFDUDtnQkFISyxBQUdTLEFBQ2Q7V0FKSyxBQUlJLEFBQ1Q7aUJBTEssQUFLVSxBQUNmO2NBTkssQUFNTyxBQUNaO2tCQVBLLEFBT1csQUFDaEI7WUFyRWUsQUE2RFYsQUFRSyxBQUVYO0FBVk0sQUFDTDs7U0FTSSxBQUNHLEFBQ1A7VUF6RUYsQUFBaUIsQUF1RVgsQUFFSTtBQUZKLEFBQ0o7QUF4RWUsQUFDaEIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiIWZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBmdW5jdGlvbiBWTm9kZSgpIHt9XG4gICAgZnVuY3Rpb24gaChub2RlTmFtZSwgYXR0cmlidXRlcykge1xuICAgICAgICB2YXIgbGFzdFNpbXBsZSwgY2hpbGQsIHNpbXBsZSwgaSwgY2hpbGRyZW4gPSBFTVBUWV9DSElMRFJFTjtcbiAgICAgICAgZm9yIChpID0gYXJndW1lbnRzLmxlbmd0aDsgaS0tID4gMjsgKSBzdGFjay5wdXNoKGFyZ3VtZW50c1tpXSk7XG4gICAgICAgIGlmIChhdHRyaWJ1dGVzICYmIG51bGwgIT0gYXR0cmlidXRlcy5jaGlsZHJlbikge1xuICAgICAgICAgICAgaWYgKCFzdGFjay5sZW5ndGgpIHN0YWNrLnB1c2goYXR0cmlidXRlcy5jaGlsZHJlbik7XG4gICAgICAgICAgICBkZWxldGUgYXR0cmlidXRlcy5jaGlsZHJlbjtcbiAgICAgICAgfVxuICAgICAgICB3aGlsZSAoc3RhY2subGVuZ3RoKSBpZiAoKGNoaWxkID0gc3RhY2sucG9wKCkpICYmIHZvaWQgMCAhPT0gY2hpbGQucG9wKSBmb3IgKGkgPSBjaGlsZC5sZW5ndGg7IGktLTsgKSBzdGFjay5wdXNoKGNoaWxkW2ldKTsgZWxzZSB7XG4gICAgICAgICAgICBpZiAoY2hpbGQgPT09ICEwIHx8IGNoaWxkID09PSAhMSkgY2hpbGQgPSBudWxsO1xuICAgICAgICAgICAgaWYgKHNpbXBsZSA9ICdmdW5jdGlvbicgIT0gdHlwZW9mIG5vZGVOYW1lKSBpZiAobnVsbCA9PSBjaGlsZCkgY2hpbGQgPSAnJzsgZWxzZSBpZiAoJ251bWJlcicgPT0gdHlwZW9mIGNoaWxkKSBjaGlsZCA9IFN0cmluZyhjaGlsZCk7IGVsc2UgaWYgKCdzdHJpbmcnICE9IHR5cGVvZiBjaGlsZCkgc2ltcGxlID0gITE7XG4gICAgICAgICAgICBpZiAoc2ltcGxlICYmIGxhc3RTaW1wbGUpIGNoaWxkcmVuW2NoaWxkcmVuLmxlbmd0aCAtIDFdICs9IGNoaWxkOyBlbHNlIGlmIChjaGlsZHJlbiA9PT0gRU1QVFlfQ0hJTERSRU4pIGNoaWxkcmVuID0gWyBjaGlsZCBdOyBlbHNlIGNoaWxkcmVuLnB1c2goY2hpbGQpO1xuICAgICAgICAgICAgbGFzdFNpbXBsZSA9IHNpbXBsZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcCA9IG5ldyBWTm9kZSgpO1xuICAgICAgICBwLm5vZGVOYW1lID0gbm9kZU5hbWU7XG4gICAgICAgIHAuY2hpbGRyZW4gPSBjaGlsZHJlbjtcbiAgICAgICAgcC5hdHRyaWJ1dGVzID0gbnVsbCA9PSBhdHRyaWJ1dGVzID8gdm9pZCAwIDogYXR0cmlidXRlcztcbiAgICAgICAgcC5rZXkgPSBudWxsID09IGF0dHJpYnV0ZXMgPyB2b2lkIDAgOiBhdHRyaWJ1dGVzLmtleTtcbiAgICAgICAgaWYgKHZvaWQgMCAhPT0gb3B0aW9ucy52bm9kZSkgb3B0aW9ucy52bm9kZShwKTtcbiAgICAgICAgcmV0dXJuIHA7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGV4dGVuZChvYmosIHByb3BzKSB7XG4gICAgICAgIGZvciAodmFyIGkgaW4gcHJvcHMpIG9ialtpXSA9IHByb3BzW2ldO1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjbG9uZUVsZW1lbnQodm5vZGUsIHByb3BzKSB7XG4gICAgICAgIHJldHVybiBoKHZub2RlLm5vZGVOYW1lLCBleHRlbmQoZXh0ZW5kKHt9LCB2bm9kZS5hdHRyaWJ1dGVzKSwgcHJvcHMpLCBhcmd1bWVudHMubGVuZ3RoID4gMiA/IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKSA6IHZub2RlLmNoaWxkcmVuKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZW5xdWV1ZVJlbmRlcihjb21wb25lbnQpIHtcbiAgICAgICAgaWYgKCFjb21wb25lbnQuX19kICYmIChjb21wb25lbnQuX19kID0gITApICYmIDEgPT0gaXRlbXMucHVzaChjb21wb25lbnQpKSAob3B0aW9ucy5kZWJvdW5jZVJlbmRlcmluZyB8fCBzZXRUaW1lb3V0KShyZXJlbmRlcik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlcmVuZGVyKCkge1xuICAgICAgICB2YXIgcCwgbGlzdCA9IGl0ZW1zO1xuICAgICAgICBpdGVtcyA9IFtdO1xuICAgICAgICB3aGlsZSAocCA9IGxpc3QucG9wKCkpIGlmIChwLl9fZCkgcmVuZGVyQ29tcG9uZW50KHApO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpc1NhbWVOb2RlVHlwZShub2RlLCB2bm9kZSwgaHlkcmF0aW5nKSB7XG4gICAgICAgIGlmICgnc3RyaW5nJyA9PSB0eXBlb2Ygdm5vZGUgfHwgJ251bWJlcicgPT0gdHlwZW9mIHZub2RlKSByZXR1cm4gdm9pZCAwICE9PSBub2RlLnNwbGl0VGV4dDtcbiAgICAgICAgaWYgKCdzdHJpbmcnID09IHR5cGVvZiB2bm9kZS5ub2RlTmFtZSkgcmV0dXJuICFub2RlLl9jb21wb25lbnRDb25zdHJ1Y3RvciAmJiBpc05hbWVkTm9kZShub2RlLCB2bm9kZS5ub2RlTmFtZSk7IGVsc2UgcmV0dXJuIGh5ZHJhdGluZyB8fCBub2RlLl9jb21wb25lbnRDb25zdHJ1Y3RvciA9PT0gdm5vZGUubm9kZU5hbWU7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzTmFtZWROb2RlKG5vZGUsIG5vZGVOYW1lKSB7XG4gICAgICAgIHJldHVybiBub2RlLl9fbiA9PT0gbm9kZU5hbWUgfHwgbm9kZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpID09PSBub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBnZXROb2RlUHJvcHModm5vZGUpIHtcbiAgICAgICAgdmFyIHByb3BzID0gZXh0ZW5kKHt9LCB2bm9kZS5hdHRyaWJ1dGVzKTtcbiAgICAgICAgcHJvcHMuY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlbjtcbiAgICAgICAgdmFyIGRlZmF1bHRQcm9wcyA9IHZub2RlLm5vZGVOYW1lLmRlZmF1bHRQcm9wcztcbiAgICAgICAgaWYgKHZvaWQgMCAhPT0gZGVmYXVsdFByb3BzKSBmb3IgKHZhciBpIGluIGRlZmF1bHRQcm9wcykgaWYgKHZvaWQgMCA9PT0gcHJvcHNbaV0pIHByb3BzW2ldID0gZGVmYXVsdFByb3BzW2ldO1xuICAgICAgICByZXR1cm4gcHJvcHM7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNyZWF0ZU5vZGUobm9kZU5hbWUsIGlzU3ZnKSB7XG4gICAgICAgIHZhciBub2RlID0gaXNTdmcgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgbm9kZU5hbWUpIDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudChub2RlTmFtZSk7XG4gICAgICAgIG5vZGUuX19uID0gbm9kZU5hbWU7XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgIH1cbiAgICBmdW5jdGlvbiByZW1vdmVOb2RlKG5vZGUpIHtcbiAgICAgICAgaWYgKG5vZGUucGFyZW50Tm9kZSkgbm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vZGUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzZXRBY2Nlc3Nvcihub2RlLCBuYW1lLCBvbGQsIHZhbHVlLCBpc1N2Zykge1xuICAgICAgICBpZiAoJ2NsYXNzTmFtZScgPT09IG5hbWUpIG5hbWUgPSAnY2xhc3MnO1xuICAgICAgICBpZiAoJ2tleScgPT09IG5hbWUpIDsgZWxzZSBpZiAoJ3JlZicgPT09IG5hbWUpIHtcbiAgICAgICAgICAgIGlmIChvbGQpIG9sZChudWxsKTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkgdmFsdWUobm9kZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoJ2NsYXNzJyA9PT0gbmFtZSAmJiAhaXNTdmcpIG5vZGUuY2xhc3NOYW1lID0gdmFsdWUgfHwgJyc7IGVsc2UgaWYgKCdzdHlsZScgPT09IG5hbWUpIHtcbiAgICAgICAgICAgIGlmICghdmFsdWUgfHwgJ3N0cmluZycgPT0gdHlwZW9mIHZhbHVlIHx8ICdzdHJpbmcnID09IHR5cGVvZiBvbGQpIG5vZGUuc3R5bGUuY3NzVGV4dCA9IHZhbHVlIHx8ICcnO1xuICAgICAgICAgICAgaWYgKHZhbHVlICYmICdvYmplY3QnID09IHR5cGVvZiB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICgnc3RyaW5nJyAhPSB0eXBlb2Ygb2xkKSBmb3IgKHZhciBpIGluIG9sZCkgaWYgKCEoaSBpbiB2YWx1ZSkpIG5vZGUuc3R5bGVbaV0gPSAnJztcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIHZhbHVlKSBub2RlLnN0eWxlW2ldID0gJ251bWJlcicgPT0gdHlwZW9mIHZhbHVlW2ldICYmIElTX05PTl9ESU1FTlNJT05BTC50ZXN0KGkpID09PSAhMSA/IHZhbHVlW2ldICsgJ3B4JyA6IHZhbHVlW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCdkYW5nZXJvdXNseVNldElubmVySFRNTCcgPT09IG5hbWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkgbm9kZS5pbm5lckhUTUwgPSB2YWx1ZS5fX2h0bWwgfHwgJyc7XG4gICAgICAgIH0gZWxzZSBpZiAoJ28nID09IG5hbWVbMF0gJiYgJ24nID09IG5hbWVbMV0pIHtcbiAgICAgICAgICAgIHZhciB1c2VDYXB0dXJlID0gbmFtZSAhPT0gKG5hbWUgPSBuYW1lLnJlcGxhY2UoL0NhcHR1cmUkLywgJycpKTtcbiAgICAgICAgICAgIG5hbWUgPSBuYW1lLnRvTG93ZXJDYXNlKCkuc3Vic3RyaW5nKDIpO1xuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFvbGQpIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCBldmVudFByb3h5LCB1c2VDYXB0dXJlKTtcbiAgICAgICAgICAgIH0gZWxzZSBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIobmFtZSwgZXZlbnRQcm94eSwgdXNlQ2FwdHVyZSk7XG4gICAgICAgICAgICAobm9kZS5fX2wgfHwgKG5vZGUuX19sID0ge30pKVtuYW1lXSA9IHZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKCdsaXN0JyAhPT0gbmFtZSAmJiAndHlwZScgIT09IG5hbWUgJiYgIWlzU3ZnICYmIG5hbWUgaW4gbm9kZSkge1xuICAgICAgICAgICAgc2V0UHJvcGVydHkobm9kZSwgbmFtZSwgbnVsbCA9PSB2YWx1ZSA/ICcnIDogdmFsdWUpO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdmFsdWUgfHwgdmFsdWUgPT09ICExKSBub2RlLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBucyA9IGlzU3ZnICYmIG5hbWUgIT09IChuYW1lID0gbmFtZS5yZXBsYWNlKC9eeGxpbmtcXDo/LywgJycpKTtcbiAgICAgICAgICAgIGlmIChudWxsID09IHZhbHVlIHx8IHZhbHVlID09PSAhMSkgaWYgKG5zKSBub2RlLnJlbW92ZUF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgbmFtZS50b0xvd2VyQ2FzZSgpKTsgZWxzZSBub2RlLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTsgZWxzZSBpZiAoJ2Z1bmN0aW9uJyAhPSB0eXBlb2YgdmFsdWUpIGlmIChucykgbm9kZS5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsIG5hbWUudG9Mb3dlckNhc2UoKSwgdmFsdWUpOyBlbHNlIG5vZGUuc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBzZXRQcm9wZXJ0eShub2RlLCBuYW1lLCB2YWx1ZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbm9kZVtuYW1lXSA9IHZhbHVlO1xuICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgIH1cbiAgICBmdW5jdGlvbiBldmVudFByb3h5KGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19sW2UudHlwZV0ob3B0aW9ucy5ldmVudCAmJiBvcHRpb25zLmV2ZW50KGUpIHx8IGUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBmbHVzaE1vdW50cygpIHtcbiAgICAgICAgdmFyIGM7XG4gICAgICAgIHdoaWxlIChjID0gbW91bnRzLnBvcCgpKSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5hZnRlck1vdW50KSBvcHRpb25zLmFmdGVyTW91bnQoYyk7XG4gICAgICAgICAgICBpZiAoYy5jb21wb25lbnREaWRNb3VudCkgYy5jb21wb25lbnREaWRNb3VudCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRpZmYoZG9tLCB2bm9kZSwgY29udGV4dCwgbW91bnRBbGwsIHBhcmVudCwgY29tcG9uZW50Um9vdCkge1xuICAgICAgICBpZiAoIWRpZmZMZXZlbCsrKSB7XG4gICAgICAgICAgICBpc1N2Z01vZGUgPSBudWxsICE9IHBhcmVudCAmJiB2b2lkIDAgIT09IHBhcmVudC5vd25lclNWR0VsZW1lbnQ7XG4gICAgICAgICAgICBoeWRyYXRpbmcgPSBudWxsICE9IGRvbSAmJiAhKCdfX3ByZWFjdGF0dHJfJyBpbiBkb20pO1xuICAgICAgICB9XG4gICAgICAgIHZhciByZXQgPSBpZGlmZihkb20sIHZub2RlLCBjb250ZXh0LCBtb3VudEFsbCwgY29tcG9uZW50Um9vdCk7XG4gICAgICAgIGlmIChwYXJlbnQgJiYgcmV0LnBhcmVudE5vZGUgIT09IHBhcmVudCkgcGFyZW50LmFwcGVuZENoaWxkKHJldCk7XG4gICAgICAgIGlmICghLS1kaWZmTGV2ZWwpIHtcbiAgICAgICAgICAgIGh5ZHJhdGluZyA9ICExO1xuICAgICAgICAgICAgaWYgKCFjb21wb25lbnRSb290KSBmbHVzaE1vdW50cygpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlkaWZmKGRvbSwgdm5vZGUsIGNvbnRleHQsIG1vdW50QWxsLCBjb21wb25lbnRSb290KSB7XG4gICAgICAgIHZhciBvdXQgPSBkb20sIHByZXZTdmdNb2RlID0gaXNTdmdNb2RlO1xuICAgICAgICBpZiAobnVsbCA9PSB2bm9kZSkgdm5vZGUgPSAnJztcbiAgICAgICAgaWYgKCdzdHJpbmcnID09IHR5cGVvZiB2bm9kZSkge1xuICAgICAgICAgICAgaWYgKGRvbSAmJiB2b2lkIDAgIT09IGRvbS5zcGxpdFRleHQgJiYgZG9tLnBhcmVudE5vZGUgJiYgKCFkb20uX2NvbXBvbmVudCB8fCBjb21wb25lbnRSb290KSkge1xuICAgICAgICAgICAgICAgIGlmIChkb20ubm9kZVZhbHVlICE9IHZub2RlKSBkb20ubm9kZVZhbHVlID0gdm5vZGU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG91dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHZub2RlKTtcbiAgICAgICAgICAgICAgICBpZiAoZG9tKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkb20ucGFyZW50Tm9kZSkgZG9tLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG91dCwgZG9tKTtcbiAgICAgICAgICAgICAgICAgICAgcmVjb2xsZWN0Tm9kZVRyZWUoZG9tLCAhMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3V0Ll9fcHJlYWN0YXR0cl8gPSAhMDtcbiAgICAgICAgICAgIHJldHVybiBvdXQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIHZub2RlLm5vZGVOYW1lKSByZXR1cm4gYnVpbGRDb21wb25lbnRGcm9tVk5vZGUoZG9tLCB2bm9kZSwgY29udGV4dCwgbW91bnRBbGwpO1xuICAgICAgICBpc1N2Z01vZGUgPSAnc3ZnJyA9PT0gdm5vZGUubm9kZU5hbWUgPyAhMCA6ICdmb3JlaWduT2JqZWN0JyA9PT0gdm5vZGUubm9kZU5hbWUgPyAhMSA6IGlzU3ZnTW9kZTtcbiAgICAgICAgaWYgKCFkb20gfHwgIWlzTmFtZWROb2RlKGRvbSwgU3RyaW5nKHZub2RlLm5vZGVOYW1lKSkpIHtcbiAgICAgICAgICAgIG91dCA9IGNyZWF0ZU5vZGUoU3RyaW5nKHZub2RlLm5vZGVOYW1lKSwgaXNTdmdNb2RlKTtcbiAgICAgICAgICAgIGlmIChkb20pIHtcbiAgICAgICAgICAgICAgICB3aGlsZSAoZG9tLmZpcnN0Q2hpbGQpIG91dC5hcHBlbmRDaGlsZChkb20uZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICAgICAgaWYgKGRvbS5wYXJlbnROb2RlKSBkb20ucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQob3V0LCBkb20pO1xuICAgICAgICAgICAgICAgIHJlY29sbGVjdE5vZGVUcmVlKGRvbSwgITApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBmYyA9IG91dC5maXJzdENoaWxkLCBwcm9wcyA9IG91dC5fX3ByZWFjdGF0dHJfIHx8IChvdXQuX19wcmVhY3RhdHRyXyA9IHt9KSwgdmNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW47XG4gICAgICAgIGlmICghaHlkcmF0aW5nICYmIHZjaGlsZHJlbiAmJiAxID09PSB2Y2hpbGRyZW4ubGVuZ3RoICYmICdzdHJpbmcnID09IHR5cGVvZiB2Y2hpbGRyZW5bMF0gJiYgbnVsbCAhPSBmYyAmJiB2b2lkIDAgIT09IGZjLnNwbGl0VGV4dCAmJiBudWxsID09IGZjLm5leHRTaWJsaW5nKSB7XG4gICAgICAgICAgICBpZiAoZmMubm9kZVZhbHVlICE9IHZjaGlsZHJlblswXSkgZmMubm9kZVZhbHVlID0gdmNoaWxkcmVuWzBdO1xuICAgICAgICB9IGVsc2UgaWYgKHZjaGlsZHJlbiAmJiB2Y2hpbGRyZW4ubGVuZ3RoIHx8IG51bGwgIT0gZmMpIGlubmVyRGlmZk5vZGUob3V0LCB2Y2hpbGRyZW4sIGNvbnRleHQsIG1vdW50QWxsLCBoeWRyYXRpbmcgfHwgbnVsbCAhPSBwcm9wcy5kYW5nZXJvdXNseVNldElubmVySFRNTCk7XG4gICAgICAgIGRpZmZBdHRyaWJ1dGVzKG91dCwgdm5vZGUuYXR0cmlidXRlcywgcHJvcHMpO1xuICAgICAgICBpc1N2Z01vZGUgPSBwcmV2U3ZnTW9kZTtcbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG4gICAgZnVuY3Rpb24gaW5uZXJEaWZmTm9kZShkb20sIHZjaGlsZHJlbiwgY29udGV4dCwgbW91bnRBbGwsIGlzSHlkcmF0aW5nKSB7XG4gICAgICAgIHZhciBqLCBjLCB2Y2hpbGQsIGNoaWxkLCBvcmlnaW5hbENoaWxkcmVuID0gZG9tLmNoaWxkTm9kZXMsIGNoaWxkcmVuID0gW10sIGtleWVkID0ge30sIGtleWVkTGVuID0gMCwgbWluID0gMCwgbGVuID0gb3JpZ2luYWxDaGlsZHJlbi5sZW5ndGgsIGNoaWxkcmVuTGVuID0gMCwgdmxlbiA9IHZjaGlsZHJlbiA/IHZjaGlsZHJlbi5sZW5ndGggOiAwO1xuICAgICAgICBpZiAoMCAhPT0gbGVuKSBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgX2NoaWxkID0gb3JpZ2luYWxDaGlsZHJlbltpXSwgcHJvcHMgPSBfY2hpbGQuX19wcmVhY3RhdHRyXywga2V5ID0gdmxlbiAmJiBwcm9wcyA/IF9jaGlsZC5fY29tcG9uZW50ID8gX2NoaWxkLl9jb21wb25lbnQuX19rIDogcHJvcHMua2V5IDogbnVsbDtcbiAgICAgICAgICAgIGlmIChudWxsICE9IGtleSkge1xuICAgICAgICAgICAgICAgIGtleWVkTGVuKys7XG4gICAgICAgICAgICAgICAga2V5ZWRba2V5XSA9IF9jaGlsZDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvcHMgfHwgKHZvaWQgMCAhPT0gX2NoaWxkLnNwbGl0VGV4dCA/IGlzSHlkcmF0aW5nID8gX2NoaWxkLm5vZGVWYWx1ZS50cmltKCkgOiAhMCA6IGlzSHlkcmF0aW5nKSkgY2hpbGRyZW5bY2hpbGRyZW5MZW4rK10gPSBfY2hpbGQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKDAgIT09IHZsZW4pIGZvciAodmFyIGkgPSAwOyBpIDwgdmxlbjsgaSsrKSB7XG4gICAgICAgICAgICB2Y2hpbGQgPSB2Y2hpbGRyZW5baV07XG4gICAgICAgICAgICBjaGlsZCA9IG51bGw7XG4gICAgICAgICAgICB2YXIga2V5ID0gdmNoaWxkLmtleTtcbiAgICAgICAgICAgIGlmIChudWxsICE9IGtleSkge1xuICAgICAgICAgICAgICAgIGlmIChrZXllZExlbiAmJiB2b2lkIDAgIT09IGtleWVkW2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQgPSBrZXllZFtrZXldO1xuICAgICAgICAgICAgICAgICAgICBrZXllZFtrZXldID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgICAgICBrZXllZExlbi0tO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWNoaWxkICYmIG1pbiA8IGNoaWxkcmVuTGVuKSBmb3IgKGogPSBtaW47IGogPCBjaGlsZHJlbkxlbjsgaisrKSBpZiAodm9pZCAwICE9PSBjaGlsZHJlbltqXSAmJiBpc1NhbWVOb2RlVHlwZShjID0gY2hpbGRyZW5bal0sIHZjaGlsZCwgaXNIeWRyYXRpbmcpKSB7XG4gICAgICAgICAgICAgICAgY2hpbGQgPSBjO1xuICAgICAgICAgICAgICAgIGNoaWxkcmVuW2pdID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgIGlmIChqID09PSBjaGlsZHJlbkxlbiAtIDEpIGNoaWxkcmVuTGVuLS07XG4gICAgICAgICAgICAgICAgaWYgKGogPT09IG1pbikgbWluKys7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaGlsZCA9IGlkaWZmKGNoaWxkLCB2Y2hpbGQsIGNvbnRleHQsIG1vdW50QWxsKTtcbiAgICAgICAgICAgIGlmIChjaGlsZCAmJiBjaGlsZCAhPT0gZG9tKSBpZiAoaSA+PSBsZW4pIGRvbS5hcHBlbmRDaGlsZChjaGlsZCk7IGVsc2UgaWYgKGNoaWxkICE9PSBvcmlnaW5hbENoaWxkcmVuW2ldKSBpZiAoY2hpbGQgPT09IG9yaWdpbmFsQ2hpbGRyZW5baSArIDFdKSByZW1vdmVOb2RlKG9yaWdpbmFsQ2hpbGRyZW5baV0pOyBlbHNlIGRvbS5pbnNlcnRCZWZvcmUoY2hpbGQsIG9yaWdpbmFsQ2hpbGRyZW5baV0gfHwgbnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGtleWVkTGVuKSBmb3IgKHZhciBpIGluIGtleWVkKSBpZiAodm9pZCAwICE9PSBrZXllZFtpXSkgcmVjb2xsZWN0Tm9kZVRyZWUoa2V5ZWRbaV0sICExKTtcbiAgICAgICAgd2hpbGUgKG1pbiA8PSBjaGlsZHJlbkxlbikgaWYgKHZvaWQgMCAhPT0gKGNoaWxkID0gY2hpbGRyZW5bY2hpbGRyZW5MZW4tLV0pKSByZWNvbGxlY3ROb2RlVHJlZShjaGlsZCwgITEpO1xuICAgIH1cbiAgICBmdW5jdGlvbiByZWNvbGxlY3ROb2RlVHJlZShub2RlLCB1bm1vdW50T25seSkge1xuICAgICAgICB2YXIgY29tcG9uZW50ID0gbm9kZS5fY29tcG9uZW50O1xuICAgICAgICBpZiAoY29tcG9uZW50KSB1bm1vdW50Q29tcG9uZW50KGNvbXBvbmVudCk7IGVsc2Uge1xuICAgICAgICAgICAgaWYgKG51bGwgIT0gbm9kZS5fX3ByZWFjdGF0dHJfICYmIG5vZGUuX19wcmVhY3RhdHRyXy5yZWYpIG5vZGUuX19wcmVhY3RhdHRyXy5yZWYobnVsbCk7XG4gICAgICAgICAgICBpZiAodW5tb3VudE9ubHkgPT09ICExIHx8IG51bGwgPT0gbm9kZS5fX3ByZWFjdGF0dHJfKSByZW1vdmVOb2RlKG5vZGUpO1xuICAgICAgICAgICAgcmVtb3ZlQ2hpbGRyZW4obm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gcmVtb3ZlQ2hpbGRyZW4obm9kZSkge1xuICAgICAgICBub2RlID0gbm9kZS5sYXN0Q2hpbGQ7XG4gICAgICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgICAgICB2YXIgbmV4dCA9IG5vZGUucHJldmlvdXNTaWJsaW5nO1xuICAgICAgICAgICAgcmVjb2xsZWN0Tm9kZVRyZWUobm9kZSwgITApO1xuICAgICAgICAgICAgbm9kZSA9IG5leHQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gZGlmZkF0dHJpYnV0ZXMoZG9tLCBhdHRycywgb2xkKSB7XG4gICAgICAgIHZhciBuYW1lO1xuICAgICAgICBmb3IgKG5hbWUgaW4gb2xkKSBpZiAoKCFhdHRycyB8fCBudWxsID09IGF0dHJzW25hbWVdKSAmJiBudWxsICE9IG9sZFtuYW1lXSkgc2V0QWNjZXNzb3IoZG9tLCBuYW1lLCBvbGRbbmFtZV0sIG9sZFtuYW1lXSA9IHZvaWQgMCwgaXNTdmdNb2RlKTtcbiAgICAgICAgZm9yIChuYW1lIGluIGF0dHJzKSBpZiAoISgnY2hpbGRyZW4nID09PSBuYW1lIHx8ICdpbm5lckhUTUwnID09PSBuYW1lIHx8IG5hbWUgaW4gb2xkICYmIGF0dHJzW25hbWVdID09PSAoJ3ZhbHVlJyA9PT0gbmFtZSB8fCAnY2hlY2tlZCcgPT09IG5hbWUgPyBkb21bbmFtZV0gOiBvbGRbbmFtZV0pKSkgc2V0QWNjZXNzb3IoZG9tLCBuYW1lLCBvbGRbbmFtZV0sIG9sZFtuYW1lXSA9IGF0dHJzW25hbWVdLCBpc1N2Z01vZGUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjb2xsZWN0Q29tcG9uZW50KGNvbXBvbmVudCkge1xuICAgICAgICB2YXIgbmFtZSA9IGNvbXBvbmVudC5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgICAgICAoY29tcG9uZW50c1tuYW1lXSB8fCAoY29tcG9uZW50c1tuYW1lXSA9IFtdKSkucHVzaChjb21wb25lbnQpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjcmVhdGVDb21wb25lbnQoQ3RvciwgcHJvcHMsIGNvbnRleHQpIHtcbiAgICAgICAgdmFyIGluc3QsIGxpc3QgPSBjb21wb25lbnRzW0N0b3IubmFtZV07XG4gICAgICAgIGlmIChDdG9yLnByb3RvdHlwZSAmJiBDdG9yLnByb3RvdHlwZS5yZW5kZXIpIHtcbiAgICAgICAgICAgIGluc3QgPSBuZXcgQ3Rvcihwcm9wcywgY29udGV4dCk7XG4gICAgICAgICAgICBDb21wb25lbnQuY2FsbChpbnN0LCBwcm9wcywgY29udGV4dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbnN0ID0gbmV3IENvbXBvbmVudChwcm9wcywgY29udGV4dCk7XG4gICAgICAgICAgICBpbnN0LmNvbnN0cnVjdG9yID0gQ3RvcjtcbiAgICAgICAgICAgIGluc3QucmVuZGVyID0gZG9SZW5kZXI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxpc3QpIGZvciAodmFyIGkgPSBsaXN0Lmxlbmd0aDsgaS0tOyApIGlmIChsaXN0W2ldLmNvbnN0cnVjdG9yID09PSBDdG9yKSB7XG4gICAgICAgICAgICBpbnN0Ll9fYiA9IGxpc3RbaV0uX19iO1xuICAgICAgICAgICAgbGlzdC5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW5zdDtcbiAgICB9XG4gICAgZnVuY3Rpb24gZG9SZW5kZXIocHJvcHMsIHN0YXRlLCBjb250ZXh0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yKHByb3BzLCBjb250ZXh0KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gc2V0Q29tcG9uZW50UHJvcHMoY29tcG9uZW50LCBwcm9wcywgb3B0cywgY29udGV4dCwgbW91bnRBbGwpIHtcbiAgICAgICAgaWYgKCFjb21wb25lbnQuX194KSB7XG4gICAgICAgICAgICBjb21wb25lbnQuX194ID0gITA7XG4gICAgICAgICAgICBpZiAoY29tcG9uZW50Ll9fciA9IHByb3BzLnJlZikgZGVsZXRlIHByb3BzLnJlZjtcbiAgICAgICAgICAgIGlmIChjb21wb25lbnQuX19rID0gcHJvcHMua2V5KSBkZWxldGUgcHJvcHMua2V5O1xuICAgICAgICAgICAgaWYgKCFjb21wb25lbnQuYmFzZSB8fCBtb3VudEFsbCkge1xuICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnQuY29tcG9uZW50V2lsbE1vdW50KSBjb21wb25lbnQuY29tcG9uZW50V2lsbE1vdW50KCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNvbXBvbmVudC5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKSBjb21wb25lbnQuY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhwcm9wcywgY29udGV4dCk7XG4gICAgICAgICAgICBpZiAoY29udGV4dCAmJiBjb250ZXh0ICE9PSBjb21wb25lbnQuY29udGV4dCkge1xuICAgICAgICAgICAgICAgIGlmICghY29tcG9uZW50Ll9fYykgY29tcG9uZW50Ll9fYyA9IGNvbXBvbmVudC5jb250ZXh0O1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5jb250ZXh0ID0gY29udGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghY29tcG9uZW50Ll9fcCkgY29tcG9uZW50Ll9fcCA9IGNvbXBvbmVudC5wcm9wcztcbiAgICAgICAgICAgIGNvbXBvbmVudC5wcm9wcyA9IHByb3BzO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9feCA9ICExO1xuICAgICAgICAgICAgaWYgKDAgIT09IG9wdHMpIGlmICgxID09PSBvcHRzIHx8IG9wdGlvbnMuc3luY0NvbXBvbmVudFVwZGF0ZXMgIT09ICExIHx8ICFjb21wb25lbnQuYmFzZSkgcmVuZGVyQ29tcG9uZW50KGNvbXBvbmVudCwgMSwgbW91bnRBbGwpOyBlbHNlIGVucXVldWVSZW5kZXIoY29tcG9uZW50KTtcbiAgICAgICAgICAgIGlmIChjb21wb25lbnQuX19yKSBjb21wb25lbnQuX19yKGNvbXBvbmVudCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gcmVuZGVyQ29tcG9uZW50KGNvbXBvbmVudCwgb3B0cywgbW91bnRBbGwsIGlzQ2hpbGQpIHtcbiAgICAgICAgaWYgKCFjb21wb25lbnQuX194KSB7XG4gICAgICAgICAgICB2YXIgcmVuZGVyZWQsIGluc3QsIGNiYXNlLCBwcm9wcyA9IGNvbXBvbmVudC5wcm9wcywgc3RhdGUgPSBjb21wb25lbnQuc3RhdGUsIGNvbnRleHQgPSBjb21wb25lbnQuY29udGV4dCwgcHJldmlvdXNQcm9wcyA9IGNvbXBvbmVudC5fX3AgfHwgcHJvcHMsIHByZXZpb3VzU3RhdGUgPSBjb21wb25lbnQuX19zIHx8IHN0YXRlLCBwcmV2aW91c0NvbnRleHQgPSBjb21wb25lbnQuX19jIHx8IGNvbnRleHQsIGlzVXBkYXRlID0gY29tcG9uZW50LmJhc2UsIG5leHRCYXNlID0gY29tcG9uZW50Ll9fYiwgaW5pdGlhbEJhc2UgPSBpc1VwZGF0ZSB8fCBuZXh0QmFzZSwgaW5pdGlhbENoaWxkQ29tcG9uZW50ID0gY29tcG9uZW50Ll9jb21wb25lbnQsIHNraXAgPSAhMTtcbiAgICAgICAgICAgIGlmIChpc1VwZGF0ZSkge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5wcm9wcyA9IHByZXZpb3VzUHJvcHM7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnN0YXRlID0gcHJldmlvdXNTdGF0ZTtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuY29udGV4dCA9IHByZXZpb3VzQ29udGV4dDtcbiAgICAgICAgICAgICAgICBpZiAoMiAhPT0gb3B0cyAmJiBjb21wb25lbnQuc2hvdWxkQ29tcG9uZW50VXBkYXRlICYmIGNvbXBvbmVudC5zaG91bGRDb21wb25lbnRVcGRhdGUocHJvcHMsIHN0YXRlLCBjb250ZXh0KSA9PT0gITEpIHNraXAgPSAhMDsgZWxzZSBpZiAoY29tcG9uZW50LmNvbXBvbmVudFdpbGxVcGRhdGUpIGNvbXBvbmVudC5jb21wb25lbnRXaWxsVXBkYXRlKHByb3BzLCBzdGF0ZSwgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnByb3BzID0gcHJvcHM7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnN0YXRlID0gc3RhdGU7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LmNvbnRleHQgPSBjb250ZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29tcG9uZW50Ll9fcCA9IGNvbXBvbmVudC5fX3MgPSBjb21wb25lbnQuX19jID0gY29tcG9uZW50Ll9fYiA9IG51bGw7XG4gICAgICAgICAgICBjb21wb25lbnQuX19kID0gITE7XG4gICAgICAgICAgICBpZiAoIXNraXApIHtcbiAgICAgICAgICAgICAgICByZW5kZXJlZCA9IGNvbXBvbmVudC5yZW5kZXIocHJvcHMsIHN0YXRlLCBjb250ZXh0KTtcbiAgICAgICAgICAgICAgICBpZiAoY29tcG9uZW50LmdldENoaWxkQ29udGV4dCkgY29udGV4dCA9IGV4dGVuZChleHRlbmQoe30sIGNvbnRleHQpLCBjb21wb25lbnQuZ2V0Q2hpbGRDb250ZXh0KCkpO1xuICAgICAgICAgICAgICAgIHZhciB0b1VubW91bnQsIGJhc2UsIGNoaWxkQ29tcG9uZW50ID0gcmVuZGVyZWQgJiYgcmVuZGVyZWQubm9kZU5hbWU7XG4gICAgICAgICAgICAgICAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGNoaWxkQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZFByb3BzID0gZ2V0Tm9kZVByb3BzKHJlbmRlcmVkKTtcbiAgICAgICAgICAgICAgICAgICAgaW5zdCA9IGluaXRpYWxDaGlsZENvbXBvbmVudDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluc3QgJiYgaW5zdC5jb25zdHJ1Y3RvciA9PT0gY2hpbGRDb21wb25lbnQgJiYgY2hpbGRQcm9wcy5rZXkgPT0gaW5zdC5fX2spIHNldENvbXBvbmVudFByb3BzKGluc3QsIGNoaWxkUHJvcHMsIDEsIGNvbnRleHQsICExKTsgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b1VubW91bnQgPSBpbnN0O1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50Ll9jb21wb25lbnQgPSBpbnN0ID0gY3JlYXRlQ29tcG9uZW50KGNoaWxkQ29tcG9uZW50LCBjaGlsZFByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3QuX19iID0gaW5zdC5fX2IgfHwgbmV4dEJhc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0Ll9fdSA9IGNvbXBvbmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldENvbXBvbmVudFByb3BzKGluc3QsIGNoaWxkUHJvcHMsIDAsIGNvbnRleHQsICExKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckNvbXBvbmVudChpbnN0LCAxLCBtb3VudEFsbCwgITApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJhc2UgPSBpbnN0LmJhc2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2Jhc2UgPSBpbml0aWFsQmFzZTtcbiAgICAgICAgICAgICAgICAgICAgdG9Vbm1vdW50ID0gaW5pdGlhbENoaWxkQ29tcG9uZW50O1xuICAgICAgICAgICAgICAgICAgICBpZiAodG9Vbm1vdW50KSBjYmFzZSA9IGNvbXBvbmVudC5fY29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluaXRpYWxCYXNlIHx8IDEgPT09IG9wdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYmFzZSkgY2Jhc2UuX2NvbXBvbmVudCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlID0gZGlmZihjYmFzZSwgcmVuZGVyZWQsIGNvbnRleHQsIG1vdW50QWxsIHx8ICFpc1VwZGF0ZSwgaW5pdGlhbEJhc2UgJiYgaW5pdGlhbEJhc2UucGFyZW50Tm9kZSwgITApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChpbml0aWFsQmFzZSAmJiBiYXNlICE9PSBpbml0aWFsQmFzZSAmJiBpbnN0ICE9PSBpbml0aWFsQ2hpbGRDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJhc2VQYXJlbnQgPSBpbml0aWFsQmFzZS5wYXJlbnROb2RlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYmFzZVBhcmVudCAmJiBiYXNlICE9PSBiYXNlUGFyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlUGFyZW50LnJlcGxhY2VDaGlsZChiYXNlLCBpbml0aWFsQmFzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXRvVW5tb3VudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluaXRpYWxCYXNlLl9jb21wb25lbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY29sbGVjdE5vZGVUcmVlKGluaXRpYWxCYXNlLCAhMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRvVW5tb3VudCkgdW5tb3VudENvbXBvbmVudCh0b1VubW91bnQpO1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5iYXNlID0gYmFzZTtcbiAgICAgICAgICAgICAgICBpZiAoYmFzZSAmJiAhaXNDaGlsZCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY29tcG9uZW50UmVmID0gY29tcG9uZW50LCB0ID0gY29tcG9uZW50O1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAodCA9IHQuX191KSAoY29tcG9uZW50UmVmID0gdCkuYmFzZSA9IGJhc2U7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuX2NvbXBvbmVudCA9IGNvbXBvbmVudFJlZjtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5fY29tcG9uZW50Q29uc3RydWN0b3IgPSBjb21wb25lbnRSZWYuY29uc3RydWN0b3I7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFpc1VwZGF0ZSB8fCBtb3VudEFsbCkgbW91bnRzLnVuc2hpZnQoY29tcG9uZW50KTsgZWxzZSBpZiAoIXNraXApIHtcbiAgICAgICAgICAgICAgICBmbHVzaE1vdW50cygpO1xuICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnQuY29tcG9uZW50RGlkVXBkYXRlKSBjb21wb25lbnQuY29tcG9uZW50RGlkVXBkYXRlKHByZXZpb3VzUHJvcHMsIHByZXZpb3VzU3RhdGUsIHByZXZpb3VzQ29udGV4dCk7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuYWZ0ZXJVcGRhdGUpIG9wdGlvbnMuYWZ0ZXJVcGRhdGUoY29tcG9uZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChudWxsICE9IGNvbXBvbmVudC5fX2gpIHdoaWxlIChjb21wb25lbnQuX19oLmxlbmd0aCkgY29tcG9uZW50Ll9faC5wb3AoKS5jYWxsKGNvbXBvbmVudCk7XG4gICAgICAgICAgICBpZiAoIWRpZmZMZXZlbCAmJiAhaXNDaGlsZCkgZmx1c2hNb3VudHMoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBidWlsZENvbXBvbmVudEZyb21WTm9kZShkb20sIHZub2RlLCBjb250ZXh0LCBtb3VudEFsbCkge1xuICAgICAgICB2YXIgYyA9IGRvbSAmJiBkb20uX2NvbXBvbmVudCwgb3JpZ2luYWxDb21wb25lbnQgPSBjLCBvbGREb20gPSBkb20sIGlzRGlyZWN0T3duZXIgPSBjICYmIGRvbS5fY29tcG9uZW50Q29uc3RydWN0b3IgPT09IHZub2RlLm5vZGVOYW1lLCBpc093bmVyID0gaXNEaXJlY3RPd25lciwgcHJvcHMgPSBnZXROb2RlUHJvcHModm5vZGUpO1xuICAgICAgICB3aGlsZSAoYyAmJiAhaXNPd25lciAmJiAoYyA9IGMuX191KSkgaXNPd25lciA9IGMuY29uc3RydWN0b3IgPT09IHZub2RlLm5vZGVOYW1lO1xuICAgICAgICBpZiAoYyAmJiBpc093bmVyICYmICghbW91bnRBbGwgfHwgYy5fY29tcG9uZW50KSkge1xuICAgICAgICAgICAgc2V0Q29tcG9uZW50UHJvcHMoYywgcHJvcHMsIDMsIGNvbnRleHQsIG1vdW50QWxsKTtcbiAgICAgICAgICAgIGRvbSA9IGMuYmFzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChvcmlnaW5hbENvbXBvbmVudCAmJiAhaXNEaXJlY3RPd25lcikge1xuICAgICAgICAgICAgICAgIHVubW91bnRDb21wb25lbnQob3JpZ2luYWxDb21wb25lbnQpO1xuICAgICAgICAgICAgICAgIGRvbSA9IG9sZERvbSA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjID0gY3JlYXRlQ29tcG9uZW50KHZub2RlLm5vZGVOYW1lLCBwcm9wcywgY29udGV4dCk7XG4gICAgICAgICAgICBpZiAoZG9tICYmICFjLl9fYikge1xuICAgICAgICAgICAgICAgIGMuX19iID0gZG9tO1xuICAgICAgICAgICAgICAgIG9sZERvbSA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXRDb21wb25lbnRQcm9wcyhjLCBwcm9wcywgMSwgY29udGV4dCwgbW91bnRBbGwpO1xuICAgICAgICAgICAgZG9tID0gYy5iYXNlO1xuICAgICAgICAgICAgaWYgKG9sZERvbSAmJiBkb20gIT09IG9sZERvbSkge1xuICAgICAgICAgICAgICAgIG9sZERvbS5fY29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICByZWNvbGxlY3ROb2RlVHJlZShvbGREb20sICExKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZG9tO1xuICAgIH1cbiAgICBmdW5jdGlvbiB1bm1vdW50Q29tcG9uZW50KGNvbXBvbmVudCkge1xuICAgICAgICBpZiAob3B0aW9ucy5iZWZvcmVVbm1vdW50KSBvcHRpb25zLmJlZm9yZVVubW91bnQoY29tcG9uZW50KTtcbiAgICAgICAgdmFyIGJhc2UgPSBjb21wb25lbnQuYmFzZTtcbiAgICAgICAgY29tcG9uZW50Ll9feCA9ICEwO1xuICAgICAgICBpZiAoY29tcG9uZW50LmNvbXBvbmVudFdpbGxVbm1vdW50KSBjb21wb25lbnQuY29tcG9uZW50V2lsbFVubW91bnQoKTtcbiAgICAgICAgY29tcG9uZW50LmJhc2UgPSBudWxsO1xuICAgICAgICB2YXIgaW5uZXIgPSBjb21wb25lbnQuX2NvbXBvbmVudDtcbiAgICAgICAgaWYgKGlubmVyKSB1bm1vdW50Q29tcG9uZW50KGlubmVyKTsgZWxzZSBpZiAoYmFzZSkge1xuICAgICAgICAgICAgaWYgKGJhc2UuX19wcmVhY3RhdHRyXyAmJiBiYXNlLl9fcHJlYWN0YXR0cl8ucmVmKSBiYXNlLl9fcHJlYWN0YXR0cl8ucmVmKG51bGwpO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9fYiA9IGJhc2U7XG4gICAgICAgICAgICByZW1vdmVOb2RlKGJhc2UpO1xuICAgICAgICAgICAgY29sbGVjdENvbXBvbmVudChjb21wb25lbnQpO1xuICAgICAgICAgICAgcmVtb3ZlQ2hpbGRyZW4oYmFzZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbXBvbmVudC5fX3IpIGNvbXBvbmVudC5fX3IobnVsbCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIENvbXBvbmVudChwcm9wcywgY29udGV4dCkge1xuICAgICAgICB0aGlzLl9fZCA9ICEwO1xuICAgICAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICAgICAgICB0aGlzLnByb3BzID0gcHJvcHM7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB0aGlzLnN0YXRlIHx8IHt9O1xuICAgIH1cbiAgICBmdW5jdGlvbiByZW5kZXIodm5vZGUsIHBhcmVudCwgbWVyZ2UpIHtcbiAgICAgICAgcmV0dXJuIGRpZmYobWVyZ2UsIHZub2RlLCB7fSwgITEsIHBhcmVudCwgITEpO1xuICAgIH1cbiAgICB2YXIgb3B0aW9ucyA9IHt9O1xuICAgIHZhciBzdGFjayA9IFtdO1xuICAgIHZhciBFTVBUWV9DSElMRFJFTiA9IFtdO1xuICAgIHZhciBJU19OT05fRElNRU5TSU9OQUwgPSAvYWNpdHxleCg/OnN8Z3xufHB8JCl8cnBofG93c3xtbmN8bnR3fGluZVtjaF18em9vfF5vcmQvaTtcbiAgICB2YXIgaXRlbXMgPSBbXTtcbiAgICB2YXIgbW91bnRzID0gW107XG4gICAgdmFyIGRpZmZMZXZlbCA9IDA7XG4gICAgdmFyIGlzU3ZnTW9kZSA9ICExO1xuICAgIHZhciBoeWRyYXRpbmcgPSAhMTtcbiAgICB2YXIgY29tcG9uZW50cyA9IHt9O1xuICAgIGV4dGVuZChDb21wb25lbnQucHJvdG90eXBlLCB7XG4gICAgICAgIHNldFN0YXRlOiBmdW5jdGlvbihzdGF0ZSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciBzID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICAgIGlmICghdGhpcy5fX3MpIHRoaXMuX19zID0gZXh0ZW5kKHt9LCBzKTtcbiAgICAgICAgICAgIGV4dGVuZChzLCAnZnVuY3Rpb24nID09IHR5cGVvZiBzdGF0ZSA/IHN0YXRlKHMsIHRoaXMucHJvcHMpIDogc3RhdGUpO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSAodGhpcy5fX2ggPSB0aGlzLl9faCB8fCBbXSkucHVzaChjYWxsYmFjayk7XG4gICAgICAgICAgICBlbnF1ZXVlUmVuZGVyKHRoaXMpO1xuICAgICAgICB9LFxuICAgICAgICBmb3JjZVVwZGF0ZTogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykgKHRoaXMuX19oID0gdGhpcy5fX2ggfHwgW10pLnB1c2goY2FsbGJhY2spO1xuICAgICAgICAgICAgcmVuZGVyQ29tcG9uZW50KHRoaXMsIDIpO1xuICAgICAgICB9LFxuICAgICAgICByZW5kZXI6IGZ1bmN0aW9uKCkge31cbiAgICB9KTtcbiAgICB2YXIgcHJlYWN0ID0ge1xuICAgICAgICBoOiBoLFxuICAgICAgICBjcmVhdGVFbGVtZW50OiBoLFxuICAgICAgICBjbG9uZUVsZW1lbnQ6IGNsb25lRWxlbWVudCxcbiAgICAgICAgQ29tcG9uZW50OiBDb21wb25lbnQsXG4gICAgICAgIHJlbmRlcjogcmVuZGVyLFxuICAgICAgICByZXJlbmRlcjogcmVyZW5kZXIsXG4gICAgICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgICB9O1xuICAgIGlmICgndW5kZWZpbmVkJyAhPSB0eXBlb2YgbW9kdWxlKSBtb2R1bGUuZXhwb3J0cyA9IHByZWFjdDsgZWxzZSBzZWxmLnByZWFjdCA9IHByZWFjdDtcbn0oKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXByZWFjdC5qcy5tYXAiLCJyZXF1aXJlKCcuL3BvbHlmaWxscy5qcycpO1xuXG5jb25zdFxuXHRSZWFjdCA9IHJlcXVpcmUoJ3ByZWFjdCcpLFxuXG5cdEJpbmQgPSByZXF1aXJlKFwiLi9iaW5kLmpzXCIpLFxuXG5cdFBhc3MgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvUGFzcy5qcycpLFxuXHRTdWJWaWV3ID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL1N1YlZpZXcuanMnKSxcblx0U2hpcFZpZXcgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvU2hpcFZpZXcuanMnKSxcblx0U29uYXJWaWV3ID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL1NvbmFyVmlldy5qcycpLFxuXG5cdFN0eWxlID0ge1xuXHRcdGFwcDogJ3dpZHRoOiAxMDB2dzsnXG5cdH07XG5cblxuY2xhc3MgQXBwIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IocHJvcHMsIGNvbnRleHQpIHtcblx0XHRzdXBlcihwcm9wcyk7XG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdHZpZXc6IDAsXG5cdFx0XHRwYXlsb2FkOiB1bmRlZmluZWRcblx0XHR9XG5cblx0XHRCaW5kKHRoaXMpO1xuXHR9XG5cblx0cmVuZGVyKHByb3BzLCBzdGF0ZSkge1xuXHRcdHN3aXRjaCAoc3RhdGUudmlldykge1xuXHRcdFx0Y2FzZSAwOiByZXR1cm4gPFN1YlZpZXcgIHNlZ3VlPXt0aGlzLnNlZ3VlV2l0aFBheWxvYWR9Lz47XG5cdFx0XHRjYXNlIDE6IHJldHVybiA8UGFzcyB0bz1cIlNoaXBcIiBzZWd1ZT17dGhpcy5zZWd1ZX0vPjtcblx0XHRcdGNhc2UgMjogcmV0dXJuIDxTaGlwVmlldyBwYXlsb2FkPXtzdGF0ZS5wYXlsb2FkfSBzZWd1ZT17dGhpcy5zZWd1ZVdpdGhQYXlsb2FkfS8+O1xuXHRcdFx0Y2FzZSAzOiByZXR1cm4gPFNvbmFyVmlldyBwYXlsb2FkPXtzdGF0ZS5wYXlsb2FkfSBzZWd1ZT17dGhpcy5zZWd1ZVdpdGhQYXlsb2FkfS8+O1xuXHRcdFx0Y2FzZSA0OiByZXR1cm4gPFBhc3MgdG89XCJTdWJcIiBzZWd1ZT17dGhpcy5zZWd1ZX0vPjtcblx0XHR9XG5cdH1cblxuXHRzZWd1ZSgpIHtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdHZpZXc6ICh0aGlzLnN0YXRlLnZpZXcgPT09IDQpID8gMCA6IHRoaXMuc3RhdGUudmlldyArIDFcblx0XHR9KTtcblx0fVxuXG5cdHNlZ3VlV2l0aFBheWxvYWQocGF5bG9hZCwgYWRkMikge1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0dmlldzogKHRoaXMuc3RhdGUudmlldyA9PT0gNCkgPyAwIDogdGhpcy5zdGF0ZS52aWV3ICsgKChhZGQyKSA/IDIgOiAxKSxcblx0XHRcdHBheWxvYWQ6IHBheWxvYWRcblx0XHR9KTtcblx0fVxufVxuXG5SZWFjdC5yZW5kZXIoPEFwcC8+LCBkb2N1bWVudC5ib2R5KTsiLCIvLyBjb252ZW5pZW5jZSBtZXRob2Rcbi8vIGJpbmRzIGV2ZXJ5IGZ1bmN0aW9uIGluIGluc3RhbmNlJ3MgcHJvdG90eXBlIHRvIHRoZSBpbnN0YW5jZSBpdHNlbGZcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaW5zdGFuY2UpIHtcblx0dmFyIHByb3RvID0gaW5zdGFuY2UuY29uc3RydWN0b3IucHJvdG90eXBlLFxuXHRcdGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhwcm90byksXG5cdFx0a2V5O1xuXHR3aGlsZSAoa2V5ID0ga2V5cy5wb3AoKSkgaWYgKHR5cGVvZiBwcm90b1trZXldID09PSAnZnVuY3Rpb24nICYmIGtleSAhPT0gJ2NvbnN0cnVjdG9yJykgaW5zdGFuY2Vba2V5XSA9IHByb3RvW2tleV0uYmluZChpbnN0YW5jZSk7XG59IiwiY29uc3Rcblx0UmVhY3QgPSByZXF1aXJlKFwicHJlYWN0XCIpLFxuXHRTdHlsZSA9IHJlcXVpcmUoXCIuLi9zdHlsZS5qc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihwcm9wcykge1xuXHRyZXR1cm4gKFxuXHRcdDxkaXYgc3R5bGU9e09iamVjdC5hc3NpZ24oe30sIFN0eWxlLkNhcmQsIHsgYmFja2dyb3VuZDpcInJhZGlhbC1ncmFkaWVudChjaXJjbGUsIFwiICsgcHJvcHMuY29sb3IgKyBcIiAxNSUsICMxMTExMTEgMTAwJSlcIiB9KX0+XG5cdFx0XHR7IHByb3BzLmNoaWxkcmVuIH1cblx0XHQ8L2Rpdj5cblx0KTtcbn1cbiIsImNvbnN0XG5cdFJlYWN0ID0gcmVxdWlyZShcInByZWFjdFwiKSxcblx0c3FydDNEaXZkZWRCeTIgPSBNYXRoLnNxcnQoMykgLyAyO1xuXG5jbGFzcyBIZXggZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXHRyZW5kZXIocHJvcHMpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PHN2ZyB2aWV3Qm94PVwiMCAwIDEgMVwiIHdpZHRoPXtzcXJ0M0RpdmRlZEJ5MiAqIDg4fSBoZWlnaHQ9ezg4fSBzdHlsZT1cImRpc3BsYXk6YmxvY2tcIj5cblx0XHRcdFx0PGcgb25DbGljaz17KHByb3BzLm9uQ2xpY2spID8gcHJvcHMub25DbGljayA6IHVuZGVmaW5lZCB9PlxuXHRcdFx0XHRcdDxwb2x5Z29uXG5cdFx0XHRcdFx0XHRwb2ludHM9XCIwLDAuNzUgMCwwLjI1IDAuNSwwIDEsMC4yNSAxLDAuNzUgMC41LDFcIlxuXHRcdFx0XHRcdFx0c3R5bGU9e3tcblx0XHRcdFx0XHRcdFx0ZmlsbDogcHJvcHMuYmcsXG5cdFx0XHRcdFx0XHRcdGZpbGxPcGFjaXR5Oihwcm9wcy5zZWxlY3RlZCA/IFwiMVwiIDogXCIwLjRcIilcblx0XHRcdFx0XHRcdH19XG5cdFx0XHRcdFx0PjwvcG9seWdvbj5cblx0XHRcdFx0XHR7cHJvcHMuY2hpbGRyZW59XG5cdFx0XHRcdDwvZz5cblx0XHRcdDwvc3ZnPlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBIZXg7IiwiY29uc3Rcblx0UmVhY3QgPSByZXF1aXJlKFwicHJlYWN0XCIpLFxuXHRIZXggPSByZXF1aXJlKFwiLi9IZXguanNcIiksXG5cdFN0eWxlID0gcmVxdWlyZShcIi4uL3N0eWxlLmpzXCIpLFxuXHRzcXJ0M0RpdmRlZEJ5MiA9IE1hdGguc3FydCgzKSAvIDI7XG5cbmNsYXNzIEhleEJ1dHRvbiBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdHJlbmRlcihwcm9wcykge1xuXHRcdHZhciBtYXJnaW4gPSAoMSAtIHNxcnQzRGl2ZGVkQnkyKSAvIDI7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxzdmcgdmlld0JveD1cIjAgMCAxIDFcIiB3aWR0aD17c3FydDNEaXZkZWRCeTIgKiAxMDB9IGhlaWdodD17MTAwfSBzdHlsZT17U3R5bGUuSGV4QnV0dG9ufT5cblx0XHRcdFx0PGcgb25DbGljaz17KHByb3BzLm9uQ2xpY2sgPyAoKSA9PiBwcm9wcy5vbkNsaWNrKHByb3BzLnRleHQpIDogdW5kZWZpbmVkKX0+XG5cdFx0XHRcdFx0PHBvbHlnb25cblx0XHRcdFx0XHRcdHBvaW50cz17bWFyZ2luICsgXCIsMC43NSBcIiArIG1hcmdpbiArIFwiLDAuMjUgMC41LDAgXCIgKyAoMS1tYXJnaW4pICsgXCIsMC4yNSBcIiArICgxLW1hcmdpbikgKyBcIiwwLjc1IDAuNSwxXCJ9XG5cdFx0XHRcdFx0XHRzdHlsZT17e1xuXHRcdFx0XHRcdFx0XHRmaWxsOiBwcm9wcy5iZyxcblx0XHRcdFx0XHRcdFx0ZmlsbE9wYWNpdHk6KHByb3BzLnNlbGVjdGVkID8gXCIxXCIgOiBcIjAuNFwiKVxuXHRcdFx0XHRcdFx0fX1cblx0XHRcdFx0XHQ+PC9wb2x5Z29uPlxuXHRcdFx0XHRcdDx0ZXh0XG5cdFx0XHRcdFx0XHR4PVwiMC41XCJcblx0XHRcdFx0XHRcdHk9XCIwLjc4XCJcblx0XHRcdFx0XHRcdHRleHQtYW5jaG9yPVwibWlkZGxlXCJcblx0XHRcdFx0XHRcdHN0eWxlPXsocHJvcHMuc2VsZWN0ZWQgPyB7XG5cdFx0XHRcdFx0XHRcdGZvbnRGYW1pbHk6IFwiT3BlbiBTYW5zXCIsXG5cdFx0XHRcdFx0XHRcdGZvbnRTaXplOiBcIjQuOCVcIixcblx0XHRcdFx0XHRcdFx0ZmlsbDogcHJvcHMuZmcsXG5cdFx0XHRcdFx0XHRcdGZpbGxPcGFjaXR5OiBcIjFcIlxuXHRcdFx0XHRcdFx0fSA6IHtcblx0XHRcdFx0XHRcdFx0Zm9udEZhbWlseTogXCJPcGVuIFNhbnNcIixcblx0XHRcdFx0XHRcdFx0Zm9udFNpemU6IFwiNC44JVwiLFxuXHRcdFx0XHRcdFx0XHRmaWxsOiBcIiMxMTExMTFcIixcblx0XHRcdFx0XHRcdFx0ZmlsbE9wYWNpdHk6IFwiMC41XCJcblx0XHRcdFx0XHRcdH0pfVxuXHRcdFx0XHRcdD57cHJvcHMudGV4dH08L3RleHQ+XG5cdFx0XHRcdDwvZz5cblx0XHRcdDwvc3ZnPlxuXHRcdCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBIZXhCdXR0b247IiwiY29uc3Rcblx0UmVhY3QgPSByZXF1aXJlKFwicHJlYWN0XCIpLFxuXG5cdFN0eWxlID0ge1xuXHRcdGRpdjoge1xuXHRcdFx0d2lkdGg6IFwiNjYlXCIsXG5cdFx0XHRkaXNwbGF5OiBcImZsZXhcIixcblx0XHRcdGp1c3RpZnlDb250ZW50OiBcImZsZXgtc3RhcnRcIixcblx0XHRcdGZsZXhXcmFwOiBcIndyYXBcIixcblx0XHRcdG1hcmdpbkJvdHRvbTogXCIycmVtXCJcblx0XHR9LFxuXHRcdHRleHQ6IHtcblx0XHRcdHdlYmtpdEZvbnRTbW9vdGhpbmc6IFwiYW50aWFsaWFzZWRcIixcblx0XHRcdGRpc3BsYXk6IFwiaW5saW5lXCIsXG5cdFx0XHRmb250U2l6ZTogXCIycmVtXCIsXG5cdFx0XHRmb250V2VpZ2h0OiBcIjIwMFwiLFxuXHRcdFx0bWFyZ2luOiBcIjAuNzVyZW1cIixcblx0XHRcdGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDAsMCwwLDApXCIsXG5cdFx0XHRjb2xvcjogXCIjZmZmZmZmXCJcblx0XHR9XG5cdH07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocHJvcHMpIHtcblx0dmFyIGxpc3QgPSBbXSxcblx0XHRpID0gLTE7XG5cblx0d2hpbGUgKCsraSA8IHByb3BzLmxpc3QubGVuZ3RoKSBsaXN0LnB1c2goXG5cdFx0PHBcblx0XHRcdHN0eWxlPXtTdHlsZS50ZXh0fVxuXHRcdD57cHJvcHMubGlzdFtpXX08L3A+XG5cdCk7XG5cblx0cmV0dXJuIChcblx0XHQ8ZGl2IHN0eWxlPXtTdHlsZS5kaXZ9PlxuXHRcdFx0e2xpc3R9XG5cdFx0PC9kaXY+XG5cdCk7XG59OyIsImNvbnN0XG5cdFJlYWN0ID0gcmVxdWlyZShcInByZWFjdFwiKSxcblx0U3R5bGUgPSByZXF1aXJlKFwiLi4vc3R5bGUuanNcIik7XG5cbmZ1bmN0aW9uIEJ1dHRvblJvdyhpbmRleCwgcHJvcHMsIGNhbGxiYWNrKSB7XG5cdHZhciBidXR0b25zID0gW10sXG5cdFx0d2lkdGggPSAzO1xuXG5cdHdoaWxlICh3aWR0aC0tICYmIGluZGV4IDw9IHByb3BzLnRvKSBidXR0b25zLnB1c2goXG5cdFx0PGJ1dHRvblxuXHRcdFx0c3R5bGU9e09iamVjdC5hc3NpZ24oe30sIFN0eWxlLk51bWJlckJ1dHRvbiwgeyBjb2xvcjogKHByb3BzLnNlbGVjdGVkLmluZGV4T2YoaW5kZXgpID09PSAtMSkgPyBcInJnYmEoMjU1LCAyNTUsIDI1NSwgMC4zKVwiIDogXCIjZmZmZmZmXCIgfSl9XG5cdFx0XHRkYXRhLWlkPXtpbmRleH1cblx0XHRcdG9uQ2xpY2s9e2NhbGxiYWNrfVxuXHRcdD57KFwiXCIgKyBpbmRleCsrKX08L2J1dHRvbj5cblx0KTtcblxuXHRyZXR1cm4gKDxkaXYgc3R5bGU9e1N0eWxlLkZsZXhSb3d9PntidXR0b25zfTwvZGl2Pik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocHJvcHMpIHtcblx0dmFyIGkgPSBwcm9wcy5mcm9tLFxuXHRcdHJvd3MgPSBbXSxcblx0XHRjYWxsYmFjayA9IChlKSA9PiBwcm9wcy5vbkNsaWNrKE51bWJlcihlLnRhcmdldC5kYXRhc2V0LmlkKSk7XG5cdFx0XG5cdHdoaWxlIChpIDw9IHByb3BzLnRvKSB7XG5cdFx0cm93cy5wdXNoKEJ1dHRvblJvdyhpLCBwcm9wcywgY2FsbGJhY2spKTtcblx0XHRpICs9IDM7XG5cdH1cblxuXHRyZXR1cm4gKFxuXHRcdDxkaXYgc3R5bGU9e1N0eWxlLk51bWJlckJveH0+XG5cdFx0XHR7cm93c31cblx0XHQ8L2Rpdj5cblx0KTtcbn07IiwiY29uc3Rcblx0UmVhY3QgPSByZXF1aXJlKFwicHJlYWN0XCIpLFxuXHRTdHlsZSA9IHJlcXVpcmUoXCIuLi9zdHlsZS5qc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihwcm9wcykge1xuXHRzZXRUaW1lb3V0KCgpID0+IHByb3BzLnNlZ3VlKCksIDIwMDApO1xuXHRyZXR1cm4gKFxuXHRcdDxkaXYgc3R5bGU9e1N0eWxlLk1haW5MYXlvdXR9PlxuXHRcdFx0PGltZyBzcmM9XCIuL2Rpc3QvaW1nL0JBQ0sucG5nXCIgc3R5bGU9e1N0eWxlLmltZ30vPlxuXHRcdFx0PGgyPntcIlBhc3MgdGhpcyB0byB0aGUgXCIgKyBwcm9wcy50byArIFwiIHBsYXllci5cIn08L2gyPlxuXHRcdDwvZGl2PlxuXHQpO1xufSIsImNvbnN0XG5cdFJlYWN0ID0gcmVxdWlyZShcInByZWFjdFwiKSxcblx0SGV4QnV0dG9uID0gcmVxdWlyZShcIi4vSGV4QnV0dG9uLmpzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHByb3BzLCBzdGF0ZSkge1xuXHRyZXR1cm4gKFxuXHRcdDxkaXYgc3R5bGU9XCJkaXNwbGF5OiBmbGV4OyBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcIj5cblx0XHRcdDxIZXhCdXR0b24gdGV4dD1cIlJcIiBmZz1cIiNmZjAwMDBcIiBiZz1cIiNmZmZmZmZcIiBzZWxlY3RlZD17KHByb3BzLnNlbGVjdGVkID09PSBcIlJcIil9IG9uQ2xpY2s9e3Byb3BzLm9uU2VsZWN0fS8+XG5cdFx0XHQ8SGV4QnV0dG9uIHRleHQ9XCJQXCIgZmc9XCIjY2MwMGNjXCIgYmc9XCIjZmZmZmZmXCIgc2VsZWN0ZWQ9eyhwcm9wcy5zZWxlY3RlZCA9PT0gXCJQXCIpfSBvbkNsaWNrPXtwcm9wcy5vblNlbGVjdH0vPlxuXHRcdFx0PEhleEJ1dHRvbiB0ZXh0PVwiT1wiIGZnPVwiI2ZmOTkwMFwiIGJnPVwiI2ZmZmZmZlwiIHNlbGVjdGVkPXsocHJvcHMuc2VsZWN0ZWQgPT09IFwiT1wiKX0gb25DbGljaz17cHJvcHMub25TZWxlY3R9Lz5cblx0XHRcdDxIZXhCdXR0b24gdGV4dD1cIkdcIiBmZz1cIiMwMGNjMzNcIiBiZz1cIiNmZmZmZmZcIiBzZWxlY3RlZD17KHByb3BzLnNlbGVjdGVkID09PSBcIkdcIil9IG9uQ2xpY2s9e3Byb3BzLm9uU2VsZWN0fS8+XG5cdFx0PC9kaXY+XG5cdCk7XG59OyIsImNvbnN0XG5cdFJlYWN0ID0gcmVxdWlyZShcInByZWFjdFwiKSxcblxuXHRCaW5kID0gcmVxdWlyZShcIi4uL2JpbmQuanNcIiksXG5cblx0TnVtYmVyU2VsZWN0b3IgPSByZXF1aXJlKFwiLi9OdW1iZXJTZWxlY3Rvci5qc1wiKSxcblx0Q2FyZCA9IHJlcXVpcmUoXCIuL0NhcmQuanNcIiksXG5cdFN0eWxlID0gcmVxdWlyZShcIi4uL3N0eWxlLmpzXCIpO1xuXG5jbGFzcyBTaGlwVmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cdGNvbnN0cnVjdG9yKHByb3BzLCBjb250ZXh0KSB7XG5cdFx0c3VwZXIocHJvcHMpO1xuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRkZXRlY3Rpb246IDBcblx0XHR9O1xuXG5cdFx0QmluZCh0aGlzKTtcblx0fVxuXG5cdHJlbmRlcihwcm9wcywgc3RhdGUpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PHNlY3Rpb24gc3R5bGU9e1N0eWxlLk1haW5MYXlvdXR9PlxuXHRcdFx0XHQ8Q2FyZCBjb2xvcj1cIiNjY2NjY2NcIj5cblx0XHRcdFx0XHQ8aDI+RGV0ZWN0aW9uPC9oMj5cblx0XHRcdFx0XHQ8TnVtYmVyU2VsZWN0b3Igc2VsZWN0ZWQ9e1tzdGF0ZS5kZXRlY3Rpb25dfSBmcm9tPXswfSB0bz17MTJ9IG9uQ2xpY2s9e3RoaXMuc2VsZWN0RGV0ZWN0aW9ufSAvPlxuXHRcdFx0XHQ8L0NhcmQ+XG5cdFx0XHRcdDxidXR0b25cblx0XHRcdFx0XHRzdHlsZT17U3R5bGUuU2VndWVCdXR0b259XG5cdFx0XHRcdFx0b25DbGljaz17dGhpcy52aWV3U29uYXJ9XG5cdFx0XHRcdD57KHRoaXMuc3RhdGUuZGV0ZWN0aW9uID09PSAwKSA/IFwiRG9uZVwiIDogXCJWaWV3IERhdGFcIn08L2J1dHRvbj5cblx0XHRcdDwvc2VjdGlvbj5cblx0XHQpO1xuXHR9XG5cblx0c2VsZWN0RGV0ZWN0aW9uKHMpIHtcblx0XHRpZiAodGhpcy5zdGF0ZS5kZXRlY3Rpb24gIT09IHMpIHRoaXMuc2V0U3RhdGUoe2RldGVjdGlvbjogc30pO1xuXHR9XG5cblx0dmlld1NvbmFyKCkge1xuXHRcdHRoaXMucHJvcHMuc2VndWUoXG5cdFx0XHR0aGlzLnByb3BzLnBheWxvYWQodGhpcy5zdGF0ZS5kZXRlY3Rpb24sICh0aGlzLnN0YXRlLmRldGVjdGlvbiA9PT0gMCkpIC8vIHNoaXAgc29uYXIgZnVuY3Rpb25cblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2hpcFZpZXc7IiwiY29uc3Rcblx0UmVhY3QgPSByZXF1aXJlKFwicHJlYWN0XCIpLFxuXG5cdEJpbmQgPSByZXF1aXJlKFwiLi4vYmluZC5qc1wiKSxcblxuXHRIZXhCdXR0b24gPSByZXF1aXJlKFwiLi9IZXhCdXR0b24uanNcIiksXG5cdE51bWJlckxpc3QgPSByZXF1aXJlKFwiLi9OdW1iZXJMaXN0LmpzXCIpLFxuXHRDYXJkID0gcmVxdWlyZShcIi4vQ2FyZC5qc1wiKSxcblx0U29uYXIgPSByZXF1aXJlKFwiLi4vc29uYXIuanNcIiksXG5cblx0U3R5bGUgPSByZXF1aXJlKFwiLi4vc3R5bGUuanNcIik7XG5cbmZ1bmN0aW9uIHBhcnNlRHJhdyhjYXJkcykge1xuXHR2YXIgZHJhdyA9IHtcblx0XHRcdFI6IFtdLFxuXHRcdFx0UDogW10sXG5cdFx0XHRPOiBbXSxcblx0XHRcdEc6IFtdLFxuXHRcdFx0UzogW10sXG5cdFx0XHREOiBbXVxuXHRcdH0sXG5cdFx0YztcblxuXHR3aGlsZSAoYyA9IGNhcmRzLnBvcCgpKSBkcmF3W2NbMF1dLnB1c2goTnVtYmVyKGNbMV0pKTtcblxuXHRkcmF3LlIuc29ydCgpO1xuXHRkcmF3LlAuc29ydCgpO1xuXHRkcmF3Lk8uc29ydCgpO1xuXHRkcmF3Lkcuc29ydCgpO1xuXHRkcmF3LlMuc29ydCgpO1xuXHRkcmF3LkQuc29ydCgpO1xuXG5cdHJldHVybiBkcmF3O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHByb3BzLCBzdGF0ZSkge1xuXHR2YXIgZHJhdyA9IHBhcnNlRHJhdyhwcm9wcy5wYXlsb2FkKSxcblx0XHRjYXJkcyA9IFtdO1xuXG5cdGlmIChkcmF3LlIubGVuZ3RoKSBjYXJkcy5wdXNoKFxuXHRcdDxDYXJkIGNvbG9yPXtTb25hci5Db2xvckZvclF1YWRyYW50KFwiUlwiKX0+XG5cdFx0XHQ8SGV4QnV0dG9uIHRleHQ9XCJSXCIgc2VsZWN0ZWQ9XCJ0cnVlXCIgZmc9e1NvbmFyLkNvbG9yRm9yUXVhZHJhbnQoXCJSXCIpfSBiZz1cIiNmZmZmZmZcIi8+XG5cdFx0XHQ8TnVtYmVyTGlzdCBsaXN0PXtkcmF3LlJ9IC8+XG5cdFx0PC9DYXJkPlxuXHQpO1xuXG5cdGlmIChkcmF3LlAubGVuZ3RoKSBjYXJkcy5wdXNoKFxuXHRcdDxDYXJkIGNvbG9yPXtTb25hci5Db2xvckZvclF1YWRyYW50KFwiUFwiKX0+XG5cdFx0XHQ8SGV4QnV0dG9uIHRleHQ9XCJQXCIgc2VsZWN0ZWQ9XCJ0cnVlXCIgZmc9e1NvbmFyLkNvbG9yRm9yUXVhZHJhbnQoXCJQXCIpfSBiZz1cIiNmZmZmZmZcIi8+XG5cdFx0XHQ8TnVtYmVyTGlzdCBsaXN0PXtkcmF3LlB9IC8+XG5cdFx0PC9DYXJkPlxuXHQpO1xuXG5cdGlmIChkcmF3Lk8ubGVuZ3RoKSBjYXJkcy5wdXNoKFxuXHRcdDxDYXJkIGNvbG9yPXtTb25hci5Db2xvckZvclF1YWRyYW50KFwiT1wiKX0+XG5cdFx0XHQ8SGV4QnV0dG9uIHRleHQ9XCJPXCIgc2VsZWN0ZWQ9XCJ0cnVlXCIgZmc9e1NvbmFyLkNvbG9yRm9yUXVhZHJhbnQoXCJPXCIpfSBiZz1cIiNmZmZmZmZcIi8+XG5cdFx0XHQ8TnVtYmVyTGlzdCBsaXN0PXtkcmF3Lk99IC8+XG5cdFx0PC9DYXJkPlxuXHQpO1xuXG5cdGlmIChkcmF3LkcubGVuZ3RoKSBjYXJkcy5wdXNoKFxuXHRcdDxDYXJkIGNvbG9yPXtTb25hci5Db2xvckZvclF1YWRyYW50KFwiR1wiKX0+XG5cdFx0XHQ8SGV4QnV0dG9uIHRleHQ9XCJHXCIgc2VsZWN0ZWQ9XCJ0cnVlXCIgZmc9e1NvbmFyLkNvbG9yRm9yUXVhZHJhbnQoXCJHXCIpfSBiZz1cIiNmZmZmZmZcIi8+XG5cdFx0XHQ8TnVtYmVyTGlzdCBsaXN0PXtkcmF3Lkd9IC8+XG5cdFx0PC9DYXJkPlxuXHQpO1xuXG5cdGlmIChkcmF3LlMubGVuZ3RoKSBjYXJkcy5wdXNoKFxuXHRcdDxDYXJkIGNvbG9yPVwiIzAxMzlhNFwiPlxuXHRcdFx0PGgyPlNwZWVkPC9oMj5cblx0XHRcdDxOdW1iZXJMaXN0IGxpc3Q9e2RyYXcuU30gLz5cblx0XHQ8L0NhcmQ+XG5cdCk7XG5cblx0aWYgKGRyYXcuRC5sZW5ndGgpIGNhcmRzLnB1c2goXG5cdFx0PENhcmQgY29sb3I9XCIjMzMzMzMzXCI+XG5cdFx0XHQ8aDI+RGVwdGg8L2gyPlxuXHRcdFx0PE51bWJlckxpc3QgbGlzdD17ZHJhdy5EfSAvPlxuXHRcdDwvQ2FyZD5cblx0KTtcblxuXHRyZXR1cm4gKFxuXHRcdDxzZWN0aW9uIHN0eWxlPXtTdHlsZS5NYWluTGF5b3V0fT5cblx0XHRcdHtjYXJkc31cblx0XHRcdDxidXR0b24gc3R5bGU9e1N0eWxlLlNlZ3VlQnV0dG9ufSBvbkNsaWNrPXsoKSA9PiBwcm9wcy5zZWd1ZSgpfT5Eb25lPC9idXR0b24+XG5cdFx0PC9zZWN0aW9uPlxuXHQpO1xufTsiLCJjb25zdFxuXHRSZWFjdCA9IHJlcXVpcmUoXCJwcmVhY3RcIiksXG5cblx0QmluZCA9IHJlcXVpcmUoXCIuLi9iaW5kLmpzXCIpLFxuXG5cdENhcmQgPSByZXF1aXJlKFwiLi9DYXJkLmpzXCIpLFxuXHRRdWFkcmFudFNlbGVjdG9yID0gcmVxdWlyZShcIi4vUXVhZHJhbnRTZWxlY3Rvci5qc1wiKSxcblx0TnVtYmVyU2VsZWN0b3IgPSByZXF1aXJlKFwiLi9OdW1iZXJTZWxlY3Rvci5qc1wiKSxcblx0U29uYXIgPSByZXF1aXJlKFwiLi4vc29uYXIuanNcIiksXG5cblx0U3R5bGUgPSByZXF1aXJlIChcIi4uL3N0eWxlLmpzXCIpO1xuXG5jbGFzcyBTdWJWaWV3IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IocHJvcHMsIGNvbnRleHQpIHtcblx0XHRzdXBlcihwcm9wcyk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0cXVhZHJhbnQ6IFwiUlwiLFxuXHRcdFx0cXVhZHJhbnRDb2xvcjogXCIjZmYwMDAwXCIsXG5cdFx0XHRwb3NBOiB1bmRlZmluZWQsXG5cdFx0XHRwb3NCOiB1bmRlZmluZWQsXG5cdFx0XHRzcGVlZDogdW5kZWZpbmVkLFxuXHRcdFx0ZGVwdGg6IHVuZGVmaW5lZCxcblx0XHRcdHN0ZWFsdGg6IHVuZGVmaW5lZFxuXHRcdH07XG5cblx0XHRCaW5kKHRoaXMpO1xuXHR9XG5cblx0cmVuZGVyKHByb3BzLCBzdGF0ZSkge1xuXHRcdHZhciBub1NlZ3VlID0gKHN0YXRlLnBvc0EgICAgPT09IHVuZGVmaW5lZFxuXHRcdFx0XHRcdHx8IHN0YXRlLnBvc0IgICAgPT09IHVuZGVmaW5lZFxuXHRcdFx0XHRcdHx8IHN0YXRlLnNwZWVkICAgPT09IHVuZGVmaW5lZFxuXHRcdFx0XHRcdHx8IHN0YXRlLmRlcHRoICAgPT09IHVuZGVmaW5lZFxuXHRcdFx0XHRcdHx8IHN0YXRlLnN0ZWFsdGggPT09IHVuZGVmaW5lZClcblx0XHRyZXR1cm4gKFxuXHRcdFx0PHNlY3Rpb24gc3R5bGU9e1N0eWxlLk1haW5MYXlvdXR9PlxuXHRcdFx0XHQ8Q2FyZCBjb2xvcj17c3RhdGUucXVhZHJhbnRDb2xvcn0+XG5cdFx0XHRcdFx0PFF1YWRyYW50U2VsZWN0b3Igc2VsZWN0ZWQ9e3N0YXRlLnF1YWRyYW50fSBvblNlbGVjdD17dGhpcy5zZWxlY3RRdWFkcmFudH0gLz5cblx0XHRcdFx0XHQ8TnVtYmVyU2VsZWN0b3IgZmc9e3N0YXRlLnF1YWRyYW50Q29sb3J9IHNlbGVjdGVkPXtbdGhpcy5zdGF0ZS5wb3NBLCB0aGlzLnN0YXRlLnBvc0JdfSBmcm9tPXswfSB0bz17OX0gb25DbGljaz17dGhpcy5zZWxlY3RQb3NpdGlvbn0gLz5cblx0XHRcdFx0PC9DYXJkPlxuXHRcdFx0XHQ8Q2FyZCBjb2xvcj1cIiMzMzMzMzNcIj5cblx0XHRcdFx0XHQ8aDI+U3BlZWQ8L2gyPlxuXHRcdFx0XHRcdDxOdW1iZXJTZWxlY3RvciBzZWxlY3RlZD17W3N0YXRlLnNwZWVkXX0gZnJvbT17MH0gdG89ezR9IG9uQ2xpY2s9e3RoaXMuc2VsZWN0U3BlZWR9IC8+XG5cdFx0XHRcdDwvQ2FyZD5cblx0XHRcdFx0PENhcmQgY29sb3I9XCIjMDEzOWE0XCI+XG5cdFx0XHRcdFx0PGgyPkRlcHRoPC9oMj5cblx0XHRcdFx0XHQ8TnVtYmVyU2VsZWN0b3Igc2VsZWN0ZWQ9e1tzdGF0ZS5kZXB0aF19IGZyb209ezB9IHRvPXs0fSBvbkNsaWNrPXt0aGlzLnNlbGVjdERlcHRofSAvPlxuXHRcdFx0XHQ8L0NhcmQ+XG5cdFx0XHRcdDxDYXJkIGNvbG9yPVwiIzk5OTk5OVwiPlxuXHRcdFx0XHRcdDxoMj5TdGVhbHRoPC9oMj5cblx0XHRcdFx0XHQ8TnVtYmVyU2VsZWN0b3Igc2VsZWN0ZWQ9e1tzdGF0ZS5zdGVhbHRoXX0gZnJvbT17MH0gdG89ezEyfSBvbkNsaWNrPXt0aGlzLnNlbGVjdFN0ZWFsdGh9IC8+XG5cdFx0XHRcdDwvQ2FyZD5cblx0XHRcdFx0PGJ1dHRvblxuXHRcdFx0XHRcdHN0eWxlPXsobm9TZWd1ZSA/IFN0eWxlLkRpc2FibGVkQnV0dG9uIDogU3R5bGUuU2VndWVCdXR0b24pfVxuXHRcdFx0XHRcdG9uQ2xpY2s9e3RoaXMuc3RhY2tEZWNrfVxuXHRcdFx0XHRcdGRpc2FibGVkPXtub1NlZ3VlfVxuXHRcdFx0XHQ+RG9uZTwvYnV0dG9uPlxuXHRcdFx0PC9zZWN0aW9uPlxuXHRcdCk7XG5cdH1cblxuXHRzZWxlY3RRdWFkcmFudChxKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRxdWFkcmFudDogcSxcblx0XHRcdHF1YWRyYW50Q29sb3I6IFNvbmFyLkNvbG9yRm9yUXVhZHJhbnQocSlcblx0XHR9KTtcblx0fVxuXG5cdHNlbGVjdFBvc2l0aW9uKHApIHtcblx0XHR2YXIgc3RhdGUgPSB7XG5cdFx0XHRwb3NBOiB0aGlzLnN0YXRlLnBvc0EsXG5cdFx0XHRwb3NCOiB0aGlzLnN0YXRlLnBvc0Jcblx0XHR9O1xuXG5cdFx0aWYgKHN0YXRlLnBvc0EgPT09IHApIHN0YXRlLnBvc0EgPSB1bmRlZmluZWQ7XG5cdFx0ZWxzZSBpZiAoc3RhdGUucG9zQiA9PT0gcCkgc3RhdGUucG9zQiA9IHVuZGVmaW5lZDtcblx0XHRlbHNlIGlmIChzdGF0ZS5wb3NBID09PSB1bmRlZmluZWQpIHN0YXRlLnBvc0EgPSBwO1xuXHRcdGVsc2UgaWYgKHN0YXRlLnBvc0IgPT0gdW5kZWZpbmVkKSBzdGF0ZS5wb3NCID0gcDtcblx0XHRcblx0XHR0aGlzLnNldFN0YXRlKHN0YXRlKTtcblx0fVxuXG5cdHNlbGVjdFNwZWVkKHMpIHtcblx0XHRpZiAodGhpcy5zdGF0ZS5zcGVlZCAhPT0gcykgdGhpcy5zZXRTdGF0ZSh7c3BlZWQ6IHN9KTtcblx0fVxuXG5cdHNlbGVjdERlcHRoKHMpIHtcblx0XHRpZiAodGhpcy5zdGF0ZS5kZXB0aCAhPT0gcykgdGhpcy5zZXRTdGF0ZSh7ZGVwdGg6IHN9KTtcblx0fVxuXG5cdHNlbGVjdFN0ZWFsdGgocykge1xuXHRcdGlmICh0aGlzLnN0YXRlLnN0ZWFsdGggIT09IHMpIHRoaXMuc2V0U3RhdGUoe3N0ZWFsdGg6IHN9KTtcblx0fVxuXG5cdHN0YWNrRGVjaygpIHtcblx0XHR0aGlzLnByb3BzLnNlZ3VlKFxuXHRcdFx0U29uYXIuU3ViU29uYXIodGhpcy5zdGF0ZS5xdWFkcmFudCArIHRoaXMuc3RhdGUucG9zQSwgdGhpcy5zdGF0ZS5xdWFkcmFudCArIHRoaXMuc3RhdGUucG9zQiwgXCJTXCIgKyB0aGlzLnN0YXRlLnNwZWVkLCBcIkRcIiArIHRoaXMuc3RhdGUuZGVwdGgsIHRoaXMuc3RhdGUuc3RlYWx0aClcblx0XHQpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU3ViVmlldzsiLCIvLyBPYmplY3QuYXNzaWduIFBPTFlGSUxMXG4vLyBzb3VyY2U6IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9hc3NpZ24jUG9seWZpbGxcbi8vXG5pZiAodHlwZW9mIE9iamVjdC5hc3NpZ24gIT0gJ2Z1bmN0aW9uJykge1xuXHRPYmplY3QuYXNzaWduID0gZnVuY3Rpb24odGFyZ2V0LCB2YXJBcmdzKSB7IC8vIC5sZW5ndGggb2YgZnVuY3Rpb24gaXMgMlxuXHRcdCd1c2Ugc3RyaWN0Jztcblx0XHRpZiAodGFyZ2V0ID09IG51bGwpIHsgLy8gVHlwZUVycm9yIGlmIHVuZGVmaW5lZCBvciBudWxsXG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY29udmVydCB1bmRlZmluZWQgb3IgbnVsbCB0byBvYmplY3QnKTtcblx0XHR9XG5cblx0XHR2YXIgdG8gPSBPYmplY3QodGFyZ2V0KTtcblxuXHRcdGZvciAodmFyIGluZGV4ID0gMTsgaW5kZXggPCBhcmd1bWVudHMubGVuZ3RoOyBpbmRleCsrKSB7XG5cdFx0XHR2YXIgbmV4dFNvdXJjZSA9IGFyZ3VtZW50c1tpbmRleF07XG5cblx0XHRcdGlmIChuZXh0U291cmNlICE9IG51bGwpIHsgLy8gU2tpcCBvdmVyIGlmIHVuZGVmaW5lZCBvciBudWxsXG5cdFx0XHRcdGZvciAodmFyIG5leHRLZXkgaW4gbmV4dFNvdXJjZSkge1xuXHRcdFx0XHRcdC8vIEF2b2lkIGJ1Z3Mgd2hlbiBoYXNPd25Qcm9wZXJ0eSBpcyBzaGFkb3dlZFxuXHRcdFx0XHRcdGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobmV4dFNvdXJjZSwgbmV4dEtleSkpIHtcblx0XHRcdFx0XHRcdHRvW25leHRLZXldID0gbmV4dFNvdXJjZVtuZXh0S2V5XTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHRvO1xuXHR9O1xufSIsImZ1bmN0aW9uIHNvbmFyRGVjaygpIHtcblx0cmV0dXJuIFtcblx0XHRcIkcwXCIsXG5cdFx0XCJHMVwiLFxuXHRcdFwiRzJcIixcblx0XHRcIkczXCIsXG5cdFx0XCJHNFwiLFxuXHRcdFwiRzVcIixcblx0XHRcIkc2XCIsXG5cdFx0XCJHN1wiLFxuXHRcdFwiRzhcIixcblx0XHRcIkc5XCIsXG5cdFx0XCJQMFwiLFxuXHRcdFwiUDFcIixcblx0XHRcIlAyXCIsXG5cdFx0XCJQM1wiLFxuXHRcdFwiUDRcIixcblx0XHRcIlA1XCIsXG5cdFx0XCJQNlwiLFxuXHRcdFwiUDdcIixcblx0XHRcIlA4XCIsXG5cdFx0XCJQOVwiLFxuXHRcdFwiTzBcIixcblx0XHRcIk8xXCIsXG5cdFx0XCJPMlwiLFxuXHRcdFwiTzNcIixcblx0XHRcIk80XCIsXG5cdFx0XCJPNVwiLFxuXHRcdFwiTzZcIixcblx0XHRcIk83XCIsXG5cdFx0XCJPOFwiLFxuXHRcdFwiTzlcIixcblx0XHRcIlIwXCIsXG5cdFx0XCJSMVwiLFxuXHRcdFwiUjJcIixcblx0XHRcIlIzXCIsXG5cdFx0XCJSNFwiLFxuXHRcdFwiUjVcIixcblx0XHRcIlI2XCIsXG5cdFx0XCJSN1wiLFxuXHRcdFwiUjhcIixcblx0XHRcIlI5XCIsXG5cdFx0XCJEMFwiLFxuXHRcdFwiRDFcIixcblx0XHRcIkQyXCIsXG5cdFx0XCJEM1wiLFxuXHRcdFwiRDRcIixcblx0XHRcIlMwXCIsXG5cdFx0XCJTMVwiLFxuXHRcdFwiUzJcIixcblx0XHRcIlMzXCIsXG5cdFx0XCJTNFwiXG5cdF07XG59XG5cbmZ1bmN0aW9uIEZpc2hlcllhdGVzU2h1ZmZsZShkZWNrKSB7XG5cdHZhciAgdGVtcCwgaSwgajtcblxuXHRpID0gZGVjay5sZW5ndGg7XG5cdHdoaWxlKGkpIHtcblx0XHRqID0gKE1hdGgucmFuZG9tKCkgKiBpLS0pID4+IDA7IFxuXG5cdFx0dGVtcCA9IGRlY2tbaV07XG5cdFx0ZGVja1tpXSA9IGRlY2tbal07XG5cdFx0ZGVja1tqXSA9IHRlbXA7XG5cdH1cbn1cblxuZnVuY3Rpb24gc2h1ZmZsZShkZWNrLCB0aW1lcykge1xuXHR3aGlsZSAodGltZXMtLSkgRmlzaGVyWWF0ZXNTaHVmZmxlKGRlY2spO1xufVxuXG5mdW5jdGlvbiBTaGlwU29uYXIoZGV0ZWN0aW9uKSB7XG5cdHdoaWxlIChkZXRlY3Rpb24gPCB0aGlzLmxlbmd0aCkgdGhpcy5wb3AoKTtcblx0cmV0dXJuIHRoaXM7XG59XG5cbmZ1bmN0aW9uIFN1YlNvbmFyKHBvc0EsIHBvc0IsIHNwZWVkLCBkZXB0aCwgc3RlYWx0aCkge1xuXHR2YXIgZGVjayA9IHNvbmFyRGVjaygpLFxuXHRcdHNvbmFyID0gW10sXG5cdFx0aTtcblxuXHRpID0gZGVjay5pbmRleE9mKHBvc0EpO1xuXHRpZiAoaSAhPT0gLTEpIHNvbmFyLnB1c2goZGVjay5zcGxpY2UoaSwgMSlbMF0pO1xuXHRlbHNlIHRocm93IFwiUG9zaXRpb246IFwiICsgcG9zQSArIFwiIG5vdCBpbiBTb25hciFcIjtcblxuXHRpID0gZGVjay5pbmRleE9mKHBvc0IpO1xuXHRpZiAoaSAhPT0gLTEpIHNvbmFyLnB1c2goZGVjay5zcGxpY2UoaSwgMSlbMF0pO1xuXHRlbHNlIHRocm93IFwiUG9zaXRpb246IFwiICsgcG9zQiArIFwiIG5vdCBpbiBTb25hciFcIjtcblxuXHRpID0gZGVjay5pbmRleE9mKHNwZWVkKTtcblx0aWYgKGkgIT09IC0xKSBzb25hci5wdXNoKGRlY2suc3BsaWNlKGksIDEpWzBdKTtcblx0ZWxzZSB0aHJvdyBcIlNwZWVkOiBcIiArIHNwZWVkICsgXCIgbm90IGluIFNvbmFyIVwiO1xuXG5cdGkgPSBkZWNrLmluZGV4T2YoZGVwdGgpO1xuXHRpZiAoaSAhPT0gLTEpIHNvbmFyLnB1c2goZGVjay5zcGxpY2UoaSwgMSlbMF0pO1xuXHRlbHNlIHRocm93IFwiU3BlZWQ6IFwiICsgZGVwdGggKyBcIiBub3QgaW4gU29uYXIhXCI7XG5cblx0c2h1ZmZsZShkZWNrLCAyKTtcblxuXHR3aGlsZSAoc3RlYWx0aC0tKSB7XG5cdFx0aSA9IChNYXRoLnJhbmRvbSgpICogZGVjay5sZW5ndGgpID4+IDA7XG5cdFx0c29uYXIucHVzaChkZWNrLnNwbGljZShpLCAxKVswXSk7XG5cdH1cblxuXHRzaHVmZmxlKHNvbmFyLCAyKTtcblxuXHRyZXR1cm4gU2hpcFNvbmFyLmJpbmQoc29uYXIpO1xufVxuXG5mdW5jdGlvbiBDb2xvckZvclF1YWRyYW50KHEpIHtcblx0c3dpdGNoIChxKSB7XG5cdFx0Y2FzZSBcIlJcIjogcmV0dXJuIFwiI2ZmMDAwMFwiO1xuXHRcdGNhc2UgXCJQXCI6IHJldHVybiBcIiNjYzAwY2NcIjtcblx0XHRjYXNlIFwiT1wiOiByZXR1cm4gXCIjZmY5OTAwXCI7XG5cdFx0Y2FzZSBcIkdcIjogcmV0dXJuIFwiIzAwY2MzM1wiO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geyBTdWJTb25hcjogU3ViU29uYXIsIENvbG9yRm9yUXVhZHJhbnQ6IENvbG9yRm9yUXVhZHJhbnQgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcblx0TWFpbkxheW91dDoge1xuXHRcdGRpc3BsYXk6IFwiZmxleFwiLFxuXHRcdGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG5cdFx0anVzdGlmeUNvbnRlbnQ6IFwiZmxleC1zdGFydFwiLFxuXHRcdGFsaWduSXRlbXM6IFwiY2VudGVyXCJcblx0fSxcblx0U2VndWVCdXR0b246IHtcblx0XHR3aWR0aDogXCIyMHJlbVwiLFxuXHRcdGhlaWdodDogXCI0cmVtXCIsXG5cdFx0Zm9udFdlaWdodDogXCIyMDBcIixcblx0XHRmb250U2l6ZTogXCIycmVtXCIsXG5cdFx0Ym9yZGVyOiBcIm5vbmVcIixcblx0XHRvdXRsaW5lOiBcIm5vbmVcIixcblx0XHRjb2xvcjogXCIjZmZmZmZmXCIsXG5cdFx0YmFja2dyb3VuZENvbG9yOiBcInJnYmEoMjU1LDI1NSwyNTUsMC41KVwiXG5cdH0sXG5cdERpc2FibGVkQnV0dG9uOiB7XG5cdFx0d2lkdGg6IFwiMjByZW1cIixcblx0XHRoZWlnaHQ6IFwiNHJlbVwiLFxuXHRcdGZvbnRXZWlnaHQ6IFwiMjAwXCIsXG5cdFx0Zm9udFNpemU6IFwiMnJlbVwiLFxuXHRcdGJvcmRlcjogXCJub25lXCIsXG5cdFx0b3V0bGluZTogXCJub25lXCIsXG5cdFx0Y29sb3I6IFwiIzIyMjIyMlwiLFxuXHRcdGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDI1NSwyNTUsMjU1LDAuMjUpXCJcblx0fSxcblx0TnVtYmVyQm94OiB7XG5cdFx0bWFyZ2luTGVmdDogXCJhdXRvXCIsXG5cdFx0bWFyZ2luUmlnaHQ6IFwiYXV0b1wiLFxuXHRcdHdpZHRoOiBcIjgwJVwiLFxuXHRcdGRpc3BsYXk6IFwiZmxleFwiLFxuXHRcdGp1c3RpZnlDb250ZW50OiBcImZsZXgtc3RhcnRcIixcblx0XHRhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxuXHRcdGZsZXhXcmFwOiBcIndyYXBcIixcblx0XHRtYXJnaW5Cb3R0b206IFwiMnJlbVwiXG5cdH0sXG5cdEZsZXhSb3c6IHtcblx0XHR3aWR0aDogXCIxMDAlXCIsXG5cdFx0ZGlzcGxheTogXCJmbGV4XCIsXG5cdFx0anVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG5cdFx0YWxpZ25JdGVtczogXCJjZW50ZXJcIlxuXHR9LFxuXHROdW1iZXJCdXR0b246IHtcblx0XHRib3JkZXI6IFwibm9uZVwiLFxuXHRcdG91dGxpbmU6IFwibm9uZVwiLFxuXHRcdGZvbnRTaXplOiBcIjJyZW1cIixcblx0XHRmb250V2VpZ2h0OiBcIjIwMFwiLFxuXHRcdG1hcmdpbjogXCIwLjc1cmVtXCIsXG5cdFx0YmFja2dyb3VuZENvbG9yOiBcInJnYmEoMCwwLDAsMClcIlxuXHR9LFxuXHRIZXhCdXR0b246IHtcblx0XHRkaXNwbGF5OiBcImlubGluZVwiLFxuXHRcdG1hcmdpblRvcDogXCIxcmVtXCIsXG5cdFx0bWFyZ2luTGVmdDogXCIwLjE1cmVtXCIsXG5cdFx0bWFyZ2luUmlnaHQ6IFwiMC4xNXJlbVwiLFxuXHRcdGZvbnRGYW1pbHk6IFwiT3BlbiBTYW5zXCIsXG5cdFx0Zm9udFNpemU6IFwiMXJlbVwiLFxuXHRcdHdpZHRoOiBcIjRyZW1cIixcblx0XHRoZWlnaHQ6IFwiNHJlbVwiXG5cdH0sXG5cdENhcmQ6IHtcblx0XHRtYXJnaW5Cb3R0b206IFwiMXJlbVwiLFxuXHRcdHdpZHRoOiBcIjEwMCVcIixcblx0XHRib3JkZXJSYWRpdXM6IFwiMXJlbVwiLFxuXHRcdGRpc3BsYXk6IFwiZmxleFwiLFxuXHRcdGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsXG5cdFx0YWxpZ25JdGVtczogXCJjZW50ZXJcIixcblx0XHRqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcblx0XHRtYXhXaWR0aDogXCIyMHJlbVwiXG5cdH0sXG5cdGltZzoge1xuXHRcdHdpZHRoOiBcIjEwMCVcIixcblx0XHRoZWlnaHQ6IFwiYXV0b1wiXG5cdH1cbn07Il19
