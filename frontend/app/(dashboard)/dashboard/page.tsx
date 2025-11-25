"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { motion } from "framer-motion"
import {
	LayoutDashboard,
	Briefcase,
	Users,
	TrendingUp,
	Calendar,
	Activity,
	FileText,
	BarChart3,
	ArrowRight
} from "lucide-react"
import { companiesAPI, contactsAPI, dealsAPI, crmAPI } from "@/lib/api"
import { useActivitiesApi } from "@/hooks/use-activities-api"
import { useCalendarApi } from "@/hooks/use-calendar-api"
import { sync } from "@/lib/sync"
import { getCategoryColor } from "@/lib/colors"

export default function DashboardPage() {
	const [stats, setStats] = useState<any>(null)
	const [isLoading, setIsLoading] = useState(true)
	const { activities } = useActivitiesApi()
	const { events: calendarEvents, updateEvent: updateCalendarEvent } = useCalendarApi() as any

	const fetchDashboardData = async () => {
		try {
			setIsLoading(true)
			const [companies, contacts, deals, crmStats] = await Promise.all([
				companiesAPI.getAll(),
				contactsAPI.getAll(),
				dealsAPI.getAll(),
				crmAPI.getStats()
			])
			setStats({
				companies: companies.length,
				contacts: contacts.length,
				deals: deals.length,
				activities: activities?.length || 0,
				events: calendarEvents?.length || 0,
				...crmStats
			})
		} catch (error) {
			console.error("Error fetching dashboard data:", error)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		fetchDashboardData()
		const unsub = [
			sync.on('global:refresh', fetchDashboardData),
			sync.on('activities:changed', fetchDashboardData),
			sync.on('calendar:changed', fetchDashboardData),
		]
		return () => { unsub.forEach(fn => fn && (fn as any)()) }
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activities?.length, calendarEvents?.length])

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
	}
	const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }
	const cardHoverVariants = { hover: { scale: 1.02, transition: { duration: 0.3, ease: "easeOut" } } }

	if (isLoading) {
		return (
			<div className="max-w-7xl mx-auto p-8 space-y-6">
				<Skeleton className="h-16 w-80" />
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-32" />)}
				</div>
			</div>
		)
	}

	const kpiCards = [
		{ title: "Unternehmen", value: stats?.totalCompanies || stats?.companies || 0, icon: Briefcase, link: "/crm?tab=companies", color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-900/20" },
		{ title: "Kontakte", value: stats?.totalContacts || stats?.contacts || 0, icon: Users, link: "/crm?tab=contacts", color: "text-green-600 dark:text-green-400", bgColor: "bg-green-50 dark:bg-green-900/20" },
		{ title: "Deals", value: stats?.totalDeals || stats?.deals || 0, icon: TrendingUp, link: "/crm?tab=deals", color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-50 dark:bg-purple-900/20" },
		{ title: "Pipeline Value", value: `${((stats?.pipelineValue || 0) / 1000).toFixed(0)}k CHF`, icon: BarChart3, link: "/crm?tab=deals", color: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-50 dark:bg-orange-900/20" },
		{ title: "Aktivitäten", value: stats?.activities || 0, icon: Activity, link: "/activities", color: "text-pink-600 dark:text-pink-400", bgColor: "bg-pink-50 dark:bg-pink-900/20" },
		{ title: "Kalender Events", value: stats?.events || 0, icon: Calendar, link: "/calendar", color: "text-cyan-600 dark:text-cyan-400", bgColor: "bg-cyan-50 dark:bg-cyan-900/20" },
		{ title: "Content", value: "0", icon: FileText, link: "/content", color: "text-indigo-600 dark:text-indigo-400", bgColor: "bg-indigo-50 dark:bg-indigo-900/20" },
		{ title: "Performance", value: `${(stats?.conversionRate || 0).toFixed(1)}%`, icon: BarChart3, link: "/performance", color: "text-red-600 dark:text-red-400", bgColor: "bg-red-50 dark:bg-red-900/20" }
	]

	const moduleCards = [
		{ title: "CRM", description: `${stats?.totalCompanies || 0} Unternehmen, ${stats?.totalContacts || 0} Kontakte`, link: "/crm", icon: Briefcase, color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-900/20" },
		{ title: "Marketing Aktivitäten", description: `${stats?.activities || 0} Aktive Kampagnen`, link: "/activities", icon: Activity, color: "text-green-600 dark:text-green-400", bgColor: "bg-green-50 dark:bg-green-900/20" },
		{ title: "Kalender", description: `${stats?.events || 0} Anstehende Events`, link: "/calendar", icon: Calendar, color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-50 dark:bg-purple-900/20" },
		{ title: "Performance", description: "Analytics & Reporting", link: "/performance", icon: BarChart3, color: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-50 dark:bg-orange-900/20" },
		{ title: "Content Management", description: "Inhalte verwalten", link: "/content", icon: FileText, color: "text-pink-600 dark:text-pink-400", bgColor: "bg-pink-50 dark:bg-pink-900/20" }
	]

	return (
		<motion.div className="max-w-7xl mx-auto p-8 space-y-8" variants={containerVariants} initial="hidden" animate="visible">
			<motion.div variants={itemVariants} className="relative">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-6">
						<div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center backdrop-blur-sm">
							<LayoutDashboard className="h-8 w-8 text-blue-600 dark:text-blue-400" />
						</div>
						<div>
							<h1 className="text-4xl font-light tracking-tight text-slate-900 dark:text-slate-100">Dashboard</h1>
							<p className="text-slate-600 dark:text-slate-400 mt-1">Willkommen bei Marketing Kreis Platform</p>
						</div>
					</div>
					<Badge className="glass-card px-4 py-2 text-sm font-medium">KABOOM</Badge>
				</div>
			</motion.div>

			<motion.div variants={itemVariants}>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
					{kpiCards.map((card, index) => (
						<motion.div key={index} variants={cardHoverVariants} whileHover="hover">
							<Link href={card.link}>
								<Card className="glass-card p-6 cursor-pointer group">
									<CardContent className="p-0">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{card.title}</p>
												<p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{card.value}</p>
											</div>
											<div className={`h-12 w-12 rounded-xl ${card.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
												<card.icon className={`h-6 w-6 ${card.color}`} />
											</div>
										</div>
									</CardContent>
								</Card>
							</Link>
						</motion.div>
					))}
				</div>
			</motion.div>

			<motion.div variants={itemVariants}>
				<h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">Module</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
					{moduleCards.map((module, index) => (
						<motion.div key={index} variants={cardHoverVariants} whileHover="hover">
							<Link href={module.link}>
								<Card className="glass-card p-6 cursor-pointer group">
									<CardContent className="p-0">
										<div className="flex items-start space-x-4">
											<div className={`h-12 w-12 rounded-xl ${module.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
												<module.icon className={`h-6 w-6 ${module.color}`} />
											</div>
											<div className="flex-1">
												<h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{module.title}</h3>
												<p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{module.description}</p>
											</div>
											<ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
										</div>
									</CardContent>
								</Card>
							</Link>
						</motion.div>
					))}
				</div>
			</motion.div>

			{/* Today/Week widget */}
			<motion.div variants={itemVariants}>
				<h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">Heute & Woche</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Card className="glass-card">
						<CardHeader><CardTitle className="text-slate-900 dark:text-slate-100">Heute</CardTitle></CardHeader>
						<CardContent className="space-y-2">
							{(calendarEvents || []).filter((e:any)=> {
								const d = new Date(e.start as any)
								const now = new Date()
								return d.getFullYear()===now.getFullYear() && d.getMonth()===now.getMonth() && d.getDate()===now.getDate()
							}).slice(0,6).map((e:any)=>(
								<div key={e.id} className="flex items-center justify-between p-2 rounded-lg border border-white/10 bg-white/5">
									<div className="truncate">
										<div className="font-medium truncate text-slate-900 dark:text-slate-100">{e.title}</div>
										<div className="text-xs text-slate-500 dark:text-slate-400">{new Date(e.start).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}</div>
									</div>
									<div className="flex items-center gap-2">
										<Button size="sm" variant="outline" className="h-7 px-2 glass-card" onClick={async()=>{ await updateCalendarEvent(e.id, { status: 'DONE' }); sync.emit('calendar:changed') }}>Done</Button>
										<Button size="sm" variant="outline" className="h-7 px-2 glass-card" onClick={async()=>{ await updateCalendarEvent(e.id, { status: 'DELAYED' }); sync.emit('calendar:changed') }}>Delay</Button>
									</div>
								</div>
							))}
							{(calendarEvents || []).length===0 && <div className="text-sm text-slate-500">Keine Termine</div>}
						</CardContent>
					</Card>
					<Card className="glass-card">
						<CardHeader><CardTitle className="text-slate-900 dark:text-slate-100">Diese Woche</CardTitle></CardHeader>
						<CardContent className="space-y-2">
							{(calendarEvents || []).filter((e:any)=> {
								const d = new Date(e.start as any)
								const now = new Date()
								const start = new Date(now); const end = new Date(now); start.setDate(now.getDate()-now.getDay()+1); end.setDate(start.getDate()+6)
								return d>=start && d<=end
							}).slice(0,8).map((e:any)=>(
								<div key={e.id} className="flex items-center justify-between p-2 rounded-lg border border-white/10 bg-white/5">
									<div className="truncate">
										<div className="font-medium truncate text-slate-900 dark:text-slate-100">{e.title}</div>
										<div className="text-xs text-slate-500 dark:text-slate-400">{new Date(e.start).toLocaleDateString('de-DE')}</div>
									</div>
									<div className="flex items-center gap-2">
										<Button size="sm" variant="outline" className="h-7 px-2 glass-card" onClick={async()=>{ await updateCalendarEvent(e.id, { status: 'DONE' }); sync.emit('calendar:changed') }}>Done</Button>
										<Button size="sm" variant="outline" className="h-7 px-2 glass-card" onClick={async()=>{ await updateCalendarEvent(e.id, { status: 'DELAYED' }); sync.emit('calendar:changed') }}>Delay</Button>
									</div>
								</div>
							))}
						</CardContent>
					</Card>
				</div>
			</motion.div>

			<motion.div variants={itemVariants}>
				<h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">Letzte Aktivitäten</h2>
				<Card className="glass-card">
					<CardContent className="p-8">
						{activities && activities.length > 0 ? (
							<div className="space-y-3 max-h-[600px] overflow-y-auto pr-2" role="list" aria-label="Letzte Aktivitäten">
								{[...(activities as any[])]
									.filter(a => a.start)
									.sort((a,b)=> new Date(b.start as any).getTime() - new Date(a.start as any).getTime())
									.map((activity: any) => {
										const color = getCategoryColor(activity.category || '')
										return (
											<motion.div key={activity.id} className="flex items-center justify-between p-4 border border-white/10 bg-white/5 dark:bg-neutral-900/30 rounded-xl backdrop-blur-sm" variants={itemVariants}>
												<div className="flex items-center gap-3 min-w-0">
													<span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
													<div className="min-w-0">
														<p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{activity.title}</p>
														<p className="text-xs text-slate-500 dark:text-slate-400 truncate">{activity.category || ''}</p>
													</div>
												</div>
											<div className="text-right whitespace-nowrap">
												<p className="text-xs text-slate-400">{activity.start ? new Date(activity.start as any).toLocaleString('de-DE') : ''}</p>
												<p className="text-xs text-slate-500 dark:text-slate-400">{activity.status}</p>
											</div>
										</motion.div>
									)
								})}
							</div>
						) : (
							<div className="text-center py-12">
								<div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4"><span className="text-2xl">📭</span></div>
								<h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Noch keine Aktivitäten</h3>
								<p className="text-slate-600 dark:text-slate-400 mb-6">Beginnen Sie mit Ihrer ersten Kampagne.</p>
								<Link href="/activities">
									<Button className="glass-card hover:shadow-md transition-all duration-300">Neue Aktivität</Button>
								</Link>
							</div>
						)}
					</CardContent>
				</Card>
			</motion.div>
		</motion.div>
	)
}
