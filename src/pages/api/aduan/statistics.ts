import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@/generated/prisma";
import { onlyFor } from "@/utils/onlyFor";

const prisma = new PrismaClient();

// Helper function to serialize BigInt values
const serializeBigInt = (data: any): any => {
  const dataRaw = JSON.stringify(data, (key, value) =>
    typeof value === "bigint" ? Number(value) : value,
  );
  data = JSON.parse(dataRaw);

  return data;
};

const handler = async (req: any, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check user role and permissions
  const checked = await onlyFor(["admin", "petugas"], req);
  if (checked.error != null) {
    return res.status(checked.status).json({ error: checked.error });
  }

  try {
    // Get statistics for the last 7 days
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6); // Get 7 days of data (today + 6 previous days)

    // Format dates to match SQL date format
    const formattedSevenDaysAgo = sevenDaysAgo.toISOString().split('T')[0];

    // Get daily counts
    const dailyCountsRaw = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM aduan
      WHERE created_at >= ${formattedSevenDaysAgo}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
    
    // Convert BigInt to Number
    const dailyCounts = serializeBigInt(dailyCountsRaw);
    ;

    // Get status distribution
    const statusDistribution = await prisma.aduan.groupBy({
      by: ['status_terkini'],
      _count: {
        id_aduan: true
      }
    });

    // Get category distribution
    const categoryDistribution = await prisma.aduan.groupBy({
      by: ['kategori_aduan'],
      _count: {
        id_aduan: true
      }
    });

    // Total count
    const totalAduan = await prisma.aduan.count();

    // Format the response
    const formattedStatusDistribution = statusDistribution.map(item => ({
      status: item.status_terkini,
      count: Number(item._count.id_aduan)  // Convert BigInt to Number
    }));

    const formattedCategoryDistribution = categoryDistribution.map(item => ({
      category: item.kategori_aduan,
      count: Number(item._count.id_aduan)  // Convert BigInt to Number
    }));

    return res.status(200).json({
      dailyCounts,
      statusDistribution: formattedStatusDistribution,
      categoryDistribution: formattedCategoryDistribution,
      totalAduan
    });
  } catch (error) {
    console.error("Error fetching aduan statistics:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default handler;