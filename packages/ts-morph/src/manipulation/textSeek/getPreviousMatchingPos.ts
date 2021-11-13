// todo: tests
export function getPreviousMatchingPos(text: string, pos: number, condition: (charCode: number) => boolean) {
  while (pos > 0) {
    const charCode = text.charCodeAt(pos - 1);
    if (!condition(charCode))
      pos--;
    else
      break;
  }

  return pos;
}
