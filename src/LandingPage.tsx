import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { Card } from './Card';
import { Modal } from './Modal';
import { Button } from './Button';
import { OfferCard } from './OfferCard';
import { api, type ApiRoom, type ApiReservation } from './api';
const LOGO_SRC = '/src/assets/logo.png';
const LOGO_FALLBACK = 'IRMA';
const HERO_IMAGE = '/src/assets/lulu.jpg';

const hotels = [
    {
        id: 1,
        name: 'Le Grand Palais',
        location: 'Paris, France',
        price: 9999,
        rating: 6.9,
        reviews: 1284,
        category: 'Suite Royale',
        img: '/src/assets/paris1.jpg',
        hoverImages: ['/src/assets/paris-p.jpg', '/src/assets/paris2.jpg', '/src/assets/paris3.jpg'],
        tags: ['Spa', 'Piscine', 'Vue panoramique'],
    },
    {
        id: 2,
        name: 'Radisson Blu Dakar',
        location: 'Dakar, Sénégal',
        price: 1120,
        rating: 4.3,
        reviews: 842,
        category: 'Chambre Prestige',
        img: '/src/assets/dakar1.jpg',
        hoverImages: ['/src/assets/dakar-p.jpg', '/src/assets/dakar2.jpg', '/src/assets/dakar3.jpg'],
        tags: ['Plage privée', 'Restaurant', 'Bar'],
    },
    {
        id: 3,
        name: 'Burj Al Arab',
        location: 'Dubai, EAU',
        price: 7590,
        rating: 5.0,
        reviews: 3021,
        category: 'Chambre Royale',
        img: '/src/assets/dubai2.jpg',
        hoverImages: ['/src/assets/dubai1.jpg', '/src/assets/dubai-p.jpg', '/src/assets/dubai3.jpg'],
        tags: ['Butler privé', 'Hélipad', 'Plage'],
    },
    {
        id: 4,
        name: 'Les Tours Jumelles',
        location: 'Brazzaville, Congo',
        price: 4590,
        rating: 4.2,
        reviews: 567,
        category: 'Villa Exclusive',
        img: '/src/assets/congo1.jpg',
        hoverImages: ['/src/assets/Congo-p.jpg', '/src/assets/Congo2.jpg', '/src/assets/Congo3.jpg'],
        tags: ['Jardin', 'Hammam', 'Vue mer'],
    },
    {
        id: 5,
        name: 'Park Hyatt',
        location: 'Tokyo, Japon',
        price: 9459,
        rating: 5.8,
        reviews: 967,
        category: 'Hotel Luxueux',
        img: '/src/assets/Tokyo1.jpg',
        hoverImages: ['/src/assets/Tokyo-p.jpg', '/src/assets/Tokyo2.jpg', '/src/assets/Tokyo3.jpg'],
        tags: ['Jardin', 'Piscine', 'Spa', 'Lasaire massage', 'Uv massage'],
    },
    {
        id: 6,
        name: 'The Savoy',
        location: 'Londres, Angleterre',
        price: 4259,
        rating: 4.9,
        reviews: 2156,
        category: 'Suite Royale',
        img: '/src/assets/londre-p.jpg',
        hoverImages: ['/src/assets/londre1.jpg', '/src/assets/londre2.jpg', '/src/assets/londre3.jpg'],
        tags: ['Théâtre', 'Michelin Star', 'River View'],
    },
    {
        id: 7,
        name: 'Four Seasons',
        location: 'Marrakech, Maroc',
        price: 1859,
        rating: 4.8,
        reviews: 1432,
        category: 'Jardin Suite',
        img: '/src/assets/maroc-p.jpg',
        hoverImages: ['/src/assets/maroc1.jpg', '/src/assets/maroc2.jpg', '/src/assets/maroc3.jpg'],
        tags: ['Hammam', 'Jardin Andalous', 'Golf'],
    },
    {
        id: 8,
        name: 'Mandarin Oriental',
        location: 'Bangkok, Thaïlande',
        price: 2950,
        rating: 4.9,
        reviews: 1876,
        category: 'River View Suite',
        img: '/src/assets/tai-p.jpg',
        hoverImages: ['/src/assets/tai1.jpg', '/src/assets/tai2.jpg', '/src/assets/tai3.jpg'],
        tags: ['Spa', 'Cours de cuisine', 'Boat Transfer'],
    },
    {
        id: 9,
        name: 'Belmond Copacabana',
        location: 'Rio, Brésil',
        price: 2659,
        rating: 4.7,
        reviews: 1123,
        category: 'Ocean Front',
        img: '/src/assets/rio-p.jpg',
        hoverImages: ['/src/assets/rio1.jpg', '/src/assets/rio2.jpg', '/src/assets/rio3.jpg'],
        tags: ['Plage privée', 'Rooftop', 'Samba Night'],
    },
];

const offers = [
    {
        badge: '-30%',
        title: 'Escapade Week-end',
        desc: 'Tarifs préférentiels pour tout séjour du vendredi au dimanche dans nos hôtels partenaires.',
        img: '/src/assets/week.jpg',
        expires: '30 Mars 2026',
    },
    {
        badge: 'Petit-déjeuner offert',
        title: 'Séjour Romantique',
        desc: "Pour les couples : petit-déjeuner en chambre offert et bouteille de champagne à l'arrivée.",
        img: '/src/assets/Amureux.jpg',
        expires: '15 Avril 2026',
    },
    {
        badge: 'Nuit offerte',
        title: 'Long Séjour',
        desc: 'Réservez 6 nuits et la 7ème est offerte dans tous nos hôtels 5 étoiles.',
        img: '/src/assets/luvv.jpg',
        expires: '31 Mai 2027',
    },
];

const testimonials = [
    {
        name: 'Sophie Martin',
        country: 'France',
        hotel: 'Le Grand Palais, Paris',
        text: 'Une expérience absolument inoubliable. Le service était irréprochable et la chambre magnifique.',
        rating: 5,
    },
    {
        name: 'Ahmad Diallo',
        country: 'Sénégal',
        hotel: 'Radisson Blu, Dakar',
        text: 'Hôtel exceptionnel, personnel aux petits soins. Le restaurant propose une cuisine de grande qualité.',
        rating: 5,
    },
    {
        name: 'Lena Hoffmann',
        country: 'Allemagne',
        hotel: 'Les Tours Jumelles, Brazzaville',
        text: 'La villa est un véritable havre de paix. Le jardin, le hammam, la vue — tout était parfait.',
        rating: 5,
    },
];



type Hotel = typeof hotels[0];

function HotelCard({ hotel, onBookingAdded }: { hotel: Hotel; onBookingAdded: () => void }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isFav, setIsFav] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [bookingData, setBookingData] = useState({ checkin: '', checkout: '', guests: '2' });
    const [bookingSuccess, setBookingSuccess] = useState(false);

    const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!bookingData.checkin || !bookingData.checkout) return;

        if (!user) {
            navigate('/login', { state: { returnTo: '/' } });
            return;
        }

        try {
            await api.createReservation(user.token!, {
                userId: Number(user.id),
                roomId: Number(hotel.id), // Assign hotel ID as room ID for mockup
                arrivalDate: bookingData.checkin,
                departureDate: bookingData.checkout
            });

            onBookingAdded();
            setBookingSuccess(true);
            setTimeout(() => {
                setBookingSuccess(false);
                setShowModal(false);
                navigate(user.role === 'admin' ? '/dashboard/admin' : '/dashboards/user');
            }, 2000);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Erreur');
        }
    };

    return (
        <>
            <Card
                image={hotel.img}
                images={hotel.hoverImages}
                badge={hotel.category}
                favorite={isFav}
                onFavoriteToggle={() => setIsFav(!isFav)}
            >
                <h3 className="text-stone-900 font-semibold mb-1.5" style={{ fontSize: '18px' }}>
                    {hotel.name}
                </h3>
                <p className="text-stone-400 text-sm mb-4">{hotel.location}</p>
                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                    <span className="font-bold">{hotel.price.toLocaleString()} FCFA</span>
                    <Button onClick={() => {
                        if (!user) {
                            navigate('/login', { state: { returnTo: '/' } });
                        } else {
                            setShowModal(true);
                        }
                    }}>Réserver</Button>
                </div>
            </Card>

            <Modal
                isOpen={showModal}
                onClose={() => { if (!bookingSuccess) setShowModal(false); }}
                title={hotel.name}
            >
                {bookingSuccess ? (
                    <p className="text-green-600 text-center py-4 font-semibold">
                        Réservation confirmée !
                    </p>
                ) : (
                    <form onSubmit={handleBooking} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm text-stone-600 mb-1">Arrivée</label>
                            <input
                                type="date"
                                value={bookingData.checkin}
                                onChange={(e) => setBookingData({ ...bookingData, checkin: e.target.value })}
                                required
                                className="w-full border border-stone-200 rounded px-4 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-stone-600 mb-1">Départ</label>
                            <input
                                type="date"
                                value={bookingData.checkout}
                                onChange={(e) => setBookingData({ ...bookingData, checkout: e.target.value })}
                                required
                                className="w-full border border-stone-200 rounded px-4 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-stone-600 mb-1">Voyageurs</label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={bookingData.guests}
                                onChange={(e) => setBookingData({ ...bookingData, guests: e.target.value })}
                                required
                                className="w-full border border-stone-200 rounded px-4 py-2"
                            />
                        </div>
                        <div className="w-full pt-4">
                            <Button type="submit" className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold uppercase">
                                CONFIRMER LA RÉSERVATION
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </>
    );
}

export default function LandingPage() {
    const { user } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [email, setEmail] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [showAllHotels, setShowAllHotels] = useState(false);
    const [showBookingsModal, setShowBookingsModal] = useState(false);
    const [apiRooms, setApiRooms] = useState<ApiRoom[]>([]);
    const [bookingsVersion, setBookingsVersion] = useState(0);
    const [userBookings, setUserBookings] = useState<ApiReservation[]>([]);

    useEffect(() => {
        if (user && user.token) {
            api.userReservations(user.id, user.token).then(setUserBookings).catch(console.error);
        } else {
            setUserBookings([]);
        }
    }, [user, bookingsVersion]);

    useEffect(() => {
        api.rooms().then(setApiRooms).catch(console.error);
    }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    const refreshBookings = () => {
        setBookingsVersion(version => version + 1);
    };

    const dynamicHotels = useMemo(() => {
        if (apiRooms.length === 0) return hotels;
        return apiRooms.map((room, idx) => {
            const fallback = hotels[idx % hotels.length];
            return {
                ...fallback,
                id: room.id, // Use room id for the HotelCard booking logic
                name: room.hotel.name,
                location: room.hotel.city,
                price: room.pricePerNight,
                rating: room.hotel.stars,
                category: room.type,
            };
        });
    }, [apiRooms]);

    const displayedHotels = showAllHotels ? dynamicHotels : dynamicHotels.slice(0, 3);

    const handleNewsletter = () => {
        if (!email || !email.includes('@')) return;
        setEmailSent(true);
        setEmail('');
        setTimeout(() => setEmailSent(false), 4000);
    };


    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Jost:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Jost', sans-serif; margin: 0; padding: 0; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: opacity(0.4); cursor: pointer; }
        ::selection { background: #D4A853; color: white; }
        .fade-up { opacity: 0; transform: translateY(24px); animation: fadeUp 0.7s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }
        @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
      `}</style>

            {/* ====== NAVBAR ====== */}
            <nav
                className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
                style={{
                    background: scrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
                    backdropFilter: scrolled ? 'blur(20px)' : 'none',
                    borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
                    padding: scrolled ? '14px 0' : '22px 0',
                }}
            >
                <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
                    <a href="/" className="flex items-center gap-3">
                        <img
                            src={LOGO_SRC}
                            alt="Logo"
                            className="h-7 w-auto"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                        <span
                            style={{
                                fontFamily: "'Cormorant Garamond', Georgia, serif",
                                fontSize: '22px',
                                fontWeight: '500',
                                letterSpacing: '0.25em',
                                color: scrolled ? '#0F172A' : '#FFFFFF',
                                transition: 'color 0.3s',
                            }}
                        >
                        </span>
                    </a>

                    <ul className="hidden md:flex items-center gap-10">
                        {[
                            ['#hotels', 'Hôtels'],
                            ['#offres', 'Offres'],
                            ['#avis', 'Témoignages'],
                        ].map(([href, label]) => (
                            <li key={href}>
                                <a
                                    href={href}
                                    style={{
                                        color: scrolled ? '#57534E' : 'rgba(255,255,255,0.7)',
                                        fontSize: '11px',
                                        letterSpacing: '0.18em',
                                        textTransform: 'uppercase',
                                        transition: 'color 0.2s',
                                        fontWeight: '400',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = scrolled ? '#0F172A' : '#D4A853';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = scrolled ? '#57534E' : 'rgba(255,255,255,0.7)';
                                    }}
                                >
                                    {label}
                                </a>
                            </li>
                        ))}
                    </ul>

                    <div className="hidden md:flex items-center gap-5">
                        <button
                            onClick={() => setShowBookingsModal(true)}
                            style={{
                                color: scrolled ? '#57534E' : 'rgba(255,255,255,0.7)',
                                fontSize: '11px',
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                                transition: 'color 0.2s',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#D4A853';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = scrolled ? '#57534E' : 'rgba(255,255,255,0.7)';
                            }}
                        >
                            Mes Réservations {userBookings.length > 0 && `(${userBookings.length})`}
                        </button>
                        <a
                            href="/register"
                            className="transition-all duration-200 hover:opacity-90"
                            style={{
                                background: '#D4A853',
                                color: '#0F172A',
                                fontSize: '10px',
                                fontWeight: '500',
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                                padding: '10px 22px',
                                borderRadius: '2px',
                            }}
                        >
                            Réserver
                        </a>
                    </div>

                    <button
                        className="md:hidden"
                        style={{
                            color: scrolled ? '#0F172A' : '#FFFFFF',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {menuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {menuOpen && (
                    <div
                        className="md:hidden bg-white border-t px-8 py-6 flex flex-col gap-5"
                        style={{ borderColor: '#F0EDE8' }}
                    >
                        {[
                            ['#hotels', 'Hôtels'],
                            ['#offres', 'Offres'],
                            ['#avis', 'Témoignages'],
                        ].map(([href, label]) => (
                            <a
                                key={href}
                                href={href}
                                className="text-stone-500 hover:text-stone-900 transition-colors"
                                style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase' }}
                                onClick={() => setMenuOpen(false)}
                            >
                                {label}
                            </a>
                        ))}
                        <button
                            onClick={() => {
                                setShowBookingsModal(true);
                                setMenuOpen(false);
                            }}
                            className="text-stone-500 hover:text-stone-900 transition-colors text-left"
                            style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase' }}
                        >
                            Mes Réservations {userBookings.length > 0 && `(${userBookings.length})`}
                        </button>
                        <a
                            href="/register"
                            className="text-center"
                            style={{
                                background: '#0F172A',
                                color: 'white',
                                fontSize: '11px',
                                letterSpacing: '0.15em',
                                textTransform: 'uppercase',
                                padding: '12px',
                                borderRadius: '2px',
                            }}
                        >
                            Réserver
                        </a>
                    </div>
                )}
            </nav>

            {/* ====== HERO ====== */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={HERO_IMAGE}
                        alt="Hero"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=80';
                        }}
                    />
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'linear-gradient(to bottom, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.4) 50%, rgba(15,23,42,0.75) 100%)',
                        }}
                    />
                </div>

                <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
                    <div className="inline-flex items-center gap-3 mb-10 fade-up" style={{ animationDelay: '0.1s' }}>
                        <div style={{ width: '32px', height: '1px', background: '#D4A853' }} />
                        <span className="text-white/60 uppercase" style={{ fontSize: '10px', letterSpacing: '0.3em' }}>
                            Collection Prestige 2025
                        </span>
                        <div style={{ width: '32px', height: '1px', background: '#D4A853' }} />
                    </div>

                    <h1
                        className="text-white mb-6 fade-up"
                        style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            fontSize: 'clamp(42px, 8vw, 88px)',
                            fontWeight: '300',
                            lineHeight: '1.05',
                            animationDelay: '0.2s',
                        }}
                    >
                        L'Excellence au<br />
                        <em style={{ color: '#D4A853' }}>Cœur de chaque</em>
                        <br />
                        Séjour
                    </h1>

                    <p
                        className="text-white/55 max-w-lg mx-auto mb-14 fade-up"
                        style={{
                            fontSize: '15px',
                            lineHeight: '1.8',
                            fontWeight: '300',
                            animationDelay: '0.35s',
                        }}
                    >
                        Des hôtels d'exception soigneusement sélectionnés pour leur excellence. Une expérience
                        unique vous attend à chaque destination.
                    </p>

                    <div className="flex justify-center gap-16 mt-16 fade-up" style={{ animationDelay: '0.55s' }}>
                        {[
                            { val: '500+', label: 'Hôtels' },
                            { val: '80+', label: 'Pays' },
                            { val: '50k+', label: 'Clients' },
                        ].map((s) => (
                            <div key={s.label} className="text-center">
                                <p
                                    style={{
                                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                                        fontSize: '30px',
                                        fontWeight: '300',
                                        color: '#D4A853',
                                    }}
                                >
                                    {s.val}
                                </p>
                                <p className="text-white/40 uppercase mt-0.5" style={{ fontSize: '9px', letterSpacing: '0.25em' }}>
                                    {s.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                    <span className="text-white/30 uppercase" style={{ fontSize: '9px', letterSpacing: '0.3em' }}>
                        Défiler
                    </span>
                    <div
                        className="animate-pulse"
                        style={{
                            width: '1px',
                            height: '40px',
                            background: 'linear-gradient(to bottom, rgba(212,168,83,0.6), transparent)',
                        }}
                    />
                </div>
            </section>

            {/* ====== STRIP ====== */}
            <section style={{ background: '#0F172A', padding: '20px 0' }}>
                <div className="max-w-7xl mx-auto px-8 flex items-center justify-center gap-8 flex-wrap">
                    {['Meilleur prix garanti', 'Paiement 100% sécurisé', 'Support 24h/24', 'Annulation gratuite'].map(
                        (item, i) => (
                            <div key={item} className="flex items-center gap-2.5">
                                {i > 0 && <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)' }} />}
                                <span className="text-white/50 uppercase" style={{ fontSize: '10px', letterSpacing: '0.18em' }}>
                                    {item}
                                </span>
                            </div>
                        )
                    )}
                </div>
            </section>

            {/* ====== HOTELS ====== */}
            <section id="hotels" style={{ background: '#FAFAF8', padding: '100px 0' }}>
                <div className="max-w-7xl mx-auto px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div style={{ width: '24px', height: '1px', background: '#D4A853' }} />
                                <span className="text-amber-600 uppercase" style={{ fontSize: '10px', letterSpacing: '0.22em' }}>
                                    Notre sélection
                                </span>
                            </div>
                            <h2
                                style={{
                                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                                    fontSize: 'clamp(32px, 5vw, 52px)',
                                    fontWeight: '300',
                                    color: '#0F172A',
                                    lineHeight: '1.1',
                                }}
                            >
                                Hôtels <em style={{ color: '#D4A853' }}>Disponibles</em>
                            </h2>
                            <p className="text-stone-400 mt-3 max-w-md" style={{ fontSize: '14px', lineHeight: '1.7' }}>
                                Des établissements d'exception choisis pour leur excellence et leur service irréprochable.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowAllHotels(!showAllHotels)}
                            className="mt-6 md:mt-0 transition-all duration-200 hover:bg-stone-900 hover:text-white"
                            style={{
                                color: '#0F172A',
                                border: '1px solid #0F172A',
                                fontSize: '10px',
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                                padding: '10px 24px',
                                borderRadius: '2px',
                                display: 'inline-block',
                                background: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            {showAllHotels ? 'Voir moins' : 'Voir tout'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {displayedHotels.map((hotel) => (
                            <HotelCard key={hotel.id} hotel={hotel} onBookingAdded={refreshBookings} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ====== OFFRES ====== */}
            <section id="offres" style={{ background: '#FFFFFF', padding: '100px 0' }}>
                <div className="max-w-7xl mx-auto px-8">
                    <div className="text-center mb-16">
                        <div className="flex items-center justify-center gap-3 mb-3">
                            <div style={{ width: '24px', height: '1px', background: '#D4A853' }} />
                            <span className="text-amber-600 uppercase" style={{ fontSize: '10px', letterSpacing: '0.22em' }}>
                                Promotions exclusives
                            </span>
                            <div style={{ width: '24px', height: '1px', background: '#D4A853' }} />
                        </div>
                        <h2
                            style={{
                                fontFamily: "'Cormorant Garamond', Georgia, serif",
                                fontSize: 'clamp(32px, 5vw, 52px)',
                                fontWeight: '300',
                                color: '#0F172A',
                            }}
                        >
                            Offres <em style={{ color: '#D4A853' }}>Spéciales</em>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {offers.map((offer) => (
                            <OfferCard
                                key={offer.title}
                                badge={offer.badge}
                                title={offer.title}
                                desc={offer.desc}
                                img={offer.img}
                                expires={offer.expires}
                                onButtonClick={() => {
                                    document.getElementById('hotels')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            />
                        ))}
                    </div>

                    {/* Newsletter */}
                    <div
                        className="mt-12 flex flex-col md:flex-row items-center justify-between gap-8 px-10 py-10"
                        style={{ background: '#0F172A', borderRadius: '4px' }}
                    >
                        <div>
                            <p className="text-amber-500/80 uppercase mb-1" style={{ fontSize: '9px', letterSpacing: '0.25em' }}>
                                Newsletter exclusive
                            </p>
                            <h3
                                className="text-white"
                                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '24px', fontWeight: '300' }}
                            >
                                Recevez nos offres en avant-première
                            </h3>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <input
                                type="email"
                                placeholder="votre@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleNewsletter()}
                                className="text-white placeholder-white/30 outline-none"
                                style={{
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    padding: '12px 18px',
                                    borderRadius: '2px',
                                    fontSize: '14px',
                                    minWidth: '260px',
                                }}
                            />
                            <button
                                onClick={handleNewsletter}
                                className="transition-all duration-200 hover:opacity-90 whitespace-nowrap"
                                style={{
                                    background: '#D4A853',
                                    color: '#0F172A',
                                    fontSize: '11px',
                                    fontWeight: '500',
                                    letterSpacing: '0.15em',
                                    textTransform: 'uppercase',
                                    padding: '12px 24px',
                                    borderRadius: '2px',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                {emailSent ? '✓ Inscrit !' : "S'inscrire"}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ====== AVIS ====== */}
            <section id="avis" style={{ background: '#FAFAF8', padding: '100px 0' }}>
                <div className="max-w-7xl mx-auto px-8">
                    <div className="text-center mb-16">
                        <div className="flex items-center justify-center gap-3 mb-3">
                            <div style={{ width: '24px', height: '1px', background: '#D4A853' }} />
                            <span className="text-amber-600 uppercase" style={{ fontSize: '10px', letterSpacing: '0.22em' }}>
                                Témoignages
                            </span>
                            <div style={{ width: '24px', height: '1px', background: '#D4A853' }} />
                        </div>
                        <h2
                            style={{
                                fontFamily: "'Cormorant Garamond', Georgia, serif",
                                fontSize: 'clamp(32px, 5vw, 52px)',
                                fontWeight: '300',
                                color: '#0F172A',
                            }}
                        >
                            Ce que disent nos <em style={{ color: '#D4A853' }}>Clients</em>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map((t) => (
                            <div
                                key={t.name}
                                className="bg-white p-8 transition-all duration-300"
                                style={{ borderRadius: '4px', border: '1px solid #F0EDE8' }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.07)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div className="flex gap-0.5 mb-5">
                                    {[...Array(t.rating)].map((_, i) => (
                                        <svg key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <div
                                    style={{
                                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                                        fontSize: '64px',
                                        color: '#D4A853',
                                        lineHeight: '0.5',
                                        marginBottom: '16px',
                                        opacity: 0.4,
                                    }}
                                >
                                    "
                                </div>
                                <p className="text-stone-500 mb-7" style={{ fontSize: '14px', lineHeight: '1.75' }}>
                                    {t.text}
                                </p>
                                <div className="flex items-center gap-3 pt-5" style={{ borderTop: '1px solid #F0EDE8' }}>
                                    <div
                                        className="flex items-center justify-center text-amber-700 font-semibold shrink-0"
                                        style={{
                                            width: '38px',
                                            height: '38px',
                                            borderRadius: '50%',
                                            background: '#FEF3C7',
                                            fontSize: '14px',
                                        }}
                                    >
                                        {t.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-stone-900 font-medium" style={{ fontSize: '13px' }}>
                                            {t.name}
                                        </p>
                                        <p className="text-stone-400" style={{ fontSize: '11px' }}>
                                            {t.country} · {t.hotel}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ====== FOOTER ====== */}
            <footer style={{ background: '#0F172A', padding: '60px 0 30px' }}>
                <div className="max-w-7xl mx-auto px-8">
                    <div className="flex flex-col md:flex-row justify-between gap-10 mb-12">
                        <div>
                            <span
                                style={{
                                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                                    fontSize: '24px',
                                    fontWeight: '400',
                                    letterSpacing: '0.2em',
                                    color: 'white',
                                }}
                            >
                                {LOGO_FALLBACK}
                            </span>
                            <p className="text-white/30 mt-3 max-w-xs" style={{ fontSize: '13px', lineHeight: '1.7' }}>
                                Des expériences hôtelières d'exception, soigneusement sélectionnées pour les voyageurs exigeants.
                            </p>
                        </div>
                        <div className="flex gap-16">
                            {[
                                { title: 'Navigation', links: ['Hôtels', 'Offres', 'Témoignages'] },
                                { title: 'Compte', links: ['Connexion', 'Réserver', 'Support'] },
                            ].map(({ title, links }) => (
                                <div key={title}>
                                    <p className="text-white/40 uppercase mb-4" style={{ fontSize: '9px', letterSpacing: '0.2em' }}>
                                        {title}
                                    </p>
                                    <ul className="space-y-2.5">
                                        {links.map((l) => (
                                            <li key={l}>
                                                <a href="#" className="text-white/50 hover:text-white/90 transition-colors" style={{ fontSize: '13px' }}>
                                                    {l}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div
                        className="flex flex-col md:flex-row justify-between items-center gap-4"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px' }}
                    >
                        <p className="text-white/25" style={{ fontSize: '11px' }}>
                            © 2025 IRMA. Tous droits réservés.
                        </p>
                        <div className="flex gap-6">
                            {['Confidentialité', 'Mentions légales', 'CGU'].map((l) => (
                                <a key={l} href="#" className="text-white/25 hover:text-white/50 transition-colors" style={{ fontSize: '11px' }}>
                                    {l}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>

            {/* ====== MODAL RÉSERVATIONS ====== */}
            <Modal isOpen={showBookingsModal} onClose={() => setShowBookingsModal(false)}>
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3
                            className="text-stone-900"
                            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '24px', fontWeight: '600' }}
                        >
                            Mes Réservations
                        </h3>
                    </div>
                    {userBookings.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-stone-400">Aucune réservation pour le moment.</p>
                            <button
                                onClick={() => {
                                    setShowBookingsModal(false);
                                    document.getElementById('hotels')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="mt-4 text-amber-600 hover:text-amber-700"
                                style={{ fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                Réserver maintenant →
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {userBookings.map((booking, index) => (
                                <div
                                    key={index}
                                    style={{
                                        border: '1px solid #F0EDE8',
                                        borderRadius: '4px',
                                        padding: '16px',
                                        background: '#FAFAF8',
                                    }}
                                >
                                    <h4
                                        style={{
                                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                                            fontSize: '18px',
                                            fontWeight: '600',
                                            marginBottom: '8px',
                                        }}
                                    >
                                        {booking.room.hotel.name}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-stone-400" style={{ fontSize: '11px' }}>Arrivée</p>
                                            <p className="text-stone-700">{new Date(booking.arrivalDate).toLocaleDateString('fr-FR')}</p>
                                        </div>
                                        <div>
                                            <p className="text-stone-400" style={{ fontSize: '11px' }}>Départ</p>
                                            <p className="text-stone-700">{new Date(booking.departureDate).toLocaleDateString('fr-FR')}</p>
                                        </div>
                                        <div>
                                            <p className="text-stone-400" style={{ fontSize: '11px' }}>Chambre</p>
                                            <p className="text-stone-700">{booking.room.type}</p>
                                        </div>
                                        <div>
                                            <p className="text-stone-400" style={{ fontSize: '11px' }}>Montant total</p>
                                            <p className="text-stone-700 font-bold">{booking.totalAmount.toLocaleString()} FCFA</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
}
