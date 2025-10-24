"use client";

import React, { useState } from "react";
import { CourseWithDetails } from "@/types/course";
import { EnrollModal } from "@/components/modals";
import SuccessMessage from "@/components/ui/SuccessMessage";
import ErrorMessage from "@/components/ui/ErrorMessage";

interface CourseEnrollmentManagerProps {
  children: React.ReactNode;
  studentId?: number; // Current logged in student ID
}

interface EnrollmentState {
  showModal: boolean;
  selectedCourse: CourseWithDetails | null;
  successMessage: string;
  errorMessage: string;
  showSuccess: boolean;
  showError: boolean;
}

const CourseEnrollmentManager: React.FC<CourseEnrollmentManagerProps> = ({
  children,
  studentId = 1, // Default for testing, should come from auth context
}) => {
  const [state, setState] = useState<EnrollmentState>({
    showModal: false,
    selectedCourse: null,
    successMessage: "",
    errorMessage: "",
    showSuccess: false,
    showError: false,
  });

  const handleEnrollClick = (course: CourseWithDetails) => {
    setState((prev) => ({
      ...prev,
      selectedCourse: course,
      showModal: true,
    }));
  };

  const handleCloseModal = () => {
    setState((prev) => ({
      ...prev,
      showModal: false,
      selectedCourse: null,
    }));
  };

  const handleEnrollmentSuccess = (message: string) => {
    setState((prev) => ({
      ...prev,
      successMessage: message,
      showSuccess: true,
      showModal: false,
      selectedCourse: null,
    }));
  };

  const handleEnrollmentError = (message: string) => {
    setState((prev) => ({
      ...prev,
      errorMessage: message,
      showError: true,
    }));
  };

  const handleCloseSuccess = () => {
    setState((prev) => ({
      ...prev,
      showSuccess: false,
      successMessage: "",
    }));
  };

  const handleCloseError = () => {
    setState((prev) => ({
      ...prev,
      showError: false,
      errorMessage: "",
    }));
  };

  return (
    <>
      {/* Render children with enrollment context */}
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            onEnrollClick: handleEnrollClick,
          } as React.HTMLAttributes<HTMLElement>);
        }
        return child;
      })}

      {/* Enrollment Modal */}
      {state.showModal && state.selectedCourse && (
        <EnrollModal
          isOpen={state.showModal}
          onClose={handleCloseModal}
          course={state.selectedCourse}
          studentId={studentId}
          onSuccess={handleEnrollmentSuccess}
          onError={handleEnrollmentError}
        />
      )}

      {/* Success Message */}
      <SuccessMessage
        message={state.successMessage}
        isVisible={state.showSuccess}
        onClose={handleCloseSuccess}
      />

      {/* Error Message */}
      <ErrorMessage
        message={state.errorMessage}
        isVisible={state.showError}
        onClose={handleCloseError}
      />
    </>
  );
};

export default CourseEnrollmentManager;
