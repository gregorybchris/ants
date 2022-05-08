export enum KeyName {
  SPACE = " ",
  LEFT = "ArrowLeft",
  UP = "ArrowUp",
  RIGHT = "ArrowRight",
  DOWN = "ArrowDown",
  BACKSPACE = "Backspace",
  HYPHEN = "-",
  EQUALS = "=",
  LETTER_P = "p",
  LETTER_S = "s",
}

export default class Keyboard {
  private keyMap: Map<KeyName, boolean> = new Map();
  public static Keys = KeyName;

  constructor(
    onKeyPress: ((keyName: KeyName) => void) | undefined = undefined,
    onKeyRelease: ((keyName: KeyName) => void) | undefined = undefined
  ) {
    window.onkeydown = (keyEvent: KeyboardEvent) => {
      const keyString = keyEvent.key;
      if (Object.values(KeyName).includes(keyString as KeyName)) {
        const keyName = keyString as KeyName;
        if (!this.keyMap.has(keyName)) {
          this.keyMap.set(keyName, true);
          if (onKeyPress) {
            onKeyPress(keyName);
          }
        }
      }
    };

    window.onkeyup = (keyEvent: KeyboardEvent) => {
      const keyString = keyEvent.key;
      if (Object.values(KeyName).includes(keyString as KeyName)) {
        const keyName = keyString as KeyName;
        if (this.keyMap.has(keyName)) {
          this.keyMap.delete(keyName);
          if (onKeyRelease) {
            onKeyRelease(keyName);
          }
        }
      }
    };
  }
}
