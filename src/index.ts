import { isInputElement } from "./utils";
import { Caption } from "./Caption";
import { Result } from "./Result";
import { TimeStamp } from "./TimeStamp";
import { WebVtt } from "./WebVtt";

const createBlob = (data: Caption[]) => {
  return new Blob(
    [JSON.stringify({ length: data.length, data }, TimeStamp.replacer, 2)],
    {
      type: "application/json",
    },
  );
};

const setDownloadLink = (blob: Blob) => {
  (document.getElementById("downloadLink") as HTMLAnchorElement).href =
    URL.createObjectURL(blob);
};

const renderCaption = (caption: Caption, parent?: HTMLElement) => {
  const divCaption = document.createElement("div");

  const idEl = document.createElement("p");
  idEl.innerText = caption.id;
  divCaption.appendChild(idEl);

  const intervalEl = document.createElement("p");
  intervalEl.innerText = `${caption.startTime} --> ${caption.endTime}`;
  divCaption.appendChild(intervalEl);

  const textEl = document.createElement("p");
  textEl.innerText = caption.text;
  divCaption.appendChild(textEl);

  if (parent) parent.appendChild(divCaption);

  return divCaption;
};

const renderFn = (result: Result<Caption[]>) => {
  if (result.isFailure) return;

  console.time("justRenderFn");

  setDownloadLink(createBlob(result.value));

  const parent = document.getElementById("recordContainer");

  result.value.forEach((caption) => renderCaption(caption, parent));

  console.timeEnd("justRenderFn");
};

const configureEvents = () => {
  document
    .getElementById("fileInput")
    .addEventListener("change", ({ target }: InputEvent) => {
      console.time("handleInputChange");
      if (!isInputElement(target) || target.files.length !== 1) return;

      const file = target.files[0];

      if (!file) return;

      const fileType = file.type;
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      if (fileType === "application/json" || fileExtension === "json") {
        WebVtt.getJsonReader(renderFn).readAsText(file, "utf8");
      } else if (fileType === "text/vtt" || fileExtension === "vtt") {
        WebVtt.getTextReader(renderFn).readAsText(file, "utf8");
      } else {
        console.error("Unsupported file was loaded.");
      }
      console.timeEnd("handleInputChange");
    });
};

const main = () => {
  configureEvents();
};

main();
