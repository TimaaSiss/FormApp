// app/api/form/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Filtrer uniquement les champs du nouveau schéma
    const formData = {
      nomProjet: body.nomProjet,
      entreprise: body.entreprise,
      secteurActivite: body.secteurActivite,
      contactNom: body.contactNom,
      contactFonction: body.contactFonction,
      email: body.email,
      telephone: body.telephone,
      dateLancement: body.dateLancement ? new Date(body.dateLancement) : null,
      descriptionProjet: body.descriptionProjet,
      problemeResoudre: body.problemeResoudre,
      utilisateursCibles: body.utilisateursCibles,
      nombreUtilisateurs: body.nombreUtilisateurs,
      fonctionnalitesPrincipales: body.fonctionnalitesPrincipales || [],
      fonctionnalitePrincipaleAutre: body.fonctionnalitePrincipaleAutre,
      typeApplication: body.typeApplication || [],
      styleVisuel: body.styleVisuel || [],
      styleAutre: body.styleAutre,
      budget: body.budget,
      delaiRealisation: body.delaiRealisation,
      commentaires: body.commentaires,
    };

    console.log("Données reçues pour création:", formData);

    const response = await prisma.formResponse.create({
      data: formData,
    });

    return NextResponse.json(
      { message: "Formulaire soumis avec succès", id: response.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de la création de la réponse:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement des données" },
      { status: 500 }
    );
  }
}
