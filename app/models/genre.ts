import { prisma } from "~/utils/db.server";

export async function getGenres() {
  return prisma.genre.findMany();
}
