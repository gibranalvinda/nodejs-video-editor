// main.js
import { resizeAndOverlayVideo } from './lib/videoProcessor.js';
import { TiktokDL } from './lib/tiktokApi.js'
import axios from 'axios'
import ProgressBar from 'progress'
import chalk from 'chalk'
import path from 'path'
import fs from 'fs'


try {
    const url = "https://www.tiktok.com/@kak_onyot/video/7019153718071332122" // ==> url tiktok yang mau di download
    const result = await TiktokDL(url) // ==> fungsi buat download vidio tiktok
    const video = result.result.video[0]
    const namafile = result.result.id
    const caption = result.result.description
    if (fs.existsSync(path.resolve('download', `${namafile}.mp4`))) {
      console.log(`[ ${chalk.hex('#f12711')(namafile)} already downloaded! ] ===== [${chalk.hex('#7F7FD5')('skipped')}]`);
    } else {
      await axios({
        url: video,
        method: 'GET',
        responseType: 'stream'
      }).then(async ({ data, headers }) => {
        if (!fs.existsSync('download')) fs.mkdirSync('download')
          const totalLength = headers['content-length']
            const progressBar = new ProgressBar(`[ ${chalk.hex('#ffff1c')("Proses Download")} ] [${chalk.hex('#6be585')(':bar')}] :percent downloaded in :elapseds`, {
              width: 40,
              complete: '<',
              incomplete: '•',
              renderThrottle: 1,
              total: parseInt(totalLength)
            })
            data.on('data', (chunk) => {
              progressBar.tick(chunk.length)
            })
            const writer = fs.createWriteStream(path.resolve('download', `${namafile}.mp4`))
            data.pipe(writer)
            
            const inputVideoPath = path.resolve('download', `${namafile}.mp4`);
            if (!fs.existsSync('video_jadi')) fs.mkdirSync('video_jadi')
            const outputVideoPath = path.resolve('video_jadi', `${namafile}.mp4`);
            const backgroundImagePath = 'background.jpg';
            const tempOutputPath = 'temp_output.mp4';
            
            resizeAndOverlayVideo(
              inputVideoPath,
              outputVideoPath,
              backgroundImagePath,
              tempOutputPath
            );
  
            // data.on('end', async () => {
            //   await ReelsUpload(namafile, caption) // ==> ini function buat upload ke reels fb via puppeteer
            // })
      })
    }
  } catch (err) {
    console.log(err)
  }

// const inputVideoPath = 'input.mp4';
// const outputVideoPath = 'output.mp4';
// const backgroundImagePath = 'background.jpg';
// const tempOutputPath = 'temp_output.mp4';

// resizeAndOverlayVideo(
//   inputVideoPath,
//   outputVideoPath,
//   backgroundImagePath,
//   tempOutputPath
// );
