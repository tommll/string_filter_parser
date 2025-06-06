import { KeyValueToken } from "../types";

const KEY_VALUE_SEPARATOR = ':';
const GROUP_OPERATOR_OPEN = "'";
const GROUP_OPERATOR_CLOSE = "'";
const SPACE = ' ';

class KeyValueParser {
  private tokens: KeyValueToken[] = [];
  private position = 0;
  private currentTextBuffer: { text: string, pos: number }[] = [];
  private input = '';

  public parse(input: string): KeyValueToken[] {
    // Reset the state
    this.tokens = [];
    this.position = 0;
    this.currentTextBuffer = [];
    this.input = input;

    if (!input || input.trim() === '') {
      return [];
    }

    while (this.position < this.input.length) {
      // Skip any extra spaces between tokens
      if (this.input[this.position] === SPACE) {
        this.position++;
        continue;
      }

      // Check for key-value pairs by looking ahead for a colon
      const colonPos = this.findNextColon();

      if (colonPos !== -1 && this.isKeyValueSeparator(colonPos)) {
        this.flushTextBuffer(); // Flush any pending text before the key-value pair

        const key = this.input.substring(this.position, colonPos).trim();
        this.position = colonPos + 1; // Move past the colon

        // Skip spaces after the colon
        while (this.position < this.input.length && this.input[this.position] === SPACE) {
          this.position++;
        }

        let value: string;

        // Check if value is in quotes (only apply grouping for key-value values)
        if (this.position < this.input.length && this.input[this.position] === GROUP_OPERATOR_OPEN) {
          const result = this.parseParentheses();
          value = result.content;
          this.position = result.endPos;
        } else {
          // Extract value until the next space or end of input
          const valueStartPos = this.position;
          while (this.position < this.input.length
            && this.input[this.position] !== SPACE) {
            this.position++;
          }
          value = this.input.substring(valueStartPos, this.position);
        }

        this.tokens.push({
          type: 'keyValue',
          value: [key, KEY_VALUE_SEPARATOR, value],
        });

        continue;
      }

      // Process regular text token until the next space or start of key-value
      // No special handling for quotes in regular text - treat them as literal characters
      const wordStartPos = this.position;
      while (this.position < this.input.length
        && this.input[this.position] !== SPACE
        && !this.isStartOfKeyValue()) {
        this.position++;
      }

      const word = this.input.substring(wordStartPos, this.position);
      this.currentTextBuffer.push({ text: word, pos: wordStartPos });

      // If we hit a key-value pair, flush the buffer
      if (this.position < this.input.length && this.isStartOfKeyValue()) {
        this.flushTextBuffer();
      }
    }

    // Flush any remaining text
    this.flushTextBuffer();

    return this.tokens;
  }

  /**
   * Flushes the current text buffer into a token if not empty
   */
  private flushTextBuffer(): void {
    if (this.currentTextBuffer.length > 0) {
      // Preserve spaces between words
      const value = this.input.substring(this.currentTextBuffer[0].pos, this.position).trim();

      this.tokens.push({
        type: 'text',
        value,
      });
      this.currentTextBuffer = [];
    }
  }

  private parseParentheses(): { content: string, endPos: number } {
    this.position++; // Skip the opening quote

    let content = '';

    while (this.position < this.input.length) {
      // Handle escaped quotes in content
      if (this.input[this.position] === '\\'
        && this.position + 1 < this.input.length
        && this.input[this.position + 1] === GROUP_OPERATOR_CLOSE) {
        // Include the quote character but skip the escape character
        content += GROUP_OPERATOR_CLOSE;
        this.position += 2;
        continue;
      }

      if (this.input[this.position] === GROUP_OPERATOR_CLOSE) {
        this.position++; // Move past the closing quote
        break;
      }

      content += this.input[this.position];
      this.position++;
    }

    return {
      content,
      endPos: this.position,
    };
  }

  /**
   * Finds the position of the next colon in the input
   * @returns Position of the next colon or -1 if not found
   */
  private findNextColon(): number {
    for (let i = this.position; i < this.input.length; i++) {
      if (this.input[i] === KEY_VALUE_SEPARATOR) {
        return i;
      }
      // Stop at spaces or special characters
      if (this.input[i] === SPACE || this.input[i] === GROUP_OPERATOR_OPEN) {
        return -1;
      }
    }
    return -1;
  }

  /**
   * Determines if a colon at the given position is a key-value separator
   * @param colonPos Position of the colon
   * @returns True if it's a key-value separator
   */
  private isKeyValueSeparator(colonPos: number): boolean {
    // A colon is a key-value separator if:
    // 1. There's text before it (the key)
    // 2. There's no space between the start position and the colon
    return colonPos > this.position && !this.input.substring(this.position, colonPos).includes(SPACE);
  }

  /**
   * Determines if the current position is the start of a key-value pair
   * @returns True if it's the start of a key-value pair
   */
  private isStartOfKeyValue(): boolean {
    const colonPos = this.findNextColon();
    return colonPos !== -1 && this.isKeyValueSeparator(colonPos);
  }
}

export { KeyValueParser };
