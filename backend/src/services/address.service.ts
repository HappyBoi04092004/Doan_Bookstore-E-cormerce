import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface AddressSuggestion {
  fullAddress: string;
  province: string;
  district: string;
  ward: string;
  provinceCode: number;
  districtCode: number;
  wardCode: number;
}

/**
 * Search for address suggestions by matching ward, district, or province name.
 * Returns up to `limit` results ordered: ward matches first, then district, then province.
 */
async function searchAddress(
  q: string,
  limit = 15
): Promise<AddressSuggestion[]> {
  const term = q.trim();
  if (!term) return [];

  // Search wards by name — join district + province via include
  const wardResults = await prisma.ward.findMany({
    where: {
      name: { contains: term },
    },
    include: {
      district: {
        include: { province: true },
      },
    },
    take: limit,
  });

  const suggestions: AddressSuggestion[] = wardResults.map((w) => ({
    fullAddress: `${w.name}, ${w.district.name}, ${w.district.province.name}`,
    province: w.district.province.name,
    district: w.district.name,
    ward: w.name,
    provinceCode: w.district.province.code,
    districtCode: w.district.code,
    wardCode: w.code,
  }));

  // NOTE: We only return WARD results because creating an Address on the backend requires a wardCode.
  // We removed the district/province fallbacks since they lack a wardCode.

  return suggestions.slice(0, limit);
}

export const addressService = { searchAddress };
