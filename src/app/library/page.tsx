"use client"

import { useEffect, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { useAuth } from "@/hooks/use-auth"
import { getLibraries, getItems, type LibraryFolder, type LibraryItem } from "@/lib/library"
import { SyncIcon } from "@/components/icons/sync-icon"
import { Search, Film, Monitor, Headphones, Loader2, ChevronLeft } from "lucide-react"

export default function LibraryPage() {
  const { session } = useAuth()
  const [libraries, setLibraries] = useState<LibraryFolder[]>([])
  const [items, setItems] = useState<LibraryItem[]>([])
  const [total, setTotal] = useState(0)
  const [selectedLib, setSelectedLib] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    getLibraries().then((libs) => {
      setLibraries(libs)
      setLoading(false)
    })
  }, [])

  const loadItems = useCallback(async (libraryId?: string, type?: string, search?: string) => {
    setSearching(true)
    try {
      const result = await getItems(libraryId || undefined, {
        type: type === "all" ? undefined : type,
        limit: 50,
        sortBy: "SortName",
        searchTerm: search,
      })
      setItems(result.items)
      setTotal(result.total)
    } catch {}
    setSearching(false)
  }, [])

  useEffect(() => {
    if (selectedLib) {
      loadItems(selectedLib, selectedType, searchTerm)
    }
  }, [selectedLib, selectedType, searchTerm, loadItems])

  const handleSelectLib = (libId: string) => {
    if (selectedLib === libId) {
      setSelectedLib(null)
      setItems([])
      setTotal(0)
    } else {
      setSelectedLib(libId)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const serverUrl = session?.serverUrl || ""
  const token = session?.token || ""

  return (
    <div className="pt-[72px] px-4 pb-4">
      <Header title="Biblioteca" />

      {/* Search */}
      <div className="relative mt-2 mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dim" />
        <input
          placeholder="Buscar en tu biblioteca..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full rounded-[14px] bg-carbon-3 pl-11 pr-4 py-3.5 text-[15px] text-blanco-calido placeholder-dim outline-none border border-transparent focus:border-escarlata transition-colors"
        />
      </div>

      {/* Libraries */}
      {!selectedLib && (
        <>
          <h2 className="text-[20px] font-[650] leading-[1.2] tracking-[-0.01em] text-blanco-calido mb-3">
            Tus bibliotecas
          </h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="animate-spin text-dim" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {libraries.map((lib) => (
                <Card
                  key={lib.id}
                  className="flex flex-col items-center gap-2 py-6 hover:bg-carbon-3 transition-colors cursor-pointer"
                  onClick={() => handleSelectLib(lib.id)}
                >
                  <div className="w-10 h-10 rounded-full bg-escarlata/15 flex items-center justify-center">
                    {lib.collectionType === "movies" ? (
                      <Film size={20} className="text-escarlata" />
                    ) : lib.collectionType === "tvshows" ? (
                      <Monitor size={20} className="text-escarlata" />
                    ) : lib.collectionType === "music" ? (
                      <Headphones size={20} className="text-escarlata" />
                    ) : (
                      <Film size={20} className="text-escarlata" />
                    )}
                  </div>
                  <span className="text-[13px] font-semibold text-blanco-calido">{lib.name}</span>
                  <span className="text-[12px] text-dim">{lib.itemCount || 0} elementos</span>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Library content */}
      {selectedLib && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => { setSelectedLib(null); setItems([]); setSearchTerm("") }} className="text-dim hover:text-blanco-calido transition-colors">
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-[20px] font-[650] leading-[1.2] tracking-[-0.01em] text-blanco-calido">
              {libraries.find((l) => l.id === selectedLib)?.name || "Biblioteca"}
            </h2>
            <span className="text-[12px] text-dim ml-auto">{total} items</span>
          </div>

          {/* Type filter */}
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {["all", "Movie", "Series", "Music"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-[12px] text-[13px] font-medium whitespace-nowrap transition-colors ${
                  selectedType === type ? "bg-escarlata text-blanco-calido" : "bg-carbon-3 text-muted hover:text-blanco-calido"
                }`}
              >
                {type === "all" ? "Todo" : type === "Movie" ? "Películas" : type === "Series" ? "Series" : "Música"}
              </button>
            ))}
          </div>

          {searching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="animate-spin text-dim" />
            </div>
          ) : items.length > 0 ? (
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <Card key={item.id} className="flex items-center gap-4 py-3 hover:bg-carbon-3 transition-colors cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-carbon-3 flex items-center justify-center shrink-0 overflow-hidden">
                    {item.imageTags?.Primary ? (
                      <img
                        src={`${serverUrl}/Items/${item.id}/Images/Primary?api_key=${token}&maxWidth=96`}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <Film size={16} className="text-dim" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold text-blanco-calido truncate">{item.name}</h3>
                    <p className="text-[13px] text-muted">
                      {item.type === "Movie" ? "Película" : item.type === "Series" ? "Serie" : item.type}
                      {item.year ? ` · ${item.year}` : ""}
                    </p>
                  </div>
                  <Badge variant="dim">
                    {item.type === "Movie" ? "Película" : item.type === "Series" ? "Serie" : item.type}
                  </Badge>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-dim text-center py-12">
              {searchTerm ? "Sin resultados" : "Esta biblioteca está vacía"}
            </p>
          )}
        </>
      )}
    </div>
  )
}