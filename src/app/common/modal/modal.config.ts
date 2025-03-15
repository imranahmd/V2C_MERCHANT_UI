export interface ModalConfig {
  modalTitle: string
  modalSize: 'xxl' | 'xl' | 'lg' | 'sm'
  fullscreen?: boolean
  dismissButtonLabel?: string
  closeButtonLabel?: string

  shouldClose?(): Promise<boolean> | boolean

  shouldTopClose?(): Promise<boolean> | boolean

  shouldDismiss?(): Promise<boolean> | boolean

  onClose?(): Promise<boolean> | boolean

  onTopClose?(): Promise<boolean> | boolean

  onDismiss?(): Promise<boolean> | boolean

  disableCloseButton?(): boolean

  disableTopCloseButton?(): boolean

  disableDismissButton?(): boolean

  hideCloseButton?(): boolean

  hideTopCloseButton?(): boolean

  hideDismissButton?(): boolean
}
