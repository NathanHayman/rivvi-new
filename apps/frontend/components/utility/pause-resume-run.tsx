import { Button } from "@workspace/ui/components/button";
import { Pause, Play } from "lucide-react";
import { useState } from "react";

const PauseResumeRun: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  return (
    <Button key="pause" variant="default" size="sm" onClick={handlePauseResume}>
      {isPaused ? (
        <>
          <Play className="h-4 w-4" />
          Resume Run
        </>
      ) : (
        <>
          <Pause className="h-4 w-4" />
          Pause Run
        </>
      )}
    </Button>
  );
};

export default PauseResumeRun;
