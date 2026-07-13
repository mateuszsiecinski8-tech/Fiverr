// Przykładowa struktura Tailwind dla nowego Navbaru
<nav className="fixed top-0 w-full z-50 flex justify-between items-center px-10 py-6 bg-transparent">
  {/* Logo / Napis po lewej */}
  <div className="text-2xl font-bold tracking-tighter text-white">
    mati
  </div>

  {/* Linki po prawej w szklanym stylu */}
  <div className="flex gap-4">
    <a href="#about" className="px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/20 transition-all text-sm font-medium">
      About
    </a>
    <a href="#projects" className="px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/20 transition-all text-sm font-medium">
      Projects
    </a>
    <a href="#contact" className="px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/20 transition-all text-sm font-medium">
      Contact
    </a>
  </div>
</nav>
