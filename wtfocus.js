"use strict";

function WTFocus() {
  const startFocusPoint = document.activeElement;
  let elCount = 1;
  let consoleOutput = "";
  let textOutput = "";
  let currentFocusedEl = document.activeElement;
  const focusables = document.querySelectorAll('a[href],button,select,input:not([type="hidden"]),textarea,summary,area,[tabindex]:not(#WTFocusPanel):not([tabindex^="-1"]),[contenteditable]:not([contenteditable="false"])');
  //styles
  const style_title_formatting = "background:#193c10;color:white;";
  const style_overridden_formatting = "background:#fff;color:darkgreen;font-weight:bold;text-decoration:line-through";
  const style_good_formatting = "font-weight:bold;color:#99f170;background:#333;display:inline-block;padding:3px;";
  const style_bad_formatting = "color:pink;background:#333;padding:3px;";
  const style_ok_formatting = "color:black;background:#fefbe3;font-weight:bold;";
  const style_unimportant_formatting = "color:#333;background:#fff;";
  //panel
  const WTFocusPanel = document.createElement("div");
  const WTFocusCurtain = document.createElement("div");
  const WTFpanelOffset = 20;
  const WTFpanelWidth = 400;
  const WTFfocusOutlineWidth = 7;
  const indicator = '<span aria-hidden="true">👉🏽</span><span class="visually-hidden">Accessible name provided by</span> ';
  const warning = '<span aria-hidden="true">🚨</span> <span class="visually-hidden">Warning</span>';
  let accNameLabel = "Accessible name: ";

  let strPageOutput = "";

  let isGood = false;
  let isBad = false;
  let isDupeAccName = false;
  let dupeAccNameIsNoAccName = false;
  let currentActiveEl;

  let curtainsMode = false;
  let showDetails = false;

  function findAncestor(el, sel) {
    while ((el = el.parentElement) && !(el.matches || el.matchesSelector).call(el, sel));
    return el;
  }
  function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }
  function resetGoodBadState() {
    isGood = false;
    isBad = false;
  }
  function addToConsoleOutput(text){
    consoleOutput+=text;
  }
  function log(text, el, style, isCurrent, showInCurtainsMode) {
    el = el.split("<").join("&lt;").split(">").join("&gt;");
    strPageOutput += "<li";
    if (showInCurtainsMode || isCurrent) {
      strPageOutput += ' class="';
      if (showInCurtainsMode) {
        strPageOutput += 'visible';
      }
      if (isCurrent) {
        strPageOutput += 'outline';
      }
      strPageOutput += '"';
    }
    strPageOutput += ' role="listitem"><span style="' + style + '">';
    if (isGood) {
      strPageOutput += indicator;
    }
    if (isBad) {
      strPageOutput += warning;
    }
    strPageOutput += text + "</span>&nbsp;" + el + "</li>\n";
    el = el.replace("&lt;", "<").replace("&gt;", ">");
  }
  function addFocusStyles() {
    const focusStyles = document.createElement("style");
    focusStyles.setAttribute("type", "text/css");
    focusStyles.setAttribute("id", "panelStyles");
    focusStyles.textContent = ".dupeAccName {outline:4px dashed #CC3300!important;outline-offset:" + WTFfocusOutlineWidth + "px!important;overflow:visible;} .WTFocusTempFocusStyle:focus {outline:" + WTFfocusOutlineWidth + "px solid black!important;outline-offset:" + WTFfocusOutlineWidth + "px!important;overflow:visible;/*background:yellow!important;color:black!important;*/} .WTFocusTempFocusStyle.dupeAccName:focus {outline-color:#CC3300!important;} .visually-hidden {clip-path: inset(100%);clip: rect(1px, 1px, 1px, 1px);height: 1px;overflow: hidden;position: absolute;white-space: nowrap;width: 1px;}#WTFocusCurtain {background:black;position: fixed;top: 0;bottom: 0;left: 0;right: 0;z-index:49999}";
    document.querySelector("body").appendChild(focusStyles);
  }
  function addPanelStyles(WTFpanelWidth) {
    const consoleStyle = document.createElement("style");
    consoleStyle.setAttribute("type", "text/css");
    consoleStyle.setAttribute("id", "focusStyles");
    consoleStyle.textContent =
      "#WTFocusPanel.error {background:darkred;} #WTFocusPanel.warning {background:#CC3300;} #WTFocusPanel.curtainsMode.error {background:black;} #WTFocusPanel.curtainsMode {z-index:50000;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);} #WTFocusPanel.curtainsMode.warning {background:black;} #WTFocusPanel[hidden] {display:none;} #WTFocusPanel * {text-align:left} #WTFocusPanel {border:2px solid #fff;z-index:1000;text-shadow:none;font-family:sans-serif;display:block;text-align:left;position: absolute;z-index:10000;background: black;padding: 20px 20px;width:" +
      WTFpanelWidth +
      "px;font-size:16px;} #WTFocusPanel button {font-weight:bold;background:none;color:#fff;padding:3px 10px;font-size:14px;border:1px solid #fff;display:inline-block;margin:10px 1em -10px 0;} #WTFocusPanel ul,#WTFocusPanel li {margin:0;padding:0;list-style:none} #WTFocusPanel li {margin:3px 0;background:#fff;color:#333;padding:2px} #WTFocusPanel li.outline {outline:4px solid rgb(58, 190, 58);outline-offset:-4px;padding:8px} #WTFocusPanel.error:before {background:darkred} #WTFocusPanel.warning:before {background:#CC3300} #WTFocusPanel:before {content:'';display:block;height:20px;width:20px;transform:rotate(45deg);position:absolute;background:#000;left:-12px;top:3px;border:2px solid #fff;border-right:none;border-top:none;} #WTFocusPanel.toBottom:before {top:auto;bottom:3px} #WTFocusPanel.toLeft:before {left:auto;right:-12px;border:2px solid #fff;border-left:none;border-bottom:none;} #WTFocusPanel.curtainsMode {outline:10px solid orange;} #WTFocusPanel.curtainsMode:before {display:none;} #WTFocusPanel.curtainsMode li {display:none;} #WTFocusPanel.curtainsMode li.visible {display:block;} #WTFocusPanel.curtainsMode li span {display:none!important;} #WTFocusPanel details summary {color:white} #WTFocusPanel.curtainsMode details {display:none}#WTFocusPanel a[download]{display:block;margin:0.5em 0;color:#fff;text-decoration:underline;border:none;padding:0;}";
    document.querySelector("head").appendChild(consoleStyle);
  }
  function promptForLoggingType() {
    if (document.querySelector("#WTFocusCurtain")) {
      removePanel();
    }
    strPageOutput = "";
    addPanelStyles(WTFpanelWidth);
    addCurtainToPage();
    addPanelToPage();
  }
  function addCurtainToPage() {
    WTFocusCurtain.setAttribute("id", "WTFocusCurtain");
    WTFocusCurtain.setAttribute("hidden", "hidden");
    document.querySelector("body").appendChild(WTFocusCurtain);
  }
  function addPanelToPage() {
    WTFocusPanel.setAttribute("id", "WTFocusPanel");
    if (curtainsMode) WTFocusPanel.setAttribute("class", "curtainsMode");
    WTFocusPanel.setAttribute("aria-live", "polite");
    WTFocusPanel.setAttribute("tabindex", "-1");
    WTFocusPanel.setAttribute("hidden", "hidden");
    WTFocusPanel.setAttribute("role", "region");
    WTFocusPanel.setAttribute("aria-label", "Accessibility properties panel");
    document.querySelector("body").appendChild(WTFocusPanel);
    keypressListeners();
  }
  function addButtons() {
    const consoleCloseButton = document.createElement("button");
    consoleCloseButton.textContent = "Close (Esc)";
    consoleCloseButton.setAttribute("type", "button");
    consoleCloseButton.setAttribute("class", "panel-btn");
    consoleCloseButton.addEventListener("click", () => {
      removePanel();
    });
    const toggleModeButton = document.createElement("button");
    toggleModeButton.textContent = "Change Mode (M)";
    toggleModeButton.setAttribute("type", "button");
    toggleModeButton.setAttribute("class", "panel-btn");
    toggleModeButton.addEventListener("click", (e) => {
      toggleMode();
    });
    const downloadLink = document.createElement("a");
    const downloadWarningPreamble = "IMPORTANT DISCLAIMER!\n\nThis text file is a *very approximate representation* \nof what this page may be like for screen reader users:\n\n• It lists all the focusable elements (at the point \n  of running the script) but may not include every \n  element. For example, any element that is temporarily \n  set to be non-focusable with `tabindex=\"-1\"`, such as \n  an inactive tab in a group of tab controls, will not \n  be shown here.\n• It lists the accessible name and the role \n  (e.g. link, button)\n• Where there is an accessible description \n  (provided by `aria-describedby` or a `title` \n  attribute), this is included too";
    downloadLink.textContent = "Download summary (S)";
    downloadLink.setAttribute("href","data:text/plain;charset=utf-8," + encodeURIComponent(consoleOutput));
    downloadLink.setAttribute("download", "simple-screen-reader-emulation");
    downloadLink.addEventListener("click", (e) => {
      alert(downloadWarningPreamble);
    });
    WTFocusPanel.appendChild(consoleCloseButton);
    WTFocusPanel.appendChild(toggleModeButton);
    WTFocusPanel.appendChild(downloadLink);
  }

  function downloadSummary() {
    document.querySelector("#WTFocusPanel a[download]").click();    
  }


  function hidePanel() {
    document.querySelector("#WTFocusPanel").setAttribute("hidden", "hidden");
  }
  function toggleMode() {
    if (curtainsMode) {
      document.querySelector("#WTFocusPanel").classList.remove("curtainsMode");
      document.querySelector("#WTFocusPanel").removeAttribute("style");
      document.querySelector("#WTFocusCurtain").setAttribute("hidden","hidden");
      curtainsMode=false;
      accNameLabel = "Accessible name: ";
    } else {
      document.querySelector("#WTFocusPanel").classList.add("curtainsMode");
      document.querySelector("#WTFocusCurtain").removeAttribute("hidden");
      curtainsMode=true;
      accNameLabel = "";
    }
    positionPanelOnPage(currentFocusedEl);
    currentFocusedEl.focus();
  }
  function removePanel() {
    document.querySelector("#WTFocusCurtain").remove();
    document.querySelector("#WTFocusPanel").remove();
    document.querySelector("#panelStyles").remove();
    document.querySelector("#focusStyles").remove();
  }
  function toggleMoreDetails(){
    document.querySelector("#WTFocusPanel summary").click();
    showDetails = !showDetails;
  }
  function keypressListeners() {
    window.addEventListener("keyup", (event) => {
      if (event.key === "Escape" && document.querySelector("#WTFocusPanel")) {
        removePanel();
      }
    });
    window.addEventListener("keyup", (event) => {
      if (event.key.toLowerCase() === "m" && document.querySelector("#WTFocusPanel")) {
        toggleMode();
      }
      if (event.key.toLowerCase() === "d" && document.querySelector("#WTFocusPanel")) {
        toggleMoreDetails();
      }
      if (event.key.toLowerCase() === "s" && document.querySelector("#WTFocusPanel")) {
        downloadSummary();
      }
    });
  }
  function positionPanelOnPage(focusable) {
    const rect = focusable.getBoundingClientRect();
    const scroll = document.documentElement.scrollTop;
    const panelRightCoord = rect.right + WTFpanelOffset + WTFpanelWidth;
    const panelHeight = WTFocusPanel.offsetHeight;
    const panelBottomCoord = scroll + rect.top + panelHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    if (curtainsMode) {
      document.querySelector("#WTFocusPanel").removeAttribute("style");
    }
    else {
      if (panelRightCoord > viewportWidth) {
        if (panelBottomCoord > viewportHeight) {
          WTFocusPanel.style.top = "auto";
          WTFocusPanel.style.bottom = viewportHeight - (scroll + rect.bottom) - 10 + "px";
          WTFocusPanel.classList.add("toBottom");
        } else {
          WTFocusPanel.style.top = scroll + rect.top + "px";
          WTFocusPanel.style.bottom = "auto";
          WTFocusPanel.classList.remove("toBottom");
        }
        WTFocusPanel.style.left = "auto";
        WTFocusPanel.style.right = viewportWidth - rect.left + WTFpanelOffset - WTFfocusOutlineWidth + "px";
        WTFocusPanel.classList.add("toLeft");
      } else {
        if (panelBottomCoord > viewportHeight) {
          WTFocusPanel.style.top = "auto";
          WTFocusPanel.style.bottom = viewportHeight - (scroll + rect.bottom) - 10 + "px";
          WTFocusPanel.classList.add("toBottom");
        } else {
          WTFocusPanel.style.top = scroll + rect.top + "px";
          WTFocusPanel.style.bottom = "auto";
          WTFocusPanel.classList.remove("toBottom");
        }
        WTFocusPanel.style.left = rect.right + WTFpanelOffset - WTFfocusOutlineWidth + "px";
        WTFocusPanel.style.right = "auto";
        WTFocusPanel.classList.remove("toLeft");
      }

    }
  }

  addFocusStyles();
  promptForLoggingType();
  addButtons();

  let accNamesFound = [];
  Array.from(focusables).forEach(function (focusable) {
    focusable.classList.add("WTFocusTempFocusStyle");

    const styleEls = focusable.querySelectorAll("style");
    Array.from(styleEls).forEach(function (styleEl) {
      styleEl.remove();
    });

    focusable.addEventListener("focus", () => {
      let elementRole = focusable.getAttribute("role");
      let focussedTagName = focusable.tagName.toLowerCase();
      if (elementRole) {
      } else {
        if ((focussedTagName=="article")||(focussedTagName=="button")||(focussedTagName=="dialog")||(focussedTagName=="figure")||(focussedTagName=="img")||(focussedTagName=="main")||(focussedTagName=="math")) {
          elementRole = focussedTagName;
        }
        if (focussedTagName=="summary") {
          elementRole = "button";
        }
        if (focussedTagName=="aside") {
          elementRole = "complementary";
        }
        if (focussedTagName=="dd") {
          elementRole = "definition";
        }
        if (focussedTagName=="html") {
          elementRole = "document";
        }
        if ((focussedTagName=="details")||(focussedTagName=="fieldset")||(focussedTagName=="optgroup")) {
          elementRole = "group";
        }
        if ((focussedTagName=="menu")||(focussedTagName=="ol")||(focussedTagName=="ul")) {
          elementRole = "list";
        }
        if (focussedTagName=="datalist") {
          elementRole = "listbox";
        }
        if (focussedTagName=="li") {
          elementRole = "listitem";
        }
        if (focussedTagName=="nav") {
          elementRole = "navigation";
        }
        if (focussedTagName=="progress") {
          elementRole = "progressbar";
        }
        if (focussedTagName=="hr") {
          elementRole = "separator";
        }
        if (focussedTagName=="output") {
          elementRole = "status";
        }
        if ((focussedTagName=="dfn")||(focussedTagName=="dt")) {
          elementRole = "term";
        }
        if (focussedTagName=="a") {
          elementRole = "link";
        }
        if (focussedTagName=="select") {
          elementRole = "listbox";
        }
        if (focussedTagName=="textarea") {
          elementRole = "textbox";
        }
        if (focussedTagName=="input") {
          let type = focusable.getAttribute("type").toLowerCase();
          if (type==="email") {
            elementRole = "textbox";
          }
          if (type==="text") {
            elementRole = "textbox";
          }
          if (type==="range") {
            elementRole = "slider";
          }
          if (type==="number") {
            elementRole = "spinbutton";
          }
          if ((type==="checkbox")||(type==="radio")) {
            elementRole = type;
          }
          if ((type==="button")||(type==="image")||(type==="reset")||(type==="submit")) {
            elementRole = "button";
          }
        }
      }
      currentFocusedEl = focusable;
      removeDupeIndicators();
      let containsImages = false;
      isGood = false;
      isBad = false;

      const imgs = focusable.querySelectorAll("img, [role='image'][aria-label], [role='img'][aria-label]");
      containsImages = imgs.length > 0;

      if (containsImages) {
        Array.from(imgs).forEach(function (image) {
          const newSpan = document.createElement("SPAN");
          newSpan.setAttribute("class", "visually-hidden");
          newSpan.setAttribute("style", "clip-path: inset(100%);clip: rect(1px, 1px, 1px, 1px);height: 1px;overflow: hidden;position: absolute;white-space: nowrap;width: 1px;");
          newSpan.setAttribute("data-temp-node", "true");
          if (image.getAttribute("alt")) {
            newSpan.textContent = " " + image.getAttribute("alt") + " ";
          }
          if (image.getAttribute("role") && image.getAttribute("aria-label")) {
            newSpan.textContent = " " + image.getAttribute("aria-label") + " ";
          }
          insertAfter(newSpan, image);
        });
      }
      setTimeout(function () {
        focusable.classList.add("WTFocusTempFocusStyle");
      }, 100);

      strPageOutput = "";

      const tagName = focusable.tagName.toLowerCase();
      let tagRole = focusable.getAttribute("role");
      if (tagRole) {
        tagRole = focusable.getAttribute("role").toLowerCase();
      }
      let tagDetails = "<" + tagName + ">";
      let superfluousRole = false;
      let hasDescribedBy = false;
      let ariaDescribedByText = "";
      let identicalAriaLabel = false;
      let betterAsNativeHTMLelement = false;
      if (tagRole) {
        tagDetails = "<" + tagName + ' role="' + tagRole + '">';
        if ((tagRole === "link" && tagName === "a") || (tagRole === "button" && tagName === "button") || (tagRole === "image" && tagName === "img") || (tagRole === "img" && tagName === "img") || (tagRole === "navigation" && tagName === "nav") || (tagRole === "heading" && (tagName === "h1" || tagName === "h2" || tagName === "h3" || tagName === "h4" || tagName === "h5" || tagName === "h6"))) {
          superfluousRole = true;
        }
        if ((tagRole === "link" && tagName !== "a") || (tagRole === "button" && tagName !== "button") || ((tagRole === "image" || tagRole === "image") && tagName !== "img") || (tagRole === "navigation" && tagName !== "nav") || (tagRole === "heading" && !(tagName === "h1" || tagName === "h2" || tagName === "h3" || tagName === "h4" || tagName === "h5" || tagName === "h6"))) {
          betterAsNativeHTMLelement = true;
        }
      }
      if (focusable.getAttribute("aria-describedby")) {
        hasDescribedBy = true;
      }

      let textContent = focusable.textContent;
      let ariaLabel = focusable.ariaLabel;
      let ariaLabelledBy = focusable.getAttribute("aria-labelledby");
      let placeholder = focusable.getAttribute("placeholder");
      let ariaLabelledBySource;
      let ariaDescribedBySource;
      let accNameFromAriaLabelledBySrc = "";
      let descriptionFromAriaDescribedBySrc = "";
      let value = focusable.getAttribute("value");
      let title = focusable.getAttribute("title");
      let accName = "";
      let visibleLabelText = "";
      let wrappedLabel = false;
      let linkedLabel = false;
      let accNameSource = "";
      let ariaHiddenElementsPresent = false;

      positionPanelOnPage(focusable);

      textContent = textContent.trim();

      // Real labels
      const parentLabel = findAncestor(focusable, "label");
      if (parentLabel) {
        wrappedLabel = true;
        visibleLabelText = parentLabel.textContent.trim();
        accName = visibleLabelText;
      }

      if (focusable.getAttribute("id")) {
        const linkedLabelEl = document.querySelector("[for='" + focusable.getAttribute("id") + "']");
        if (linkedLabelEl) {
          linkedLabel = true;
          visibleLabelText = linkedLabelEl.textContent;
        }
      }

      if (!(wrappedLabel || linkedLabel)) {
        visibleLabelText = "N/A";
      }
      if (!textContent) {
        textContent = "N/A";
      }
      if (!value) {
        value = "N/A";
      }
      if (!title) {
        title = "N/A";
      }
      if (!placeholder) {
        placeholder = "N/A";
      }
      if (!ariaLabel) {
        ariaLabel = "N/A";
      }
      if (!ariaLabelledBy) {
        ariaLabelledBy = "N/A";
      } else {
        ariaLabelledBySource = ariaLabelledBy;
        const ariaLabelledBySources = ariaLabelledBySource.split(" ");
        if (ariaLabelledBySources.length > 1) {
          Array.from(ariaLabelledBySources).forEach(function (sourceNode) {
            if (document.querySelector("#" + sourceNode)) {
              accNameFromAriaLabelledBySrc += document.querySelector("#" + sourceNode).textContent + " ";
            } else {
              accNameFromAriaLabelledBySrc += "❓❓❓ ";
            }
          });
          accNameFromAriaLabelledBySrc = accNameFromAriaLabelledBySrc.trim();
        } else {
          accNameFromAriaLabelledBySrc = document.querySelector("#" + ariaLabelledBySource).textContent;
        }
      }


      const hiddenElements = focusable.querySelectorAll("[aria-hidden='true'],[role='presentation']");
      let textContentWithAriaHiddenRemoved = textContent;
      if (hiddenElements.length > 0) {
        ariaHiddenElementsPresent = true;
        Array.from(hiddenElements).forEach(function (hiddenElement) {
          const tempText = hiddenElement.textContent;
          if (tempText !== "") {
            textContentWithAriaHiddenRemoved = textContentWithAriaHiddenRemoved.split(tempText).join(" ");
          }
        });
        textContentWithAriaHiddenRemoved = textContentWithAriaHiddenRemoved.trim();
      }

      if (tagName === "input") {
        const inputType = focusable.getAttribute("type");
        if (inputType === "submit") {
          if (value === "N/A") {
            accName = "Submit";
            accNameSource = "Not provided (using default)";
          }
        }
        if (inputType === "image") {
          if (value === "N/A") {
            accName = "Submit";
            accNameSource = "Not provided (using default)";
          }
        }
        if (inputType === "cancel") {
          if (value === "N/A") {
            accName = "Cancel";
            accNameSource = "Not provided (using default)";
          }
        }
      }

      if (title !== "N/A") {
        accName = title;
        accNameSource = "title attribute";
      }
      if (value !== "N/A") {
        accName = value;
        accNameSource = "value attribute";
      }
      if (placeholder !== "N/A") {
        accName = placeholder;
        accNameSource = "placeholder attribute";
      }
      if (textContent !== "N/A") {
        accName = textContentWithAriaHiddenRemoved;
        accNameSource = "Inner text content";
      }
      if (visibleLabelText !== "N/A") {
        accName = visibleLabelText;
        accNameSource = "<label> text";
      }
      if (ariaLabel !== "N/A") {
        accName = ariaLabel;
        accNameSource = "aria-label";
      }
      if (ariaLabelledBy !== "N/A") {
        accName = accNameFromAriaLabelledBySrc;
        accNameSource = "aria-labelledby";
      }

      isDupeAccName = focusable.getAttribute("data-dupe") === "true";
      dupeAccNameIsNoAccName = isDupeAccName && accName === "";

      if (accName === "" || isDupeAccName) {
        if (accName === "") {
          isBad = true;
          WTFocusPanel.classList.add("error");
          log(accNameLabel + "No accessible name!", "", style_bad_formatting);
          addToConsoleOutput("No accessible name!");
          log("Accessible Name Source: N/A", "", style_bad_formatting);
        }
        if (isDupeAccName && accName !== "") {
          WTFocusPanel.classList.add("warning");
          //reveal other dupes
          const allDupeAccNames = document.querySelectorAll("[data-accname='" + accName + "']");
          const dupeCount = allDupeAccNames.length;
          log(accNameLabel, accName, style_bad_formatting,false,true);
          addToConsoleOutput(elCount + " " + accName);
          elCount++;
          if (!dupeAccNameIsNoAccName) {
            Array.from(allDupeAccNames).forEach(function (anotherDupe) {
              anotherDupe.classList.add("dupeAccName");
            });
            log("Duplicate warning!", dupeCount + " elements on page have the same accessible name", style_bad_formatting);
          }
          Array.from(allDupeAccNames).forEach(function (anotherDupe) {
          });
          log("Accessible Name Source: ", accNameSource, style_bad_formatting);
        }
      } else {
        WTFocusPanel.classList.remove("error");
        WTFocusPanel.classList.remove("warning");
        log(accNameLabel, accName, style_good_formatting,false,true);
        addToConsoleOutput(elCount + " " + accName);
        elCount++;
        log("Accessible Name Source: ", accNameSource, style_good_formatting);
      }

      isBad = false;
      
      log("Role: ", elementRole, style_good_formatting,false,true);
      addToConsoleOutput(", " + elementRole);
      if (hasDescribedBy) {
        ariaDescribedBySource = focusable.getAttribute("aria-describedby");
        const ariaDescribedBySources = ariaDescribedBySource.split(" ");
        if (ariaDescribedBySources.length > 1) {
          Array.from(ariaDescribedBySources).forEach(function (sourceNode) {
            if (document.querySelector("#" + sourceNode)) {
              descriptionFromAriaDescribedBySrc += document.querySelector("#" + sourceNode).textContent + " ";
            } else {
              descriptionFromAriaDescribedBySrc += "❓❓❓ ";
            }
          });
          descriptionFromAriaDescribedBySrc = descriptionFromAriaDescribedBySrc.trim();
        } else {
          descriptionFromAriaDescribedBySrc = document.querySelector("#" + ariaDescribedBySource).textContent;
        }
        log("Accessible Description: ", descriptionFromAriaDescribedBySrc, style_good_formatting);
        addToConsoleOutput(", " + descriptionFromAriaDescribedBySrc + "\n");
      } else {
        log("Accessible Description: ", "N/A", style_good_formatting);
        addToConsoleOutput("\n");
      }

      log("HTML Element: ", tagDetails, style_good_formatting);
      strPageOutput += "</ul>\n";
      strPageOutput += "<details";
      if (showDetails) {
        strPageOutput += " open";
      }
      strPageOutput += ">\n";
      strPageOutput += "<summary>More details (D)</summary>\n";
      strPageOutput += "<ul role=\"list\">\n";

      if (superfluousRole) {
        isBad = true;
        log("Superfluous `role` attribute", "", style_bad_formatting);
      }
      if (betterAsNativeHTMLelement) {
        isBad = true;
        log("Better to use a native HTML element", "", style_bad_formatting);
      }

      textContent = textContent.trim();
      visibleLabelText = visibleLabelText.trim();
      title = title.trim();
      ariaLabel = ariaLabel.trim();
      ariaLabelledBy = ariaLabelledBy.trim();

      resetGoodBadState();
      if (accNameSource === "placeholder attribute") {
        isGood = true;
        log("@placeholder: ", placeholder, style_ok_formatting, true);
      } else {
        if (placeholder === "N/A") {
          log("@placeholder: ", placeholder, style_unimportant_formatting);
        } else {
          log("@placeholder: ", placeholder, style_overridden_formatting);
        }
      }
      resetGoodBadState();
      if (accNameSource === "title attribute") {
        isGood = true;
        log("@title: ", title, style_ok_formatting, true);
      } else {
        if (title === "N/A") {
          log("@title: ", title, style_unimportant_formatting);
        } else {
          log("@title: ", title, style_overridden_formatting);
        }
      }
      resetGoodBadState();
      if (accNameSource === "value attribute") {
        isGood = true;
        log("@value: ", value, style_ok_formatting, true);
      } else {
        if (value === "N/A") {
          log("@value: ", value, style_unimportant_formatting);
        } else {
          log("@value: ", value, style_overridden_formatting);
        }
      }
      resetGoodBadState();
      if (accNameSource === "Inner text content") {
        isGood = true;
        if (containsImages) {
          log("Inner text content (includes image alt): ", textContent, style_ok_formatting, true);
        } else {
          log("Inner text content: ", textContent, style_ok_formatting, true);
        }
        if (ariaHiddenElementsPresent) {
          log("! elements hidden to AT removed", "", style_ok_formatting);
        }
      } else {
        if (textContent === "N/A") {
          log("Text Content: ", textContent, style_unimportant_formatting);
        } else {
          log("Text Content: ", textContent, style_overridden_formatting);
        }
      }
      resetGoodBadState();
      if (accNameSource === "<label> text") {
        isGood = true;
        log("Visible `label` text: ", visibleLabelText, style_ok_formatting, true);
      } else {
        if (visibleLabelText === "N/A") {
          log("Visible `label` text: ", visibleLabelText, style_unimportant_formatting);
        } else {
          log("Visible `label` text: ", visibleLabelText, style_overridden_formatting);
        }
      }
      resetGoodBadState();
      if (accNameSource === "aria-label") {
        if (ariaLabel === textContent) {
          isBad = true;
          log("`aria-label` content is same as inner text content", "", style_bad_formatting);
        } else {
          isGood = true;
          log("@aria-label value: ", ariaLabel, style_ok_formatting, true);
        }
      } else {
        if (ariaLabel === "N/A") {
          log("@aria-label value: ", ariaLabel, style_unimportant_formatting);
        } else {
          log("@aria-label value: ", ariaLabel, style_overridden_formatting);
        }
      }
      resetGoodBadState();
      if (accNameSource === "aria-labelledby") {
        if (accNameFromAriaLabelledBySrc === textContent) {
          isBad = true;
          log("`aria-labelledby` source content is same as inner text content", "", style_bad_formatting);
        } else {
          isGood = true;
          log("@aria-labelledby value: ", ariaLabelledBy, style_ok_formatting, true);
          log("@aria-labelledby sources: ", accNameFromAriaLabelledBySrc, style_ok_formatting);
        }
      } else {
        log("@aria-labelledby value: ", ariaLabelledBy, style_unimportant_formatting);
        log("@aria-labelledby sources: ", "N/A", style_unimportant_formatting);
      }

      document.querySelector("#WTFocusPanel").innerHTML = '<ul role="list">' + strPageOutput + "</ul></details>";
      document.querySelector("#WTFocusPanel").removeAttribute("hidden");
      addButtons();
      const allTempNodes = document.querySelectorAll("[data-temp-node]");
      Array.from(allTempNodes).forEach(function (tempNode) {
        tempNode.remove();
      });

      //add accNAme as attribute for easier lookup/comparison
      focusable.setAttribute("data-accname", accName);

      if (!checkedForDupes) {
        addAccNameIfNotAlreadyExists(accName, focusable);
      }
    });
  });

  let checkedForDupes = false;
  function removeDupeIndicators() {
    Array.from(focusables).forEach(function (focusable) {
      focusable.classList.remove("dupeAccName");
    });
  }

  function mimicFocus() {
    currentActiveEl = document.activeElement;
    Array.from(focusables).forEach(function (focusable) {
      if (document.activeElement === focusable) {
        focusable.blur();
      }
      focusable.focus();
      console.log("-------------------");
    });
    checkedForDupes = true;
    if (currentActiveEl.tagName === "BODY") {
      //focus on body
      const bodyEl = document.querySelector("body");
      bodyEl.setAttribute("tabindex", "-1");
      bodyEl.focus();
      hidePanel();
    } else {
      currentActiveEl.focus();
    }
  }
  mimicFocus();

  function addAccNameIfNotAlreadyExists(thisAccName, el) {
    let dupeFound = false;
    Array.from(accNamesFound).forEach(function (accName) {
      if (accName === thisAccName) {
        dupeFound = true;
      }
    });
    if (dupeFound) {
      el.setAttribute("data-dupe", "true");
      const previousElWithSameAccName = document.querySelector("[data-accname='" + thisAccName + "']");
      previousElWithSameAccName.setAttribute("data-dupe", "true");
    } else {
      accNamesFound.push(thisAccName);
    }
  }
  console.log(consoleOutput);
  startFocusPoint.focus();
}
WTFocus();


// Select all iframes except those with the style display: none (only applies to inline CSS\)
// Create a script with the WTFocus code and append the script to every iframe.
// Enables the WTFocus selector to work within iframes
document.querySelectorAll('iframe:not([style*="display:none"]):not([style*="display: none"])').forEach(iframe => {
  var s = document.createElement('script');
  var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
  s.text = "\"use strict\";\r\n\r\nfunction WTFocus() {\r\n  const startFocusPoint = document.activeElement;\r\n  let elCount = 1;\r\n  let consoleOutput = \"\";\r\n  let textOutput = \"\";\r\n  let currentFocusedEl = document.activeElement;\r\n  const focusables = document.querySelectorAll(\'a[href],button,select,input:not([type=\"hidden\"]),textarea,summary,area,[tabindex]:not(#WTFocusPanel):not([tabindex^=\"-1\"]),[contenteditable]:not([contenteditable=\"false\"])\');\r\n  \/\/styles\r\n  const style_title_formatting = \"background:#193c10;color:white;\";\r\n  const style_overridden_formatting = \"background:#fff;color:darkgreen;font-weight:bold;text-decoration:line-through\";\r\n  const style_good_formatting = \"font-weight:bold;color:#99f170;background:#333;display:inline-block;padding:3px;\";\r\n  const style_bad_formatting = \"color:pink;background:#333;padding:3px;\";\r\n  const style_ok_formatting = \"color:black;background:#fefbe3;font-weight:bold;\";\r\n  const style_unimportant_formatting = \"color:#333;background:#fff;\";\r\n  \/\/panel\r\n  const WTFocusPanel = document.createElement(\"div\");\r\n  const WTFocusCurtain = document.createElement(\"div\");\r\n  const WTFpanelOffset = 20;\r\n  const WTFpanelWidth = 400;\r\n  const WTFfocusOutlineWidth = 7;\r\n  const indicator = \'<span aria-hidden=\"true\">\uD83D\uDC49\uD83C\uDFFD<\/span><span class=\"visually-hidden\">Accessible name provided by<\/span> \';\r\n  const warning = \'<span aria-hidden=\"true\">\uD83D\uDEA8<\/span> <span class=\"visually-hidden\">Warning<\/span>\';\r\n  let accNameLabel = \"Accessible name: \";\r\n\r\n  let strPageOutput = \"\";\r\n\r\n  let isGood = false;\r\n  let isBad = false;\r\n  let isDupeAccName = false;\r\n  let dupeAccNameIsNoAccName = false;\r\n  let currentActiveEl;\r\n\r\n  let curtainsMode = false;\r\n  let showDetails = false;\r\n\r\n  function findAncestor(el, sel) {\r\n    while ((el = el.parentElement) && !(el.matches || el.matchesSelector).call(el, sel));\r\n    return el;\r\n  }\r\n  function insertAfter(newNode, referenceNode) {\r\n    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);\r\n  }\r\n  function resetGoodBadState() {\r\n    isGood = false;\r\n    isBad = false;\r\n  }\r\n  function addToConsoleOutput(text){\r\n    consoleOutput+=text;\r\n  }\r\n  function log(text, el, style, isCurrent, showInCurtainsMode) {\r\n    el = el.split(\"<\").join(\"&lt;\").split(\">\").join(\"&gt;\");\r\n    strPageOutput += \"<li\";\r\n    if (showInCurtainsMode || isCurrent) {\r\n      strPageOutput += \' class=\"\';\r\n      if (showInCurtainsMode) {\r\n        strPageOutput += \'visible\';\r\n      }\r\n      if (isCurrent) {\r\n        strPageOutput += \'outline\';\r\n      }\r\n      strPageOutput += \'\"\';\r\n    }\r\n    strPageOutput += \' role=\"listitem\"><span style=\"\' + style + \'\">\';\r\n    if (isGood) {\r\n      strPageOutput += indicator;\r\n    }\r\n    if (isBad) {\r\n      strPageOutput += warning;\r\n    }\r\n    strPageOutput += text + \"<\/span>&nbsp;\" + el + \"<\/li>\\n\";\r\n    el = el.replace(\"&lt;\", \"<\").replace(\"&gt;\", \">\");\r\n  }\r\n  function addFocusStyles() {\r\n    const focusStyles = document.createElement(\"style\");\r\n    focusStyles.setAttribute(\"type\", \"text\/css\");\r\n    focusStyles.setAttribute(\"id\", \"panelStyles\");\r\n    focusStyles.textContent = \".dupeAccName {outline:4px dashed #CC3300!important;outline-offset:\" + WTFfocusOutlineWidth + \"px!important;overflow:visible;} .WTFocusTempFocusStyle:focus {outline:\" + WTFfocusOutlineWidth + \"px solid black!important;outline-offset:\" + WTFfocusOutlineWidth + \"px!important;overflow:visible;\/*background:yellow!important;color:black!important;*\/} .WTFocusTempFocusStyle.dupeAccName:focus {outline-color:#CC3300!important;} .visually-hidden {clip-path: inset(100%);clip: rect(1px, 1px, 1px, 1px);height: 1px;overflow: hidden;position: absolute;white-space: nowrap;width: 1px;}#WTFocusCurtain {background:black;position: fixed;top: 0;bottom: 0;left: 0;right: 0;z-index:49999}\";\r\n    document.querySelector(\"body\").appendChild(focusStyles);\r\n  }\r\n  function addPanelStyles(WTFpanelWidth) {\r\n    const consoleStyle = document.createElement(\"style\");\r\n    consoleStyle.setAttribute(\"type\", \"text\/css\");\r\n    consoleStyle.setAttribute(\"id\", \"focusStyles\");\r\n    consoleStyle.textContent =\r\n      \"#WTFocusPanel.error {background:darkred;} #WTFocusPanel.warning {background:#CC3300;} #WTFocusPanel.curtainsMode.error {background:black;} #WTFocusPanel.curtainsMode {z-index:50000;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);} #WTFocusPanel.curtainsMode.warning {background:black;} #WTFocusPanel[hidden] {display:none;} #WTFocusPanel * {text-align:left} #WTFocusPanel {border:2px solid #fff;z-index:1000;text-shadow:none;font-family:sans-serif;display:block;text-align:left;position: absolute;z-index:10000;background: black;padding: 20px 20px;width:\" +\r\n      WTFpanelWidth +\r\n      \"px;font-size:16px;} #WTFocusPanel button {font-weight:bold;background:none;color:#fff;padding:3px 10px;font-size:14px;border:1px solid #fff;display:inline-block;margin:10px 1em -10px 0;} #WTFocusPanel ul,#WTFocusPanel li {margin:0;padding:0;list-style:none} #WTFocusPanel li {margin:3px 0;background:#fff;color:#333;padding:2px} #WTFocusPanel li.outline {outline:4px solid rgb(58, 190, 58);outline-offset:-4px;padding:8px} #WTFocusPanel.error:before {background:darkred} #WTFocusPanel.warning:before {background:#CC3300} #WTFocusPanel:before {content:\'\';display:block;height:20px;width:20px;transform:rotate(45deg);position:absolute;background:#000;left:-12px;top:3px;border:2px solid #fff;border-right:none;border-top:none;} #WTFocusPanel.toBottom:before {top:auto;bottom:3px} #WTFocusPanel.toLeft:before {left:auto;right:-12px;border:2px solid #fff;border-left:none;border-bottom:none;} #WTFocusPanel.curtainsMode {outline:10px solid orange;} #WTFocusPanel.curtainsMode:before {display:none;} #WTFocusPanel.curtainsMode li {display:none;} #WTFocusPanel.curtainsMode li.visible {display:block;} #WTFocusPanel.curtainsMode li span {display:none!important;} #WTFocusPanel details summary {color:white} #WTFocusPanel.curtainsMode details {display:none}#WTFocusPanel a[download]{display:block;margin:0.5em 0;color:#fff;text-decoration:underline;border:none;padding:0;}\";\r\n    document.querySelector(\"head\").appendChild(consoleStyle);\r\n  }\r\n  function promptForLoggingType() {\r\n    if (document.querySelector(\"#WTFocusCurtain\")) {\r\n      removePanel();\r\n    }\r\n    strPageOutput = \"\";\r\n    addPanelStyles(WTFpanelWidth);\r\n    addCurtainToPage();\r\n    addPanelToPage();\r\n  }\r\n  function addCurtainToPage() {\r\n    WTFocusCurtain.setAttribute(\"id\", \"WTFocusCurtain\");\r\n    WTFocusCurtain.setAttribute(\"hidden\", \"hidden\");\r\n    document.querySelector(\"body\").appendChild(WTFocusCurtain);\r\n  }\r\n  function addPanelToPage() {\r\n    WTFocusPanel.setAttribute(\"id\", \"WTFocusPanel\");\r\n    if (curtainsMode) WTFocusPanel.setAttribute(\"class\", \"curtainsMode\");\r\n    WTFocusPanel.setAttribute(\"aria-live\", \"polite\");\r\n    WTFocusPanel.setAttribute(\"tabindex\", \"-1\");\r\n    WTFocusPanel.setAttribute(\"hidden\", \"hidden\");\r\n    WTFocusPanel.setAttribute(\"role\", \"region\");\r\n    WTFocusPanel.setAttribute(\"aria-label\", \"Accessibility properties panel\");\r\n    document.querySelector(\"body\").appendChild(WTFocusPanel);\r\n    keypressListeners();\r\n  }\r\n  function addButtons() {\r\n    const consoleCloseButton = document.createElement(\"button\");\r\n    consoleCloseButton.textContent = \"Close (Esc)\";\r\n    consoleCloseButton.setAttribute(\"type\", \"button\");\r\n    consoleCloseButton.setAttribute(\"class\", \"panel-btn\");\r\n    consoleCloseButton.addEventListener(\"click\", () => {\r\n      removePanel();\r\n    });\r\n    const toggleModeButton = document.createElement(\"button\");\r\n    toggleModeButton.textContent = \"Change Mode (M)\";\r\n    toggleModeButton.setAttribute(\"type\", \"button\");\r\n    toggleModeButton.setAttribute(\"class\", \"panel-btn\");\r\n    toggleModeButton.addEventListener(\"click\", (e) => {\r\n      toggleMode();\r\n    });\r\n    const downloadLink = document.createElement(\"a\");\r\n    const downloadWarningPreamble = \"IMPORTANT DISCLAIMER!\\n\\nThis text file is a *very approximate representation* \\nof what this page may be like for screen reader users:\\n\\n\u2022 It lists all the focusable elements (at the point \\n  of running the script) but may not include every \\n  element. For example, any element that is temporarily \\n  set to be non-focusable with `tabindex=\\\"-1\\\"`, such as \\n  an inactive tab in a group of tab controls, will not \\n  be shown here.\\n\u2022 It lists the accessible name and the role \\n  (e.g. link, button)\\n\u2022 Where there is an accessible description \\n  (provided by `aria-describedby` or a `title` \\n  attribute), this is included too\";\r\n    downloadLink.textContent = \"Download summary (S)\";\r\n    downloadLink.setAttribute(\"href\",\"data:text\/plain;charset=utf-8,\" + encodeURIComponent(consoleOutput));\r\n    downloadLink.setAttribute(\"download\", \"simple-screen-reader-emulation\");\r\n    downloadLink.addEventListener(\"click\", (e) => {\r\n      alert(downloadWarningPreamble);\r\n    });\r\n    WTFocusPanel.appendChild(consoleCloseButton);\r\n    WTFocusPanel.appendChild(toggleModeButton);\r\n    WTFocusPanel.appendChild(downloadLink);\r\n  }\r\n\r\n  function downloadSummary() {\r\n    document.querySelector(\"#WTFocusPanel a[download]\").click();    \r\n  }\r\n\r\n\r\n  function hidePanel() {\r\n    document.querySelector(\"#WTFocusPanel\").setAttribute(\"hidden\", \"hidden\");\r\n  }\r\n  function toggleMode() {\r\n    if (curtainsMode) {\r\n      document.querySelector(\"#WTFocusPanel\").classList.remove(\"curtainsMode\");\r\n      document.querySelector(\"#WTFocusPanel\").removeAttribute(\"style\");\r\n      document.querySelector(\"#WTFocusCurtain\").setAttribute(\"hidden\",\"hidden\");\r\n      curtainsMode=false;\r\n      accNameLabel = \"Accessible name: \";\r\n    } else {\r\n      document.querySelector(\"#WTFocusPanel\").classList.add(\"curtainsMode\");\r\n      document.querySelector(\"#WTFocusCurtain\").removeAttribute(\"hidden\");\r\n      curtainsMode=true;\r\n      accNameLabel = \"\";\r\n    }\r\n    positionPanelOnPage(currentFocusedEl);\r\n    currentFocusedEl.focus();\r\n  }\r\n  function removePanel() {\r\n    document.querySelector(\"#WTFocusCurtain\").remove();\r\n    document.querySelector(\"#WTFocusPanel\").remove();\r\n    document.querySelector(\"#panelStyles\").remove();\r\n    document.querySelector(\"#focusStyles\").remove();\r\n  }\r\n  function toggleMoreDetails(){\r\n    document.querySelector(\"#WTFocusPanel summary\").click();\r\n    showDetails = !showDetails;\r\n  }\r\n  function keypressListeners() {\r\n    window.addEventListener(\"keyup\", (event) => {\r\n      if (event.key === \"Escape\" && document.querySelector(\"#WTFocusPanel\")) {\r\n        removePanel();\r\n      }\r\n    });\r\n    window.addEventListener(\"keyup\", (event) => {\r\n      if (event.key.toLowerCase() === \"m\" && document.querySelector(\"#WTFocusPanel\")) {\r\n        toggleMode();\r\n      }\r\n      if (event.key.toLowerCase() === \"d\" && document.querySelector(\"#WTFocusPanel\")) {\r\n        toggleMoreDetails();\r\n      }\r\n      if (event.key.toLowerCase() === \"s\" && document.querySelector(\"#WTFocusPanel\")) {\r\n        downloadSummary();\r\n      }\r\n    });\r\n  }\r\n  function positionPanelOnPage(focusable) {\r\n    const rect = focusable.getBoundingClientRect();\r\n    const scroll = document.documentElement.scrollTop;\r\n    const panelRightCoord = rect.right + WTFpanelOffset + WTFpanelWidth;\r\n    const panelHeight = WTFocusPanel.offsetHeight;\r\n    const panelBottomCoord = scroll + rect.top + panelHeight;\r\n    const viewportWidth = window.innerWidth;\r\n    const viewportHeight = window.innerHeight;\r\n    if (curtainsMode) {\r\n      document.querySelector(\"#WTFocusPanel\").removeAttribute(\"style\");\r\n    }\r\n    else {\r\n      if (panelRightCoord > viewportWidth) {\r\n        if (panelBottomCoord > viewportHeight) {\r\n          WTFocusPanel.style.top = \"auto\";\r\n          WTFocusPanel.style.bottom = viewportHeight - (scroll + rect.bottom) - 10 + \"px\";\r\n          WTFocusPanel.classList.add(\"toBottom\");\r\n        } else {\r\n          WTFocusPanel.style.top = scroll + rect.top + \"px\";\r\n          WTFocusPanel.style.bottom = \"auto\";\r\n          WTFocusPanel.classList.remove(\"toBottom\");\r\n        }\r\n        WTFocusPanel.style.left = \"auto\";\r\n        WTFocusPanel.style.right = viewportWidth - rect.left + WTFpanelOffset - WTFfocusOutlineWidth + \"px\";\r\n        WTFocusPanel.classList.add(\"toLeft\");\r\n      } else {\r\n        if (panelBottomCoord > viewportHeight) {\r\n          WTFocusPanel.style.top = \"auto\";\r\n          WTFocusPanel.style.bottom = viewportHeight - (scroll + rect.bottom) - 10 + \"px\";\r\n          WTFocusPanel.classList.add(\"toBottom\");\r\n        } else {\r\n          WTFocusPanel.style.top = scroll + rect.top + \"px\";\r\n          WTFocusPanel.style.bottom = \"auto\";\r\n          WTFocusPanel.classList.remove(\"toBottom\");\r\n        }\r\n        WTFocusPanel.style.left = rect.right + WTFpanelOffset - WTFfocusOutlineWidth + \"px\";\r\n        WTFocusPanel.style.right = \"auto\";\r\n        WTFocusPanel.classList.remove(\"toLeft\");\r\n      }\r\n\r\n    }\r\n  }\r\n\r\n  addFocusStyles();\r\n  promptForLoggingType();\r\n  addButtons();\r\n\r\n  let accNamesFound = [];\r\n  Array.from(focusables).forEach(function (focusable) {\r\n    focusable.classList.add(\"WTFocusTempFocusStyle\");\r\n\r\n    const styleEls = focusable.querySelectorAll(\"style\");\r\n    Array.from(styleEls).forEach(function (styleEl) {\r\n      styleEl.remove();\r\n    });\r\n\r\n    focusable.addEventListener(\"focus\", () => {\r\n      let elementRole = focusable.getAttribute(\"role\");\r\n      let focussedTagName = focusable.tagName.toLowerCase();\r\n      if (elementRole) {\r\n      } else {\r\n        if ((focussedTagName==\"article\")||(focussedTagName==\"button\")||(focussedTagName==\"dialog\")||(focussedTagName==\"figure\")||(focussedTagName==\"img\")||(focussedTagName==\"main\")||(focussedTagName==\"math\")) {\r\n          elementRole = focussedTagName;\r\n        }\r\n        if (focussedTagName==\"summary\") {\r\n          elementRole = \"button\";\r\n        }\r\n        if (focussedTagName==\"aside\") {\r\n          elementRole = \"complementary\";\r\n        }\r\n        if (focussedTagName==\"dd\") {\r\n          elementRole = \"definition\";\r\n        }\r\n        if (focussedTagName==\"html\") {\r\n          elementRole = \"document\";\r\n        }\r\n        if ((focussedTagName==\"details\")||(focussedTagName==\"fieldset\")||(focussedTagName==\"optgroup\")) {\r\n          elementRole = \"group\";\r\n        }\r\n        if ((focussedTagName==\"menu\")||(focussedTagName==\"ol\")||(focussedTagName==\"ul\")) {\r\n          elementRole = \"list\";\r\n        }\r\n        if (focussedTagName==\"datalist\") {\r\n          elementRole = \"listbox\";\r\n        }\r\n        if (focussedTagName==\"li\") {\r\n          elementRole = \"listitem\";\r\n        }\r\n        if (focussedTagName==\"nav\") {\r\n          elementRole = \"navigation\";\r\n        }\r\n        if (focussedTagName==\"progress\") {\r\n          elementRole = \"progressbar\";\r\n        }\r\n        if (focussedTagName==\"hr\") {\r\n          elementRole = \"separator\";\r\n        }\r\n        if (focussedTagName==\"output\") {\r\n          elementRole = \"status\";\r\n        }\r\n        if ((focussedTagName==\"dfn\")||(focussedTagName==\"dt\")) {\r\n          elementRole = \"term\";\r\n        }\r\n        if (focussedTagName==\"a\") {\r\n          elementRole = \"link\";\r\n        }\r\n        if (focussedTagName==\"select\") {\r\n          elementRole = \"listbox\";\r\n        }\r\n        if (focussedTagName==\"textarea\") {\r\n          elementRole = \"textbox\";\r\n        }\r\n        if (focussedTagName==\"input\") {\r\n          let type = focusable.getAttribute(\"type\").toLowerCase();\r\n          if (type===\"email\") {\r\n            elementRole = \"textbox\";\r\n          }\r\n          if (type===\"text\") {\r\n            elementRole = \"textbox\";\r\n          }\r\n          if (type===\"range\") {\r\n            elementRole = \"slider\";\r\n          }\r\n          if (type===\"number\") {\r\n            elementRole = \"spinbutton\";\r\n          }\r\n          if ((type===\"checkbox\")||(type===\"radio\")) {\r\n            elementRole = type;\r\n          }\r\n          if ((type===\"button\")||(type===\"image\")||(type===\"reset\")||(type===\"submit\")) {\r\n            elementRole = \"button\";\r\n          }\r\n        }\r\n      }\r\n      currentFocusedEl = focusable;\r\n      removeDupeIndicators();\r\n      let containsImages = false;\r\n      isGood = false;\r\n      isBad = false;\r\n\r\n      const imgs = focusable.querySelectorAll(\"img, [role=\'image\'][aria-label], [role=\'img\'][aria-label]\");\r\n      containsImages = imgs.length > 0;\r\n\r\n      if (containsImages) {\r\n        Array.from(imgs).forEach(function (image) {\r\n          const newSpan = document.createElement(\"SPAN\");\r\n          newSpan.setAttribute(\"class\", \"visually-hidden\");\r\n          newSpan.setAttribute(\"style\", \"clip-path: inset(100%);clip: rect(1px, 1px, 1px, 1px);height: 1px;overflow: hidden;position: absolute;white-space: nowrap;width: 1px;\");\r\n          newSpan.setAttribute(\"data-temp-node\", \"true\");\r\n          if (image.getAttribute(\"alt\")) {\r\n            newSpan.textContent = \" \" + image.getAttribute(\"alt\") + \" \";\r\n          }\r\n          if (image.getAttribute(\"role\") && image.getAttribute(\"aria-label\")) {\r\n            newSpan.textContent = \" \" + image.getAttribute(\"aria-label\") + \" \";\r\n          }\r\n          insertAfter(newSpan, image);\r\n        });\r\n      }\r\n      setTimeout(function () {\r\n        focusable.classList.add(\"WTFocusTempFocusStyle\");\r\n      }, 100);\r\n\r\n      strPageOutput = \"\";\r\n\r\n      const tagName = focusable.tagName.toLowerCase();\r\n      let tagRole = focusable.getAttribute(\"role\");\r\n      if (tagRole) {\r\n        tagRole = focusable.getAttribute(\"role\").toLowerCase();\r\n      }\r\n      let tagDetails = \"<\" + tagName + \">\";\r\n      let superfluousRole = false;\r\n      let hasDescribedBy = false;\r\n      let ariaDescribedByText = \"\";\r\n      let identicalAriaLabel = false;\r\n      let betterAsNativeHTMLelement = false;\r\n      if (tagRole) {\r\n        tagDetails = \"<\" + tagName + \' role=\"\' + tagRole + \'\">\';\r\n        if ((tagRole === \"link\" && tagName === \"a\") || (tagRole === \"button\" && tagName === \"button\") || (tagRole === \"image\" && tagName === \"img\") || (tagRole === \"img\" && tagName === \"img\") || (tagRole === \"navigation\" && tagName === \"nav\") || (tagRole === \"heading\" && (tagName === \"h1\" || tagName === \"h2\" || tagName === \"h3\" || tagName === \"h4\" || tagName === \"h5\" || tagName === \"h6\"))) {\r\n          superfluousRole = true;\r\n        }\r\n        if ((tagRole === \"link\" && tagName !== \"a\") || (tagRole === \"button\" && tagName !== \"button\") || ((tagRole === \"image\" || tagRole === \"image\") && tagName !== \"img\") || (tagRole === \"navigation\" && tagName !== \"nav\") || (tagRole === \"heading\" && !(tagName === \"h1\" || tagName === \"h2\" || tagName === \"h3\" || tagName === \"h4\" || tagName === \"h5\" || tagName === \"h6\"))) {\r\n          betterAsNativeHTMLelement = true;\r\n        }\r\n      }\r\n      if (focusable.getAttribute(\"aria-describedby\")) {\r\n        hasDescribedBy = true;\r\n      }\r\n\r\n      let textContent = focusable.textContent;\r\n      let ariaLabel = focusable.ariaLabel;\r\n      let ariaLabelledBy = focusable.getAttribute(\"aria-labelledby\");\r\n      let placeholder = focusable.getAttribute(\"placeholder\");\r\n      let ariaLabelledBySource;\r\n      let ariaDescribedBySource;\r\n      let accNameFromAriaLabelledBySrc = \"\";\r\n      let descriptionFromAriaDescribedBySrc = \"\";\r\n      let value = focusable.getAttribute(\"value\");\r\n      let title = focusable.getAttribute(\"title\");\r\n      let accName = \"\";\r\n      let visibleLabelText = \"\";\r\n      let wrappedLabel = false;\r\n      let linkedLabel = false;\r\n      let accNameSource = \"\";\r\n      let ariaHiddenElementsPresent = false;\r\n\r\n      positionPanelOnPage(focusable);\r\n\r\n      textContent = textContent.trim();\r\n\r\n      \/\/ Real labels\r\n      const parentLabel = findAncestor(focusable, \"label\");\r\n      if (parentLabel) {\r\n        wrappedLabel = true;\r\n        visibleLabelText = parentLabel.textContent.trim();\r\n        accName = visibleLabelText;\r\n      }\r\n\r\n      if (focusable.getAttribute(\"id\")) {\r\n        const linkedLabelEl = document.querySelector(\"[for=\'\" + focusable.getAttribute(\"id\") + \"\']\");\r\n        if (linkedLabelEl) {\r\n          linkedLabel = true;\r\n          visibleLabelText = linkedLabelEl.textContent;\r\n        }\r\n      }\r\n\r\n      if (!(wrappedLabel || linkedLabel)) {\r\n        visibleLabelText = \"N\/A\";\r\n      }\r\n      if (!textContent) {\r\n        textContent = \"N\/A\";\r\n      }\r\n      if (!value) {\r\n        value = \"N\/A\";\r\n      }\r\n      if (!title) {\r\n        title = \"N\/A\";\r\n      }\r\n      if (!placeholder) {\r\n        placeholder = \"N\/A\";\r\n      }\r\n      if (!ariaLabel) {\r\n        ariaLabel = \"N\/A\";\r\n      }\r\n      if (!ariaLabelledBy) {\r\n        ariaLabelledBy = \"N\/A\";\r\n      } else {\r\n        ariaLabelledBySource = ariaLabelledBy;\r\n        const ariaLabelledBySources = ariaLabelledBySource.split(\" \");\r\n        if (ariaLabelledBySources.length > 1) {\r\n          Array.from(ariaLabelledBySources).forEach(function (sourceNode) {\r\n            if (document.querySelector(\"#\" + sourceNode)) {\r\n              accNameFromAriaLabelledBySrc += document.querySelector(\"#\" + sourceNode).textContent + \" \";\r\n            } else {\r\n              accNameFromAriaLabelledBySrc += \"\u2753\u2753\u2753 \";\r\n            }\r\n          });\r\n          accNameFromAriaLabelledBySrc = accNameFromAriaLabelledBySrc.trim();\r\n        } else {\r\n          accNameFromAriaLabelledBySrc = document.querySelector(\"#\" + ariaLabelledBySource).textContent;\r\n        }\r\n      }\r\n\r\n\r\n      const hiddenElements = focusable.querySelectorAll(\"[aria-hidden=\'true\'],[role=\'presentation\']\");\r\n      let textContentWithAriaHiddenRemoved = textContent;\r\n      if (hiddenElements.length > 0) {\r\n        ariaHiddenElementsPresent = true;\r\n        Array.from(hiddenElements).forEach(function (hiddenElement) {\r\n          const tempText = hiddenElement.textContent;\r\n          if (tempText !== \"\") {\r\n            textContentWithAriaHiddenRemoved = textContentWithAriaHiddenRemoved.split(tempText).join(\" \");\r\n          }\r\n        });\r\n        textContentWithAriaHiddenRemoved = textContentWithAriaHiddenRemoved.trim();\r\n      }\r\n\r\n      if (tagName === \"input\") {\r\n        const inputType = focusable.getAttribute(\"type\");\r\n        if (inputType === \"submit\") {\r\n          if (value === \"N\/A\") {\r\n            accName = \"Submit\";\r\n            accNameSource = \"Not provided (using default)\";\r\n          }\r\n        }\r\n        if (inputType === \"image\") {\r\n          if (value === \"N\/A\") {\r\n            accName = \"Submit\";\r\n            accNameSource = \"Not provided (using default)\";\r\n          }\r\n        }\r\n        if (inputType === \"cancel\") {\r\n          if (value === \"N\/A\") {\r\n            accName = \"Cancel\";\r\n            accNameSource = \"Not provided (using default)\";\r\n          }\r\n        }\r\n      }\r\n\r\n      if (title !== \"N\/A\") {\r\n        accName = title;\r\n        accNameSource = \"title attribute\";\r\n      }\r\n      if (value !== \"N\/A\") {\r\n        accName = value;\r\n        accNameSource = \"value attribute\";\r\n      }\r\n      if (placeholder !== \"N\/A\") {\r\n        accName = placeholder;\r\n        accNameSource = \"placeholder attribute\";\r\n      }\r\n      if (textContent !== \"N\/A\") {\r\n        accName = textContentWithAriaHiddenRemoved;\r\n        accNameSource = \"Inner text content\";\r\n      }\r\n      if (visibleLabelText !== \"N\/A\") {\r\n        accName = visibleLabelText;\r\n        accNameSource = \"<label> text\";\r\n      }\r\n      if (ariaLabel !== \"N\/A\") {\r\n        accName = ariaLabel;\r\n        accNameSource = \"aria-label\";\r\n      }\r\n      if (ariaLabelledBy !== \"N\/A\") {\r\n        accName = accNameFromAriaLabelledBySrc;\r\n        accNameSource = \"aria-labelledby\";\r\n      }\r\n\r\n      isDupeAccName = focusable.getAttribute(\"data-dupe\") === \"true\";\r\n      dupeAccNameIsNoAccName = isDupeAccName && accName === \"\";\r\n\r\n      if (accName === \"\" || isDupeAccName) {\r\n        if (accName === \"\") {\r\n          isBad = true;\r\n          WTFocusPanel.classList.add(\"error\");\r\n          log(accNameLabel + \"No accessible name!\", \"\", style_bad_formatting);\r\n          addToConsoleOutput(\"No accessible name!\");\r\n          log(\"Accessible Name Source: N\/A\", \"\", style_bad_formatting);\r\n        }\r\n        if (isDupeAccName && accName !== \"\") {\r\n          WTFocusPanel.classList.add(\"warning\");\r\n          \/\/reveal other dupes\r\n          const allDupeAccNames = document.querySelectorAll(\"[data-accname=\'\" + accName + \"\']\");\r\n          const dupeCount = allDupeAccNames.length;\r\n          log(accNameLabel, accName, style_bad_formatting,false,true);\r\n          addToConsoleOutput(elCount + \" \" + accName);\r\n          elCount++;\r\n          if (!dupeAccNameIsNoAccName) {\r\n            Array.from(allDupeAccNames).forEach(function (anotherDupe) {\r\n              anotherDupe.classList.add(\"dupeAccName\");\r\n            });\r\n            log(\"Duplicate warning!\", dupeCount + \" elements on page have the same accessible name\", style_bad_formatting);\r\n          }\r\n          Array.from(allDupeAccNames).forEach(function (anotherDupe) {\r\n          });\r\n          log(\"Accessible Name Source: \", accNameSource, style_bad_formatting);\r\n        }\r\n      } else {\r\n        WTFocusPanel.classList.remove(\"error\");\r\n        WTFocusPanel.classList.remove(\"warning\");\r\n        log(accNameLabel, accName, style_good_formatting,false,true);\r\n        addToConsoleOutput(elCount + \" \" + accName);\r\n        elCount++;\r\n        log(\"Accessible Name Source: \", accNameSource, style_good_formatting);\r\n      }\r\n\r\n      isBad = false;\r\n      \r\n      log(\"Role: \", elementRole, style_good_formatting,false,true);\r\n      addToConsoleOutput(\", \" + elementRole);\r\n      if (hasDescribedBy) {\r\n        ariaDescribedBySource = focusable.getAttribute(\"aria-describedby\");\r\n        const ariaDescribedBySources = ariaDescribedBySource.split(\" \");\r\n        if (ariaDescribedBySources.length > 1) {\r\n          Array.from(ariaDescribedBySources).forEach(function (sourceNode) {\r\n            if (document.querySelector(\"#\" + sourceNode)) {\r\n              descriptionFromAriaDescribedBySrc += document.querySelector(\"#\" + sourceNode).textContent + \" \";\r\n            } else {\r\n              descriptionFromAriaDescribedBySrc += \"\u2753\u2753\u2753 \";\r\n            }\r\n          });\r\n          descriptionFromAriaDescribedBySrc = descriptionFromAriaDescribedBySrc.trim();\r\n        } else {\r\n          descriptionFromAriaDescribedBySrc = document.querySelector(\"#\" + ariaDescribedBySource).textContent;\r\n        }\r\n        log(\"Accessible Description: \", descriptionFromAriaDescribedBySrc, style_good_formatting);\r\n        addToConsoleOutput(\", \" + descriptionFromAriaDescribedBySrc + \"\\n\");\r\n      } else {\r\n        log(\"Accessible Description: \", \"N\/A\", style_good_formatting);\r\n        addToConsoleOutput(\"\\n\");\r\n      }\r\n\r\n      log(\"HTML Element: \", tagDetails, style_good_formatting);\r\n      strPageOutput += \"<\/ul>\\n\";\r\n      strPageOutput += \"<details\";\r\n      if (showDetails) {\r\n        strPageOutput += \" open\";\r\n      }\r\n      strPageOutput += \">\\n\";\r\n      strPageOutput += \"<summary>More details (D)<\/summary>\\n\";\r\n      strPageOutput += \"<ul role=\\\"list\\\">\\n\";\r\n\r\n      if (superfluousRole) {\r\n        isBad = true;\r\n        log(\"Superfluous `role` attribute\", \"\", style_bad_formatting);\r\n      }\r\n      if (betterAsNativeHTMLelement) {\r\n        isBad = true;\r\n        log(\"Better to use a native HTML element\", \"\", style_bad_formatting);\r\n      }\r\n\r\n      textContent = textContent.trim();\r\n      visibleLabelText = visibleLabelText.trim();\r\n      title = title.trim();\r\n      ariaLabel = ariaLabel.trim();\r\n      ariaLabelledBy = ariaLabelledBy.trim();\r\n\r\n      resetGoodBadState();\r\n      if (accNameSource === \"placeholder attribute\") {\r\n        isGood = true;\r\n        log(\"@placeholder: \", placeholder, style_ok_formatting, true);\r\n      } else {\r\n        if (placeholder === \"N\/A\") {\r\n          log(\"@placeholder: \", placeholder, style_unimportant_formatting);\r\n        } else {\r\n          log(\"@placeholder: \", placeholder, style_overridden_formatting);\r\n        }\r\n      }\r\n      resetGoodBadState();\r\n      if (accNameSource === \"title attribute\") {\r\n        isGood = true;\r\n        log(\"@title: \", title, style_ok_formatting, true);\r\n      } else {\r\n        if (title === \"N\/A\") {\r\n          log(\"@title: \", title, style_unimportant_formatting);\r\n        } else {\r\n          log(\"@title: \", title, style_overridden_formatting);\r\n        }\r\n      }\r\n      resetGoodBadState();\r\n      if (accNameSource === \"value attribute\") {\r\n        isGood = true;\r\n        log(\"@value: \", value, style_ok_formatting, true);\r\n      } else {\r\n        if (value === \"N\/A\") {\r\n          log(\"@value: \", value, style_unimportant_formatting);\r\n        } else {\r\n          log(\"@value: \", value, style_overridden_formatting);\r\n        }\r\n      }\r\n      resetGoodBadState();\r\n      if (accNameSource === \"Inner text content\") {\r\n        isGood = true;\r\n        if (containsImages) {\r\n          log(\"Inner text content (includes image alt): \", textContent, style_ok_formatting, true);\r\n        } else {\r\n          log(\"Inner text content: \", textContent, style_ok_formatting, true);\r\n        }\r\n        if (ariaHiddenElementsPresent) {\r\n          log(\"! elements hidden to AT removed\", \"\", style_ok_formatting);\r\n        }\r\n      } else {\r\n        if (textContent === \"N\/A\") {\r\n          log(\"Text Content: \", textContent, style_unimportant_formatting);\r\n        } else {\r\n          log(\"Text Content: \", textContent, style_overridden_formatting);\r\n        }\r\n      }\r\n      resetGoodBadState();\r\n      if (accNameSource === \"<label> text\") {\r\n        isGood = true;\r\n        log(\"Visible `label` text: \", visibleLabelText, style_ok_formatting, true);\r\n      } else {\r\n        if (visibleLabelText === \"N\/A\") {\r\n          log(\"Visible `label` text: \", visibleLabelText, style_unimportant_formatting);\r\n        } else {\r\n          log(\"Visible `label` text: \", visibleLabelText, style_overridden_formatting);\r\n        }\r\n      }\r\n      resetGoodBadState();\r\n      if (accNameSource === \"aria-label\") {\r\n        if (ariaLabel === textContent) {\r\n          isBad = true;\r\n          log(\"`aria-label` content is same as inner text content\", \"\", style_bad_formatting);\r\n        } else {\r\n          isGood = true;\r\n          log(\"@aria-label value: \", ariaLabel, style_ok_formatting, true);\r\n        }\r\n      } else {\r\n        if (ariaLabel === \"N\/A\") {\r\n          log(\"@aria-label value: \", ariaLabel, style_unimportant_formatting);\r\n        } else {\r\n          log(\"@aria-label value: \", ariaLabel, style_overridden_formatting);\r\n        }\r\n      }\r\n      resetGoodBadState();\r\n      if (accNameSource === \"aria-labelledby\") {\r\n        if (accNameFromAriaLabelledBySrc === textContent) {\r\n          isBad = true;\r\n          log(\"`aria-labelledby` source content is same as inner text content\", \"\", style_bad_formatting);\r\n        } else {\r\n          isGood = true;\r\n          log(\"@aria-labelledby value: \", ariaLabelledBy, style_ok_formatting, true);\r\n          log(\"@aria-labelledby sources: \", accNameFromAriaLabelledBySrc, style_ok_formatting);\r\n        }\r\n      } else {\r\n        log(\"@aria-labelledby value: \", ariaLabelledBy, style_unimportant_formatting);\r\n        log(\"@aria-labelledby sources: \", \"N\/A\", style_unimportant_formatting);\r\n      }\r\n\r\n      document.querySelector(\"#WTFocusPanel\").innerHTML = \'<ul role=\"list\">\' + strPageOutput + \"<\/ul><\/details>\";\r\n      document.querySelector(\"#WTFocusPanel\").removeAttribute(\"hidden\");\r\n      addButtons();\r\n      const allTempNodes = document.querySelectorAll(\"[data-temp-node]\");\r\n      Array.from(allTempNodes).forEach(function (tempNode) {\r\n        tempNode.remove();\r\n      });\r\n\r\n      \/\/add accNAme as attribute for easier lookup\/comparison\r\n      focusable.setAttribute(\"data-accname\", accName);\r\n\r\n      if (!checkedForDupes) {\r\n        addAccNameIfNotAlreadyExists(accName, focusable);\r\n      }\r\n    });\r\n  });\r\n\r\n  let checkedForDupes = false;\r\n  function removeDupeIndicators() {\r\n    Array.from(focusables).forEach(function (focusable) {\r\n      focusable.classList.remove(\"dupeAccName\");\r\n    });\r\n  }\r\n\r\n  function mimicFocus() {\r\n    currentActiveEl = document.activeElement;\r\n    Array.from(focusables).forEach(function (focusable) {\r\n      if (document.activeElement === focusable) {\r\n        focusable.blur();\r\n      }\r\n      focusable.focus();\r\n      console.log(\"-------------------\");\r\n    });\r\n    checkedForDupes = true;\r\n    if (currentActiveEl.tagName === \"BODY\") {\r\n      \/\/focus on body\r\n      const bodyEl = document.querySelector(\"body\");\r\n      bodyEl.setAttribute(\"tabindex\", \"-1\");\r\n      bodyEl.focus();\r\n      hidePanel();\r\n    } else {\r\n      currentActiveEl.focus();\r\n    }\r\n  }\r\n  mimicFocus();\r\n\r\n  function addAccNameIfNotAlreadyExists(thisAccName, el) {\r\n    let dupeFound = false;\r\n    Array.from(accNamesFound).forEach(function (accName) {\r\n      if (accName === thisAccName) {\r\n        dupeFound = true;\r\n      }\r\n    });\r\n    if (dupeFound) {\r\n      el.setAttribute(\"data-dupe\", \"true\");\r\n      const previousElWithSameAccName = document.querySelector(\"[data-accname=\'\" + thisAccName + \"\']\");\r\n      previousElWithSameAccName.setAttribute(\"data-dupe\", \"true\");\r\n    } else {\r\n      accNamesFound.push(thisAccName);\r\n    }\r\n  }\r\n  console.log(consoleOutput);\r\n  startFocusPoint.focus();\r\n}\r\nWTFocus();"
  innerDoc.getElementsByTagName('head')[0].appendChild(s);
})