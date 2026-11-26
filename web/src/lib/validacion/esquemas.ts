import { z } from "zod";

import { TIPOS_PARTIDA } from "@/lib/presupuestos";

const obligatorio = (mensaje: string) => z.string().trim().min(1, mensaje);

/**
 * Comprueba el dígito de control de un IBAN ya normalizado (sin espacios y en
 * mayúsculas). Es la misma validación que usan las entidades bancarias.
 */
function ibanValido(iban: string): boolean {
  const reordenado = iban.slice(4) + iban.slice(0, 4);
  const numerico = reordenado.replace(/[A-Z]/g, (letra) =>
    String(letra.charCodeAt(0) - 55),
  );

  let resto = 0;

  for (const digito of numerico) {
    resto = (resto * 10 + Number(digito)) % 97;
  }

  return resto === 1;
}

export const esquemaPerfil = z.object({
  nombre_comercial: obligatorio("Escribe el nombre con el que trabajas.").max(
    120,
    "El nombre comercial es demasiado largo.",
  ),
  nombre_fiscal: obligatorio("Escribe tu nombre o razón social.").max(
    160,
    "El nombre fiscal es demasiado largo.",
  ),
  nif: obligatorio("Escribe tu NIF o CIF.")
    .min(5, "El NIF no parece válido.")
    .max(20, "El NIF no parece válido."),
  direccion: obligatorio("Escribe tu dirección fiscal.").max(
    200,
    "La dirección es demasiado larga.",
  ),
  cp: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "El código postal debe tener 5 dígitos."),
  ciudad: obligatorio("Escribe tu ciudad.").max(120, "La ciudad es demasiado larga."),
  provincia: obligatorio("Escribe tu provincia.").max(
    120,
    "La provincia es demasiado larga.",
  ),
  telefono: z
    .string()
    .trim()
    .max(30, "El teléfono es demasiado largo.")
    .optional()
    .default(""),
  email_contacto: z.union([
    z.literal(""),
    z.email("El correo de contacto no es válido."),
  ]),
  iban: z
    .string()
    .trim()
    .transform((valor) => valor.replace(/\s+/g, "").toUpperCase())
    .refine(
      (valor) => valor === "" || /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(valor),
      "El IBAN no parece válido.",
    )
    .refine(
      (valor) => valor === "" || ibanValido(valor),
      "El IBAN no parece válido.",
    ),
  iva_defecto: z.coerce
    .number()
    .refine(
      (valor) => valor === 21 || valor === 10,
      "Elige un IVA válido: 21 % o 10 %.",
    ),
  serie_factura_defecto: z
    .string()
    .trim()
    .min(1, "Escribe una serie para las facturas.")
    .max(8, "La serie puede tener como máximo 8 caracteres.")
    .regex(/^[A-Za-z0-9]+$/, "La serie solo admite letras y números.")
    .transform((valor) => valor.toUpperCase()),
});

export type DatosPerfil = z.infer<typeof esquemaPerfil>;

const validezDias = z.coerce
  .number()
  .int("La validez debe ser un número entero.")
  .min(1, "La validez mínima es 1 día.")
  .max(365, "La validez máxima es 365 días.");

const ivaPorcentaje = z.coerce
  .number()
  .refine(
    (valor) => valor === 21 || valor === 10,
    "Elige un IVA válido: 21 % o 10 %.",
  );

export const esquemaCliente = z.object({
  nombre: obligatorio("Escribe el nombre del cliente.").max(
    160,
    "El nombre es demasiado largo.",
  ),
  nif: z.string().trim().max(20, "El NIF es demasiado largo."),
  email: z.union([
    z.literal(""),
    z.email("El correo del cliente no es válido."),
  ]),
  telefono: z.string().trim().max(30, "El teléfono es demasiado largo."),
  direccion: z.string().trim().max(200, "La dirección es demasiado larga."),
  cp: z.union([
    z.literal(""),
    z
      .string()
      .trim()
      .regex(/^\d{5}$/, "El código postal debe tener 5 dígitos."),
  ]),
  ciudad: z.string().trim().max(120, "La ciudad es demasiado larga."),
});

export type DatosCliente = z.infer<typeof esquemaCliente>;

export const esquemaNuevoPresupuesto = z
  .object({
    titulo: obligatorio("Ponle un título al presupuesto.").max(
      160,
      "El título es demasiado largo.",
    ),
    descripcion_averia: z
      .string()
      .trim()
      .max(2000, "La descripción es demasiado larga."),
    modo_cliente: z.enum(["existente", "nuevo"]),
    cliente_id: z.string().trim(),
    cliente_nombre: z.string().trim().max(160, "El nombre es demasiado largo."),
    cliente_nif: z.string().trim().max(20, "El NIF es demasiado largo."),
    cliente_email: z.union([
      z.literal(""),
      z.email("El correo del cliente no es válido."),
    ]),
    cliente_telefono: z
      .string()
      .trim()
      .max(30, "El teléfono es demasiado largo."),
    iva_porcentaje: ivaPorcentaje,
    validez_dias: validezDias,
  })
  .superRefine((datos, ctx) => {
    if (
      datos.modo_cliente === "existente" &&
      !z.uuid().safeParse(datos.cliente_id).success
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["cliente_id"],
        message: "Elige un cliente de la lista.",
      });
    }

    if (datos.modo_cliente === "nuevo" && !datos.cliente_nombre) {
      ctx.addIssue({
        code: "custom",
        path: ["cliente_nombre"],
        message: "Escribe el nombre del cliente.",
      });
    }
  });

export type DatosNuevoPresupuesto = z.infer<typeof esquemaNuevoPresupuesto>;

export const esquemaEditarPresupuesto = z.object({
  titulo: obligatorio("Ponle un título al presupuesto.").max(
    160,
    "El título es demasiado largo.",
  ),
  descripcion_averia: z
    .string()
    .trim()
    .max(2000, "La descripción es demasiado larga."),
  cliente_id: z.uuid("Elige un cliente de la lista."),
  validez_dias: validezDias,
});

export type DatosEditarPresupuesto = z.infer<typeof esquemaEditarPresupuesto>;

export const esquemaPartida = z.object({
  tipo: z.enum(TIPOS_PARTIDA),
  descripcion: obligatorio("Describe la partida.").max(
    300,
    "La descripción es demasiado larga.",
  ),
  cantidad: z.coerce
    .number()
    .positive("La cantidad debe ser mayor que cero.")
    .max(100000, "La cantidad es demasiado grande."),
  unidad: obligatorio("Escribe la unidad (ud, h, m²…).").max(
    12,
    "La unidad es demasiado larga.",
  ),
  precio_unitario: z.coerce
    .number()
    .min(0, "El precio no puede ser negativo.")
    .max(1000000, "El precio es demasiado alto."),
});

export type DatosPartida = z.infer<typeof esquemaPartida>;

export const esquemaIva = z.object({
  iva_porcentaje: ivaPorcentaje,
});
