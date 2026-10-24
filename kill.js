(() => {
    
    const api = typeof browser !== "undefined" ? browser : chrome;
    
    const DEFAULT_STATE = { enabled: true, whitelist: [], blacklist: [], blockGsap: false, blockWebgl: false };
    const hostOf = (url) => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; } };
    const matchesList = (host, list) => {
        if (!host || !Array.isArray(list)) return false;
        return list.some((entry) => {
            if (!entry) return false;
            const e = entry.trim().toLowerCase().replace(/^www\./, "");
            if (!e) return false;
            return host === e || host.endsWith("." + e);
        });
    };
    const host = hostOf(location.href);

    
    let rafPatched = false;
    const origRAF = window.requestAnimationFrame.bind(window);
    const origCAF = window.cancelAnimationFrame.bind(window);
    const pending = new Set();
    let lastTick = 0;
    let currentMinInterval = 1000; 

    const patchedRAF = (cb) => {
        const id = origRAF((t) => {
            pending.delete(id);
            if (currentMinInterval === Infinity) return;
            const now = performance.now();
            if (now - lastTick >= currentMinInterval) {
                lastTick = now;
                try { cb(t); } catch (_) {}
            } else {
                const nextId = patchedRAF(cb);
                pending.add(nextId);
            }
        });
        pending.add(id);
        return id;
    };
    const patchedCAF = (id) => { pending.delete(id); return origCAF(id); };
    const startRafFreeze = () => { if (!rafPatched) { rafPatched = true; window.requestAnimationFrame = patchedRAF; window.cancelAnimationFrame = patchedCAF; } };
    const stopRafFreeze = () => { if (rafPatched) { rafPatched = false; pending.clear(); window.requestAnimationFrame = origRAF; window.cancelAnimationFrame = origCAF; } };

    
    const origSetInterval = window.setInterval;
    let intervalsPatched = false;
    const patchedSetInterval = (fn, delay, ...args) => {
        if (delay !== undefined && delay !== null && delay < 1000) delay = 1000; 
        return origSetInterval(fn, delay, ...args);
    };
    const startIntervalFreeze = () => { if (!intervalsPatched) { intervalsPatched = true; window.setInterval = patchedSetInterval; } };
    const stopIntervalFreeze = () => { if (intervalsPatched) { intervalsPatched = false; window.setInterval = origSetInterval; } };

    
    const origDefineProperty = Object.defineProperty;
    let gsapBlocked = false;
    const applyGsapShim = (block) => {
        gsapBlocked = block;
        if (!block) return;
        const fakeGsap = {
            to: (target, vars) => { if (target) Object.assign(target, vars); return fakeGsap; },
            from: (target, vars) => { return fakeGsap; },
            fromTo: (target, fromVars, toVars) => { if (target) Object.assign(target, toVars); return fakeGsap; },
            set: (target, vars) => { if (target) Object.assign(target, vars); return fakeGsap; },
            timeline: () => {
                const tl = {
                    to: (target, vars) => { if (target) Object.assign(target, vars); return tl; },
                    from: (target, vars) => tl,
                    fromTo: (target, fromVars, toVars) => { if (target) Object.assign(target, toVars); return tl; },
                    set: (target, vars) => { if (target) Object.assign(target, vars); return tl; },
                    add: () => tl, play: () => tl, pause: () => tl, restart: () => tl, seek: () => tl, kill: () => tl, scrollTrigger: () => tl
                };
                return tl;
            },
            registerPlugin: () => {},
            utils: { toArray: (t) => Array.isArray(t) ? t : [t] }
        };
        origDefineProperty(window, 'gsap', {
            get: () => fakeGsap,
            set: () => {},
            configurable: true
        });
    };

    
    let webglBlocked = false;
    const origGetContext = HTMLCanvasElement.prototype.getContext;
    const applyWebglShim = (block) => {
        webglBlocked = block;
        if (block) {
            HTMLCanvasElement.prototype.getContext = function(type, ...args) {
                if (type === "webgl" || type === "experimental-webgl" || type === "webgl2") return null;
                return origGetContext.call(this, type, ...args);
            };
        } else {
            HTMLCanvasElement.prototype.getContext = origGetContext;
        }
    };

    
    const apply = (cfg) => {
        const html = document.documentElement;
        if (!html) return;
        const isBlacklisted = matchesList(host, cfg.blacklist);
        const isWhitelisted = matchesList(host, cfg.whitelist);
        const engage = isBlacklisted ? false : (isWhitelisted ? true : !!cfg.enabled);

        if (engage) {
            html.setAttribute("data-hazelboost", "on");
            currentMinInterval = (cfg.blockGsap || cfg.blockWebgl) ? Infinity : 1000;
            startRafFreeze();
            startIntervalFreeze();
            if (cfg.blockGsap && !gsapBlocked) applyGsapShim(true);
            if (cfg.blockWebgl && !webglBlocked) applyWebglShim(true);
        } else {
            html.removeAttribute("data-hazelboost");
            stopRafFreeze();
            stopIntervalFreeze();
            currentMinInterval = 1000;
            if (gsapBlocked) applyGsapShim(false);
            if (webglBlocked) applyWebglShim(false);
        }
    };

    api.storage.sync.get(DEFAULT_STATE, (cfg) => {
        if (api.runtime.lastError || !cfg) return;
        apply(cfg);
    });

    api.storage.onChanged.addListener((changes, area) => {
        if (area !== "sync") return;
        api.storage.sync.get(DEFAULT_STATE, (cfg) => {
            apply(cfg);
        });
    });
})();
