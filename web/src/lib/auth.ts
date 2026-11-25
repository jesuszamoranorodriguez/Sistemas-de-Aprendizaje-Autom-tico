import "server-only";

import { cache } from "react";
import { io } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type Perfil = Tables<"profiles">;

/**
 * Devuelve el usuario y su perfil. Si el trigger de alta no llegó a crear la
 * fila, la crea aquí para que la cuenta nunca se quede sin perfil.
 */
export const obtenerSesion = cache(async () => {
  // Fuera de la cáscara estática: la sesión solo existe cuando hay petición.
  await io();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: perfilExistente } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  let perfil = perfilExistente;

  if (!perfil) {
    const { data: perfilCreado } = await supabase
      .from("profiles")
      .insert({ id: user.id, email_contacto: user.email ?? null })
      .select("*")
      .single();

    perfil = perfilCreado;
  }

  return { user, perfil };
});

export async function requerirSesion() {
  const sesion = await obtenerSesion();

  if (!sesion) {
    redirect("/entrar");
  }

  return sesion;
}

const CAMPOS_OBLIGATORIOS = [
  "nombre_comercial",
  "nombre_fiscal",
  "nif",
  "direccion",
  "cp",
  "ciudad",
  "provincia",
] as const;

export function perfilCompleto(perfil: Perfil | null): boolean {
  if (!perfil) {
    return false;
  }

  return CAMPOS_OBLIGATORIOS.every(
    (campo) => (perfil[campo] ?? "").trim().length > 0,
  );
}
