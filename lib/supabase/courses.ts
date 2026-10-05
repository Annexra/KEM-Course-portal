import { getSupabaseClient } from './supabase-client';
import type { Course, CourseEnrollment, CourseFaculty, Department, StudentCourse } from '@/types/supabase';

export interface DataResult<T> {
  data: T | null;
  error: Error | null;
}

export interface ListResult<T> {
  data: T[];
  error: Error | null;
}

const departmentColumns = 'id, name, code, description, created_at, deleted_at, deleted_by';
const courseColumns = 'id, department_id, title, code, description, thumbnail_url, status, created_by, created_at, updated_at, deleted_at, deleted_by';
const enrollmentColumns = 'id, course_id, student_id, status, enrolled_at, completed_at';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function queryError(query: string, error: { message: string }): Error {
  return new Error(`${query} failed: ${error.message}`);
}

function invalidIdError(label: string): Error {
  return new Error(`${label} must be a valid UUID.`);
}

async function getCoursesByIds(courseIds: string[], publishedOnly: boolean): Promise<ListResult<Course>> {
  if (courseIds.length === 0) return { data: [], error: null };

  const query = `courses.select(${courseColumns}).in("id", courseIds).is("deleted_at", null)${publishedOnly ? '.eq("status", "published")' : ''}`;

  try {
    const client = getSupabaseClient();
    let request = client
      .from('courses')
      .select(courseColumns)
      .in('id', courseIds)
      .is('deleted_at', null);
    if (publishedOnly) request = request.eq('status', 'published');

    const { data, error } = await request;
    if (error) return { data: [], error: queryError(query, error) };
    return { data: (data ?? []) as Course[], error: null };
  } catch (error) {
    return { data: [], error: error instanceof Error ? error : new Error('Unable to load courses.') };
  }
}

async function getCourseList(publishedOnly: boolean): Promise<ListResult<Course>> {
  const query = `courses.select(${courseColumns}).is("deleted_at", null)${publishedOnly ? '.eq("status", "published")' : ''}.order("created_at", { ascending: false })`;

  try {
    const client = getSupabaseClient();
    let request = client.from('courses').select(courseColumns).is('deleted_at', null);
    if (publishedOnly) request = request.eq('status', 'published');

    const { data, error } = await request.order('created_at', { ascending: false });
    if (error) return { data: [], error: queryError(query, error) };
    return { data: (data ?? []) as Course[], error: null };
  } catch (error) {
    return { data: [], error: error instanceof Error ? error : new Error('Unable to load courses.') };
  }
}

export async function getDepartments(): Promise<ListResult<Department>> {
  const query = `departments.select(${departmentColumns}).is("deleted_at", null).order("name")`;

  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('departments')
      .select(departmentColumns)
      .is('deleted_at', null)
      .order('name');

    if (error) return { data: [], error: queryError(query, error) };
    return { data: (data ?? []) as Department[], error: null };
  } catch (error) {
    return { data: [], error: error instanceof Error ? error : new Error('Unable to load departments.') };
  }
}

export async function getDepartmentById(departmentId: string): Promise<DataResult<Department>> {
  if (!uuidPattern.test(departmentId)) return { data: null, error: invalidIdError('Department ID') };

  const query = `departments.select(${departmentColumns}).eq("id", "${departmentId}").is("deleted_at", null).maybeSingle()`;

  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('departments')
      .select(departmentColumns)
      .eq('id', departmentId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) return { data: null, error: queryError(query, error) };
    return { data: data as Department | null, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Unable to load the department.') };
  }
}

export async function getCourses(): Promise<ListResult<Course>> {
  return getCourseList(false);
}

export async function getPublishedCourses(): Promise<ListResult<Course>> {
  return getCourseList(true);
}

export async function getCourseById(courseId: string): Promise<DataResult<Course>> {
  if (!uuidPattern.test(courseId)) return { data: null, error: invalidIdError('Course ID') };

  const query = `courses.select(${courseColumns}).eq("id", "${courseId}").is("deleted_at", null).maybeSingle()`;

  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('courses')
      .select(courseColumns)
      .eq('id', courseId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) return { data: null, error: queryError(query, error) };
    return { data: data as Course | null, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Unable to load the course.') };
  }
}

export async function getPublishedCourseById(courseId: string): Promise<DataResult<Course>> {
  if (!uuidPattern.test(courseId)) return { data: null, error: invalidIdError('Course ID') };

  const query = `courses.select(${courseColumns}).eq("id", "${courseId}").eq("status", "published").is("deleted_at", null).maybeSingle()`;

  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('courses')
      .select(courseColumns)
      .eq('id', courseId)
      .eq('status', 'published')
      .is('deleted_at', null)
      .maybeSingle();

    if (error) return { data: null, error: queryError(query, error) };
    return { data: data as Course | null, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Unable to load the published course.') };
  }
}

export async function getStudentCourses(profileId: string): Promise<ListResult<StudentCourse>> {
  if (!uuidPattern.test(profileId)) return { data: [], error: invalidIdError('Profile ID') };

  const query = `course_enrollments.select(${enrollmentColumns}).eq("student_id", "${profileId}").eq("status", "active")`;

  try {
    const client = getSupabaseClient();
    const { data: enrollmentRows, error } = await client
      .from('course_enrollments')
      .select(enrollmentColumns)
      .eq('student_id', profileId)
      .eq('status', 'active')
      .order('enrolled_at', { ascending: false });

    if (error) return { data: [], error: queryError(query, error) };

    const enrollments = (enrollmentRows ?? []) as CourseEnrollment[];
    const courseIds = [...new Set(enrollments.flatMap((enrollment) => enrollment.course_id ?? []))];
    const courseResult = await getCoursesByIds(courseIds, true);
    if (courseResult.error) return { data: [], error: courseResult.error };

    const coursesById = new Map(courseResult.data.map((course) => [course.id, course]));
    return {
      data: enrollments.flatMap((enrollment) => {
        const course = enrollment.course_id ? coursesById.get(enrollment.course_id) : undefined;
        return course ? [{ course, enrollment }] : [];
      }),
      error: null,
    };
  } catch (error) {
    return { data: [], error: error instanceof Error ? error : new Error('Unable to load student courses.') };
  }
}

export async function getCourseEnrollment(courseId: string, profileId: string): Promise<DataResult<CourseEnrollment>> {
  if (!uuidPattern.test(courseId)) return { data: null, error: invalidIdError('Course ID') };
  if (!uuidPattern.test(profileId)) return { data: null, error: invalidIdError('Profile ID') };

  const query = `course_enrollments.select(${enrollmentColumns}).eq("course_id", "${courseId}").eq("student_id", "${profileId}").maybeSingle()`;

  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('course_enrollments')
      .select(enrollmentColumns)
      .eq('course_id', courseId)
      .eq('student_id', profileId)
      .maybeSingle();

    if (error) return { data: null, error: queryError(query, error) };
    return { data: data as CourseEnrollment | null, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Unable to load course enrollment.') };
  }
}

export async function getCourseFaculty(courseId: string): Promise<ListResult<CourseFaculty>> {
  if (!uuidPattern.test(courseId)) return { data: [], error: invalidIdError('Course ID') };

  const query = `course_faculty.select(course_id, faculty_id, assigned_at).eq("course_id", "${courseId}")`;

  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('course_faculty')
      .select('course_id, faculty_id, assigned_at')
      .eq('course_id', courseId);

    if (error) return { data: [], error: queryError(query, error) };
    return { data: (data ?? []) as CourseFaculty[], error: null };
  } catch (error) {
    return { data: [], error: error instanceof Error ? error : new Error('Unable to load course faculty.') };
  }
}

export async function getFacultyCourses(profileId: string): Promise<ListResult<Course>> {
  if (!uuidPattern.test(profileId)) return { data: [], error: invalidIdError('Profile ID') };

  const query = `course_faculty.select(course_id, faculty_id, assigned_at).eq("faculty_id", "${profileId}")`;

  try {
    const client = getSupabaseClient();
    const { data: assignments, error } = await client
      .from('course_faculty')
      .select('course_id, faculty_id, assigned_at')
      .eq('faculty_id', profileId);

    if (error) return { data: [], error: queryError(query, error) };
    const courseIds = [...new Set((assignments ?? []).map((assignment) => assignment.course_id))];
    return getCoursesByIds(courseIds, false);
  } catch (error) {
    return { data: [], error: error instanceof Error ? error : new Error('Unable to load faculty courses.') };
  }
}