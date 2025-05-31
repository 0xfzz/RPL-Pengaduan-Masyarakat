"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import axiosInstance from "@/utils/axiosConfig";
import { FaClipboardList, FaClock, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from "react-icons/fa";

interface MasyarakatStatistics {
  totalAduan: number;
  statusDistribution: Array<{
    status: string;
    count: number;
  }>;
  recentAduan: Array<{
    id_aduan: number;
    judul_aduan: string;
    status_terkini: string;
    created_at: string;
    kategori_aduan: string;
  }>;
  monthlyTrend: Array<{
    month: string;
    count: number;
  }>;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'];

const MasyarakatDashboard = () => {
  const [statistics, setStatistics] = useState<MasyarakatStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response: any = await axiosInstance.get("/api/aduan/my-statistics");
        setStatistics(response.data);
      } catch (error) {
        console.error("Error fetching masyarakat statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  // Get status info for styling
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "Diajukan":
        return { color: "text-gray-600", bgColor: "bg-gray-100", icon: FaClock };
      case "Diverifikasi":
        return { color: "text-blue-600", bgColor: "bg-blue-100", icon: FaClipboardList };
      case "Diproses":
        return { color: "text-yellow-600", bgColor: "bg-yellow-100", icon: FaClock };
      case "Ditindaklanjuti":
        return { color: "text-purple-600", bgColor: "bg-purple-100", icon: FaExclamationTriangle };
      case "Selesai":
        return { color: "text-green-600", bgColor: "bg-green-100", icon: FaCheckCircle };
      case "Ditolak":
        return { color: "text-red-600", bgColor: "bg-red-100", icon: FaTimesCircle };
      default:
        return { color: "text-gray-600", bgColor: "bg-gray-100", icon: FaClipboardList };
    }
  };

  // Format category name
  const formatKategori = (kategori: string) => {
    if (!kategori) return "Lainnya";
    return kategori
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data pengaduan Anda...</p>
        </div>
      </div>
    );
  }

  const ongoingCount = statistics?.statusDistribution
    .filter(s => ['Diajukan', 'Diverifikasi', 'Diproses', 'Ditindaklanjuti'].includes(s.status))
    .reduce((sum, s) => sum + s.count, 0) || 0;

  const completedCount = statistics?.statusDistribution.find(s => s.status === 'Selesai')?.count || 0;
  const rejectedCount = statistics?.statusDistribution.find(s => s.status === 'Ditolak')?.count || 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <FaClipboardList className="text-blue-600" />
              Total Pengaduan Saya
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {statistics?.totalAduan || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Semua pengaduan yang pernah diajukan
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <FaClock className="text-yellow-600" />
              Sedang Diproses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {ongoingCount}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Pengaduan dalam tahap penyelesaian
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <FaCheckCircle className="text-green-600" />
              Selesai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {completedCount}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Pengaduan yang telah diselesaikan
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <FaTimesCircle className="text-red-600" />
              Ditolak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {rejectedCount}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Pengaduan yang tidak dapat diproses
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Status Pengaduan Saya
            </CardTitle>
            <p className="text-sm text-gray-600">Distribusi status dari semua pengaduan Anda</p>
          </CardHeader>
          <CardContent>
            {statistics?.statusDistribution && statistics.statusDistribution.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statistics.statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="status"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statistics.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FaClipboardList className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>Belum ada data untuk ditampilkan</p>
                  <p className="text-sm">Ajukan pengaduan pertama Anda!</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Complaints */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Pengaduan Terbaru
            </CardTitle>
            <p className="text-sm text-gray-600">5 pengaduan terakhir yang Anda ajukan</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {statistics?.recentAduan && statistics.recentAduan.length > 0 ? (
                statistics.recentAduan.map((aduan) => {
                  const statusInfo = getStatusInfo(aduan.status_terkini);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <div key={aduan.id_aduan} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`p-2 rounded-full ${statusInfo.bgColor}`}>
                        <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {aduan.judul_aduan}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {formatKategori(aduan.kategori_aduan)}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.color} font-medium`}>
                            {aduan.status_terkini}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(aduan.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaClipboardList className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p className="font-medium">Belum ada pengaduan</p>
                  <p className="text-sm">Silakan ajukan pengaduan pertama Anda</p>
                  <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Buat Pengaduan
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      {statistics?.monthlyTrend && statistics.monthlyTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Tren Pengaduan Bulanan
            </CardTitle>
            <p className="text-sm text-gray-600">Jumlah pengaduan yang Anda ajukan per bulan</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statistics.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" name="Jumlah Pengaduan" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MasyarakatDashboard;