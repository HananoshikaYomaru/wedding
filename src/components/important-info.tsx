import { Calendar, MapPin, Clock } from "lucide-react"

export default function ImportantInfo() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-serif text-center text-[#3d3d3d] mb-16">Our Special Day</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#f8e9e6] flex items-center justify-center mb-4">
              <Calendar className="w-7 h-7 text-[#d3b8a3]" />
            </div>
            <h3 className="text-xl font-medium text-[#3d3d3d] mb-2">Date</h3>
            <p className="text-[#6d6d6d]">July 6, 2025</p>
            <p className="text-[#6d6d6d] mt-1">Sunday</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#f8e9e6] flex items-center justify-center mb-4">
              <Clock className="w-7 h-7 text-[#d3b8a3]" />
            </div>
            <h3 className="text-xl font-medium text-[#3d3d3d] mb-2">Time</h3>
            <p className="text-[#6d6d6d]">Ceremony: 3:00 PM</p>
            <p className="text-[#6d6d6d] mt-1">Reception: 5:30 PM</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#f8e9e6] flex items-center justify-center mb-4">
              <MapPin className="w-7 h-7 text-[#d3b8a3]" />
            </div>
            <h3 className="text-xl font-medium text-[#3d3d3d] mb-2">Location</h3>
            <p className="text-[#6d6d6d]">Vancouver Botanical Garden</p>
            <p className="text-[#6d6d6d] mt-1">Vancouver, BC</p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-[#6d6d6d] max-w-2xl mx-auto">
            Join us for an elegant garden ceremony followed by dinner and dancing under the stars. We can't wait to
            celebrate this special day with all our friends and family.
          </p>
        </div>
      </div>
    </section>
  )
}

