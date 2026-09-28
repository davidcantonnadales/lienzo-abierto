export type Artwork = {
  id: string;
  title: string;
  category: string;
  description: string;
  src: string;
  local?: boolean;
  created: number;
};
export const catalog: Artwork[] = [
  {
    id: "faro",
    title: "Donde empieza el mar",
    category: "Naturaleza",
    description:
      "Un faro pequeño, un horizonte inmenso. Ilustración original generada con IA para este proyecto.",
    src: "/art/faro.webp",
    created: 4,
  },
  {
    id: "bosque",
    title: "El bosque de las pequeñas cosas",
    category: "Imaginación",
    description:
      "Un zorro, un sendero y una luz entre los árboles. Ilustración original generada con IA.",
    src: "/art/bosque.webp",
    created: 3,
  },
  {
    id: "ciudad",
    title: "La ciudad que mira al sol",
    category: "Arquitectura",
    description:
      "Casas de papel, patios y escaleras con luz mediterránea. Ilustración original generada con IA.",
    src: "/art/ciudad.webp",
    created: 2,
  },
  {
    id: "cosmos",
    title: "Un jardín entre las estrellas",
    category: "Imaginación",
    description:
      "Un pequeño invernadero espacial para grandes ideas. Ilustración original generada con IA.",
    src: "/art/cosmos.webp",
    created: 1,
  },
];
