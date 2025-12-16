// Explicitly set `from` to silence PostCSS warnings about missing source path in dev
export default {
  from: undefined,
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
