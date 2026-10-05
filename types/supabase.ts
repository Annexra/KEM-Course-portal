export interface Department {
  id: string;
  name: string;
  code: string;
  description: string | null;
  created_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export type CourseStatus = 'draft' | 'published' | 'archived';

export interface Course {
  id: string;
  department_id: string | null;
  title: string;
  code: string;
  description: string | null;
  thumbnail_url: string | null;
  status: CourseStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export type CourseEnrollmentStatus = 'active' | 'completed' | 'dropped';

export interface CourseEnrollment {
  id: string;
  course_id: string | null;
  student_id: string | null;
  status: CourseEnrollmentStatus;
  enrolled_at: string;
  completed_at: string | null;
}

export interface CourseFaculty {
  course_id: string;
  faculty_id: string;
  assigned_at: string;
}

export interface CourseModule {
  id: string;
  course_id: string | null;
  title: string;
  sort_order: number;
  created_at: string;
}

export type ModuleMaterialType = 'video' | 'pdf' | 'document' | 'reading' | 'activity';

export interface ModuleMaterial {
  id: string;
  module_id: string | null;
  title: string;
  type: ModuleMaterialType;
  url: string;
  duration_seconds: number | null;
  is_required: boolean | null;
  sort_order: number;
  created_at: string;
}

export interface CourseModuleWithMaterials extends CourseModule {
  materials: ModuleMaterial[];
}

export interface StudentCourse {
  course: Course;
  enrollment: CourseEnrollment;
}

export type AssessmentType = 'assessment' | 'mock_test';
export type AssessmentStatus = 'draft' | 'published' | 'archived';

export interface Assessment {
  id: string;
  course_id: string | null;
  module_id: string | null;
  title: string;
  type: AssessmentType;
  duration_minutes: number;
  pass_percentage: number;
  randomize_questions: boolean;
  randomize_options: boolean;
  max_attempts: number;
  negative_marking: number;
  status: AssessmentStatus;
  created_by: string | null;
  created_at: string;
  cooldown_minutes: number;
  available_from: string | null;
  available_until: string | null;
}

export interface AssessmentQuestion {
  assessment_id: string;
  question_id: string;
  sort_order: number;
}

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface StudentSafeQuestion {
  id: string;
  text: string;
  difficulty: QuestionDifficulty;
  marks: number;
  subtopic_id: string | null;
}

export interface QuestionOption {
  id: string;
  question_id: string | null;
  text: string;
  sort_order: number;
}

export interface AssessmentQuestionWithOptions extends StudentSafeQuestion {
  sort_order: number;
  options: QuestionOption[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface Topic {
  id: string;
  subject_id: string | null;
  name: string;
}

export interface Subtopic {
  id: string;
  topic_id: string | null;
  name: string;
}

export interface FacultyQuestion extends StudentSafeQuestion {
  created_at: string;
  subject: Subject | null;
  topic: Topic | null;
  subtopic: Subtopic | null;
}