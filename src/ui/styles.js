// All panel styles; injected as a <style> inside the shadow root
export const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, sans-serif; }
  #ab-fab {
    position: fixed; bottom: 24px; right: 24px; z-index: 2147483647;
    width: 52px; height: 52px; border-radius: 50%;
    color: #fff; font-size: 22px; border: none; cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,.3);
    display: flex; align-items: center; justify-content: center;
    background: var(--ab-color);
  }
  #ab-panel {
    position: fixed; bottom: 86px; right: 24px; z-index: 2147483646;
    width: 440px; max-height: 80vh; background: #fff; border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,.18); display: flex; flex-direction: column; overflow: hidden;
  }
  #ab-panel.hidden { display: none; }
  #ab-panel.ab-expanded {
    top: 12px; left: 12px; right: 12px; bottom: 12px;
    width: auto; max-height: none;
  }
  .ab-header {
    color: #fff; padding: 12px 16px; font-size: 15px; font-weight: 600;
    display: flex; justify-content: space-between; align-items: center;
    background: var(--ab-color);
  }
  .ab-header button { background: none; border: none; color: #fff; font-size: 18px; cursor: pointer; }
  .ab-session-bar {
    padding: 6px 14px; font-size: 12px; display: flex; align-items: center; gap: 6px;
    border-bottom: 1px solid #e5e7eb;
  }
  .ab-session-bar.ok { background: #f0fdf4; color: #166534; }
  .ab-session-bar.waiting { background: #fffbeb; color: #92400e; }
  .ab-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .ok .ab-dot { background: #16a34a; }
  .waiting .ab-dot { background: #d97706; animation: ab-pulse 1.5s infinite; }
  @keyframes ab-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  .ab-body { padding: 14px 16px; overflow-y: auto; flex: 1; }
  .ab-row { display: flex; gap: 8px; margin-bottom: 10px; }
  .ab-row label { font-size: 12px; color: #666; display: block; margin-bottom: 3px; }
  .ab-row .ab-field { flex: 1; }
  input[type=text], input[type=date], select {
    width: 100%; padding: 7px 9px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; outline: none;
    background: #fff;
  }
  input:focus, select:focus { border-color: var(--ab-color); }
  .ab-combo { position: relative; }
  .ab-combo-box {
    display: flex; flex-wrap: wrap; gap: 4px; align-items: center;
    min-height: 34px; padding: 4px 6px; border: 1px solid #ddd; border-radius: 6px;
    cursor: text; background: #fff;
  }
  .ab-combo-box:focus-within { border-color: var(--ab-color); }
  .ab-chip {
    display: inline-flex; align-items: center; gap: 3px;
    background: var(--ab-color); color: #fff; border-radius: 4px;
    padding: 1px 5px; font-size: 12px; white-space: nowrap;
  }
  .ab-chip-x { background: none; border: none; color: #fff; cursor: pointer; font-size: 13px; padding: 0 1px; line-height: 1; }
  .ab-combo-input { border: none; outline: none; font-size: 13px; flex: 1; min-width: 60px; padding: 1px 2px; }
  .ab-combo-drop {
    position: absolute; top: 100%; left: 0; right: 0; z-index: 9999;
    background: #fff; border: 1px solid #ddd; border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,.12); max-height: 180px; overflow-y: auto; margin-top: 2px;
  }
  .ab-combo-opt { padding: 6px 10px; font-size: 12px; cursor: pointer; }
  .ab-combo-opt:hover { background: #f0f4ff; }
  .ab-combo-opt strong { font-size: 13px; }
  .ab-cabins { display: flex; gap: 6px; flex-wrap: wrap; }
  .ab-cabin-btn {
    padding: 4px 10px; border-radius: 20px; border: 1.5px solid #ddd;
    font-size: 12px; cursor: pointer; background: #fff; transition: all .15s;
  }
  .ab-search-btn {
    width: 100%; padding: 9px; color: #fff; border: none; border-radius: 7px;
    font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 6px;
    background: var(--ab-color);
  }
  .ab-search-btn:disabled { background: #aaa !important; cursor: not-allowed; }
  .ab-status { font-size: 12px; color: #666; margin-top: 8px; min-height: 16px; }
  .ab-progress { height: 4px; background: #e5e7eb; border-radius: 2px; margin-top: 6px; }
  .ab-progress-bar { height: 100%; border-radius: 2px; transition: width .3s; background: var(--ab-color); }
  .ab-results { margin-top: 12px; overflow-x: auto; }
  .ab-flt-bar { display: flex; flex-wrap: nowrap; gap: 6px; margin-bottom: 8px; align-items: center; overflow-x: auto; padding-bottom: 2px; }
  .ab-flt-bar::-webkit-scrollbar { height: 3px; }
  .ab-flt-bar::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }
  .ab-flt-sep { width: 1px; min-width: 1px; background: #e0e0e0; height: 16px; margin: 0 3px; flex-shrink: 0; }
  .ab-flt-btn { padding: 4px 11px; border-radius: 20px; border: 1.5px solid #ddd; font-size: 11px; cursor: pointer; background: #fff; color: #555; white-space: nowrap; flex-shrink: 0; }
  .ab-flt-btn:hover { border-color: #aaa; }
  .ab-flt-btn.active { background: #fff; border-color: var(--ab-color); color: var(--ab-color); font-weight: 600; }
  .ab-pill { position: relative; flex-shrink: 0; }
  .ab-pill-btn { display: flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 20px; border: 1.5px solid #ddd; font-size: 12px; cursor: pointer; background: #fff; color: #555; white-space: nowrap; transition: border-color .15s; }
  .ab-pill-btn:hover { border-color: #aaa; background: #fafafa; }
  .ab-pill-btn.active { border-color: var(--ab-color); color: var(--ab-color); font-weight: 600; background: #eef4ff; }
  .ab-pill-chevron { font-size: 9px; opacity: .55; transition: transform .15s; }
  .ab-pill-btn.open .ab-pill-chevron { transform: rotate(180deg); }
  .ab-drop { position: fixed; z-index: 2147483647; background: #fff; border: 1.5px solid #e0e0e0; border-radius: 12px; box-shadow: 0 4px 18px rgba(0,0,0,.12); padding: 6px; min-width: 140px; display: none; }
  .ab-drop.open { display: block; }
  .ab-drop-item { display: block; width: 100%; text-align: left; padding: 6px 12px; border-radius: 8px; border: none; font-size: 12px; cursor: pointer; background: none; color: #444; white-space: nowrap; }
  .ab-drop-item:hover { background: #f3f4f6; }
  .ab-drop-item.active { background: #eef4ff; color: var(--ab-color); font-weight: 600; }
  .ab-tbl { width: 100%; border-collapse: collapse; font-size: 12px; white-space: nowrap; }
  .ab-tbl th {
    text-align: left; font-size: 11px; font-weight: 600; color: #888;
    padding: 4px 8px; border-bottom: 2px solid #e5e7eb; background: #fafafa;
  }
  .ab-tbl td { padding: 6px 8px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
  .ab-tbl tr:hover td { background: #f8fafc; }
  .ab-cab-cell { min-width: 80px; color: #bbb; font-size: 11px; }
  .ab-cab-avail { color: #111; }
  .ab-cab-stops { font-size: 10px; color: #888; }
  .ab-cab-miles { font-weight: 600; }
  .ab-route { color: #666; font-size: 11px; }
  .ab-months { display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; }
  .ab-month-btn { padding: 5px 0; border-radius: 6px; border: 1px solid #ddd; font-size: 12px; cursor: pointer; background: #fff; color: #555; }
  .ab-month-btn:hover { border-color: var(--ab-color); }
  .ab-month-btn.sel { background: var(--ab-color); border-color: transparent; color: #fff; }
  .ab-summary {
    display: flex; align-items: center; gap: 8px; padding: 7px 10px; margin-bottom: 4px;
    background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 12px; color: #333;
  }
  .ab-summary span { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ab-summary button { background: none; border: none; color: var(--ab-color); font-size: 12px; font-weight: 600; cursor: pointer; }
  .ab-link-btn { background: none; border: none; color: var(--ab-color); font-size: 11px; font-weight: 600; cursor: pointer; margin-left: 6px; }
  .ab-no-results { text-align: center; color: #999; font-size: 13px; padding: 20px 0; }
  .ab-mode-toggle { display: flex; gap: 0; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 6px; overflow: hidden; }
  .ab-mode-btn { flex: 1; padding: 5px; font-size: 12px; background: #fff; border: none; cursor: pointer; color: #666; }
  .ab-mode-btn.active { background: var(--ab-color); color: #fff; }
  .ab-cal-months { overflow-y: auto; }
  .ab-cal-month { margin-bottom: 16px; }
  .ab-cal-month-name { font-weight: 600; font-size: 13px; margin-bottom: 4px; }
  .ab-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
  .ab-cal-dow { font-size: 10px; color: #999; text-align: center; padding: 2px 0; }
  .ab-cal-day { min-height: 38px; border: 1px solid #f0f0f0; border-radius: 4px; padding: 2px 3px; }
  .ab-cal-day.avail { cursor: pointer; background: #f8fafc; }
  .ab-cal-day.avail:hover { background: #e8f4ff; }
  .ab-cal-day.sel { outline: 2px solid var(--ab-color); outline-offset: -1px; }
  .ab-cal-day-num { font-size: 10px; color: #666; }
  .ab-cal-m { padding: 1px 3px; border-radius: 3px; font-size: 9px; color: #fff; white-space: nowrap; margin-top: 1px; display: block; }
  .ab-drp { position: relative; }
  .ab-drp-input {
    width: 100%; padding: 7px 9px; border: 1px solid #ddd; border-radius: 6px;
    font-size: 13px; cursor: pointer; background: #fff; display: flex; align-items: center; gap: 6px;
  }
  .ab-drp-input:hover { border-color: #aaa; }
  .ab-drp-input.open { border-color: var(--ab-color); }
  .ab-drp-text { flex: 1; color: #333; user-select: none; }
  .ab-drp-clear { background: none; border: none; cursor: pointer; font-size: 16px; color: #bbb; padding: 0; line-height: 1; }
  .ab-drp-popup {
    position: fixed; z-index: 9999;
    background: #fff; border: 1px solid #ddd; border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0,0,0,.15); padding: 12px; width: 280px;
  }
  .ab-drp-cal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .ab-drp-cal-title { font-size: 14px; font-weight: 600; }
  .ab-drp-nav { background: none; border: none; cursor: pointer; font-size: 18px; color: #555; padding: 2px 8px; border-radius: 4px; }
  .ab-drp-nav:hover { background: #f0f0f0; }
  .ab-drp-dow { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 2px; }
  .ab-drp-dow span { text-align: center; font-size: 10px; color: #999; padding: 3px 0; }
  .ab-drp-days { display: grid; grid-template-columns: repeat(7, 1fr); }
  .ab-drp-day {
    aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
    font-size: 12px; border-radius: 4px; cursor: pointer; border: none; background: none; padding: 0;
  }
  .ab-drp-day:not(:disabled):hover { background: #e8f0ff; }
  .ab-drp-day.in-range { background: #dbeafe; border-radius: 0; }
  .ab-drp-day.range-start { background: #dbeafe; border-radius: 4px 0 0 4px; }
  .ab-drp-day.range-end { background: #dbeafe; border-radius: 0 4px 4px 0; }
  .ab-drp-day.sel { background: var(--ab-color) !important; color: #fff; border-radius: 4px; }
  .ab-drp-day:disabled { color: #ccc; cursor: default; }
  .ab-drp-presets { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 10px; padding-top: 8px; border-top: 1px solid #f0f0f0; }
  .ab-drp-preset {
    padding: 3px 8px; border-radius: 20px; border: 1px solid #ddd;
    font-size: 11px; cursor: pointer; background: #fff; color: #555;
  }
  .ab-drp-preset:hover { border-color: var(--ab-color); color: var(--ab-color); }
  @media (max-width: 480px) {
    #ab-panel { width: calc(100vw - 24px); right: 12px; bottom: 80px; }
    #ab-fab { bottom: 16px; right: 16px; }
  }
`
