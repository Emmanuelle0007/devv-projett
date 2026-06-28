import { useState, useEffect } from "react"
import { api, type ApiReservation } from "../../api"
import { useAuth } from "../../useAuth"
import Badge from "../ui/Badge"

export default function ReservationsPage() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState<ApiReservation[]>([])
  const [search, setSearch] = useState("")

  const loadReservations = () => {
    if (user) {
      api.reservations(user.token!)
         .then(setReservations)
         .catch(err => alert(err instanceof Error ? err.message : 'Erreur'))
    }
  }

  useEffect(() => {
    loadReservations()
  }, [user])

  const updateStatus = async (id: number, status: string) => {
    if (user) {
      try {
        await api.updateReservation(user.token!, id, { status })
        loadReservations()
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erreur')
      }
    }
  }

  const confirmRes = (id: number) => updateStatus(id, "Confirme")
  const cancelRes  = (id: number) => updateStatus(id, "Annule")
  const waitRes    = (id: number) => updateStatus(id, "En attente")

  const filtered = reservations.filter(r =>
    r.user.name.toLowerCase().includes(search.toLowerCase()) ||
    r.room.hotel.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1f2937", margin: "0 0 2px" }}>Gestion des réservations</h2>
          <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>{reservations.length} réservations au total</p>
        </div>
        <input
          placeholder="Rechercher client ou hôtel..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: "10px 14px", fontSize: 13, width: 240, outline: "none" }}
        />
      </div>

      <div style={{ background: "white", borderRadius: 14, border: "1px solid #f0f0f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Client", "Hôtel", "Chambre", "Arrivée", "Départ", "Montant", "Statut", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} style={{ borderBottom: "1px solid #f9fafb" }}>
                <td style={{ padding: "13px 14px", fontWeight: 600, color: "#1f2937" }}>{r.user.name}</td>
                <td style={{ padding: "13px 14px", color: "#6b7280" }}>{r.room.hotel.name}</td>
                <td style={{ padding: "13px 14px", color: "#374151" }}>{r.room.type}</td>
                <td style={{ padding: "13px 14px", color: "#6b7280" }}>{r.arrivalDate.split('T')[0]}</td>
                <td style={{ padding: "13px 14px", color: "#6b7280" }}>{r.departureDate.split('T')[0]}</td>
                <td style={{ padding: "13px 14px", fontWeight: 700, color: "#3B82F6" }}>{r.totalAmount.toLocaleString()} FCFA</td>
                <td style={{ padding: "13px 14px" }}><Badge label={r.status} /></td>
                <td style={{ padding: "13px 14px" }}>
                  {r.status === "En attente" && <>
                    <button onClick={() => confirmRes(r.id)} style={{ background: "#dcfce7", color: "#166534", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", marginRight: 4 }}>Confirmer</button>
                    <button onClick={() => cancelRes(r.id)}  style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Annuler</button>
                  </>}
                  {r.status === "Confirme" && (
                    <button onClick={() => cancelRes(r.id)} style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Annuler</button>
                  )}
                  {r.status === "Annule" && (
                    <button onClick={() => waitRes(r.id)} style={{ background: "#dbeafe", color: "#1e40af", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Rétablir</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p style={{ textAlign: "center", color: "#9ca3af", padding: 32, fontSize: 14 }}>Aucun résultat pour "{search}"</p>
        )}
      </div>
    </div>
  )
}