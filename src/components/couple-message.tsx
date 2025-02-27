

export default function CoupleMessage() {
  return (
    <section className="py-20 px-4 bg-[#f8f5f2]">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-serif text-center text-[#3d3d3d] mb-16">Messages From Us</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="relative aspect-square w-32 h-32 rounded-full overflow-hidden border-4 border-[#d3b8a3] shadow-md mx-auto mb-6">
              <img src="/placeholder.svg?height=200&width=200" alt="Man Lung"  className="object-cover" />
            </div>
            <h3 className="text-2xl font-serif text-center text-[#3d3d3d] mb-4">Man Lung</h3>
            <p className="text-[#6d6d6d] mb-4 italic">
              "Natalie, from the moment we met, I knew our journey together would be extraordinary. Your kindness,
              intelligence, and infectious laughter have filled my days with joy and purpose. I can't wait to begin this
              new chapter of our lives and build a future filled with love, adventure, and endless happiness. You are my
              best friend, my soulmate, and soon to be my wife. I love you more than words can express."
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="relative aspect-square w-32 h-32 rounded-full overflow-hidden border-4 border-[#d3b8a3] shadow-md mx-auto mb-6">
              <img src="/placeholder.svg?height=200&width=200" alt="Natalie" fill className="object-cover" />
            </div>
            <h3 className="text-2xl font-serif text-center text-[#3d3d3d] mb-4">Natalie</h3>
            <p className="text-[#6d6d6d] mb-4 italic">
              "Man Lung, you've brought so much love and laughter into my life. Your unwavering support, your gentle
              spirit, and your ability to make me smile even on the toughest days are just a few of the countless
              reasons why I fall in love with you more each day. I'm so excited to marry you and embark on this
              beautiful journey of life together. You are my rock, my confidant, and my forever love. I can't wait to
              call you my husband."
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[#6d6d6d]">
            We are so grateful for the love and support of our family and friends. Thank you for being part of our story
            and for joining us on this special day.
          </p>
          <div className="mt-4 font-serif text-xl text-[#d3b8a3]">
            With love,
            <br />
            Man Lung & Natalie
          </div>
        </div>
      </div>
    </section>
  )
}

