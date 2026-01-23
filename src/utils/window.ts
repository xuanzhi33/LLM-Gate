import { getCurrentWindow } from '@tauri-apps/api/window'

/**
 * Show and focus the current window
 */
export async function showWindow() {
  const window = getCurrentWindow()

  const isMinimized = await window.isMinimized()
  if (isMinimized) {
    await window.unminimize()
  }

  const isVisible = await window.isVisible()
  if (!isVisible) {
    await window.show()
  }

  await window.setFocus()
}
