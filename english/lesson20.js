document.addEventListener("DOMContentLoaded", function () {
  // 1. Ebbinghaus Circles Toggle
  const btnEbb = document.getElementById("btn-ebbinghaus");
  const svgEbb = document.getElementById("ebbinghaus-svg");
  if (btnEbb && svgEbb) {
    btnEbb.addEventListener("click", function () {
      const isRevealed = svgEbb.classList.toggle("revealed");
      btnEbb.textContent = isRevealed
        ? "🔄 Reset Illusion"
        : "📏 Measure Circles";
    });
  }

  // 2. Shadow & Contrast Toggle
  const btnContrast = document.getElementById("btn-contrast");
  const stageContrast = document.getElementById("contrast-stage");
  if (btnContrast && stageContrast) {
    btnContrast.addEventListener("click", function () {
      const isRevealed = stageContrast.classList.toggle("revealed");
      btnContrast.textContent = isRevealed
        ? "🔄 Restore Background"
        : "🎨 Remove Background";
    });
  }

  // 3. Muller-Lyer Arrows Toggle
  const btnMuller = document.getElementById("btn-muller");
  const svgMuller = document.getElementById("muller-svg");
  if (btnMuller && svgMuller) {
    btnMuller.addEventListener("click", function () {
      const isRevealed = svgMuller.classList.toggle("revealed");
      btnMuller.textContent = isRevealed
        ? "🔄 Hide Ruler Lines"
        : "📐 Show Ruler Lines";
    });
  }

  // 4. Flipbook Animation FPS Controller
  const charEl = document.getElementById("anim-character");
  const bodyEl = document.getElementById("anim-body");
  const shadowEl = document.getElementById("anim-shadow");
  const fpsLabel = document.getElementById("fps-label");
  const fpsButtons = document.querySelectorAll("[data-fps]");

  let currentFps = 2;
  let stepIndex = 0;
  let animTimer = null;

  function stepAnimation() {
    const totalFrames = 24;
    const increment = currentFps === 2 ? 6 : currentFps === 8 ? 2 : 1;
    stepIndex = (stepIndex + increment) % totalFrames;

    const progress = stepIndex / totalFrames;
    const x = 160 - Math.cos(progress * Math.PI * 2) * 95;
    const bouncePhase = Math.abs(Math.sin(progress * Math.PI * 2));
    const y = 128 - bouncePhase * 70;

    // Squash and stretch near the ground
    const isNearGround = bouncePhase < 0.15;
    const rx = isNearGround ? 23 : 19;
    const ry = isNearGround ? 16 : 21;
    const shadowRx = 22 - bouncePhase * 10;

    if (charEl && bodyEl && shadowEl) {
      charEl.setAttribute(
        "transform",
        `translate(${x.toFixed(1)}, ${y.toFixed(1)})`,
      );
      bodyEl.setAttribute("rx", rx);
      bodyEl.setAttribute("ry", ry);
      shadowEl.setAttribute("cx", x.toFixed(1));
      shadowEl.setAttribute("rx", shadowRx.toFixed(1));
    }
  }

  function startLoop(fps) {
    currentFps = fps;
    if (animTimer) clearInterval(animTimer);
    const intervalMs = Math.round(1000 / fps);
    animTimer = setInterval(stepAnimation, intervalMs);
  }

  fpsButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const fps = parseInt(btn.getAttribute("data-fps"), 10);
      fpsButtons.forEach((b) => b.classList.remove("active-fps"));
      btn.classList.add("active-fps");

      if (fpsLabel) {
        if (fps === 2) fpsLabel.textContent = "2 FPS (Separate Pictures)";
        if (fps === 8) fpsLabel.textContent = "8 FPS (Choppy Motion)";
        if (fps === 24) fpsLabel.textContent = "24 FPS (Smooth Illusion!)";
      }
      startLoop(fps);
    });
  });

  startLoop(2);
});
