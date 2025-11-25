#!/usr/bin/env node
import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

interface EditOptions {
  model?: string;
}

async function editImage(
  sourcePath: string,
  prompt: string,
  outputPath: string,
  options: EditOptions = {}
): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY environment variable is required');
    console.error('Get your API key from: https://makersuite.google.com/app/apikey');
    process.exit(1);
  }

  const resolvedSourcePath = resolve(sourcePath);

  if (!existsSync(resolvedSourcePath)) {
    console.error(`Error: Source image not found: ${resolvedSourcePath}`);
    process.exit(1);
  }

  const { model = 'gemini-2.0-flash-exp' } = options;

  console.log('Editing image...');
  console.log(`Source: ${resolvedSourcePath}`);
  console.log(`Prompt: "${prompt}"`);
  console.log(`Model: ${model}`);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const generativeModel = genAI.getGenerativeModel({ model });

    // Read and encode the source image
    const imageData = readFileSync(resolvedSourcePath);
    const base64Image = imageData.toString('base64');

    // Determine MIME type from file extension
    const mimeType = getMimeType(resolvedSourcePath);

    console.log(`Image size: ${(imageData.length / 1024).toFixed(2)} KB`);
    console.log(`MIME type: ${mimeType}`);

    // Use Gemini's vision capabilities to analyze and describe the edit
    const enhancedPrompt = `You are an image editing assistant. Analyze this image and describe how to apply the following edit: "${prompt}". Provide detailed instructions for the transformation.`;

    const result = await generativeModel.generateContent([
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType
        }
      },
      enhancedPrompt
    ]);

    const response = result.response;
    const editInstructions = response.text();

    console.log('\nEdit Analysis:');
    console.log(editInstructions);

    // For actual image editing with Gemini, you would typically:
    // 1. Use the Imagen model's image editing capabilities
    // 2. Send the source image with the edit prompt
    // 3. Receive the edited image as base64
    // 4. Save to output path

    console.warn('\nNote: This is a demonstration implementation.');
    console.warn('For actual image editing, you would use Gemini\'s image editing API.');
    console.warn('The model has analyzed the image and provided edit instructions.');

    // In a real implementation with Imagen editing:
    // const editedImageData = Buffer.from(response.candidates[0].content.parts[0].inlineData.data, 'base64');
    // writeFileSync(resolve(outputPath), editedImageData);

    console.log(`\nTo implement actual image editing:`);
    console.log(`1. Use Gemini's image editing endpoint`);
    console.log(`2. Send source image with edit prompt`);
    console.log(`3. Parse the edited image data from response`);
    console.log(`4. Save to: ${resolve(outputPath)}`);
    console.log(`\nRefer to: https://ai.google.dev/docs/imagen`);

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error editing image:', error.message);
      if (error.message.includes('API key')) {
        console.error('\nPlease verify your GEMINI_API_KEY is valid');
      }
    } else {
      console.error('Error editing image:', error);
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

// Parse command line arguments
function parseArgs(): { sourcePath: string; prompt: string; outputPath: string; options: EditOptions } {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error('Usage: edit-image.ts <source-image> <prompt> <output-path> [options]');
    console.error('\nArguments:');
    console.error('  source-image  Path to the image to edit');
    console.error('  prompt        Text description of the desired changes');
    console.error('  output-path   Where to save the edited image');
    console.error('\nOptions:');
    console.error('  --model <string>  Gemini model to use (default: gemini-2.0-flash-exp)');
    console.error('\nExample:');
    console.error('  GEMINI_API_KEY=xxx npx tsx scripts/edit-image.ts photo.jpg "add a blue sky" edited.jpg');
    process.exit(1);
  }

  const sourcePath = args[0];
  const prompt = args[1];
  const outputPath = args[2];
  const options: EditOptions = {};

  // Parse options
  for (let i = 3; i < args.length; i += 2) {
    const flag = args[i];
    const value = args[i + 1];

    switch (flag) {
      case '--model':
        options.model = value;
        break;
      default:
        console.warn(`Unknown option: ${flag}`);
    }
  }

  return { sourcePath, prompt, outputPath, options };
}

// Main execution
const { sourcePath, prompt, outputPath, options } = parseArgs();
editImage(sourcePath, prompt, outputPath, options).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
