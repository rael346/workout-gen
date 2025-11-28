import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";
import { Info, MoveDown, MoveUp, Check, X } from "lucide-react";
import { Spinner } from "./components/ui/spinner";

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

const ORIGINAL: Exercise[] = [
  { name: "Dips", reps: 10, sets: 4 },
  { name: "Pullups", reps: 12, sets: 3 },
  { name: "Rows", reps: 20, sets: 3 },
  { name: "Squats", reps: 30, sets: 3 },
];

const REMIXED: Exercise[] = [
  {
    name: "Benchpress",
    reps: 10,
    sets: 4,
    edit: {
      reason:
        "You have great expertise with this exercise and you are making good progress on it",
      state: "none",
      prev: ORIGINAL[0],
    },
  },
  {
    name: "Lat pulldown",
    reps: 12,
    sets: 3,
    edit: {
      reason: "You haven't done this exercise in a while",
      state: "none",
      prev: ORIGINAL[1],
    },
  },
  { name: "Rows", reps: 20, sets: 3 },
  { name: "Squats", reps: 30, sets: 3 },
];

const CHILLED: Exercise[] = [
  {
    name: "Pushups",
    reps: 10,
    sets: 4,
    edit: {
      reason:
        "Pushup is an easier pushing exercise that you have a lot of experience in",
      state: "none",
      prev: ORIGINAL[0],
    },
  },
  {
    name: "Pullups",
    reps: 6,
    sets: 3,
    edit: {
      reason:
        "You tend to lower the reps on this exercise when you are under the weather",
      state: "none",
      prev: ORIGINAL[1],
    },
  },
  {
    name: "Rows",
    reps: 10,
    sets: 3,
    edit: {
      reason: "You tend to be more fatigue after doing an upper body day",
      state: "none",
      prev: ORIGINAL[2],
    },
  },
  {
    name: "Squats",
    reps: 30,
    sets: 3,
    edit: {
      reason: "Amount of exercises is higher than the average",
      state: "remove",
      prev: PLACEHOLDER_EXERCISE,
    },
  },
];

const CHALLENGES: Exercise[] = [
  {
    name: "Pushups",
    reps: 20,
    sets: 3,
    edit: {
      reason:
        "You have great expertise in this exercise, which is a great warmup before dips",
      state: "add",
      prev: PLACEHOLDER_EXERCISE,
    },
  },
  {
    name: "Dips",
    reps: 10,
    sets: 4,
  },
  {
    name: "Pullups",
    reps: 12,
    sets: 3,
  },
  {
    name: "Rows",
    reps: 20,
    sets: 3,
  },
  {
    name: "Squats",
    reps: 50,
    sets: 3,
    edit: {
      reason: "Your progression on squats have been great",
      state: "none",
      prev: ORIGINAL[3],
    },
  },
];

function WorkoutSession() {
  const [exercises, setExercises] = useState<Exercise[]>(ORIGINAL);
  const [action, setAction] = useState<"remix" | "chill" | "challenge" | null>(
    null,
  );

  const updateExercise = (
    index: number,
    field: "reps" | "sets",
    value: string,
  ) => {
    const numValue = parseInt(value) || 0;
    const newExercises = [...exercises];
    newExercises[index][field] = numValue;
    setExercises(newExercises);
  };

  const handleAccept = (index: number) => {
    return () => {
      const ex = exercises[index];
      var newExercises: Exercise[] = [];
      if (ex.edit === undefined)
        throw new Error("edit should not be undefined");

      if (ex.edit.state === "add") {
        newExercises = exercises.map((ex, i) => ({
          ...ex,
          edit: i === index ? undefined : ex.edit,
        }));
      }

      // remove the exercise if the removal is accepted
      if (ex.edit.state === "remove") {
        newExercises = exercises
          .slice(0, index)
          .concat(exercises.slice(index + 1));
      }

      if (ex.edit.state === "none") {
        newExercises = exercises.map((ex, i) => ({
          ...ex,
          edit: i === index ? undefined : ex.edit,
        }));
      }

      // clear the old exercises and reset the action when
      // every edits are done
      if (newExercises.every((ex) => ex.edit === undefined)) {
        setAction(null);
      }
      setExercises(newExercises);
    };
  };

  const handleReject = (index: number) => {
    return () => {
      const ex = exercises[index];
      var newExercises: Exercise[] = [];
      if (ex.edit === undefined)
        throw new Error("edit should not be undefined");

      // remove the exercise if rejecting the new addition
      if (ex.edit.state === "add") {
        newExercises = exercises
          .slice(0, index)
          .concat(exercises.slice(index + 1));
      }

      // keep the exercise
      if (ex.edit.state === "remove") {
        newExercises = exercises.map((ex, i) => ({
          ...ex,
          edit: i === index ? undefined : ex.edit,
        }));
      }

      // revert the changes for diff stats
      if (ex.edit.state === "none") {
        newExercises = exercises.map((e, i) => ({
          name: i === index ? e.edit!.prev.name : e.name,
          reps: i === index ? e.edit!.prev.reps : e.reps,
          sets: i === index ? e.edit!.prev.sets : e.sets,
          edit: i === index ? undefined : e.edit,
        }));
      }

      // clear the old exercises and reset the action when
      // every edits are done
      if (newExercises.every((ex) => ex.edit === undefined)) {
        setAction(null);
      }
      setExercises(newExercises);
    };
  };

  const handleRemix = () => {
    setExercises(REMIXED);
    setAction("remix");
  };

  const handleChill = () => {
    setExercises(CHILLED);
    setAction("chill");
  };

  const handleChallenge = () => {
    setExercises(CHALLENGES);
    setAction("challenge");
  };

  return (
    <Card className="flex items-center max-w-2xl shadow-lg">
      <CardHeader className="w-full pb-4">
        <CardTitle className="text-2xl font-bold text-center">
          Workout Session
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          {exercises.map((exercise, index) => (
            <div key={index} className="flex items-center justify-center gap-4">
              <span
                className={cn("font-medium text-lg w-24", {
                  "text-yellow-600":
                    exercise.edit &&
                    exercise.edit.state === "none" &&
                    exercise.edit.prev.name !== exercise.name,
                  "text-gray-300":
                    exercise.edit && exercise.edit.state === "remove",
                  "text-sky-500":
                    exercise.edit && exercise.edit.state === "add",
                })}
              >
                {exercise.name}
              </span>

              <div className="flex gap-2">
                <InputGroup
                  className={cn("w-32", {
                    "text-gray-300":
                      exercise.edit && exercise.edit.state === "remove",
                    "text-sky-500":
                      exercise.edit && exercise.edit.state === "add",
                  })}
                >
                  <InputGroupInput
                    type="number"
                    value={exercise.reps}
                    min={1}
                    onChange={(e) =>
                      updateExercise(index, "reps", e.target.value)
                    }
                  />
                  <InputGroupAddon align="inline-end">
                    {exercise.edit &&
                      exercise.edit.state === "none" &&
                      (exercise.edit.prev.reps < exercise.reps ? (
                        <MoveUp className="text-green-600" />
                      ) : (
                        exercise.edit.prev.reps > exercise.reps && (
                          <MoveDown className="text-red-600" />
                        )
                      ))}
                    <InputGroupText
                      className={cn("", {
                        "text-gray-300":
                          exercise.edit && exercise.edit.state === "remove",
                        "text-sky-500":
                          exercise.edit && exercise.edit.state === "add",
                      })}
                    >
                      reps
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>

                <InputGroup
                  className={cn("w-32", {
                    "text-gray-300":
                      exercise.edit && exercise.edit.state === "remove",
                    "text-sky-500":
                      exercise.edit && exercise.edit.state === "add",
                  })}
                >
                  <InputGroupInput
                    type="number"
                    value={exercise.sets}
                    min={1}
                    onChange={(e) =>
                      updateExercise(index, "sets", e.target.value)
                    }
                  />
                  <InputGroupAddon align="inline-end">
                    {exercise.edit &&
                      exercise.edit.state === "none" &&
                      (exercise.edit.prev.sets < exercise.sets ? (
                        <MoveUp className="text-green-600" />
                      ) : (
                        exercise.edit.prev.sets > exercise.sets && (
                          <MoveDown className="text-red-600" />
                        )
                      ))}
                    <InputGroupText
                      className={cn("", {
                        "text-gray-300":
                          exercise.edit && exercise.edit.state === "remove",
                        "text-sky-500":
                          exercise.edit && exercise.edit.state === "add",
                      })}
                    >
                      sets
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>

                {exercise.edit !== undefined && (
                  <>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Info />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        {exercise.edit.reason}
                      </PopoverContent>
                    </Popover>

                    <ButtonGroup orientation="horizontal" className="w-fit">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="bg-green-400 hover:bg-green-600"
                        onClick={handleAccept(index)}
                      >
                        <Check />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="bg-red-400 hover:bg-red-600"
                        onClick={handleReject(index)}
                      >
                        <X />
                      </Button>
                    </ButtonGroup>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="space-x-3 pt-4 flex flex-row justify-center">
          <Button
            onClick={handleRemix}
            variant="outline"
            className={cn(
              "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300",
              {
                hidden: action === "chill" || action === "challenge",
              },
            )}
            disabled={action === "remix"}
          >
            {action === "remix" && <Spinner />}
            Remix
          </Button>
          <Button
            onClick={handleChill}
            variant="outline"
            className={cn(
              "hover:bg-green-50 hover:text-green-700 hover:border-green-300",
              {
                hidden: action === "remix" || action === "challenge",
              },
            )}
            disabled={action === "chill"}
          >
            {action === "chill" && <Spinner />}
            Chill
          </Button>
          <Button
            onClick={handleChallenge}
            variant="outline"
            className={cn(
              "hover:bg-red-50 hover:text-red-700 hover:border-red-300",
              {
                hidden: action === "remix" || action === "chill",
              },
            )}
            disabled={action === "challenge"}
          >
            {action === "challenge" && <Spinner />}
            Need a Challenge?
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default WorkoutSession;
