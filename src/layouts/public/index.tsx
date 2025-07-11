import Footer from './footer'
import Navbar from './navbar'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen w-full" id="main">
      <Navbar />
      <div className="pt-[85px] mb-8" id="content">
        {children}
      </div>
      <Footer />
    </div>
  )
}
