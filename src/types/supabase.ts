export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[]

export type OrderStatus =
	| 'created'
	| 'processing'
	| 'generated'
	| 'paid'
	| 'shipped'

export type UserRole = 'customer' | 'admin'

export interface Database {
	public: {
		Tables: {
			profiles: {
				Row: {
					id: string
					email: string
					display_name: string | null
					avatar_url: string | null
					role: UserRole
					created_at: string
					updated_at: string
				}
				Insert: {
					id: string
					email: string
					display_name?: string | null
					avatar_url?: string | null
					role?: UserRole
					created_at?: string
					updated_at?: string
				}
				Update: {
					id?: string
					email?: string
					display_name?: string | null
					avatar_url?: string | null
					role?: UserRole
					created_at?: string
					updated_at?: string
				}
				Relationships: []
			}
		styles: {
			Row: {
				id: string
				name: string
				slug: string
				description: string | null
				thumbnail_url: string | null
				prompt_template: string
				model_id: string
				is_active: boolean
				sort_order: number
				price_cents: number
				created_at: string
			}
			Insert: {
				id?: string
				name: string
				slug: string
				description?: string | null
				thumbnail_url?: string | null
				prompt_template: string
				model_id: string
				is_active?: boolean
				sort_order?: number
				price_cents?: number
				created_at?: string
			}
			Update: {
				id?: string
				name?: string
				slug?: string
				description?: string | null
				thumbnail_url?: string | null
				prompt_template?: string
				model_id?: string
				is_active?: boolean
				sort_order?: number
				price_cents?: number
				created_at?: string
			}
			Relationships: []
		}
		products: {
			Row: {
				id: string
				name: string
				slug: string
				headline: string
				description: string | null
				body: string | null
				hero_image_url: string | null
				example_before: string | null
				example_after: string | null
				style_id: string
				price_cents: number | null
				is_active: boolean
				sort_order: number
				seo_title: string | null
				seo_description: string | null
				faq: { question: string; answer: string }[] | null
				created_at: string
				updated_at: string
			}
			Insert: {
				id?: string
				name: string
				slug: string
				headline: string
				description?: string | null
				body?: string | null
				hero_image_url?: string | null
				example_before?: string | null
				example_after?: string | null
				style_id: string
				price_cents?: number | null
				is_active?: boolean
				sort_order?: number
				seo_title?: string | null
				seo_description?: string | null
				faq?: { question: string; answer: string }[] | null
				created_at?: string
				updated_at?: string
			}
			Update: {
				id?: string
				name?: string
				slug?: string
				headline?: string
				description?: string | null
				body?: string | null
				hero_image_url?: string | null
				example_before?: string | null
				example_after?: string | null
				style_id?: string
				price_cents?: number | null
				is_active?: boolean
				sort_order?: number
				seo_title?: string | null
				seo_description?: string | null
				faq?: { question: string; answer: string }[] | null
				created_at?: string
				updated_at?: string
			}
			Relationships: [
				{
					foreignKeyName: 'products_style_id_fkey'
					columns: ['style_id']
					isOneToOne: false
					referencedRelation: 'styles'
					referencedColumns: ['id']
				},
			]
		}
		print_formats: {
			Row: {
				id: string
				name: string
				slug: string
				description: string | null
				format_type: string
				width_cm: number
				height_cm: number
				price_cents: number
				is_active: boolean
				sort_order: number
				created_at: string
			}
			Insert: {
				id?: string
				name: string
				slug: string
				description?: string | null
				format_type?: string
				width_cm: number
				height_cm: number
				price_cents?: number
				is_active?: boolean
				sort_order?: number
				created_at?: string
			}
			Update: {
				id?: string
				name?: string
				slug?: string
				description?: string | null
				format_type?: string
				width_cm?: number
				height_cm?: number
				price_cents?: number
				is_active?: boolean
				sort_order?: number
				created_at?: string
			}
			Relationships: []
		}
		orders: {
			Row: {
				id: string
				user_id: string | null
				style_id: string
				product_id: string | null
				format_id: string | null
				status: OrderStatus
				original_image_path: string | null
				generated_image_path: string | null
				price_cents: number | null
				stripe_session_id: string | null
				guest_session_id: string | null
				customer_email: string | null
				ai_model: string | null
				ai_cost_time_ms: number | null
				ai_task_id: string | null
				discount_code_id: string | null
				created_at: string
				updated_at: string
			}
			Insert: {
				id?: string
				user_id?: string | null
				style_id: string
				product_id?: string | null
				format_id?: string | null
				status?: OrderStatus
				original_image_path?: string | null
				generated_image_path?: string | null
				price_cents?: number | null
				stripe_session_id?: string | null
				guest_session_id?: string | null
				customer_email?: string | null
				ai_model?: string | null
				ai_cost_time_ms?: number | null
				ai_task_id?: string | null
				discount_code_id?: string | null
				created_at?: string
				updated_at?: string
			}
			Update: {
				id?: string
				user_id?: string | null
				style_id?: string
				product_id?: string | null
				format_id?: string | null
				status?: OrderStatus
				original_image_path?: string | null
				generated_image_path?: string | null
				price_cents?: number | null
				stripe_session_id?: string | null
				guest_session_id?: string | null
				customer_email?: string | null
				ai_model?: string | null
				ai_cost_time_ms?: number | null
				ai_task_id?: string | null
				discount_code_id?: string | null
				created_at?: string
				updated_at?: string
			}
				Relationships: [
					{
						foreignKeyName: 'orders_user_id_fkey'
						columns: ['user_id']
						isOneToOne: false
						referencedRelation: 'profiles'
						referencedColumns: ['id']
					},
					{
						foreignKeyName: 'orders_style_id_fkey'
						columns: ['style_id']
						isOneToOne: false
						referencedRelation: 'styles'
						referencedColumns: ['id']
					},
				{
					foreignKeyName: 'orders_product_id_fkey'
					columns: ['product_id']
					isOneToOne: false
					referencedRelation: 'products'
					referencedColumns: ['id']
				},
				{
					foreignKeyName: 'orders_format_id_fkey'
					columns: ['format_id']
					isOneToOne: false
					referencedRelation: 'print_formats'
					referencedColumns: ['id']
				},
				]
			}
			discount_codes: {
				Row: {
					id: string
					code: string
					stripe_coupon_id: string
					stripe_promo_id: string | null
					discount_percent: number | null
					discount_amount_cents: number | null
					max_uses: number | null
					current_uses: number
					is_active: boolean
					expires_at: string | null
					created_at: string
				}
				Insert: {
					id?: string
					code: string
					stripe_coupon_id: string
					stripe_promo_id?: string | null
					discount_percent?: number | null
					discount_amount_cents?: number | null
					max_uses?: number | null
					current_uses?: number
					is_active?: boolean
					expires_at?: string | null
					created_at?: string
				}
				Update: {
					id?: string
					code?: string
					stripe_coupon_id?: string
					stripe_promo_id?: string | null
					discount_percent?: number | null
					discount_amount_cents?: number | null
					max_uses?: number | null
					current_uses?: number
					is_active?: boolean
					expires_at?: string | null
					created_at?: string
				}
				Relationships: []
			}
			generated_images: {
				Row: {
					id: string
					order_id: string
					image_path: string
					metadata: Json
					created_at: string
				}
				Insert: {
					id?: string
					order_id: string
					image_path: string
					metadata?: Json
					created_at?: string
				}
				Update: {
					id?: string
					order_id?: string
					image_path?: string
					metadata?: Json
					created_at?: string
				}
				Relationships: [
					{
						foreignKeyName: 'generated_images_order_id_fkey'
						columns: ['order_id']
						isOneToOne: false
						referencedRelation: 'orders'
						referencedColumns: ['id']
					},
				]
			}
		}
		Views: Record<string, never>
		Functions: {
			is_admin: {
				Args: Record<string, never>
				Returns: boolean
			}
		}
		Enums: {
			order_status: OrderStatus
			user_role: UserRole
		}
		CompositeTypes: Record<string, never>
	}
}
