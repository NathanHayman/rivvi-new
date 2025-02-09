"use client";

import { Button } from "@workspace/ui/components/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CreateRunSheet } from "./create-run-modal";

interface CreateRunModalButtonProps {
  className?: string;
  campaignId: string;
}

const CreateRunModalButton = ({
  className,
  campaignId,
}: CreateRunModalButtonProps) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button className={className} onClick={() => setShowModal(true)}>
        <Plus className="w-4 h-4" />
        Create a new run
      </Button>
      {/* <CreateRunModal
          campaignId={campaignId}
          showModal={showModal}
        setShowModal={setShowModal}
      /> */}
      <CreateRunSheet
        campaignId={campaignId}
        showModal={showModal}
        setShowModal={setShowModal}
      />
    </>
  );
};

export { CreateRunModalButton };
