export class Input {
  _resultElement;
  _placeholder;

  /**
   * Parse result from input element in the document
   * @returns {string} The parsed value from the input
   */
  getResult() {
    const element = this._resultElement.getElementsByTagName("input");
    return element.value;
  }

  /**
   * Get HTML representation of this input
   * @returns {string} The HTML in string form
   */
  createHTML() {
    return /*html*/ `
      <input type="number" />
    `;
  }

  /**
   * Sets the element that gets used to generate the result in getResult()
   * @param {Document|HTMLElement} element
   */
  setResultElement(element) {
    this._resultElement = element;
  }

  /**
   * Returns the element used to generate the result in getResult()
   * @returns {Document|HTMLElement}
   */
  getResultElement() {
    return this._resultElement;
  }

  getPlaceholder() {
    return this._placeholder;
  }

  /**
   * Whether two inputs should be merged when displaying
   * @param {object} object
   * @returns {boolean}
   */
  equals(object) {
    return object instanceof this.constructor;
  }
}

export class RangeNumberInput extends Input {
  constructor(json) {
    super();
    this._min = json.min || 0;
    this._max = json.max || 9;
    this._defaultMin = json.defaultMin || this._min;
    this._defaultMax = json.defaultMax || this._max;
    this._name = json.name;
    this._placeholder = json.placeholder;
  }

  getResult() {
    const randomCheckbox = this._resultElement.querySelector(
      'input[type="checkbox"]'
    );
    const rangeInput = this._resultElement.querySelector(
      'input[type="number"]'
    );

    let number;
    if (randomCheckbox && randomCheckbox.checked) {
      const randomDiv = this._resultElement.querySelector(".random");
      const numberInputs = randomDiv
        ? randomDiv.querySelectorAll('input[type="number"]')
        : [];
      const minInput = numberInputs[0];
      const maxInput = numberInputs[1];

      const min = minInput ? parseInt(minInput.value) : this._min;
      const max = maxInput ? parseInt(maxInput.value) : this._max;
      number = Math.floor(Math.random() * (max - min + 1) + min);
    } else {
      number = parseInt(rangeInput.value);
    }

    const maxLength = String(this._max).length;
    return String(number).padStart(maxLength, "0");
  }

  createHTML() {
    return /*HTML*/ `
      <p style="color: white;">${this._name} (${this._min}-${this._max})</p>
      <div class="requiredBy"></div>
      <label>
        <input
          type="checkbox"
          checked
          onchange="this.closest('div').getElementsByClassName('specific')[0].style.display = this.checked ? 'none' : ''; this.closest('div').getElementsByClassName('random')[0].style.display = !this.checked ? 'none' : ''"
        />
        Random
      </label>
      <label class="specific" style="display: none">
        <input
          type="number"
          min="${this._min}"
          max="${this._max}"
          value="${parseInt((this._defaultMin + this._defaultMax) / 2)}"
        />
        Specific number
        <br/>
      </label>
      <span class="random">
        <label>
          <input
            type="number"
            min="${this._min}"
            max="${this._max}"
            value="${parseInt(this._defaultMin)}"
          />
          Min
        </label>
        <label>
          <input
            type="number"
            min="${this._min}"
            max="${this._max}"
            value="${parseInt(this._defaultMax)}"
          />
          Max
        </label>
        <br/>
      </span>
      <br/>
    `;
  }

  equals(object) {
    return (
      object._min == this._min &&
      object._max == this._max &&
      object._defaultMin == this._defaultMin &&
      object._defaultMax == this._defaultMax &&
      object._name == this._name
    );
  }
}

export class RangeCharacterInput extends Input {
  constructor(json) {
    super();
    this._min = json.min ? json.min.charCodeAt(0) : 97;
    this._max = json.max ? json.max.charCodeAt(0) : 122;
    this._defaultMin = json.defaultMin
      ? json.defaultMin.charCodeAt(0)
      : this._min;
    this._defaultMax = json.defaultMax
      ? json.defaultMax.charCodeAt(0)
      : this._max;
    this._name = json.name;
    this._placeholder = json.placeholder;
    this._count = json.count || 1;
  }

  getResult() {
    const randomCheckbox = this._resultElement.querySelector(
      'input[type="checkbox"]'
    );
    const rangeInput = this._resultElement.querySelector(
      'input[type="number"]'
    );

    let number;
    if (randomCheckbox && randomCheckbox.checked) {
      const randomDiv = this._resultElement.querySelector(".random");
      const numberInputs = randomDiv
        ? randomDiv.querySelectorAll('input[type="number"]')
        : [];
      const minInput = numberInputs[0];
      const maxInput = numberInputs[1];

      const min = minInput ? parseInt(minInput.value) : this._min;
      const max = maxInput ? parseInt(maxInput.value) : this._max;
      number = Math.floor(Math.random() * (max - min + 1) + min);
    } else {
      number = parseInt(rangeInput.value);
    }
    return String.fromCharCode(number);
  }

  createHTML() {
    return /*HTML*/ `
      <p style="color: white;">${this._name} (${String.fromCharCode(
      this._min
    ).repeat(this._count)}-${String.fromCharCode(this._max).repeat(
      this._count
    )})</p>
      <div class="requiredBy"></div>
      <label>
        <input
          type="checkbox"
          checked
          onchange="this.closest('div').getElementsByClassName('specific')[0].style.display = this.checked ? 'none' : ''; this.closest('div').getElementsByClassName('random')[0].style.display = !this.checked ? 'none' : ''"
        />
        Random
      </label>
      <label class="specific" style="display: none">
        <input
          type="number"
          min="${this._min}"
          max="${this._max}"
          onchange="this.closest('label').children[1].innerText = '(' + String.fromCharCode(this.value) + ')'"
          value="${parseInt((this._defaultMin + this._defaultMax) / 2)}"
        />
        <output>(${String.fromCharCode(
          (this._defaultMin + this._defaultMax) / 2
        )})</output>
        Specific character
        <br/>
      </label>
      <span class="random">
        <label>
          <input
            type="number"
            min="${this._min}"
            max="${this._max}"
            onchange="this.closest('label').children[1].innerText = '(' + String.fromCharCode(this.value) + ')'"
            value="${parseInt(this._defaultMin)}"
          />
          <output>(${String.fromCharCode(this._defaultMin)})</output>
          Min
        </label>
        <label>
          <input
            type="number"
            min="${this._min}"
            max="${this._max}"
            onchange="this.closest('label').children[1].innerText = '(' + String.fromCharCode(this.value) + ')'"
            value="${parseInt(this._defaultMax)}"
          />
          <output>(${String.fromCharCode(this._defaultMax)})</output>
          Max
        </label>
        <br/>
      </span>
      <br/>
    `;
  }

  equals(object) {
    return (
      object._min == this._min &&
      object._max == this._max &&
      object._defaultMin == this._defaultMin &&
      object._defaultMax == this._defaultMax &&
      object._name == this._name &&
      object._count == this._count
    );
  }
}
