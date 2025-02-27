import Hero from "./components/hero"
import ImportantInfo from "./components/important-info"
import EventCalendar from "./components/event-calendar"
import PhotoGallery from "./components/photo-gallery"
import CoupleMessage from "./components/couple-message"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#faf7f5]">
      <Hero />
      <ImportantInfo />
      <EventCalendar />
      <PhotoGallery />
      <CoupleMessage />
    </main>
  )
}

