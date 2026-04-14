import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/lib/env'

let adminClient: ReturnType<typeof createSupabaseClient<Database>> | null = null

export function createAdminClient() {
	if (!adminClient) {
		adminClient = createSupabaseClient<Database>(
			getSupabaseUrl(),
			getSupabaseServiceRoleKey(),
			{ auth: { autoRefreshToken: false, persistSession: false } },
		)
	}
	return adminClient
}
