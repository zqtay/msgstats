class StopWords {
  public static FILENAME_PATTERN: string = "stopwords_";

  private wordList: string[];

  public constructor() {
    this.wordList = [];
  }

  public async init(stopWordsText: string): Promise<void> {
    this.wordList = [];
    try {
      this.wordList.push(...stopWordsText.split("\r\n"));
    }
    catch (e) {
      console.error(e);
      this.clear();
      throw e;
    }
  }

  public check(word: string): boolean {
    // Return true if word not included in stopwords list
    return !(this.wordList.includes(word));
  }

  public clear(): void {
    this.wordList = [];
  }
}

export default StopWords;