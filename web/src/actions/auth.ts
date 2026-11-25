"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { urlDelSitio } from "@/lib/supabase/entorno";

export type EstadoAuth = {
  error?: string;
  aviso?: string;
};

function texto(formData: FormData, clave: string): string {
  const valor = formData.get(clave);
  return typeof valor === "string" ? valor.trim() : "";
}

function destinoSeguro(valor: string): string {
  if (valor.startsWith("/") && !valor.startsWith("//")) {
    return valor;
  }

  return "/panel";
}

function traducirError(mensaje: string): string {
  const textoError = mensaje.toLowerCase();

  if (textoError.includes("invalid login credentials")) {
    return "El correo o la contraseña no son correctos.";
  }

  if (textoError.includes("email not confirmed")) {
    return "Todavía no has confirmado tu correo. Revisa la bandeja de entrada.";
  }

  if (
    textoError.includes("user already registered") ||
    textoError.includes("already been registered")
  ) {
    return "Ya existe una cuenta con ese correo. Prueba a entrar.";
  }

  if (textoError.includes("password should be at least")) {
    return "La contraseña es demasiado corta.";
  }

  if (
    textoError.includes("unable to validate email") ||
    textoError.includes("invalid email") ||
    textoError.includes("email address is invalid")
  ) {
    return "Ese correo no parece válido.";
  }

  if (
    textoError.includes("signups are disabled") ||
    textoError.includes("signup is disabled")
  ) {
    return "El alta de nuevas cuentas está cerrada ahora mismo. Inténtalo más tarde.";
  }

  if (
    textoError.includes("rate limit") ||
    textoError.includes("too many") ||
    textoError.includes("email rate")
  ) {
    return "Demasiados intentos seguidos. Espera un minuto y vuelve a probar.";
  }

  return "No hemos podido completar la operación. Inténtalo de nuevo.";
}

export async function entrar(
  _estado: EstadoAuth,
  formData: FormData,
): Promise<EstadoAuth> {
  const email = texto(formData, "email");
  const contrasena = texto(formData, "contrasena");
  const siguiente = destinoSeguro(texto(formData, "siguiente"));

  if (!email || !contrasena) {
    return { error: "Escribe tu correo y tu contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: contrasena,
  });

  if (error) {
    return { error: traducirError(error.message) };
  }

  redirect(siguiente);
}

export async function registrarse(
  _estado: EstadoAuth,
  formData: FormData,
): Promise<EstadoAuth> {
  const email = texto(formData, "email");
  const contrasena = texto(formData, "contrasena");

  if (!email || !contrasena) {
    return { error: "Escribe tu correo y elige una contraseña." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Ese correo no parece válido." };
  }

  if (contrasena.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: contrasena,
    options: {
      emailRedirectTo: `${urlDelSitio()}/auth/callback?next=/onboarding`,
    },
  });

  if (error) {
    return { error: traducirError(error.message) };
  }

  if (!data.session) {
    return {
      aviso:
        "Te hemos enviado un correo para confirmar la cuenta. Ábrelo y vuelve por aquí.",
    };
  }

  redirect("/onboarding");
}

export async function cerrarSesion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/entrar");
}

export async function solicitarRecuperacion(
  _estado: EstadoAuth,
  formData: FormData,
): Promise<EstadoAuth> {
  const email = texto(formData, "email");

  if (!email) {
    return { error: "Escribe el correo de tu cuenta." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${urlDelSitio()}/auth/callback?next=/recuperar`,
  });

  if (error?.status === 429) {
    return {
      error: "Demasiadas solicitudes seguidas. Espera unos minutos y vuelve a probar.",
    };
  }

  // Respuesta genérica a propósito: no revelamos si el correo tiene cuenta.
  return {
    aviso:
      "Si ese correo tiene una cuenta, te hemos enviado un enlace para cambiar la contraseña. Revisa también la carpeta de spam.",
  };
}

export async function cambiarContrasena(
  _estado: EstadoAuth,
  formData: FormData,
): Promise<EstadoAuth> {
  const contrasena = texto(formData, "contrasena");
  const repeticion = texto(formData, "contrasena2");

  if (contrasena.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }

  if (contrasena !== repeticion) {
    return { error: "Las dos contraseñas no coinciden." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error:
        "El enlace ha caducado. Pide otro correo de recuperación y ábrelo de nuevo.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password: contrasena });

  if (error) {
    return { error: traducirError(error.message) };
  }

  redirect("/panel?contrasena=actualizada");
}
