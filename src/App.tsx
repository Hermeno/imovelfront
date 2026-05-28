import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { theme } from './theme'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { ComparisonProvider } from './contexts/ComparisonContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useRealtime } from './hooks/useRealtime'

import { Welcome }      from './pages/Welcome'
import { Login }        from './pages/Login'
import { Register }     from './pages/Register'
import { PublicMap }    from './pages/PublicMap'
import { PropertyPage } from './pages/PropertyPage'
import { AgencyPage }   from './pages/AgencyPage'
import { MapPage }      from './pages/MapPage'
import { Dashboard }    from './pages/Dashboard'
import { Leads }        from './pages/Leads'
import { Analytics }    from './pages/Analytics'
import { Users }        from './pages/Users'
import { Profile }      from './pages/Profile'
import { Settings }     from './pages/Settings'
import { Plans }        from './pages/Plans'

function RealtimeConnector() {
  const { token } = useAuth()
  useRealtime(token)
  return null
}

export default function App() {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <NotificationProvider>
          <FavoritesProvider>
            <ComparisonProvider>
              <BrowserRouter>
                <RealtimeConnector />
                <Routes>
                  {/* Public */}
                  <Route path="/"             element={<Welcome />} />
                  <Route path="/mapa"         element={<PublicMap />} />
                  <Route path="/property/:id" element={<PropertyPage />} />
                  <Route path="/agency/:id"   element={<AgencyPage />} />
                  <Route path="/login"        element={<Login />} />
                  <Route path="/register"     element={<Register />} />
                  <Route path="/plans"        element={<Plans />} />

                  {/* Authenticated */}
                  <Route path="/map"       element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/leads"     element={<ProtectedRoute><Leads /></ProtectedRoute>} />
                  <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                  <Route path="/users"     element={<ProtectedRoute><Users /></ProtectedRoute>} />
                  <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/settings"  element={<ProtectedRoute><Settings /></ProtectedRoute>} />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </ComparisonProvider>
          </FavoritesProvider>
        </NotificationProvider>
      </AuthProvider>
    </ChakraProvider>
  )
}
