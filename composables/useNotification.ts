import { useState } from "react";

type NotificationType = "success" | "error";

export function useNotification() {
  const [snackbar, setSnackbar] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<"green" | "red">("green");

  function showNotification(
    newTitle: string,
    newDescription: string,
    type: NotificationType = "success"
  ) {
    setTitle(newTitle);
    setDescription(newDescription);
    setColor(type === "success" ? "green" : "red");
    setSnackbar(true);
  }

  return {
    snackbar,
    title,
    description,
    color,
    showNotification,
    setSnackbar, // Added for closing the notification
  };
}
