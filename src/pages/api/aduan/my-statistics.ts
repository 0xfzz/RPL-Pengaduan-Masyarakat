import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@/generated/prisma";
import { onlyFor } from "@/utils/onlyFor";

const prisma = new PrismaClient();

// Helper function to serialize BigInt values
const serializeBigInt = (data: any): any => {
  const dataRaw = JSON.stringify(data, (key, value) =>
    typeof value === "bigint" ? Number(value) : value,
  );
  return JSON.parse(dataRaw);
};

const handler = async (req: any, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check user role and permissions - only masyarakat can access their own stats
  const checked = await onlyFor(["masyarakat"], req);
  if (checked.error != null) {
    return res.status(checked.status).json({ error: checked.error });
  }
  const userId = checked.decoded.id
  try {
    // Get total count of user's complaints
    const totalAduan = await prisma.aduan.count({
      where: {
        id_pelapor: userId
      }
    });

    // Get status distribution for user's complaints
    const statusDistributionRaw = await prisma.aduan.groupBy({
      by: ['status_terkini'],
      where: {
        id_pelapor: userId
      },
      _count: {
        id_aduan: true
      }
    });

    // Format status distribution
    const statusDistribution = statusDistributionRaw.map(item => ({
      status: item.status_terkini,
      count: Number(item._count.id_aduan)
    }));

    // Get recent complaints (last 5)
    const recentAduan = await prisma.aduan.findMany({
      where: {
        id_pelapor: userId
      },
      select: {
        id_aduan: true,
        judul_aduan: true,
        status_terkini: true,
        created_at: true,
        kategori_aduan: true
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 5
    });

    // Get monthly trend for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Start from the first day of the month
    
    const formattedSixMonthsAgo = sixMonthsAgo.toISOString().split('T')[0];

    const monthlyTrendRaw = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM aduan
      WHERE id_pelapor = ${userId}
        AND created_at >= ${formattedSixMonthsAgo}
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `;

    // Convert BigInt to Number and format month names
    const monthlyTrend = serializeBigInt(monthlyTrendRaw).map((item: any) => ({
      month: formatMonthName(item.month),
      count: item.count
    }));

    return res.status(200).json({
      totalAduan,
      statusDistribution,
      recentAduan,
      monthlyTrend
    });

  } catch (error) {
    console.error("Error fetching masyarakat statistics:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Helper function to format month names in Indonesian
const formatMonthName = (monthString: string) => {
  const [year, month] = monthString.split('-');
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  
  const monthIndex = parseInt(month) - 1;
  return `${monthNames[monthIndex]} ${year}`;
};

export default handler;