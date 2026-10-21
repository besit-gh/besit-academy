import { describe, expect, it } from 'vitest';
import { academyLessons } from './lessons';

describe('academy curriculum', () => {
  it('has unique lesson IDs and complete lesson structure', () => {
    const ids = academyLessons.map(lesson => lesson.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(academyLessons.length).toBeGreaterThanOrEqual(6);
    for (const lesson of academyLessons) {
      expect(lesson.title.trim().length).toBeGreaterThan(5);
      expect(lesson.objectives.length).toBeGreaterThan(0);
      expect(lesson.sections.length).toBeGreaterThanOrEqual(3);
      expect(lesson.task.choices.some(choice => choice.id === lesson.task.correct)).toBe(true);
      expect(lesson.mentor.name).not.toBe('');
    }
  });

  it('provides both mentor styles across the curriculum', () => {
    expect(academyLessons.some(lesson => lesson.mentor.kind === 'good')).toBe(true);
    expect(academyLessons.some(lesson => lesson.mentor.kind === 'strict')).toBe(true);
  });

  it('includes foundational lessons before platform topics in curriculum order', () => {
    const titles = academyLessons.map(lesson => lesson.title);
    expect(titles.indexOf('Ориентирование в Linux')).toBeLessThan(titles.indexOf('Образ, контейнер и постоянные данные'));
    expect(titles.indexOf('Права доступа без chmod 777')).toBeLessThan(titles.indexOf('Образ, контейнер и постоянные данные'));
  });
});
