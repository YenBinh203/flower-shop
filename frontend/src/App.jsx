import './App.css'
import { Routes, Route } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Home from '@/pages/Home'
import Products from '@/pages/Products'
import ProductDetail from '@/pages/ProductDetail'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Profile from '@/pages/Profile'
import Blog from '@/pages/Blog'
import BlogDetail from '@/pages/BlogDetail'
import Contact from '@/pages/Contact'
import PaymentPolicy from '@/pages/policy/PaymentPolicy'
import ShippingPolicy from '@/pages/policy/ShippingPolicy'
import PrivacyPolicy from '@/pages/policy/PrivacyPolicy'
import WarrantyPolicy from '@/pages/policy/WarrantyPolicy'
import TermsOfUse from '@/pages/policy/TermsOfUse'


export default function App() {
  return (
    <div>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          
          <Route path="/news" element={<Blog />} />
          <Route path="/news/:id" element={<BlogDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/policies/payment" element={<PaymentPolicy />} />
          <Route path="/policies/shipping" element={<ShippingPolicy />} />
          <Route path="/policies/privacy" element={<PrivacyPolicy />} />
          <Route path="/policies/warranty" element={<WarrantyPolicy />} />
          <Route path="/policies/terms" element={<TermsOfUse />} />

          
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
