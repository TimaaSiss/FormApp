'use client';
import { useEffect,useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Info } from 'lucide-react';
import InfoTooltip from '@/app/components/infoTooltip';
import { useFormStore } from '@/store/formStore';
import { sendEmail } from '@/actions/sendEmail';


interface InfoTooltipProps {
  content: string;
}

// Schémas Zod
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

export const fullSchema = step1Schema
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
  const { formData, step, setFormData, setStep, reset } = useFormStore();
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
    'Précisez vos besoins pour une éventuelle boutique en ligne.',
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
    defaultValues: formData,
  });

  const {
    register,
    handleSubmit,
    trigger,
    reset: resetForm,
    formState: { errors },
    setValue,
  } = methods;

  // Synchroniser formData du store avec react-hook-form
  useEffect(() => {
    Object.entries(formData).forEach(([key, value]) => {
      setValue(key as keyof FormValues, value);
    });
  }, [formData, setValue]);

  // Mettre à jour le store à chaque changement du formulaire
  const onChange = (data: Partial<FormValues>) => {
    setFormData(data);
  };

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
      setStep(step + 1);
    }
  };

  const onPrev = () => {
    setStep(step - 1);
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

    // 1. Soumettre les données à /api/form
    const res = await fetch('/api/form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalData),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Erreur lors de l’envoi');
    }

    // 2. Envoyer l'email de confirmation
    await sendEmail(
      data.email,
      'Confirmation de votre soumission',
      data.contactNom || 'Utilisateur'
    );

    // 3. Afficher le message de succès et réinitialiser
    setSuccess(true);
    setTimeout(() => {
      reset(); // Réinitialiser le store Zustand
      resetForm(); // Réinitialiser react-hook-form
      setSuccess(false);
      setIsSubmitting(false);
    }, 3000);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Erreur inconnue');
    setIsSubmitting(false);
  }
};

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4 sm:p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8 sm:p-10"
      >
        {/* Barre de progression */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-3xl font-bold text-[#1E3A8A] tracking-tight">{stepTitles[step]}</h1>
            <span className="text-sm text-gray-500 font-medium">Étape {step + 1} / {stepTitles.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <motion.div
              className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] h-2.5 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${((step + 1) / stepTitles.length) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Description de l'étape */}
        <p className="text-gray-600 mb-8 text-sm">{stepDescriptions[step]}</p>

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
            className="space-y-8"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {step === 0 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700" htmlFor="nomProjet">
                        Nom du projet / entreprise <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('nomProjet', { onChange: (e) => onChange({ nomProjet: e.target.value }) })}
                        id="nomProjet"
                        className="mt-1 w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors"
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
                        {...register('contactNom', { onChange: (e) => onChange({ contactNom: e.target.value }) })}
                        id="contactNom"
                        className="mt-1 w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700" htmlFor="contactFonction">
                        Fonction du contact
                      </label>
                      <input
                        {...register('contactFonction', {
                          onChange: (e) => onChange({ contactFonction: e.target.value }),
                        })}
                        id="contactFonction"
                        className="mt-1 w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        {...register('email', { onChange: (e) => onChange({ email: e.target.value }) })}
                        id="email"
                        className="mt-1 w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors"
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
                        {...register('telephone', { onChange: (e) => onChange({ telephone: e.target.value }) })}
                        id="telephone"
                        className="mt-1 w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700" htmlFor="siteWeb">
                        Site web existant
                      </label>
                      <input
                        {...register('siteWeb', { onChange: (e) => onChange({ siteWeb: e.target.value }) })}
                        id="siteWeb"
                        className="mt-1 w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700" htmlFor="dateMiseEnLigne">
                        Date souhaitée de mise en ligne
                      </label>
                      <input
                        type="date"
                        {...register('dateMiseEnLigne', {
                          onChange: (e) => onChange({ dateMiseEnLigne: e.target.value }),
                        })}
                        id="dateMiseEnLigne"
                        className="mt-1 w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700" htmlFor="evenementAssocie">
                        Événement ou échéance liée au projet
                      </label>
                      <input
                        {...register('evenementAssocie', {
                          onChange: (e) => onChange({ evenementAssocie: e.target.value }),
                        })}
                        id="evenementAssocie"
                        className="mt-1 w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors"
                      />
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Quels sont vos objectifs ?
                      </label>
                      <div className="mt-2 flex flex-col gap-3">
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
                              {...register('objectifs', {
                               onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                                  const values = Array.from(
                                    e.target.form?.querySelectorAll<HTMLInputElement>(`input[name="objectifs"]:checked`) || []
                                  ).map((el) => el.value);
                                  onChange({ objectifs: values });
                                },
                              })}
                              className="h-4 w-4 text-[#1E3A8A] border-gray-300 rounded focus:ring-[#D4AF37]"
                            />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                        <label className="flex items-center gap-2">
                          <span className="text-gray-700">Autre</span>
                          <input
                            {...register('objectifAutre', {
                              onChange: (e) => onChange({ objectifAutre: e.target.value }),
                            })}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors"
                          />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700" htmlFor="publicCible">
                        Public cible principal
                      </label>
                      <input
                        {...register('publicCible', { onChange: (e) => onChange({ publicCible: e.target.value }) })}
                        id="publicCible"
                        className="mt-1 w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors"
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Pages souhaitées :
                      </label>
                      <div className="mt-2 flex flex-col gap-3">
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
                              {...register('pages', {
                                onChange: (e) => {
                                  const values = e.target.form
                                    ?.querySelectorAll(`input[name="pages"]:checked`)
                                    .map((el: HTMLInputElement) => el.value);
                                  onChange({ pages: values });
                                },
                              })}
                              className="h-4 w-4 text-[#1E3A8A] border-gray-300 rounded focus:ring-[#D4AF37]"
                            />
                            <span className="text-gray-700">{page}</span>
                          </label>
                        ))}
                        <label className="flex items-center gap-2">
                          <span className="text-gray-700">Autre </span>
                          <input
                            {...register('pageAutre', { onChange: (e) => onChange({ pageAutre: e.target.value }) })}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors"
                          />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700" htmlFor="contenuDisponible">
                        Contenus disponibles ?
                      </label>
                      <select
                        {...register('contenuDisponible', {
                          onChange: (e) => onChange({ contenuDisponible: e.target.value }),
                        })}
                        id="contenuDisponible"
                        className="mt-1 w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors"
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
                          {...register('pagesAMettreJour', {
                            onChange: (e) => onChange({ pagesAMettreJour: e.target.checked }),
                          })}
                          className="h-4 w-4 text-[#1E3A8A] border-gray-300 rounded focus:ring-[#D4AF37]"
                        />
                        <span className="text-gray-700">Certaines pages à mettre à jour régulièrement ?</span>
                      </label>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Fonctionnalités principales souhaitées :
                      </label>
                      <div className="mt-2 flex flex-col gap-3">
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
                              {...register('fonctionnalites', {
                                onChange: (e) => {
                                  const values = e.target.form
                                    ?.querySelectorAll(`input[name="fonctionnalites"]:checked`)
                                    .map((el: HTMLInputElement) => el.value);
                                  onChange({ fonctionnalites: values });
                                },
                              })}
                              className="h-4 w-4 text-[#1E3A8A] border-gray-300 rounded focus:ring-[#D4AF37]"
                            />
                            <span className="text-gray-700">{item}</span>
                          </label>
                        ))}
                        <label className="flex items-center gap-2">
                          <span className="text-gray-700">Autre </span>
                          <input
                            {...register('fonctionnaliteAutre', {
                              onChange: (e) => onChange({ fonctionnaliteAutre: e.target.value }),
                            })}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Types de produits/services :
                      </label>
                      <div className="mt-2 flex flex-col gap-3">
                        {['Physiques', 'Numériques', 'Services', 'Abonnements'].map((type) => (
                          <label key={type} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              value={type}
                              {...register('typesProduitsServices', {
                                onChange: (e) => {
                                  const values = e.target.form
                                    ?.querySelectorAll(`input[name="typesProduitsServices"]:checked`)
                                    .map((el: HTMLInputElement) => el.value);
                                  onChange({ typesProduitsServices: values });
                                },
                              })}
                              className="h-4 w-4 text-[#1E3A8A] border-gray-300 rounded focus:ring-[#D4AF37]"
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
                      <div className="mt-2 flex flex-col gap-3">
                        {['< 50', '50 - 500', '500 - 5 000', '> 5 000'].map((nombre) => (
                          <label key={nombre} className="flex items-center gap-2">
                            <input
                              type="radio"
                              value={nombre}
                              {...register('nombreProduits', {
                                onChange: (e) => onChange({ nombreProduits: e.target.value }),
                              })}
                              className="h-4 w-4 text-[#1E3A8A] border-gray-300 focus:ring-[#D4AF37]"
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
                      <div className="mt-2 flex flex-col gap-3">
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
                              {...register('besoinsSpecifiques', {
                                onChange: (e) => {
                                  const values = e.target.form
                                    ?.querySelectorAll(`input[name="besoinsSpecifiques"]:checked`)
                                    .map((el: HTMLInputElement) => el.value);
                                  onChange({ besoinsSpecifiques: values });
                                },
                              })}
                              className="h-4 w-4 text-[#1E3A8A] border-gray-300 rounded focus:ring-[#D4AF37]"
                            />
                            <span className="text-gray-700">{besoin}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Souhaitez-vous :
                      </label>
                      <div className="mt-2 flex flex-col gap-3">
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
                              {...register('webMobile', {
                                onChange: (e) => {
                                  const values = e.target.form
                                    ?.querySelectorAll(`input[name="webMobile"]:checked`)
                                    .map((el: HTMLInputElement) => el.value);
                                  onChange({ webMobile: values });
                                },
                              })}
                              className="h-4 w-4 text-[#1E3A8A] border-gray-300 rounded focus:ring-[#D4AF37]"
                            />
                            <span className="text-gray-700">{item}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 6 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Avez-vous déjà :
                      </label>
                      <div className="mt-2 flex flex-col gap-3">
                        {[
                          'Logo + charte graphique',
                          'Seulement un logo',
                          'Besoin d’aide pour le design',
                        ].map((item) => (
                          <label key={item} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              value={item}
                              {...register('designAssets', {
                                onChange: (e) => {
                                  const values = e.target.form
                                    ?.querySelectorAll(`input[name="designAssets"]:checked`)
                                    .map((el: HTMLInputElement) => el.value);
                                  onChange({ designAssets: values });
                                },
                              })}
                              className="h-4 w-4 text-[#1E3A8A] border-gray-300 rounded focus:ring-[#D4AF37]"
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
                      <div className="mt-2 flex flex-col gap-3">
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
                              {...register('stylePrefere', {
                                onChange: (e) => {
                                  const values = e.target.form
                                    ?.querySelectorAll(`input[name="stylePrefere"]:checked`)
                                    .map((el: HTMLInputElement) => el.value);
                                  onChange({ stylePrefere: values });
                                },
                              })}
                              className="h-4 w-4 text-[#1E3A8A] border-gray-300 rounded focus:ring-[#D4AF37]"
                            />
                            <span className="text-gray-700">{style}</span>
                          </label>
                        ))}
                        <label className="flex items-center gap-2">
                          <span className="text-gray-700">Autre </span>
                          <input
                            {...register('styleAutre', { onChange: (e) => onChange({ styleAutre: e.target.value }) })}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {step === 7 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Souhaitez-vous gérer vous-même la plateforme ?
                      </label>
                      <div className="mt-2 flex flex-col gap-3">
                        {['Oui', 'Non'].map((opt) => (
                          <label key={opt} className="flex items-center gap-2">
                            <input
                              type="radio"
                              value={opt}
                              {...register('gestionSite', {
                                onChange: (e) => onChange({ gestionSite: e.target.value }),
                              })}
                              className="h-4 w-4 text-[#1E3A8A] border-gray-300 focus:ring-[#D4AF37]"
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
                      <div className="mt-2 flex flex-col gap-3">
                        {['Oui, existant', 'Non', 'À prévoir'].map((opt) => (
                          <label key={opt} className="flex items-center gap-2">
                            <input
                              type="radio"
                              value={opt}
                              {...register('hebergement', {
                                onChange: (e) => onChange({ hebergement: e.target.value }),
                              })}
                              className="h-4 w-4 text-[#1E3A8A] border-gray-300 focus:ring-[#D4AF37]"
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
                      <div className="mt-2 flex flex-col gap-3">
                        {['Oui', 'Non', 'Ne sais pas'].map((opt) => (
                          <label key={opt} className="flex items-center gap-2">
                            <input
                              type="radio"
                              value={opt}
                              {...register('connexionOutils', {
                                onChange: (e) => onChange({ connexionOutils: e.target.value }),
                              })}
                              className="h-4 w-4 text-[#1E3A8A] border-gray-300 focus:ring-[#D4AF37]"
                            />
                            <span className="text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 8 && (
                  <div className="space-y-6">
                    <div>
                      <div className="inline-flex items-center space-x-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Respect RGPD ?
                        </label>
                        <InfoTooltip content="Le RGPD (Règlement Général sur la Protection des Données) impose des règles sur la collecte, le traitement et la conservation des données personnelles." />
                      </div>
                      <div className="mt-2 flex flex-col gap-3">
                        {['Oui', 'Non', 'Ne sais pas'].map((opt) => (
                          <label key={opt} className="flex items-center gap-2">
                            <input
                              type="radio"
                              value={opt}
                              {...register('respectRGPD', {
                                onChange: (e) => onChange({ respectRGPD: e.target.value }),
                              })}
                              className="h-4 w-4 text-[#1E3A8A] border-gray-300 focus:ring-[#D4AF37]"
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
                      <div className="mt-2 flex flex-col gap-3">
                        {['Oui', 'Non'].map((opt) => (
                          <label key={opt} className="flex items-center gap-2">
                            <input
                              type="radio"
                              value={opt}
                              {...register('sauvegardesAuto', {
                                onChange: (e) => onChange({ sauvegardesAuto: e.target.value }),
                              })}
                              className="h-4 w-4 text-[#1E3A8A] border-gray-300 focus:ring-[#D4AF37]"
                            />
                            <span className="text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 9 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Besoin de :
                      </label>
                      <div className="mt-2 flex flex-col gap-3">
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
                              {...register('besoinsMaintenance', {
                               onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                                  const validValues = [
                                    "Formation gestion site",
                                    "Documentation simple",
                                    "Assistance ponctuelle",
                                    "Contrat maintenance",
                                  ] as const;
                                  type MaintenanceValue = typeof validValues[number];
                                  const values = Array.from(
                                    e.target.form?.querySelectorAll<HTMLInputElement>(`input[name="besoinsMaintenance"]:checked`) || []
                                  )
                                    .map((el) => el.value as MaintenanceValue)
                                    .filter((value) => validValues.includes(value));
                                  onChange({ besoinsMaintenance: values });
                                },
                              })}
                              className="h-4 w-4 text-[#1E3A8A] border-gray-300 rounded focus:ring-[#D4AF37]"
                            />
                            <span className="text-gray-700">{item}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 10 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Budget approximatif :
                      </label>
                      <div className="mt-2 flex flex-col gap-3">
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
                              {...register('budget', { onChange: (e) => onChange({ budget: e.target.value }) })}
                              className="h-4 w-4 text-[#1E3A8A] border-gray-300 focus:ring-[#D4AF37]"
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
                      <div className="mt-2 flex flex-col gap-3">
                        {['En une fois', 'En plusieurs étapes'].map((opt) => (
                          <label key={opt} className="flex items-center gap-2">
                            <input
                              type="radio"
                              value={opt}
                              {...register('paiement', { onChange: (e) => onChange({ paiement: e.target.value }) })}
                              className="h-4 w-4 text-[#1E3A8A] border-gray-300 focus:ring-[#D4AF37]"
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
                      <div className="mt-2 flex flex-col gap-3">
                        {['Oui', 'Non'].map((opt) => (
                          <label key={opt} className="flex items-center gap-2">
                            <input
                              type="radio"
                              value={opt}
                              {...register('appelOffre', {
                                onChange: (e) => onChange({ appelOffre: e.target.value }),
                              })}
                              className="h-4 w-4 text-[#1E3A8A] border-gray-300 focus:ring-[#D4AF37]"
                            />
                            <span className="text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 11 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Souhaitez-vous un accompagnement pour :
                      </label>
                      <div className="mt-2 flex flex-col gap-3">
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
                              {...register('accompagnementCM', {
                                onChange: (e) => onChange({ accompagnementCM: e.target.value }),
                              })}
                              className="h-4 w-4 text-[#1E3A8A] border-gray-300 focus:ring-[#D4AF37]"
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
                      <div className="mt-2 flex flex-col gap-3">
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
                              {...register('plateformesCM', {
                               onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                                  const validValues = [
                                    "Facebook",
                                    "Instagram",
                                    "LinkedIn",
                                    "Twitter/X",
                                    "TikTok",
                                    "YouTube",
                                    "Pinterest",
                                  ] as const;
                                  type PlateformeValue = typeof validValues[number];
                                  const values = Array.from(
                                    e.target.form?.querySelectorAll<HTMLInputElement>(`input[name="plateformesCM"]:checked`) || []
                                  )
                                    .map((el) => el.value as PlateformeValue)
                                    .filter((value) => validValues.includes(value));
                                  onChange({ plateformesCM: values });
                                },
                              })}
                              className="h-4 w-4 text-[#1E3A8A] border-gray-300 rounded focus:ring-[#D4AF37]"
                            />
                            <span className="text-gray-700">{p}</span>
                          </label>
                        ))}
                        <label className="flex items-center gap-2">
                          <span className="text-gray-700">Autre </span>
                          <input
                            {...register('autrePlateformeCM', {
                              onChange: (e) => onChange({ autrePlateformeCM: e.target.value }),
                            })}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors"
                          />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Besoins en communication :
                      </label>
                      <div className="mt-2 flex flex-col gap-3">
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
                              {...register('besoinsComDigitale', {
                                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                                  const validValues = [
                                    "Création / optimisation profils",
                                    "Contenus visuels (images, vidéos)",
                                    "Planning éditorial",
                                    "Rédaction posts",
                                    "Campagnes sponsorisées",
                                    "Analyse performances",
                                    "Newsletter / email marketing",
                                  ] as const;
                                  type BesoinComValue = typeof validValues[number];
                                  const values = Array.from(
                                    e.target.form?.querySelectorAll<HTMLInputElement>(`input[name="besoinsComDigitale"]:checked`) || []
                                  )
                                    .map((el) => el.value as BesoinComValue)
                                    .filter((value) => validValues.includes(value));
                                  onChange({ besoinsComDigitale: values });
                                },
                              })}
                              className="h-4 w-4 text-[#1E3A8A] border-gray-300 rounded focus:ring-[#D4AF37]"
                            />
                            <span className="text-gray-700">{b}</span>
                          </label>
                        ))}
                        <label className="flex items-center gap-2">
                          <span className="text-gray-700">Autre </span>
                          <input
                            {...register('autreBesoinCom', {
                              onChange: (e) => onChange({ autreBesoinCom: e.target.value }),
                            })}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors"
                          />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Stratégie existante ?
                      </label>
                      <div className="mt-2 flex flex-col gap-3">
                        {['Oui', 'Non', 'En cours', 'Besoin de conseils'].map((opt) => (
                          <label key={opt} className="flex items-center gap-2">
                            <input
                              type="radio"
                              value={opt}
                              {...register('strategieExistante', {
                                onChange: (e) => onChange({ strategieExistante: e.target.value }),
                              })}
                              className="h-4 w-4 text-[#1E3A8A] border-gray-300 focus:ring-[#D4AF37]"
                            />
                            <span className="text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 12 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Importance du référencement Google :
                      </label>
                      <div className="mt-2 flex flex-col gap-3">
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
                              {...register('importanceReferencement', {
                                onChange: (e) => onChange({ importanceReferencement: e.target.value }),
                              })}
                              className="h-4 w-4 text-[#1E3A8A] border-gray-300 focus:ring-[#D4AF37]"
                            />
                            <span className="text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="inline-flex items-center space-x-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Accompagnement SEO souhaité :
                        </label>
                        <InfoTooltip content="Accompagnement dans l’optimisation de votre référencement naturel : mots-clés, balises, contenus, performances techniques…" />
                      </div>
                      <div className="mt-2 flex flex-col gap-3">
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
                              {...register('accompagnementSEO', {
                                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                                  const validValues = [
                                    "Optimisation SEO",
                                    "Contenus optimisés",
                                    "Suivi position Google",
                                    "Référencement local",
                                    "Publicité payante",
                                    "Analyse trafic",
                                    "Audit SEO",
                                  ] as const;
                                  type SEOValue = typeof validValues[number];
                                  const values = Array.from(
                                    e.target.form?.querySelectorAll<HTMLInputElement>(`input[name="accompagnementSEO"]:checked`) || []
                                  )
                                    .map((el) => el.value as SEOValue)
                                    .filter((value) => validValues.includes(value));
                                  onChange({ accompagnementSEO: values });
                                },
                              })}
                              className="h-4 w-4 text-[#1E3A8A] border-gray-300 rounded focus:ring-[#D4AF37]"
                            />
                            <span className="text-gray-700">{seo}</span>
                          </label>
                        ))}
                        <label className="flex items-center gap-2">
                          <span className="text-gray-700">Autre</span>
                          <input
                            {...register('autreAccompagnementSEO', {
                              onChange: (e) => onChange({ autreAccompagnementSEO: e.target.value }),
                            })}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {step === 13 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Souhaitez-vous gérer votre e-réputation ?
                      </label>
                      <div className="mt-2 flex flex-col gap-3">
                        {['Oui', 'Non', 'Ne sais pas'].map((opt) => (
                          <label key={opt} className="flex items-center gap-2">
                            <input
                              type="radio"
                              value={opt}
                              {...register('gestionEReputation', {
                                onChange: (e) => onChange({ gestionEReputation: e.target.value }),
                              })}
                              className="h-4 w-4 text-[#1E3A8A] border-gray-300 focus:ring-[#D4AF37]"
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
                      <div className="mt-2 flex flex-col gap-3">
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
                              {...register('actionsAvis', {
                              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                                const validValues = [
                                  "Collecte d’avis",
                                  "Affichage avis site",
                                  "Connexion plateformes avis (Google, Trustpilot)",
                                  "Modération avis",
                                  "Réponses automatisées",
                                  "Suivi avis négatifs",
                                  "Rien pour le moment",
                                ] as const;
                                type AvisValue = typeof validValues[number];
                                const values = Array.from(
                                  e.target.form?.querySelectorAll<HTMLInputElement>(`input[name="actionsAvis"]:checked`) || []
                                )
                                  .map((el) => el.value as AvisValue)
                                  .filter((value) => validValues.includes(value));
                                onChange({ actionsAvis: values });
                              },
                              })}
                              className="h-4 w-4 text-[#1E3A8A] border-gray-300 rounded focus:ring-[#D4AF37]"
                            />
                            <span className="text-gray-700">{a}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 14 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700" htmlFor="remarques">
                        Autres besoins ou remarques :
                      </label>
                      <textarea
                        {...register('remarques', { onChange: (e) => onChange({ remarques: e.target.value }) })}
                        id="remarques"
                        className="mt-1 w-full border border-gray-300 rounded-lg p-3 min-h-[150px] focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors"
                        placeholder="Ajoutez ici tout besoin spécifique ou commentaire"
                        aria-describedby="remarques-error"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-4 pt-8 justify-between">
              {step > 0 && (
                <motion.button
                  type="button"
                  onClick={onPrev}
                  className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Précédent
                </motion.button>
              )}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className={`px-5 py-2.5 rounded-lg text-white font-medium ${
                  isSubmitting
                    ? 'bg-[#1E3A8A]/50 cursor-not-allowed'
                    : step < 14
                    ? 'bg-[#1E3A8A] hover:bg-[#D4AF37] hover:text-[#1E3A8A]'
                    : 'bg-[#1E3A8A] hover:bg-[#D4AF37] hover:text-[#1E3A8A]'
                } focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] transition-colors`}
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="mt-6 p-4 bg-[#F5F5F5] border-l-4 border-[#D4AF37] rounded-lg text-center"
              >
                <p className="text-[#1E3A8A] font-medium">Formulaire soumis avec succès !</p>
                <p className="text-gray-600 text-sm mt-1">Le formulaire sera réinitialisé dans quelques secondes.</p>
              </motion.div>
            )}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-red-500 text-center mt-6"
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