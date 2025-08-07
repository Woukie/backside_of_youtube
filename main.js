import queries, { loadQueriesFromJSON, Query } from "./queries.js";

const queryDropdown = document.getElementById("videotypes");
const inputsParent = document.getElementById("queryinputs");
const tagCheckboxes = document.getElementById("tags");

/** @type {Query[]} */
let previousQueries = [];

/** @type {Query[]} */
const selectedQueries = [];

window.onload = (_) => {
  loadDropdowns();

  const customQuery = localStorage.getItem("queries");
  if (!customQuery) {
    fetch("./queries.json")
      .then((r) => r.text())
      .then((json) => {
        loadQueriesFromJSON(json);
        ace.edit("editor").setValue(json, -1);
        loadQueryDropdown();
      });
    return;
  }

  loadQueriesFromJSON(customQuery);
  ace.edit("editor").setValue(customQuery, -1);
  loadQueryDropdown();
};

function queryDropdownChanged() {
  updateSelectedQueries();

  rebuildInputs();
  rebuildTagCheckboxes();
}

function rebuildTagCheckboxes() {
  tagCheckboxes.innerHTML = "";

  /** @type {Map<string, int>} */
  let allTags = new Map();
  queries.forEach((query) => {
    const tags = query.getTags();
    if (tags)
      tags.forEach((tag) => allTags.set(tag, (allTags.get(tag) || 0) + 1));
  });

  allTags = new Map([...allTags.entries()].sort((a, b) => b[1] - a[1]));

  allTags.forEach((count, tag) => {
    const queriesWithTag = queries.filter(
      (query) => query.getTags() && query.getTags().includes(tag)
    );
    const selectedQueriesWithTag = queriesWithTag.filter((query) =>
      selectedQueries.includes(query)
    );

    const selectedCount = selectedQueriesWithTag.length;
    const totalCount = queriesWithTag.length;
    const state =
      selectedCount === totalCount
        ? "checked"
        : selectedCount > 0
        ? "indeterminate"
        : "unchecked";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox[state] = true;

    const label = document.createElement("label");
    label.textContent = `${tag} (${count})`;

    tagCheckboxes.appendChild(document.createElement("br"));
    tagCheckboxes.appendChild(label);
    label.prepend(checkbox);

    checkbox.addEventListener("change", function () {
      const currentlyChecked = this.checked;
      const wasIndeterminate = this.indeterminate;

      if (currentlyChecked && !wasIndeterminate) {
        queriesWithTag.forEach((query) => {
          if (!selectedQueries.includes(query)) {
            selectedQueries.push(query);
          }
        });
      } else {
        queriesWithTag.forEach((query) => {
          const index = selectedQueries.indexOf(query);
          if (index > -1) {
            selectedQueries.splice(index, 1);
          }
        });
      }

      const selectedIndexes = selectedQueries.map((query) =>
        queries.indexOf(query)
      );
      queryDropdown.setAttribute("value", selectedIndexes.join(","));

      queryDropdownChanged();
      rebuildTagCheckboxes();
    });
  });

  // First child is break
  if (tagCheckboxes.firstChild) tagCheckboxes.firstChild.remove();
}

function loadQueryDropdown() {
  queryDropdown.addEventListener("change", queryDropdownChanged);
  rebuildQueryDropdown();

  selectAllQueries();
}

function rebuildQueryDropdown() {
  queryDropdown.innerHTML = "";
  queries.forEach((query) => {
    const element = document.createElement("option");
    const tags = query.getTags();
    element.value = query.getName();
    element.innerText =
      query.getName() + (tags && tags.length > 0 ? ` (${tags[0]})` : "");
    queryDropdown.append(element);
  });
}

function updateSelectedQueries() {
  previousQueries = selectedQueries;
  const selectedQueryIndexes = queryDropdown.hasAttribute("value")
    ? queryDropdown
        .getAttribute("value")
        .split(",")
        .map((a) => parseInt(a))
    : [];

  selectedQueries.length = 0;
  queries.forEach((query, idx) => {
    if (selectedQueryIndexes.includes(idx)) selectedQueries.push(query);
  });
}

function rebuildInputs() {
  inputsParent.innerHTML = "";

  selectedQueries.forEach((selectedQuery, idx) => {
    selectedQuery.getInputs().forEach((input) => {
      let duplicateInput = null;
      for (let i = 0; i < idx; i++) {
        duplicateInput = selectedQueries
          .at(i)
          .getInputs()
          .find((oldInput) => oldInput.equals(input));
        if (duplicateInput) {
          break;
        }
      }

      if (duplicateInput) {
        input.setResultElement(duplicateInput.getResultElement());
        const dependentList = duplicateInput
          .getResultElement()
          .getElementsByClassName("requiredBy")[0];
        if (dependentList)
          dependentList.innerText += ", " + selectedQuery.getName();
      } else {
        const inputParent = document.createElement("div");
        inputParent.innerHTML = input.createHTML();
        input.setResultElement(inputParent);
        inputsParent.appendChild(inputParent);
        const dependentList =
          inputParent.getElementsByClassName("requiredBy")[0];
        if (dependentList)
          dependentList.innerText = "Used by " + selectedQuery.getName();
      }
    });
  });

  if (!inputsParent.firstChild) {
    const noneMessage = document.createElement("p");
    noneMessage.textContent = "No selected queries have inputs";
    inputsParent.appendChild(noneMessage);
  }
}

function search() {
  if (selectedQueries.length == 0) return;
  const randomQuery = selectedQueries.at(
    selectedQueries.length * Math.random()
  );
  open(randomQuery.generate());
}

function loadDropdowns() {
  var coll = document.getElementsByClassName("collapsible");
  var i;

  for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function () {
      this.classList.toggle("active");
      var content = document.getElementById(this.getAttribute("data-for"));
      if (content.style.display === "block") {
        content.style.display = "none";
      } else {
        content.style.display = "block";
      }
    });
  }
}

function selectAllQueries() {
  queryDropdown.setAttribute(
    "value",
    Array.from({ length: queries.length }, (_, i) => i).join(",")
  );
  queryDropdownChanged();
}

window.submitSearch = search;
window.selectAll = selectAllQueries;
window.deselectAll = () => {
  queryDropdown.setAttribute("value", "");
  queryDropdownChanged();
};
window.saveQueries = () => {
  const json = ace.edit("editor").getValue();
  localStorage.setItem("queries", json);
  loadQueriesFromJSON(json);
  rebuildQueryDropdown();
  queryDropdownChanged();
};
window.reloadQueries = () => {
  const customQuery = localStorage.getItem("queries");
  if (!customQuery) {
    fetch("./queries.json")
      .then((r) => r.text())
      .then((json) => {
        ace.edit("editor").setValue(json, -1);
      });
    return;
  }

  ace.edit("editor").setValue(customQuery, -1);
};
window.loadDefaultQueries = () => {
  fetch("./queries.json")
    .then((r) => r.text())
    .then((json) => {
      ace.edit("editor").setValue(json, -1);
    });
};
