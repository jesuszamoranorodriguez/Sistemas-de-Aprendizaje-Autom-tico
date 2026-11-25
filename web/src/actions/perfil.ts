"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { esquemaPerfil } from "@/lib/validacion/esquemas";

export type EstadoPerfil = {
  error?: string;
  campos?: Record<string, string>;
  valores?: Record<string, string>;
};

// Se devuelven tal cual para no borrar lo que el profesional ya había escrito
// cuando algún campo no pasa la validación.
const CAMPOS_FORMULARIO = [
  "nombre_comercial",
  "nombre_fiscal",
  "nif",
  "telefono",
  "direccion",
  "cp",
  "ciudad",
  "provincia",
  "email_contacto",
  "iban",
  "iva_defecto",
  "serie_factura_defecto",
] as const;

function texto(formData: FormData, clave: string): string {
  const valor = formData.get(clave);
  return typeof valor === "string" ? valor : "";
}

export async function guardarPerfil(
  _estado: EstadoPerfil,
  formData: FormData,
): Promise<EstadoPerfil> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const resultado = esquemaPerfil.safeParse({
    nombre_comercial: texto(formData, "nombre_comercial"),
    nombre_fiscal: texto(formData, "nombre_fiscal"),
    nif: texto(formData, "nif"),
    direccion: texto(formData, "direccion"),
    cp: texto(formData, "cp"),
    ciudad: texto(formData, "ciudad"),
    provincia: texto(formData, "provincia"),
    telefono: texto(formData, "telefono"),
    email_contacto: texto(formData, "email_contacto"),
    iban: texto(formData, "iban"),
    iva_defecto: texto(formData, "iva_defecto"),
    serie_factura_defecto: texto(formData, "serie_factura_defecto"),
  });

  const valores = Object.fromEntries(
    CAMPOS_FORMULARIO.map((campo) => [campo, texto(formData, campo)]),
  );

  if (!resultado.success) {
    const campos: Record<string, string> = {};

    for (const problema of resultado.error.issues) {
      const campo = String(problema.path[0] ?? "general");
      campos[campo] ??= problema.message;
    }

    return { error: "Revisa los campos marcados.", campos, valores };
  }

  const datos = resultado.data;

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      nombre_comercial: datos.nombre_comercial,
      nombre_fiscal: datos.nombre_fiscal,
      nif: datos.nif,
      direccion: datos.direccion,
      cp: datos.cp,
      ciudad: datos.ciudad,
      provincia: datos.provincia,
      telefono: datos.telefono || null,
      email_contacto: datos.email_contacto || null,
      iban: datos.iban || null,
      iva_defecto: datos.iva_defecto,
      serie_factura_defecto: datos.serie_factura_defecto,
    },
    { onConflict: "id" },
  );

  if (error) {
    return {
      error:
        "No hemos podido guardar los datos. Inténtalo de nuevo en unos segundos.",
      valores,
    };
  }

  revalidatePath("/panel");
  revalidatePath("/onboarding");
  redirect("/panel?datos=guardados");
}
