"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import { Dispatch, SetStateAction } from "react";
import TestForm from "../test-form";
import { Modal, ModalBody } from "./modal";

interface ModalProps {
  children?: React.ReactNode;
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
}

interface CreateRunModalProps extends ModalProps {
  campaignId: string;
}

const CreateRunModal = (props: CreateRunModalProps) => {
  return (
    <Modal showModal={props.showModal} setShowModal={props.setShowModal}>
      {/* <ModalHeader>
        <ModalTitle>Create a new run for {props.campaignId}</ModalTitle>
      </ModalHeader> */}
      <ModalBody className="sm:pt-4">
        <TestForm
          campaignId={props.campaignId}
          showModal={props.showModal}
          setShowModal={props.setShowModal}
        />
      </ModalBody>
    </Modal>
  );
};

const CreateRunSheet = (props: CreateRunModalProps) => {
  return (
    <Sheet open={props.showModal} onOpenChange={props.setShowModal}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Run this campaign</SheetTitle>
        </SheetHeader>
        <TestForm
          campaignId={props.campaignId}
          showModal={props.showModal}
          setShowModal={props.setShowModal}
        />
      </SheetContent>
    </Sheet>
  );
};

export { CreateRunModal, CreateRunSheet };
