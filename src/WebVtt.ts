import { Caption } from "./Caption";
import { Result } from "./Result";
import { TimeStamp } from "./TimeStamp";

export class WebVtt {
  static parseString(data: string): Result<Caption[]> {
    const lines = data.split(/\r?\n/);

    const captions: Caption[] = [];
    let currentCaption: Caption | null = null;

    for (const line of lines) {
      // console.log(line)
      if (
        line.match(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-[0-9]+$/,
        )
      ) {
        console.log("match");
        if (currentCaption) {
          captions.push(currentCaption);
        }
        currentCaption = {
          id: line,
          startTime: new TimeStamp(),
          endTime: new TimeStamp(),
          text: "",
        };
      } else if (line.includes("-->")) {
        const [startTime, endTime] = line.split(" --> ");
        if (currentCaption) {
          currentCaption.startTime = TimeStamp.fromString(startTime.trim());
          currentCaption.endTime = TimeStamp.fromString(endTime.trim());
        }
      } else if (line.trim() !== "" && currentCaption) {
        currentCaption.text += line.trim() + " ";
      }
    }

    if (currentCaption) {
      captions.push(currentCaption);
    }

    return new Result<Caption[]>(true, captions);
  }

  static parseJsonString(fileString: string): Result<Caption[]> {
    const { length, data } = JSON.parse(fileString, TimeStamp.reviver);
    return new Result<Caption[]>(true, data);
  }

  static getReader(
    parserFn: (data: string) => Result<Caption[]>,
    callbackFn?: (result: Result<Caption[]>) => void,
  ) {
    const reader = new FileReader();

    reader.addEventListener("load", ({ target: { result } }) => {
      console.time("parseFileAndRender");

      // TODO: support non-string data?
      if (typeof result !== "string") return;

      const parseResult = parserFn(result);

      // if (parseResult.isSuccess) data = parseResult.value;

      if (callbackFn) callbackFn(parseResult);

      console.timeEnd("parseFileAndRender");
    });

    return reader;
  }

  static getJsonReader(callbackFn?: (result: Result<Caption[]>) => void) {
    return WebVtt.getReader(WebVtt.parseJsonString, callbackFn);
  }

  static getTextReader(callbackFn?: (result: Result<Caption[]>) => void) {
    return WebVtt.getReader(WebVtt.parseString, callbackFn);
  }
}
