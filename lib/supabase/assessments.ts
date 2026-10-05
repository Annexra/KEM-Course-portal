import { getStudentCourses, type DataResult, type ListResult } from './courses';
import { getCourseEnrollment } from './courses';
import { getSupabaseClient } from './supabase-client';
import type {
  Assessment,
  AssessmentQuestion,
  AssessmentQuestionWithOptions,
  CourseEnrollment,
  AssessmentType,
  FacultyQuestion,
  QuestionOption,
  StudentSafeQuestion,
  Subject,
  Subtopic,
  Topic,
} from '@/types/supabase';

const assessmentColumns = 'id, course_id, module_id, title, type, duration_minutes, pass_percentage, randomize_questions, randomize_options, max_attempts, negative_marking, status, created_by, created_at, cooldown_minutes, available_from, available_until';
const questionColumns = 'id, text, difficulty, marks, subtopic_id';
const optionColumns = 'id, question_id, text, sort_order';
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface StudentAssessmentPreview {
  assessment: Assessment | null;
  enrollment: CourseEnrollment | null;
  questions: AssessmentQuestionWithOptions[];
  error: Error | null;
}

function queryError(query: string, error: { message: string }): Error {
  return new Error(`${query} failed: ${error.message}`);
}

function invalidIdError(label: string): Error {
  return new Error(`${label} must be a valid UUID.`);
}

function addPublishedAvailabilityFilters<T extends {
  eq: (column: string, value: string) => T;
  or: (filters: string) => T;
}>(query: T, now: string) {
  return query
    .eq('status', 'published')
    .or(`available_from.is.null,available_from.lte.${now}`)
    .or(`available_until.is.null,available_until.gt.${now}`);
}

async function getAssessmentList(options: {
  publishedOnly?: boolean;
  type?: AssessmentType;
  courseId?: string;
} = {}): Promise<ListResult<Assessment>> {
  if (options.courseId && !uuidPattern.test(options.courseId)) {
    return { data: [], error: invalidIdError('Course ID') };
  }

  const now = new Date().toISOString();
  const queryDescription = `assessments.select(${assessmentColumns})${options.publishedOnly ? '.eq("status", "published").or(available_from, available_until)' : ''}${options.type ? `.eq("type", "${options.type}")` : ''}${options.courseId ? `.eq("course_id", "${options.courseId}")` : ''}.order("created_at", { ascending: false })`;

  try {
    const client = getSupabaseClient();
    let query = client.from('assessments').select(assessmentColumns);
    if (options.publishedOnly) query = addPublishedAvailabilityFilters(query, now);
    if (options.type) query = query.eq('type', options.type);
    if (options.courseId) query = query.eq('course_id', options.courseId);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return { data: [], error: queryError(queryDescription, error) };
    return { data: (data ?? []) as Assessment[], error: null };
  } catch (error) {
    return { data: [], error: error instanceof Error ? error : new Error('Unable to load assessments.') };
  }
}

export async function getAssessments(): Promise<ListResult<Assessment>> {
  return getAssessmentList();
}

export async function getPublishedAssessments(type?: AssessmentType): Promise<ListResult<Assessment>> {
  return getAssessmentList({ publishedOnly: true, type });
}

export async function getCourseAssessments(courseId: string): Promise<ListResult<Assessment>> {
  return getAssessmentList({ publishedOnly: true, courseId });
}

export async function getStudentAssessments(
  profileId: string,
  type?: AssessmentType
): Promise<ListResult<Assessment>> {
  if (!uuidPattern.test(profileId)) return { data: [], error: invalidIdError('Profile ID') };

  const [assessmentResult, courseResult] = await Promise.all([
    getPublishedAssessments(type),
    getStudentCourses(profileId),
  ]);

  if (assessmentResult.error) return { data: [], error: assessmentResult.error };
  if (courseResult.error) return { data: [], error: courseResult.error };

  const activeCourseIds = new Set(courseResult.data.map(({ course }) => course.id));
  return {
    data: assessmentResult.data.filter(
      (assessment) => !assessment.course_id || activeCourseIds.has(assessment.course_id)
    ),
    error: null,
  };
}

export async function getAssessmentById(
  assessmentId: string,
  publishedOnly = true
): Promise<DataResult<Assessment>> {
  if (!uuidPattern.test(assessmentId)) return { data: null, error: invalidIdError('Assessment ID') };

  const now = new Date().toISOString();
  const queryDescription = `assessments.select(${assessmentColumns}).eq("id", "${assessmentId}")${publishedOnly ? '.eq("status", "published").or(available_from, available_until)' : ''}.maybeSingle()`;

  try {
    const client = getSupabaseClient();
    let query = client.from('assessments').select(assessmentColumns).eq('id', assessmentId);
    if (publishedOnly) query = addPublishedAvailabilityFilters(query, now);

    const { data, error } = await query.maybeSingle();
    if (error) return { data: null, error: queryError(queryDescription, error) };
    return { data: data as Assessment | null, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Unable to load the assessment.') };
  }
}

export async function getAssessmentQuestions(
  assessmentId: string
): Promise<ListResult<AssessmentQuestionWithOptions>> {
  if (!uuidPattern.test(assessmentId)) return { data: [], error: invalidIdError('Assessment ID') };

  const linksQueryDescription = `assessment_questions.select(assessment_id, question_id, sort_order).eq("assessment_id", "${assessmentId}").order("sort_order")`;

  try {
    const client = getSupabaseClient();
    const { data: links, error: linksError } = await client
      .from('assessment_questions')
      .select('assessment_id, question_id, sort_order')
      .eq('assessment_id', assessmentId)
      .order('sort_order', { ascending: true });

    if (linksError) return { data: [], error: queryError(linksQueryDescription, linksError) };
    const assessmentQuestions = (links ?? []) as AssessmentQuestion[];
    if (assessmentQuestions.length === 0) return { data: [], error: null };

    const questionIds = [...new Set(assessmentQuestions.map((item) => item.question_id))];
    const questionQueryDescription = `questions.select(${questionColumns}).in("id", questionIds).is("deleted_at", null)`;
    const { data: questionRows, error: questionsError } = await client
      .from('questions')
      .select(questionColumns)
      .in('id', questionIds)
      .is('deleted_at', null);

    if (questionsError) return { data: [], error: queryError(questionQueryDescription, questionsError) };
    const questions = (questionRows ?? []) as StudentSafeQuestion[];
    if (questions.length === 0) return { data: [], error: null };

    const visibleIds = questions.map((question) => question.id);
    const optionsQueryDescription = `question_options.select(${optionColumns}).in("question_id", visibleIds).order("sort_order")`;
    const { data: optionRows, error: optionsError } = await client
      .from('question_options')
      .select(optionColumns)
      .in('question_id', visibleIds)
      .order('sort_order', { ascending: true });

    if (optionsError) return { data: [], error: queryError(optionsQueryDescription, optionsError) };

    const options = (optionRows ?? []) as QuestionOption[];
    const questionsById = new Map(questions.map((question) => [question.id, question]));
    const optionsByQuestionId = new Map<string, QuestionOption[]>();
    for (const option of options) {
      if (!option.question_id) continue;
      const questionOptions = optionsByQuestionId.get(option.question_id) ?? [];
      questionOptions.push(option);
      optionsByQuestionId.set(option.question_id, questionOptions);
    }

    return {
      data: assessmentQuestions.flatMap((link) => {
        const question = questionsById.get(link.question_id);
        if (!question) return [];
        return [{
          ...question,
          sort_order: link.sort_order,
          options: optionsByQuestionId.get(question.id) ?? [],
        }];
      }),
      error: null,
    };
  } catch (error) {
    return { data: [], error: error instanceof Error ? error : new Error('Unable to load assessment questions.') };
  }
}

export async function getQuestionById(questionId: string): Promise<DataResult<StudentSafeQuestion>> {
  if (!uuidPattern.test(questionId)) return { data: null, error: invalidIdError('Question ID') };

  const queryDescription = `questions.select(${questionColumns}).eq("id", "${questionId}").is("deleted_at", null).maybeSingle()`;

  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('questions')
      .select(questionColumns)
      .eq('id', questionId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) return { data: null, error: queryError(queryDescription, error) };
    return { data: data as StudentSafeQuestion | null, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Unable to load the question.') };
  }
}

export async function getQuestionOptions(questionId: string): Promise<ListResult<QuestionOption>> {
  if (!uuidPattern.test(questionId)) return { data: [], error: invalidIdError('Question ID') };

  const queryDescription = `question_options.select(${optionColumns}).eq("question_id", "${questionId}").order("sort_order")`;

  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('question_options')
      .select(optionColumns)
      .eq('question_id', questionId)
      .order('sort_order', { ascending: true });

    if (error) return { data: [], error: queryError(queryDescription, error) };
    return { data: (data ?? []) as QuestionOption[], error: null };
  } catch (error) {
    return { data: [], error: error instanceof Error ? error : new Error('Unable to load question options.') };
  }
}

export async function getFacultyQuestionBank(): Promise<ListResult<FacultyQuestion>> {
  const queryDescription = `questions.select(${questionColumns}, created_at).is("deleted_at", null).order("created_at", { ascending: false })`;

  try {
    const client = getSupabaseClient();
    const { data: questionRows, error } = await client
      .from('questions')
      .select(`${questionColumns}, created_at`)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) return { data: [], error: queryError(queryDescription, error) };
    const questions = (questionRows ?? []) as (StudentSafeQuestion & { created_at: string })[];
    const subtopicIds = [...new Set(questions.flatMap((question) => question.subtopic_id ?? []))];
    if (subtopicIds.length === 0) {
      return {
        data: questions.map((question) => ({ ...question, subtopic: null, topic: null, subject: null })),
        error: null,
      };
    }

    const { data: subtopics, error: subtopicsError } = await client
      .from('subtopics')
      .select('id, topic_id, name')
      .in('id', subtopicIds);
    if (subtopicsError) return { data: [], error: queryError(`subtopics.select(id, topic_id, name).in("id", subtopicIds)`, subtopicsError) };

    const typedSubtopics = (subtopics ?? []) as Subtopic[];
    const topicIds = [...new Set(typedSubtopics.flatMap((subtopic) => subtopic.topic_id ?? []))];
    const { data: topics, error: topicsError } = topicIds.length
      ? await client.from('topics').select('id, subject_id, name').in('id', topicIds)
      : { data: [], error: null };
    if (topicsError) return { data: [], error: queryError(`topics.select(id, subject_id, name).in("id", topicIds)`, topicsError) };

    const typedTopics = (topics ?? []) as Topic[];
    const subjectIds = [...new Set(typedTopics.flatMap((topic) => topic.subject_id ?? []))];
    const { data: subjects, error: subjectsError } = subjectIds.length
      ? await client.from('subjects').select('id, name, code').in('id', subjectIds)
      : { data: [], error: null };
    if (subjectsError) return { data: [], error: queryError(`subjects.select(id, name, code).in("id", subjectIds)`, subjectsError) };

    const subtopicById = new Map(typedSubtopics.map((subtopic) => [subtopic.id, subtopic]));
    const topicById = new Map(typedTopics.map((topic) => [topic.id, topic]));
    const subjectById = new Map(((subjects ?? []) as Subject[]).map((subject) => [subject.id, subject]));

    return {
      data: questions.map((question) => {
        const subtopic = question.subtopic_id ? subtopicById.get(question.subtopic_id) ?? null : null;
        const topic = subtopic?.topic_id ? topicById.get(subtopic.topic_id) ?? null : null;
        const subject = topic?.subject_id ? subjectById.get(topic.subject_id) ?? null : null;
        return { ...question, subtopic, topic, subject };
      }),
      error: null,
    };
  } catch (error) {
    return { data: [], error: error instanceof Error ? error : new Error('Unable to load the faculty question bank.') };
  }
}

export async function getFacultyAssessments(profileId: string): Promise<ListResult<Assessment>> {
  if (!uuidPattern.test(profileId)) return { data: [], error: invalidIdError('Profile ID') };

  try {
    const client = getSupabaseClient();
    const { data: facultyAssignments, error: facultyError } = await client
      .from('course_faculty')
      .select('course_id')
      .eq('faculty_id', profileId);

    if (facultyError) {
      return { data: [], error: queryError(`course_faculty.select(course_id).eq("faculty_id", "${profileId}")`, facultyError) };
    }

    const courseIds = [...new Set((facultyAssignments ?? []).map((assignment) => assignment.course_id))];
    const ownAssessments = await client
      .from('assessments')
      .select(assessmentColumns)
      .eq('created_by', profileId)
      .order('created_at', { ascending: false });
    if (ownAssessments.error) {
      return { data: [], error: queryError(`assessments.select(${assessmentColumns}).eq("created_by", "${profileId}")`, ownAssessments.error) };
    }

    const courseAssessments = courseIds.length
      ? await client
        .from('assessments')
        .select(assessmentColumns)
        .in('course_id', courseIds)
        .order('created_at', { ascending: false })
      : { data: [], error: null };
    if (courseAssessments.error) {
      return { data: [], error: queryError(`assessments.select(${assessmentColumns}).in("course_id", facultyCourseIds)`, courseAssessments.error) };
    }

    const assessmentsById = new Map<string, Assessment>();
    for (const assessment of [...(ownAssessments.data ?? []), ...(courseAssessments.data ?? [])] as Assessment[]) {
      assessmentsById.set(assessment.id, assessment);
    }
    return {
      data: [...assessmentsById.values()].sort((left, right) => right.created_at.localeCompare(left.created_at)),
      error: null,
    };
  } catch (error) {
    return { data: [], error: error instanceof Error ? error : new Error('Unable to load faculty assessments.') };
  }
}

export async function getStudentAssessmentPreview(
  assessmentId: string,
  profileId: string
): Promise<StudentAssessmentPreview> {
  if (!uuidPattern.test(profileId)) {
    return { assessment: null, enrollment: null, questions: [], error: invalidIdError('Profile ID') };
  }

  const assessmentResult = await getAssessmentById(assessmentId, true);
  if (assessmentResult.error || !assessmentResult.data) {
    return {
      assessment: null,
      enrollment: null,
      questions: [],
      error: assessmentResult.error,
    };
  }

  let enrollment: CourseEnrollment | null = null;
  if (assessmentResult.data.course_id) {
    const enrollmentResult = await getCourseEnrollment(assessmentResult.data.course_id, profileId);
    if (enrollmentResult.error) {
      return { assessment: assessmentResult.data, enrollment: null, questions: [], error: enrollmentResult.error };
    }
    enrollment = enrollmentResult.data;
    if (enrollment?.status !== 'active') {
      return { assessment: assessmentResult.data, enrollment, questions: [], error: null };
    }
  }

  const questions = await getAssessmentQuestions(assessmentId);
  return {
    assessment: assessmentResult.data,
    enrollment,
    questions: questions.data,
    error: questions.error,
  };
}