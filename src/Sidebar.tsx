import { Calendar, History, User, Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  activePage?: 'dashboard' | 'reservations' | 'historique' | 'profile';
  onPageChange?: (page: 'dashboard' | 'reservations' | 'historique' | 'profile') => void;
  onLogout?: () => void;
}

export default function Sidebar({ activePage = 'reservations', onPageChange, onLogout }: SidebarProps) {
  const navigate = useNavigate();

  return (
    <div className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3 border-b border-gray-100">
        <span className="text-xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent cursor-pointer" onClick={() => navigate('/')}>
          IRMA
        </span>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        <button 
          onClick={() => onPageChange?.('dashboard')} 
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activePage === 'dashboard' ? 'bg-amber-50 text-amber-600 font-medium shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
          <Home className="w-5 h-5" />
          <span>Tableau de bord</span>
        </button>
        
        <button 
          onClick={() => onPageChange?.('reservations')} 
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activePage === 'reservations' ? 'bg-amber-50 text-amber-600 font-medium shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
          <Calendar className="w-5 h-5" />
          <span>Réservations en cours</span>
        </button>
        
        <button 
          onClick={() => onPageChange?.('historique')} 
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activePage === 'historique' ? 'bg-amber-50 text-amber-600 font-medium shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
          <History className="w-5 h-5" />
          <span>Historique</span>
        </button>
        
        <button 
          onClick={() => onPageChange?.('profile')} 
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activePage === 'profile' ? 'bg-amber-50 text-amber-600 font-medium shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
          <User className="w-5 h-5" />
          <span>Mon profil</span>
        </button>
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-left mb-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Accueil</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all text-left"
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
}
