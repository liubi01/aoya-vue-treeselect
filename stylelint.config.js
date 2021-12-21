module.exports = {
  extends: [
    "stylelint-config-xo-space",
    "stylelint-config-prettier",// 排除与 prettier 冲突的 rule
  ],
  rules: {
    "string-quotes": ["double", { avoidEscape: false }],
    "declaration-empty-line-before": null,
    "at-rule-empty-line-before": null,
    "selector-list-comma-newline-after": null,
    "rule-empty-line-before": null,
    "value-keyword-case": null, // [ 'lower', { ignoreProperties: [ 'font', 'font-family' ] } ],
    "declaration-block-no-duplicate-properties": [
      true,
      { ignore: ["consecutive-duplicates"] },
    ],
    "declaration-property-value-blacklist": null,
    "property-blacklist": null,
    "no-unknown-animations": null,
    "font-weight-notation": null,
    "no-descending-specificity": null,
    "selector-max-compound-selectors": null,
    "block-no-empty": [true, { ignore: [] }],
    "selector-class-pattern":null,
  },
};
