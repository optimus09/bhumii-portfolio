const EVENT_NAME = 'open-contact-modal'

export function openContactModal() {
  window.dispatchEvent(new CustomEvent(EVENT_NAME))
}

export function onOpenContactModal(callback: () => void) {
  window.addEventListener(EVENT_NAME, callback)
  return () => window.removeEventListener(EVENT_NAME, callback)
}
