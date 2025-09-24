/**YES I KNOW THIS IS INSECURE AS HELL (THIS WILL BE FIXED WITH A NEW UPDATE THAT USES CONVEX _IDS INSTEAD OF JOINIDS) */
function maskJoinCode(code: string | unknown): string {
  // Ensure code is a string
  const codeStr = String(code || "");
  if (codeStr.length === 0) {
    return "";
  }
  // Handle different formats
  if (!codeStr.includes("_")) {
    // If no underscore, just mask middle
    return codeStr.slice(0, 4) + "***" + codeStr.slice(-4);
  }

  // Split by underscore
  const parts = codeStr.split("_");

  // Keep prefix intact (sinv_d_)
  const prefix = parts.slice(0, -1).join("_") + "_";

  // Mask the last part
  const lastPart = parts[parts.length - 1];
  const maskedLastPart = lastPart.slice(0, 2) + "***" + lastPart.slice(-2);

  return prefix + maskedLastPart;
}

export default maskJoinCode;
