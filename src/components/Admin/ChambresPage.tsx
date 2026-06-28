import { useState, useEffect } from "react"
import { api, type ApiRoom, type ApiHotel } from "../../api"
import { useAuth } from "../../useAuth"
import Badge from "../ui/Badge"
import Modal from "../ui/Modal"

const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm mb-3 outline-none focus:border-blue-400"

export default function ChambresPage() {
  const { user } = useAuth()
  const [chambres, setChambres] = useState<ApiRoom[]>([])
  const [hotels, setHotels] = useState<ApiHotel[]>([])
  const [modal, setModal]       = useState<"add" | "edit" | null>(null)
  
  // Internal form state uses hotelId
  const [form, setForm] = useState<{id?: number, hotelId: string, type: string, pricePerNight: number, available: boolean}>({
    hotelId: "", type: "", pricePerNight: 0, available: true
  })

  const loadData = () => {
    Promise.all([api.rooms(), api.hotels()])
      .then(([resRooms, resHotels]) => {
        setChambres(resRooms)
        setHotels(resHotels)
      })
      .catch(err => alert(err instanceof Error ? err.message : 'Erreur'))
  }

  useEffect(() => {
    loadData()
  }, [])

  const openAdd = () => { 
    setForm({ hotelId: "", type: "", pricePerNight: 0, available: true })
    setModal("add") 
  }
  
  const openEdit = (c: ApiRoom) => { 
    setForm({ id: c.id, hotelId: c.hotel.id.toString(), type: c.type, pricePerNight: c.pricePerNight, available: c.available })
    setModal("edit") 
  }
  
  const del = async (id: number) => {
    if (confirm("Voulez-vous supprimer cette chambre ?")) {
      if (user) {
        try {
          await api.deleteRoom(user.token!, id)
          loadData()
        } catch (err) {
          alert(err instanceof Error ? err.message : 'Erreur')
        }
      }
    }
  }

  const save = async () => {
    if (!user) return
    try {
      const payload = {
        hotelId: Number(form.hotelId),
        type: form.type,
        pricePerNight: form.pricePerNight,
        available: form.available
      }
      
      if (modal === "add") {
        await api.createRoom(user.token!, payload)
      } else if (form.id) {
        await api.updateRoom(user.token!, form.id, payload)
      }
      loadData()
      setModal(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800 mb-0.5">Gestion des chambres</h2>
          <p className="text-xs text-gray-400">{chambres.length} chambres · {chambres.filter(c => c.available).length} disponibles</p>
        </div>
        <button onClick={openAdd} className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl border-none cursor-pointer transition-colors">
          + Ajouter une chambre
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50">
              {["Hôtel", "Type", "Prix / nuit", "Disponibilité", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 border-b border-gray-100">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chambres.map(c => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3.5 text-gray-500">{c.hotel.name}</td>
                <td className="px-4 py-3.5 font-semibold text-gray-800">{c.type}</td>
                <td className="px-4 py-3.5 font-bold text-blue-500">{c.pricePerNight.toLocaleString()} FCFA</td>
                <td className="px-4 py-3.5"><Badge label={c.available ? "Disponible" : "Indisponible"} /></td>
                <td className="px-4 py-3.5 flex gap-2">
                  <button onClick={() => openEdit(c)} className="bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-lg border-none cursor-pointer hover:bg-blue-100">Modifier</button>
                  <button onClick={() => del(c.id)}   className="bg-red-50 text-red-500 text-xs font-semibold px-3 py-1.5 rounded-lg border-none cursor-pointer hover:bg-red-100">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "add" ? "Ajouter une chambre" : "Modifier la chambre"} onClose={() => setModal(null)}>
          <select className={inputCls} value={form.hotelId} onChange={e => setForm({ ...form, hotelId: e.target.value })}>
            <option value="">Sélectionner un hôtel</option>
            {hotels.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
          <input className={inputCls} placeholder="Type de chambre"  value={form.type}  onChange={e => setForm({ ...form, type:  e.target.value })} />
          <input className={inputCls} type="number" placeholder="Prix par nuit (FCFA)" value={form.pricePerNight} onChange={e => setForm({ ...form, pricePerNight: +e.target.value })} />
          <label className="flex items-center gap-3 text-sm text-gray-700 mb-4 cursor-pointer">
            <input type="checkbox" checked={form.available} onChange={e => setForm({ ...form, available: e.target.checked })} className="w-4 h-4 accent-blue-500" />
            Chambre disponible
          </label>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setModal(null)} className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm cursor-pointer hover:bg-gray-50">Annuler</button>
            <button onClick={save}                 className="px-6 py-2.5 rounded-lg border-none bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm cursor-pointer">Enregistrer</button>
          </div>
        </Modal>
      )}
    </div>
  )
}