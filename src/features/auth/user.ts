import { prisma } from "@/lib/prisma";
import { getSession } from "@/features/auth/session";

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      username: true,
      name: true,
      classLevel: true,
      avatar: true,
      xp: true,
      level: true,
    },
  });
}
