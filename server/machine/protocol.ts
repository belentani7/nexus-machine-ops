import type { CommandType, OperationalRole } from "@shared/machine";

export type ProtocolActor = { id: number; role: "user" | "admin"; operationRole: OperationalRole };

export function effectiveRole(actor: ProtocolActor): OperationalRole {
  return actor.role === "admin" ? "policy_admin" : actor.operationRole;
}

export function evaluatePolicy(actor: ProtocolActor, type: CommandType, mode: "simulation", testMode: boolean) {
  const role = effectiveRole(actor);
  const allowedByRole = role === "policy_admin" || (role === "operator" && ["start", "stop", "pause", "resume", "acknowledge_alarm", "emergency_stop_simulation"].includes(type));
  const allowed = mode === "simulation" && testMode && allowedByRole;
  return {
    allowed,
    role,
    reason: allowed
      ? "La política SIM-1.0 permite preparar este comando exclusivamente contra el simulador."
      : "La política bloqueó el comando: rol insuficiente, modo no simulado o alcance no autorizado.",
  };
}

export function evaluateHumanApproval(input: { requesterId: number; approver: ProtocolActor; expiresAt: Date; now?: Date }) {
  const now = input.now ?? new Date();
  const role = effectiveRole(input.approver);
  if (input.requesterId === input.approver.id) return { approved: false, decision: "rejected" as const, reason: "La independencia del tercer nodo prohíbe que el solicitante apruebe su propio comando." };
  if (role !== "approver" && role !== "policy_admin") return { approved: false, decision: "rejected" as const, reason: "El rol no puede aprobar operaciones." };
  // An invalid or missing timestamp must fail closed rather than bypass expiry (NaN comparisons are false).
  const expires = input.expiresAt instanceof Date ? input.expiresAt.getTime() : NaN;
  const current = now instanceof Date ? now.getTime() : NaN;
  if (!Number.isFinite(expires) || !Number.isFinite(current) || expires <= current) return { approved: false, decision: "expired" as const, reason: "La ventana de aprobación expiró o su fecha no es válida." };
  return { approved: true, decision: "approved" as const, reason: "Aprobación humana explícita registrada para el modo simulación." };
}

export function tripleConfirmationComplete(input: { policy: boolean; risk: boolean; human: boolean }) {
  return input.policy && input.risk && input.human;
}
