import { installTranslationSuggestionLoader } from "./shared/translation-suggestion-loader.js?v=20261116c";

installTranslationSuggestionLoader(
  document.querySelector("[data-translation-suggestion]"),
  () => import("./translation-suggestion.js?v=20261116c"),
);
