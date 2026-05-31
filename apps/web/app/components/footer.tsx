import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold tracking-tight">
              Artisan<span className="text-brand-500">237</span>
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              La marketplace intelligente des artisans à Douala, Cameroun.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/marketplace" className="hover:text-brand-500 transition-colors">Marketplace</Link></li>
              <li><Link href="/dashboard" className="hover:text-brand-500 transition-colors">Tableau de bord</Link></li>
              <li><Link href="/about" className="hover:text-brand-500 transition-colors">À propos</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Légal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/terms" className="hover:text-brand-500 transition-colors">Conditions d'utilisation</Link></li>
              <li><Link href="/privacy" className="hover:text-brand-500 transition-colors">Politique de confidentialité</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>support@artisan237.com</li>
              <li>+237 600 000 000</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Artisan237. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}