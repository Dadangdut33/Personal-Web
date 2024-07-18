import { Footer } from "./Footer";
import Navbar from "./Navbar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div id="drawer"></div>
      <div className="pt-[85px] mb-8">{children}</div>
      <Footer />
    </div>
  );
}
