import { createSupabaseClient } from '@/lib/supabase';

let cachedRemoveAds: boolean | null = null;
let removeAdsPromise: Promise<boolean> | null = null;

export async function checkRemoveAdsCached(): Promise<boolean> {
  // If we already have the answer in memory, return it instantly
  if (cachedRemoveAds !== null) {
    return cachedRemoveAds;
  }

  // If a request is already in flight, wait for it
  if (removeAdsPromise) {
    return removeAdsPromise;
  }

  // Otherwise, start a new request and cache the promise
  removeAdsPromise = (async () => {
    try {
      const supabase = createSupabaseClient();
      if (!supabase) return false;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles')
          .select('remove_ads')
          .eq('id', user.id)
          .single();

        if (profile?.remove_ads) {
          cachedRemoveAds = true;
          return true;
        }
      }

      cachedRemoveAds = false;
      return false;
    } catch (error) {
      console.warn('Failed to fetch remove_ads status:', error);
      cachedRemoveAds = false;
      return false;
    } finally {
      // Clear the promise once it resolves so subsequent calls use `cachedRemoveAds` directly
      removeAdsPromise = null;
    }
  })();

  return removeAdsPromise;
}
