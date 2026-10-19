import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";

export type GateSession = { unlocked?: boolean };

function sessionConfig() {
  // La clave de la sesión vive solo en la variable de entorno SESSION_SECRET (mínimo 32 caracteres).
  const secret = process.env["SESSION_SECRET"];
  if (!secret || secret.length < 32) {
    throw new Error("Falta SESSION_SECRET (variable de entorno de al menos 32 caracteres)");
  }
  return {
    password: secret,
    name: "ale-admin",
    maxAge: 60 * 60 * 12,
    cookie: {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

export function getGateSession() {
  return useSession<GateSession>(sessionConfig());
}

export function passwordMatches(input: string, expected: string): boolean {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

export async function requireUnlocked() {
  const session = await getGateSession();
  if (!session.data.unlocked) throw new Error("NO_AUTORIZADO");
  return session;
}
