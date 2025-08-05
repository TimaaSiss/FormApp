'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { LogOut, LayoutDashboard } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Response {
  id: number;
  nomProjet: string | null;
  email: string | null;
  objectifs: string[];
  createdAt: string;
}

interface Stats {
  totalResponses: number;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [responses, setResponses] = useState<Response[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !session.user || session.user.role !== 'admin') {
      router.push('/admin/login');
      return;
    }

    const fetchResponses = async () => {
      try {
        const res = await fetch('/api/responses');
        const data = await res.json();
        if (data.success) {
          setResponses(data.responses);
          setStats({ totalResponses: data.responses.length });
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, [status, session, router]);

  function getMonthlyProjectStats(responses: Response[]) {
    const map = new Map<string, Set<string>>();
    responses.forEach((r) => {
      if (!r.nomProjet) return;
      const date = new Date(r.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!map.has(key)) map.set(key, new Set());
      map.get(key)!.add(r.nomProjet);
    });

    const sorted = Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
    return {
      labels: sorted.map(([k]) => k),
      counts: sorted.map(([, set]) => set.size),
    };
  }

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  const monthlyStats = getMonthlyProjectStats(responses);
  const latestResponses = responses.slice(0, 2);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar amélioré */}
      <aside className="w-64 bg-gradient-to-b from-blue-800 to-blue-600 text-white p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-8">Admin Panel</h2>
          <nav className="space-y-4">
            <a href="/admin/dashboard" className="block py-2 px-3 rounded bg-blue-700 font-medium">
              📊 Tableau de bord
            </a>
            <a href="/admin/responses" className="block py-2 px-3 rounded hover:bg-blue-700 transition">
              📋 Toutes les réponses
            </a>
          </nav>
        </div>
        <button
          onClick={() => router.push('/admin/login')}
          className="mt-6 flex items-center justify-center gap-2 border border-white px-3 py-2 rounded text-sm hover:bg-white hover:text-blue-700 transition"
        >
          Déconnexion
          <LogOut size={16} />
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-gray-100 p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Bienvenue {session?.user?.name || 'Admin'}</h1>
            <p className="text-gray-600">Résumé des réponses reçues</p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white shadow p-6 rounded">
            <h2 className="text-sm text-gray-500">Total de réponses</h2>
            <p className="text-3xl font-bold text-blue-600">{stats?.totalResponses || 0}</p>
          </div>
          <div className="bg-white shadow p-6 rounded">
            <h2 className="text-sm text-gray-500">Mois différents</h2>
            <p className="text-3xl font-bold text-blue-600">{monthlyStats.labels.length}</p>
          </div>
          <div className="bg-white shadow p-6 rounded">
            <h2 className="text-sm text-gray-500">Dernière réponse</h2>
            <p className="text-xl">
              {responses[0]
                ? new Date(responses[0].createdAt).toLocaleDateString('fr-FR')
                : 'Aucune'}
            </p>
          </div>
        </div>

        {/* Graphique */}
        <div className="bg-white shadow p-6 rounded">
          <h2 className="text-lg font-semibold mb-4">Projets distincts par mois</h2>
          <Bar
            data={{
              labels: monthlyStats.labels,
              datasets: [{
                label: 'Projets',
                data: monthlyStats.counts,
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
              }]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Projets par mois' },
              },
            }}
          />
        </div>

        {/* Deux dernières réponses */}
        <div className="bg-white shadow p-6 rounded">
          <h2 className="text-lg font-semibold mb-4">Dernières réponses</h2>
          {latestResponses.length === 0 ? (
            <p className="text-gray-500">Aucune réponse récente.</p>
          ) : (
            <div className="grid gap-4">
              {latestResponses.map((r) => (
                <div key={r.id} className="border p-4 rounded flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{r.nomProjet || 'Sans nom'}</p>
                    <p className="text-sm text-gray-600">{r.email || 'N/A'}</p>
                    <p className="text-sm">{r.objectifs?.join(', ')}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <a href="/admin/responses" className="text-blue-600 underline text-sm">
              Voir toutes les réponses →
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
