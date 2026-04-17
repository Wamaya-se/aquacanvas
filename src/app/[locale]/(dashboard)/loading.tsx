import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
	return (
		<div className="mx-auto max-w-5xl">
			<Skeleton className="mb-8 h-8 w-48 rounded" />
			<div className="flex flex-col gap-4">
				<Skeleton className="h-24 w-full rounded-xl" />
				<Skeleton className="h-24 w-full rounded-xl" />
				<Skeleton className="h-24 w-full rounded-xl" />
			</div>
		</div>
	)
}
