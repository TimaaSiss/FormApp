"use client";
import { getResponses } from "@/actions";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, LogOut } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ResponsesList() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ["responses"],
    queryFn: async () => await getResponses(),
  });

  useEffect(() => {
    if (status !== "loading" && (!session || session.user?.role !== "admin")) {
      router.push("/admin/login");
    }
  }, [status, session, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-red-500">Erreur : {String(error)}</p>
      </div>
    );
  }

  const responses = data?.responses || [];

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-blue-800 to-blue-600 text-white p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-8">Admin Panel</h2>
          <nav className="space-y-4">
            <a
              href="/admin/dashboard"
              className="block py-2 px-3 rounded hover:bg-blue-700 transition"
            >
              📊 Tableau de bord
            </a>
            <a
              href="/admin/responses"
              className="block py-2 px-3 rounded bg-blue-700 font-medium"
            >
              📋 Toutes les réponses
            </a>
          </nav>
        </div>
        <button
          onClick={() => router.push("/admin/login")}
          className="mt-6 flex items-center justify-center gap-2 border border-white px-3 py-2 rounded text-sm hover:bg-white hover:text-blue-700 transition"
        >
          Déconnexion
          <LogOut size={16} />
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6 space-y-6"
        >
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              Toutes les réponses
            </h1>
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="flex items-center gap-2 text-blue-600 hover:underline"
            >
              <ArrowLeft size={16} />
              Retour au tableau de bord
            </button>
          </div>

          {responses.length === 0 ? (
            <p className="text-gray-500">Aucune réponse disponible.</p>
          ) : (
            <div className="grid gap-4">
              {responses.map((r) => (
                <Link
                  key={r.id}
                  href={`/admin/responses/${r.id}`}
                  className="border p-4 rounded flex justify-between items-start hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="font-semibold">{r.nomProjet || "Sans nom"}</p>
                    <p className="text-sm text-gray-600">{r.email || "N/A"}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
