// ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦
// 🚀 MAIN APPLICATION MODULE
// ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦ - ✦
(() => {
  "use strict";

  // -----------------------------------------
  // 🎨 1. THEME & APPEARANCE MANAGER
  // -----------------------------------------
  class ThemeManager {
    constructor() {
      this.themeCheckbox = document.getElementById("theme-checkbox");
      this.hljsThemeLink = document.getElementById("hljs-theme");
      this.currentTheme = localStorage.getItem("lms_theme") || "light";

      this.init();
    }

    init() {
      this.applyTheme(this.currentTheme);
      this.applyDyslexiaMode();

      if (this.themeCheckbox) {
        this.themeCheckbox.addEventListener("change", (e) => {
          this.applyTheme(e.target.checked ? "dark" : "light");
        });
      }
    }

    applyTheme(theme) {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("lms_theme", theme);

      if (theme === "dark") {
        if (this.themeCheckbox) this.themeCheckbox.checked = true;
        if (this.hljsThemeLink)
          this.hljsThemeLink.href =
            "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css";
      } else {
        if (this.themeCheckbox) this.themeCheckbox.checked = false;
        if (this.hljsThemeLink)
          this.hljsThemeLink.href =
            "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css";
      }
    }

    applyDyslexiaMode() {
      if (localStorage.getItem("lms_dyslexiaMode") === "true") {
        document.body.classList.add("dyslexia-mode");
      }
    }

    toggleDyslexiaMode(btn) {
      const isNowDyslexic = document.body.classList.toggle("dyslexia-mode");
      localStorage.setItem("lms_dyslexiaMode", isNowDyslexic);
      btn.style.transform = "scale(0.85)";
      setTimeout(() => (btn.style.transform = ""), 150);
    }
  }

  // -----------------------------------------
  // 🧩 2. UI & INTERACTION MANAGER
  // -----------------------------------------
  class UIManager {
    constructor() {
      this.pageId = window.location.pathname.replace(/[^a-zA-Z0-9]/g, "_");
      this.navContainer = document.getElementById("nav-container");
      this.scrollToTopBtn = document.getElementById("scrollToTopBtn");
      this.isAnimatingTab = false;

      this.init();
    }

    init() {
      this.generateTOC();
      this.initTabs();
      this.initAccordions();
      this.initMediaZoom();
      this.initGlobalTextareas();
      new StandaloneExerciseManager();

      // Page visibility transitions
      document.fonts.ready.then(() => document.body.classList.add("is-loaded"));
      window.addEventListener("pageshow", (e) => {
        if (e.persisted) {
          document.body.classList.remove("is-leaving");
          document.body.classList.add("is-loaded");
        }
      });
    }

    generateTOC() {
      const contentBlocks = document.querySelectorAll(
        ".accordion__content, .lesson-content",
      );

      contentBlocks.forEach((block) => {
        const headers = block.querySelectorAll("h3[id]");
        if (headers.length === 0) return;

        const tocBox = document.createElement("div");
        tocBox.className = "toc-box";

        const tocTitle = document.createElement("h4");
        tocTitle.className = "toc-title";
        tocTitle.textContent = "Навігація";
        tocBox.appendChild(tocTitle);

        const nav = document.createElement("nav");
        nav.className = "subsection-nav";
        const ul = document.createElement("ul");

        headers.forEach((header) => {
          const li = document.createElement("li");
          const a = document.createElement("a");
          a.href = "#" + header.id;
          a.textContent = header.textContent.trim();
          li.appendChild(a);
          ul.appendChild(li);
        });

        nav.appendChild(ul);
        tocBox.appendChild(nav);

        const firstHeader = headers[0];
        firstHeader.parentNode.insertBefore(tocBox, firstHeader);
        const separator = document.createElement("hr");
        tocBox.parentNode.insertBefore(separator, tocBox.nextSibling);
      });
    }

    initTabs() {
      const tabButtons = document.querySelectorAll(".tab-btn");
      const savedTabId = sessionStorage.getItem("activeTab");

      if (savedTabId) {
        const savedBtn = document.querySelector(
          `.tab-btn[data-target="${savedTabId}"]`,
        );
        const savedContent = document.getElementById(savedTabId);

        if (savedBtn && savedContent) {
          tabButtons.forEach((btn) => btn.classList.remove("active"));
          document
            .querySelectorAll(".tab-content")
            .forEach((c) => c.classList.remove("active", "show"));
          savedBtn.classList.add("active");
          savedContent.classList.add("active", "show");
        }
      } else {
        const initialActive = document.querySelector(".tab-content.active");
        if (initialActive) initialActive.classList.add("show");
      }

      tabButtons.forEach((button) => {
        button.addEventListener("click", () => this.switchTab(button));
      });
    }

    switchTab(button) {
      if (button.classList.contains("active") || this.isAnimatingTab) return;
      this.isAnimatingTab = true;

      const targetId = button.getAttribute("data-target");
      sessionStorage.setItem("activeTab", targetId);

      const currentActiveContent = document.querySelector(
        ".tab-content.active",
      );
      const currentActiveBtn = document.querySelector(".tab-btn.active");

      if (currentActiveBtn) currentActiveBtn.classList.remove("active");
      button.classList.add("active");

      if (currentActiveContent) {
        currentActiveContent.classList.remove("show");
        setTimeout(() => {
          currentActiveContent.classList.remove("active");
          this.showNewTab(targetId);
        }, 400);
      } else {
        this.showNewTab(targetId);
      }
    }

    showNewTab(targetId) {
      const newContent = document.getElementById(targetId);
      newContent.classList.add("active");
      setTimeout(() => {
        newContent.classList.add("show");
        this.isAnimatingTab = false;
      }, 20);
    }

    initAccordions() {
      const allDetails = document.querySelectorAll("details");
      const savedState = sessionStorage.getItem("openAccordions");

      if (savedState) {
        const openIndices = JSON.parse(savedState);
        allDetails.forEach((detail, index) => {
          if (openIndices.includes(index)) detail.setAttribute("open", "");
          else detail.removeAttribute("open");
        });
      }

      allDetails.forEach((detail) => {
        detail.addEventListener("toggle", () => {
          const openIndices = [];
          allDetails.forEach((d, i) => {
            if (d.hasAttribute("open")) openIndices.push(i);
          });
          sessionStorage.setItem("openAccordions", JSON.stringify(openIndices));

          if (
            detail.open &&
            (detail.classList.contains("accordion__item") ||
              detail.classList.contains("task"))
          ) {
            setTimeout(() => {
              const y =
                detail.getBoundingClientRect().top + window.scrollY - 75;
              window.scrollTo({ top: y, behavior: "smooth" });
            }, 400);
          }
        });
      });
    }

    initMediaZoom() {
      // Images
      const zoomableImages = document.querySelectorAll("img.zoomable");
      const imgKey = "lms_expanded_img_" + this.pageId;
      const savedImages = JSON.parse(sessionStorage.getItem(imgKey) || "[]");

      zoomableImages.forEach((img, index) => {
        if (savedImages.includes(index)) img.classList.add("expanded");
        img.addEventListener("click", () => {
          img.classList.toggle("expanded");
          const openIndices = Array.from(zoomableImages)
            .map((img, i) => (img.classList.contains("expanded") ? i : null))
            .filter((i) => i !== null);
          sessionStorage.setItem(imgKey, JSON.stringify(openIndices));
        });
      });

      // Videos
      const zoomableVideos = document.querySelectorAll(
        ".video-wrapper.zoomable",
      );
      const vidKey = "lms_expanded_vid_" + this.pageId;
      const savedVideos = JSON.parse(sessionStorage.getItem(vidKey) || "[]");

      zoomableVideos.forEach((wrapper, index) => {
        const zoomBtn = document.createElement("button");
        zoomBtn.className = "video-zoom-btn";

        const isExpanded = savedVideos.includes(index);
        if (isExpanded) wrapper.classList.add("expanded");

        zoomBtn.innerHTML = isExpanded ? "✖ Зменшити" : "⛶ Збільшити";
        zoomBtn.title = isExpanded
          ? "Повернути стандартний розмір"
          : "Збільшити відео";
        wrapper.appendChild(zoomBtn);

        zoomBtn.addEventListener("click", () => {
          wrapper.classList.toggle("expanded");
          const nowExpanded = wrapper.classList.contains("expanded");
          zoomBtn.innerHTML = nowExpanded ? "✖ Зменшити" : "⛶ Збільшити";
          zoomBtn.title = nowExpanded
            ? "Повернути стандартний розмір"
            : "Збільшити відео";

          const openIndices = Array.from(zoomableVideos)
            .map((vid, i) => (vid.classList.contains("expanded") ? i : null))
            .filter((i) => i !== null);
          sessionStorage.setItem(vidKey, JSON.stringify(openIndices));
        });
      });
    }

    handleScroll() {
      const scrollY = window.scrollY;

      // Top Nav Shadow
      if (this.navContainer) {
        if (scrollY > 10) this.navContainer.classList.add("scrolled");
        else this.navContainer.classList.remove("scrolled");
      }

      // Scroll To Top Btn
      if (this.scrollToTopBtn) {
        if (scrollY > 300) this.scrollToTopBtn.classList.add("show");
        else this.scrollToTopBtn.classList.remove("show");
      }
    }

    async handleDownloadClick(link) {
      const originalText = link.innerHTML;
      const fileUrl = link.href;

      try {
        link.style.opacity = "0.6";
        link.style.pointerEvents = "none";
        const response = await fetch(fileUrl, { method: "HEAD" });

        if (response.ok) {
          const tempLink = document.createElement("a");
          tempLink.href = fileUrl;
          tempLink.download = link.getAttribute("download") || "";
          tempLink.setAttribute("data-temp", "true");
          document.body.appendChild(tempLink);
          tempLink.click();
          document.body.removeChild(tempLink);
        } else {
          link.textContent = "❌ Файл не знайдено";
          link.style.borderColor = "tomato";
          link.style.color = "tomato";
          link.style.justifyContent = "center";
          setTimeout(() => {
            link.innerHTML = originalText;
            link.style.borderColor = "";
            link.style.color = "";
            link.style.justifyContent = "";
          }, 1000);
        }
      } catch (error) {
        link.textContent = "⚠️ Помилка з'єднання";
        link.style.justifyContent = "center";
        setTimeout(() => {
          link.innerHTML = originalText;
          link.style.justifyContent = "";
        }, 3000);
      } finally {
        link.style.opacity = "1";
        link.style.pointerEvents = "auto";
      }
    }

    initGlobalTextareas() {
      const textareas = document.querySelectorAll(".test-textarea");

      textareas.forEach((textarea) => {
        // Примусово робимо висоту в 1 рядок за замовчуванням
        textarea.setAttribute("rows", "1");

        const autoResize = () => {
          if (textarea.offsetParent === null) return; // Захист для прихованих елементів
          textarea.style.height = "auto";
          textarea.style.height = textarea.scrollHeight + 2 + "px";
        };

        // Викликаємо відразу
        setTimeout(autoResize, 0);

        // Викликаємо при кожному введенні символу
        textarea.addEventListener("input", autoResize);

        // Перераховуємо висоту ЛИШЕ ПЕРШИЙ РАЗ, коли блок стає видимим на екрані
        const observer = new IntersectionObserver((entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              autoResize();
              obs.unobserve(entry.target); // ВАЖЛИВО: Припиняємо спостереження після першого ресайзу
            }
          });
        });

        observer.observe(textarea);
      });
    }
  }

  // -----------------------------------------
  // 💻 3. CODE & EDITOR MANAGER
  // -----------------------------------------
  class CodeManager {
    constructor() {
      this.init();
    }

    init() {
      this.initHighlightJS();
      this.initCopyButtons();
      this.initCodeMirror();
    }

    initHighlightJS() {
      if (typeof hljs !== "undefined") {
        hljs.highlightAll();
        if (typeof hljs.initLineNumbersOnLoad === "function") {
          hljs.initLineNumbersOnLoad({ singleLine: true });
        }
      }
    }

    initCopyButtons() {
      document.querySelectorAll("pre code").forEach((codeBlock) => {
        if (
          codeBlock.classList.contains("nocopy") ||
          codeBlock.hasAttribute("nocopy")
        )
          return;

        const pre = codeBlock.parentNode;
        const wrapper = document.createElement("div");
        wrapper.className = "code-wrapper";

        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);

        const copyBtn = document.createElement("button");
        copyBtn.className = "copy-btn";
        copyBtn.textContent = "Копіювати";
        wrapper.appendChild(copyBtn);

        copyBtn.addEventListener("click", () => {
          const codeLines = codeBlock.querySelectorAll(".hljs-ln-code");
          let textToCopy =
            codeLines.length > 0
              ? Array.from(codeLines)
                  .map((td) => td.textContent)
                  .join("\n")
              : codeBlock.textContent;

          textToCopy = textToCopy.replace(/\u00A0/g, " ");

          navigator.clipboard.writeText(textToCopy).then(() => {
            copyBtn.textContent = "Скопійовано";
            copyBtn.classList.add("copied");
            setTimeout(() => {
              copyBtn.textContent = "Копіювати";
              copyBtn.classList.remove("copied");
            }, 2000);
          });
        });
      });
    }

    initCodeMirror() {
      if (typeof CodeMirror === "undefined") return;

      const editors = document.querySelectorAll(".custom-editor-wrapper");
      const pageId = window.location.pathname.replace(/[^a-zA-Z0-9]/g, "_");

      editors.forEach((wrapper) => {
        const codeInput = wrapper.querySelector(".custom-editor-input");
        const runBtn = wrapper.querySelector(".run-btn");
        const resetBtn = wrapper.querySelector(".reset-btn");

        // Determine what type of editor this is
        const isHtmlEditor = wrapper.classList.contains("html-editor-wrapper");
        const isPythonEditor = wrapper.classList.contains(
          "python-editor-wrapper",
        );

        // Set CodeMirror mode accordingly
        let editorMode = "javascript";
        if (isHtmlEditor) editorMode = "htmlmixed";
        if (isPythonEditor) editorMode = "python";

        const editorId =
          wrapper.id || "editor-" + Math.random().toString(36).substr(2, 9);
        const storageKey = "lms_code_" + pageId + "_" + editorId;

        const savedCode = localStorage.getItem(storageKey);
        if (savedCode !== null) codeInput.value = savedCode;

        const cm = CodeMirror.fromTextArea(codeInput, {
          mode: editorMode,
          theme: "dracula",
          lineNumbers: true,
          tabSize: 4, // Python uses 4 spaces!
          lineWrapping: true,
          viewportMargin: Infinity,
          extraKeys: {
            Tab: (cm) =>
              cm.replaceSelection(
                Array(cm.getOption("indentUnit") + 1).join(" "),
              ),
          },
        });

        cm.on("change", () => localStorage.setItem(storageKey, cm.getValue()));

        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setTimeout(() => cm.refresh(), 20);
          });
        });
        observer.observe(wrapper);

        const outputDisplay = wrapper.querySelector(".custom-editor-output");
        const iframeOutput = wrapper.querySelector(".html-editor-output");
        const turtleCanvas = wrapper.querySelector("#turtle-canvas-target");

        if (isHtmlEditor && iframeOutput) iframeOutput.srcdoc = cm.getValue();

        if (runBtn) {
          runBtn.addEventListener("click", () => {
            // Захист від подвійного кліку
            if (runBtn.disabled) return;

            const code = cm.getValue();

            if (isHtmlEditor && iframeOutput) {
              iframeOutput.srcdoc = code;
            } else if (isPythonEditor && outputDisplay) {
              runBtn.disabled = true; // Блокуємо кнопку
              runBtn.style.opacity = "0.5";

              outputDisplay.textContent = "Запуск Python...\n";

              this.runPythonCode(code, outputDisplay).finally(() => {
                runBtn.disabled = false; // Розблоковуємо кнопку
                runBtn.style.opacity = "1";
              });
            } else if (outputDisplay) {
              outputDisplay.textContent = "Запуск JS...\n";
              setTimeout(() => this.runJsCode(code, outputDisplay), 50);
            }
          });
        }

        if (resetBtn) {
          const initialValue = codeInput.defaultValue;
          resetBtn.addEventListener("click", () => {
            cm.setValue(initialValue);
            if (isHtmlEditor && iframeOutput)
              iframeOutput.srcdoc = initialValue;
            if (outputDisplay)
              outputDisplay.textContent = "Очікування запуску...";
          });
        }
      });
    }

    // Runs Python Console with input() support
    runPythonCode(codeToRun, outputDisplay) {
      outputDisplay.textContent = ""; // Clear console

      Sk.configure({
        // 1. Handles print() statements
        output: function (text) {
          outputDisplay.appendChild(document.createTextNode(text));
        },
        // 2. Handles internal Python files
        read: function (x) {
          if (
            Sk.builtinFiles === undefined ||
            Sk.builtinFiles["files"][x] === undefined
          ) {
            throw "File not found: '" + x + "'";
          }
          return Sk.builtinFiles["files"][x];
        },
        // 3. Handles input() statements dynamically!
        inputfun: function (prompt) {
          return new Promise((resolve) => {
            // Print the prompt text (e.g., "What is your name?")
            outputDisplay.appendChild(document.createTextNode(prompt));

            // Create an interactive text field directly in the console
            const inputField = document.createElement("input");
            inputField.type = "text";

            // Style it to look like a glowing terminal cursor
            inputField.style.background = "transparent";
            inputField.style.border = "none";
            inputField.style.borderBottom = "2px solid var(--accent-pop)";
            inputField.style.color = "var(--accent-pop)";
            inputField.style.outline = "none";
            inputField.style.fontFamily = "inherit";
            inputField.style.fontSize = "inherit";
            inputField.style.width = "50%";
            inputField.style.marginLeft = "5px";

            outputDisplay.appendChild(inputField);
            inputField.focus();

            // Wait for the student to press "Enter"
            inputField.addEventListener("keydown", (e) => {
              if (e.key === "Enter") {
                const val = inputField.value;
                inputField.remove(); // Remove the input box
                outputDisplay.appendChild(document.createTextNode(val + "\n")); // Convert their typing to plain text
                resolve(val); // Send the value back into Python
              }
            });
          });
        },
      });

      // Run the code asynchronously
      const myPromise = Sk.misceval.asyncToPromise(() => {
        return Sk.importMainWithBody("<stdin>", false, codeToRun, true);
      });

      myPromise.then(
        () => {
          if (outputDisplay.textContent === "") {
            outputDisplay.textContent =
              "Код виконано успішно (немає виводу в консоль).";
          }
        },
        (error) => {
          outputDisplay.appendChild(
            document.createTextNode("\nПомилка: " + error.toString()),
          );
        },
      );

      return myPromise;
    }

    runJsCode(codeToRun, outputDisplay) {
      let simulatedOutput = "";
      const originalLog = console.log;
      const originalError = console.error;

      const formatOutput = (args) =>
        args
          .map((a) =>
            typeof a === "object" ? JSON.stringify(a, null, 2) : String(a),
          )
          .join(" ") + "\n";

      console.log = (...args) => (simulatedOutput += formatOutput(args));
      console.error = (...args) =>
        (simulatedOutput += "Помилка: " + formatOutput(args));

      try {
        new Function(codeToRun)();
        outputDisplay.textContent =
          simulatedOutput.trim() || "Код виконано (немає виводу в консоль)";
      } catch (error) {
        outputDisplay.textContent = "Помилка у коді: " + error.message;
      } finally {
        console.log = originalLog;
        console.error = originalError;
      }
    }
  }

  // -----------------------------------------
  // 📝 3.5 STANDALONE EXERCISE MANAGER
  // -----------------------------------------
  class StandaloneExerciseManager {
    constructor() {
      this.pageId = window.location.pathname.replace(/[^a-zA-Z0-9]/g, "_");
      this.clearBtns = document.querySelectorAll(".clear-section-btn");

      this.inputElements = document.querySelectorAll(
        "section .test-textarea:not(.homework-form .test-textarea), " +
          "section .test-input:not(.homework-form .test-input), " +
          "section .test-radio:not(.homework-form .test-radio), " +
          "section .test-checkbox:not(.homework-form .test-checkbox):not(.dynamic-cb)",
      );
      this.sectionToClear = null;

      this.init();
    }

    init() {
      this.loadSavedData();
      this.setupEventListeners();
    }

    setupEventListeners() {
      this.inputElements.forEach((el) => {
        const eventType =
          el.type === "radio" || el.type === "checkbox" ? "change" : "input";
        el.addEventListener(eventType, (e) => this.saveData(e.target));
      });

      this.clearBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          this.sectionToClear = e.target.getAttribute("data-section");

          const clearDialog = document.getElementById("clear-confirm-dialog");
          if (clearDialog) {
            clearDialog.querySelector("p").textContent =
              "Точно хочеш очистити свої відповіді у цьому блоці?";
            clearDialog.showModal();
          }
        });
      });

      const dialogConfirmBtn = document.getElementById("dialog-confirm-btn");
      if (dialogConfirmBtn) {
        dialogConfirmBtn.addEventListener("click", () => {
          if (this.sectionToClear) {
            this.clearSectionData(this.sectionToClear);
            this.sectionToClear = null;
          }
        });
      }
    }

    saveData(el) {
      const keyBase = el.name || el.id;
      if (!keyBase) return;

      const storageKey = `lms_standalone_${this.pageId}_${keyBase}`;

      if (el.type === "radio") {
        if (el.checked) localStorage.setItem(storageKey, el.value);
      } else if (el.type === "checkbox") {
        localStorage.setItem(storageKey, el.checked);
      } else {
        localStorage.setItem(storageKey, el.value);
      }
    }

    loadSavedData() {
      this.inputElements.forEach((el) => {
        const keyBase = el.name || el.id;
        if (!keyBase) return;

        const storageKey = `lms_standalone_${this.pageId}_${keyBase}`;
        const savedValue = localStorage.getItem(storageKey);

        if (savedValue !== null) {
          if (el.type === "radio") {
            if (el.value === savedValue) el.checked = true;
          } else if (el.type === "checkbox") {
            el.checked = savedValue === "true";
          } else {
            el.value = savedValue;
            if (el.classList.contains("test-textarea")) {
              const event = new Event("input", { bubbles: true });
              el.dispatchEvent(event);
            }
          }
        }
      });
    }

    clearSectionData(sectionId) {
      const section = document.getElementById(sectionId);
      if (!section) return;

      // 1. Clear standard inputs
      const inputsInSection = section.querySelectorAll(
        ".test-textarea:not(.homework-form .test-textarea), " +
          ".test-input:not(.homework-form .test-input), " +
          ".test-radio:not(.homework-form .test-radio), " +
          ".test-checkbox:not(.homework-form .test-checkbox):not(.dynamic-cb)",
      );

      inputsInSection.forEach((el) => {
        const keyBase = el.name || el.id;
        if (keyBase) {
          localStorage.removeItem(`lms_standalone_${this.pageId}_${keyBase}`);
        }

        if (el.type === "radio" || el.type === "checkbox") {
          el.checked = false;
        } else {
          el.value = "";
          if (el.classList.contains("test-textarea")) {
            el.style.height = "auto";
          }
        }
      });

      // 2. Clear Sorting Games in this section
      const sortingGamesInSection = section.querySelectorAll(
        ".sorting-game-module",
      );
      sortingGamesInSection.forEach((gameModule) => {
        if (gameModule.sortInstance) {
          gameModule.sortInstance.resetGame();
        }
      });
    }
  }

  // -----------------------------------------
  // 📝 4. HOMEWORK MANAGER
  // -----------------------------------------
  // Глобальна змінна для модального вікна (щоб знати, яку саме форму очищати)
  let activeFormToClear = null;

  class HomeworkManager {
    constructor(formElement) {
      this.hwForm = formElement;

      // Використовуємо data-form-id для розділення збережень у localStorage
      this.formId =
        this.hwForm.getAttribute("data-form-id") ||
        Math.random().toString(36).substr(2, 9);

      // Шукаємо елементи ТІЛЬКИ всередині цієї конкретної форми (через класи, а не ID)
      this.studentNameInput = this.hwForm.querySelector(".student-name");
      this.saveBtn = this.hwForm.querySelector(".save-hw-btn");
      this.copyBtn = this.hwForm.querySelector(".copy-hw-btn");
      this.clearBtn = this.hwForm.querySelector(".clear-hw-btn");
      this.errorMsg = this.hwForm.querySelector(".hw-error-msg");

      this.pageId = window.location.pathname.replace(/[^a-zA-Z0-9]/g, "_");
      this.formStorageKey = `lms_hw_form_${this.pageId}_${this.formId}`;

      this.init();
    }

    init() {
      this.hwForm.addEventListener("submit", (e) => e.preventDefault());
      this.loadSavedData();
      this.initAutoResizeTextareas();
      this.hwForm.addEventListener("input", () => this.saveData());
      this.hwForm.addEventListener("change", () => this.saveData());

      if (this.saveBtn)
        this.saveBtn.addEventListener("click", () => this.handleSave());
      if (this.copyBtn)
        this.copyBtn.addEventListener("click", () => this.handleCopy());

      if (this.clearBtn) {
        this.clearBtn.addEventListener("click", () => {
          activeFormToClear = this; // Запам'ятовуємо, яку форму очищати
          const clearDialog = document.getElementById("clear-confirm-dialog");
          if (clearDialog) {
            clearDialog.querySelector("p").textContent =
              "Ти справді хочеш видалити ВСІ свої відповіді і почати заново?";
            clearDialog.showModal();
          }
        });
      }
    }

    initAutoResizeTextareas() {
      const textareas = this.hwForm.querySelectorAll(".test-textarea");

      textareas.forEach((textarea) => {
        // Примусово робимо висоту в 1 рядок за замовчуванням
        textarea.setAttribute("rows", "1");

        // Функція для підлаштування висоти
        const autoResize = () => {
          // ЗАХИСТ: Якщо поле приховане (наприклад, акордеон закритий),
          // його offsetParent буде null. Ми скасовуємо зміну висоти, щоб не сплюснути його до 0.
          if (textarea.offsetParent === null) return;

          textarea.style.height = "auto"; // Спочатку скидаємо висоту
          textarea.style.height = textarea.scrollHeight + 2 + "px"; // +2px для рамки
        };

        // Викликаємо відразу (на випадок, якщо вкладка вже відкрита)
        setTimeout(autoResize, 0);

        // Викликаємо при кожному вводі символу
        textarea.addEventListener("input", autoResize);

        // НОВЕ: Спостерігач, який чекає, поки поле стане видимим (коли ви відкриваєте вкладку)
        const observer = new IntersectionObserver((entries, obs) => {
          // ДОДАНО: параметр obs
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              autoResize(); // Перераховуємо висоту в момент появи на екрані
              obs.unobserve(entry.target); // ДОДАНО: Припиняємо спостереження після першого ресайзу
            }
          });
        });

        // Починаємо стежити за цим полем
        observer.observe(textarea);
      });
    }

    loadSavedData() {
      const savedData = JSON.parse(
        localStorage.getItem(this.formStorageKey) || "{}",
      );
      this.hwForm
        .querySelectorAll("input, textarea:not(.custom-editor-input)")
        .forEach((el) => {
          if (el.type === "radio" || el.type === "checkbox") {
            if (savedData[el.name] && savedData[el.name].includes(el.value))
              el.checked = true;
          } else {
            if (savedData[el.name]) el.value = savedData[el.name];
          }
        });
    }

    saveData() {
      const data = {};
      this.hwForm
        .querySelectorAll(
          "input[type='radio']:checked, input[type='checkbox']:checked",
        )
        .forEach((el) => {
          if (!data[el.name]) data[el.name] = [];
          data[el.name].push(el.value);
        });
      this.hwForm
        .querySelectorAll(
          "textarea:not(.custom-editor-input), input[type='text']",
        )
        .forEach((el) => {
          data[el.name] = el.value;
        });

      localStorage.setItem(this.formStorageKey, JSON.stringify(data));
      if (this.errorMsg) this.errorMsg.style.display = "none";
      this.hwForm
        .querySelectorAll(".error-highlight")
        .forEach((el) => el.classList.remove("error-highlight"));
    }

    collectAndValidate() {
      let isValid = true;
      let outputText = `ДОМАШНЄ ЗАВДАННЯ\n\n`;
      let name = "";

      // Перевіряємо, чи існує поле імені у цій формі
      if (this.studentNameInput) {
        name = this.studentNameInput.value.trim();
        if (!name) {
          this.studentNameInput
            .closest(".student-info")
            .classList.add("error-highlight");
          isValid = false;
        }
        outputText += `Учень: ${name}\n`;
      }

      const date = new Date();
      outputText += `Час виконання: ${date.toLocaleDateString("uk-UA")} о ${date.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}\n\n- - - - - - - - - - - - - - - - - - - -\n\n`;

      const questions = this.hwForm.querySelectorAll(
        ".test-question:not(.student-info)",
      );

      questions.forEach((qBlock) => {
        let qText = "";
        const questionTitle = qBlock.querySelector("legend, p");

        if (questionTitle) {
          qText = questionTitle.textContent.replace(/\s+/g, " ").trim();
          const codeSnippet = qBlock.querySelector("pre code");
          if (codeSnippet) qText += `\n${codeSnippet.textContent}`;
        } else if (qBlock.querySelector(".editor-title")) {
          qText =
            "Практичне завдання (" +
            qBlock
              .querySelector(".editor-title")
              .textContent.replace(/\s+/g, " ")
              .trim() +
            ")";
        }

        let answerText = "";
        let isAnswered = false;

        const checkedRadio = qBlock.querySelector(".test-radio:checked");
        if (checkedRadio) {
          answerText = checkedRadio.value;
          isAnswered = true;
        }

        const checkedBoxes = qBlock.querySelectorAll(".test-checkbox:checked");
        if (checkedBoxes.length > 0) {
          answerText = Array.from(checkedBoxes)
            .map((cb) => cb.value)
            .join(", ");
          isAnswered = true;
        }

        const textarea = qBlock.querySelector(".test-textarea");
        if (textarea && textarea.value.trim() !== "") {
          answerText = textarea.value.trim();
          isAnswered = true;
        }

        const editorWrapper = qBlock.querySelector(".custom-editor-wrapper");
        if (editorWrapper) {
          const cmInstance =
            editorWrapper.querySelector(".CodeMirror")?.CodeMirror;
          if (cmInstance && cmInstance.getValue().trim() !== "") {
            answerText = "\n" + cmInstance.getValue();
            isAnswered = true;
          }
        }

        if (!isAnswered) {
          qBlock.classList.add("error-highlight");
          isValid = false;
        }

        if (qText || answerText) {
          outputText += `❓ Питання: ${qText}\n📝 Відповідь: ${answerText || "[Немає відповіді]"}\n\n- - - - - - - - - - - - - - - - - - - -\n\n`;
        }
      });

      return {
        isValid,
        outputText: outputText.replace(/\t/g, "  ").replace(/\u00A0/g, " "),
        name,
      };
    }

    handleSave() {
      const { isValid, outputText, name } = this.collectAndValidate();

      if (!isValid) {
        if (this.errorMsg) this.errorMsg.style.display = "block";
        const errorEl = this.hwForm.querySelector(".error-highlight");
        if (errorEl)
          errorEl.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const titleElement = document.getElementById("lesson-title");
      const pageTitle = titleElement ? titleElement.textContent.trim() : "Тема";

      const safeTopic = pageTitle
        .replace(/\s+/g, "_")
        .replace(/[^a-zа-яіїєґ0-9_]/gi, "");
      const safeName = name
        ? "_" + name.replace(/[^a-zа-яіїєґ0-9]/gi, "_")
        : "";

      a.href = url;
      a.download = `ДЗ_${safeTopic}${safeName}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      this.tempFeedback(
        this.saveBtn,
        "✅ Успішно збережено!",
        "mediumseagreen",
      );
    }

    handleCopy() {
      const { isValid, outputText } = this.collectAndValidate();

      if (!isValid) {
        if (this.errorMsg) this.errorMsg.style.display = "block";
        const errorEl = this.hwForm.querySelector(".error-highlight");
        if (errorEl)
          errorEl.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      navigator.clipboard.writeText(outputText).then(() => {
        this.tempFeedback(this.copyBtn, "✅ Скопійовано!", null);
      });
    }

    executeClear() {
      // 1. Remove from local storage
      localStorage.removeItem(this.formStorageKey);
      this.hwForm
        .querySelectorAll(".custom-editor-wrapper")
        .forEach((wrapper) => {
          localStorage.removeItem("lms_code_" + this.pageId + "_" + wrapper.id);
        });

      // 2. Clear inputs visually without reloading the page!
      this.hwForm.reset();

      this.hwForm
        .querySelectorAll("input[type='radio'], input[type='checkbox']")
        .forEach((el) => (el.checked = false));

      // ЗМІНА 1: Виключаємо .custom-editor-input з масового очищення
      this.hwForm
        .querySelectorAll(
          "textarea:not(.custom-editor-input), input[type='text']",
        )
        .forEach((el) => {
          el.value = "";
          // Якщо це авторозширюване поле, повертаємо його до розміру 1 рядка
          if (el.classList.contains("test-textarea")) {
            el.style.height = "auto";
          }
        });

      // ЗМІНА 2: Скидаємо CodeMirror до початкового коду (defaultValue)
      this.hwForm
        .querySelectorAll(".custom-editor-wrapper")
        .forEach((wrapper) => {
          const codeInput = wrapper.querySelector(".custom-editor-input");
          const cmWrapper = wrapper.querySelector(".CodeMirror");
          const outputDisplay = wrapper.querySelector(".custom-editor-output");
          const iframeOutput = wrapper.querySelector(".html-editor-output");

          if (codeInput && cmWrapper && cmWrapper.CodeMirror) {
            const initialValue = codeInput.defaultValue;

            // Повертаємо стартовий код
            cmWrapper.CodeMirror.setValue(initialValue);

            // Скидаємо iframe для HTML або консоль для Python/JS
            if (iframeOutput) iframeOutput.srcdoc = initialValue;
            if (outputDisplay)
              outputDisplay.textContent = "Очікування запуску...";
          }
        });

      // 3. Save the new empty state
      this.saveData();
    }

    tempFeedback(btn, text, color) {
      const originalText = btn.innerHTML;
      btn.innerHTML = text;
      if (color) {
        btn.style.backgroundColor = color;
        btn.style.borderColor = color;
      }
      setTimeout(() => {
        btn.innerHTML = originalText;
        if (color) {
          btn.style.backgroundColor = "";
          btn.style.borderColor = "";
        }
      }, 2500);
    }
  }
  // -----------------------------------------
  // 🌐 5. GLOBAL EVENT DELEGATOR (The Traffic Controller)
  // -----------------------------------------
  class GlobalEvents {
    constructor(themeMgr, uiMgr) {
      this.themeMgr = themeMgr;
      this.uiMgr = uiMgr;

      this.isScrolling = false;
      this.init();
    }

    init() {
      // 1. One Click Listener for the entire document
      document.addEventListener("click", (e) => this.handleClick(e));

      // 2. One Scroll Listener using requestAnimationFrame for performance
      window.addEventListener("scroll", () => {
        if (!this.isScrolling) {
          window.requestAnimationFrame(() => {
            this.uiMgr.handleScroll();
            this.isScrolling = false;
          });
          this.isScrolling = true;
        }
      });
    }

    handleClick(e) {
      // A. Scroll To Top Button
      const scrollBtn = e.target.closest("#scrollToTopBtn");
      if (scrollBtn) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // B. Dyslexia Mode Toggle
      const dyslexiaBtn = e.target.closest("#dyslexia-mode-btn");
      if (dyslexiaBtn) {
        e.preventDefault();
        this.themeMgr.toggleDyslexiaMode(dyslexiaBtn);
        return;
      }

      // C. Download Links (File checking)
      const downloadLink = e.target.closest("a[download]:not([data-temp])");
      if (downloadLink) {
        e.preventDefault();
        this.uiMgr.handleDownloadClick(downloadLink);
        return;
      }

      // D. Smooth Page Transitions for regular links
      const navLink = e.target.closest("a");
      if (navLink) {
        if (
          navLink.hasAttribute("download") ||
          navLink.target === "_blank" ||
          e.ctrlKey ||
          e.metaKey ||
          e.shiftKey ||
          e.altKey ||
          navLink.origin !== window.location.origin ||
          navLink.hash ||
          navLink.getAttribute("href") === "" ||
          navLink.getAttribute("href") === "#"
        ) {
          return; // Let default behavior happen
        }

        e.preventDefault();
        document.body.classList.add("is-leaving");
        setTimeout(() => (window.location.href = navLink.href), 700);
      }
    }
  }

  // -----------------------------------------
  // 6. FLASHCARD MANAGER
  // -----------------------------------------
  // -----------------------------------------
  // 6. FLASHCARD MANAGER
  // -----------------------------------------
  class FlashcardManager {
    constructor(moduleElement) {
      this.module = moduleElement;

      // 1. Читаємо JSON (якщо він є)
      const dataScript = this.module.querySelector(".fc-data");
      this.deck = [];
      if (dataScript) {
        try {
          this.deck = JSON.parse(dataScript.textContent);
        } catch (error) {
          console.error("Помилка читання словника:", error);
        }
      }

      // 2. DOM Елементи
      this.scene = this.module.querySelector(".flashcard-scene");
      this.cardElement = this.module.querySelector(".flashcard");
      this.frontText = this.module.querySelector(".fc-front");
      this.backText = this.module.querySelector(".fc-back");

      this.controlsBlock = this.module.querySelector(".flashcard-controls");
      this.btnKnow = this.module.querySelector(".fc-know-btn");
      this.btnDontKnow = this.module.querySelector(".fc-dont-know-btn");

      this.menuBlock = this.module.querySelector(".flashcard-menu");
      this.btnAction = this.module.querySelector(".fc-action-btn");
      this.btnClear = this.module.querySelector(".fc-clear-btn");

      this.statRemaining = this.module.querySelector(".fc-remaining");
      this.statLearned = this.module.querySelector(".fc-learned");

      // 3. Налаштування LocalStorage
      this.pageId = window.location.pathname.replace(/[^a-zA-Z0-9]/g, "_");
      this.fcId = this.module.getAttribute("data-fc-id") || "default";
      this.storageKey = `lms_fc_${this.pageId}_${this.fcId}`;

      this.isAnimating = false;

      this.init();
    }

    init() {
      this.loadState();

      // Слухачі подій
      this.cardElement.addEventListener("click", () => {
        if (!this.isAnimating && this.controlsBlock.style.display !== "none") {
          this.cardElement.classList.toggle("is-flipped");
        }
      });

      if (this.btnKnow)
        this.btnKnow.addEventListener("click", () => this.handleAnswer(true));
      if (this.btnDontKnow)
        this.btnDontKnow.addEventListener("click", () =>
          this.handleAnswer(false),
        );

      if (this.btnAction)
        this.btnAction.addEventListener("click", () => this.startPlaying());
      if (this.btnClear) {
        this.btnClear.addEventListener("click", () => {
          activeFormToClear = this;
          const clearDialog = document.getElementById("clear-confirm-dialog");
          if (clearDialog) {
            clearDialog.querySelector("p").textContent =
              "Точно видалити прогрес вивчення цих слів і почати з нуля?";
            clearDialog.showModal();
          }
        });
      }

      // Керування з клавіатури
      document.addEventListener("keydown", (e) => {
        if (this.isAnimating || this.controlsBlock.style.display === "none")
          return;
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
          return;

        const rect = this.module.getBoundingClientRect();
        const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

        if (isVisible) {
          if (e.key === " ") {
            e.preventDefault();
            this.cardElement.classList.toggle("is-flipped");
          }
          if (e.key === "ArrowLeft") this.handleAnswer(true);
          if (e.key === "ArrowRight") this.handleAnswer(false);
        }
      });

      // Запуск екрану меню
      this.updateUI();
    }

    loadState() {
      const saved = JSON.parse(localStorage.getItem(this.storageKey));
      if (saved && saved.currentQueue) {
        this.currentQueue = saved.currentQueue;
        this.nextQueue = saved.nextQueue || [];
        this.learnedCount = saved.learnedCount || 0;
      } else {
        this.resetData();
      }
    }

    saveState() {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify({
          currentQueue: this.currentQueue,
          nextQueue: this.nextQueue,
          learnedCount: this.learnedCount,
        }),
      );
    }

    resetData() {
      this.currentQueue = [...this.deck];
      this.nextQueue = [];
      this.learnedCount = 0;
    }

    executeClear() {
      this.resetData();
      this.saveState();
      this.updateUI();
    }

    // НОВИЙ МЕТОД ДЛЯ ДИНАМІЧНИХ КАРТОК
    updateDeck(newDeck) {
      this.deck = newDeck;
      this.resetData(); // Оновлення колоди скидає поточний прогрес
      this.saveState();
      this.updateUI();
    }

    startPlaying() {
      if (this.deck.length === 0) return; // Захист
      this.menuBlock.style.display = "none";
      this.controlsBlock.style.display = "flex";
      this.showCurrentCard();
    }

    updateUI() {
      this.updateStats();

      // Захист від порожнього словника (Dynamic flashcards)
      if (this.deck.length === 0) {
        this.showMenu(
          "Dictionary is empty",
          "Select words to study ☝️",
          "Waiting...",
        );
        if (this.btnAction) {
          this.btnAction.disabled = true;
          this.btnAction.style.opacity = "0.5";
          this.btnAction.style.cursor = "not-allowed";
        }
        return;
      } else {
        if (this.btnAction) {
          this.btnAction.disabled = false;
          this.btnAction.style.opacity = "1";
          this.btnAction.style.cursor = "pointer";
        }
      }

      // 1. Повна перемога (Всі слова вивчені)
      if (this.currentQueue.length === 0 && this.nextQueue.length === 0) {
        this.showMenu("🎉 All words learned!", "Great job!", "Start over");
        return;
      }

      // 2. Раунд завершено (Є слова для наступного раунду)
      if (this.currentQueue.length === 0 && this.nextQueue.length > 0) {
        this.currentQueue = [...this.nextQueue];
        this.nextQueue = [];
        this.saveState();
        this.updateStats();
        this.showMenu(
          "🔄 Round complete",
          `Words to review: ${this.currentQueue.length}`,
          "Start next round",
        );
        return;
      }

      // 3. Звичайний старт / Продовження після паузи
      const totalLeft = this.currentQueue.length + this.nextQueue.length;
      if (this.learnedCount > 0 || this.nextQueue.length > 0) {
        this.showMenu(
          "⏸️ Progress saved",
          `Left to learn: ${totalLeft}`,
          "Continue learning",
        );
      } else {
        this.showMenu(
          "👋 Ready?",
          `Words in deck: ${this.deck.length}`,
          "Start learning",
        );
      }
    }

    showMenu(title, subtitle, btnText) {
      this.controlsBlock.style.display = "none";
      this.menuBlock.style.display = "block";
      this.cardElement.classList.remove("is-flipped");

      // Обов'язково перевіряємо нову англійську назву для скидання прогресу
      if (title === "All done! ✔️" || title === "🎉 All words learned!") {
        this.btnAction.onclick = () => {
          this.resetData();
          this.saveState();
          this.updateStats();
          this.startPlaying();
        };
      } else {
        this.btnAction.onclick = () => this.startPlaying();
      }

      this.btnAction.textContent = btnText;
      this.frontText.innerHTML = `<div style="line-height: 1.4;"><div style="font-size: 24px; margin-bottom: 10px; color: var(--title);">${title}</div><div style="font-size: 16px; font-weight: normal; color: var(--text-soft);">${subtitle}</div></div>`;
      this.backText.innerHTML = "";
    }

    showCurrentCard() {
      this.cardElement.classList.remove("is-flipped");
      setTimeout(() => {
        if (this.currentQueue.length > 0) {
          const currentWord = this.currentQueue[0];
          this.frontText.textContent =
            currentWord.front || currentWord.en || "";
          this.backText.textContent = currentWord.back || currentWord.uk || "";
          this.updateStats();
        }
      }, 150);
    }

    handleAnswer(knowIt) {
      if (this.isAnimating || this.currentQueue.length === 0) return;
      this.isAnimating = true;

      const swipeClass = knowIt ? "swipe-left" : "swipe-right";
      this.scene.classList.add(swipeClass);

      setTimeout(() => {
        const word = this.currentQueue.shift();

        if (knowIt) {
          this.learnedCount++;
        } else {
          this.nextQueue.push(word);
        }

        this.saveState();
        this.scene.classList.remove(swipeClass);

        if (this.currentQueue.length > 0) {
          this.showCurrentCard();
          this.isAnimating = false;
        } else {
          this.updateUI();
          this.isAnimating = false;
        }
      }, 500);
    }

    updateStats() {
      const totalRemaining = this.currentQueue.length + this.nextQueue.length;
      if (this.statRemaining)
        this.statRemaining.textContent = `Remaining: ${totalRemaining}`;
      if (this.statLearned)
        this.statLearned.textContent = `Done: ${this.learnedCount} / ${this.deck.length}`;
    }
  }

  // -----------------------------------------
  // 🌍 7. TRANSLATOR MANAGER (MyMemory API)
  // -----------------------------------------
  class TranslatorManager {
    constructor(moduleElement) {
      this.module = moduleElement;

      // 1. Get initial languages from HTML
      this.sourceLang = this.module.getAttribute("data-source-lang") || "en";
      this.targetLang = this.module.getAttribute("data-target-lang") || "uk";

      // Language Display Names Map (Easy to expand later for Italian, etc.)
      this.langNames = {
        en: "Англійська",
        uk: "Українська",
        it: "Італійська",
      };

      // 2. DOM Elements
      this.inputEl = this.module.querySelector(".translator-input");
      this.btn = this.module.querySelector(".translate-btn");
      this.outputEl = this.module.querySelector(".translator-output");
      this.swapBtn = this.module.querySelector(".swap-lang-btn");

      this.sourceLabel = this.module.querySelector(".lang-source");
      this.targetLabel = this.module.querySelector(".lang-target");

      this.init();
    }

    init() {
      // Trigger translation
      this.btn.addEventListener("click", () => this.translate());

      this.inputEl.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.translate();
        }
      });

      // Trigger Swap
      if (this.swapBtn) {
        this.swapBtn.addEventListener("click", () => this.swapLanguages());
      }

      this.updateLabels();
    }

    swapLanguages() {
      // 1. Swap the language codes
      const temp = this.sourceLang;
      this.sourceLang = this.targetLang;
      this.targetLang = temp;

      // 2. Update the HTML attributes (optional, but good practice)
      this.module.setAttribute("data-source-lang", this.sourceLang);
      this.module.setAttribute("data-target-lang", this.targetLang);

      // 3. Update the UI
      this.updateLabels();

      // 4. Animate the button for feedback
      this.swapBtn.style.transform = "rotate(180deg)";
      setTimeout(() => (this.swapBtn.style.transform = "rotate(0)"), 300);

      // 5. Clear previous output if they swap
      this.outputEl.style.display = "none";
      this.outputEl.innerHTML = "";
    }

    updateLabels() {
      if (this.sourceLabel)
        this.sourceLabel.textContent =
          this.langNames[this.sourceLang] || this.sourceLang;
      if (this.targetLabel)
        this.targetLabel.textContent =
          this.langNames[this.targetLang] || this.targetLang;

      // Update placeholder to hint what language to type
      const sourceName =
        this.langNames[this.sourceLang]?.toLowerCase() || this.sourceLang;
      this.inputEl.placeholder = `Введіть слово (${sourceName})...`;
    }

    async translate() {
      const text = this.inputEl.value.trim();
      if (!text) return;

      this.outputEl.style.display = "block";
      this.outputEl.innerHTML = `<span style="color: var(--text-soft);">Перекладаю... ⏳</span>`;
      this.btn.disabled = true;

      const encodedText = encodeURIComponent(text);

      // Використовуємо публічний клієнтський API Google Перекладача
      // dt=t (запитує переклад)
      // dt=bd (запитує словник з альтернативами, якщо це одне слово)
      const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${this.sourceLang}&tl=${this.targetLang}&dt=t&dt=bd&q=${encodedText}`;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();

        // 1. Головний переклад (у Google він завжди лежить за індексом data[0][0][0])
        const mainTranslation = data[0][0][0];

        // 2. Шукаємо словникові альтернативи
        let alternativesHTML = "";

        // Google повертає словник у data[1], якщо користувач ввів одне слово
        if (data[1] && data[1].length > 0) {
          const alternatives = [];

          // Перебираємо частини мови (іменник, дієслово тощо)
          data[1].forEach((partOfSpeech) => {
            // Властивість [2] містить масив альтернативних слів
            if (partOfSpeech[2]) {
              partOfSpeech[2].forEach((wordInfo) => {
                const altWord = wordInfo[0];
                // Перевіряємо, чи ввів користувач лише одне слово (без пробілів)
                const isInputSingleWord = !text.trim().includes(" ");
                const isAltSingleWord = !altWord.trim().includes(" ");

                if (
                  altWord &&
                  altWord.toLowerCase() !== mainTranslation.toLowerCase()
                ) {
                  // Якщо шукаємо одне слово — відкидаємо з альтернатив цілі фрази (як-от "брати квіток")
                  if (isInputSingleWord && !isAltSingleWord) {
                    return; // Пропускаємо це слово і йдемо далі
                  }

                  alternatives.push(altWord.toLowerCase());
                }
              });
            }
          });

          // Залишаємо лише унікальні слова і беремо перші 5
          const uniqueAlts = [...new Set(alternatives)].slice(0, 5);

          if (uniqueAlts.length > 0) {
            alternativesHTML = `
              <div style="margin-top: 12px; font-size: 13px; color: var(--text-soft);">Інші значення:</div>
              <div style="font-size: 15px; color: var(--text-main); font-weight: 500;">
                ${uniqueAlts.join(", ")}
              </div>
            `;
          }
        }

        // 3. Виводимо результат
        this.outputEl.innerHTML = `
          <div style="font-size: 13px; color: var(--text-soft);">Переклад:</div>
          <div style="font-size: 18px; font-weight: bold; color: var(--brand2);">${mainTranslation}</div>
          ${alternativesHTML}
        `;
      } catch (error) {
        console.error("Translation API Error:", error);
        this.outputEl.innerHTML = `<span style="color: tomato;">❌ Помилка перекладу. Перевірте з'єднання.</span>`;
      } finally {
        this.btn.disabled = false;
      }
    }
  }

  // -----------------------------------------
  // 🗂️ 8. SORTING GAME MANAGER
  // -----------------------------------------
  class SortingGameManager {
    constructor(moduleElement) {
      this.module = moduleElement;
      this.gameId = this.module.getAttribute("data-game-id") || "default";
      this.pageId = window.location.pathname.replace(/[^a-zA-Z0-9]/g, "_");
      this.storageKey = `lms_sort_${this.pageId}_${this.gameId}`;

      // 1. Read JSON Configuration
      const dataScript = this.module.querySelector(".sorting-data");
      if (!dataScript) return;
      try {
        this.config = JSON.parse(dataScript.textContent);
      } catch (error) {
        console.error("Sorting Game JSON Error:", error);
        return;
      }

      // 2. DOM Elements
      this.bank = this.module.querySelector(".sorting-bank");
      this.zonesContainer = this.module.querySelector(
        ".sorting-zones-container",
      );
      this.feedbackEl = this.module.querySelector(".sorting-feedback");
      this.resetBtn = this.module.querySelector(".sorting-reset-btn");

      // State
      this.draggedItem = null;

      this.init();
    }

    init() {
      this.buildUI();
      this.setupDragEvents();

      if (this.resetBtn) {
        this.resetBtn.addEventListener("click", () => this.resetGame());
      }
    }

    // Storage Methods
    loadState() {
      try {
        const saved = localStorage.getItem(this.storageKey);
        return saved ? JSON.parse(saved) : {};
      } catch (e) {
        return {};
      }
    }

    saveState() {
      const state = {};
      // Iterate through all items and save their current location
      this.module.querySelectorAll(".sorting-item").forEach((item) => {
        const itemId = item.getAttribute("data-item-id");
        const parentZone = item.closest(".sorting-zone");

        if (parentZone) {
          state[itemId] = parentZone.getAttribute("data-category");
        } else {
          state[itemId] = "bank";
        }
      });
      localStorage.setItem(this.storageKey, JSON.stringify(state));
    }

    // Constructs the HTML dynamically based on the JSON config & Saved State
    buildUI() {
      this.bank.innerHTML = "";
      this.zonesContainer.innerHTML = "";
      this.feedbackEl.textContent = "";

      const savedState = this.loadState();

      // Create Zones
      this.config.categories.forEach((category) => {
        const zone = document.createElement("div");
        zone.className = "sorting-zone";
        zone.setAttribute("data-category", category.id);

        zone.innerHTML = `
          <div class="sorting-zone-header">
            <div class="sorting-zone-title">${category.title}</div>
            ${category.hint ? `<div class="sorting-zone-hint">${category.hint}</div>` : ""}
          </div>
          <div class="sorting-zone-content"></div>
        `;
        this.zonesContainer.appendChild(zone);
      });

      // Create Items (Shuffle them first)
      const shuffledItems = [...this.config.items].sort(
        () => Math.random() - 0.5,
      );

      shuffledItems.forEach((item) => {
        const el = document.createElement("div");
        el.className = "sorting-item";
        el.textContent = item.text;
        el.setAttribute("data-item-id", item.id);
        el.setAttribute("data-correct-target", item.correctCategory);

        const savedLocation = savedState[item.id] || "bank";

        // Check if the item was already correctly sorted in a previous session
        if (savedLocation !== "bank") {
          const targetZoneContent = this.zonesContainer.querySelector(
            `.sorting-zone[data-category="${savedLocation}"] .sorting-zone-content`,
          );

          if (targetZoneContent) {
            el.draggable = false;
            el.classList.add("correct");
            targetZoneContent.appendChild(el);
          } else {
            // Fallback in case the JSON category was renamed/deleted but old storage exists
            el.draggable = true;
            this.bank.appendChild(el);
          }
        } else {
          // Item belongs in the bank
          el.draggable = true;
          this.bank.appendChild(el);
        }
      });

      // Check if they had already won in a previous session
      this.checkWinCondition();
    }

    setupDragEvents() {
      // 1. Setup Draggable Items
      this.module.addEventListener("dragstart", (e) => {
        if (e.target.classList.contains("sorting-item")) {
          this.draggedItem = e.target;

          // Ghost image clone logic
          const ghost = e.target.cloneNode(true);
          ghost.style.position = "absolute";
          ghost.style.top = "-1000px";
          ghost.style.background = "var(--panel)";
          ghost.style.border = "2px solid var(--brand2)";
          ghost.style.borderRadius = "20px";
          ghost.style.color = "var(--text-main)";
          ghost.style.padding = "8px 15px";
          ghost.style.fontFamily = "inherit";
          document.body.appendChild(ghost);

          e.dataTransfer.setDragImage(ghost, 20, 20);

          setTimeout(() => {
            document.body.removeChild(ghost);
            e.target.classList.add("dragging");
          }, 0);

          e.dataTransfer.setData(
            "text/plain",
            e.target.getAttribute("data-item-id"),
          );
        }
      });

      this.module.addEventListener("dragend", (e) => {
        if (e.target.classList.contains("sorting-item")) {
          e.target.classList.remove("dragging");
          this.draggedItem = null;
          this.removeDragOverClasses();
        }
      });

      // 2. EVENT DELEGATION FOR DROP ZONES
      this.module.addEventListener("dragenter", (e) => {
        const zone =
          e.target.closest(".sorting-zone") ||
          e.target.closest(".sorting-bank");
        if (zone) e.preventDefault();
      });

      this.module.addEventListener("dragover", (e) => {
        const zone =
          e.target.closest(".sorting-zone") ||
          e.target.closest(".sorting-bank");
        if (zone) {
          e.preventDefault();
          zone.classList.add("drag-over");
        }
      });

      this.module.addEventListener("dragleave", (e) => {
        const zone =
          e.target.closest(".sorting-zone") ||
          e.target.closest(".sorting-bank");
        if (zone && !zone.contains(e.relatedTarget)) {
          zone.classList.remove("drag-over");
        }
      });

      this.module.addEventListener("drop", (e) => {
        const zone =
          e.target.closest(".sorting-zone") ||
          e.target.closest(".sorting-bank");
        if (!zone) return;

        e.preventDefault();
        this.removeDragOverClasses();

        if (!this.draggedItem) return;

        // Check if dropping back into the bank
        if (zone.classList.contains("sorting-bank")) {
          this.bank.appendChild(this.draggedItem);
          this.draggedItem.classList.remove("correct", "incorrect");
          this.saveState(); // Save state if returned to bank
          return;
        }

        // Check if dropping into a category zone
        if (zone.classList.contains("sorting-zone")) {
          this.handleDropLogic(zone);
        }
      });
    }

    handleDropLogic(targetZone) {
      const targetCategory = targetZone.getAttribute("data-category");
      const correctCategory = this.draggedItem.getAttribute(
        "data-correct-target",
      );
      const contentArea = targetZone.querySelector(".sorting-zone-content");

      // Verify Correctness
      if (targetCategory === correctCategory) {
        // Correct drop!
        contentArea.appendChild(this.draggedItem);
        this.draggedItem.classList.remove("incorrect");
        this.draggedItem.classList.add("correct");

        // Lock the item in place
        this.draggedItem.draggable = false;

        this.saveState(); // Save progress!
        this.checkWinCondition();
      } else {
        // Incorrect drop!
        this.draggedItem.classList.add("incorrect");
        setTimeout(() => {
          if (this.draggedItem) {
            this.draggedItem.classList.remove("incorrect");
          }
        }, 500);
      }
    }

    checkWinCondition() {
      const itemsInBank = this.bank.querySelectorAll(".sorting-item").length;
      if (itemsInBank === 0) {
        this.feedbackEl.textContent = "🎉 All sorted correctly!";
      }
    }

    removeDragOverClasses() {
      this.module
        .querySelectorAll(".drag-over")
        .forEach((el) => el.classList.remove("drag-over"));
    }

    resetGame() {
      // Clear the local storage for this specific game
      localStorage.removeItem(this.storageKey);
      // Rebuild the UI from scratch
      this.buildUI();
    }
  }

  // -----------------------------------------
  // 🔊 9. PRONUNCIATION MANAGER (TTS & API)
  // -----------------------------------------
  class PronunciationManager {
    constructor() {
      this.pronounceButtons = document.querySelectorAll(".pronounce-btn");
      if (this.pronounceButtons.length > 0) {
        this.init();
      }
    }

    init() {
      this.pronounceButtons.forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          e.preventDefault();
          const word = btn.getAttribute("data-word");
          if (!word) return;

          // Візуальний відгук (робимо кнопку трохи прозорою під час завантаження)
          btn.style.opacity = "0.5";

          try {
            // Запит до словника
            const response = await fetch(
              `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
            );
            const data = await response.json();

            let audioUrl = "";

            // Шукаємо аудіофайл (переважно британський)
            if (data && data[0] && data[0].phonetics) {
              for (const phonetic of data[0].phonetics) {
                if (phonetic.audio) {
                  audioUrl = phonetic.audio;
                  if (audioUrl.includes("-uk.mp3")) break;
                }
              }
            }

            if (audioUrl) {
              const audio = new Audio(audioUrl);
              audio.play();
            } else {
              this.fallbackSpeak(word);
            }
          } catch (error) {
            console.warn("API Error, using fallback TTS", error);
            this.fallbackSpeak(word);
          } finally {
            // Повертаємо кнопці нормальний вигляд
            setTimeout(() => (btn.style.opacity = "1"), 1500);
          }
        });
      });
    }

    fallbackSpeak(word) {
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = "en-GB"; // Британський акцент
        utterance.rate = 0.9; // Трохи сповільнюємо
        window.speechSynthesis.speak(utterance);
      }
    }
  }

  // -----------------------------------------
  // 🏁 8. INITIALIZATION (The Engine)
  // -----------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    const themeManager = new ThemeManager();
    const uiManager = new UIManager();
    new CodeManager();
    new GlobalEvents(themeManager, uiManager);
    new PronunciationManager();

    // Iніціалізуємо КОЖНУ форму на сторінці окремо
    document.querySelectorAll(".homework-form").forEach((form) => {
      new HomeworkManager(form);
    });

    // // Ініціалізуємо всі модулі карток на сторінці
    // document.querySelectorAll(".flashcard-module").forEach((module) => {
    //   new FlashcardManager(module);
    // });

    // 1. Ініціалізуємо всі модулі карток на сторінці
    document.querySelectorAll(".flashcard-module").forEach((module) => {
      // Зберігаємо об'єкт (інстанс) прямо в DOM-елементі, щоб мати до нього доступ!
      module.fcInstance = new FlashcardManager(module);
    });

    // 2. Ініціалізуємо ДИНАМІЧНІ картки (з чекбоксами)
    document.querySelectorAll(".dynamic-fc-container").forEach((container) => {
      const targetId = container.getAttribute("data-target-fc");
      const targetModule = document.getElementById(targetId);

      if (!targetModule || !targetModule.fcInstance) return;

      const dataScript = container.querySelector(".vocab-data");
      const wrapper = container.querySelector(".vocab-groups-wrapper");

      if (dataScript && wrapper) {
        try {
          const categories = JSON.parse(dataScript.textContent);
          let html = "";
          categories.forEach((cat) => {
            html += `<h5 class="vocab-group-name">${cat.title}</h5><div class="vocab-grid">`;
            cat.words.forEach((word) => {
              html += `
                <label class="test-label">
                  <input type="checkbox" class="test-checkbox dynamic-cb" data-front="${word.en}" data-back="${word.uk}" />
                  ${word.en}
                </label>
              `;
            });
            html += `</div>`;
          });
          wrapper.innerHTML = html;
        } catch (error) {
          console.error("Помилка генерації словника:", error);
        }
      }

      const checkboxes = container.querySelectorAll(".dynamic-cb");
      const storageKey = "lms_cb_state_" + targetId;

      // Відновлюємо галочки чекбоксів після перезавантаження сторінки
      const savedState = JSON.parse(localStorage.getItem(storageKey));
      if (savedState && savedState.length === checkboxes.length) {
        checkboxes.forEach((cb, index) => {
          cb.checked = savedState[index];
        });
      }

      const updateDeckFromCheckboxes = (isUserClick = false) => {
        const selectedWords = [];
        const stateToSave = [];

        checkboxes.forEach((cb) => {
          stateToSave.push(cb.checked);
          if (cb.checked) {
            selectedWords.push({
              front: cb.getAttribute("data-front"),
              back: cb.getAttribute("data-back"),
            });
          }
        });

        localStorage.setItem(storageKey, JSON.stringify(stateToSave));

        if (isUserClick) {
          // Користувач клікнув: колода оновлюється, прогрес СКИДАЄТЬСЯ
          targetModule.fcInstance.updateDeck(selectedWords);
        } else {
          // Завантаження сторінки: тихо підкладаємо колоду без скидання прогресу
          targetModule.fcInstance.deck = selectedWords;
          targetModule.fcInstance.updateUI();
        }
      };

      // Запускаємо один раз при завантаженні (тихо)
      updateDeckFromCheckboxes(false);

      // Вішаємо слухача на всі чекбокси
      checkboxes.forEach((cb) => {
        cb.addEventListener("change", () => updateDeckFromCheckboxes(true));
      });
    });

    // Глобальні обробники для модального вікна очищення
    const clearDialog = document.getElementById("clear-confirm-dialog");
    const dialogCancelBtn = document.getElementById("dialog-cancel-btn");
    const dialogConfirmBtn = document.getElementById("dialog-confirm-btn");

    if (clearDialog && dialogCancelBtn) {
      dialogCancelBtn.addEventListener("click", () => clearDialog.close());
    }

    if (clearDialog && dialogConfirmBtn) {
      dialogConfirmBtn.addEventListener("click", () => {
        if (activeFormToClear) {
          activeFormToClear.executeClear(); // Очищає лише ту форму, на якій натиснули кнопку!
          activeFormToClear = null;
        }
        clearDialog.close();
      });
    }

    document.querySelectorAll(".sorting-game-module").forEach((module) => {
      module.sortInstance = new SortingGameManager(module);
    });

    // Ініціалізуємо всі перекладачі на сторінці
    document.querySelectorAll(".translator-module").forEach((module) => {
      new TranslatorManager(module);
    });
  });
})(); // End of IIFE
