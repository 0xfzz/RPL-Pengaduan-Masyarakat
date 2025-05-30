"use client";

import { useState, useEffect } from "react";
import SidebarDashboard from "@/components/SidebarDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import axiosInstance from "@/utils/axiosConfig";
import { useAuthStore } from "@/store/authStore";
import Navbar from "@/components/Navbar";

interface DailyCount {
  date: string;
  count: number;
}

interface StatusDistribution {
  status: string;
  count: number;
}

interface CategoryDistribution {
  category: string;
  count: number;
}

interface Statistics {
  dailyCounts: DailyCount[];
  statusDistribution: StatusDistribution[];
  categoryDistribution: CategoryDistribution[];
  totalAduan: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const DashboardHome = () => {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const { getUser } = useAuthStore();
  const user = getUser();

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response: any = await axiosInstance.get("/api/aduan/statistics");
        setStatistics(response.data);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <SidebarDashboard />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex-1 p-6 flex items-center justify-center">
            <p>Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarDashboard />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 p-6">
          <h1 className="text-3xl font-bold text-blue-800 mb-6">Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Pengaduan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{statistics?.totalAduan || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Pengaduan Diajukan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {statistics?.statusDistribution.find(s => s.status === 'Diajukan')?.count || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Pengaduan Diproses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {statistics?.statusDistribution.find(s => s.status === 'Diproses')?.count || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Pengaduan Selesai</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {statistics?.statusDistribution.find(s => s.status === 'Selesai')?.count || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Pengaduan per Hari (7 Hari Terakhir)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={statistics?.dailyCounts.map(item => ({
                        ...item,
                        date: formatDate(item.date)
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Jumlah Pengaduan" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribusi Status Pengaduan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statistics?.statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="status"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {statistics?.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribusi Kategori Pengaduan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statistics?.categoryDistribution}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="category" type="category" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Jumlah Pengaduan" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;