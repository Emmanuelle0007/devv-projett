import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { type ApiReservation, api } from './api';
import { useAuth } from './useAuth';

interface HistoriqueProps {
  reservations: ApiReservation[];
  onReservationChanged: () => void;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  "Terminee": { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  "Annule": { bg: "bg-red-100", text: "text-red-600", dot: "bg-red-500" },
};

const avatarColors = [
  "bg-purple-100 text-purple-700",
  "bg-teal-100 text-teal-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
];

export default function Historique({ reservations, onReservationChanged }: HistoriqueProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  
  const filtered = reservations.filter(r => 
    r.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenu = reservations.reduce((sum, r) => sum + r.totalAmount, 0);
  const formatPrice = (price: number) => price.toLocaleString() + ' FCFA';

  const handleDeleteReservation = async (id: number) => {
    if (confirm(`Supprimer ?`)) {
      if (user) {
         try {
            await api.deleteReservation(user.token!, id);
            onReservationChanged();
         } catch(err) {
            alert(err instanceof Error ? err.message : 'Erreur');
         }
      }
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Historique</h2>
          <p className="text-sm text-gray-500 mt-1">{reservations.length} réservation(s)</p>
        </div>
        <div className="bg-white rounded-xl px-4 py-2 border">
          <p className="text-xs text-gray-500">Revenu total</p>
          <p className="text-lg font-bold text-amber-600">{formatPrice(totalRevenu)}</p>
        </div>
      </div>

      <div className="relative">
        <input type="text" placeholder="Rechercher..." className="w-full px-4 py-2 pl-10 border rounded-lg" 
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border">
            <p className="text-gray-500">Aucune réservation trouvée</p>
          </div>
        ) : (
          filtered.map((res, i) => {
            const avatar = res.user.name.split(' ').map(n => n[0]).join('').toUpperCase();
            return (
            <div key={res.id} className="bg-white rounded-2xl border p-4 hover:shadow-md">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${avatarColors[i % avatarColors.length]}`}>
                      {avatar}
                    </div>
                    <div>
                      <p className="font-semibold">{res.user.name}</p>
                      <p className="text-xs text-gray-400">ID: {res.id}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${statusConfig[res.status]?.bg || 'bg-gray-100 text-gray-600'}`}>
                      {res.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div><p className="text-xs text-gray-500">Chambre</p><p>{res.room.hotel.name} - {res.room.type}</p></div>
                    <div><p className="text-xs text-gray-500">Dates</p><p>{res.arrivalDate.split('T')[0]} → {res.departureDate.split('T')[0]}</p></div>
                    <div><p className="text-xs text-gray-500">Montant</p><p className="font-bold text-amber-600">{formatPrice(res.totalAmount)}</p></div>
                  </div>
                </div>
                <button onClick={() => handleDeleteReservation(res.id)} 
                  className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )})
        )}
      </div>
    </div>
  );
}