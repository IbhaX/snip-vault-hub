import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Encryption helpers using Web Crypto API
async function getKey(): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(Deno.env.get('ENCRYPTION_KEY')!),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode('vault-salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encrypt(text: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedText = new TextEncoder().encode(text);

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedText
  );

  const result = new Uint8Array(iv.length + ciphertext.byteLength);
  result.set(iv);
  result.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...result));
}

async function decrypt(encryptedText: string): Promise<string> {
  const key = await getKey();
  const data = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));
  
  const iv = data.slice(0, 12);
  const ciphertext = data.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const method = req.method;

    if (method === 'GET') {
      // List user secrets (encrypted values not returned)
      const { data, error } = await supabase
        .from('user_secrets')
        .select('id, title, username, secret_type, notes_encrypted, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Decrypt notes for display
      const decryptedSecrets = await Promise.all(
        data.map(async (secret) => ({
          ...secret,
          notes: secret.notes_encrypted ? await decrypt(secret.notes_encrypted) : null,
        }))
      );

      return new Response(JSON.stringify(decryptedSecrets), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (method === 'POST') {
      // Create new secret
      const { title, username, secret_type, value, notes } = await req.json();

      if (!title || !value) {
        return new Response(JSON.stringify({ error: 'Title and value are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const encryptedValue = await encrypt(value);
      const encryptedNotes = notes ? await encrypt(notes) : null;

      const { data, error } = await supabase
        .from('user_secrets')
        .insert({
          user_id: user.id,
          title,
          username,
          secret_type: secret_type || 'password',
          value_encrypted: encryptedValue,
          notes_encrypted: encryptedNotes,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ 
        id: data.id,
        title: data.title,
        username: data.username,
        secret_type: data.secret_type,
        notes: notes,
        created_at: data.created_at,
        updated_at: data.updated_at,
      }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (method === 'PUT') {
      // Update secret
      const secretId = url.pathname.split('/').pop();
      const { title, username, secret_type, value, notes } = await req.json();

      if (!secretId) {
        return new Response(JSON.stringify({ error: 'Secret ID required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (username !== undefined) updateData.username = username;
      if (secret_type !== undefined) updateData.secret_type = secret_type;
      if (value !== undefined) updateData.value_encrypted = await encrypt(value);
      if (notes !== undefined) updateData.notes_encrypted = notes ? await encrypt(notes) : null;

      const { data, error } = await supabase
        .from('user_secrets')
        .update(updateData)
        .eq('id', secretId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({
        id: data.id,
        title: data.title,
        username: data.username,
        secret_type: data.secret_type,
        notes: notes,
        created_at: data.created_at,
        updated_at: data.updated_at,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (method === 'DELETE') {
      // Delete secret
      const secretId = url.pathname.split('/').pop();

      if (!secretId) {
        return new Response(JSON.stringify({ error: 'Secret ID required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { error } = await supabase
        .from('user_secrets')
        .delete()
        .eq('id', secretId)
        .eq('user_id', user.id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Edge function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});