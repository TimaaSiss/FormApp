'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface FormResponse {
  id: number;
  nomProjet: string | null;
  contactNom: string | null;
  contactFonction: string | null;
  email: string | null;
  telephone: string | null;
  siteWeb: string | null;
  dateMiseEnLigne: string | null;
  evenementAssocie: string | null;
  objectifs: string[];
  publicCible: string | null;
  pages: string[];
  contenuDisponible: string | null;
  pagesAMettreJour: boolean | null;
  fonctionnalites: string[];
  typesProduits: string[];
  nbProduits: string | null;
  besoinsSpecifiques: string[];
  webMobile: string[];
  stylePrefere: string[];
  gestionPlateforme: boolean | null;
  hebergement: string | null;
  connexionOutils: string | null;
  respectRGPD: string | null;
  sauvegardesAuto: string | null;
  besoinsSupport: string[];
  budget: string | null;
  paiement: string | null;
  appelOffre: string | null;
  communityManagement: string[];
  plateformes: string[];
  besoinsComm: string[];
  strategieExistante: string | null;
  referencement: string[];
  accompagnementSEO: string[];
  gestionEReputation: string | null;
  actionsAvis: string[];
  remarques: string | null;
  createdAt: string;
}

interface Props {
  response: FormResponse;
}

export default function ResponseDetailsClient({ response }: Props) {
  const router = useRouter();

  // Journal pour déboguer les données reçues
  useEffect(() => {
    console.log('Response reçue:', response);
  }, [response]);

  return (
    <div className="min-h-screen flex bg-[#F5F5F5] font-inter">
      <aside className="w-72 bg-gradient-to-b from-[#1E3A8A] to-[#3B82F6] text-white p-8 flex flex-col justify-between shadow-lg">
        <div>
          <h2 className="text-2xl font-bold mb-10 tracking-tight">Panel Admin</h2>
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
          onClick={() => router.push('/admin/login')}
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
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-5xl mx-auto bg-white shadow-2xl rounded-2xl p-8 space-y-8"
        >
          <div className="flex justify-between items-center border-b border-gray-200 pb-4">
            <h1 className="text-3xl font-bold text-[#1E3A8A] tracking-tight">
              Détails des réponses de {response.contactNom}
            </h1>
            <button
              onClick={() => router.push('/admin/responses')}
              className="flex items-center gap-2 text-blue-600 hover:underline"
            >
              <ArrowLeft /> Retour aux réponses
            </button>
          </div>

          <div className="space-y-8">
            <Section title="Informations Générales">
              <Field label="Nom du projet" value={response.nomProjet || 'N/A'} />
              <Field label="Nom du contact" value={response.contactNom || 'N/A'} />
              <Field label="Fonction du contact" value={response.contactFonction || 'N/A'} />
              <Field label="Email" value={response.email || 'N/A'} />
              <Field label="Téléphone" value={response.telephone || 'N/A'} />
              <Field label="Site web existant" value={response.siteWeb || 'N/A'} />
              <Field
                label="Date de mise en ligne"
                value={
                  response.dateMiseEnLigne
                    ? new Date(response.dateMiseEnLigne).toLocaleDateString('fr-FR')
                    : 'N/A'
                }
              />
              <Field label="Événement associé" value={response.evenementAssocie || 'N/A'} />
              <Field
                label="Date de soumission"
                value={new Date(response.createdAt).toLocaleDateString('fr-FR')}
              />
            </Section>

            <Section title="Objectifs du site">
              <Field
                label="Objectifs"
                value={
                  response.objectifs.length ? (
                    <ul className="list-disc list-inside">
                      {response.objectifs.map((objectif, index) => (
                        <li key={index}>{objectif}</li>
                      ))}
                    </ul>
                  ) : (
                    'Aucun'
                  )
                }
              />
              <Field label="Public cible" value={response.publicCible || 'N/A'} />
            </Section>

            <Section title="Contenu & Pages">
              <Field
                label="Pages souhaitées"
                value={
                  response.pages.length ? (
                    <ul className="list-disc list-inside">
                      {response.pages.map((page, index) => (
                        <li key={index}>{page}</li>
                      ))}
                    </ul>
                  ) : (
                    'Aucune'
                  )
                }
              />
              <Field label="Contenu disponible" value={response.contenuDisponible || 'N/A'} />
              <Field
                label="Pages à mettre à jour"
                value={response.pagesAMettreJour ? 'Oui' : 'Non'}
              />
            </Section>

            <Section title="Fonctionnalités principales">
              <Field
                label="Fonctionnalités"
                value={
                  response.fonctionnalites.length ? (
                    <ul className="list-disc list-inside">
                      {response.fonctionnalites.map((fonctionnalite, index) => (
                        <li key={index}>{fonctionnalite}</li>
                      ))}
                    </ul>
                  ) : (
                    'Aucune'
                  )
                }
              />
            </Section>

            <Section title="Vente en ligne">
              <Field
                label="Types de produits"
                value={
                  response.typesProduits.length ? (
                    <ul className="list-disc list-inside">
                      {response.typesProduits.map((type, index) => (
                        <li key={index}>{type}</li>
                      ))}
                    </ul>
                  ) : (
                    'Aucun'
                  )
                }
              />
              <Field label="Nombre de produits" value={response.nbProduits || 'N/A'} />
              <Field
                label="Besoins spécifiques"
                value={
                  response.besoinsSpecifiques.length ? (
                    <ul className="list-disc list-inside">
                      {response.besoinsSpecifiques.map((besoin, index) => (
                        <li key={index}>{besoin}</li>
                      ))}
                    </ul>
                  ) : (
                    'Aucun'
                  )
                }
              />
            </Section>

            <Section title="Web & Mobile">
              <Field
                label="Options"
                value={
                  response.webMobile.length ? (
                    <ul className="list-disc list-inside">
                      {response.webMobile.map((option, index) => (
                        <li key={index}>{option}</li>
                      ))}
                    </ul>
                  ) : (
                    'Aucune'
                  )
                }
              />
            </Section>

            <Section title="Design & Image">
              <Field
                label="Style préféré"
                value={
                  response.stylePrefere.length ? (
                    <ul className="list-disc list-inside">
                      {response.stylePrefere.map((style, index) => (
                        <li key={index}>{style}</li>
                      ))}
                    </ul>
                  ) : (
                    'Aucun'
                  )
                }
              />
            </Section>

            <Section title="Gestion & Technique">
              <Field
                label="Gestion de la plateforme"
                value={response.gestionPlateforme ? 'Oui' : 'Non'}
              />
              <Field label="Hébergement" value={response.hebergement || 'N/A'} />
              <Field label="Connexion outils" value={response.connexionOutils || 'N/A'} />
            </Section>

            <Section title="Sécurité & RGPD">
              <Field label="Respect RGPD" value={response.respectRGPD || 'N/A'} />
              <Field label="Sauvegardes automatiques" value={response.sauvegardesAuto || 'N/A'} />
            </Section>

            <Section title="Maintenance & Formation">
              <Field
                label="Besoins support"
                value={
                  response.besoinsSupport.length ? (
                    <ul className="list-disc list-inside">
                      {response.besoinsSupport.map((support, index) => (
                        <li key={index}>{support}</li>
                      ))}
                    </ul>
                  ) : (
                    'Aucun'
                  )
                }
              />
            </Section>

            <Section title="Budget & Modalités">
              <Field label="Budget" value={response.budget || 'N/A'} />
              <Field label="Paiement" value={response.paiement || 'N/A'} />
              <Field label="Appel d’offre" value={response.appelOffre || 'N/A'} />
            </Section>

            <Section title="Community Management & Communication Digitale">
              <Field
                label="Community Management"
                value={
                  response.communityManagement.length ? (
                    <ul className="list-disc list-inside">
                      {response.communityManagement.map((cm, index) => (
                        <li key={index}>{cm}</li>
                      ))}
                    </ul>
                  ) : (
                    'Aucun'
                  )
                }
              />
              <Field
                label="Plateformes"
                value={
                  response.plateformes.length ? (
                    <ul className="list-disc list-inside">
                      {response.plateformes.map((plateforme, index) => (
                        <li key={index}>{plateforme}</li>
                      ))}
                    </ul>
                  ) : (
                    'Aucune'
                  )
                }
              />
              <Field
                label="Besoins communication"
                value={
                  response.besoinsComm.length ? (
                    <ul className="list-disc list-inside">
                      {response.besoinsComm.map((besoin, index) => (
                        <li key={index}>{besoin}</li>
                      ))}
                    </ul>
                  ) : (
                    'Aucun'
                  )
                }
              />
              <Field label="Stratégie existante" value={response.strategieExistante || 'N/A'} />
            </Section>

            <Section title="Référencement & Visibilité">
              <Field
                label="Référencement"
                value={
                  response.referencement.length ? (
                    <ul className="list-disc list-inside">
                      {response.referencement.map((ref, index) => (
                        <li key={index}>{ref}</li>
                      ))}
                    </ul>
                  ) : (
                    'Aucun'
                  )
                }
              />
              <Field
                label="Accompagnement SEO"
                value={
                  response.accompagnementSEO.length ? (
                    <ul className="list-disc list-inside">
                      {response.accompagnementSEO.map((seo, index) => (
                        <li key={index}>{seo}</li>
                      ))}
                    </ul>
                  ) : (
                    'Aucun'
                  )
                }
              />
            </Section>

            <Section title="E-réputation & Avis">
              <Field label="Gestion e-réputation" value={response.gestionEReputation || 'N/A'} />
              <Field
                label="Actions avis"
                value={
                  response.actionsAvis.length ? (
                    <ul className="list-disc list-inside">
                      {response.actionsAvis.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  ) : (
                    'Aucun'
                  )
                }
              />
            </Section>

            <Section title="Autres besoins ou remarques">
              <Field label="Remarques" value={response.remarques || 'Aucune'} />
            </Section>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
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
      <span className="w-2/3 text-sm text-gray-900 whitespace-pre-wrap">{value}</span>
    </div>
  );
}