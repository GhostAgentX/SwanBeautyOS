import "server-only"
// Composition root: registers every built-in module. Order = preference when several are available.
// To plug in a new subsystem, implement the interface from ./registry and register it here.
import { classicEnhancer, gatewayFormulator, gatewayImages, localDisk, ruleFormulator, vercelBlob } from "./builtin"
import { registry } from "./registry"

let ready = false
export function modules() {
  if (!ready) {
    registry.storage.register(vercelBlob).register(localDisk)
    registry.enhancers.register(classicEnhancer)
    registry.imageGenerators.register(gatewayImages)
    registry.formulators.register(gatewayFormulator).register(ruleFormulator)
    ready = true
  }
  return registry
}

export function activeStorage() {
  const m = modules().storage.preferred()
  if (!m) throw new Error("No storage module is available. On Vercel, connect a Blob store (BLOB_READ_WRITE_TOKEN).")
  return m.storage
}
