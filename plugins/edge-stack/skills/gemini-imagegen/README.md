# Gemini ImageGen Skill

AI-powered image generation, editing, and composition using Google's Gemini API.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set your API key:**
   ```bash
   export GEMINI_API_KEY="your-api-key-here"
   ```
   Get your key from: https://makersuite.google.com/app/apikey

3. **Generate an image:**
   ```bash
   npm run generate "a sunset over mountains" output.png
   ```

## Features

- **Generate**: Create images from text descriptions
- **Edit**: Modify existing images with natural language prompts
- **Compose**: Combine multiple images with flexible layouts

## Usage Examples

### Generate Images
```bash
# Basic generation
npm run generate "futuristic city skyline" city.png

# Custom size
npm run generate "modern office" office.png -- --width 1920 --height 1080
```

### Edit Images
```bash
# Style transformation
npm run edit photo.jpg "make it look like a watercolor painting" artistic.png

# Object modification
npm run edit landscape.png "add a rainbow in the sky" enhanced.png
```

### Compose Images
```bash
# Grid layout (default)
npm run compose collage.png img1.jpg img2.jpg img3.jpg img4.jpg

# Horizontal banner
npm run compose banner.png left.png right.png -- --layout horizontal

# Custom composition
npm run compose result.png a.jpg b.jpg -- --prompt "blend seamlessly"
```

## Scripts

- `npm run generate <prompt> <output>` - Generate image from text
- `npm run edit <source> <prompt> <output>` - Edit existing image
- `npm run compose <output> <images...>` - Compose multiple images

## Configuration

### Environment Variables

- `GEMINI_API_KEY` (required) - Your Google Gemini API key

### Options

See `SKILL.md` for detailed documentation on all available options and parameters.

## Development Notes

This is a local development skill that runs on your machine, not on Cloudflare Workers. It's designed for:

- Design workflows and asset creation
- Visual content generation
- Image manipulation and prototyping
- Creating test images for development

## Implementation Status

**Note**: The current implementation includes:
- Complete TypeScript structure
- Argument parsing and validation
- Gemini API integration for image analysis
- Comprehensive error handling

For production use with actual image generation/editing, you'll need to:
1. Use the Imagen model (imagen-3.0-generate-001)
2. Implement proper image data handling
3. Add output file writing with actual image data

Refer to the [Gemini Imagen documentation](https://ai.google.dev/docs/imagen) for implementation details.

## License

MIT
