// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // ============================
  // CORS
  // ============================
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:8080",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  const headers = {
    "Access-Control-Allow-Origin": "http://localhost:8080",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  try {
    const { email, password, rol, nombre, carnet, telefono } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ============================
    // 1. Crear usuario en Auth
    // ============================

    const { data: authData, error: authErr } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authErr) {
      return new Response(JSON.stringify({ error: authErr.message }), {
        status: 400,
        headers,
      });
    }

    const userId = authData.user.id;

    // ============================
    // 2. Insertar perfil en tabla
    // ============================
    const { error: perfilErr } = await supabaseAdmin
      .from("perfil_usuario")
      .insert({
        id: userId,
        nombre_completo: nombre,
        carnet_o_codigo: carnet,
        rol,
        telefono: telefono || null,
        carrera_id: null,
        certificaciones: [],
        estado: "activo",
      });

    if (perfilErr) {
      return new Response(JSON.stringify({ error: perfilErr.message }), {
        status: 400,
        headers,
      });
    }

    // ============================
    // 3. Bitácora
    // ============================
    await supabaseAdmin.from("bitacora").insert({
      usuario_id: userId,
      accion: "crear",
      tabla_afectada: "perfil_usuario",
      detalles: { nombre, email, rol, carnet },
    });

    return new Response(
      JSON.stringify({ message: "Usuario creado correctamente" }),
      { status: 200, headers }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers,
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/crear_usuario' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
