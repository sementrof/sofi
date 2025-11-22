export default function SectionDivider() {
  return (
    <div className="relative py-16 md:py-24">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-7xl mx-auto px-4">
          <div className="relative">
            {/* Industrial metal line - thick and solid */}
            <div className="h-[3px] bg-gradient-to-r from-transparent via-border dark:via-border to-transparent relative overflow-hidden">
              {/* Metal texture effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-muted-foreground/10 via-foreground/20 to-muted-foreground/10"></div>
              {/* Subtle shine */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

