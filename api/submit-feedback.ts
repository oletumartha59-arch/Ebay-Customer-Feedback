import type { IncomingMessage, ServerResponse } from 'http';

const APPS_SCRIPT_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbwwcMYCD-cpOGiRS3kzaBJYgKztEgIsgDi0nTRAaNNQMEPr7EJ3Ri6_C8aCd6I_HbZNPg/exec';

interface AppsScriptResult {
  success: boolean;
  message: string;
  requestToken?: string;
}

interface VercelReq extends IncomingMessage {
  body?: unknown;
}

interface VercelRes extends ServerResponse {
  status: (code: number) => VercelRes;
  json: (body: unknown) => void;
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

  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as Partial<AppsScriptResult>;
      if (typeof parsed.success === 'boolean') {
        return {
          success: parsed.success,
          message:
            parsed.message ||
            (parsed.success ? 'Feedback successfully saved.' : 'Unable to save feedback.'),
          requestToken: parsed.requestToken,
        };
      }
    } catch {
      // Fall through to HTML parsing
    }
  }

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

async function readJsonBody(req: VercelReq): Promise<Record<string, unknown> | null> {
  if (req.body && typeof req.body === 'object') {
    return req.body as Record<string, unknown>;
  }
  if (typeof req.body === 'string') {
    return JSON.parse(req.body) as Record<string, unknown>;
  }
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (chunks.length === 0) return null;
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string, unknown>;
}

export default async function handler(req: VercelReq, res: VercelRes) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ success: false, message: 'Method not allowed.' });
    return;
  }

  let payload: Record<string, unknown> | null = null;
  try {
    payload = await readJsonBody(req);
  } catch {
    payload = null;
  }

  if (!payload || typeof payload.requestToken !== 'string' || !payload.requestToken) {
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
}
