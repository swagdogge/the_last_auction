// Gemini, called straight from the player's browser with the player's own key.
// There is no server in the middle: nothing is stored and nothing is logged.

const MODEL = "gemini-3.5-flash-lite";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// Gemini wants OpenAPI-style schemas: uppercase types, no additionalProperties.
function toGeminiSchema(schema) {
  if (!schema || typeof schema !== "object") return schema;
  const out = {};
  if (schema.type) out.type = String(schema.type).toUpperCase();
  if (schema.enum) out.enum = schema.enum;
  if (schema.properties) {
    out.properties = Object.fromEntries(
      Object.entries(schema.properties).map(([name, value]) => [name, toGeminiSchema(value)]),
    );
    if (schema.required) out.required = schema.required;
  }
  if (schema.items) out.items = toGeminiSchema(schema.items);
  if (schema.minItems !== undefined) out.minItems = schema.minItems;
  if (schema.maxItems !== undefined) out.maxItems = schema.maxItems;
  return out;
}

function imagePart(dataUrl) {
  const match = /^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i.exec(dataUrl || "");
  if (!match) return null;
  return { inlineData: { mimeType: match[1], data: match[2] } };
}

/** One call: a prompt, optional images, and a JSON answer back. */
export async function askGeminiJson({ key, prompt, images = [], schema, onRaw }) {
  if (!key) throw new Error("No Gemini key");

  const parts = [{ text: prompt }];
  for (const image of images) {
    const part = imagePart(image);
    if (part) parts.push(part);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  const send = () =>
    fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: {
          temperature: 1,
          responseMimeType: "application/json",
          responseSchema: toGeminiSchema(schema),
        },
      }),
      signal: controller.signal,
    });

  try {
    // The free tier spikes now and then; a short retry rides it out.
    let response = await send();
    for (let attempt = 1; attempt < 3 && (response.status === 429 || response.status === 503); attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 700 * attempt));
      response = await send();
    }

    if (!response.ok) {
      throw new Error(`Gemini ${response.status}`);
    }

    const data = await response.json();
    const text = (data?.candidates?.[0]?.content?.parts || [])
      .map((part) => part.text || "")
      .join("")
      .trim();

    if (!text) throw new Error("Gemini returned nothing");
    onRaw?.(text);
    return JSON.parse(text);
  } catch (error) {
    if (error?.name === "AbortError") throw new Error("Gemini timed out");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}