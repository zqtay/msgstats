import MsgData from "./MsgData";
import MsgEntry from "./MsgEntry";
import Util from "./Util";

type WordFrequency = { [key: string]: { [key: string]: number; }; };
type HourlyMsgCountByDate = { [key: string]: { [key: string]: { number: number; }; }; };

class MsgStats {
  // (24 * 60 * 60 * 1000) = 86400000
  public static DAY_IN_MILLISECONDS: number = 86400000;

  private msgCount: HourlyMsgCountByDate;

  constructor() {
    this.msgCount = {};
  }

  public init(msgData: MsgData) {
    let res: any = {};

    // temp vars
    let listByUser: MsgEntry[] = [];
    let listByDate: MsgEntry[] = [];

    for (const user of msgData.getUserList()) {
      // Init empty object
      res[user] = {};
      // Get temp list by user
      listByUser = msgData.getEntryList().filter(e => (e.getSender() === user));

      for (const date of msgData.getDateList()) {
        // Init empty object
        res[user][date] = {};
        for (let hour = 0; hour < 24; hour++) {
          res[user][date][hour] = 0;
        }

        // Get temp list by date
        listByDate = listByUser.filter(e => (e.getDate() === date));
        for (const entry of listByDate) {
          res[user][date][entry.getHour()] += 1;
        }
      }
    }
    this.msgCount = res;
  }

  public getDailyMsgCount(msgData: MsgData) {
    const dateList: string[] = msgData.getDateList();
    const startDate: Date = new Date(dateList[0]);
    const endDate: Date = new Date(dateList[dateList.length - 1]);
    let dailyCount: { [key: string]: { [key: string]: number; } } = {};

    msgData.getUserList().forEach(user => dailyCount[user] = {});
    let loop = new Date(startDate);
    while (loop <= endDate) {
      const dateString = loop.toISOString().split("T")[0];
      for (const user of msgData.getUserList()) {
        const hourlyCount = this.msgCount[user][dateString];
        const count = hourlyCount === undefined ? 0 : Object.values(hourlyCount).reduce((a, b) => a + b);
        dailyCount[user][dateString] = count;
      }
      loop = new Date(loop.valueOf() + MsgStats.DAY_IN_MILLISECONDS);
    }
    return dailyCount;
  }

  public getWordFrequency(msgData: MsgData, filter: Function = ((word: string) => true)): WordFrequency {
    let res: any = {};
    let wordList: string[] = [];

    // Init empty object
    msgData.getUserList().forEach(user => {
      res[user] = {};
    });

    for (const entry of msgData.getEntryList()) {
      let user: string = entry.getSender();
      wordList = MsgStats.tokenizeText(entry.getText());

      // console.log(entry.getDateTime());

      for (const word of wordList) {
        // Skip excluded word
        if (!filter(word)) continue;
        // Add count
        if (res[user][word] === undefined) {
          res[user][word] = 1;
        }
        else {
          res[user][word] += 1;
        }
      }
    }
    return res;
  }

  public getMostUsedWords(msgData: MsgData, limit: number = 100, filter: Function = ((word: string) => true)) {
    // {user1: [{word1: freq1}, {word2: freq2}, ...], ...}
    let res: { [key: string]: { [key: string]: number; }[]; } = {};
    let wordFreq = this.getWordFrequency(msgData, filter);

    for (const user of msgData.getUserList()) {
      const sortedWords = Util.sortObjectKeys(wordFreq[user], true, limit);
      res[user] = sortedWords.map(word => ({ [word]: wordFreq[user][word] }));
    }

    return res;
  }

  public getMsgStats(msgData: MsgData) {
    let res: any = {};

    // number of days, inclusive
    const dateList: string[] = msgData.getDateList();
    const startDate: Date = new Date(dateList[0]);
    const endDate: Date = new Date(dateList[dateList.length - 1]);
    const numOfDays = ((endDate.valueOf() - startDate.valueOf()) / MsgStats.DAY_IN_MILLISECONDS) + 1;
    const dailyCount = this.getDailyMsgCount(msgData);

    for (const user of msgData.getUserList()) {
      // Get msg entries from this user
      const entryList: MsgEntry[] = msgData.getEntryList().filter(e => (e.getSender() === user));
      // Get msg count of each day and add to a list
      let msgCountList: number[] = Object.values(dailyCount[user]);
      let charCountList: number[] = entryList.map(e => e.getText().length);

      res[user] = {};
      res[user]["totMsgCount"] = entryList.length;
      res[user]["avgMsgCountPerDay"] = res[user]["totMsgCount"] / numOfDays;
      res[user]["medMsgCountPerDay"] = Util.getMedian(msgCountList);
      res[user]["stdMsgCountPerDay"] = Util.getStandardDeviation(msgCountList);

      let charCount = 0;
      entryList.forEach(e => charCount += e.getText().length);
      res[user]["totCharCount"] = charCount;
      res[user]["avgCharCountPerMsg"] = charCount / res[user]["totMsgCount"];
      res[user]["medCharCountPerMsg"] = Util.getMedian(charCountList);
      res[user]["stdCharCountPerMsg"] = Util.getStandardDeviation(charCountList);
    }
    return res;
  }

  private static tokenizeText(text: string, includeEmoji: boolean = true): string[] {
    // Convert text to lower case and split text to words by spaces
    let tokens = text.toLowerCase().split(/\s+/);

    tokens = tokens.filter(e => {
      // Filter out all URLs
      if (e.startsWith("http://") || e.startsWith("https://") || e.startsWith("www.")) {
        return false;
      }
      // Filter out all words that do not contain alphabets
      else if (e.match(/[a-z]/) === null) {
        return false;
      }
      return true;
    });

    // Remove leading and trailing symbols/punctuations
    tokens = tokens.map(e => {
      let s = e.split(/\W+/);
      if (s.length === 2) {
        // Leading symbols
        if (s[0] === "" && s[1] !== "") {
          return s[1];
        }
        // Trailing symbols
        else if (s[0] !== "" && s[1] === "") {
          return s[0];
        }
      }
      else if (s.length === 3) {
        // Both
        if (s[0] === "" && s[1] !== "" && s[2] === "") {
          return s[1];
        }
      }
      return e;
    });

    // Add back emoji
    // https://stackoverflow.com/questions/43242440/javascript-regular-expression-for-unicode-emoji/45138005
    // https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5B%3AExtended_Pictographic%3A%5D
    if (includeEmoji) {
      let emojis = text.match(/\p{Extended_Pictographic}/ug);
      if (emojis !== null && emojis.length !== 0) {
        tokens = tokens.concat(emojis);
      }
    }

    return tokens;
  }
}

export default MsgStats;