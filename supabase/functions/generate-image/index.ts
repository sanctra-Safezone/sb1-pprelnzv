import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const COST = 5;

const BLOCKED_TERMS = [
  'disney', 'marvel', 'dc comics', 'batman', 'superman', 'spiderman',
  'harry potter', 'star wars', 'lord of the rings', 'pokemon', 'nintendo',
  'mickey mouse', 'pixar', 'dreamworks', 'studio ghibli',
  'taylor swift', 'beyonce', 'drake', 'kanye', 'eminem', 'rihanna',
  'ariana grande', 'justin bieber', 'ed sheeran', 'billie eilish',
  'trump', 'biden', 'obama', 'celebrity', 'famous person',
  'elon musk', 'jeff bezos', 'mark zuckerberg',
  'in the style of', 'like picasso', 'like van gogh', 'like monet',
  'like banksy', 'like warhol', 'greg rutkowski', 'artgerm',
  'nsfw', 'nude', 'naked', 'explicit', 'sexual', 'porn'
];

const FALLBACK_ERRORS = [
  'quota exceeded', 'rate limit', 'model unavailable', 'insufficient',
  'payment required', 'forbidden', 'too many requests', 'timeout',
  'service unavailable', 'internal server error', 'bad gateway'
];

function shouldFallback(error: string | number): boolean {
  if (typeof error === 'number') {
    return [402, 403, 429, 500, 502, 503, 504].includes(error);
  }
  const lower = error.toLowerCase();
  return FALLBACK_ERRORS.some(term => lower.includes(term));
}

function validatePrompt(prompt: string): { valid: boolean; reason?: string } {
  const lower = prompt.toLowerCase();
  for (const term of BLOCKED_TERMS) {
    if (lower.includes(term)) {
      return { valid: false, reason: `Content policy violation: "${term}" is not allowed` };
    }
  }
  if (prompt.length < 3) {
    return { valid: false, reason: 'Prompt too short' };
  }
  if (prompt.length > 500) {
    return { valid: false, reason: 'Prompt too long (max 500 characters)' };
  }
  return { valid: true };
}

async function generateWithFal(prompt: string): Promise<{ url: string; provider: string }> {
  const FAL_KEY = Deno.env.get('FAL_API_KEY');
  if (!FAL_KEY) {
    throw new Error('FAL_API_KEY not configured');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch('https://queue.fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        image_size: 'square_hd',
        num_images: 1,
        enable_safety_checker: true
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.text();
      if (shouldFallback(response.status) || shouldFallback(error)) {
        throw new Error(`FALLBACK:${response.status}:${error}`);
      }
      throw new Error(`Fal.ai error: ${error}`);
    }

    const result = await response.json();

    if (result.images && result.images.length > 0) {
      console.info('[AI Provider] Using Fal.ai (primary)');
      return { url: result.images[0].url, provider: 'fal' };
    }

    throw new Error('FALLBACK:empty:No image generated');
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('FALLBACK:timeout:Request timed out');
    }
    throw err;
  }
}

async function generateWithGemini(prompt: string): Promise<{ url: string; provider: string }> {
  const GEMINI_KEY = Deno.env.get('GEMINI_API_KEY');
  if (!GEMINI_KEY) {
    throw new Error('FALLBACK:no_key:Gemini not configured');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate an artistic, beautiful image of: ${prompt}. Make it serene, calming, and visually appealing.`
            }]
          }],
          generationConfig: {
            responseModalities: ["image", "text"],
            responseMimeType: "text/plain"
          }
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.text();
      if (shouldFallback(response.status) || shouldFallback(error)) {
        throw new Error(`FALLBACK:${response.status}:${error}`);
      }
      throw new Error(`Gemini error: ${error}`);
    }

    const result = await response.json();

    if (result.candidates?.[0]?.content?.parts) {
      for (const part of result.candidates[0].content.parts) {
        if (part.inlineData?.mimeType?.startsWith('image/')) {
          const base64Data = part.inlineData.data;
          const dataUrl = `data:${part.inlineData.mimeType};base64,${base64Data}`;
          console.info('[AI Fallback] Using Gemini instead of Fal');
          return { url: dataUrl, provider: 'gemini' };
        }
      }
    }

    throw new Error('FALLBACK:empty:No image in response');
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('FALLBACK:timeout:Request timed out');
    }
    throw err;
  }
}

async function generateWithPollinations(prompt: string): Promise<{ url: string; provider: string }> {
  const encodedPrompt = encodeURIComponent(prompt);
  const seed = Math.floor(Math.random() * 1000000);
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&seed=${seed}&nologo=true`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Pollinations error: ${response.status}`);
    }

    console.info('[AI Fallback] Using Pollinations (free fallback)');
    return { url, provider: 'pollinations' };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

async function generateWithFallback(prompt: string): Promise<{ url: string; provider: string; quality: string }> {
  try {
    const result = await generateWithFal(prompt);
    return { ...result, quality: 'high' };
  } catch (e1) {
    const msg1 = e1 instanceof Error ? e1.message : String(e1);
    console.warn('[AI Fallback] Fal failed:', msg1);

    if (msg1.startsWith('FALLBACK:') || msg1.includes('not configured')) {
      try {
        const result = await generateWithGemini(prompt);
        return { ...result, quality: 'standard' };
      } catch (e2) {
        const msg2 = e2 instanceof Error ? e2.message : String(e2);
        console.warn('[AI Fallback] Gemini failed:', msg2);

        if (msg2.startsWith('FALLBACK:') || msg2.includes('not configured')) {
          try {
            const result = await generateWithPollinations(prompt);
            return { ...result, quality: 'basic' };
          } catch (e3) {
            console.error('[AI Fallback] All providers failed');
            throw new Error('All generation providers are currently resting. Please try again later.');
          }
        }
        throw e2;
      }
    }
    throw e1;
  }
}

async function uploadToStorage(
  supabase: any,
  imageUrl: string,
  userId: string,
  isBase64: boolean = false
): Promise<string> {
  let imageBlob: Blob;

  if (isBase64 || imageUrl.startsWith('data:')) {
    const [header, base64Data] = imageUrl.split(',');
    const mimeMatch = header.match(/data:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    imageBlob = new Blob([bytes], { type: mimeType });
  } else {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to download generated image');
    }
    imageBlob = await imageResponse.blob();
  }

  const fileName = `${userId}/ai_${Date.now()}.png`;

  const { error: uploadError } = await supabase.storage
    .from('posts')
    .upload(fileName, imageBlob, {
      contentType: 'image/png',
      upsert: false
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('posts')
    .getPublicUrl(fileName);

  return publicUrl;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { prompt } = await req.json();

    const validation = validatePrompt(prompt || '');
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.reason }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('cty_balance')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile || profile.cty_balance < COST) {
      return new Response(
        JSON.stringify({ error: 'Not enough CTY' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { url: generatedUrl, provider, quality } = await generateWithFallback(prompt);
    const isBase64 = generatedUrl.startsWith('data:');
    const permanentUrl = await uploadToStorage(supabase, generatedUrl, user.id, isBase64);

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ cty_balance: profile.cty_balance - COST })
      .eq('id', user.id);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to deduct CTY' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        url: permanentUrl,
        prompt,
        type: 'image',
        provider,
        quality
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Generate image error:', err);
    const message = err instanceof Error ? err.message : 'Generation failed';
    const isResting = message.includes('resting') || message.includes('try again');

    return new Response(
      JSON.stringify({
        error: isResting ? message : 'Image generation is taking a brief pause. Please try again.',
        resting: true
      }),
      { status: isResting ? 503 : 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
