import { useState, useEffect } from "react"
import { api, type ApiHotel } from "../../api"
import { useAuth } from "../../useAuth"
import Badge from "../ui/Badge"
import Modal from "../ui/Modal"

const inp: React.CSSProperties = {
  width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb",
  borderRadius: 8, fontSize: 14, boxSizing: "border-box", marginBottom: 12,
}

export default function HotelsPage() {
  const { user } = useAuth()
  const [hotels, setHotels] = useState<ApiHotel[]>([])
  const [modal, setModal] = useState<"add" | "edit" | null>(null)
  const [form, setForm] = useState<Partial<ApiHotel>>({ name: "", city: "", stars: 4, status: "Actif" })

  const loadHotels = () => {
    api.hotels().then(setHotels).catch(err => alert(err instanceof Error ? err.message : 'Erreur'))
  }

  useEffect(() => {
    loadHotels()
  }, [])

  const openAdd = () => { setForm({ name: "", city: "", stars: 4, status: "Actif" }); setModal("add") }
  const openEdit = (h: ApiHotel) => { setForm({ ...h }); setModal("edit") }
  
  const del = async (id: number) => {
    if (confirm("Voulez-vous supprimer cet hôtel ?")) {
      if (user) {
        try {
          await api.deleteHotel(user.token!, id)
          loadHotels()
        } catch (err) {
          alert(err instanceof Error ? err.message : 'Erreur')
        }
      }
    }
  }

  const save = async () => {
    if (!user) return
    try {
      if (modal === "add") {
        await api.createHotel(user.token!, form)
      } else if (form.id) {
        await api.updateHotel(user.token!, form.id, form)
      }
      loadHotels()
      setModal(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur')
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1f2937", margin: "0 0 2px" }}>Gestion des hôtels</h2>
          <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>{hotels.length} hôtels enregistrés</p>
        </div>
        <button onClick={openAdd} style={{ background: "#3B82F6", color: "white", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          + Ajouter un hôtel
        </button>
      </div>

      <div style={{ background: "white", borderRadius: 14, border: "1px solid #f0f0f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Hôtel", "Ville", "Étoiles", "Chambres", "Statut", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hotels.map(h => (
              <tr key={h.id} style={{ borderBottom: "1px solid #f9fafb" }}>
                <td style={{ padding: "14px 16px", fontWeight: 600, color: "#1f2937" }}>{h.name}</td>
                <td className="px-4 py-3.5 text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {h.city}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className={`w-4 h-4 ${i < (h.stars || 0) ? "text-yellow-400" : "text-gray-200"}`}
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                </td>
                <td style={{ padding: "14px 16px", color: "#374151" }}>{h.rooms?.length || 0}</td>
                <td style={{ padding: "14px 16px" }}><Badge label={h.status} /></td>
                <td style={{ padding: "14px 16px" }}>
                  <button onClick={() => openEdit(h)} style={{ background: "#eff6ff", color: "#3B82F6", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", marginRight: 6 }}>Modifier</button>
                  <button onClick={() => del(h.id)}   style={{ background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "add" ? "Ajouter un hôtel" : "Modifier l'hôtel"} onClose={() => setModal(null)}>
          <input style={inp} placeholder="Nom de l'hôtel" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input style={inp} placeholder="Ville" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input style={{ ...inp, marginBottom: 0 }} type="number" min={1} max={5} placeholder="Étoiles" value={form.stars} onChange={e => setForm({ ...form, stars:  +e.target.value })} />
          </div>
          <select style={{ ...inp, marginTop: 12 }} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="Actif">Actif</option><option value="Maintenance">Maintenance</option><option value="Fermé">Fermé</option>
          </select>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button onClick={() => setModal(null)} style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #e5e7eb", background: "white", cursor: "pointer", fontSize: 13 }}>Annuler</button>
            <button onClick={save}                 style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "#3B82F6", color: "white", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Enregistrer</button>
          </div>
        </Modal>
      )}
    </div>
  )
}