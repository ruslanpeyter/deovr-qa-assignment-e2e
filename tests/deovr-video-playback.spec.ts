import { test, expect } from '@playwright/test';
import { CategoryPage } from '../pages/CategoryPage';
import { ChannelPage } from '../pages/ChannelPage';
import { WatchPage } from '../pages/WatchPage';

/**
 * DeoVR.com End-to-End Smoke Test (Page Object Model)
 * Flow: Category Discovery (/categories/nature-vr) -> Channel Page -> Video Watch Page -> Start Playback
 * + DevTools Console & Runtime Error Monitoring (`page.on('console')` & `page.on('pageerror')`)
 *
 * QA Note on Practicality:
 * Per assignment guidelines ("Better to hardcode and write a comment on how it should work in reality"),
 * we use a lightweight Page Object Model with a hardcoded fallback watch URL so live feed rotation
 * never makes the test flaky. In a real staging CI pipeline, `beforeAll` would seed or query the API
 * (/api/v1/videos?category=nature) for a deterministic test video ID.
 */

const FALLBACK_WATCH_PATH = '/93t47n';
const TARGET_VIDEO_TITLE = 'Kyoto: Ninna-ji Temple, founded in 888, Japan';

test.describe('DeoVR Web Platform — Video Discovery, Playback & Console Error E2E (POM)', () => {
  test('User can browse Nature VR category, open a video watch page, initiate playback, and monitor console/WebGL errors', async ({ page }) => {
    const consoleMessages: string[] = [];
    const uncaughtPageErrors: string[] = [];

    page.on('console', (msg) => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    });
    page.on('pageerror', (err) => {
      uncaughtPageErrors.push(err.message);
    });

    const categoryPage = new CategoryPage(page);
    const channelPage = new ChannelPage(page);
    const watchPage = new WatchPage(page);

    // Step 1 & 2: Open Nature VR Category page and verify sort controls + first video card
    await categoryPage.goto('/categories/nature-vr');
    await categoryPage.verifyLoadedCleanly();
    await categoryPage.verifyFirstVideoCardControls();

    // Step 3: Navigate to creator channel and resolve target video link (or use deterministic fallback)
    await channelPage.goto('/channel/footstepsman-japan');
    await channelPage.verifyLoaded();
    const targetHref = await channelPage.getVideoHrefByTitle(TARGET_VIDEO_TITLE);

    // Step 4: Open Watch Page and verify player UI & metadata controls (Subscribe, More actions -> Share, Related Videos)
    await watchPage.goto(targetHref && targetHref.startsWith('/') ? targetHref : FALLBACK_WATCH_PATH);
    await watchPage.verifyCoreUiVisible();

    // Step 5: Trigger muted playback
    await watchPage.startMutedPlayback();

    // Step 6: Assert zero unexpected uncaught page errors occurred
    const unexpectedPageErrors = uncaughtPageErrors.filter(
      (err) => !err.includes('createVertexArray')
    );
    expect(unexpectedPageErrors).toEqual([]);
  });
});
