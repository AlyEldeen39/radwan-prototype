"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/common/Container";
import InstructorOverview from "@/components/dashboard/InstructorOverview";
import InstructorCoursesList from "@/components/dashboard/InstructorCoursesList";
import InstructorAttendancePanel from "@/components/dashboard/InstructorAttendancePanel";
import { InstructorDashboardData, Lecture } from "@/types";
import { dashboardApi } from "@/api/dashboard";
import { FiBarChart, FiTrendingUp } from "react-icons/fi";
import Card from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";

const InstructorDashboardPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: authLoading, isLoggedIn } = useAuth();
  const [dashboardData, setDashboardData] =
    useState<InstructorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | undefined>();
  const [showAttendancePanel, setShowAttendancePanel] = useState(false);

  useEffect(() => {
    // Wait for auth to load before checking
    if (authLoading) return;

    // Redirect if not logged in or wrong role
    if (!isLoggedIn || !user) {
      router.push("/instructor/login");
      return;
    }

    if (user.role !== "instructor") {
      router.push(`/dashboard/${user.role}`);
      return;
    }

    const loadDashboard = async () => {
      try {
        // Get instructor ID from user data
        const instructorId = user.id || "ins1";

        const data = await dashboardApi.getInstructorDashboard(instructorId);
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [authLoading, isLoggedIn, user, router]);

  const handleTakeAttendance = (lecture: Lecture) => {
    setSelectedLecture(lecture);
    setShowAttendancePanel(true);
  };

  const closeAttendancePanel = () => {
    setShowAttendancePanel(false);
    setSelectedLecture(undefined);
  };

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحقق من الهوية...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not logged in (redirect is happening)
  if (!isLoggedIn || !user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">حدث خطأ في تحميل البيانات</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-20 pb-12">
        <Container>
          <div className="space-y-8">
            {/* Instructor Overview */}
            <InstructorOverview
              instructor={dashboardData.instructor}
              stats={dashboardData.stats}
            />

            {/* Attendance Trend Chart */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  إحصائيات الحضور
                </h3>
                <FiBarChart className="w-5 h-5 text-emerald-600" />
              </div>

              {/* Mock Chart */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {[85, 92, 78, 88, 95, 82, 90].map((value, index) => (
                  <div key={index} className="text-center">
                    <div className="h-24 bg-gray-100 rounded-lg mb-2 flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-lg transition-all duration-500"
                        style={{ height: `${value}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600">
                      {
                        [
                          "السبت",
                          "الأحد",
                          "الاثنين",
                          "الثلاثاء",
                          "الأربعاء",
                          "الخميس",
                          "الجمعة",
                        ][index]
                      }
                    </p>
                    <p className="text-xs font-medium text-gray-900">
                      {value}%
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-green-600">
                  <FiTrendingUp className="w-4 h-4 ml-1" />
                  <span>زيادة 5% عن الأسبوع الماضي</span>
                </div>
                <span className="text-gray-500">متوسط الحضور الأسبوعي</span>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Courses List */}
              <div className="lg:col-span-2">
                {showAttendancePanel ? (
                  <InstructorAttendancePanel
                    selectedLecture={selectedLecture}
                    attendances={dashboardData.attendances}
                    onClose={closeAttendancePanel}
                  />
                ) : (
                  <InstructorCoursesList
                    courses={dashboardData.courses}
                    lectures={dashboardData.lectures}
                  />
                )}
              </div>

              {/* Upcoming Lectures */}
              <div className="lg:col-span-1">
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    المحاضرات القادمة
                  </h3>

                  <div className="space-y-3">
                    {dashboardData.upcomingLectures
                      .slice(0, 5)
                      .map((lecture) => (
                        <div
                          key={lecture.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {lecture.course?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              محاضرة رقم {lecture.lecture_number}
                            </p>
                            <p className="text-xs text-gray-600">
                              {new Date(
                                lecture.scheduled_at,
                              ).toLocaleDateString("ar-SA")}{" "}
                              {new Date(
                                lecture.scheduled_at,
                              ).toLocaleTimeString("ar-SA", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>

                          <button
                            onClick={() => handleTakeAttendance(lecture)}
                            className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium hover:bg-emerald-200 transition-colors"
                          >
                            تسجيل الحضور
                          </button>
                        </div>
                      ))}

                    {dashboardData.upcomingLectures.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-500 text-sm">
                          لا توجد محاضرات قادمة
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
};

export default InstructorDashboardPage;
