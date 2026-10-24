const api = typeof browser !== "undefined" ? browser : chrome;
api.runtime.onInstalled.addListener(() => {
    api.storage.sync.get({ enabled: true, whitelist: [], blacklist: [], blockGsap: false, blockWebgl: false }, (cfg) => {
        api.storage.sync.set(cfg);
    });
});
