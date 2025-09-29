"use server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { asStringArray } from "@/lib";
import { prisma } from "@/lib/prisma";
import { FormResponse } from "@prisma/client";
import { getServerSession } from "next-auth";

export async function getResponses() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "admin") {
    throw new Error("Accès non autorisé");
  }

  try {
    const responses = await prisma.formResponse.findMany({
      orderBy: { createdAt: "desc" },
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

    const totalResponses = responses.length;
    const responsesByProject = responses.reduce(
      (acc: Record<string, number>, res: FormResponse) => {
        const project = res.nomProjet || "Sans nom";
        acc[project] = (acc[project] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      responses: responses.map((res) => ({
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
        createdAt: res.createdAt.toString(),
      })),
      stats: {
        totalResponses,
        responsesByProject,
      },
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des réponses:", error);
    throw new Error("Erreur serveur");
  }
}
