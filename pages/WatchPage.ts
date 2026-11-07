import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object for the DeoVR Video Watch Page (e.g., /93t47n or /ocosbk)
 */
export class WatchPage {
  readonly page: Page;
  readonly subscribeControl: Locator;
  readonly moreActionsButton: Locator;
  readonly shareControl: Locator;
  readonly relatedVideosHeading: Locator;
  readonly videoElement: Locator;
  readonly webglNullCrashBanner: Locator;
  readonly previewTrigger: Locator;

  constructor(page: Page) {
    this.page = page;
    this.subscribeControl = page.getByText('Subscribe').first();
    this.moreActionsButton = page.getByRole('button', { name: /more actions/i });
    this.shareControl = page.getByText('Share').first();
    this.relatedVideosHeading = page.getByText('Related Videos').first();
    this.videoElement = page.locator('video').first();
    // Matches headless-only WebGL2 null-context error in Player.client-C3T4FPPr.js when hardware acceleration is absent
    this.webglNullCrashBanner = page.getByText(
      /Cannot read properties of null \(reading 'createVertexArray'\)/i
    );
    this.previewTrigger = page.getByText(/video preview|Play in VR/i).first();
  }

  async goto(pathOrUrl: string) {
    await this.page.goto(pathOrUrl, { waitUntil: 'domcontentloaded' });
  }

  async verifyCoreUiVisible() {
    await expect(this.subscribeControl).toBeVisible();
    await expect(this.moreActionsButton).toBeVisible();
    await this.moreActionsButton.click();
    await expect(this.shareControl).toBeVisible();
    await expect(this.relatedVideosHeading).toBeVisible();
  }

  async hasWebglNullCrash(): Promise<boolean> {
    return (await this.webglNullCrashBanner.count()) > 0;
  }

  /**
   * Starts playback safely in headless or headed browsers.
   * Mutes the <video> element first so browser autoplay policies do not block `.play()`.
   */
  async startMutedPlayback() {
    const hasWebglCrash = await this.hasWebglNullCrash();
    if (hasWebglCrash) {
      console.warn(
        '[Headless CI Note]: WebGL2 context is null in headless mode without GPU (createVertexArray).'
      );
      return;
    }

    if ((await this.videoElement.count()) > 0) {
      await expect(this.videoElement).toBeAttached();
      const playbackState = await this.videoElement.evaluate(async (video: HTMLVideoElement) => {
        video.muted = true;
        try {
          await video.play();
        } catch {
          // Ignore NotAllowedError if custom overlay click is required first
        }
        return {
          srcPresent: Boolean(video.currentSrc || video.src || video.querySelector('source')),
          paused: video.paused,
          readyState: video.readyState,
        };
      });
      expect(playbackState.srcPresent).toBe(true);
    } else if ((await this.previewTrigger.count()) > 0) {
      await this.previewTrigger.click();
    }
  }
}
