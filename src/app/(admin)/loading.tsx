import { Skeleton } from '@/components/ui/skeleton'

export default function AdminLoading() {
	return (
		<div className="mx-auto max-w-6xl">
			<Skeleton className="mb-6 h-8 w-64 rounded" />
			<div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Skeleton className="h-24 rounded-xl" />
				<Skeleton className="h-24 rounded-xl" />
				<Skeleton className="h-24 rounded-xl" />
				<Skeleton className="h-24 rounded-xl" />
			</div>
			<Skeleton className="h-[360px] w-full rounded-xl" />
		</div>
	)
}
