import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const API_URL =
  "https://raw.githubusercontent.com/thanglequoc/vietnamese-provinces-database/master/json/vn_only_simplified_json_generated_data_vn_units.json";

interface ApiWard {
  Code: string;
  FullName: string;
  ProvinceCode: string;
}

interface ApiProvince {
  Code: string;
  FullName: string;
  Wards: ApiWard[];
}

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function toCode(value: string): number {
  return Number(value);
}

async function main() {
  console.log("Starting Vietnam 34-province address seed...");
  console.log("Fetching 34-province dataset from GitHub...");

  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`Address dataset fetch failed: ${response.status} ${response.statusText}`);
  }

  const provinces: ApiProvince[] = await response.json();
  const wards = provinces.flatMap((province) => province.Wards ?? []);

  if (provinces.length !== 34) {
    throw new Error(`Expected 34 provinces, received ${provinces.length}`);
  }
  if (wards.length < 3000) {
    throw new Error(`Expected the merged ward dataset, received only ${wards.length} wards`);
  }

  console.log(`Received ${provinces.length} provinces and ${wards.length} wards`);
  console.log("Clearing old address data...");

  await prisma.address.deleteMany();
  await prisma.ward.deleteMany();
  await prisma.province.deleteMany();

  console.log("Seeding provinces...");
  for (const batch of chunk(provinces, 100)) {
    await prisma.province.createMany({
      data: batch.map((province) => ({
        code: toCode(province.Code),
        name: province.FullName,
      })),
      skipDuplicates: true,
    });
  }

  console.log("Seeding wards...");
  const wardRows = provinces.flatMap((province) => {
    const provinceCode = toCode(province.Code);
    return province.Wards.map((ward) => ({
      code: toCode(ward.Code),
      name: ward.FullName,
      provinceCode,
    }));
  });

  for (const batch of chunk(wardRows, 500)) {
    await prisma.ward.createMany({
      data: batch,
      skipDuplicates: true,
    });
  }

  console.log(`Seeded ${provinces.length} provinces and ${wardRows.length} wards`);
}

main()
  .catch((error) => {
    console.error("Address seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
