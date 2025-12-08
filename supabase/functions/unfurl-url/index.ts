import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UnfurledLink {
  url: string;
  title: string;
  description: string;
  image: string;
  type: 'video' | 'article' | 'website';
  siteName: string;
}

function extractMetaContent(html: string, property: string): string {
  // Try og: properties first
  const ogMatch = html.match(new RegExp(`<meta[^>]*property=["']og:${property}["'][^>]*content=["']([^"']+)["']`, 'i')) ||
                  html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:${property}["']`, 'i'));
  if (ogMatch) return ogMatch[1];

  // Try twitter: properties
  const twitterMatch = html.match(new RegExp(`<meta[^>]*name=["']twitter:${property}["'][^>]*content=["']([^"']+)["']`, 'i')) ||
                       html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:${property}["']`, 'i'));
  if (twitterMatch) return twitterMatch[1];

  // Try standard meta tags
  const metaMatch = html.match(new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i')) ||
                    html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${property}["']`, 'i'));
  if (metaMatch) return metaMatch[1];

  return '';
}

function extractTitle(html: string): string {
  const ogTitle = extractMetaContent(html, 'title');
  if (ogTitle) return ogTitle;

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : '';
}

function detectType(url: string, html: string): 'video' | 'article' | 'website' {
  const urlLower = url.toLowerCase();
  
  // Check URL patterns for video
  if (urlLower.includes('youtube.com') || 
      urlLower.includes('youtu.be') || 
      urlLower.includes('vimeo.com') ||
      urlLower.includes('dailymotion.com') ||
      urlLower.includes('twitch.tv')) {
    return 'video';
  }

  // Check og:type
  const ogType = extractMetaContent(html, 'type');
  if (ogType.includes('video')) return 'video';
  if (ogType.includes('article')) return 'article';

  // Check for article indicators
  if (html.includes('<article') || 
      urlLower.includes('/blog/') || 
      urlLower.includes('/article/') ||
      urlLower.includes('/post/')) {
    return 'article';
  }

  return 'website';
}

function extractSiteName(url: string, html: string): string {
  const ogSiteName = extractMetaContent(html, 'site_name');
  if (ogSiteName) return ogSiteName;

  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return '';
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      console.error('No URL provided');
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Unfurling URL: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPreview/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch URL: ${response.status}`);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch URL',
          unfurled: {
            url,
            title: url,
            description: '',
            image: '',
            type: 'website' as const,
            siteName: new URL(url).hostname,
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await response.text();

    const unfurled: UnfurledLink = {
      url,
      title: extractTitle(html) || url,
      description: extractMetaContent(html, 'description') || '',
      image: extractMetaContent(html, 'image') || '',
      type: detectType(url, html),
      siteName: extractSiteName(url, html),
    };

    console.log(`Successfully unfurled: ${unfurled.title}`);

    return new Response(
      JSON.stringify({ unfurled }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error unfurling URL:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
