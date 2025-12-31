import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const COST = 12;

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
    throw new Error('FALLBACK:no_key:FAL_API_KEY not configured');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  try {
    const response = await fetch('https://queue.fal.run/fal-ai/fast-animatediff/text-to-video', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        num_frames: 16,
        num_inference_steps: 4,
        guidance_scale: 1.0,
        fps: 8,
        video_size: 'square'
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

    if (result.video && result.video.url) {
      console.info('[AI Provider] Using Fal.ai AnimateDiff (primary)');
      return { url: result.video.url, provider: 'fal' };
    }

    throw new Error('FALLBACK:empty:No video generated');
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('FALLBACK:timeout:Request timed out');
    }
    throw err;
  }
}

async function generateWithReplicateGif(prompt: string): Promise<{ url: string; provider: string }> {
  const REPLICATE_KEY = Deno.env.get('REPLICATE_API_KEY');
  if (!REPLICATE_KEY) {
    throw new Error('FALLBACK:no_key:Replicate not configured');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  try {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: 'db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf',
        input: {
          prompt: prompt,
          num_frames: 16,
          fps: 8
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.text();
      if (shouldFallback(response.status) || shouldFallback(error)) {
        throw new Error(`FALLBACK:${response.status}:${error}`);
      }
      throw new Error(`Replicate error: ${error}`);
    }

    const prediction = await response.json();

    let result = prediction;
    let attempts = 0;
    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < 60) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: { 'Authorization': `Token ${REPLICATE_KEY}` }
      });
      result = await pollResponse.json();
      attempts++;
    }

    if (result.status === 'succeeded' && result.output) {
      console.info('[AI Fallback] Using Replicate instead of Fal');
      return { url: result.output, provider: 'replicate' };
    }

    throw new Error('FALLBACK:failed:Video generation failed');
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('FALLBACK:timeout:Request timed out');
    }
    throw err;
  }
}

async function generateWithFallback(prompt: string): Promise<{ url: string; provider: string; quality: string }> {
  try {
    const result = await generateWithFal(prompt);
    return { ...result, quality: 'high' };
  } catch (e1) {
    const msg1 = e1 instanceof Error ? e1.message : String(e1);
    console.warn('[AI Fallback] Fal video failed:', msg1);

    if (msg1.startsWith('FALLBACK:') || msg1.includes('not configured')) {
      try {
        const result = await generateWithReplicateGif(prompt);
        return { ...result, quality: 'standard' };
      } catch (e2) {
        const msg2 = e2 instanceof Error ? e2.message : String(e2);
        console.warn('[AI Fallback] Replicate failed:', msg2);

        console.error('[AI Fallback] All video providers failed');
        throw new Error('Video generation is temporarily resting. Try creating an AI image instead.');
      }
    }
    throw e1;
  }
}

async function uploadToStorage(
  supabase: any,
  videoUrl: string,
  userId: string
): Promise<string> {
  const videoResponse = await fetch(videoUrl);
  if (!videoResponse.ok) {
    throw new Error('Failed to download generated video');
  }

  const videoBlob = await videoResponse.blob();
  const fileName = `${userId}/ai_living_${Date.now()}.mp4`;

  const { error: uploadError } = await supabase.storage
    .from('posts')
    .upload(fileName, videoBlob, {
      contentType: 'video/mp4',
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
    const permanentUrl = await uploadToStorage(supabase, generatedUrl, user.id);

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
        type: 'living',
        provider,
        quality
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Generate living image error:', err);
    const message = err instanceof Error ? err.message : 'Generation failed';
    const isResting = message.includes('resting') || message.includes('temporarily');

    return new Response(
      JSON.stringify({
        error: isResting ? message : 'Video generation is temporarily resting. Try creating an AI image instead.',
        resting: true,
        suggestAlternative: 'image'
      }),
      { status: isResting ? 503 : 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
