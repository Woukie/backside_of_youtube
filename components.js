/*
This modified code is redistributed and licenced under the same licence as the originals (CC BY-SA 4.0)
- Dropdown checkboxes (https://stackoverflow.com/a/69675987)
- Passing data through child elements in a Web Component (https://stackoverflow.com/a/50416836)
*/
class CheckboxSelect extends HTMLElement {
  #shadow;
  #data;
  #observer;

  #dropdownElement;
  #checkboxesElement;

  #style = /*HTML*/ `
    <style>
      .dropdownElement {
        position: relative;
      }

      .dropdownElement select {
        max-width: 100%;
      }

      .overSelect {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        border: 0;
        cursor: pointer;
      }

      .form-select {
        color: white;
        background-color: black;
        font-family: "Px437_IBM_VGA_8x16";
        border: 0;
        font-size: 16px;
        padding: 0;
        margin: 0;
      }

      .checkboxesElement {
        display: none;
        background-color: black;
        max-height: 200px;
        overflow-y: scroll;
      }

      label {
        display: block;
        font-weight: normal;
        display: block;
        white-space: nowrap;
        min-height: 1.2em;
        background-color: black;
        padding: 0px 16px;
      }

      label:hover {
        background-color: #FE0032;
        color: black;
      }

      input[type="checkbox"] {
        accent-color: #FE0032;
      }
    </style>
  `;

  constructor() {
    super();
    this.#shadow = this.attachShadow({ mode: "open" });
    this.#data = [];
    this.#observer = new MutationObserver((mutations) =>
      this.mutated(mutations)
    );
    this.render();
  }

  connectedCallback() {
    this.#observer.observe(this, { childList: true, attributes: true });
    this.mutated();

    document.addEventListener("click", (evt) => {
      var targetElement = evt.target;

      do {
        if (targetElement == this) {
          return;
        }

        targetElement = targetElement.parentNode;
      } while (targetElement);

      this.toggleCheckboxArea(true);
    });

    this.updateCheckboxStates();
  }

  disconnectedCallback() {
    this.#observer.disconnect();
  }

  toggleCheckboxArea(onlyHide = false) {
    var displayValue = this.#checkboxesElement.style.display;

    if (displayValue != "block") {
      if (onlyHide == false) {
        this.#checkboxesElement.style.display = "block";
      }
    } else {
      this.#checkboxesElement.style.display = "none";
    }
  }

  mutated(mutations) {
    var attributeChanged = false;
    var render = true;

    if (mutations) {
      render = false;
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes") {
          attributeChanged = true;
        } else if (mutation.type === "childList") {
          render = true;
        }
      });
    }

    if (attributeChanged) {
      this.updateCheckboxStates();
      this.updateTitle();
    }

    if (render) {
      this.#data = Array.from(this.children).map((child) => ({
        value: child.getAttribute("value") || "",
        text: child.innerText,
      }));

      this.render();
    }
  }

  render() {
    // Create the dropdown element itself
    this.#shadow.innerHTML = /*HTML*/ `
      ${this.#style}
      <div class="dropdownElement">
        <select class="form-select">
          <option></option>
        </select>
        <div class="overSelect"></div>
      </div>
    `;
    this.#dropdownElement = this.#shadow.children[1];
    this.#dropdownElement.addEventListener("click", (evt) => {
      this.toggleCheckboxArea();
    });

    // Create the checkbox dropdown elements from data
    this.#checkboxesElement = document.createElement("div");
    this.#checkboxesElement.className = "checkboxesElement";
    this.#data.map((option) => {
      var element = document.createElement("label");
      element.innerHTML = /*HTML*/ `
        <input type="checkbox" value="${option.value}"/>
        ${option.text}
      `;
      element.children[0].addEventListener("change", () => {
        this.updateAttributes();
      });
      this.#checkboxesElement.appendChild(element);
    });
    this.#shadow.appendChild(this.#checkboxesElement);

    this.updateTitle();
    this.updateCheckboxStates();
  }

  // Called when clicking checkbox
  updateAttributes() {
    if (this.isConnected) {
      const checkedIndexes = Array.from(
        this.#checkboxesElement.querySelectorAll("input[type=checkbox]")
      )
        .map((cb, idx) => (cb.checked ? idx : -1))
        .filter((idx) => idx !== -1);
      this.setAttribute("value", checkedIndexes.join(","));
    }

    this.dispatchEvent(new Event("change", { bubbles: true }));
  }

  // Called when value attribute changed
  updateTitle() {
    var option = this.#dropdownElement.getElementsByTagName("option")[0];
    var checkedValues = this.hasAttribute("value")
      ? this.getAttribute("value")
          .split(",")
          .map((i) => parseInt(i))
      : [];
    const selectedLabels = this.#data
      .filter((option, idx) => checkedValues.includes(idx))
      .map((option) => option.value);

    option.innerText = selectedLabels.length
      ? selectedLabels.join(", ")
      : "None selected";
  }

  updateCheckboxStates() {
    const values = (this.getAttribute("value") || "")
      .split(",")
      .map((v) => parseInt(v));

    if (this.#checkboxesElement) {
      Array.from(
        this.#checkboxesElement.querySelectorAll("input[type=checkbox]")
      ).forEach((cb, idx) => {
        cb.checked = values.includes(idx);
      });
    }
  }
}

customElements.define("x-checkboxselect", CheckboxSelect);
