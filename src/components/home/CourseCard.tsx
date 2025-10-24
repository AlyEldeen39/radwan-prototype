"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import FeaturedBadge from "../ui/FeaturedBadge";
import AuthRequiredModal from "../auth/AuthRequiredModal";
import { Course } from "@/types";
import { CourseWithDetails } from "@/types/course";
import { useAuth } from "@/hooks/useAuth";
import { FaBook, FaCalendar, FaEye, FaUserPlus, FaUsers } from "react-icons/fa";

interface CourseCardProps {
  course: Course | CourseWithDetails;
  onEnroll?: (courseId: string) => void;
  onEnrollClick?: (course: Course | CourseWithDetails) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onEnroll = () => {},
  onEnrollClick,
}) => {
  const { isLoggedIn } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleEnrollClick = () => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }

    if (onEnrollClick) {
      onEnrollClick(course);
    } else {
      onEnroll(course.id);
    }
  };
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price?: number) => {
    if (!price) return "مجاني";
    return `${price} جنيه`;
  };

  const seatsLeft =
    course.capacity && course.enrolled_count
      ? course.capacity - course.enrolled_count
      : 0;

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Course Thumbnail */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.name}
            className="w-full h-full object-cover"
            width={400}
            height={200}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary to-primary-100 flex items-center justify-center">
            <FaBook className="text-white text-4xl" />
          </div>
        )}

        {course.featured && (
          <div className="absolute top-3 right-3">
            <FeaturedBadge size="sm" />
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-semibold text-text-primary font-arabic mb-2 text-right line-clamp-2">
          {course.name}
        </h3>

        {/* Description */}
        <p className="text-text-secondary font-arabic text-sm mb-3 text-right line-clamp-3">
          {course.description}
        </p>

        {/* Tags */}
        {course.tags && course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3 justify-start">
            {course.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="default" className="text-xs">
                {tag}
              </Badge>
            ))}
            {course.tags.length > 3 && (
              <Badge variant="default" className="text-xs">
                +{course.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Course Info */}
        <div className="space-y-2 mb-4 text-right">
          {course.start_date && (
            <div className="text-sm text-text-secondary font-arabic flex items-center justify-start gap-1">
              <FaCalendar className="text-accent" />
              <span>يبدأ: {formatDate(course.start_date)}</span>
            </div>
          )}

          {course.num_lectures && (
            <div className="text-sm text-text-secondary font-arabic flex items-center justify-start gap-1">
              <FaBook className="text-accent" />
              <span>{course.num_lectures} محاضرة</span>
            </div>
          )}

          {course.capacity && (
            <div className="text-sm text-text-secondary font-arabic flex items-center justify-start gap-1">
              <FaUsers className="text-accent" />
              <span>
                الأماكن المتاحة: {seatsLeft} من {course.capacity}
              </span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="text-right mb-4">
          <span className="text-xl font-bold text-primary font-arabic">
            {formatPrice(course.price)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-start">
          <Link href={`/courses/${course.id}`} className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 flex items-center justify-center gap-1 w-full"
            >
              <FaEye />
              <span>عرض الكورس</span>
            </Button>
          </Link>

          <Button
            variant="primary"
            size="sm"
            className="flex-1 flex items-center justify-center gap-1"
            onClick={handleEnrollClick}
            disabled={seatsLeft === 0}
          >
            {seatsLeft !== 0 && <FaUserPlus />}
            <span>{seatsLeft === 0 ? "مكتمل" : "سجل الآن"}</span>
          </Button>
        </div>
      </div>

      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        courseName={course.name}
      />
    </div>
  );
};

export default CourseCard;
