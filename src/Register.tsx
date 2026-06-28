import { useState, type Dispatch, type FormEvent, type SetStateAction } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import AuthLayout from './AuthLayout'
import { ROLE_REDIRECTS } from './Users'
import { useAuth } from './useAuth'

interface InputFieldProps {
  label: string
  value: string
  onChange: Dispatch<SetStateAction<string>>
  placeholder: string
  type?: 'text' | 'email' | 'password'
}

function InputField({ label, type = 'text', value, onChange, placeholder }: InputFieldProps) {
  return (
    <div className="flex flex-col">
      <label className="font-body text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest pointer-events-none">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/30 font-body text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#D4A853]/20"
        style={{ color: '#0F172A' }}
      />
    </div>
  )
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = location.state?.returnTo
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !email || !password || !confirm) {
      setError('Veuillez remplir tous les champs.')
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    const result = await register(name, email, password)
    setLoading(false)

    if (result.success) {
      navigate(returnTo || ROLE_REDIRECTS.user)
    } else {
      setError(result.error || 'Erreur inconnue.')
    }
  }

  return (
    <AuthLayout title="Créer un compte" subtitle="Commencez dès maintenant">
      <div className="flex flex-col lg:flex-row w-full max-w-5xl mx-auto min-h-[650px] bg-white rounded-3xl overflow-hidden shadow-2xl">
        <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <div className="mb-6">
              <span className="text-[#D4A853] font-bold text-xl uppercase tracking-tighter">IRMA</span>
            </div>

            <p className="font-body text-sm text-gray-400 mb-1">Commencez dès maintenant</p>
            <h1 className="font-display text-3xl font-bold mb-8" style={{ color: '#0F172A' }}>
              Inscription
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField label="Nom complet" value={name} onChange={setName} placeholder="Jean Dupont" />
              <InputField label="Email" type="email" value={email} onChange={setEmail} placeholder="jean@exemple.com" />
              <InputField label="Mot de passe" type="password" value={password} onChange={setPassword} placeholder="Min. 6 caractères" />
              <InputField label="Confirmer le mot de passe" type="password" value={confirm} onChange={setConfirm} placeholder="Répétez le mot de passe" />

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
                  <svg width="14" height="14" fill="none" stroke="#EF4444" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="font-body text-xs font-bold italic text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl text-white font-body font-bold text-sm transition-all duration-300 hover:brightness-105 active:scale-[0.98] shadow-lg shadow-[#D4A853]/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                style={{ backgroundColor: '#D4A853' }}
              >
                {loading ? 'CRÉATION...' : 'CRÉER MON COMPTE'}
              </button>
            </form>

            <p className="mt-6 font-body text-xs text-gray-400 text-center">
              Déjà un compte ?{' '}
              <Link to="/login" className="font-bold hover:underline" style={{ color: '#0F172A' }}>
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        <div className="hidden lg:flex flex-1 bg-[#FFF1EB] overflow-hidden">
          <img src="/src/assets/lulu.jpg" alt="Illustration" className="w-full h-full object-cover" />
        </div>
      </div>
    </AuthLayout>
  )
}
