"use client";

import { useActionState, useEffect } from "react";

import { guardarCliente, type EstadoCliente } from "@/actions/clientes";
import { Aviso } from "@/components/ui/Aviso";
import { Boton, clasesBoton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";

const ESTADO_INICIAL: EstadoCliente = {};

export type ClienteFormulario = {
  id: string;
  nombre: string;
  nif: string | null;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  cp: string | null;
  ciudad: string | null;
};

type Props = {
  cliente?: ClienteFormulario;
  onExito: () => void;
};

export function FormularioCliente({ cliente, onExito }: Props) {
  const [estado, accion, pendiente] = useActionState(
    guardarCliente,
    ESTADO_INICIAL,
  );
  const valores = estado.valores ?? {};
  const errores = estado.campos ?? {};

  useEffect(() => {
    if (estado.ok) {
      onExito();
    }
  }, [estado.ok, onExito]);

  const valor = (clave: keyof ClienteFormulario, porDefecto = "") => {
    if (clave in valores) {
      return valores[clave] ?? "";
    }

    const original = cliente?.[clave];

    return original === null || original === undefined
      ? porDefecto
      : String(original);
  };

  return (
    <form action={accion} className="space-y-5" noValidate>
      {cliente ? <input type="hidden" name="id" value={cliente.id} /> : null}

      {estado.error ? <Aviso tono="error">{estado.error}</Aviso> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Campo
          id="cliente-nombre"
          name="nombre"
          etiqueta="Nombre *"
          ayuda="Como quieres que aparezca en el presupuesto."
          defaultValue={valor("nombre")}
          maxLength={160}
          error={errores.nombre}
          required
        />
        <Campo
          id="cliente-nif"
          name="nif"
          etiqueta="NIF o CIF"
          ayuda="Opcional, pero necesario para la factura."
          defaultValue={valor("nif")}
          autoCapitalize="characters"
          autoComplete="off"
          maxLength={20}
          error={errores.nif}
        />
        <Campo
          id="cliente-email"
          name="email"
          type="email"
          etiqueta="Correo electrónico"
          defaultValue={valor("email")}
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
          error={errores.email}
        />
        <Campo
          id="cliente-telefono"
          name="telefono"
          type="tel"
          etiqueta="Teléfono"
          defaultValue={valor("telefono")}
          autoComplete="tel"
          inputMode="tel"
          maxLength={30}
          error={errores.telefono}
        />
        <div className="sm:col-span-2">
          <Campo
            id="cliente-direccion"
            name="direccion"
            etiqueta="Dirección"
            ayuda="Dónde se hace el trabajo, si quieres guardarlo."
            defaultValue={valor("direccion")}
            autoComplete="street-address"
            maxLength={200}
            error={errores.direccion}
          />
        </div>
        <Campo
          id="cliente-cp"
          name="cp"
          etiqueta="Código postal"
          defaultValue={valor("cp")}
          autoComplete="postal-code"
          inputMode="numeric"
          maxLength={5}
          error={errores.cp}
        />
        <Campo
          id="cliente-ciudad"
          name="ciudad"
          etiqueta="Ciudad"
          defaultValue={valor("ciudad")}
          autoComplete="address-level2"
          maxLength={120}
          error={errores.ciudad}
        />
      </div>

      <div className="flex items-center justify-end gap-4 border-t border-tinta/10 pt-4">
        <button type="button" onClick={onExito} className={clasesBoton("sutil")}>
          Cancelar
        </button>
        <Boton type="submit" disabled={pendiente}>
          {pendiente
            ? "Guardando…"
            : cliente
              ? "Guardar cambios"
              : "Guardar cliente"}
        </Boton>
      </div>
    </form>
  );
}
