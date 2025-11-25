"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Plus, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import KanbanBoard, { KanbanItem, KanbanStatus } from "@/components/content/KanbanBoard"
import { useModal } from "@/components/ui/modal/ModalProvider"

interface Props { slug: string }

const mockCampaigns = [
  {
    slug: "q4-marketing-campaign",
    title: "Q4 Marketing Campaign",
    description: "Social media campaign for Q4 product launch, targeting Swiss SMBs.",
    channel: "LinkedIn, Instagram",
    owner: "Sophie Schmidt",
    deadline: "2024-12-15",
    tasks: [
      { id: "task-1", title: "LinkedIn Post: Product Teaser", assignee: "Max", due: "2024-11-01", status: "TODO" as KanbanStatus },
      { id: "task-2", title: "Instagram Story: Behind the Scenes", assignee: "Anna", due: "2024-11-05", status: "IN_PROGRESS" as KanbanStatus },
      { id: "task-3", title: "Blog Post: Q4 Strategy", assignee: "Sophie", due: "2024-11-10", status: "REVIEW" as KanbanStatus },
      { id: "task-4", title: "Email Newsletter: Launch Announcement", assignee: "Max", due: "2024-11-15", status: "APPROVED" as KanbanStatus },
      { id: "task-5", title: "Press Release: Product Launch", assignee: "Sophie", due: "2024-11-20", status: "PUBLISHED" as KanbanStatus },
      { id: "task-6", title: "Competitor Analysis Report", assignee: "Anna", due: "2024-10-25", status: "ARCHIVED" as KanbanStatus },
    ],
  },
  {
    slug: "product-newsletter",
    title: "Product Newsletter",
    description: "Monthly newsletter featuring new features and customer success stories.",
    channel: "Email",
    owner: "Max Mustermann",
    deadline: "2024-12-10",
    tasks: [
      { id: "task-7", title: "Content Outline for December", assignee: "Max", due: "2024-11-25", status: "TODO" as KanbanStatus },
      { id: "task-8", title: "Feature Highlight: AI Assistant", assignee: "Anna", due: "2024-11-30", status: "IN_PROGRESS" as KanbanStatus },
    ],
  },
]

export default function CampaignDetailClient({ slug }: Props) {
  const { openModal } = useModal()
  const [campaign, setCampaign] = useState<typeof mockCampaigns[0] | null>(null)
  const [tasks, setTasks] = useState<KanbanItem[]>([])

  useEffect(() => {
    const found = mockCampaigns.find((c) => c.slug === slug)
    if (found) {
      setCampaign(found)
      setTasks(found.tasks)
    }
  }, [slug])

  const handleCreateTask = (status: KanbanStatus) => {
    openModal({
      type: "form",
      title: `Neue Aufgabe in "${status}"`,
      description: `Erstellen Sie eine neue Content-Aufgabe für die Kampagne "${campaign?.title}"`,
      fields: [
        { name: "title", type: "text", label: "Titel", placeholder: "Aufgabentitel eingeben...", required: true },
        { name: "assignee", type: "text", label: "Verantwortlicher", placeholder: "Name eingeben..." },
        { name: "due", type: "date", label: "Fälligkeitsdatum" },
        { name: "status", type: "select", label: "Status", options: ["TODO", "IN_PROGRESS", "REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED"], defaultValue: status, required: true },
      ],
      ai: { enabled: true, mode: "suggestion", context: `content task creation for campaign "${campaign?.title}" in status "${status}"` },
      onSubmit: (values) => {
        const newTask: KanbanItem = { id: `task-${Date.now()}`, title: values.title, assignee: values.assignee, due: values.due, status: values.status as KanbanStatus }
        setTasks((prev) => [...prev, newTask])
        openModal({ type: "info", title: "Aufgabe erstellt!", description: `Aufgabe "${values.title}" wurde erfolgreich hinzugefügt.`, icon: "success" })
      },
    })
  }

  if (!campaign) {
    return <div className="max-w-7xl mx-auto p-8 text-center text-slate-600 dark:text-slate-400">Kampagne nicht gefunden.</div>
  }

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }

  return (
    <motion.div className="max-w-7xl mx-auto p-8 space-y-8" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/content">
            <Button variant="outline" size="sm" className="glass-card hover:ring-1 hover:ring-blue-500/30">
              <ArrowLeft className="h-4 w-4 mr-2" /> Zurück
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-light tracking-tight text-slate-900 dark:text-slate-100">{campaign.title}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{campaign.description}</p>
          </div>
        </div>
        <Button onClick={() => handleCreateTask("TODO")} className="glass-card hover:ring-1 hover:ring-blue-500/30 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" /> Neuer Content
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
        <span><span className="font-semibold">Kanal:</span> {campaign.channel}</span>
        <span><span className="font-semibold">Verantwortlicher:</span> {campaign.owner}</span>
        <span><span className="font-semibold">Fälligkeitsdatum:</span> {campaign.deadline}</span>
      </motion.div>

      <motion.div variants={itemVariants}>
        <KanbanBoard
          rows={[
            ["TODO", "IN_PROGRESS", "REVIEW"],
            ["APPROVED", "PUBLISHED", "ARCHIVED"],
          ]}
          items={tasks}
          onItemsChange={setTasks}
          onCreateItem={handleCreateTask}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="glass-card p-4 border-l-4 border-blue-500/40">
          <CardContent className="p-0">
            <div className="flex items-start gap-3">
              <Sparkles className="text-blue-400 w-5 h-5 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">AI Vorschläge für Kampagne</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Basierend на Kampagnenverlauf: "Case Study Launch Q4"</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}


