// Headless browser helper. Some venues (GAMH/See Tickets, Public Works/Tixr)
// sit behind bot-protection (Cloudflare, Datadome) that 403s plain `fetch`.
// We use Playwright with realistic browser fingerprinting to render the page
// and extract the same JSON-LD / DOM the human visitor sees.
//
// Local-only: this module is not invoked from Vercel cron (Playwright +
// Chromium ~300MB exceeds serverless function size). Run via the CLI:
//   npm run scrape gamh
//   npm run scrape publicworks
//
// Or to refresh both in one go:
//   npm run scrape:headless
//
// Future v2: move to GitHub Actions cron (free 2000min/mo) so this runs on a
// schedule without manual intervention. Same code, different trigger.

const REALISTIC_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

export type RenderedPage = {
  url: string;
  html: string;
};

export async function renderPage(
  url: string,
  options: {
    waitForSelector?: string;
    waitMs?: number;
    timeoutMs?: number;
  } = {},
): Promise<RenderedPage | null> {
  // Lazy-import so the module isn't loaded in environments without playwright.
  const { chromium } = await import("playwright");

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--disable-features=IsolateOrigins,site-per-process",
    ],
  });

  try {
    const context = await browser.newContext({
      userAgent: REALISTIC_UA,
      viewport: { width: 1440, height: 900 },
      locale: "en-US",
      timezoneId: "America/Los_Angeles",
      extraHTTPHeaders: {
        "accept-language": "en-US,en;q=0.9",
        "accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      },
    });

    // Knock out webdriver flag — common bot signal.
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    });

    const page = await context.newPage();
    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: options.timeoutMs ?? 30000,
    });

    if (!response || !response.ok()) {
      console.warn(
        `[headless] ${url} returned ${response?.status() ?? "no response"}`,
      );
      return null;
    }

    if (options.waitForSelector) {
      try {
        await page.waitForSelector(options.waitForSelector, {
          timeout: 10000,
        });
      } catch {
        // not fatal — return whatever's loaded
      }
    } else if (options.waitMs) {
      await page.waitForTimeout(options.waitMs);
    } else {
      // Default: short pause for hydration / lazy-rendered content.
      await page.waitForTimeout(1500);
    }

    const html = await page.content();
    return { url, html };
  } catch (err) {
    console.error(`[headless] ${url} failed`, err);
    return null;
  } finally {
    await browser.close();
  }
}
