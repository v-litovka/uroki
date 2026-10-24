/* «Улица Домиков» (математика, 3 класс) — данные из старой игры как есть.
 * Домик = пример таблицы: на чердаке — ответ, в окошках — множители. id домика «2x3» совпадает со старой игрой (коробки «знаю»). */

export interface Block {
  id: number;
  name: string;
  tag: string;
  color: string;
  /** хитрость улицы (MH в modes.ts); null — «трудные», там стишок */
  mh: string | null;
  cards: [number, number][];
}

export const BLOCKS: Block[] = [
  {"id":1,"name":"Двойки","tag":"× 2","color":"#FF6B4A","mh":"dbl","cards":[[2,2],[2,3],[2,4],[2,5],[2,6],[2,7],[2,8],[2,9]]},
  {"id":2,"name":"Пятёрки","tag":"× 5","color":"#13A3A0","mh":"five","cards":[[3,5],[4,5],[5,5],[5,6],[5,7],[5,8],[5,9]]},
  {"id":3,"name":"Четвёрки","tag":"× 4","color":"#FF9F1C","mh":"four","cards":[[3,4],[4,4],[4,6],[4,7],[4,8],[4,9]]},
  {"id":4,"name":"Девятки","tag":"× 9","color":"#7A5CFA","mh":"nine","cards":[[3,9],[6,9],[7,9],[8,9],[9,9]]},
  {"id":5,"name":"Тройки","tag":"× 3","color":"#EE4F9B","mh":"three","cards":[[3,3],[3,6],[3,7],[3,8]]},
  {"id":6,"name":"Трудные","tag":"6 · 7 · 8","color":"#2D6CDF","mh":null,"cards":[[6,6],[6,7],[6,8],[7,7],[7,8],[8,8]]},
];

/** особые домики «трудной» улицы → своя хитрость */
export const SPECIAL: Record<string, string> = {"6x6":"sixEven","6x8":"sixEven","6x7":"sixPlus","7x7":"sevenSplit","7x8":"seq5678","8x8":"eight"};
/** у какой хитрости какое число — «база» (второй множитель — переменная) */
export const BASE: Record<string, number> = {"dbl":2,"five":5,"four":4,"nine":9,"three":3,"sixEven":6,"sixPlus":6,"sevenSplit":7,"eight":8,"seq5678":7};
/** строчки стишка (с Вирой и Венди) — показываются после верного ответа и в уроке «трудных» */
export const RHYME: Record<string, string> = {
  "2x3": "Дважды три — шесть, у Венди мягкая шерсть!",
  "2x6": "Дважды шесть — двенадцать, нам пора одеваться!",
  "2x9": "Дважды девять — восемнадцать, Вира хочет покататься!",
  "3x4": "<span class=\"ln\">Венди к ней пришла подраться,</span><span class=\"ln\">3, 4 — даст 12.</span>",
  "3x9": "<span class=\"ln\">Вира скажет: «Всё я съем!»</span><span class=\"ln\">3 на 9 — 27.</span>",
  "4x5": "<span class=\"ln\">Венди нравится загадка:</span><span class=\"ln\">4, 5 — будет 20 (двадцатка).</span>",
  "4x8": "<span class=\"ln\">Венди смотрит, как сова,</span><span class=\"ln\">4, 8 — 32.</span>",
  "4x9": "<span class=\"ln\">Будто Виру хочет съесть,</span><span class=\"ln\">4, 9 — 36.</span>",
  "5x7": "<span class=\"ln\">Венди ляжет на кровать,</span><span class=\"ln\">5 на 7 — есть 35.</span>",
  "5x8": "<span class=\"ln\">Вира слышит тихий шорох,</span><span class=\"ln\">5 на 8 — будет 40.</span>",
  "6x9": "<span class=\"ln\">Убегают по квартире,</span><span class=\"ln\">6 на 9 — 5 4 (пять четыре).</span>",
  "7x9": "<span class=\"ln\">Венди, ну-ка, посмотри:</span><span class=\"ln\">7 на 9 — 63.</span>",
  "8x9": "<span class=\"ln\">Венди ловит комара,</span><span class=\"ln\">8, 9 — 72.</span>",
  "2x2": "Дважды два — четыре!",
  "2x4": "У Венди и Виры — восемь лап!",
  "2x5": "Две руки по пять пальцев — вместе десять!",
  "2x7": "Две недели — четырнадцать дней!",
  "2x8": "У двух паучков — шестнадцать ног!",
  "3x3": "<span class=\"ln\">Вире снится шоколадка,</span><span class=\"ln\">3 на 3 — будет 9 (девятка).</span>",
  "3x5": "<span class=\"ln\">После драки — умываться,</span><span class=\"ln\">3 на 5 — у нас 15.</span>",
  "5x5": "<span class=\"ln\">Венди хочет погулять,</span><span class=\"ln\">5 на 5 — есть 25.</span>",
  "5x6": "<span class=\"ln\">Вира спит так сладко-сладко,</span><span class=\"ln\">5 на 6 — будет 30 (тридцатка).</span>",
  "5x9": "<span class=\"ln\">Венди в шкаф легла опять,</span><span class=\"ln\">5 на 9 — 45.</span>",
  "4x4": "<span class=\"ln\">Дважды 2 — у нас 4,</span><span class=\"ln\">И ещё раз на 4 —</span><span class=\"ln\">Получаем мы 16,</span><span class=\"ln\">Кошки будут улыбаться.</span>",
  "4x6": "<span class=\"ln\">Венди спинку выгнет шире,</span><span class=\"ln\">4, 6 — как 2 4 (два четыре).</span>",
  "4x7": "<span class=\"ln\">Вира мячик лапой бросит,</span><span class=\"ln\">4, 7 — есть 28.</span>",
  "3x6": "<span class=\"ln\">Помирились — обниматься!</span><span class=\"ln\">3 на 6 — есть 18.</span>",
  "3x7": "<span class=\"ln\">Вира спит, как господин,</span><span class=\"ln\">3 на 7 — 21.</span>",
  "3x8": "<span class=\"ln\">3 на 8 — 2 4 (два четыре),</span><span class=\"ln\">Вира толще всех в квартире.</span>",
  "6x6": "<span class=\"ln\">Венди к Вире хочет сесть,</span><span class=\"ln\">6 на 6 — есть 36.</span>",
  "6x7": "<span class=\"ln\">Вира спряталась в дрова,</span><span class=\"ln\">6 на 7 — 4 2 (четыре два).</span>",
  "6x8": "<span class=\"ln\">Мы котов на ручках носим,</span><span class=\"ln\">6 на 8 — 48.</span>",
  "7x7": "<span class=\"ln\">Вира тапки будет мерить,</span><span class=\"ln\">7 на 7 — есть 49.</span>",
  "7x8": "<span class=\"ln\">5 и 6 и 7 и 8 —</span><span class=\"ln\">Вира кушать снова просит,</span><span class=\"ln\">Венди миску ей приносит.</span><span class=\"ln\">56 — даст 7 на 8.</span>",
  "8x8": "<span class=\"ln\">8, 8 — 6 4 (шесть четыре),</span><span class=\"ln\">Как убраться мне в квартире?</span>",
  "9x9": "Девятью девять — восемьдесят один, Венди съела апельсин!",
};
export const RHYME_NOTE: Record<string, string> = {"7x8":"<span class=\"seq\"><b>5</b><b>6</b><b>7</b><b>8</b></span><span class=\"seqeq\"><i class=\"sg\">56</i> = <i class=\"sb\">7 × 8</i></span>"};
/** числа, которые живут в двух домиках */
export const TWINS: Record<number, [string, string]> = {"12":["2x6","3x4"],"16":["2x8","4x4"],"18":["2x9","3x6"],"24":["3x8","4x6"],"36":["4x9","6x6"]};
