@AGENTS.md

# i18n 規則

本專案支援三國語言（ja / en / zh）。所有使用者可見的文字**一律不可硬編碼**，必須透過 `useDictionary()` 取得 `dict` 物件來使用。

- 語言檔位置：`src/lib/i18n/dictionaries/{ja,en,zh}.json`
- 新增任何文字時，三個語言檔都要同步更新
- 使用 `formatTemplate(dict.xxx, { key: value })` 來處理帶變數的字串
- 不要直接在元件裡寫日文、英文或中文字串
