// videoProcessor.js
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';  // Using fs/promises to handle promises in ES Modules
import moment from 'moment'

function printLog(str) {
    const date = moment().format('HH:mm:ss')
    console.log(`[${date}] ${str}`)
}
  
const resizeAndOverlayVideo = (
  inputVideoPath,
  outputVideoPath,
  backgroundImagePath,
  tempOutputPath,
  width = 950,
  height = 1700,
  blurRadius = 10
) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Resize video
      await ffmpeg(inputVideoPath)
        .size(`${width}x${height}`)
        .on('error', (err) => {
          console.error('Error resizing video:', err);
          reject(err);
        })
        .on('end', async () => {
          printLog('INFO: Video resizing completed.');

          // Create a blurred background image
          await ffmpeg(inputVideoPath)
            .videoFilters(`scale=1080:1920,boxblur=${blurRadius}:${blurRadius}`)
            .frames(1)
            .output(backgroundImagePath)
            .on('error', (err) => {
              console.error('Error creating background:', err);
              reject(err);
            })
            .on('end', async () => {
              printLog('INFO: Background created.');

              // Overlay video on the background
              await ffmpeg()
                .input(backgroundImagePath)
                .input(tempOutputPath) // Use the temporary output file as input
                .complexFilter('[0:v][1:v]overlay=(W-w)/2:(H-h)/2[outv]')
                .outputOptions(['-map', '[outv]', '-map', '1:a'])
                .output(outputVideoPath)
                .on('error', (err) => {
                  console.error('Error overlaying video on background:', err);
                  reject(err);
                })
                .on('end', async () => {
                  printLog('INFO: Video with background created.');

                  // Remove the temporary output file
                  await fs.unlink(tempOutputPath);
                  await fs.unlink(backgroundImagePath);

                  resolve(); // Resolve the promise when all processing is complete
                })
                .run();
            })
            .run();
        })
        .save(tempOutputPath); // Save the resized video to the temporary output file
    } catch (error) {
      console.error('Error:', error);
      reject(error);
    }
  });
};

export { resizeAndOverlayVideo };
