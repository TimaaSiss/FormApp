import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function seed() {
  const email = "admin@cirtic.com";
  const password = await bcrypt.hash("ADMINfm@2025mli", 10);

  await prisma.user.upsert({
    where: { email },
    update: { role: "admin" },
    create: {
      email,
      password,
      name: "Admin User",
      role: "admin",
    },
  });

  console.log("Utilisateur admin créé ou mis à jour");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
