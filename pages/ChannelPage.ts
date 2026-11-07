import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object for a DeoVR Creator Channel Page (e.g., /channel/footstepsman-japan)
 */
export class ChannelPage {
  readonly page: Page;
  readonly channelTitle: Locator;
  readonly videoCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.channelTitle = page.getByText('Footstepsman JAPAN').first();
    this.videoCards = page.getByRole('article');
  }

  async goto(path = '/channel/footstepsman-japan') {
    const response = await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
  }

  async verifyLoaded() {
    await expect(this.channelTitle).toBeVisible();
    await expect(this.videoCards.first()).toBeVisible();
  }

  /**
   * Returns the relative href for a video by title if still on Page 1 of the channel feed,
   * or null if it has rotated to an older page.
   */
  async getVideoHrefByTitle(titleSubstring: string): Promise<string | null> {
    const link = this.page.getByRole('link', { name: titleSubstring }).first();
    if ((await link.count()) > 0) {
      return await link.getAttribute('href');
    }
    return null;
  }
}
