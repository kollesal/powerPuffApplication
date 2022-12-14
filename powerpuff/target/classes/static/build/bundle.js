
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
    function each(items, fn) {
        let str = '';
        for (let i = 0; i < items.length; i += 1) {
            str += fn(items[i], i);
        }
        return str;
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
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
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

    const { Error: Error_1, Object: Object_1, console: console_1$6 } = globals;

    // (267:0) {:else}
    function create_else_block$5(ctx) {
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
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(267:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (260:0) {#if componentParams}
    function create_if_block$7(ctx) {
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
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(260:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$7, create_else_block$5];
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
    		id: create_fragment$9.name,
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

    function instance$9($$self, $$props, $$invalidate) {
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$6.warn(`<Router> was created with unknown prop '${key}'`);
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

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$9.name
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
     * @returns {any}
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

    const _global = typeof self === "undefined" ? typeof global === "undefined" ? undefined : global : self;

    const isContextDefined = (context) => !isUndefined(context) && context !== _global;

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
      const {caseless} = isContextDefined(this) && this || {};
      const result = {};
      const assignValue = (val, key) => {
        const targetKey = caseless && findKey(result, key) || key;
        if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
          result[targetKey] = merge(result[targetKey], val);
        } else if (isPlainObject(val)) {
          result[targetKey] = merge({}, val);
        } else if (isArray(val)) {
          result[targetKey] = val.slice();
        } else {
          result[targetKey] = val;
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
        // skip restricted props in strict mode
        if (isFunction(obj) && ['arguments', 'caller', 'callee'].indexOf(name) !== -1) {
          return false;
        }

        const value = obj[name];

        if (!isFunction(value)) return;

        descriptor.enumerable = false;

        if ('writable' in descriptor) {
          descriptor.writable = false;
          return;
        }

        if (!descriptor.set) {
          descriptor.set = () => {
            throw Error('Can not rewrite read-only method \'' + name + '\'');
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

    const toJSONObject = (obj) => {
      const stack = new Array(10);

      const visit = (source, i) => {

        if (isObject(source)) {
          if (stack.indexOf(source) >= 0) {
            return;
          }

          if(!('toJSON' in source)) {
            stack[i] = source;
            const target = isArray(source) ? [] : {};

            forEach(source, (value, key) => {
              const reducedValue = visit(value, i + 1);
              !isUndefined(reducedValue) && (target[key] = reducedValue);
            });

            stack[i] = undefined;

            return target;
          }
        }

        return source;
      };

      return visit(obj, 0);
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
      toFiniteNumber,
      findKey,
      global: _global,
      isContextDefined,
      toJSONObject
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
          config: utils.toJSONObject(this.config),
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

    /**
     * Determine if we're running in a standard browser webWorker environment
     *
     * Although the `isStandardBrowserEnv` method indicates that
     * `allows axios to run in a web worker`, the WebWorker will still be
     * filtered out due to its judgment standard
     * `typeof window !== 'undefined' && typeof document !== 'undefined'`.
     * This leads to a problem when axios post `FormData` in webWorker
     */
     const isStandardBrowserWebWorkerEnv = (() => {
      return (
        typeof WorkerGlobalScope !== 'undefined' &&
        self instanceof WorkerGlobalScope &&
        typeof self.importScripts === 'function'
      );
    })();


    var platform = {
      isBrowser: true,
      classes: {
        URLSearchParams: URLSearchParams$1,
        FormData: FormData$1,
        Blob
      },
      isStandardBrowserEnv,
      isStandardBrowserWebWorkerEnv,
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

    const DEFAULT_CONTENT_TYPE = {
      'Content-Type': undefined
    };

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

      adapter: ['xhr', 'http'],

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

    function isValidHeaderName(str) {
      return /^[-_a-zA-Z]+$/.test(str.trim());
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

    class AxiosHeaders {
      constructor(headers) {
        headers && this.set(headers);
      }

      set(header, valueOrRewrite, rewrite) {
        const self = this;

        function setHeader(_value, _header, _rewrite) {
          const lHeader = normalizeHeader(_header);

          if (!lHeader) {
            throw new Error('header name must be a non-empty string');
          }

          const key = utils.findKey(self, lHeader);

          if(!key || self[key] === undefined || _rewrite === true || (_rewrite === undefined && self[key] !== false)) {
            self[key || _header] = normalizeValue(_value);
          }
        }

        const setHeaders = (headers, _rewrite) =>
          utils.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));

        if (utils.isPlainObject(header) || header instanceof this.constructor) {
          setHeaders(header, valueOrRewrite);
        } else if(utils.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
          setHeaders(parseHeaders(header), valueOrRewrite);
        } else {
          header != null && setHeader(valueOrRewrite, header, rewrite);
        }

        return this;
      }

      get(header, parser) {
        header = normalizeHeader(header);

        if (header) {
          const key = utils.findKey(this, header);

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
        }
      }

      has(header, matcher) {
        header = normalizeHeader(header);

        if (header) {
          const key = utils.findKey(this, header);

          return !!(key && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
        }

        return false;
      }

      delete(header, matcher) {
        const self = this;
        let deleted = false;

        function deleteHeader(_header) {
          _header = normalizeHeader(_header);

          if (_header) {
            const key = utils.findKey(self, _header);

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
      }

      clear() {
        return Object.keys(this).forEach(this.delete.bind(this));
      }

      normalize(format) {
        const self = this;
        const headers = {};

        utils.forEach(this, (value, header) => {
          const key = utils.findKey(headers, header);

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
      }

      concat(...targets) {
        return this.constructor.concat(this, ...targets);
      }

      toJSON(asStrings) {
        const obj = Object.create(null);

        utils.forEach(this, (value, header) => {
          value != null && value !== false && (obj[header] = asStrings && utils.isArray(value) ? value.join(', ') : value);
        });

        return obj;
      }

      [Symbol.iterator]() {
        return Object.entries(this.toJSON())[Symbol.iterator]();
      }

      toString() {
        return Object.entries(this.toJSON()).map(([header, value]) => header + ': ' + value).join('\n');
      }

      get [Symbol.toStringTag]() {
        return 'AxiosHeaders';
      }

      static from(thing) {
        return thing instanceof this ? thing : new this(thing);
      }

      static concat(first, ...targets) {
        const computed = new this(first);

        targets.forEach((target) => computed.set(target));

        return computed;
      }

      static accessor(header) {
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
    }

    AxiosHeaders.accessor(['Content-Type', 'Content-Length', 'Accept', 'Accept-Encoding', 'User-Agent']);

    utils.freezeMethods(AxiosHeaders.prototype);
    utils.freezeMethods(AxiosHeaders);

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

    // eslint-disable-next-line strict
    var httpAdapter = null;

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

    function parseProtocol(url) {
      const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
      return match && match[1] || '';
    }

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

        return passed ? Math.round(bytesCount * 1000 / passed) : undefined;
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
          estimated: rate && total && inRange ? (total - loaded) / rate : undefined,
          event: e
        };

        data[isDownloadStream ? 'download' : 'upload'] = true;

        listener(data);
      };
    }

    const isXHRAdapterSupported = typeof XMLHttpRequest !== 'undefined';

    var xhrAdapter = isXHRAdapterSupported && function (config) {
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

        if (utils.isFormData(requestData) && (platform.isStandardBrowserEnv || platform.isStandardBrowserWebWorkerEnv)) {
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
          const responseData = !responseType || responseType === 'text' || responseType === 'json' ?
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
    };

    const knownAdapters = {
      http: httpAdapter,
      xhr: xhrAdapter
    };

    utils.forEach(knownAdapters, (fn, value) => {
      if(fn) {
        try {
          Object.defineProperty(fn, 'name', {value});
        } catch (e) {
          // eslint-disable-next-line no-empty
        }
        Object.defineProperty(fn, 'adapterName', {value});
      }
    });

    var adapters = {
      getAdapter: (adapters) => {
        adapters = utils.isArray(adapters) ? adapters : [adapters];

        const {length} = adapters;
        let nameOrAdapter;
        let adapter;

        for (let i = 0; i < length; i++) {
          nameOrAdapter = adapters[i];
          if((adapter = utils.isString(nameOrAdapter) ? knownAdapters[nameOrAdapter.toLowerCase()] : nameOrAdapter)) {
            break;
          }
        }

        if (!adapter) {
          if (adapter === false) {
            throw new AxiosError(
              `Adapter ${nameOrAdapter} is not supported by the environment`,
              'ERR_NOT_SUPPORT'
            );
          }

          throw new Error(
            utils.hasOwnProp(knownAdapters, nameOrAdapter) ?
              `Adapter '${nameOrAdapter}' is not available in the build` :
              `Unknown adapter '${nameOrAdapter}'`
          );
        }

        if (!utils.isFunction(adapter)) {
          throw new TypeError('adapter is not a function');
        }

        return adapter;
      },
      adapters: knownAdapters
    };

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
        throw new CanceledError(null, config);
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

      if (['post', 'put', 'patch'].indexOf(config.method) !== -1) {
        config.headers.setContentType('application/x-www-form-urlencoded', false);
      }

      const adapter = adapters.getAdapter(config.adapter || defaults.adapter);

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

    const headersToObject = (thing) => thing instanceof AxiosHeaders ? thing.toJSON() : thing;

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

      function getMergedValue(target, source, caseless) {
        if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
          return utils.merge.call({caseless}, target, source);
        } else if (utils.isPlainObject(source)) {
          return utils.merge({}, source);
        } else if (utils.isArray(source)) {
          return source.slice();
        }
        return source;
      }

      // eslint-disable-next-line consistent-return
      function mergeDeepProperties(a, b, caseless) {
        if (!utils.isUndefined(b)) {
          return getMergedValue(a, b, caseless);
        } else if (!utils.isUndefined(a)) {
          return getMergedValue(undefined, a, caseless);
        }
      }

      // eslint-disable-next-line consistent-return
      function valueFromConfig2(a, b) {
        if (!utils.isUndefined(b)) {
          return getMergedValue(undefined, b);
        }
      }

      // eslint-disable-next-line consistent-return
      function defaultToConfig2(a, b) {
        if (!utils.isUndefined(b)) {
          return getMergedValue(undefined, b);
        } else if (!utils.isUndefined(a)) {
          return getMergedValue(undefined, a);
        }
      }

      // eslint-disable-next-line consistent-return
      function mergeDirectKeys(a, b, prop) {
        if (prop in config2) {
          return getMergedValue(a, b);
        } else if (prop in config1) {
          return getMergedValue(undefined, a);
        }
      }

      const mergeMap = {
        url: valueFromConfig2,
        method: valueFromConfig2,
        data: valueFromConfig2,
        baseURL: defaultToConfig2,
        transformRequest: defaultToConfig2,
        transformResponse: defaultToConfig2,
        paramsSerializer: defaultToConfig2,
        timeout: defaultToConfig2,
        timeoutMessage: defaultToConfig2,
        withCredentials: defaultToConfig2,
        adapter: defaultToConfig2,
        responseType: defaultToConfig2,
        xsrfCookieName: defaultToConfig2,
        xsrfHeaderName: defaultToConfig2,
        onUploadProgress: defaultToConfig2,
        onDownloadProgress: defaultToConfig2,
        decompress: defaultToConfig2,
        maxContentLength: defaultToConfig2,
        maxBodyLength: defaultToConfig2,
        beforeRedirect: defaultToConfig2,
        transport: defaultToConfig2,
        httpAgent: defaultToConfig2,
        httpsAgent: defaultToConfig2,
        cancelToken: defaultToConfig2,
        socketPath: defaultToConfig2,
        responseEncoding: defaultToConfig2,
        validateStatus: mergeDirectKeys,
        headers: (a, b) => mergeDeepProperties(headersToObject(a), headersToObject(b), true)
      };

      utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
        const merge = mergeMap[prop] || mergeDeepProperties;
        const configValue = merge(config1[prop], config2[prop], prop);
        (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
      });

      return config;
    }

    const VERSION = "1.2.1";

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

        const {transitional, paramsSerializer, headers} = config;

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

        let contextHeaders;

        // Flatten headers
        contextHeaders = headers && utils.merge(
          headers.common,
          headers[config.method]
        );

        contextHeaders && utils.forEach(
          ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
          (method) => {
            delete headers[method];
          }
        );

        config.headers = AxiosHeaders.concat(contextHeaders, headers);

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

    // Expose mergeConfig
    axios.mergeConfig = mergeConfig;

    axios.AxiosHeaders = AxiosHeaders;

    axios.formToJSON = thing => formDataToJSON(utils.isHTMLForm(thing) ? new FormData(thing) : thing);

    axios.default = axios;

    /* src\pages\Home.svelte generated by Svelte v3.53.1 */
    const file$8 = "src\\pages\\Home.svelte";

    function create_fragment$8(ctx) {
    	let div3;
    	let div2;
    	let h1;
    	let t1;
    	let div0;
    	let t2;
    	let div1;
    	let img;
    	let img_src_value;

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
    			img = element("img");
    			attr_dev(h1, "class", "mt-3");
    			add_location(h1, file$8, 18, 8, 376);
    			attr_dev(div0, "class", "col-md-12");
    			add_location(div0, file$8, 19, 8, 446);
    			if (!src_url_equal(img.src, img_src_value = "images/homep.webp")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "rounded-circle");
    			attr_dev(img, "alt", "PowerPuff");
    			attr_dev(img, "width", "500");
    			add_location(img, file$8, 22, 8, 514);
    			attr_dev(div1, "class", "mx-auto");
    			add_location(div1, file$8, 21, 8, 483);
    			attr_dev(div2, "class", "mb-5");
    			add_location(div2, file$8, 17, 4, 348);
    			attr_dev(div3, "class", "container");
    			add_location(div3, file$8, 16, 0, 319);
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
    			append_dev(div1, img);
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
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const api_root$6 = "http://localhost:8080";

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);

    	let exchangeRates = {
    		date: { currencyCode: null, ExchangeRate: null }
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ axios, api_root: api_root$6, exchangeRates });

    	$$self.$inject_state = $$props => {
    		if ('exchangeRates' in $$props) exchangeRates = $$props.exchangeRates;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    const isAuthenticated = writable(false);
    const user = writable({});
    const jwt_token = writable([]);

    /* src\pages\Users.svelte generated by Svelte v3.53.1 */

    const { console: console_1$5 } = globals;
    const file$7 = "src\\pages\\Users.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	child_ctx[16] = i;
    	return child_ctx;
    }

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (152:0) {#if mailChecked === null}
    function create_if_block_3$4(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Check Email";
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "my-button");
    			add_location(button, file$7, 152, 4, 4253);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*checkMail*/ ctx[7](/*user*/ ctx[5].email))) /*checkMail*/ ctx[7](/*user*/ ctx[5].email).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$4.name,
    		type: "if",
    		source: "(152:0) {#if mailChecked === null}",
    		ctx
    	});

    	return block;
    }

    // (155:0) {#if mailChecked !== null}
    function create_if_block$6(ctx) {
    	let h3;
    	let t1;
    	let form;
    	let div4;
    	let div0;
    	let label0;
    	let t3;
    	let div1;
    	let label1;
    	let t5;
    	let div2;
    	let label2;
    	let t7;
    	let div3;
    	let label3;
    	let t9;
    	let div9;
    	let div5;
    	let input0;
    	let input0_value_value;
    	let t10;
    	let div6;
    	let input1;
    	let input1_value_value;
    	let t11;
    	let div7;
    	let input2;
    	let input2_value_value;
    	let t12;
    	let div8;
    	let input3;
    	let input3_value_value;
    	let t13;
    	let div10;
    	let t14;
    	let t15;
    	let if_block1_anchor;
    	let if_block0 = /*emailCheck*/ ctx[4].status === "success" && create_if_block_2$4(ctx);
    	let if_block1 = /*emailCheck*/ ctx[4].status === "failure" && create_if_block_1$6(ctx);

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Mail Check Resuts:";
    			t1 = space();
    			form = element("form");
    			div4 = element("div");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Email";
    			t3 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Status";
    			t5 = space();
    			div2 = element("div");
    			label2 = element("label");
    			label2.textContent = "Domain";
    			t7 = space();
    			div3 = element("div");
    			label3 = element("label");
    			label3.textContent = "Deliverable";
    			t9 = space();
    			div9 = element("div");
    			div5 = element("div");
    			input0 = element("input");
    			t10 = space();
    			div6 = element("div");
    			input1 = element("input");
    			t11 = space();
    			div7 = element("div");
    			input2 = element("input");
    			t12 = space();
    			div8 = element("div");
    			input3 = element("input");
    			t13 = space();
    			div10 = element("div");
    			t14 = space();
    			if (if_block0) if_block0.c();
    			t15 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			add_location(h3, file$7, 155, 4, 4391);
    			attr_dev(label0, "for", "staticEmail");
    			attr_dev(label0, "class", "col-sm-2 col-form-label");
    			add_location(label0, file$7, 160, 16, 4513);
    			attr_dev(div0, "class", "col-sm-3");
    			add_location(div0, file$7, 159, 12, 4473);
    			attr_dev(label1, "for", "staticStatus");
    			attr_dev(label1, "class", "col-sm-2 col-form-label");
    			add_location(label1, file$7, 165, 16, 4697);
    			attr_dev(div1, "class", "col-sm-3");
    			add_location(div1, file$7, 164, 12, 4657);
    			attr_dev(label2, "for", "staticDomain");
    			attr_dev(label2, "class", "col-sm-2 col-form-label");
    			add_location(label2, file$7, 170, 16, 4883);
    			attr_dev(div2, "class", "col-sm-3");
    			add_location(div2, file$7, 169, 12, 4843);
    			attr_dev(label3, "for", "staticDeliverable");
    			attr_dev(label3, "class", "col-sm-2 col-form-label");
    			add_location(label3, file$7, 175, 16, 5069);
    			attr_dev(div3, "class", "col-sm-3");
    			add_location(div3, file$7, 174, 12, 5029);
    			attr_dev(div4, "class", "row");
    			add_location(div4, file$7, 158, 8, 4442);
    			attr_dev(input0, "type", "text");
    			input0.readOnly = true;
    			attr_dev(input0, "class", "form-control-plaintext");
    			attr_dev(input0, "id", "staticEmail");
    			input0.value = input0_value_value = /*user*/ ctx[5].email;
    			add_location(input0, file$7, 182, 16, 5308);
    			attr_dev(div5, "class", "col-sm-3");
    			add_location(div5, file$7, 181, 12, 5268);
    			attr_dev(input1, "type", "text");
    			input1.readOnly = true;
    			attr_dev(input1, "class", "form-control-plaintext");
    			attr_dev(input1, "id", "staticStatus");
    			input1.value = input1_value_value = /*emailCheck*/ ctx[4].status;
    			add_location(input1, file$7, 192, 16, 5603);
    			attr_dev(div6, "class", "col-sm-3");
    			add_location(div6, file$7, 191, 12, 5563);
    			attr_dev(input2, "type", "text");
    			input2.readOnly = true;
    			attr_dev(input2, "class", "form-control-plaintext");
    			attr_dev(input2, "id", "staticDomain");
    			input2.value = input2_value_value = /*emailCheck*/ ctx[4].domain;
    			add_location(input2, file$7, 201, 16, 5904);
    			attr_dev(div7, "class", "col-sm-3");
    			add_location(div7, file$7, 200, 12, 5864);
    			attr_dev(input3, "type", "text");
    			input3.readOnly = true;
    			attr_dev(input3, "class", "form-control-plaintext");
    			attr_dev(input3, "id", "staticDeliverable");
    			input3.value = input3_value_value = /*emailCheck*/ ctx[4].deliverable;
    			add_location(input3, file$7, 210, 16, 6205);
    			attr_dev(div8, "class", "col-sm-3");
    			add_location(div8, file$7, 209, 12, 6165);
    			attr_dev(div9, "class", "row");
    			add_location(div9, file$7, 180, 8, 5237);
    			add_location(form, file$7, 157, 4, 4426);
    			attr_dev(div10, "class", "row mb-3");
    			add_location(div10, file$7, 220, 4, 6497);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, form, anchor);
    			append_dev(form, div4);
    			append_dev(div4, div0);
    			append_dev(div0, label0);
    			append_dev(div4, t3);
    			append_dev(div4, div1);
    			append_dev(div1, label1);
    			append_dev(div4, t5);
    			append_dev(div4, div2);
    			append_dev(div2, label2);
    			append_dev(div4, t7);
    			append_dev(div4, div3);
    			append_dev(div3, label3);
    			append_dev(form, t9);
    			append_dev(form, div9);
    			append_dev(div9, div5);
    			append_dev(div5, input0);
    			append_dev(div9, t10);
    			append_dev(div9, div6);
    			append_dev(div6, input1);
    			append_dev(div9, t11);
    			append_dev(div9, div7);
    			append_dev(div7, input2);
    			append_dev(div9, t12);
    			append_dev(div9, div8);
    			append_dev(div8, input3);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, div10, anchor);
    			insert_dev(target, t14, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t15, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*user*/ 32 && input0_value_value !== (input0_value_value = /*user*/ ctx[5].email) && input0.value !== input0_value_value) {
    				prop_dev(input0, "value", input0_value_value);
    			}

    			if (dirty & /*emailCheck*/ 16 && input1_value_value !== (input1_value_value = /*emailCheck*/ ctx[4].status) && input1.value !== input1_value_value) {
    				prop_dev(input1, "value", input1_value_value);
    			}

    			if (dirty & /*emailCheck*/ 16 && input2_value_value !== (input2_value_value = /*emailCheck*/ ctx[4].domain) && input2.value !== input2_value_value) {
    				prop_dev(input2, "value", input2_value_value);
    			}

    			if (dirty & /*emailCheck*/ 16 && input3_value_value !== (input3_value_value = /*emailCheck*/ ctx[4].deliverable) && input3.value !== input3_value_value) {
    				prop_dev(input3, "value", input3_value_value);
    			}

    			if (/*emailCheck*/ ctx[4].status === "success") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$4(ctx);
    					if_block0.c();
    					if_block0.m(t15.parentNode, t15);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*emailCheck*/ ctx[4].status === "failure") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$6(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(form);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(div10);
    			if (detaching) detach_dev(t14);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t15);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(155:0) {#if mailChecked !== null}",
    		ctx
    	});

    	return block;
    }

    // (223:4) {#if emailCheck.status === "success"}
    function create_if_block_2$4(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Submit";
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "my-button");
    			add_location(button, file$7, 223, 4, 6572);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*createUser*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(223:4) {#if emailCheck.status === \\\"success\\\"}",
    		ctx
    	});

    	return block;
    }

    // (226:4) {#if emailCheck.status === "failure"}
    function create_if_block_1$6(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Check Email";
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "my-button");
    			add_location(button, file$7, 226, 4, 6709);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*checkMail*/ ctx[7](/*user*/ ctx[5].email))) /*checkMail*/ ctx[7](/*user*/ ctx[5].email).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(226:4) {#if emailCheck.status === \\\"failure\\\"}",
    		ctx
    	});

    	return block;
    }

    // (246:8) {#each users as user}
    function create_each_block_1$3(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*user*/ ctx[5].username + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*user*/ ctx[5].name + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*user*/ ctx[5].email + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6_value = /*user*/ ctx[5].userType + "";
    	let t6;
    	let t7;
    	let td4;
    	let t8_value = /*user*/ ctx[5].userStatus + "";
    	let t8;
    	let t9;
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
    			add_location(td0, file$7, 250, 16, 7317);
    			add_location(td1, file$7, 253, 16, 7399);
    			add_location(td2, file$7, 256, 16, 7477);
    			add_location(td3, file$7, 259, 16, 7556);
    			add_location(td4, file$7, 262, 16, 7638);
    			attr_dev(tr, "class", "row-tr");
    			attr_dev(tr, "onclick", tr_onclick_value = "document.location = '" + ('#/users/' + /*user*/ ctx[5].id) + "';");
    			add_location(tr, file$7, 246, 12, 7176);
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
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*users*/ 8 && t0_value !== (t0_value = /*user*/ ctx[5].username + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*users*/ 8 && t2_value !== (t2_value = /*user*/ ctx[5].name + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*users*/ 8 && t4_value !== (t4_value = /*user*/ ctx[5].email + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*users*/ 8 && t6_value !== (t6_value = /*user*/ ctx[5].userType + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*users*/ 8 && t8_value !== (t8_value = /*user*/ ctx[5].userStatus + "")) set_data_dev(t8, t8_value);

    			if (dirty & /*users*/ 8 && tr_onclick_value !== (tr_onclick_value = "document.location = '" + ('#/users/' + /*user*/ ctx[5].id) + "';")) {
    				attr_dev(tr, "onclick", tr_onclick_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$3.name,
    		type: "each",
    		source: "(246:8) {#each users as user}",
    		ctx
    	});

    	return block;
    }

    // (273:8) {#each Array(nrOfPages) as _, i}
    function create_each_block$3(ctx) {
    	let li;
    	let a;
    	let t0_value = /*i*/ ctx[16] + 1 + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(a, "class", "page-link");
    			attr_dev(a, "href", "#/users?page=" + (/*i*/ ctx[16] + 1));
    			toggle_class(a, "active", /*currentPage*/ ctx[0] == /*i*/ ctx[16] + 1);
    			add_location(a, file$7, 274, 16, 7898);
    			attr_dev(li, "class", "page-item");
    			add_location(li, file$7, 273, 12, 7858);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t0);
    			append_dev(li, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentPage*/ 1) {
    				toggle_class(a, "active", /*currentPage*/ ctx[0] == /*i*/ ctx[16] + 1);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(273:8) {#each Array(nrOfPages) as _, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
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
    	let t11;
    	let t12;
    	let div4;
    	let t13;
    	let h11;
    	let t15;
    	let table;
    	let thead;
    	let tr;
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
    	let tbody;
    	let t26;
    	let nav;
    	let ul;
    	let mounted;
    	let dispose;
    	let if_block0 = /*mailChecked*/ ctx[2] === null && create_if_block_3$4(ctx);
    	let if_block1 = /*mailChecked*/ ctx[2] !== null && create_if_block$6(ctx);
    	let each_value_1 = /*users*/ ctx[3];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$3(get_each_context_1$3(ctx, each_value_1, i));
    	}

    	let each_value = Array(/*nrOfPages*/ ctx[1]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
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
    			label2.textContent = "E-Mail";
    			t9 = space();
    			input2 = element("input");
    			t10 = space();
    			if (if_block0) if_block0.c();
    			t11 = space();
    			if (if_block1) if_block1.c();
    			t12 = space();
    			div4 = element("div");
    			t13 = space();
    			h11 = element("h1");
    			h11.textContent = "All Users";
    			t15 = space();
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Username";
    			t17 = space();
    			th1 = element("th");
    			th1.textContent = "Name";
    			t19 = space();
    			th2 = element("th");
    			th2.textContent = "Email";
    			t21 = space();
    			th3 = element("th");
    			th3.textContent = "Type";
    			t23 = space();
    			th4 = element("th");
    			th4.textContent = "Status";
    			t25 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t26 = space();
    			nav = element("nav");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h10, "class", "mt-3");
    			add_location(h10, file$7, 117, 0, 3263);
    			attr_dev(label0, "class", "form-label");
    			attr_dev(label0, "for", "username");
    			add_location(label0, file$7, 121, 12, 3386);
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "id", "username");
    			attr_dev(input0, "type", "text");
    			add_location(input0, file$7, 122, 12, 3457);
    			attr_dev(div0, "class", "col");
    			add_location(div0, file$7, 120, 8, 3355);
    			attr_dev(label1, "class", "form-label");
    			attr_dev(label1, "for", "name");
    			add_location(label1, file$7, 131, 12, 3680);
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "id", "name");
    			attr_dev(input1, "type", "text");
    			add_location(input1, file$7, 132, 12, 3743);
    			attr_dev(div1, "class", "col");
    			add_location(div1, file$7, 130, 8, 3649);
    			attr_dev(label2, "class", "form-label");
    			attr_dev(label2, "for", "email");
    			add_location(label2, file$7, 141, 12, 3958);
    			attr_dev(input2, "class", "form-control");
    			attr_dev(input2, "id", "email");
    			attr_dev(input2, "type", "text");
    			add_location(input2, file$7, 142, 12, 4024);
    			attr_dev(div2, "class", "col");
    			add_location(div2, file$7, 140, 8, 3927);
    			attr_dev(div3, "class", "row mb-3");
    			add_location(div3, file$7, 119, 4, 3323);
    			attr_dev(form, "class", "mb-5");
    			add_location(form, file$7, 118, 0, 3298);
    			attr_dev(div4, "class", "row mb-3");
    			add_location(div4, file$7, 230, 0, 6824);
    			attr_dev(h11, "class", "mt-3");
    			add_location(h11, file$7, 232, 0, 6852);
    			add_location(th0, file$7, 237, 12, 6961);
    			add_location(th1, file$7, 238, 12, 6992);
    			add_location(th2, file$7, 239, 12, 7019);
    			add_location(th3, file$7, 240, 12, 7047);
    			add_location(th4, file$7, 241, 12, 7074);
    			add_location(tr, file$7, 236, 8, 6943);
    			add_location(thead, file$7, 235, 4, 6926);
    			add_location(tbody, file$7, 244, 4, 7124);
    			attr_dev(table, "class", "table table-hover");
    			add_location(table, file$7, 234, 0, 6887);
    			attr_dev(ul, "class", "pagination");
    			add_location(ul, file$7, 271, 4, 7779);
    			add_location(nav, file$7, 270, 0, 7768);
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
    			set_input_value(input0, /*user*/ ctx[5].username);
    			append_dev(div3, t4);
    			append_dev(div3, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t6);
    			append_dev(div1, input1);
    			set_input_value(input1, /*user*/ ctx[5].name);
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    			append_dev(div2, label2);
    			append_dev(div2, t9);
    			append_dev(div2, input2);
    			set_input_value(input2, /*user*/ ctx[5].email);
    			insert_dev(target, t10, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t11, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, div4, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, h11, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t17);
    			append_dev(tr, th1);
    			append_dev(tr, t19);
    			append_dev(tr, th2);
    			append_dev(tr, t21);
    			append_dev(tr, th3);
    			append_dev(tr, t23);
    			append_dev(tr, th4);
    			append_dev(table, t25);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(tbody, null);
    			}

    			insert_dev(target, t26, anchor);
    			insert_dev(target, nav, anchor);
    			append_dev(nav, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[9]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[10]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[11])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*user*/ 32 && input0.value !== /*user*/ ctx[5].username) {
    				set_input_value(input0, /*user*/ ctx[5].username);
    			}

    			if (dirty & /*user*/ 32 && input1.value !== /*user*/ ctx[5].name) {
    				set_input_value(input1, /*user*/ ctx[5].name);
    			}

    			if (dirty & /*user*/ 32 && input2.value !== /*user*/ ctx[5].email) {
    				set_input_value(input2, /*user*/ ctx[5].email);
    			}

    			if (/*mailChecked*/ ctx[2] === null) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3$4(ctx);
    					if_block0.c();
    					if_block0.m(t11.parentNode, t11);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*mailChecked*/ ctx[2] !== null) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$6(ctx);
    					if_block1.c();
    					if_block1.m(t12.parentNode, t12);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*users*/ 8) {
    				each_value_1 = /*users*/ ctx[3];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$3(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(tbody, null);
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
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
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
    			if (detaching) detach_dev(h10);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(form);
    			if (detaching) detach_dev(t10);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t11);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(h11);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t26);
    			if (detaching) detach_dev(nav);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const api_root$5 = "http://localhost:8080";

    function instance$7($$self, $$props, $$invalidate) {
    	let $jwt_token;
    	let $querystring;
    	validate_store(jwt_token, 'jwt_token');
    	component_subscribe($$self, jwt_token, $$value => $$invalidate(12, $jwt_token = $$value));
    	validate_store(querystring, 'querystring');
    	component_subscribe($$self, querystring, $$value => $$invalidate(8, $querystring = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Users', slots, []);
    	let currentPage;
    	let nrOfPages = 0;
    	let mailChecked = null;
    	let users = [];
    	let user = { username: null, name: null, email: null };

    	let emailCheck = {
    		status: null,
    		email_address: null,
    		domain: null,
    		deliverable: null
    	};

    	/*     function getUser() {
            var config = {
                method: "get",
                url: api_root + "/api/products/" + user_id,
                headers: {},
            };

            axios(config)
                .then(function (response) {
                    user = response.data;
                })
                .catch(function (error) {
                    alert("Could not get user");
                    console.log(error);
                });
        } */
    	function getUsers() {
    		let query = "pageSize=6&page=" + currentPage;

    		var config = {
    			method: "get",
    			url: api_root$5 + "/api/users?" + query,
    			headers: { Authorization: "Bearer " + $jwt_token }
    		};

    		axios(config).then(function (response) {
    			$$invalidate(3, users = response.data.content);
    			$$invalidate(1, nrOfPages = response.data.totalPages);
    		}).catch(function (error) {
    			alert("Could not get users");
    			console.log(error);
    		});
    	}

    	function createUser() {
    		var config = {
    			method: "post",
    			url: api_root$5 + "/api/users",
    			headers: {
    				"Content-Type": "application/json",
    				Authorization: "Bearer " + $jwt_token
    			},
    			data: user
    		};

    		axios(config).then(function (response) {
    			alert("User created");
    			getUsers();
    		}).catch(function (error) {
    			alert("Could not create User");
    			console.log(error);
    		});
    	}

    	// REST API EMAIL CHECK
    	function checkMail(userEmail) {
    		var config = {
    			method: "get",
    			url: api_root$5 + "/api/service/emailvalidation?email=" + userEmail,
    			headers: { Authorization: "Bearer " + $jwt_token }
    		};

    		axios(config).then(function (response) {
    			let emailVariables = response.data;
    			$$invalidate(4, emailCheck = emailVariables[0]);
    			$$invalidate(2, mailChecked = true);
    			console.log(emailCheck);
    			console.log(mailChecked);
    		}).catch(function (error) {
    			alert("Could not check User Mail");
    			console.log(error);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$5.warn(`<Users> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		user.username = this.value;
    		$$invalidate(5, user);
    	}

    	function input1_input_handler() {
    		user.name = this.value;
    		$$invalidate(5, user);
    	}

    	function input2_input_handler() {
    		user.email = this.value;
    		$$invalidate(5, user);
    	}

    	$$self.$capture_state = () => ({
    		axios,
    		querystring,
    		jwt_token,
    		api_root: api_root$5,
    		currentPage,
    		nrOfPages,
    		mailChecked,
    		users,
    		user,
    		emailCheck,
    		getUsers,
    		createUser,
    		checkMail,
    		$jwt_token,
    		$querystring
    	});

    	$$self.$inject_state = $$props => {
    		if ('currentPage' in $$props) $$invalidate(0, currentPage = $$props.currentPage);
    		if ('nrOfPages' in $$props) $$invalidate(1, nrOfPages = $$props.nrOfPages);
    		if ('mailChecked' in $$props) $$invalidate(2, mailChecked = $$props.mailChecked);
    		if ('users' in $$props) $$invalidate(3, users = $$props.users);
    		if ('user' in $$props) $$invalidate(5, user = $$props.user);
    		if ('emailCheck' in $$props) $$invalidate(4, emailCheck = $$props.emailCheck);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$querystring*/ 256) {
    			{
    				let searchParams = new URLSearchParams($querystring);

    				if (searchParams.has("page")) {
    					$$invalidate(0, currentPage = searchParams.get("page"));
    				} else {
    					$$invalidate(0, currentPage = "1");
    				}

    				getUsers();
    			}
    		}
    	};

    	return [
    		currentPage,
    		nrOfPages,
    		mailChecked,
    		users,
    		emailCheck,
    		user,
    		createUser,
    		checkMail,
    		$querystring,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler
    	];
    }

    class Users extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Users",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\pages\UserDetails.svelte generated by Svelte v3.53.1 */

    const { console: console_1$4 } = globals;
    const file$6 = "src\\pages\\UserDetails.svelte";

    // (137:47) 
    function create_if_block_8$2(ctx) {
    	let option0;
    	let option1;

    	const block = {
    		c: function create() {
    			option0 = element("option");
    			option0.textContent = "Buyer";
    			option1 = element("option");
    			option1.textContent = "Supplier";
    			option0.__value = "BUYER";
    			option0.value = option0.__value;
    			add_location(option0, file$6, 137, 12, 4029);
    			option1.__value = "SUPPLIER";
    			option1.value = option1.__value;
    			add_location(option1, file$6, 138, 12, 4079);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option0, anchor);
    			insert_dev(target, option1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option0);
    			if (detaching) detach_dev(option1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8$2.name,
    		type: "if",
    		source: "(137:47) ",
    		ctx
    	});

    	return block;
    }

    // (134:50) 
    function create_if_block_7$2(ctx) {
    	let option0;
    	let option1;

    	const block = {
    		c: function create() {
    			option0 = element("option");
    			option0.textContent = "Buyer";
    			option1 = element("option");
    			option1.textContent = "Admin";
    			option0.__value = "BUYER";
    			option0.value = option0.__value;
    			add_location(option0, file$6, 134, 12, 3880);
    			option1.__value = "ADMIN";
    			option1.value = option1.__value;
    			add_location(option1, file$6, 135, 12, 3930);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option0, anchor);
    			insert_dev(target, option1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option0);
    			if (detaching) detach_dev(option1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$2.name,
    		type: "if",
    		source: "(134:50) ",
    		ctx
    	});

    	return block;
    }

    // (131:8) {#if userper.userType === "BUYER"}
    function create_if_block_6$2(ctx) {
    	let option0;
    	let option1;

    	const block = {
    		c: function create() {
    			option0 = element("option");
    			option0.textContent = "Supplier";
    			option1 = element("option");
    			option1.textContent = "Admin";
    			option0.__value = "SUPPLIER";
    			option0.value = option0.__value;
    			add_location(option0, file$6, 131, 12, 3722);
    			option1.__value = "ADMIN";
    			option1.value = option1.__value;
    			add_location(option1, file$6, 132, 12, 3778);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option0, anchor);
    			insert_dev(target, option1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option0);
    			if (detaching) detach_dev(option1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$2.name,
    		type: "if",
    		source: "(131:8) {#if userper.userType === \\\"BUYER\\\"}",
    		ctx
    	});

    	return block;
    }

    // (146:0) {#if userper.userStatus === "ACTIVE"}
    function create_if_block_5$2(ctx) {
    	let form;
    	let div3;
    	let div0;
    	let label;
    	let t1;
    	let textarea;
    	let t2;
    	let div1;
    	let t3;
    	let div2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			div3 = element("div");
    			div0 = element("div");
    			label = element("label");
    			label.textContent = "Comment for Inactivation of User";
    			t1 = space();
    			textarea = element("textarea");
    			t2 = space();
    			div1 = element("div");
    			t3 = space();
    			div2 = element("div");
    			attr_dev(label, "for", "comment");
    			add_location(label, file$6, 149, 16, 4321);
    			attr_dev(textarea, "class", "form-control");
    			attr_dev(textarea, "id", "comment");
    			attr_dev(textarea, "rows", "3");
    			add_location(textarea, file$6, 150, 16, 4400);
    			attr_dev(div0, "class", "col");
    			add_location(div0, file$6, 148, 12, 4286);
    			attr_dev(div1, "class", "row mb-3");
    			add_location(div1, file$6, 157, 12, 4619);
    			attr_dev(div2, "class", "row mb-3");
    			add_location(div2, file$6, 158, 12, 4657);
    			attr_dev(div3, "class", "row mb-3");
    			add_location(div3, file$6, 147, 8, 4250);
    			add_location(form, file$6, 146, 4, 4234);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div3);
    			append_dev(div3, div0);
    			append_dev(div0, label);
    			append_dev(div0, t1);
    			append_dev(div0, textarea);
    			set_input_value(textarea, /*userper*/ ctx[0].comment);
    			append_dev(div3, t2);
    			append_dev(div3, div1);
    			append_dev(div3, t3);
    			append_dev(div3, div2);

    			if (!mounted) {
    				dispose = listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[8]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*userper*/ 1) {
    				set_input_value(textarea, /*userper*/ ctx[0].comment);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$2.name,
    		type: "if",
    		source: "(146:0) {#if userper.userStatus === \\\"ACTIVE\\\"}",
    		ctx
    	});

    	return block;
    }

    // (164:0) {#if userper.userStatus === "INACTIVE"}
    function create_if_block_4$2(ctx) {
    	let div;
    	let ul;
    	let li0;
    	let t1;
    	let li1;
    	let t2_value = /*userper*/ ctx[0].comment + "";
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "Reason for Inactivation:";
    			t1 = space();
    			li1 = element("li");
    			t2 = text(t2_value);
    			attr_dev(li0, "class", "list-group-item-top active");
    			attr_dev(li0, "aria-current", "true");
    			add_location(li0, file$6, 166, 12, 4835);
    			attr_dev(li1, "class", "list-group-item");
    			add_location(li1, file$6, 169, 12, 4969);
    			attr_dev(ul, "class", "list-group");
    			add_location(ul, file$6, 165, 8, 4798);
    			attr_dev(div, "class", "col-md-4");
    			add_location(div, file$6, 164, 4, 4766);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);
    			append_dev(ul, li0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*userper*/ 1 && t2_value !== (t2_value = /*userper*/ ctx[0].comment + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$2.name,
    		type: "if",
    		source: "(164:0) {#if userper.userStatus === \\\"INACTIVE\\\"}",
    		ctx
    	});

    	return block;
    }

    // (179:0) {#if $user.user_roles && $user.user_roles.length > 0}
    function create_if_block_1$5(ctx) {
    	let a;
    	let t1;
    	let if_block_anchor;
    	let mounted;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (/*userper*/ ctx[0].userStatus === "ACTIVE") return create_if_block_2$3;
    		if (/*userper*/ ctx[0].userStatus === "INACTIVE") return create_if_block_3$3;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "Delete User";
    			t1 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(a, "href", "#/users");
    			attr_dev(a, "class", "delete-button");
    			add_location(a, file$6, 179, 4, 5176);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*deleteUser*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t1);

    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(179:0) {#if $user.user_roles && $user.user_roles.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (187:48) 
    function create_if_block_3$3(ctx) {
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "Activate User";
    			attr_dev(a, "href", "#/users");
    			attr_dev(a, "class", "my-button");
    			add_location(a, file$6, 187, 8, 5479);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*userActivation*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$3.name,
    		type: "if",
    		source: "(187:48) ",
    		ctx
    	});

    	return block;
    }

    // (183:4) {#if userper.userStatus === "ACTIVE"}
    function create_if_block_2$3(ctx) {
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "Inactivate User";
    			attr_dev(a, "href", "#/users");
    			attr_dev(a, "class", "my-button");
    			add_location(a, file$6, 183, 8, 5314);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*userCompletion*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(183:4) {#if userper.userStatus === \\\"ACTIVE\\\"}",
    		ctx
    	});

    	return block;
    }

    // (194:0) {#if $user.user_roles && $user.user_roles.length > 0}
    function create_if_block$5(ctx) {
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "Change User Type";
    			attr_dev(a, "href", "#/users");
    			attr_dev(a, "class", "my-button");
    			add_location(a, file$6, 195, 4, 5665);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*changeUserType*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(194:0) {#if $user.user_roles && $user.user_roles.length > 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let h1;
    	let t0;
    	let t1_value = /*userper*/ ctx[0].username + "";
    	let t1;
    	let t2;
    	let p;
    	let t3;
    	let t4_value = /*userper*/ ctx[0].id + "";
    	let t4;
    	let t5;
    	let h30;
    	let t6;
    	let t7_value = /*userper*/ ctx[0].userType + "";
    	let t7;
    	let t8;
    	let div0;
    	let t9;
    	let h31;
    	let t10;
    	let t11_value = /*userper*/ ctx[0].userStatus + "";
    	let t11;
    	let t12;
    	let label;
    	let t14;
    	let div1;
    	let select;
    	let t15;
    	let div2;
    	let t16;
    	let t17;
    	let t18;
    	let div3;
    	let t19;
    	let t20;
    	let t21;
    	let a;
    	let t23;
    	let div4;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*userper*/ ctx[0].userType === "BUYER") return create_if_block_6$2;
    		if (/*userper*/ ctx[0].userType === "SUPPLIER") return create_if_block_7$2;
    		if (/*userper*/ ctx[0].userType === "ADMIN") return create_if_block_8$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type && current_block_type(ctx);
    	let if_block1 = /*userper*/ ctx[0].userStatus === "ACTIVE" && create_if_block_5$2(ctx);
    	let if_block2 = /*userper*/ ctx[0].userStatus === "INACTIVE" && create_if_block_4$2(ctx);
    	let if_block3 = /*$user*/ ctx[1].user_roles && /*$user*/ ctx[1].user_roles.length > 0 && create_if_block_1$5(ctx);
    	let if_block4 = /*$user*/ ctx[1].user_roles && /*$user*/ ctx[1].user_roles.length > 0 && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text("User ");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text("ID: ");
    			t4 = text(t4_value);
    			t5 = space();
    			h30 = element("h3");
    			t6 = text("User Type: ");
    			t7 = text(t7_value);
    			t8 = space();
    			div0 = element("div");
    			t9 = space();
    			h31 = element("h3");
    			t10 = text("Status: ");
    			t11 = text(t11_value);
    			t12 = space();
    			label = element("label");
    			label.textContent = "Change User Type";
    			t14 = space();
    			div1 = element("div");
    			select = element("select");
    			if (if_block0) if_block0.c();
    			t15 = space();
    			div2 = element("div");
    			t16 = space();
    			if (if_block1) if_block1.c();
    			t17 = space();
    			if (if_block2) if_block2.c();
    			t18 = space();
    			div3 = element("div");
    			t19 = space();
    			if (if_block3) if_block3.c();
    			t20 = space();
    			if (if_block4) if_block4.c();
    			t21 = space();
    			a = element("a");
    			a.textContent = "Back";
    			t23 = space();
    			div4 = element("div");
    			attr_dev(h1, "class", "md-3");
    			add_location(h1, file$6, 118, 0, 3339);
    			add_location(p, file$6, 119, 0, 3386);
    			add_location(h30, file$6, 120, 0, 3411);
    			attr_dev(div0, "class", "col-md-8");
    			add_location(div0, file$6, 122, 0, 3453);
    			add_location(h31, file$6, 124, 0, 3481);
    			attr_dev(label, "for", "user");
    			add_location(label, file$6, 126, 0, 3522);
    			attr_dev(select, "class", "form-select");
    			attr_dev(select, "id", "user");
    			if (/*userper*/ ctx[0].userType === void 0) add_render_callback(() => /*select_change_handler*/ ctx[7].call(select));
    			add_location(select, file$6, 129, 4, 3596);
    			attr_dev(div1, "class", "col-md-4");
    			add_location(div1, file$6, 128, 0, 3568);
    			attr_dev(div2, "class", "col-md-8");
    			add_location(div2, file$6, 143, 0, 4163);
    			attr_dev(div3, "class", "col-md-8");
    			add_location(div3, file$6, 176, 0, 5089);
    			attr_dev(a, "class", "back-button");
    			attr_dev(a, "href", "#/users");
    			attr_dev(a, "role", "button");
    			attr_dev(a, "aria-pressed", "true");
    			add_location(a, file$6, 200, 0, 5774);
    			attr_dev(div4, "class", "md-12");
    			add_location(div4, file$6, 203, 0, 5864);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			append_dev(h1, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t3);
    			append_dev(p, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, h30, anchor);
    			append_dev(h30, t6);
    			append_dev(h30, t7);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, h31, anchor);
    			append_dev(h31, t10);
    			append_dev(h31, t11);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, label, anchor);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, select);
    			if (if_block0) if_block0.m(select, null);
    			select_option(select, /*userper*/ ctx[0].userType);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t16, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t17, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t18, anchor);
    			insert_dev(target, div3, anchor);
    			insert_dev(target, t19, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t20, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, a, anchor);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, div4, anchor);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[7]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*userper*/ 1 && t1_value !== (t1_value = /*userper*/ ctx[0].username + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*userper*/ 1 && t4_value !== (t4_value = /*userper*/ ctx[0].id + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*userper*/ 1 && t7_value !== (t7_value = /*userper*/ ctx[0].userType + "")) set_data_dev(t7, t7_value);
    			if (dirty & /*userper*/ 1 && t11_value !== (t11_value = /*userper*/ ctx[0].userStatus + "")) set_data_dev(t11, t11_value);

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if (if_block0) if_block0.d(1);
    				if_block0 = current_block_type && current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(select, null);
    				}
    			}

    			if (dirty & /*userper*/ 1) {
    				select_option(select, /*userper*/ ctx[0].userType);
    			}

    			if (/*userper*/ ctx[0].userStatus === "ACTIVE") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_5$2(ctx);
    					if_block1.c();
    					if_block1.m(t17.parentNode, t17);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*userper*/ ctx[0].userStatus === "INACTIVE") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_4$2(ctx);
    					if_block2.c();
    					if_block2.m(t18.parentNode, t18);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*$user*/ ctx[1].user_roles && /*$user*/ ctx[1].user_roles.length > 0) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_1$5(ctx);
    					if_block3.c();
    					if_block3.m(t20.parentNode, t20);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*$user*/ ctx[1].user_roles && /*$user*/ ctx[1].user_roles.length > 0) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block$5(ctx);
    					if_block4.c();
    					if_block4.m(t21.parentNode, t21);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(h30);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(h31);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(label);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(div1);

    			if (if_block0) {
    				if_block0.d();
    			}

    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t16);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t17);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t18);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t19);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t20);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(div4);
    			mounted = false;
    			dispose();
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

    const api_root$4 = "http://localhost:8080";

    function instance$6($$self, $$props, $$invalidate) {
    	let $jwt_token;
    	let $user;
    	validate_store(jwt_token, 'jwt_token');
    	component_subscribe($$self, jwt_token, $$value => $$invalidate(10, $jwt_token = $$value));
    	validate_store(user, 'user');
    	component_subscribe($$self, user, $$value => $$invalidate(1, $user = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('UserDetails', slots, []);
    	let { params = {} } = $$props;
    	let user_id;

    	let userper = {
    		username: null,
    		name: null,
    		email: null,
    		userStatus: null,
    		userType: null
    	};

    	function getUser() {
    		var config = {
    			method: "get",
    			url: api_root$4 + "/api/users/" + user_id,
    			headers: { Authorization: "Bearer " + $jwt_token }
    		};

    		axios(config).then(function (response) {
    			$$invalidate(0, userper = response.data);
    		}).catch(function (error) {
    			alert("Could not get user");
    			console.log(error);
    		});
    	}

    	function deleteUser() {
    		var config = {
    			method: "delete",
    			url: api_root$4 + "/api/users/" + user_id,
    			headers: { Authorization: "Bearer " + $jwt_token }
    		};

    		axios(config).then(function (response) {
    			alert("User " + userper.username + " deleted");
    		}).catch(function (error) {
    			alert(error);
    			console.log(error);
    		});
    	}

    	function userActivation() {
    		var config = {
    			method: "post",
    			url: api_root$4 + "/api/service/useractivation",
    			headers: { Authorization: "Bearer " + $jwt_token },
    			data: { userId: userper.id }
    		};

    		axios(config).then(function (response) {
    			alert("User activated");
    		}).catch(function (error) {
    			alert("Could not activate User");
    			console.log(error);
    		});
    	}

    	function userCompletion() {
    		var config = {
    			method: "post",
    			url: api_root$4 + "/api/service/usercompletion",
    			headers: { Authorization: "Bearer " + $jwt_token },
    			data: {
    				userId: userper.id,
    				comment: userper.comment
    			}
    		};

    		axios(config).then(function (response) {
    			alert("User inactivated");
    		}).catch(function (error) {
    			alert("Could not inactivate User");
    			console.log(error);
    		});
    	}

    	function changeUserType() {
    		var config = {
    			method: "post",
    			url: api_root$4 + "/api/service/userchangetype",
    			headers: { Authorization: "Bearer " + $jwt_token },
    			data: {
    				userId: userper.id,
    				userType: userper.userType
    			}
    		};

    		axios(config).then(function (response) {
    			alert("User Type Changed");
    		}).catch(function (error) {
    			alert("Could not Change User Type");
    			console.log(error);
    		});
    	}

    	const writable_props = ['params'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$4.warn(`<UserDetails> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		userper.userType = select_value(this);
    		$$invalidate(0, userper);
    	}

    	function textarea_input_handler() {
    		userper.comment = this.value;
    		$$invalidate(0, userper);
    	}

    	$$self.$$set = $$props => {
    		if ('params' in $$props) $$invalidate(6, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		axios,
    		jwt_token,
    		isAuthenticated,
    		user,
    		api_root: api_root$4,
    		params,
    		user_id,
    		userper,
    		getUser,
    		deleteUser,
    		userActivation,
    		userCompletion,
    		changeUserType,
    		$jwt_token,
    		$user
    	});

    	$$self.$inject_state = $$props => {
    		if ('params' in $$props) $$invalidate(6, params = $$props.params);
    		if ('user_id' in $$props) user_id = $$props.user_id;
    		if ('userper' in $$props) $$invalidate(0, userper = $$props.userper);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*params*/ 64) {
    			{
    				user_id = params.id;
    				getUser();
    			}
    		}
    	};

    	return [
    		userper,
    		$user,
    		deleteUser,
    		userActivation,
    		userCompletion,
    		changeUserType,
    		params,
    		select_change_handler,
    		textarea_input_handler
    	];
    }

    class UserDetails extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { params: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UserDetails",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get params() {
    		throw new Error("<UserDetails>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<UserDetails>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\Account.svelte generated by Svelte v3.53.1 */
    const file$5 = "src\\pages\\Account.svelte";

    // (82:4) {:else}
    function create_else_block$4(ctx) {
    	let div;
    	let h3;
    	let b;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			b = element("b");
    			b.textContent = "Not logged in";
    			add_location(b, file$5, 84, 10, 2819);
    			add_location(h3, file$5, 84, 6, 2815);
    			attr_dev(div, "class", "alert");
    			attr_dev(div, "role", "alert");
    			add_location(div, file$5, 83, 4, 2775);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(h3, b);
    		},
    		p: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(82:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (5:0) {#if $isAuthenticated}
    function create_if_block$4(ctx) {
    	let div19;
    	let div18;
    	let div17;
    	let div4;
    	let div3;
    	let div2;
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let h4;
    	let t1_value = /*$user*/ ctx[1].name + "";
    	let t1;
    	let t2;
    	let p0;
    	let t3_value = /*$user*/ ctx[1].user_roles + "";
    	let t3;
    	let t4;
    	let div16;
    	let div15;
    	let div14;
    	let div7;
    	let div5;
    	let h60;
    	let t6;
    	let div6;
    	let p1;
    	let t7_value = /*$user*/ ctx[1].nickname + "";
    	let t7;
    	let t8;
    	let hr0;
    	let t9;
    	let div10;
    	let div8;
    	let h61;
    	let t11;
    	let div9;
    	let t12_value = /*$user*/ ctx[1].email + "";
    	let t12;
    	let t13;
    	let hr1;
    	let t14;
    	let div13;
    	let div11;
    	let h62;
    	let t16;
    	let div12;
    	let p2;
    	let t17_value = /*$user*/ ctx[1].userStatus + "";
    	let t17;
    	let t18;
    	let hr2;
    	let t19;
    	let t20;
    	let hr3;
    	let if_block = /*$user*/ ctx[1].user_roles && /*$user*/ ctx[1].user_roles.length > 0 && create_if_block_1$4(ctx);

    	const block = {
    		c: function create() {
    			div19 = element("div");
    			div18 = element("div");
    			div17 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			h4 = element("h4");
    			t1 = text(t1_value);
    			t2 = space();
    			p0 = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			div16 = element("div");
    			div15 = element("div");
    			div14 = element("div");
    			div7 = element("div");
    			div5 = element("div");
    			h60 = element("h6");
    			h60.textContent = "Username";
    			t6 = space();
    			div6 = element("div");
    			p1 = element("p");
    			t7 = text(t7_value);
    			t8 = space();
    			hr0 = element("hr");
    			t9 = space();
    			div10 = element("div");
    			div8 = element("div");
    			h61 = element("h6");
    			h61.textContent = "Email";
    			t11 = space();
    			div9 = element("div");
    			t12 = text(t12_value);
    			t13 = space();
    			hr1 = element("hr");
    			t14 = space();
    			div13 = element("div");
    			div11 = element("div");
    			h62 = element("h6");
    			h62.textContent = "User Status";
    			t16 = space();
    			div12 = element("div");
    			p2 = element("p");
    			t17 = text(t17_value);
    			t18 = space();
    			hr2 = element("hr");
    			t19 = space();
    			if (if_block) if_block.c();
    			t20 = space();
    			hr3 = element("hr");
    			attr_dev(img, "class", "rounded-circle");
    			if (!src_url_equal(img.src, img_src_value = "/images/profilep.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Admin");
    			attr_dev(img, "width", "150");
    			add_location(img, file$5, 14, 20, 486);
    			add_location(h4, file$5, 22, 22, 756);
    			attr_dev(p0, "class", "text-secondary mb-1");
    			add_location(p0, file$5, 23, 22, 801);
    			attr_dev(div0, "class", "mt-3");
    			add_location(div0, file$5, 21, 20, 714);
    			attr_dev(div1, "class", "d-flex flex-column align-items-center text-center");
    			add_location(div1, file$5, 12, 18, 334);
    			attr_dev(div2, "class", "card-body");
    			add_location(div2, file$5, 11, 16, 291);
    			attr_dev(div3, "class", "card");
    			add_location(div3, file$5, 10, 14, 255);
    			attr_dev(div4, "class", "col-md-4 mb-3");
    			add_location(div4, file$5, 9, 12, 212);
    			attr_dev(h60, "class", "mb-0");
    			add_location(h60, file$5, 35, 22, 1197);
    			attr_dev(div5, "class", "col-sm-3");
    			add_location(div5, file$5, 34, 20, 1151);
    			add_location(p1, file$5, 38, 23, 1339);
    			attr_dev(div6, "class", "col-sm-9 text-secondary");
    			add_location(div6, file$5, 37, 20, 1277);
    			attr_dev(div7, "class", "row");
    			add_location(div7, file$5, 33, 18, 1112);
    			add_location(hr0, file$5, 41, 18, 1437);
    			attr_dev(h61, "class", "mb-0");
    			add_location(h61, file$5, 44, 22, 1546);
    			attr_dev(div8, "class", "col-sm-3");
    			add_location(div8, file$5, 43, 20, 1500);
    			attr_dev(div9, "class", "col-sm-9 text-secondary");
    			add_location(div9, file$5, 46, 20, 1623);
    			attr_dev(div10, "class", "row");
    			add_location(div10, file$5, 42, 18, 1461);
    			add_location(hr1, file$5, 50, 18, 1773);
    			attr_dev(h62, "class", "mb-0");
    			add_location(h62, file$5, 53, 22, 1882);
    			attr_dev(div11, "class", "col-sm-3");
    			add_location(div11, file$5, 52, 20, 1836);
    			add_location(p2, file$5, 56, 22, 2026);
    			attr_dev(div12, "class", "col-sm-9 text-secondary");
    			add_location(div12, file$5, 55, 20, 1965);
    			attr_dev(div13, "class", "row");
    			add_location(div13, file$5, 51, 18, 1797);
    			add_location(hr2, file$5, 59, 18, 2127);
    			add_location(hr3, file$5, 71, 18, 2632);
    			attr_dev(div14, "class", "card-body");
    			add_location(div14, file$5, 32, 16, 1069);
    			attr_dev(div15, "class", "card mb-3");
    			add_location(div15, file$5, 31, 14, 1028);
    			attr_dev(div16, "class", "col-md-8");
    			add_location(div16, file$5, 30, 12, 990);
    			attr_dev(div17, "class", "row gutters-sm");
    			add_location(div17, file$5, 8, 10, 170);
    			attr_dev(div18, "class", "main-body");
    			add_location(div18, file$5, 6, 4, 129);
    			attr_dev(div19, "class", "container");
    			add_location(div19, file$5, 5, 0, 100);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div19, anchor);
    			append_dev(div19, div18);
    			append_dev(div18, div17);
    			append_dev(div17, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, h4);
    			append_dev(h4, t1);
    			append_dev(div0, t2);
    			append_dev(div0, p0);
    			append_dev(p0, t3);
    			append_dev(div17, t4);
    			append_dev(div17, div16);
    			append_dev(div16, div15);
    			append_dev(div15, div14);
    			append_dev(div14, div7);
    			append_dev(div7, div5);
    			append_dev(div5, h60);
    			append_dev(div7, t6);
    			append_dev(div7, div6);
    			append_dev(div6, p1);
    			append_dev(p1, t7);
    			append_dev(div14, t8);
    			append_dev(div14, hr0);
    			append_dev(div14, t9);
    			append_dev(div14, div10);
    			append_dev(div10, div8);
    			append_dev(div8, h61);
    			append_dev(div10, t11);
    			append_dev(div10, div9);
    			append_dev(div9, t12);
    			append_dev(div14, t13);
    			append_dev(div14, hr1);
    			append_dev(div14, t14);
    			append_dev(div14, div13);
    			append_dev(div13, div11);
    			append_dev(div11, h62);
    			append_dev(div13, t16);
    			append_dev(div13, div12);
    			append_dev(div12, p2);
    			append_dev(p2, t17);
    			append_dev(div14, t18);
    			append_dev(div14, hr2);
    			append_dev(div14, t19);
    			if (if_block) if_block.m(div14, null);
    			append_dev(div14, t20);
    			append_dev(div14, hr3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$user*/ 2 && t1_value !== (t1_value = /*$user*/ ctx[1].name + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*$user*/ 2 && t3_value !== (t3_value = /*$user*/ ctx[1].user_roles + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*$user*/ 2 && t7_value !== (t7_value = /*$user*/ ctx[1].nickname + "")) set_data_dev(t7, t7_value);
    			if (dirty & /*$user*/ 2 && t12_value !== (t12_value = /*$user*/ ctx[1].email + "")) set_data_dev(t12, t12_value);
    			if (dirty & /*$user*/ 2 && t17_value !== (t17_value = /*$user*/ ctx[1].userStatus + "")) set_data_dev(t17, t17_value);

    			if (/*$user*/ ctx[1].user_roles && /*$user*/ ctx[1].user_roles.length > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$4(ctx);
    					if_block.c();
    					if_block.m(div14, t20);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div19);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(5:0) {#if $isAuthenticated}",
    		ctx
    	});

    	return block;
    }

    // (62:18) {#if $user.user_roles && $user.user_roles.length > 0}
    function create_if_block_1$4(ctx) {
    	let div2;
    	let div0;
    	let h6;
    	let t1;
    	let div1;
    	let p;
    	let t2_value = /*$user*/ ctx[1].user_roles + "";
    	let t2;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			h6 = element("h6");
    			h6.textContent = "Roles:";
    			t1 = space();
    			div1 = element("div");
    			p = element("p");
    			t2 = text(t2_value);
    			attr_dev(h6, "class", "mb-0");
    			add_location(h6, file$5, 64, 22, 2367);
    			attr_dev(div0, "class", "col-sm-3");
    			add_location(div0, file$5, 63, 20, 2321);
    			add_location(p, file$5, 67, 22, 2507);
    			attr_dev(div1, "class", "col-sm-9 text-secondary");
    			add_location(div1, file$5, 66, 20, 2446);
    			attr_dev(div2, "class", "row");
    			add_location(div2, file$5, 62, 18, 2282);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, h6);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, p);
    			append_dev(p, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$user*/ 2 && t2_value !== (t2_value = /*$user*/ ctx[1].user_roles + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(62:18) {#if $user.user_roles && $user.user_roles.length > 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*$isAuthenticated*/ ctx[0]) return create_if_block$4;
    		return create_else_block$4;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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

    function instance$5($$self, $$props, $$invalidate) {
    	let $isAuthenticated;
    	let $user;
    	validate_store(isAuthenticated, 'isAuthenticated');
    	component_subscribe($$self, isAuthenticated, $$value => $$invalidate(0, $isAuthenticated = $$value));
    	validate_store(user, 'user');
    	component_subscribe($$self, user, $$value => $$invalidate(1, $user = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Account', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Account> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		isAuthenticated,
    		user,
    		$isAuthenticated,
    		$user
    	});

    	return [$isAuthenticated, $user];
    }

    class Account extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Account",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\pages\Utilities.svelte generated by Svelte v3.53.1 */

    const { console: console_1$3 } = globals;
    const file$4 = "src\\pages\\Utilities.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    // (143:8) {#each utilities as utility, index}
    function create_each_block_1$2(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*index*/ ctx[15] + 1 + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*utility*/ ctx[3].utilityName + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*utility*/ ctx[3].unit + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6_value = /*utility*/ ctx[3].utilityType + "";
    	let t6;

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
    			add_location(td0, file$4, 146, 16, 4357);
    			add_location(td1, file$4, 149, 16, 4435);
    			add_location(td2, file$4, 152, 16, 4523);
    			add_location(td3, file$4, 155, 16, 4604);
    			attr_dev(tr, "class", "row-tr");
    			add_location(tr, file$4, 143, 12, 4289);
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
    			if (dirty & /*utilities*/ 4 && t2_value !== (t2_value = /*utility*/ ctx[3].utilityName + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*utilities*/ 4 && t4_value !== (t4_value = /*utility*/ ctx[3].unit + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*utilities*/ 4 && t6_value !== (t6_value = /*utility*/ ctx[3].utilityType + "")) set_data_dev(t6, t6_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(143:8) {#each utilities as utility, index}",
    		ctx
    	});

    	return block;
    }

    // (171:8) {#each Array(nrOfPages) as _, i}
    function create_each_block$2(ctx) {
    	let li;
    	let a;
    	let t0_value = /*i*/ ctx[13] + 1 + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(a, "class", "page-link");
    			attr_dev(a, "href", "#/utilities?page=" + (/*i*/ ctx[13] + 1));
    			toggle_class(a, "active", /*currentPage*/ ctx[0] == /*i*/ ctx[13] + 1);
    			add_location(a, file$4, 172, 16, 4995);
    			attr_dev(li, "class", "page-item");
    			add_location(li, file$4, 171, 12, 4955);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t0);
    			append_dev(li, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentPage*/ 1) {
    				toggle_class(a, "active", /*currentPage*/ ctx[0] == /*i*/ ctx[13] + 1);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(171:8) {#each Array(nrOfPages) as _, i}",
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
    	let t39_value = /*utilities*/ ctx[2].length + "";
    	let t39;
    	let t40;
    	let nav;
    	let ul;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*utilities*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	let each_value = Array(/*nrOfPages*/ ctx[1]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
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
    			label0.textContent = "Name";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Unit";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			div2 = element("div");
    			label2 = element("label");
    			label2.textContent = "Utility Type";
    			t9 = space();
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Writing";
    			option1 = element("option");
    			option1.textContent = "Marking";
    			option2 = element("option");
    			option2.textContent = "Cutting";
    			option3 = element("option");
    			option3.textContent = "Sewing";
    			option4 = element("option");
    			option4.textContent = "Maschine";
    			option5 = element("option");
    			option5.textContent = "Foot";
    			option6 = element("option");
    			option6.textContent = "Needle";
    			option7 = element("option");
    			option7.textContent = "Attachment";
    			option8 = element("option");
    			option8.textContent = "Measuring";
    			option9 = element("option");
    			option9.textContent = "Security";
    			option10 = element("option");
    			option10.textContent = "Help";
    			option11 = element("option");
    			option11.textContent = "Thread";
    			option12 = element("option");
    			option12.textContent = "Pattern";
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

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t37 = space();
    			tr1 = element("tr");
    			dt = element("dt");
    			t38 = text("Number of Utilities: ");
    			t39 = text(t39_value);
    			t40 = space();
    			nav = element("nav");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h10, "class", "mt-3");
    			add_location(h10, file$4, 73, 0, 2026);
    			attr_dev(label0, "class", "form-label");
    			attr_dev(label0, "for", "utilityName");
    			add_location(label0, file$4, 77, 12, 2152);
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "id", "description");
    			attr_dev(input0, "type", "text");
    			add_location(input0, file$4, 78, 12, 2222);
    			attr_dev(div0, "class", "col");
    			add_location(div0, file$4, 76, 8, 2121);
    			attr_dev(label1, "class", "form-label");
    			attr_dev(label1, "for", "unit");
    			add_location(label1, file$4, 87, 16, 2458);
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "id", "earnings");
    			attr_dev(input1, "type", "number");
    			add_location(input1, file$4, 88, 16, 2525);
    			attr_dev(div1, "class", "col");
    			add_location(div1, file$4, 86, 8, 2423);
    			attr_dev(label2, "class", "form-label");
    			attr_dev(label2, "for", "utilityType");
    			add_location(label2, file$4, 97, 12, 2773);
    			option0.__value = "WRITING";
    			option0.value = option0.__value;
    			add_location(option0, file$4, 106, 16, 3066);
    			option1.__value = "MARKING";
    			option1.value = option1.__value;
    			add_location(option1, file$4, 107, 16, 3124);
    			option2.__value = "CUTTING";
    			option2.value = option2.__value;
    			add_location(option2, file$4, 108, 16, 3182);
    			option3.__value = "SEWING";
    			option3.value = option3.__value;
    			add_location(option3, file$4, 109, 16, 3240);
    			option4.__value = "MASCHINE";
    			option4.value = option4.__value;
    			add_location(option4, file$4, 110, 16, 3296);
    			option5.__value = "FOOT";
    			option5.value = option5.__value;
    			add_location(option5, file$4, 111, 16, 3356);
    			option6.__value = "NEEDLE";
    			option6.value = option6.__value;
    			add_location(option6, file$4, 112, 16, 3408);
    			option7.__value = "ATTACHMENT";
    			option7.value = option7.__value;
    			add_location(option7, file$4, 113, 16, 3464);
    			option8.__value = "MEASURING";
    			option8.value = option8.__value;
    			add_location(option8, file$4, 114, 16, 3528);
    			option9.__value = "SECURITY";
    			option9.value = option9.__value;
    			add_location(option9, file$4, 115, 16, 3590);
    			option10.__value = "HELP";
    			option10.value = option10.__value;
    			add_location(option10, file$4, 116, 16, 3650);
    			option11.__value = "THREAD";
    			option11.value = option11.__value;
    			add_location(option11, file$4, 117, 16, 3702);
    			option12.__value = "PATTERN";
    			option12.value = option12.__value;
    			add_location(option12, file$4, 118, 16, 3758);
    			attr_dev(select, "class", "form-select");
    			attr_dev(select, "id", "type");
    			attr_dev(select, "type", "text");
    			if (/*utility*/ ctx[3].utilityType === void 0) add_render_callback(() => /*select_change_handler*/ ctx[8].call(select));
    			add_location(select, file$4, 100, 12, 2883);
    			attr_dev(div2, "class", "col");
    			add_location(div2, file$4, 96, 8, 2742);
    			attr_dev(div3, "class", "row mb-3");
    			add_location(div3, file$4, 75, 4, 2089);
    			attr_dev(form, "class", "mb-5");
    			add_location(form, file$4, 74, 0, 2064);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "my-button");
    			add_location(button, file$4, 125, 0, 3864);
    			attr_dev(div4, "class", "row mb-3");
    			add_location(div4, file$4, 127, 0, 3948);
    			add_location(h11, file$4, 130, 0, 3982);
    			add_location(th0, file$4, 135, 12, 4082);
    			add_location(th1, file$4, 136, 12, 4111);
    			add_location(th2, file$4, 137, 12, 4138);
    			add_location(th3, file$4, 138, 12, 4166);
    			add_location(tr0, file$4, 134, 8, 4064);
    			add_location(thead, file$4, 133, 4, 4047);
    			add_location(dt, file$4, 161, 12, 4742);
    			add_location(tr1, file$4, 160, 8, 4724);
    			add_location(tbody, file$4, 141, 4, 4223);
    			attr_dev(table, "class", "table table-hover");
    			add_location(table, file$4, 132, 0, 4008);
    			attr_dev(ul, "class", "pagination");
    			add_location(ul, file$4, 169, 4, 4876);
    			add_location(nav, file$4, 168, 0, 4865);
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
    			set_input_value(input0, /*utility*/ ctx[3].utilityName);
    			append_dev(div3, t4);
    			append_dev(div3, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t6);
    			append_dev(div1, input1);
    			set_input_value(input1, /*utility*/ ctx[3].unit);
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
    			select_option(select, /*utility*/ ctx[3].utilityType);
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

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(tbody, null);
    			}

    			append_dev(tbody, t37);
    			append_dev(tbody, tr1);
    			append_dev(tr1, dt);
    			append_dev(dt, t38);
    			append_dev(dt, t39);
    			insert_dev(target, t40, anchor);
    			insert_dev(target, nav, anchor);
    			append_dev(nav, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[6]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[7]),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[8]),
    					listen_dev(button, "click", /*createUtility*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*utility*/ 8 && input0.value !== /*utility*/ ctx[3].utilityName) {
    				set_input_value(input0, /*utility*/ ctx[3].utilityName);
    			}

    			if (dirty & /*utility*/ 8 && to_number(input1.value) !== /*utility*/ ctx[3].unit) {
    				set_input_value(input1, /*utility*/ ctx[3].unit);
    			}

    			if (dirty & /*utility*/ 8) {
    				select_option(select, /*utility*/ ctx[3].utilityType);
    			}

    			if (dirty & /*utilities*/ 4) {
    				each_value_1 = /*utilities*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(tbody, t37);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*utilities*/ 4 && t39_value !== (t39_value = /*utilities*/ ctx[2].length + "")) set_data_dev(t39, t39_value);

    			if (dirty & /*currentPage, nrOfPages*/ 3) {
    				each_value = Array(/*nrOfPages*/ ctx[1]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
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
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t40);
    			if (detaching) detach_dev(nav);
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

    const api_root$3 = "http://localhost:8080";

    function instance$4($$self, $$props, $$invalidate) {
    	let $jwt_token;
    	let $querystring;
    	validate_store(jwt_token, 'jwt_token');
    	component_subscribe($$self, jwt_token, $$value => $$invalidate(9, $jwt_token = $$value));
    	validate_store(querystring, 'querystring');
    	component_subscribe($$self, querystring, $$value => $$invalidate(5, $querystring = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Utilities', slots, []);
    	var currentPage;
    	let nrOfPages = 0;
    	let utilities = [];

    	let utility = {
    		utilityName: null,
    		unit: null,
    		utilityType: null
    	};

    	function getUtilities() {
    		let query = "pageSize=6&page=" + currentPage;

    		var config = {
    			method: "get",
    			url: api_root$3 + "/api/utilities?" + query,
    			headers: { Authorization: "Bearer " + $jwt_token }
    		};

    		axios(config).then(function (response) {
    			$$invalidate(2, utilities = response.data.content);
    			$$invalidate(1, nrOfPages = response.data.totalPages);
    		}).catch(function (error) {
    			alert("Could not get utilities");
    			console.log(error);
    		});
    	}

    	function createUtility() {
    		var config = {
    			method: "post",
    			url: api_root$3 + "/api/utilities",
    			headers: {
    				"Content-Type": "application/json",
    				Authorization: "Bearer " + $jwt_token
    			},
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

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$3.warn(`<Utilities> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		utility.utilityName = this.value;
    		$$invalidate(3, utility);
    	}

    	function input1_input_handler() {
    		utility.unit = to_number(this.value);
    		$$invalidate(3, utility);
    	}

    	function select_change_handler() {
    		utility.utilityType = select_value(this);
    		$$invalidate(3, utility);
    	}

    	$$self.$capture_state = () => ({
    		axios,
    		jwt_token,
    		querystring,
    		isAuthenticated,
    		user,
    		api_root: api_root$3,
    		currentPage,
    		nrOfPages,
    		utilities,
    		utility,
    		getUtilities,
    		createUtility,
    		$jwt_token,
    		$querystring
    	});

    	$$self.$inject_state = $$props => {
    		if ('currentPage' in $$props) $$invalidate(0, currentPage = $$props.currentPage);
    		if ('nrOfPages' in $$props) $$invalidate(1, nrOfPages = $$props.nrOfPages);
    		if ('utilities' in $$props) $$invalidate(2, utilities = $$props.utilities);
    		if ('utility' in $$props) $$invalidate(3, utility = $$props.utility);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$querystring*/ 32) {
    			{
    				let searchParams = new URLSearchParams($querystring);

    				if (searchParams.has("page")) {
    					$$invalidate(0, currentPage = searchParams.get("page"));
    				} else {
    					$$invalidate(0, currentPage = "1");
    				}

    				getUtilities();
    			}
    		}
    	};

    	return [
    		currentPage,
    		nrOfPages,
    		utilities,
    		utility,
    		createUtility,
    		$querystring,
    		input0_input_handler,
    		input1_input_handler,
    		select_change_handler
    	];
    }

    class Utilities extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Utilities",
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
    	child_ctx[23] = list[i];
    	child_ctx[25] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	child_ctx[28] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[29] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[29] = list[i];
    	return child_ctx;
    }

    // (102:0) {#if !$user.user_roles.includes("buyer")}
    function create_if_block_11$1(ctx) {
    	let a;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "Add Product";
    			attr_dev(a, "class", "my-button");
    			attr_dev(a, "href", "#/create-product");
    			attr_dev(a, "role", "button");
    			attr_dev(a, "aria-pressed", "true");
    			add_location(a, file$3, 102, 4, 2925);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11$1.name,
    		type: "if",
    		source: "(102:0) {#if !$user.user_roles.includes(\\\"buyer\\\")}",
    		ctx
    	});

    	return block;
    }

    // (132:4) {#if $user.user_roles && $user.user_roles.length > 0}
    function create_if_block_9$1(ctx) {
    	let div0;
    	let label;
    	let t1;
    	let div1;
    	let select;
    	let mounted;
    	let dispose;
    	let each_value_3 = /*allUsers*/ ctx[8];
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			label = element("label");
    			label.textContent = "Creator:";
    			t1 = space();
    			div1 = element("div");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(label, "for", "");
    			attr_dev(label, "class", "col-form-label");
    			add_location(label, file$3, 133, 12, 3764);
    			attr_dev(div0, "class", "col-auto");
    			add_location(div0, file$3, 132, 8, 3728);
    			attr_dev(select, "placeholder", "Creator");
    			attr_dev(select, "class", "form-select");
    			attr_dev(select, "id", "id");
    			attr_dev(select, "type", "text");
    			if (/*user_id*/ ctx[5] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[15].call(select));
    			add_location(select, file$3, 136, 12, 3877);
    			attr_dev(div1, "class", "col-3");
    			add_location(div1, file$3, 135, 8, 3844);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, label);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*user_id*/ ctx[5]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[15]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*allUsers*/ 256) {
    				each_value_3 = /*allUsers*/ ctx[8];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}

    			if (dirty[0] & /*user_id, allUsers*/ 288) {
    				select_option(select, /*user_id*/ ctx[5]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9$1.name,
    		type: "if",
    		source: "(132:4) {#if $user.user_roles && $user.user_roles.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (145:20) {#if user.userType !== "BUYER" && user.userStatus === "ACTIVE"}
    function create_if_block_10$1(ctx) {
    	let option;
    	let t_value = /*user*/ ctx[29].username + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*user*/ ctx[29].id;
    			option.value = option.__value;
    			add_location(option, file$3, 145, 24, 4220);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*allUsers*/ 256 && t_value !== (t_value = /*user*/ ctx[29].username + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*allUsers*/ 256 && option_value_value !== (option_value_value = /*user*/ ctx[29].id)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10$1.name,
    		type: "if",
    		source: "(145:20) {#if user.userType !== \\\"BUYER\\\" && user.userStatus === \\\"ACTIVE\\\"}",
    		ctx
    	});

    	return block;
    }

    // (144:16) {#each allUsers as user}
    function create_each_block_3(ctx) {
    	let if_block_anchor;
    	let if_block = /*user*/ ctx[29].userType !== "BUYER" && /*user*/ ctx[29].userStatus === "ACTIVE" && create_if_block_10$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*user*/ ctx[29].userType !== "BUYER" && /*user*/ ctx[29].userStatus === "ACTIVE") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_10$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(144:16) {#each allUsers as user}",
    		ctx
    	});

    	return block;
    }

    // (190:4) {#if $user.user_roles.includes("admin")}
    function create_if_block_8$1(ctx) {
    	let div0;
    	let label;
    	let t1;
    	let div1;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			label = element("label");
    			label.textContent = "Product State:";
    			t1 = space();
    			div1 = element("div");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Active";
    			option1 = element("option");
    			option1.textContent = "Inactive";
    			option2 = element("option");
    			option2.textContent = "New";
    			option3 = element("option");
    			option3.textContent = "Review";
    			attr_dev(label, "for", "");
    			attr_dev(label, "class", "col-form-label");
    			add_location(label, file$3, 191, 12, 5573);
    			attr_dev(div0, "class", "col-auto");
    			add_location(div0, file$3, 190, 8, 5537);
    			option0.__value = "ACTIVE";
    			option0.value = option0.__value;
    			add_location(option0, file$3, 203, 24, 5911);
    			option1.__value = "INACTIVE";
    			option1.value = option1.__value;
    			add_location(option1, file$3, 204, 24, 5975);
    			option2.__value = "NEW";
    			option2.value = option2.__value;
    			add_location(option2, file$3, 205, 24, 6043);
    			option3.__value = "REVIEW";
    			option3.value = option3.__value;
    			add_location(option3, file$3, 206, 24, 6101);
    			attr_dev(select, "placeholder", "State");
    			attr_dev(select, "class", "form-select");
    			attr_dev(select, "id", "state");
    			attr_dev(select, "type", "text");
    			if (/*state*/ ctx[6] === void 0) add_render_callback(() => /*select_change_handler_1*/ ctx[19].call(select));
    			add_location(select, file$3, 195, 12, 5694);
    			attr_dev(div1, "class", "col-3");
    			add_location(div1, file$3, 194, 8, 5661);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, label);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			append_dev(select, option3);
    			select_option(select, /*state*/ ctx[6]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler_1*/ ctx[19]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*state*/ 64) {
    				select_option(select, /*state*/ ctx[6]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8$1.name,
    		type: "if",
    		source: "(190:4) {#if $user.user_roles.includes(\\\"admin\\\")}",
    		ctx
    	});

    	return block;
    }

    // (272:74) 
    function create_if_block_7$1(ctx) {
    	let p;
    	let span;
    	let t_value = /*product*/ ctx[26].productState + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "badge bg-secondary");
    			add_location(span, file$3, 273, 36, 8874);
    			add_location(p, file$3, 272, 32, 8833);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, span);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*products*/ 128 && t_value !== (t_value = /*product*/ ctx[26].productState + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7$1.name,
    		type: "if",
    		source: "(272:74) ",
    		ctx
    	});

    	return block;
    }

    // (266:106) 
    function create_if_block_6$1(ctx) {
    	let p;
    	let span;
    	let t_value = /*product*/ ctx[26].productState + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "badge bg-warning");
    			add_location(span, file$3, 267, 36, 8545);
    			add_location(p, file$3, 266, 32, 8504);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, span);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*products*/ 128 && t_value !== (t_value = /*product*/ ctx[26].productState + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$1.name,
    		type: "if",
    		source: "(266:106) ",
    		ctx
    	});

    	return block;
    }

    // (260:28) {#if product.productState === "ACTIVE"}
    function create_if_block_5$1(ctx) {
    	let p;
    	let span;
    	let t_value = /*product*/ ctx[26].productState + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "badge bg-success");
    			add_location(span, file$3, 261, 36, 8184);
    			add_location(p, file$3, 260, 32, 8143);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, span);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*products*/ 128 && t_value !== (t_value = /*product*/ ctx[26].productState + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(260:28) {#if product.productState === \\\"ACTIVE\\\"}",
    		ctx
    	});

    	return block;
    }

    // (279:28) {#if $user.user_roles && $user.user_roles.length > 0}
    function create_if_block_3$2(ctx) {
    	let if_block_anchor;
    	let if_block = /*product*/ ctx[26].userId === null && create_if_block_4$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*product*/ ctx[26].userId === null) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_4$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(279:28) {#if $user.user_roles && $user.user_roles.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (280:32) {#if product.userId === null}
    function create_if_block_4$1(ctx) {
    	let p;
    	let button;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[20](/*product*/ ctx[26]);
    	}

    	const block = {
    		c: function create() {
    			p = element("p");
    			button = element("button");
    			button.textContent = "Assign to me";
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "btn btn-primary btn-sm");
    			add_location(button, file$3, 281, 40, 9318);
    			add_location(p, file$3, 280, 36, 9273);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(280:32) {#if product.userId === null}",
    		ctx
    	});

    	return block;
    }

    // (304:28) {:else}
    function create_else_block$3(ctx) {
    	let p;
    	let small;

    	const block = {
    		c: function create() {
    			p = element("p");
    			small = element("small");
    			small.textContent = "Creator: No Creator defined";
    			attr_dev(small, "class", "text-muted");
    			add_location(small, file$3, 305, 36, 10622);
    			attr_dev(p, "class", "card-text");
    			add_location(p, file$3, 304, 32, 10563);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, small);
    		},
    		p: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(304:28) {:else}",
    		ctx
    	});

    	return block;
    }

    // (294:28) {#if product.userId !== null}
    function create_if_block_1$3(ctx) {
    	let p;
    	let each_value_2 = /*allUsers*/ ctx[8];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			p = element("p");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(p, "class", "card-text");
    			add_location(p, file$3, 294, 32, 10005);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(p, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*allUsers, products*/ 384) {
    				each_value_2 = /*allUsers*/ ctx[8];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(p, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(294:28) {#if product.userId !== null}",
    		ctx
    	});

    	return block;
    }

    // (297:40) {#if product.userId === user.id}
    function create_if_block_2$2(ctx) {
    	let small;
    	let t0;
    	let t1_value = /*user*/ ctx[29].username + "";
    	let t1;

    	const block = {
    		c: function create() {
    			small = element("small");
    			t0 = text("Creator: ");
    			t1 = text(t1_value);
    			attr_dev(small, "class", "text-muted");
    			add_location(small, file$3, 297, 44, 10208);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, small, anchor);
    			append_dev(small, t0);
    			append_dev(small, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*allUsers*/ 256 && t1_value !== (t1_value = /*user*/ ctx[29].username + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(small);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(297:40) {#if product.userId === user.id}",
    		ctx
    	});

    	return block;
    }

    // (296:36) {#each allUsers as user}
    function create_each_block_2(ctx) {
    	let if_block_anchor;
    	let if_block = /*product*/ ctx[26].userId === /*user*/ ctx[29].id && create_if_block_2$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*product*/ ctx[26].userId === /*user*/ ctx[29].id) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(296:36) {#each allUsers as user}",
    		ctx
    	});

    	return block;
    }

    // (218:4) {#each products as product, index}
    function create_each_block_1$1(ctx) {
    	let div4;
    	let div3;
    	let div2;
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let h5;
    	let t1_value = /*product*/ ctx[26].productname + "";
    	let t1;
    	let t2;
    	let p0;
    	let span;
    	let t3_value = /*product*/ ctx[26].difficultyType + "";
    	let t3;
    	let t4;
    	let p1;
    	let t5;
    	let p2;
    	let t6;
    	let t7_value = /*product*/ ctx[26].productType + "";
    	let t7;
    	let t8;
    	let p3;
    	let t9;
    	let t10_value = /*product*/ ctx[26].clothingType + "";
    	let t10;
    	let t11;
    	let p4;
    	let t12;
    	let t13_value = /*product*/ ctx[26].price + "";
    	let t13;
    	let t14;
    	let p5;
    	let t15;
    	let t16_value = /*product*/ ctx[26].size + "";
    	let t16;
    	let t17;
    	let t18;
    	let t19;
    	let div1_onclick_value;
    	let t20;

    	function select_block_type(ctx, dirty) {
    		if (/*product*/ ctx[26].productState === "ACTIVE") return create_if_block_5$1;
    		if (/*product*/ ctx[26].productState === "REVIEW" || /*product*/ ctx[26].productState === "NEW") return create_if_block_6$1;
    		if (/*product*/ ctx[26].productState === "INACTIVE") return create_if_block_7$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type && current_block_type(ctx);
    	let if_block1 = /*$user*/ ctx[9].user_roles && /*$user*/ ctx[9].user_roles.length > 0 && create_if_block_3$2(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*product*/ ctx[26].userId !== null) return create_if_block_1$3;
    		return create_else_block$3;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block2 = current_block_type_1(ctx);

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
    			p0 = element("p");
    			span = element("span");
    			t3 = text(t3_value);
    			t4 = space();
    			p1 = element("p");
    			t5 = space();
    			p2 = element("p");
    			t6 = text("Product Type: ");
    			t7 = text(t7_value);
    			t8 = space();
    			p3 = element("p");
    			t9 = text("Clothing Type: ");
    			t10 = text(t10_value);
    			t11 = space();
    			p4 = element("p");
    			t12 = text("Product Price: ");
    			t13 = text(t13_value);
    			t14 = space();
    			p5 = element("p");
    			t15 = text("Product Size: ");
    			t16 = text(t16_value);
    			t17 = space();
    			if (if_block0) if_block0.c();
    			t18 = space();
    			if (if_block1) if_block1.c();
    			t19 = space();
    			if_block2.c();
    			t20 = space();
    			attr_dev(img, "class", "card-img-top");
    			if (!src_url_equal(img.src, img_src_value = "/images/default.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Card image cap");
    			add_location(img, file$3, 227, 24, 6810);
    			attr_dev(h5, "class", "card-title");
    			add_location(h5, file$3, 233, 28, 7076);
    			attr_dev(span, "class", "badge bg-primary");
    			add_location(span, file$3, 238, 32, 7277);
    			attr_dev(p0, "class", "card-title");
    			add_location(p0, file$3, 237, 28, 7221);
    			attr_dev(p1, "class", "card-text");
    			add_location(p1, file$3, 243, 28, 7477);
    			add_location(p2, file$3, 244, 28, 7530);
    			add_location(p3, file$3, 247, 28, 7666);
    			add_location(p4, file$3, 251, 28, 7806);
    			add_location(p5, file$3, 255, 28, 7939);
    			attr_dev(div0, "class", "card-body");
    			add_location(div0, file$3, 232, 24, 7023);
    			attr_dev(div1, "class", "card");
    			attr_dev(div1, "onclick", div1_onclick_value = "document.location = '" + ('#/products/' + /*product*/ ctx[26].id) + "';");
    			add_location(div1, file$3, 221, 20, 6532);
    			attr_dev(div2, "class", "card mb-2");
    			add_location(div2, file$3, 220, 16, 6487);
    			attr_dev(div3, "class", "col-10");
    			add_location(div3, file$3, 219, 12, 6449);
    			attr_dev(div4, "class", "container");
    			add_location(div4, file$3, 218, 8, 6412);
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
    			append_dev(div0, t2);
    			append_dev(div0, p0);
    			append_dev(p0, span);
    			append_dev(span, t3);
    			append_dev(div0, t4);
    			append_dev(div0, p1);
    			append_dev(div0, t5);
    			append_dev(div0, p2);
    			append_dev(p2, t6);
    			append_dev(p2, t7);
    			append_dev(div0, t8);
    			append_dev(div0, p3);
    			append_dev(p3, t9);
    			append_dev(p3, t10);
    			append_dev(div0, t11);
    			append_dev(div0, p4);
    			append_dev(p4, t12);
    			append_dev(p4, t13);
    			append_dev(div0, t14);
    			append_dev(div0, p5);
    			append_dev(p5, t15);
    			append_dev(p5, t16);
    			append_dev(div0, t17);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t18);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div0, t19);
    			if_block2.m(div0, null);
    			append_dev(div4, t20);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*products*/ 128 && t1_value !== (t1_value = /*product*/ ctx[26].productname + "")) set_data_dev(t1, t1_value);
    			if (dirty[0] & /*products*/ 128 && t3_value !== (t3_value = /*product*/ ctx[26].difficultyType + "")) set_data_dev(t3, t3_value);
    			if (dirty[0] & /*products*/ 128 && t7_value !== (t7_value = /*product*/ ctx[26].productType + "")) set_data_dev(t7, t7_value);
    			if (dirty[0] & /*products*/ 128 && t10_value !== (t10_value = /*product*/ ctx[26].clothingType + "")) set_data_dev(t10, t10_value);
    			if (dirty[0] & /*products*/ 128 && t13_value !== (t13_value = /*product*/ ctx[26].price + "")) set_data_dev(t13, t13_value);
    			if (dirty[0] & /*products*/ 128 && t16_value !== (t16_value = /*product*/ ctx[26].size + "")) set_data_dev(t16, t16_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if (if_block0) if_block0.d(1);
    				if_block0 = current_block_type && current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div0, t18);
    				}
    			}

    			if (/*$user*/ ctx[9].user_roles && /*$user*/ ctx[9].user_roles.length > 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3$2(ctx);
    					if_block1.c();
    					if_block1.m(div0, t19);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type_1(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div0, null);
    				}
    			}

    			if (dirty[0] & /*products*/ 128 && div1_onclick_value !== (div1_onclick_value = "document.location = '" + ('#/products/' + /*product*/ ctx[26].id) + "';")) {
    				attr_dev(div1, "onclick", div1_onclick_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);

    			if (if_block0) {
    				if_block0.d();
    			}

    			if (if_block1) if_block1.d();
    			if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(218:4) {#each products as product, index}",
    		ctx
    	});

    	return block;
    }

    // (326:8) {#each Array(nrOfPages) as _, i}
    function create_each_block$1(ctx) {
    	let li;
    	let a;
    	let t_value = /*i*/ ctx[25] + 1 + "";
    	let t;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "class", "page-link");
    			attr_dev(a, "href", "#/products?page=" + (/*i*/ ctx[25] + 1));
    			toggle_class(a, "active", /*currentPage*/ ctx[0] == /*i*/ ctx[25] + 1);
    			add_location(a, file$3, 327, 16, 11283);
    			attr_dev(li, "class", "page-item");
    			add_location(li, file$3, 326, 12, 11243);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*currentPage*/ 1) {
    				toggle_class(a, "active", /*currentPage*/ ctx[0] == /*i*/ ctx[25] + 1);
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
    		source: "(326:8) {#each Array(nrOfPages) as _, i}",
    		ctx
    	});

    	return block;
    }

    // (344:0) {#if !$user.user_roles.includes("buyer")}
    function create_if_block$3(ctx) {
    	let a;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "Add Product";
    			attr_dev(a, "class", "my-button");
    			attr_dev(a, "href", "#/create-product");
    			attr_dev(a, "role", "button");
    			attr_dev(a, "aria-pressed", "true");
    			add_location(a, file$3, 344, 4, 11764);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(344:0) {#if !$user.user_roles.includes(\\\"buyer\\\")}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let h1;
    	let t1;
    	let show_if_2 = !/*$user*/ ctx[9].user_roles.includes("buyer");
    	let t2;
    	let a0;
    	let t4;
    	let div3;
    	let div0;
    	let label0;
    	let t6;
    	let div1;
    	let input0;
    	let t7;
    	let div2;
    	let input1;
    	let t8;
    	let t9;
    	let div9;
    	let div4;
    	let label1;
    	let t11;
    	let div7;
    	let div5;
    	let label2;
    	let input2;
    	let t12;
    	let t13;
    	let div6;
    	let label3;
    	let input3;
    	let t14;
    	let t15;
    	let show_if_1 = /*$user*/ ctx[9].user_roles.includes("admin");
    	let t16;
    	let div8;
    	let button;
    	let t18;
    	let div10;
    	let t19;
    	let nav;
    	let ul;
    	let li0;
    	let a1;
    	let t20;
    	let a1_href_value;
    	let t21;
    	let t22;
    	let li1;
    	let a2;
    	let t23;
    	let a2_href_value;
    	let t24;
    	let show_if = !/*$user*/ ctx[9].user_roles.includes("buyer");
    	let t25;
    	let a3;
    	let mounted;
    	let dispose;
    	let if_block0 = show_if_2 && create_if_block_11$1(ctx);
    	let if_block1 = /*$user*/ ctx[9].user_roles && /*$user*/ ctx[9].user_roles.length > 0 && create_if_block_9$1(ctx);
    	let if_block2 = show_if_1 && create_if_block_8$1(ctx);
    	let each_value_1 = /*products*/ ctx[7];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = Array(/*nrOfPages*/ ctx[1]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	let if_block3 = show_if && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "All Products";
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			a0 = element("a");
    			a0.textContent = "Back";
    			t4 = space();
    			div3 = element("div");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Price:";
    			t6 = space();
    			div1 = element("div");
    			input0 = element("input");
    			t7 = space();
    			div2 = element("div");
    			input1 = element("input");
    			t8 = space();
    			if (if_block1) if_block1.c();
    			t9 = space();
    			div9 = element("div");
    			div4 = element("div");
    			label1 = element("label");
    			label1.textContent = "Product Type:";
    			t11 = space();
    			div7 = element("div");
    			div5 = element("div");
    			label2 = element("label");
    			input2 = element("input");
    			t12 = text("\r\n                Schnittmuster");
    			t13 = space();
    			div6 = element("div");
    			label3 = element("label");
    			input3 = element("input");
    			t14 = text("\r\n                Manual");
    			t15 = space();
    			if (if_block2) if_block2.c();
    			t16 = space();
    			div8 = element("div");
    			button = element("button");
    			button.textContent = "Apply";
    			t18 = space();
    			div10 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t19 = space();
    			nav = element("nav");
    			ul = element("ul");
    			li0 = element("li");
    			a1 = element("a");
    			t20 = text("Previous");
    			t21 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t22 = space();
    			li1 = element("li");
    			a2 = element("a");
    			t23 = text("Next");
    			t24 = space();
    			if (if_block3) if_block3.c();
    			t25 = space();
    			a3 = element("a");
    			a3.textContent = "Back";
    			attr_dev(h1, "class", "mt-3");
    			add_location(h1, file$3, 100, 0, 2842);
    			attr_dev(a0, "class", "back-button");
    			attr_dev(a0, "href", "#/");
    			attr_dev(a0, "role", "button");
    			attr_dev(a0, "aria-pressed", "true");
    			add_location(a0, file$3, 109, 0, 3070);
    			attr_dev(label0, "for", "");
    			attr_dev(label0, "class", "col-form-label");
    			add_location(label0, file$3, 113, 8, 3209);
    			attr_dev(div0, "class", "col-auto");
    			add_location(div0, file$3, 112, 4, 3177);
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "placeholder", "from");
    			add_location(input0, file$3, 116, 8, 3308);
    			attr_dev(div1, "class", "col-3");
    			add_location(div1, file$3, 115, 4, 3279);
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "placeholder", "to");
    			add_location(input1, file$3, 124, 8, 3502);
    			attr_dev(div2, "class", "col-3");
    			add_location(div2, file$3, 123, 4, 3473);
    			attr_dev(div3, "class", "row my-3");
    			add_location(div3, file$3, 111, 0, 3149);
    			attr_dev(label1, "for", "");
    			attr_dev(label1, "class", "col-form-label");
    			add_location(label1, file$3, 157, 8, 4528);
    			attr_dev(div4, "class", "col-auto");
    			add_location(div4, file$3, 156, 4, 4496);
    			attr_dev(input2, "class", "form-check-input");
    			attr_dev(input2, "type", "radio");
    			attr_dev(input2, "name", "schittmuster");
    			input2.__value = "SCHNITTMUSTER";
    			input2.value = input2.__value;
    			/*$$binding_groups*/ ctx[17][0].push(input2);
    			add_location(input2, file$3, 162, 16, 4697);
    			add_location(label2, file$3, 161, 12, 4672);
    			attr_dev(div5, "class", "form-check");
    			add_location(div5, file$3, 160, 8, 4634);
    			attr_dev(input3, "class", "form-check-input");
    			attr_dev(input3, "type", "radio");
    			attr_dev(input3, "name", "manual");
    			attr_dev(input3, "id", "manual");
    			input3.__value = "MANUAL";
    			input3.value = input3.__value;
    			/*$$binding_groups*/ ctx[17][0].push(input3);
    			add_location(input3, file$3, 175, 16, 5112);
    			add_location(label3, file$3, 174, 12, 5087);
    			attr_dev(div6, "class", "form-check");
    			add_location(div6, file$3, 173, 8, 5049);
    			attr_dev(div7, "class", "col-3");
    			add_location(div7, file$3, 159, 4, 4605);
    			attr_dev(button, "class", "my-button");
    			add_location(button, file$3, 212, 8, 6229);
    			attr_dev(div8, "class", "col-auto");
    			add_location(div8, file$3, 211, 4, 6197);
    			attr_dev(div9, "class", "row my-3");
    			add_location(div9, file$3, 155, 0, 4468);
    			attr_dev(div10, "class", "row row-cols-1 row-cols-md-3 g-4");
    			add_location(div10, file$3, 216, 0, 6316);
    			attr_dev(a1, "class", "page-link");
    			attr_dev(a1, "href", a1_href_value = "#/products?page=" + (/*currentPage*/ ctx[0] - 1));
    			add_location(a1, file$3, 321, 12, 11061);
    			attr_dev(li0, "class", "page-item");
    			add_location(li0, file$3, 320, 8, 11025);
    			attr_dev(a2, "class", "page-link");
    			attr_dev(a2, "href", a2_href_value = "#/products?page=" + (/*currentPage*/ ctx[0] + 1));
    			add_location(a2, file$3, 336, 12, 11572);
    			attr_dev(li1, "class", "page-item");
    			add_location(li1, file$3, 335, 8, 11536);
    			attr_dev(ul, "class", "pagination");
    			add_location(ul, file$3, 319, 4, 10992);
    			add_location(nav, file$3, 318, 0, 10981);
    			attr_dev(a3, "class", "back-button");
    			attr_dev(a3, "href", "#/");
    			attr_dev(a3, "role", "button");
    			attr_dev(a3, "aria-pressed", "true");
    			add_location(a3, file$3, 351, 0, 11909);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, a0, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, label0);
    			append_dev(div3, t6);
    			append_dev(div3, div1);
    			append_dev(div1, input0);
    			set_input_value(input0, /*pricesMin*/ ctx[2]);
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    			append_dev(div2, input1);
    			set_input_value(input1, /*pricesMax*/ ctx[3]);
    			append_dev(div3, t8);
    			if (if_block1) if_block1.m(div3, null);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div4);
    			append_dev(div4, label1);
    			append_dev(div9, t11);
    			append_dev(div9, div7);
    			append_dev(div7, div5);
    			append_dev(div5, label2);
    			append_dev(label2, input2);
    			input2.checked = input2.__value === /*type*/ ctx[4];
    			append_dev(label2, t12);
    			append_dev(div7, t13);
    			append_dev(div7, div6);
    			append_dev(div6, label3);
    			append_dev(label3, input3);
    			input3.checked = input3.__value === /*type*/ ctx[4];
    			append_dev(label3, t14);
    			append_dev(div9, t15);
    			if (if_block2) if_block2.m(div9, null);
    			append_dev(div9, t16);
    			append_dev(div9, div8);
    			append_dev(div8, button);
    			insert_dev(target, t18, anchor);
    			insert_dev(target, div10, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div10, null);
    			}

    			insert_dev(target, t19, anchor);
    			insert_dev(target, nav, anchor);
    			append_dev(nav, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a1);
    			append_dev(a1, t20);
    			append_dev(ul, t21);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(ul, t22);
    			append_dev(ul, li1);
    			append_dev(li1, a2);
    			append_dev(a2, t23);
    			insert_dev(target, t24, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t25, anchor);
    			insert_dev(target, a3, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[13]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[14]),
    					listen_dev(input2, "change", /*input2_change_handler*/ ctx[16]),
    					listen_dev(input2, "click", /*getProducts*/ ctx[10], false, false, false),
    					listen_dev(input3, "change", /*input3_change_handler*/ ctx[18]),
    					listen_dev(input3, "click", /*getProducts*/ ctx[10], false, false, false),
    					listen_dev(button, "click", /*getProducts*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$user*/ 512) show_if_2 = !/*$user*/ ctx[9].user_roles.includes("buyer");

    			if (show_if_2) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_11$1(ctx);
    					if_block0.c();
    					if_block0.m(t2.parentNode, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty[0] & /*pricesMin*/ 4 && to_number(input0.value) !== /*pricesMin*/ ctx[2]) {
    				set_input_value(input0, /*pricesMin*/ ctx[2]);
    			}

    			if (dirty[0] & /*pricesMax*/ 8 && to_number(input1.value) !== /*pricesMax*/ ctx[3]) {
    				set_input_value(input1, /*pricesMax*/ ctx[3]);
    			}

    			if (/*$user*/ ctx[9].user_roles && /*$user*/ ctx[9].user_roles.length > 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_9$1(ctx);
    					if_block1.c();
    					if_block1.m(div3, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty[0] & /*type*/ 16) {
    				input2.checked = input2.__value === /*type*/ ctx[4];
    			}

    			if (dirty[0] & /*type*/ 16) {
    				input3.checked = input3.__value === /*type*/ ctx[4];
    			}

    			if (dirty[0] & /*$user*/ 512) show_if_1 = /*$user*/ ctx[9].user_roles.includes("admin");

    			if (show_if_1) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_8$1(ctx);
    					if_block2.c();
    					if_block2.m(div9, t16);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty[0] & /*products, allUsers, assignToMe, $user*/ 2944) {
    				each_value_1 = /*products*/ ctx[7];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div10, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty[0] & /*currentPage*/ 1 && a1_href_value !== (a1_href_value = "#/products?page=" + (/*currentPage*/ ctx[0] - 1))) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if (dirty[0] & /*currentPage, nrOfPages*/ 3) {
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
    						each_blocks[i].m(ul, t22);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*currentPage*/ 1 && a2_href_value !== (a2_href_value = "#/products?page=" + (/*currentPage*/ ctx[0] + 1))) {
    				attr_dev(a2, "href", a2_href_value);
    			}

    			if (dirty[0] & /*$user*/ 512) show_if = !/*$user*/ ctx[9].user_roles.includes("buyer");

    			if (show_if) {
    				if (if_block3) ; else {
    					if_block3 = create_if_block$3(ctx);
    					if_block3.c();
    					if_block3.m(t25.parentNode, t25);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(a0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div3);
    			if (if_block1) if_block1.d();
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div9);
    			/*$$binding_groups*/ ctx[17][0].splice(/*$$binding_groups*/ ctx[17][0].indexOf(input2), 1);
    			/*$$binding_groups*/ ctx[17][0].splice(/*$$binding_groups*/ ctx[17][0].indexOf(input3), 1);
    			if (if_block2) if_block2.d();
    			if (detaching) detach_dev(t18);
    			if (detaching) detach_dev(div10);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(nav);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t24);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t25);
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
    	let $jwt_token;
    	let $querystring;
    	let $user;
    	validate_store(jwt_token, 'jwt_token');
    	component_subscribe($$self, jwt_token, $$value => $$invalidate(21, $jwt_token = $$value));
    	validate_store(querystring, 'querystring');
    	component_subscribe($$self, querystring, $$value => $$invalidate(12, $querystring = $$value));
    	validate_store(user, 'user');
    	component_subscribe($$self, user, $$value => $$invalidate(9, $user = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Products', slots, []);
    	var currentPage;
    	let nrOfPages = 0;
    	let pricesMin, pricesMax, type, user_id;
    	let state = "ACTIVE";
    	let products = [];
    	let allUsers = [];

    	function getProducts() {
    		let query = "pageSize=6&page=" + currentPage;

    		if (pricesMin) {
    			query += "&min=" + pricesMin;
    		}

    		if (pricesMax) {
    			query += "&max=" + pricesMax;
    		}

    		if (type) {
    			query += "&type=" + type;
    		}

    		if (user_id) {
    			query += "&user=" + user_id;
    		}

    		if (state) {
    			query += "&state=" + state;
    		}

    		var config = {
    			method: "get",
    			url: api_root$2 + "/api/products?" + query,
    			headers: {}
    		};

    		axios(config).then(function (response) {
    			$$invalidate(7, products = response.data.content);
    			$$invalidate(1, nrOfPages = response.data.totalPages);
    		}).catch(function (error) {
    			alert("Could not get products");
    			console.log(error);
    		});
    	}

    	function getUsers() {
    		var config = {
    			method: "get",
    			url: api_root$2 + "/api/users?pagesize=30",
    			headers: { Authorization: "Bearer " + $jwt_token }
    		};

    		axios(config).then(function (response) {
    			$$invalidate(8, allUsers = response.data.content);
    			console.log(allUsers);
    		}).catch(function (error) {
    			// alert("Could not get users");
    			console.log(error);
    		});
    	}

    	function assignToMe(productId) {
    		var config = {
    			method: "post",
    			url: api_root$2 + "/api/service/assigntome?productId=" + productId,
    			headers: { Authorization: "Bearer " + $jwt_token }
    		};

    		axios(config).then(function (response) {
    			getProducts();
    		}).catch(function (error) {
    			alert("Could not assign product to me");
    			console.log(error);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<Products> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];

    	function input0_input_handler() {
    		pricesMin = to_number(this.value);
    		$$invalidate(2, pricesMin);
    	}

    	function input1_input_handler() {
    		pricesMax = to_number(this.value);
    		$$invalidate(3, pricesMax);
    	}

    	function select_change_handler() {
    		user_id = select_value(this);
    		$$invalidate(5, user_id);
    		$$invalidate(8, allUsers);
    	}

    	function input2_change_handler() {
    		type = this.__value;
    		$$invalidate(4, type);
    	}

    	function input3_change_handler() {
    		type = this.__value;
    		$$invalidate(4, type);
    	}

    	function select_change_handler_1() {
    		state = select_value(this);
    		$$invalidate(6, state);
    	}

    	const click_handler = product => {
    		assignToMe(product.id);
    	};

    	$$self.$capture_state = () => ({
    		axios,
    		querystring,
    		each,
    		jwt_token,
    		isAuthenticated,
    		user,
    		api_root: api_root$2,
    		currentPage,
    		nrOfPages,
    		pricesMin,
    		pricesMax,
    		type,
    		user_id,
    		state,
    		products,
    		allUsers,
    		getProducts,
    		getUsers,
    		assignToMe,
    		$jwt_token,
    		$querystring,
    		$user
    	});

    	$$self.$inject_state = $$props => {
    		if ('currentPage' in $$props) $$invalidate(0, currentPage = $$props.currentPage);
    		if ('nrOfPages' in $$props) $$invalidate(1, nrOfPages = $$props.nrOfPages);
    		if ('pricesMin' in $$props) $$invalidate(2, pricesMin = $$props.pricesMin);
    		if ('pricesMax' in $$props) $$invalidate(3, pricesMax = $$props.pricesMax);
    		if ('type' in $$props) $$invalidate(4, type = $$props.type);
    		if ('user_id' in $$props) $$invalidate(5, user_id = $$props.user_id);
    		if ('state' in $$props) $$invalidate(6, state = $$props.state);
    		if ('products' in $$props) $$invalidate(7, products = $$props.products);
    		if ('allUsers' in $$props) $$invalidate(8, allUsers = $$props.allUsers);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*$querystring*/ 4096) {
    			{
    				let searchParams = new URLSearchParams($querystring);

    				if (searchParams.has("page")) {
    					$$invalidate(0, currentPage = searchParams.get("page"));
    				} else {
    					$$invalidate(0, currentPage = "1");
    				}

    				getProducts();
    				getUsers();
    			}
    		}
    	};

    	return [
    		currentPage,
    		nrOfPages,
    		pricesMin,
    		pricesMax,
    		type,
    		user_id,
    		state,
    		products,
    		allUsers,
    		$user,
    		getProducts,
    		assignToMe,
    		$querystring,
    		input0_input_handler,
    		input1_input_handler,
    		select_change_handler,
    		input2_change_handler,
    		$$binding_groups,
    		input3_change_handler,
    		select_change_handler_1,
    		click_handler
    	];
    }

    class Products extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Products",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\pages\CreateProduct.svelte generated by Svelte v3.53.1 */

    const { console: console_1$1 } = globals;
    const file$2 = "src\\pages\\CreateProduct.svelte";

    // (158:0) {:else}
    function create_else_block_1(ctx) {
    	let div;
    	let h3;
    	let b;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			b = element("b");
    			b.textContent = "Not correct Role";
    			add_location(b, file$2, 159, 12, 5641);
    			add_location(h3, file$2, 159, 8, 5637);
    			attr_dev(div, "class", "alert");
    			attr_dev(div, "role", "alert");
    			add_location(div, file$2, 158, 4, 5595);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(h3, b);
    		},
    		p: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(158:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (43:0) {#if !$user.user_roles.includes("buyer")}
    function create_if_block$2(ctx) {
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
    	let div6;
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
    	let t33;
    	let div8;
    	let div7;
    	let label5;
    	let t35;
    	let textarea;
    	let t36;
    	let a0;
    	let t38;
    	let a1;
    	let mounted;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (/*product*/ ctx[0].productType !== "MANUAL") return create_if_block_1$2;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

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
    			option0.textContent = "Schnittmuster";
    			option1 = element("option");
    			option1.textContent = "Manual";
    			t9 = space();
    			div2 = element("div");
    			label2 = element("label");
    			label2.textContent = "Difficulty Type";
    			t11 = space();
    			select1 = element("select");
    			option2 = element("option");
    			option2.textContent = "Easy";
    			option3 = element("option");
    			option3.textContent = "Medium";
    			option4 = element("option");
    			option4.textContent = "Difficult";
    			t15 = space();
    			div6 = element("div");
    			div4 = element("div");
    			label3 = element("label");
    			label3.textContent = "Clothing Type";
    			t17 = space();
    			select2 = element("select");
    			option5 = element("option");
    			option5.textContent = "Shirt";
    			option6 = element("option");
    			option6.textContent = "T-Shirt";
    			option7 = element("option");
    			option7.textContent = "Pullover";
    			option8 = element("option");
    			option8.textContent = "Blouse";
    			option9 = element("option");
    			option9.textContent = "Jacket";
    			option10 = element("option");
    			option10.textContent = "Trousers";
    			option11 = element("option");
    			option11.textContent = "Skirt";
    			option12 = element("option");
    			option12.textContent = "Dress";
    			option13 = element("option");
    			option13.textContent = "Socks";
    			option14 = element("option");
    			option14.textContent = "Accessoires";
    			option15 = element("option");
    			option15.textContent = "Undefined";
    			t29 = space();
    			div5 = element("div");
    			label4 = element("label");
    			label4.textContent = "Price";
    			t31 = space();
    			input1 = element("input");
    			t32 = space();
    			if_block.c();
    			t33 = space();
    			div8 = element("div");
    			div7 = element("div");
    			label5 = element("label");
    			label5.textContent = "Description";
    			t35 = space();
    			textarea = element("textarea");
    			t36 = space();
    			a0 = element("a");
    			a0.textContent = "Submit";
    			t38 = space();
    			a1 = element("a");
    			a1.textContent = "Back";
    			attr_dev(h1, "class", "mt-3");
    			add_location(h1, file$2, 43, 4, 1192);
    			attr_dev(label0, "class", "form-label");
    			attr_dev(label0, "for", "productname");
    			add_location(label0, file$2, 47, 16, 1334);
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "id", "description");
    			attr_dev(input0, "type", "text");
    			add_location(input0, file$2, 48, 16, 1416);
    			attr_dev(div0, "class", "col");
    			add_location(div0, file$2, 46, 12, 1299);
    			attr_dev(label1, "class", "form-label");
    			attr_dev(label1, "for", "productType");
    			add_location(label1, file$2, 57, 16, 1680);
    			option0.__value = "SCHNITTMUSTER";
    			option0.value = option0.__value;
    			add_location(option0, file$2, 64, 20, 1969);
    			option1.__value = "MANUAL";
    			option1.value = option1.__value;
    			add_location(option1, file$2, 65, 20, 2043);
    			attr_dev(select0, "class", "form-select");
    			attr_dev(select0, "id", "type");
    			attr_dev(select0, "type", "text");
    			if (/*product*/ ctx[0].productType === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[4].call(select0));
    			add_location(select0, file$2, 58, 16, 1762);
    			attr_dev(div1, "class", "col");
    			add_location(div1, file$2, 56, 12, 1645);
    			attr_dev(label2, "class", "form-label");
    			attr_dev(label2, "for", "difficultyType");
    			add_location(label2, file$2, 70, 16, 2179);
    			option2.__value = "EASY";
    			option2.value = option2.__value;
    			add_location(option2, file$2, 79, 20, 2517);
    			option3.__value = "MEDIUM";
    			option3.value = option3.__value;
    			add_location(option3, file$2, 80, 20, 2573);
    			option4.__value = "DIFFICULT";
    			option4.value = option4.__value;
    			add_location(option4, file$2, 81, 20, 2633);
    			attr_dev(select1, "class", "form-select");
    			attr_dev(select1, "id", "type");
    			attr_dev(select1, "type", "text");
    			if (/*product*/ ctx[0].difficultyType === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[5].call(select1));
    			add_location(select1, file$2, 73, 16, 2307);
    			attr_dev(div2, "class", "col");
    			add_location(div2, file$2, 69, 12, 2144);
    			attr_dev(div3, "class", "row mb-3");
    			add_location(div3, file$2, 45, 8, 1263);
    			attr_dev(label3, "class", "form-label");
    			attr_dev(label3, "for", "clothingType");
    			add_location(label3, file$2, 88, 16, 2823);
    			option5.__value = "SHIRT";
    			option5.value = option5.__value;
    			add_location(option5, file$2, 97, 20, 3155);
    			option6.__value = "TSHIRT";
    			option6.value = option6.__value;
    			add_location(option6, file$2, 98, 20, 3213);
    			option7.__value = "PULLOVER";
    			option7.value = option7.__value;
    			add_location(option7, file$2, 99, 20, 3274);
    			option8.__value = "BLOUSE";
    			option8.value = option8.__value;
    			add_location(option8, file$2, 100, 20, 3338);
    			option9.__value = "JACKET";
    			option9.value = option9.__value;
    			add_location(option9, file$2, 101, 20, 3398);
    			option10.__value = "TROUSERS";
    			option10.value = option10.__value;
    			add_location(option10, file$2, 102, 20, 3458);
    			option11.__value = "SKIRT";
    			option11.value = option11.__value;
    			add_location(option11, file$2, 103, 20, 3522);
    			option12.__value = "DRESS";
    			option12.value = option12.__value;
    			add_location(option12, file$2, 104, 20, 3580);
    			option13.__value = "SOCKS";
    			option13.value = option13.__value;
    			add_location(option13, file$2, 105, 20, 3638);
    			option14.__value = "ACCESSOIRES";
    			option14.value = option14.__value;
    			add_location(option14, file$2, 106, 20, 3696);
    			option15.selected = true;
    			option15.__value = "UNDEFINED";
    			option15.value = option15.__value;
    			add_location(option15, file$2, 107, 20, 3766);
    			attr_dev(select2, "class", "form-select");
    			attr_dev(select2, "id", "type");
    			attr_dev(select2, "type", "text");
    			if (/*product*/ ctx[0].clothingType === void 0) add_render_callback(() => /*select2_change_handler*/ ctx[6].call(select2));
    			add_location(select2, file$2, 91, 16, 2947);
    			attr_dev(div4, "class", "col");
    			add_location(div4, file$2, 87, 12, 2788);
    			attr_dev(label4, "class", "form-label");
    			attr_dev(label4, "for", "price");
    			add_location(label4, file$2, 111, 16, 3915);
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "id", "earnings");
    			attr_dev(input1, "type", "number");
    			add_location(input1, file$2, 112, 16, 3984);
    			attr_dev(div5, "class", "col");
    			add_location(div5, file$2, 110, 12, 3880);
    			attr_dev(div6, "class", "row mb-3");
    			add_location(div6, file$2, 86, 8, 2752);
    			attr_dev(label5, "for", "description");
    			add_location(label5, file$2, 145, 16, 5107);
    			attr_dev(textarea, "class", "form-control");
    			attr_dev(textarea, "id", "description");
    			attr_dev(textarea, "rows", "3");
    			add_location(textarea, file$2, 146, 16, 5169);
    			attr_dev(div7, "class", "col");
    			add_location(div7, file$2, 144, 12, 5072);
    			attr_dev(div8, "class", "row mb-3");
    			add_location(div8, file$2, 143, 8, 5036);
    			attr_dev(form, "class", "mb-5");
    			add_location(form, file$2, 44, 4, 1234);
    			attr_dev(a0, "class", "my-button");
    			attr_dev(a0, "href", "#/products");
    			add_location(a0, file$2, 155, 4, 5417);
    			attr_dev(a1, "class", "back-button");
    			attr_dev(a1, "href", "#/products");
    			attr_dev(a1, "role", "button");
    			attr_dev(a1, "aria-pressed", "true");
    			add_location(a1, file$2, 156, 4, 5497);
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
    			append_dev(form, div6);
    			append_dev(div6, div4);
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
    			append_dev(div6, t29);
    			append_dev(div6, div5);
    			append_dev(div5, label4);
    			append_dev(div5, t31);
    			append_dev(div5, input1);
    			set_input_value(input1, /*product*/ ctx[0].price);
    			append_dev(div6, t32);
    			if_block.m(div6, null);
    			append_dev(form, t33);
    			append_dev(form, div8);
    			append_dev(div8, div7);
    			append_dev(div7, label5);
    			append_dev(div7, t35);
    			append_dev(div7, textarea);
    			set_input_value(textarea, /*product*/ ctx[0].description);
    			insert_dev(target, t36, anchor);
    			insert_dev(target, a0, anchor);
    			insert_dev(target, t38, anchor);
    			insert_dev(target, a1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[3]),
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[4]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[5]),
    					listen_dev(select2, "change", /*select2_change_handler*/ ctx[6]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[7]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[10]),
    					listen_dev(a0, "click", /*createProduct*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
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

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div6, null);
    				}
    			}

    			if (dirty & /*product*/ 1) {
    				set_input_value(textarea, /*product*/ ctx[0].description);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(form);
    			if_block.d();
    			if (detaching) detach_dev(t36);
    			if (detaching) detach_dev(a0);
    			if (detaching) detach_dev(t38);
    			if (detaching) detach_dev(a1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(43:0) {#if !$user.user_roles.includes(\\\"buyer\\\")}",
    		ctx
    	});

    	return block;
    }

    // (131:12) {:else}
    function create_else_block$2(ctx) {
    	let div;
    	let label;
    	let t1;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			label.textContent = "Patchart";
    			t1 = space();
    			input = element("input");
    			attr_dev(label, "class", "form-label");
    			attr_dev(label, "for", "size");
    			add_location(label, file$2, 132, 20, 4680);
    			attr_dev(input, "class", "form-control");
    			attr_dev(input, "id", "description");
    			attr_dev(input, "type", "text");
    			add_location(input, file$2, 133, 20, 4755);
    			attr_dev(div, "class", "col");
    			add_location(div, file$2, 131, 16, 4641);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(div, t1);
    			append_dev(div, input);
    			set_input_value(input, /*product*/ ctx[0].patchart);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler_1*/ ctx[9]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*product*/ 1 && input.value !== /*product*/ ctx[0].patchart) {
    				set_input_value(input, /*product*/ ctx[0].patchart);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(131:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (121:12) {#if product.productType !== "MANUAL"}
    function create_if_block_1$2(ctx) {
    	let div;
    	let label;
    	let t1;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			label.textContent = "Size";
    			t1 = space();
    			input = element("input");
    			attr_dev(label, "class", "form-label");
    			attr_dev(label, "for", "size");
    			add_location(label, file$2, 122, 20, 4301);
    			attr_dev(input, "class", "form-control");
    			attr_dev(input, "id", "description");
    			attr_dev(input, "type", "text");
    			add_location(input, file$2, 123, 20, 4372);
    			attr_dev(div, "class", "col");
    			add_location(div, file$2, 121, 16, 4262);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(div, t1);
    			append_dev(div, input);
    			set_input_value(input, /*product*/ ctx[0].size);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[8]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*product*/ 1 && input.value !== /*product*/ ctx[0].size) {
    				set_input_value(input, /*product*/ ctx[0].size);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(121:12) {#if product.productType !== \\\"MANUAL\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let show_if;
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (dirty & /*$user*/ 2) show_if = null;
    		if (show_if == null) show_if = !!!/*$user*/ ctx[1].user_roles.includes("buyer");
    		if (show_if) return create_if_block$2;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx, -1);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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

    const api_root$1 = "http://localhost:8080";

    function instance$2($$self, $$props, $$invalidate) {
    	let $jwt_token;
    	let $user;
    	validate_store(jwt_token, 'jwt_token');
    	component_subscribe($$self, jwt_token, $$value => $$invalidate(11, $jwt_token = $$value));
    	validate_store(user, 'user');
    	component_subscribe($$self, user, $$value => $$invalidate(1, $user = $$value));
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
    			url: api_root$1 + "/api/products",
    			headers: {
    				"Content-Type": "application/json",
    				Authorization: "Bearer " + $jwt_token
    			},
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<CreateProduct> was created with unknown prop '${key}'`);
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

    	function input_input_handler() {
    		product.size = this.value;
    		$$invalidate(0, product);
    	}

    	function input_input_handler_1() {
    		product.patchart = this.value;
    		$$invalidate(0, product);
    	}

    	function textarea_input_handler() {
    		product.description = this.value;
    		$$invalidate(0, product);
    	}

    	$$self.$capture_state = () => ({
    		axios,
    		jwt_token,
    		isAuthenticated,
    		user,
    		api_root: api_root$1,
    		products,
    		product,
    		createProduct,
    		$jwt_token,
    		$user
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
    		$user,
    		createProduct,
    		input0_input_handler,
    		select0_change_handler,
    		select1_change_handler,
    		select2_change_handler,
    		input1_input_handler,
    		input_input_handler,
    		input_input_handler_1,
    		textarea_input_handler
    	];
    }

    class CreateProduct extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CreateProduct",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\pages\ProductDetails.svelte generated by Svelte v3.53.1 */

    const { console: console_1 } = globals;
    const file$1 = "src\\pages\\ProductDetails.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    // (203:4) {:else}
    function create_else_block$1(ctx) {
    	let div;
    	let each_value_1 = /*allUsers*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "row");
    			add_location(div, file$1, 203, 8, 5818);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*allUsers, product*/ 6) {
    				each_value_1 = /*allUsers*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(203:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (192:4) {#if product.userId === null}
    function create_if_block_11(ctx) {
    	let div3;
    	let div2;
    	let div1;
    	let div0;
    	let h5;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h5 = element("h5");
    			h5.textContent = "No Creator assigned";
    			t1 = space();
    			p = element("p");
    			attr_dev(h5, "class", "card-title");
    			add_location(h5, file$1, 196, 24, 5611);
    			attr_dev(p, "class", "card-text");
    			add_location(p, file$1, 197, 24, 5684);
    			attr_dev(div0, "class", "card-body");
    			add_location(div0, file$1, 195, 20, 5562);
    			attr_dev(div1, "class", "card");
    			add_location(div1, file$1, 194, 16, 5522);
    			attr_dev(div2, "class", "col-sm-4");
    			add_location(div2, file$1, 193, 12, 5482);
    			attr_dev(div3, "class", "row");
    			add_location(div3, file$1, 192, 8, 5451);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h5);
    			append_dev(div0, t1);
    			append_dev(div0, p);
    		},
    		p: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(192:4) {#if product.userId === null}",
    		ctx
    	});

    	return block;
    }

    // (206:16) {#if product.userId == user.id}
    function create_if_block_12(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let h5;
    	let t0_value = /*user*/ ctx[17].username + "";
    	let t0;
    	let t1;
    	let p0;
    	let t2;
    	let t3_value = /*user*/ ctx[17].name + "";
    	let t3;
    	let t4;
    	let p1;
    	let t5;
    	let t6_value = /*user*/ ctx[17].email + "";
    	let t6;
    	let t7;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h5 = element("h5");
    			t0 = text(t0_value);
    			t1 = space();
    			p0 = element("p");
    			t2 = text("Name: ");
    			t3 = text(t3_value);
    			t4 = space();
    			p1 = element("p");
    			t5 = text("Email: ");
    			t6 = text(t6_value);
    			t7 = space();
    			attr_dev(h5, "class", "card-title");
    			add_location(h5, file$1, 209, 32, 6097);
    			attr_dev(p0, "class", "card-text");
    			add_location(p0, file$1, 212, 32, 6246);
    			add_location(p1, file$1, 215, 32, 6394);
    			attr_dev(div0, "class", "card-body");
    			add_location(div0, file$1, 208, 28, 6040);
    			attr_dev(div1, "class", "card");
    			add_location(div1, file$1, 207, 24, 5992);
    			attr_dev(div2, "class", "col-sm-4");
    			add_location(div2, file$1, 206, 20, 5944);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h5);
    			append_dev(h5, t0);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(p0, t2);
    			append_dev(p0, t3);
    			append_dev(div0, t4);
    			append_dev(div0, p1);
    			append_dev(p1, t5);
    			append_dev(p1, t6);
    			append_dev(div2, t7);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*allUsers*/ 2 && t0_value !== (t0_value = /*user*/ ctx[17].username + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*allUsers*/ 2 && t3_value !== (t3_value = /*user*/ ctx[17].name + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*allUsers*/ 2 && t6_value !== (t6_value = /*user*/ ctx[17].email + "")) set_data_dev(t6, t6_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(206:16) {#if product.userId == user.id}",
    		ctx
    	});

    	return block;
    }

    // (205:12) {#each allUsers as user}
    function create_each_block_1(ctx) {
    	let if_block_anchor;
    	let if_block = /*product*/ ctx[2].userId == /*user*/ ctx[17].id && create_if_block_12(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*product*/ ctx[2].userId == /*user*/ ctx[17].id) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_12(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(205:12) {#each allUsers as user}",
    		ctx
    	});

    	return block;
    }

    // (228:4) {#if $user.user_roles.includes("admin")}
    function create_if_block_8(ctx) {
    	let if_block_anchor;
    	let if_block = /*product*/ ctx[2].userId === null && create_if_block_9(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*product*/ ctx[2].userId === null) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_9(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(228:4) {#if $user.user_roles.includes(\\\"admin\\\")}",
    		ctx
    	});

    	return block;
    }

    // (229:4) {#if product.userId === null}
    function create_if_block_9(ctx) {
    	let h3;
    	let t1;
    	let label;
    	let t3;
    	let div0;
    	let select;
    	let t4;
    	let div1;
    	let t5;
    	let button;
    	let mounted;
    	let dispose;
    	let each_value = /*allUsers*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Assign User";
    			t1 = space();
    			label = element("label");
    			label.textContent = "Add a User to this Product";
    			t3 = space();
    			div0 = element("div");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			div1 = element("div");
    			t5 = space();
    			button = element("button");
    			button.textContent = "Assign";
    			add_location(h3, file$1, 229, 8, 6782);
    			attr_dev(label, "for", "member");
    			add_location(label, file$1, 230, 8, 6812);
    			attr_dev(select, "class", "form-select");
    			attr_dev(select, "id", "user");
    			if (/*user_id*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[10].call(select));
    			add_location(select, file$1, 232, 12, 6912);
    			attr_dev(div0, "class", "col-md-4");
    			add_location(div0, file$1, 231, 8, 6876);
    			attr_dev(div1, "class", "col-md-8");
    			add_location(div1, file$1, 240, 8, 7273);
    			attr_dev(button, "class", "my-button");
    			add_location(button, file$1, 241, 8, 7307);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, label, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*user_id*/ ctx[0]);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[10]),
    					listen_dev(button, "click", /*productassignment*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*allUsers*/ 2) {
    				each_value = /*allUsers*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*user_id, allUsers*/ 3) {
    				select_option(select, /*user_id*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(label);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(229:4) {#if product.userId === null}",
    		ctx
    	});

    	return block;
    }

    // (235:20) {#if user.userType !== "BUYER" && user.userStatus === "ACTIVE"}
    function create_if_block_10(ctx) {
    	let option;
    	let t_value = /*user*/ ctx[17].username + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*user*/ ctx[17].id;
    			option.value = option.__value;
    			add_location(option, file$1, 235, 24, 7124);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*allUsers*/ 2 && t_value !== (t_value = /*user*/ ctx[17].username + "")) set_data_dev(t, t_value);

    			if (dirty & /*allUsers*/ 2 && option_value_value !== (option_value_value = /*user*/ ctx[17].id)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(235:20) {#if user.userType !== \\\"BUYER\\\" && user.userStatus === \\\"ACTIVE\\\"}",
    		ctx
    	});

    	return block;
    }

    // (234:16) {#each allUsers as user}
    function create_each_block(ctx) {
    	let if_block_anchor;
    	let if_block = /*user*/ ctx[17].userType !== "BUYER" && /*user*/ ctx[17].userStatus === "ACTIVE" && create_if_block_10(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*user*/ ctx[17].userType !== "BUYER" && /*user*/ ctx[17].userStatus === "ACTIVE") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_10(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(234:16) {#each allUsers as user}",
    		ctx
    	});

    	return block;
    }

    // (250:4) {#if $user.user_roles.includes("admin")}
    function create_if_block_6(ctx) {
    	let if_block_anchor;
    	let if_block = /*product*/ ctx[2].productState === "ACTIVE" && create_if_block_7(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*product*/ ctx[2].productState === "ACTIVE") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_7(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(250:4) {#if $user.user_roles.includes(\\\"admin\\\")}",
    		ctx
    	});

    	return block;
    }

    // (251:4) {#if product.productState === "ACTIVE"}
    function create_if_block_7(ctx) {
    	let form;
    	let div1;
    	let div0;
    	let label;
    	let t1;
    	let textarea;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			div1 = element("div");
    			div0 = element("div");
    			label = element("label");
    			label.textContent = "Comment for Inactivation of Product";
    			t1 = space();
    			textarea = element("textarea");
    			attr_dev(label, "for", "comment");
    			add_location(label, file$1, 254, 20, 7680);
    			attr_dev(textarea, "class", "form-control");
    			attr_dev(textarea, "id", "comment");
    			attr_dev(textarea, "rows", "3");
    			add_location(textarea, file$1, 257, 20, 7814);
    			attr_dev(div0, "class", "col");
    			add_location(div0, file$1, 253, 16, 7641);
    			attr_dev(div1, "class", "row mb-3");
    			add_location(div1, file$1, 252, 12, 7601);
    			add_location(form, file$1, 251, 8, 7581);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div1);
    			append_dev(div1, div0);
    			append_dev(div0, label);
    			append_dev(div0, t1);
    			append_dev(div0, textarea);
    			set_input_value(textarea, /*product*/ ctx[2].comment);

    			if (!mounted) {
    				dispose = listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[11]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*product*/ 4) {
    				set_input_value(textarea, /*product*/ ctx[2].comment);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(251:4) {#if product.productState === \\\"ACTIVE\\\"}",
    		ctx
    	});

    	return block;
    }

    // (269:4) {#if product.productState === "INACTIVE"}
    function create_if_block_5(ctx) {
    	let div;
    	let ul;
    	let li0;
    	let t1;
    	let li1;
    	let t2_value = /*product*/ ctx[2].comment + "";
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "Reason for Inactivation:";
    			t1 = space();
    			li1 = element("li");
    			t2 = text(t2_value);
    			attr_dev(li0, "class", "list-group-item-top active");
    			attr_dev(li0, "aria-current", "true");
    			add_location(li0, file$1, 271, 16, 8232);
    			attr_dev(li1, "class", "list-group-item");
    			add_location(li1, file$1, 274, 16, 8378);
    			attr_dev(ul, "class", "list-group");
    			add_location(ul, file$1, 270, 12, 8191);
    			attr_dev(div, "class", "col-md-4");
    			add_location(div, file$1, 269, 8, 8155);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);
    			append_dev(ul, li0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*product*/ 4 && t2_value !== (t2_value = /*product*/ ctx[2].comment + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(269:4) {#if product.productState === \\\"INACTIVE\\\"}",
    		ctx
    	});

    	return block;
    }

    // (284:4) {#if $user.user_roles.includes("admin")}
    function create_if_block$1(ctx) {
    	let a;
    	let t1;
    	let if_block_anchor;
    	let mounted;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (/*product*/ ctx[2].productState === "NEW") return create_if_block_1$1;
    		if (/*product*/ ctx[2].productState === "REVIEW") return create_if_block_2$1;
    		if (/*product*/ ctx[2].productState === "ACTIVE") return create_if_block_3$1;
    		if (/*product*/ ctx[2].productState === "INACTIVE") return create_if_block_4;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "Delete Product";
    			t1 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(a, "href", "#/products");
    			attr_dev(a, "class", "delete-button");
    			add_location(a, file$1, 284, 8, 8604);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*deleteProduct*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t1);

    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(284:4) {#if $user.user_roles.includes(\\\"admin\\\")}",
    		ctx
    	});

    	return block;
    }

    // (300:54) 
    function create_if_block_4(ctx) {
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "Activate Product";
    			attr_dev(a, "href", "#/products");
    			attr_dev(a, "class", "my-button");
    			add_location(a, file$1, 300, 12, 9336);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*productActivation*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(300:54) ",
    		ctx
    	});

    	return block;
    }

    // (296:52) 
    function create_if_block_3$1(ctx) {
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "Inactivate Product";
    			attr_dev(a, "href", "#/products");
    			attr_dev(a, "class", "my-button");
    			add_location(a, file$1, 296, 12, 9144);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*productCompletion*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(296:52) ",
    		ctx
    	});

    	return block;
    }

    // (292:52) 
    function create_if_block_2$1(ctx) {
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "Activate Product";
    			attr_dev(a, "href", "#/products");
    			attr_dev(a, "class", "my-button");
    			add_location(a, file$1, 292, 12, 8956);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*productActivation*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(292:52) ",
    		ctx
    	});

    	return block;
    }

    // (288:8) {#if product.productState === "NEW"}
    function create_if_block_1$1(ctx) {
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			a.textContent = "Review Product";
    			attr_dev(a, "href", "#/products");
    			attr_dev(a, "class", "my-button");
    			add_location(a, file$1, 288, 12, 8774);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*productReview*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(288:8) {#if product.productState === \\\"NEW\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let h1;
    	let t0;
    	let t1_value = /*product*/ ctx[2].productname + "";
    	let t1;
    	let t2;
    	let p;
    	let t3;
    	let t4_value = /*product*/ ctx[2].id + "";
    	let t4;
    	let t5;
    	let h30;
    	let t6;
    	let t7_value = /*product*/ ctx[2].productType + "";
    	let t7;
    	let t8;
    	let div0;
    	let t9;
    	let div7;
    	let div1;
    	let ul;
    	let li0;
    	let t11;
    	let li1;
    	let t12_value = /*product*/ ctx[2].description + "";
    	let t12;
    	let t13;
    	let div2;
    	let t14;
    	let h31;
    	let t16;
    	let t17;
    	let div3;
    	let t18;
    	let show_if_2 = /*$user*/ ctx[3].user_roles.includes("admin");
    	let t19;
    	let div4;
    	let t20;
    	let h32;
    	let t21;
    	let t22_value = /*product*/ ctx[2].productState + "";
    	let t22;
    	let t23;
    	let show_if_1 = /*$user*/ ctx[3].user_roles.includes("admin");
    	let t24;
    	let t25;
    	let div5;
    	let t26;
    	let show_if = /*$user*/ ctx[3].user_roles.includes("admin");
    	let t27;
    	let a;
    	let t29;
    	let div6;

    	function select_block_type(ctx, dirty) {
    		if (/*product*/ ctx[2].userId === null) return create_if_block_11;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = show_if_2 && create_if_block_8(ctx);
    	let if_block2 = show_if_1 && create_if_block_6(ctx);
    	let if_block3 = /*product*/ ctx[2].productState === "INACTIVE" && create_if_block_5(ctx);
    	let if_block4 = show_if && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text("Product ");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text("ID: ");
    			t4 = text(t4_value);
    			t5 = space();
    			h30 = element("h3");
    			t6 = text("Product Type: ");
    			t7 = text(t7_value);
    			t8 = space();
    			div0 = element("div");
    			t9 = space();
    			div7 = element("div");
    			div1 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "Description:";
    			t11 = space();
    			li1 = element("li");
    			t12 = text(t12_value);
    			t13 = space();
    			div2 = element("div");
    			t14 = space();
    			h31 = element("h3");
    			h31.textContent = "Creator:";
    			t16 = space();
    			if_block0.c();
    			t17 = space();
    			div3 = element("div");
    			t18 = space();
    			if (if_block1) if_block1.c();
    			t19 = space();
    			div4 = element("div");
    			t20 = space();
    			h32 = element("h3");
    			t21 = text("Status: ");
    			t22 = text(t22_value);
    			t23 = space();
    			if (if_block2) if_block2.c();
    			t24 = space();
    			if (if_block3) if_block3.c();
    			t25 = space();
    			div5 = element("div");
    			t26 = space();
    			if (if_block4) if_block4.c();
    			t27 = space();
    			a = element("a");
    			a.textContent = "Back";
    			t29 = space();
    			div6 = element("div");
    			attr_dev(h1, "class", "md-3");
    			add_location(h1, file$1, 171, 0, 4868);
    			add_location(p, file$1, 172, 0, 4921);
    			add_location(h30, file$1, 173, 0, 4946);
    			attr_dev(div0, "class", "col-md-8");
    			add_location(div0, file$1, 174, 0, 4992);
    			attr_dev(li0, "class", "list-group-item-top active");
    			attr_dev(li0, "aria-current", "true");
    			add_location(li0, file$1, 178, 12, 5112);
    			attr_dev(li1, "class", "list-group-item");
    			add_location(li1, file$1, 181, 12, 5234);
    			attr_dev(ul, "class", "list-group");
    			add_location(ul, file$1, 177, 8, 5075);
    			attr_dev(div1, "class", "col-md-4");
    			add_location(div1, file$1, 176, 4, 5043);
    			attr_dev(div2, "class", "col-md-8");
    			add_location(div2, file$1, 187, 4, 5355);
    			add_location(h31, file$1, 189, 4, 5387);
    			attr_dev(div3, "class", "col-md-8");
    			add_location(div3, file$1, 226, 4, 6667);
    			attr_dev(div4, "class", "col-md-8");
    			add_location(div4, file$1, 245, 4, 7407);
    			add_location(h32, file$1, 247, 4, 7439);
    			attr_dev(div5, "class", "col-md-8");
    			add_location(div5, file$1, 281, 4, 8522);
    			attr_dev(a, "class", "back-button");
    			attr_dev(a, "href", "#/products");
    			attr_dev(a, "role", "button");
    			attr_dev(a, "aria-pressed", "true");
    			add_location(a, file$1, 305, 4, 9488);
    			attr_dev(div6, "class", "md-12");
    			add_location(div6, file$1, 308, 4, 9593);
    			attr_dev(div7, "class", "md-12");
    			add_location(div7, file$1, 175, 0, 5018);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			append_dev(h1, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t3);
    			append_dev(p, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, h30, anchor);
    			append_dev(h30, t6);
    			append_dev(h30, t7);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div1);
    			append_dev(div1, ul);
    			append_dev(ul, li0);
    			append_dev(ul, t11);
    			append_dev(ul, li1);
    			append_dev(li1, t12);
    			append_dev(div7, t13);
    			append_dev(div7, div2);
    			append_dev(div7, t14);
    			append_dev(div7, h31);
    			append_dev(div7, t16);
    			if_block0.m(div7, null);
    			append_dev(div7, t17);
    			append_dev(div7, div3);
    			append_dev(div7, t18);
    			if (if_block1) if_block1.m(div7, null);
    			append_dev(div7, t19);
    			append_dev(div7, div4);
    			append_dev(div7, t20);
    			append_dev(div7, h32);
    			append_dev(h32, t21);
    			append_dev(h32, t22);
    			append_dev(div7, t23);
    			if (if_block2) if_block2.m(div7, null);
    			append_dev(div7, t24);
    			if (if_block3) if_block3.m(div7, null);
    			append_dev(div7, t25);
    			append_dev(div7, div5);
    			append_dev(div7, t26);
    			if (if_block4) if_block4.m(div7, null);
    			append_dev(div7, t27);
    			append_dev(div7, a);
    			append_dev(div7, t29);
    			append_dev(div7, div6);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*product*/ 4 && t1_value !== (t1_value = /*product*/ ctx[2].productname + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*product*/ 4 && t4_value !== (t4_value = /*product*/ ctx[2].id + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*product*/ 4 && t7_value !== (t7_value = /*product*/ ctx[2].productType + "")) set_data_dev(t7, t7_value);
    			if (dirty & /*product*/ 4 && t12_value !== (t12_value = /*product*/ ctx[2].description + "")) set_data_dev(t12, t12_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div7, t17);
    				}
    			}

    			if (dirty & /*$user*/ 8) show_if_2 = /*$user*/ ctx[3].user_roles.includes("admin");

    			if (show_if_2) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_8(ctx);
    					if_block1.c();
    					if_block1.m(div7, t19);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*product*/ 4 && t22_value !== (t22_value = /*product*/ ctx[2].productState + "")) set_data_dev(t22, t22_value);
    			if (dirty & /*$user*/ 8) show_if_1 = /*$user*/ ctx[3].user_roles.includes("admin");

    			if (show_if_1) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_6(ctx);
    					if_block2.c();
    					if_block2.m(div7, t24);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*product*/ ctx[2].productState === "INACTIVE") {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_5(ctx);
    					if_block3.c();
    					if_block3.m(div7, t25);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (dirty & /*$user*/ 8) show_if = /*$user*/ ctx[3].user_roles.includes("admin");

    			if (show_if) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block$1(ctx);
    					if_block4.c();
    					if_block4.m(div7, t27);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(h30);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div7);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
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
    	let $jwt_token;
    	let $user;
    	validate_store(jwt_token, 'jwt_token');
    	component_subscribe($$self, jwt_token, $$value => $$invalidate(13, $jwt_token = $$value));
    	validate_store(user, 'user');
    	component_subscribe($$self, user, $$value => $$invalidate(3, $user = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ProductDetails', slots, []);
    	let { params = {} } = $$props;
    	let product_id;
    	let user_id;
    	let allUsers = [];

    	let product = {
    		productname: null,
    		description: null,
    		productType: null,
    		difficultyType: null,
    		clothingType: null,
    		size: null,
    		price: null,
    		patchart: null,
    		userId: null,
    		comment: null
    	};

    	let productId = { productId: product.id };

    	function getProduct() {
    		var config = {
    			method: "get",
    			url: api_root + "/api/products/" + product_id,
    			headers: {}
    		};

    		axios(config).then(function (response) {
    			$$invalidate(2, product = response.data);
    		}).catch(function (error) {
    			alert("Could not get product");
    			console.log(error);
    		});
    	}

    	function getUsers() {
    		var config = {
    			method: "get",
    			url: api_root + "/api/users?pagesize=30",
    			headers: { Authorization: "Bearer " + $jwt_token }
    		};

    		axios(config).then(function (response) {
    			$$invalidate(1, allUsers = response.data.content);
    			console.log(allUsers.length);
    			console.log(allUsers);
    		}).catch(function (error) {
    			alert("Could not get users");
    			console.log(error);
    		});
    	}

    	function deleteProduct() {
    		var config = {
    			method: "delete",
    			url: api_root + "/api/products/" + product_id,
    			headers: { Authorization: "Bearer " + $jwt_token }
    		};

    		axios(config).then(function (response) {
    			alert("Product " + product.productname + " deleted");
    		}).catch(function (error) {
    			alert(error);
    			console.log(error);
    		});
    	}

    	function productassignment() {
    		var config = {
    			method: "post",
    			url: api_root + "/api/service/productassignment",
    			headers: { Authorization: "Bearer " + $jwt_token },
    			data: { productId: product.id, userId: user_id }
    		};

    		axios(config).then(function (response) {
    			alert("Product is assigned to user");
    			getProduct();
    		}).catch(function (error) {
    			alert("Could not assign Product to user");
    			console.log(error);
    		});
    	}

    	function productActivation() {
    		var config = {
    			method: "post",
    			url: api_root + "/api/service/productactivation",
    			headers: { Authorization: "Bearer " + $jwt_token },
    			data: { productId: product.id }
    		};

    		axios(config).then(function (response) {
    			alert("Product activated");
    		}).catch(function (error) {
    			alert("Could not activate Product");
    			console.log(error);
    		});
    	}

    	function productReview() {
    		var config = {
    			method: "post",
    			url: api_root + "/api/service/productreview",
    			headers: { Authorization: "Bearer " + $jwt_token },
    			data: { productId: product.id }
    		};

    		axios(config).then(function (response) {
    			alert("Product reviewed");
    		}).catch(function (error) {
    			alert("Could not review Product");
    			console.log(error);
    		});
    	}

    	function productCompletion() {
    		var config = {
    			method: "post",
    			url: api_root + "/api/service/productcompletion",
    			headers: { Authorization: "Bearer " + $jwt_token },
    			data: {
    				productId: product.id,
    				comment: product.comment
    			}
    		};

    		axios(config).then(function (response) {
    			alert("Product inactivated");
    		}).catch(function (error) {
    			alert("Could not inactivate Product");
    			console.log(error);
    		});
    	}

    	const writable_props = ['params'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<ProductDetails> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		user_id = select_value(this);
    		$$invalidate(0, user_id);
    		$$invalidate(1, allUsers);
    	}

    	function textarea_input_handler() {
    		product.comment = this.value;
    		$$invalidate(2, product);
    	}

    	$$self.$$set = $$props => {
    		if ('params' in $$props) $$invalidate(9, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		axios,
    		jwt_token,
    		isAuthenticated,
    		user,
    		api_root,
    		params,
    		product_id,
    		user_id,
    		allUsers,
    		product,
    		productId,
    		getProduct,
    		getUsers,
    		deleteProduct,
    		productassignment,
    		productActivation,
    		productReview,
    		productCompletion,
    		$jwt_token,
    		$user
    	});

    	$$self.$inject_state = $$props => {
    		if ('params' in $$props) $$invalidate(9, params = $$props.params);
    		if ('product_id' in $$props) product_id = $$props.product_id;
    		if ('user_id' in $$props) $$invalidate(0, user_id = $$props.user_id);
    		if ('allUsers' in $$props) $$invalidate(1, allUsers = $$props.allUsers);
    		if ('product' in $$props) $$invalidate(2, product = $$props.product);
    		if ('productId' in $$props) productId = $$props.productId;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*params*/ 512) {
    			{
    				product_id = params.id;
    				getProduct();
    				getUsers();
    			}
    		}
    	};

    	return [
    		user_id,
    		allUsers,
    		product,
    		$user,
    		deleteProduct,
    		productassignment,
    		productActivation,
    		productReview,
    		productCompletion,
    		params,
    		select_change_handler,
    		textarea_input_handler
    	];
    }

    class ProductDetails extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { params: 9 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProductDetails",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get params() {
    		throw new Error("<ProductDetails>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<ProductDetails>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var routes = {
        '/': Home,
        '/home': Home,
        '/account': Account,
        '/products': Products,
        '/create-product': CreateProduct,
        '/products/:id': ProductDetails,


        '/users': Users,
        '/users/:id': UserDetails,
        '/utilities': Utilities,
    };

    var e=function(t,n){return e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t;}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n]);},e(t,n)};function t(t,n){if("function"!=typeof n&&null!==n)throw new TypeError("Class extends value "+String(n)+" is not a constructor or null");function r(){this.constructor=t;}e(t,n),t.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r);}var n=function(){return n=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var o in t=arguments[n])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e},n.apply(this,arguments)};function r(e,t){var n={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(r=Object.getOwnPropertySymbols(e);o<r.length;o++)t.indexOf(r[o])<0&&Object.prototype.propertyIsEnumerable.call(e,r[o])&&(n[r[o]]=e[r[o]]);}return n}function o(e,t,n,r){return new(n||(n=Promise))((function(o,i){function c(e){try{s(r.next(e));}catch(e){i(e);}}function a(e){try{s(r.throw(e));}catch(e){i(e);}}function s(e){var t;e.done?o(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t);}))).then(c,a);}s((r=r.apply(e,t||[])).next());}))}function i(e,t){var n,r,o,i,c={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:a(0),throw:a(1),return:a(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function a(i){return function(a){return function(i){if(n)throw new TypeError("Generator is already executing.");for(;c;)try{if(n=1,r&&(o=2&i[0]?r.return:i[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,i[1])).done)return o;switch(r=0,o&&(i=[2&i[0],o.value]),i[0]){case 0:case 1:o=i;break;case 4:return c.label++,{value:i[1],done:!1};case 5:c.label++,r=i[1],i=[0];continue;case 7:i=c.ops.pop(),c.trys.pop();continue;default:if(!(o=c.trys,(o=o.length>0&&o[o.length-1])||6!==i[0]&&2!==i[0])){c=0;continue}if(3===i[0]&&(!o||i[1]>o[0]&&i[1]<o[3])){c.label=i[1];break}if(6===i[0]&&c.label<o[1]){c.label=o[1],o=i;break}if(o&&c.label<o[2]){c.label=o[2],c.ops.push(i);break}o[2]&&c.ops.pop(),c.trys.pop();continue}i=t.call(e,c);}catch(e){i=[6,e],r=0;}finally{n=o=0;}if(5&i[0])throw i[1];return {value:i[0]?i[1]:void 0,done:!0}}([i,a])}}}function c(e,t){var n="function"==typeof Symbol&&e[Symbol.iterator];if(!n)return e;var r,o,i=n.call(e),c=[];try{for(;(void 0===t||t-- >0)&&!(r=i.next()).done;)c.push(r.value);}catch(e){o={error:e};}finally{try{r&&!r.done&&(n=i.return)&&n.call(i);}finally{if(o)throw o.error}}return c}function a(e,t,n){if(n||2===arguments.length)for(var r,o=0,i=t.length;o<i;o++)!r&&o in t||(r||(r=Array.prototype.slice.call(t,0,o)),r[o]=t[o]);return e.concat(r||Array.prototype.slice.call(t))}var s="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};function u(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}function l(e,t){return e(t={exports:{}},t.exports),t.exports}var f,d,h=function(e){return e&&e.Math==Math&&e},p=h("object"==typeof globalThis&&globalThis)||h("object"==typeof window&&window)||h("object"==typeof self&&self)||h("object"==typeof s&&s)||function(){return this}()||Function("return this")(),y=function(e){try{return !!e()}catch(e){return !0}},v=!y((function(){return 7!=Object.defineProperty({},1,{get:function(){return 7}})[1]})),m=!y((function(){var e=function(){}.bind();return "function"!=typeof e||e.hasOwnProperty("prototype")})),b=Function.prototype.call,g=m?b.bind(b):function(){return b.apply(b,arguments)},w={}.propertyIsEnumerable,S=Object.getOwnPropertyDescriptor,k=S&&!w.call({1:2},1)?function(e){var t=S(this,e);return !!t&&t.enumerable}:w,_={f:k},I=function(e,t){return {enumerable:!(1&e),configurable:!(2&e),writable:!(4&e),value:t}},O=Function.prototype,x=O.bind,T=O.call,C=m&&x.bind(T,T),j=m?function(e){return e&&C(e)}:function(e){return e&&function(){return T.apply(e,arguments)}},R=j({}.toString),L=j("".slice),W=function(e){return L(R(e),8,-1)},Z=Object,E=j("".split),G=y((function(){return !Z("z").propertyIsEnumerable(0)}))?function(e){return "String"==W(e)?E(e,""):Z(e)}:Z,P=function(e){return null==e},A=TypeError,X=function(e){if(P(e))throw A("Can't call method on "+e);return e},F=function(e){return G(X(e))},K=function(e){return "function"==typeof e},N="object"==typeof document&&document.all,U=void 0===N&&void 0!==N?function(e){return "object"==typeof e?null!==e:K(e)||e===N}:function(e){return "object"==typeof e?null!==e:K(e)},H=function(e){return K(e)?e:void 0},D=function(e,t){return arguments.length<2?H(p[e]):p[e]&&p[e][t]},Y=j({}.isPrototypeOf),J=D("navigator","userAgent")||"",V=p.process,z=p.Deno,M=V&&V.versions||z&&z.version,B=M&&M.v8;B&&(d=(f=B.split("."))[0]>0&&f[0]<4?1:+(f[0]+f[1])),!d&&J&&(!(f=J.match(/Edge\/(\d+)/))||f[1]>=74)&&(f=J.match(/Chrome\/(\d+)/))&&(d=+f[1]);var Q=d,q=!!Object.getOwnPropertySymbols&&!y((function(){var e=Symbol();return !String(e)||!(Object(e)instanceof Symbol)||!Symbol.sham&&Q&&Q<41})),$=q&&!Symbol.sham&&"symbol"==typeof Symbol.iterator,ee=Object,te=$?function(e){return "symbol"==typeof e}:function(e){var t=D("Symbol");return K(t)&&Y(t.prototype,ee(e))},ne=String,re=function(e){try{return ne(e)}catch(e){return "Object"}},oe=TypeError,ie=function(e){if(K(e))return e;throw oe(re(e)+" is not a function")},ce=function(e,t){var n=e[t];return P(n)?void 0:ie(n)},ae=TypeError,se=Object.defineProperty,ue=function(e,t){try{se(p,e,{value:t,configurable:!0,writable:!0});}catch(n){p[e]=t;}return t},le=p["__core-js_shared__"]||ue("__core-js_shared__",{}),fe=l((function(e){(e.exports=function(e,t){return le[e]||(le[e]=void 0!==t?t:{})})("versions",[]).push({version:"3.25.1",mode:"global",copyright:"© 2014-2022 Denis Pushkarev (zloirock.ru)",license:"https://github.com/zloirock/core-js/blob/v3.25.1/LICENSE",source:"https://github.com/zloirock/core-js"});})),de=Object,he=function(e){return de(X(e))},pe=j({}.hasOwnProperty),ye=Object.hasOwn||function(e,t){return pe(he(e),t)},ve=0,me=Math.random(),be=j(1..toString),ge=function(e){return "Symbol("+(void 0===e?"":e)+")_"+be(++ve+me,36)},we=fe("wks"),Se=p.Symbol,ke=Se&&Se.for,_e=$?Se:Se&&Se.withoutSetter||ge,Ie=function(e){if(!ye(we,e)||!q&&"string"!=typeof we[e]){var t="Symbol."+e;q&&ye(Se,e)?we[e]=Se[e]:we[e]=$&&ke?ke(t):_e(t);}return we[e]},Oe=TypeError,xe=Ie("toPrimitive"),Te=function(e,t){if(!U(e)||te(e))return e;var n,r=ce(e,xe);if(r){if(void 0===t&&(t="default"),n=g(r,e,t),!U(n)||te(n))return n;throw Oe("Can't convert object to primitive value")}return void 0===t&&(t="number"),function(e,t){var n,r;if("string"===t&&K(n=e.toString)&&!U(r=g(n,e)))return r;if(K(n=e.valueOf)&&!U(r=g(n,e)))return r;if("string"!==t&&K(n=e.toString)&&!U(r=g(n,e)))return r;throw ae("Can't convert object to primitive value")}(e,t)},Ce=function(e){var t=Te(e,"string");return te(t)?t:t+""},je=p.document,Re=U(je)&&U(je.createElement),Le=function(e){return Re?je.createElement(e):{}},We=!v&&!y((function(){return 7!=Object.defineProperty(Le("div"),"a",{get:function(){return 7}}).a})),Ze=Object.getOwnPropertyDescriptor,Ee={f:v?Ze:function(e,t){if(e=F(e),t=Ce(t),We)try{return Ze(e,t)}catch(e){}if(ye(e,t))return I(!g(_.f,e,t),e[t])}},Ge=v&&y((function(){return 42!=Object.defineProperty((function(){}),"prototype",{value:42,writable:!1}).prototype})),Pe=String,Ae=TypeError,Xe=function(e){if(U(e))return e;throw Ae(Pe(e)+" is not an object")},Fe=TypeError,Ke=Object.defineProperty,Ne=Object.getOwnPropertyDescriptor,Ue={f:v?Ge?function(e,t,n){if(Xe(e),t=Ce(t),Xe(n),"function"==typeof e&&"prototype"===t&&"value"in n&&"writable"in n&&!n.writable){var r=Ne(e,t);r&&r.writable&&(e[t]=n.value,n={configurable:"configurable"in n?n.configurable:r.configurable,enumerable:"enumerable"in n?n.enumerable:r.enumerable,writable:!1});}return Ke(e,t,n)}:Ke:function(e,t,n){if(Xe(e),t=Ce(t),Xe(n),We)try{return Ke(e,t,n)}catch(e){}if("get"in n||"set"in n)throw Fe("Accessors not supported");return "value"in n&&(e[t]=n.value),e}},He=v?function(e,t,n){return Ue.f(e,t,I(1,n))}:function(e,t,n){return e[t]=n,e},De=Function.prototype,Ye=v&&Object.getOwnPropertyDescriptor,Je=ye(De,"name"),Ve={EXISTS:Je,PROPER:Je&&"something"===function(){}.name,CONFIGURABLE:Je&&(!v||v&&Ye(De,"name").configurable)},ze=j(Function.toString);K(le.inspectSource)||(le.inspectSource=function(e){return ze(e)});var Me,Be,Qe,qe=le.inspectSource,$e=p.WeakMap,et=K($e)&&/native code/.test(String($e)),tt=fe("keys"),nt=function(e){return tt[e]||(tt[e]=ge(e))},rt={},ot=p.TypeError,it=p.WeakMap;if(et||le.state){var ct=le.state||(le.state=new it),at=j(ct.get),st=j(ct.has),ut=j(ct.set);Me=function(e,t){if(st(ct,e))throw ot("Object already initialized");return t.facade=e,ut(ct,e,t),t},Be=function(e){return at(ct,e)||{}},Qe=function(e){return st(ct,e)};}else {var lt=nt("state");rt[lt]=!0,Me=function(e,t){if(ye(e,lt))throw ot("Object already initialized");return t.facade=e,He(e,lt,t),t},Be=function(e){return ye(e,lt)?e[lt]:{}},Qe=function(e){return ye(e,lt)};}var ft={set:Me,get:Be,has:Qe,enforce:function(e){return Qe(e)?Be(e):Me(e,{})},getterFor:function(e){return function(t){var n;if(!U(t)||(n=Be(t)).type!==e)throw ot("Incompatible receiver, "+e+" required");return n}}},dt=l((function(e){var t=Ve.CONFIGURABLE,n=ft.enforce,r=ft.get,o=Object.defineProperty,i=v&&!y((function(){return 8!==o((function(){}),"length",{value:8}).length})),c=String(String).split("String"),a=e.exports=function(e,r,a){"Symbol("===String(r).slice(0,7)&&(r="["+String(r).replace(/^Symbol\(([^)]*)\)/,"$1")+"]"),a&&a.getter&&(r="get "+r),a&&a.setter&&(r="set "+r),(!ye(e,"name")||t&&e.name!==r)&&(v?o(e,"name",{value:r,configurable:!0}):e.name=r),i&&a&&ye(a,"arity")&&e.length!==a.arity&&o(e,"length",{value:a.arity});try{a&&ye(a,"constructor")&&a.constructor?v&&o(e,"prototype",{writable:!1}):e.prototype&&(e.prototype=void 0);}catch(e){}var s=n(e);return ye(s,"source")||(s.source=c.join("string"==typeof r?r:"")),e};Function.prototype.toString=a((function(){return K(this)&&r(this).source||qe(this)}),"toString");})),ht=function(e,t,n,r){r||(r={});var o=r.enumerable,i=void 0!==r.name?r.name:t;if(K(n)&&dt(n,i,r),r.global)o?e[t]=n:ue(t,n);else {try{r.unsafe?e[t]&&(o=!0):delete e[t];}catch(e){}o?e[t]=n:Ue.f(e,t,{value:n,enumerable:!1,configurable:!r.nonConfigurable,writable:!r.nonWritable});}return e},pt=Math.ceil,yt=Math.floor,vt=Math.trunc||function(e){var t=+e;return (t>0?yt:pt)(t)},mt=function(e){var t=+e;return t!=t||0===t?0:vt(t)},bt=Math.max,gt=Math.min,wt=function(e,t){var n=mt(e);return n<0?bt(n+t,0):gt(n,t)},St=Math.min,kt=function(e){return e>0?St(mt(e),9007199254740991):0},_t=function(e){return kt(e.length)},It=function(e){return function(t,n,r){var o,i=F(t),c=_t(i),a=wt(r,c);if(e&&n!=n){for(;c>a;)if((o=i[a++])!=o)return !0}else for(;c>a;a++)if((e||a in i)&&i[a]===n)return e||a||0;return !e&&-1}},Ot={includes:It(!0),indexOf:It(!1)},xt=Ot.indexOf,Tt=j([].push),Ct=function(e,t){var n,r=F(e),o=0,i=[];for(n in r)!ye(rt,n)&&ye(r,n)&&Tt(i,n);for(;t.length>o;)ye(r,n=t[o++])&&(~xt(i,n)||Tt(i,n));return i},jt=["constructor","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","valueOf"],Rt=jt.concat("length","prototype"),Lt={f:Object.getOwnPropertyNames||function(e){return Ct(e,Rt)}},Wt={f:Object.getOwnPropertySymbols},Zt=j([].concat),Et=D("Reflect","ownKeys")||function(e){var t=Lt.f(Xe(e)),n=Wt.f;return n?Zt(t,n(e)):t},Gt=function(e,t,n){for(var r=Et(t),o=Ue.f,i=Ee.f,c=0;c<r.length;c++){var a=r[c];ye(e,a)||n&&ye(n,a)||o(e,a,i(t,a));}},Pt=/#|\.prototype\./,At=function(e,t){var n=Ft[Xt(e)];return n==Nt||n!=Kt&&(K(t)?y(t):!!t)},Xt=At.normalize=function(e){return String(e).replace(Pt,".").toLowerCase()},Ft=At.data={},Kt=At.NATIVE="N",Nt=At.POLYFILL="P",Ut=At,Ht=Ee.f,Dt=function(e,t){var n,r,o,i,c,a=e.target,s=e.global,u=e.stat;if(n=s?p:u?p[a]||ue(a,{}):(p[a]||{}).prototype)for(r in t){if(i=t[r],o=e.dontCallGetSet?(c=Ht(n,r))&&c.value:n[r],!Ut(s?r:a+(u?".":"#")+r,e.forced)&&void 0!==o){if(typeof i==typeof o)continue;Gt(i,o);}(e.sham||o&&o.sham)&&He(i,"sham",!0),ht(n,r,i,e);}},Yt={};Yt[Ie("toStringTag")]="z";var Jt,Vt="[object z]"===String(Yt),zt=Ie("toStringTag"),Mt=Object,Bt="Arguments"==W(function(){return arguments}()),Qt=Vt?W:function(e){var t,n,r;return void 0===e?"Undefined":null===e?"Null":"string"==typeof(n=function(e,t){try{return e[t]}catch(e){}}(t=Mt(e),zt))?n:Bt?W(t):"Object"==(r=W(t))&&K(t.callee)?"Arguments":r},qt=String,$t=function(e){if("Symbol"===Qt(e))throw TypeError("Cannot convert a Symbol value to a string");return qt(e)},en=Ie("match"),tn=TypeError,nn=function(e){if(function(e){var t;return U(e)&&(void 0!==(t=e[en])?!!t:"RegExp"==W(e))}(e))throw tn("The method doesn't accept regular expressions");return e},rn=Ie("match"),on=function(e){var t=/./;try{"/./"[e](t);}catch(n){try{return t[rn]=!1,"/./"[e](t)}catch(e){}}return !1},cn=Ee.f,an=j("".startsWith),sn=j("".slice),un=Math.min,ln=on("startsWith"),fn=!(ln||(Jt=cn(String.prototype,"startsWith"),!Jt||Jt.writable));Dt({target:"String",proto:!0,forced:!fn&&!ln},{startsWith:function(e){var t=$t(X(this));nn(e);var n=kt(un(arguments.length>1?arguments[1]:void 0,t.length)),r=$t(e);return an?an(t,r,n):sn(t,n,n+r.length)===r}});var dn=function(e,t){return j(p[e].prototype[t])};dn("String","startsWith");var hn=Array.isArray||function(e){return "Array"==W(e)},pn=TypeError,yn=function(e){if(e>9007199254740991)throw pn("Maximum allowed index exceeded");return e},vn=function(e,t,n){var r=Ce(t);r in e?Ue.f(e,r,I(0,n)):e[r]=n;},mn=function(){},bn=[],gn=D("Reflect","construct"),wn=/^\s*(?:class|function)\b/,Sn=j(wn.exec),kn=!wn.exec(mn),_n=function(e){if(!K(e))return !1;try{return gn(mn,bn,e),!0}catch(e){return !1}},In=function(e){if(!K(e))return !1;switch(Qt(e)){case"AsyncFunction":case"GeneratorFunction":case"AsyncGeneratorFunction":return !1}try{return kn||!!Sn(wn,qe(e))}catch(e){return !0}};In.sham=!0;var On,xn=!gn||y((function(){var e;return _n(_n.call)||!_n(Object)||!_n((function(){e=!0;}))||e}))?In:_n,Tn=Ie("species"),Cn=Array,jn=function(e,t){return new(function(e){var t;return hn(e)&&(t=e.constructor,(xn(t)&&(t===Cn||hn(t.prototype))||U(t)&&null===(t=t[Tn]))&&(t=void 0)),void 0===t?Cn:t}(e))(0===t?0:t)},Rn=Ie("species"),Ln=Ie("isConcatSpreadable"),Wn=Q>=51||!y((function(){var e=[];return e[Ln]=!1,e.concat()[0]!==e})),Zn=(On="concat",Q>=51||!y((function(){var e=[];return (e.constructor={})[Rn]=function(){return {foo:1}},1!==e[On](Boolean).foo}))),En=function(e){if(!U(e))return !1;var t=e[Ln];return void 0!==t?!!t:hn(e)};Dt({target:"Array",proto:!0,arity:1,forced:!Wn||!Zn},{concat:function(e){var t,n,r,o,i,c=he(this),a=jn(c,0),s=0;for(t=-1,r=arguments.length;t<r;t++)if(En(i=-1===t?c:arguments[t]))for(o=_t(i),yn(s+o),n=0;n<o;n++,s++)n in i&&vn(a,s,i[n]);else yn(s+1),vn(a,s++,i);return a.length=s,a}});var Gn=Vt?{}.toString:function(){return "[object "+Qt(this)+"]"};Vt||ht(Object.prototype,"toString",Gn,{unsafe:!0});var Pn,An=Object.keys||function(e){return Ct(e,jt)},Xn=v&&!Ge?Object.defineProperties:function(e,t){Xe(e);for(var n,r=F(t),o=An(t),i=o.length,c=0;i>c;)Ue.f(e,n=o[c++],r[n]);return e},Fn={f:Xn},Kn=D("document","documentElement"),Nn=nt("IE_PROTO"),Un=function(){},Hn=function(e){return "<script>"+e+"<\/script>"},Dn=function(e){e.write(Hn("")),e.close();var t=e.parentWindow.Object;return e=null,t},Yn=function(){try{Pn=new ActiveXObject("htmlfile");}catch(e){}var e,t;Yn="undefined"!=typeof document?document.domain&&Pn?Dn(Pn):((t=Le("iframe")).style.display="none",Kn.appendChild(t),t.src=String("javascript:"),(e=t.contentWindow.document).open(),e.write(Hn("document.F=Object")),e.close(),e.F):Dn(Pn);for(var n=jt.length;n--;)delete Yn.prototype[jt[n]];return Yn()};rt[Nn]=!0;var Jn=Object.create||function(e,t){var n;return null!==e?(Un.prototype=Xe(e),n=new Un,Un.prototype=null,n[Nn]=e):n=Yn(),void 0===t?n:Fn.f(n,t)},Vn=Array,zn=Math.max,Mn=Lt.f,Bn="object"==typeof window&&window&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[],Qn=function(e){try{return Mn(e)}catch(e){return function(e,t,n){for(var r=_t(e),o=wt(t,r),i=wt(void 0===n?r:n,r),c=Vn(zn(i-o,0)),a=0;o<i;o++,a++)vn(c,a,e[o]);return c.length=a,c}(Bn)}},qn={f:function(e){return Bn&&"Window"==W(e)?Qn(e):Mn(F(e))}},$n={f:Ie},er=p,tr=Ue.f,nr=function(e){var t=er.Symbol||(er.Symbol={});ye(t,e)||tr(t,e,{value:$n.f(e)});},rr=function(){var e=D("Symbol"),t=e&&e.prototype,n=t&&t.valueOf,r=Ie("toPrimitive");t&&!t[r]&&ht(t,r,(function(e){return g(n,this)}),{arity:1});},or=Ue.f,ir=Ie("toStringTag"),cr=function(e,t,n){e&&!n&&(e=e.prototype),e&&!ye(e,ir)&&or(e,ir,{configurable:!0,value:t});},ar=j(j.bind),sr=function(e,t){return ie(e),void 0===t?e:m?ar(e,t):function(){return e.apply(t,arguments)}},ur=j([].push),lr=function(e){var t=1==e,n=2==e,r=3==e,o=4==e,i=6==e,c=7==e,a=5==e||i;return function(s,u,l,f){for(var d,h,p=he(s),y=G(p),v=sr(u,l),m=_t(y),b=0,g=f||jn,w=t?g(s,m):n||c?g(s,0):void 0;m>b;b++)if((a||b in y)&&(h=v(d=y[b],b,p),e))if(t)w[b]=h;else if(h)switch(e){case 3:return !0;case 5:return d;case 6:return b;case 2:ur(w,d);}else switch(e){case 4:return !1;case 7:ur(w,d);}return i?-1:r||o?o:w}},fr={forEach:lr(0),map:lr(1),filter:lr(2),some:lr(3),every:lr(4),find:lr(5),findIndex:lr(6),filterReject:lr(7)}.forEach,dr=nt("hidden"),hr=ft.set,pr=ft.getterFor("Symbol"),yr=Object.prototype,vr=p.Symbol,mr=vr&&vr.prototype,br=p.TypeError,gr=p.QObject,wr=Ee.f,Sr=Ue.f,kr=qn.f,_r=_.f,Ir=j([].push),Or=fe("symbols"),xr=fe("op-symbols"),Tr=fe("wks"),Cr=!gr||!gr.prototype||!gr.prototype.findChild,jr=v&&y((function(){return 7!=Jn(Sr({},"a",{get:function(){return Sr(this,"a",{value:7}).a}})).a}))?function(e,t,n){var r=wr(yr,t);r&&delete yr[t],Sr(e,t,n),r&&e!==yr&&Sr(yr,t,r);}:Sr,Rr=function(e,t){var n=Or[e]=Jn(mr);return hr(n,{type:"Symbol",tag:e,description:t}),v||(n.description=t),n},Lr=function(e,t,n){e===yr&&Lr(xr,t,n),Xe(e);var r=Ce(t);return Xe(n),ye(Or,r)?(n.enumerable?(ye(e,dr)&&e[dr][r]&&(e[dr][r]=!1),n=Jn(n,{enumerable:I(0,!1)})):(ye(e,dr)||Sr(e,dr,I(1,{})),e[dr][r]=!0),jr(e,r,n)):Sr(e,r,n)},Wr=function(e,t){Xe(e);var n=F(t),r=An(n).concat(Pr(n));return fr(r,(function(t){v&&!g(Zr,n,t)||Lr(e,t,n[t]);})),e},Zr=function(e){var t=Ce(e),n=g(_r,this,t);return !(this===yr&&ye(Or,t)&&!ye(xr,t))&&(!(n||!ye(this,t)||!ye(Or,t)||ye(this,dr)&&this[dr][t])||n)},Er=function(e,t){var n=F(e),r=Ce(t);if(n!==yr||!ye(Or,r)||ye(xr,r)){var o=wr(n,r);return !o||!ye(Or,r)||ye(n,dr)&&n[dr][r]||(o.enumerable=!0),o}},Gr=function(e){var t=kr(F(e)),n=[];return fr(t,(function(e){ye(Or,e)||ye(rt,e)||Ir(n,e);})),n},Pr=function(e){var t=e===yr,n=kr(t?xr:F(e)),r=[];return fr(n,(function(e){!ye(Or,e)||t&&!ye(yr,e)||Ir(r,Or[e]);})),r};q||(mr=(vr=function(){if(Y(mr,this))throw br("Symbol is not a constructor");var e=arguments.length&&void 0!==arguments[0]?$t(arguments[0]):void 0,t=ge(e),n=function(e){this===yr&&g(n,xr,e),ye(this,dr)&&ye(this[dr],t)&&(this[dr][t]=!1),jr(this,t,I(1,e));};return v&&Cr&&jr(yr,t,{configurable:!0,set:n}),Rr(t,e)}).prototype,ht(mr,"toString",(function(){return pr(this).tag})),ht(vr,"withoutSetter",(function(e){return Rr(ge(e),e)})),_.f=Zr,Ue.f=Lr,Fn.f=Wr,Ee.f=Er,Lt.f=qn.f=Gr,Wt.f=Pr,$n.f=function(e){return Rr(Ie(e),e)},v&&(Sr(mr,"description",{configurable:!0,get:function(){return pr(this).description}}),ht(yr,"propertyIsEnumerable",Zr,{unsafe:!0}))),Dt({global:!0,constructor:!0,wrap:!0,forced:!q,sham:!q},{Symbol:vr}),fr(An(Tr),(function(e){nr(e);})),Dt({target:"Symbol",stat:!0,forced:!q},{useSetter:function(){Cr=!0;},useSimple:function(){Cr=!1;}}),Dt({target:"Object",stat:!0,forced:!q,sham:!v},{create:function(e,t){return void 0===t?Jn(e):Wr(Jn(e),t)},defineProperty:Lr,defineProperties:Wr,getOwnPropertyDescriptor:Er}),Dt({target:"Object",stat:!0,forced:!q},{getOwnPropertyNames:Gr}),rr(),cr(vr,"Symbol"),rt[dr]=!0;var Ar=q&&!!Symbol.for&&!!Symbol.keyFor,Xr=fe("string-to-symbol-registry"),Fr=fe("symbol-to-string-registry");Dt({target:"Symbol",stat:!0,forced:!Ar},{for:function(e){var t=$t(e);if(ye(Xr,t))return Xr[t];var n=D("Symbol")(t);return Xr[t]=n,Fr[n]=t,n}});var Kr=fe("symbol-to-string-registry");Dt({target:"Symbol",stat:!0,forced:!Ar},{keyFor:function(e){if(!te(e))throw TypeError(re(e)+" is not a symbol");if(ye(Kr,e))return Kr[e]}});var Nr=Function.prototype,Ur=Nr.apply,Hr=Nr.call,Dr="object"==typeof Reflect&&Reflect.apply||(m?Hr.bind(Ur):function(){return Hr.apply(Ur,arguments)}),Yr=j([].slice),Jr=D("JSON","stringify"),Vr=j(/./.exec),zr=j("".charAt),Mr=j("".charCodeAt),Br=j("".replace),Qr=j(1..toString),qr=/[\uD800-\uDFFF]/g,$r=/^[\uD800-\uDBFF]$/,eo=/^[\uDC00-\uDFFF]$/,to=!q||y((function(){var e=D("Symbol")();return "[null]"!=Jr([e])||"{}"!=Jr({a:e})||"{}"!=Jr(Object(e))})),no=y((function(){return '"\\udf06\\ud834"'!==Jr("\udf06\ud834")||'"\\udead"'!==Jr("\udead")})),ro=function(e,t){var n=Yr(arguments),r=t;if((U(t)||void 0!==e)&&!te(e))return hn(t)||(t=function(e,t){if(K(r)&&(t=g(r,this,e,t)),!te(t))return t}),n[1]=t,Dr(Jr,null,n)},oo=function(e,t,n){var r=zr(n,t-1),o=zr(n,t+1);return Vr($r,e)&&!Vr(eo,o)||Vr(eo,e)&&!Vr($r,r)?"\\u"+Qr(Mr(e,0),16):e};Jr&&Dt({target:"JSON",stat:!0,arity:3,forced:to||no},{stringify:function(e,t,n){var r=Yr(arguments),o=Dr(to?ro:Jr,null,r);return no&&"string"==typeof o?Br(o,qr,oo):o}});var io=!q||y((function(){Wt.f(1);}));Dt({target:"Object",stat:!0,forced:io},{getOwnPropertySymbols:function(e){var t=Wt.f;return t?t(he(e)):[]}}),nr("asyncIterator");var co=Ue.f,ao=p.Symbol,so=ao&&ao.prototype;if(v&&K(ao)&&(!("description"in so)||void 0!==ao().description)){var uo={},lo=function(){var e=arguments.length<1||void 0===arguments[0]?void 0:$t(arguments[0]),t=Y(so,this)?new ao(e):void 0===e?ao():ao(e);return ""===e&&(uo[t]=!0),t};Gt(lo,ao),lo.prototype=so,so.constructor=lo;var fo="Symbol(test)"==String(ao("test")),ho=j(so.valueOf),po=j(so.toString),yo=/^Symbol\((.*)\)[^)]+$/,vo=j("".replace),mo=j("".slice);co(so,"description",{configurable:!0,get:function(){var e=ho(this);if(ye(uo,e))return "";var t=po(e),n=fo?mo(t,7,-1):vo(t,yo,"$1");return ""===n?void 0:n}}),Dt({global:!0,constructor:!0,forced:!0},{Symbol:lo});}nr("hasInstance"),nr("isConcatSpreadable"),nr("iterator"),nr("match"),nr("matchAll"),nr("replace"),nr("search"),nr("species"),nr("split"),nr("toPrimitive"),rr(),nr("toStringTag"),cr(D("Symbol"),"Symbol"),nr("unscopables"),cr(p.JSON,"JSON",!0),cr(Math,"Math",!0),Dt({global:!0},{Reflect:{}}),cr(p.Reflect,"Reflect",!0),er.Symbol;var bo,go,wo,So=j("".charAt),ko=j("".charCodeAt),_o=j("".slice),Io=function(e){return function(t,n){var r,o,i=$t(X(t)),c=mt(n),a=i.length;return c<0||c>=a?e?"":void 0:(r=ko(i,c))<55296||r>56319||c+1===a||(o=ko(i,c+1))<56320||o>57343?e?So(i,c):r:e?_o(i,c,c+2):o-56320+(r-55296<<10)+65536}},Oo={codeAt:Io(!1),charAt:Io(!0)},xo=!y((function(){function e(){}return e.prototype.constructor=null,Object.getPrototypeOf(new e)!==e.prototype})),To=nt("IE_PROTO"),Co=Object,jo=Co.prototype,Ro=xo?Co.getPrototypeOf:function(e){var t=he(e);if(ye(t,To))return t[To];var n=t.constructor;return K(n)&&t instanceof n?n.prototype:t instanceof Co?jo:null},Lo=Ie("iterator"),Wo=!1;[].keys&&("next"in(wo=[].keys())?(go=Ro(Ro(wo)))!==Object.prototype&&(bo=go):Wo=!0);var Zo=!U(bo)||y((function(){var e={};return bo[Lo].call(e)!==e}));Zo&&(bo={}),K(bo[Lo])||ht(bo,Lo,(function(){return this}));var Eo={IteratorPrototype:bo,BUGGY_SAFARI_ITERATORS:Wo},Go={},Po=Eo.IteratorPrototype,Ao=function(){return this},Xo=String,Fo=TypeError,Ko=Object.setPrototypeOf||("__proto__"in{}?function(){var e,t=!1,n={};try{(e=j(Object.getOwnPropertyDescriptor(Object.prototype,"__proto__").set))(n,[]),t=n instanceof Array;}catch(e){}return function(n,r){return Xe(n),function(e){if("object"==typeof e||K(e))return e;throw Fo("Can't set "+Xo(e)+" as a prototype")}(r),t?e(n,r):n.__proto__=r,n}}():void 0),No=Ve.PROPER,Uo=Ve.CONFIGURABLE,Ho=Eo.IteratorPrototype,Do=Eo.BUGGY_SAFARI_ITERATORS,Yo=Ie("iterator"),Jo=function(){return this},Vo=function(e,t,n,r,o,i,c){!function(e,t,n,r){var o=t+" Iterator";e.prototype=Jn(Po,{next:I(+!r,n)}),cr(e,o,!1),Go[o]=Ao;}(n,t,r);var a,s,u,l=function(e){if(e===o&&y)return y;if(!Do&&e in h)return h[e];switch(e){case"keys":case"values":case"entries":return function(){return new n(this,e)}}return function(){return new n(this)}},f=t+" Iterator",d=!1,h=e.prototype,p=h[Yo]||h["@@iterator"]||o&&h[o],y=!Do&&p||l(o),v="Array"==t&&h.entries||p;if(v&&(a=Ro(v.call(new e)))!==Object.prototype&&a.next&&(Ro(a)!==Ho&&(Ko?Ko(a,Ho):K(a[Yo])||ht(a,Yo,Jo)),cr(a,f,!0)),No&&"values"==o&&p&&"values"!==p.name&&(Uo?He(h,"name","values"):(d=!0,y=function(){return g(p,this)})),o)if(s={values:l("values"),keys:i?y:l("keys"),entries:l("entries")},c)for(u in s)(Do||d||!(u in h))&&ht(h,u,s[u]);else Dt({target:t,proto:!0,forced:Do||d},s);return h[Yo]!==y&&ht(h,Yo,y,{name:o}),Go[t]=y,s},zo=function(e,t){return {value:e,done:t}},Mo=Oo.charAt,Bo=ft.set,Qo=ft.getterFor("String Iterator");Vo(String,"String",(function(e){Bo(this,{type:"String Iterator",string:$t(e),index:0});}),(function(){var e,t=Qo(this),n=t.string,r=t.index;return r>=n.length?zo(void 0,!0):(e=Mo(n,r),t.index+=e.length,zo(e,!1))}));var qo=function(e,t,n){var r,o;Xe(e);try{if(!(r=ce(e,"return"))){if("throw"===t)throw n;return n}r=g(r,e);}catch(e){o=!0,r=e;}if("throw"===t)throw n;if(o)throw r;return Xe(r),n},$o=function(e,t,n,r){try{return r?t(Xe(n)[0],n[1]):t(n)}catch(t){qo(e,"throw",t);}},ei=Ie("iterator"),ti=Array.prototype,ni=function(e){return void 0!==e&&(Go.Array===e||ti[ei]===e)},ri=Ie("iterator"),oi=function(e){if(!P(e))return ce(e,ri)||ce(e,"@@iterator")||Go[Qt(e)]},ii=TypeError,ci=function(e,t){var n=arguments.length<2?oi(e):t;if(ie(n))return Xe(g(n,e));throw ii(re(e)+" is not iterable")},ai=Array,si=Ie("iterator"),ui=!1;try{var li=0,fi={next:function(){return {done:!!li++}},return:function(){ui=!0;}};fi[si]=function(){return this},Array.from(fi,(function(){throw 2}));}catch(e){}var di=function(e,t){if(!t&&!ui)return !1;var n=!1;try{var r={};r[si]=function(){return {next:function(){return {done:n=!0}}}},e(r);}catch(e){}return n},hi=!di((function(e){Array.from(e);}));Dt({target:"Array",stat:!0,forced:hi},{from:function(e){var t=he(e),n=xn(this),r=arguments.length,o=r>1?arguments[1]:void 0,i=void 0!==o;i&&(o=sr(o,r>2?arguments[2]:void 0));var c,a,s,u,l,f,d=oi(t),h=0;if(!d||this===ai&&ni(d))for(c=_t(t),a=n?new this(c):ai(c);c>h;h++)f=i?o(t[h],h):t[h],vn(a,h,f);else for(l=(u=ci(t,d)).next,a=n?new this:[];!(s=g(l,u)).done;h++)f=i?$o(u,o,[s.value,h],!0):s.value,vn(a,h,f);return a.length=h,a}}),er.Array.from;var pi,yi,vi,mi="undefined"!=typeof ArrayBuffer&&"undefined"!=typeof DataView,bi=Ue.f,gi=ft.enforce,wi=ft.get,Si=p.Int8Array,ki=Si&&Si.prototype,_i=p.Uint8ClampedArray,Ii=_i&&_i.prototype,Oi=Si&&Ro(Si),xi=ki&&Ro(ki),Ti=Object.prototype,Ci=p.TypeError,ji=Ie("toStringTag"),Ri=ge("TYPED_ARRAY_TAG"),Li=mi&&!!Ko&&"Opera"!==Qt(p.opera),Wi=!1,Zi={Int8Array:1,Uint8Array:1,Uint8ClampedArray:1,Int16Array:2,Uint16Array:2,Int32Array:4,Uint32Array:4,Float32Array:4,Float64Array:8},Ei={BigInt64Array:8,BigUint64Array:8},Gi=function(e){var t=Ro(e);if(U(t)){var n=wi(t);return n&&ye(n,"TypedArrayConstructor")?n.TypedArrayConstructor:Gi(t)}},Pi=function(e){if(!U(e))return !1;var t=Qt(e);return ye(Zi,t)||ye(Ei,t)};for(pi in Zi)(vi=(yi=p[pi])&&yi.prototype)?gi(vi).TypedArrayConstructor=yi:Li=!1;for(pi in Ei)(vi=(yi=p[pi])&&yi.prototype)&&(gi(vi).TypedArrayConstructor=yi);if((!Li||!K(Oi)||Oi===Function.prototype)&&(Oi=function(){throw Ci("Incorrect invocation")},Li))for(pi in Zi)p[pi]&&Ko(p[pi],Oi);if((!Li||!xi||xi===Ti)&&(xi=Oi.prototype,Li))for(pi in Zi)p[pi]&&Ko(p[pi].prototype,xi);if(Li&&Ro(Ii)!==xi&&Ko(Ii,xi),v&&!ye(xi,ji))for(pi in Wi=!0,bi(xi,ji,{get:function(){return U(this)?this[Ri]:void 0}}),Zi)p[pi]&&He(p[pi],Ri,pi);var Ai={NATIVE_ARRAY_BUFFER_VIEWS:Li,TYPED_ARRAY_TAG:Wi&&Ri,aTypedArray:function(e){if(Pi(e))return e;throw Ci("Target is not a typed array")},aTypedArrayConstructor:function(e){if(K(e)&&(!Ko||Y(Oi,e)))return e;throw Ci(re(e)+" is not a typed array constructor")},exportTypedArrayMethod:function(e,t,n,r){if(v){if(n)for(var o in Zi){var i=p[o];if(i&&ye(i.prototype,e))try{delete i.prototype[e];}catch(n){try{i.prototype[e]=t;}catch(e){}}}xi[e]&&!n||ht(xi,e,n?t:Li&&ki[e]||t,r);}},exportTypedArrayStaticMethod:function(e,t,n){var r,o;if(v){if(Ko){if(n)for(r in Zi)if((o=p[r])&&ye(o,e))try{delete o[e];}catch(e){}if(Oi[e]&&!n)return;try{return ht(Oi,e,n?t:Li&&Oi[e]||t)}catch(e){}}for(r in Zi)!(o=p[r])||o[e]&&!n||ht(o,e,t);}},getTypedArrayConstructor:Gi,isView:function(e){if(!U(e))return !1;var t=Qt(e);return "DataView"===t||ye(Zi,t)||ye(Ei,t)},isTypedArray:Pi,TypedArray:Oi,TypedArrayPrototype:xi},Xi=TypeError,Fi=Ie("species"),Ki=function(e,t){var n,r=Xe(e).constructor;return void 0===r||P(n=Xe(r)[Fi])?t:function(e){if(xn(e))return e;throw Xi(re(e)+" is not a constructor")}(n)},Ni=Ai.aTypedArrayConstructor,Ui=Ai.getTypedArrayConstructor,Hi=Ai.aTypedArray;(0, Ai.exportTypedArrayMethod)("slice",(function(e,t){for(var n,r=Yr(Hi(this),e,t),o=Ni(Ki(n=this,Ui(n))),i=0,c=r.length,a=new o(c);c>i;)a[i]=r[i++];return a}),y((function(){new Int8Array(1).slice();})));var Di=Ue.f,Yi=Ie("unscopables"),Ji=Array.prototype;null==Ji[Yi]&&Di(Ji,Yi,{configurable:!0,value:Jn(null)});var Vi=function(e){Ji[Yi][e]=!0;},zi=Ot.includes,Mi=y((function(){return !Array(1).includes()}));Dt({target:"Array",proto:!0,forced:Mi},{includes:function(e){return zi(this,e,arguments.length>1?arguments[1]:void 0)}}),Vi("includes"),dn("Array","includes");var Bi=j("".indexOf);Dt({target:"String",proto:!0,forced:!on("includes")},{includes:function(e){return !!~Bi($t(X(this)),$t(nn(e)),arguments.length>1?arguments[1]:void 0)}}),dn("String","includes");var Qi=Ue.f,qi=ft.set,$i=ft.getterFor("Array Iterator");Vo(Array,"Array",(function(e,t){qi(this,{type:"Array Iterator",target:F(e),index:0,kind:t});}),(function(){var e=$i(this),t=e.target,n=e.kind,r=e.index++;return !t||r>=t.length?(e.target=void 0,zo(void 0,!0)):zo("keys"==n?r:"values"==n?t[r]:[r,t[r]],!1)}),"values");var ec=Go.Arguments=Go.Array;if(Vi("keys"),Vi("values"),Vi("entries"),v&&"values"!==ec.name)try{Qi(ec,"name",{value:"values"});}catch(e){}var tc=y((function(){if("function"==typeof ArrayBuffer){var e=new ArrayBuffer(8);Object.isExtensible(e)&&Object.defineProperty(e,"a",{value:8});}})),nc=Object.isExtensible,rc=y((function(){nc(1);}))||tc?function(e){return !!U(e)&&((!tc||"ArrayBuffer"!=W(e))&&(!nc||nc(e)))}:nc,oc=!y((function(){return Object.isExtensible(Object.preventExtensions({}))})),ic=l((function(e){var t=Ue.f,n=!1,r=ge("meta"),o=0,i=function(e){t(e,r,{value:{objectID:"O"+o++,weakData:{}}});},c=e.exports={enable:function(){c.enable=function(){},n=!0;var e=Lt.f,t=j([].splice),o={};o[r]=1,e(o).length&&(Lt.f=function(n){for(var o=e(n),i=0,c=o.length;i<c;i++)if(o[i]===r){t(o,i,1);break}return o},Dt({target:"Object",stat:!0,forced:!0},{getOwnPropertyNames:qn.f}));},fastKey:function(e,t){if(!U(e))return "symbol"==typeof e?e:("string"==typeof e?"S":"P")+e;if(!ye(e,r)){if(!rc(e))return "F";if(!t)return "E";i(e);}return e[r].objectID},getWeakData:function(e,t){if(!ye(e,r)){if(!rc(e))return !0;if(!t)return !1;i(e);}return e[r].weakData},onFreeze:function(e){return oc&&n&&rc(e)&&!ye(e,r)&&i(e),e}};rt[r]=!0;}));ic.enable,ic.fastKey,ic.getWeakData,ic.onFreeze;var cc=TypeError,ac=function(e,t){this.stopped=e,this.result=t;},sc=ac.prototype,uc=function(e,t,n){var r,o,i,c,a,s,u,l=n&&n.that,f=!(!n||!n.AS_ENTRIES),d=!(!n||!n.IS_RECORD),h=!(!n||!n.IS_ITERATOR),p=!(!n||!n.INTERRUPTED),y=sr(t,l),v=function(e){return r&&qo(r,"normal",e),new ac(!0,e)},m=function(e){return f?(Xe(e),p?y(e[0],e[1],v):y(e[0],e[1])):p?y(e,v):y(e)};if(d)r=e.iterator;else if(h)r=e;else {if(!(o=oi(e)))throw cc(re(e)+" is not iterable");if(ni(o)){for(i=0,c=_t(e);c>i;i++)if((a=m(e[i]))&&Y(sc,a))return a;return new ac(!1)}r=ci(e,o);}for(s=d?e.next:r.next;!(u=g(s,r)).done;){try{a=m(u.value);}catch(e){qo(r,"throw",e);}if("object"==typeof a&&a&&Y(sc,a))return a}return new ac(!1)},lc=TypeError,fc=function(e,t){if(Y(t,e))return e;throw lc("Incorrect invocation")},dc=function(e,t,n){for(var r in t)ht(e,r,t[r],n);return e},hc=Ie("species"),pc=Ue.f,yc=ic.fastKey,vc=ft.set,mc=ft.getterFor,bc={getConstructor:function(e,t,n,r){var o=e((function(e,o){fc(e,i),vc(e,{type:t,index:Jn(null),first:void 0,last:void 0,size:0}),v||(e.size=0),P(o)||uc(o,e[r],{that:e,AS_ENTRIES:n});})),i=o.prototype,c=mc(t),a=function(e,t,n){var r,o,i=c(e),a=s(e,t);return a?a.value=n:(i.last=a={index:o=yc(t,!0),key:t,value:n,previous:r=i.last,next:void 0,removed:!1},i.first||(i.first=a),r&&(r.next=a),v?i.size++:e.size++,"F"!==o&&(i.index[o]=a)),e},s=function(e,t){var n,r=c(e),o=yc(t);if("F"!==o)return r.index[o];for(n=r.first;n;n=n.next)if(n.key==t)return n};return dc(i,{clear:function(){for(var e=c(this),t=e.index,n=e.first;n;)n.removed=!0,n.previous&&(n.previous=n.previous.next=void 0),delete t[n.index],n=n.next;e.first=e.last=void 0,v?e.size=0:this.size=0;},delete:function(e){var t=this,n=c(t),r=s(t,e);if(r){var o=r.next,i=r.previous;delete n.index[r.index],r.removed=!0,i&&(i.next=o),o&&(o.previous=i),n.first==r&&(n.first=o),n.last==r&&(n.last=i),v?n.size--:t.size--;}return !!r},forEach:function(e){for(var t,n=c(this),r=sr(e,arguments.length>1?arguments[1]:void 0);t=t?t.next:n.first;)for(r(t.value,t.key,this);t&&t.removed;)t=t.previous;},has:function(e){return !!s(this,e)}}),dc(i,n?{get:function(e){var t=s(this,e);return t&&t.value},set:function(e,t){return a(this,0===e?0:e,t)}}:{add:function(e){return a(this,e=0===e?0:e,e)}}),v&&pc(i,"size",{get:function(){return c(this).size}}),o},setStrong:function(e,t,n){var r=t+" Iterator",o=mc(t),i=mc(r);Vo(e,t,(function(e,t){vc(this,{type:r,target:e,state:o(e),kind:t,last:void 0});}),(function(){for(var e=i(this),t=e.kind,n=e.last;n&&n.removed;)n=n.previous;return e.target&&(e.last=n=n?n.next:e.state.first)?zo("keys"==t?n.key:"values"==t?n.value:[n.key,n.value],!1):(e.target=void 0,zo(void 0,!0))}),n?"entries":"values",!n,!0),function(e){var t=D(e),n=Ue.f;v&&t&&!t[hc]&&n(t,hc,{configurable:!0,get:function(){return this}});}(t);}};function gc(e){var t=this.constructor;return this.then((function(n){return t.resolve(e()).then((function(){return n}))}),(function(n){return t.resolve(e()).then((function(){return t.reject(n)}))}))}function wc(e){return new this((function(t,n){if(!e||void 0===e.length)return n(new TypeError(typeof e+" "+e+" is not iterable(cannot read property Symbol(Symbol.iterator))"));var r=Array.prototype.slice.call(e);if(0===r.length)return t([]);var o=r.length;function i(e,n){if(n&&("object"==typeof n||"function"==typeof n)){var c=n.then;if("function"==typeof c)return void c.call(n,(function(t){i(e,t);}),(function(n){r[e]={status:"rejected",reason:n},0==--o&&t(r);}))}r[e]={status:"fulfilled",value:n},0==--o&&t(r);}for(var c=0;c<r.length;c++)i(c,r[c]);}))}!function(e,t,n){var r=-1!==e.indexOf("Map"),o=-1!==e.indexOf("Weak"),i=r?"set":"add",c=p[e],a=c&&c.prototype,s=c,u={},l=function(e){var t=j(a[e]);ht(a,e,"add"==e?function(e){return t(this,0===e?0:e),this}:"delete"==e?function(e){return !(o&&!U(e))&&t(this,0===e?0:e)}:"get"==e?function(e){return o&&!U(e)?void 0:t(this,0===e?0:e)}:"has"==e?function(e){return !(o&&!U(e))&&t(this,0===e?0:e)}:function(e,n){return t(this,0===e?0:e,n),this});};if(Ut(e,!K(c)||!(o||a.forEach&&!y((function(){(new c).entries().next();})))))s=n.getConstructor(t,e,r,i),ic.enable();else if(Ut(e,!0)){var f=new s,d=f[i](o?{}:-0,1)!=f,h=y((function(){f.has(1);})),v=di((function(e){new c(e);})),m=!o&&y((function(){for(var e=new c,t=5;t--;)e[i](t,t);return !e.has(-0)}));v||((s=t((function(e,t){fc(e,a);var n=function(e,t,n){var r,o;return Ko&&K(r=t.constructor)&&r!==n&&U(o=r.prototype)&&o!==n.prototype&&Ko(e,o),e}(new c,e,s);return P(t)||uc(t,n[i],{that:n,AS_ENTRIES:r}),n}))).prototype=a,a.constructor=s),(h||m)&&(l("delete"),l("has"),r&&l("get")),(m||d)&&l(i),o&&a.clear&&delete a.clear;}u[e]=s,Dt({global:!0,constructor:!0,forced:s!=c},u),cr(s,e),o||n.setStrong(s,e,r);}("Set",(function(e){return function(){return e(this,arguments.length?arguments[0]:void 0)}}),bc),er.Set;var Sc=setTimeout;function kc(e){return Boolean(e&&void 0!==e.length)}function _c(){}function Ic(e){if(!(this instanceof Ic))throw new TypeError("Promises must be constructed via new");if("function"!=typeof e)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=void 0,this._deferreds=[],Rc(e,this);}function Oc(e,t){for(;3===e._state;)e=e._value;0!==e._state?(e._handled=!0,Ic._immediateFn((function(){var n=1===e._state?t.onFulfilled:t.onRejected;if(null!==n){var r;try{r=n(e._value);}catch(e){return void Tc(t.promise,e)}xc(t.promise,r);}else (1===e._state?xc:Tc)(t.promise,e._value);}))):e._deferreds.push(t);}function xc(e,t){try{if(t===e)throw new TypeError("A promise cannot be resolved with itself.");if(t&&("object"==typeof t||"function"==typeof t)){var n=t.then;if(t instanceof Ic)return e._state=3,e._value=t,void Cc(e);if("function"==typeof n)return void Rc((r=n,o=t,function(){r.apply(o,arguments);}),e)}e._state=1,e._value=t,Cc(e);}catch(t){Tc(e,t);}var r,o;}function Tc(e,t){e._state=2,e._value=t,Cc(e);}function Cc(e){2===e._state&&0===e._deferreds.length&&Ic._immediateFn((function(){e._handled||Ic._unhandledRejectionFn(e._value);}));for(var t=0,n=e._deferreds.length;t<n;t++)Oc(e,e._deferreds[t]);e._deferreds=null;}function jc(e,t,n){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof t?t:null,this.promise=n;}function Rc(e,t){var n=!1;try{e((function(e){n||(n=!0,xc(t,e));}),(function(e){n||(n=!0,Tc(t,e));}));}catch(e){if(n)return;n=!0,Tc(t,e);}}Ic.prototype.catch=function(e){return this.then(null,e)},Ic.prototype.then=function(e,t){var n=new this.constructor(_c);return Oc(this,new jc(e,t,n)),n},Ic.prototype.finally=gc,Ic.all=function(e){return new Ic((function(t,n){if(!kc(e))return n(new TypeError("Promise.all accepts an array"));var r=Array.prototype.slice.call(e);if(0===r.length)return t([]);var o=r.length;function i(e,c){try{if(c&&("object"==typeof c||"function"==typeof c)){var a=c.then;if("function"==typeof a)return void a.call(c,(function(t){i(e,t);}),n)}r[e]=c,0==--o&&t(r);}catch(e){n(e);}}for(var c=0;c<r.length;c++)i(c,r[c]);}))},Ic.allSettled=wc,Ic.resolve=function(e){return e&&"object"==typeof e&&e.constructor===Ic?e:new Ic((function(t){t(e);}))},Ic.reject=function(e){return new Ic((function(t,n){n(e);}))},Ic.race=function(e){return new Ic((function(t,n){if(!kc(e))return n(new TypeError("Promise.race accepts an array"));for(var r=0,o=e.length;r<o;r++)Ic.resolve(e[r]).then(t,n);}))},Ic._immediateFn="function"==typeof setImmediate&&function(e){setImmediate(e);}||function(e){Sc(e,0);},Ic._unhandledRejectionFn=function(e){"undefined"!=typeof console&&console&&console.warn("Possible Unhandled Promise Rejection:",e);};var Lc=function(){if("undefined"!=typeof self)return self;if("undefined"!=typeof window)return window;if("undefined"!=typeof global)return global;throw new Error("unable to locate global object")}();"function"!=typeof Lc.Promise?Lc.Promise=Ic:(Lc.Promise.prototype.finally||(Lc.Promise.prototype.finally=gc),Lc.Promise.allSettled||(Lc.Promise.allSettled=wc)),function(e){function t(e){for(var t=0,n=Math.min(65536,e.length+1),r=new Uint16Array(n),o=[],i=0;;){var c=t<e.length;if(!c||i>=n-1){var a=r.subarray(0,i);if(o.push(String.fromCharCode.apply(null,a)),!c)return o.join("");e=e.subarray(t),t=0,i=0;}var s=e[t++];if(0==(128&s))r[i++]=s;else if(192==(224&s)){var u=63&e[t++];r[i++]=(31&s)<<6|u;}else if(224==(240&s)){u=63&e[t++];var l=63&e[t++];r[i++]=(31&s)<<12|u<<6|l;}else if(240==(248&s)){var f=(7&s)<<18|(u=63&e[t++])<<12|(l=63&e[t++])<<6|63&e[t++];f>65535&&(f-=65536,r[i++]=f>>>10&1023|55296,f=56320|1023&f),r[i++]=f;}}}var n="Failed to ",r=function(e,t,r){if(e)throw new Error("".concat(n).concat(t,": the '").concat(r,"' option is unsupported."))},o="function"==typeof Buffer&&Buffer.from,i=o?function(e){return Buffer.from(e)}:function(e){for(var t=0,n=e.length,r=0,o=Math.max(32,n+(n>>>1)+7),i=new Uint8Array(o>>>3<<3);t<n;){var c=e.charCodeAt(t++);if(c>=55296&&c<=56319){if(t<n){var a=e.charCodeAt(t);56320==(64512&a)&&(++t,c=((1023&c)<<10)+(1023&a)+65536);}if(c>=55296&&c<=56319)continue}if(r+4>i.length){o+=8,o=(o*=1+t/e.length*2)>>>3<<3;var s=new Uint8Array(o);s.set(i),i=s;}if(0!=(4294967168&c)){if(0==(4294965248&c))i[r++]=c>>>6&31|192;else if(0==(4294901760&c))i[r++]=c>>>12&15|224,i[r++]=c>>>6&63|128;else {if(0!=(4292870144&c))continue;i[r++]=c>>>18&7|240,i[r++]=c>>>12&63|128,i[r++]=c>>>6&63|128;}i[r++]=63&c|128;}else i[r++]=c;}return i.slice?i.slice(0,r):i.subarray(0,r)};function c(){this.encoding="utf-8";}c.prototype.encode=function(e,t){return r(t&&t.stream,"encode","stream"),i(e)};var a=!o&&"function"==typeof Blob&&"function"==typeof URL&&"function"==typeof URL.createObjectURL,s=["utf-8","utf8","unicode-1-1-utf-8"],u=t;o?u=function(e,t){return (e instanceof Buffer?e:Buffer.from(e.buffer,e.byteOffset,e.byteLength)).toString(t)}:a&&(u=function(e){try{return function(e){var t;try{var n=new Blob([e],{type:"text/plain;charset=UTF-8"});t=URL.createObjectURL(n);var r=new XMLHttpRequest;return r.open("GET",t,!1),r.send(),r.responseText}finally{t&&URL.revokeObjectURL(t);}}(e)}catch(n){return t(e)}});var l="construct 'TextDecoder'",f="".concat(n," ").concat(l,": the ");function d(e,t){if(r(t&&t.fatal,l,"fatal"),e=e||"utf-8",!(o?Buffer.isEncoding(e):-1!==s.indexOf(e.toLowerCase())))throw new RangeError("".concat(f," encoding label provided ('").concat(e,"') is invalid."));this.encoding=e,this.fatal=!1,this.ignoreBOM=!1;}d.prototype.decode=function(e,t){var n;return r(t&&t.stream,"decode","stream"),n=e instanceof Uint8Array?e:e.buffer instanceof ArrayBuffer?new Uint8Array(e.buffer):new Uint8Array(e),u(n,this.encoding)},e.TextEncoder=e.TextEncoder||c,e.TextDecoder=e.TextDecoder||d;}("undefined"!=typeof window?window:s),function(){function e(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function t(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r);}}function n(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}function r(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&i(e,t);}function o(e){return o=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)},o(e)}function i(e,t){return i=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e},i(e,t)}function c(){if("undefined"==typeof Reflect||!Reflect.construct)return !1;if(Reflect.construct.sham)return !1;if("function"==typeof Proxy)return !0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return !1}}function a(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function u(e,t){return !t||"object"!=typeof t&&"function"!=typeof t?a(e):t}function l(e){var t=c();return function(){var n,r=o(e);if(t){var i=o(this).constructor;n=Reflect.construct(r,arguments,i);}else n=r.apply(this,arguments);return u(this,n)}}function f(e,t){for(;!Object.prototype.hasOwnProperty.call(e,t)&&null!==(e=o(e)););return e}function d(e,t,n){return d="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(e,t,n){var r=f(e,t);if(r){var o=Object.getOwnPropertyDescriptor(r,t);return o.get?o.get.call(n):o.value}},d(e,t,n||e)}var h=function(){function t(){e(this,t),Object.defineProperty(this,"listeners",{value:{},writable:!0,configurable:!0});}return n(t,[{key:"addEventListener",value:function(e,t,n){e in this.listeners||(this.listeners[e]=[]),this.listeners[e].push({callback:t,options:n});}},{key:"removeEventListener",value:function(e,t){if(e in this.listeners)for(var n=this.listeners[e],r=0,o=n.length;r<o;r++)if(n[r].callback===t)return void n.splice(r,1)}},{key:"dispatchEvent",value:function(e){if(e.type in this.listeners){for(var t=this.listeners[e.type].slice(),n=0,r=t.length;n<r;n++){var o=t[n];try{o.callback.call(this,e);}catch(e){Promise.resolve().then((function(){throw e}));}o.options&&o.options.once&&this.removeEventListener(e.type,o.callback);}return !e.defaultPrevented}}}]),t}(),p=function(t){r(c,t);var i=l(c);function c(){var t;return e(this,c),(t=i.call(this)).listeners||h.call(a(t)),Object.defineProperty(a(t),"aborted",{value:!1,writable:!0,configurable:!0}),Object.defineProperty(a(t),"onabort",{value:null,writable:!0,configurable:!0}),t}return n(c,[{key:"toString",value:function(){return "[object AbortSignal]"}},{key:"dispatchEvent",value:function(e){"abort"===e.type&&(this.aborted=!0,"function"==typeof this.onabort&&this.onabort.call(this,e)),d(o(c.prototype),"dispatchEvent",this).call(this,e);}}]),c}(h),y=function(){function t(){e(this,t),Object.defineProperty(this,"signal",{value:new p,writable:!0,configurable:!0});}return n(t,[{key:"abort",value:function(){var e;try{e=new Event("abort");}catch(t){"undefined"!=typeof document?document.createEvent?(e=document.createEvent("Event")).initEvent("abort",!1,!1):(e=document.createEventObject()).type="abort":e={type:"abort",bubbles:!1,cancelable:!1};}this.signal.dispatchEvent(e);}},{key:"toString",value:function(){return "[object AbortController]"}}]),t}();function v(e){return e.__FORCE_INSTALL_ABORTCONTROLLER_POLYFILL?(console.log("__FORCE_INSTALL_ABORTCONTROLLER_POLYFILL=true is set, will force install polyfill"),!0):"function"==typeof e.Request&&!e.Request.prototype.hasOwnProperty("signal")||!e.AbortController}"undefined"!=typeof Symbol&&Symbol.toStringTag&&(y.prototype[Symbol.toStringTag]="AbortController",p.prototype[Symbol.toStringTag]="AbortSignal"),function(e){v(e)&&(e.AbortController=y,e.AbortSignal=p);}("undefined"!=typeof self?self:s);}();var Wc=l((function(e,t){Object.defineProperty(t,"__esModule",{value:!0});var n=function(){function e(){var e=this;this.locked=new Map,this.addToLocked=function(t,n){var r=e.locked.get(t);void 0===r?void 0===n?e.locked.set(t,[]):e.locked.set(t,[n]):void 0!==n&&(r.unshift(n),e.locked.set(t,r));},this.isLocked=function(t){return e.locked.has(t)},this.lock=function(t){return new Promise((function(n,r){e.isLocked(t)?e.addToLocked(t,n):(e.addToLocked(t),n());}))},this.unlock=function(t){var n=e.locked.get(t);if(void 0!==n&&0!==n.length){var r=n.pop();e.locked.set(t,n),void 0!==r&&setTimeout(r,0);}else e.locked.delete(t);};}return e.getInstance=function(){return void 0===e.instance&&(e.instance=new e),e.instance},e}();t.default=function(){return n.getInstance()};}));u(Wc);var Zc=l((function(e,t){var n=s&&s.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(o,i){function c(e){try{s(r.next(e));}catch(e){i(e);}}function a(e){try{s(r.throw(e));}catch(e){i(e);}}function s(e){e.done?o(e.value):new n((function(t){t(e.value);})).then(c,a);}s((r=r.apply(e,t||[])).next());}))},r=s&&s.__generator||function(e,t){var n,r,o,i,c={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:a(0),throw:a(1),return:a(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function a(i){return function(a){return function(i){if(n)throw new TypeError("Generator is already executing.");for(;c;)try{if(n=1,r&&(o=2&i[0]?r.return:i[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,i[1])).done)return o;switch(r=0,o&&(i=[2&i[0],o.value]),i[0]){case 0:case 1:o=i;break;case 4:return c.label++,{value:i[1],done:!1};case 5:c.label++,r=i[1],i=[0];continue;case 7:i=c.ops.pop(),c.trys.pop();continue;default:if(!(o=c.trys,(o=o.length>0&&o[o.length-1])||6!==i[0]&&2!==i[0])){c=0;continue}if(3===i[0]&&(!o||i[1]>o[0]&&i[1]<o[3])){c.label=i[1];break}if(6===i[0]&&c.label<o[1]){c.label=o[1],o=i;break}if(o&&c.label<o[2]){c.label=o[2],c.ops.push(i);break}o[2]&&c.ops.pop(),c.trys.pop();continue}i=t.call(e,c);}catch(e){i=[6,e],r=0;}finally{n=o=0;}if(5&i[0])throw i[1];return {value:i[0]?i[1]:void 0,done:!0}}([i,a])}}};Object.defineProperty(t,"__esModule",{value:!0});var o="browser-tabs-lock-key";function i(e){return new Promise((function(t){return setTimeout(t,e)}))}function c(e){for(var t="0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz",n="",r=0;r<e;r++){n+=t[Math.floor(Math.random()*t.length)];}return n}var a=function(){function e(){this.acquiredIatSet=new Set,this.id=Date.now().toString()+c(15),this.acquireLock=this.acquireLock.bind(this),this.releaseLock=this.releaseLock.bind(this),this.releaseLock__private__=this.releaseLock__private__.bind(this),this.waitForSomethingToChange=this.waitForSomethingToChange.bind(this),this.refreshLockWhileAcquired=this.refreshLockWhileAcquired.bind(this),void 0===e.waiters&&(e.waiters=[]);}return e.prototype.acquireLock=function(t,a){return void 0===a&&(a=5e3),n(this,void 0,void 0,(function(){var n,s,u,l,f,d;return r(this,(function(r){switch(r.label){case 0:n=Date.now()+c(4),s=Date.now()+a,u=o+"-"+t,l=window.localStorage,r.label=1;case 1:return Date.now()<s?[4,i(30)]:[3,8];case 2:return r.sent(),null!==l.getItem(u)?[3,5]:(f=this.id+"-"+t+"-"+n,[4,i(Math.floor(25*Math.random()))]);case 3:return r.sent(),l.setItem(u,JSON.stringify({id:this.id,iat:n,timeoutKey:f,timeAcquired:Date.now(),timeRefreshed:Date.now()})),[4,i(30)];case 4:return r.sent(),null!==(d=l.getItem(u))&&(d=JSON.parse(d)).id===this.id&&d.iat===n?(this.acquiredIatSet.add(n),this.refreshLockWhileAcquired(u,n),[2,!0]):[3,7];case 5:return e.lockCorrector(),[4,this.waitForSomethingToChange(s)];case 6:r.sent(),r.label=7;case 7:return n=Date.now()+c(4),[3,1];case 8:return [2,!1]}}))}))},e.prototype.refreshLockWhileAcquired=function(e,t){return n(this,void 0,void 0,(function(){var o=this;return r(this,(function(i){return setTimeout((function(){return n(o,void 0,void 0,(function(){var n,o;return r(this,(function(r){switch(r.label){case 0:return [4,Wc.default().lock(t)];case 1:return r.sent(),this.acquiredIatSet.has(t)?(n=window.localStorage,null===(o=n.getItem(e))?(Wc.default().unlock(t),[2]):((o=JSON.parse(o)).timeRefreshed=Date.now(),n.setItem(e,JSON.stringify(o)),Wc.default().unlock(t),this.refreshLockWhileAcquired(e,t),[2])):(Wc.default().unlock(t),[2])}}))}))}),1e3),[2]}))}))},e.prototype.waitForSomethingToChange=function(t){return n(this,void 0,void 0,(function(){return r(this,(function(n){switch(n.label){case 0:return [4,new Promise((function(n){var r=!1,o=Date.now(),i=!1;function c(){if(i||(window.removeEventListener("storage",c),e.removeFromWaiting(c),clearTimeout(a),i=!0),!r){r=!0;var t=50-(Date.now()-o);t>0?setTimeout(n,t):n();}}window.addEventListener("storage",c),e.addToWaiting(c);var a=setTimeout(c,Math.max(0,t-Date.now()));}))];case 1:return n.sent(),[2]}}))}))},e.addToWaiting=function(t){this.removeFromWaiting(t),void 0!==e.waiters&&e.waiters.push(t);},e.removeFromWaiting=function(t){void 0!==e.waiters&&(e.waiters=e.waiters.filter((function(e){return e!==t})));},e.notifyWaiters=function(){void 0!==e.waiters&&e.waiters.slice().forEach((function(e){return e()}));},e.prototype.releaseLock=function(e){return n(this,void 0,void 0,(function(){return r(this,(function(t){switch(t.label){case 0:return [4,this.releaseLock__private__(e)];case 1:return [2,t.sent()]}}))}))},e.prototype.releaseLock__private__=function(t){return n(this,void 0,void 0,(function(){var n,i,c;return r(this,(function(r){switch(r.label){case 0:return n=window.localStorage,i=o+"-"+t,null===(c=n.getItem(i))?[2]:(c=JSON.parse(c)).id!==this.id?[3,2]:[4,Wc.default().lock(c.iat)];case 1:r.sent(),this.acquiredIatSet.delete(c.iat),n.removeItem(i),Wc.default().unlock(c.iat),e.notifyWaiters(),r.label=2;case 2:return [2]}}))}))},e.lockCorrector=function(){for(var t=Date.now()-5e3,n=window.localStorage,r=Object.keys(n),i=!1,c=0;c<r.length;c++){var a=r[c];if(a.includes(o)){var s=n.getItem(a);null!==s&&(void 0===(s=JSON.parse(s)).timeRefreshed&&s.timeAcquired<t||void 0!==s.timeRefreshed&&s.timeRefreshed<t)&&(n.removeItem(a),i=!0);}}i&&e.notifyWaiters();},e.waiters=void 0,e}();t.default=a;})),Ec=u(Zc),Gc={timeoutInSeconds:60},Pc=["login_required","consent_required","interaction_required","account_selection_required","access_denied"],Ac={name:"auth0-spa-js",version:"1.22.5"},Xc=function(){return Date.now()},Fc=function(e){function n(t,r){var o=e.call(this,r)||this;return o.error=t,o.error_description=r,Object.setPrototypeOf(o,n.prototype),o}return t(n,e),n.fromPayload=function(e){return new n(e.error,e.error_description)},n}(Error),Kc=function(e){function n(t,r,o,i){void 0===i&&(i=null);var c=e.call(this,t,r)||this;return c.state=o,c.appState=i,Object.setPrototypeOf(c,n.prototype),c}return t(n,e),n}(Fc),Nc=function(e){function n(){var t=e.call(this,"timeout","Timeout")||this;return Object.setPrototypeOf(t,n.prototype),t}return t(n,e),n}(Fc),Uc=function(e){function n(t){var r=e.call(this)||this;return r.popup=t,Object.setPrototypeOf(r,n.prototype),r}return t(n,e),n}(Nc),Hc=function(e){function n(t){var r=e.call(this,"cancelled","Popup closed")||this;return r.popup=t,Object.setPrototypeOf(r,n.prototype),r}return t(n,e),n}(Fc),Dc=function(e){function n(t,r,o){var i=e.call(this,t,r)||this;return i.mfa_token=o,Object.setPrototypeOf(i,n.prototype),i}return t(n,e),n}(Fc),Yc=function(e){function n(t,r){var o=e.call(this,"missing_refresh_token","Missing Refresh Token (audience: '".concat(ta(t,["default"]),"', scope: '").concat(ta(r),"')"))||this;return o.audience=t,o.scope=r,Object.setPrototypeOf(o,n.prototype),o}return t(n,e),n}(Fc),Jc=function(e){return new Promise((function(t,n){var r,o=setInterval((function(){e.popup&&e.popup.closed&&(clearInterval(o),clearTimeout(i),window.removeEventListener("message",r,!1),n(new Hc(e.popup)));}),1e3),i=setTimeout((function(){clearInterval(o),n(new Uc(e.popup)),window.removeEventListener("message",r,!1);}),1e3*(e.timeoutInSeconds||60));r=function(c){if(c.data&&"authorization_response"===c.data.type){if(clearTimeout(i),clearInterval(o),window.removeEventListener("message",r,!1),e.popup.close(),c.data.response.error)return n(Fc.fromPayload(c.data.response));t(c.data.response);}},window.addEventListener("message",r);}))},Vc=function(){return window.crypto||window.msCrypto},zc=function(){var e=Vc();return e.subtle||e.webkitSubtle},Mc=function(){var e="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_~.",t="";return Array.from(Vc().getRandomValues(new Uint8Array(43))).forEach((function(n){return t+=e[n%e.length]})),t},Bc=function(e){return btoa(e)},Qc=function(e){return Object.keys(e).filter((function(t){return void 0!==e[t]})).map((function(t){return encodeURIComponent(t)+"="+encodeURIComponent(e[t])})).join("&")},qc=function(e){return o(void 0,void 0,void 0,(function(){var t;return i(this,(function(n){switch(n.label){case 0:return t=zc().digest({name:"SHA-256"},(new TextEncoder).encode(e)),window.msCrypto?[2,new Promise((function(e,n){t.oncomplete=function(t){e(t.target.result);},t.onerror=function(e){n(e.error);},t.onabort=function(){n("The digest operation was aborted");};}))]:[4,t];case 1:return [2,n.sent()]}}))}))},$c=function(e){return function(e){return decodeURIComponent(atob(e).split("").map((function(e){return "%"+("00"+e.charCodeAt(0).toString(16)).slice(-2)})).join(""))}(e.replace(/_/g,"/").replace(/-/g,"+"))},ea=function(e){var t=new Uint8Array(e);return function(e){var t={"+":"-","/":"_","=":""};return e.replace(/[+/=]/g,(function(e){return t[e]}))}(window.btoa(String.fromCharCode.apply(String,a([],c(Array.from(t)),!1))))};function ta(e,t){return void 0===t&&(t=[]),e&&!t.includes(e)?e:""}var na=function(e,t){return o(void 0,void 0,void 0,(function(){var n,r;return i(this,(function(o){switch(o.label){case 0:return [4,(i=e,c=t,c=c||{},new Promise((function(e,t){var n=new XMLHttpRequest,r=[],o=[],a={},s=function(){return {ok:2==(n.status/100|0),statusText:n.statusText,status:n.status,url:n.responseURL,text:function(){return Promise.resolve(n.responseText)},json:function(){return Promise.resolve(n.responseText).then(JSON.parse)},blob:function(){return Promise.resolve(new Blob([n.response]))},clone:s,headers:{keys:function(){return r},entries:function(){return o},get:function(e){return a[e.toLowerCase()]},has:function(e){return e.toLowerCase()in a}}}};for(var u in n.open(c.method||"get",i,!0),n.onload=function(){n.getAllResponseHeaders().replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm,(function(e,t,n){r.push(t=t.toLowerCase()),o.push([t,n]),a[t]=a[t]?a[t]+","+n:n;})),e(s());},n.onerror=t,n.withCredentials="include"==c.credentials,c.headers)n.setRequestHeader(u,c.headers[u]);n.send(c.body||null);})))];case 1:return n=o.sent(),r={ok:n.ok},[4,n.json()];case 2:return [2,(r.json=o.sent(),r)]}var i,c;}))}))},ra=function(e,t,n){return o(void 0,void 0,void 0,(function(){var r,o;return i(this,(function(i){return r=new AbortController,t.signal=r.signal,[2,Promise.race([na(e,t),new Promise((function(e,t){o=setTimeout((function(){r.abort(),t(new Error("Timeout when executing 'fetch'"));}),n);}))]).finally((function(){clearTimeout(o);}))]}))}))},oa=function(e,t,n,r,c,a,s){return o(void 0,void 0,void 0,(function(){return i(this,(function(o){return [2,(i={auth:{audience:t,scope:n},timeout:c,fetchUrl:e,fetchOptions:r,useFormData:s},u=a,new Promise((function(e,t){var n=new MessageChannel;n.port1.onmessage=function(n){n.data.error?t(new Error(n.data.error)):e(n.data);},u.postMessage(i,[n.port2]);})))];var i,u;}))}))},ia=function(e,t,n,r,c,a,s){return void 0===s&&(s=1e4),o(void 0,void 0,void 0,(function(){return i(this,(function(o){return c?[2,oa(e,t,n,r,s,c,a)]:[2,ra(e,r,s)]}))}))};function ca(e,t,n,c,a,s,u){return o(this,void 0,void 0,(function(){var o,l,f,d,h,p,y,v,m;return i(this,(function(i){switch(i.label){case 0:o=null,f=0,i.label=1;case 1:if(!(f<3))return [3,6];i.label=2;case 2:return i.trys.push([2,4,,5]),[4,ia(e,n,c,a,s,u,t)];case 3:return l=i.sent(),o=null,[3,6];case 4:return d=i.sent(),o=d,[3,5];case 5:return f++,[3,1];case 6:if(o)throw o.message=o.message||"Failed to fetch",o;if(h=l.json,p=h.error,y=h.error_description,v=r(h,["error","error_description"]),!l.ok){if(m=y||"HTTP error. Unable to fetch ".concat(e),"mfa_required"===p)throw new Dc(p,m,v.mfa_token);throw new Fc(p||"request_error",m)}return [2,v]}}))}))}function aa(e,t){var n=e.baseUrl,c=e.timeout,a=e.audience,s=e.scope,u=e.auth0Client,l=e.useFormData,f=r(e,["baseUrl","timeout","audience","scope","auth0Client","useFormData"]);return o(this,void 0,void 0,(function(){var e;return i(this,(function(r){switch(r.label){case 0:return e=l?Qc(f):JSON.stringify(f),[4,ca("".concat(n,"/oauth/token"),c,a||"default",s,{method:"POST",body:e,headers:{"Content-Type":l?"application/x-www-form-urlencoded":"application/json","Auth0-Client":btoa(JSON.stringify(u||Ac))}},t,l)];case 1:return [2,r.sent()]}}))}))}var sa=function(e){return Array.from(new Set(e))},ua=function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];return sa(e.join(" ").trim().split(/\s+/)).join(" ")},la=function(){function e(e,t){void 0===t&&(t="@@auth0spajs@@"),this.prefix=t,this.client_id=e.client_id,this.scope=e.scope,this.audience=e.audience;}return e.prototype.toKey=function(){return "".concat(this.prefix,"::").concat(this.client_id,"::").concat(this.audience,"::").concat(this.scope)},e.fromKey=function(t){var n=c(t.split("::"),4),r=n[0],o=n[1],i=n[2];return new e({client_id:o,scope:n[3],audience:i},r)},e.fromCacheEntry=function(t){return new e({scope:t.scope,audience:t.audience,client_id:t.client_id})},e}(),fa=function(){function e(){}return e.prototype.set=function(e,t){localStorage.setItem(e,JSON.stringify(t));},e.prototype.get=function(e){var t=window.localStorage.getItem(e);if(t)try{return JSON.parse(t)}catch(e){return}},e.prototype.remove=function(e){localStorage.removeItem(e);},e.prototype.allKeys=function(){return Object.keys(window.localStorage).filter((function(e){return e.startsWith("@@auth0spajs@@")}))},e}(),da=function(){var e;this.enclosedCache=(e={},{set:function(t,n){e[t]=n;},get:function(t){var n=e[t];if(n)return n},remove:function(t){delete e[t];},allKeys:function(){return Object.keys(e)}});},ha=function(){function e(e,t,n){this.cache=e,this.keyManifest=t,this.nowProvider=n,this.nowProvider=this.nowProvider||Xc;}return e.prototype.get=function(e,t){var n;return void 0===t&&(t=0),o(this,void 0,void 0,(function(){var r,o,c,a,s;return i(this,(function(i){switch(i.label){case 0:return [4,this.cache.get(e.toKey())];case 1:return (r=i.sent())?[3,4]:[4,this.getCacheKeys()];case 2:return (o=i.sent())?(c=this.matchExistingCacheKey(e,o))?[4,this.cache.get(c)]:[3,4]:[2];case 3:r=i.sent(),i.label=4;case 4:return r?[4,this.nowProvider()]:[2];case 5:return a=i.sent(),s=Math.floor(a/1e3),r.expiresAt-t<s?r.body.refresh_token?(r.body={refresh_token:r.body.refresh_token},[4,this.cache.set(e.toKey(),r)]):[3,7]:[3,10];case 6:return i.sent(),[2,r.body];case 7:return [4,this.cache.remove(e.toKey())];case 8:return i.sent(),[4,null===(n=this.keyManifest)||void 0===n?void 0:n.remove(e.toKey())];case 9:return i.sent(),[2];case 10:return [2,r.body]}}))}))},e.prototype.set=function(e){var t;return o(this,void 0,void 0,(function(){var n,r;return i(this,(function(o){switch(o.label){case 0:return n=new la({client_id:e.client_id,scope:e.scope,audience:e.audience}),[4,this.wrapCacheEntry(e)];case 1:return r=o.sent(),[4,this.cache.set(n.toKey(),r)];case 2:return o.sent(),[4,null===(t=this.keyManifest)||void 0===t?void 0:t.add(n.toKey())];case 3:return o.sent(),[2]}}))}))},e.prototype.clear=function(e){var t;return o(this,void 0,void 0,(function(){var n,r=this;return i(this,(function(c){switch(c.label){case 0:return [4,this.getCacheKeys()];case 1:return (n=c.sent())?[4,n.filter((function(t){return !e||t.includes(e)})).reduce((function(e,t){return o(r,void 0,void 0,(function(){return i(this,(function(n){switch(n.label){case 0:return [4,e];case 1:return n.sent(),[4,this.cache.remove(t)];case 2:return n.sent(),[2]}}))}))}),Promise.resolve())]:[2];case 2:return c.sent(),[4,null===(t=this.keyManifest)||void 0===t?void 0:t.clear()];case 3:return c.sent(),[2]}}))}))},e.prototype.clearSync=function(e){var t=this,n=this.cache.allKeys();n&&n.filter((function(t){return !e||t.includes(e)})).forEach((function(e){t.cache.remove(e);}));},e.prototype.wrapCacheEntry=function(e){return o(this,void 0,void 0,(function(){var t,n,r;return i(this,(function(o){switch(o.label){case 0:return [4,this.nowProvider()];case 1:return t=o.sent(),n=Math.floor(t/1e3)+e.expires_in,r=Math.min(n,e.decodedToken.claims.exp),[2,{body:e,expiresAt:r}]}}))}))},e.prototype.getCacheKeys=function(){var e;return o(this,void 0,void 0,(function(){var t;return i(this,(function(n){switch(n.label){case 0:return this.keyManifest?[4,this.keyManifest.get()]:[3,2];case 1:return t=null===(e=n.sent())||void 0===e?void 0:e.keys,[3,4];case 2:return [4,this.cache.allKeys()];case 3:t=n.sent(),n.label=4;case 4:return [2,t]}}))}))},e.prototype.matchExistingCacheKey=function(e,t){return t.filter((function(t){var n=la.fromKey(t),r=new Set(n.scope&&n.scope.split(" ")),o=e.scope.split(" "),i=n.scope&&o.reduce((function(e,t){return e&&r.has(t)}),!0);return "@@auth0spajs@@"===n.prefix&&n.client_id===e.client_id&&n.audience===e.audience&&i}))[0]},e}(),pa=function(){function e(e,t){this.storage=e,this.clientId=t,this.storageKey="".concat("a0.spajs.txs",".").concat(this.clientId),this.transaction=this.storage.get(this.storageKey);}return e.prototype.create=function(e){this.transaction=e,this.storage.save(this.storageKey,e,{daysUntilExpire:1});},e.prototype.get=function(){return this.transaction},e.prototype.remove=function(){delete this.transaction,this.storage.remove(this.storageKey);},e}(),ya=function(e){return "number"==typeof e},va=["iss","aud","exp","nbf","iat","jti","azp","nonce","auth_time","at_hash","c_hash","acr","amr","sub_jwk","cnf","sip_from_tag","sip_date","sip_callid","sip_cseq_num","sip_via_branch","orig","dest","mky","events","toe","txn","rph","sid","vot","vtm"],ma=function(e){if(!e.id_token)throw new Error("ID token is required but missing");var t=function(e){var t=e.split("."),n=c(t,3),r=n[0],o=n[1],i=n[2];if(3!==t.length||!r||!o||!i)throw new Error("ID token could not be decoded");var a=JSON.parse($c(o)),s={__raw:e},u={};return Object.keys(a).forEach((function(e){s[e]=a[e],va.includes(e)||(u[e]=a[e]);})),{encoded:{header:r,payload:o,signature:i},header:JSON.parse($c(r)),claims:s,user:u}}(e.id_token);if(!t.claims.iss)throw new Error("Issuer (iss) claim must be a string present in the ID token");if(t.claims.iss!==e.iss)throw new Error('Issuer (iss) claim mismatch in the ID token; expected "'.concat(e.iss,'", found "').concat(t.claims.iss,'"'));if(!t.user.sub)throw new Error("Subject (sub) claim must be a string present in the ID token");if("RS256"!==t.header.alg)throw new Error('Signature algorithm of "'.concat(t.header.alg,'" is not supported. Expected the ID token to be signed with "RS256".'));if(!t.claims.aud||"string"!=typeof t.claims.aud&&!Array.isArray(t.claims.aud))throw new Error("Audience (aud) claim must be a string or array of strings present in the ID token");if(Array.isArray(t.claims.aud)){if(!t.claims.aud.includes(e.aud))throw new Error('Audience (aud) claim mismatch in the ID token; expected "'.concat(e.aud,'" but was not one of "').concat(t.claims.aud.join(", "),'"'));if(t.claims.aud.length>1){if(!t.claims.azp)throw new Error("Authorized Party (azp) claim must be a string present in the ID token when Audience (aud) claim has multiple values");if(t.claims.azp!==e.aud)throw new Error('Authorized Party (azp) claim mismatch in the ID token; expected "'.concat(e.aud,'", found "').concat(t.claims.azp,'"'))}}else if(t.claims.aud!==e.aud)throw new Error('Audience (aud) claim mismatch in the ID token; expected "'.concat(e.aud,'" but found "').concat(t.claims.aud,'"'));if(e.nonce){if(!t.claims.nonce)throw new Error("Nonce (nonce) claim must be a string present in the ID token");if(t.claims.nonce!==e.nonce)throw new Error('Nonce (nonce) claim mismatch in the ID token; expected "'.concat(e.nonce,'", found "').concat(t.claims.nonce,'"'))}if(e.max_age&&!ya(t.claims.auth_time))throw new Error("Authentication Time (auth_time) claim must be a number present in the ID token when Max Age (max_age) is specified");if(!ya(t.claims.exp))throw new Error("Expiration Time (exp) claim must be a number present in the ID token");if(!ya(t.claims.iat))throw new Error("Issued At (iat) claim must be a number present in the ID token");var n=e.leeway||60,r=new Date(e.now||Date.now()),o=new Date(0),i=new Date(0),a=new Date(0);if(a.setUTCSeconds(parseInt(t.claims.auth_time)+e.max_age+n),o.setUTCSeconds(t.claims.exp+n),i.setUTCSeconds(t.claims.nbf-n),r>o)throw new Error("Expiration Time (exp) claim error in the ID token; current time (".concat(r,") is after expiration time (").concat(o,")"));if(ya(t.claims.nbf)&&r<i)throw new Error("Not Before time (nbf) claim in the ID token indicates that this token can't be used just yet. Currrent time (".concat(r,") is before ").concat(i));if(ya(t.claims.auth_time)&&r>a)throw new Error("Authentication Time (auth_time) claim in the ID token indicates that too much time has passed since the last end-user authentication. Currrent time (".concat(r,") is after last auth at ").concat(a));if(e.organizationId){if(!t.claims.org_id)throw new Error("Organization ID (org_id) claim must be a string present in the ID token");if(e.organizationId!==t.claims.org_id)throw new Error('Organization ID (org_id) claim mismatch in the ID token; expected "'.concat(e.organizationId,'", found "').concat(t.claims.org_id,'"'))}return t},ba=l((function(e,t){var n=s&&s.__assign||function(){return n=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var o in t=arguments[n])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e},n.apply(this,arguments)};function r(e,t){if(!t)return "";var n="; "+e;return !0===t?n:n+"="+t}function o(e,t,n){return encodeURIComponent(e).replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent).replace(/\(/g,"%28").replace(/\)/g,"%29")+"="+encodeURIComponent(t).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent)+function(e){if("number"==typeof e.expires){var t=new Date;t.setMilliseconds(t.getMilliseconds()+864e5*e.expires),e.expires=t;}return r("Expires",e.expires?e.expires.toUTCString():"")+r("Domain",e.domain)+r("Path",e.path)+r("Secure",e.secure)+r("SameSite",e.sameSite)}(n)}function i(e){for(var t={},n=e?e.split("; "):[],r=/(%[\dA-F]{2})+/gi,o=0;o<n.length;o++){var i=n[o].split("="),c=i.slice(1).join("=");'"'===c.charAt(0)&&(c=c.slice(1,-1));try{t[i[0].replace(r,decodeURIComponent)]=c.replace(r,decodeURIComponent);}catch(e){}}return t}function c(){return i(document.cookie)}function a(e,t,r){document.cookie=o(e,t,n({path:"/"},r));}t.__esModule=!0,t.encode=o,t.parse=i,t.getAll=c,t.get=function(e){return c()[e]},t.set=a,t.remove=function(e,t){a(e,"",n(n({},t),{expires:-1}));};}));u(ba),ba.encode,ba.parse,ba.getAll;var ga=ba.get,wa=ba.set,Sa=ba.remove,ka={get:function(e){var t=ga(e);if(void 0!==t)return JSON.parse(t)},save:function(e,t,n){var r={};"https:"===window.location.protocol&&(r={secure:!0,sameSite:"none"}),(null==n?void 0:n.daysUntilExpire)&&(r.expires=n.daysUntilExpire),(null==n?void 0:n.cookieDomain)&&(r.domain=n.cookieDomain),wa(e,JSON.stringify(t),r);},remove:function(e,t){var n={};(null==t?void 0:t.cookieDomain)&&(n.domain=t.cookieDomain),Sa(e,n);}},_a={get:function(e){var t=ka.get(e);return t||ka.get("".concat("_legacy_").concat(e))},save:function(e,t,n){var r={};"https:"===window.location.protocol&&(r={secure:!0}),(null==n?void 0:n.daysUntilExpire)&&(r.expires=n.daysUntilExpire),wa("".concat("_legacy_").concat(e),JSON.stringify(t),r),ka.save(e,t,n);},remove:function(e,t){var n={};(null==t?void 0:t.cookieDomain)&&(n.domain=t.cookieDomain),Sa(e,n),ka.remove(e,t),ka.remove("".concat("_legacy_").concat(e),t);}},Ia={get:function(e){if("undefined"!=typeof sessionStorage){var t=sessionStorage.getItem(e);if(void 0!==t)return JSON.parse(t)}},save:function(e,t){sessionStorage.setItem(e,JSON.stringify(t));},remove:function(e){sessionStorage.removeItem(e);}};function Oa(e,t,n){var r=void 0===t?null:t,o=function(e,t){var n=atob(e);if(t){for(var r=new Uint8Array(n.length),o=0,i=n.length;o<i;++o)r[o]=n.charCodeAt(o);return String.fromCharCode.apply(null,new Uint16Array(r.buffer))}return n}(e,void 0!==n&&n),i=o.indexOf("\n",10)+1,c=o.substring(i)+(r?"//# sourceMappingURL="+r:""),a=new Blob([c],{type:"application/javascript"});return URL.createObjectURL(a)}var xa,Ta,Ca,ja,Ra=(xa="Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwohZnVuY3Rpb24oKXsidXNlIHN0cmljdCI7dmFyIHQ9ZnVuY3Rpb24oZSxyKXtyZXR1cm4gdD1PYmplY3Quc2V0UHJvdG90eXBlT2Z8fHtfX3Byb3RvX186W119aW5zdGFuY2VvZiBBcnJheSYmZnVuY3Rpb24odCxlKXt0Ll9fcHJvdG9fXz1lfXx8ZnVuY3Rpb24odCxlKXtmb3IodmFyIHIgaW4gZSlPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZSxyKSYmKHRbcl09ZVtyXSl9LHQoZSxyKX07ZnVuY3Rpb24gZShlLHIpe2lmKCJmdW5jdGlvbiIhPXR5cGVvZiByJiZudWxsIT09cil0aHJvdyBuZXcgVHlwZUVycm9yKCJDbGFzcyBleHRlbmRzIHZhbHVlICIrU3RyaW5nKHIpKyIgaXMgbm90IGEgY29uc3RydWN0b3Igb3IgbnVsbCIpO2Z1bmN0aW9uIG4oKXt0aGlzLmNvbnN0cnVjdG9yPWV9dChlLHIpLGUucHJvdG90eXBlPW51bGw9PT1yP09iamVjdC5jcmVhdGUocik6KG4ucHJvdG90eXBlPXIucHJvdG90eXBlLG5ldyBuKX12YXIgcj1mdW5jdGlvbigpe3JldHVybiByPU9iamVjdC5hc3NpZ258fGZ1bmN0aW9uKHQpe2Zvcih2YXIgZSxyPTEsbj1hcmd1bWVudHMubGVuZ3RoO3I8bjtyKyspZm9yKHZhciBvIGluIGU9YXJndW1lbnRzW3JdKU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChlLG8pJiYodFtvXT1lW29dKTtyZXR1cm4gdH0sci5hcHBseSh0aGlzLGFyZ3VtZW50cyl9O2Z1bmN0aW9uIG4odCxlLHIsbil7cmV0dXJuIG5ldyhyfHwocj1Qcm9taXNlKSkoKGZ1bmN0aW9uKG8sYyl7ZnVuY3Rpb24gaSh0KXt0cnl7cyhuLm5leHQodCkpfWNhdGNoKHQpe2ModCl9fWZ1bmN0aW9uIGEodCl7dHJ5e3Mobi50aHJvdyh0KSl9Y2F0Y2godCl7Yyh0KX19ZnVuY3Rpb24gcyh0KXt2YXIgZTt0LmRvbmU/byh0LnZhbHVlKTooZT10LnZhbHVlLGUgaW5zdGFuY2VvZiByP2U6bmV3IHIoKGZ1bmN0aW9uKHQpe3QoZSl9KSkpLnRoZW4oaSxhKX1zKChuPW4uYXBwbHkodCxlfHxbXSkpLm5leHQoKSl9KSl9ZnVuY3Rpb24gbyh0LGUpe3ZhciByLG4sbyxjLGk9e2xhYmVsOjAsc2VudDpmdW5jdGlvbigpe2lmKDEmb1swXSl0aHJvdyBvWzFdO3JldHVybiBvWzFdfSx0cnlzOltdLG9wczpbXX07cmV0dXJuIGM9e25leHQ6YSgwKSx0aHJvdzphKDEpLHJldHVybjphKDIpfSwiZnVuY3Rpb24iPT10eXBlb2YgU3ltYm9sJiYoY1tTeW1ib2wuaXRlcmF0b3JdPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXN9KSxjO2Z1bmN0aW9uIGEoYyl7cmV0dXJuIGZ1bmN0aW9uKGEpe3JldHVybiBmdW5jdGlvbihjKXtpZihyKXRocm93IG5ldyBUeXBlRXJyb3IoIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy4iKTtmb3IoO2k7KXRyeXtpZihyPTEsbiYmKG89MiZjWzBdP24ucmV0dXJuOmNbMF0/bi50aHJvd3x8KChvPW4ucmV0dXJuKSYmby5jYWxsKG4pLDApOm4ubmV4dCkmJiEobz1vLmNhbGwobixjWzFdKSkuZG9uZSlyZXR1cm4gbztzd2l0Y2gobj0wLG8mJihjPVsyJmNbMF0sby52YWx1ZV0pLGNbMF0pe2Nhc2UgMDpjYXNlIDE6bz1jO2JyZWFrO2Nhc2UgNDpyZXR1cm4gaS5sYWJlbCsrLHt2YWx1ZTpjWzFdLGRvbmU6ITF9O2Nhc2UgNTppLmxhYmVsKyssbj1jWzFdLGM9WzBdO2NvbnRpbnVlO2Nhc2UgNzpjPWkub3BzLnBvcCgpLGkudHJ5cy5wb3AoKTtjb250aW51ZTtkZWZhdWx0OmlmKCEobz1pLnRyeXMsKG89by5sZW5ndGg+MCYmb1tvLmxlbmd0aC0xXSl8fDYhPT1jWzBdJiYyIT09Y1swXSkpe2k9MDtjb250aW51ZX1pZigzPT09Y1swXSYmKCFvfHxjWzFdPm9bMF0mJmNbMV08b1szXSkpe2kubGFiZWw9Y1sxXTticmVha31pZig2PT09Y1swXSYmaS5sYWJlbDxvWzFdKXtpLmxhYmVsPW9bMV0sbz1jO2JyZWFrfWlmKG8mJmkubGFiZWw8b1syXSl7aS5sYWJlbD1vWzJdLGkub3BzLnB1c2goYyk7YnJlYWt9b1syXSYmaS5vcHMucG9wKCksaS50cnlzLnBvcCgpO2NvbnRpbnVlfWM9ZS5jYWxsKHQsaSl9Y2F0Y2godCl7Yz1bNix0XSxuPTB9ZmluYWxseXtyPW89MH1pZig1JmNbMF0pdGhyb3cgY1sxXTtyZXR1cm57dmFsdWU6Y1swXT9jWzFdOnZvaWQgMCxkb25lOiEwfX0oW2MsYV0pfX19ZnVuY3Rpb24gYyh0LGUpe3JldHVybiB2b2lkIDA9PT1lJiYoZT1bXSksdCYmIWUuaW5jbHVkZXModCk/dDoiIn12YXIgaT1mdW5jdGlvbih0KXtmdW5jdGlvbiByKGUsbil7dmFyIG89dC5jYWxsKHRoaXMsbil8fHRoaXM7cmV0dXJuIG8uZXJyb3I9ZSxvLmVycm9yX2Rlc2NyaXB0aW9uPW4sT2JqZWN0LnNldFByb3RvdHlwZU9mKG8sci5wcm90b3R5cGUpLG99cmV0dXJuIGUocix0KSxyLmZyb21QYXlsb2FkPWZ1bmN0aW9uKHQpe3JldHVybiBuZXcgcih0LmVycm9yLHQuZXJyb3JfZGVzY3JpcHRpb24pfSxyfShFcnJvcik7IWZ1bmN0aW9uKHQpe2Z1bmN0aW9uIHIoZSxuLG8sYyl7dm9pZCAwPT09YyYmKGM9bnVsbCk7dmFyIGk9dC5jYWxsKHRoaXMsZSxuKXx8dGhpcztyZXR1cm4gaS5zdGF0ZT1vLGkuYXBwU3RhdGU9YyxPYmplY3Quc2V0UHJvdG90eXBlT2YoaSxyLnByb3RvdHlwZSksaX1lKHIsdCl9KGkpLGZ1bmN0aW9uKHQpe2Z1bmN0aW9uIHIoZSl7dmFyIG49dC5jYWxsKHRoaXMpfHx0aGlzO3JldHVybiBuLnBvcHVwPWUsT2JqZWN0LnNldFByb3RvdHlwZU9mKG4sci5wcm90b3R5cGUpLG59ZShyLHQpfShmdW5jdGlvbih0KXtmdW5jdGlvbiByKCl7dmFyIGU9dC5jYWxsKHRoaXMsInRpbWVvdXQiLCJUaW1lb3V0Iil8fHRoaXM7cmV0dXJuIE9iamVjdC5zZXRQcm90b3R5cGVPZihlLHIucHJvdG90eXBlKSxlfXJldHVybiBlKHIsdCkscn0oaSkpLGZ1bmN0aW9uKHQpe2Z1bmN0aW9uIHIoZSl7dmFyIG49dC5jYWxsKHRoaXMsImNhbmNlbGxlZCIsIlBvcHVwIGNsb3NlZCIpfHx0aGlzO3JldHVybiBuLnBvcHVwPWUsT2JqZWN0LnNldFByb3RvdHlwZU9mKG4sci5wcm90b3R5cGUpLG59ZShyLHQpfShpKSxmdW5jdGlvbih0KXtmdW5jdGlvbiByKGUsbixvKXt2YXIgYz10LmNhbGwodGhpcyxlLG4pfHx0aGlzO3JldHVybiBjLm1mYV90b2tlbj1vLE9iamVjdC5zZXRQcm90b3R5cGVPZihjLHIucHJvdG90eXBlKSxjfWUocix0KX0oaSk7dmFyIGE9ZnVuY3Rpb24odCl7ZnVuY3Rpb24gcihlLG4pe3ZhciBvPXQuY2FsbCh0aGlzLCJtaXNzaW5nX3JlZnJlc2hfdG9rZW4iLCJNaXNzaW5nIFJlZnJlc2ggVG9rZW4gKGF1ZGllbmNlOiAnIi5jb25jYXQoYyhlLFsiZGVmYXVsdCJdKSwiJywgc2NvcGU6ICciKS5jb25jYXQoYyhuKSwiJykiKSl8fHRoaXM7cmV0dXJuIG8uYXVkaWVuY2U9ZSxvLnNjb3BlPW4sT2JqZWN0LnNldFByb3RvdHlwZU9mKG8sci5wcm90b3R5cGUpLG99cmV0dXJuIGUocix0KSxyfShpKSxzPXt9LHU9ZnVuY3Rpb24odCxlKXtyZXR1cm4iIi5jb25jYXQodCwifCIpLmNvbmNhdChlKX07YWRkRXZlbnRMaXN0ZW5lcigibWVzc2FnZSIsKGZ1bmN0aW9uKHQpe3ZhciBlPXQuZGF0YSxjPWUudGltZW91dCxpPWUuYXV0aCxmPWUuZmV0Y2hVcmwsbD1lLmZldGNoT3B0aW9ucyxwPWUudXNlRm9ybURhdGEsaD1mdW5jdGlvbih0LGUpe3ZhciByPSJmdW5jdGlvbiI9PXR5cGVvZiBTeW1ib2wmJnRbU3ltYm9sLml0ZXJhdG9yXTtpZighcilyZXR1cm4gdDt2YXIgbixvLGM9ci5jYWxsKHQpLGk9W107dHJ5e2Zvcig7KHZvaWQgMD09PWV8fGUtLSA+MCkmJiEobj1jLm5leHQoKSkuZG9uZTspaS5wdXNoKG4udmFsdWUpfWNhdGNoKHQpe289e2Vycm9yOnR9fWZpbmFsbHl7dHJ5e24mJiFuLmRvbmUmJihyPWMucmV0dXJuKSYmci5jYWxsKGMpfWZpbmFsbHl7aWYobyl0aHJvdyBvLmVycm9yfX1yZXR1cm4gaX0odC5wb3J0cywxKVswXTtyZXR1cm4gbih2b2lkIDAsdm9pZCAwLHZvaWQgMCwoZnVuY3Rpb24oKXt2YXIgdCxlLG4seSx2LGIsZCx3LE8sXztyZXR1cm4gbyh0aGlzLChmdW5jdGlvbihvKXtzd2l0Y2goby5sYWJlbCl7Y2FzZSAwOm49KGU9aXx8e30pLmF1ZGllbmNlLHk9ZS5zY29wZSxvLmxhYmVsPTE7Y2FzZSAxOmlmKG8udHJ5cy5wdXNoKFsxLDcsLDhdKSwhKHY9cD8obT1sLmJvZHksaz1uZXcgVVJMU2VhcmNoUGFyYW1zKG0pLFA9e30say5mb3JFYWNoKChmdW5jdGlvbih0LGUpe1BbZV09dH0pKSxQKTpKU09OLnBhcnNlKGwuYm9keSkpLnJlZnJlc2hfdG9rZW4mJiJyZWZyZXNoX3Rva2VuIj09PXYuZ3JhbnRfdHlwZSl7aWYoYj1mdW5jdGlvbih0LGUpe3JldHVybiBzW3UodCxlKV19KG4seSksIWIpdGhyb3cgbmV3IGEobix5KTtsLmJvZHk9cD9uZXcgVVJMU2VhcmNoUGFyYW1zKHIocih7fSx2KSx7cmVmcmVzaF90b2tlbjpifSkpLnRvU3RyaW5nKCk6SlNPTi5zdHJpbmdpZnkocihyKHt9LHYpLHtyZWZyZXNoX3Rva2VuOmJ9KSl9ZD12b2lkIDAsImZ1bmN0aW9uIj09dHlwZW9mIEFib3J0Q29udHJvbGxlciYmKGQ9bmV3IEFib3J0Q29udHJvbGxlcixsLnNpZ25hbD1kLnNpZ25hbCksdz12b2lkIDAsby5sYWJlbD0yO2Nhc2UgMjpyZXR1cm4gby50cnlzLnB1c2goWzIsNCwsNV0pLFs0LFByb21pc2UucmFjZShbKGc9YyxuZXcgUHJvbWlzZSgoZnVuY3Rpb24odCl7cmV0dXJuIHNldFRpbWVvdXQodCxnKX0pKSksZmV0Y2goZixyKHt9LGwpKV0pXTtjYXNlIDM6cmV0dXJuIHc9by5zZW50KCksWzMsNV07Y2FzZSA0OnJldHVybiBPPW8uc2VudCgpLGgucG9zdE1lc3NhZ2Uoe2Vycm9yOk8ubWVzc2FnZX0pLFsyXTtjYXNlIDU6cmV0dXJuIHc/WzQsdy5qc29uKCldOihkJiZkLmFib3J0KCksaC5wb3N0TWVzc2FnZSh7ZXJyb3I6IlRpbWVvdXQgd2hlbiBleGVjdXRpbmcgJ2ZldGNoJyJ9KSxbMl0pO2Nhc2UgNjpyZXR1cm4odD1vLnNlbnQoKSkucmVmcmVzaF90b2tlbj8oZnVuY3Rpb24odCxlLHIpe3NbdShlLHIpXT10fSh0LnJlZnJlc2hfdG9rZW4sbix5KSxkZWxldGUgdC5yZWZyZXNoX3Rva2VuKTpmdW5jdGlvbih0LGUpe2RlbGV0ZSBzW3UodCxlKV19KG4seSksaC5wb3N0TWVzc2FnZSh7b2s6dy5vayxqc29uOnR9KSxbMyw4XTtjYXNlIDc6cmV0dXJuIF89by5zZW50KCksaC5wb3N0TWVzc2FnZSh7b2s6ITEsanNvbjp7ZXJyb3JfZGVzY3JpcHRpb246Xy5tZXNzYWdlfX0pLFszLDhdO2Nhc2UgODpyZXR1cm5bMl19dmFyIGcsbSxrLFB9KSl9KSl9KSl9KCk7Cgo=",Ta=null,Ca=!1,function(e){return ja=ja||Oa(xa,Ta,Ca),new Worker(ja,e)}),La={},Wa=function(){function e(e,t){this.cache=e,this.clientId=t,this.manifestKey=this.createManifestKeyFrom(this.clientId);}return e.prototype.add=function(e){var t;return o(this,void 0,void 0,(function(){var n,r;return i(this,(function(o){switch(o.label){case 0:return r=Set.bind,[4,this.cache.get(this.manifestKey)];case 1:return (n=new(r.apply(Set,[void 0,(null===(t=o.sent())||void 0===t?void 0:t.keys)||[]]))).add(e),[4,this.cache.set(this.manifestKey,{keys:a([],c(n),!1)})];case 2:return o.sent(),[2]}}))}))},e.prototype.remove=function(e){return o(this,void 0,void 0,(function(){var t,n;return i(this,(function(r){switch(r.label){case 0:return [4,this.cache.get(this.manifestKey)];case 1:return (t=r.sent())?((n=new Set(t.keys)).delete(e),n.size>0?[4,this.cache.set(this.manifestKey,{keys:a([],c(n),!1)})]:[3,3]):[3,5];case 2:case 4:return [2,r.sent()];case 3:return [4,this.cache.remove(this.manifestKey)];case 5:return [2]}}))}))},e.prototype.get=function(){return this.cache.get(this.manifestKey)},e.prototype.clear=function(){return this.cache.remove(this.manifestKey)},e.prototype.createManifestKeyFrom=function(e){return "".concat("@@auth0spajs@@","::").concat(e)},e}(),Za=new Ec,Ea={memory:function(){return (new da).enclosedCache},localstorage:function(){return new fa}},Ga=function(e){return Ea[e]},Pa=function(){return !/Trident.*rv:11\.0/.test(navigator.userAgent)},Aa=function(){function e(e){var t,n,c,a,s=this;if(this.options=e,this._releaseLockOnPageHide=function(){return o(s,void 0,void 0,(function(){return i(this,(function(e){switch(e.label){case 0:return [4,Za.releaseLock("auth0.lock.getTokenSilently")];case 1:return e.sent(),window.removeEventListener("pagehide",this._releaseLockOnPageHide),[2]}}))}))},"undefined"!=typeof window&&function(){if(!Vc())throw new Error("For security reasons, `window.crypto` is required to run `auth0-spa-js`.");if(void 0===zc())throw new Error("\n      auth0-spa-js must run on a secure origin. See https://github.com/auth0/auth0-spa-js/blob/master/FAQ.md#why-do-i-get-auth0-spa-js-must-run-on-a-secure-origin for more information.\n    ")}(),e.cache&&e.cacheLocation&&console.warn("Both `cache` and `cacheLocation` options have been specified in the Auth0Client configuration; ignoring `cacheLocation` and using `cache`."),e.cache)c=e.cache;else {if(this.cacheLocation=e.cacheLocation||"memory",!Ga(this.cacheLocation))throw new Error('Invalid cache location "'.concat(this.cacheLocation,'"'));c=Ga(this.cacheLocation)();}this.httpTimeoutMs=e.httpTimeoutInSeconds?1e3*e.httpTimeoutInSeconds:1e4,this.cookieStorage=!1===e.legacySameSiteCookie?ka:_a,this.orgHintCookieName=(a=this.options.client_id,"auth0.".concat(a,".organization_hint")),this.isAuthenticatedCookieName=function(e){return "auth0.".concat(e,".is.authenticated")}(this.options.client_id),this.sessionCheckExpiryDays=e.sessionCheckExpiryDays||1;var u,l=e.useCookiesForTransactions?this.cookieStorage:Ia;this.scope=this.options.scope,this.transactionManager=new pa(l,this.options.client_id),this.nowProvider=this.options.nowProvider||Xc,this.cacheManager=new ha(c,c.allKeys?null:new Wa(c,this.options.client_id),this.nowProvider),this.domainUrl=(u=this.options.domain,/^https?:\/\//.test(u)?u:"https://".concat(u)),this.tokenIssuer=function(e,t){return e?e.startsWith("https://")?e:"https://".concat(e,"/"):"".concat(t,"/")}(this.options.issuer,this.domainUrl),this.defaultScope=ua("openid",void 0!==(null===(n=null===(t=this.options)||void 0===t?void 0:t.advancedOptions)||void 0===n?void 0:n.defaultScope)?this.options.advancedOptions.defaultScope:"openid profile email"),this.options.useRefreshTokens&&(this.scope=ua(this.scope,"offline_access")),"undefined"!=typeof window&&window.Worker&&this.options.useRefreshTokens&&"memory"===this.cacheLocation&&Pa()&&(this.worker=new Ra),this.customOptions=function(e){return e.advancedOptions,e.audience,e.auth0Client,e.authorizeTimeoutInSeconds,e.cacheLocation,e.cache,e.client_id,e.domain,e.issuer,e.leeway,e.max_age,e.nowProvider,e.redirect_uri,e.scope,e.useRefreshTokens,e.useRefreshTokensFallback,e.useCookiesForTransactions,e.useFormData,r(e,["advancedOptions","audience","auth0Client","authorizeTimeoutInSeconds","cacheLocation","cache","client_id","domain","issuer","leeway","max_age","nowProvider","redirect_uri","scope","useRefreshTokens","useRefreshTokensFallback","useCookiesForTransactions","useFormData"])}(e),this.useRefreshTokensFallback=!1!==this.options.useRefreshTokensFallback;}return e.prototype._url=function(e){var t=encodeURIComponent(btoa(JSON.stringify(this.options.auth0Client||Ac)));return "".concat(this.domainUrl).concat(e,"&auth0Client=").concat(t)},e.prototype._getParams=function(e,t,o,i,c){var a=this.options;a.useRefreshTokens,a.useCookiesForTransactions,a.useFormData,a.auth0Client,a.cacheLocation,a.advancedOptions,a.detailedResponse,a.nowProvider,a.authorizeTimeoutInSeconds,a.legacySameSiteCookie,a.sessionCheckExpiryDays,a.domain,a.leeway,a.httpTimeoutInSeconds;var s=r(a,["useRefreshTokens","useCookiesForTransactions","useFormData","auth0Client","cacheLocation","advancedOptions","detailedResponse","nowProvider","authorizeTimeoutInSeconds","legacySameSiteCookie","sessionCheckExpiryDays","domain","leeway","httpTimeoutInSeconds"]);return n(n(n({},s),e),{scope:ua(this.defaultScope,this.scope,e.scope),response_type:"code",response_mode:"query",state:t,nonce:o,redirect_uri:c||this.options.redirect_uri,code_challenge:i,code_challenge_method:"S256"})},e.prototype._authorizeUrl=function(e){return this._url("/authorize?".concat(Qc(e)))},e.prototype._verifyIdToken=function(e,t,n){return o(this,void 0,void 0,(function(){var r;return i(this,(function(o){switch(o.label){case 0:return [4,this.nowProvider()];case 1:return r=o.sent(),[2,ma({iss:this.tokenIssuer,aud:this.options.client_id,id_token:e,nonce:t,organizationId:n,leeway:this.options.leeway,max_age:this._parseNumber(this.options.max_age),now:r})]}}))}))},e.prototype._parseNumber=function(e){return "string"!=typeof e?e:parseInt(e,10)||void 0},e.prototype._processOrgIdHint=function(e){e?this.cookieStorage.save(this.orgHintCookieName,e,{daysUntilExpire:this.sessionCheckExpiryDays,cookieDomain:this.options.cookieDomain}):this.cookieStorage.remove(this.orgHintCookieName,{cookieDomain:this.options.cookieDomain});},e.prototype.buildAuthorizeUrl=function(e){return void 0===e&&(e={}),o(this,void 0,void 0,(function(){var t,o,c,a,s,u,l,f,d,h,p,y;return i(this,(function(i){switch(i.label){case 0:return t=e.redirect_uri,o=e.appState,c=r(e,["redirect_uri","appState"]),a=Bc(Mc()),s=Bc(Mc()),u=Mc(),[4,qc(u)];case 1:return l=i.sent(),f=ea(l),d=e.fragment?"#".concat(e.fragment):"",h=this._getParams(c,a,s,f,t),p=this._authorizeUrl(h),y=e.organization||this.options.organization,this.transactionManager.create(n({nonce:s,code_verifier:u,appState:o,scope:h.scope,audience:h.audience||"default",redirect_uri:h.redirect_uri,state:a},y&&{organizationId:y})),[2,p+d]}}))}))},e.prototype.loginWithPopup=function(e,t){return o(this,void 0,void 0,(function(){var o,c,a,s,u,l,f,d,h,p,y,v,m;return i(this,(function(i){switch(i.label){case 0:if(e=e||{},!(t=t||{}).popup&&(t.popup=function(e){var t=window.screenX+(window.innerWidth-400)/2,n=window.screenY+(window.innerHeight-600)/2;return window.open(e,"auth0:authorize:popup","left=".concat(t,",top=").concat(n,",width=").concat(400,",height=").concat(600,",resizable,scrollbars=yes,status=1"))}(""),!t.popup))throw new Error("Unable to open a popup for loginWithPopup - window.open returned `null`");return o=r(e,[]),c=Bc(Mc()),a=Bc(Mc()),s=Mc(),[4,qc(s)];case 1:return u=i.sent(),l=ea(u),f=this._getParams(o,c,a,l,this.options.redirect_uri||window.location.origin),d=this._authorizeUrl(n(n({},f),{response_mode:"web_message"})),t.popup.location.href=d,[4,Jc(n(n({},t),{timeoutInSeconds:t.timeoutInSeconds||this.options.authorizeTimeoutInSeconds||60}))];case 2:if(h=i.sent(),c!==h.state)throw new Error("Invalid state");return [4,aa({audience:f.audience,scope:f.scope,baseUrl:this.domainUrl,client_id:this.options.client_id,code_verifier:s,code:h.code,grant_type:"authorization_code",redirect_uri:f.redirect_uri,auth0Client:this.options.auth0Client,useFormData:this.options.useFormData,timeout:this.httpTimeoutMs},this.worker)];case 3:return p=i.sent(),y=e.organization||this.options.organization,[4,this._verifyIdToken(p.id_token,a,y)];case 4:return v=i.sent(),m=n(n({},p),{decodedToken:v,scope:f.scope,audience:f.audience||"default",client_id:this.options.client_id}),[4,this.cacheManager.set(m)];case 5:return i.sent(),this.cookieStorage.save(this.isAuthenticatedCookieName,!0,{daysUntilExpire:this.sessionCheckExpiryDays,cookieDomain:this.options.cookieDomain}),this._processOrgIdHint(v.claims.org_id),[2]}}))}))},e.prototype.getUser=function(e){return void 0===e&&(e={}),o(this,void 0,void 0,(function(){var t,n,r;return i(this,(function(o){switch(o.label){case 0:return t=e.audience||this.options.audience||"default",n=ua(this.defaultScope,this.scope,e.scope),[4,this.cacheManager.get(new la({client_id:this.options.client_id,audience:t,scope:n}))];case 1:return [2,(r=o.sent())&&r.decodedToken&&r.decodedToken.user]}}))}))},e.prototype.getIdTokenClaims=function(e){return void 0===e&&(e={}),o(this,void 0,void 0,(function(){var t,n,r;return i(this,(function(o){switch(o.label){case 0:return t=e.audience||this.options.audience||"default",n=ua(this.defaultScope,this.scope,e.scope),[4,this.cacheManager.get(new la({client_id:this.options.client_id,audience:t,scope:n}))];case 1:return [2,(r=o.sent())&&r.decodedToken&&r.decodedToken.claims]}}))}))},e.prototype.loginWithRedirect=function(e){return void 0===e&&(e={}),o(this,void 0,void 0,(function(){var t,n,o;return i(this,(function(i){switch(i.label){case 0:return t=e.redirectMethod,n=r(e,["redirectMethod"]),[4,this.buildAuthorizeUrl(n)];case 1:return o=i.sent(),window.location[t||"assign"](o),[2]}}))}))},e.prototype.handleRedirectCallback=function(e){return void 0===e&&(e=window.location.href),o(this,void 0,void 0,(function(){var t,r,o,a,s,u,l,f,d,h;return i(this,(function(i){switch(i.label){case 0:if(0===(t=e.split("?").slice(1)).length)throw new Error("There are no query params available for parsing.");if(r=function(e){e.indexOf("#")>-1&&(e=e.substr(0,e.indexOf("#")));var t=e.split("&"),n={};return t.forEach((function(e){var t=c(e.split("="),2),r=t[0],o=t[1];n[r]=decodeURIComponent(o);})),n.expires_in&&(n.expires_in=parseInt(n.expires_in)),n}(t.join("")),o=r.state,a=r.code,s=r.error,u=r.error_description,!(l=this.transactionManager.get()))throw new Error("Invalid state");if(this.transactionManager.remove(),s)throw new Kc(s,u,o,l.appState);if(!l.code_verifier||l.state&&l.state!==o)throw new Error("Invalid state");return f={audience:l.audience,scope:l.scope,baseUrl:this.domainUrl,client_id:this.options.client_id,code_verifier:l.code_verifier,grant_type:"authorization_code",code:a,auth0Client:this.options.auth0Client,useFormData:this.options.useFormData,timeout:this.httpTimeoutMs},void 0!==l.redirect_uri&&(f.redirect_uri=l.redirect_uri),[4,aa(f,this.worker)];case 1:return d=i.sent(),[4,this._verifyIdToken(d.id_token,l.nonce,l.organizationId)];case 2:return h=i.sent(),[4,this.cacheManager.set(n(n(n(n({},d),{decodedToken:h,audience:l.audience,scope:l.scope}),d.scope?{oauthTokenScope:d.scope}:null),{client_id:this.options.client_id}))];case 3:return i.sent(),this.cookieStorage.save(this.isAuthenticatedCookieName,!0,{daysUntilExpire:this.sessionCheckExpiryDays,cookieDomain:this.options.cookieDomain}),this._processOrgIdHint(h.claims.org_id),[2,{appState:l.appState}]}}))}))},e.prototype.checkSession=function(e){return o(this,void 0,void 0,(function(){var t;return i(this,(function(n){switch(n.label){case 0:if(!this.cookieStorage.get(this.isAuthenticatedCookieName)){if(!this.cookieStorage.get("auth0.is.authenticated"))return [2];this.cookieStorage.save(this.isAuthenticatedCookieName,!0,{daysUntilExpire:this.sessionCheckExpiryDays,cookieDomain:this.options.cookieDomain}),this.cookieStorage.remove("auth0.is.authenticated");}n.label=1;case 1:return n.trys.push([1,3,,4]),[4,this.getTokenSilently(e)];case 2:return n.sent(),[3,4];case 3:if(t=n.sent(),!Pc.includes(t.error))throw t;return [3,4];case 4:return [2]}}))}))},e.prototype.getTokenSilently=function(e){return void 0===e&&(e={}),o(this,void 0,void 0,(function(){var t,o,c,a,s=this;return i(this,(function(i){switch(i.label){case 0:return t=n(n({audience:this.options.audience,ignoreCache:!1},e),{scope:ua(this.defaultScope,this.scope,e.scope)}),o=t.ignoreCache,c=r(t,["ignoreCache"]),[4,(u=function(){return s._getTokenSilently(n({ignoreCache:o},c))},l="".concat(this.options.client_id,"::").concat(c.audience,"::").concat(c.scope),f=La[l],f||(f=u().finally((function(){delete La[l],f=null;})),La[l]=f),f)];case 1:return a=i.sent(),[2,e.detailedResponse?a:a.access_token]}var u,l,f;}))}))},e.prototype._getTokenSilently=function(e){return void 0===e&&(e={}),o(this,void 0,void 0,(function(){var t,c,a,s,u,l,f,d,h;return i(this,(function(p){switch(p.label){case 0:return t=e.ignoreCache,c=r(e,["ignoreCache"]),t?[3,2]:[4,this._getEntryFromCache({scope:c.scope,audience:c.audience||"default",client_id:this.options.client_id})];case 1:if(a=p.sent())return [2,a];p.label=2;case 2:return [4,(y=function(){return Za.acquireLock("auth0.lock.getTokenSilently",5e3)},v=10,void 0===v&&(v=3),o(void 0,void 0,void 0,(function(){var e;return i(this,(function(t){switch(t.label){case 0:e=0,t.label=1;case 1:return e<v?[4,y()]:[3,4];case 2:if(t.sent())return [2,!0];t.label=3;case 3:return e++,[3,1];case 4:return [2,!1]}}))})))];case 3:if(!p.sent())return [3,15];p.label=4;case 4:return p.trys.push([4,,12,14]),window.addEventListener("pagehide",this._releaseLockOnPageHide),t?[3,6]:[4,this._getEntryFromCache({scope:c.scope,audience:c.audience||"default",client_id:this.options.client_id})];case 5:if(a=p.sent())return [2,a];p.label=6;case 6:return this.options.useRefreshTokens?[4,this._getTokenUsingRefreshToken(c)]:[3,8];case 7:return u=p.sent(),[3,10];case 8:return [4,this._getTokenFromIFrame(c)];case 9:u=p.sent(),p.label=10;case 10:return s=u,[4,this.cacheManager.set(n({client_id:this.options.client_id},s))];case 11:return p.sent(),this.cookieStorage.save(this.isAuthenticatedCookieName,!0,{daysUntilExpire:this.sessionCheckExpiryDays,cookieDomain:this.options.cookieDomain}),l=s.id_token,f=s.access_token,d=s.oauthTokenScope,h=s.expires_in,[2,n(n({id_token:l,access_token:f},d?{scope:d}:null),{expires_in:h})];case 12:return [4,Za.releaseLock("auth0.lock.getTokenSilently")];case 13:return p.sent(),window.removeEventListener("pagehide",this._releaseLockOnPageHide),[7];case 14:return [3,16];case 15:throw new Nc;case 16:return [2]}var y,v;}))}))},e.prototype.getTokenWithPopup=function(e,t){return void 0===e&&(e={}),void 0===t&&(t={}),o(this,void 0,void 0,(function(){return i(this,(function(r){switch(r.label){case 0:return e.audience=e.audience||this.options.audience,e.scope=ua(this.defaultScope,this.scope,e.scope),t=n(n({},Gc),t),[4,this.loginWithPopup(e,t)];case 1:return r.sent(),[4,this.cacheManager.get(new la({scope:e.scope,audience:e.audience||"default",client_id:this.options.client_id}))];case 2:return [2,r.sent().access_token]}}))}))},e.prototype.isAuthenticated=function(){return o(this,void 0,void 0,(function(){return i(this,(function(e){switch(e.label){case 0:return [4,this.getUser()];case 1:return [2,!!e.sent()]}}))}))},e.prototype.buildLogoutUrl=function(e){void 0===e&&(e={}),null!==e.client_id?e.client_id=e.client_id||this.options.client_id:delete e.client_id;var t=e.federated,n=r(e,["federated"]),o=t?"&federated":"";return this._url("/v2/logout?".concat(Qc(n)))+o},e.prototype.logout=function(e){var t=this;void 0===e&&(e={});var n=e.localOnly,o=r(e,["localOnly"]);if(n&&o.federated)throw new Error("It is invalid to set both the `federated` and `localOnly` options to `true`");var i=function(){if(t.cookieStorage.remove(t.orgHintCookieName,{cookieDomain:t.options.cookieDomain}),t.cookieStorage.remove(t.isAuthenticatedCookieName,{cookieDomain:t.options.cookieDomain}),!n){var e=t.buildLogoutUrl(o);window.location.assign(e);}};if(this.options.cache)return this.cacheManager.clear().then((function(){return i()}));this.cacheManager.clearSync(),i();},e.prototype._getTokenFromIFrame=function(e){return o(this,void 0,void 0,(function(){var t,o,c,a,s,u,l,f,d,h,p,y,v,m,b,g,w;return i(this,(function(i){switch(i.label){case 0:return t=Bc(Mc()),o=Bc(Mc()),c=Mc(),[4,qc(c)];case 1:a=i.sent(),s=ea(a),u=r(e,["detailedResponse"]),l=this._getParams(u,t,o,s,e.redirect_uri||this.options.redirect_uri||window.location.origin),(f=this.cookieStorage.get(this.orgHintCookieName))&&!l.organization&&(l.organization=f),d=this._authorizeUrl(n(n({},l),{prompt:"none",response_mode:"web_message"})),i.label=2;case 2:if(i.trys.push([2,6,,7]),window.crossOriginIsolated)throw new Fc("login_required","The application is running in a Cross-Origin Isolated context, silently retrieving a token without refresh token is not possible.");return h=e.timeoutInSeconds||this.options.authorizeTimeoutInSeconds,[4,(S=d,k=this.domainUrl,_=h,void 0===_&&(_=60),new Promise((function(e,t){var n=window.document.createElement("iframe");n.setAttribute("width","0"),n.setAttribute("height","0"),n.style.display="none";var r,o=function(){window.document.body.contains(n)&&(window.document.body.removeChild(n),window.removeEventListener("message",r,!1));},i=setTimeout((function(){t(new Nc),o();}),1e3*_);r=function(n){if(n.origin==k&&n.data&&"authorization_response"===n.data.type){var c=n.source;c&&c.close(),n.data.response.error?t(Fc.fromPayload(n.data.response)):e(n.data.response),clearTimeout(i),window.removeEventListener("message",r,!1),setTimeout(o,2e3);}},window.addEventListener("message",r,!1),window.document.body.appendChild(n),n.setAttribute("src",S);})))];case 3:if(p=i.sent(),t!==p.state)throw new Error("Invalid state");return y=e.scope,v=e.audience,m=r(e,["scope","audience","redirect_uri","ignoreCache","timeoutInSeconds","detailedResponse"]),[4,aa(n(n(n({},this.customOptions),m),{scope:y,audience:v,baseUrl:this.domainUrl,client_id:this.options.client_id,code_verifier:c,code:p.code,grant_type:"authorization_code",redirect_uri:l.redirect_uri,auth0Client:this.options.auth0Client,useFormData:this.options.useFormData,timeout:m.timeout||this.httpTimeoutMs}),this.worker)];case 4:return b=i.sent(),[4,this._verifyIdToken(b.id_token,o)];case 5:return g=i.sent(),this._processOrgIdHint(g.claims.org_id),[2,n(n({},b),{decodedToken:g,scope:l.scope,oauthTokenScope:b.scope,audience:l.audience||"default"})];case 6:throw "login_required"===(w=i.sent()).error&&this.logout({localOnly:!0}),w;case 7:return [2]}var S,k,_;}))}))},e.prototype._getTokenUsingRefreshToken=function(e){return o(this,void 0,void 0,(function(){var t,o,c,a,s,u,l,f,d;return i(this,(function(i){switch(i.label){case 0:return e.scope=ua(this.defaultScope,this.options.scope,e.scope),[4,this.cacheManager.get(new la({scope:e.scope,audience:e.audience||"default",client_id:this.options.client_id}))];case 1:return (t=i.sent())&&t.refresh_token||this.worker?[3,4]:this.useRefreshTokensFallback?[4,this._getTokenFromIFrame(e)]:[3,3];case 2:return [2,i.sent()];case 3:throw new Yc(e.audience||"default",e.scope);case 4:o=e.redirect_uri||this.options.redirect_uri||window.location.origin,a=e.scope,s=e.audience,u=r(e,["scope","audience","ignoreCache","timeoutInSeconds","detailedResponse"]),l="number"==typeof e.timeoutInSeconds?1e3*e.timeoutInSeconds:null,i.label=5;case 5:return i.trys.push([5,7,,10]),[4,aa(n(n(n(n(n({},this.customOptions),u),{audience:s,scope:a,baseUrl:this.domainUrl,client_id:this.options.client_id,grant_type:"refresh_token",refresh_token:t&&t.refresh_token,redirect_uri:o}),l&&{timeout:l}),{auth0Client:this.options.auth0Client,useFormData:this.options.useFormData,timeout:this.httpTimeoutMs}),this.worker)];case 6:return c=i.sent(),[3,10];case 7:return ((f=i.sent()).message.indexOf("Missing Refresh Token")>-1||f.message&&f.message.indexOf("invalid refresh token")>-1)&&this.useRefreshTokensFallback?[4,this._getTokenFromIFrame(e)]:[3,9];case 8:return [2,i.sent()];case 9:throw f;case 10:return [4,this._verifyIdToken(c.id_token)];case 11:return d=i.sent(),[2,n(n({},c),{decodedToken:d,scope:e.scope,oauthTokenScope:c.scope,audience:e.audience||"default"})]}}))}))},e.prototype._getEntryFromCache=function(e){var t=e.scope,r=e.audience,c=e.client_id;return o(this,void 0,void 0,(function(){var e,o,a,s,u;return i(this,(function(i){switch(i.label){case 0:return [4,this.cacheManager.get(new la({scope:t,audience:r,client_id:c}),60)];case 1:return (e=i.sent())&&e.access_token?(o=e.id_token,a=e.access_token,s=e.oauthTokenScope,u=e.expires_in,[2,n(n({id_token:o,access_token:a},s?{scope:s}:null),{expires_in:u})]):[2]}}))}))},e}();function Fa(e){return o(this,void 0,void 0,(function(){var t;return i(this,(function(n){switch(n.label){case 0:return [4,(t=new Aa(e)).checkSession()];case 1:return n.sent(),[2,t]}}))}))}

    const config = {
        domain: "dev-aca1jzvuvq36jgj2.eu.auth0.com",
        clientId: "fFMMMBMrsZrzkw7ozXSUy71Pi6m5y1qg"
      };

    let auth0Client;

    async function createClient() {
      auth0Client = await Fa({
        domain: config.domain,
        client_id: config.clientId
      });
    }

    async function loginWithPopup() {
      try {
        await createClient();
        await auth0Client.loginWithPopup();
        user.set(await auth0Client.getUser());
        const claims = await auth0Client.getIdTokenClaims();
        const id_token = await claims.__raw;
        jwt_token.set(id_token);
        console.log(id_token);
        isAuthenticated.set(true);
      } catch (e) {
        console.error(e);
      } 
    }

    function logout() {
      return auth0Client.logout();
    }

    const auth = {
      createClient,
      loginWithPopup,
      logout
    };

    /* src\App.svelte generated by Svelte v3.53.1 */
    const file = "src\\App.svelte";

    // (27:5) {#if $isAuthenticated}
    function create_if_block_3(ctx) {
    	let li;
    	let a;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/images/home.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", "30");
    			attr_dev(img, "height", "30");
    			attr_dev(img, "class", "d-inline-block align-top");
    			attr_dev(img, "alt", "");
    			add_location(img, file, 29, 8, 883);
    			attr_dev(a, "class", "navbar-brand");
    			attr_dev(a, "href", "/#");
    			add_location(a, file, 28, 7, 839);
    			attr_dev(li, "class", "nav-item");
    			add_location(li, file, 27, 6, 809);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(27:5) {#if $isAuthenticated}",
    		ctx
    	});

    	return block;
    }

    // (45:5) {#if $isAuthenticated && $user.user_roles.includes("admin")}
    function create_if_block_2(ctx) {
    	let li;
    	let a;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			a.textContent = "Users";
    			attr_dev(a, "class", "nav-link");
    			attr_dev(a, "href", "#/users");
    			add_location(a, file, 46, 7, 1286);
    			attr_dev(li, "class", "nav-item");
    			add_location(li, file, 45, 6, 1256);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(45:5) {#if $isAuthenticated && $user.user_roles.includes(\\\"admin\\\")}",
    		ctx
    	});

    	return block;
    }

    // (50:5) {#if $isAuthenticated && !$user.user_roles.includes("buyer")}
    function create_if_block_1(ctx) {
    	let li;
    	let a;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			a.textContent = "Utilities";
    			attr_dev(a, "class", "nav-link");
    			attr_dev(a, "href", "#/utilities");
    			add_location(a, file, 51, 7, 1461);
    			attr_dev(li, "class", "nav-item");
    			add_location(li, file, 50, 6, 1431);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(50:5) {#if $isAuthenticated && !$user.user_roles.includes(\\\"buyer\\\")}",
    		ctx
    	});

    	return block;
    }

    // (69:5) {:else}
    function create_else_block(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Log In";
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "my-button");
    			add_location(button, file, 69, 6, 1889);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", auth.loginWithPopup, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(69:5) {:else}",
    		ctx
    	});

    	return block;
    }

    // (59:5) {#if $isAuthenticated}
    function create_if_block(ctx) {
    	let span;
    	let a;
    	let t0_value = /*$user*/ ctx[1].name + "";
    	let t0;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			button = element("button");
    			button.textContent = "Log Out";
    			attr_dev(a, "class", "nav-link");
    			attr_dev(a, "href", "#/account");
    			add_location(a, file, 60, 7, 1671);
    			attr_dev(span, "class", "navbar-text me-2");
    			add_location(span, file, 59, 6, 1631);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "my-button");
    			add_location(button, file, 63, 6, 1756);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, a);
    			append_dev(a, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", auth.logout, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$user*/ 2 && t0_value !== (t0_value = /*$user*/ ctx[1].name + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(59:5) {#if $isAuthenticated}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div4;
    	let nav;
    	let div2;
    	let a0;
    	let t1;
    	let button;
    	let span;
    	let t2;
    	let div1;
    	let ul;
    	let t3;
    	let li;
    	let a1;
    	let t5;
    	let show_if_1 = /*$isAuthenticated*/ ctx[0] && /*$user*/ ctx[1].user_roles.includes("admin");
    	let t6;
    	let show_if = /*$isAuthenticated*/ ctx[0] && !/*$user*/ ctx[1].user_roles.includes("buyer");
    	let t7;
    	let div0;
    	let t8;
    	let div3;
    	let router;
    	let current;
    	let if_block0 = /*$isAuthenticated*/ ctx[0] && create_if_block_3(ctx);
    	let if_block1 = show_if_1 && create_if_block_2(ctx);
    	let if_block2 = show_if && create_if_block_1(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*$isAuthenticated*/ ctx[0]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block3 = current_block_type(ctx);
    	router = new Router({ props: { routes }, $$inline: true });

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			nav = element("nav");
    			div2 = element("div");
    			a0 = element("a");
    			a0.textContent = "Power Puff";
    			t1 = space();
    			button = element("button");
    			span = element("span");
    			t2 = space();
    			div1 = element("div");
    			ul = element("ul");
    			if (if_block0) if_block0.c();
    			t3 = space();
    			li = element("li");
    			a1 = element("a");
    			a1.textContent = "Products";
    			t5 = space();
    			if (if_block1) if_block1.c();
    			t6 = space();
    			if (if_block2) if_block2.c();
    			t7 = space();
    			div0 = element("div");
    			if_block3.c();
    			t8 = space();
    			div3 = element("div");
    			create_component(router.$$.fragment);
    			attr_dev(a0, "class", "navbar-brand");
    			attr_dev(a0, "href", "#/");
    			add_location(a0, file, 11, 3, 305);
    			attr_dev(span, "class", "navbar-toggler-icon");
    			add_location(span, file, 21, 4, 602);
    			attr_dev(button, "class", "navbar-toggler");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "data-bs-toggle", "collapse");
    			attr_dev(button, "data-bs-target", "#navbarTogglerDemo01");
    			attr_dev(button, "aria-controls", "navbarTogglerDemo01");
    			attr_dev(button, "aria-expanded", "false");
    			attr_dev(button, "aria-label", "Toggle navigation");
    			add_location(button, file, 12, 3, 358);
    			attr_dev(a1, "class", "nav-link");
    			attr_dev(a1, "href", "#/products");
    			add_location(a1, file, 41, 6, 1111);
    			attr_dev(li, "class", "nav-item");
    			add_location(li, file, 40, 5, 1082);
    			attr_dev(ul, "class", "navbar-nav me-auto mb-2 mb-lg-0");
    			add_location(ul, file, 25, 4, 728);
    			attr_dev(div0, "class", "d-flex");
    			add_location(div0, file, 57, 4, 1574);
    			attr_dev(div1, "class", "collapse navbar-collapse");
    			attr_dev(div1, "id", "navbarTogglerDemo01");
    			add_location(div1, file, 24, 3, 659);
    			attr_dev(div2, "class", "container-fluid");
    			add_location(div2, file, 10, 2, 271);
    			attr_dev(nav, "class", "navbar navbar-expand-lg bg-light");
    			add_location(nav, file, 9, 1, 221);
    			attr_dev(div3, "class", "container");
    			add_location(div3, file, 80, 1, 2066);
    			attr_dev(div4, "id", "app");
    			add_location(div4, file, 7, 0, 186);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, nav);
    			append_dev(nav, div2);
    			append_dev(div2, a0);
    			append_dev(div2, t1);
    			append_dev(div2, button);
    			append_dev(button, span);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, ul);
    			if (if_block0) if_block0.m(ul, null);
    			append_dev(ul, t3);
    			append_dev(ul, li);
    			append_dev(li, a1);
    			append_dev(ul, t5);
    			if (if_block1) if_block1.m(ul, null);
    			append_dev(ul, t6);
    			if (if_block2) if_block2.m(ul, null);
    			append_dev(div1, t7);
    			append_dev(div1, div0);
    			if_block3.m(div0, null);
    			append_dev(div4, t8);
    			append_dev(div4, div3);
    			mount_component(router, div3, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$isAuthenticated*/ ctx[0]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					if_block0.m(ul, t3);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*$isAuthenticated, $user*/ 3) show_if_1 = /*$isAuthenticated*/ ctx[0] && /*$user*/ ctx[1].user_roles.includes("admin");

    			if (show_if_1) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					if_block1.m(ul, t6);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*$isAuthenticated, $user*/ 3) show_if = /*$isAuthenticated*/ ctx[0] && !/*$user*/ ctx[1].user_roles.includes("buyer");

    			if (show_if) {
    				if (if_block2) ; else {
    					if_block2 = create_if_block_1(ctx);
    					if_block2.c();
    					if_block2.m(ul, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block3) {
    				if_block3.p(ctx, dirty);
    			} else {
    				if_block3.d(1);
    				if_block3 = current_block_type(ctx);

    				if (if_block3) {
    					if_block3.c();
    					if_block3.m(div0, null);
    				}
    			}
    		},
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
    			if (detaching) detach_dev(div4);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if_block3.d();
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
    	let $isAuthenticated;
    	let $user;
    	validate_store(isAuthenticated, 'isAuthenticated');
    	component_subscribe($$self, isAuthenticated, $$value => $$invalidate(0, $isAuthenticated = $$value));
    	validate_store(user, 'user');
    	component_subscribe($$self, user, $$value => $$invalidate(1, $user = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Router,
    		routes,
    		isAuthenticated,
    		user,
    		auth,
    		$isAuthenticated,
    		$user
    	});

    	return [$isAuthenticated, $user];
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
