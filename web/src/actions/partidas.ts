"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { erroresDe, esUuid, numero, texto, valoresDe } from "@/lib/formularios";
import { esEditable } from "@/lib/presupuestos";
import { createClient } from "@/lib/supabase/server";
import { esquemaPartida } from "@/lib/validacion/esquemas";

export type EstadoPartida = {
  error?: string;
  campos?: Record<string, string>;
  valores?: Record<string, string>;
};

const CAMPOS_PARTIDA = [
  "tipo",
  "descripcion",
  "cantidad",
  "unidad",
  "precio_unitario",
] as const;

async function presupuestoEditable(presupuestoId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const { data: presupuesto } = await supabase
    .from("presupuestos")
    .select("id, estado")
    .eq("id", presupuestoId)
    .maybeSingle();

  return { supabase, presupuesto };
}

function revalidar(presupuestoId: string) {
  revalidatePath("/panel");
  revalidatePath("/panel/presupuestos");
  revalidatePath(`/panel/presupuestos/${presupuestoId}`);
}

export async function guardarPartida(
  _estado: EstadoPartida,
  formData: FormData,
): Promise<EstadoPartida> {
  const presupuestoId = texto(formData, "presupuesto_id");

  if (!esUuid(presupuestoId)) {
    return { error: "Ese presupuesto ya no existe." };
  }

  const { supabase, presupuesto } = await presupuestoEditable(presupuestoId);

  if (!presupuesto) {
    return { error: "Ese presupuesto ya no existe." };
  }

  if (!esEditable(presupuesto.estado)) {
    return { error: "Este presupuesto ya no se puede modificar." };
  }

  const id = texto(formData, "id");

  if (id && !esUuid(id)) {
    return { error: "Esa partida ya no existe." };
  }

  const resultado = esquemaPartida.safeParse({
    tipo: texto(formData, "tipo"),
    descripcion: texto(formData, "descripcion"),
    cantidad: numero(formData, "cantidad"),
    unidad: texto(formData, "unidad"),
    precio_unitario: numero(formData, "precio_unitario"),
  });

  const valores = valoresDe(formData, CAMPOS_PARTIDA);

  if (!resultado.success) {
    return {
      error: "Revisa los campos marcados.",
      campos: erroresDe(resultado.error.issues),
      valores,
    };
  }

  const datos = resultado.data;

  if (id) {
    const { data, error } = await supabase
      .from("partidas")
      .update({ ...datos, precio_confirmado: true })
      .eq("id", id)
      .eq("presupuesto_id", presupuestoId)
      .select("id")
      .maybeSingle();

    if (error) {
      if (error.code === "23514") {
        return {
          error: "Este presupuesto ya no se puede modificar.",
          valores,
        };
      }

      return {
        error: "No hemos podido guardar la partida. Inténtalo de nuevo.",
        valores,
      };
    }

    if (!data) {
      return { error: "Esa partida ya no existe.", valores };
    }
  } else {
    const { data: ultima } = await supabase
      .from("partidas")
      .select("orden")
      .eq("presupuesto_id", presupuestoId)
      .order("orden", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { error } = await supabase.from("partidas").insert({
      presupuesto_id: presupuestoId,
      orden: (ultima?.orden ?? 0) + 1,
      ...datos,
      origen: "manual",
      precio_confirmado: true,
    });

    if (error) {
      if (error.code === "23514") {
        return {
          error: "Este presupuesto ya no se puede modificar.",
          valores,
        };
      }

      return {
        error: "No hemos podido añadir la partida. Inténtalo de nuevo.",
        valores,
      };
    }
  }

  revalidar(presupuestoId);

  redirect(
    `/panel/presupuestos/${presupuestoId}?linea=${
      id ? "actualizada" : "anadida"
    }#partidas`,
  );
}

export async function eliminarPartida(formData: FormData): Promise<void> {
  const presupuestoId = texto(formData, "presupuesto_id");
  const id = texto(formData, "id");

  if (!esUuid(presupuestoId) || !esUuid(id)) {
    redirect(`/panel/presupuestos/${presupuestoId}?aviso=no-eliminada#partidas`);
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const { data, error } = await supabase
    .from("partidas")
    .delete()
    .eq("id", id)
    .eq("presupuesto_id", presupuestoId)
    .select("id")
    .maybeSingle();

  if (error?.code === "23514") {
    redirect(`/panel/presupuestos/${presupuestoId}?aviso=protegido#partidas`);
  }

  if (!data) {
    redirect(`/panel/presupuestos/${presupuestoId}?aviso=no-eliminada#partidas`);
  }

  revalidar(presupuestoId);

  redirect(`/panel/presupuestos/${presupuestoId}?linea=eliminada#partidas`);
}

export async function confirmarPrecio(formData: FormData): Promise<void> {
  const presupuestoId = texto(formData, "presupuesto_id");
  const id = texto(formData, "id");

  if (!esUuid(presupuestoId) || !esUuid(id)) {
    redirect(`/panel/presupuestos/${presupuestoId}?aviso=no-confirmada#partidas`);
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const { data, error } = await supabase
    .from("partidas")
    .update({ precio_confirmado: true })
    .eq("id", id)
    .eq("presupuesto_id", presupuestoId)
    .select("id")
    .maybeSingle();

  if (error?.code === "23514") {
    redirect(`/panel/presupuestos/${presupuestoId}?aviso=protegido#partidas`);
  }

  if (!data) {
    redirect(`/panel/presupuestos/${presupuestoId}?aviso=no-confirmada#partidas`);
  }

  revalidar(presupuestoId);

  redirect(`/panel/presupuestos/${presupuestoId}?linea=confirmada#partidas`);
}

export async function confirmarTodosPrecios(formData: FormData): Promise<void> {
  const presupuestoId = texto(formData, "presupuesto_id");

  if (!esUuid(presupuestoId)) {
    redirect("/panel/presupuestos");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const { error } = await supabase
    .from("partidas")
    .update({ precio_confirmado: true })
    .eq("presupuesto_id", presupuestoId)
    .eq("precio_confirmado", false);

  if (error?.code === "23514") {
    redirect(`/panel/presupuestos/${presupuestoId}?aviso=protegido#totales`);
  }

  revalidar(presupuestoId);

  redirect(`/panel/presupuestos/${presupuestoId}?precios=confirmados#totales`);
}
