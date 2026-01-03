import clsx from 'clsx';

export function ClueColumn({
  label,
  entries,
  activeEntryKey,
  onEntryClick,
}) {
  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="font-mono font-black tracking-[0.35em] text-[clamp(5rem,10vw,10rem)] opacity-[0.05]">
            {label}
          </div>
        </div>

        <ul className="relative z-10 space-y-2">
          {entries.map((entry) => {
            const isActive = entry.key === activeEntryKey;
            return (
              <li
                key={entry.key}
                className={clsx(
                  'rounded-md border border-neutral-800/80 bg-neutral-900/20 px-3 py-2',
                  'cursor-pointer select-none transition-colors',
                  isActive && 'border-neutral-400/60 bg-neutral-800/40'
                )}
                onClick={() => onEntryClick(entry)}
              >
                <div className="flex gap-3 items-baseline">
                  <div className="font-mono text-sm text-neutral-300 w-10 text-right">
                    {entry.number ?? ''}
                  </div>
                  <div className="text-sm text-neutral-200/90 leading-snug">
                    {entry.clue}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
