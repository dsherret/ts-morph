// todo: tests
export function getNextMatchingPos(text: string, pos: number, condition: (charCode: number) => boolean) {
  while (pos < text.length) {
    const charCode = text.charCodeAt(pos);
    if (!condition(charCode))
      pos++;
    else
      break;
  }

  return pos;
}
