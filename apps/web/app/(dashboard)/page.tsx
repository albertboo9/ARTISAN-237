import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Artisan237',
  description: 'Gérez votre profil, vos missions et votre réputation',
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tableau de bord</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-lg p-6 shadow-sm border">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Missions actives</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="bg-card rounded-lg p-6 shadow-sm border">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Avis reçus</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="bg-card rounded-lg p-6 shadow-sm border">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Points XP</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="bg-card rounded-lg p-6 shadow-sm border">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Note moyenne</h3>
          <p className="text-3xl font-bold">-</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Missions récentes</h3>
          <p className="text-muted-foreground">Aucune mission pour le moment.</p>
        </div>
        <div className="bg-card rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Badges</h3>
          <p className="text-muted-foreground">Aucun badge pour le moment.</p>
        </div>
      </div>
    </div>
  );
}