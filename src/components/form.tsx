"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { sendMail } from "@/lib/email";
import { zodResolver } from "@hookform/resolvers/zod";
import { render } from "@react-email/render";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import ConfirmationEmail from "../emails/confirmEmail";

const step1Schema = z.object({
  nomProjet: z.string().min(1, "Le nom du projet est requis"),
  entreprise: z.string().min(1, "Le nom de l'entreprise est requis"),
  secteurActivite: z.string().min(1, "Le secteur d'activité est requis"),
  contactNom: z.string().min(1, "Le nom du contact est requis"),
  contactFonction: z.string().min(1, "La fonction est requise"),
  email: z.email("Email invalide").min(1, "L'email est requis"),
  telephone: z.string().min(1, "Le téléphone est requis"),
  dateLancement: z.string().min(1, "La date de lancement est requise"),
  descriptionProjet: z.string().min(1, "La description du projet est requise"),
  problemeResoudre: z.string().min(1, "La description du problème est requise"),
  utilisateursCibles: z.string().min(1, "Les utilisateurs cibles sont requis"),
  nombreUtilisateurs: z.string().nonempty(),
});

const step2Schema = z.object({
  fonctionnalitesPrincipales: z
    .array(z.string())
    .min(1, "Sélectionnez au moins une fonctionnalité"),
  fonctionnalitePrincipaleAutre: z.string().optional(),
  typeApplication: z
    .array(z.enum(["Web", "iOS", "Android", "Desktop", "Multi-plateforme"]))
    .min(1, "Sélectionnez au moins un type d'application"),
  styleVisuel: z
    .array(
      z.enum([
        "Moderne",
        "Professionnel",
        "Ludique",
        "Minimaliste",
        "Coloré",
        "Sobre",
      ])
    )
    .min(1, "Sélectionnez au moins un style visuel"),
  styleAutre: z.string().optional(),
  budget: z.string().nonempty(),
  delaiRealisation: z.string().min(1, "Le délai de réalisation est requis"),
  commentaires: z.string().min(1, "Les commentaires sont requis"),
});

export const fullSchema = step1Schema.merge(step2Schema);
type FormValues = z.infer<typeof fullSchema>;

const fonctionnalitesOptions = [
  "Authentification utilisateurs",
  "Tableau de bord",
  "Gestion des données",
  "Recherche avancée",
  "Rapports et analytics",
  "Notifications",
  "Paiements en ligne",
  "Chat en temps réel",
  "Upload de fichiers",
  "Gestion des profils",
  "Réservation/rendez-vous",
  "Catalogue produits",
];

const typeApplicationOptions = [
  "Web",
  "iOS",
  "Android",
  "Desktop",
  "Multi-plateforme",
] as const;

const styleVisuelOptions = [
  "Moderne",
  "Professionnel",
  "Ludique",
  "Minimaliste",
  "Coloré",
  "Sobre",
] as const;

const budgetOptions = [
  "< 10 000 XOF",
  "10 000 - 50 000 XOF",
  "50 000 - 100 000 XOF",
  "> 100 000 XOF",
  "Indécis",
];

const delaiOptions = [
  "Urgent (1-3 mois)",
  "Standard (3-6 mois)",
  "Long terme (6+ mois)",
  "Flexible",
];

const nombreUtilisateursOptions = [
  "< 100",
  "100 - 1 000",
  "1 000 - 10 000",
  "> 10 000",
  "Indécis",
];

export default function FormulaireEtapes() {
  const [step, setStep] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      fonctionnalitesPrincipales: [],
      typeApplication: [],
      styleVisuel: [],
      budget: "",
      commentaires: "",
      contactFonction: "",
      contactNom: "",
      dateLancement: "",
      delaiRealisation: "",
      descriptionProjet: "",
      email: "",
      entreprise: "",
      fonctionnalitePrincipaleAutre: "",
      nombreUtilisateurs: "",
      nomProjet: "",
      problemeResoudre: "",
      secteurActivite: "",
      styleAutre: "",
      telephone: "",
      utilisateursCibles: "",
    },
    mode: "onSubmit",
  });

  const {
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = form;

  const stepTitles = ["Informations du Projet", "Besoins & Spécifications"];
  const stepDescriptions = [
    "Décrivez votre projet, votre entreprise et vos objectifs principaux",
    "Précisez vos besoins fonctionnels, techniques et contraintes",
  ];

  const getFieldsForStep = (currentStep: number): (keyof FormValues)[] => {
    const stepFieldsMap: Record<number, (keyof FormValues)[]> = {
      0: [
        "nomProjet",
        "entreprise",
        "contactNom",
        "email",
        "telephone",
        "secteurActivite",
        "dateLancement",
        "descriptionProjet",
        "problemeResoudre",
        "utilisateursCibles",
        "nombreUtilisateurs",
      ],
      1: [
        "fonctionnalitesPrincipales",
        "typeApplication",
        "styleVisuel",
        "budget",
        "delaiRealisation",
        "commentaires",
      ],
    };
    return stepFieldsMap[currentStep] || [];
  };

  const onNext = async () => {
    const fields = getFieldsForStep(step);
    const isValid = await trigger(fields, { shouldFocus: true });
    if (isValid) setStep(step + 1);
  };

  const onPrev = () => setStep(step - 1);

  const onSubmit = async (data: FormValues) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Merge "other" values into arrays
      const finalData = {
        ...data,
        fonctionnalitesPrincipales: [
          ...(data.fonctionnalitesPrincipales || []),
          ...(data.fonctionnalitePrincipaleAutre
            ? [data.fonctionnalitePrincipaleAutre]
            : []),
        ],
        styleVisuel: [
          ...(data.styleVisuel || []),
          ...(data.styleAutre ? [data.styleAutre] : []),
        ],
      };

      const res = await fetch("/api/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de l'envoi");
      }

      // Send confirmation email
      const message = await render(
        ConfirmationEmail({ userName: `${data.contactNom || "Utilisateur"}` })
      );
      await sendMail({
        html: message,
        subject: "Confirmation de votre projet",
        to: `${data.contactNom || "Utilisateur"} <${data.email}>`,
      });

      setSuccess(true);
      setTimeout(() => {
        form.reset();
        setStep(0);
        setSuccess(false);
        setIsSubmitting(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4 sm:p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-3xl"
      >
        <Card className="p-8 sm:p-10">
          {/* Barre de progression */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <h1 className="text-3xl font-bold text-[#1E3A8A] tracking-tight">
                {stepTitles[step]}
              </h1>
              <span className="text-sm text-gray-500 font-medium">
                Étape {step + 1} / {stepTitles.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <motion.div
                className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] h-2.5 rounded-full"
                initial={{ width: "0%" }}
                animate={{
                  width: `${((step + 1) / stepTitles.length) * 100}%`,
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Description de l'étape */}
          <p className="text-gray-600 mb-8 text-sm">{stepDescriptions[step]}</p>

          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {step === 0 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="nomProjet"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom du projet *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Nom de votre projet"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="entreprise"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Entreprise</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Nom de votre entreprise"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="contactNom"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom du contact *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Votre nom complet"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="contactFonction"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fonction</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Votre fonction"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email *</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="votre@email.com"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="telephone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Téléphone</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Votre numéro de téléphone"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="secteurActivite"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Secteur d'activité</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Secteur d'activité"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="dateLancement"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date de lancement souhaitée</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="descriptionProjet"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description du projet *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Décrivez brièvement votre projet d'application..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="problemeResoudre"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Problème à résoudre</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Quel problème ou besoin votre application doit-elle résoudre ?"
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="utilisateursCibles"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Utilisateurs cibles</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ex: Employés, clients B2B, grand public..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="nombreUtilisateurs"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Nombre d'utilisateurs prévus
                              </FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-2"
                                >
                                  {nombreUtilisateursOptions.map((option) => (
                                    <FormItem
                                      key={option}
                                      className="flex items-center space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <RadioGroupItem value={option} />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        {option}
                                      </FormLabel>
                                    </FormItem>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {step === 1 && (
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="fonctionnalitesPrincipales"
                        render={() => (
                          <FormItem>
                            <FormLabel>
                              Fonctionnalités principales souhaitées *
                            </FormLabel>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {fonctionnalitesOptions.map((item) => (
                                <FormField
                                  key={item}
                                  control={form.control}
                                  name="fonctionnalitesPrincipales"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={item}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(
                                              item
                                            )}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([
                                                    ...field.value,
                                                    item,
                                                  ])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== item
                                                    )
                                                  );
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal cursor-pointer">
                                          {item}
                                        </FormLabel>
                                      </FormItem>
                                    );
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fonctionnalitePrincipaleAutre"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Autre fonctionnalité</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Autre fonctionnalité..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="typeApplication"
                        render={() => (
                          <FormItem>
                            <FormLabel>Type d'application *</FormLabel>
                            <div className="flex flex-col gap-3">
                              {typeApplicationOptions.map((item) => (
                                <FormField
                                  key={item}
                                  control={form.control}
                                  name="typeApplication"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={item}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(
                                              item
                                            )}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([
                                                    ...field.value,
                                                    item,
                                                  ])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== item
                                                    )
                                                  );
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal cursor-pointer">
                                          {item}
                                        </FormLabel>
                                      </FormItem>
                                    );
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="styleVisuel"
                        render={() => (
                          <FormItem>
                            <FormLabel>Style visuel préféré</FormLabel>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {styleVisuelOptions.map((item) => (
                                <FormField
                                  key={item}
                                  control={form.control}
                                  name="styleVisuel"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={item}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(
                                              item
                                            )}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([
                                                    ...field.value,
                                                    item,
                                                  ])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== item
                                                    )
                                                  );
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal cursor-pointer">
                                          {item}
                                        </FormLabel>
                                      </FormItem>
                                    );
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="styleAutre"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Autre style</FormLabel>
                            <FormControl>
                              <Input placeholder="Autre style..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="budget"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Budget estimé *</FormLabel>
                              <FormControl>
                                <div className="space-y-3">
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-2"
                                  >
                                    {budgetOptions.map((option) => (
                                      <FormItem
                                        key={option}
                                        className="flex items-center space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <RadioGroupItem value={option} />
                                        </FormControl>
                                        <FormLabel className="font-normal cursor-pointer">
                                          {option}
                                        </FormLabel>
                                      </FormItem>
                                    ))}
                                  </RadioGroup>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="delaiRealisation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Délai de réalisation *</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-2"
                                >
                                  {delaiOptions.map((option) => (
                                    <FormItem
                                      key={option}
                                      className="flex items-center space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <RadioGroupItem value={option} />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        {option}
                                      </FormLabel>
                                    </FormItem>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="commentaires"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Commentaires ou exigences particulières
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Ajoutez ici toute information complémentaire, contrainte technique, ou exigence particulière..."
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation buttons */}
              <div className="flex gap-4 pt-8 justify-between">
                {step > 0 && (
                  <Button
                    type="button"
                    onClick={onPrev}
                    variant="outline"
                    className="px-5 py-2.5"
                  >
                    Précédent
                  </Button>
                )}

                <div className="ml-auto">
                  {step < 1 ? (
                    <Button
                      type="button"
                      onClick={onNext}
                      className="px-5 py-2.5"
                    >
                      Suivant
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5"
                    >
                      {isSubmitting ? "Envoi..." : "Soumettre le projet"}
                    </Button>
                  )}
                </div>
              </div>

              {success && (
                <p className="text-green-600 mt-4 text-center">
                  Projet soumis avec succès ! Redirection...
                </p>
              )}
              {error && (
                <p className="text-red-500 mt-4 text-center">{error}</p>
              )}
            </form>
          </Form>
        </Card>
      </motion.div>
    </div>
  );
}
