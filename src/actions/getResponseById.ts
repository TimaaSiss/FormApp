'use server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

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

export async function getResponseById(id: string): Promise<{ response: FormResponse | null }> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'admin') {
    throw new Error('Accès non autorisé');
  }

  try {
    const response = await prisma.formResponse.findUnique({
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

    if (!response) {
      return { response: null };
    }

    return {
      response: {
        ...response,
        dateMiseEnLigne: response.dateMiseEnLigne
          ? response.dateMiseEnLigne.toISOString()
          : null,
        createdAt: response.createdAt.toISOString(),
      },
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de la réponse:', error);
    throw new Error('Erreur serveur');
  }
}