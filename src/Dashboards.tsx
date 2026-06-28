import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import Sidebar from './Sidebar'
import ReservationsEnCours from './ReservationEnCours'
import Historique from './Historiques'
import Profile from './profile'
import { api, type ApiReservation, type ApiRoom, type ApiUser } from './api'
import { X, Calendar, Bed, CreditCard, Users, Phone } from 'lucide-react'

type DashboardPage = 'dashboard' | 'reservations' | 'historique' | 'profile'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [currentPage, setCurrentPage] = useState<DashboardPage>('dashboard')
  const [reservations, setReservations] = useState<ApiReservation[]>([])
  const [rooms, setRooms] = useState<ApiRoom[]>([])
  const [loading, setLoading] = useState(true)
  
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingData, setBookingData] = useState({ roomId: '', arrivalDate: '', departureDate: '', name: '', email: '', phone: '', adults: '1', children: '0' })
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    if (user?.token && user?.id) {
      Promise.all([
        api.userReservations(user.id, user.token),
        api.rooms()
      ]).then(([res, rms]) => {
        setReservations(res)
        setRooms(rms)
        setLoading(false)
      }).catch(err => {
        console.error('Error fetching data', err)
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [user])

  const handleUpdateProfile = (newProfile: Partial<ApiUser>) => {
    if (!user) return
    api.updateUser(user.token!, user.id, newProfile).then(() => {
       window.location.reload()
    })
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !bookingData.roomId || !bookingData.arrivalDate || !bookingData.departureDate) return;
    
    setBookingLoading(true);
    try {
      await api.createReservation(user.token!, {
        userId: Number(user.id),
        roomId: Number(bookingData.roomId),
        arrivalDate: bookingData.arrivalDate,
        departureDate: bookingData.departureDate,
        adults: Number(bookingData.adults) || 1,
        children: Number(bookingData.children) || 0
      });
      // Refresh reservations
      const updatedReservations = await api.userReservations(user.id, user.token!);
      setReservations(updatedReservations);
      setShowBookingModal(false);
      setBookingData({ roomId: '', arrivalDate: '', departureDate: '', name: '', email: '', phone: '', adults: '1', children: '0' });
      alert('Réservation confirmée avec succès !');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la réservation');
    } finally {
      setBookingLoading(false);
    }
  };

  const selectedRoom = rooms.find(r => r.id.toString() === bookingData.roomId);

  const calculateNights = () => {
    if (!bookingData.arrivalDate || !bookingData.departureDate) return 0;
    const start = new Date(bookingData.arrivalDate).getTime();
    const end = new Date(bookingData.departureDate).getTime();
    if (end <= start) return 0;
    return Math.ceil((end - start) / (1000 * 3600 * 24));
  };

  const calculateTotal = () => {
    if (!bookingData.roomId || !bookingData.arrivalDate || !bookingData.departureDate) return 0;
    const room = rooms.find(r => r.id.toString() === bookingData.roomId);
    if (!room) return 0;
    const start = new Date(bookingData.arrivalDate).getTime();
    const end = new Date(bookingData.departureDate).getTime();
    if (end <= start) return 0;
    const nights = Math.ceil((end - start) / (1000 * 3600 * 24));
    
    const adults = Number(bookingData.adults) || 1;
    const children = Number(bookingData.children) || 0;
    const totalPeople = adults + children;
    let extraSupplement = 0;
    if (totalPeople > 4) {
      extraSupplement = (totalPeople - 4) * 10000;
    }
    
    return nights * (room.pricePerNight + extraSupplement);
  };

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const formatPrice = (price: number) => price.toLocaleString() + ' FCFA'
  const totalReservations = reservations.filter(
    r => r.status !== 'Terminee' && r.status !== 'Annule'
  ).length
  const totalRevenue = reservations.reduce((sum, r) => sum + r.totalAmount, 0)
  const completedReservations = reservations.filter(r => r.status === 'Terminee').length
  const cancelledReservations = reservations.filter(r => r.status === 'Annule').length

  if (loading) return <div className="flex h-screen items-center justify-center">Chargement...</div>

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar activePage={currentPage} onPageChange={setCurrentPage} onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto p-6">
        {currentPage === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
                <p className="text-gray-500">Bienvenue, {user?.name}</p>
              </div>
              <button 
                onClick={() => setShowBookingModal(true)}
                className="mt-4 md:mt-0 bg-[#D4A853] hover:bg-[#b58f45] text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                Nouvelle Réservation
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-5 shadow-sm border">
                <p className="text-sm text-gray-500">Reservations en cours</p>
                <p className="text-2xl font-bold text-amber-600">{totalReservations}</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border">
                <p className="text-sm text-gray-500">Revenu total</p>
                <p className="text-2xl font-bold text-green-600">{formatPrice(totalRevenue)}</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border">
                <p className="text-sm text-gray-500">Reservations terminees</p>
                <p className="text-2xl font-bold text-blue-600">{completedReservations}</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border">
                <p className="text-sm text-gray-500">Reservations annulees</p>
                <p className="text-2xl font-bold text-red-600">{cancelledReservations}</p>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'reservations' && (
          <ReservationsEnCours
            reservations={reservations}
            rooms={rooms}
            onReservationChanged={() => {
              if (user) {
                api.userReservations(user.id, user.token!).then(setReservations)
              }
            }}
          />
        )}

        {currentPage === 'historique' && (
          <Historique
            reservations={reservations.filter(r => r.status === 'Terminee' || r.status === 'Annule')}
            onReservationChanged={() => {
              if (user) {
                api.userReservations(user.id, user.token!).then(setReservations)
              }
            }}
          />
        )}

        {currentPage === 'profile' && user && (
          <Profile
            profile={{
              name: user.name,
              email: user.email,
              phone: '',
              address: '',
              avatar: user.name.split(' ').map(n => n[0]).join('').toUpperCase()
            }}
            onUpdateProfile={handleUpdateProfile}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Nouvelle réservation</h2>
              <button onClick={() => setShowBookingModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleBookingSubmit} className="p-6 space-y-5">

              {/* Informations client */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-500" /> Informations client
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nom complet *</label>
                    <input type="text" required className="w-full px-4 py-2 border rounded-lg"
                      value={bookingData.name}
                      onChange={e => setBookingData({...bookingData, name: e.target.value})}
                      placeholder={user?.name || ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input type="email" className="w-full px-4 py-2 border rounded-lg"
                      value={bookingData.email}
                      onChange={e => setBookingData({...bookingData, email: e.target.value})}
                      placeholder={user?.email || ''}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">Téléphone *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input type="tel" required className="w-full pl-10 pr-4 py-2 border rounded-lg"
                      value={bookingData.phone}
                      onChange={e => setBookingData({...bookingData, phone: e.target.value})}
                      placeholder="+221 77 000 00 00"
                    />
                  </div>
                </div>
              </div>

              {/* Dates du séjour */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" /> Dates du séjour
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Arrivée *</label>
                    <input type="date" required className="w-full px-4 py-2 border rounded-lg"
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingData.arrivalDate}
                      onChange={e => setBookingData({...bookingData, arrivalDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Départ *</label>
                    <input type="date" required className="w-full px-4 py-2 border rounded-lg"
                      min={bookingData.arrivalDate || new Date().toISOString().split('T')[0]}
                      value={bookingData.departureDate}
                      onChange={e => setBookingData({...bookingData, departureDate: e.target.value})}
                    />
                  </div>
                </div>
                {calculateNights() > 0 && (
                  <div className="mt-2 text-sm text-gray-600">📅 {calculateNights()} nuit{calculateNights() > 1 ? 's' : ''}</div>
                )}
              </div>

              {/* Hébergement */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Bed className="w-5 h-5 text-amber-500" /> Hébergement
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Chambre *</label>
                    <select required className="w-full px-4 py-2 border rounded-lg"
                      value={bookingData.roomId}
                      onChange={e => setBookingData({...bookingData, roomId: e.target.value})}
                    >
                      <option value="">Sélectionner une chambre</option>
                      {rooms.filter(r => r.available).map(room => (
                        <option key={room.id} value={room.id}>
                          {room.hotel.name} - {room.type} - {formatPrice(room.pricePerNight)}/nuit
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Type de chambre</label>
                    <input type="text" readOnly className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                      value={selectedRoom?.type || ''}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Adultes *</label>
                    <input type="number" required min="1" max="10" className="w-full px-4 py-2 border rounded-lg"
                      value={bookingData.adults}
                      onChange={e => setBookingData({...bookingData, adults: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Enfants</label>
                    <input type="number" min="0" max="10" className="w-full px-4 py-2 border rounded-lg"
                      value={bookingData.children}
                      onChange={e => setBookingData({...bookingData, children: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Paiement */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-500" /> Paiement
                </h3>
                {calculateTotal() > 0 ? (
                  <div className="mt-3 p-3 bg-amber-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">{calculateNights()} nuit{calculateNights() > 1 ? 's' : ''} × {formatPrice(selectedRoom?.pricePerNight || 0)}</p>
                        <p className="text-xs text-gray-500">Total à payer</p>
                      </div>
                      <span className="text-2xl font-bold text-amber-600">{formatPrice(calculateTotal())}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Sélectionnez une chambre et des dates pour voir le montant.</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowBookingModal(false)} className="flex-1 border py-2 rounded-lg hover:bg-gray-50 transition">Annuler</button>
                <button
                  type="submit"
                  disabled={bookingLoading || calculateTotal() <= 0}
                  className="flex-1 bg-amber-500 text-white py-2 rounded-lg font-semibold hover:bg-amber-600 transition disabled:opacity-50"
                >
                  {bookingLoading ? 'En cours...' : 'Confirmer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
