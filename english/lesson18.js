// 1. Gloss translation pills
document.querySelectorAll(".gloss").forEach(function (el) {
  var pill = document.createElement("span");
  pill.className = "tr-pill";
  pill.textContent = el.getAttribute("data-tr");
  el.insertAdjacentElement("afterend", pill);
  function toggle() {
    pill.classList.toggle("show");
  }
  el.addEventListener("click", toggle);
  el.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  });
});

// 2. Interactive Coordinate Plane Drag & Drop + 2-Stage Pop-Up Controller
document.addEventListener("DOMContentLoaded", () => {
  const gridEl = document.getElementById("coord-plane-grid");
  const bankEl = document.getElementById("symbol-bank");
  const hoverReadout = document.getElementById("hover-coord-readout");
  const feedbackEl = document.getElementById("coord-feedback");
  const selectedHintEl = document.getElementById("selected-token-hint");
  const checkBtn = document.getElementById("check-map-btn");
  const resetBtn = document.getElementById("reset-map-btn");

  const secretPopup = document.getElementById("graph-secret-popup");
  const choiceBtns = Array.from(document.querySelectorAll(".clue-choice-btn"));
  const confirmClueBtn = document.getElementById("confirm-clue-btn");
  const choiceFeedbackMsg = document.getElementById("choice-feedback-msg");
  const paintingStoryReveal = document.getElementById("painting-story-reveal");

  if (!gridEl || !bankEl) return;

  const STORAGE_KEY = "lms_lesson18_coord_map_state";
  const UNLOCKED_KEY = "lms_lesson18_coord_map_unlocked";
  const STORY_SOLVED_KEY = "lms_lesson18_painting_solved";

  let draggedToken = null;
  let selectedToken = null;
  let selectedClueIcon = null;

  // Build 11x11 Grid: y from 5 down to -5, x from -5 up to 5
  for (let y = 5; y >= -5; y--) {
    for (let x = -5; x <= 5; x++) {
      const cell = document.createElement("div");
      cell.className = "coord-cell";
      if (y === 0) cell.classList.add("x-axis-cell");
      if (x === 0) cell.classList.add("y-axis-cell");

      const coordStr = `${x},${y}`;
      cell.setAttribute("data-coord", coordStr);

      // Axis number labels
      if (y === 0 && x !== 0) {
        const numX = document.createElement("span");
        numX.className = "axis-num-x";
        numX.textContent = x;
        cell.appendChild(numX);
      }
      if (x === 0 && y !== 0) {
        const numY = document.createElement("span");
        numY.className = "axis-num-y";
        numY.textContent = y;
        cell.appendChild(numY);
      }

      // Center dot or Fixed Origin (0,0)
      if (x === 0 && y === 0) {
        const originMarker = document.createElement("span");
        originMarker.className = "fixed-origin-token";
        originMarker.textContent = "💻";
        originMarker.title = "The Origin (0, 0): Library Computer";
        cell.appendChild(originMarker);
      } else {
        const dot = document.createElement("span");
        dot.className = "point-dot";
        cell.appendChild(dot);
      }

      // Hover coordinate readout
      cell.addEventListener("mouseenter", () => {
        hoverReadout.textContent = `Point: (${x}, ${y})`;
      });

      // Drag & Drop onto cell
      cell.addEventListener("dragover", (e) => {
        if (x === 0 && y === 0) return;
        e.preventDefault();
        cell.classList.add("drag-over");
      });

      cell.addEventListener("dragleave", () => {
        cell.classList.remove("drag-over");
      });

      cell.addEventListener("drop", (e) => {
        e.preventDefault();
        cell.classList.remove("drag-over");
        if (x === 0 && y === 0) return;
        if (draggedToken) {
          placeTokenInCell(draggedToken, cell);
          clearSelection();
        }
      });

      // Click-to-place onto cell
      cell.addEventListener("click", (e) => {
        if (x === 0 && y === 0) return;
        const clickedToken = e.target.closest(".map-token");
        if (clickedToken && !selectedToken) {
          selectToken(clickedToken);
          return;
        }
        if (selectedToken) {
          placeTokenInCell(selectedToken, cell);
          clearSelection();
        }
      });

      gridEl.appendChild(cell);
    }
  }

  const allTokens = Array.from(bankEl.querySelectorAll(".map-token"));

  allTokens.forEach((token) => {
    token.addEventListener("dragstart", (e) => {
      draggedToken = token;
      token.classList.remove("correct-spot", "wrong-spot");
      e.dataTransfer.setData("text/plain", token.dataset.symbol);
    });

    token.addEventListener("dragend", () => {
      draggedToken = null;
    });

    token.addEventListener("click", (e) => {
      e.stopPropagation();
      if (selectedToken === token) {
        clearSelection();
      } else {
        selectToken(token);
      }
    });

    token.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      token.classList.remove("correct-spot", "wrong-spot");
      bankEl.appendChild(token);
      clearSelection();
      feedbackEl.textContent = "";
      hideSecretPopup();
      saveMapState();
    });
  });

  // Allow dropping back into the Symbol Bank
  bankEl.parentElement.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  bankEl.parentElement.addEventListener("drop", (e) => {
    e.preventDefault();
    if (draggedToken) {
      draggedToken.classList.remove("correct-spot", "wrong-spot");
      bankEl.appendChild(draggedToken);
      clearSelection();
      feedbackEl.textContent = "";
      hideSecretPopup();
      saveMapState();
    }
  });

  // 8-Icon Selector inside the Pop-up
  choiceBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      choiceBtns.forEach((b) => b.classList.remove("active-choice"));
      btn.classList.add("active-choice");
      selectedClueIcon = btn.getAttribute("data-choice");
      if (choiceFeedbackMsg) choiceFeedbackMsg.textContent = "";
    });
  });

  if (confirmClueBtn) {
    confirmClueBtn.addEventListener("click", () => {
      if (!selectedClueIcon) {
        choiceFeedbackMsg.style.color = "tomato";
        choiceFeedbackMsg.textContent = "Click one of the 8 symbols first!";
        return;
      }

      if (selectedClueIcon === "🖼️") {
        choiceFeedbackMsg.style.color = "var(--brand2)";
        choiceFeedbackMsg.textContent =
          "✅ Correct! At (-3, 3), x = -3 (< 0) and y = -(-3) = 3!";
        if (paintingStoryReveal) {
          paintingStoryReveal.removeAttribute("hidden");
          localStorage.setItem(STORY_SOLVED_KEY, "true");
          paintingStoryReveal.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }
      } else {
        choiceFeedbackMsg.style.color = "var(--accent-pop)";
        choiceFeedbackMsg.textContent = `❌ Not ${selectedClueIcon}! Check its (x, y) coordinates: is x < 0 AND y = -x?`;
        if (paintingStoryReveal) {
          paintingStoryReveal.setAttribute("hidden", "");
        }
        localStorage.removeItem(STORY_SOLVED_KEY);
      }
    });
  }

  function selectToken(token) {
    allTokens.forEach((t) => t.classList.remove("selected-token"));
    selectedToken = token;
    token.classList.add("selected-token");
    selectedHintEl.textContent = `Selected ${token.dataset.symbol} — now click any (x, y) point on the grid!`;
  }

  function clearSelection() {
    allTokens.forEach((t) => t.classList.remove("selected-token"));
    selectedToken = null;
    selectedHintEl.textContent = "";
  }

  function hideSecretPopup() {
    if (secretPopup) secretPopup.setAttribute("hidden", "");
    if (paintingStoryReveal) paintingStoryReveal.setAttribute("hidden", "");
    if (choiceFeedbackMsg) choiceFeedbackMsg.textContent = "";
    choiceBtns.forEach((b) => b.classList.remove("active-choice"));
    selectedClueIcon = null;
    localStorage.removeItem(UNLOCKED_KEY);
    localStorage.removeItem(STORY_SOLVED_KEY);
  }

  function placeTokenInCell(token, cell) {
    const existingToken = cell.querySelector(".map-token");
    if (existingToken && existingToken !== token) {
      existingToken.classList.remove("correct-spot", "wrong-spot");
      bankEl.appendChild(existingToken);
    }

    token.classList.remove("correct-spot", "wrong-spot");
    cell.appendChild(token);
    feedbackEl.textContent = "";
    hideSecretPopup();
    saveMapState();
  }

  function saveMapState() {
    const state = {};
    allTokens.forEach((token) => {
      const parentCell = token.closest(".coord-cell");
      state[token.dataset.symbol] = parentCell
        ? parentCell.getAttribute("data-coord")
        : "bank";
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function loadMapState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      allTokens.forEach((token) => {
        const loc = saved[token.dataset.symbol];
        if (loc && loc !== "bank") {
          const targetCell = gridEl.querySelector(
            `.coord-cell[data-coord="${loc}"]`,
          );
          if (targetCell) targetCell.appendChild(token);
        }
      });

      if (localStorage.getItem(UNLOCKED_KEY) === "true" && secretPopup) {
        allTokens.forEach((token) => token.classList.add("correct-spot"));
        secretPopup.removeAttribute("hidden");
      }

      if (
        localStorage.getItem(STORY_SOLVED_KEY) === "true" &&
        paintingStoryReveal
      ) {
        const paintingBtn = document.querySelector(
          '.clue-choice-btn[data-choice="🖼️"]',
        );
        if (paintingBtn) paintingBtn.classList.add("active-choice");
        selectedClueIcon = "🖼️";
        paintingStoryReveal.removeAttribute("hidden");
      }
    } catch (err) {
      console.error("Error loading map state:", err);
    }
  }

  checkBtn.addEventListener("click", () => {
    let correctCount = 0;
    let placedCount = 0;

    allTokens.forEach((token) => {
      token.classList.remove("correct-spot", "wrong-spot");
      const parentCell = token.closest(".coord-cell");
      if (!parentCell) return;

      placedCount++;
      const currentCoord = parentCell.getAttribute("data-coord");
      if (currentCoord === token.dataset.target) {
        token.classList.add("correct-spot");
        correctCount++;
      } else {
        token.classList.add("wrong-spot");
      }
    });

    if (placedCount === 0) {
      feedbackEl.style.color = "tomato";
      feedbackEl.textContent =
        "Place the symbols onto the coordinate grid first!";
      hideSecretPopup();
    } else if (correctCount === allTokens.length) {
      feedbackEl.style.color = "var(--brand2)";
      feedbackEl.textContent =
        "🎉 All 8 symbols are plotted correctly! Read the new message below:";
      if (secretPopup) {
        secretPopup.removeAttribute("hidden");
        localStorage.setItem(UNLOCKED_KEY, "true");
        secretPopup.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    } else {
      feedbackEl.style.color = "var(--accent-pop)";
      feedbackEl.textContent = `You placed ${correctCount} out of 8 correctly. Check the red symbols!`;
      hideSecretPopup();
    }
  });

  resetBtn.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    hideSecretPopup();
    clearSelection();
    allTokens.forEach((token) => {
      token.classList.remove("correct-spot", "wrong-spot");
      bankEl.appendChild(token);
    });
    feedbackEl.textContent = "";
  });

  loadMapState();
});
