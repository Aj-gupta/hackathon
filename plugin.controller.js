import { createRequire } from "module";
import fs from "fs";
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

    let youtubeIndex = url.indexOf("?v=");

    if (youtubeIndex != -1) {
      const YD = new YoutubeMp3Downloader({
        ffmpegPath: ffmpeg,
        outputPath: "./",
        youtubeVideoQuality: "highestaudio",
      });

      const deepgram = new Deepgram(process.env.DEEPGRAM_SECRET);

      YD.download(url.substr(youtubeIndex + 3));

      YD.on("progress", (data) => {
        console.log(data.progress.percentage + "% downloaded");
      });

      YD.on("finished", async (err, video) => {
        if (err) {
          return res.status(400).json({ message: err.message });
        }
        const videoFileName = video.file;
        console.log(`Downloaded ${videoFileName}`);

        const response = await deepgram.transcription.preRecorded(
          {
            buffer: fs.readFileSync(videoFileName),
            mimetype: "audio/mp3",
          },
          { punctuate: true, utterances: true }
        );
        res.writeHead(200, {
          "Content-Type": "text/plain",
          "Content-disposition": "attachment;filename=" + "subtitle.vtt",
          "Content-Length": response.toWebVTT().length,
        });
        fs.unlinkSync(videoFileName);

        return res.end(Buffer.from(response.toWebVTT(), "binary"));
        // return res.json({ message: "success" });
      });

      YD.on("error", (err) => {
        return res.status(400).json({ message: err.message || "error" });
      });
    } else {
      const response = await deepgram.transcription.preRecorded(
        {
          url: url,
        },
        { punctuate: true, utterances: true }
      );
      res.writeHead(200, {
        "Content-Type": "text/plain",
        "Content-disposition": "attachment;filename=" + "subtitle.vtt",
        "Content-Length": response.toWebVTT().length,
      });
      return res.end(Buffer.from(response.toWebVTT(), "binary"));
    }

    // const stream = fs.createWriteStream("output.vtt", { flags: "a" });

    // stream.write(response.toWebVTT());
    // res.writeHead(200, {
    //   "Content-Type": "text/plain",
    //   "Content-disposition": "attachment;filename=" + "subtitle.vtt",
    //   "Content-Length": response.toWebVTT().length,
    // });
    // return res.end(Buffer.from(response.toWebVTT(), "binary"));
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: err.message || "Server error" });
  }
}
