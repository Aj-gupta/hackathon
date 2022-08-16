import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { Deepgram } = require("@deepgram/sdk");
const YoutubeMp3Downloader = require("youtube-mp3-downloader");
const ffmpeg = require("ffmpeg-static");

export async function getSubtitle(req, res) {
  try {
    let url = req.query.url;
    if (!url) {
      return res.status(400).json({ message: "url is not defined" });
    }
    if (url.indexOf("youtube.com") != -1) {
      console.log("youtube url");
    }
    const YD = new YoutubeMp3Downloader({
      ffmpegPath: ffmpeg,
      outputPath: "./",
      youtubeVideoQuality: "highestaudio",
    });

    const deepgram = new Deepgram(process.env.DEEPGRAM_SECRET);
    const response = await deepgram.transcription.preRecorded(
      {
        url: req.query.url,
      },
      { punctuate: true, utterances: true }
    );

    // const stream = fs.createWriteStream("output.vtt", { flags: "a" });

    // stream.write(response.toWebVTT());
    // res.writeHead(200, {
    //   "Content-Type": "text/plain",
    //   "Content-disposition": "attachment;filename=" + "subtitle.vtt",
    //   "Content-Length": response.toWebVTT().length,
    // });
    // return res.end(Buffer.from(response.toWebVTT(), "binary"));
    return res.json({ message: "success" });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: err.message });
  }
}
