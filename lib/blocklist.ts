/**
 * Blocklist utilities for Ego Index
 * Prevents analysis of accounts that should not be stored
 */

import { supabaseAdmin } from './supabase';

/**
 * Check if a username is blocked
 */
export async function isBlocked(username: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('blocklist')
    .select('username')
    .ilike('username', username)
    .single();

  if (error) {
    // Table might not exist yet, or no match found
    return false;
  }

  return !!data;
}

/**
 * Add username to blocklist
 */
export async function blockUsername(
  username: string,
  reason: 'user_request' | 'legal' | 'ethical' | 'spam',
  notes?: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('blocklist')
    .insert({
      username: username.toLowerCase(),
      reason,
      notes,
    });

  if (error) {
    console.error('Error adding to blocklist:', error);
    throw error;
  }
}

/**
 * Remove username from blocklist
 */
export async function unblockUsername(username: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('blocklist')
    .delete()
    .ilike('username', username);

  if (error) {
    console.error('Error removing from blocklist:', error);
    throw error;
  }
}

/**
 * Delete all data for a username (GDPR right to be forgotten)
 */
export async function deleteUserData(username: string): Promise<void> {
  // First get the profile ID
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .ilike('username', username)
    .single();

  if (!profile) {
    return; // Already deleted
  }

  // Delete analyses (will cascade due to foreign key)
  await supabaseAdmin
    .from('analyses')
    .delete()
    .eq('profile_id', profile.id);

  // Delete profile
  await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('id', profile.id);

  // Add to blocklist to prevent re-analysis
  await blockUsername(username, 'user_request', 'Requested data deletion');
}
