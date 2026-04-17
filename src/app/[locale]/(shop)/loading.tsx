import { Skeleton } from '@/components/ui/skeleton'

export default function ShopLoading() {
	return (
		<div className="mx-auto max-w-5xl px-6 py-12 lg:py-16">
			<Skeleton className="mb-10 h-10 w-1/2 rounded-lg" />
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
				<div className="flex flex-col gap-4">
					<Skeleton className="h-6 w-40 rounded" />
					<Skeleton className="aspect-square w-full rounded-xl" />
				</div>
				<div className="flex flex-col gap-4">
					<Skeleton className="h-6 w-40 rounded" />
					<div className="grid grid-cols-2 gap-3">
						<Skeleton className="h-28 rounded-xl" />
						<Skeleton className="h-28 rounded-xl" />
						<Skeleton className="h-28 rounded-xl" />
						<Skeleton className="h-28 rounded-xl" />
					</div>
				</div>
			</div>
		</div>
	)
}
