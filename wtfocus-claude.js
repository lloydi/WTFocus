"use strict";

class WTFocusInspector {
  constructor(options = {}) {
    // Configuration with sensible defaults
    this.config = {
      panelWidth: 400,
      focusOutlineWidth: 7,
      styles: {
        title: "background:#193c10;color:white;",
        overridden: "background:#fff;color:darkgreen;font-weight:bold;text-decoration:line-through",
        good: "font-weight:bold;color:#99f170;background:#333;display:inline-block;padding:3px;",
        bad: "color:pink;background:#333;padding:3px;",
        ok: "color:black;background:#fefbe3;font-weight:bold;",
        unimportant: "color:black!important;background:#fff!important;"
      },
      ...options
    };

    this.elements = {
      panel: null,
      curtain: null
    };

    this.state = {
      curtainsMode: false,
      showDetails: false,
      accNamesFound: [],
      currentFocusedEl: null
    };

    this.initialize();
  }

  initialize() {
    this.addFocusStyles();
    this.createPanel();
    this.setupEventListeners();
    this.analyzeFocusableElements();
  }

  addFocusStyles() {
    const styleEl = document.createElement('style');
    styleEl.setAttribute('type', 'text/css');
    styleEl.setAttribute('id', 'wtfocus-styles');
    styleEl.textContent = `
      .wtfocus-dupe-accname {
        outline: 4px dashed #CC3300!important;
        outline-offset: ${this.config.focusOutlineWidth}px!important;
      }
      .wtfocus-temp-focus:focus {
        outline: ${this.config.focusOutlineWidth}px solid black!important;
        outline-offset: ${this.config.focusOutlineWidth}px!important;
      }
    `;
    document.body.appendChild(styleEl);
  }

  createPanel() {
    this.elements.panel = document.createElement('div');
    this.elements.panel.id = 'wtfocus-panel';
    this.elements.panel.setAttribute('aria-live', 'polite');
    this.elements.panel.setAttribute('tabindex', '-1');
    this.elements.panel.setAttribute('hidden', 'hidden');

    this.elements.curtain = document.createElement('div');
    this.elements.curtain.id = 'wtfocus-curtain';
    this.elements.curtain.setAttribute('hidden', 'hidden');

    document.body.append(this.elements.panel, this.elements.curtain);
  }

  setupEventListeners() {
    document.addEventListener('keyup', (event) => {
      const keyHandlers = {
        'Escape': () => this.removePanel(),
        'm': () => this.toggleMode(),
        'd': () => this.toggleDetails(),
        's': () => this.downloadSummary()
      };

      const handler = keyHandlers[event.key.toLowerCase()];
      if (handler) handler();
    });
  }

  analyzeFocusableElements() {
    const focusables = document.querySelectorAll(
      'a[href], button, select, input:not([type="hidden"]), ' +
      'textarea, summary, area, [tabindex]:not([tabindex^="-1"]), ' +
      '[contenteditable]:not([contenteditable="false"])'
    );

    focusables.forEach(el => {
      el.classList.add('wtfocus-temp-focus');
      el.addEventListener('focus', () => this.handleElementFocus(el));
    });

    this.mimicInitialFocus(focusables);
  }

  handleElementFocus(focusable) {
    // Detailed focus handling logic (similar to original, but more modular)
    const accessibilityInfo = this.extractAccessibilityInfo(focusable);
    this.renderPanelContent(accessibilityInfo);
    this.positionPanel(focusable);
  }

  // Other methods like extractAccessibilityInfo, renderPanelContent, etc. would be implemented here

  toggleMode() {
    this.state.curtainsMode = !this.state.curtainsMode;
    // Toggle mode implementation
  }

  removePanel() {
    // Panel removal logic
  }

  // Additional utility methods...

  static run(options) {
    return new WTFocusInspector(options);
  }
}

// Usage
WTFocusInspector.run();