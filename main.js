// main.js

// Import necessary modules and libraries
import { resizeAndOverlayVideo } from './lib/videoProcessor.js';
import { TiktokDL } from './lib/tiktokApi.js';
import axios from 'axios';
import ProgressBar from 'progress';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';

try {
    // Specify the TikTok video URL to be downloaded
    const url = "https://www.tiktok.com/@kak_onyot/video/7019153718071332122";

    // Call TiktokDL function to download TikTok video
    const result = await TiktokDL(url);
    const video = result.result.video[0];
    const namafile = result.result.id;
    const caption = result.result.description;

    // Check if the video is already downloaded
    if (fs.existsSync(path.resolve('download', `${namafile}.mp4`))) {
        console.log(`[ ${chalk.hex('#f12711')(namafile)} already downloaded! ] ===== [${chalk.hex('#7F7FD5')('skipped')}]`);
    } else {
        // Download the video using Axios and display a progress bar
        await axios({
            url: video,
            method: 'GET',
            responseType: 'stream'
        }).then(async ({ data, headers }) => {
            // Create the 'download' directory if it doesn't exist
            if (!fs.existsSync('download')) fs.mkdirSync('download');

            // Set up a progress bar for download visualization
            const totalLength = headers['content-length'];
            const progressBar = new ProgressBar(`[ ${chalk.hex('#ffff1c')("Proses Download")} ] [${chalk.hex('#6be585')(':bar')}] :percent downloaded in :elapseds`, {
                width: 40,
                complete: '<',
                incomplete: '•',
                renderThrottle: 1,
                total: parseInt(totalLength)
            });

            // Update progress bar as data is received
            data.on('data', (chunk) => {
                progressBar.tick(chunk.length);
            });

            // Create a write stream and save the video file
            const writer = fs.createWriteStream(path.resolve('download', `${namafile}.mp4`));
            data.pipe(writer);

            // Define paths and call the video processing function
            const inputVideoPath = path.resolve('download', `${namafile}.mp4`);
            if (!fs.existsSync('video_jadi')) fs.mkdirSync('video_jadi');
            const outputVideoPath = path.resolve('video_jadi', `${namafile}.mp4`);
            const backgroundImagePath = 'background.jpg';
            const tempOutputPath = 'temp_output.mp4';

            resizeAndOverlayVideo(
                inputVideoPath,
                outputVideoPath,
                backgroundImagePath,
                tempOutputPath
            );
        });
    }
} catch (err) {
    // Log any errors that occur during script execution
    console.log(err);
}
