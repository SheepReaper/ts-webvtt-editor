export const isInputElement = (
  element: HTMLElement | EventTarget
): element is HTMLInputElement => {
  return (element as HTMLInputElement).files !== undefined;
};
