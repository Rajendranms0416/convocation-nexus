
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckSquare, FileText, Award } from 'lucide-react';
import { useStudents } from '@/contexts/StudentContext';

const StatsCards: React.FC = () => {
  const { students, isLoading } = useStudents();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-24 bg-convocation-100 rounded"></div>
              </CardTitle>
              <div className="h-8 w-8 rounded-full bg-convocation-100"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-convocation-100 rounded mb-2"></div>
              <div className="h-3 w-32 bg-convocation-100 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalStudents = students.length;
  const presentStudents = students.filter(s => s.attendance).length;
  const robesTaken = students.filter(s => s.hasTakenRobe).length;
  const foldersTaken = students.filter(s => s.hasTakenFolder).length;
  const presented = students.filter(s => s.hasBeenPresented).length;

  const stats = [
    {
      title: "Total Students",
      value: totalStudents,
      icon: <Users className="h-4 w-4" />,
      subtitle: `${presentStudents} present (${Math.round((presentStudents / totalStudents) * 100)}%)`,
      color: "bg-convocation-accent text-white",
    },
    {
      title: "Robes Collected",
      value: robesTaken,
      icon: <Award className="h-4 w-4" />,
      subtitle: `${Math.round((robesTaken / totalStudents) * 100)}% of total students`,
      color: "bg-convocation-success text-white",
    },
    {
      title: "Folders Collected",
      value: foldersTaken,
      icon: <FileText className="h-4 w-4" />,
      subtitle: `${Math.round((foldersTaken / totalStudents) * 100)}% of total students`,
      color: "bg-convocation-warning text-white",
    },
    {
      title: "Students Presented",
      value: presented,
      icon: <CheckSquare className="h-4 w-4" />,
      subtitle: `${Math.round((presented / totalStudents) * 100)}% of total students`,
      color: "bg-convocation-error text-white",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="overflow-hidden hover-scale border-convocation-100">
          <CardHeader className={`flex flex-row items-center justify-between pb-2 ${stat.color}`}>
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <div className="rounded-full p-2 bg-white/20">
              {stat.icon}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
