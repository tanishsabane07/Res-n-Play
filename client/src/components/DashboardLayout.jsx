import Navbar from './Navbar'

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}