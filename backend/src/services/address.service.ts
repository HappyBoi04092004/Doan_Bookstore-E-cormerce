import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface AddressSuggestion {
  fullAddress: string;
  province: string;
  ward: string;
  provinceCode: number;
  wardCode: number;
}

/**
 * Search for address suggestions by matching ward name.
 */
async function searchAddress(
  q: string,
  limit = 15
): Promise<AddressSuggestion[]> {
  const term = q.trim();
  if (!term) return [];

  const wardResults = await prisma.ward.findMany({
    where: {
      name: { contains: term },
    },
    include: {
      province: true,
    },
    take: limit,
  });

  const suggestions: AddressSuggestion[] = wardResults.map((w) => ({
    fullAddress: `${w.name}, ${w.province.name}`,
    province: w.province.name,
    ward: w.name,
    provinceCode: w.province.code,
    wardCode: w.code,
  }));

  return suggestions.slice(0, limit);
}

export const addressService = { searchAddress };
