// app/api/form/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Définir le schéma Zod pour la validation
const formSchema = z.object({
  nomProjet: z.string().optional(),
  contactNom: z.string().optional(),
  contactFonction: z.string().optional(),
  email: z.string().email().optional(),
  telephone: z.string().optional(),
  siteWeb: z.string().optional(),
  dateMiseEnLigne: z.string().optional(),
  evenementAssocie: z.string().optional(),

  objectifs: z.array(z.string()).optional(),
  publicCible: z.string().optional(),
  pages: z.array(z.string()).optional(),
  contenuDisponible: z.string().optional(),
  pagesAMettreJour: z.boolean().optional(),
  fonctionnalites: z.array(z.string()).optional(),

  venteEnLigne: z.boolean().optional(),
  typesProduitsServices: z.array(z.string()).optional(), // frontend = typesProduitsServices
  nombreProduits: z.string().optional(), // frontend = nombreProduits

  besoinsSpecifiques: z.array(z.string()).optional(),
  webMobile: z.array(z.string()).optional(),
  stylePrefere: z.array(z.string()).optional(),
  gestionSite: z.string().optional(), // frontend = gestionSite
  hebergement: z.string().optional(),
  connexionOutils: z.string().optional(),
  respectRGPD: z.string().optional(),
  sauvegardesAuto: z.string().optional(),
  besoinsMaintenance: z.array(z.string()).optional(),
  budget: z.string().optional(),
  paiement: z.string().optional(),
  appelOffre: z.string().optional(),
  accompagnementCM: z.string().optional(),
  plateformesCM: z.array(z.string()).optional(),
  besoinsComDigitale: z.array(z.string()).optional(),
  strategieExistante: z.string().optional(),
  importanceReferencement: z.string().optional(),
  accompagnementSEO: z.array(z.string()).optional(),
  gestionEReputation: z.string().optional(),
  actionsAvis: z.array(z.string()).optional(),
  remarques: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Body brut reçu du frontend:", body);

    // Valider les données reçues avec Zod (strings 'Oui', 'Non', 'Ne sais pas')
    const data = formSchema.parse(body);

    const prismaData = {
      nomProjet: data.nomProjet,
      contactNom: data.contactNom,
      contactFonction: data.contactFonction,
      email: data.email,
      telephone: data.telephone,
      siteWeb: data.siteWeb,
      dateMiseEnLigne: data.dateMiseEnLigne
        ? new Date(data.dateMiseEnLigne)
        : undefined,
      evenementAssocie: data.evenementAssocie,

      objectifs: data.objectifs?.filter((v): v is string => !!v),
      publicCible: data.publicCible,
      pages: data.pages?.filter((v): v is string => !!v),
      contenuDisponible: data.contenuDisponible,
      pagesAMettreJour: data.pagesAMettreJour,
      fonctionnalites: data.fonctionnalites?.filter((v): v is string => !!v),

      venteEnLigne: data.venteEnLigne,
      typesProduits: data.typesProduitsServices?.filter(
        (v): v is string => !!v
      ),
      nbProduits: data.nombreProduits,
      besoinsSpecifiques: data.besoinsSpecifiques?.filter(
        (v): v is string => !!v
      ),
      webMobile: data.webMobile?.filter((v): v is string => !!v),
      stylePrefere: data.stylePrefere?.filter((v): v is string => !!v),
      gestionPlateforme: data.gestionSite === "Oui",
      hebergement: data.hebergement,
      connexionOutils: data.connexionOutils,
      respectRGPD: data.respectRGPD,
      sauvegardesAuto: data.sauvegardesAuto,
      besoinsSupport: data.besoinsMaintenance?.filter((v): v is string => !!v),
      budget: data.budget,
      paiement: data.paiement,
      appelOffre: data.appelOffre,

      // wrap as array, filter out undefined
      communityManagement: [data.accompagnementCM].filter(
        (v): v is string => !!v
      ),
      plateformes: data.plateformesCM?.filter((v): v is string => !!v),
      besoinsComm: data.besoinsComDigitale?.filter((v): v is string => !!v),
      strategieExistante: data.strategieExistante,
      referencement: [data.importanceReferencement].filter(
        (v): v is string => !!v
      ),
      accompagnementSEO: data.accompagnementSEO?.filter(
        (v): v is string => !!v
      ),
      gestionEReputation: data.gestionEReputation,
      actionsAvis: data.actionsAvis?.filter((v): v is string => !!v),
      remarques: data.remarques,
    };

    console.log("Données reçues:", {
      ...data,
      remarques: data.remarques || "VIDE", // Pour bien voir si le champ est vide
    });
    // Créer l'entrée dans la base avec Prisma
    console.log("Données validées envoyées à Prisma:", data);

    const response = await prisma.formResponse.create({
      data: prismaData,
    });

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error("Erreur lors de l’envoi du formulaire:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    const allResponses = await prisma.formResponse.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { success: true, data: allResponses },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des données" },
      { status: 500 }
    );
  }
}
