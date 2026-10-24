import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Сцена из доверенного статичного HTML контента (не из пользовательского ввода!).
 * Поддерживаемые классы: word (крупное слово), gap (пропуск), ok (вписанная буква), sent (предложение),
 * blank (пустая клетка для знака), why (пояснение), u1/u2/u3 (черта / две / пунктир), hlw (подсветка),
 * seg/hl (части слова), pre (рамка приставки), addr (обращение), memo (запомни), exs/ex (примеры), rulebox.
 */
@Component({
  selector: 'app-rich-html',
  template: '<div class="rich" [innerHTML]="safe()"></div>',
  styleUrl: './rich-html.scss',
})
export class RichHtml {
  readonly html = input.required<string>();
  private san = inject(DomSanitizer);
  protected readonly safe = computed(() => this.san.bypassSecurityTrustHtml(this.html()));
}
