"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { guardarPerfil, type EstadoPerfil } from "@/actions/perfil";
import { Campo } from "@/components/ui/Campo";
import type { Perfil } from "@/lib/auth";

const ESTADO_INICIAL: EstadoPerfil = {};

/** Agrupa el IBAN en bloques de cuatro para que se lea de un vistazo. */
function formatearIban(iban: string): string {
  return iban
    .replace(/\s+/g, "")
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

type Props = {
  perfil: Perfil | null;
  emailCuenta: string;
  completo: boolean;
};

export function FormularioOnboarding({ perfil, emailCuenta, completo }: Props) {
  const [estado, accion, pendiente] = useActionState(
    guardarPerfil,
    ESTADO_INICIAL,
  );
  const valores = estado.valores ?? {};

  const valor = (clave: string, porDefecto = "") => {
    if (clave in valores) {
      return valores[clave] ?? "";
    }
    if (clave === "email_contacto") {
      return perfil?.email_contacto ?? emailCuenta;
    }
    return (perfil?.[clave as keyof Perfil] as string | null) ?? porDefecto;
  };

  const [iva, setIva] = useState(
    valores.iva_defecto ?? String(perfil?.iva_defecto ?? 21),
  );

  const errores = estado.campos ?? {};

  return (
    <form action={accion} className="mt-10 space-y-10" noValidate>
      {estado.error ? (
        <p
          role="alert"
          className="border-l-4 border-senal bg-senal/10 px-3 py-2.5 text-sm font-medium text-senal"
        >
          {estado.error}
        </p>
      ) : null}

      <fieldset className="border-t border-tinta/20 pt-6">
        <legend className="text-base font-extrabold tracking-tight">
          Cómo apareces en el presupuesto
        </legend>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-tinta/70">
          El nombre comercial lo ve el cliente. El nombre fiscal y el NIF son
          los que van en la factura.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Campo
            id="perfil-nombre-comercial"
            name="nombre_comercial"
            etiqueta="Nombre comercial *"
            ayuda="Por ejemplo, «Fontanería Maldonado»."
            defaultValue={valor("nombre_comercial")}
            autoComplete="organization"
            error={errores.nombre_comercial}
            required
          />
          <Campo
            id="perfil-nombre-fiscal"
            name="nombre_fiscal"
            etiqueta="Nombre fiscal *"
            ayuda="Tu nombre completo o la razón social."
            defaultValue={valor("nombre_fiscal")}
            autoComplete="name"
            error={errores.nombre_fiscal}
            required
          />
          <Campo
            id="perfil-nif"
            name="nif"
            etiqueta="NIF o CIF *"
            ayuda="Con la letra que corresponda."
            defaultValue={valor("nif")}
            autoCapitalize="characters"
            autoComplete="off"
            error={errores.nif}
            required
          />
          <Campo
            id="perfil-telefono"
            name="telefono"
            type="tel"
            etiqueta="Teléfono"
            ayuda="Para que el cliente pueda llamarte."
            defaultValue={valor("telefono")}
            autoComplete="tel"
            inputMode="tel"
            error={errores.telefono}
          />
        </div>
      </fieldset>

      <fieldset className="border-t border-tinta/20 pt-6">
        <legend className="text-base font-extrabold tracking-tight">
          Dónde te localiza el cliente
        </legend>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-tinta/70">
          Esta dirección es la que figurará en tus presupuestos y facturas.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Campo
              id="perfil-direccion"
              name="direccion"
              etiqueta="Dirección *"
              ayuda="Calle, número, piso y puerta."
              defaultValue={valor("direccion")}
              autoComplete="street-address"
              error={errores.direccion}
              required
            />
          </div>
          <div className="grid grid-cols-[8rem_minmax(0,1fr)] gap-5 sm:col-span-2">
            <Campo
              id="perfil-cp"
              name="cp"
              etiqueta="Código postal *"
              defaultValue={valor("cp")}
              autoComplete="postal-code"
              inputMode="numeric"
              maxLength={5}
              error={errores.cp}
              required
            />
            <Campo
              id="perfil-ciudad"
              name="ciudad"
              etiqueta="Ciudad *"
              defaultValue={valor("ciudad")}
              autoComplete="address-level2"
              error={errores.ciudad}
              required
            />
          </div>
          <Campo
            id="perfil-provincia"
            name="provincia"
            etiqueta="Provincia *"
            defaultValue={valor("provincia")}
            autoComplete="address-level1"
            error={errores.provincia}
            required
          />
          <Campo
            id="perfil-email-contacto"
            name="email_contacto"
            type="email"
            etiqueta="Correo de contacto"
            ayuda="Si lo dejas vacío, usaremos el de tu cuenta."
            defaultValue={valor("email_contacto")}
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            error={errores.email_contacto}
          />
        </div>
      </fieldset>

      <fieldset className="border-t border-tinta/20 pt-6">
        <legend className="text-base font-extrabold tracking-tight">
          Facturación
        </legend>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-tinta/70">
          Puedes cambiar estos valores en cada factura. Estos son solo los que
          se proponen por defecto.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Campo
              id="perfil-iban"
              name="iban"
              etiqueta="IBAN"
              ayuda="Opcional. Solo si quieres que aparezca en la factura."
              defaultValue={formatearIban(valor("iban"))}
              autoComplete="off"
              autoCapitalize="characters"
              error={errores.iban}
            />
          </div>

          <div>
            <label
              htmlFor="perfil-iva"
              className="block text-sm font-semibold text-tinta"
            >
              IVA por defecto
            </label>
            <select
              id="perfil-iva"
              name="iva_defecto"
              value={iva}
              onChange={(evento) => setIva(evento.target.value)}
              aria-describedby="perfil-iva-ayuda"
              className="mt-2 block w-full border border-tinta/25 bg-white px-3 py-2.5 text-base text-tinta focus:border-plano"
            >
              <option value="21">21 % — tipo general</option>
              <option value="10">10 % — obras en vivienda</option>
            </select>
            <p
              id="perfil-iva-ayuda"
              className="mt-1.5 text-xs leading-relaxed text-tinta/60"
            >
              Se propone al crear cada factura, pero siempre lo confirmas tú.
            </p>
            {errores.iva_defecto ? (
              <p className="mt-1.5 text-sm font-medium text-senal">
                {errores.iva_defecto}
              </p>
            ) : null}
            {iva === "10" ? (
              <p
                role="note"
                aria-live="polite"
                className="mt-3 border-l-4 border-senal bg-senal/10 px-3 py-2.5 text-sm leading-relaxed text-senal"
              >
                El 10 % solo se aplica a obras en viviendas que cumplan los
                requisitos legales. Confirma que tu caso cumple antes de
                guardar.
              </p>
            ) : null}
          </div>

          <Campo
            id="perfil-serie"
            name="serie_factura_defecto"
            etiqueta="Serie de factura"
            ayuda="Letras o números, hasta 8 caracteres."
            defaultValue={valor("serie_factura_defecto", "F")}
            maxLength={8}
            autoCapitalize="characters"
            error={errores.serie_factura_defecto}
            required
          />
        </div>
      </fieldset>

      <div className="flex flex-col gap-4 border-t border-tinta/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-tinta/60">
          Los campos con * son obligatorios.
        </p>
        <div className="flex flex-wrap items-center gap-5">
          {completo ? (
            <Link
              href="/panel"
              className="text-sm font-medium text-plano underline-offset-4 hover:underline"
            >
              Volver al panel
            </Link>
          ) : null}
          <button
            type="submit"
            disabled={pendiente}
            className="bg-tinta px-5 py-3 text-sm font-semibold text-papel transition-colors hover:bg-plano disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pendiente
              ? "Guardando…"
              : completo
                ? "Guardar cambios"
                : "Guardar y continuar"}
          </button>
        </div>
      </div>
    </form>
  );
}
