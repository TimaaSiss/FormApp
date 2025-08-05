'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogOut, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';

interface Response {
  id: number;
  nomProjet: string | null;
  email: string | null;
  objectifs: string[];
  createdAt: string;
}

const ITEMS_PER_PAGE = 10;

export default function AllResponsesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [responses, setResponses] = useState<Response[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

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
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, [status, session, router]);

  const filteredResponses = responses.filter((r) =>
    r.nomProjet?.toLowerCase().includes(search.toLowerCase()) ||
    r.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredResponses.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentResponses = filteredResponses.slice(start, start + ITEMS_PER_PAGE);

  const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar amélioré */}
      <aside className="w-64 bg-gradient-to-b from-blue-800 to-blue-600 text-white p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-8">Admin Panel</h2>
          <nav className="space-y-4">
            <a href="/admin/dashboard" className="block py-2 px-3 rounded hover:bg-blue-700 transition">
              📊 Tableau de bord
            </a>
            <a href="/admin/responses" className="block py-2 px-3 rounded bg-blue-700">
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

      {/* Main content */}
      <main className="flex-1 bg-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ClipboardList size={24} />
            Toutes les réponses
          </h1>
          <input
            type="text"
            placeholder="🔍 Rechercher par projet ou email"
            className="p-2 border rounded w-64"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // reset page to 1 when filtering
            }}
          />
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left text-gray-600">
              <tr>
                <th className="p-3">Projet</th>
                <th className="p-3">Email</th>
                <th className="p-3">Objectifs</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {currentResponses.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{r.nomProjet || 'Sans nom'}</td>
                  <td className="p-3">{r.email || 'N/A'}</td>
                  <td className="p-3">{r.objectifs?.join(', ')}</td>
                  <td className="p-3">{new Date(r.createdAt).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {currentResponses.length === 0 && (
            <div className="text-center text-gray-500 p-6">Aucune réponse trouvée.</div>
          )}
        </div>

        {/* Pagination */}
        {filteredResponses.length > ITEMS_PER_PAGE && (
          <div className="flex justify-center items-center mt-6 gap-4">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="p-2 border rounded disabled:opacity-50 flex items-center gap-1"
            >
              <ChevronLeft size={16} />
              Précédent
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="p-2 border rounded disabled:opacity-50 flex items-center gap-1"
            >
              Suivant
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
