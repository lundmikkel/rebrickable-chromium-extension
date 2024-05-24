import { Subject, from, scan, switchMap } from "rxjs";
import './part-colors.scss';

const root = document.querySelector("#inventory") ?? document;

const partSelector = ".js-part > div";
const partDataSelector = ".js-part-data";

root
  .querySelectorAll(partSelector)
  .forEach((element) => handlePart(element as HTMLElement));

const observer = new MutationObserver(handleMutations);
observer.observe(root, { childList: true, subtree: true });

const settingsSubject = new Subject<Record<string, unknown>>();

const settings$ = settingsSubject.pipe(
  scan(
    (settings, setting) => ({
      ...settings,
      ...setting,
    }),
    {}
  )
);

settings$
  .pipe(
    // auditTime(5_000),
    switchMap((settings) => from(chrome.storage.local.set({ settings })))
  )
  .subscribe();

const colorsInSet: Record<string, string> = {};

function handleMutations(mutationsList: MutationRecord[]) {
  const addedElementNodes = mutationsList
    .filter((mutation) => mutation.type === "childList")
    .flatMap((mutation) => Array.from(mutation.addedNodes))
    .filter((node): node is Element => node.nodeType === Node.ELEMENT_NODE);

  handleInventoryOptions(addedElementNodes);
  handleParts(addedElementNodes);
  addColorsForInventory(addedElementNodes);
}

function addColorsForInventory(addedElementNodes: Element[]) {
  addedElementNodes
    .filter((element) => element.matches(".heading-title"))
    .filter((element) => element.textContent?.includes("Standard Parts"))
    .filter((element): element is HTMLElement => element !== null)
    .forEach((p) => addColorsForSet(p));
}

function addColorsForSet(titleElement: Element) {
  const colorsElement = document.createElement("div");
  colorsElement.className = "set-colors";

  Object.entries(colorsInSet).forEach(([colorName, colorCode]) => {
    const transparent = colorName.startsWith("Trans");
    const circleElement = createColorCircleElement(colorCode, transparent);
    circleElement.title = colorName;
    colorsElement.appendChild(circleElement);
  });

  titleElement.after(colorsElement);
  console.log("Color names", colorsInSet, titleElement);
}

function handleInventoryOptions(addedElementNodes: Element[]) {
  addedElementNodes
    .map((element) => element.querySelector("#inv_options .btn-panel"))
    .filter((element): element is HTMLElement => element !== null)
    .forEach((options) => addOptions(options));
}

function addOptions(options: HTMLElement) {
  const parentDiv = document.createElement("div");
  parentDiv.style.marginTop = "1em";

  const formElement = document.createElement("form");

  const labelElement = document.createElement("label");
  labelElement.className = "switch switch-primary";

  const inputElement = document.createElement("input");
  inputElement.className = "js-switch";
  inputElement.type = "checkbox";
  inputElement.checked = true;
  inputElement.addEventListener("change", (event) => {
    const showColorNames = (event.target as HTMLInputElement).checked;
    settingsSubject.next({ showColorNames });
  });

  const spanSwitchLabel = document.createElement("span");
  spanSwitchLabel.className = "switch-label";
  spanSwitchLabel.dataset["on"] = "YES";
  spanSwitchLabel.dataset["off"] = "NO";

  const spanText = document.createElement("span");
  spanText.textContent = "Show color name?";

  labelElement.appendChild(inputElement);
  labelElement.appendChild(spanSwitchLabel);
  labelElement.appendChild(spanText);

  formElement.appendChild(labelElement);

  parentDiv.appendChild(formElement);

  options.appendChild(parentDiv);
}

function handleParts(addedElementNodes: Element[]) {
  addedElementNodes
    .map((element) => element.querySelectorAll(partSelector))
    .flatMap((elements) => Array.from(elements))
    .filter((element): element is HTMLElement => element !== null)
    .forEach((part) => handlePart(part));
}

function handlePart(part: HTMLElement) {
  const data = part.querySelector(partDataSelector) as HTMLElement | null;
  if (data === null) {
    return;
  }

  addColorName(data);
}

function addColorName(dataElement: HTMLElement) {
  const hasColorNameShown = dataElement.querySelector(".color-name") !== null;
  if (hasColorNameShown) {
    return;
  }

  const colorName = dataElement.dataset["color_name"];
  if (colorName === undefined) {
    return;
  }

  const colorCode = dataElement.dataset["color_hsv"]?.slice(-6);
  if (colorCode) colorsInSet[colorName] = colorCode;

  const textElement = dataElement.querySelector(".part-text");
  if (textElement === null) {
    return;
  }

  appendColorElement(textElement, colorName, colorCode);
}

function appendColorElement(
  parent: Element,
  colorName: string,
  colorCode: string | undefined
) {
  const smallElement = document.createElement("small");
  smallElement.className = "trunc color-name";
  smallElement.title = colorName;
  smallElement.textContent = colorName;

  const transparent = colorName.startsWith("Trans");

  if (colorCode !== undefined) {
    const circleElement = createColorCircleElement(colorCode, transparent);
    smallElement.insertBefore(circleElement, smallElement.firstChild);
  }

  parent.appendChild(smallElement);
}

function createColorCircleElement(colorCode: string, transparent: boolean) {
  const circleElement = document.createElement("span");
  circleElement.className = "color-circle";
  if (transparent) {
    circleElement.className += " transparent";
  }
  circleElement.style.backgroundColor = `#${colorCode}`;
  circleElement.style.border = "1px solid black";
  return circleElement;
}
