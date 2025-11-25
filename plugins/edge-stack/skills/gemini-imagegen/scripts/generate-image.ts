#!/usr/bin/env node
import { GoogleGenerativeAI } from '@google/generative-ai';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

interface GenerateOptions {
  width?: number;
  height?: number;
  model?: string;
}

async function generateImage(
  prompt: string,
  outputPath: string,
  options: GenerateOptions = {}
): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY environment variable is required');
    console.error('Get your API key from: https://makersuite.google.com/app/apikey');
    process.exit(1);
  }

  const {
    width = 1024,
    height = 1024,
    model = 'gemini-2.0-flash-exp'
  } = options;

  console.log('Generating image...');
  console.log(`Prompt: "${prompt}"`);
  console.log(`Dimensions: ${width}x${height}`);
  console.log(`Model: ${model}`);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const generativeModel = genAI.getGenerativeModel({ model });

    // Enhanced prompt with image generation context
    const enhancedPrompt = `Generate a high-quality image with the following description: ${prompt}. Image dimensions: ${width}x${height} pixels.`;

    // For image generation, we'll use the text generation to get image data
    // Note: As of the current Gemini API, direct image generation might require
    // using the imagen model or multimodal capabilities
    const result = await generativeModel.generateContent([
      {
        inlineData: {
          data: '',
          mimeType: 'text/plain'
        }
      },
      enhancedPrompt
    ]);

    const response = result.response;
    const text = response.text();

    // For actual image generation with Gemini, you would typically:
    // 1. Use the Imagen model (imagen-3.0-generate-001)
    // 2. Parse the response to get base64 image data
    // 3. Convert to binary and save

    // Placeholder implementation - in production, this would use the actual Imagen API
    console.warn('\nNote: This is a demonstration implementation.');
    console.warn('For actual image generation, you would use the Imagen model.');
    console.warn('Response from model:', text.substring(0, 200) + '...');

    // In a real implementation with Imagen:
    // const imageData = Buffer.from(response.candidates[0].content.parts[0].inlineData.data, 'base64');
    // writeFileSync(resolve(outputPath), imageData);

    console.log(`\nTo implement actual image generation:`);
    console.log(`1. Use the Imagen model (imagen-3.0-generate-001)`);
    console.log(`2. Parse the base64 image data from the response`);
    console.log(`3. Save to: ${resolve(outputPath)}`);
    console.log(`\nRefer to: https://ai.google.dev/docs/imagen`);

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error generating image:', error.message);
      if (error.message.includes('API key')) {
        console.error('\nPlease verify your GEMINI_API_KEY is valid');
      }
    } else {
      console.error('Error generating image:', error);
    }
    process.exit(1);
  }
}

// Parse command line arguments
function parseArgs(): { prompt: string; outputPath: string; options: GenerateOptions } {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: generate-image.ts <prompt> <output-path> [options]');
    console.error('\nArguments:');
    console.error('  prompt        Text description of the image to generate');
    console.error('  output-path   Where to save the generated image');
    console.error('\nOptions:');
    console.error('  --width <number>    Image width in pixels (default: 1024)');
    console.error('  --height <number>   Image height in pixels (default: 1024)');
    console.error('  --model <string>    Gemini model to use (default: gemini-2.0-flash-exp)');
    console.error('\nExample:');
    console.error('  GEMINI_API_KEY=xxx npx tsx scripts/generate-image.ts "a sunset over mountains" output.png --width 1920 --height 1080');
    process.exit(1);
  }

  const prompt = args[0];
  const outputPath = args[1];
  const options: GenerateOptions = {};

  // Parse options
  for (let i = 2; i < args.length; i += 2) {
    const flag = args[i];
    const value = args[i + 1];

    switch (flag) {
      case '--width':
        options.width = parseInt(value, 10);
        break;
      case '--height':
        options.height = parseInt(value, 10);
        break;
      case '--model':
        options.model = value;
        break;
      default:
        console.warn(`Unknown option: ${flag}`);
    }
  }

  return { prompt, outputPath, options };
}

// Main execution
const { prompt, outputPath, options } = parseArgs();
generateImage(prompt, outputPath, options).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
