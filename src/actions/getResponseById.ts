"use server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { FormResponse } from "@/app/components/responseDetails";
import { asStringArray } from "@/lib";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function getResponseById(
  id: string
): Promise<{ response: FormResponse | null }> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "admin") {
    throw new Error("Accès non autorisé");
  }

  try {
    const res = await prisma.formResponse.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        nomProjet: true,
        contactNom: true,
        contactFonction: true,
        email: true,
        telephone: true,
        siteWeb: true,
        dateMiseEnLigne: true,
        evenementAssocie: true,
        objectifs: true,
        publicCible: true,
        pages: true,
        contenuDisponible: true,
        pagesAMettreJour: true,
        fonctionnalites: true,
        typesProduits: true,
        nbProduits: true,
        besoinsSpecifiques: true,
        webMobile: true,
        stylePrefere: true,
        gestionPlateforme: true,
        hebergement: true,
        connexionOutils: true,
        respectRGPD: true,
        sauvegardesAuto: true,
        besoinsSupport: true,
        budget: true,
        paiement: true,
        appelOffre: true,
        communityManagement: true,
        plateformes: true,
        besoinsComm: true,
        strategieExistante: true,
        referencement: true,
        accompagnementSEO: true,
        gestionEReputation: true,
        actionsAvis: true,
        remarques: true,
        createdAt: true,
      },
    });

    if (!res) {
      return { response: null };
    }

    return {
      response: {
        ...res,
        objectifs: asStringArray(res.objectifs),
        pages: asStringArray(res.pages),
        fonctionnalites: asStringArray(res.fonctionnalites),
        typesProduits: asStringArray(res.typesProduits),
        besoinsSpecifiques: asStringArray(res.besoinsSpecifiques),
        webMobile: asStringArray(res.webMobile),
        stylePrefere: asStringArray(res.stylePrefere),
        besoinsSupport: asStringArray(res.besoinsSupport),
        communityManagement: asStringArray(res.communityManagement),
        plateformes: asStringArray(res.plateformes),
        besoinsComm: asStringArray(res.besoinsComm),
        referencement: asStringArray(res.referencement),
        accompagnementSEO: asStringArray(res.accompagnementSEO),
        actionsAvis: asStringArray(res.actionsAvis),
        dateMiseEnLigne: res.dateMiseEnLigne?.toString() ?? null,
        createdAt: res.createdAt.toString(),
      },
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de la réponse:", error);
    throw new Error("Erreur serveur");
  }
}
