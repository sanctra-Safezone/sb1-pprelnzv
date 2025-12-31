import { supabase } from './supabase';

export const CTY_LIMITS = {
  DAILY_CLAIM: 50,
  AI_GENERATION_COST: {
    IMAGE: 10,
    SOUND: 15,
    LIVING_IMAGE: 20
  },
  FREE_MUSIC_UPLOADS: 1
};

export async function claimDailyCTY(userId: string): Promise<{ success: boolean; message: string; amount?: number }> {
  const today = new Date().toISOString().split('T')[0];

  const { data: existingClaim } = await supabase
    .from('daily_cty_claims')
    .select('*')
    .eq('user_id', userId)
    .eq('claim_date', today)
    .maybeSingle();

  if (existingClaim) {
    return {
      success: false,
      message: 'Already claimed today. Come back tomorrow!'
    };
  }

  const { error: claimError } = await supabase
    .from('daily_cty_claims')
    .insert({
      user_id: userId,
      claim_date: today,
      amount: CTY_LIMITS.DAILY_CLAIM
    });

  if (claimError) {
    return {
      success: false,
      message: 'Failed to claim CTY. Please try again.'
    };
  }

  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({
      cty_balance: supabase.raw(`cty_balance + ${CTY_LIMITS.DAILY_CLAIM}`)
    })
    .eq('id', userId);

  if (updateError) {
    return {
      success: false,
      message: 'Failed to update balance.'
    };
  }

  return {
    success: true,
    message: `Claimed ${CTY_LIMITS.DAILY_CLAIM} CTY!`,
    amount: CTY_LIMITS.DAILY_CLAIM
  };
}

export async function checkCanClaimCTY(userId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];

  const { data } = await supabase
    .from('daily_cty_claims')
    .select('id')
    .eq('user_id', userId)
    .eq('claim_date', today)
    .maybeSingle();

  return !data;
}

export async function checkAIGenerationLimit(
  userId: string,
  type: 'image' | 'sound' | 'living_image'
): Promise<{ canGenerate: boolean; remaining: number }> {
  const today = new Date().toISOString().split('T')[0];

  const { data } = await supabase
    .from('daily_ai_generation_counts')
    .select('*')
    .eq('user_id', userId)
    .eq('generation_date', today)
    .maybeSingle();

  const currentCount = data?.[`${type}_count`] || 0;
  const limit = 10;

  return {
    canGenerate: currentCount < limit,
    remaining: Math.max(0, limit - currentCount)
  };
}

export async function incrementAIGenerationCount(
  userId: string,
  type: 'image' | 'sound' | 'living_image'
): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];

  const { data: existing } = await supabase
    .from('daily_ai_generation_counts')
    .select('*')
    .eq('user_id', userId)
    .eq('generation_date', today)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('daily_ai_generation_counts')
      .update({
        [`${type}_count`]: existing[`${type}_count`] + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id);

    return !error;
  } else {
    const { error } = await supabase
      .from('daily_ai_generation_counts')
      .insert({
        user_id: userId,
        generation_date: today,
        [`${type}_count`]: 1
      });

    return !error;
  }
}

export async function deductCTY(userId: string, amount: number): Promise<{ success: boolean; message: string }> {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('cty_balance')
    .eq('id', userId)
    .maybeSingle();

  if (!profile || profile.cty_balance < amount) {
    return {
      success: false,
      message: 'Insufficient CTY balance'
    };
  }

  const { error } = await supabase
    .from('user_profiles')
    .update({
      cty_balance: profile.cty_balance - amount
    })
    .eq('id', userId);

  if (error) {
    return {
      success: false,
      message: 'Failed to deduct CTY'
    };
  }

  return {
    success: true,
    message: `Deducted ${amount} CTY`
  };
}

export async function checkMusicUploadLimit(userId: string): Promise<{ canUpload: boolean; used: number; limit: number }> {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('music_uploads_used')
    .eq('id', userId)
    .maybeSingle();

  const used = profile?.music_uploads_used || 0;
  const limit = CTY_LIMITS.FREE_MUSIC_UPLOADS;

  return {
    canUpload: used < limit,
    used,
    limit
  };
}

export async function incrementMusicUploadCount(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_profiles')
    .update({
      music_uploads_used: supabase.raw('music_uploads_used + 1')
    })
    .eq('id', userId);

  return !error;
}
