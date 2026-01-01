import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardAnalyticsProps {
  students: any[];
  payments: any[];
  courses: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({ students, payments, courses }) => {

  // Process Revenue Data (Last 7 Days or Months)
  const revenueData = useMemo(() => {
    const data: { [key: string]: number } = {};
    payments.forEach(payment => {
      if (payment.payment_status === 'Completed' || payment.payment_status === 'Success') { // Adjust based on actual status
        const date = new Date(payment.createdAt).toLocaleDateString();
        data[date] = (data[date] || 0) + payment.amount;
      }
    });
    return Object.keys(data).map(date => ({ date, amount: data[date] })).slice(-7); // Last 7 entries
  }, [payments]);

  // Process Student Growth (Cumulative or Daily)
  const studentGrowthData = useMemo(() => {
    const data: { [key: string]: number } = {};
    students.forEach(student => {
      const date = new Date(student.createdAt).toLocaleDateString();
      data[date] = (data[date] || 0) + 1;
    });
    // Sort by date
    return Object.keys(data).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map(date => ({ date, students: data[date] })).slice(-10);
  }, [students]);

  // Process Course Categories
  const categoryData = useMemo(() => {
    const data: { [key: string]: number } = {};
    courses.forEach(course => {
      const cat = course.category || 'Uncategorized';
      data[cat] = (data[cat] || 0) + 1;
    });
    return Object.keys(data).map(name => ({ name, value: data[name] }));
  }, [courses]);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-xl shadow-blue-900/5 border border-white/20">
          <h3 className="text-xl font-bold mb-6 text-gray-800">Revenue Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" fill="#2dd4bf" barSize={30} radius={[4, 4, 0, 0]} name="Revenue (LKR)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student Growth Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-xl shadow-blue-900/5 border border-white/20">
          <h3 className="text-xl font-bold mb-6 text-gray-800">New Student Registrations</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={studentGrowthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} name="New Students" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Course Categories */}
      <div className="bg-white p-6 rounded-3xl shadow-xl shadow-blue-900/5 border border-white/20">
        <h3 className="text-xl font-bold mb-6 text-gray-800">Course Distribution by Category</h3>
        <div className="h-80 w-full flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardAnalytics;
