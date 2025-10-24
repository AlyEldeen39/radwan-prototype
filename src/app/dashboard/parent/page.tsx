"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/common/Container";
import ParentOverview from "@/components/dashboard/ParentOverview";
import ParentChildrenList from "@/components/dashboard/ParentChildrenList";
import { ParentDashboardData } from "@/types";
import { dashboardApi } from "@/api/dashboard";
import { FiCheckCircle, FiClock, FiDollarSign, FiX } from "react-icons/fi";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

const ParentDashboardPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: authLoading, isLoggedIn } = useAuth();
  const [dashboardData, setDashboardData] =
    useState<ParentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to load before checking
    if (authLoading) return;

    // Redirect if not logged in or wrong role
    if (!isLoggedIn || !user) {
      router.push("/login");
      return;
    }

    if (user.role !== "parent") {
      router.push(`/dashboard/${user.role}`);
      return;
    }

    const loadDashboard = async () => {
      try {
        // Get parent ID from user data
        const parentId = user.id || "p1";

        const data = await dashboardApi.getParentDashboard(parentId);
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [authLoading, isLoggedIn, user, router]);

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="success">مدفوع</Badge>;
      case "pending":
        return <Badge variant="default">في الانتظار</Badge>;
      case "refunded":
        return <Badge variant="error">مُسترد</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getPendingStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="default">في الانتظار</Badge>;
      case "accepted":
        return <Badge variant="success">مقبول</Badge>;
      case "cancelled":
        return <Badge variant="error">ملغي</Badge>;
      case "expired":
        return <Badge variant="error">منتهي الصلاحية</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
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
            {/* Parent Overview */}
            <ParentOverview
              parent={dashboardData.parent}
              stats={dashboardData.stats}
              childrenCount={dashboardData.children.length}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Children List */}
              <div className="lg:col-span-2">
                <ParentChildrenList
                  childrenList={dashboardData.children}
                  enrollments={dashboardData.enrollments}
                />
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Pending Enrollments */}
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      طلبات التسجيل
                    </h3>
                    <FiClock className="w-5 h-5 text-emerald-600" />
                  </div>

                  <div className="space-y-3">
                    {dashboardData.pendingEnrollments.length > 0 ? (
                      dashboardData.pendingEnrollments.map((pending) => (
                        <div
                          key={pending.id}
                          className="p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {pending.course?.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {pending.child?.first_name}{" "}
                                {pending.child?.last_name}
                              </p>
                            </div>
                            {getPendingStatusBadge(pending.status || "pending")}
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">
                              {pending.price} ج.م
                            </span>
                            <div className="flex space-x-2 space-x-reverse">
                              <Button size="sm" variant="primary">
                                <FiCheckCircle className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <FiX className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 text-sm">
                          لا توجد طلبات تسجيل معلقة
                        </p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Recent Payments */}
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      آخر المدفوعات
                    </h3>
                    <FiDollarSign className="w-5 h-5 text-emerald-600" />
                  </div>

                  <div className="space-y-3">
                    {dashboardData.payments.slice(0, 5).map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {payment.amount.toLocaleString()} ج.م
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(
                              payment.payment_date || "",
                            ).toLocaleDateString("ar-SA")}
                          </p>
                          <p className="text-xs text-gray-600">
                            {payment.method === "cash"
                              ? "نقداً"
                              : payment.method === "bank_transfer"
                                ? "تحويل بنكي"
                                : payment.method === "instapay"
                                  ? "إنستاباي"
                                  : payment.method}
                          </p>
                        </div>
                        {getPaymentStatusBadge(payment.status || "pending")}
                      </div>
                    ))}

                    {dashboardData.payments.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-500 text-sm">لا توجد مدفوعات</p>
                      </div>
                    )}
                  </div>

                  {dashboardData.payments.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors">
                        عرض جميع المدفوعات ←
                      </button>
                    </div>
                  )}
                </Card>

                {/* Payment Summary */}
                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    ملخص المدفوعات
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">إجمالي المدفوعات</span>
                      <span className="font-semibold text-gray-900">
                        {(
                          dashboardData.stats.totalPayments || 0
                        ).toLocaleString()}{" "}
                        ج.م
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">عدد الدورات النشطة</span>
                      <span className="font-semibold text-gray-900">
                        {dashboardData.stats.activeCourses}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">طلبات في الانتظار</span>
                      <span className="font-semibold text-gray-900">
                        {dashboardData.stats.pendingEnrollments || 0}
                      </span>
                    </div>
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

export default ParentDashboardPage;
