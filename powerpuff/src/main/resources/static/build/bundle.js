
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop$1() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop$1;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * Schedules a callback to run immediately after the component has been updated.
     *
     * The first time the callback runs will be after the initial `onMount`
     */
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop$1,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop$1;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop$1;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.53.1' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    function construct_svelte_component_dev(component, props) {
        const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
        try {
            const instance = new component(props);
            if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
                throw new Error(error_message);
            }
            return instance;
        }
        catch (err) {
            const { message } = err;
            if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
                throw new Error(error_message);
            }
            else {
                throw err;
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap$1(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop$1) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop$1) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop$1;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop$1;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop$1;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function parse(str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules\svelte-spa-router\Router.svelte generated by Svelte v3.53.1 */

    const { Error: Error_1, Object: Object_1, console: console_1$5 } = globals;

    // (267:0) {:else}
    function create_else_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(267:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (260:0) {#if componentParams}
    function create_if_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(260:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn('Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading');

    	return wrap$1({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf('#/');

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: '/';

    	// Check if there's a querystring
    	const qsPosition = location.indexOf('?');

    	let querystring = '';

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener('hashchange', update, false);

    	return function stop() {
    		window.removeEventListener('hashchange', update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);
    const params = writable(undefined);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == '#' ? '' : '#') + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == '#' ? '' : '#') + location;

    	try {
    		const newState = { ...history.state };
    		delete newState['__svelte_spa_router_scrollX'];
    		delete newState['__svelte_spa_router_scrollY'];
    		window.history.replaceState(newState, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn('Caught exception while replacing the current page. If you\'re running this in the Svelte REPL, please note that the `replace` method might not work in this environment.');
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event('hashchange'));
    }

    function link(node, opts) {
    	opts = linkOpts(opts);

    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != 'a') {
    		throw Error('Action "link" can only be used with <a> tags');
    	}

    	updateLink(node, opts);

    	return {
    		update(updated) {
    			updated = linkOpts(updated);
    			updateLink(node, updated);
    		}
    	};
    }

    function restoreScroll(state) {
    	// If this exists, then this is a back navigation: restore the scroll position
    	if (state) {
    		window.scrollTo(state.__svelte_spa_router_scrollX, state.__svelte_spa_router_scrollY);
    	} else {
    		// Otherwise this is a forward navigation: scroll to top
    		window.scrollTo(0, 0);
    	}
    }

    // Internal function used by the link function
    function updateLink(node, opts) {
    	let href = opts.href || node.getAttribute('href');

    	// Destination must start with '/' or '#/'
    	if (href && href.charAt(0) == '/') {
    		// Add # to the href attribute
    		href = '#' + href;
    	} else if (!href || href.length < 2 || href.slice(0, 2) != '#/') {
    		throw Error('Invalid value for "href" attribute: ' + href);
    	}

    	node.setAttribute('href', href);

    	node.addEventListener('click', event => {
    		// Prevent default anchor onclick behaviour
    		event.preventDefault();

    		if (!opts.disabled) {
    			scrollstateHistoryHandler(event.currentTarget.getAttribute('href'));
    		}
    	});
    }

    // Internal function that ensures the argument of the link action is always an object
    function linkOpts(val) {
    	if (val && typeof val == 'string') {
    		return { href: val };
    	} else {
    		return val || {};
    	}
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {string} href - Destination
     */
    function scrollstateHistoryHandler(href) {
    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = '' } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != 'function' && (typeof component != 'object' || component._sveltesparouter !== true)) {
    				throw Error('Invalid component object');
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == 'string' && (path.length < 1 || path.charAt(0) != '/' && path.charAt(0) != '*') || typeof path == 'object' && !(path instanceof RegExp)) {
    				throw Error('Invalid value for "path" argument - strings must start with / or *');
    			}

    			const { pattern, keys } = parse(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == 'object' && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, check if it matches the start of the path.
    			// If not, bail early, else remove it before we run the matching.
    			if (prefix) {
    				if (typeof prefix == 'string') {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || '/';
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || '/';
    					} else {
    						return null;
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || '') || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {boolean} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	let popStateChanged = null;

    	if (restoreScrollState) {
    		popStateChanged = event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && (event.state.__svelte_spa_router_scrollY || event.state.__svelte_spa_router_scrollX)) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		};

    		// This is removed in the destroy() invocation below
    		window.addEventListener('popstate', popStateChanged);

    		afterUpdate(() => {
    			restoreScroll(previousScrollState);
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	const unsubscribeLoc = loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData,
    				params: match && typeof match == 'object' && Object.keys(match).length
    				? match
    				: null
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick('conditionsFailed', detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoading', Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    						component,
    						name: component.name,
    						params: componentParams
    					}));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == 'object' && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    				component,
    				name: component.name,
    				params: componentParams
    			})).then(() => {
    				params.set(componentParams);
    			});

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    		params.set(undefined);
    	});

    	onDestroy(() => {
    		unsubscribeLoc();
    		popStateChanged && window.removeEventListener('popstate', popStateChanged);
    	});

    	const writable_props = ['routes', 'prefix', 'restoreScrollState'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$5.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		writable,
    		derived,
    		tick,
    		_wrap: wrap$1,
    		wrap,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		params,
    		push,
    		pop,
    		replace,
    		link,
    		restoreScroll,
    		updateLink,
    		linkOpts,
    		scrollstateHistoryHandler,
    		onDestroy,
    		createEventDispatcher,
    		afterUpdate,
    		parse,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		popStateChanged,
    		lastLoc,
    		componentObj,
    		unsubscribeLoc
    	});

    	$$self.$inject_state = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ('component' in $$props) $$invalidate(0, component = $$props.component);
    		if ('componentParams' in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ('props' in $$props) $$invalidate(2, props = $$props.props);
    		if ('previousScrollState' in $$props) previousScrollState = $$props.previousScrollState;
    		if ('popStateChanged' in $$props) popStateChanged = $$props.popStateChanged;
    		if ('lastLoc' in $$props) lastLoc = $$props.lastLoc;
    		if ('componentObj' in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			history.scrollRestoration = restoreScrollState ? 'manual' : 'auto';
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function bind(fn, thisArg) {
      return function wrap() {
        return fn.apply(thisArg, arguments);
      };
    }

    // utils is a library of generic helper functions non-specific to axios

    const {toString} = Object.prototype;
    const {getPrototypeOf} = Object;

    const kindOf = (cache => thing => {
        const str = toString.call(thing);
        return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
    })(Object.create(null));

    const kindOfTest = (type) => {
      type = type.toLowerCase();
      return (thing) => kindOf(thing) === type
    };

    const typeOfTest = type => thing => typeof thing === type;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     *
     * @returns {boolean} True if value is an Array, otherwise false
     */
    const {isArray} = Array;

    /**
     * Determine if a value is undefined
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    const isUndefined = typeOfTest('undefined');

    /**
     * Determine if a value is a Buffer
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && isFunction(val.constructor.isBuffer) && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    const isArrayBuffer = kindOfTest('ArrayBuffer');


    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      let result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a String, otherwise false
     */
    const isString = typeOfTest('string');

    /**
     * Determine if a value is a Function
     *
     * @param {*} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    const isFunction = typeOfTest('function');

    /**
     * Determine if a value is a Number
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Number, otherwise false
     */
    const isNumber = typeOfTest('number');

    /**
     * Determine if a value is an Object
     *
     * @param {*} thing The value to test
     *
     * @returns {boolean} True if value is an Object, otherwise false
     */
    const isObject = (thing) => thing !== null && typeof thing === 'object';

    /**
     * Determine if a value is a Boolean
     *
     * @param {*} thing The value to test
     * @returns {boolean} True if value is a Boolean, otherwise false
     */
    const isBoolean = thing => thing === true || thing === false;

    /**
     * Determine if a value is a plain Object
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a plain Object, otherwise false
     */
    const isPlainObject = (val) => {
      if (kindOf(val) !== 'object') {
        return false;
      }

      const prototype = getPrototypeOf(val);
      return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in val) && !(Symbol.iterator in val);
    };

    /**
     * Determine if a value is a Date
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Date, otherwise false
     */
    const isDate = kindOfTest('Date');

    /**
     * Determine if a value is a File
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a File, otherwise false
     */
    const isFile = kindOfTest('File');

    /**
     * Determine if a value is a Blob
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    const isBlob = kindOfTest('Blob');

    /**
     * Determine if a value is a FileList
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a File, otherwise false
     */
    const isFileList = kindOfTest('FileList');

    /**
     * Determine if a value is a Stream
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    const isStream = (val) => isObject(val) && isFunction(val.pipe);

    /**
     * Determine if a value is a FormData
     *
     * @param {*} thing The value to test
     *
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    const isFormData = (thing) => {
      const pattern = '[object FormData]';
      return thing && (
        (typeof FormData === 'function' && thing instanceof FormData) ||
        toString.call(thing) === pattern ||
        (isFunction(thing.toString) && thing.toString() === pattern)
      );
    };

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    const isURLSearchParams = kindOfTest('URLSearchParams');

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     *
     * @returns {String} The String freed of excess whitespace
     */
    const trim = (str) => str.trim ?
      str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     *
     * @param {Boolean} [allOwnKeys = false]
     * @returns {void}
     */
    function forEach(obj, fn, {allOwnKeys = false} = {}) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      let i;
      let l;

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
        const len = keys.length;
        let key;

        for (i = 0; i < len; i++) {
          key = keys[i];
          fn.call(null, obj[key], key, obj);
        }
      }
    }

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     *
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      const result = {};
      const assignValue = (val, key) => {
        if (isPlainObject(result[key]) && isPlainObject(val)) {
          result[key] = merge(result[key], val);
        } else if (isPlainObject(val)) {
          result[key] = merge({}, val);
        } else if (isArray(val)) {
          result[key] = val.slice();
        } else {
          result[key] = val;
        }
      };

      for (let i = 0, l = arguments.length; i < l; i++) {
        arguments[i] && forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     *
     * @param {Boolean} [allOwnKeys]
     * @returns {Object} The resulting value of object a
     */
    const extend = (a, b, thisArg, {allOwnKeys}= {}) => {
      forEach(b, (val, key) => {
        if (thisArg && isFunction(val)) {
          a[key] = bind(val, thisArg);
        } else {
          a[key] = val;
        }
      }, {allOwnKeys});
      return a;
    };

    /**
     * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
     *
     * @param {string} content with BOM
     *
     * @returns {string} content value without BOM
     */
    const stripBOM = (content) => {
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      return content;
    };

    /**
     * Inherit the prototype methods from one constructor into another
     * @param {function} constructor
     * @param {function} superConstructor
     * @param {object} [props]
     * @param {object} [descriptors]
     *
     * @returns {void}
     */
    const inherits = (constructor, superConstructor, props, descriptors) => {
      constructor.prototype = Object.create(superConstructor.prototype, descriptors);
      constructor.prototype.constructor = constructor;
      Object.defineProperty(constructor, 'super', {
        value: superConstructor.prototype
      });
      props && Object.assign(constructor.prototype, props);
    };

    /**
     * Resolve object with deep prototype chain to a flat object
     * @param {Object} sourceObj source object
     * @param {Object} [destObj]
     * @param {Function|Boolean} [filter]
     * @param {Function} [propFilter]
     *
     * @returns {Object}
     */
    const toFlatObject = (sourceObj, destObj, filter, propFilter) => {
      let props;
      let i;
      let prop;
      const merged = {};

      destObj = destObj || {};
      // eslint-disable-next-line no-eq-null,eqeqeq
      if (sourceObj == null) return destObj;

      do {
        props = Object.getOwnPropertyNames(sourceObj);
        i = props.length;
        while (i-- > 0) {
          prop = props[i];
          if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
            destObj[prop] = sourceObj[prop];
            merged[prop] = true;
          }
        }
        sourceObj = filter !== false && getPrototypeOf(sourceObj);
      } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);

      return destObj;
    };

    /**
     * Determines whether a string ends with the characters of a specified string
     *
     * @param {String} str
     * @param {String} searchString
     * @param {Number} [position= 0]
     *
     * @returns {boolean}
     */
    const endsWith = (str, searchString, position) => {
      str = String(str);
      if (position === undefined || position > str.length) {
        position = str.length;
      }
      position -= searchString.length;
      const lastIndex = str.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
    };


    /**
     * Returns new array from array like object or null if failed
     *
     * @param {*} [thing]
     *
     * @returns {?Array}
     */
    const toArray = (thing) => {
      if (!thing) return null;
      if (isArray(thing)) return thing;
      let i = thing.length;
      if (!isNumber(i)) return null;
      const arr = new Array(i);
      while (i-- > 0) {
        arr[i] = thing[i];
      }
      return arr;
    };

    /**
     * Checking if the Uint8Array exists and if it does, it returns a function that checks if the
     * thing passed in is an instance of Uint8Array
     *
     * @param {TypedArray}
     *
     * @returns {Array}
     */
    // eslint-disable-next-line func-names
    const isTypedArray = (TypedArray => {
      // eslint-disable-next-line func-names
      return thing => {
        return TypedArray && thing instanceof TypedArray;
      };
    })(typeof Uint8Array !== 'undefined' && getPrototypeOf(Uint8Array));

    /**
     * For each entry in the object, call the function with the key and value.
     *
     * @param {Object<any, any>} obj - The object to iterate over.
     * @param {Function} fn - The function to call for each entry.
     *
     * @returns {void}
     */
    const forEachEntry = (obj, fn) => {
      const generator = obj && obj[Symbol.iterator];

      const iterator = generator.call(obj);

      let result;

      while ((result = iterator.next()) && !result.done) {
        const pair = result.value;
        fn.call(obj, pair[0], pair[1]);
      }
    };

    /**
     * It takes a regular expression and a string, and returns an array of all the matches
     *
     * @param {string} regExp - The regular expression to match against.
     * @param {string} str - The string to search.
     *
     * @returns {Array<boolean>}
     */
    const matchAll = (regExp, str) => {
      let matches;
      const arr = [];

      while ((matches = regExp.exec(str)) !== null) {
        arr.push(matches);
      }

      return arr;
    };

    /* Checking if the kindOfTest function returns true when passed an HTMLFormElement. */
    const isHTMLForm = kindOfTest('HTMLFormElement');

    const toCamelCase = str => {
      return str.toLowerCase().replace(/[_-\s]([a-z\d])(\w*)/g,
        function replacer(m, p1, p2) {
          return p1.toUpperCase() + p2;
        }
      );
    };

    /* Creating a function that will check if an object has a property. */
    const hasOwnProperty = (({hasOwnProperty}) => (obj, prop) => hasOwnProperty.call(obj, prop))(Object.prototype);

    /**
     * Determine if a value is a RegExp object
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a RegExp object, otherwise false
     */
    const isRegExp = kindOfTest('RegExp');

    const reduceDescriptors = (obj, reducer) => {
      const descriptors = Object.getOwnPropertyDescriptors(obj);
      const reducedDescriptors = {};

      forEach(descriptors, (descriptor, name) => {
        if (reducer(descriptor, name, obj) !== false) {
          reducedDescriptors[name] = descriptor;
        }
      });

      Object.defineProperties(obj, reducedDescriptors);
    };

    /**
     * Makes all methods read-only
     * @param {Object} obj
     */

    const freezeMethods = (obj) => {
      reduceDescriptors(obj, (descriptor, name) => {
        const value = obj[name];

        if (!isFunction(value)) return;

        descriptor.enumerable = false;

        if ('writable' in descriptor) {
          descriptor.writable = false;
          return;
        }

        if (!descriptor.set) {
          descriptor.set = () => {
            throw Error('Can not read-only method \'' + name + '\'');
          };
        }
      });
    };

    const toObjectSet = (arrayOrString, delimiter) => {
      const obj = {};

      const define = (arr) => {
        arr.forEach(value => {
          obj[value] = true;
        });
      };

      isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));

      return obj;
    };

    const noop = () => {};

    const toFiniteNumber = (value, defaultValue) => {
      value = +value;
      return Number.isFinite(value) ? value : defaultValue;
    };

    var utils = {
      isArray,
      isArrayBuffer,
      isBuffer,
      isFormData,
      isArrayBufferView,
      isString,
      isNumber,
      isBoolean,
      isObject,
      isPlainObject,
      isUndefined,
      isDate,
      isFile,
      isBlob,
      isRegExp,
      isFunction,
      isStream,
      isURLSearchParams,
      isTypedArray,
      isFileList,
      forEach,
      merge,
      extend,
      trim,
      stripBOM,
      inherits,
      toFlatObject,
      kindOf,
      kindOfTest,
      endsWith,
      toArray,
      forEachEntry,
      matchAll,
      isHTMLForm,
      hasOwnProperty,
      hasOwnProp: hasOwnProperty, // an alias to avoid ESLint no-prototype-builtins detection
      reduceDescriptors,
      freezeMethods,
      toObjectSet,
      toCamelCase,
      noop,
      toFiniteNumber
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [config] The config.
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     *
     * @returns {Error} The created error.
     */
    function AxiosError(message, code, config, request, response) {
      Error.call(this);

      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      } else {
        this.stack = (new Error()).stack;
      }

      this.message = message;
      this.name = 'AxiosError';
      code && (this.code = code);
      config && (this.config = config);
      request && (this.request = request);
      response && (this.response = response);
    }

    utils.inherits(AxiosError, Error, {
      toJSON: function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code,
          status: this.response && this.response.status ? this.response.status : null
        };
      }
    });

    const prototype$1 = AxiosError.prototype;
    const descriptors = {};

    [
      'ERR_BAD_OPTION_VALUE',
      'ERR_BAD_OPTION',
      'ECONNABORTED',
      'ETIMEDOUT',
      'ERR_NETWORK',
      'ERR_FR_TOO_MANY_REDIRECTS',
      'ERR_DEPRECATED',
      'ERR_BAD_RESPONSE',
      'ERR_BAD_REQUEST',
      'ERR_CANCELED',
      'ERR_NOT_SUPPORT',
      'ERR_INVALID_URL'
    // eslint-disable-next-line func-names
    ].forEach(code => {
      descriptors[code] = {value: code};
    });

    Object.defineProperties(AxiosError, descriptors);
    Object.defineProperty(prototype$1, 'isAxiosError', {value: true});

    // eslint-disable-next-line func-names
    AxiosError.from = (error, code, config, request, response, customProps) => {
      const axiosError = Object.create(prototype$1);

      utils.toFlatObject(error, axiosError, function filter(obj) {
        return obj !== Error.prototype;
      }, prop => {
        return prop !== 'isAxiosError';
      });

      AxiosError.call(axiosError, error.message, code, config, request, response);

      axiosError.cause = error;

      axiosError.name = error.name;

      customProps && Object.assign(axiosError, customProps);

      return axiosError;
    };

    /* eslint-env browser */

    var browser = typeof self == 'object' ? self.FormData : window.FormData;

    /**
     * Determines if the given thing is a array or js object.
     *
     * @param {string} thing - The object or array to be visited.
     *
     * @returns {boolean}
     */
    function isVisitable(thing) {
      return utils.isPlainObject(thing) || utils.isArray(thing);
    }

    /**
     * It removes the brackets from the end of a string
     *
     * @param {string} key - The key of the parameter.
     *
     * @returns {string} the key without the brackets.
     */
    function removeBrackets(key) {
      return utils.endsWith(key, '[]') ? key.slice(0, -2) : key;
    }

    /**
     * It takes a path, a key, and a boolean, and returns a string
     *
     * @param {string} path - The path to the current key.
     * @param {string} key - The key of the current object being iterated over.
     * @param {string} dots - If true, the key will be rendered with dots instead of brackets.
     *
     * @returns {string} The path to the current key.
     */
    function renderKey(path, key, dots) {
      if (!path) return key;
      return path.concat(key).map(function each(token, i) {
        // eslint-disable-next-line no-param-reassign
        token = removeBrackets(token);
        return !dots && i ? '[' + token + ']' : token;
      }).join(dots ? '.' : '');
    }

    /**
     * If the array is an array and none of its elements are visitable, then it's a flat array.
     *
     * @param {Array<any>} arr - The array to check
     *
     * @returns {boolean}
     */
    function isFlatArray(arr) {
      return utils.isArray(arr) && !arr.some(isVisitable);
    }

    const predicates = utils.toFlatObject(utils, {}, null, function filter(prop) {
      return /^is[A-Z]/.test(prop);
    });

    /**
     * If the thing is a FormData object, return true, otherwise return false.
     *
     * @param {unknown} thing - The thing to check.
     *
     * @returns {boolean}
     */
    function isSpecCompliant(thing) {
      return thing && utils.isFunction(thing.append) && thing[Symbol.toStringTag] === 'FormData' && thing[Symbol.iterator];
    }

    /**
     * Convert a data object to FormData
     *
     * @param {Object} obj
     * @param {?Object} [formData]
     * @param {?Object} [options]
     * @param {Function} [options.visitor]
     * @param {Boolean} [options.metaTokens = true]
     * @param {Boolean} [options.dots = false]
     * @param {?Boolean} [options.indexes = false]
     *
     * @returns {Object}
     **/

    /**
     * It converts an object into a FormData object
     *
     * @param {Object<any, any>} obj - The object to convert to form data.
     * @param {string} formData - The FormData object to append to.
     * @param {Object<string, any>} options
     *
     * @returns
     */
    function toFormData(obj, formData, options) {
      if (!utils.isObject(obj)) {
        throw new TypeError('target must be an object');
      }

      // eslint-disable-next-line no-param-reassign
      formData = formData || new (browser || FormData)();

      // eslint-disable-next-line no-param-reassign
      options = utils.toFlatObject(options, {
        metaTokens: true,
        dots: false,
        indexes: false
      }, false, function defined(option, source) {
        // eslint-disable-next-line no-eq-null,eqeqeq
        return !utils.isUndefined(source[option]);
      });

      const metaTokens = options.metaTokens;
      // eslint-disable-next-line no-use-before-define
      const visitor = options.visitor || defaultVisitor;
      const dots = options.dots;
      const indexes = options.indexes;
      const _Blob = options.Blob || typeof Blob !== 'undefined' && Blob;
      const useBlob = _Blob && isSpecCompliant(formData);

      if (!utils.isFunction(visitor)) {
        throw new TypeError('visitor must be a function');
      }

      function convertValue(value) {
        if (value === null) return '';

        if (utils.isDate(value)) {
          return value.toISOString();
        }

        if (!useBlob && utils.isBlob(value)) {
          throw new AxiosError('Blob is not supported. Use a Buffer instead.');
        }

        if (utils.isArrayBuffer(value) || utils.isTypedArray(value)) {
          return useBlob && typeof Blob === 'function' ? new Blob([value]) : Buffer.from(value);
        }

        return value;
      }

      /**
       * Default visitor.
       *
       * @param {*} value
       * @param {String|Number} key
       * @param {Array<String|Number>} path
       * @this {FormData}
       *
       * @returns {boolean} return true to visit the each prop of the value recursively
       */
      function defaultVisitor(value, key, path) {
        let arr = value;

        if (value && !path && typeof value === 'object') {
          if (utils.endsWith(key, '{}')) {
            // eslint-disable-next-line no-param-reassign
            key = metaTokens ? key : key.slice(0, -2);
            // eslint-disable-next-line no-param-reassign
            value = JSON.stringify(value);
          } else if (
            (utils.isArray(value) && isFlatArray(value)) ||
            (utils.isFileList(value) || utils.endsWith(key, '[]') && (arr = utils.toArray(value))
            )) {
            // eslint-disable-next-line no-param-reassign
            key = removeBrackets(key);

            arr.forEach(function each(el, index) {
              !(utils.isUndefined(el) || el === null) && formData.append(
                // eslint-disable-next-line no-nested-ternary
                indexes === true ? renderKey([key], index, dots) : (indexes === null ? key : key + '[]'),
                convertValue(el)
              );
            });
            return false;
          }
        }

        if (isVisitable(value)) {
          return true;
        }

        formData.append(renderKey(path, key, dots), convertValue(value));

        return false;
      }

      const stack = [];

      const exposedHelpers = Object.assign(predicates, {
        defaultVisitor,
        convertValue,
        isVisitable
      });

      function build(value, path) {
        if (utils.isUndefined(value)) return;

        if (stack.indexOf(value) !== -1) {
          throw Error('Circular reference detected in ' + path.join('.'));
        }

        stack.push(value);

        utils.forEach(value, function each(el, key) {
          const result = !(utils.isUndefined(el) || el === null) && visitor.call(
            formData, el, utils.isString(key) ? key.trim() : key, path, exposedHelpers
          );

          if (result === true) {
            build(el, path ? path.concat(key) : [key]);
          }
        });

        stack.pop();
      }

      if (!utils.isObject(obj)) {
        throw new TypeError('data must be an object');
      }

      build(obj);

      return formData;
    }

    /**
     * It encodes a string by replacing all characters that are not in the unreserved set with
     * their percent-encoded equivalents
     *
     * @param {string} str - The string to encode.
     *
     * @returns {string} The encoded string.
     */
    function encode$1(str) {
      const charMap = {
        '!': '%21',
        "'": '%27',
        '(': '%28',
        ')': '%29',
        '~': '%7E',
        '%20': '+',
        '%00': '\x00'
      };
      return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
        return charMap[match];
      });
    }

    /**
     * It takes a params object and converts it to a FormData object
     *
     * @param {Object<string, any>} params - The parameters to be converted to a FormData object.
     * @param {Object<string, any>} options - The options object passed to the Axios constructor.
     *
     * @returns {void}
     */
    function AxiosURLSearchParams(params, options) {
      this._pairs = [];

      params && toFormData(params, this, options);
    }

    const prototype = AxiosURLSearchParams.prototype;

    prototype.append = function append(name, value) {
      this._pairs.push([name, value]);
    };

    prototype.toString = function toString(encoder) {
      const _encode = encoder ? function(value) {
        return encoder.call(this, value, encode$1);
      } : encode$1;

      return this._pairs.map(function each(pair) {
        return _encode(pair[0]) + '=' + _encode(pair[1]);
      }, '').join('&');
    };

    /**
     * It replaces all instances of the characters `:`, `$`, `,`, `+`, `[`, and `]` with their
     * URI encoded counterparts
     *
     * @param {string} val The value to be encoded.
     *
     * @returns {string} The encoded value.
     */
    function encode(val) {
      return encodeURIComponent(val).
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @param {?object} options
     *
     * @returns {string} The formatted url
     */
    function buildURL(url, params, options) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }
      
      const _encode = options && options.encode || encode;

      const serializeFn = options && options.serialize;

      let serializedParams;

      if (serializeFn) {
        serializedParams = serializeFn(params, options);
      } else {
        serializedParams = utils.isURLSearchParams(params) ?
          params.toString() :
          new AxiosURLSearchParams(params, options).toString(_encode);
      }

      if (serializedParams) {
        const hashmarkIndex = url.indexOf("#");

        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }
        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    }

    class InterceptorManager {
      constructor() {
        this.handlers = [];
      }

      /**
       * Add a new interceptor to the stack
       *
       * @param {Function} fulfilled The function to handle `then` for a `Promise`
       * @param {Function} rejected The function to handle `reject` for a `Promise`
       *
       * @return {Number} An ID used to remove interceptor later
       */
      use(fulfilled, rejected, options) {
        this.handlers.push({
          fulfilled,
          rejected,
          synchronous: options ? options.synchronous : false,
          runWhen: options ? options.runWhen : null
        });
        return this.handlers.length - 1;
      }

      /**
       * Remove an interceptor from the stack
       *
       * @param {Number} id The ID that was returned by `use`
       *
       * @returns {Boolean} `true` if the interceptor was removed, `false` otherwise
       */
      eject(id) {
        if (this.handlers[id]) {
          this.handlers[id] = null;
        }
      }

      /**
       * Clear all interceptors from the stack
       *
       * @returns {void}
       */
      clear() {
        if (this.handlers) {
          this.handlers = [];
        }
      }

      /**
       * Iterate over all the registered interceptors
       *
       * This method is particularly useful for skipping over any
       * interceptors that may have become `null` calling `eject`.
       *
       * @param {Function} fn The function to call for each interceptor
       *
       * @returns {void}
       */
      forEach(fn) {
        utils.forEach(this.handlers, function forEachHandler(h) {
          if (h !== null) {
            fn(h);
          }
        });
      }
    }

    var transitionalDefaults = {
      silentJSONParsing: true,
      forcedJSONParsing: true,
      clarifyTimeoutError: false
    };

    var URLSearchParams$1 = typeof URLSearchParams !== 'undefined' ? URLSearchParams : AxiosURLSearchParams;

    var FormData$1 = FormData;

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     *
     * @returns {boolean}
     */
    const isStandardBrowserEnv = (() => {
      let product;
      if (typeof navigator !== 'undefined' && (
        (product = navigator.product) === 'ReactNative' ||
        product === 'NativeScript' ||
        product === 'NS')
      ) {
        return false;
      }

      return typeof window !== 'undefined' && typeof document !== 'undefined';
    })();

    var platform = {
      isBrowser: true,
      classes: {
        URLSearchParams: URLSearchParams$1,
        FormData: FormData$1,
        Blob
      },
      isStandardBrowserEnv,
      protocols: ['http', 'https', 'file', 'blob', 'url', 'data']
    };

    function toURLEncodedForm(data, options) {
      return toFormData(data, new platform.classes.URLSearchParams(), Object.assign({
        visitor: function(value, key, path, helpers) {
          if (platform.isNode && utils.isBuffer(value)) {
            this.append(key, value.toString('base64'));
            return false;
          }

          return helpers.defaultVisitor.apply(this, arguments);
        }
      }, options));
    }

    /**
     * It takes a string like `foo[x][y][z]` and returns an array like `['foo', 'x', 'y', 'z']
     *
     * @param {string} name - The name of the property to get.
     *
     * @returns An array of strings.
     */
    function parsePropPath(name) {
      // foo[x][y][z]
      // foo.x.y.z
      // foo-x-y-z
      // foo x y z
      return utils.matchAll(/\w+|\[(\w*)]/g, name).map(match => {
        return match[0] === '[]' ? '' : match[1] || match[0];
      });
    }

    /**
     * Convert an array to an object.
     *
     * @param {Array<any>} arr - The array to convert to an object.
     *
     * @returns An object with the same keys and values as the array.
     */
    function arrayToObject(arr) {
      const obj = {};
      const keys = Object.keys(arr);
      let i;
      const len = keys.length;
      let key;
      for (i = 0; i < len; i++) {
        key = keys[i];
        obj[key] = arr[key];
      }
      return obj;
    }

    /**
     * It takes a FormData object and returns a JavaScript object
     *
     * @param {string} formData The FormData object to convert to JSON.
     *
     * @returns {Object<string, any> | null} The converted object.
     */
    function formDataToJSON(formData) {
      function buildPath(path, value, target, index) {
        let name = path[index++];
        const isNumericKey = Number.isFinite(+name);
        const isLast = index >= path.length;
        name = !name && utils.isArray(target) ? target.length : name;

        if (isLast) {
          if (utils.hasOwnProp(target, name)) {
            target[name] = [target[name], value];
          } else {
            target[name] = value;
          }

          return !isNumericKey;
        }

        if (!target[name] || !utils.isObject(target[name])) {
          target[name] = [];
        }

        const result = buildPath(path, value, target[name], index);

        if (result && utils.isArray(target[name])) {
          target[name] = arrayToObject(target[name]);
        }

        return !isNumericKey;
      }

      if (utils.isFormData(formData) && utils.isFunction(formData.entries)) {
        const obj = {};

        utils.forEachEntry(formData, (name, value) => {
          buildPath(parsePropPath(name), value, obj, 0);
        });

        return obj;
      }

      return null;
    }

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     *
     * @returns {object} The response.
     */
    function settle(resolve, reject, response) {
      const validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(new AxiosError(
          'Request failed with status code ' + response.status,
          [AxiosError.ERR_BAD_REQUEST, AxiosError.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
          response.config,
          response.request,
          response
        ));
      }
    }

    var cookies = platform.isStandardBrowserEnv ?

    // Standard browser envs support document.cookie
      (function standardBrowserEnv() {
        return {
          write: function write(name, value, expires, path, domain, secure) {
            const cookie = [];
            cookie.push(name + '=' + encodeURIComponent(value));

            if (utils.isNumber(expires)) {
              cookie.push('expires=' + new Date(expires).toGMTString());
            }

            if (utils.isString(path)) {
              cookie.push('path=' + path);
            }

            if (utils.isString(domain)) {
              cookie.push('domain=' + domain);
            }

            if (secure === true) {
              cookie.push('secure');
            }

            document.cookie = cookie.join('; ');
          },

          read: function read(name) {
            const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
            return (match ? decodeURIComponent(match[3]) : null);
          },

          remove: function remove(name) {
            this.write(name, '', Date.now() - 86400000);
          }
        };
      })() :

    // Non standard browser env (web workers, react-native) lack needed support.
      (function nonStandardBrowserEnv() {
        return {
          write: function write() {},
          read: function read() { return null; },
          remove: function remove() {}
        };
      })();

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     *
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
    }

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     *
     * @returns {string} The combined URL
     */
    function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    }

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     *
     * @returns {string} The combined full path
     */
    function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    }

    var isURLSameOrigin = platform.isStandardBrowserEnv ?

    // Standard browser envs have full support of the APIs needed to test
    // whether the request URL is of the same origin as current location.
      (function standardBrowserEnv() {
        const msie = /(msie|trident)/i.test(navigator.userAgent);
        const urlParsingNode = document.createElement('a');
        let originURL;

        /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
        function resolveURL(url) {
          let href = url;

          if (msie) {
            // IE needs attribute set twice to normalize properties
            urlParsingNode.setAttribute('href', href);
            href = urlParsingNode.href;
          }

          urlParsingNode.setAttribute('href', href);

          // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
          return {
            href: urlParsingNode.href,
            protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
            host: urlParsingNode.host,
            search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
            hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
            hostname: urlParsingNode.hostname,
            port: urlParsingNode.port,
            pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
              urlParsingNode.pathname :
              '/' + urlParsingNode.pathname
          };
        }

        originURL = resolveURL(window.location.href);

        /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
        return function isURLSameOrigin(requestURL) {
          const parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
          return (parsed.protocol === originURL.protocol &&
              parsed.host === originURL.host);
        };
      })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
      (function nonStandardBrowserEnv() {
        return function isURLSameOrigin() {
          return true;
        };
      })();

    /**
     * A `CanceledError` is an object that is thrown when an operation is canceled.
     *
     * @param {string=} message The message.
     * @param {Object=} config The config.
     * @param {Object=} request The request.
     *
     * @returns {CanceledError} The created error.
     */
    function CanceledError(message, config, request) {
      // eslint-disable-next-line no-eq-null,eqeqeq
      AxiosError.call(this, message == null ? 'canceled' : message, AxiosError.ERR_CANCELED, config, request);
      this.name = 'CanceledError';
    }

    utils.inherits(CanceledError, AxiosError, {
      __CANCEL__: true
    });

    function parseProtocol(url) {
      const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
      return match && match[1] || '';
    }

    // RawAxiosHeaders whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    const ignoreDuplicateOf = utils.toObjectSet([
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ]);

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} rawHeaders Headers needing to be parsed
     *
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = rawHeaders => {
      const parsed = {};
      let key;
      let val;
      let i;

      rawHeaders && rawHeaders.split('\n').forEach(function parser(line) {
        i = line.indexOf(':');
        key = line.substring(0, i).trim().toLowerCase();
        val = line.substring(i + 1).trim();

        if (!key || (parsed[key] && ignoreDuplicateOf[key])) {
          return;
        }

        if (key === 'set-cookie') {
          if (parsed[key]) {
            parsed[key].push(val);
          } else {
            parsed[key] = [val];
          }
        } else {
          parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
        }
      });

      return parsed;
    };

    const $internals = Symbol('internals');
    const $defaults = Symbol('defaults');

    function normalizeHeader(header) {
      return header && String(header).trim().toLowerCase();
    }

    function normalizeValue(value) {
      if (value === false || value == null) {
        return value;
      }

      return utils.isArray(value) ? value.map(normalizeValue) : String(value);
    }

    function parseTokens(str) {
      const tokens = Object.create(null);
      const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
      let match;

      while ((match = tokensRE.exec(str))) {
        tokens[match[1]] = match[2];
      }

      return tokens;
    }

    function matchHeaderValue(context, value, header, filter) {
      if (utils.isFunction(filter)) {
        return filter.call(this, value, header);
      }

      if (!utils.isString(value)) return;

      if (utils.isString(filter)) {
        return value.indexOf(filter) !== -1;
      }

      if (utils.isRegExp(filter)) {
        return filter.test(value);
      }
    }

    function formatHeader(header) {
      return header.trim()
        .toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
          return char.toUpperCase() + str;
        });
    }

    function buildAccessors(obj, header) {
      const accessorName = utils.toCamelCase(' ' + header);

      ['get', 'set', 'has'].forEach(methodName => {
        Object.defineProperty(obj, methodName + accessorName, {
          value: function(arg1, arg2, arg3) {
            return this[methodName].call(this, header, arg1, arg2, arg3);
          },
          configurable: true
        });
      });
    }

    function findKey(obj, key) {
      key = key.toLowerCase();
      const keys = Object.keys(obj);
      let i = keys.length;
      let _key;
      while (i-- > 0) {
        _key = keys[i];
        if (key === _key.toLowerCase()) {
          return _key;
        }
      }
      return null;
    }

    function AxiosHeaders(headers, defaults) {
      headers && this.set(headers);
      this[$defaults] = defaults || null;
    }

    Object.assign(AxiosHeaders.prototype, {
      set: function(header, valueOrRewrite, rewrite) {
        const self = this;

        function setHeader(_value, _header, _rewrite) {
          const lHeader = normalizeHeader(_header);

          if (!lHeader) {
            throw new Error('header name must be a non-empty string');
          }

          const key = findKey(self, lHeader);

          if (key && _rewrite !== true && (self[key] === false || _rewrite === false)) {
            return;
          }

          self[key || _header] = normalizeValue(_value);
        }

        if (utils.isPlainObject(header)) {
          utils.forEach(header, (_value, _header) => {
            setHeader(_value, _header, valueOrRewrite);
          });
        } else {
          setHeader(valueOrRewrite, header, rewrite);
        }

        return this;
      },

      get: function(header, parser) {
        header = normalizeHeader(header);

        if (!header) return undefined;

        const key = findKey(this, header);

        if (key) {
          const value = this[key];

          if (!parser) {
            return value;
          }

          if (parser === true) {
            return parseTokens(value);
          }

          if (utils.isFunction(parser)) {
            return parser.call(this, value, key);
          }

          if (utils.isRegExp(parser)) {
            return parser.exec(value);
          }

          throw new TypeError('parser must be boolean|regexp|function');
        }
      },

      has: function(header, matcher) {
        header = normalizeHeader(header);

        if (header) {
          const key = findKey(this, header);

          return !!(key && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
        }

        return false;
      },

      delete: function(header, matcher) {
        const self = this;
        let deleted = false;

        function deleteHeader(_header) {
          _header = normalizeHeader(_header);

          if (_header) {
            const key = findKey(self, _header);

            if (key && (!matcher || matchHeaderValue(self, self[key], key, matcher))) {
              delete self[key];

              deleted = true;
            }
          }
        }

        if (utils.isArray(header)) {
          header.forEach(deleteHeader);
        } else {
          deleteHeader(header);
        }

        return deleted;
      },

      clear: function() {
        return Object.keys(this).forEach(this.delete.bind(this));
      },

      normalize: function(format) {
        const self = this;
        const headers = {};

        utils.forEach(this, (value, header) => {
          const key = findKey(headers, header);

          if (key) {
            self[key] = normalizeValue(value);
            delete self[header];
            return;
          }

          const normalized = format ? formatHeader(header) : String(header).trim();

          if (normalized !== header) {
            delete self[header];
          }

          self[normalized] = normalizeValue(value);

          headers[normalized] = true;
        });

        return this;
      },

      toJSON: function(asStrings) {
        const obj = Object.create(null);

        utils.forEach(Object.assign({}, this[$defaults] || null, this),
          (value, header) => {
            if (value == null || value === false) return;
            obj[header] = asStrings && utils.isArray(value) ? value.join(', ') : value;
          });

        return obj;
      }
    });

    Object.assign(AxiosHeaders, {
      from: function(thing) {
        if (utils.isString(thing)) {
          return new this(parseHeaders(thing));
        }
        return thing instanceof this ? thing : new this(thing);
      },

      accessor: function(header) {
        const internals = this[$internals] = (this[$internals] = {
          accessors: {}
        });

        const accessors = internals.accessors;
        const prototype = this.prototype;

        function defineAccessor(_header) {
          const lHeader = normalizeHeader(_header);

          if (!accessors[lHeader]) {
            buildAccessors(prototype, _header);
            accessors[lHeader] = true;
          }
        }

        utils.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);

        return this;
      }
    });

    AxiosHeaders.accessor(['Content-Type', 'Content-Length', 'Accept', 'Accept-Encoding', 'User-Agent']);

    utils.freezeMethods(AxiosHeaders.prototype);
    utils.freezeMethods(AxiosHeaders);

    /**
     * Calculate data maxRate
     * @param {Number} [samplesCount= 10]
     * @param {Number} [min= 1000]
     * @returns {Function}
     */
    function speedometer(samplesCount, min) {
      samplesCount = samplesCount || 10;
      const bytes = new Array(samplesCount);
      const timestamps = new Array(samplesCount);
      let head = 0;
      let tail = 0;
      let firstSampleTS;

      min = min !== undefined ? min : 1000;

      return function push(chunkLength) {
        const now = Date.now();

        const startedAt = timestamps[tail];

        if (!firstSampleTS) {
          firstSampleTS = now;
        }

        bytes[head] = chunkLength;
        timestamps[head] = now;

        let i = tail;
        let bytesCount = 0;

        while (i !== head) {
          bytesCount += bytes[i++];
          i = i % samplesCount;
        }

        head = (head + 1) % samplesCount;

        if (head === tail) {
          tail = (tail + 1) % samplesCount;
        }

        if (now - firstSampleTS < min) {
          return;
        }

        const passed = startedAt && now - startedAt;

        return  passed ? Math.round(bytesCount * 1000 / passed) : undefined;
      };
    }

    function progressEventReducer(listener, isDownloadStream) {
      let bytesNotified = 0;
      const _speedometer = speedometer(50, 250);

      return e => {
        const loaded = e.loaded;
        const total = e.lengthComputable ? e.total : undefined;
        const progressBytes = loaded - bytesNotified;
        const rate = _speedometer(progressBytes);
        const inRange = loaded <= total;

        bytesNotified = loaded;

        const data = {
          loaded,
          total,
          progress: total ? (loaded / total) : undefined,
          bytes: progressBytes,
          rate: rate ? rate : undefined,
          estimated: rate && total && inRange ? (total - loaded) / rate : undefined
        };

        data[isDownloadStream ? 'download' : 'upload'] = true;

        listener(data);
      };
    }

    function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        let requestData = config.data;
        const requestHeaders = AxiosHeaders.from(config.headers).normalize();
        const responseType = config.responseType;
        let onCanceled;
        function done() {
          if (config.cancelToken) {
            config.cancelToken.unsubscribe(onCanceled);
          }

          if (config.signal) {
            config.signal.removeEventListener('abort', onCanceled);
          }
        }

        if (utils.isFormData(requestData) && platform.isStandardBrowserEnv) {
          requestHeaders.setContentType(false); // Let the browser set it
        }

        let request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          const username = config.auth.username || '';
          const password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
          requestHeaders.set('Authorization', 'Basic ' + btoa(username + ':' + password));
        }

        const fullPath = buildFullPath(config.baseURL, config.url);

        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        function onloadend() {
          if (!request) {
            return;
          }
          // Prepare the response
          const responseHeaders = AxiosHeaders.from(
            'getAllResponseHeaders' in request && request.getAllResponseHeaders()
          );
          const responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
            request.responseText : request.response;
          const response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config,
            request
          };

          settle(function _resolve(value) {
            resolve(value);
            done();
          }, function _reject(err) {
            reject(err);
            done();
          }, response);

          // Clean up request
          request = null;
        }

        if ('onloadend' in request) {
          // Use onloadend if available
          request.onloadend = onloadend;
        } else {
          // Listen for ready state to emulate onloadend
          request.onreadystatechange = function handleLoad() {
            if (!request || request.readyState !== 4) {
              return;
            }

            // The request errored out and we didn't get a response, this will be
            // handled by onerror instead
            // With one exception: request that using file: protocol, most browsers
            // will return status as 0 even though it's a successful request
            if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
              return;
            }
            // readystate handler is calling before onerror or ontimeout handlers,
            // so we should call onloadend on the next 'tick'
            setTimeout(onloadend);
          };
        }

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(new AxiosError('Request aborted', AxiosError.ECONNABORTED, config, request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(new AxiosError('Network Error', AxiosError.ERR_NETWORK, config, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          let timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
          const transitional = config.transitional || transitionalDefaults;
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(new AxiosError(
            timeoutErrorMessage,
            transitional.clarifyTimeoutError ? AxiosError.ETIMEDOUT : AxiosError.ECONNABORTED,
            config,
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (platform.isStandardBrowserEnv) {
          // Add xsrf header
          const xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath))
            && config.xsrfCookieName && cookies.read(config.xsrfCookieName);

          if (xsrfValue) {
            requestHeaders.set(config.xsrfHeaderName, xsrfValue);
          }
        }

        // Remove Content-Type if data is undefined
        requestData === undefined && requestHeaders.setContentType(null);

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
            request.setRequestHeader(key, val);
          });
        }

        // Add withCredentials to request if needed
        if (!utils.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }

        // Add responseType to request if needed
        if (responseType && responseType !== 'json') {
          request.responseType = config.responseType;
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', progressEventReducer(config.onDownloadProgress, true));
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', progressEventReducer(config.onUploadProgress));
        }

        if (config.cancelToken || config.signal) {
          // Handle cancellation
          // eslint-disable-next-line func-names
          onCanceled = cancel => {
            if (!request) {
              return;
            }
            reject(!cancel || cancel.type ? new CanceledError(null, config, request) : cancel);
            request.abort();
            request = null;
          };

          config.cancelToken && config.cancelToken.subscribe(onCanceled);
          if (config.signal) {
            config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
          }
        }

        const protocol = parseProtocol(fullPath);

        if (protocol && platform.protocols.indexOf(protocol) === -1) {
          reject(new AxiosError('Unsupported protocol ' + protocol + ':', AxiosError.ERR_BAD_REQUEST, config));
          return;
        }


        // Send the request
        request.send(requestData || null);
      });
    }

    const adapters = {
      http: xhrAdapter,
      xhr: xhrAdapter
    };

    var adapters$1 = {
      getAdapter: (nameOrAdapter) => {
        if(utils.isString(nameOrAdapter)){
          const adapter = adapters[nameOrAdapter];

          if (!nameOrAdapter) {
            throw Error(
              utils.hasOwnProp(nameOrAdapter) ?
                `Adapter '${nameOrAdapter}' is not available in the build` :
                `Can not resolve adapter '${nameOrAdapter}'`
            );
          }

          return adapter
        }

        if (!utils.isFunction(nameOrAdapter)) {
          throw new TypeError('adapter is not a function');
        }

        return nameOrAdapter;
      },
      adapters
    };

    const DEFAULT_CONTENT_TYPE = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    /**
     * If the browser has an XMLHttpRequest object, use the XHR adapter, otherwise use the HTTP
     * adapter
     *
     * @returns {Function}
     */
    function getDefaultAdapter() {
      let adapter;
      if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = adapters$1.getAdapter('xhr');
      } else if (typeof process !== 'undefined' && utils.kindOf(process) === 'process') {
        // For node use HTTP adapter
        adapter = adapters$1.getAdapter('http');
      }
      return adapter;
    }

    /**
     * It takes a string, tries to parse it, and if it fails, it returns the stringified version
     * of the input
     *
     * @param {any} rawValue - The value to be stringified.
     * @param {Function} parser - A function that parses a string into a JavaScript object.
     * @param {Function} encoder - A function that takes a value and returns a string.
     *
     * @returns {string} A stringified version of the rawValue.
     */
    function stringifySafely(rawValue, parser, encoder) {
      if (utils.isString(rawValue)) {
        try {
          (parser || JSON.parse)(rawValue);
          return utils.trim(rawValue);
        } catch (e) {
          if (e.name !== 'SyntaxError') {
            throw e;
          }
        }
      }

      return (encoder || JSON.stringify)(rawValue);
    }

    const defaults = {

      transitional: transitionalDefaults,

      adapter: getDefaultAdapter(),

      transformRequest: [function transformRequest(data, headers) {
        const contentType = headers.getContentType() || '';
        const hasJSONContentType = contentType.indexOf('application/json') > -1;
        const isObjectPayload = utils.isObject(data);

        if (isObjectPayload && utils.isHTMLForm(data)) {
          data = new FormData(data);
        }

        const isFormData = utils.isFormData(data);

        if (isFormData) {
          if (!hasJSONContentType) {
            return data;
          }
          return hasJSONContentType ? JSON.stringify(formDataToJSON(data)) : data;
        }

        if (utils.isArrayBuffer(data) ||
          utils.isBuffer(data) ||
          utils.isStream(data) ||
          utils.isFile(data) ||
          utils.isBlob(data)
        ) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          headers.setContentType('application/x-www-form-urlencoded;charset=utf-8', false);
          return data.toString();
        }

        let isFileList;

        if (isObjectPayload) {
          if (contentType.indexOf('application/x-www-form-urlencoded') > -1) {
            return toURLEncodedForm(data, this.formSerializer).toString();
          }

          if ((isFileList = utils.isFileList(data)) || contentType.indexOf('multipart/form-data') > -1) {
            const _FormData = this.env && this.env.FormData;

            return toFormData(
              isFileList ? {'files[]': data} : data,
              _FormData && new _FormData(),
              this.formSerializer
            );
          }
        }

        if (isObjectPayload || hasJSONContentType ) {
          headers.setContentType('application/json', false);
          return stringifySafely(data);
        }

        return data;
      }],

      transformResponse: [function transformResponse(data) {
        const transitional = this.transitional || defaults.transitional;
        const forcedJSONParsing = transitional && transitional.forcedJSONParsing;
        const JSONRequested = this.responseType === 'json';

        if (data && utils.isString(data) && ((forcedJSONParsing && !this.responseType) || JSONRequested)) {
          const silentJSONParsing = transitional && transitional.silentJSONParsing;
          const strictJSONParsing = !silentJSONParsing && JSONRequested;

          try {
            return JSON.parse(data);
          } catch (e) {
            if (strictJSONParsing) {
              if (e.name === 'SyntaxError') {
                throw AxiosError.from(e, AxiosError.ERR_BAD_RESPONSE, this, null, this.response);
              }
              throw e;
            }
          }
        }

        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,
      maxBodyLength: -1,

      env: {
        FormData: platform.classes.FormData,
        Blob: platform.classes.Blob
      },

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      },

      headers: {
        common: {
          'Accept': 'application/json, text/plain, */*'
        }
      }
    };

    utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults.headers[method] = {};
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });

    /**
     * Transform the data for a request or a response
     *
     * @param {Array|Function} fns A single function or Array of functions
     * @param {?Object} response The response object
     *
     * @returns {*} The resulting transformed data
     */
    function transformData(fns, response) {
      const config = this || defaults;
      const context = response || config;
      const headers = AxiosHeaders.from(context.headers);
      let data = context.data;

      utils.forEach(fns, function transform(fn) {
        data = fn.call(config, data, headers.normalize(), response ? response.status : undefined);
      });

      headers.normalize();

      return data;
    }

    function isCancel(value) {
      return !!(value && value.__CANCEL__);
    }

    /**
     * Throws a `CanceledError` if cancellation has been requested.
     *
     * @param {Object} config The config that is to be used for the request
     *
     * @returns {void}
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }

      if (config.signal && config.signal.aborted) {
        throw new CanceledError();
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     *
     * @returns {Promise} The Promise to be fulfilled
     */
    function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      config.headers = AxiosHeaders.from(config.headers);

      // Transform request data
      config.data = transformData.call(
        config,
        config.transformRequest
      );

      const adapter = config.adapter || defaults.adapter;

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData.call(
          config,
          config.transformResponse,
          response
        );

        response.headers = AxiosHeaders.from(response.headers);

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData.call(
              config,
              config.transformResponse,
              reason.response
            );
            reason.response.headers = AxiosHeaders.from(reason.response.headers);
          }
        }

        return Promise.reject(reason);
      });
    }

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     *
     * @returns {Object} New object resulting from merging config2 to config1
     */
    function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      const config = {};

      function getMergedValue(target, source) {
        if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
          return utils.merge(target, source);
        } else if (utils.isPlainObject(source)) {
          return utils.merge({}, source);
        } else if (utils.isArray(source)) {
          return source.slice();
        }
        return source;
      }

      // eslint-disable-next-line consistent-return
      function mergeDeepProperties(prop) {
        if (!utils.isUndefined(config2[prop])) {
          return getMergedValue(config1[prop], config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          return getMergedValue(undefined, config1[prop]);
        }
      }

      // eslint-disable-next-line consistent-return
      function valueFromConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          return getMergedValue(undefined, config2[prop]);
        }
      }

      // eslint-disable-next-line consistent-return
      function defaultToConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          return getMergedValue(undefined, config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          return getMergedValue(undefined, config1[prop]);
        }
      }

      // eslint-disable-next-line consistent-return
      function mergeDirectKeys(prop) {
        if (prop in config2) {
          return getMergedValue(config1[prop], config2[prop]);
        } else if (prop in config1) {
          return getMergedValue(undefined, config1[prop]);
        }
      }

      const mergeMap = {
        'url': valueFromConfig2,
        'method': valueFromConfig2,
        'data': valueFromConfig2,
        'baseURL': defaultToConfig2,
        'transformRequest': defaultToConfig2,
        'transformResponse': defaultToConfig2,
        'paramsSerializer': defaultToConfig2,
        'timeout': defaultToConfig2,
        'timeoutMessage': defaultToConfig2,
        'withCredentials': defaultToConfig2,
        'adapter': defaultToConfig2,
        'responseType': defaultToConfig2,
        'xsrfCookieName': defaultToConfig2,
        'xsrfHeaderName': defaultToConfig2,
        'onUploadProgress': defaultToConfig2,
        'onDownloadProgress': defaultToConfig2,
        'decompress': defaultToConfig2,
        'maxContentLength': defaultToConfig2,
        'maxBodyLength': defaultToConfig2,
        'beforeRedirect': defaultToConfig2,
        'transport': defaultToConfig2,
        'httpAgent': defaultToConfig2,
        'httpsAgent': defaultToConfig2,
        'cancelToken': defaultToConfig2,
        'socketPath': defaultToConfig2,
        'responseEncoding': defaultToConfig2,
        'validateStatus': mergeDirectKeys
      };

      utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
        const merge = mergeMap[prop] || mergeDeepProperties;
        const configValue = merge(prop);
        (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
      });

      return config;
    }

    const VERSION = "1.1.3";

    const validators$1 = {};

    // eslint-disable-next-line func-names
    ['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach((type, i) => {
      validators$1[type] = function validator(thing) {
        return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
      };
    });

    const deprecatedWarnings = {};

    /**
     * Transitional option validator
     *
     * @param {function|boolean?} validator - set to false if the transitional option has been removed
     * @param {string?} version - deprecated version / removed since version
     * @param {string?} message - some message with additional info
     *
     * @returns {function}
     */
    validators$1.transitional = function transitional(validator, version, message) {
      function formatMessage(opt, desc) {
        return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
      }

      // eslint-disable-next-line func-names
      return (value, opt, opts) => {
        if (validator === false) {
          throw new AxiosError(
            formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')),
            AxiosError.ERR_DEPRECATED
          );
        }

        if (version && !deprecatedWarnings[opt]) {
          deprecatedWarnings[opt] = true;
          // eslint-disable-next-line no-console
          console.warn(
            formatMessage(
              opt,
              ' has been deprecated since v' + version + ' and will be removed in the near future'
            )
          );
        }

        return validator ? validator(value, opt, opts) : true;
      };
    };

    /**
     * Assert object's properties type
     *
     * @param {object} options
     * @param {object} schema
     * @param {boolean?} allowUnknown
     *
     * @returns {object}
     */

    function assertOptions(options, schema, allowUnknown) {
      if (typeof options !== 'object') {
        throw new AxiosError('options must be an object', AxiosError.ERR_BAD_OPTION_VALUE);
      }
      const keys = Object.keys(options);
      let i = keys.length;
      while (i-- > 0) {
        const opt = keys[i];
        const validator = schema[opt];
        if (validator) {
          const value = options[opt];
          const result = value === undefined || validator(value, opt, options);
          if (result !== true) {
            throw new AxiosError('option ' + opt + ' must be ' + result, AxiosError.ERR_BAD_OPTION_VALUE);
          }
          continue;
        }
        if (allowUnknown !== true) {
          throw new AxiosError('Unknown option ' + opt, AxiosError.ERR_BAD_OPTION);
        }
      }
    }

    var validator = {
      assertOptions,
      validators: validators$1
    };

    const validators = validator.validators;

    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     *
     * @return {Axios} A new instance of Axios
     */
    class Axios {
      constructor(instanceConfig) {
        this.defaults = instanceConfig;
        this.interceptors = {
          request: new InterceptorManager(),
          response: new InterceptorManager()
        };
      }

      /**
       * Dispatch a request
       *
       * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
       * @param {?Object} config
       *
       * @returns {Promise} The Promise to be fulfilled
       */
      request(configOrUrl, config) {
        /*eslint no-param-reassign:0*/
        // Allow for axios('example/url'[, config]) a la fetch API
        if (typeof configOrUrl === 'string') {
          config = config || {};
          config.url = configOrUrl;
        } else {
          config = configOrUrl || {};
        }

        config = mergeConfig(this.defaults, config);

        const {transitional, paramsSerializer} = config;

        if (transitional !== undefined) {
          validator.assertOptions(transitional, {
            silentJSONParsing: validators.transitional(validators.boolean),
            forcedJSONParsing: validators.transitional(validators.boolean),
            clarifyTimeoutError: validators.transitional(validators.boolean)
          }, false);
        }

        if (paramsSerializer !== undefined) {
          validator.assertOptions(paramsSerializer, {
            encode: validators.function,
            serialize: validators.function
          }, true);
        }

        // Set config.method
        config.method = (config.method || this.defaults.method || 'get').toLowerCase();

        // Flatten headers
        const defaultHeaders = config.headers && utils.merge(
          config.headers.common,
          config.headers[config.method]
        );

        defaultHeaders && utils.forEach(
          ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
          function cleanHeaderConfig(method) {
            delete config.headers[method];
          }
        );

        config.headers = new AxiosHeaders(config.headers, defaultHeaders);

        // filter out skipped interceptors
        const requestInterceptorChain = [];
        let synchronousRequestInterceptors = true;
        this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
          if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
            return;
          }

          synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

          requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
        });

        const responseInterceptorChain = [];
        this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
          responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
        });

        let promise;
        let i = 0;
        let len;

        if (!synchronousRequestInterceptors) {
          const chain = [dispatchRequest.bind(this), undefined];
          chain.unshift.apply(chain, requestInterceptorChain);
          chain.push.apply(chain, responseInterceptorChain);
          len = chain.length;

          promise = Promise.resolve(config);

          while (i < len) {
            promise = promise.then(chain[i++], chain[i++]);
          }

          return promise;
        }

        len = requestInterceptorChain.length;

        let newConfig = config;

        i = 0;

        while (i < len) {
          const onFulfilled = requestInterceptorChain[i++];
          const onRejected = requestInterceptorChain[i++];
          try {
            newConfig = onFulfilled(newConfig);
          } catch (error) {
            onRejected.call(this, error);
            break;
          }
        }

        try {
          promise = dispatchRequest.call(this, newConfig);
        } catch (error) {
          return Promise.reject(error);
        }

        i = 0;
        len = responseInterceptorChain.length;

        while (i < len) {
          promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
        }

        return promise;
      }

      getUri(config) {
        config = mergeConfig(this.defaults, config);
        const fullPath = buildFullPath(config.baseURL, config.url);
        return buildURL(fullPath, config.params, config.paramsSerializer);
      }
    }

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method,
          url,
          data: (config || {}).data
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/

      function generateHTTPMethod(isForm) {
        return function httpMethod(url, data, config) {
          return this.request(mergeConfig(config || {}, {
            method,
            headers: isForm ? {
              'Content-Type': 'multipart/form-data'
            } : {},
            url,
            data
          }));
        };
      }

      Axios.prototype[method] = generateHTTPMethod();

      Axios.prototype[method + 'Form'] = generateHTTPMethod(true);
    });

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @param {Function} executor The executor function.
     *
     * @returns {CancelToken}
     */
    class CancelToken {
      constructor(executor) {
        if (typeof executor !== 'function') {
          throw new TypeError('executor must be a function.');
        }

        let resolvePromise;

        this.promise = new Promise(function promiseExecutor(resolve) {
          resolvePromise = resolve;
        });

        const token = this;

        // eslint-disable-next-line func-names
        this.promise.then(cancel => {
          if (!token._listeners) return;

          let i = token._listeners.length;

          while (i-- > 0) {
            token._listeners[i](cancel);
          }
          token._listeners = null;
        });

        // eslint-disable-next-line func-names
        this.promise.then = onfulfilled => {
          let _resolve;
          // eslint-disable-next-line func-names
          const promise = new Promise(resolve => {
            token.subscribe(resolve);
            _resolve = resolve;
          }).then(onfulfilled);

          promise.cancel = function reject() {
            token.unsubscribe(_resolve);
          };

          return promise;
        };

        executor(function cancel(message, config, request) {
          if (token.reason) {
            // Cancellation has already been requested
            return;
          }

          token.reason = new CanceledError(message, config, request);
          resolvePromise(token.reason);
        });
      }

      /**
       * Throws a `CanceledError` if cancellation has been requested.
       */
      throwIfRequested() {
        if (this.reason) {
          throw this.reason;
        }
      }

      /**
       * Subscribe to the cancel signal
       */

      subscribe(listener) {
        if (this.reason) {
          listener(this.reason);
          return;
        }

        if (this._listeners) {
          this._listeners.push(listener);
        } else {
          this._listeners = [listener];
        }
      }

      /**
       * Unsubscribe from the cancel signal
       */

      unsubscribe(listener) {
        if (!this._listeners) {
          return;
        }
        const index = this._listeners.indexOf(listener);
        if (index !== -1) {
          this._listeners.splice(index, 1);
        }
      }

      /**
       * Returns an object that contains a new `CancelToken` and a function that, when called,
       * cancels the `CancelToken`.
       */
      static source() {
        let cancel;
        const token = new CancelToken(function executor(c) {
          cancel = c;
        });
        return {
          token,
          cancel
        };
      }
    }

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     *
     * @returns {Function}
     */
    function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    }

    /**
     * Determines whether the payload is an error thrown by Axios
     *
     * @param {*} payload The value to test
     *
     * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
     */
    function isAxiosError(payload) {
      return utils.isObject(payload) && (payload.isAxiosError === true);
    }

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     *
     * @returns {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      const context = new Axios(defaultConfig);
      const instance = bind(Axios.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios.prototype, context, {allOwnKeys: true});

      // Copy context to instance
      utils.extend(instance, context, null, {allOwnKeys: true});

      // Factory for creating new instances
      instance.create = function create(instanceConfig) {
        return createInstance(mergeConfig(defaultConfig, instanceConfig));
      };

      return instance;
    }

    // Create the default instance to be exported
    const axios = createInstance(defaults);

    // Expose Axios class to allow class inheritance
    axios.Axios = Axios;

    // Expose Cancel & CancelToken
    axios.CanceledError = CanceledError;
    axios.CancelToken = CancelToken;
    axios.isCancel = isCancel;
    axios.VERSION = VERSION;
    axios.toFormData = toFormData;

    // Expose AxiosError class
    axios.AxiosError = AxiosError;

    // alias for CanceledError for backward compatibility
    axios.Cancel = axios.CanceledError;

    // Expose all/spread
    axios.all = function all(promises) {
      return Promise.all(promises);
    };

    axios.spread = spread;

    // Expose isAxiosError
    axios.isAxiosError = isAxiosError;

    axios.formToJSON = thing => {
      return formDataToJSON(utils.isHTMLForm(thing) ? new FormData(thing) : thing);
    };

    /* src\pages\Home.svelte generated by Svelte v3.53.1 */

    const { console: console_1$4 } = globals;
    const file$5 = "src\\pages\\Home.svelte";

    function create_fragment$5(ctx) {
    	let div3;
    	let div2;
    	let h1;
    	let t1;
    	let div0;
    	let t2;
    	let div1;
    	let h40;
    	let t4;
    	let h41;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Welcome to the Power Puff Application!";
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			div1 = element("div");
    			h40 = element("h4");
    			h40.textContent = "Dashboard";
    			t4 = space();
    			h41 = element("h4");
    			h41.textContent = "Neue Produkte, welche überprüft und aktiviert werden müssen";
    			attr_dev(h1, "class", "mt-3");
    			add_location(h1, file$5, 40, 8, 1015);
    			attr_dev(div0, "class", "col-md-12");
    			add_location(div0, file$5, 41, 8, 1085);
    			attr_dev(h40, "class", "alert-heading");
    			add_location(h40, file$5, 44, 12, 1198);
    			attr_dev(div1, "class", "alert");
    			attr_dev(div1, "margin", "30px");
    			attr_dev(div1, "color", "#5402C0");
    			attr_dev(div1, "role", "alert");
    			add_location(div1, file$5, 43, 8, 1122);
    			attr_dev(h41, "class", "mt-3");
    			add_location(h41, file$5, 47, 8, 1266);
    			attr_dev(div2, "class", "mb-5");
    			add_location(div2, file$5, 39, 4, 987);
    			attr_dev(div3, "class", "container");
    			add_location(div3, file$5, 38, 0, 958);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, h1);
    			append_dev(div2, t1);
    			append_dev(div2, div0);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, h40);
    			append_dev(div2, t4);
    			append_dev(div2, h41);
    		},
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const api_root$4 = "https://f24530a0-2bc4-4ab0-9f43-d44c45c239b5.mock.pstmn.io";

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	let products = [];

    	let product = {
    		productname: null,
    		description: null,
    		productType: null,
    		difficultyType: null,
    		clothingType: null,
    		size: null,
    		price: null,
    		patchart: null
    	};

    	function getProducts() {
    		var config = {
    			method: "get",
    			url: api_root$4 + "/api/products",
    			headers: {}
    		};

    		axios(config).then(function (response) {
    			products = response.data;
    		}).catch(function (error) {
    			alert("Could not get products");
    			console.log(error);
    		});
    	}

    	getProducts();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$4.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		axios,
    		api_root: api_root$4,
    		products,
    		product,
    		getProducts
    	});

    	$$self.$inject_state = $$props => {
    		if ('products' in $$props) products = $$props.products;
    		if ('product' in $$props) product = $$props.product;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\pages\Users.svelte generated by Svelte v3.53.1 */

    const { console: console_1$3 } = globals;
    const file$4 = "src\\pages\\Users.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    // (113:8) {#each users as user, index}
    function create_each_block$2(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*index*/ ctx[8] + 1 + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*user*/ ctx[1].username + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*user*/ ctx[1].name + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6_value = /*user*/ ctx[1].email + "";
    	let t6;
    	let t7;
    	let td4;
    	let t8_value = /*user*/ ctx[1].userType + "";
    	let t8;
    	let t9;
    	let td5;
    	let t10_value = /*user*/ ctx[1].userStatus + "";
    	let t10;
    	let tr_onclick_value;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			td4 = element("td");
    			t8 = text(t8_value);
    			t9 = space();
    			td5 = element("td");
    			t10 = text(t10_value);
    			add_location(td0, file$4, 117, 16, 2956);
    			add_location(td1, file$4, 120, 16, 3034);
    			add_location(td2, file$4, 123, 16, 3116);
    			add_location(td3, file$4, 126, 16, 3194);
    			add_location(td4, file$4, 129, 16, 3273);
    			add_location(td5, file$4, 132, 16, 3355);
    			attr_dev(tr, "class", "row-tr");
    			attr_dev(tr, "onclick", tr_onclick_value = "document.location = '" + ('#/users/' + /*user*/ ctx[1]._id) + "';");
    			add_location(tr, file$4, 113, 12, 2814);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(td3, t6);
    			append_dev(tr, t7);
    			append_dev(tr, td4);
    			append_dev(td4, t8);
    			append_dev(tr, t9);
    			append_dev(tr, td5);
    			append_dev(td5, t10);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*users*/ 1 && t2_value !== (t2_value = /*user*/ ctx[1].username + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*users*/ 1 && t4_value !== (t4_value = /*user*/ ctx[1].name + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*users*/ 1 && t6_value !== (t6_value = /*user*/ ctx[1].email + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*users*/ 1 && t8_value !== (t8_value = /*user*/ ctx[1].userType + "")) set_data_dev(t8, t8_value);
    			if (dirty & /*users*/ 1 && t10_value !== (t10_value = /*user*/ ctx[1].userStatus + "")) set_data_dev(t10, t10_value);

    			if (dirty & /*users*/ 1 && tr_onclick_value !== (tr_onclick_value = "document.location = '" + ('#/users/' + /*user*/ ctx[1]._id) + "';")) {
    				attr_dev(tr, "onclick", tr_onclick_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(113:8) {#each users as user, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let h10;
    	let t1;
    	let form;
    	let div3;
    	let div0;
    	let label0;
    	let t3;
    	let input0;
    	let t4;
    	let div1;
    	let label1;
    	let t6;
    	let input1;
    	let t7;
    	let div2;
    	let label2;
    	let t9;
    	let input2;
    	let t10;
    	let button;
    	let t12;
    	let div4;
    	let t13;
    	let h11;
    	let t15;
    	let table;
    	let thead;
    	let tr0;
    	let th0;
    	let t17;
    	let th1;
    	let t19;
    	let th2;
    	let t21;
    	let th3;
    	let t23;
    	let th4;
    	let t25;
    	let th5;
    	let t27;
    	let tbody;
    	let t28;
    	let tr1;
    	let dt;
    	let t29;
    	let t30_value = /*users*/ ctx[0].length + "";
    	let t30;
    	let mounted;
    	let dispose;
    	let each_value = /*users*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h10 = element("h1");
    			h10.textContent = "Create User";
    			t1 = space();
    			form = element("form");
    			div3 = element("div");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Username";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Name";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			div2 = element("div");
    			label2 = element("label");
    			label2.textContent = "Username";
    			t9 = space();
    			input2 = element("input");
    			t10 = space();
    			button = element("button");
    			button.textContent = "Submit";
    			t12 = space();
    			div4 = element("div");
    			t13 = space();
    			h11 = element("h1");
    			h11.textContent = "All Users";
    			t15 = space();
    			table = element("table");
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Number";
    			t17 = space();
    			th1 = element("th");
    			th1.textContent = "Username";
    			t19 = space();
    			th2 = element("th");
    			th2.textContent = "Name";
    			t21 = space();
    			th3 = element("th");
    			th3.textContent = "Email";
    			t23 = space();
    			th4 = element("th");
    			th4.textContent = "Type";
    			t25 = space();
    			th5 = element("th");
    			th5.textContent = "Status";
    			t27 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t28 = space();
    			tr1 = element("tr");
    			dt = element("dt");
    			t29 = text("Number of Products: ");
    			t30 = text(t30_value);
    			attr_dev(h10, "class", "mt-3");
    			add_location(h10, file$4, 55, 0, 1348);
    			attr_dev(label0, "class", "form-label");
    			attr_dev(label0, "for", "productname");
    			add_location(label0, file$4, 59, 12, 1471);
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "id", "description");
    			attr_dev(input0, "type", "text");
    			add_location(input0, file$4, 60, 12, 1545);
    			attr_dev(div0, "class", "col");
    			add_location(div0, file$4, 58, 8, 1440);
    			attr_dev(label1, "class", "form-label");
    			attr_dev(label1, "for", "productname");
    			add_location(label1, file$4, 69, 12, 1771);
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "id", "description");
    			attr_dev(input1, "type", "text");
    			add_location(input1, file$4, 70, 12, 1841);
    			attr_dev(div1, "class", "col");
    			add_location(div1, file$4, 68, 8, 1740);
    			attr_dev(label2, "class", "form-label");
    			attr_dev(label2, "for", "productname");
    			add_location(label2, file$4, 79, 12, 2063);
    			attr_dev(input2, "class", "form-control");
    			attr_dev(input2, "id", "description");
    			attr_dev(input2, "type", "text");
    			add_location(input2, file$4, 80, 12, 2137);
    			attr_dev(div2, "class", "col");
    			add_location(div2, file$4, 78, 8, 2032);
    			attr_dev(div3, "class", "row mb-3");
    			add_location(div3, file$4, 57, 4, 1408);
    			attr_dev(form, "class", "mb-5");
    			add_location(form, file$4, 56, 0, 1383);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "my-button");
    			add_location(button, file$4, 91, 0, 2344);
    			attr_dev(div4, "class", "row mb-3");
    			add_location(div4, file$4, 95, 0, 2433);
    			add_location(h11, file$4, 98, 0, 2467);
    			add_location(th0, file$4, 103, 12, 2563);
    			add_location(th1, file$4, 104, 12, 2592);
    			add_location(th2, file$4, 105, 12, 2623);
    			add_location(th3, file$4, 106, 12, 2650);
    			add_location(th4, file$4, 107, 12, 2678);
    			add_location(th5, file$4, 108, 12, 2705);
    			add_location(tr0, file$4, 102, 8, 2545);
    			add_location(thead, file$4, 101, 4, 2528);
    			add_location(dt, file$4, 138, 12, 3485);
    			add_location(tr1, file$4, 137, 8, 3467);
    			add_location(tbody, file$4, 111, 4, 2755);
    			attr_dev(table, "class", "table table-hover");
    			add_location(table, file$4, 100, 0, 2489);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h10, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, form, anchor);
    			append_dev(form, div3);
    			append_dev(div3, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t3);
    			append_dev(div0, input0);
    			set_input_value(input0, /*user*/ ctx[1].username);
    			append_dev(div3, t4);
    			append_dev(div3, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t6);
    			append_dev(div1, input1);
    			set_input_value(input1, /*user*/ ctx[1].name);
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    			append_dev(div2, label2);
    			append_dev(div2, t9);
    			append_dev(div2, input2);
    			set_input_value(input2, /*user*/ ctx[1].email);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, button, anchor);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, h11, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t17);
    			append_dev(tr0, th1);
    			append_dev(tr0, t19);
    			append_dev(tr0, th2);
    			append_dev(tr0, t21);
    			append_dev(tr0, th3);
    			append_dev(tr0, t23);
    			append_dev(tr0, th4);
    			append_dev(tr0, t25);
    			append_dev(tr0, th5);
    			append_dev(table, t27);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			append_dev(tbody, t28);
    			append_dev(tbody, tr1);
    			append_dev(tr1, dt);
    			append_dev(dt, t29);
    			append_dev(dt, t30);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[3]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[4]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[5]),
    					listen_dev(button, "click", /*createUser*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*user*/ 2 && input0.value !== /*user*/ ctx[1].username) {
    				set_input_value(input0, /*user*/ ctx[1].username);
    			}

    			if (dirty & /*user*/ 2 && input1.value !== /*user*/ ctx[1].name) {
    				set_input_value(input1, /*user*/ ctx[1].name);
    			}

    			if (dirty & /*user*/ 2 && input2.value !== /*user*/ ctx[1].email) {
    				set_input_value(input2, /*user*/ ctx[1].email);
    			}

    			if (dirty & /*users*/ 1) {
    				each_value = /*users*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, t28);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*users*/ 1 && t30_value !== (t30_value = /*users*/ ctx[0].length + "")) set_data_dev(t30, t30_value);
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h10);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(form);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(h11);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const api_root$3 = "https://f24530a0-2bc4-4ab0-9f43-d44c45c239b5.mock.pstmn.io";

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Users', slots, []);
    	let users = [];
    	let user = { email: null, username: null, name: null };

    	function getUsers() {
    		var config = {
    			method: "get",
    			url: api_root$3 + "/api/users",
    			headers: {}
    		};

    		axios(config).then(function (response) {
    			$$invalidate(0, users = response.data);
    		}).catch(function (error) {
    			alert("Could not get users");
    			console.log(error);
    		});
    	}

    	function createUser() {
    		var config = {
    			method: "post",
    			url: api_root$3 + "/api/users",
    			headers: { "Content-Type": "application/json" },
    			data: user
    		};

    		axios(config).then(function (response) {
    			alert("Product created");
    			getUsers();
    		}).catch(function (error) {
    			alert("Could not create User");
    			console.log(error);
    		});
    	}

    	getUsers();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$3.warn(`<Users> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		user.username = this.value;
    		$$invalidate(1, user);
    	}

    	function input1_input_handler() {
    		user.name = this.value;
    		$$invalidate(1, user);
    	}

    	function input2_input_handler() {
    		user.email = this.value;
    		$$invalidate(1, user);
    	}

    	$$self.$capture_state = () => ({
    		axios,
    		api_root: api_root$3,
    		users,
    		user,
    		getUsers,
    		createUser
    	});

    	$$self.$inject_state = $$props => {
    		if ('users' in $$props) $$invalidate(0, users = $$props.users);
    		if ('user' in $$props) $$invalidate(1, user = $$props.user);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		users,
    		user,
    		createUser,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler
    	];
    }

    class Users extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Users",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\pages\Products.svelte generated by Svelte v3.53.1 */

    const { console: console_1$2 } = globals;
    const file$3 = "src\\pages\\Products.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[14] = i;
    	return child_ctx;
    }

    // (102:4) {#each products as product, index}
    function create_each_block_1(ctx) {
    	let div4;
    	let div3;
    	let div2;
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let h5;
    	let t1_value = /*product*/ ctx[6].productname + "";
    	let t1;
    	let t2;
    	let span;
    	let t3_value = /*product*/ ctx[6].difficultyType + "";
    	let t3;
    	let t4;
    	let p0;
    	let t5;
    	let p1;
    	let t6;
    	let t7_value = /*product*/ ctx[6].productType + "";
    	let t7;
    	let t8;
    	let p2;
    	let t9;
    	let t10_value = /*product*/ ctx[6].clothingType + "";
    	let t10;
    	let t11;
    	let p3;
    	let t12;
    	let t13_value = /*product*/ ctx[6].price + "";
    	let t13;
    	let t14;
    	let p4;
    	let t15;
    	let t16_value = /*product*/ ctx[6].size + "";
    	let t16;
    	let t17;
    	let p5;
    	let small;
    	let t18;
    	let t19_value = /*index*/ ctx[14] + 1 + "";
    	let t19;
    	let div1_onclick_value;
    	let t20;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			h5 = element("h5");
    			t1 = text(t1_value);
    			t2 = space();
    			span = element("span");
    			t3 = text(t3_value);
    			t4 = space();
    			p0 = element("p");
    			t5 = space();
    			p1 = element("p");
    			t6 = text("Product Type: ");
    			t7 = text(t7_value);
    			t8 = space();
    			p2 = element("p");
    			t9 = text("Clothing Type: ");
    			t10 = text(t10_value);
    			t11 = space();
    			p3 = element("p");
    			t12 = text("Product Price: ");
    			t13 = text(t13_value);
    			t14 = space();
    			p4 = element("p");
    			t15 = text("Product Size: ");
    			t16 = text(t16_value);
    			t17 = space();
    			p5 = element("p");
    			small = element("small");
    			t18 = text("Product Number: ");
    			t19 = text(t19_value);
    			t20 = space();
    			attr_dev(img, "class", "card-img-top");
    			if (!src_url_equal(img.src, img_src_value = "/images/default.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Card image cap");
    			add_location(img, file$3, 111, 24, 3008);
    			attr_dev(span, "class", "badge");
    			add_location(span, file$3, 119, 32, 3386);
    			attr_dev(h5, "class", "card-title");
    			add_location(h5, file$3, 117, 28, 3274);
    			attr_dev(p0, "class", "card-text");
    			add_location(p0, file$3, 124, 28, 3576);
    			add_location(p1, file$3, 125, 28, 3629);
    			add_location(p2, file$3, 128, 28, 3765);
    			add_location(p3, file$3, 132, 28, 3905);
    			add_location(p4, file$3, 136, 28, 4038);
    			attr_dev(small, "class", "text-muted");
    			add_location(small, file$3, 141, 32, 4224);
    			attr_dev(p5, "class", "card-text");
    			add_location(p5, file$3, 140, 28, 4169);
    			attr_dev(div0, "class", "card-body");
    			add_location(div0, file$3, 116, 24, 3221);
    			attr_dev(div1, "class", "card");
    			attr_dev(div1, "onclick", div1_onclick_value = "document.location = '" + ('#/products/' + /*product*/ ctx[6].id) + "';");
    			add_location(div1, file$3, 105, 20, 2730);
    			attr_dev(div2, "class", "card mb-2");
    			add_location(div2, file$3, 104, 16, 2685);
    			attr_dev(div3, "class", "col-10");
    			add_location(div3, file$3, 103, 12, 2647);
    			attr_dev(div4, "class", "container");
    			add_location(div4, file$3, 102, 8, 2610);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, h5);
    			append_dev(h5, t1);
    			append_dev(h5, t2);
    			append_dev(h5, span);
    			append_dev(span, t3);
    			append_dev(div0, t4);
    			append_dev(div0, p0);
    			append_dev(div0, t5);
    			append_dev(div0, p1);
    			append_dev(p1, t6);
    			append_dev(p1, t7);
    			append_dev(div0, t8);
    			append_dev(div0, p2);
    			append_dev(p2, t9);
    			append_dev(p2, t10);
    			append_dev(div0, t11);
    			append_dev(div0, p3);
    			append_dev(p3, t12);
    			append_dev(p3, t13);
    			append_dev(div0, t14);
    			append_dev(div0, p4);
    			append_dev(p4, t15);
    			append_dev(p4, t16);
    			append_dev(div0, t17);
    			append_dev(div0, p5);
    			append_dev(p5, small);
    			append_dev(small, t18);
    			append_dev(small, t19);
    			append_dev(div4, t20);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*products*/ 16 && t1_value !== (t1_value = /*product*/ ctx[6].productname + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*products*/ 16 && t3_value !== (t3_value = /*product*/ ctx[6].difficultyType + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*products*/ 16 && t7_value !== (t7_value = /*product*/ ctx[6].productType + "")) set_data_dev(t7, t7_value);
    			if (dirty & /*products*/ 16 && t10_value !== (t10_value = /*product*/ ctx[6].clothingType + "")) set_data_dev(t10, t10_value);
    			if (dirty & /*products*/ 16 && t13_value !== (t13_value = /*product*/ ctx[6].price + "")) set_data_dev(t13, t13_value);
    			if (dirty & /*products*/ 16 && t16_value !== (t16_value = /*product*/ ctx[6].size + "")) set_data_dev(t16, t16_value);

    			if (dirty & /*products*/ 16 && div1_onclick_value !== (div1_onclick_value = "document.location = '" + ('#/products/' + /*product*/ ctx[6].id) + "';")) {
    				attr_dev(div1, "onclick", div1_onclick_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(102:4) {#each products as product, index}",
    		ctx
    	});

    	return block;
    }

    // (156:8) {#each Array(nrOfPages) as _, i}
    function create_each_block$1(ctx) {
    	let li;
    	let a;
    	let t0_value = /*i*/ ctx[12] + 1 + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(a, "class", "page-link");
    			attr_dev(a, "href", "#/products?page=" + (/*i*/ ctx[12] + 1));
    			toggle_class(a, "active", /*currentPage*/ ctx[0] == /*i*/ ctx[12] + 1);
    			add_location(a, file$3, 157, 16, 4666);
    			attr_dev(li, "class", "page-item");
    			add_location(li, file$3, 156, 12, 4626);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t0);
    			append_dev(li, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentPage*/ 1) {
    				toggle_class(a, "active", /*currentPage*/ ctx[0] == /*i*/ ctx[12] + 1);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(156:8) {#each Array(nrOfPages) as _, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let h1;
    	let t1;
    	let h4;
    	let t2;
    	let t3_value = /*products*/ ctx[4].length + "";
    	let t3;
    	let t4;
    	let a0;
    	let t6;
    	let a1;
    	let t8;
    	let div4;
    	let div0;
    	let label;
    	let t10;
    	let div1;
    	let input0;
    	let t11;
    	let div2;
    	let input1;
    	let t12;
    	let div3;
    	let button;
    	let t14;
    	let div5;
    	let t15;
    	let nav;
    	let ul;
    	let t16;
    	let a2;
    	let t18;
    	let a3;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*products*/ ctx[4];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = Array(/*nrOfPages*/ ctx[1]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "All Products";
    			t1 = space();
    			h4 = element("h4");
    			t2 = text("Number of Products: ");
    			t3 = text(t3_value);
    			t4 = space();
    			a0 = element("a");
    			a0.textContent = "Add Product";
    			t6 = space();
    			a1 = element("a");
    			a1.textContent = "Back";
    			t8 = space();
    			div4 = element("div");
    			div0 = element("div");
    			label = element("label");
    			label.textContent = "Price:";
    			t10 = space();
    			div1 = element("div");
    			input0 = element("input");
    			t11 = space();
    			div2 = element("div");
    			input1 = element("input");
    			t12 = space();
    			div3 = element("div");
    			button = element("button");
    			button.textContent = "Apply";
    			t14 = space();
    			div5 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t15 = space();
    			nav = element("nav");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t16 = space();
    			a2 = element("a");
    			a2.textContent = "Add Product";
    			t18 = space();
    			a3 = element("a");
    			a3.textContent = "Back";
    			add_location(h1, file$3, 65, 0, 1612);
    			add_location(h4, file$3, 66, 0, 1635);
    			attr_dev(a0, "class", "my-button");
    			attr_dev(a0, "href", "#/create-product");
    			attr_dev(a0, "role", "button");
    			attr_dev(a0, "aria-pressed", "true");
    			add_location(a0, file$3, 70, 0, 1693);
    			attr_dev(a1, "class", "back-button");
    			attr_dev(a1, "href", "#/");
    			attr_dev(a1, "role", "button");
    			attr_dev(a1, "aria-pressed", "true");
    			add_location(a1, file$3, 73, 0, 1797);
    			attr_dev(label, "for", "");
    			attr_dev(label, "class", "col-form-label");
    			add_location(label, file$3, 77, 8, 1936);
    			attr_dev(div0, "class", "col-auto");
    			add_location(div0, file$3, 76, 4, 1904);
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "placeholder", "from");
    			add_location(input0, file$3, 80, 8, 2035);
    			attr_dev(div1, "class", "col-3");
    			add_location(div1, file$3, 79, 4, 2006);
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "placeholder", "to");
    			add_location(input1, file$3, 88, 8, 2229);
    			attr_dev(div2, "class", "col-3");
    			add_location(div2, file$3, 87, 4, 2200);
    			attr_dev(button, "class", "btn btn-primary");
    			add_location(button, file$3, 96, 8, 2421);
    			attr_dev(div3, "class", "col-3");
    			add_location(div3, file$3, 95, 4, 2392);
    			attr_dev(div4, "class", "row my-3");
    			add_location(div4, file$3, 75, 0, 1876);
    			attr_dev(div5, "class", "row row-cols-1 row-cols-md-3 g-4");
    			add_location(div5, file$3, 100, 0, 2514);
    			attr_dev(ul, "class", "pagination");
    			add_location(ul, file$3, 154, 4, 4547);
    			add_location(nav, file$3, 153, 0, 4536);
    			attr_dev(a2, "class", "my-button");
    			attr_dev(a2, "href", "#/create-product");
    			attr_dev(a2, "role", "button");
    			attr_dev(a2, "aria-pressed", "true");
    			add_location(a2, file$3, 168, 0, 4932);
    			attr_dev(a3, "class", "back-button");
    			attr_dev(a3, "href", "#/");
    			attr_dev(a3, "role", "button");
    			attr_dev(a3, "aria-pressed", "true");
    			add_location(a3, file$3, 171, 0, 5036);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h4, anchor);
    			append_dev(h4, t2);
    			append_dev(h4, t3);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, a0, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, a1, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div0, label);
    			append_dev(div4, t10);
    			append_dev(div4, div1);
    			append_dev(div1, input0);
    			set_input_value(input0, /*pricesMin*/ ctx[2]);
    			append_dev(div4, t11);
    			append_dev(div4, div2);
    			append_dev(div2, input1);
    			set_input_value(input1, /*pricesMax*/ ctx[3]);
    			append_dev(div4, t12);
    			append_dev(div4, div3);
    			append_dev(div3, button);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, div5, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div5, null);
    			}

    			insert_dev(target, t15, anchor);
    			insert_dev(target, nav, anchor);
    			append_dev(nav, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			insert_dev(target, t16, anchor);
    			insert_dev(target, a2, anchor);
    			insert_dev(target, t18, anchor);
    			insert_dev(target, a3, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[8]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[9]),
    					listen_dev(button, "click", /*getProducts*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*products*/ 16 && t3_value !== (t3_value = /*products*/ ctx[4].length + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*pricesMin*/ 4 && to_number(input0.value) !== /*pricesMin*/ ctx[2]) {
    				set_input_value(input0, /*pricesMin*/ ctx[2]);
    			}

    			if (dirty & /*pricesMax*/ 8 && to_number(input1.value) !== /*pricesMax*/ ctx[3]) {
    				set_input_value(input1, /*pricesMax*/ ctx[3]);
    			}

    			if (dirty & /*products*/ 16) {
    				each_value_1 = /*products*/ ctx[4];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div5, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*currentPage, nrOfPages*/ 3) {
    				each_value = Array(/*nrOfPages*/ ctx[1]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h4);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(a0);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(a1);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(div5);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(nav);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(a2);
    			if (detaching) detach_dev(t18);
    			if (detaching) detach_dev(a3);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const api_root$2 = "http://localhost:8080";

    function instance$3($$self, $$props, $$invalidate) {
    	let $querystring;
    	validate_store(querystring, 'querystring');
    	component_subscribe($$self, querystring, $$value => $$invalidate(7, $querystring = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Products', slots, []);
    	let currentPage;
    	let nrOfPages = 0;
    	let pricesMin, pricesMax;
    	let products = [];

    	let product = {
    		productname: null,
    		description: null,
    		productType: null,
    		difficultyType: null,
    		clothingType: null,
    		size: null,
    		price: null,
    		patchart: null
    	};

    	function getProducts() {
    		let query = "pageSize=4&page=" + currentPage;

    		if (pricesMin) {
    			query += "&min=" + pricesMin;
    		}

    		if (pricesMax) {
    			query += "&max=" + pricesMax;
    		}

    		var config = {
    			method: "get",
    			url: api_root$2 + "/api/products?" + query,
    			headers: {}
    		};

    		axios(config).then(function (response) {
    			$$invalidate(4, products = response.data.content);
    			$$invalidate(1, nrOfPages = response.data.totalPages);
    		}).catch(function (error) {
    			alert("Could not get products");
    			console.log(error);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<Products> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		pricesMin = to_number(this.value);
    		$$invalidate(2, pricesMin);
    	}

    	function input1_input_handler() {
    		pricesMax = to_number(this.value);
    		$$invalidate(3, pricesMax);
    	}

    	$$self.$capture_state = () => ({
    		axios,
    		querystring,
    		api_root: api_root$2,
    		currentPage,
    		nrOfPages,
    		pricesMin,
    		pricesMax,
    		products,
    		product,
    		getProducts,
    		$querystring
    	});

    	$$self.$inject_state = $$props => {
    		if ('currentPage' in $$props) $$invalidate(0, currentPage = $$props.currentPage);
    		if ('nrOfPages' in $$props) $$invalidate(1, nrOfPages = $$props.nrOfPages);
    		if ('pricesMin' in $$props) $$invalidate(2, pricesMin = $$props.pricesMin);
    		if ('pricesMax' in $$props) $$invalidate(3, pricesMax = $$props.pricesMax);
    		if ('products' in $$props) $$invalidate(4, products = $$props.products);
    		if ('product' in $$props) $$invalidate(6, product = $$props.product);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$querystring*/ 128) {
    			{
    				let searchParams = new URLSearchParams($querystring);

    				if (searchParams.has("page")) {
    					$$invalidate(0, currentPage = searchParams.get("page"));
    				} else {
    					$$invalidate(0, currentPage = "1");
    				}

    				getProducts();
    			}
    		}
    	};

    	return [
    		currentPage,
    		nrOfPages,
    		pricesMin,
    		pricesMax,
    		products,
    		getProducts,
    		product,
    		$querystring,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class Products extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Products",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\pages\Utilities.svelte generated by Svelte v3.53.1 */

    const { console: console_1$1 } = globals;
    const file$2 = "src\\pages\\Utilities.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    // (127:8) {#each utilities as utility, index}
    function create_each_block(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*index*/ ctx[8] + 1 + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*utility*/ ctx[1].utilityName + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*utility*/ ctx[1].unit + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6_value = /*utility*/ ctx[1].utilityType + "";
    	let t6;
    	let tr_onclick_value;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			t6 = text(t6_value);
    			add_location(td0, file$2, 131, 16, 3796);
    			add_location(td1, file$2, 134, 16, 3874);
    			add_location(td2, file$2, 137, 16, 3962);
    			add_location(td3, file$2, 140, 16, 4043);
    			attr_dev(tr, "class", "row-tr");
    			attr_dev(tr, "onclick", tr_onclick_value = "document.location = '" + ('#/utilities/' + /*utility*/ ctx[1].id) + "';");
    			add_location(tr, file$2, 127, 12, 3648);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(td3, t6);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*utilities*/ 1 && t2_value !== (t2_value = /*utility*/ ctx[1].utilityName + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*utilities*/ 1 && t4_value !== (t4_value = /*utility*/ ctx[1].unit + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*utilities*/ 1 && t6_value !== (t6_value = /*utility*/ ctx[1].utilityType + "")) set_data_dev(t6, t6_value);

    			if (dirty & /*utilities*/ 1 && tr_onclick_value !== (tr_onclick_value = "document.location = '" + ('#/utilities/' + /*utility*/ ctx[1].id) + "';")) {
    				attr_dev(tr, "onclick", tr_onclick_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(127:8) {#each utilities as utility, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let h10;
    	let t1;
    	let form;
    	let div3;
    	let div0;
    	let label0;
    	let t3;
    	let input0;
    	let t4;
    	let div1;
    	let label1;
    	let t6;
    	let input1;
    	let t7;
    	let div2;
    	let label2;
    	let t9;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let option4;
    	let option5;
    	let option6;
    	let option7;
    	let option8;
    	let option9;
    	let option10;
    	let option11;
    	let option12;
    	let t23;
    	let button;
    	let t25;
    	let div4;
    	let t26;
    	let h11;
    	let t28;
    	let table;
    	let thead;
    	let tr0;
    	let th0;
    	let t30;
    	let th1;
    	let t32;
    	let th2;
    	let t34;
    	let th3;
    	let t36;
    	let tbody;
    	let t37;
    	let tr1;
    	let dt;
    	let t38;
    	let t39_value = /*utilities*/ ctx[0].length + "";
    	let t39;
    	let mounted;
    	let dispose;
    	let each_value = /*utilities*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h10 = element("h1");
    			h10.textContent = "Create Utility";
    			t1 = space();
    			form = element("form");
    			div3 = element("div");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Username";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Price";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			div2 = element("div");
    			label2 = element("label");
    			label2.textContent = "Utility Type";
    			t9 = space();
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "WRITING";
    			option1 = element("option");
    			option1.textContent = "MARKING";
    			option2 = element("option");
    			option2.textContent = "CUTTING";
    			option3 = element("option");
    			option3.textContent = "SEWING";
    			option4 = element("option");
    			option4.textContent = "MASCHINE";
    			option5 = element("option");
    			option5.textContent = "FOOT";
    			option6 = element("option");
    			option6.textContent = "NEEDLE";
    			option7 = element("option");
    			option7.textContent = "ATTACHMENT";
    			option8 = element("option");
    			option8.textContent = "MEASURING";
    			option9 = element("option");
    			option9.textContent = "SECURITY";
    			option10 = element("option");
    			option10.textContent = "HELP";
    			option11 = element("option");
    			option11.textContent = "THREAD";
    			option12 = element("option");
    			option12.textContent = "PATTERN";
    			t23 = space();
    			button = element("button");
    			button.textContent = "Submit";
    			t25 = space();
    			div4 = element("div");
    			t26 = space();
    			h11 = element("h1");
    			h11.textContent = "All Utilities";
    			t28 = space();
    			table = element("table");
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Number";
    			t30 = space();
    			th1 = element("th");
    			th1.textContent = "Name";
    			t32 = space();
    			th2 = element("th");
    			th2.textContent = "Units";
    			t34 = space();
    			th3 = element("th");
    			th3.textContent = "Utility Types";
    			t36 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t37 = space();
    			tr1 = element("tr");
    			dt = element("dt");
    			t38 = text("Number of Products: ");
    			t39 = text(t39_value);
    			attr_dev(h10, "class", "mt-3");
    			add_location(h10, file$2, 55, 0, 1401);
    			attr_dev(label0, "class", "form-label");
    			attr_dev(label0, "for", "productname");
    			add_location(label0, file$2, 59, 12, 1527);
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "id", "description");
    			attr_dev(input0, "type", "text");
    			add_location(input0, file$2, 60, 12, 1601);
    			attr_dev(div0, "class", "col");
    			add_location(div0, file$2, 58, 8, 1496);
    			attr_dev(label1, "class", "form-label");
    			attr_dev(label1, "for", "earnings");
    			add_location(label1, file$2, 69, 16, 1837);
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "id", "earnings");
    			attr_dev(input1, "type", "number");
    			add_location(input1, file$2, 70, 16, 1909);
    			attr_dev(div1, "class", "col");
    			add_location(div1, file$2, 68, 8, 1802);
    			attr_dev(label2, "class", "form-label");
    			attr_dev(label2, "for", "difficultyType");
    			add_location(label2, file$2, 79, 12, 2157);
    			option0.__value = "OTHER";
    			option0.value = option0.__value;
    			add_location(option0, file$2, 88, 16, 2453);
    			option1.__value = "TEST";
    			option1.value = option1.__value;
    			add_location(option1, file$2, 89, 16, 2509);
    			option2.__value = "TEST";
    			option2.value = option2.__value;
    			add_location(option2, file$2, 90, 16, 2564);
    			option3.__value = "TEST";
    			option3.value = option3.__value;
    			add_location(option3, file$2, 91, 16, 2619);
    			option4.__value = "TEST";
    			option4.value = option4.__value;
    			add_location(option4, file$2, 92, 16, 2673);
    			option5.__value = "TEST";
    			option5.value = option5.__value;
    			add_location(option5, file$2, 93, 16, 2729);
    			option6.__value = "TEST";
    			option6.value = option6.__value;
    			add_location(option6, file$2, 94, 16, 2781);
    			option7.__value = "TEST";
    			option7.value = option7.__value;
    			add_location(option7, file$2, 95, 16, 2835);
    			option8.__value = "TEST";
    			option8.value = option8.__value;
    			add_location(option8, file$2, 96, 16, 2893);
    			option9.__value = "TEST";
    			option9.value = option9.__value;
    			add_location(option9, file$2, 97, 16, 2950);
    			option10.__value = "TEST";
    			option10.value = option10.__value;
    			add_location(option10, file$2, 98, 16, 3006);
    			option11.__value = "TEST";
    			option11.value = option11.__value;
    			add_location(option11, file$2, 99, 16, 3058);
    			option12.__value = "TEST";
    			option12.value = option12.__value;
    			add_location(option12, file$2, 100, 16, 3112);
    			attr_dev(select, "class", "form-select");
    			attr_dev(select, "id", "type");
    			attr_dev(select, "type", "text");
    			if (/*utility*/ ctx[1].utilityType === void 0) add_render_callback(() => /*select_change_handler*/ ctx[5].call(select));
    			add_location(select, file$2, 82, 12, 2270);
    			attr_dev(div2, "class", "col");
    			add_location(div2, file$2, 78, 8, 2126);
    			attr_dev(div3, "class", "row mb-3");
    			add_location(div3, file$2, 57, 4, 1464);
    			attr_dev(form, "class", "mb-5");
    			add_location(form, file$2, 56, 0, 1439);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "my-button");
    			add_location(button, file$2, 107, 0, 3215);
    			attr_dev(div4, "class", "row mb-3");
    			add_location(div4, file$2, 111, 0, 3307);
    			add_location(h11, file$2, 114, 0, 3341);
    			add_location(th0, file$2, 119, 12, 3441);
    			add_location(th1, file$2, 120, 12, 3470);
    			add_location(th2, file$2, 121, 12, 3497);
    			add_location(th3, file$2, 122, 12, 3525);
    			add_location(tr0, file$2, 118, 8, 3423);
    			add_location(thead, file$2, 117, 4, 3406);
    			add_location(dt, file$2, 146, 12, 4181);
    			add_location(tr1, file$2, 145, 8, 4163);
    			add_location(tbody, file$2, 125, 4, 3582);
    			attr_dev(table, "class", "table table-hover");
    			add_location(table, file$2, 116, 0, 3367);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h10, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, form, anchor);
    			append_dev(form, div3);
    			append_dev(div3, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t3);
    			append_dev(div0, input0);
    			set_input_value(input0, /*utility*/ ctx[1].utilityname);
    			append_dev(div3, t4);
    			append_dev(div3, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t6);
    			append_dev(div1, input1);
    			set_input_value(input1, /*utility*/ ctx[1].unit);
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    			append_dev(div2, label2);
    			append_dev(div2, t9);
    			append_dev(div2, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			append_dev(select, option3);
    			append_dev(select, option4);
    			append_dev(select, option5);
    			append_dev(select, option6);
    			append_dev(select, option7);
    			append_dev(select, option8);
    			append_dev(select, option9);
    			append_dev(select, option10);
    			append_dev(select, option11);
    			append_dev(select, option12);
    			select_option(select, /*utility*/ ctx[1].utilityType);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, button, anchor);
    			insert_dev(target, t25, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t26, anchor);
    			insert_dev(target, h11, anchor);
    			insert_dev(target, t28, anchor);
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t30);
    			append_dev(tr0, th1);
    			append_dev(tr0, t32);
    			append_dev(tr0, th2);
    			append_dev(tr0, t34);
    			append_dev(tr0, th3);
    			append_dev(table, t36);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			append_dev(tbody, t37);
    			append_dev(tbody, tr1);
    			append_dev(tr1, dt);
    			append_dev(dt, t38);
    			append_dev(dt, t39);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[3]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[4]),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[5]),
    					listen_dev(button, "click", /*createUtility*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*utility*/ 2 && input0.value !== /*utility*/ ctx[1].utilityname) {
    				set_input_value(input0, /*utility*/ ctx[1].utilityname);
    			}

    			if (dirty & /*utility*/ 2 && to_number(input1.value) !== /*utility*/ ctx[1].unit) {
    				set_input_value(input1, /*utility*/ ctx[1].unit);
    			}

    			if (dirty & /*utility*/ 2) {
    				select_option(select, /*utility*/ ctx[1].utilityType);
    			}

    			if (dirty & /*utilities*/ 1) {
    				each_value = /*utilities*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, t37);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*utilities*/ 1 && t39_value !== (t39_value = /*utilities*/ ctx[0].length + "")) set_data_dev(t39, t39_value);
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h10);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(form);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t25);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t26);
    			if (detaching) detach_dev(h11);
    			if (detaching) detach_dev(t28);
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const api_root$1 = "https://f24530a0-2bc4-4ab0-9f43-d44c45c239b5.mock.pstmn.io";

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Utilities', slots, []);
    	let utilities = [];

    	let utility = {
    		utilityName: null,
    		unit: null,
    		utilityType: null
    	};

    	function getUtilities() {
    		var config = {
    			method: "get",
    			url: api_root$1 + "/api/utilities",
    			headers: {}
    		};

    		axios(config).then(function (response) {
    			$$invalidate(0, utilities = response.data);
    		}).catch(function (error) {
    			alert("Could not get utilities");
    			console.log(error);
    		});
    	}

    	function createUtility() {
    		var config = {
    			method: "post",
    			url: api_root$1 + "/api/utilities",
    			headers: { "Content-Type": "application/json" },
    			data: utility
    		};

    		axios(config).then(function (response) {
    			alert("Utility created");
    			getUtilities();
    		}).catch(function (error) {
    			alert("Could not create Utility");
    			console.log(error);
    		});
    	}

    	getUtilities();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Utilities> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		utility.utilityname = this.value;
    		$$invalidate(1, utility);
    	}

    	function input1_input_handler() {
    		utility.unit = to_number(this.value);
    		$$invalidate(1, utility);
    	}

    	function select_change_handler() {
    		utility.utilityType = select_value(this);
    		$$invalidate(1, utility);
    	}

    	$$self.$capture_state = () => ({
    		axios,
    		api_root: api_root$1,
    		utilities,
    		utility,
    		getUtilities,
    		createUtility
    	});

    	$$self.$inject_state = $$props => {
    		if ('utilities' in $$props) $$invalidate(0, utilities = $$props.utilities);
    		if ('utility' in $$props) $$invalidate(1, utility = $$props.utility);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		utilities,
    		utility,
    		createUtility,
    		input0_input_handler,
    		input1_input_handler,
    		select_change_handler
    	];
    }

    class Utilities extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Utilities",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\pages\CreateProduct.svelte generated by Svelte v3.53.1 */

    const { console: console_1 } = globals;
    const file$1 = "src\\pages\\CreateProduct.svelte";

    function create_fragment$1(ctx) {
    	let h1;
    	let t1;
    	let form;
    	let div3;
    	let div0;
    	let label0;
    	let t3;
    	let input0;
    	let t4;
    	let div1;
    	let label1;
    	let t6;
    	let select0;
    	let option0;
    	let option1;
    	let t9;
    	let div2;
    	let label2;
    	let t11;
    	let select1;
    	let option2;
    	let option3;
    	let option4;
    	let t15;
    	let div7;
    	let div4;
    	let label3;
    	let t17;
    	let select2;
    	let option5;
    	let option6;
    	let option7;
    	let option8;
    	let option9;
    	let option10;
    	let option11;
    	let option12;
    	let option13;
    	let option14;
    	let option15;
    	let t29;
    	let div5;
    	let label4;
    	let t31;
    	let input1;
    	let t32;
    	let div6;
    	let label5;
    	let t34;
    	let input2;
    	let t35;
    	let div9;
    	let div8;
    	let label6;
    	let t37;
    	let textarea;
    	let t38;
    	let a;
    	let t40;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Create Product";
    			t1 = space();
    			form = element("form");
    			div3 = element("div");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Product Name";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Product Type";
    			t6 = space();
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "SCHNITTMUSTER";
    			option1 = element("option");
    			option1.textContent = "MANUAL";
    			t9 = space();
    			div2 = element("div");
    			label2 = element("label");
    			label2.textContent = "Difficulty Type";
    			t11 = space();
    			select1 = element("select");
    			option2 = element("option");
    			option2.textContent = "EASY";
    			option3 = element("option");
    			option3.textContent = "MIDDLE";
    			option4 = element("option");
    			option4.textContent = "DIFFICULT";
    			t15 = space();
    			div7 = element("div");
    			div4 = element("div");
    			label3 = element("label");
    			label3.textContent = "Clothing Type";
    			t17 = space();
    			select2 = element("select");
    			option5 = element("option");
    			option5.textContent = "SHIRT";
    			option6 = element("option");
    			option6.textContent = "TSHIRT";
    			option7 = element("option");
    			option7.textContent = "PULLOVER";
    			option8 = element("option");
    			option8.textContent = "BLOUSE";
    			option9 = element("option");
    			option9.textContent = "JACKET";
    			option10 = element("option");
    			option10.textContent = "TROUSERS";
    			option11 = element("option");
    			option11.textContent = "SKIRT";
    			option12 = element("option");
    			option12.textContent = "DRESS";
    			option13 = element("option");
    			option13.textContent = "SOCKS";
    			option14 = element("option");
    			option14.textContent = "ACCESSOIRES";
    			option15 = element("option");
    			option15.textContent = "UNDEFINED";
    			t29 = space();
    			div5 = element("div");
    			label4 = element("label");
    			label4.textContent = "Price";
    			t31 = space();
    			input1 = element("input");
    			t32 = space();
    			div6 = element("div");
    			label5 = element("label");
    			label5.textContent = "Size";
    			t34 = space();
    			input2 = element("input");
    			t35 = space();
    			div9 = element("div");
    			div8 = element("div");
    			label6 = element("label");
    			label6.textContent = "Description";
    			t37 = space();
    			textarea = element("textarea");
    			t38 = space();
    			a = element("a");
    			a.textContent = "Submit";
    			t40 = text("\r\n>");
    			attr_dev(h1, "class", "mt-3");
    			add_location(h1, file$1, 39, 0, 992);
    			attr_dev(label0, "class", "form-label");
    			attr_dev(label0, "for", "productname");
    			add_location(label0, file$1, 43, 12, 1118);
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "id", "description");
    			attr_dev(input0, "type", "text");
    			add_location(input0, file$1, 44, 12, 1196);
    			attr_dev(div0, "class", "col");
    			add_location(div0, file$1, 42, 8, 1087);
    			attr_dev(label1, "class", "form-label");
    			attr_dev(label1, "for", "difficultyType");
    			add_location(label1, file$1, 53, 12, 1428);
    			option0.__value = "OTHER";
    			option0.value = option0.__value;
    			add_location(option0, file$1, 60, 16, 1692);
    			option1.__value = "TEST";
    			option1.value = option1.__value;
    			add_location(option1, file$1, 61, 16, 1754);
    			attr_dev(select0, "class", "form-select");
    			attr_dev(select0, "id", "type");
    			attr_dev(select0, "type", "text");
    			if (/*product*/ ctx[0].productType === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[3].call(select0));
    			add_location(select0, file$1, 54, 12, 1509);
    			attr_dev(div1, "class", "col");
    			add_location(div1, file$1, 52, 8, 1397);
    			attr_dev(label2, "class", "form-label");
    			attr_dev(label2, "for", "difficultyType");
    			add_location(label2, file$1, 66, 12, 1872);
    			option2.__value = "OTHER";
    			option2.value = option2.__value;
    			add_location(option2, file$1, 75, 16, 2174);
    			option3.__value = "TEST";
    			option3.value = option3.__value;
    			add_location(option3, file$1, 76, 16, 2227);
    			option4.__value = "TEST";
    			option4.value = option4.__value;
    			add_location(option4, file$1, 77, 16, 2281);
    			attr_dev(select1, "class", "form-select");
    			attr_dev(select1, "id", "type");
    			attr_dev(select1, "type", "text");
    			if (/*product*/ ctx[0].difficultyType === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[4].call(select1));
    			add_location(select1, file$1, 69, 12, 1988);
    			attr_dev(div2, "class", "col");
    			add_location(div2, file$1, 65, 8, 1841);
    			attr_dev(div3, "class", "row mb-3");
    			add_location(div3, file$1, 41, 4, 1055);
    			attr_dev(label3, "class", "form-label");
    			attr_dev(label3, "for", "type");
    			add_location(label3, file$1, 84, 12, 2442);
    			option5.__value = "OTHER";
    			option5.value = option5.__value;
    			add_location(option5, file$1, 91, 16, 2698);
    			option6.__value = "TEST";
    			option6.value = option6.__value;
    			add_location(option6, file$1, 92, 16, 2752);
    			option7.__value = "OTHER";
    			option7.value = option7.__value;
    			add_location(option7, file$1, 93, 16, 2806);
    			option8.__value = "TEST";
    			option8.value = option8.__value;
    			add_location(option8, file$1, 94, 16, 2863);
    			option9.__value = "OTHER";
    			option9.value = option9.__value;
    			add_location(option9, file$1, 95, 16, 2917);
    			option10.__value = "TEST";
    			option10.value = option10.__value;
    			add_location(option10, file$1, 96, 16, 2972);
    			option11.__value = "OTHER";
    			option11.value = option11.__value;
    			add_location(option11, file$1, 97, 16, 3028);
    			option12.__value = "TEST";
    			option12.value = option12.__value;
    			add_location(option12, file$1, 98, 16, 3082);
    			option13.__value = "TEST";
    			option13.value = option13.__value;
    			add_location(option13, file$1, 99, 16, 3135);
    			option14.__value = "OTHER";
    			option14.value = option14.__value;
    			add_location(option14, file$1, 100, 16, 3188);
    			option15.selected = true;
    			option15.__value = "TEST";
    			option15.value = option15.__value;
    			add_location(option15, file$1, 101, 16, 3248);
    			attr_dev(select2, "class", "form-select");
    			attr_dev(select2, "id", "type");
    			attr_dev(select2, "type", "text");
    			if (/*product*/ ctx[0].clothingType === void 0) add_render_callback(() => /*select2_change_handler*/ ctx[5].call(select2));
    			add_location(select2, file$1, 85, 12, 2514);
    			attr_dev(div4, "class", "col");
    			add_location(div4, file$1, 83, 8, 2411);
    			attr_dev(label4, "class", "form-label");
    			attr_dev(label4, "for", "earnings");
    			add_location(label4, file$1, 105, 12, 3376);
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "id", "earnings");
    			attr_dev(input1, "type", "number");
    			add_location(input1, file$1, 106, 12, 3444);
    			attr_dev(div5, "class", "col");
    			add_location(div5, file$1, 104, 8, 3345);
    			attr_dev(label5, "class", "form-label");
    			attr_dev(label5, "for", "productname");
    			add_location(label5, file$1, 115, 12, 3669);
    			attr_dev(input2, "class", "form-control");
    			attr_dev(input2, "id", "description");
    			attr_dev(input2, "type", "text");
    			add_location(input2, file$1, 116, 12, 3739);
    			attr_dev(div6, "class", "col");
    			add_location(div6, file$1, 114, 8, 3638);
    			attr_dev(div7, "class", "row mb-3");
    			add_location(div7, file$1, 82, 4, 2379);
    			attr_dev(label6, "for", "description");
    			add_location(label6, file$1, 127, 12, 4004);
    			attr_dev(textarea, "class", "form-control");
    			attr_dev(textarea, "id", "description");
    			attr_dev(textarea, "rows", "3");
    			add_location(textarea, file$1, 128, 12, 4062);
    			attr_dev(div8, "class", "col");
    			add_location(div8, file$1, 126, 8, 3973);
    			attr_dev(div9, "class", "row mb-3");
    			add_location(div9, file$1, 125, 4, 3941);
    			attr_dev(form, "class", "mb-5");
    			add_location(form, file$1, 40, 0, 1030);
    			attr_dev(a, "class", "my-button");
    			attr_dev(a, "href", "#/create-product");
    			add_location(a, file$1, 137, 0, 4274);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, form, anchor);
    			append_dev(form, div3);
    			append_dev(div3, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t3);
    			append_dev(div0, input0);
    			set_input_value(input0, /*product*/ ctx[0].productname);
    			append_dev(div3, t4);
    			append_dev(div3, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t6);
    			append_dev(div1, select0);
    			append_dev(select0, option0);
    			append_dev(select0, option1);
    			select_option(select0, /*product*/ ctx[0].productType);
    			append_dev(div3, t9);
    			append_dev(div3, div2);
    			append_dev(div2, label2);
    			append_dev(div2, t11);
    			append_dev(div2, select1);
    			append_dev(select1, option2);
    			append_dev(select1, option3);
    			append_dev(select1, option4);
    			select_option(select1, /*product*/ ctx[0].difficultyType);
    			append_dev(form, t15);
    			append_dev(form, div7);
    			append_dev(div7, div4);
    			append_dev(div4, label3);
    			append_dev(div4, t17);
    			append_dev(div4, select2);
    			append_dev(select2, option5);
    			append_dev(select2, option6);
    			append_dev(select2, option7);
    			append_dev(select2, option8);
    			append_dev(select2, option9);
    			append_dev(select2, option10);
    			append_dev(select2, option11);
    			append_dev(select2, option12);
    			append_dev(select2, option13);
    			append_dev(select2, option14);
    			append_dev(select2, option15);
    			select_option(select2, /*product*/ ctx[0].clothingType);
    			append_dev(div7, t29);
    			append_dev(div7, div5);
    			append_dev(div5, label4);
    			append_dev(div5, t31);
    			append_dev(div5, input1);
    			set_input_value(input1, /*product*/ ctx[0].price);
    			append_dev(div7, t32);
    			append_dev(div7, div6);
    			append_dev(div6, label5);
    			append_dev(div6, t34);
    			append_dev(div6, input2);
    			set_input_value(input2, /*product*/ ctx[0].size);
    			append_dev(form, t35);
    			append_dev(form, div9);
    			append_dev(div9, div8);
    			append_dev(div8, label6);
    			append_dev(div8, t37);
    			append_dev(div8, textarea);
    			set_input_value(textarea, /*product*/ ctx[0].description);
    			insert_dev(target, t38, anchor);
    			insert_dev(target, a, anchor);
    			insert_dev(target, t40, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[2]),
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[3]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[4]),
    					listen_dev(select2, "change", /*select2_change_handler*/ ctx[5]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[6]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[7]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[8]),
    					listen_dev(a, "click", /*createProduct*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*product*/ 1 && input0.value !== /*product*/ ctx[0].productname) {
    				set_input_value(input0, /*product*/ ctx[0].productname);
    			}

    			if (dirty & /*product*/ 1) {
    				select_option(select0, /*product*/ ctx[0].productType);
    			}

    			if (dirty & /*product*/ 1) {
    				select_option(select1, /*product*/ ctx[0].difficultyType);
    			}

    			if (dirty & /*product*/ 1) {
    				select_option(select2, /*product*/ ctx[0].clothingType);
    			}

    			if (dirty & /*product*/ 1 && to_number(input1.value) !== /*product*/ ctx[0].price) {
    				set_input_value(input1, /*product*/ ctx[0].price);
    			}

    			if (dirty & /*product*/ 1 && input2.value !== /*product*/ ctx[0].size) {
    				set_input_value(input2, /*product*/ ctx[0].size);
    			}

    			if (dirty & /*product*/ 1) {
    				set_input_value(textarea, /*product*/ ctx[0].description);
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(form);
    			if (detaching) detach_dev(t38);
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t40);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const api_root = "http://localhost:8080";

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CreateProduct', slots, []);
    	let products = [];

    	let product = {
    		productname: null,
    		description: null,
    		productType: null,
    		difficultyType: null,
    		clothingType: null,
    		size: null,
    		price: null,
    		patchart: null
    	};

    	function createProduct() {
    		var config = {
    			method: "post",
    			url: api_root + "/api/products",
    			headers: { "Content-Type": "application/json" },
    			data: product
    		};

    		axios(config).then(function (response) {
    			alert("Product created");
    		}).catch(function (error) {
    			alert("Could not create Product");
    			console.log(error);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<CreateProduct> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		product.productname = this.value;
    		$$invalidate(0, product);
    	}

    	function select0_change_handler() {
    		product.productType = select_value(this);
    		$$invalidate(0, product);
    	}

    	function select1_change_handler() {
    		product.difficultyType = select_value(this);
    		$$invalidate(0, product);
    	}

    	function select2_change_handler() {
    		product.clothingType = select_value(this);
    		$$invalidate(0, product);
    	}

    	function input1_input_handler() {
    		product.price = to_number(this.value);
    		$$invalidate(0, product);
    	}

    	function input2_input_handler() {
    		product.size = this.value;
    		$$invalidate(0, product);
    	}

    	function textarea_input_handler() {
    		product.description = this.value;
    		$$invalidate(0, product);
    	}

    	$$self.$capture_state = () => ({
    		axios,
    		api_root,
    		products,
    		product,
    		createProduct
    	});

    	$$self.$inject_state = $$props => {
    		if ('products' in $$props) products = $$props.products;
    		if ('product' in $$props) $$invalidate(0, product = $$props.product);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		product,
    		createProduct,
    		input0_input_handler,
    		select0_change_handler,
    		select1_change_handler,
    		select2_change_handler,
    		input1_input_handler,
    		input2_input_handler,
    		textarea_input_handler
    	];
    }

    class CreateProduct extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CreateProduct",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    var routes = {
        '/': Home,
        '/home': Home,
        '/products': Products,
        '/create-product': CreateProduct,

        '/users': Users,
        '/utilities': Utilities,
    };

    /* src\App.svelte generated by Svelte v3.53.1 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let div3;
    	let nav;
    	let div1;
    	let a0;
    	let t1;
    	let button;
    	let span;
    	let t2;
    	let div0;
    	let ul;
    	let li0;
    	let a1;
    	let img;
    	let img_src_value;
    	let t3;
    	let li1;
    	let a2;
    	let t5;
    	let li2;
    	let a3;
    	let t7;
    	let li3;
    	let a4;
    	let t9;
    	let li4;
    	let a5;
    	let t11;
    	let div2;
    	let router;
    	let current;
    	router = new Router({ props: { routes }, $$inline: true });

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			nav = element("nav");
    			div1 = element("div");
    			a0 = element("a");
    			a0.textContent = "Power Puff";
    			t1 = space();
    			button = element("button");
    			span = element("span");
    			t2 = space();
    			div0 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a1 = element("a");
    			img = element("img");
    			t3 = space();
    			li1 = element("li");
    			a2 = element("a");
    			a2.textContent = "Home";
    			t5 = space();
    			li2 = element("li");
    			a3 = element("a");
    			a3.textContent = "Products";
    			t7 = space();
    			li3 = element("li");
    			a4 = element("a");
    			a4.textContent = "Users";
    			t9 = space();
    			li4 = element("li");
    			a5 = element("a");
    			a5.textContent = "Utilities";
    			t11 = space();
    			div2 = element("div");
    			create_component(router.$$.fragment);
    			attr_dev(a0, "class", "navbar-brand");
    			attr_dev(a0, "href", "#/");
    			add_location(a0, file, 10, 3, 218);
    			attr_dev(span, "class", "navbar-toggler-icon");
    			add_location(span, file, 20, 4, 511);
    			attr_dev(button, "class", "navbar-toggler");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "data-bs-toggle", "collapse");
    			attr_dev(button, "data-bs-target", "#navbarNavDropdown");
    			attr_dev(button, "aria-controls", "navbarNavDropdown");
    			attr_dev(button, "aria-expanded", "false");
    			attr_dev(button, "aria-label", "Toggle navigation");
    			add_location(button, file, 11, 3, 271);
    			if (!src_url_equal(img.src, img_src_value = "/images/home.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", "30");
    			attr_dev(img, "height", "30");
    			attr_dev(img, "class", "d-inline-block align-top");
    			attr_dev(img, "alt", "");
    			add_location(img, file, 26, 6, 734);
    			attr_dev(a1, "class", "navbar-brand");
    			attr_dev(a1, "href", "/#");
    			add_location(a1, file, 25, 6, 692);
    			attr_dev(li0, "class", "nav-item");
    			add_location(li0, file, 24, 5, 663);
    			attr_dev(a2, "class", "nav-link");
    			attr_dev(a2, "aria-current", "page");
    			attr_dev(a2, "href", "/#");
    			add_location(a2, file, 30, 6, 885);
    			attr_dev(li1, "class", "nav-item");
    			add_location(li1, file, 29, 5, 856);
    			attr_dev(a3, "class", "nav-link");
    			attr_dev(a3, "href", "#/products");
    			add_location(a3, file, 37, 6, 1023);
    			attr_dev(li2, "class", "nav-item");
    			add_location(li2, file, 36, 5, 994);
    			attr_dev(a4, "class", "nav-link");
    			attr_dev(a4, "href", "#/users");
    			add_location(a4, file, 40, 6, 1121);
    			attr_dev(li3, "class", "nav-item");
    			add_location(li3, file, 39, 5, 1092);
    			attr_dev(a5, "class", "nav-link");
    			attr_dev(a5, "href", "#/utilities");
    			add_location(a5, file, 43, 6, 1213);
    			attr_dev(li4, "class", "nav-item");
    			add_location(li4, file, 42, 5, 1184);
    			attr_dev(ul, "class", "navbar-nav");
    			add_location(ul, file, 23, 4, 633);
    			attr_dev(div0, "class", "collapse navbar-collapse");
    			attr_dev(div0, "id", "navbarNavDropdown");
    			add_location(div0, file, 22, 3, 566);
    			attr_dev(div1, "class", "container-fluid");
    			add_location(div1, file, 9, 2, 184);
    			attr_dev(nav, "class", "navbar navbar-expand-lg bg-light");
    			add_location(nav, file, 8, 1, 134);
    			attr_dev(div2, "class", "container");
    			add_location(div2, file, 50, 1, 1323);
    			attr_dev(div3, "id", "app");
    			add_location(div3, file, 5, 0, 98);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, nav);
    			append_dev(nav, div1);
    			append_dev(div1, a0);
    			append_dev(div1, t1);
    			append_dev(div1, button);
    			append_dev(button, span);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a1);
    			append_dev(a1, img);
    			append_dev(ul, t3);
    			append_dev(ul, li1);
    			append_dev(li1, a2);
    			append_dev(ul, t5);
    			append_dev(ul, li2);
    			append_dev(li2, a3);
    			append_dev(ul, t7);
    			append_dev(ul, li3);
    			append_dev(li3, a4);
    			append_dev(ul, t9);
    			append_dev(ul, li4);
    			append_dev(li4, a5);
    			append_dev(div3, t11);
    			append_dev(div3, div2);
    			mount_component(router, div2, null);
    			current = true;
    		},
    		p: noop$1,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(router);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Router, routes });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
