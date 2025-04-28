import FB from 'facebook-node-sdk';
import { GroomPost } from '@shared/schema';

interface InstagramPostResponse {
  id: string;
  permalink?: string;
  success: boolean;
  error?: string;
}

/**
 * Service for integrating with Instagram API via Facebook Graph API
 */
class InstagramService {
  private fb: FB;
  private initialized: boolean = false;
  private instagramAccountId: string | null = null;
  private pageId: string | null = null;

  constructor() {
    // Initialize with placeholder values if environment variables are not set
    // These will be replaced with actual values when init() is called
    const appId = process.env.FACEBOOK_APP_ID || 'placeholder_app_id';
    const appSecret = process.env.FACEBOOK_APP_SECRET || 'placeholder_app_secret';
    
    this.fb = new FB({
      appId,
      appSecret,
      version: 'v19.0' // Use the latest stable version
    });
    
    // Set access token if available
    if (process.env.INSTAGRAM_LONG_LIVED_ACCESS_TOKEN) {
      this.fb.setAccessToken(process.env.INSTAGRAM_LONG_LIVED_ACCESS_TOKEN);
      this.init().then(success => {
        if (success) {
          console.log('[instagram] Instagram service initialized successfully');
        } else {
          console.log('[instagram] Instagram service initialized with placeholder credentials');
        }
      }).catch(err => {
        console.error('[instagram] Error initializing Instagram service:', err.message);
      });
    } else {
      console.log('[instagram] Instagram service initialized with placeholder credentials');
    }
  }

  /**
   * Initialize the Instagram service by fetching the connected Instagram account
   */
  async init(): Promise<boolean> {
    if (!process.env.INSTAGRAM_LONG_LIVED_ACCESS_TOKEN || 
        !process.env.FACEBOOK_APP_ID || 
        !process.env.FACEBOOK_APP_SECRET) {
      return false;
    }

    try {
      // First get the page ID
      const meResponse = await this.fbApiPromise('/me/accounts');
      
      if (!meResponse.data || meResponse.data.length === 0) {
        console.error('[instagram] No Facebook pages found for this user');
        return false;
      }
      
      this.pageId = meResponse.data[0].id;
      
      // Get the Instagram business account ID connected to this page
      const instagramResponse = await this.fbApiPromise(`/${this.pageId}?fields=instagram_business_account`);
      
      if (!instagramResponse.instagram_business_account) {
        console.error('[instagram] No Instagram business account found for this page');
        return false;
      }
      
      this.instagramAccountId = instagramResponse.instagram_business_account.id;
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('[instagram] Error during initialization:', error);
      return false;
    }
  }

  /**
   * Post content to Instagram
   */
  async postToInstagram(post: GroomPost): Promise<InstagramPostResponse> {
    if (!this.initialized || !this.instagramAccountId) {
      return {
        id: '',
        success: false,
        error: 'Instagram service not properly initialized'
      };
    }

    try {
      // First create a container for the carousel
      const carouselResponse = await this.fbApiPromise(
        `/${this.instagramAccountId}/media`, 
        'POST',
        {
          caption: post.caption + (post.tags ? `\n\n${post.tags}` : ''),
          media_type: 'CAROUSEL',
        }
      );
      
      if (!carouselResponse.id) {
        throw new Error('Failed to create carousel container');
      }
      
      // Then add the before image to the carousel
      const beforeImageResponse = await this.fbApiPromise(
        `/${this.instagramAccountId}/media`, 
        'POST',
        {
          image_url: post.beforeImageUrl,
          is_carousel_item: true,
        }
      );
      
      if (!beforeImageResponse.id) {
        throw new Error('Failed to add before image to carousel');
      }
      
      // Add the after image to the carousel
      const afterImageResponse = await this.fbApiPromise(
        `/${this.instagramAccountId}/media`, 
        'POST',
        {
          image_url: post.afterImageUrl,
          is_carousel_item: true,
        }
      );
      
      if (!afterImageResponse.id) {
        throw new Error('Failed to add after image to carousel');
      }
      
      // Update the carousel with the child images
      await this.fbApiPromise(
        `/${carouselResponse.id}`, 
        'POST',
        {
          children: `${beforeImageResponse.id},${afterImageResponse.id}`
        }
      );
      
      // Publish the carousel
      const publishResponse = await this.fbApiPromise(
        `/${this.instagramAccountId}/media_publish`, 
        'POST',
        {
          creation_id: carouselResponse.id
        }
      );
      
      if (!publishResponse.id) {
        throw new Error('Failed to publish carousel to Instagram');
      }
      
      // Get the permalink to the post
      const mediaResponse = await this.fbApiPromise(
        `/${publishResponse.id}?fields=permalink`
      );
      
      return {
        id: publishResponse.id,
        permalink: mediaResponse.permalink,
        success: true
      };
    } catch (error: any) {
      console.error('[instagram] Error posting to Instagram:', error);
      return {
        id: '',
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Helper method to promisify FB API calls
   */
  private fbApiPromise(path: string, method = 'GET', params = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      this.fb.api(path, method, params, (response: any) => {
        if (!response || response.error) {
          reject(response ? response.error : new Error('Unknown error'));
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Check if the service is properly initialized
   */
  isInitialized(): boolean {
    return this.initialized && !!this.instagramAccountId;
  }
}

export const instagramService = new InstagramService();