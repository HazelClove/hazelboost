const api = typeof browser !== "undefined" ? browser : chrome;
const DEFAULT_STATE = { enabled: true, whitelist: [], blacklist: [], blockGsap: false, blockWebgl: false };
const $toggle = document.getElementById("toggle");
const $blockGsap = document.getElementById("blockGsap");
const $blockWebgl = document.getElementById("blockWebgl");
const $whitelist = document.getElementById("whitelist");
const $blacklist = document.getElementById("blacklist");
const $pill = document.getElementById("status-pill");
const $statusText = document.getElementById("status-text");
const $addWhite = document.getElementById("add-white");
const $addBlack = document.getElementById("add-black");

let currentHost = "";

const splitList = (text) => text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
const joinList = (arr) => (arr || []).join("\n");
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

const setPill = (type, text) => {
    $pill.className = `status-pill ${type}`;
    $statusText.textContent = text;
};

const updateUI = (cfg) => {
    if (!currentHost) return setPill("off", "No active website");
    if (matchesList(currentHost, cfg.blacklist)) return setPill("blacklisted", `Blacklisted: ${currentHost}`);
    if (matchesList(currentHost, cfg.whitelist)) return setPill("active", `Whitelisted: ${currentHost}`);
    if (cfg.enabled) return setPill("active", `Active on ${currentHost}`);
    setPill("off", `Off on ${currentHost}`);
};

const saveState = () => {
    const payload = {
        enabled: $toggle.checked,
        whitelist: splitList($whitelist.value),
        blacklist: splitList($blacklist.value),
        blockGsap: $blockGsap.checked,
        blockWebgl: $blockWebgl.checked
    };
    api.storage.sync.set(payload, () => {
        if (!api.runtime.lastError) updateUI(payload);
    });
};

let saveTimer = null;
const debouncedSave = () => { clearTimeout(saveTimer); saveTimer = setTimeout(saveState, 300); };

const addToList = (textarea, host) => {
    if (!host) return;
    const list = splitList(textarea.value);
    if (!list.includes(host)) {
        list.push(host);
        textarea.value = joinList(list);
        saveState();
    }
};

$addWhite.addEventListener("click", () => addToList($whitelist, currentHost));
$addBlack.addEventListener("click", () => addToList($blacklist, currentHost));
$toggle.addEventListener("change", saveState);
$blockGsap.addEventListener("change", saveState);
$blockWebgl.addEventListener("change", saveState);
$whitelist.addEventListener("input", debouncedSave);
$blacklist.addEventListener("input", debouncedSave);

const canvas = document.getElementById("graph");
const ctx = canvas.getContext("2d");
let t = 0;

function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = $toggle.checked ? "#ff453a" : "#30d158";
    ctx.lineWidth = 2;
    ctx.beginPath();
    const speed = $toggle.checked ? 0.02 : 0.1;
    t += speed;
    for (let x = 0; x < canvas.width; x++) {
        const y = 15 + Math.sin((x * 0.05) + t) * 10 + Math.cos((x * 0.02) - t) * 5;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    requestAnimationFrame(drawGraph);
}

api.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs && tabs[0];
    if (tab && tab.url) currentHost = hostOf(tab.url);
    api.storage.sync.get(DEFAULT_STATE, (cfg) => {
        $toggle.checked = !!cfg.enabled;
        $blockGsap.checked = !!cfg.blockGsap;
        $blockWebgl.checked = !!cfg.blockWebgl;
        $whitelist.value = joinList(cfg.whitelist);
        $blacklist.value = joinList(cfg.blacklist);
        updateUI(cfg);
        drawGraph();
    });
});
