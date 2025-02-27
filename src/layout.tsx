import { ReactNode } from "react";
import "./index.css";

// Define font variables for CSS
const fontVariables = {
  playfairVariable: "var(--font-playfair)",
  latoVariable: "var(--font-lato)",
};

// Add these font imports to index.css instead of using Next.js font loader
// You'll need to add Google Fonts via CSS @import or link tag in index.html

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm shadow-sm">
        <nav className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="font-serif text-xl text-[#d3b8a3]">
            Natalie & Man Lung
          </div>
          <ul className="flex items-center space-x-6 text-sm text-[#6d6d6d]">
            <li className="hover:text-[#d3b8a3]">
              <a
                href="https://www.zola.com/wedding-planning/digital-save-the-date/aAAMznXArV"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors border border-[#d3b8a3] px-4 py-2 rounded-full"
              >
                RSVP
              </a>
            </li>
          </ul>
        </nav>
      </header>
      <main className={`${fontVariables.playfairVariable} ${fontVariables.latoVariable} font-sans`}>
        {children}
      </main>
      <footer className="bg-[#3d3d3d] text-white py-8 px-4 text-center">
        <div className="max-w-5xl mx-auto">
          <p className="font-serif text-2xl mb-4">Natalie & Man Lung</p>
          <p className="text-sm text-gray-300">
            July 6, 2025 • Vancouver, BC
          </p>
          <p className="text-sm text-gray-300 mt-6">
            Made with love for our special day
          </p>
        </div>
      </footer>
    </>
  );
}
