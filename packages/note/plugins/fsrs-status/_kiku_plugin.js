/**
 * @import { KikuPlugin } from "#/plugins/plugin-types";
 */

/** @type { KikuPlugin } */
export const plugin = {
  CardEnd: (props) => {
    const el = document.getElementById("FSRS_status");
    const text = el?.textContent ?? "";
    const d = text.match(/D:\s*([\d.]+%)/);
    const s = text.match(/S:\s*([\d.]+)\s*days?/);
    const r = text.match(/R:\s*([\d.]+%)/);
    if (!d && !s && !r) return null;

    const { html, Portal, useGeneralContext } = props.ctx;
    const { $general } = useGeneralContext();

    return html`<${Portal} mount=${$general.layoutRef ?? document.body}>
      <div class="fsrs-status">
        <div>Сложность: ${d ? d[1] : "—"}</div>
        <div>Стабильность: ${s ? s[1] + " дн." : "—"}</div>
        <div>Вероятность воспроизведения: ${r ? r[1] : "—"}</div>
      </div>
    <//>`;
  },
};
