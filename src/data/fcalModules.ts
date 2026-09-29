import { HANDBOOK_MODULES, CourseModule } from './handbookModules';

export const FCAL_MODULE_COURSES: CourseModule[] = HANDBOOK_MODULES.filter(
  m => m.faculty === 'CAL'
);
