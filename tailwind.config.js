module.exports = {
  purge: ["./index.html"],
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
