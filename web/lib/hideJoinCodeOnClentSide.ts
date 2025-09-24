/**YES I KNOW THIS IS INSECURE AS HELL (THIS WILL BE FIXED WITH A NEW UPDATE THAT USES CONVEX _IDS INSTEAD OF JOINIDS) */
function maskJoinCode(code: string): string {
  // Handle different formats
  if (!code.includes("_")) {
    // If no underscore, just mask middle
    return code.slice(0, 4) + "***" + code.slice(-4);
  }

  // Split by underscore
  const parts = code.split("_");

  // Keep prefix intact (sinv_d_)
  const prefix = parts.slice(0, -1).join("_") + "_";

  // Mask the last part
  const lastPart = parts[parts.length - 1];
  const maskedLastPart = lastPart.slice(0, 2) + "***" + lastPart.slice(-2);

  return prefix + maskedLastPart;
}

export default maskJoinCode;
