import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

interface FormResponse {
  id: number;
  nomProjet: string | null;
  email: string | null;
  objectifs: string[];
  createdAt: Date;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
  }

  try {
    // Récupérer toutes les réponses
    const responses: FormResponse[] = await prisma.formResponse.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nomProjet: true,
        email: true,
        objectifs: true,
        createdAt: true,
      },
    });

    // Calculer les statistiques
    const totalResponses = responses.length;
    const responsesByProject = responses.reduce((acc: Record<string, number>, res: FormResponse) => {
      const project = res.nomProjet || 'Sans nom';
      acc[project] = (acc[project] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      responses: responses.map((res) => ({
        ...res,
        createdAt: res.createdAt.toISOString(), // Convertir Date en string ISO
      })),
      stats: {
        totalResponses,
        responsesByProject,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des réponses:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  }
}