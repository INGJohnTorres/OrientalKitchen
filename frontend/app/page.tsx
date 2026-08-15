import Navbar from "@/components/site/Navbar";
import Hero from "@/components/site/Hero";
import Favoritos from "@/components/site/Favoritos";
import Categorias from "@/components/site/Categorias";
import Experiencia from "@/components/site/Experiencia";
import Galeria from "@/components/site/Galeria";
import CTAFinal from "@/components/site/CTAFinal";
import Footer from "@/components/site/Footer";
import WhatsAppFloat from "@/components/site/WhatsAppFloat";

export default function HomePage() {
  return (
    <main className="bg-espresso">
      <Navbar />
      <Hero />
      <Favoritos />
      <Categorias />
      <Experiencia />
      <Galeria />
      <CTAFinal />
      <Footer />
      <WhatsAppFloat />
    </main>
  );
}
