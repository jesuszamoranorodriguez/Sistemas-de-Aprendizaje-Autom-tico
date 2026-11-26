"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { erroresDe, numero, texto, valoresDe } from "@/lib/formularios";
import { createClient } from "@/lib/supabase/server";
import {
  esquemaEditarPresupuesto,
  esquemaIva,
  esquemaNuevoPresupuesto,
} from "@/lib/validacion/esquemas";

export type EstadoNuevoPresupuesto = {
  error?: string;
  campos?: Record<string, string>;
  valores?: Record<string, string>;
};

export type EstadoEditarPresupuesto = {
  error?: string;
  campos?: Record<string, string>;
  valores?: Record<string, string>;
};

export type EstadoIva = {
  ok?: boolean;
  error?: string;
};

const CAMPOS_NUEVO = [
  "titulo",
  "descripcion_averia",
  "modo_cliente",
  "cliente_id",
  "cliente_nombre",
  "cliente_nif",
  "cliente_email",
  "cliente_telefono",
  "iva_porcentaje",
  "validez_dias",
] as const;

const CAMPOS_EDITAR = [
  "titulo",
  "descripcion_averia",
  "cliente_id",
  "validez_dias",
] as const;

export async function crearPresupuesto(
  _estado: EstadoNuevoPresupuesto,
  formData: FormData,
): Promise<EstadoNuevoPresupuesto> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const resultado = esquemaNuevoPresupuesto.safeParse({
    titulo: texto(formData, "titulo"),
    descripcion_averia: texto(formData, "descripcion_averia"),
    modo_cliente: texto(formData, "modo_cliente"),
    cliente_id: texto(formData, "cliente_id"),
    cliente_nombre: texto(formData, "cliente_nombre"),
    cliente_nif: texto(formData, "cliente_nif"),
    cliente_email: texto(formData, "cliente_email"),
    cliente_telefono: texto(formData, "cliente_telefono"),
    iva_porcentaje: numero(formData, "iva_porcentaje"),
    validez_dias: numero(formData, "validez_dias"),
  });

  const valores = valoresDe(formData, CAMPOS_NUEVO);

  if (!resultado.success) {
    return {
      error: "Revisa los campos marcados.",
      campos: erroresDe(resultado.error.issues),
      valores,
    };
  }

  const datos = resultado.data;
  let clienteId: string;

  if (datos.modo_cliente === "nuevo") {
    const { data: cliente, error } = await supabase
      .from("clientes")
      .insert({
        propietario_id: user.id,
        nombre: datos.cliente_nombre,
        nif: datos.cliente_nif ? datos.cliente_nif.toUpperCase() : null,
        email: datos.cliente_email || null,
        telefono: datos.cliente_telefono || null,
      })
      .select("id")
      .single();

    if (error || !cliente) {
      if (error?.code === "23505") {
        return {
          error: "Ya tienes un cliente con ese NIF.",
          campos: {
            cliente_nif: "Ese NIF ya está en uso. Elige el cliente en la lista.",
          },
          valores,
        };
      }

      return {
        error: "No hemos podido guardar el cliente. Inténtalo de nuevo.",
        valores,
      };
    }

    clienteId = cliente.id;
  } else {
    const { data: cliente } = await supabase
      .from("clientes")
      .select("id")
      .eq("id", datos.cliente_id)
      .maybeSingle();

    if (!cliente) {
      return {
        error: "Ese cliente ya no existe. Elige otro.",
        campos: { cliente_id: "Elige un cliente de la lista." },
        valores,
      };
    }

    clienteId = cliente.id;
  }

  const { data: presupuesto, error } = await supabase
    .from("presupuestos")
    .insert({
      propietario_id: user.id,
      cliente_id: clienteId,
      titulo: datos.titulo,
      descripcion_averia: datos.descripcion_averia || null,
      iva_porcentaje: datos.iva_porcentaje,
      validez_dias: datos.validez_dias,
      estado: "borrador",
    })
    .select("id")
    .single();

  if (error || !presupuesto) {
    return {
      error: "No hemos podido crear el presupuesto. Inténtalo de nuevo.",
      valores,
    };
  }

  revalidatePath("/panel");
  revalidatePath("/panel/presupuestos");

  redirect(`/panel/presupuestos/${presupuesto.id}?creado=1`);
}

export async function actualizarPresupuesto(
  _estado: EstadoEditarPresupuesto,
  formData: FormData,
): Promise<EstadoEditarPresupuesto> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const id = texto(formData, "presupuesto_id");

  const resultado = esquemaEditarPresupuesto.safeParse({
    titulo: texto(formData, "titulo"),
    descripcion_averia: texto(formData, "descripcion_averia"),
    cliente_id: texto(formData, "cliente_id"),
    validez_dias: numero(formData, "validez_dias"),
  });

  const valores = valoresDe(formData, CAMPOS_EDITAR);

  if (!resultado.success) {
    return {
      error: "Revisa los campos marcados.",
      campos: erroresDe(resultado.error.issues),
      valores,
    };
  }

  const datos = resultado.data;

  const { data: cliente } = await supabase
    .from("clientes")
    .select("id")
    .eq("id", datos.cliente_id)
    .maybeSingle();

  if (!cliente) {
    return {
      error: "Ese cliente ya no existe. Elige otro.",
      campos: { cliente_id: "Elige un cliente de la lista." },
      valores,
    };
  }

  const { data, error } = await supabase
    .from("presupuestos")
    .update({
      titulo: datos.titulo,
      descripcion_averia: datos.descripcion_averia || null,
      cliente_id: datos.cliente_id,
      validez_dias: datos.validez_dias,
    })
    .eq("id", id)
    .in("estado", ["borrador", "revisado"])
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
      error: "No hemos podido guardar los cambios. Inténtalo de nuevo.",
      valores,
    };
  }

  if (!data) {
    return { error: "Este presupuesto ya no se puede modificar.", valores };
  }

  revalidatePath("/panel");
  revalidatePath("/panel/presupuestos");
  revalidatePath(`/panel/presupuestos/${id}`);

  redirect(`/panel/presupuestos/${id}?datos=actualizados`);
}

export async function cambiarIva(
  _estado: EstadoIva,
  formData: FormData,
): Promise<EstadoIva> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const id = texto(formData, "presupuesto_id");
  const resultado = esquemaIva.safeParse({
    iva_porcentaje: numero(formData, "iva_porcentaje"),
  });

  if (!resultado.success) {
    return { error: "Elige un IVA válido: 21 % o 10 %." };
  }

  const { data, error } = await supabase
    .from("presupuestos")
    .update({ iva_porcentaje: resultado.data.iva_porcentaje })
    .eq("id", id)
    .in("estado", ["borrador", "revisado"])
    .select("id")
    .maybeSingle();

  if (error) {
    if (error.code === "23514") {
      return { error: "No se puede cambiar el IVA de un presupuesto cerrado." };
    }

    return {
      error: "No hemos podido cambiar el IVA. Inténtalo de nuevo.",
    };
  }

  if (!data) {
    return { error: "Este presupuesto ya no se puede modificar." };
  }

  revalidatePath("/panel");
  revalidatePath("/panel/presupuestos");
  revalidatePath(`/panel/presupuestos/${id}`);

  return { ok: true };
}

export async function validarPresupuesto(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const id = texto(formData, "presupuesto_id");

  const { data: presupuesto } = await supabase
    .from("presupuestos")
    .select("estado")
    .eq("id", id)
    .maybeSingle();

  if (!presupuesto) {
    redirect(`/panel/presupuestos/${id}?aviso=no-existe`);
  }

  if (presupuesto.estado !== "borrador") {
    redirect(`/panel/presupuestos/${id}?aviso=no-borrador`);
  }

  const { count } = await supabase
    .from("partidas")
    .select("id", { count: "exact", head: true })
    .eq("presupuesto_id", id);

  if (!count) {
    redirect(`/panel/presupuestos/${id}?aviso=sin-partidas`);
  }

  const { data } = await supabase
    .from("presupuestos")
    .update({
      estado: "revisado",
      validado_en: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("estado", "borrador")
    .select("id")
    .maybeSingle();

  if (!data) {
    redirect(`/panel/presupuestos/${id}?aviso=no-validado`);
  }

  revalidatePath("/panel");
  revalidatePath("/panel/presupuestos");
  revalidatePath(`/panel/presupuestos/${id}`);

  redirect(`/panel/presupuestos/${id}?validado=1`);
}

export async function eliminarPresupuesto(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const id = texto(formData, "presupuesto_id");

  const { data, error } = await supabase
    .from("presupuestos")
    .delete()
    .eq("id", id)
    .in("estado", ["borrador", "revisado"])
    .select("id")
    .maybeSingle();

  if (error?.code === "23514") {
    redirect(`/panel/presupuestos/${id}?aviso=protegido`);
  }

  if (!data) {
    redirect(`/panel/presupuestos/${id}?aviso=no-eliminado`);
  }

  revalidatePath("/panel");
  revalidatePath("/panel/presupuestos");

  redirect("/panel/presupuestos?eliminado=1");
}
