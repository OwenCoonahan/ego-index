/**
 * Blocklist utilities for Ego Index
 * Prevents analysis of accounts that should not be stored
 *
 * NOTE: Requires running supabase-blocklist.sql first
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseAdmin } from './supabase';

/**
 * Check if a username is blocked
 */
export async function isBlocked(username: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('blocklist' as any)
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
    .from('blocklist' as any)
    .insert({
      username: username.toLowerCase(),
      reason,
      notes,
    } as any);

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
    .from('blocklist' as any)
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

  const profileData = profile as any;

  // Delete analyses (will cascade due to foreign key)
  await supabaseAdmin
    .from('analyses')
    .delete()
    .eq('profile_id', profileData.id);

  // Delete profile
  await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('id', profileData.id);

  // Add to blocklist to prevent re-analysis
  await blockUsername(username, 'user_request', 'Requested data deletion');
}
