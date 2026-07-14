export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-amber-50/30 to-navy/5">
      <div className="text-center">
        <div className="relative w-36 h-36 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-amber-200 border-t-gold-1 border-r-teal-400 animate-spin" style={{ animationDuration: '1.5s' }} />
          <div className="absolute inset-4 rounded-full border-4 border-amber-100 border-l-gold-2 border-b-purple-300 animate-spin" style={{ animationDuration: '1.9s', animationDirection: 'reverse' }} />
          <div className="absolute inset-8 rounded-full bg-white/90 shadow-xl flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-1 to-gold-2 flex items-center justify-center text-navy-dark font-bold text-xs">
              RS
            </div>
          </div>
        </div>
        <div className="font-heading font-bold text-navy">ReliSoft Technologies</div>
        <div className="text-muted text-sm font-semibold mt-1">Preparing People Hub</div>
      </div>
    </div>
  )
}
