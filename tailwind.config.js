module.exports = {
  purge: ["./dist/main.js"],
  theme: {
    screens: {
      sm: { max: "639px" },
    },
  },
  variants: {
    extend: {
      visibility: ["group-hover"],
      borderWidth: ["last"],
    },
  },
  plugins: [],
};
