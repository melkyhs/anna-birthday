const EARLY_ACCESS_PASSWORD = "anjaymabar123";
const LOGIN_FADE_MS = 700;
const RELATIONSHIP_START = new Date(2024, 10, 2, 20, 0, 0).getTime();
const UNLOCK_AT_WITA = Date.UTC(2026, 3, 18, 16, 0, 0);
const STORY_STORAGE_KEY = "anniv-story-progress-v1";
const STORY_GATE_KEY = "anniv-story-gate-v1";
const PAGE_TRANSITION_MS = 420;
const SCENE_ENTER_MS = 620;
const STORY_PAGES = [
    { id: "chapter-1-time", href: "chapter-1.html" },
    { id: "chapter-1-timeline", href: "chapter-1-timeline.html" },
    { id: "chapter-2-gallery", href: "chapter-2.html" },
    { id: "chapter-3-reasons", href: "chapter-3.html" },
    { id: "chapter-3-coupons", href: "chapter-3-coupons.html" },
    { id: "chapter-4-video", href: "chapter-4.html" },
    { id: "chapter-4-letter", href: "chapter-4-letter.html" }
];
const STORY_OVERVIEW = [
    { id: "chapter-1-time", label: "Time Capsule", summary: "Pembuka waktu dan detak cerita." },
    { id: "chapter-1-timeline", label: "Timeline Page", summary: "Urutan momen yang membentuk kita." },
    { id: "chapter-2-gallery", label: "Gallery Page", summary: "Foto-foto yang menyimpan suasana." },
    { id: "chapter-3-reasons", label: "Reasons Page", summary: "Alasan-alasan kecil yang tetap hangat." },
    { id: "chapter-3-coupons", label: "Coupon Deck", summary: "Hadiah kecil yang bisa diklaim." },
    { id: "chapter-4-video", label: "Video Theater", summary: "Momen spesial yang ditahan sampai akhir." },
    { id: "chapter-4-letter", label: "Letter Finale", summary: "Penutup yang dibaca pelan." }
];
const STORY_ORDER = STORY_PAGES.map((page) => page.id);
const STORY_PATH_BY_ID = STORY_PAGES.reduce((accumulator, page) => {
    accumulator[page.id] = page.href;
    return accumulator;
}, {});
const AUTO_MUSIC_KEY = "anniv-auto-music-v1";
const MUSIC_STATE_KEY = "anniv-music-state-v1";
const MUSIC_MANUAL_PAUSE_KEY = "anniv-music-manual-pause-v1";
const isEmbeddedStory = window.self !== window.top;

document.body.classList.add("enhanced");

const loginScreen = document.getElementById("login-screen");
const mainScrapbook = document.getElementById("main-scrapbook");
const answerInput = document.getElementById("answer-input");
const submitBtn = document.getElementById("submit-answer");
const errorMessage = document.getElementById("error-message");
const questionText = document.getElementById("question-text");
const unlockTargetText = document.getElementById("unlock-target-text");
const unlockStatusMessage = document.getElementById("unlock-status-message");
const unlockDaysEl = document.getElementById("unlock-days");
const unlockHoursEl = document.getElementById("unlock-hours");
const unlockMinutesEl = document.getElementById("unlock-minutes");
const unlockSecondsEl = document.getElementById("unlock-seconds");

const musicContainer = document.getElementById("music-container");
const bgMusic = document.getElementById("bg-music");
const musicBtn = document.getElementById("music-btn");
const musicLabel = document.querySelector(".music-pill-text");
const musicIcon = document.querySelector(".music-pill-icon");
const sceneRoot = document.getElementById("story-scene-root");

let daysEl = null;
let hoursEl = null;
let minutesEl = null;
let secondsEl = null;

let reasonText = null;
let generateBtn = null;
let saveReasonBtn = null;
let savedReasonsEl = null;

let galleryCards = [];
let galleryModal = null;
let galleryCloseOverlay = null;
let galleryCloseBtn = null;
let galleryPrevBtn = null;
let galleryNextBtn = null;
let galleryModalImage = null;
let galleryTitle = null;
let galleryCaption = null;

let timelineToggleButtons = [];
let couponClaimButtons = [];

let revealVideoBtn = null;
let videoTeaser = null;
let videoPlayerWrap = null;
let specialVideo = null;

let letterFloatWrapper = null;
let envelopeWrapper = null;
let closeLetterReadBtn = null;
let letterReaderCloseBtn = null;
let readingBackdrop = null;
let letterReaderModal = null;
let letterReaderContent = null;
let audioPop = null;
let audioPaper = null;
let resetStoryProgressBtn = null;
let storyProgressText = document.getElementById("story-progress-text");
let storyProgressBar = document.getElementById("story-progress-bar");
let storyNextText = document.getElementById("story-next-text");
const storyLinks = Array.from(document.querySelectorAll("[data-story-link][data-story-target]"));
let unlockNextButtons = [];
let storyPage = document.body.dataset.storyPage || "intro";

document.body.classList.add(`page-theme-${storyPage}`);

let heartIntervalId = null;
let isMusicPlaying = false;
let lastReasonIndex = -1;
let galleryIndex = 0;
let isLetterOpened = false;
let isLetterAnimating = false;
let isMainViewRevealed = false;
let unlockCountdownIntervalId = null;
let storyUnlockedIndex = 0;
let isPageLeaving = false;
let sceneObserver = null;
let activeSceneTransitionClass = "";
let hasScrollDynamicsBound = false;
let hasTactileFeedbackBound = false;
let hasAtlasParallaxBound = false;

const savedReasons = [];

const galleryItems = galleryCards.map((card) => {
    const image = card.querySelector("img");
    const title = card.querySelector("h3");
    const caption = card.querySelector(".caption");

    return {
        src: image ? image.src : "",
        alt: image ? image.alt : "Gallery image",
        title: title ? title.textContent.trim() : "Memory",
        caption: caption ? caption.textContent.trim() : ""
    };
});

const reasons = [
    "Karena setiap hari terasa lebih ringan saat ada kamu.",
    "Karena kamu selalu tahu cara bikin aku tenang lagi.",
    "Karena kamu itu rumah paling hangat yang aku punya.",
    "Karena kita bisa ngobrol random berjam-jam tanpa bosan.",
    "Karena kamu dukung aku bahkan di hari paling berantakan.",
    "Karena sama kamu, hal sederhana pun terasa mewah.",
    "Karena kamu bikin aku percaya cinta bisa sesederhana ini.",
    "Karena kamu tetap milih aku, lagi dan lagi.",
    "Karena aku suka versi terbaik diriku saat bersamamu.",
    "Karena jatuh cinta ke kamu itu keputusan favoritku."
];

function getStoryPageIndex(pageId) {
    return STORY_ORDER.indexOf(pageId);
}

function loadStoryProgress() {
    const rawValue = window.localStorage.getItem(STORY_STORAGE_KEY);
    const parsed = Number(rawValue);

    if (Number.isNaN(parsed)) {
        return 0;
    }

    return Math.min(Math.max(parsed, 0), STORY_ORDER.length - 1);
}

function hasStoredStoryGateUnlock() {
    return window.sessionStorage.getItem(STORY_GATE_KEY) === "1";
}

function isStoryGateOpen() {
    return hasReachedUnlockTime() || hasStoredStoryGateUnlock();
}

function saveStoryProgress(index) {
    const safeValue = Math.min(Math.max(index, 0), STORY_ORDER.length - 1);
    window.localStorage.setItem(STORY_STORAGE_KEY, String(safeValue));
}

function unlockStoryPage(pageId) {
    const nextIndex = getStoryPageIndex(pageId);
    if (nextIndex === -1 || nextIndex <= storyUnlockedIndex) {
        return;
    }

    storyUnlockedIndex = nextIndex;
    saveStoryProgress(storyUnlockedIndex);
}

function getIntroPath() {
    return window.location.pathname.includes("/pages/") ? "../index.html" : "index.html";
}

function getStoryHref(pageId) {
    const href = STORY_PATH_BY_ID[pageId] || "";
    if (!href) {
        return "";
    }

    return href.startsWith("pages/") ? href : `pages/${href}`;
}

function getStoryBaseHref() {
    return new URL("pages/", window.location.href).href;
}

function normalizeSceneHref(href) {
    let nextHref = href || "";
    if (/^https?:\/\//i.test(nextHref)) {
        const url = new URL(nextHref, window.location.href);
        nextHref = url.pathname.replace(/^\//, "");
    }

    nextHref = nextHref.replace(/^\.\//, "").replace(/^\.\.\//, "");
    if (!nextHref.startsWith("pages/")) {
        nextHref = `pages/${nextHref}`;
    }

    return nextHref;
}

function resolveStoryPageIdFromHref(href) {
    const normalizedHref = normalizeSceneHref(href);
    const match = STORY_PAGES.find((page) => normalizedHref.endsWith(page.href));
    if (match) {
        return match.id;
    }

    if (normalizedHref.endsWith("ringkasan.html")) {
        return "hub-summary";
    }

    return "intro";
}

function getTransitionCharacterClass(pageId) {
    const transitionMap = {
        "chapter-1-time": "scene-trans-memory",
        "chapter-1-timeline": "scene-trans-memory",
        "chapter-2-gallery": "scene-trans-gallery",
        "chapter-3-reasons": "scene-trans-playful",
        "chapter-3-coupons": "scene-trans-playful",
        "chapter-4-video": "scene-trans-cinema",
        "chapter-4-letter": "scene-trans-letter",
        "hub-summary": "scene-trans-memory"
    };

    return transitionMap[pageId] || "scene-trans-memory";
}

function applyTransitionCharacter(targetHref) {
    if (activeSceneTransitionClass) {
        document.body.classList.remove(activeSceneTransitionClass);
    }

    const targetPageId = resolveStoryPageIdFromHref(targetHref);
    activeSceneTransitionClass = getTransitionCharacterClass(targetPageId);
    document.body.classList.add(activeSceneTransitionClass);
}

function getSceneQueryRoot() {
    return sceneRoot || document;
}

function sceneQuery(selector) {
    return getSceneQueryRoot().querySelector(selector);
}

function sceneQueryAll(selector) {
    return Array.from(getSceneQueryRoot().querySelectorAll(selector));
}

function updateActiveScenePage(pageId) {
    const previousPage = storyPage;
    storyPage = pageId || "intro";

    document.body.classList.remove(`page-theme-${previousPage}`);
    document.body.classList.add(`page-theme-${storyPage}`);
}

function extractSceneMarkup(html) {
    const parser = new DOMParser();
    const parsed = parser.parseFromString(html, "text/html");
    const fragment = document.createDocumentFragment();

    Array.from(parsed.body.children).forEach((node) => {
        if (node.tagName === "SCRIPT" || node.tagName === "LINK" || node.tagName === "META" || node.tagName === "TITLE") {
            return;
        }

        if (node.id === "music-container") {
            return;
        }

        if (node.tagName === "MAIN" && node.id === "main-scrapbook") {
            Array.from(node.children).forEach((child) => {
                fragment.appendChild(document.importNode(child, true));
            });
            return;
        }

        fragment.appendChild(document.importNode(node, true));
    });

    return fragment;
}

async function loadScenePage(href) {
    if (!sceneRoot || !href) {
        return;
    }

    const fetchHref = normalizeSceneHref(href);

    sceneRoot.innerHTML = `
        <div class="story-scene-loading grid min-h-[78vh] place-items-center px-6 text-center text-brand-soft">
            <div class="max-w-sm rounded-[1.5rem] border border-white/80 bg-white/85 px-5 py-4 shadow-soft backdrop-blur-md">
                <p class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-clay">Memuat Scene</p>
                <p class="mt-2 text-sm leading-6">Tunggu sebentar, halaman berikutnya sedang disiapkan.</p>
            </div>
        </div>`;

    try {
        const response = await window.fetch(fetchHref, { cache: "no-store" });
        if (!response.ok) {
            throw new Error(`Failed to load ${fetchHref}`);
        }

        const html = await response.text();
        const fragment = extractSceneMarkup(html);
        sceneRoot.innerHTML = "";
        sceneRoot.appendChild(fragment);

        const pageId = STORY_PAGES.find((page) => fetchHref.endsWith(page.href))?.id || "intro";
        updateActiveScenePage(pageId);
        refreshSceneBindings();
    } catch {
        window.location.href = fetchHref;
    }
}

function updateStoryLinkState() {
    const gateOpen = isStoryGateOpen();
    const unlockedCount = gateOpen ? Math.min(storyUnlockedIndex + 1, STORY_ORDER.length) : 0;

    storyLinks.forEach((link) => {
        const target = link.dataset.storyTarget;
        const targetIndex = getStoryPageIndex(target);
        const isUnlocked = gateOpen && targetIndex !== -1 && targetIndex <= storyUnlockedIndex;
        const isCurrent = storyPage !== "intro" && target === storyPage;
        const chip = link.querySelector(".story-chip");
        const title = link.querySelector(".story-title");

        link.classList.toggle("story-link-locked", !isUnlocked);
        link.classList.toggle("story-link-current", Boolean(isUnlocked && isCurrent));
        link.setAttribute("aria-disabled", String(!isUnlocked));

        if (!isUnlocked) {
            link.setAttribute("tabindex", "-1");
        } else {
            link.removeAttribute("tabindex");
        }

        if (chip) {
            chip.textContent = !isUnlocked ? "Terkunci" : (isCurrent ? "Sedang Dibaca" : "Tersedia");
            chip.classList.toggle("bg-brand-mint", Boolean(isUnlocked && !isCurrent));
            chip.classList.toggle("text-brand-ink", Boolean(isUnlocked && !isCurrent));
            chip.classList.toggle("bg-brand-sand", !isUnlocked);
            chip.classList.toggle("text-brand-soft", !isUnlocked);
            chip.classList.toggle("story-chip-current", Boolean(isUnlocked && isCurrent));
        }

        if (title) {
            title.setAttribute("aria-label", isUnlocked ? title.textContent.trim() : `Terkunci: ${title.textContent.trim()}`);
        }
    });

    if (storyProgressText) {
        storyProgressText.textContent = gateOpen
            ? `${unlockedCount} dari ${STORY_ORDER.length} chapter siap dibuka`
            : `0 dari ${STORY_ORDER.length} chapter masih terkunci`;
    }

    if (storyProgressBar) {
        storyProgressBar.style.width = `${(unlockedCount / STORY_ORDER.length) * 100}%`;
    }

    if (storyNextText) {
        const nextOverview = STORY_OVERVIEW[Math.min(unlockedCount, STORY_OVERVIEW.length - 1)];
        storyNextText.textContent = gateOpen
            ? (nextOverview
                ? `Bab berikutnya: ${nextOverview.label} — ${nextOverview.summary}`
                : "Semua chapter sudah terbuka.")
            : "Masukkan kata sandi atau tunggu waktu buka untuk memulai.";
    }
}

function initAmbientMotionLayer() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    if (document.querySelector(".ambient-orb-layer")) {
        return;
    }

    const layer = document.createElement("div");
    layer.className = "ambient-orb-layer";
    layer.setAttribute("aria-hidden", "true");

    for (let i = 1; i <= 3; i += 1) {
        const orb = document.createElement("span");
        orb.className = `ambient-orb ambient-orb-${i}`;
        layer.appendChild(orb);
    }

    document.body.appendChild(layer);
}

function initLovePhotoShuffle() {
    const photoNodes = Array.from(document.querySelectorAll(".love-photo-card img"));
    if (!photoNodes.length) {
        return;
    }

    const photoPool = [
        "assets/photos/us1.jpeg",
        "assets/photos/us2.jpeg",
        "assets/photos/anna.jpeg",
        "assets/photos/WhatsApp Image 2026-04-17 at 20.57.23.jpeg",
        "assets/photos/WhatsApp Image 2026-04-17 at 20.57.23 (1).jpeg",
        "assets/photos/WhatsApp Image 2026-04-17 at 20.57.24 (1).jpeg",
        "assets/photos/WhatsApp Image 2026-04-17 at 20.57.25.jpeg",
        "assets/photos/WhatsApp Image 2026-04-17 at 20.57.25 (1).jpeg",
        "assets/photos/WhatsApp Image 2026-04-17 at 20.57.26.jpeg",
        "assets/photos/WhatsApp Image 2026-04-17 at 20.57.26 (1).jpeg",
        "assets/photos/WhatsApp Image 2026-04-17 at 20.57.27.jpeg"
    ];

    const getNextPhoto = (exceptSrc) => {
        const candidates = photoPool.filter((path) => !exceptSrc.includes(path));
        if (!candidates.length) {
            return photoPool[Math.floor(Math.random() * photoPool.length)];
        }
        return candidates[Math.floor(Math.random() * candidates.length)];
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    window.setInterval(() => {
        const target = photoNodes[Math.floor(Math.random() * photoNodes.length)];
        if (!target) {
            return;
        }

        target.classList.add("is-swapping");
        window.setTimeout(() => {
            const nextSrc = getNextPhoto(target.getAttribute("src") || "");
            target.setAttribute("src", nextSrc);
            target.classList.remove("is-swapping");
        }, 320);
    }, 5200);
}

function initScrollDynamics() {
    if (hasScrollDynamicsBound) {
        return;
    }

    hasScrollDynamicsBound = true;

    const apply = () => {
        const scrollTop = window.scrollY || window.pageYOffset || 0;
        const scrollRange = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        const progress = Math.min(Math.max(scrollTop / scrollRange, 0), 1);
        document.body.style.setProperty("--story-scroll", progress.toFixed(4));
    };

    let rafId = 0;
    const requestApply = () => {
        if (rafId) {
            return;
        }

        rafId = window.requestAnimationFrame(() => {
            rafId = 0;
            apply();
        });
    };

    apply();
    window.addEventListener("scroll", requestApply, { passive: true });
    window.addEventListener("resize", requestApply);
}

function initTactileFeedback() {
    if (hasTactileFeedbackBound) {
        return;
    }

    hasTactileFeedbackBound = true;
    const selector = "button, .story-link-card, .photo-card, .coupon, .timeline-content";

    document.addEventListener("pointerdown", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        const interactive = target.closest(selector);
        if (!interactive) {
            return;
        }

        interactive.classList.add("is-pressed");
    }, { passive: true });

    const clearPressedState = () => {
        document.querySelectorAll(".is-pressed").forEach((node) => {
            node.classList.remove("is-pressed");
        });
    };

    document.addEventListener("pointerup", clearPressedState, { passive: true });
    document.addEventListener("pointercancel", clearPressedState, { passive: true });
    document.addEventListener("dragend", clearPressedState, { passive: true });
}

function initAtlasParallax() {
    if (hasAtlasParallaxBound) {
        return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    hasAtlasParallaxBound = true;

    storyLinks.forEach((card) => {
        card.addEventListener("pointermove", (event) => {
            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const deltaX = (event.clientX - centerX) / (rect.width / 2);
            const deltaY = (event.clientY - centerY) / (rect.height / 2);

            const clampedX = Math.max(-1, Math.min(1, deltaX));
            const clampedY = Math.max(-1, Math.min(1, deltaY));
            card.style.setProperty("--parallax-x", clampedX.toFixed(3));
            card.style.setProperty("--parallax-y", clampedY.toFixed(3));
        }, { passive: true });

        const reset = () => {
            card.style.setProperty("--parallax-x", "0");
            card.style.setProperty("--parallax-y", "0");
        };

        card.addEventListener("pointerleave", reset, { passive: true });
        card.addEventListener("blur", reset, { passive: true });
    });
}

function refreshSceneBindings() {
    if (!sceneRoot) {
        return;
    }

    daysEl = sceneQuery("#days");
    hoursEl = sceneQuery("#hours");
    minutesEl = sceneQuery("#minutes");
    secondsEl = sceneQuery("#seconds");

    reasonText = sceneQuery("#reason-text");
    generateBtn = sceneQuery("#generate-btn");
    saveReasonBtn = sceneQuery("#save-reason-btn");
    savedReasonsEl = sceneQuery("#saved-reasons");

    galleryCards = sceneQueryAll(".photo-card");
    galleryModal = sceneQuery("#gallery-modal");
    galleryCloseOverlay = sceneQuery("#gallery-close-overlay");
    galleryCloseBtn = sceneQuery("#gallery-close-btn");
    galleryPrevBtn = sceneQuery("#gallery-prev-btn");
    galleryNextBtn = sceneQuery("#gallery-next-btn");
    galleryModalImage = sceneQuery("#gallery-modal-image");
    galleryTitle = sceneQuery("#gallery-title");
    galleryCaption = sceneQuery("#gallery-caption");

    timelineToggleButtons = sceneQueryAll(".timeline-toggle");
    couponClaimButtons = sceneQueryAll(".coupon-claim-btn");

    revealVideoBtn = sceneQuery("#reveal-video-btn");
    videoTeaser = sceneQuery("#video-teaser");
    videoPlayerWrap = sceneQuery("#video-player-wrap");
    specialVideo = sceneQuery("#special-video");

    letterFloatWrapper = sceneQuery("#letter-float-wrapper");
    envelopeWrapper = sceneQuery("#envelope-wrapper");
    closeLetterReadBtn = sceneQuery("#close-letter-read-btn");
    letterReaderCloseBtn = sceneQuery("#letter-reader-close-btn");
    readingBackdrop = sceneQuery("#reading-backdrop");
    letterReaderModal = sceneQuery("#letter-reader-modal");
    letterReaderContent = sceneQuery("#letter-reader-content");
    audioPop = sceneQuery("#audio-pop");
    audioPaper = sceneQuery("#audio-paper");
    resetStoryProgressBtn = sceneQuery("#reset-story-progress");
    unlockNextButtons = sceneQueryAll("[data-unlock-next][data-next-page]");

    galleryItems.length = 0;
    galleryCards.forEach((card) => {
        const image = card.querySelector("img");
        const title = card.querySelector("h3");
        const caption = card.querySelector(".caption");

        galleryItems.push({
            src: image ? image.src : "",
            alt: image ? image.alt : "Gallery image",
            title: title ? title.textContent.trim() : "Memory",
            caption: caption ? caption.textContent.trim() : ""
        });
    });

    updateStoryLinkState();
    initRevealAnimations();
    bindSceneInteractions();
    updateTimer();
    renderSavedReasons();
}

function bindSceneInteractions() {
    if (generateBtn && reasonText) {
        generateBtn.addEventListener("click", () => {
            reasonText.classList.add("is-swapping");

            window.setTimeout(() => {
                reasonText.textContent = `"${randomReason()}"`;
                reasonText.classList.remove("is-swapping");
            }, 220);
        });
    }

    if (saveReasonBtn) {
        saveReasonBtn.addEventListener("click", saveCurrentReason);
    }

    if (resetStoryProgressBtn) {
        resetStoryProgressBtn.addEventListener("click", () => {
            storyUnlockedIndex = 0;
            saveStoryProgress(storyUnlockedIndex);
            updateStoryLinkState();
        });
    }

    if (unlockNextButtons.length) {
        unlockNextButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const nextPage = button.dataset.nextPage;
                const nextHref = getStoryHref(nextPage);

                if (!nextHref) {
                    return;
                }

                unlockStoryPage(nextPage);
                navigateWithTransition(nextHref);
            });
        });
    }

    if (savedReasonsEl) {
        savedReasonsEl.addEventListener("click", (event) => {
            const target = event.target;
            if (!(target instanceof HTMLElement)) {
                return;
            }

            if (!target.classList.contains("saved-reason-remove")) {
                return;
            }

            const index = Number(target.dataset.index);
            removeSavedReason(index);
        });
    }

    if (galleryCards.length) {
        galleryCards.forEach((card, index) => {
            card.addEventListener("click", () => openGallery(index));
            card.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openGallery(index);
                }
            });
        });
    }

    if (galleryCloseOverlay) {
        galleryCloseOverlay.addEventListener("click", closeGallery);
    }

    if (galleryCloseBtn) {
        galleryCloseBtn.addEventListener("click", closeGallery);
    }

    if (galleryPrevBtn) {
        galleryPrevBtn.addEventListener("click", () => moveGallery(-1));
    }

    if (galleryNextBtn) {
        galleryNextBtn.addEventListener("click", () => moveGallery(1));
    }

    timelineToggleButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const content = button.closest(".timeline-content");
            const detail = content ? content.querySelector(".timeline-detail") : null;
            if (!content || !detail) {
                return;
            }

            const isOpen = !detail.classList.contains("hidden");
            closeAllTimelineDetails(content);

            if (isOpen) {
                detail.classList.add("hidden");
                content.classList.remove("is-open");
                button.setAttribute("aria-expanded", "false");
                button.textContent = "Lihat Detail";
                return;
            }

            detail.classList.remove("hidden");
            content.classList.add("is-open");
            button.setAttribute("aria-expanded", "true");
            button.textContent = "Sembunyikan";
        });
    });

    couponClaimButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const coupon = button.closest(".coupon");
            if (!coupon) {
                return;
            }

            const isClaimed = coupon.classList.toggle("is-claimed");
            button.textContent = isClaimed ? "Claimed" : "Claim Coupon";
            button.classList.toggle("is-claimed", isClaimed);
        });
    });

    if (revealVideoBtn) {
        revealVideoBtn.addEventListener("click", revealVideo);
    }

    if (envelopeWrapper) {
        envelopeWrapper.addEventListener("click", toggleLetterReadMode);
        envelopeWrapper.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleLetterReadMode();
            }
        });
    }

    if (closeLetterReadBtn) {
        closeLetterReadBtn.addEventListener("click", closeLetterReadMode);
    }

    if (letterReaderCloseBtn) {
        letterReaderCloseBtn.addEventListener("click", closeLetterReadMode);
    }

    if (readingBackdrop) {
        readingBackdrop.addEventListener("click", closeLetterReadMode);
    }

    if (letterReaderModal) {
        letterReaderModal.addEventListener("click", (event) => {
            const target = event.target;
            if (!(target instanceof Element)) {
                return;
            }

            if (target === letterReaderModal || target.classList.contains("letter-reader-backdrop")) {
                closeLetterReadMode();
            }
        });
    }

    if (audioPop) {
        audioPop.volume = 0.38;
    }

    if (audioPaper) {
        audioPaper.volume = 0.36;
    }
}

function guardLockedStoryPage() {
    if (storyPage === "intro") {
        return;
    }

    if (!isStoryGateOpen()) {
        window.location.href = `${getIntroPath()}?locked=${encodeURIComponent(storyPage)}`;
        return;
    }

    const currentIndex = getStoryPageIndex(storyPage);
    if (currentIndex === -1 || currentIndex <= storyUnlockedIndex) {
        return;
    }

    window.location.href = `${getIntroPath()}?locked=${encodeURIComponent(storyPage)}`;
}

storyUnlockedIndex = loadStoryProgress();
guardLockedStoryPage();

if (storyPage === "intro" && loginScreen && !isStoryGateOpen()) {
    window.sessionStorage.removeItem(AUTO_MUSIC_KEY);
    window.sessionStorage.removeItem(MUSIC_STATE_KEY);
    window.sessionStorage.removeItem(MUSIC_MANUAL_PAUSE_KEY);
    if (bgMusic) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
    }
}

function getPageTransitionLayer() {
    let layer = document.querySelector(".page-transition-layer");
    if (layer) {
        return layer;
    }

    layer = document.createElement("div");
    layer.className = "page-transition-layer";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);
    return layer;
}

function navigateWithTransition(targetHref) {
    if (!targetHref || isPageLeaving) {
        return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        loadScenePage(targetHref);
        return;
    }

    isPageLeaving = true;
    applyTransitionCharacter(targetHref);
    document.body.classList.remove("is-page-entering");
    document.body.classList.add("is-page-leaving");
    window.setTimeout(async () => {
        try {
            await loadScenePage(targetHref);
            document.body.classList.remove("is-page-leaving");
            document.body.classList.add("is-page-entering");

            window.setTimeout(() => {
                document.body.classList.remove("is-page-entering");
                if (activeSceneTransitionClass) {
                    document.body.classList.remove(activeSceneTransitionClass);
                    activeSceneTransitionClass = "";
                }
                isPageLeaving = false;
            }, SCENE_ENTER_MS);
        } catch {
            isPageLeaving = false;
            document.body.classList.remove("is-page-leaving");
            if (activeSceneTransitionClass) {
                document.body.classList.remove(activeSceneTransitionClass);
                activeSceneTransitionClass = "";
            }
        }
    }, PAGE_TRANSITION_MS);
}

function shouldAnimateInternalLink(link, event) {
    if (!link || !link.getAttribute("href")) {
        return false;
    }

    if (event.defaultPrevented || isPageLeaving) {
        return false;
    }

    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
        return false;
    }

    if (link.hasAttribute("download") || link.getAttribute("target") === "_blank") {
        return false;
    }

    const href = link.getAttribute("href").trim();
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
        return false;
    }

    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) {
        return false;
    }

    return url.pathname !== window.location.pathname || url.search !== window.location.search;
}

function initPageTransitions() {
    getPageTransitionLayer();

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        document.body.classList.add("is-page-entering");
        window.setTimeout(() => {
            document.body.classList.remove("is-page-entering");
        }, 640);
    }

    document.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        const link = target.closest("a[href]");
        if (!(link instanceof HTMLAnchorElement)) {
            return;
        }

        if (!shouldAnimateInternalLink(link, event)) {
            return;
        }

        event.preventDefault();
        navigateWithTransition(link.href);
    });

    window.addEventListener("pageshow", () => {
        isPageLeaving = false;
        document.body.classList.remove("is-page-leaving");
    });
}

initPageTransitions();

function pad(value) {
    return String(value).padStart(2, "0");
}

function setMusicState(isPlaying) {
    isMusicPlaying = isPlaying;
    if (musicLabel) {
        musicLabel.textContent = isPlaying ? "Pause soundtrack" : "Play soundtrack";
    }
    if (musicIcon) {
        musicIcon.textContent = isPlaying ? "▮▮" : "♫";
    }
}

function isMusicManuallyPaused() {
    return window.sessionStorage.getItem(MUSIC_MANUAL_PAUSE_KEY) === "1";
}

function setMusicManuallyPaused(value) {
    if (value) {
        window.sessionStorage.setItem(MUSIC_MANUAL_PAUSE_KEY, "1");
        return;
    }

    window.sessionStorage.removeItem(MUSIC_MANUAL_PAUSE_KEY);
}

function playSound(audioEl, volume = 0.7) {
    if (!audioEl) {
        return;
    }

    audioEl.currentTime = 0;
    audioEl.volume = volume;
    const playPromise = audioEl.play();
    if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
            // Browser bisa memblokir audio sampai ada gesture user yang valid.
        });
    }
}

function saveMusicState() {
    if (!bgMusic || isEmbeddedStory) {
        return;
    }

    const payload = {
        time: Number.isFinite(bgMusic.currentTime) ? bgMusic.currentTime : 0,
        playing: Boolean(isMusicPlaying && !bgMusic.paused)
    };

    window.sessionStorage.setItem(MUSIC_STATE_KEY, JSON.stringify(payload));
}

function getSavedMusicState() {
    try {
        const rawValue = window.sessionStorage.getItem(MUSIC_STATE_KEY);
        if (!rawValue) {
            return null;
        }

        const parsed = JSON.parse(rawValue);
        if (typeof parsed !== "object" || parsed === null) {
            return null;
        }

        return {
            time: Number.isFinite(parsed.time) ? parsed.time : 0,
            playing: Boolean(parsed.playing)
        };
    } catch {
        return null;
    }
}

function restoreMusicState() {
    if (!bgMusic || isEmbeddedStory) {
        return;
    }

    const savedState = getSavedMusicState();
    if (!savedState) {
        return;
    }

    const applyTime = () => {
        try {
            bgMusic.currentTime = savedState.time;
        } catch {
            // Some browsers may reject seeks before metadata is ready.
        }
    };

    if (bgMusic.readyState >= 1) {
        applyTime();
    } else {
        bgMusic.addEventListener("loadedmetadata", applyTime, { once: true });
    }

    if (savedState.playing) {
        window.sessionStorage.setItem(AUTO_MUSIC_KEY, "1");
    }
}

function attemptAutoPlayMusic() {
    if (!bgMusic || isEmbeddedStory) {
        return;
    }

    if (isMusicManuallyPaused()) {
        return;
    }

    const shouldAttempt = storyPage !== "intro" || window.sessionStorage.getItem(AUTO_MUSIC_KEY) === "1";
    if (!shouldAttempt) {
        return;
    }

    bgMusic.volume = 0.55;
    const playPromise = bgMusic.play();
    if (playPromise && typeof playPromise.then === "function") {
        playPromise
            .then(() => setMusicState(true))
            .catch(() => {
                setMusicState(false);
            });
    }
}

function syncModalBodyState() {
    const galleryOpen = galleryModal && !galleryModal.classList.contains("hidden");
    const letterOpen = Boolean(letterFloatWrapper && letterFloatWrapper.classList.contains("is-reading-mode"));
    const letterReaderOpen = Boolean(letterReaderModal && !letterReaderModal.classList.contains("hidden"));
    document.body.classList.toggle("modal-open", Boolean(letterOpen || galleryOpen || letterReaderOpen));
}

function createHeart() {
    const heart = document.createElement("span");
    const symbols = ["❤", "✦", "❀", "♥"];
    const duration = (Math.random() * 3 + 5).toFixed(2);
    const drift = `${Math.floor(Math.random() * 90) - 45}px`;

    heart.className = "floating-heart";
    heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    heart.style.left = `${Math.random() * 100}vw`;
    heart.style.animationDuration = `${duration}s`;
    heart.style.fontSize = `${(Math.random() * 0.9 + 0.8).toFixed(2)}rem`;
    heart.style.opacity = (Math.random() * 0.45 + 0.25).toFixed(2);
    heart.style.setProperty("--drift", drift);

    document.body.appendChild(heart);

    window.setTimeout(() => {
        heart.remove();
    }, (Number(duration) + 0.2) * 1000);
}

function startHeartRain() {
    if (heartIntervalId !== null) {
        return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    for (let i = 0; i < 6; i += 1) {
        window.setTimeout(createHeart, i * 120);
    }

    heartIntervalId = window.setInterval(createHeart, 420);
}

function initRevealAnimations() {
    const revealTargets = document.querySelectorAll(".reveal");
    if (!revealTargets.length) {
        return;
    }

    Array.from(revealTargets).forEach((target, index) => {
        target.style.setProperty("--reveal-delay", `${Math.min(index * 72, 360)}ms`);
    });

    if (sceneObserver) {
        sceneObserver.disconnect();
        sceneObserver = null;
    }

    if (isEmbeddedStory || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
        revealTargets.forEach((target) => target.classList.add("is-visible"));
        return;
    }

    sceneObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    sceneObserver.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.15,
            rootMargin: "0px 0px -48px 0px"
        }
    );

    revealTargets.forEach((target) => sceneObserver.observe(target));
}

function revealMainView() {
    if (isMainViewRevealed || !loginScreen) {
        return;
    }

    isMainViewRevealed = true;
    if (!hasStoredStoryGateUnlock()) {
        storyUnlockedIndex = 0;
        saveStoryProgress(storyUnlockedIndex);
    }

    window.sessionStorage.setItem(STORY_GATE_KEY, "1");
    window.sessionStorage.setItem(AUTO_MUSIC_KEY, "1");

    if (unlockCountdownIntervalId !== null) {
        window.clearInterval(unlockCountdownIntervalId);
        unlockCountdownIntervalId = null;
    }

    loginScreen.classList.add("fade-out");

    window.setTimeout(() => {
        if (loginScreen) {
            loginScreen.classList.add("hidden");
            loginScreen.classList.remove("active");
        }

        if (mainScrapbook) {
            mainScrapbook.classList.remove("hidden");
            mainScrapbook.classList.add("active");
        }

        if (musicContainer) {
            musicContainer.classList.remove("hidden");
        }

        if (sceneRoot) {
            sceneRoot.classList.remove("hidden");
            loadScenePage("pages/chapter-1.html");
        }

        attemptAutoPlayMusic();
    }, Math.max(0, LOGIN_FADE_MS - 120));
}

function getUnlockRemainingMs() {
    return Math.max(0, UNLOCK_AT_WITA - Date.now());
}

function hasReachedUnlockTime() {
    return Date.now() >= UNLOCK_AT_WITA;
}

function updateUnlockCountdown() {
    const delta = getUnlockRemainingMs();

    const days = Math.floor(delta / (1000 * 60 * 60 * 24));
    const hours = Math.floor((delta / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((delta / (1000 * 60)) % 60);
    const seconds = Math.floor((delta / 1000) % 60);

    if (unlockDaysEl) {
        unlockDaysEl.textContent = String(days);
    }
    if (unlockHoursEl) {
        unlockHoursEl.textContent = pad(hours);
    }
    if (unlockMinutesEl) {
        unlockMinutesEl.textContent = pad(minutes);
    }
    if (unlockSecondsEl) {
        unlockSecondsEl.textContent = pad(seconds);
    }
}

function syncLockGateState() {
    const unlockedByTime = hasReachedUnlockTime();

    if (unlockTargetText) {
        unlockTargetText.textContent = unlockedByTime
            ? "Already past April 19th 2026, 00:00 WITA"
            : "Towards April 19th 2026, 00:00 WITA";
    }

    if (unlockStatusMessage) {
        unlockStatusMessage.textContent = unlockedByTime
            ? "The time has arrived. You can open this without a password."
            : "Enter the password to unlock earlier.";
    }

    if (questionText) {
        questionText.textContent = unlockedByTime
            ? "Tap Unlock Gift to open"
            : "Enter password (optional before unlock time)";
    }

    if (answerInput) {
        answerInput.placeholder = unlockedByTime ? "Leave blank if you want" : "Password";
    }

    if (unlockedByTime && errorMessage) {
        errorMessage.classList.remove("error-visible");
    }
}

function checkAnswer() {
    if (!answerInput || !errorMessage) {
        return;
    }

    const unlockedByTime = hasReachedUnlockTime();
    const userAnswer = answerInput.value.trim();
    if (unlockedByTime || userAnswer === EARLY_ACCESS_PASSWORD) {
        errorMessage.classList.remove("error-visible");
        revealMainView();
        return;
    }

    errorMessage.classList.add("error-visible");
    answerInput.classList.add("shake");
    window.setTimeout(() => answerInput.classList.remove("shake"), 340);
}

if (submitBtn) {
    submitBtn.addEventListener("click", checkAnswer);
}

if (answerInput) {
    answerInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            checkAnswer();
        }
    });
}

function tickUnlockCountdown() {
    if (isMainViewRevealed) {
        return;
    }

    updateUnlockCountdown();
    syncLockGateState();

    if (isStoryGateOpen()) {
        revealMainView();
    }
}

if (loginScreen) {
    tickUnlockCountdown();
    unlockCountdownIntervalId = window.setInterval(tickUnlockCountdown, 1000);
} else {
    isMainViewRevealed = true;
    initRevealAnimations();
}

if (storyPage === "intro") {
    const lockedPageAttempt = new URLSearchParams(window.location.search).get("locked");
    if (lockedPageAttempt && unlockStatusMessage) {
        unlockStatusMessage.textContent = "That chapter is still locked. Please finish the previous chapter first.";
    }
}

updateStoryLinkState();
initAmbientMotionLayer();
initLovePhotoShuffle();
initScrollDynamics();
initTactileFeedback();
initAtlasParallax();

if (bgMusic) {
    bgMusic.volume = 0.55;
}

if (isEmbeddedStory && musicContainer) {
    musicContainer.classList.add("hidden");
}

restoreMusicState();

attemptAutoPlayMusic();

window.addEventListener("pageshow", () => {
    restoreMusicState();
    attemptAutoPlayMusic();
});

window.addEventListener("pagehide", saveMusicState);
window.addEventListener("beforeunload", saveMusicState);

window.addEventListener("pointerdown", (event) => {
    const target = event.target;
    if (target instanceof Element && target.closest("#music-btn")) {
        return;
    }

    if (isMusicPlaying || isMusicManuallyPaused()) {
        return;
    }

    attemptAutoPlayMusic();
}, { once: false, passive: true });

window.addEventListener("keydown", () => {
    if (isMusicPlaying || isMusicManuallyPaused()) {
        return;
    }

    attemptAutoPlayMusic();
}, { once: false });

if (musicBtn && bgMusic) {
    musicBtn.addEventListener("click", () => {
        if (isMusicPlaying) {
            saveMusicState();
            bgMusic.pause();
            setMusicManuallyPaused(true);
            setMusicState(false);
            return;
        }

        setMusicManuallyPaused(false);
        window.sessionStorage.setItem(AUTO_MUSIC_KEY, "1");
        restoreMusicState();
        const playPromise = bgMusic.play();
        if (playPromise && typeof playPromise.then === "function") {
            playPromise
                .then(() => setMusicState(true))
                .catch(() => {
                    setMusicState(false);
                    if (musicLabel) {
                        musicLabel.textContent = "Tap to unmute";
                    }
                });
        } else {
            setMusicState(true);
        }

        saveMusicState();
    });
}

setMusicState(Boolean(bgMusic && !bgMusic.paused));

function updateTimer() {
    const now = Date.now();
    const delta = Math.max(0, now - RELATIONSHIP_START);

    const days = Math.floor(delta / (1000 * 60 * 60 * 24));
    const hours = Math.floor((delta / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((delta / (1000 * 60)) % 60);
    const seconds = Math.floor((delta / 1000) % 60);

    if (daysEl) {
        daysEl.textContent = String(days);
    }
    if (hoursEl) {
        hoursEl.textContent = pad(hours);
    }
    if (minutesEl) {
        minutesEl.textContent = pad(minutes);
    }
    if (secondsEl) {
        secondsEl.textContent = pad(seconds);
    }
}

window.setInterval(updateTimer, 1000);
updateTimer();

function randomReason() {
    if (!reasons.length) {
        return "";
    }

    let next = Math.floor(Math.random() * reasons.length);
    if (reasons.length > 1) {
        while (next === lastReasonIndex) {
            next = Math.floor(Math.random() * reasons.length);
        }
    }

    lastReasonIndex = next;
    return reasons[next];
}

function renderSavedReasons() {
    if (!savedReasonsEl) {
        return;
    }

    savedReasonsEl.innerHTML = "";

    if (!savedReasons.length) {
        const empty = document.createElement("li");
        empty.className = "text-xs text-brand-soft";
        empty.textContent = "Belum ada alasan disimpan.";
        savedReasonsEl.appendChild(empty);
        return;
    }

    savedReasons.forEach((reason, index) => {
        const item = document.createElement("li");
        item.className = "saved-reason-item";

        const text = document.createElement("span");
        text.textContent = reason;

        const removeBtn = document.createElement("button");
        removeBtn.className = "saved-reason-remove";
        removeBtn.type = "button";
        removeBtn.textContent = "Hapus";
        removeBtn.dataset.index = String(index);

        item.appendChild(text);
        item.appendChild(removeBtn);
        savedReasonsEl.appendChild(item);
    });
}

function saveCurrentReason() {
    if (!reasonText) {
        return;
    }

    const content = reasonText.textContent.replace(/^"|"$/g, "").trim();
    if (!content || content.includes("Klik tombol")) {
        return;
    }

    if (savedReasons.includes(content)) {
        return;
    }

    savedReasons.unshift(content);
    if (savedReasons.length > 6) {
        savedReasons.pop();
    }

    renderSavedReasons();
}

function removeSavedReason(index) {
    if (Number.isNaN(index) || index < 0 || index >= savedReasons.length) {
        return;
    }

    savedReasons.splice(index, 1);
    renderSavedReasons();
}

function updateGalleryModal() {
    if (!galleryItems.length || !galleryModalImage || !galleryTitle || !galleryCaption) {
        return;
    }

    const item = galleryItems[galleryIndex];
    galleryModalImage.src = item.src;
    galleryModalImage.alt = item.alt;
    galleryTitle.textContent = item.title;
    galleryCaption.textContent = item.caption;
}

function openGallery(index) {
    if (!galleryModal || !galleryItems.length) {
        return;
    }

    const safeIndex = ((index % galleryItems.length) + galleryItems.length) % galleryItems.length;
    galleryIndex = safeIndex;
    updateGalleryModal();
    galleryModal.classList.remove("hidden");
    syncModalBodyState();
}

function closeGallery() {
    if (!galleryModal) {
        return;
    }

    galleryModal.classList.add("hidden");
    syncModalBodyState();
}

function moveGallery(step) {
    if (!galleryItems.length) {
        return;
    }

    galleryIndex = (galleryIndex + step + galleryItems.length) % galleryItems.length;
    updateGalleryModal();
}

function closeAllTimelineDetails(exceptContent = null) {
    timelineToggleButtons.forEach((button) => {
        const content = button.closest(".timeline-content");
        const detail = content ? content.querySelector(".timeline-detail") : null;
        if (!content || !detail || content === exceptContent) {
            return;
        }

        content.classList.remove("is-open");
        detail.classList.add("hidden");
        button.setAttribute("aria-expanded", "false");
        button.textContent = "Lihat Detail";
    });
}

if (generateBtn && reasonText) {
    generateBtn.addEventListener("click", () => {
        reasonText.classList.add("is-swapping");

        window.setTimeout(() => {
            reasonText.textContent = `"${randomReason()}"`;
            reasonText.classList.remove("is-swapping");
        }, 220);
    });
}

if (saveReasonBtn) {
    saveReasonBtn.addEventListener("click", saveCurrentReason);
}

if (resetStoryProgressBtn) {
    resetStoryProgressBtn.addEventListener("click", () => {
        storyUnlockedIndex = 0;
        saveStoryProgress(storyUnlockedIndex);
        updateStoryLinkState();
    });
}

if (storyLinks.length) {
    storyLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            const target = link.dataset.storyTarget;
            const targetIndex = getStoryPageIndex(target);

            if (!isStoryGateOpen() || targetIndex > storyUnlockedIndex) {
                event.preventDefault();
            }
        });
    });
}

if (unlockNextButtons.length) {
    unlockNextButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const nextPage = button.dataset.nextPage;
            const nextHref = getStoryHref(nextPage);

            if (!nextHref) {
                return;
            }

            unlockStoryPage(nextPage);
            navigateWithTransition(nextHref);
        });
    });
}

if (savedReasonsEl) {
    savedReasonsEl.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) {
            return;
        }

        if (!target.classList.contains("saved-reason-remove")) {
            return;
        }

        const index = Number(target.dataset.index);
        removeSavedReason(index);
    });
}

renderSavedReasons();

if (galleryCards.length) {
    galleryCards.forEach((card, index) => {
        card.addEventListener("click", () => openGallery(index));
        card.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openGallery(index);
            }
        });
    });
}

if (galleryCloseOverlay) {
    galleryCloseOverlay.addEventListener("click", closeGallery);
}

if (galleryCloseBtn) {
    galleryCloseBtn.addEventListener("click", closeGallery);
}

if (galleryPrevBtn) {
    galleryPrevBtn.addEventListener("click", () => moveGallery(-1));
}

if (galleryNextBtn) {
    galleryNextBtn.addEventListener("click", () => moveGallery(1));
}

timelineToggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const content = button.closest(".timeline-content");
        const detail = content ? content.querySelector(".timeline-detail") : null;
        if (!content || !detail) {
            return;
        }

        const isOpen = !detail.classList.contains("hidden");
        closeAllTimelineDetails(content);

        if (isOpen) {
            detail.classList.add("hidden");
            content.classList.remove("is-open");
            button.setAttribute("aria-expanded", "false");
            button.textContent = "Lihat Detail";
            return;
        }

        detail.classList.remove("hidden");
        content.classList.add("is-open");
        button.setAttribute("aria-expanded", "true");
        button.textContent = "Sembunyikan";
    });
});

couponClaimButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const coupon = button.closest(".coupon");
        if (!coupon) {
            return;
        }

        const isClaimed = coupon.classList.toggle("is-claimed");
        button.textContent = isClaimed ? "Claimed" : "Claim Coupon";
        button.classList.toggle("is-claimed", isClaimed);
    });
});

function revealVideo() {
    if (!videoTeaser || !videoPlayerWrap) {
        return;
    }

    videoTeaser.classList.add("hidden");
    videoPlayerWrap.classList.remove("hidden");

    if (specialVideo) {
        specialVideo.currentTime = 0;
        const playPromise = specialVideo.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {
                // Autoplay bisa diblokir browser, user bisa tekan play manual.
            });
        }
    }
}

if (revealVideoBtn) {
    revealVideoBtn.addEventListener("click", revealVideo);
}

function openLetterReadMode() {
    if (!envelopeWrapper || !letterFloatWrapper || isLetterAnimating || isLetterOpened) {
        return;
    }

    isLetterAnimating = true;
    playSound(audioPop, 0.78);

    envelopeWrapper.classList.add("is-open");
    letterFloatWrapper.classList.add("is-open");

    window.setTimeout(() => {
        playSound(audioPaper, 0.62);

        letterFloatWrapper.classList.add("is-reading-mode");
        envelopeWrapper.classList.add("is-reading");

        if (letterReaderContent) {
            const sourcePaper = document.getElementById("letter-paper");
            if (sourcePaper) {
                letterReaderContent.innerHTML = sourcePaper.innerHTML;
            }
        }

        if (letterReaderModal) {
            letterReaderModal.classList.remove("hidden");
        }

        if (readingBackdrop) {
            readingBackdrop.classList.add("active");
        }

        if (closeLetterReadBtn) {
            closeLetterReadBtn.classList.add("active");
        }

        syncModalBodyState();

        window.setTimeout(() => {
            envelopeWrapper.classList.add("is-reading-text");
            isLetterOpened = true;
            isLetterAnimating = false;
        }, 550);
    }, 430);
}

function closeLetterReadMode() {
    if (!envelopeWrapper || !letterFloatWrapper || isLetterAnimating || !isLetterOpened) {
        return;
    }

    isLetterAnimating = true;
    playSound(audioPaper, 0.52);
    envelopeWrapper.classList.remove("is-reading-text");

    window.setTimeout(() => {
        envelopeWrapper.classList.remove("is-reading");

        if (closeLetterReadBtn) {
            closeLetterReadBtn.classList.remove("active");
        }

        if (readingBackdrop) {
            readingBackdrop.classList.remove("active");
        }

        if (letterReaderModal) {
            letterReaderModal.classList.add("hidden");
        }

        // Tunggu animasi mengecil (transisi css .letter-paper sekitar 0.8s) selesai
        window.setTimeout(() => {
            letterFloatWrapper.classList.remove("is-reading-mode");
            syncModalBodyState();

            envelopeWrapper.classList.remove("is-open");
            letterFloatWrapper.classList.remove("is-open");
            
            window.setTimeout(() => {
                isLetterOpened = false;
                isLetterAnimating = false;
            }, 550);
        }, 850);
    }, 350);
}

function toggleLetterReadMode() {
    if (isLetterOpened) {
        closeLetterReadMode();
        return;
    }

    openLetterReadMode();
}

if (envelopeWrapper) {
    envelopeWrapper.addEventListener("click", toggleLetterReadMode);
    envelopeWrapper.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleLetterReadMode();
        }
    });
}

if (closeLetterReadBtn) {
    closeLetterReadBtn.addEventListener("click", closeLetterReadMode);
}

if (letterReaderCloseBtn) {
    letterReaderCloseBtn.addEventListener("click", closeLetterReadMode);
}

if (readingBackdrop) {
    readingBackdrop.addEventListener("click", closeLetterReadMode);
}

if (letterReaderModal) {
    letterReaderModal.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        if (target === letterReaderModal || target.classList.contains("letter-reader-backdrop")) {
            closeLetterReadMode();
        }
    });
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        if (galleryModal && !galleryModal.classList.contains("hidden")) {
            closeGallery();
            return;
        }

        if (isLetterOpened) {
            closeLetterReadMode();
        }
    }

    if (galleryModal && !galleryModal.classList.contains("hidden")) {
        if (event.key === "ArrowRight") {
            moveGallery(1);
        }

        if (event.key === "ArrowLeft") {
            moveGallery(-1);
        }
    }
});