type Exercise = {
  name: string;
  reps: number;
  sets: number;
  edit?: {
    reason: string;
    state: "remove" | "add" | "none";
    prev: Omit<Exercise, "edit">;
  };
};

const PLACEHOLDER_EXERCISE: Exercise = {
  name: "",
  reps: 0,
  sets: 0,
};

export type { Exercise };
export { PLACEHOLDER_EXERCISE };
