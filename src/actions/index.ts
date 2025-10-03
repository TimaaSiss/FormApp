"use server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FormResponse } from "@prisma/client";
import { getServerSession } from "next-auth";

/**
 * Utility to ensure a JSON/Array field is always returned as string[]
 */
function asStringArray(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  try {
    return JSON.parse(value) as string[];
  } catch {
    return [String(value)];
  }
}

export async function getResponses() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "admin") {
    throw new Error("Accès non autorisé");
  }

  try {
    const responses = await prisma.formResponse.findMany({
      orderBy: { createdAt: "desc" },
    });

    const totalResponses = responses.length;

    // Calcul des statistiques
    const stats = {
      totalResponses,
      // Répartition par projet
      responsesByProject: responses.reduce((acc, res) => {
        const project = res.nomProjet || "Sans nom";
        acc[project] = (acc[project] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),

      // Répartition par budget
      statsByBudget: responses.reduce((acc, res) => {
        const budget = res.budget || "Non spécifié";
        acc[budget] = (acc[budget] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),

      // Répartition par délai
      statsByDelai: responses.reduce((acc, res) => {
        const delai = res.delaiRealisation || "Non spécifié";
        acc[delai] = (acc[delai] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),

      // Répartition par nombre d'utilisateurs
      statsByUsers: responses.reduce((acc, res) => {
        const users = res.nombreUtilisateurs || "Non spécifié";
        acc[users] = (acc[users] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),

      // Types d'application
      webApps: responses.filter((r) =>
        asStringArray(r.typeApplication).includes("Web")
      ).length,
      iosApps: responses.filter((r) =>
        asStringArray(r.typeApplication).includes("iOS")
      ).length,
      androidApps: responses.filter((r) =>
        asStringArray(r.typeApplication).includes("Android")
      ).length,
      desktopApps: responses.filter((r) =>
        asStringArray(r.typeApplication).includes("Desktop")
      ).length,
      multiPlatformApps: responses.filter((r) =>
        asStringArray(r.typeApplication).includes("Multi-plateforme")
      ).length,

      // Métriques d'engagement
      avecCommentaires: responses.filter(
        (r) => r.commentaires && r.commentaires.length > 0
      ).length,
      avecFonctionnalitesCustom: responses.filter(
        (r) =>
          r.fonctionnalitePrincipaleAutre &&
          r.fonctionnalitePrincipaleAutre.length > 0
      ).length,
      avecStyleCustom: responses.filter(
        (r) => r.styleAutre && r.styleAutre.length > 0
      ).length,

      // Secteurs d'activité
      secteursActivite: responses.reduce((acc, res) => {
        const secteur = res.secteurActivite || "Non spécifié";
        acc[secteur] = (acc[secteur] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),

      // Soumissions récentes (7 derniers jours)
      recentes: responses.filter((r) => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return r.createdAt >= sevenDaysAgo;
      }).length,
    };

    // Transformation des réponses pour le frontend
    const formattedResponses = responses.map((res) => ({
      id: res.id,
      nomProjet: res.nomProjet,
      entreprise: res.entreprise,
      secteurActivite: res.secteurActivite,
      contactNom: res.contactNom,
      contactFonction: res.contactFonction,
      email: res.email,
      telephone: res.telephone,
      dateLancement: res.dateLancement?.toISOString() ?? null,
      descriptionProjet: res.descriptionProjet,
      problemeResoudre: res.problemeResoudre,
      utilisateursCibles: res.utilisateursCibles,
      nombreUtilisateurs: res.nombreUtilisateurs,
      fonctionnalitesPrincipales: asStringArray(res.fonctionnalitesPrincipales),
      fonctionnalitePrincipaleAutre: res.fonctionnalitePrincipaleAutre,
      typeApplication: asStringArray(res.typeApplication),
      styleVisuel: asStringArray(res.styleVisuel),
      styleAutre: res.styleAutre,
      budget: res.budget,
      delaiRealisation: res.delaiRealisation,
      commentaires: res.commentaires,
      createdAt: res.createdAt.toISOString(),
    }));

    return {
      responses: formattedResponses,
      stats,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des réponses:", error);
    throw new Error("Erreur serveur");
  }
}

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
    });

    if (!res) {
      return { response: null };
    }

    return {
      response: {
        id: res.id,
        nomProjet: res.nomProjet,
        entreprise: res.entreprise,
        secteurActivite: res.secteurActivite,
        contactNom: res.contactNom,
        contactFonction: res.contactFonction,
        email: res.email,
        telephone: res.telephone,
        dateLancement: res.dateLancement,
        descriptionProjet: res.descriptionProjet,
        problemeResoudre: res.problemeResoudre,
        utilisateursCibles: res.utilisateursCibles,
        nombreUtilisateurs: res.nombreUtilisateurs,
        fonctionnalitesPrincipales: asStringArray(
          res.fonctionnalitesPrincipales
        ),
        fonctionnalitePrincipaleAutre: res.fonctionnalitePrincipaleAutre,
        typeApplication: asStringArray(res.typeApplication),
        styleVisuel: asStringArray(res.styleVisuel),
        styleAutre: res.styleAutre,
        budget: res.budget,
        delaiRealisation: res.delaiRealisation,
        commentaires: res.commentaires,
        createdAt: res.createdAt,
      },
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de la réponse:", error);
    throw new Error("Erreur serveur");
  }
}
