export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      clientes: {
        Row: {
          actualizado_en: string
          ciudad: string | null
          cp: string | null
          creado_en: string
          direccion: string | null
          email: string | null
          id: string
          nif: string | null
          nombre: string
          propietario_id: string
          telefono: string | null
        }
        Insert: {
          actualizado_en?: string
          ciudad?: string | null
          cp?: string | null
          creado_en?: string
          direccion?: string | null
          email?: string | null
          id?: string
          nif?: string | null
          nombre: string
          propietario_id: string
          telefono?: string | null
        }
        Update: {
          actualizado_en?: string
          ciudad?: string | null
          cp?: string | null
          creado_en?: string
          direccion?: string | null
          email?: string | null
          id?: string
          nif?: string | null
          nombre?: string
          propietario_id?: string
          telefono?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_propietario_id_fkey"
            columns: ["propietario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partidas: {
        Row: {
          cantidad: number
          confianza: Database["public"]["Enums"]["nivel_confianza"] | null
          creado_en: string
          descripcion: string
          id: string
          importe: number | null
          orden: number
          origen: Database["public"]["Enums"]["origen_partida"]
          precio_confirmado: boolean
          precio_unitario: number
          presupuesto_id: string
          tipo: Database["public"]["Enums"]["tipo_partida"]
          unidad: string
        }
        Insert: {
          cantidad?: number
          confianza?: Database["public"]["Enums"]["nivel_confianza"] | null
          creado_en?: string
          descripcion: string
          id?: string
          importe?: number | null
          orden?: number
          origen?: Database["public"]["Enums"]["origen_partida"]
          precio_confirmado?: boolean
          precio_unitario?: number
          presupuesto_id: string
          tipo?: Database["public"]["Enums"]["tipo_partida"]
          unidad?: string
        }
        Update: {
          cantidad?: number
          confianza?: Database["public"]["Enums"]["nivel_confianza"] | null
          creado_en?: string
          descripcion?: string
          id?: string
          importe?: number | null
          orden?: number
          origen?: Database["public"]["Enums"]["origen_partida"]
          precio_confirmado?: boolean
          precio_unitario?: number
          presupuesto_id?: string
          tipo?: Database["public"]["Enums"]["tipo_partida"]
          unidad?: string
        }
        Relationships: [
          {
            foreignKeyName: "partidas_presupuesto_id_fkey"
            columns: ["presupuesto_id"]
            isOneToOne: false
            referencedRelation: "presupuestos"
            referencedColumns: ["id"]
          },
        ]
      }
      presupuestos: {
        Row: {
          actualizado_en: string
          base_imponible: number
          cliente_id: string | null
          creado_en: string
          cuota_iva: number
          descripcion_averia: string | null
          enviado_en: string | null
          estado: Database["public"]["Enums"]["estado_presupuesto"]
          ia_generado_en: string | null
          ia_modelo: string | null
          id: string
          iva_porcentaje: number
          notas: string | null
          propietario_id: string
          requiere_visita: boolean
          respondido_en: string | null
          titulo: string
          token_publico: string
          total: number
          validado_en: string | null
          validez_dias: number
        }
        Insert: {
          actualizado_en?: string
          base_imponible?: number
          cliente_id?: string | null
          creado_en?: string
          cuota_iva?: number
          descripcion_averia?: string | null
          enviado_en?: string | null
          estado?: Database["public"]["Enums"]["estado_presupuesto"]
          ia_generado_en?: string | null
          ia_modelo?: string | null
          id?: string
          iva_porcentaje?: number
          notas?: string | null
          propietario_id: string
          requiere_visita?: boolean
          respondido_en?: string | null
          titulo: string
          token_publico?: string
          total?: number
          validado_en?: string | null
          validez_dias?: number
        }
        Update: {
          actualizado_en?: string
          base_imponible?: number
          cliente_id?: string | null
          creado_en?: string
          cuota_iva?: number
          descripcion_averia?: string | null
          enviado_en?: string | null
          estado?: Database["public"]["Enums"]["estado_presupuesto"]
          ia_generado_en?: string | null
          ia_modelo?: string | null
          id?: string
          iva_porcentaje?: number
          notas?: string | null
          propietario_id?: string
          requiere_visita?: boolean
          respondido_en?: string | null
          titulo?: string
          token_publico?: string
          total?: number
          validado_en?: string | null
          validez_dias?: number
        }
        Relationships: [
          {
            foreignKeyName: "presupuestos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presupuestos_propietario_id_fkey"
            columns: ["propietario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          actualizado_en: string
          ciudad: string | null
          cp: string | null
          creado_en: string
          direccion: string | null
          email_contacto: string | null
          iban: string | null
          id: string
          iva_defecto: number
          nif: string | null
          nombre_comercial: string | null
          nombre_fiscal: string | null
          provincia: string | null
          serie_factura_defecto: string
          telefono: string | null
        }
        Insert: {
          actualizado_en?: string
          ciudad?: string | null
          cp?: string | null
          creado_en?: string
          direccion?: string | null
          email_contacto?: string | null
          iban?: string | null
          id: string
          iva_defecto?: number
          nif?: string | null
          nombre_comercial?: string | null
          nombre_fiscal?: string | null
          provincia?: string | null
          serie_factura_defecto?: string
          telefono?: string | null
        }
        Update: {
          actualizado_en?: string
          ciudad?: string | null
          cp?: string | null
          creado_en?: string
          direccion?: string | null
          email_contacto?: string | null
          iban?: string | null
          id?: string
          iva_defecto?: number
          nif?: string | null
          nombre_comercial?: string | null
          nombre_fiscal?: string | null
          provincia?: string | null
          serie_factura_defecto?: string
          telefono?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      recalcular_totales: {
        Args: { p_presupuesto_id: string }
        Returns: undefined
      }
    }
    Enums: {
      estado_factura: "emitida" | "pagada" | "anulada"
      estado_presupuesto:
        | "borrador"
        | "generando"
        | "revisado"
        | "enviado"
        | "aceptado"
        | "rechazado"
        | "caducado"
        | "facturado"
      nivel_confianza: "alto" | "medio" | "bajo"
      origen_partida: "ia" | "manual"
      tipo_partida: "material" | "mano_obra" | "desplazamiento" | "otro"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      estado_factura: ["emitida", "pagada", "anulada"],
      estado_presupuesto: [
        "borrador",
        "generando",
        "revisado",
        "enviado",
        "aceptado",
        "rechazado",
        "caducado",
        "facturado",
      ],
      nivel_confianza: ["alto", "medio", "bajo"],
      origen_partida: ["ia", "manual"],
      tipo_partida: ["material", "mano_obra", "desplazamiento", "otro"],
    },
  },
} as const
