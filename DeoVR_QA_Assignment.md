# DeoVR QA Engineer Assignment — Bug Reports, Test Checklist & E2E Automation

---

## Task 1 — Hunt Down a Bug

Below are **2 reproducible bugs** verified manually on **Windows 11 + Google Chrome** on [DeoVR.com](https://deovr.com/), starting with our **Primary / Favorite Pick (`DEOVR-WEB-101`)** followed by a **Secondary Reproducible Bug (`DEOVR-WEB-102`)**.

---

### Bug Report 1 (Primary / Favorite Pick)

- **Bug ID:** `DEOVR-WEB-101`
- **Title:** Search Autocomplete Dropdown Detaches from the Search Bar and Floats in Mid-Screen on Scroll
- **Severity:** Medium (UI / UX Defect — core header search component)
- **Priority:** P2 (High)
- **Environment:**
  - **URLs:**
    - [https://deovr.com/](https://deovr.com/)
    - [https://deovr.com/search?q=new+york](https://deovr.com/search?q=new+york)
    - [https://deovr.com/search?q=music+vr](https://deovr.com/search?q=music+vr)
  - **OS & Browser:** Windows 11, Google Chrome (Desktop viewport, e.g., `1440×900` or `1920×1080`; also reproducible on tablet viewports)
- **Preconditions:**
  - Open [https://deovr.com/](https://deovr.com/) in Google Chrome with enough vertical content to scroll the page.

#### Steps to Reproduce
1. Navigate to [https://deovr.com/](https://deovr.com/).
2. Click into the top header search input (`I'm looking for...`) and type `new york` (or `music vr`) **without pressing Enter** (or type the query and click back into the search input so the autocomplete suggestion dropdown opens directly underneath the search bar).
3. Verify that the autocomplete suggestion popover (`new newyork`, `180 new york`, `new york 360`, `New york — Channel`, `Tony In New York — Channel`, `New York City Views — Channel`) is displayed below the header search input.
4. Move the mouse cursor over the video feed area and scroll the page down and up using the mouse wheel or touchpad while the autocomplete dropdown remains open.

#### Expected Result
- The autocomplete dropdown either remains anchored (`position: fixed` or tethered to the sticky header search input container) directly beneath the top search bar during scroll, or automatically closes on page scroll so it never floats detached over video cards.

#### Actual Result
- As the page scrolls, the sticky header stays pinned at the top of the viewport, but the autocomplete suggestion dropdown detaches from the search input and drifts down into the middle of the screen (`top: ~250px–300px`), floating as an orphaned white popover box directly on top of video thumbnails and titles (e.g., covering *"Avengers 'Battle of New York'"* and *"NEW YORK - The Big Apple Tour 3D180"*).

#### Root Cause Analysis (For Developers)
- The autocomplete popover is rendered in a body-level portal/overlay container using document-relative coordinates (`position: absolute` calculated at open time) while the top navigation header uses sticky/fixed positioning, or its Popper/Floating-UI positioning listener does not recalculate or dismiss on `window` scroll events.

#### Why I Chose This Bug
Search is one of the highest-traffic discovery entry points on [DeoVR.com](https://deovr.com/), and a detached autocomplete popup floating in the middle of the video grid immediately breaks visual polish and obscures clickable video cards. It is 100% reproducible on Windows 11 in Chrome within five seconds and is a textbook example of a sticky-header vs. portal-positioning bug that automated unit tests miss unless scroll behavior is explicitly checked.

---

### Bug Report 2 (Secondary Reproducible Bug)

- **Bug ID:** `DEOVR-WEB-102`
- **Title:** Footer "Run Speed Test" Link (`/speed-test`) Leads to a 404 Page Not Found Error
- **Severity:** Medium (Functional — broken navigation link in global footer)
- **Priority:** P2 (Medium-High)
- **Environment:**
  - **Source URL:** [https://deovr.com/](https://deovr.com/) (and any page rendering the global footer, e.g., [https://deovr.com/categories/nature-vr](https://deovr.com/categories/nature-vr))
  - **Broken Target URL:** [https://deovr.com/speed-test](https://deovr.com/speed-test)
  - **OS & Browser:** Windows 11, Google Chrome (reproducible across all desktop and mobile browsers)
- **Preconditions:**
  - Open [https://deovr.com/](https://deovr.com/) in Google Chrome.

#### Steps to Reproduce
1. Navigate to [https://deovr.com/](https://deovr.com/).
2. Scroll down to the bottom global footer (or open the left navigation drawer and scroll to the footer links).
3. Click the **"Run Speed Test"** link (`href="/speed-test"`).

#### Expected Result
- Clicking **"Run Speed Test"** navigates to a working network speed test utility page (`HTTP 200`) so users can verify whether their connection supports 4K/8K 120FPS VR streaming.

#### Actual Result
- The browser navigates to [https://deovr.com/speed-test](https://deovr.com/speed-test), which returns an `HTTP 404` status and renders the error page: *"404 — Page not found / Unfortunately, the requested page was not found."*

#### Why I Chose This Bug
High-bitrate 8K VR streaming requires strong bandwidth, so users troubleshooting buffering naturally look for the **"Run Speed Test"** tool in the footer. Landing on a dead `404` page from a global footer link hurts user trust and is trivial for engineering to fix (either restore the route or remove/redirect the dead link).

---

## Task 2 — Prioritized Test Checklist

### Chosen Page
- **Target Page:** **Nature VR Category Page** ([https://deovr.com/categories/nature-vr](https://deovr.com/categories/nature-vr))
- **Why I Picked This Page:** Category pages act as the main content-discovery hub between the homepage and individual VR video watch pages, combining dynamic feed sorting, quality/duration badges, authentication-gated actions (bookmarks/favorites), and pagination. If filtering, sorting, or card navigation breaks here, users cannot browse or start VR videos within their preferred genre.

### Checklist (12 Prioritized Checks)

| # | Check (What to Verify & Expected Result) | Priority | Why This Priority (Impact, Likelihood & Visibility) |
| :--- | :--- | :--- | :--- |
| **1** | **Video Card Navigation to Watch Page:** Click a video card thumbnail or title and verify it navigates to `/videos/<slug>-<id>` (`HTTP 200`) and loads the video player container. | **High (P1)** | Opening a video from a category feed is the primary user journey on DeoVR; a failure here completely blocks content consumption. |
| **2** | **Category Feed Initial Render & Non-Empty State:** Open [https://deovr.com/categories/nature-vr](https://deovr.com/categories/nature-vr) and verify the `"Nature VR Videos"` heading, total video counter, and initial grid of video cards render without errors. | **High (P1)** | An empty or crashed category grid makes the entire category unusable and immediately causes user bounce. |
| **3** | **Creator Channel Link Navigation:** Click the creator/channel name under any video card (e.g., [Virtual Nature 360](https://deovr.com/channel/virtual-nature-360)) and verify it opens `/channel/<slug>` with that creator's heading and uploaded videos. | **High (P1)** | Creator discovery is a core platform pillar and part of our primary E2E user flow; broken channel routing isolates creators from viewers. |
| **4** | **Feed Sorting Tabs (`For You`, `New`, `Trending`):** Switch between `For You`, `New`, and `Trending` (and change the timeframe dropdown such as `Trending (Month)` / `Trending (Today)`) and verify the video grid updates to match the selected sort order. | **High (P1)** | Users rely on sorting tabs to find fresh or top-rated VR videos; stale or non-updating feeds severely degrade content discovery. |
| **5** | **Header Search Autocomplete & Scroll Positioning:** Type a query (e.g., `new york`) into the header search bar, scroll the page, and verify the autocomplete dropdown stays anchored to the input (or closes cleanly) and submitting `Enter` loads `/search?q=new+york`. | **Medium (P2)** | Directly covers `DEOVR-WEB-101`; detached popovers obscure video cards and degrade UX, though keyboard submission still works. |
| **6** | **Pagination Controls & URL State:** Scroll to the bottom pagination bar, click page `2` (or Next), and verify the URL updates cleanly and loads a new set of video cards without duplicate query parameters. | **Medium (P2)** | Essential for browsing deeper into the catalog beyond the first page of results, though most clicks happen on page 1. |
| **7** | **Feed Settings Filter Modal:** Click the `Feed Settings` button, toggle a filter option, and verify the modal opens, applies the setting to the video grid, and closes cleanly. | **Medium (P2)** | Important for customizing feed preferences (such as VR format or resolution), but secondary to basic browsing and playback. |
| **8** | **Unauthenticated Bookmark / Watch Later Prompt:** While signed out, click the Bookmark ribbon icon on a video card and verify the login/sign-up prompt appears cleanly without console exceptions. | **Medium (P2)** | Protects account-gated features and drives guest-to-registered user conversion without crashing the page. |
| **9** | **Video Card Metadata & Badges Integrity:** Verify each video card displays a valid thumbnail image (`naturalWidth > 0`), duration badge (`MM:SS`), view count, upload age, and VR/Premium badge where applicable. | **Medium (P2)** | Missing thumbnails or `NaN` metadata hurt visual trust and click-through rates, even if the underlying link still works. |
| **10** | **Global Footer Links Validity (No 404s):** Click links in the global footer (including `"Run Speed Test"` at `/speed-test`) and verify every link resolves to a valid `HTTP 200` destination instead of a `404` page. | **Medium (P2)** | Directly catches `DEOVR-WEB-102`; broken footer links undermine platform credibility for users troubleshooting streaming speed. |
| **11** | **Responsive Grid Layout Across Viewports:** Resize the browser across Desktop (`1440×900`), Tablet (`768×1024`), and Mobile (`375×812`) viewports and verify the video grid reflows cleanly without horizontal overflow or overlapping cards. | **Low (P3)** | Ensures cross-device visual polish; minor layout shifts on edge-case screen widths do not block core video playback on desktop. |
| **12** | **SEO `<title>` and OpenGraph Meta Tags:** View page source (`Ctrl+U`) on `/categories/nature-vr` and verify `<title>` and `og:title` contain category-specific text (`Nature VR Videos...`) rather than generic homepage metadata. | **Low (P3)** | Important for search engine indexing and social link previews, though it has no direct functional impact on users already on the page. |

---

## Task 3 — Automated E2E Test (Playwright + TypeScript)

### 1. Chosen E2E Scenario & Why We Picked It
- **Scenario:** **Category Discovery → Creator Channel → Video Watch Page UI & Playback Initialization**
  1. Open the **Nature VR** category page ([https://deovr.com/categories/nature-vr](https://deovr.com/categories/nature-vr)) and verify the category heading (`Nature VR Videos`) and video card grid render.
  2. Click the creator channel link ([Virtual Nature 360](https://deovr.com/channel/virtual-nature-360)) on the target video card and verify navigation to `/channel/virtual-nature-360` and the channel heading.
  3. Click the video card ([Quick Test of the Canon R5C's 8K 60fps RAW Video VR180](https://deovr.com/videos/quick-test-of-the-canon-r5cs-8k-60fps-raw-video-vr180-12872)) and verify navigation to `/videos/quick-test-of-the-canon-r5cs-8k-60fps-raw-video-vr180-12872`.
  4. Verify core Watch Page UI elements are visible: the video title `<h1>`, creator link, action controls (`Like`, `Comments`, `Add to List`, and `Share` revealed after clicking the `More actions` (`⋮`) button), and the `Suggested Videos` sidebar.
  5. Verify the HTML5 `<video>` element is attached to the DOM, has a valid media source (`currentSrc` or `src` pointing to the CDN stream), and starts buffering (`readyState >= 1`).
- **Why This Scenario:**
  - It validates DeoVR's core business value—discovering VR content by category, exploring a creator's channel, and loading a high-resolution VR video stream—in one cohesive user journey.
  - Following the assignment guidance (*"Be practical. Do not overcomplicate. Better to hardcode and write a comment on how it should work in reality"*), we hardcoded the verified Nature VR category, creator (`Virtual Nature 360`), and video (`12872`) with inline comments explaining how dynamic fixture data or API seeding would work in a production CI pipeline.

### 2. Brief Note on How I Used AI
- **What I Used AI For:**
  - Scaffolding the initial Page Object Model (`CategoryPage.ts`, `ChannelPage.ts`, `WatchPage.ts`) and `playwright.config.ts` structure so I could focus on testing real user behavior rather than boilerplate setup.
  - Drafting initial locator candidates and structuring the `README.md` and bug report templates.
- **What I Had to Fix / Rewrite Myself:**
  - **Opening the `More actions` (`⋮`) Menu Before Asserting `Share` (`WatchPage.ts`):** The initial AI draft asserted `expect(this.shareControl).toBeVisible()` directly on page load. When running the test locally on Windows 11 (`npx playwright test --ui`), I noticed that on DeoVR's Watch Page the `Share` option is tucked inside the `More actions` (`⋮`) overflow menu. I added `readonly moreActionsButton: Locator` (`page.getByRole('button', { name: /more actions/i })`) and updated `verifyCoreUiVisible()` to click `moreActionsButton` before asserting `expect(this.shareControl).toBeVisible()`, resulting in a 100% passing test (`1 passed in 6.5s`).
  - **Scoped Locators to Avoid Strict-Mode Collisions:** Generic AI locators like `page.locator('a[href*="/channel/"]')` matched multiple links on the page. I scoped channel and video locators inside `CategoryPage.ts` and `ChannelPage.ts` using `.first()` and explicit href/title matching, and scoped `Suggested Videos` to `<aside>` on the Watch Page.
  - **Headless WebGL2 vs. Real GPU Playback Check:** Because headless CI browsers often lack a hardware WebGL2 context for 3D VR canvas rendering, I separated the `<video>` stream initialization check (`readyState >= 1` and valid CDN `currentSrc`) from uncaught pageerror logging so the test reliably verifies media loading across both headed Windows 11 Chrome and headless runners.
