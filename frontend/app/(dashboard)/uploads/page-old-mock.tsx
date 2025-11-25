"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  File, 
  Image, 
  Video,
  FileText,
  Download,
  Trash2,
  Eye,
  Share,
  Plus,
  Filter,
  Search
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

export default function UploadsPage() {
  const { toast } = useToast()

  const handleUpload = () => {
    toast({
      title: "Upload",
      description: "Datei-Upload wird geöffnet...",
    })
  }

  const handleDownload = (fileName: string) => {
    toast({
      title: "Download",
      description: `${fileName} wird heruntergeladen...`,
    })
  }

  const handleDelete = (fileName: string) => {
    toast({
      title: "Löschen",
      description: `${fileName} wird gelöscht...`,
    })
  }

  const handleView = (fileName: string) => {
    toast({
      title: "Ansehen",
      description: `${fileName} wird geöffnet...`,
    })
  }

  const handleShare = (fileName: string) => {
    toast({
      title: "Teilen",
      description: `${fileName} wird geteilt...`,
    })
  }

  const uploads = [
    {
      id: 1,
      name: "Marketing_Presentation_Q4.pdf",
      type: "PDF",
      size: "2.4 MB",
      date: "2024-01-15",
      uploadedBy: "Admin",
      icon: FileText,
      color: "from-red-500 to-pink-600"
    },
    {
      id: 2,
      name: "Campaign_Banner_2024.jpg",
      type: "Image",
      size: "1.8 MB",
      date: "2024-01-14",
      uploadedBy: "Marketing Team",
      icon: Image,
      color: "from-blue-500 to-cyan-600"
    },
    {
      id: 3,
      name: "Product_Demo_Video.mp4",
      type: "Video",
      size: "15.2 MB",
      date: "2024-01-13",
      uploadedBy: "Content Team",
      icon: Video,
      color: "from-purple-500 to-pink-600"
    },
    {
      id: 4,
      name: "Brand_Guidelines.docx",
      type: "Document",
      size: "892 KB",
      date: "2024-01-12",
      uploadedBy: "Design Team",
      icon: File,
      color: "from-emerald-500 to-green-600"
    },
    {
      id: 5,
      name: "Logo_Variations.zip",
      type: "Archive",
      size: "3.7 MB",
      date: "2024-01-11",
      uploadedBy: "Design Team",
      icon: File,
      color: "from-orange-500 to-red-600"
    }
  ]

  const stats = [
    { title: "Gesamt Dateien", value: "127", icon: File, color: "from-blue-500 to-cyan-600" },
    { title: "Speicher verwendet", value: "2.8 GB", icon: Upload, color: "from-purple-500 to-pink-600" },
    { title: "Heute hochgeladen", value: "8", icon: Plus, color: "from-emerald-500 to-green-600" },
    { title: "Geteilte Dateien", value: "23", icon: Share, color: "from-orange-500 to-red-600" }
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-kaboom-red flex items-center justify-center">
            <Upload className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-kaboom-gray dark:text-white">Uploads</h1>
            <p className="text-kaboom-gray/70 dark:text-gray-300">Dateien verwalten und teilen</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => toast({ title: "Filter", description: "Filter wird angezeigt..." })}>
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button onClick={handleUpload} className="bg-kaboom-red hover:bg-kaboom-red/90 text-white">
            <Upload className="h-4 w-4 mr-2" />
            Datei hochladen
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="border-0 shadow-sm bg-white dark:bg-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-kaboom-gray/70 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-kaboom-gray dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Upload Area */}
      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-800/50">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-kaboom-red/10 flex items-center justify-center">
              <Upload className="h-8 w-8 text-kaboom-red" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-kaboom-gray dark:text-white">Dateien hier ablegen</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                oder klicken Sie hier, um Dateien auszuwählen
              </p>
            </div>
            <Button onClick={handleUpload} className="bg-kaboom-red hover:bg-kaboom-red/90 text-white">
              Dateien auswählen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Bar */}
      <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Suche nach Dateinamen, Typ oder Uploader..."
              className="pl-10 border-gray-300 dark:border-gray-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Files List */}
      <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-kaboom-gray dark:text-white">Hochgeladene Dateien</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {uploads.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow bg-gray-50 dark:bg-slate-700/50"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 bg-gradient-to-br ${file.color} rounded-lg flex items-center justify-center`}>
                    <file.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-kaboom-gray dark:text-white">{file.name}</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <Badge variant="outline">{file.type}</Badge>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{file.size}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{file.date}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">von {file.uploadedBy}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(file.name)}
                    className="border-kaboom-gray/20 dark:border-gray-600"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(file.name)}
                    className="border-kaboom-gray/20 dark:border-gray-600"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(file.name)}
                    className="border-kaboom-gray/20 dark:border-gray-600"
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(file.name)}
                    className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


