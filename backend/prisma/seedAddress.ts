import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const API_URL = "https://provinces.open-api.vn/api/?depth=3";

// ─── API Types ────────────────────────────────────────────────────────────────

interface ApiWard {
  code: number;
  name: string;
}

interface ApiDistrict {
  code: number;
  name: string;
  wards: ApiWard[];
}

interface ApiProvince {
  code: number;
  name: string;
  districts: ApiDistrict[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(" Starting Vietnam address seed...");

  // Skip if already seeded
  const existingCount = await prisma.province.count();
  if (existingCount > 0) {
    console.log(` Already seeded (${existingCount} provinces found). Skipping.`);
    return;
  }

  // 1. Fetch all data at depth=3 (provinces → districts → wards)
  console.log(" Fetching from provinces.open-api.vn...");
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`API fetch failed: ${response.status} ${response.statusText}`);
  }
  const provinces: ApiProvince[] = await response.json();
  console.log(`   → ${provinces.length} provinces received`);

  // ── 2. Seed Provinces ──────────────────────────────────────────────────────
  console.log(" Seeding provinces...");
  const provinceChunks = chunk(provinces, 100);
  for (const batch of provinceChunks) {
    await prisma.province.createMany({
      data: batch.map((p) => ({ code: p.code, name: p.name })),
      skipDuplicates: true,
    });
  }
  console.log(`    ${provinces.length} provinces seeded`);

  // ── 3. Collect and seed Districts ──────────────────────────────────────────
  console.log(" Seeding districts...");
  const allDistricts: { code: number; name: string; provinceCode: number }[] = [];
  for (const province of provinces) {
    for (const district of province.districts) {
      allDistricts.push({
        code: district.code,
        name: district.name,
        provinceCode: province.code,
      });
    }
  }

  const districtChunks = chunk(allDistricts, 500);
  for (const batch of districtChunks) {
    await prisma.district.createMany({
      data: batch,
      skipDuplicates: true,
    });
  }
  console.log(`   ✔ ${allDistricts.length} districts seeded`);

  // ── 4. Collect and seed Wards ──────────────────────────────────────────────
  console.log(" Seeding wards...");
  const allWards: { code: number; name: string; districtCode: number }[] = [];
  for (const province of provinces) {
    for (const district of province.districts) {
      for (const ward of district.wards) {
        allWards.push({
          code: ward.code,
          name: ward.name,
          districtCode: district.code,
        });
      }
    }
  }

  let wardCount = 0;
  const wardChunks = chunk(allWards, 1000);
  for (let i = 0; i < wardChunks.length; i++) {
    const result = await prisma.ward.createMany({
      data: wardChunks[i],
      skipDuplicates: true,
    });
    wardCount += result.count;
    process.stdout.write(
      `\r   Batch ${i + 1}/${wardChunks.length} — ${wardCount} wards inserted...`
    );
  }
  console.log(`\n    ${wardCount} wards seeded`);

  console.log("\n Address seed complete!");
}

main()
  .catch((e) => {
    console.error("\n Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
