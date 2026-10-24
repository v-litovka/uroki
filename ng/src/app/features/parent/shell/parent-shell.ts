import { Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { FamilyService } from '../../../core/family/family.service';
import { ParentSession } from '../../../core/family/parent-session';
import { HeaderService } from '../../../core/layout/header.service';
import { Button, PageHero, SegOption, Segmented, TabItem, Tabs } from '../../../shared/ui';
import { ParentState } from '../parent-state';
import { LangService } from '../../../core/i18n/lang.service';

/** Кабинет взрослого: выбор ребёнка + разделы. */
@Component({
  selector: 'app-parent-shell',
  imports: [RouterOutlet, PageHero, Tabs, Segmented, Button],
  templateUrl: './parent-shell.html',
  styleUrl: './parent-shell.scss',
})
export class ParentShell {
  protected family = inject(FamilyService);
  protected state = inject(ParentState);
  private session = inject(ParentSession);
  private router = inject(Router);
  private url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly kids = computed<SegOption<string>[]>(() => this.family.children().map((c) => ({ value: c.id, label: `${c.avatar} ${c.name}` })));
  protected readonly tabs = computed<TabItem[]>(() => {
    const u = this.url();
    const t = (label: string, path: string) => ({ label, link: ['/parent', ...(path ? [path] : [])], active: path ? u.startsWith('/parent/' + path) : u === '/parent' });
    return [t('Успехи', ''), t('Задания', 'tasks'), t('Слова', 'words'), t('Питомцы', 'pets'), t('Дети и уровни', 'children')];
  });

  constructor() {
    inject(HeaderService).set({ back: '/me' });
    inject(LangService).lang.set('ru');
  }

  logout() {
    this.session.lock();
    this.router.navigate(['/me']);
  }
}
