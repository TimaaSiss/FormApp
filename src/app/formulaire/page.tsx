'use client';
import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Info } from 'lucide-react'; 
import InfoTooltip from '@/components/infoTooltip';

interface InfoTooltipProps {
  content: string;
}


// Schémas Zod (inchangés)
const step1Schema = z.object({
  nomProjet: z.string().min(1, 'Nom du projet requis'),
  contactNom: z.string().optional(),
  contactFonction: z.string().optional(),
  email: z.string().email('Email invalide'),
  telephone: z.string().optional(),
  siteWeb: z.string().optional(),
  dateMiseEnLigne: z.string().optional(),
  evenementAssocie: z.string().optional(),
});

const step2Schema = z.object({
  objectifs: z.array(z.string()).optional(),
  objectifAutre: z.string().optional(),
  publicCible: z.string().optional(),
});

const step3Schema = z.object({
  pages: z.array(z.string()).optional(),
  pageAutre: z.string().optional(),
  contenuDisponible: z.enum(['Oui, tout prêt', 'Partiellement', 'Non, besoin d’aide']).optional(),
  pagesAMettreJour: z.boolean().optional(),
});

const step4Schema = z.object({
  fonctionnalites: z.array(z.string()).optional(),
  fonctionnaliteAutre: z.string().optional(),
});

const step5Schema = z.object({
  typesProduitsServices: z.array(z.enum(['Physiques', 'Numériques', 'Services', 'Abonnements'])).optional(),
  nombreProduits: z.enum(['< 50', '50 - 500', '500 - 5 000', '> 5 000']).optional(),
  besoinsSpecifiques: z.array(z.enum(['Gestion stock', 'Variantes produits', 'Filtres de recherche', 'Codes promo', 'Suivi de commande', 'Livraison automatique'])).optional(),
});

const step6Schema = z.object({
  webMobile: z.array(z.enum(['Site responsive mobile', 'Application Android', 'Application iOS', 'Notifications (push, email, SMS)'])).optional(),
});

const step7Schema = z.object({
  designAssets: z.array(z.enum(['Logo + charte graphique', 'Seulement un logo', 'Besoin d’aide pour le design'])).optional(),
  stylePrefere: z.array(z.enum(['Moderne', 'Classique', 'Minimaliste', 'Premium', 'Coloré / dynamique', 'Sobre / professionnel'])).optional(),
  styleAutre: z.string().optional(),
});

const step8Schema = z.object({
  gestionSite: z.enum(['Oui', 'Non']).optional(),
  hebergement: z.enum(['Oui, existant', 'Non', 'À prévoir']).optional(),
  connexionOutils: z.enum(['Oui', 'Non', 'Ne sais pas']).optional(),
});

const step9Schema = z.object({
  respectRGPD: z.enum(['Oui', 'Non', 'Ne sais pas']).optional(),
  sauvegardesAuto: z.enum(['Oui', 'Non']).optional(),
});

const step10Schema = z.object({
  besoinsMaintenance: z.array(z.enum(['Formation gestion site', 'Documentation simple', 'Assistance ponctuelle', 'Contrat maintenance'])).optional(),
});

const step11Schema = z.object({
  budget: z.enum(['< 1 000 €', '1 000 - 3 000 €', '3 000 - 10 000 €', '> 10 000 €', 'Indécis']).optional(),
  paiement: z.enum(['En une fois', 'En plusieurs étapes']).optional(),
  appelOffre: z.enum(['Oui', 'Non']).optional(),
});

const step12Schema = z.object({
  accompagnementCM: z.enum(['Gestion complète réseaux sociaux', 'Lancement uniquement', 'Non, je gère moi-même', 'Indécis']).optional(),
  plateformesCM: z.array(z.enum(['Facebook', 'Instagram', 'LinkedIn', 'Twitter/X', 'TikTok', 'YouTube', 'Pinterest'])).optional(),
  autrePlateformeCM: z.string().optional(),
  besoinsComDigitale: z.array(z.enum(['Création / optimisation profils', 'Contenus visuels (images, vidéos)', 'Planning éditorial', 'Rédaction posts', 'Campagnes sponsorisées', 'Analyse performances', 'Newsletter / email marketing'])).optional(),
  autreBesoinCom: z.string().optional(),
  strategieExistante: z.enum(['Oui', 'Non', 'En cours', 'Besoin de conseils']).optional(),
});

const step13Schema = z.object({
  importanceReferencement: z.enum(['Essentiel', 'Souhaité mais pas prioritaire', 'Non', 'Ne sais pas']).optional(),
  accompagnementSEO: z.array(z.enum(['Optimisation SEO', 'Contenus optimisés', 'Suivi position Google', 'Référencement local', 'Publicité payante', 'Analyse trafic', 'Audit SEO'])).optional(),
  autreAccompagnementSEO: z.string().optional(),
});

const step14Schema = z.object({
  gestionEReputation: z.enum(['Oui', 'Non', 'Ne sais pas']).optional(),
  actionsAvis: z.array(z.enum(['Collecte d’avis', 'Affichage avis site', 'Connexion plateformes avis (Google, Trustpilot)', 'Modération avis', 'Réponses automatisées', 'Suivi avis négatifs', 'Rien pour le moment'])).optional(),
});

const step15Schema = z.object({
  remarques: z.string().optional(),
});

const fullSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema)
  .merge(step6Schema)
  .merge(step7Schema)
  .merge(step8Schema)
  .merge(step9Schema)
  .merge(step10Schema)
  .merge(step11Schema)
  .merge(step12Schema)
  .merge(step13Schema)
  .merge(step14Schema)
  .merge(step15Schema);

type FormValues = z.infer<typeof fullSchema>;



export default function FormulaireEtapes() {
  const [step, setStep] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stepTitles = [
    'Informations Générales',
    'Objectifs du site',
    'Contenu & Pages',
    'Fonctionnalités principales',
    'Vente en ligne',
    'Web & Mobile',
    'Design & Image',
    'Gestion & Technique',
 <div className="inline-flex items-center space-x-1">
  <span>Sécurité & RGPD</span>
  <InfoTooltip content="Respect des réglementations : stockage des données, consentement, cookies…" />
</div>,
    'Maintenance & Formation',
    'Budget & Modalités',
    'Community Management & Communication Digitale',
 <div className="inline-flex items-center space-x-1">
  <span>Référencement & Visibilité</span>
  <InfoTooltip content="Optimisation SEO, Google Ads, stratégie de contenu, visibilité web…" />
</div>,
    'E-réputation & Avis',
    'Autres besoins ou remarques',
  ];

  const stepDescriptions = [
    'Fournissez les informations de base sur votre projet et vos coordonnées.',
    'Définissez les objectifs principaux de votre site et identifiez votre public cible.',
    'Indiquez les pages que vous souhaitez inclure et l’état de votre contenu.',
    'Sélectionnez les fonctionnalités essentielles pour votre site.',
    'Précisez si vous envisagez une boutique en ligne et ses besoins spécifiques.',
    'Choisissez les options pour l’accessibilité mobile et les notifications.',
    'Décrivez vos besoins en design et le style visuel préféré.',
    'Détaillez vos préférences pour la gestion et l’hébergement du site.',
    'Indiquez vos besoins en matière de conformité RGPD et de sauvegardes.',
    'Sélectionnez les services de maintenance et de formation souhaités.',
    'Précisez votre budget, les modalités de paiement et l’appel d’offre.',
    'Décrivez vos besoins en gestion des réseaux sociaux et communication digitale.',
    'Indiquez l’importance du référencement et les services SEO souhaités.',
    'Détaillez vos besoins en gestion de l’e-réputation et des avis clients.',
    'Ajoutez toute information supplémentaire ou remarques spécifiques.',
  ];

  const methods = useForm<FormValues>({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      objectifs: [],
      pages: [],
      fonctionnalites: [],
      typesProduitsServices: [],
      besoinsSpecifiques: [],
      webMobile: [],
      designAssets: [],
      stylePrefere: [],
      besoinsMaintenance: [],
      plateformesCM: [],
      besoinsComDigitale: [],
      accompagnementSEO: [],
      actionsAvis: [],
    },
  });

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = methods;

  const getFieldsForStep = (currentStep: number): (keyof FormValues)[] => {
    const stepFieldsMap: Record<number, (keyof FormValues)[]> = {
      0: ['nomProjet', 'email'],
      1: ['objectifs', 'publicCible'],
      2: ['pages', 'contenuDisponible'],
      3: ['fonctionnalites'],
      4: ['typesProduitsServices', 'nombreProduits', 'besoinsSpecifiques'],
      5: ['webMobile'],
      6: ['designAssets', 'stylePrefere'],
      7: ['gestionSite', 'hebergement', 'connexionOutils'],
      8: ['respectRGPD', 'sauvegardesAuto'],
      9: ['besoinsMaintenance'],
      10: ['budget', 'paiement', 'appelOffre'],
      11: ['accompagnementCM', 'plateformesCM', 'besoinsComDigitale', 'strategieExistante'],
      12: ['importanceReferencement', 'accompagnementSEO'],
      13: ['gestionEReputation', 'actionsAvis'],
      14: ['remarques'],
    };
    return stepFieldsMap[currentStep] || [];
  };

  const onNext = async () => {
    const fields = getFieldsForStep(step);
    const isValid = await trigger(fields, { shouldFocus: true });
    if (isValid) {
      setStep((s) => s + 1);
    }
  };

  const onPrev = () => {
    setStep((s) => s - 1);
  };

  const onSubmit = async (data: FormValues) => {
    if (step !== 14) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const finalData = {
        ...data,
        objectifs: [...(data.objectifs || []), ...(data.objectifAutre ? [data.objectifAutre] : [])],
        pages: [...(data.pages || []), ...(data.pageAutre ? [data.pageAutre] : [])],
        fonctionnalites: [...(data.fonctionnalites || []), ...(data.fonctionnaliteAutre ? [data.fonctionnaliteAutre] : [])],
        stylePrefere: [...(data.stylePrefere || []), ...(data.styleAutre ? [data.styleAutre] : [])],
        plateformesCM: [...(data.plateformesCM || []), ...(data.autrePlateformeCM ? [data.autrePlateformeCM] : [])],
        besoinsComDigitale: [...(data.besoinsComDigitale || []), ...(data.autreBesoinCom ? [data.autreBesoinCom] : [])],
        accompagnementSEO: [...(data.accompagnementSEO || []), ...(data.autreAccompagnementSEO ? [data.autreAccompagnementSEO] : [])],
      };

      const res = await fetch('/api/form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erreur lors de l’envoi');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6 sm:p-8"
      >
        {/* Barre de progression */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{stepTitles[step]}</h1>
            <span className="text-sm text-gray-500">Étape {step + 1} / {stepTitles.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${((step + 1) / stepTitles.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Description de l'étape */}
        <p className="text-gray-600 mb-6">{stepDescriptions[step]}</p>

        <FormProvider {...methods}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (step === 14) {
                handleSubmit(onSubmit)(e);
              } else {
                onNext();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && step !== 14) e.preventDefault();
            }}
            className="space-y-6"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                {step === 0 && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="nomProjet">
                          Nom du projet / entreprise <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register('nomProjet')}
                          id="nomProjet"
                          className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          aria-describedby="nomProjet-error"
                        />
                        {errors.nomProjet && (
                          <p id="nomProjet-error" className="text-red-500 text-sm mt-1">
                            {errors.nomProjet.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="contactNom">
                          Nom du contact
                        </label>
                        <input
                          {...register('contactNom')}
                          id="contactNom"
                          className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="contactFonction">
                          Fonction du contact
                        </label>
                        <input
                          {...register('contactFonction')}
                          id="contactFonction"
                          className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          {...register('email')}
                          id="email"
                          className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          aria-describedby="email-error"
                        />
                        {errors.email && (
                          <p id="email-error" className="text-red-500 text-sm mt-1">
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="telephone">
                          Téléphone
                        </label>
                        <input
                          {...register('telephone')}
                          id="telephone"
                          className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="siteWeb">
                          Site web existant
                        </label>
                        <input
                          {...register('siteWeb')}
                          id="siteWeb"
                          className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="dateMiseEnLigne">
                          Date souhaitée de mise en ligne
                        </label>
                        <input
                          type="date"
                          {...register('dateMiseEnLigne')}
                          id="dateMiseEnLigne"
                          className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="evenementAssocie">
                          Événement ou échéance liée au projet
                        </label>
                        <input
                          {...register('evenementAssocie')}
                          id="evenementAssocie"
                          className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Quels sont vos objectifs ?
                        </label>
                        <div className="mt-2 flex flex-col gap-2">
                          {[
                            'Présenter mon activité',
                            'Vendre en ligne',
                            'Gagner en visibilité',
                            'Informer / former',
                            'Obtenir des contacts',
                            'Créer une communauté',
                          ].map((option) => (
                            <label key={option} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                value={option}
                                {...register('objectifs')}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-gray-700">{option}</span>
                            </label>
                          ))}
                          <label className="flex items-center gap-2">
                            <span className="text-gray-700">Autre</span>
                            <input
                              {...register('objectifAutre')}
                              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="publicCible">
                          Public cible principal
                        </label>
                        <input
                          {...register('publicCible')}
                          id="publicCible"
                          className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Pages souhaitées :
                        </label>
                        <div className="mt-2 flex flex-col gap-2">
                          {[
                            'Accueil',
                            'À propos',
                            'Produits / Services',
                            'Blog / Actualités',
                            'Portfolio / Galerie',
                            'Témoignages',
                            'Contact',
                            'FAQ',
                          ].map((page) => (
                            <label key={page} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                value={page}
                                {...register('pages')}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-gray-700">{page}</span>
                            </label>
                          ))}
                          <label className="flex items-center gap-2">
                            <span className="text-gray-700">Autre </span>
                            <input
                              {...register('pageAutre')}
                              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="contenuDisponible">
                          Contenus disponibles ?
                        </label>
                        <select
                          {...register('contenuDisponible')}
                          id="contenuDisponible"
                          className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">-- Choisir --</option>
                          <option value="Oui, tout prêt">Oui, tout prêt</option>
                          <option value="Partiellement">Partiellement</option>
                          <option value="Non, besoin d’aide">Non, besoin d’aide</option>
                        </select>
                      </div>
                      <div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            {...register('pagesAMettreJour')}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-gray-700">Certaines pages à mettre à jour régulièrement ?</span>
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Fonctionnalités principales souhaitées :
                        </label>
                        <div className="mt-2 flex flex-col gap-2">
                          {[
                            'Formulaire contact',
                            'Prise de rendez-vous',
                            'Espace client/utilisateur',
                            'Paiement en ligne',
                            'Téléchargements',
                            'Carte / géolocalisation',
                            'Recherche interne',
                            'Multilingue',
                            'Newsletters / emails automatiques',
                            'Espace privé sécurisé',
                          ].map((item) => (
                            <label key={item} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                value={item}
                                {...register('fonctionnalites')}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-gray-700">{item}</span>
                            </label>
                          ))}
                          <label className="flex items-center gap-2">
                            <span className="text-gray-700">Autre </span>
                            <input
                              {...register('fonctionnaliteAutre')}
                              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {step === 4 && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Types de produits/services :
                        </label>
                        <div className="mt-2 flex flex-col gap-2">
                          {['Physiques', 'Numériques', 'Services', 'Abonnements'].map((type) => (
                            <label key={type} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                value={type}
                                {...register('typesProduitsServices')}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-gray-700">{type}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Nombre approximatif de produits :
                        </label>
                        <div className="mt-2 flex flex-col gap-2">
                          {['< 50', '50 - 500', '500 - 5 000', '> 5 000'].map((nombre) => (
                            <label key={nombre} className="flex items-center gap-2">
                              <input
                                type="radio"
                                value={nombre}
                                {...register('nombreProduits')}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-gray-700">{nombre}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Besoins spécifiques :
                        </label>
                        <div className="mt-2 flex flex-col gap-2">
                          {[
                            'Gestion stock',
                            'Variantes produits',
                            'Filtres de recherche',
                            'Codes promo',
                            'Suivi de commande',
                            'Livraison automatique',
                          ].map((besoin) => (
                            <label key={besoin} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                value={besoin}
                                {...register('besoinsSpecifiques')}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-gray-700">{besoin}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {step === 5 && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Souhaitez-vous :
                        </label>
                        <div className="mt-2 flex flex-col gap-2">
                          {[
                            'Site responsive mobile',
                            'Application Android',
                            'Application iOS',
                            'Notifications (push, email, SMS)',
                          ].map((item) => (
                            <label key={item} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                value={item}
                                {...register('webMobile')}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-gray-700">{item}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {step === 6 && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Avez-vous déjà :
                        </label>
                        <div className="mt-2 flex flex-col gap-2">
                          {[
                            'Logo + charte graphique',
                            'Seulement un logo',
                            'Besoin d’aide pour le design',
                          ].map((item) => (
                            <label key={item} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                value={item}
                                {...register('designAssets')}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-gray-700">{item}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Style préféré :
                        </label>
                        <div className="mt-2 flex flex-col gap-2">
                          {[
                            'Moderne',
                            'Classique',
                            'Minimaliste',
                            'Premium',
                            'Coloré / dynamique',
                            'Sobre / professionnel',
                          ].map((style) => (
                            <label key={style} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                value={style}
                                {...register('stylePrefere')}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-gray-700">{style}</span>
                            </label>
                          ))}
                          <label className="flex items-center gap-2">
                            <span className="text-gray-700">Autre </span>
                            <input
                              {...register('styleAutre')}
                              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {step === 7 && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Souhaitez-vous gérer vous-même la plateforme ?
                        </label>
                        <div className="mt-2 flex flex-col gap-2">
                          {['Oui', 'Non'].map((opt) => (
                            <label key={opt} className="flex items-center gap-2">
                              <input
                                type="radio"
                                value={opt}
                                {...register('gestionSite')}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-gray-700">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Hébergement :
                        </label>
                        <div className="mt-2 flex flex-col gap-2">
                          {['Oui, existant', 'Non', 'À prévoir'].map((opt) => (
                            <label key={opt} className="flex items-center gap-2">
                              <input
                                type="radio"
                                value={opt}
                                {...register('hebergement')}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-gray-700">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Connexion avec d’autres outils (CRM, ERP, etc.) ?
                        </label>
                        <div className="mt-2 flex flex-col gap-2">
                          {['Oui', 'Non', 'Ne sais pas'].map((opt) => (
                            <label key={opt} className="flex items-center gap-2">
                              <input
                                type="radio"
                                value={opt}
                                {...register('connexionOutils')}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-gray-700">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {step === 8 && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <div className="inline-flex items-center space-x-1">
  <label className="block text-sm font-medium text-gray-700">
    Respect RGPD ?
  </label>
  <InfoTooltip content="Le RGPD (Règlement Général sur la Protection des Données) impose des règles sur la collecte, le traitement et la conservation des données personnelles." />
</div>

                        <div className="mt-2 flex flex-col gap-2">
                          {['Oui', 'Non', 'Ne sais pas'].map((opt) => (
                            <label key={opt} className="flex items-center gap-2">
                              <input
                                type="radio"
                                value={opt}
                                {...register('respectRGPD')}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-gray-700">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Sauvegardes automatiques ?
                        </label>
                        <div className="mt-2 flex flex-col gap-2">
                          {['Oui', 'Non'].map((opt) => (
                            <label key={opt} className="flex items-center gap-2">
                              <input
                                type="radio"
                                value={opt}
                                {...register('sauvegardesAuto')}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-gray-700">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {step === 9 && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Besoin de :
                        </label>
                        <div className="mt-2 flex flex-col gap-2">
                          {[
                            'Formation gestion site',
                            'Documentation simple',
                            'Assistance ponctuelle',
                            'Contrat maintenance',
                          ].map((item) => (
                            <label key={item} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                value={item}
                                {...register('besoinsMaintenance')}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-gray-700">{item}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {step === 10 && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Budget approximatif :
                        </label>
                        <div className="mt-2 flex flex-col gap-2">
                          {[
                            '< 1 000 €',
                            '1 000 - 3 000 €',
                            '3 000 - 10 000 €',
                            '> 10 000 €',
                            'Indécis',
                          ].map((opt) => (
                            <label key={opt} className="flex items-center gap-2">
                              <input
                                type="radio"
                                value={opt}
                                {...register('budget')}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-gray-700">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Paiement :
                        </label>
                        <div className="mt-2 flex flex-col gap-2">
                          {['En une fois', 'En plusieurs étapes'].map((opt) => (
                            <label key={opt} className="flex items-center gap-2">
                              <input
                                type="radio"
                                value={opt}
                                {...register('paiement')}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-gray-700">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Appel d’offre ?
                        </label>
                        <div className="mt-2 flex flex-col gap-2">
                          {['Oui', 'Non'].map((opt) => (
                            <label key={opt} className="flex items-center gap-2">
                              <input
                                type="radio"
                                value={opt}
                                {...register('appelOffre')}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-gray-700">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {step === 11 && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Souhaitez-vous un accompagnement pour :
                        </label>
                        <div className="mt-2 flex flex-col gap-2">
                          {[
                            'Gestion complète réseaux sociaux',
                            'Lancement uniquement',
                            'Non, je gère moi-même',
                            'Indécis',
                          ].map((item) => (
                            <label key={item} className="flex items-center gap-2">
                              <input
                                type="radio"
                                value={item}
                                {...register('accompagnementCM')}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-gray-700">{item}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Plateformes concernées :
                        </label>
                        <div className="mt-2 flex flex-col gap-2">
                          {[
                            'Facebook',
                            'Instagram',
                            'LinkedIn',
                            'Twitter/X',
                            'TikTok',
                            'YouTube',
                            'Pinterest',
                          ].map((p) => (
                            <label key={p} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                value={p}
                                {...register('plateformesCM')}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-gray-700">{p}</span>
                            </label>
                          ))}
                          <label className="flex items-center gap-2">
                            <span className="text-gray-700">Autre </span>
                            <input
                              {...register('autrePlateformeCM')}
                              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Besoins en communication :
                        </label>
                        <div className="mt-2 flex flex-col gap-2">
                          {[
                            'Création / optimisation profils',
                            'Contenus visuels (images, vidéos)',
                            'Planning éditorial',
                            'Rédaction posts',
                            'Campagnes sponsorisées',
                            'Analyse performances',
                            'Newsletter / email marketing',
                          ].map((b) => (
                            <label key={b} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                value={b}
                                {...register('besoinsComDigitale')}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-gray-700">{b}</span>
                            </label>
                          ))}
                          <label className="flex items-center gap-2">
                            <span className="text-gray-700">Autre </span>
                            <input
                              {...register('autreBesoinCom')}
                              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Stratégie existante ?
                        </label>
                        <div className="mt-2 flex flex-col gap-2">
                          {['Oui', 'Non', 'En cours', 'Besoin de conseils'].map((opt) => (
                            <label key={opt} className="flex items-center gap-2">
                              <input
                                type="radio"
                                value={opt}
                                {...register('strategieExistante')}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-gray-700">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {step === 12 && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Importance du référencement Google :
                        </label>
                        <div className="mt-2 flex flex-col gap-2">
                          {[
                            'Essentiel',
                            'Souhaité mais pas prioritaire',
                            'Non',
                            'Ne sais pas',
                          ].map((opt) => (
                            <label key={opt} className="flex items-center gap-2">
                              <input
                                type="radio"
                                value={opt}
                                {...register('importanceReferencement')}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-gray-700">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="inline-flex items-center space-x-1">
  <label className="block text-sm font-medium text-gray-700">
    Accompagnement SEO souhaité :
  </label>
  <InfoTooltip content="Accompagnement dans l’optimisation de votre référencement naturel : mots-clés, balises, contenus, performances techniques…" />
</div>

                        <div className="mt-2 flex flex-col gap-2">
                          {[
                            'Optimisation SEO',
                            'Contenus optimisés',
                            'Suivi position Google',
                            'Référencement local',
                            'Publicité payante',
                            'Analyse trafic',
                            'Audit SEO',
                          ].map((seo) => (
                            <label key={seo} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                value={seo}
                                {...register('accompagnementSEO')}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-gray-700">{seo}</span>
                            </label>
                          ))}
                          <label className="flex items-center gap-2">
                            <span className="text-gray-700">Autre</span>
                            <input
                              {...register('autreAccompagnementSEO')}
                              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {step === 13 && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Souhaitez-vous gérer votre e-réputation ?
                        </label>
                        <div className="mt-2 flex flex-col gap-2">
                          {['Oui', 'Non', 'Ne sais pas'].map((opt) => (
                            <label key={opt} className="flex items-center gap-2">
                              <input
                                type="radio"
                                value={opt}
                                {...register('gestionEReputation')}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-gray-700">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Actions envisagées :
                        </label>
                        <div className="mt-2 flex flex-col gap-2">
                          {[
                            'Collecte d’avis',
                            'Affichage avis site',
                            'Connexion plateformes avis (Google, Trustpilot)',
                            'Modération avis',
                            'Réponses automatisées',
                            'Suivi avis négatifs',
                            'Rien pour le moment',
                          ].map((a) => (
                            <label key={a} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                value={a}
                                {...register('actionsAvis')}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-gray-700">{a}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {step === 14 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700" htmlFor="remarques">
                        Autres besoins ou remarques :
                      </label>
                      <textarea
                        {...register('remarques')}
                        id="remarques"
                        className="mt-1 w-full border border-gray-300 rounded-md p-2 min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ajoutez ici tout besoin spécifique ou commentaire"
                        aria-describedby="remarques-error"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-4 pt-6 justify-between">
              {step > 0 && (
                <motion.button
                  type="button"
                  onClick={onPrev}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Précédent
                </motion.button>
              )}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-md text-white font-medium ${
                  isSubmitting
                    ? 'bg-blue-400 cursor-not-allowed'
                    : step < 14
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-green-600 hover:bg-green-700'
                } focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Envoi...
                  </span>
                ) : step < 14 ? (
                  'Suivant'
                ) : (
                  'Soumettre'
                )}
              </motion.button>
            </div>

            {success && (
  <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-green-600 text-center mt-4"
  >
    Formulaire soumis avec succès !
  </motion.p>
)}
{error && (
  <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-red-500 text-center mt-4"
  >
    {error}
  </motion.p>
)}

          </form>
        </FormProvider>
      </motion.div>
    </div>
  );
}
