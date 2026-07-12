export const toastState = $state({ msg: '', visible: false });
let timer: ReturnType<typeof setTimeout> | undefined;

export function toast(msg: string): void {
  toastState.msg = msg;
  toastState.visible = true;
  clearTimeout(timer);
  timer = setTimeout(() => (toastState.visible = false), 1900);
}
