---
name: gemini-imagegen
description: Generate, edit, and compose images using Google's Gemini AI API for design workflows and visual content creation
triggers: ["image generation", "visual content", "AI art", "image editing", "design automation"]
---

# Gemini ImageGen SKILL

## Overview

This skill provides image generation and manipulation capabilities using Google's Gemini AI API. It's designed for local development workflows where you need to create or modify images using AI assistance.

## Features

- **Generate Images**: Create images from text descriptions
- **Edit Images**: Modify existing images based on text prompts
- **Compose Images**: Combine multiple images with layout instructions
- **Multiple Formats**: Support for PNG, JPEG, and other common image formats
- **Size Options**: Flexible output dimensions for different use cases

## Environment Setup

This skill requires a Gemini API key:

```bash
export GEMINI_API_KEY="your-api-key-here"
```

Get your API key from: https://makersuite.google.com/app/apikey

## Available Scripts

### 1. Generate Image (`scripts/generate-image.ts`)

Create new images from text descriptions.

**Usage:**
```bash
npx tsx scripts/generate-image.ts <prompt> <output-path> [options]
```

**Arguments:**
- `prompt`: Text description of the image to generate
- `output-path`: Where to save the generated image (e.g., `./output.png`)

**Options:**
- `--width <number>`: Image width in pixels (default: 1024)
- `--height <number>`: Image height in pixels (default: 1024)
- `--model <string>`: Gemini model to use (default: 'gemini-2.0-flash-exp')

**Examples:**
```bash
# Basic usage
GEMINI_API_KEY=xxx npx tsx scripts/generate-image.ts "a sunset over mountains" output.png

# Custom size
npx tsx scripts/generate-image.ts "modern office workspace" office.png --width 1920 --height 1080

# Using npm script
npm run generate "futuristic city skyline" city.png
```

### 2. Edit Image (`scripts/edit-image.ts`)

Modify existing images based on text instructions.

**Usage:**
```bash
npx tsx scripts/edit-image.ts <source-image> <prompt> <output-path> [options]
```

**Arguments:**
- `source-image`: Path to the image to edit
- `prompt`: Text description of the desired changes
- `output-path`: Where to save the edited image

**Options:**
- `--model <string>`: Gemini model to use (default: 'gemini-2.0-flash-exp')

**Examples:**
```bash
# Basic editing
GEMINI_API_KEY=xxx npx tsx scripts/edit-image.ts photo.jpg "add a blue sky" edited.jpg

# Style transfer
npx tsx scripts/edit-image.ts portrait.png "make it look like a watercolor painting" artistic.png

# Using npm script
npm run edit photo.jpg "remove background" no-bg.png
```

### 3. Compose Images (`scripts/compose-images.ts`)

Combine multiple images into a single composition.

**Usage:**
```bash
npx tsx scripts/compose-images.ts <output-path> <image1> <image2> [image3...] [options]
```

**Arguments:**
- `output-path`: Where to save the composed image
- `image1, image2, ...`: Paths to images to combine (2-4 images)

**Options:**
- `--layout <string>`: Layout pattern (horizontal, vertical, grid, custom) (default: 'grid')
- `--prompt <string>`: Additional instructions for composition
- `--width <number>`: Output width in pixels (default: auto)
- `--height <number>`: Output height in pixels (default: auto)

**Examples:**
```bash
# Grid layout
GEMINI_API_KEY=xxx npx tsx scripts/compose-images.ts collage.png img1.jpg img2.jpg img3.jpg img4.jpg

# Horizontal layout
npx tsx scripts/compose-images.ts banner.png left.png right.png --layout horizontal

# Custom composition with prompt
npx tsx scripts/compose-images.ts result.png a.jpg b.jpg --prompt "blend seamlessly with gradient transition"

# Using npm script
npm run compose output.png photo1.jpg photo2.jpg photo3.jpg --layout vertical
```

## NPM Scripts

The package.json includes convenient npm scripts:

```bash
npm run generate <prompt> <output>     # Generate image from prompt
npm run edit <source> <prompt> <output> # Edit existing image
npm run compose <output> <images...>    # Compose multiple images
```

## Installation

From the skill directory:

```bash
npm install
```

This installs:
- `@google/generative-ai`: Google's Gemini API SDK
- `tsx`: TypeScript execution runtime
- `typescript`: TypeScript compiler

## Usage in Design Workflows

### Creating Marketing Assets
```bash
# Generate hero image
npm run generate "modern tech startup hero image, clean, professional" hero.png --width 1920 --height 1080

# Create variations
npm run edit hero.png "change color scheme to blue and green" hero-variant.png

# Compose for social media
npm run compose social-post.png hero.png logo.png --layout horizontal
```

### Rapid Prototyping
```bash
# Generate UI mockup
npm run generate "mobile app login screen, minimalist design" mockup.png --width 375 --height 812

# Iterate on design
npm run edit mockup.png "add a gradient background" mockup-v2.png
```

### Content Creation
```bash
# Generate illustrations
npm run generate "technical diagram of cloud architecture" diagram.png

# Create composite images
npm run compose infographic.png chart1.png chart2.png diagram.png --layout vertical
```

## Technical Details

### Image Generation
- Uses Gemini's imagen-3.0-generate-001 model
- Supports text-to-image generation
- Configurable output dimensions
- Automatic format detection from file extension

### Image Editing
- Uses Gemini's vision capabilities
- Applies transformations based on natural language
- Preserves original image quality where possible
- Supports various editing operations (style, objects, colors, etc.)

### Image Composition
- Intelligent layout algorithms
- Automatic sizing and spacing
- Seamless blending options
- Support for multiple composition patterns

## Error Handling

Common errors and solutions:

1. **Missing API Key**: Ensure `GEMINI_API_KEY` environment variable is set
2. **Invalid Image Format**: Use supported formats (PNG, JPEG, WebP)
3. **File Not Found**: Verify source image paths are correct
4. **API Rate Limits**: Implement delays between requests if needed
5. **Large File Sizes**: Compress images before editing/composing

## Limitations

- API rate limits apply based on your Gemini API tier
- Generated images are subject to Gemini's content policies
- Maximum image dimensions depend on the model used
- Processing time varies based on complexity and size

## Integration with Claude Code

This skill runs locally and can be used during development:

1. **Design System Creation**: Generate component mockups and visual assets
2. **Documentation**: Create diagrams and illustrations for docs
3. **Testing**: Generate test images for visual regression testing
4. **Prototyping**: Rapid iteration on visual concepts

## See Also

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Gemini Image Generation Guide](https://ai.google.dev/docs/imagen)
- Edge Stack Plugin for deployment workflows
