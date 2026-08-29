import { PrismaClient } from "@prisma/client";
import sharp from "sharp";

const prisma = new PrismaClient();

async function main() {
  console.log("🎨 Starting artwork thumbnail optimization and migration...");

  const artworks = await prisma.artwork.findMany();
  console.log(`Found ${artworks.length} artworks to process.`);

  let updatedCount = 0;

  for (const artwork of artworks) {
    // If thumbnail already exists and is small (< 100KB), skip
    if (artwork.thumbnailUrl && artwork.thumbnailUrl.length < 120000 && artwork.thumbnailUrl.length > 10) {
      console.log(`✓ [Skip] "${artwork.title}" already has an optimized thumbnail.`);
      continue;
    }

    if (!artwork.imageUrl) {
      console.log(`- [Skip] "${artwork.title}" has no image.`);
      continue;
    }

    try {
      let thumbDataUrl = "";

      if (artwork.imageUrl.startsWith("data:")) {
        const parts = artwork.imageUrl.split(",");
        const base64Data = parts[1];
        const buffer = Buffer.from(base64Data, "base64");

        try {
          const resized = await sharp(buffer)
            .resize(480, 480, { fit: "inside", withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();

          thumbDataUrl = `data:image/webp;base64,${resized.toString("base64")}`;
          console.log(`  Resized buffer: ${(buffer.length / 1024).toFixed(1)} KB -> ${(resized.length / 1024).toFixed(1)} KB`);
        } catch (sharpErr) {
          // If decoding failed but image is already < 300KB, use as is
          if (buffer.length < 300 * 1024) {
            thumbDataUrl = artwork.imageUrl;
            console.log(`  Using original as thumbnail (${(buffer.length / 1024).toFixed(1)} KB)`);
          } else {
            console.warn(`  Could not resize "${artwork.title}":`, sharpErr.message);
            continue;
          }
        }
      } else {
        // If it's a URL, keep it or use as is
        thumbDataUrl = artwork.imageUrl;
      }

      if (thumbDataUrl) {
        await prisma.artwork.update({
          where: { id: artwork.id },
          data: { thumbnailUrl: thumbDataUrl },
        });
        console.log(`✅ [Updated] "${artwork.title}" thumbnail saved.`);
        updatedCount++;
      }
    } catch (err) {
      console.error(`❌ Error updating "${artwork.title}":`, err);
    }
  }

  console.log(`\n🎉 Completed! Updated ${updatedCount} artwork thumbnails.`);
}

main()
  .catch((e) => {
    console.error("Migration error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
