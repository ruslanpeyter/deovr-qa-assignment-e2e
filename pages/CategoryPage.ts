import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object for DeoVR Category Discovery Page (e.g., /categories/nature-vr)
 */
export class CategoryPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly forYouLink: Locator;
  readonly newLink: Locator;
  readonly trendingButton: Locator;
  readonly videoCards: Locator;
  readonly errorBoundaryText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Nature VR Videos', level: 1 });
    this.forYouLink = page.getByRole('link', { name: 'For You' });
    this.newLink = page.getByRole('link', { name: 'New' });
    // Note: "Trending (Month)" is rendered as a dropdown <button>, unlike "For You" and "New" links
    this.trendingButton = page.getByRole('button', { name: /Trending/i });
    this.videoCards = page.getByRole('article');
    this.errorBoundaryText = page.getByText('Something went wrong');
  }

  async goto(path = '/categories/nature-vr') {
    const response = await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
  }

  async verifyLoadedCleanly() {
    await expect(this.errorBoundaryText).toHaveCount(0);
    await expect(this.heading).toBeVisible();
    await expect(this.forYouLink).toBeVisible();
    await expect(this.trendingButton).toBeVisible();
  }

  async verifyFirstVideoCardControls() {
    const firstCard = this.videoCards.first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard.getByRole('button', { name: 'Watch Later' })).toBeVisible();
    await expect(firstCard.getByRole('button', { name: 'Like' })).toBeVisible();
  }
}
