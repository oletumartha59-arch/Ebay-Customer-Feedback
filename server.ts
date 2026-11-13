import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APPS_SCRIPT_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbwwcMYCD-cpOGiRS3kzaBJYgKztEgIsgDi0nTRAaNNQMEPr7EJ3Ri6_C8aCd6I_HbZNPg/exec';

interface AppsScriptResult {
  success: boolean;
  message: string;
  requestToken?: string;
}

function decodeJsStringLiteral(escaped: string): string {
  const normalized = escaped
    .replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex: string) => `\\u00${hex}`)
    .replace(/\\'/g, "'")
    .replace(/\\\//g, '/');
  return JSON.parse(`"${normalized}"`) as string;
}

function parseAppsScriptResponse(rawText: string): AppsScriptResult | null {
  const trimmed = rawText.trim();

  // 1. Direct JSON response (e.g. if endpoint uses ContentService)
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as Partial<AppsScriptResult>;
      if (typeof parsed.success === 'boolean') {
        return {
          success: parsed.success,
          message: parsed.message || (parsed.success ? 'Feedback successfully saved.' : 'Unable to save feedback.'),
          requestToken: parsed.requestToken,
        };
      }
    } catch {
      // Fall through to HTML parsing
    }
  }

  // 2. Google Apps Script HtmlService wrapper: goog.script.init("...", ...)
  const initMatch = rawText.match(/goog\.script\.init\("((?:\\.|[^"\\])*)"/);
  if (initMatch?.[1]) {
    try {
      const initJsonStr = decodeJsStringLiteral(initMatch[1]);
      const initData = JSON.parse(initJsonStr) as { userHtml?: string };
      if (initData.userHtml) {
        const postMsgMatch = initData.userHtml.match(
          /window\.parent\.postMessage\(\s*(\{[\s\S]*?\})\s*,/
        );
        if (postMsgMatch?.[1]) {
          const result = JSON.parse(postMsgMatch[1]) as Partial<AppsScriptResult>;
          if (typeof result.success === 'boolean') {
            return {
              success: result.success,
              message:
                result.message ||
                (result.success ? 'Feedback successfully saved.' : 'Unable to save feedback.'),
              requestToken: result.requestToken,
            };
          }
        }
      }
    } catch {
      // Fall through to generic postMessage extraction
    }
  }

  // 3. Direct postMessage HTML response (without goog.script.init wrapper)
  const directMatch = rawText.match(/window\.parent\.postMessage\(\s*(\{[\s\S]*?\})\s*,/);
  if (directMatch?.[1]) {
    try {
      const result = JSON.parse(directMatch[1]) as Partial<AppsScriptResult>;
      if (typeof result.success === 'boolean') {
        return {
          success: result.success,
          message:
            result.message ||
            (result.success ? 'Feedback successfully saved.' : 'Unable to save feedback.'),
          requestToken: result.requestToken,
        };
      }
    } catch {
      // Ignore parse error
    }
  }

  return null;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '1mb' }));

  app.post('/api/submit-feedback', async (req, res) => {
    const payload = req.body;

    if (!payload || typeof payload !== 'object' || !payload.requestToken) {
      res.status(400).json({
        success: false,
        message: 'Invalid feedback payload.',
      });
      return;
    }

    try {
      const body = new URLSearchParams({
        payload: JSON.stringify(payload),
      });

      const response = await fetch(APPS_SCRIPT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: body.toString(),
        redirect: 'follow',
      });

      const responseText = await response.text();
      const parsed = parseAppsScriptResponse(responseText);

      if (!parsed) {
        res.status(502).json({
          success: false,
          message:
            'The Google Apps Script endpoint returned an unexpected response. Ensure the Web App is deployed with access set to "Anyone".',
        });
        return;
      }

      if (!parsed.success) {
        let friendlyMessage = parsed.message;
        if (friendlyMessage.includes('PASTE_YOUR_SPREADSHEET_ID_HERE')) {
          friendlyMessage =
            'The deployed Google Apps Script still has SPREADSHEET_ID set to "PASTE_YOUR_SPREADSHEET_ID_HERE". Update SPREADSHEET_ID with your actual Google Sheet ID in Apps Script and deploy a new version.';
        }
        res.status(422).json({
          success: false,
          message: friendlyMessage,
          requestToken: parsed.requestToken || payload.requestToken,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: parsed.message || 'Feedback successfully saved.',
        requestToken: parsed.requestToken || payload.requestToken,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Network error contacting Google Apps Script.';
      res.status(502).json({
        success: false,
        message: `Failed to reach the Google Apps Script service: ${message}`,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
