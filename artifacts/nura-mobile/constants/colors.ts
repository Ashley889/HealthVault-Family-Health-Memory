/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    text: '#183b59',
    tint: '#2784bd',
    background: '#f7fbfe',
    foreground: '#183b59',
    card: '#ffffff',
    cardForeground: '#183b59',
    primary: '#2784bd',
    primaryForeground: '#ffffff',
    secondary: '#eaf5fb',
    secondaryForeground: '#315a76',
    muted: '#eef6fa',
    mutedForeground: '#71899d',
    accent: '#d9efff',
    accentForeground: '#20597e',
    destructive: '#b65d59',
    destructiveForeground: '#ffffff',
    border: '#dcebf4',
    input: '#c8dce8',
    sky: '#e8f5fc',
    softBlue: '#dff1fb',
    inkSoft: '#315a76',
    cream: '#fffdf8',
    success: '#5f8b83',
  },
  radius: 20,
};

export default colors;
