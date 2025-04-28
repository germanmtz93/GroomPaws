import FB from 'facebook-node-sdk';
import fs from 'fs';
import { GroomPost } from '@shared/schema';
import { log } from '../vite';

// Interface for Instagram post response
interface InstagramPostResponse {
  id: string;
  permalink?: string;
  success: boolean;
  error?: string;
}

class InstagramService {
  private fb: FB;
  private initialized: boolean = false;
  private instagramAccountId: string | null = null;
  private pageId: string | null = null;

  constructor() {
    const appId = process.env.FACEBOOK_APP_ID || 'placeholder_app_id';
    const appSecret = process.env.FACEBOOK_APP_SECRET || 'placeholder_app_secret';
    
    this.fb = new FB({
      appId,
      appSecret,
      version: 'v18.0' // Using the latest stable version as of 2025
    });
    
    // Set the access token
    const accessToken = process.env.INSTAGRAM_LONG_LIVED_ACCESS_TOKEN;
    if (accessToken) {
      this.fb.setAccessToken(accessToken);
      this.initialized = true;
    } else {
      log('Instagram service initialized with placeholder credentials', 'instagram');
    }
  }

  /**
   * Initialize the Instagram service by fetching the connected Instagram account
   */
  async init(): Promise<boolean> {
    if (!this.initialized) {
      log('Instagram service not initialized: Missing credentials', 'instagram');
      return false;
    }

    try {
      // First, get the user's pages
      const pagesResponse = await this.fbApiPromise('/me/accounts');
      
      if (!pagesResponse.data || pagesResponse.data.length === 0) {
        log('No Facebook pages found for this user', 'instagram');
        return false;
      }
      
      // Use the first page for simplicity (can be enhanced to allow selection)
      this.pageId = pagesResponse.data[0].id;
      
      // Now get the Instagram Business Account connected to this page
      const instagramResponse = await this.fbApiPromise(`/${this.pageId}?fields=instagram_business_account`);
      
      if (!instagramResponse.instagram_business_account) {
        log('No Instagram Business Account connected to the Facebook page', 'instagram');
        return false;
      }
      
      this.instagramAccountId = instagramResponse.instagram_business_account.id;
      log(`Instagram service initialized with account ID: ${this.instagramAccountId}`, 'instagram');
      
      return true;
    } catch (error) {
      log(`Failed to initialize Instagram service: ${(error as Error).message}`, 'instagram');
      return false;
    }
  }

  /**
   * Post content to Instagram
   */
  async postToInstagram(post: GroomPost): Promise<InstagramPostResponse> {
    if (!this.initialized) {
      return {
        id: '',
        success: false,
        error: 'Instagram service not initialized: Missing credentials'
      };
    }
    
    // Ensure we have the Instagram account ID
    if (!this.instagramAccountId) {
      const initialized = await this.init();
      if (!initialized) {
        return {
          id: '',
          success: false,
          error: 'Failed to initialize Instagram service'
        };
      }
    }
    
    try {
      // Create a container for the post
      const containerResponse = await this.fbApiPromise(`/${this.instagramAccountId}/media`, 'POST', {
        image_url: post.afterImageUrl, // Use the "after" image as the main image
        caption: post.caption,
        access_token: this.fb.getAccessToken()
      });
      
      if (!containerResponse.id) {
        return {
          id: '',
          success: false,
          error: 'Failed to create Instagram container'
        };
      }
      
      // Publish the container
      const publishResponse = await this.fbApiPromise(`/${this.instagramAccountId}/media_publish`, 'POST', {
        creation_id: containerResponse.id,
        access_token: this.fb.getAccessToken()
      });
      
      if (!publishResponse.id) {
        return {
          id: '',
          success: false,
          error: 'Failed to publish to Instagram'
        };
      }
      
      // Get the permalink
      const mediaResponse = await this.fbApiPromise(`/${publishResponse.id}?fields=permalink`);
      
      return {
        id: publishResponse.id,
        permalink: mediaResponse.permalink,
        success: true
      };
    } catch (error) {
      return {
        id: '',
        success: false,
        error: `Failed to post to Instagram: ${(error as Error).message}`
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
    return this.initialized;
  }
}

// Export as a singleton
export const instagramService = new InstagramService();