$(document).ready(function () {
    $.ime.preferences.registry.language = "bn";
    $.ime.preferences.registry.showSelector = false;
    $.ime.preferences.registry.imes = { bn: "bn-probhat", en: "system" };
    $.ime.preferences.getDefaultLanguage = () => "bn";
    $("textarea").ime({
        languages: ["bn"],
        imePath: "https://cdnjs.cloudflare.com/ajax/libs/jquery.ime/0.3.0/",
    });

    // Copy
    $("#action-copy").click(function () {
        navigator.clipboard
            .writeText($("#banglapad").val())
            .then(() => {
                showCopiedToast();
                if (
                    navigator.share &&
                    /Android|iPhone|iPad/i.test(navigator.userAgent)
                ) {
                    $("#action-share").removeClass("hidden");
                }
            })
            .catch(console.error);
    });

    // Share (mobile only)
    $("#action-share").click(async function () {
        const text = $("#banglapad").val();
        if (navigator.share && text) {
            try {
                await navigator.share({ title: "Bangla Text", text });
            } catch (err) {
                if (err.name !== "AbortError") console.error(err);
            }
        }
    });

    // Clear
    $("#action-clear").click(function () {
        $("#banglapad").val("");
        localStorage.removeItem("banglapad_content");
        updateCounter();
        $("#banglapad").focus();
    });

    // Auto-save + Counter
    $("#banglapad").focus();
    const saved = localStorage.getItem("banglapad_content");
    if (saved) $("#banglapad").val(saved);
    updateCounter();

    $("#banglapad").on("input", function () {
        localStorage.setItem("banglapad_content", $(this).val());
        updateCounter();
        if (!$(this).val()) $("#action-share").addClass("hidden");
    });

    function updateCounter() {
        const text = $("#banglapad").val().trim();
        const chars = text.length;
        const words = text ? text.split(/\s+/).filter((w) => w.length > 0).length : 0;
        $("#counter").text(
            `${chars} char${chars !== 1 ? "s" : ""} • ${words} word${words !== 1 ? "s" : ""}`,
        );
    }

    // Layout Toggle (instant)
    const layoutEl = document.getElementById("layout-container");
    const layoutBtn = document.getElementById("action-layout");
    let layoutOpen = false;

    function toggleLayout() {
        if (layoutOpen && pinned) {
            pinned = false;
            layoutEl.classList.remove("pinned");
            pinBtn.setAttribute("aria-pressed", "false");
            mainEl.classList.remove("pin-active");
        }
        layoutOpen = !layoutOpen;
        if (layoutOpen) {
            layoutEl.classList.remove("hidden", "state-hidden");
            layoutEl.classList.add("state-visible");
            layoutBtn.classList.add("active");
            layoutBtn.setAttribute("aria-expanded", "true");
            pinBtn.classList.add("pin-visible");
        } else {
            layoutEl.classList.add("state-hidden");
            layoutBtn.classList.remove("active");
            layoutBtn.setAttribute("aria-expanded", "false");
            layoutEl.classList.add("hidden");
            pinBtn.classList.remove("pin-visible");
        }
        $("#banglapad").focus();
    }
    layoutBtn.addEventListener("click", toggleLayout);
    layoutEl.addEventListener("click", (e) => {
        if (e.target === layoutEl) toggleLayout();
    });
    document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.key.toLowerCase() === "l") {
            e.preventDefault();
            toggleLayout();
        }
    });

    // SVG Fallback
    const layoutImg = layoutEl.querySelector("img");
    if (layoutImg)
        layoutImg.onerror = () => (layoutImg.src = "public/probhat-layout.png");

    // Pin to bottom
    const pinBtn = document.getElementById("action-pin");
    const mainEl = document.querySelector("main");
    let pinned = false;

    function updatePinPadding() {
        if (pinned) {
            const h = layoutEl.offsetHeight;
            mainEl.style.setProperty("--layout-height", h + "px");
            mainEl.classList.add("pin-active");
        } else {
            mainEl.classList.remove("pin-active");
        }
    }

    pinBtn.addEventListener("click", function () {
        pinned = !pinned;
        layoutEl.classList.toggle("pinned", pinned);
        pinBtn.setAttribute("aria-pressed", String(pinned));
        updatePinPadding();
        $("#banglapad").focus();
    });

    const ro = new ResizeObserver(function () {
        if (pinned) updatePinPadding();
    });
    ro.observe(layoutEl);

    // Hide share button by default
    if (!/Android|iPhone|iPad/i.test(navigator.userAgent)) {
        $("#action-share").addClass("hidden");
    }
});

function showCopiedToast() {
    const toast = document.getElementById("copy-toast");
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 1500);
}
