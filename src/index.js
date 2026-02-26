export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname === '/track') {
      const visitorData = {
        timestamp: new Date().toISOString(),
        country: request.cf?.country,
        city: request.cf?.city,
        userAgent: request.headers.get('User-Agent'),
        referer: request.headers.get('Referer'),
        blogUrl: request.headers.get('Origin') || 'unknown'
      };
      
      await env.ANALYTICS.writeDataPoint({
        blobs: [
          visitorData.blogUrl,
          visitorData.country,
          visitorData.city,
          visitorData.page
        ],
        doubles: [1],
        indexes: [visitorData.timestamp]
      });
      
      // 1x1 transparent pixel return
      const pixel = new Uint8Array([
        0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00,
        0x80, 0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x2c,
        0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02,
        0x02, 0x44, 0x01, 0x00, 0x3b
      ]);
      
      return new Response(pixel, {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    }
    
    return new Response('Not Found', { status: 404 });
  }
}
