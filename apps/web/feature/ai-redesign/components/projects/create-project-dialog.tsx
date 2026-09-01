"use client";

import * as React from "react";
import { Controller } from "react-hook-form";
import { ArrowRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { WORKFLOW_OPTIONS } from "@/feature/ai-redesign/constants";
import { useCreateProject } from "@/feature/ai-redesign/hooks/projects/use-create-project";
import type { RoomTypeOption } from "@/feature/ai-redesign/hooks/projects/use-room-type-select";

function Field({
  label,
  htmlFor,
  optional,
  children,
}: {
  label: string;
  htmlFor?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="flex items-baseline gap-1.5 text-sm font-medium text-fg-1"
      >
        {label}
        {optional && (
          <span className="text-xs font-normal text-fg-3">optional</span>
        )}
      </label>
      {children}
    </div>
  );
}

export function CreateProjectDialog({
  children,
}: {
  children: React.ReactElement;
}) {
  const { open, onOpenChange, form, roomType, submit, isSubmitting } =
    useCreateProject();
  const {
    register,
    control,
    formState: { isValid },
  } = form;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={children} />

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a project</DialogTitle>
          <DialogDescription>
            Name your project and choose how you want to start.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label="Title" htmlFor="project-title">
            <Input
              id="project-title"
              {...register("name")}
              placeholder="e.g. Cozy living room refresh"
              autoFocus
            />
          </Field>

          <Field label="Description" htmlFor="project-description" optional>
            <Textarea
              id="project-description"
              {...register("description")}
              rows={3}
              placeholder="What are you going for? Add any context to carry into the builder."
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Room type">
              <Combobox<RoomTypeOption>
                items={roomType.items}
                value={roomType.selected}
                onValueChange={roomType.onValueChange}
                inputValue={roomType.inputValue}
                onInputValueChange={roomType.onInputValueChange}
                autoHighlight
              >
                <ComboboxTrigger aria-label="Room type">
                  <span
                    className={
                      roomType.selected ? "truncate" : "truncate text-fg-3"
                    }
                  >
                    {roomType.selected
                      ? roomType.selected.label
                      : "Select or add…"}
                  </span>
                </ComboboxTrigger>
                <ComboboxContent>
                  <ComboboxInput placeholder="Search or add a room type…" />
                  {roomType.isLoading && (
                    <ComboboxEmpty>Loading room types…</ComboboxEmpty>
                  )}
                  <ComboboxList>
                    {(item: RoomTypeOption) =>
                      item.kind === "create" ? (
                        <ComboboxItem
                          key={item.value}
                          value={item}
                          className="font-medium text-terracotta"
                        >
                          <Plus
                            aria-hidden
                            className="size-4"
                            strokeWidth={2}
                          />
                          <span className="truncate">
                            Create “{item.label}”
                          </span>
                        </ComboboxItem>
                      ) : (
                        <ComboboxItem key={item.value} value={item}>
                          <span className="truncate">{item.label}</span>
                        </ComboboxItem>
                      )
                    }
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </Field>

            <Field label="Project type">
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select
                    items={WORKFLOW_OPTIONS.map((option) => ({
                      value: option.type,
                      label: option.title,
                    }))}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger aria-label="Project type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WORKFLOW_OPTIONS.map((option) => (
                        <SelectItem key={option.type} value={option.type}>
                          {option.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>

          <DialogFooter className="mt-1">
            <DialogClose
              render={
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              }
            />
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? "Creating…" : "Create project"}
              <ArrowRight aria-hidden strokeWidth={2} />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
