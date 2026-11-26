"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { erroresDe, texto, valoresDe } from "@/lib/formularios";
import { createClient } from "@/lib/supabase/server";
import { esquemaCliente } from "@/lib/validacion/esquemas";

export type EstadoCliente = {
  ok?: boolean;
  error?: string;
  campos?: Record<string, string>;
  valores?: Record<string, string>;
};

const CAMPOS_CLIENTE = [
  "nombre",
  "nif",
  "email",
  "telefono",
  "direccion",
  "cp",
  "ciudad",
] as const;

export async function guardarCliente(
  _estado: EstadoCliente,
  formData: FormData,
): Promise<EstadoCliente> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const id = texto(formData, "id");

  const resultado = esquemaCliente.safeParse({
    nombre: texto(formData, "nombre"),
    nif: texto(formData, "nif"),
    email: texto(formData, "email"),
    telefono: texto(formData, "telefono"),
    direccion: texto(formData, "direccion"),
    cp: texto(formData, "cp"),
    ciudad: texto(formData, "ciudad"),
  });

  const valores = valoresDe(formData, CAMPOS_CLIENTE);

  if (!resultado.success) {
    return {
      error: "Revisa los campos marcados.",
      campos: erroresDe(resultado.error.issues),
      valores,
    };
  }

  const datos = resultado.data;
  const fila = {
    nombre: datos.nombre,
    nif: datos.nif ? datos.nif.toUpperCase() : null,
    email: datos.email || null,
    telefono: datos.telefono || null,
    direccion: datos.direccion || null,
    cp: datos.cp || null,
    ciudad: datos.ciudad || null,
  };

  if (id) {
    const { data, error } = await supabase
      .from("clientes")
      .update(fila)
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      if (error.code === "23505") {
        return {
          error: "Ya tienes un cliente con ese NIF.",
          campos: { nif: "Ese NIF ya está en uso." },
          valores,
        };
      }

      return {
        error: "No hemos podido guardar el cliente. Inténtalo de nuevo.",
        valores,
      };
    }

    if (!data) {
      return { error: "Ese cliente ya no existe.", valores };
    }
  } else {
    const { error } = await supabase
      .from("clientes")
      .insert({ ...fila, propietario_id: user.id });

    if (error) {
      if (error.code === "23505") {
        return {
          error: "Ya tienes un cliente con ese NIF.",
          campos: { nif: "Ese NIF ya está en uso." },
          valores,
        };
      }

      return {
        error: "No hemos podido guardar el cliente. Inténtalo de nuevo.",
        valores,
      };
    }
  }

  revalidatePath("/panel");
  revalidatePath("/panel/clientes");
  revalidatePath("/panel/presupuestos");

  return { ok: true };
}
