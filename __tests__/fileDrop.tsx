import { fireEvent } from "@testing-library/react"

type MockFile = { name: string; content: string }

export function mockFileDrop(dropzone: HTMLElement, files: MockFile[]) {
  const dataTransfer = new DataTransfer()

  files.forEach(f => {
    const blob = new Blob([f.content])
    dataTransfer.items.add(new File([blob], f.name))
  })

  fireEvent.drop(dropzone, { dataTransfer })
}