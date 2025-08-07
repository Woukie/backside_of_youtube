import { Input, RangeCharacterInput, RangeNumberInput } from "./inputs.js";

const url = new URL("https://www.youtube.com/results");
const param = "search_query";

/** @type {Query[]} */
const queries = [];

export class Query {
  #name;
  #query;
  #tags = [];
  #inputs = [];

  constructor(json) {
    this.#name = json.name;
    this.#query = json.query;
    this.#tags = json.tags || [];

    (json.inputs || []).forEach((inputJSON) => {
      let input;
      switch (inputJSON.type) {
        case "RangeNumber":
          input = new RangeNumberInput(inputJSON);
          break;
        case "RangeCharacter":
          input = new RangeCharacterInput(inputJSON);
          break;

        default:
          break;
      }

      if (input) this.#inputs.push(input);
    });
  }

  /**
   * Creates a search query given the results of the inputs, placing the results at the placeholders specified by this object
   * @returns {URL}
   */
  generate() {
    let results = new Map();
    this.getInputs().map((input, _) => {
      results.set(input.getPlaceholder(), input.getResult());
    });
    let returnUrl = url;

    let queryString = this.#query;
    results.forEach((result, placeholder) => {
      queryString = queryString.replace(placeholder, result);
    });

    returnUrl.searchParams.set(param, queryString);
    return returnUrl;
  }

  /**
   *
   * @returns {Input[]}
   */
  getInputs() {
    return this.#inputs;
  }

  /**
   *
   * @returns {String}
   */
  getName() {
    return this.#name;
  }

  /**
   *
   * @returns {String[]}
   */
  getTags() {
    return this.#tags;
  }
}

export function loadQueriesFromJSON(jsonString) {
  queries.length = 0;
  const queriesJSON = JSON.parse(jsonString);
  queriesJSON.queries.forEach((queryJSON) => {
    let queryObject = new Query(queryJSON);
    queries.push(queryObject);
  });

  // document.getElementById("editor").textContent = jsonString;
}

export default queries;
