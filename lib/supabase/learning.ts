import { getSupabaseClient } from './supabase-client';
import type { CourseModule, CourseModuleWithMaterials, ModuleMaterial } from '@/types/supabase';
import type { DataResult, ListResult } from './courses';

export interface CourseLearningContent {
  modules: CourseModuleWithMaterials[];
  moduleError: Error | null;
  materialError: Error | null;
}

const moduleColumns = 'id, course_id, title, sort_order, created_at';
const materialColumns = 'id, module_id, title, type, url, duration_seconds, is_required, sort_order, created_at';
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function queryError(query: string, error: { message: string }): Error {
  return new Error(`${query} failed: ${error.message}`);
}

function invalidIdError(label: string): Error {
  return new Error(`${label} must be a valid UUID.`);
}

export async function getCourseModules(courseId: string): Promise<ListResult<CourseModule>> {
  if (!uuidPattern.test(courseId)) return { data: [], error: invalidIdError('Course ID') };

  const query = `modules.select(${moduleColumns}).eq("course_id", "${courseId}").order("sort_order", { ascending: true })`;

  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('modules')
      .select(moduleColumns)
      .eq('course_id', courseId)
      .order('sort_order', { ascending: true });

    if (error) return { data: [], error: queryError(query, error) };
    return { data: (data ?? []) as CourseModule[], error: null };
  } catch (error) {
    return { data: [], error: error instanceof Error ? error : new Error('Unable to load course modules.') };
  }
}

export async function getModuleById(moduleId: string): Promise<DataResult<CourseModule>> {
  if (!uuidPattern.test(moduleId)) return { data: null, error: invalidIdError('Module ID') };

  const query = `modules.select(${moduleColumns}).eq("id", "${moduleId}").maybeSingle()`;

  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('modules')
      .select(moduleColumns)
      .eq('id', moduleId)
      .maybeSingle();

    if (error) return { data: null, error: queryError(query, error) };
    return { data: data as CourseModule | null, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Unable to load the module.') };
  }
}

export async function getModuleMaterials(moduleId: string): Promise<ListResult<ModuleMaterial>> {
  if (!uuidPattern.test(moduleId)) return { data: [], error: invalidIdError('Module ID') };

  const query = `module_materials.select(${materialColumns}).eq("module_id", "${moduleId}").order("sort_order", { ascending: true })`;

  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('module_materials')
      .select(materialColumns)
      .eq('module_id', moduleId)
      .order('sort_order', { ascending: true });

    if (error) return { data: [], error: queryError(query, error) };
    return { data: (data ?? []) as ModuleMaterial[], error: null };
  } catch (error) {
    return { data: [], error: error instanceof Error ? error : new Error('Unable to load module materials.') };
  }
}

export async function getCourseLearningContent(courseId: string): Promise<CourseLearningContent> {
  const moduleResult = await getCourseModules(courseId);
  if (moduleResult.error) return { modules: [], moduleError: moduleResult.error, materialError: null };
  if (moduleResult.data.length === 0) return { modules: [], moduleError: null, materialError: null };

  const moduleIds = moduleResult.data.map((module) => module.id);
  const query = `module_materials.select(${materialColumns}).in("module_id", moduleIds).order("sort_order", { ascending: true })`;

  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('module_materials')
      .select(materialColumns)
      .in('module_id', moduleIds)
      .order('sort_order', { ascending: true });

    const modules: CourseModuleWithMaterials[] = moduleResult.data.map((module) => ({
      ...module,
      materials: error ? [] : ((data ?? []) as ModuleMaterial[]).filter((material) => material.module_id === module.id),
    }));

    return {
      modules,
      moduleError: null,
      materialError: error ? queryError(query, error) : null,
    };
  } catch (error) {
    return {
      modules: moduleResult.data.map((module) => ({ ...module, materials: [] })),
      moduleError: null,
      materialError: error instanceof Error ? error : new Error('Unable to load module materials.'),
    };
  }
}