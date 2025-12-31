import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const COST = 8;

const BLOCKED_TERMS = [
  'taylor swift', 'beyonce', 'drake', 'kanye', 'eminem', 'rihanna',
  'ariana grande', 'justin bieber', 'ed sheeran', 'billie eilish',
  'beatles', 'elvis', 'michael jackson', 'madonna', 'prince',
  'in the style of', 'cover of', 'remix of', 'sounds like',
  'voice of', 'celebrity voice', 'famous singer',
  'copyrighted', 'trademark', 'licensed music',
  'nsfw', 'explicit', 'profanity'
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
  const timeoutId = setTimeout(() => controller.abort(), 90000);

  try {
    const response = await fetch('https://queue.fal.run/fal-ai/stable-audio', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        seconds_total: 15,
        steps: 100
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

    if (result.audio_file && result.audio_file.url) {
      console.info('[AI Provider] Using Fal.ai Stable Audio (primary)');
      return { url: result.audio_file.url, provider: 'fal' };
    }

    throw new Error('FALLBACK:empty:No audio generated');
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('FALLBACK:timeout:Request timed out');
    }
    throw err;
  }
}

async function generateWithElevenLabs(prompt: string): Promise<{ url: string; provider: string }> {
  const ELEVENLABS_KEY = Deno.env.get('ELEVENLABS_API_KEY');
  if (!ELEVENLABS_KEY) {
    throw new Error('FALLBACK:no_key:ElevenLabs not configured');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: prompt,
        duration_seconds: 15,
        prompt_influence: 0.3
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.text();
      if (shouldFallback(response.status) || shouldFallback(error)) {
        throw new Error(`FALLBACK:${response.status}:${error}`);
      }
      throw new Error(`ElevenLabs error: ${error}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
    const dataUrl = `data:audio/mpeg;base64,${base64Audio}`;

    console.info('[AI Fallback] Using ElevenLabs instead of Fal');
    return { url: dataUrl, provider: 'elevenlabs' };
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
    console.warn('[AI Fallback] Fal audio failed:', msg1);

    if (msg1.startsWith('FALLBACK:') || msg1.includes('not configured')) {
      try {
        const result = await generateWithElevenLabs(prompt);
        return { ...result, quality: 'standard' };
      } catch (e2) {
        const msg2 = e2 instanceof Error ? e2.message : String(e2);
        console.warn('[AI Fallback] ElevenLabs failed:', msg2);

        console.error('[AI Fallback] All audio providers failed');
        throw new Error('AI music is resting. Enjoy the ambient garden sound instead.');
      }
    }
    throw e1;
  }
}

async function uploadToStorage(
  supabase: any,
  audioUrl: string,
  userId: string,
  isBase64: boolean = false
): Promise<string> {
  let audioBlob: Blob;

  if (isBase64 || audioUrl.startsWith('data:')) {
    const [header, base64Data] = audioUrl.split(',');
    const mimeMatch = header.match(/data:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'audio/mpeg';
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    audioBlob = new Blob([bytes], { type: mimeType });
  } else {
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error('Failed to download generated audio');
    }
    audioBlob = await audioResponse.blob();
  }

  const fileName = `${userId}/ai_sound_${Date.now()}.mp3`;

  const { error: uploadError } = await supabase.storage
    .from('posts')
    .upload(fileName, audioBlob, {
      contentType: 'audio/mpeg',
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
        type: 'sound',
        duration: 15,
        provider,
        quality
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Generate sound error:', err);
    const message = err instanceof Error ? err.message : 'Generation failed';
    const isResting = message.includes('resting') || message.includes('ambient');

    return new Response(
      JSON.stringify({
        error: isResting ? message : 'AI sound generation is taking a brief pause. Please try again.',
        resting: true,
        fallbackAudio: '/audio/hidden-garden.mp3'
      }),
      { status: isResting ? 503 : 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
