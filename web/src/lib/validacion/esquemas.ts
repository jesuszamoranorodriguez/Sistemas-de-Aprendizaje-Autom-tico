import { z } from "zod";

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
