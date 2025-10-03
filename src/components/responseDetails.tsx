"use client";

import { FormResponse } from "@prisma/client";
import { motion } from "framer-motion";
import { ArrowLeft, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface Props {
  response: FormResponse;
}

export default function ResponseDetailsClient({ response }: Props) {
  const router = useRouter();

  useEffect(() => {
    console.log("Response reçue:", response);
  }, [response]);

  return (
    <div className="min-h-screen flex bg-[#F5F5F5] font-inter">
      <aside className="w-72 bg-gradient-to-b from-[#1E3A8A] to-[#3B82F6] text-white p-8 flex flex-col justify-between shadow-lg">
        <div>
          <h2 className="text-2xl font-bold mb-10 tracking-tight">
            Panel Admin
          </h2>
          <nav className="space-y-6">
            <Link
              href="/admin/dashboard"
              className="block py-3 px-4 rounded-lg hover:bg-[#3B82F6]/80 transition-all duration-300"
            >
              📊 Tableau de bord
            </Link>
            <Link
              href="/admin/responses"
              className="block py-3 px-4 rounded-lg bg-[#3B82F6]/80 font-medium"
            >
              📋 Toutes les réponses
            </Link>
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

      <main className="flex-1 p-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-5xl mx-auto bg-white shadow-2xl rounded-2xl p-8 space-y-8"
        >
          <div className="flex justify-between items-center border-b border-gray-200 pb-4">
            <h1 className="text-3xl font-bold text-[#1E3A8A] tracking-tight">
              Détails du projet - {response.nomProjet || "Sans nom"}
            </h1>
            <button
              onClick={() => router.push("/admin/responses")}
              className="flex items-center gap-2 text-blue-600 hover:underline"
            >
              <ArrowLeft /> Retour aux réponses
            </button>
          </div>

          <div className="space-y-8">
            {/* Étape 1 - Informations du Projet */}
            <Section title="Informations du Projet">
              <Field
                label="Nom du projet"
                value={response.nomProjet || "N/A"}
              />
              <Field label="Entreprise" value={response.entreprise || "N/A"} />
              <Field
                label="Secteur d'activité"
                value={response.secteurActivite || "N/A"}
              />
              <Field
                label="Nom du contact"
                value={response.contactNom || "N/A"}
              />
              <Field
                label="Fonction du contact"
                value={response.contactFonction || "N/A"}
              />
              <Field label="Email" value={response.email || "N/A"} />
              <Field label="Téléphone" value={response.telephone || "N/A"} />
              <Field
                label="Date de lancement souhaitée"
                value={
                  response.dateLancement
                    ? new Date(response.dateLancement).toLocaleDateString(
                        "fr-FR"
                      )
                    : "N/A"
                }
              />
              <Field
                label="Date de soumission"
                value={new Date(response.createdAt).toLocaleDateString("fr-FR")}
              />
            </Section>

            <Section title="Description du Projet">
              <Field
                label="Description du projet"
                value={response.descriptionProjet || "N/A"}
              />
              <Field
                label="Problème à résoudre"
                value={response.problemeResoudre || "N/A"}
              />
            </Section>

            <Section title="Utilisateurs Cibles">
              <Field
                label="Utilisateurs cibles"
                value={response.utilisateursCibles || "N/A"}
              />
              <Field
                label="Nombre d'utilisateurs prévus"
                value={response.nombreUtilisateurs || "N/A"}
              />
            </Section>

            {/* Étape 2 - Besoins & Spécifications */}
            <Section title="Fonctionnalités Principales">
              <Field
                label="Fonctionnalités principales"
                value={
                  response.fonctionnalitesPrincipales &&
                  (response.fonctionnalitesPrincipales as string[]).length ? (
                    <ul className="list-disc list-inside space-y-1">
                      {(response.fonctionnalitesPrincipales as string[])?.map(
                        (fonctionnalite, index) => (
                          <li key={index} className="text-gray-700">
                            {fonctionnalite}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    "Aucune fonctionnalité spécifiée"
                  )
                }
              />
              {response.fonctionnalitePrincipaleAutre && (
                <Field
                  label="Autre fonctionnalité"
                  value={response.fonctionnalitePrincipaleAutre}
                />
              )}
            </Section>

            <Section title="Type d'Application">
              <Field
                label="Plateformes cibles"
                value={
                  response.typeApplication &&
                  (response.typeApplication as string[]).length ? (
                    <ul className="list-disc list-inside space-y-1">
                      {(response.typeApplication as string[]).map(
                        (type, index) => (
                          <li key={index} className="text-gray-700">
                            {type}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    "Aucune plateforme spécifiée"
                  )
                }
              />
            </Section>

            <Section title="Design & Style Visuel">
              <Field
                label="Styles visuels préférés"
                value={
                  response.styleVisuel &&
                  (response.styleVisuel as string[]).length ? (
                    <ul className="list-disc list-inside space-y-1">
                      {(response.styleVisuel as string[]).map(
                        (style, index) => (
                          <li key={index} className="text-gray-700">
                            {style}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    "Aucun style spécifié"
                  )
                }
              />
              {response.styleAutre && (
                <Field label="Autre style" value={response.styleAutre} />
              )}
            </Section>

            <Section title="Budget & Planning">
              <Field
                label="Budget estimé"
                value={response.budget || "Non spécifié"}
              />
              <Field
                label="Délai de réalisation souhaité"
                value={response.delaiRealisation || "Non spécifié"}
              />
            </Section>

            {response.commentaires && (
              <Section title="Commentaires & Exigences Particulières">
                <Field
                  label="Commentaires supplémentaires"
                  value={response.commentaires}
                />
              </Section>
            )}

            {/* Résumé du projet */}
            <Section title="Résumé du Projet">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    Informations clés
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Projet:</span>{" "}
                      {response.nomProjet || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Contact:</span>{" "}
                      {response.contactNom || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {response.email || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Budget:</span>{" "}
                      {response.budget || "Non spécifié"}
                    </p>
                    <p>
                      <span className="font-medium">Délai:</span>{" "}
                      {response.delaiRealisation || "Non spécifié"}
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">
                    Spécifications techniques
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Plateformes:</span>{" "}
                      {(response.typeApplication as string[]).join(", ") ||
                        "Non spécifié"}
                    </p>
                    <p>
                      <span className="font-medium">Fonctionnalités:</span>{" "}
                      {(response.fonctionnalitesPrincipales as string[]).join(
                        ", "
                      ) || "Non spécifié"}
                    </p>
                    <p>
                      <span className="font-medium">Utilisateurs:</span>{" "}
                      {response.nombreUtilisateurs || "Non spécifié"}
                    </p>
                  </div>
                </div>
              </div>
            </Section>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="border-l-4 border-[#D4AF37] bg-gray-50 rounded-lg p-6 shadow-sm"
    >
      <h2 className="text-xl font-semibold text-[#1E3A8A] mb-4">{title}</h2>
      <div className="space-y-3">{children}</div>
    </motion.div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start">
      <span className="w-1/3 text-sm font-medium text-gray-700">{label} :</span>
      <span className="w-2/3 text-sm text-gray-900 whitespace-pre-wrap">
        {value}
      </span>
    </div>
  );
}
