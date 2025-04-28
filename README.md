# Groom Posts Manager

A professional application for dog groomers to create Instagram-ready content from before/after grooming photos with AI-generated captions and direct Instagram posting.

## Features

- **Before/After Photo Upload**: Easily upload before and after grooming photos
- **AI-Generated Captions**: Create engaging Instagram-ready captions customized for each dog
- **Post Management**: Save drafts and manage your post history
- **Instagram Integration**: Post directly to Instagram from the application
- **User Authentication**: Secure user accounts with personalized post history
- **Guest Access**: Quick "Sign in as Guest" option for easy testing
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
   # Required for AI caption generation
   OPENAI_API_KEY=your_openai_api_key
   
   # Required for PostgreSQL database
   DATABASE_URL=postgresql://username:password@hostname:port/database_name
   
   # Optional for Instagram integration
   FACEBOOK_APP_ID=your_facebook_app_id
   FACEBOOK_APP_SECRET=your_facebook_app_secret
   INSTAGRAM_LONG_LIVED_ACCESS_TOKEN=your_instagram_access_token
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
   - Click "Post to Instagram" to publish your post directly to Instagram (requires Instagram API credentials)

### User Authentication

1. **Register a New Account**:
   - Navigate to the Auth page and switch to the "Register" tab
   - Enter your details including username, email, password, and salon name
   - Click "Create Account" to register and be automatically logged in

2. **Login to Your Account**:
   - Navigate to the Auth page and use the "Login" tab
   - Enter your username and password
   - Click "Log In" to access your account

3. **Guest Access**:
   - If you want to try the application without creating an account
   - Click "Sign in as Guest" for immediate access with a demo account

### Viewing Post History

1. Click on "Post History" in the navigation
2. Browse through your previously created posts (posts are user-specific)
3. Use the dropdown menu on each post to:
   - Edit the post (coming in a future update)
   - Delete the post
   - Post directly to Instagram (requires Instagram credentials)

## Technical Structure

The application uses a modern JavaScript stack:

- **Frontend**: React with Vite, TailwindCSS, and shadcn/ui components
- **Backend**: Express.js server with RESTful API endpoints
- **Database**: PostgreSQL with Drizzle ORM for data persistence
- **Authentication**: Session-based authentication with Passport.js
- **API Integration**: OpenAI for AI caption generation, Facebook Graph API for Instagram posting
- **State Management**: React Query for server state management

## Future Enhancements

- Scheduling posts for later publication
- Analytics dashboard for post performance tracking
- Additional AI features like image enhancement
- Multi-account Instagram support
- Email notifications and reminders

## Troubleshooting

### Caption Generation Not Working

- Ensure your OpenAI API key is correctly set in the environment variables
- Check that you have sufficient credits in your OpenAI account
- Make sure you've filled in the dog's name, which is required for caption generation

### Images Not Uploading

- Check that your images are in a supported format (JPEG, PNG, etc.)
- Ensure the image files aren't too large (recommended under 5MB)
- Verify that the `/uploads` directory has proper write permissions

### Instagram Posting Issues

- Ensure you've provided the necessary Instagram API credentials in the environment variables
- Check that your Facebook App is properly configured and has the required permissions
- The Instagram account must be connected to a Facebook Page
- The long-lived access token needs to have the right permissions for publishing content

### Authentication Problems

- If database connection fails, the user authentication system won't work
- For issues accessing your account, you can always use the "Sign in as Guest" option
- Session cookies need to be enabled in your browser for authentication to work properly

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the API for caption generation
- The shadcn/ui team for the beautiful UI components
- All dog groomers who provided feedback during development