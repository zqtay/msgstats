import cheerio from 'cheerio';

type ParsedMsg = {
  time: string;
  sender: string;
  text: string;
  isForwarded: boolean;
};

class Parser {
  // public static MSG_CSV_FILENAME: string = "msg.csv";
  // public static MSG_CSV_DELIMITER: string = ",";

  public static async parseMsg(fileList: FileList, setStatus: ((status: string) => void) | undefined = undefined): Promise<string> {
    let msgDataText: string = "";
    let newLine: string = "";
    let iFileParsed = 0;

    // Telegram chat history
    msgDataText += `app=telegram\n`;

    for (const file of fileList) {
      const msgPage: string = await file.text();
      const $: Function = cheerio.load(msgPage);
      const msgElements = $(".message.default");

      let msg: ParsedMsg | undefined;
      let msgSenderPrev: string = "";

      // Get group name if any
      if (iFileParsed === 0) {
        let groupName = $(".page_header > .content > .text").eq(0).text().trim();
        msgDataText += `groupName=${groupName}\n`;
      }

      for (let iMsgElement = 0; iMsgElement < msgElements.length; iMsgElement++) {
        msg = this.parseMsgElement(msgElements.eq(iMsgElement), msgSenderPrev);
        if (msg !== undefined) {
          // Save sender name of the current message
          msgSenderPrev = msg.sender;

          if (msg.text !== "" && !msg.isForwarded) {
            // Skip messages with empty text, most likely forwarded message or media sharing
            msgDataText += `${newLine}${msg.time},${msg.sender},${msg.text}`;
            if (newLine === "") {
              // New line on second line to avoid having empty last line
              newLine = "\n";
            }
          }
        }
      }

      iFileParsed++;
      if (setStatus !== undefined) {
        setStatus(`parse_${iFileParsed.toString()}`);
      }
    }

    return msgDataText;
  }

  public static async parseStopWords(fileList: FileList, setStatus: ((status: string) => void) | undefined = undefined): Promise<string> {
    let text = "";
    let iFileParsed = 0;
    for (const file of fileList) {
      text += await file.text();
      iFileParsed++;
      if (setStatus !== undefined) {
        setStatus(`parse_${iFileParsed.toString()}`);
      }
    }
    return text;
  }

  // public static getMsgCsvPath(filePath: string): string {
  //     return path.join(filePath, Parser.MSG_CSV_FILENAME);
  // }

  private static parseMsgElement(msgElement: any, msgSenderPrev: string): ParsedMsg | undefined {
    try {
      let msgTime: string = msgElement.find(".date").eq(0).attr("title");
      let msgSender: string = msgElement.find(".from_name").eq(0).text().trim();
      // Workaround for cheerio .text() to preserve line breaks: replace <br> with \n
      let msgTextNode: any = msgElement.find(".text").eq(0);
      let msgText: string = msgTextNode.find("br").replaceWith("\n").end().text();
      msgText = msgText.trim().replaceAll("\n", " ");
      // Is this message a forwarded message?
      let isForwarded: boolean = false;

      msgSender = (msgSender === "") ? msgSenderPrev : msgSender;

      let msgMedia = msgElement.find(".media_wrap .body");
      if (msgMedia.length !== 0) {
        // Get emoji of the sticker
        if (msgMedia.find(".title").eq(0).text().trim() === "Sticker") {
          msgText = msgElement.find(".status").eq(0).text().trim().split(",")[0];
        }
      }

      // Exclude forwarded message and message sent via bot
      if (msgElement.find(".forwarded").length > 0 ||
        msgSender.includes(" via @")) {
        isForwarded = true;
      }

      return { time: msgTime, sender: msgSender, text: msgText, isForwarded: isForwarded };
    }
    catch (e) {
      console.log(msgElement);
    }
    return;
  }

  // private static async getMsgFileList(dirHandle: FileSystemDirectoryHandle): Promise<string[]> {
  //     let fileList: string[] = [];
  //     for await (const entry of dirHandle.values()) {
  //         if (entry.kind !== 'file' && entry.name.startsWith("messages") && entry.name.endsWith(".html")) {
  //             fileList.push(entry.name);
  //         }
  //     }
  //     fileList.sort((a: string, b: string) => {
  //         return parseInt(a.slice(8, -5)) - parseInt(b.slice(8, -5));
  //     });
  //     return fileList;
  // }

  // private static async getStopWordsFileList(dirHandle: FileSystemDirectoryHandle): Promise<string[]> {
  //     let fileList: string[] = [];
  //     for await (const entry of dirHandle.values()) {
  //         if (entry.kind !== 'file' && entry.name.startsWith("stopwords_") && entry.name.endsWith(".txt")) {
  //             fileList.push(entry.name);
  //         }
  //     }
  //     return fileList;
  // }
}

export default Parser;