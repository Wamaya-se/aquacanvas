import { Skeleton } from '@/components/ui/skeleton'

export default function MarketingLoading() {
	return (
		<div className="mx-auto max-w-6xl px-6 py-16">
			<div className="flex flex-col gap-6">
				<Skeleton className="h-12 w-2/3 rounded-lg" />
				<Skeleton className="h-6 w-5/6 rounded" />
				<Skeleton className="h-6 w-4/6 rounded" />
				<Skeleton className="mt-8 aspect-[16/9] w-full rounded-xl" />
				<div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
					<Skeleton className="h-40 rounded-xl" />
					<Skeleton className="h-40 rounded-xl" />
					<Skeleton className="h-40 rounded-xl" />
				</div>
			</div>
		</div>
	)
}
