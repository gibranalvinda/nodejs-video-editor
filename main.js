// main.js

// Import necessary modules and libraries
import { resizeAndOverlayVideo } from './lib/videoProcessor.js';
import { TiktokDL } from './lib/tiktokApi.js';
import axios from 'axios'; // Library for making HTTP requests
import ProgressBar from 'progress'; // Library for displaying progress bars in the console
import chalk from 'chalk'; // Library for adding color to console output
import path from 'path'; // Module for working with file paths
import fs from 'fs'; // Module for file system operations

// Read TikTok video URLs from a file
const urlsFilePath = 'url.txt';
const urls = fs.readFileSync(urlsFilePath, 'utf-8').split('\n').filter(url => url.trim() !== '');

async function downloadAndProcessVideos() {
    // Loop through each TikTok video URL
    for (const url of urls) {
      try {
        // Fetch TikTok video details using the TiktokDL function
        const result = await TiktokDL(url);
        const video = result.result.video[0];
        const namafile = result.result.id;
  
        // Check if the video is already downloaded
        if (fs.existsSync(path.resolve('download', `${namafile}.mp4`))) {
          console.log(`[ ${chalk.hex('#f12711')(namafile)} already downloaded! ] ===== [${chalk.hex('#7F7FD5')('skipped')}]`);
        } else {
          // Download the video using Axios and display a progress bar
          const { data, headers } = await axios({
            url: video,
            method: 'GET',
            responseType: 'stream'
          });
  
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
  
          // Wait for the video download to finish
          await new Promise((resolve) => {
            writer.on('finish', resolve);
          });
  
          // Define paths and call the video processing function
          const inputVideoPath = path.resolve('download', `${namafile}.mp4`);
          if (!fs.existsSync('video_jadi')) fs.mkdirSync('video_jadi');
  
          const outputVideoPath = path.resolve('video_jadi', `${namafile}.mp4`);
          const backgroundImagePath = 'background.jpg';
          const tempOutputPath = 'temp_output.mp4';
  
          // Call the video processing function
          resizeAndOverlayVideo(
            inputVideoPath,
            outputVideoPath,
            backgroundImagePath,
            tempOutputPath
          );
        }
      } catch (err) {
        // Log any errors that occur during script execution
        console.log(err);
      }
    }
  }
  
// Call the function to start the process
downloadAndProcessVideos();
