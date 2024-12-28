import { prisma } from "~/utils/db.server";
import artistsData from "~/data.json";

async function seed() {
  let genresMap = new Map();

  for (let artist of artistsData) {
    for (let genreTitle of artist.genres) {
      if (!genresMap.has(genreTitle)) {
        let genre = await prisma.genre.upsert({
          where: { title: genreTitle },
          update: {},
          create: { title: genreTitle },
        });
        genresMap.set(genreTitle, genre.id);
      }
    }
  }

  let artists = artistsData.map((item) => ({
    name: item.name,
    url: item.uri,
    genres: {
      connect: item.genres.map((genre) => ({ id: genresMap.get(genre) })),
    },
    images: {
      createMany: {
        data: item.images.map((image) => ({
          url: image.url,
          height: image.height,
          width: image.width,
        })),
      },
    },
  }));

  let results = await Promise.all(
    artists.map((artist) =>
      prisma.artist.create({
        data: artist,
        include: { genres: true, images: true },
      })
    )
  );

  return results;
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
