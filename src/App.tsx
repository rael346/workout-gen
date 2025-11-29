import EditRoutine from "./EditRoutine";
import WorkoutSession from "./WorkoutSession";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function App() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Tabs defaultValue="edit">
        <TabsList>
          <TabsTrigger value="session">Session Screen</TabsTrigger>
          <TabsTrigger value="edit">Edit Screen</TabsTrigger>
        </TabsList>
        <TabsContent value="session">
          <WorkoutSession />
        </TabsContent>
        <TabsContent value="edit">
          <EditRoutine />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default App;
