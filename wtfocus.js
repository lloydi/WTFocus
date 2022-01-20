"use strict";
// TODO
// change to <dl>?
// add option to output to page or console (currently seet to both)?

function WTFocus() {
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
  let accNameLabel = "Accessible name: "

  let outputToPage = false;
  let strPageOutput = "";

  let isGood = false;
  let isBad = false;
  let isDupeAccName = false;
  let dupeAccNameIsNoAccName = false;
  let currentActiveEl;

  let curtainsMode = false;

  if (confirm("Do you want to set a black curtain over the whole page? (Only the element in focus has its accessible name revealed)")) {
    curtainsMode = true;
    accNameLabel = "";
  }

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
  function log(text, el, style, isCurrent) {
    if (outputToPage) {
      el = el.split("<").join("&lt;").split(">").join("&gt;");
      // strPageOutput += '<li role="listitem"><span style="' + style + '">' + text + '</span>&nbsp;' + el + "</li>\n";
      strPageOutput += "<li";
      if (isCurrent) {
        strPageOutput += ' class="outline"';
      }
      strPageOutput += ' role="listitem"><span style="' + style + '">';
      if (isGood) {
        strPageOutput += indicator;
      }
      if (isBad) {
        strPageOutput += warning;
      }
      strPageOutput += text + "</span>&nbsp;" + el + "</li>\n";
      // } else {
      //   el = el.replace("&lt;", "<").replace("&gt;", ">");
      //   console.log("%c" + text + '"' + el + '"', style);
    }
    //also output to console
    el = el.replace("&lt;", "<").replace("&gt;", ">");
    console.log("%c" + text + '"' + el + '"', style);
  }
  function addFocusStyles() {
    const focusStyles = document.createElement("style");
    focusStyles.setAttribute("type", "text/css");
    focusStyles.setAttribute("id", "panelStyles");
    focusStyles.textContent = ".dupeAccName {outline:4px dashed #CC3300!important;outline-offset:" + WTFfocusOutlineWidth + "px!important;overflow:visible;} .WTFocusTempFocusStyle:focus {outline:" + WTFfocusOutlineWidth + "px solid black!important;outline-offset:" + WTFfocusOutlineWidth + "px!important;overflow:visible;/*background:yellow!important;color:black!important;*/} .WTFocusTempFocusStyle.dupeAccName:focus {outline-color:#CC3300!important;} .visually-hidden {clip-path: inset(100%);clip: rect(1px, 1px, 1px, 1px);height: 1px;overflow: hidden;position: absolute;white-space: nowrap;width: 1px;}#WTFocusCurtain {background:rgba(0,0,0,0.95);position: fixed;top: 0;bottom: 0;left: 0;right: 0;}";
    document.querySelector("body").appendChild(focusStyles);
  }
  function addPanelStyles(WTFpanelWidth) {
    const consoleStyle = document.createElement("style");
    consoleStyle.setAttribute("type", "text/css");
    consoleStyle.setAttribute("id", "focusStyles");
    consoleStyle.textContent =
      "#WTFocusPanel.error {background:darkred;} #WTFocusPanel.warning {background:#CC3300;} #WTFocusPanel[hidden] {display:none;} #WTFocusPanel * {text-align:left} #WTFocusPanel {border:2px solid #fff;z-index:1000;text-shadow:none;font-family:sans-serif;display:block;text-align:left;position: absolute;z-index:10000;background: black;padding: 20px 20px;width:" +
      WTFpanelWidth +
      "px;font-size:16px;} #WTFocusPanel button {font-weight:bold;background:none;color:#fff;padding:3px 10px;font-size:14px;border:1px solid #fff;display:inline-block;margin:10px 0 -10px 0;} #WTFocusPanel ul,#WTFocusPanel li {margin:0;padding:0;list-style:none} #WTFocusPanel li {margin:3px 0;background:#fff;color:#333;padding:2px} #WTFocusPanel li.outline {outline:4px solid rgb(58, 190, 58);outline-offset:-4px;padding:8px} #WTFocusPanel.error:before {background:darkred} #WTFocusPanel.warning:before {background:#CC3300} #WTFocusPanel:before {content:'';display:block;height:20px;width:20px;transform:rotate(45deg);position:absolute;background:#000;left:-12px;top:3px;border:2px solid #fff;border-right:none;border-top:none;} #WTFocusPanel.toBottom:before {top:auto;bottom:3px} #WTFocusPanel.toLeft:before {left:auto;right:-12px;border:2px solid #fff;border-left:none;border-bottom:none;} #WTFocusPanel.curtainsMode {outline:10px solid orange;} #WTFocusPanel.curtainsMode:before {display:none;} #WTFocusPanel.curtainsMode li {display:none;} #WTFocusPanel.curtainsMode li:first-child {display:block;} #WTFocusPanel.curtainsMode li span {display:none!important;}";
    document.querySelector("head").appendChild(consoleStyle);
  }
  function promptForLoggingType() {
    // if (confirm("Do you want to show focus details on the page or in the console?\n\n👉OK = Show on page\n👉Cancel = Show in console")) {
    if (document.querySelector("#WTFocusCurtain")) {
      removePanel();
    }
    outputToPage = true;
    strPageOutput = "";
    addPanelStyles(WTFpanelWidth);
    if (curtainsMode) addCurtainToPage();
    addPanelToPage();
    // }
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
    addEscKeyToDismiss();
  }
  function addCloseButton() {
    const consoleClose = document.createElement("button");
    consoleClose.textContent = "Close (Esc)";
    consoleClose.setAttribute("type", "button");
    consoleClose.addEventListener("click", () => {
      removePanel();
    });
    WTFocusPanel.appendChild(consoleClose);
  }
  function hidePanel() {
    document.querySelector("#WTFocusPanel").setAttribute("hidden", "hidden");
  }
  function removePanel() {
    document.querySelector("#WTFocusCurtain").remove();
    document.querySelector("#WTFocusPanel").remove();
    document.querySelector("#panelStyles").remove();
    document.querySelector("#focusStyles").remove();
  }
  function addEscKeyToDismiss() {
    window.addEventListener("keyup", (event) => {
      if (event.key === "Escape" && document.querySelector("#WTFocusPanel")) {
        removePanel();
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
    // console.log("panelBottomCoord = " + panelBottomCoord);
    // console.log("viewportHeight = " + viewportHeight);
    if (curtainsMode) {
      WTFocusPanel.style.position = "fixed";
      WTFocusPanel.style.top = "50%";
      WTFocusPanel.style.left = "50%";
      WTFocusPanel.style.transform = "translate(-50%,-50%)";
    } else {
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

  console.clear();
  addFocusStyles();
  promptForLoggingType();
  addCloseButton();

  let accNamesFound = [];
  Array.from(focusables).forEach(function (focusable) {
    focusable.classList.add("WTFocusTempFocusStyle");

    const styleEls = focusable.querySelectorAll("style");
    Array.from(styleEls).forEach(function (styleEl) {
      styleEl.remove();
    });

    focusable.addEventListener("focus", () => {
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

      let textContent = focusable.textContent;
      let ariaLabel = focusable.ariaLabel;
      let ariaLabelledBy = focusable.getAttribute("aria-labelledby");
      let placeholder = focusable.getAttribute("placeholder");
      let ariaLabelledBySource;
      let accNameFromAriaLabelledBySrc = "";
      let value = focusable.getAttribute("value");
      let title = focusable.getAttribute("title");
      let accName = "";
      let visibleLabelText = "";
      let wrappedLabel = false;
      let linkedLabel = false;
      let accNameSource = "";
      let ariaHiddenElementsPresent = false;

      if (outputToPage) {
        positionPanelOnPage(focusable);
      }

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
      // if (!outputToPage) {
      console.log("%cACTIVE ELEMENT: ", style_title_formatting);
      console.log(focusable);
      // }

      isDupeAccName = focusable.getAttribute("data-dupe") === "true";
      dupeAccNameIsNoAccName = isDupeAccName && accName === "";

      if (accName === "" || isDupeAccName) {
        if (accName === "") {
          isBad = true;
          if (outputToPage) {
            WTFocusPanel.classList.add("error");
          }
          log(accNameLabel + "No accessible name!", "", style_bad_formatting);
          log("Accessible Name Source: N/A", "", style_bad_formatting);
        }
        if (isDupeAccName && accName !== "") {
          if (outputToPage) {
            WTFocusPanel.classList.add("warning");
          }
          //reveal other dupes
          const allDupeAccNames = document.querySelectorAll("[data-accname='" + accName + "']");
          const dupeCount = allDupeAccNames.length;
          log(accNameLabel, accName, style_bad_formatting);
          if (!dupeAccNameIsNoAccName) {
            Array.from(allDupeAccNames).forEach(function (anotherDupe) {
              anotherDupe.classList.add("dupeAccName");
            });
            log("Duplicate warning!", dupeCount + " elements on page have the same accessible name", style_bad_formatting);
          }
          console.log("Elements on page that have identical accessible names:");
          Array.from(allDupeAccNames).forEach(function (anotherDupe) {
            console.log(anotherDupe);
          });
          log("Accessible Name Source: ", accNameSource, style_bad_formatting);
        }
      } else {
        if (outputToPage) {
          WTFocusPanel.classList.remove("error");
          WTFocusPanel.classList.remove("warning");
        }
        log(accNameLabel, accName, style_good_formatting);
        log("Accessible Name Source: ", accNameSource, style_good_formatting);
      }

      isBad = false;
      log("HTML Element: ", tagDetails, style_good_formatting);
      if (!outputToPage) {
        console.log("%cACCESSIBLE NAME COMES FROM: ", style_title_formatting);
      }
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

      if (outputToPage) {
        document.querySelector("#WTFocusPanel").innerHTML = '<ul role="list">' + strPageOutput + "</ul>";
        document.querySelector("#WTFocusPanel").removeAttribute("hidden");
        document.querySelector("#WTFocusCurtain").removeAttribute("hidden");
        addCloseButton();
      }
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
    console.clear();
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
}
WTFocus();
