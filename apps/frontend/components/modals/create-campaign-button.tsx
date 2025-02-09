"use client";

import { Button } from "@workspace/ui/components/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CreateCampaignSheet } from "./create-campaign-modal";

interface CreateCampaignButtonProps {
  className?: string;
}

export const CreateCampaignButton = ({
  className,
}: CreateCampaignButtonProps) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button className={className} onClick={() => setShowModal(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Create Campaign
      </Button>
      <CreateCampaignSheet showModal={showModal} setShowModal={setShowModal} />
    </>
  );
};
