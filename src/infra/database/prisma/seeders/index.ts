import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    {
      name: 'Natureza e Paisagens',
    },
    {
      name: 'Animais',
    },
    {
      name: 'Arquitetura',
    },
    {
      name: 'Retratos',
    },
    {
      name: 'Eventos',
    },
    {
      name: 'Comida e Bebida',
    },
    {
      name: 'Viagens',
    },
    {
      name: 'Arte e Criatividade',
    },
    {
      name: 'Esportes e Atividades ao Ar Livre',
    },
    {
      name: 'Cotidiano',
    },
    {
      name: 'Tecnologia',
    },
    {
      name: 'Moda',
    },
  ];

  for (const category of categories) {
    const alreadyExists = await prisma.category.findFirst({
      where: {
        name: category.name,
      },
    });

    if (!alreadyExists) {
      await prisma.category.create({
        data: {
          name: category.name,
        },
      });
    }
  }
}

main().then(async () => {
  await prisma.$disconnect();
});
