import { Route, Routes, BrowserRouter, Navigate } from 'react-router-dom'
import { DefaultLayout } from './layouts/deafultLayout'
import { Contact } from './pages/Contact/index'
import { Dashboard } from './pages/Dashboard'
import { Home } from './pages/Home/index'
import { SignIn } from './pages/SignIn'

export function Router() {
  return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<DefaultLayout />} >
                  <Route path='/' element={<Home />} />
                  <Route path='/contato' element={<Contact />} />
                  <Route path='/dashboard' element={<Dashboard />} />
                  <Route path='/entrar' element={<SignIn />} />
                </Route>
                
                <Route path='*' element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
  )
}
