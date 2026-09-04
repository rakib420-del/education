const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.contentItem.updateMany({
    where: {
      OR: [
        { titleBn: { contains: 'Cliffs' } },
        { titleEn: { contains: 'Cliffs' } },
        { slug: { contains: 'cliffs' } },
      ],
    },
    data: {
      type: 'BOOK',
    },
  });
  console.log('Update result:', result);

  const items = await prisma.contentItem.findMany({
    where: {
      OR: [
        { titleBn: { contains: 'Cliffs' } },
        { titleEn: { contains: 'Cliffs' } },
        { slug: { contains: 'cliffs' } },
      ],
    },
    select: { id: true, titleBn: true, type: true, slug: true },
  });
  console.log('Current Cliffs items in DB:', items);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
