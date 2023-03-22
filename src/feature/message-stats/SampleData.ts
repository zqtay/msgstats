// Sample data generator
class SampleData {
  private static CHARSET = "abcdefghijklmnopqrstuvwxyz";
  private static SYMSET = "!?.,";
  private static WORD_LIST_LEN = 1000;
  private static MAX_WORD_LEN = 10;
  private static MAX_TEXT_LEN = 20;

  // Sample users
  private static userList = ["Avery", "Blair"];
  // 2022-01-01 to 2023-01-01, in ms
  private static dateStart = 1640995200000;
  private static dateEnd = 1672531200000;

  private static genWord = (maxWordLen: number): string => {
    const length = Math.ceil(Math.random() * maxWordLen);
    let word = new Array(length);
    for (let i = 0; i < length; i++) {
      word[i] = this.CHARSET[(Math.floor(Math.random() * 26))];
    }
    return word.join("");
  };

  private static genWordList = (listLen: number): { word: string; freq: number; }[] => {
    let wordList = [];
    let word: string;
    let isWordExist: boolean = false;
    for (let i = 0; i < listLen; i++) {
      do {
        // Is generated word already exist
        const newWord = this.genWord(this.MAX_WORD_LEN);
        isWordExist = wordList.some(v => (v.word === newWord))
        word = newWord;
      } while (isWordExist);
      wordList.push({ word: word, freq: Math.random() });
    }
    return wordList;
  };

  private static getWord = (wordList: { word: string; freq: number; }[]): string => {
    let freq = Math.random();
    let filtered = wordList.filter(w => (w.freq >= freq));
    let word: string;
    if (filtered.length === 0) {
      // No words are qualified, just get a random word
      word = wordList[Math.floor(Math.random() * wordList.length)].word;
    }
    else {
      const index = Math.floor(Math.random() * filtered.length);
      word = filtered[index].word;
    }
    freq = Math.random();
    if (freq > 0.98) {
      word = word.toUpperCase();
    }
    else if (freq > 0.94) {
      word = word[0].toUpperCase() + word.slice(1);
    }
    return word;
  };

  private static genSymbol = (useComma: boolean) => {
    let freq = Math.random();
    let sym = "";
    if (freq > 0.98) {
      sym = this.SYMSET[0];
    }
    else if (freq > 0.96) {
      sym = this.SYMSET[1];
    }
    else if (freq > 0.92) {
      sym = this.SYMSET[2];
    }
    else if (freq > 0.85 && useComma) {
      sym = this.SYMSET[3];
    }
    return sym;
  };

  private static genText = (maxTextLen: number, wordList: { word: string; freq: number; }[]) => {
    const length = Math.ceil(Math.random() * maxTextLen);
    let text = new Array(length);
    for (let i = 0; i < length; i++) {
      text[i] = this.getWord(wordList) + this.genSymbol(true);
    }
    return text.join(" ") + this.genSymbol(false);
  };

  private static genTexts = (textsLen: number) => {
    let texts = [];
    const wordList = this.genWordList(this.WORD_LIST_LEN);
    for (let i = 0; i < textsLen; i++) {
      texts.push(this.genText(this.MAX_TEXT_LEN, wordList));
    }
    return texts;
  };

  public static generate = (app: string, textsLen: number = 1000): string => {
    let msgDataText: string = "";
    if (app === "telegram") {
      const texts = this.genTexts(textsLen);
      const datePeriod = this.dateEnd - this.dateStart;
      let freq: number;
      let user: string;
      let date: any;
      let dateString: string;
      const data = texts.map(text => {
        freq = Math.random();
        user = (freq > 0.5) ? this.userList[0] : this.userList[1];
        date = this.dateStart + Math.floor(Math.random() * datePeriod);
        // 2022-01-02T12:34:56.505Z
        date = (new Date(date)).toISOString().split("T");
        dateString = `${date[1].split(".")[0]} UTC+00:00`;
        date = date[0].split("-");
        // 02.01.2022 12:34:56 UTC+00:00
        dateString = `${date[2]}.${date[1]}.${date[0]} ${dateString}`;
        return `${dateString},${user},${text}`;
      });
      msgDataText = `app=${app}\nmsgTarget=${this.userList[1]}\n${data.join("\n")}`;
    }
    return msgDataText;
  };
}

export default SampleData;