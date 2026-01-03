function App() {
  return (
    <div className="h-screen w-screen bg-neutral-900 text-neutral-100 overflow-hidden flex flex-col">
      {/* Header / Status Bar */}
      <header className="h-12 border-b border-neutral-800 flex items-center px-4 justify-between">
        <h1 className="font-mono text-sm tracking-widest text-neutral-400">LACUNA // ENGINE</h1>
        <div className="text-xs text-neutral-600">MODE: PURE_CLIENT</div>
      </header>

      {/* Main 3-Column Layout */}
      <main className="flex-1 grid grid-cols-12 gap-0">
        
        {/* Left Column: Across Clues (3 cols) */}
        <aside className="col-span-3 border-r border-neutral-800 p-4 overflow-y-auto bg-neutral-900/50 backdrop-blur-sm">
          <h2 className="font-mono text-xs text-accent-main mb-4 uppercase tracking-wider border-b border-neutral-800 pb-2">
            Across
          </h2>
          <ul className="space-y-3 font-mono text-sm text-neutral-400">
            {[1, 5, 10, 14, 16].map(num => (
              <li key={num} className="hover:text-white cursor-pointer transition-colors">
                <span className="font-bold text-neutral-600 mr-2">{num}</span>
                <span className="opacity-50">...awaiting signal...</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* Center Column: The Grid / Stage (6 cols) */}
        <section className="col-span-6 relative bg-black flex items-center justify-center">
          {/* 3D Background Placeholder */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-800/20 to-black pointer-events-none" />
          
          {/* Grid Container */}
          <div className="relative z-10 w-[600px] h-[600px] border border-neutral-800 bg-neutral-900/30 backdrop-blur-md flex items-center justify-center">
            <span className="font-mono text-xs text-neutral-600 tracking-widest">
              [ GRID_MOUNT_POINT ]
            </span>
          </div>
        </section>

        {/* Right Column: Down Clues (3 cols) */}
        <aside className="col-span-3 border-l border-neutral-800 p-4 overflow-y-auto bg-neutral-900/50 backdrop-blur-sm">
          <h2 className="font-mono text-xs text-accent-main mb-4 uppercase tracking-wider border-b border-neutral-800 pb-2">
            Down
          </h2>
          <ul className="space-y-3 font-mono text-sm text-neutral-400">
             {[1, 2, 3, 4, 6].map(num => (
              <li key={num} className="hover:text-white cursor-pointer transition-colors">
                <span className="font-bold text-neutral-600 mr-2">{num}</span>
                <span className="opacity-50">...awaiting signal...</span>
              </li>
            ))}
          </ul>
        </aside>

      </main>
    </div>
  )
}

export default App
