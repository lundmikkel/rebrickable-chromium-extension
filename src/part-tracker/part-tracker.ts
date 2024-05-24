import { combineLatest, map, of, tap } from "rxjs";
import SyncStorage from "../storage/sync-storage";
import "./part-tracker.scss";
import { Context } from "../context/context";

const storageKey = "part-tracker";

let found = false;
let tapIndex = 0;
const ids: string[] = [];

//#region Fetching set data

type PartCount = {
  partId: number;
  count: number;
};

const client = Context.client;
if (client) {
  const setNumber = getSetNumber();
  if (setNumber) {
    const setPartTotals$ = client.getSetParts(setNumber).pipe(
      map((setParts) => {
        const totalParts = setParts.reduce(
          (sum, part) => sum + part.quantity,
          0
        );
        const totalPartTypes = new Set(
          setParts.map((part) => `${part.partNumber}/${part.color}`)
        ).size;
        return { totalParts, totalPartTypes };
      })
    );

    const partCounts$ = of<PartCount[]>([
      {
        partId: 557513,
        count: 2,
      },
      {
        partId: 792576,
        count: 1,
      },
    ]);

    combineLatest([partCounts$, setPartTotals$])
      .pipe(
        map(([partCounts, totals]) => {
          console.log("A", partCounts);
          console.log("B", totals.totalParts);
          return 0;
        }),
        tap((progress) => {
          console.log("Progress", progress);
        })
      )
      .subscribe();
  }
}

function getSetNumber(): string | undefined {
  const regex = /\/sets\/([^\/]+)/;
  const currentUrl = window.location.href;
  return currentUrl.match(regex)?.[1];
}

//#endregion

async function extendCheckboxes(checkboxes: NodeListOf<HTMLInputElement>) {
  const initialData =
    (await SyncStorage.get<Record<string, number>>(storageKey)) ?? {};
  checkboxes.forEach((checkbox) => {
    const id = getId(checkbox);
    if (id) {
      ids.push(id);
      const count = getPartCount(id);

      addNumericInput(checkbox, id, count);

      if (checkbox.nextElementSibling) {
        checkbox.nextElementSibling.addEventListener("click", () => {
          const value = !checkbox.checked ? count : 0;
          setNumericInput(id, value);
          persistCheckboxData(id, value);
        });
      }

      setCheckboxFromLocalStorage(checkbox, id, initialData[id], count);
    }
  });
}

function setNumericInput(id: string, value: number) {
  const selector = `part-quantity-input-${id}`;
  const input = document.getElementById(selector) as HTMLInputElement | null;
  if (input && value !== undefined) {
    input.value = value.toString();
  }
}

function addNumericInput(
  checkbox: HTMLInputElement,
  id: string,
  count: number
) {
  const input = document.createElement("input");

  input.type = "number";
  input.classList.add("part-quantity-input");
  input.id = `part-quantity-input-${id}`;
  input.min = "0";
  input.max = count.toString();
  input.step = "1";
  input.tabIndex = tapIndex++;

  input.addEventListener("change", () => {
    const value = parseInt(input.value, 10);
    if (value === count) {
      if (!checkbox.checked) checkbox.click();
    } else {
      if (checkbox.checked) checkbox.click();
    }

    persistCheckboxData(id, value);
  });

  checkbox
    .closest(".part-bulk-checkbox")
    ?.insertAdjacentElement("beforeend", input);
}

function getPartCount(id: string): number {
  const selector = `.js-list-part-tile-${id} .js-part-data`;
  const partData = document.querySelector(selector) as HTMLElement | null;
  return partData ? parseInt(partData.dataset.quantity || "0", 10) : 0;
}

function setCheckboxFromLocalStorage(
  checkbox: HTMLInputElement,
  id: string,
  value: any,
  count: number
) {
  value = value === true ? count : value === false ? 0 : value ?? 0;

  if (value === count) {
    checkbox.click();
  }
  setNumericInput(id, value);
}

async function persistCheckboxData(id: string, value: number) {
  const data: Record<string, number> =
    (await SyncStorage.get(storageKey)) ?? {};
  data[id] = value;
  await SyncStorage.set(storageKey, data);
}

function getId(target: HTMLElement): string | null {
  const classList = target.closest('[class*="js-list-part-tile-"]')?.classList;
  if (classList) {
    for (let i = 0; i < classList.length; i++) {
      const className = classList[i];
      if (className.startsWith("js-list-part-tile-")) {
        return className.replace("js-list-part-tile-", "");
      }
    }
  }
  return null;
}

const observer = new MutationObserver(mutationCallback);
observer.observe(document.body, { childList: true, subtree: true });

function mutationCallback(
  mutationsList: MutationRecord[],
  observer: MutationObserver
) {
  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      checkElementExists(observer);
    }
  }

  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement && node.matches(".js-part")) {
          const data = node.querySelector(
            ".js-part-data"
          ) as HTMLElement | null;
          if (data) {
            const colorId = data.dataset.color_id;
            const partHref = (
              data.parentElement?.parentElement as HTMLAnchorElement
            ).href;
            const partUrl = `${partHref}${colorId}/`;

            const divElement = document.createElement("i");
            divElement.className = "part-link fa fa-clipboard";
            const linkElement = document.createElement("a");
            linkElement.href = partUrl;
            linkElement.target = "_blank";
            linkElement.addEventListener("click", (event) => {
              event.preventDefault();
              navigator.clipboard.writeText(partUrl);
            });
            linkElement.appendChild(divElement);
            data.parentElement?.appendChild(linkElement);

            const divElement2 = document.createElement("i");
            divElement2.className = "part-link-2 fa fa-clipboard";
            const linkElement2 = document.createElement("a");
            linkElement2.href = partHref;
            linkElement2.target = "_blank";
            linkElement2.addEventListener("click", (event) => {
              event.preventDefault();
              navigator.clipboard.writeText(partHref);
            });
            linkElement2.appendChild(divElement2);
            data.parentElement?.appendChild(linkElement2);
          }
        }
      });
    }
  }
}

function checkElementExists(observer: MutationObserver) {
  if (found) {
    return;
  }
  const checkboxes = document.querySelectorAll<HTMLInputElement>(
    ".part-bulk-checkbox .js-checkbox-item"
  );
  if (checkboxes.length > 0) {
    found = true;
    observer.disconnect();

    addResetButton();
    extendCheckboxes(checkboxes);
  }
}

function addResetButton() {
  const button = document.createElement("button");
  button.className = "btn btn-sm btn-default btn-toggle";
  button.title = "Reset all checks";
  button.textContent = "Reset checks";

  button.onclick = async () => {
    if (confirm("Want to reset all?")) {
      const data: Record<string, any> =
        (await SyncStorage.get(storageKey)) || {};
      ids.forEach((id) => delete data[id]);
      await SyncStorage.set(storageKey, data);
      location.reload();
    }
  };

  document.querySelector(".js-checklist-mode")?.parentElement?.append(button);
}
