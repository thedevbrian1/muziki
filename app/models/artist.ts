import { prisma } from "~/utils/db.server";
import artistsData from "~/data.json";

export async function getArtists() {
  return prisma.artist.findMany({ include: { genres: true, images: true } });
}

export async function createArtists() {
  let artists = artistsData.map((item) => ({
    name: item.name,
    url: item.uri,
    genres: {
      createMany: {
        data: item.genres.map((genre) => ({
          title: genre,
        })),
      },
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

  let [result] = await Promise.all(
    artists.map((item) => {
      return prisma.artist.create({
        data: item,
        include: { genres: true, images: true },
      });
    })
  );

  return result;
}
