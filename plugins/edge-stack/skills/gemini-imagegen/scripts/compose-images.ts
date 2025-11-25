#!/usr/bin/env node
import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

interface ComposeOptions {
  layout?: 'horizontal' | 'vertical' | 'grid' | 'custom';
  prompt?: string;
  width?: number;
  height?: number;
  model?: string;
}

async function composeImages(
  outputPath: string,
  imagePaths: string[],
  options: ComposeOptions = {}
): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY environment variable is required');
    console.error('Get your API key from: https://makersuite.google.com/app/apikey');
    process.exit(1);
  }

  if (imagePaths.length < 2) {
    console.error('Error: At least 2 images are required for composition');
    process.exit(1);
  }

  if (imagePaths.length > 4) {
    console.error('Error: Maximum 4 images supported for composition');
    process.exit(1);
  }

  // Verify all images exist
  const resolvedPaths: string[] = [];
  for (const imagePath of imagePaths) {
    const resolvedPath = resolve(imagePath);
    if (!existsSync(resolvedPath)) {
      console.error(`Error: Image not found: ${resolvedPath}`);
      process.exit(1);
    }
    resolvedPaths.push(resolvedPath);
  }

  const {
    layout = 'grid',
    prompt = '',
    width,
    height,
    model = 'gemini-2.0-flash-exp'
  } = options;

  console.log('Composing images...');
  console.log(`Images: ${resolvedPaths.length}`);
  console.log(`Layout: ${layout}`);
  console.log(`Model: ${model}`);
  if (prompt) console.log(`Custom prompt: "${prompt}"`);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const generativeModel = genAI.getGenerativeModel({ model });

    // Read and encode all images
    const imageDataList: Array<{ data: string; mimeType: string; path: string }> = [];

    for (const imagePath of resolvedPaths) {
      const imageData = readFileSync(imagePath);
      const base64Image = imageData.toString('base64');
      const mimeType = getMimeType(imagePath);

      imageDataList.push({
        data: base64Image,
        mimeType,
        path: imagePath
      });

      console.log(`Loaded: ${imagePath} (${(imageData.length / 1024).toFixed(2)} KB)`);
    }

    // Build composition prompt
    let compositionPrompt = `You are an image composition assistant. Analyze these ${imageDataList.length} images and describe how to combine them into a single composition using a ${layout} layout.`;

    if (width && height) {
      compositionPrompt += ` The output should be ${width}x${height} pixels.`;
    }

    if (prompt) {
      compositionPrompt += ` Additional instructions: ${prompt}`;
    }

    compositionPrompt += '\n\nProvide detailed instructions for:\n';
    compositionPrompt += '1. Optimal arrangement of images\n';
    compositionPrompt += '2. Sizing and spacing recommendations\n';
    compositionPrompt += '3. Any blending or transition effects\n';
    compositionPrompt += '4. Color harmony adjustments';

    // Prepare content parts with all images
    const contentParts: Array<any> = [];

    for (const imageData of imageDataList) {
      contentParts.push({
        inlineData: {
          data: imageData.data,
          mimeType: imageData.mimeType
        }
      });
    }

    contentParts.push(compositionPrompt);

    // Analyze the composition
    const result = await generativeModel.generateContent(contentParts);
    const response = result.response;
    const compositionInstructions = response.text();

    console.log('\nComposition Analysis:');
    console.log(compositionInstructions);

    // For actual image composition with Gemini, you would typically:
    // 1. Use an image composition/editing model
    // 2. Send all source images with layout instructions
    // 3. Receive the composed image as base64
    // 4. Save to output path

    console.warn('\nNote: This is a demonstration implementation.');
    console.warn('For actual image composition, you would use specialized image composition APIs.');
    console.warn('The model has analyzed the images and provided composition instructions.');

    // Calculate suggested dimensions based on layout
    const suggestedDimensions = calculateDimensions(layout, imageDataList.length, width, height);
    console.log(`\nSuggested output dimensions: ${suggestedDimensions.width}x${suggestedDimensions.height}`);

    // In a real implementation:
    // const composedImageData = Buffer.from(response.candidates[0].content.parts[0].inlineData.data, 'base64');
    // writeFileSync(resolve(outputPath), composedImageData);

    console.log(`\nTo implement actual image composition:`);
    console.log(`1. Use an image composition library or service`);
    console.log(`2. Apply the ${layout} layout with ${imageDataList.length} images`);
    console.log(`3. Follow the composition instructions provided above`);
    console.log(`4. Save to: ${resolve(outputPath)}`);

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error composing images:', error.message);
      if (error.message.includes('API key')) {
        console.error('\nPlease verify your GEMINI_API_KEY is valid');
      }
    } else {
      console.error('Error composing images:', error);
    }
    process.exit(1);
  }
}

function getMimeType(filePath: string): string {
  const extension = filePath.toLowerCase().split('.').pop();
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'bmp': 'image/bmp'
  };
  return mimeTypes[extension || ''] || 'image/jpeg';
}

function calculateDimensions(
  layout: string,
  imageCount: number,
  width?: number,
  height?: number
): { width: number; height: number } {
  // If dimensions are provided, use them
  if (width && height) {
    return { width, height };
  }

  // Default image size assumption
  const defaultSize = 1024;

  switch (layout) {
    case 'horizontal':
      return {
        width: width || defaultSize * imageCount,
        height: height || defaultSize
      };
    case 'vertical':
      return {
        width: width || defaultSize,
        height: height || defaultSize * imageCount
      };
    case 'grid':
      const cols = Math.ceil(Math.sqrt(imageCount));
      const rows = Math.ceil(imageCount / cols);
      return {
        width: width || defaultSize * cols,
        height: height || defaultSize * rows
      };
    case 'custom':
    default:
      return {
        width: width || defaultSize,
        height: height || defaultSize
      };
  }
}

// Parse command line arguments
function parseArgs(): { outputPath: string; imagePaths: string[]; options: ComposeOptions } {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error('Usage: compose-images.ts <output-path> <image1> <image2> [image3...] [options]');
    console.error('\nArguments:');
    console.error('  output-path  Where to save the composed image');
    console.error('  image1-4     Paths to images to combine (2-4 images)');
    console.error('\nOptions:');
    console.error('  --layout <string>   Layout pattern (horizontal|vertical|grid|custom) (default: grid)');
    console.error('  --prompt <string>   Additional composition instructions');
    console.error('  --width <number>    Output width in pixels (default: auto)');
    console.error('  --height <number>   Output height in pixels (default: auto)');
    console.error('  --model <string>    Gemini model to use (default: gemini-2.0-flash-exp)');
    console.error('\nExample:');
    console.error('  GEMINI_API_KEY=xxx npx tsx scripts/compose-images.ts collage.png img1.jpg img2.jpg img3.jpg --layout grid');
    process.exit(1);
  }

  const outputPath = args[0];
  const imagePaths: string[] = [];
  const options: ComposeOptions = {};

  // Parse image paths and options
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--')) {
      const flag = arg;
      const value = args[i + 1];

      switch (flag) {
        case '--layout':
          if (['horizontal', 'vertical', 'grid', 'custom'].includes(value)) {
            options.layout = value as ComposeOptions['layout'];
          } else {
            console.warn(`Invalid layout: ${value}. Using default: grid`);
          }
          i++;
          break;
        case '--prompt':
          options.prompt = value;
          i++;
          break;
        case '--width':
          options.width = parseInt(value, 10);
          i++;
          break;
        case '--height':
          options.height = parseInt(value, 10);
          i++;
          break;
        case '--model':
          options.model = value;
          i++;
          break;
        default:
          console.warn(`Unknown option: ${flag}`);
          i++;
      }
    } else {
      imagePaths.push(arg);
    }
  }

  return { outputPath, imagePaths, options };
}

// Main execution
const { outputPath, imagePaths, options } = parseArgs();
composeImages(outputPath, imagePaths, options).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
