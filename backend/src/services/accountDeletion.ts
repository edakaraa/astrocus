import { supabaseAdmin } from "../lib/supabaseAdmin";

/**
 * Permanently removes the user from auth.users (not only public.profiles).
 * CASCADE on profiles is handled by Supabase when the auth user is deleted.
 */
export const deleteAuthUserPermanently = async (userId: string): Promise<void> => {
  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId, false);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  const { data: remaining, error: lookupError } = await supabaseAdmin.auth.admin.getUserById(userId);

  if (lookupError && !/not found|user not found/i.test(lookupError.message)) {
    throw new Error(lookupError.message);
  }

  if (remaining?.user) {
    throw new Error("User still exists in auth.users after deletion");
  }
};
