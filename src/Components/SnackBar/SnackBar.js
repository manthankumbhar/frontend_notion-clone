import React, { useCallback } from "react";
import { Alert, Snackbar } from "@mui/material";

export default function SnackBar({
  setOpenSnackBar,
  openSnackBar,
  snackBarSeverity,
  snackBarMessage,
}) {
  const handleClose = useCallback(
    (event, reason) => {
      if (reason === "clickaway") {
        return;
      }
      setOpenSnackBar(false);
    },
    [setOpenSnackBar]
  );

  return (
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      open={openSnackBar}
      autoHideDuration={4000}
      onClose={handleClose}
    >
      <Alert
        severity={snackBarSeverity}
        sx={{ width: "30rem", fontSize: "1.4rem" }}
      >
        {snackBarMessage}
      </Alert>
    </Snackbar>
  );
}
