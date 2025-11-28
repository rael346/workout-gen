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
    state: "remove" | "none" | "add";
    nameDiff: boolean;
    repDiff: "decrease" | "none" | "increase";
    setDiff: "decrease" | "none" | "increase";
  };
};

function WorkoutSession() {
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: "Dips", reps: 10, sets: 4 },
    { name: "Pullups", reps: 12, sets: 3 },
    { name: "Rows", reps: 40, sets: 3 },
    { name: "Squats", reps: 30, sets: 3 },
  ]);
  const [oldExercises, setOldExercises] = useState<Exercise[] | null>(null);
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

  const acceptChange = (index: number) => {
    return () => {
      const ex = exercises[index];
      var newExercises: Exercise[] = [];
      if (ex.edit && ex.edit.state === "remove") {
        // remove the exercise if the removal is accepted
        newExercises = exercises
          .slice(0, index)
          .concat(exercises.slice(index + 1));
      } else {
        newExercises = exercises.map((ex, i) => ({
          ...ex,
          edit: i === index ? undefined : ex.edit,
        }));
      }

      console.log("accept exercises", newExercises);
      if (newExercises.every((ex) => ex.edit === undefined)) {
        console.log("accept set action");
        setOldExercises(null);
        setAction(null);
      }
      setExercises(newExercises);
    };
  };

  const rejectChange = (index: number) => {
    return () => {
      const ex = exercises[index];
      var newExercises: Exercise[] = [];
      if (ex.edit && ex.edit.state === "add") {
        // remove the exercise if rejecting the new addition
        newExercises = exercises
          .slice(0, index)
          .concat(exercises.slice(index + 1));
      } else {
        const oldExercise = oldExercises![index];
        newExercises = exercises.map((ex, i) => ({
          name: i === index ? oldExercise.name : ex.name,
          reps: i === index ? oldExercise.reps : ex.reps,
          sets: i === index ? oldExercise.sets : ex.sets,
          edit: i === index ? undefined : ex.edit,
        }));
      }

      console.log("reject exercises", newExercises);
      if (newExercises.every((ex) => ex.edit === undefined)) {
        console.log("reject set action");
        setOldExercises(null);
        setAction(null);
      }
      setExercises(newExercises);
    };
  };

  const handleRemix = () => {
    // Shuffle exercises while keeping the same structure
    const shuffled = [...exercises].sort(() => Math.random() - 0.5);
    setExercises(shuffled);
  };

  const handleChill = () => {
    const chilled: Exercise[] = [
      {
        name: "Pushups",
        reps: 10,
        sets: 4,
        edit: {
          reason:
            "Pushup is an easier pushing exercise that you have a lot of experience in",
          state: "none",
          nameDiff: true,
          repDiff: "none",
          setDiff: "none",
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
          nameDiff: false,
          repDiff: "decrease",
          setDiff: "none",
        },
      },
      {
        name: "Rows",
        reps: 20,
        sets: 3,
        edit: {
          reason: "You tend to be more fatigue after doing an upper body day",
          state: "none",
          nameDiff: false,
          repDiff: "decrease",
          setDiff: "none",
        },
      },
      {
        name: "Squats",
        reps: 30,
        sets: 3,
        edit: {
          reason: "Amount of exercises is higher than the average",
          state: "remove",
          nameDiff: false,
          repDiff: "none",
          setDiff: "none",
        },
      },
    ];
    setOldExercises(exercises);
    setExercises(chilled);
    setAction("chill");
  };

  const handleChallenge = () => {
    // Increase reps and sets by 20%
    const challenged = exercises.map((ex) => ({
      ...ex,
      reps: Math.ceil(ex.reps * 1.2),
      sets: Math.ceil(ex.sets * 1.2),
    }));
    setExercises(challenged);
  };

  return (
    <Card className="flex items-center max-w-2xl shadow-lg">
      <CardHeader className="w-full pb-4">
        <CardTitle className="text-2xl font-bold text-center">
          Upper Body Session
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          {exercises.map((exercise, index) => (
            <div key={index} className="flex items-center justify-center gap-4">
              <span
                className={cn("font-medium text-lg w-24", {
                  "text-yellow-600": exercise.edit && exercise.edit.nameDiff,
                  "text-gray-300":
                    exercise.edit && exercise.edit.state === "remove",
                })}
              >
                {exercise.name}
              </span>

              <div className="flex gap-2">
                <InputGroup
                  className={cn("w-32", {
                    "text-gray-300":
                      exercise.edit && exercise.edit.state === "remove",
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
                      exercise.edit.repDiff !== "none" &&
                      (exercise.edit.repDiff == "increase" ? (
                        <MoveUp className="text-green-600" />
                      ) : (
                        <MoveDown className="text-red-600" />
                      ))}
                    <InputGroupText
                      className={cn("", {
                        "text-gray-300":
                          exercise.edit && exercise.edit.state === "remove",
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
                      exercise.edit.setDiff !== "none" &&
                      (exercise.edit.setDiff == "increase" ? (
                        <MoveUp className="text-green-600" />
                      ) : (
                        <MoveDown className="text-red-600" />
                      ))}
                    <InputGroupText
                      className={cn("", {
                        "text-gray-300":
                          exercise.edit && exercise.edit.state === "remove",
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
                        onClick={acceptChange(index)}
                      >
                        <Check />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="bg-red-400 hover:bg-red-600"
                        onClick={rejectChange(index)}
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
          >
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
          >
            Need a Challenge?
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default WorkoutSession;
