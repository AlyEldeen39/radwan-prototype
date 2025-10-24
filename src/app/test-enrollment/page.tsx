"use client";

import React from "react";
import { CourseEnrollmentManager } from "@/components/enrollment";
import { CourseWithDetails } from "@/types/course";

// Sample course data for testing
const sampleCourse: CourseWithDetails = {
  id: "1",
  name: "تحفيظ القرآن الكريم",
  description:
    "كورس شامل لتعلم تلاوة وحفظ القرآن الكريم مع أحكام التجويد الأساسية",
  season_id: "winter-2024",
  start_date: "2024-01-15",
  end_date: "2024-06-15",
  num_lectures: 30,
  capacity: 25,
  price: 250,
  instructor_id: "1",
  tags: ["قرآن", "تجويد", "حفظ"],
  featured: true,
  is_active: true,
  enrolled_count: 18,
  thumbnail:
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  instructor_name: "أستاذ محمد أحمد",
  rating: 4.9,
  reviews: [],
  duration: "5 أشهر",
  category: "قرآن",
};

interface TestEnrollmentProps {
  onEnrollClick?: (course: CourseWithDetails) => void;
}

const TestEnrollment: React.FC<TestEnrollmentProps> = ({ onEnrollClick }) => {
  const handleTestEnroll = () => {
    if (onEnrollClick) {
      onEnrollClick(sampleCourse);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          اختبار نظام التسجيل
        </h1>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">{sampleCourse.name}</h2>
          <p className="text-gray-600 mb-4">{sampleCourse.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <span className="font-medium">المدرس:</span>{" "}
              {sampleCourse.instructor_name}
            </div>
            <div>
              <span className="font-medium">السعر:</span> {sampleCourse.price}{" "}
              ج.م
            </div>
            <div>
              <span className="font-medium">المدة:</span>{" "}
              {sampleCourse.duration}
            </div>
            <div>
              <span className="font-medium">الأماكن المتبقية:</span>{" "}
              {sampleCourse.capacity - sampleCourse.enrolled_count}
            </div>
          </div>

          <button
            onClick={handleTestEnroll}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            اختبار التسجيل
          </button>
        </div>
      </div>
    </div>
  );
};

const TestEnrollmentPage: React.FC = () => {
  return (
    <CourseEnrollmentManager>
      <TestEnrollment />
    </CourseEnrollmentManager>
  );
};

export default TestEnrollmentPage;
