import { useState } from 'react';
import { Plus, X, Calendar, Bed, CreditCard, Mail, Edit2, Trash2 } from 'lucide-react';
import { type ApiReservation, type ApiRoom, api } from './api';
import { useAuth } from './useAuth';

interface ReservationsEnCoursProps {
  reservations: ApiReservation[];
  rooms: ApiRoom[];
  onReservationChanged: () => void;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  "En attente": { bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-500" },
  "Confirme": { bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500" },
  "Annule": { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-500" }
};

const avatarColors = [
  "bg-purple-100 text-purple-700",
  "bg-teal-100 text-teal-700", "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700", "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700"
];

export default function ReservationEnCours({ 
  reservations, 
  rooms,
  onReservationChanged
}: ReservationsEnCoursProps) {
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRes, setSelectedRes] = useState<ApiReservation | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<ApiReservation | null>(null);
  
  const [formData, setFormData] = useState({
    roomId: '',
    checkIn: '',
    checkOut: '',
    status: 'Confirme',
    adults: '1',
    children: '0'
  });

  const calculateNights = (checkIn: string, checkOut: string) => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }
    return 0;
  };

  const getRoom = (id: string | number) => {
    return rooms.find(r => r.id.toString() === id.toString());
  };

  const nights = calculateNights(formData.checkIn, formData.checkOut);
  const selectedRoom = getRoom(formData.roomId);
  const pricePerNight = selectedRoom?.pricePerNight || 0;
  
  const calculateModalTotal = () => {
    const adultsNum = Number(formData.adults) || 1;
    const childrenNum = Number(formData.children) || 0;
    const totalPeople = adultsNum + childrenNum;
    let extraSupplement = 0;
    if (totalPeople > 4) {
      extraSupplement = (totalPeople - 4) * 10000;
    }
    return nights * (pricePerNight + extraSupplement);
  };
  
  const totalPrice = calculateModalTotal();

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (nights <= 0) {
      alert('Veuillez sélectionner des dates valides');
      return;
    }
    if (!formData.roomId) {
      alert('Veuillez sélectionner une chambre');
      return;
    }
    
    try {
      await api.createReservation(user.token!, {
        userId: Number(user.id),
        roomId: Number(formData.roomId),
        arrivalDate: formData.checkIn,
        departureDate: formData.checkOut,
        adults: Number(formData.adults) || 1,
        children: Number(formData.children) || 0
      });
      onReservationChanged();
      setShowAddModal(false);
      setFormData({
        roomId: '',
        checkIn: '',
        checkOut: '',
        status: 'Confirme',
        adults: '1',
        children: '0'
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRes && user) {
        try {
          await api.updateReservation(user.token!, selectedRes.id, {
            roomId: Number(formData.roomId),
            arrivalDate: formData.checkIn,
            departureDate: formData.checkOut,
            status: formData.status,
            adults: Number(formData.adults) || 1,
            children: Number(formData.children) || 0
          });
          onReservationChanged();
        setShowEditModal(false);
        setSelectedRes(null);
      } catch(err) {
        alert(err instanceof Error ? err.message : 'Erreur');
      }
    }
  };

  const openEditModal = (res: ApiReservation) => {
    setSelectedRes(res);
    setFormData({
      roomId: res.room.id.toString(),
      checkIn: res.arrivalDate.split('T')[0],
      checkOut: res.departureDate.split('T')[0],
      status: res.status,
      adults: '1',
      children: '0'
    });
    setShowEditModal(true);
  };

  const openDetailsModal = (res: ApiReservation) => {
    setSelectedDetails(res);
    setShowDetailsModal(true);
  };

  const handleCancel = async (id: number, guest: string) => {
    if (confirm(`Êtes-vous sûr de vouloir annuler la réservation de ${guest} ?`)) {
      if (user) {
        try {
           await api.updateReservation(user.token!, id, { status: 'Annule' });
           onReservationChanged();
        } catch(err) {
           alert(err instanceof Error ? err.message : 'Erreur');
        }
      }
    }
  };

  const formatPrice = (price: number) => price.toLocaleString() + ' FCFA';

  // Filter out non-active reservations
  const activeReservations = reservations.filter(r => r.status !== 'Terminee' && r.status !== 'Annule');

  const totalReservations = activeReservations.length;
  const totalRevenue = activeReservations.reduce((sum, r) => sum + r.totalAmount, 0);
  const totalNights = activeReservations.reduce((sum, r) => sum + calculateNights(r.arrivalDate, r.departureDate), 0);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Réservations en cours</h1>
          <p className="text-gray-500 text-sm mt-1">
            {totalReservations} réservation(s) active(s)
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-xl hover:bg-amber-600 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nouvelle réservation
        </button>
      </div>

      {/* Cartes statistiques */}
      {totalReservations > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-gray-900 to-yellow-500  rounded-xl p-4 text-white">
            <p className="text-sm opacity-90">Total réservations</p>
            <p className="text-2xl font-bold">{totalReservations}</p>
          </div>
          <div className="bg-gradient-to-r from-gray-900 to-yellow-500 rounded-xl p-4 text-white">
            <p className="text-sm opacity-90">Revenu total</p>
            <p className="text-2xl font-bold">{formatPrice(totalRevenue)}</p>
          </div>
          <div className="bg-gradient-to-r from-gray-900 to-yellow-500 rounded-xl p-4 text-white">
  <p className="text-sm opacity-90">Nuits totales</p>
  <p className="text-2xl font-bold">{totalNights} nuits</p>
        </div>
        </div>
      )}

      {/* Liste des réservations */}
      <div className="space-y-3">
        {activeReservations.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucune réservation en cours</p>
            <p className="text-sm text-gray-400 mt-1">Vous n'avez pas encore de réservation active</p>
            <button onClick={() => setShowAddModal(true)} className="mt-4 text-amber-600 font-medium hover:underline">
              Faire une réservation
            </button>
          </div>
        ) : (
          activeReservations.map((res, i) => {
            const avatar = res.user.name.split(' ').map(n => n[0]).join('').toUpperCase();
            return (
            <div 
              key={res.id} 
              className="bg-white rounded-2xl border p-5 hover:shadow-md transition cursor-pointer"
              onClick={() => openDetailsModal(res)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-semibold ${avatarColors[i % avatarColors.length]}`}>
                      {avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-lg">{res.user.name}</p>
                      <p className="text-xs text-gray-400">ID: {res.id}</p>
                    </div>
                    <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${statusConfig[res.status]?.bg} ${statusConfig[res.status]?.text}`}>
                      {res.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Chambre</p>
                      <p className="font-medium text-gray-800">{res.room.hotel.name}</p>
                      <p className="text-xs text-gray-400">{res.room.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Dates</p>
                      <p className="text-sm font-medium">{res.arrivalDate.split('T')[0]}</p>
                      <p className="text-xs text-gray-400">→ {res.departureDate.split('T')[0]}</p>
                      <p className="text-xs text-gray-400">{calculateNights(res.arrivalDate, res.departureDate)} nuits</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Montant</p>
                      <p className="text-lg font-bold text-amber-600">{formatPrice(res.totalAmount)}</p>
                      <p className="text-xs text-gray-400">{formatPrice(res.room.pricePerNight)}/nuit</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t flex gap-4 text-xs text-gray-500">
                    <p className="flex items-center gap-1"><Mail className="w-3 h-3" /> {res.user.email}</p>
                  </div>
                </div>

                <div className="flex gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openEditModal(res)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                    title="Modifier"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCancel(res.id, res.user.name)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Annuler"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )})
        )}
      </div>

      {/* Modal Ajout */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Nouvelle réservation</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-5">
              {/* Dates */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" /> Dates du séjour
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Arrivée *</label>
                    <input type="date" required className="w-full px-4 py-2 border rounded-lg" 
                      value={formData.checkIn} onChange={e => setFormData({...formData, checkIn: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Départ *</label>
                    <input type="date" required className="w-full px-4 py-2 border rounded-lg" 
                      value={formData.checkOut} onChange={e => setFormData({...formData, checkOut: e.target.value})} />
                  </div>
                </div>
                {formData.checkIn && formData.checkOut && nights > 0 && (
                  <div className="mt-2 text-sm text-gray-600">📅 {nights} nuit{nights > 1 ? 's' : ''}</div>
                )}
              </div>

              {/* Hébergement */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Bed className="w-5 h-5 text-amber-500" /> Hébergement
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Chambre *</label>
                    <select required className="w-full px-4 py-2 border rounded-lg" 
                      value={formData.roomId} onChange={e => setFormData({...formData, roomId: e.target.value})}>
                      <option value="">Sélectionner une chambre</option>
                      {rooms.filter(r => r.available).map(room => (
                        <option key={room.id} value={room.id}>
                          {room.hotel.name} - {room.type} - {formatPrice(room.pricePerNight)}/nuit
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Adultes</label>
                      <select className="w-full px-4 py-2 border rounded-lg" value={formData.adults} onChange={e => setFormData({...formData, adults: e.target.value})}>
                        {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Enfants</label>
                      <select className="w-full px-4 py-2 border rounded-lg" value={formData.children} onChange={e => setFormData({...formData, children: e.target.value})}>
                        {[0,1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Paiement */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-500" /> Paiement
                </h3>
                {formData.checkIn && formData.checkOut && formData.roomId && nights > 0 && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">{nights} nuit{nights > 1 ? 's' : ''} × {formatPrice(pricePerNight)}</p>
                        <p className="text-xs text-gray-500">Total à payer</p>
                      </div>
                      <span className="text-2xl font-bold text-amber-600">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 border py-2 rounded-lg">Annuler</button>
                <button type="submit" className="flex-1 bg-amber-500 text-white py-2 rounded-lg font-semibold">Confirmer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Édition */}
      {showEditModal && selectedRes && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between">
              <h2 className="text-xl font-bold">Modifier la réservation</h2>
              <button onClick={() => setShowEditModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Chambre</label>
                <select className="w-full p-2 border rounded-lg" value={formData.roomId} onChange={e => setFormData({...formData, roomId: e.target.value})}>
                  {rooms.map(room => <option key={room.id} value={room.id}>{room.hotel.name} - {room.type} - {formatPrice(room.pricePerNight)}/nuit</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Arrivée</label>
                  <input type="date" className="w-full p-2 border rounded-lg" value={formData.checkIn} onChange={e => setFormData({...formData, checkIn: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Départ</label>
                  <input type="date" className="w-full p-2 border rounded-lg" value={formData.checkOut} onChange={e => setFormData({...formData, checkOut: e.target.value})} />
                </div>
              </div>
              {formData.checkIn && formData.checkOut && formData.roomId && (
                <div className="p-3 bg-amber-50 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-sm">Total pour {calculateNights(formData.checkIn, formData.checkOut)} nuit(s) :</span>
                    <span className="font-bold text-amber-600">
                      {formatPrice((getRoom(formData.roomId)?.pricePerNight || 0) * calculateNights(formData.checkIn, formData.checkOut))}
                    </span>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Statut</label>
                <select className="w-full p-2 border rounded-lg" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="Confirme">Confirmée</option>
                  <option value="En attente">En attente</option>
                  <option value="Annule">Annulée</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-amber-500 text-white py-2 rounded-lg font-semibold">Enregistrer</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Détails */}
      {showDetailsModal && selectedDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Détails de la réservation</h2>
              <button onClick={() => setShowDetailsModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">ID</span>
                <span className="font-medium">{selectedDetails.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Client</span>
                <span className="font-medium">{selectedDetails.user.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Contact</span>
                <span>{selectedDetails.user.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Chambre</span>
                <span>{selectedDetails.room.hotel.name} ({selectedDetails.room.type})</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Dates</span>
                <span>{selectedDetails.arrivalDate.split('T')[0]} → {selectedDetails.departureDate.split('T')[0]}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Prix par nuit</span>
                <span>{formatPrice(selectedDetails.room.pricePerNight)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Montant total</span>
                <span className="font-bold text-amber-600">{formatPrice(selectedDetails.totalAmount)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Statut</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${statusConfig[selectedDetails.status]?.bg} ${statusConfig[selectedDetails.status]?.text}`}>
                  {selectedDetails.status}
                </span>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => { setShowDetailsModal(false); openEditModal(selectedDetails); }} className="flex-1 bg-blue-500 text-white py-2 rounded-lg">Modifier</button>
                <button onClick={() => { handleCancel(selectedDetails.id, selectedDetails.user.name); setShowDetailsModal(false); }} className="flex-1 bg-red-500 text-white py-2 rounded-lg">Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
