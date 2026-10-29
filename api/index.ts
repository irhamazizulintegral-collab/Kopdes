import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Initialize Gemini client (picks up GEMINI_API_KEY from env)
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'Velvet Store Express Backend',
    hasGeminiKey: Boolean(apiKey),
    timestamp: new Date().toISOString()
  });
});

// Admin credentials authentication verification
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (username === 'velvetshadow' && password === 'irham08062006') {
    return res.json({
      success: true,
      user: {
        uid: 'admin_velvetshadow',
        username: 'velvetshadow',
        name: 'Velvet Shadow (Super Admin)',
        email: 'velvetshadow@admin.store',
        role: 'admin',
        isAdmin: true
      },
      message: 'Autentikasi admin berhasil'
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Username atau password admin salah. Gunakan username: velvetshadow & password: irham08062006'
  });
});

// AI Product Description Generator
app.post('/api/ai/generate-description', async (req: Request, res: Response) => {
  try {
    const { productName, category, keyFeatures, tone = 'profesional & menarik' } = req.body;

    if (!productName) {
      return res.status(400).json({ error: 'Nama produk wajib diisi' });
    }

    if (!ai) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi di lingkungan server.'
      });
    }

    const prompt = `Anda adalah copywriter e-commerce profesional untuk Toko Online modern di Indonesia.
Buatkan deskripsi produk yang sangat menarik, persuasif, dan SEO-friendly dalam Bahasa Indonesia untuk produk berikut:

- Nama Produk: ${productName}
- Kategori: ${category || 'Umum'}
- Fitur / Detail: ${keyFeatures || '-'}
- Gaya Bahasa / Tone: ${tone}

Format output dalam JSON terstruktur dengan format berikut (jangan sertakan markdown code block di luar JSON):
{
  "shortPitch": "Satu kalimat slogan / tagline yang memikat",
  "fullDescription": "Paragraf deskripsi produk lengkap yang menggugah selera pembeli",
  "highlights": ["Keunggulan 1", "Keunggulan 2", "Keunggulan 3", "Keunggulan 4"],
  "specsSuggestion": ["Spesifikasi / bahan / ukuran 1", "Spesifikasi 2"],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch {
      parsedData = {
        shortPitch: `Pilihan terbaik untuk ${productName}`,
        fullDescription: text,
        highlights: ['Kualitas premium', 'Bergaransi resmi', 'Pengiriman cepat'],
        specsSuggestion: ['Material berkualitas tinggi'],
        tags: [category || 'toko-online', 'produk-terbaru']
      };
    }

    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error generating product description with Gemini:', error);
    return res.status(500).json({
      error: 'Gagal membuat deskripsi produk dengan AI',
      details: error.message
    });
  }
});

// AI Store Performance Insights & Recommendations
app.post('/api/ai/store-insights', async (req: Request, res: Response) => {
  try {
    const { totalRevenue, totalOrders, totalProducts, lowStockCount, topCategories, pendingOrders } = req.body;

    if (!ai) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi di server'
      });
    }

    const prompt = `Anda adalah Business Analyst & E-commerce Consultant untuk toko online.
Berdasarkan data performa toko berikut:
- Total Pendapatan: Rp ${Number(totalRevenue || 0).toLocaleString('id-ID')}
- Total Pesanan: ${totalOrders || 0}
- Total Produk di Katalog: ${totalProducts || 0}
- Produk Stok Rendah: ${lowStockCount || 0}
- Pesanan Menunggu Diproses: ${pendingOrders || 0}
- Kategori Utama: ${(topCategories || []).join(', ') || 'Semua'}

Berikan analisis singkat dan 4 rekomendasi taktis spesifik untuk meningkatkan penjualan dan efisiensi toko.
Kembalikan dalam JSON:
{
  "summary": "Ringkasan performa toko dalam 2-3 kalimat tajam",
  "statusScore": "Skor kesehatan toko (misal 'Sangat Baik', 'Optimal', 'Perlu Optimasi')",
  "urgentActions": ["Aksi mendesak 1", "Aksi mendesak 2"],
  "recommendations": [
    {
      "title": "Judul rekomendasi",
      "impact": "Tinggi / Sedang",
      "description": "Langkah konkret yang harus dilakukan admin"
    }
  ],
  "marketingIdea": "Ide promo / campaign kreatif minggu ini"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error analyzing store performance:', error);
    return res.status(500).json({
      error: 'Gagal menghasilkan insight AI toko',
      details: error.message
    });
  }
});

// AI Customer Response Assistant
app.post('/api/ai/customer-reply', async (req: Request, res: Response) => {
  try {
    const { customerName, message, tone = 'ramah & solutif', orderContext } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Pesan pelanggan wajib diisi' });
    }

    if (!ai) {
      return res.status(500).json({ error: 'GEMINI_API_KEY belum dikonfigurasi' });
    }

    const prompt = `Anda adalah Admin Customer Care toko online Indonesia yang sangat sopan, ramah, dan solutif.
Balas pesan pelanggan ini:
- Nama Pelanggan: ${customerName || 'Pelanggan'}
- Pesan/Keluhan Pelanggan: "${message}"
- Konteks Pesanan: ${orderContext || 'Tidak ada info khusus'}
- Nada Balasan: ${tone}

Berikan balasan resmi siap kirim dalam JSON:
{
  "reply": "Teks balasan lengkap siap kirim ke WhatsApp / Chat pelanggan",
  "suggestedNextStep": "Catatan singkat untuk admin internal"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error generating customer reply:', error);
    return res.status(500).json({
      error: 'Gagal membuat balasan pelanggan',
      details: error.message
    });
  }
});

export default app;
