# Groom Posts

A professional application for dog groomers to create Instagram-ready content from before/after grooming photos with AI-generated captions.

![Groom Posts App](https://i.imgur.com/placeholder.png)

## Features

- **Before/After Photo Upload**: Easily upload before and after grooming photos
- **AI-Generated Captions**: Create engaging Instagram-ready captions customized for each dog
- **Post Management**: Save drafts and manage your post history
- **Instagram Preview**: See exactly how your post will look on Instagram before publishing
- **Responsive Design**: Works seamlessly on mobile and desktop

## Getting Started

### Prerequisites

- Node.js 20 or later
- An OpenAI API key (for AI caption generation)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/groom-posts.git
   cd groom-posts
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

## Usage Guide

### Creating a New Post

1. **Upload Photos**:
   - Click on either the "Before" or "After" placeholders to upload photos
   - You can also use the "Upload Photos" button below the placeholders

2. **Enter Dog Information**:
   - Fill in the dog's name (required)
   - Select the grooming service provided
   - Add any additional notes about the grooming session
   - Include Instagram hashtags (optional)

3. **Generate Caption**:
   - Click the "Generate Post" button to create an AI-generated caption
   - The AI will use the dog's information to create a customized caption

4. **Save or Publish**:
   - Review the post preview on the right
   - Click "Save Draft" to store the post for later
   - Click "Post to Instagram" to save and prepare for Instagram posting (direct Instagram integration coming in a future update)

### Viewing Post History

1. Click on "Post History" in the navigation
2. Browse through your previously created posts
3. Use the dropdown menu on each post to:
   - Edit the post (coming in a future update)
   - Delete the post
   - Share to Instagram (coming in a future update)

## Technical Structure

The application uses a modern JavaScript stack:

- **Frontend**: React with Vite, TailwindCSS, and shadcn/ui components
- **Backend**: Express.js server with in-memory storage
- **API Integration**: OpenAI for caption generation
- **State Management**: React Query for server state management

## Future Enhancements

- Direct Instagram posting integration
- User authentication and profiles
- Scheduling posts for later
- Analytics for post performance
- Additional AI features like image enhancement

## Troubleshooting

### Caption Generation Not Working

- Ensure your OpenAI API key is correctly set in the environment variables
- Check that you have sufficient credits in your OpenAI account
- Make sure you've filled in the dog's name, which is required for caption generation

### Images Not Uploading

- Check that your images are in a supported format (JPEG, PNG, etc.)
- Ensure the image files aren't too large (recommended under 5MB)
- Verify that the `/uploads` directory has proper write permissions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the API for caption generation
- The shadcn/ui team for the beautiful UI components
- All dog groomers who provided feedback during development