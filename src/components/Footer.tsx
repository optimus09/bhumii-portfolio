export function Footer({ name }: { name: string }) {
  return (
    <footer className="glass-bar text-center py-9 border-t border-white/10 text-white/60 text-sm font-mono-ui">
      <p>&copy; {new Date().getFullYear()} {name} · London, UK</p>
      <a href="/admin/login" className="block mt-2 text-[0.7rem] text-white/40 hover:text-[color:var(--gold)]">
        admin
      </a>
    </footer>
  )
}
