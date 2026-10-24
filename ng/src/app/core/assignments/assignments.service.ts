import { Injectable, inject, signal } from '@angular/core';
import { KV_STORE } from '../storage/key-value-store';
import { ProgressService } from '../progress/progress.service';
import { Assignment, RoundRecord } from '../models';

const KEY = 'ng-assignments';
const uid = () => Math.random().toString(36).slice(2, 9);

export interface AssignmentStatus {
  a: Assignment;
  done: number;
  complete: boolean;
  /** срок прошёл, а не выполнено */
  overdue: boolean;
  /** когда выполнено (последний нужный раунд) */
  completedAt?: number;
}

/** Задания от взрослого. Статус считается по истории раундов ребёнка — вручную отмечать не нужно. */
@Injectable({ providedIn: 'root' })
export class AssignmentsService {
  private kv = inject(KV_STORE);
  private progress = inject(ProgressService);
  readonly all = signal<Assignment[]>(this.kv.get<Assignment[]>(KEY, []));

  add(a: Omit<Assignment, 'id' | 'createdAt'>) {
    this.all.update((l) => [...l, { ...a, id: uid(), createdAt: Date.now() }]);
    this.kv.set(KEY, this.all());
  }

  remove(id: string) {
    this.all.update((l) => l.filter((x) => x.id !== id));
    this.kv.set(KEY, this.all());
  }

  /** статус всех заданий ребёнка (новые сверху) */
  statusFor(childId: string, today = new Date()): AssignmentStatus[] {
    const rounds = this.progress.rounds(childId);
    return this.all()
      .filter((a) => a.childId === childId)
      .map((a) => AssignmentsService.status(a, rounds, today))
      .sort((x, y) => Number(x.complete) - Number(y.complete) || y.a.createdAt - x.a.createdAt);
  }

  static status(a: Assignment, rounds: RoundRecord[], today = new Date()): AssignmentStatus {
    const hits = rounds
      .filter((r) => r.t >= a.createdAt && r.pack === a.packId && r.topic === a.topicId && (a.modeId === '*' || r.mode === a.modeId))
      .sort((x, y) => x.t - y.t);
    const complete = hits.length >= a.rounds;
    const todayStr = today.toISOString().slice(0, 10);
    return {
      a,
      done: Math.min(hits.length, a.rounds),
      complete,
      overdue: !complete && !!a.due && a.due < todayStr,
      completedAt: complete ? hits[a.rounds - 1].t : undefined,
    };
  }
}
