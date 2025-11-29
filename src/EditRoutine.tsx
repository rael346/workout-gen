import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState } from "react";
import { Button } from "./components/ui/button";
import { cn } from "./lib/utils";
import { PLACEHOLDER_EXERCISE, type Exercise } from "./exercise";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "./components/ui/input-group";
import { Check, Info, MoveDown, MoveUp, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { ButtonGroup } from "./components/ui/button-group";
import { Spinner } from "./components/ui/spinner";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const ORIGINAL: Exercise[] = [
  { name: "Dips", reps: 10, sets: 4 },
  { name: "Pullups", reps: 12, sets: 3 },
  { name: "Rows", reps: 20, sets: 3 },
  { name: "Squats", reps: 30, sets: 3 },
];

const ADJUSTED: Exercise[] = [
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
  { name: "Rows", reps: 20, sets: 3 },
  {
    name: "Pistol Squats",
    reps: 10,
    sets: 3,
    edit: {
      reason:
        "Progress on squats seems to have plateau, so this is a good time to move to the next progression",
      state: "none",
      prev: ORIGINAL[3],
    },
  },
  {
    name: "Stretches",
    reps: 30,
    sets: 3,
    edit: {
      reason: "You seem to recover better after session with stretches",
      state: "add",
      prev: PLACEHOLDER_EXERCISE,
    },
  },
];

type DayState = {
  val: string[];
  prev?: string[];
  reason?: string;
};

function EditRoutine() {
  const [exercises, setExercises] = useState<Exercise[]>(ORIGINAL);
  const [days, setDays] = useState<DayState>({
    val: ["Mon", "Wed", "Fri"],
  });
  const [action, setAction] = useState<"adjust" | null>(null);

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

  const handleChange = (value: string[]) => {
    setDays({
      ...days,
      val: value,
    });
  };

  const handleAdjust = () => {
    setExercises(ADJUSTED);
    setDays({
      val: ["Mon", "Thu", "Sat"],
      prev: days.val,
      reason:
        "You have been very fatigue from your other session so this should give you more time to breathe",
    });
    setAction("adjust");
  };

  const handleAcceptDays = () => {
    setDays({
      ...days,
      prev: undefined,
      reason: undefined,
    });
    if (exercises.every((ex) => ex.edit === undefined)) {
      setAction(null);
    }
  };

  const handleRejectDays = () => {
    setDays({
      val: days.prev!,
      prev: undefined,
      reason: undefined,
    });
    if (exercises.every((ex) => ex.edit === undefined)) {
      setAction(null);
    }
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
      if (
        newExercises.every((ex) => ex.edit === undefined) &&
        days.prev === undefined
      ) {
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
      if (
        newExercises.every((ex) => ex.edit === undefined) &&
        days.prev === undefined
      ) {
        setAction(null);
      }
      setExercises(newExercises);
    };
  };

  return (
    <Card className="flex items-center max-w-2xl shadow-lg">
      <CardHeader className="w-full pb-4">
        <CardTitle className="text-2xl font-bold text-center">
          Edit Routine
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center justify-center">
          <div className="flex flex-row items-center justify-between space-x-2">
            <ToggleGroup
              type="multiple"
              variant="outline"
              value={days.val}
              onValueChange={handleChange}
            >
              {WEEKDAYS.map((day) => (
                <ToggleGroupItem
                  key={day}
                  value={day}
                  className={cn({
                    "data-[state=on]:bg-green-300": action === "adjust",
                    "bg-red-300":
                      days.prev &&
                      days.prev.includes(day) &&
                      !days.val.includes(day),
                  })}
                >
                  {day}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            {days.prev !== undefined && (
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Info />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    {days.reason}
                  </PopoverContent>
                </Popover>

                <ButtonGroup orientation="horizontal" className="w-fit">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="bg-green-400 hover:bg-green-600"
                    onClick={handleAcceptDays}
                  >
                    <Check />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="bg-red-400 hover:bg-red-600"
                    onClick={handleRejectDays}
                  >
                    <X />
                  </Button>
                </ButtonGroup>
              </>
            )}
          </div>
        </div>

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

        <div className="flex items-center justify-center pt-4">
          <Button
            onClick={handleAdjust}
            variant="outline"
            className={cn("")}
            disabled={action === "adjust"}
          >
            {action === "adjust" && <Spinner />}
            Adjust
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default EditRoutine;
