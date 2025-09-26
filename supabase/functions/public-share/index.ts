import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PublicShareRequest {
  itemId: string;
  expiresIn: number; // seconds
  maxViews: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (req.method === 'POST') {
      const { itemId, expiresIn, maxViews }: PublicShareRequest = await req.json();

      // Verify the user owns this content item
      const { data: item, error: itemError } = await supabase
        .from('content_items')
        .select('*')
        .eq('id', itemId)
        .eq('user_id', user.id)
        .single();

      if (itemError || !item) {
        return new Response(
          JSON.stringify({ error: 'Content not found or unauthorized' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Generate a unique share ID
      const shareId = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      // Create the public share record
      const { data: share, error: shareError } = await supabase
        .from('public_shares')
        .insert({
          share_id: shareId,
          content_item_id: itemId,
          created_by: user.id,
          expires_at: expiresAt.toISOString(),
          max_views: maxViews,
          view_count: 0
        })
        .select()
        .single();

      if (shareError) {
        console.error('Error creating share:', shareError);
        return new Response(
          JSON.stringify({ error: 'Failed to create share' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ shareId, expiresAt, maxViews }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const shareId = url.searchParams.get('shareId');

      if (!shareId) {
        return new Response(
          JSON.stringify({ error: 'Share ID required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Get the share record and increment view count
      const { data: share, error: shareError } = await supabase
        .from('public_shares')
        .select(`
          *,
          content_items (*)
        `)
        .eq('share_id', shareId)
        .single();

      if (shareError || !share) {
        return new Response(
          JSON.stringify({ error: 'Share not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Check if share has expired
      if (new Date() > new Date(share.expires_at)) {
        return new Response(
          JSON.stringify({ error: 'Share has expired' }),
          { 
            status: 410, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Check if max views exceeded
      if (share.view_count >= share.max_views) {
        return new Response(
          JSON.stringify({ error: 'Maximum views exceeded' }),
          { 
            status: 410, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Increment view count
      await supabase
        .from('public_shares')
        .update({ view_count: share.view_count + 1 })
        .eq('share_id', shareId);

      return new Response(
        JSON.stringify({ 
          content: share.content_items,
          viewsRemaining: share.max_views - share.view_count - 1,
          expiresAt: share.expires_at
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in public-share function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});