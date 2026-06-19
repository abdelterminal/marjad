import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '.env.local' });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const categories = [
  { nameEn: 'Lighting', nameFr: 'Lampes', nameAr: 'مصابيح', slug: 'lampes' },
  { nameEn: 'Tables', nameFr: 'Tables', nameAr: 'طاولات', slug: 'tables' },
  { nameEn: 'Wall Art', nameFr: 'Tableaux', nameAr: 'لوحات', slug: 'tableaux' },
  { nameEn: 'Objects', nameFr: 'Objets décoratifs', nameAr: 'تحف ديكور', slug: 'objets' },
  { nameEn: 'Textiles', nameFr: 'Textiles', nameAr: 'منسوجات', slug: 'textiles' },
  { nameEn: 'Furniture', nameFr: 'Mobilier', nameAr: 'أثاث', slug: 'mobilier' },
];

const products = [
  {
    slug: 'lampe-ceramique-safi',
    categorySlug: 'lampes',
    nameFr: 'Lampe en céramique Safi',
    nameAr: 'مصباح خزفي من آسفي',
    descriptionFr:
      'Lampe de table en céramique émaillée, pensée pour une lumière douce dans un salon, une console ou une chambre.',
    descriptionAr:
      'مصباح طاولة من الخزف المطلي، مناسب لإضاءة ناعمة في الصالون أو غرفة النوم.',
    price: '890.00',
    compareAtPrice: '1050.00',
    stock: 8,
    isFeatured: true,
    images: ['/images/products/ceramic-table-lamp.svg'],
  },
  {
    slug: 'table-appoint-tadelakt',
    categorySlug: 'tables',
    nameFr: "Table d'appoint Tadelakt",
    nameAr: 'طاولة جانبية بتادلاكت',
    descriptionFr:
      "Table sculpturale à l'aspect tadelakt, idéale près d'un fauteuil ou en bout de canapé.",
    descriptionAr:
      'طاولة جانبية بطابع تادلاكت، مناسبة بجانب كرسي أو في نهاية أريكة.',
    price: '1450.00',
    compareAtPrice: null,
    stock: 5,
    isFeatured: true,
    images: ['/images/products/tadelakt-side-table.svg'],
  },
  {
    slug: 'tableau-abstrait-atlas',
    categorySlug: 'tableaux',
    nameFr: 'Tableau abstrait Atlas',
    nameAr: 'لوحة أطلس تجريدية',
    descriptionFr:
      'Composition encadrée aux tons terre, bleu profond et doré, pour donner du caractère à un mur calme.',
    descriptionAr:
      'لوحة مؤطرة بألوان ترابية وأزرق عميق ولمسة ذهبية لإضافة طابع لجدار هادئ.',
    price: '690.00',
    compareAtPrice: null,
    stock: 12,
    isFeatured: true,
    images: ['/images/products/abstract-wall-art.svg'],
  },
  {
    slug: 'applique-murale-laiton',
    categorySlug: 'lampes',
    nameFr: 'Applique murale en laiton',
    nameAr: 'مصباح جداري من النحاس',
    descriptionFr:
      'Applique chaleureuse en finition laiton, parfaite pour une entrée, un couloir ou une tête de lit.',
    descriptionAr:
      'مصباح جداري بدفء النحاس، مناسب للمدخل أو الممر أو بجانب السرير.',
    price: '1200.00',
    compareAtPrice: '1380.00',
    stock: 4,
    isFeatured: false,
    images: ['/images/products/brass-wall-sconce.svg'],
  },
  {
    slug: 'plateau-zellige-fes',
    categorySlug: 'objets',
    nameFr: 'Plateau Zellige Fès',
    nameAr: 'صينية زليج فاس',
    descriptionFr:
      'Plateau décoratif inspiré du zellige, pour une table basse, une console ou un rituel café.',
    descriptionAr:
      'صينية ديكور مستوحاة من الزليج، مناسبة لطاولة القهوة أو ركن الضيافة.',
    price: '420.00',
    compareAtPrice: null,
    stock: 18,
    isFeatured: true,
    images: ['/images/products/zellige-tray.svg'],
  },
  {
    slug: 'pouf-laine-tissee',
    categorySlug: 'textiles',
    nameFr: 'Pouf en laine tissée',
    nameAr: 'بوف من الصوف المنسوج',
    descriptionFr:
      'Assise basse en laine tissée, douce et texturée, pour réchauffer un salon minimal.',
    descriptionAr:
      'جلسة منخفضة من الصوف المنسوج، ناعمة وملموسة لإضافة دفء لصالون هادئ.',
    price: '780.00',
    compareAtPrice: '920.00',
    stock: 7,
    isFeatured: false,
    images: ['/images/products/woven-wool-pouf.svg'],
  },
  {
    slug: 'console-noyer-sculptee',
    categorySlug: 'mobilier',
    nameFr: 'Console sculptée en noyer',
    nameAr: 'كونسول منحوت من الجوز',
    descriptionFr:
      'Console en bois de noyer avec détail sculpté discret, pour une entrée ou un salon raffiné.',
    descriptionAr:
      'كونسول من خشب الجوز مع تفصيل منحوت هادئ، مناسب لمدخل أو صالون راق.',
    price: '2900.00',
    compareAtPrice: null,
    stock: 3,
    isFeatured: true,
    images: ['/images/products/walnut-console.svg'],
  },
  {
    slug: 'vase-ceramique-peint-main',
    categorySlug: 'objets',
    nameFr: 'Vase en céramique peint main',
    nameAr: 'مزهرية خزفية مرسومة باليد',
    descriptionFr:
      'Vase décoratif en céramique avec marques peintes à la main, pensé pour rester beau même vide.',
    descriptionAr:
      'مزهرية خزفية بعلامات مرسومة باليد، جميلة حتى بدون زهور.',
    price: '360.00',
    compareAtPrice: null,
    stock: 15,
    isFeatured: false,
    images: ['/images/products/ceramic-vase.svg'],
  },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing. Set it in .env.local before seeding.');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const categoryIds = new Map();
    for (const category of categories) {
      const result = await client.query(
        `
          INSERT INTO categories (name_en, name_fr, name_ar, slug)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (slug) DO UPDATE SET
            name_en = EXCLUDED.name_en,
            name_fr = EXCLUDED.name_fr,
            name_ar = EXCLUDED.name_ar
          RETURNING id
        `,
        [category.nameEn, category.nameFr, category.nameAr, category.slug],
      );
      categoryIds.set(category.slug, result.rows[0].id);
    }

    for (const product of products) {
      const categoryId = categoryIds.get(product.categorySlug);
      await client.query(
        `
          INSERT INTO products (
            name_fr,
            name_ar,
            description_fr,
            description_ar,
            slug,
            price,
            compare_at_price,
            stock,
            category_id,
            images,
            is_published,
            is_featured,
            updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, $11, NOW())
          ON CONFLICT (slug) DO UPDATE SET
            name_fr = EXCLUDED.name_fr,
            name_ar = EXCLUDED.name_ar,
            description_fr = EXCLUDED.description_fr,
            description_ar = EXCLUDED.description_ar,
            price = EXCLUDED.price,
            compare_at_price = EXCLUDED.compare_at_price,
            stock = EXCLUDED.stock,
            category_id = EXCLUDED.category_id,
            images = EXCLUDED.images,
            is_published = true,
            is_featured = EXCLUDED.is_featured,
            updated_at = NOW()
        `,
        [
          product.nameFr,
          product.nameAr,
          product.descriptionFr,
          product.descriptionAr,
          product.slug,
          product.price,
          product.compareAtPrice,
          product.stock,
          categoryId,
          product.images,
          product.isFeatured,
        ],
      );
    }

    await client.query('COMMIT');
    console.log(`Seeded ${categories.length} categories and ${products.length} products.`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
