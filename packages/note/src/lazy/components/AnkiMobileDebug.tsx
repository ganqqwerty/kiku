import { createSignal, For } from "solid-js";

export function AnkiMobileDebug() {
  // @ts-expect-error: global variable
  if (typeof KIKU_DEBUG === "boolean" && !KIKU_DEBUG) return null;

  const [$logs, $setLogs] = createSignal<string[]>([]);
  const [$divActive, $setDivActive] = createSignal(false);
  const [$buttonActive, $setButtonActive] = createSignal(false);

  const log = (msg: string) => {
    $setLogs((prev) => [`${new Date().toLocaleTimeString()}: ${msg}`, ...prev.slice(0, 49)]);
  };

  return (
    <div class="p-4 flex flex-col gap-4 bg-base-200 max-w-full overflow-hidden">
      <div class="text-lg font-bold">Диагностика событий AnkiMobile v6</div>

      <div class="flex gap-2 flex-wrap">
        {/* DIV Test */}
        <div class="flex flex-col items-center gap-1 border p-2 bg-base-300">
          <div class="text-[10px] font-bold">Блок</div>
          <div
            tabindex={0}
            class="size-16 flex items-center justify-center text-[10px] text-center p-1 tappable"
            classList={{
              "bg-primary text-primary-content": $divActive(),
              "bg-base-100": !$divActive(),
            }}
            on:mouseenter={() => {
              log("Div: on:mouseenter");
              $setDivActive(true);
            }}
            on:mouseleave={() => {
              log("Div: on:mouseleave");
              $setDivActive(false);
            }}
            on:touchstart={() => {
              log("Div: on:touchstart");
              $setDivActive(true);
            }}
            on:touchend={(e) => {
              e.stopPropagation();
              log("Div: on:touchend (stopPropagation)");
              $setDivActive(false);
            }}
            on:focus={() => {
              log("Div: on:focus");
              $setDivActive(true);
            }}
            on:blur={() => {
              log("Div: on:blur");
              $setDivActive(false);
            }}
            on:click={() => log("Div: on:click")}
          >
            {$divActive() ? "АКТИВЕН" : "ОЖИДАНИЕ"}
          </div>
        </div>

        {/* BUTTON Test */}
        <div class="flex flex-col items-center gap-1 border p-2 bg-base-300">
          <div class="text-[10px] font-bold">Кнопка</div>
          <button
            class="size-16 flex items-center justify-center text-[10px] text-center p-1"
            classList={{
              "bg-primary text-primary-content": $buttonActive(),
              "bg-base-100": !$buttonActive(),
            }}
            on:mouseenter={() => {
              log("Button: on:mouseenter");
              $setButtonActive(true);
            }}
            on:mouseleave={() => {
              log("Button: on:mouseleave");
              $setButtonActive(false);
            }}
            on:touchstart={() => {
              log("Button: on:touchstart");
              $setButtonActive(true);
            }}
            on:touchend={(e) => {
              e.stopPropagation();
              log("Button: on:touchend (stopPropagation)");
              $setButtonActive(false);
            }}
            on:focus={() => {
              log("Button: on:focus");
              $setButtonActive(true);
            }}
            on:blur={() => {
              log("Button: on:blur");
              $setButtonActive(false);
            }}
            on:click={() => log("Button: on:click")}
          >
            {$buttonActive() ? "АКТИВНА" : "ОЖИДАНИЕ"}
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <div class="flex justify-between items-center">
          <div class="text-sm font-bold">Журнал (сначала новые)</div>
          <button class="btn btn-xs" on:click={() => $setLogs([])}>
            Очистить
          </button>
        </div>
        <div class="bg-black text-success p-2 h-60 overflow-auto text-[10px] font-mono leading-tight">
          <For each={$logs()}>{(l) => <div>{l}</div>}</For>
        </div>
      </div>
    </div>
  );
}
