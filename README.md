# DeoVR.com E2E Autotest — Playwright + TypeScript (Page Object Model)

This repository contains the **Task 3 (E2E Scenario + Autotest with AI)** deliverable for the DeoVR QA Engineer assignment.

Full written deliverables for **Task 1 (Bug Reports)** and **Task 2 (Prioritized Test Checklist)** are in `DeoVR_QA_Assignment.md` and the companion Google Doc.

---

## Chosen User Path & Rationale

- **User Path**: **Browse Category ([Nature VR Videos](https://deovr.com/categories/nature-vr)) → Open Creator Channel ([Footstepsman JAPAN](https://deovr.com/channel/footstepsman-japan)) → Open Video Watch Page ([Watch Page `93t47n`](https://deovr.com/93t47n)) → Verify Watch Page UI (`Subscribe`, `More actions` → `Share`, `Related Videos`) & Start Muted Playback**
- **Why I Picked It**: This covers the core end-to-end user journey from category discovery to video playback. Following the assignment's practical rule (*"Better to hardcode and write a comment on how it should work in reality"*), the test uses a clean **Page Object Model (POM)** (`CategoryPage`, `ChannelPage`, `WatchPage`) with a hardcoded watch-page fallback (`/93t47n`) so live feed rotation never causes false CI failures.

---

## Test Scenario

- **Preconditions**: Desktop Chromium browser (`1440x900` viewport) with internet access to [DeoVR.com](https://deovr.com/); unauthenticated guest session.

| Step | Action | Expected Result |
| :--- | :--- | :--- |
| **1** | Navigate to [Nature VR Videos (`https://deovr.com/categories/nature-vr`)](https://deovr.com/categories/nature-vr). | The page returns HTTP 200 and renders the `Nature VR Videos` heading, `For You` link, and `Trending` dropdown button. |
| **2** | Inspect the first video card (`<article>`) in the category grid. | The first video card is visible, along with its **Watch Later** and **Like** action buttons. |
| **3** | Navigate to the creator channel [Footstepsman JAPAN (`https://deovr.com/channel/footstepsman-japan`)](https://deovr.com/channel/footstepsman-japan) and look up the target video link. | The channel page loads with the `Footstepsman JAPAN` header and visible video cards. |
| **4** | Open the video's Watch Page (using deterministic fallback [Watch Page `https://deovr.com/93t47n`](https://deovr.com/93t47n) if the live feed rotated) and click the **More actions** (`⋮`) button. | Watch page displays **Subscribe** and **Related Videos**, and clicking **More actions** reveals the **Share** option in the action menu. |
| **5** | Mute the HTML5 `<video>` element (`video.muted = true` to satisfy browser autoplay rules) and call `video.play()`. | The player mounts with a valid media source (`srcPresent === true`) and zero unexpected uncaught `pageerror` exceptions. |

---

## AI Workflow Note

- **AI Tool Used**: Claude Sonnet for initial Playwright test generation, followed by manual inspection of Playwright's ARIA snapshot (`error-context.md`) and live DOM debugging to refactor the suite into a Page Object Model.
- **Key Prompts Used**:
  1. *Prompt 1 (Initial Test & Practical Hardcoding)*: `"Write a Playwright TypeScript E2E test for https://deovr.com/categories/nature-vr that verifies the category page loads, opens a video watch page, verifies watch page controls ('Subscribe', 'Share', 'Related Videos'), and starts playback. Prefer practical hardcoded test data with inline comments explaining how dynamic test data would work in reality."`
  2. *Prompt 2 (Fixing Role Locators & Refactoring to POM)*: `"Based on the ARIA snapshot from error-context.md, 'Trending (Month)' is a <button> rather than a <a> link, and category cards (<article>) expose 'Watch Later' and 'Like' buttons directly. Refactor the test into a clean Page Object Model (CategoryPage, ChannelPage, WatchPage) using exact ARIA role locators."`
- **What the AI Did Well**:
  - Quickly scaffolded the Playwright configuration (`playwright.config.ts`), Page Object classes, and `video.evaluate()` playback helper.
- **What I Had to Fix / Rewrite Myself**:
  - **Corrected ARIA Role Mismatch on `Trending` (`CategoryPage.ts`)**: The AI initially assumed `Trending` was a link (`getByRole('link', { name: 'Trending' })`) like `For You` and `New`. Inspecting the failure log (`error-context.md`) revealed `Trending (Month)` is actually a dropdown `<button>`, so I updated `CategoryPage.ts` to use `getByRole('button', { name: /Trending/i })`.
  - **Scoped Video Card Assertions to Visible DOM Controls (`CategoryPage.ts`)**: On the category grid, `Play in VR` is hidden inside the card's `"More actions"` menu, whereas `Watch Later` and `Like` are directly visible on each `<article>` card. I updated `verifyFirstVideoCardControls()` to assert the visible card buttons.
  - **Opened `More actions` Before Asserting `Share` (`WatchPage.ts`)**: The AI assumed `Share` was directly visible on the Watch Page bar, but in the current UI, `Share` is tucked inside the `More actions` (`⋮`) popover menu. I added `this.moreActionsButton = page.getByRole('button', { name: /more actions/i })` and clicked it before asserting `expect(this.shareControl).toBeVisible()`.
  - **Added Deterministic Fallback Routing**: Because production trending feeds change constantly, I hardcoded a fallback watch route (`/93t47n`) and documented in code comments how a staging CI pipeline would seed or fetch an active video ID via API in `beforeAll`.

---

## Project Structure

```text
├── pages/
│   ├── CategoryPage.ts              # Page Object for /categories/nature-vr
│   ├── ChannelPage.ts               # Page Object for /channel/footstepsman-japan
│   └── WatchPage.ts                 # Page Object for video watch page (/93t47n)
├── tests/
│   └── deovr-video-playback.spec.ts # Main E2E test spec
├── DeoVR_QA_Assignment.md           # Full written QA assignment (Tasks 1, 2 & 3)
├── playwright.config.ts             # Playwright configuration (Desktop Chrome 1440x900)
├── package.json                     # Scripts and dependencies
└── README.md                        # Repository documentation
```

## How to Run the Test

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Install Chromium browser binaries**:
   ```bash
   npx playwright install chromium
   ```
3. **Run the E2E test (headless)**:
   ```bash
   npm test
   ```
4. **Run the E2E test in headed or UI mode**:
   ```bash
   npm run test:headed
   # or
   npm run test:ui
   ```
5. **Open the HTML test report**:
   ```bash
   npm run report
   ```
