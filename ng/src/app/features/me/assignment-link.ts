import { Assignment } from '../../core/models';

/** Куда ведёт кнопка «Начать» у задания. */
export function assignmentLink(a: Assignment): (string | number)[] {
  return ['/', a.grade, a.subject, a.entryId, a.topicId, ...(a.modeId === '*' ? [] : [a.modeId])];
}
